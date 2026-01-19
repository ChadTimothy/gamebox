import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { getWidgetMetadata } from "./config/csp.js";
import { WordChallengeGame } from "./games/wordChallenge.js";
import { getDailyWord } from "./data/wordLists.js";
import {
  loadStreakData,
  saveStreakData,
  updateDailyStreak,
  updatePracticeStreak,
  calculateWinRate,
} from "./data/streaks.js";

const PORT = Number(process.env.PORT ?? 8000);
const MCP_PATH = "/mcp";
const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_YEAR = 365;

/**
 * Game session metadata.
 */
interface GameSession {
  game: WordChallengeGame;
  mode: "daily" | "practice";
  userId: string;
}

/**
 * In-memory game state storage.
 * Maps session IDs to active WordChallenge game sessions.
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
 * Create an error response for MCP tool calls.
 */
function createErrorResponse(message: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: `❌ ${message}`,
      },
    ],
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
  if (status === "won") {
    return `🎉 Congratulations! You guessed the word in ${guessCount} ${
      guessCount === 1 ? "try" : "tries"
    }!`;
  }
  if (status === "lost") {
    return `😔 Game over! The word was ${word}. Better luck next time!`;
  }
  return `Guess ${guessCount}/${maxGuesses} recorded.`;
}

// Create GameBox MCP server
function createGameBoxServer() {
  const server = new McpServer({
    name: "gamebox",
    version: "0.1.0",
  });

  // Register Word Challenge widget resource
  server.registerResource(
    "word-challenge-widget",
    "ui://widget/word-challenge.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/word-challenge.html",
          mimeType: "text/html+skybridge",
          text: `<div id="root"></div>
<script type="module">
  import { WordChallenge } from '/widgets/WordChallenge.js';
  import { createRoot } from 'react-dom/client';
  import { createElement } from 'react';

  const root = createRoot(document.getElementById('root'));
  root.render(createElement(WordChallenge));
</script>`,
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

  /**
   * Start a new Word Challenge game.
   *
   * Tool: start_word_challenge
   */
  const startWordChallengeSchema = z.object({
    mode: z.enum(["daily", "practice"]).optional().default("daily"),
  });

  server.registerTool(
    "start_word_challenge",
    {
      title: "Start Word Challenge",
      description: "Start a new Word Challenge game (Wordle-style word guessing game)",
      inputSchema: startWordChallengeSchema as any,
      _meta: {
        "openai/outputTemplate": "ui://widget/word-challenge.html",
        "openai/toolInvocation/invoking": "Starting Word Challenge",
        "openai/toolInvocation/invoked": "Word Challenge ready! Make your first guess.",
      },
    },
    async (params: unknown) => {
      const { mode = "daily" } = startWordChallengeSchema.parse(params);
      const userId = DEFAULT_USER_ID; // In production, extract from auth

      // Load user's streak data
      const streakData = await loadStreakData(userId);
      const winRate = calculateWinRate(streakData);

      // Get the target word based on mode
      const targetWord = mode === "daily"
        ? getDailyWord(new Date())
        : getDailyWord(new Date(Date.now() + Math.random() * DAYS_PER_YEAR * MS_PER_DAY));

      // Create new game and session
      const game = new WordChallengeGame(targetWord);
      const sessionId = generateSessionId();
      activeGames.set(sessionId, {
        game,
        mode: mode as "daily" | "practice",
        userId,
      });

      const state = game.getState();

      return {
        content: [
          {
            type: "text" as const,
            text:
              mode === "daily"
                ? "🎯 Daily Word Challenge started! Guess the 5-letter word in 6 tries."
                : "🎮 Practice Word Challenge started! Guess the 5-letter word in 6 tries.",
          },
        ],
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
   * Make a guess in the active Word Challenge game.
   *
   * Tool: check_word_guess
   */
  const checkWordGuessSchema = z.object({
    gameId: z.string(),
    guess: z.string()
      .length(5)
      .regex(/^[A-Za-z]{5}$/)
      .transform(s => s.toUpperCase()),
  });

  server.registerTool(
    "check_word_guess",
    {
      title: "Make Word Guess",
      description: "Submit a guess for the active Word Challenge game",
      inputSchema: checkWordGuessSchema as any,
      _meta: {
        "openai/outputTemplate": "ui://widget/word-challenge.html",
      },
    },
    async (params: unknown) => {
      const { gameId, guess } = checkWordGuessSchema.parse(params);

      // Validate game session exists
      const session = activeGames.get(gameId);
      if (!session) {
        return createErrorResponse(
          "Game not found. Please start a new game with start_word_challenge."
        );
      }

      const { game, mode, userId } = session;

      try {
        // Make the guess
        const result = game.makeGuess(guess);
        const state = game.getState();

        // Build response message
        const message = buildGameStatusMessage(
          state.status,
          state.guesses.length,
          state.maxGuesses,
          state.word
        );

        // Update streak data if game is over
        let streakData = await loadStreakData(userId);
        if (game.isGameOver()) {
          const won = state.status === "won";
          streakData =
            mode === "daily"
              ? updateDailyStreak(streakData, won)
              : updatePracticeStreak(streakData, won);

          await saveStreakData(userId, streakData);
        }

        // Generate share text if game is over
        const shareText = game.isGameOver() ? game.getShareText() : undefined;
        const winRate = calculateWinRate(streakData);

        return {
          content: [
            {
              type: "text" as const,
              text: message,
            },
          ],
          structuredContent: {
            gameId,
            guess: guess.toUpperCase(),
            result,
            guesses: state.guesses,
            status: state.status,
            message,
            shareText,
            word: state.status === "lost" ? state.word : undefined,
            streak: streakData.currentStreak,
            maxStreak: streakData.maxStreak,
            totalGamesPlayed: streakData.totalGamesPlayed,
            winRate,
          },
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        return createErrorResponse(errorMessage);
      }
    }
  );

  // Register game menu tool
  server.registerTool(
    "show_game_menu",
    {
      title: "Show Game Menu",
      description: "Display the GameBox game selection menu",
      inputSchema: z.object({}) as any,
      _meta: {
        "openai/outputTemplate": "ui://widget/game-menu.html",
        "openai/toolInvocation/invoking": "Loading GameBox menu",
        "openai/toolInvocation/invoked": "GameBox menu ready",
      },
    },
    async () => ({
      content: [
        {
          type: "text" as const,
          text: "Welcome to GameBox! 🎮",
        },
      ],
      structuredContent: {
        games: [
          { id: "word-challenge", name: "Word Challenge" },
          { id: "20-questions", name: "20 Questions" },
          { id: "connections", name: "Connections" },
          { id: "spelling-bee", name: "Spelling Bee" },
          { id: "trivia", name: "Trivia Challenge" },
        ],
      },
    })
  );

  return server;
}

// Create HTTP server
const httpServer = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  // Handle CORS preflight
  if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
    });
    res.end();
    return;
  }

  // Health check endpoint
  if (req.method === "GET" && url.pathname === "/") {
    res
      .writeHead(200, { "content-type": "text/plain" })
      .end("GameBox MCP Server");
    return;
  }

  // Handle MCP requests
  if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

    const server = createGameBoxServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
      enableJsonResponse: true,
    });

    // Clean up on connection close
    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.writeHead(500).end("Internal server error");
      }
    }
    return;
  }

  res.writeHead(404).end("Not Found");
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`GameBox MCP server listening on http://localhost:${PORT}${MCP_PATH}`);
});
