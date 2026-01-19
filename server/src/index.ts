import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { getWidgetMetadata } from "./config/csp.js";
import { WordMorphGame } from "./games/wordMorph.js";
import { getDailyWord } from "./data/wordLists.js";
import {
  loadStreakData,
  saveStreakData,
  updateDailyStreak,
  updatePracticeStreak,
  calculateWinRate,
} from "./data/streaks.js";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WIDGET_DIST_PATH = join(__dirname, "../../web/dist");

// Server configuration
const PORT = Number(process.env.PORT ?? 8000);
const MCP_PATH = "/mcp";
const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);

// Time constants
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_YEAR = 365;

// Widget URLs - use same server for both MCP and widget assets
const WIDGET_BASE_URL = process.env.WIDGET_BASE_URL ?? "https://word-morph.fly.dev";
const WIDGET_VERSION = Date.now(); // Cache buster

// MIME types for static file serving
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

/**
 * Game session metadata.
 */
interface GameSession {
  game: WordMorphGame;
  mode: "daily" | "practice";
  userId: string;
}

/**
 * In-memory game state storage.
 * Maps session IDs to active Word Morph game sessions.
 */
const activeGames = new Map<string, GameSession>();

/**
 * Default user ID for testing/demo purposes.
 * In production, this would come from authentication.
 */
const DEFAULT_USER_ID = "demo-user";

/**
 * Generate a simple session ID.
 */
