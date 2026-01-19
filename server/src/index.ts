import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getWidgetMetadata } from "./config/csp.js";
import { WordChallengeGame } from "./games/wordChallenge.js";
import { getDailyWord } from "./data/wordLists.js";

const PORT = Number(process.env.PORT ?? 8000);
const MCP_PATH = "/mcp";
const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_YEAR = 365;

/**
 * In-memory game state storage.
 * Maps session IDs to active WordChallenge game instances.
 */
const activeGames = new Map<string, WordChallengeGame>();

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
  server.registerTool(
    "start_word_challenge",
    {
      title: "Start Word Challenge",
      description: "Start a new Word Challenge game (Wordle-style word guessing game)",
      inputSchema: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["daily", "practice"],
            description: "Game mode: 'daily' for daily puzzle, 'practice' for random word",
          },
        },
      } as any,
      _meta: {
        "openai/outputTemplate": "ui://widget/word-challenge.html",
        "openai/toolInvocation/invoking": "Starting Word Challenge",
        "openai/toolInvocation/invoked": "Word Challenge ready! Make your first guess.",
      },
    },
    async (params: unknown) => {
      const mode = (params as { mode?: string }).mode || "daily";

      // Get the target word based on mode
      const targetWord = mode === "daily"
        ? getDailyWord(new Date())
        : getDailyWord(new Date(Date.now() + Math.random() * DAYS_PER_YEAR * MS_PER_DAY));

      // Create new game
      const game = new WordChallengeGame(targetWord);
      const sessionId = generateSessionId();
      activeGames.set(sessionId, game);

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
          streak: 0, // TODO: Implement streak tracking in Task #9
        },
      };
    }
  );

  /**
   * Make a guess in the active Word Challenge game.
   *
   * Tool: check_word_guess
   */
  server.registerTool(
    "check_word_guess",
    {
      title: "Make Word Guess",
      description: "Submit a guess for the active Word Challenge game",
      inputSchema: {
        type: "object",
        properties: {
          gameId: {
            type: "string",
            description: "Game session ID from start_word_challenge",
          },
          guess: {
            type: "string",
            description: "5-letter word guess",
            pattern: "^[A-Za-z]{5}$",
          },
        },
        required: ["gameId", "guess"],
      } as any,
      _meta: {
        "openai/outputTemplate": "ui://widget/word-challenge.html",
      },
    },
    async (params: unknown) => {
      const { gameId, guess } = params as { gameId: string; guess: string };

      // Validate game exists
      const game = activeGames.get(gameId);
      if (!game) {
        return createErrorResponse(
          "Game not found. Please start a new game with start_word_challenge."
        );
      }

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

        // Generate share text if game is over
        const shareText = game.isGameOver() ? game.getShareText() : undefined;

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
      inputSchema: {},
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