function generateSessionId(): string {
  return `wc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * MCP text content helper.
 */
function textContent(text: string): { type: "text"; text: string } {
  return { type: "text" as const, text };
}

/**
 * Create an error response for MCP tool calls.
 */
function createErrorResponse(message: string): {
  content: { type: "text"; text: string }[];
  isError: true;
} {
  return {
    content: [textContent(`Error: ${message}`)],
    isError: true,
  };
}

/**
 * Build a message based on game status.
 */
function buildGameStatusMessage(
  status: "playing" | "won" | "lost",
  guessCount: number,
  maxGuesses: number,
  word?: string
): string {
  switch (status) {
    case "won":
      return `Congratulations! You guessed the word in ${guessCount} ${guessCount === 1 ? "try" : "tries"}!`;
    case "lost":
      return `Game over! The word was ${word}. Better luck next time!`;
    default:
      return `Guess ${guessCount}/${maxGuesses} recorded.`;
  }
}

/**
 * Generate a cryptic clue for a word.
 * Returns clues about the word's characteristics, common usage, or letter patterns.
 */
function generateWordClue(word: string): string {
  const clues: string[] = [];

  // Add letter-based clues
  const firstLetter = word[0];
  const lastLetter = word[word.length - 1];
  const vowels = word.match(/[AEIOU]/gi);
  const consonants = word.match(/[BCDFGHJKLMNPQRSTVWXYZ]/gi);

  clues.push(`It begins with the letter "${firstLetter}" and ends with "${lastLetter}".`);
  clues.push(`This word contains ${vowels?.length ?? 0} vowel(s) and ${consonants?.length ?? 0} consonant(s).`);

  // Check for repeated letters
  const letterCounts = new Map<string, number>();
  for (const letter of word) {
    letterCounts.set(letter, (letterCounts.get(letter) ?? 0) + 1);
  }
  const repeatedLetters = Array.from(letterCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([letter]) => letter);

  if (repeatedLetters.length > 0) {
    clues.push(`The letter(s) ${repeatedLetters.map(l => `"${l}"`).join(", ")} appear(s) more than once.`);
  } else {
    clues.push("All letters in this word are unique.");
  }

  // Add a general clue
  clues.push("Think about common 5-letter English words.");

  return clues.join(" ");
}

/**
 * Generate the Word Morph widget HTML.
 */
function getWordMorphWidgetHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Word Morph</title>
  <script type="module" crossorigin src="${WIDGET_BASE_URL}/assets/index.js?v=${WIDGET_VERSION}"></script>
  <link rel="stylesheet" crossorigin href="${WIDGET_BASE_URL}/assets/index.css?v=${WIDGET_VERSION}">
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
}

// Create GameBox MCP server
function createGameBoxServer(): McpServer {
  const server = new McpServer({
    name: "gamebox",
    version: "0.1.0",
  });

  // Register Word Morph widget resource
  server.registerResource(
    "word-morph-widget",
    "ui://widget/word-morph.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/word-morph.html",
          mimeType: "text/html+skybridge",
          text: getWordMorphWidgetHtml(),
          _meta: getWidgetMetadata(),
        },
      ],
    })
  );

  // Register game menu resource
  server.registerResource(
    "game-menu",
    "ui://widget/game-menu.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/game-menu.html",
          mimeType: "text/html+skybridge",
          text: `<div id="root">
            <h1>GameBox</h1>
            <p>The Ultimate ChatGPT Game Collection</p>
          </div>`,
          _meta: getWidgetMetadata(),
        },
      ],
    })
  );

  // Tool schemas
  // Zod schemas for runtime validation
  const startWordMorphSchema = z.object({
    mode: z.enum(["daily", "practice"]).optional().default("daily"),
  });

  const checkWordMorphGuessSchema = z.object({
    gameId: z.string(),
    guess: z
      .string()
      .length(5)
      .regex(/^[A-Za-z]{5}$/)
      .transform((s) => s.toUpperCase()),
  });

  const getWordMorphHintSchema = z.object({
    gameId: z.string(),
  });

  // JSON Schema definitions for ChatGPT App Store compliance
  const startWordMorphJsonSchema = {
    type: "object",
    properties: {
      mode: {
        type: "string",
        enum: ["daily", "practice"],
        default: "daily",
        description: "Game mode: 'daily' for the daily challenge word, 'practice' for a random word"
      }
    }
  };

  const checkWordMorphGuessJsonSchema = {
    type: "object",
    properties: {
      gameId: {
        type: "string",
        description: "The game session ID returned from start_word_morph"
      },
      guess: {
        type: "string",
        minLength: 5,
        maxLength: 5,
        pattern: "^[A-Za-z]{5}$",
        description: "A 5-letter word guess (case-insensitive, will be converted to uppercase)"
      }
    },
    required: ["gameId", "guess"]
  };

  const getWordMorphHintJsonSchema = {
    type: "object",
    properties: {
      gameId: {
        type: "string",
        description: "The game session ID returned from start_word_morph"
      }
    },
    required: ["gameId"]
  };

  /**
   * Start a new Word Morph game.
   */
  server.registerTool(
    "gamebox.start_word_morph",
    {
      title: "Start Word Morph Game",
      description:
        "Use this when the user explicitly asks to play Word Morph, use the Word Morph connector, or launch the Word Morph app. This is a unique word transformation puzzle where users guess 5-letter words and receive feedback (teal = correct position, coral = wrong position, slate = not in word). Do NOT use for general word games, Wordle, or other word-related tasks - only when the user specifically mentions Word Morph or asks to use this connector.",
      inputSchema: startWordMorphJsonSchema as any,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/word-morph.html",
        "openai/toolInvocation/invoking": "Starting Word Morph",
        "openai/toolInvocation/invoked": "Word Morph ready! Make your first guess.",
      },
    },
    async (params: unknown) => {
      const { mode } = startWordMorphSchema.parse(params);
      const userId = DEFAULT_USER_ID;

      const streakData = await loadStreakData(userId);
      const winRate = calculateWinRate(streakData);

      // Get the target word based on mode
      const targetWord =
        mode === "daily"
          ? getDailyWord(new Date())
          : getDailyWord(new Date(Date.now() + Math.random() * DAYS_PER_YEAR * MS_PER_DAY));

      // Create new game and session
      const game = new WordMorphGame(targetWord);
      const sessionId = generateSessionId();
      activeGames.set(sessionId, { game, mode, userId });

      const state = game.getState();
      const modeLabel = mode === "daily" ? "Daily" : "Practice";

      // Build welcome message with rules and available tools
      const welcomeMessage = `
🎯 ${modeLabel} Word Morph Started!

**Game Rules:**
- Guess the 5-letter word in 6 tries
- Each guess must be a valid 5-letter word
- After each guess, tiles show feedback:
  🟦 Teal = letter is correct and in the right position
  🟧 Coral = letter is in the word but wrong position
  ⬜ Slate = letter is not in the word

**Available Tools:**
- \`gamebox.check_word_morph_guess\` - Submit a 5-letter word guess
- \`gamebox.get_word_morph_hint\` - Get a cryptic clue about the word (turn it into a challenging riddle for the user!)

**Your Stats:**
- Current Streak: ${streakData.currentStreak}
- Max Streak: ${streakData.maxStreak}
- Total Games: ${streakData.totalGamesPlayed}
- Win Rate: ${(winRate * 100).toFixed(1)}%

Make your first guess, or ask for a hint!
`.trim();

      return {
        content: [textContent(welcomeMessage)],
        structuredContent: {
          gameId: sessionId,
          mode,
          guesses: state.guesses,
          status: state.status,
          maxGuesses: state.maxGuesses,
          streak: streakData.currentStreak,
          maxStreak: streakData.maxStreak,
          totalGamesPlayed: streakData.totalGamesPlayed,
          winRate,
        },
      };
    }
  );

  /**
   * Make a guess in the active Word Morph game.
   */
  server.registerTool(
    "gamebox.check_word_morph_guess",
    {
      title: "Submit Word Morph Guess",
      description:
        "Use this to submit a 5-letter word guess in an active Word Morph game session. Only use after gamebox.start_word_morph has been called. Updates the game state with feedback on correct, present, or absent letters.",
      inputSchema: checkWordMorphGuessJsonSchema as any,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/word-morph.html",
      },
    },
    async (params: unknown) => {
      const { gameId, guess } = checkWordMorphGuessSchema.parse(params);

      const session = activeGames.get(gameId);
      if (!session) {
        return createErrorResponse("Game not found. Please start a new game with start_word_morph.");
      }

      const { game, mode, userId } = session;

      try {
        const result = game.makeGuess(guess);
        const state = game.getState();
        const message = buildGameStatusMessage(state.status, state.guesses.length, state.maxGuesses, state.word);

        // Update streak data if game is over
        let streakData = await loadStreakData(userId);
        if (game.isGameOver()) {
          const won = state.status === "won";
          streakData = mode === "daily" ? updateDailyStreak(streakData, won) : updatePracticeStreak(streakData, won);
          await saveStreakData(userId, streakData);
        }

        return {
          content: [textContent(message)],
          structuredContent: {
            gameId,
            guess,
            result,
            guesses: state.guesses,
            status: state.status,
            message,
            shareText: game.isGameOver() ? game.getShareText() : undefined,
            word: state.status === "lost" ? state.word : undefined,
            streak: streakData.currentStreak,
            maxStreak: streakData.maxStreak,
            totalGamesPlayed: streakData.totalGamesPlayed,
            winRate: calculateWinRate(streakData),
          },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        return createErrorResponse(errorMessage);
      }
    }
  );

  /**
   * Get a hint about the target word.
   */
  server.registerTool(
    "gamebox.get_word_morph_hint",
    {
      title: "Get Word Morph Hint",
      description:
        "Use this when the user asks for a hint, clue, or help in an active Word Morph game. Returns cryptic clues about the target word's letters and structure. IMPORTANT: Transform these clues into a challenging, creative riddle for the user - don't just repeat the raw clues!",
      inputSchema: getWordMorphHintJsonSchema as any,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/word-morph.html",
      },
    },
    async (params: unknown) => {
      const { gameId } = getWordMorphHintSchema.parse(params);

      // Validate game session exists
      const session = activeGames.get(gameId);
      if (!session) {
        return createErrorResponse("Game not found. Please start a new game first.");
      }

      const { game } = session;
      const state = game.getState();

      // Don't give hints if game is over
      if (game.isGameOver()) {
        return createErrorResponse("The game is already over! Start a new game to play again.");
      }

      // Generate clue about the target word
      const clue = generateWordClue(state.word);

      const hintMessage = `
🔮 **Cryptic Clue:**

${clue}

**Instructions for AI Assistant:**
Transform the above clues into a challenging, creative riddle that makes the user think! Don't reveal the word directly, but craft an engaging puzzle that incorporates these hints in an interesting way. Make it fun and mysterious!

**Current Progress:**
- Guesses used: ${state.guesses.length}/${state.maxGuesses}
- Guesses remaining: ${state.maxGuesses - state.guesses.length}
`.trim();

      return {
        content: [textContent(hintMessage)],
        structuredContent: {
          gameId,
          clue,
          guessesUsed: state.guesses.length,
          guessesRemaining: state.maxGuesses - state.guesses.length,
        },
      };
    }
  );

  /**
   * Show the GameBox menu.
   */
  server.registerTool(
    "gamebox.show_menu",
    {
      title: "Show GameBox Menu",
      description:
        "Use this when the user explicitly asks to see the GameBox menu, browse GameBox games, or asks what games are available in GameBox. Displays the game selection menu. Do NOT use for general game queries - only when user mentions GameBox specifically.",
      inputSchema: { type: "object", properties: {} } as any,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/game-menu.html",
        "openai/toolInvocation/invoking": "Loading GameBox menu",
        "openai/toolInvocation/invoked": "GameBox menu ready",
      },
    },
    async () => ({
      content: [textContent("Welcome to GameBox!")],
      structuredContent: {
        games: [
          { id: "word-morph", name: "Word Morph" },
          { id: "twenty-queries", name: "Twenty Queries" },
          { id: "kinship", name: "Kinship" },
          { id: "lexicon-smith", name: "Lexicon Smith" },
          { id: "lore-master", name: "Lore Master" },
        ],
      },
    })
  );

  return server;
}

// CORS headers for MCP endpoints
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
  "Access-Control-Allow-Headers": "content-type, mcp-session-id",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
} as const;

/**
 * Log an incoming HTTP request.
 */
function logRequest(req: IncomingMessage, pathname: string): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);
}

/**
 * Handle CORS preflight requests.
 */
function handleCorsPreflightRequest(res: ServerResponse): void {
  res.writeHead(204, CORS_HEADERS);
  res.end();
}

/**
 * Handle health check requests.
 */
function handleHealthCheckRequest(res: ServerResponse): void {
  res.writeHead(200, { "content-type": "text/plain" }).end("GameBox MCP Server");
}

/**
 * Handle OpenAI Apps Challenge endpoint.
 * Required for ChatGPT App Store verification.
 */
function handleOpenAIAppsChallenge(res: ServerResponse): void {
  res.writeHead(200, {
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify({
    status: "verified",
    name: "GameBox",
    version: "0.1.0"
  }));
}

/**
 * Handle privacy policy endpoint.
 * Required for ChatGPT App Store compliance.
 */
function handlePrivacyPolicy(res: ServerResponse): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - GameBox</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 30px; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p><strong>Last Updated:</strong> ${new Date().toISOString().split('T')[0]}</p>

  <h2>Overview</h2>
  <p>GameBox is a collection of word and puzzle games for ChatGPT. We are committed to protecting your privacy.</p>

  <h2>Data Collection</h2>
  <p>GameBox collects minimal data necessary for game functionality:</p>
  <ul>
    <li>Game session data (in-memory only, not persisted)</li>
    <li>Game statistics (win streaks, scores)</li>
    <li>No personal information is collected</li>
  </ul>

  <h2>Data Storage</h2>
  <p>All game data is stored temporarily in memory during your session. No data is permanently stored or shared with third parties.</p>

  <h2>Contact</h2>
  <p>For questions about this privacy policy, please contact us through the GitHub repository.</p>
</body>
</html>`;

  res.writeHead(200, {
    "content-type": "text/html",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(html);
}

/**
 * Handle terms of service endpoint.
 * Required for ChatGPT App Store compliance.
 */
function handleTermsOfService(res: ServerResponse): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - GameBox</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 30px; }
  </style>
</head>
<body>
  <h1>Terms of Service</h1>
  <p><strong>Last Updated:</strong> ${new Date().toISOString().split('T')[0]}</p>

  <h2>Acceptance of Terms</h2>
  <p>By accessing and using GameBox, you accept and agree to be bound by these Terms of Service.</p>

  <h2>Description of Service</h2>
  <p>GameBox provides word and puzzle games accessible through ChatGPT. The service is provided "as is" without warranties.</p>

  <h2>Game Content</h2>
  <p>All games are original implementations. Word lists are derived from public domain sources.</p>

  <h2>User Conduct</h2>
  <p>Users agree to:</p>
  <ul>
    <li>Use the service for its intended gaming purpose</li>
    <li>Not attempt to exploit or disrupt the service</li>
    <li>Not violate any applicable laws</li>
  </ul>

  <h2>Limitation of Liability</h2>
  <p>GameBox is provided for entertainment purposes. We are not liable for any damages arising from use of the service.</p>

  <h2>Changes to Terms</h2>
  <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of modified terms.</p>

  <h2>Contact</h2>
  <p>For questions about these terms, please contact us through the GitHub repository.</p>
</body>
</html>`;

  res.writeHead(200, {
    "content-type": "text/html",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(html);
}

/**
 * Handle MCP protocol requests.
 */
async function handleMcpRequest(_req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

  const server = createGameBoxServer();
  const transport = new SSEServerTransport("/mcp/sse", res);

  res.on("close", () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.writeHead(500).end("Internal server error");
    }
  }
}

/**
 * Handle static file requests for widget assets.
 */
async function handleStaticFileRequest(urlPath: string, res: ServerResponse): Promise<void> {
  try {
    // Strip query parameters and get file path
    const cleanPath = urlPath.split("?")[0];
    const filePath = join(WIDGET_DIST_PATH, cleanPath);
    const ext = extname(filePath);
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    // Read and serve file
    const data = await readFile(filePath);

    res.writeHead(200, {
      "Content-Type": mimeType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });
    res.end(data);
  } catch (error) {
    console.error(`Error serving static file ${urlPath}:`, error);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
}

/**
 * Main HTTP request handler.
 */
async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
  logRequest(req, url.pathname);

  // CORS preflight
  if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
    handleCorsPreflightRequest(res);
    return;
  }

  // Health check
  if (req.method === "GET" && url.pathname === "/") {
    handleHealthCheckRequest(res);
    return;
  }

  // OpenAI Apps Challenge endpoint
  if (req.method === "GET" && url.pathname === "/.well-known/openai-apps-challenge") {
    handleOpenAIAppsChallenge(res);
    return;
  }

  // Privacy policy endpoint
  if (req.method === "GET" && url.pathname === "/privacy") {
    handlePrivacyPolicy(res);
    return;
  }

  // Terms of service endpoint
  if (req.method === "GET" && url.pathname === "/terms") {
    handleTermsOfService(res);
    return;
  }

  // MCP requests
  if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
    await handleMcpRequest(req, res);
    return;
  }

  // Static file requests for widget assets
  if ((req.method === "GET" || req.method === "HEAD") && url.pathname.startsWith("/assets/")) {
    await handleStaticFileRequest(url.pathname, res);
    return;
  }

  res.writeHead(404).end("Not Found");
}

// Create and start HTTP server
const httpServer = createServer(handleRequest);

httpServer.listen(PORT, () => {
  console.log(`GameBox MCP server listening on http://localhost:${PORT}${MCP_PATH}`);
});
