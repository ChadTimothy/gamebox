import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { getWidgetMetadata } from "./config/csp.js";
import { WordMorphGame } from "./games/wordMorph.js";
import { LexiconSmithGame, type LetterSet } from "./games/lexiconSmith.js";
import { TwentyQuestionsGame, type GameMode, type Category } from "./games/twentyQuestions.js";
import {
  ConnectionsGame,
  getDailyPuzzle,
  getRandomPuzzle,
  type Puzzle,
  type WordGroup,
  type Difficulty,
} from "./games/connections.js";
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
 * Lexicon Smith game session metadata.
 */
interface LexiconSmithSession {
  game: LexiconSmithGame;
  mode: "daily" | "practice";
  userId: string;
}

/**
 * Twenty Questions game session metadata.
 */
interface TwentyQuestionsSession {
  game: TwentyQuestionsGame;
  mode: GameMode;
  category?: Category;
  userId: string;
}

/**
 * Connections game session metadata.
 */
interface ConnectionsSession {
  game: ConnectionsGame;
  mode: "daily" | "practice";
  userId: string;
}

/**
 * In-memory game state storage.
 * Maps session IDs to active Word Morph game sessions.
 */
const activeGames = new Map<string, GameSession>();

/**
 * In-memory Lexicon Smith game state storage.
 * Maps session IDs to active Lexicon Smith game sessions.
 */
const activeLexiconGames = new Map<string, LexiconSmithSession>();

/**
 * In-memory Twenty Questions game state storage.
 * Maps session IDs to active Twenty Questions game sessions.
 */
const activeTwentyQuestionsGames = new Map<string, TwentyQuestionsSession>();

/**
 * In-memory Connections game state storage.
 * Maps session IDs to active Connections game sessions.
 */
const activeConnectionsGames = new Map<string, ConnectionsSession>();

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
 * Generate a Lexicon Smith session ID.
 */
function generateLexiconSessionId(): string {
  return `ls_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a Twenty Questions session ID.
 */
function generateTwentyQuestionsSessionId(): string {
  return `tq_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a Connections session ID.
 */
function generateConnectionsSessionId(): string {
  return `cn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Predefined targets for Twenty Questions (user-guesses mode).
 * Organized by category for interesting gameplay.
 */
const TWENTY_QUESTIONS_TARGETS = {
  people: [
    "Albert Einstein",
    "Marie Curie",
    "Leonardo da Vinci",
    "Cleopatra",
    "Abraham Lincoln",
    "Martin Luther King Jr.",
    "Shakespeare",
    "Beethoven",
    "Mozart",
    "Queen Elizabeth II",
  ],
  places: [
    "Eiffel Tower",
    "Great Wall of China",
    "Taj Mahal",
    "Statue of Liberty",
    "Colosseum",
    "Mount Everest",
    "Grand Canyon",
    "Niagara Falls",
    "Sydney Opera House",
    "Pyramids of Giza",
  ],
  things: [
    "Bicycle",
    "Piano",
    "Telescope",
    "Compass",
    "Camera",
    "Book",
    "Clock",
    "Airplane",
    "Computer",
    "Umbrella",
  ],
  characters: [
    "Sherlock Holmes",
    "Harry Potter",
    "Superman",
    "Mickey Mouse",
    "Darth Vader",
    "Batman",
    "Spider-Man",
    "Luke Skywalker",
    "Hermione Granger",
    "Indiana Jones",
  ],
};

/**
 * Get a random target from a specific category for user-guesses mode.
 *
 * @param category - The category to select from
 * @returns A random target from the category
 */
function getRandomTarget(category: Category): string {
  if (category === "any") {
    // Select a random category first
    const categories: Category[] = ["people", "places", "things", "characters"];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    return getRandomTarget(randomCategory);
  }

  const targets = TWENTY_QUESTIONS_TARGETS[category];
  return targets[Math.floor(Math.random() * targets.length)];
}

/**
 * Generate a letter set for Lexicon Smith.
 * For daily mode, generates a deterministic set based on the date.
 * For practice mode, generates a random set.
 *
 * @param date - The date to generate letters for
 * @returns A LetterSet with 1 center letter and 6 outer letters
 */
function generateLetterSet(date: Date): LetterSet {
  // Common consonants and vowels that make good letter sets
  const consonants = "BCDFGHJKLMNPRSTVWXYZ".split("");
  const vowels = "AEIOU".split("");

  // Use date to seed the selection for consistent daily letters
  const daysSinceEpoch = Math.floor(date.getTime() / MS_PER_DAY);

  // Select letters deterministically based on date
  const selectedLetters = new Set<string>();
  let seed = daysSinceEpoch;

  // Pick 3-4 vowels and 3-4 consonants to make interesting words possible
  const numVowels = 2 + (seed % 2); // 2 or 3 vowels
  const numConsonants = 7 - numVowels; // Remaining are consonants

  // Select vowels
  for (let i = 0; i < numVowels && selectedLetters.size < 7; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const index = seed % vowels.length;
    selectedLetters.add(vowels[index]);
  }

  // Select consonants
  for (let i = 0; i < numConsonants && selectedLetters.size < 7; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const index = seed % consonants.length;
    const letter = consonants[index];
    if (!selectedLetters.has(letter)) {
      selectedLetters.add(letter);
    } else {
      i--; // Retry with next seed
    }
  }

  // Convert to array and select center letter
  const lettersArray = Array.from(selectedLetters);
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  const centerIndex = seed % lettersArray.length;

  const centerLetter = lettersArray[centerIndex];
  const outerLetters = lettersArray.filter((_, i) => i !== centerIndex);

  return {
    centerLetter,
    outerLetters,
  };
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

  // Lexicon Smith schemas
  const startLexiconSmithSchema = z.object({
    mode: z.enum(["daily", "practice"]).optional().default("daily"),
  });

  const submitLexiconWordSchema = z.object({
    gameId: z.string(),
    word: z
      .string()
      .min(4)
      .regex(/^[A-Za-z]+$/)
      .transform((s) => s.toUpperCase()),
  });

  const startLexiconSmithJsonSchema = {
    type: "object",
    properties: {
      mode: {
        type: "string",
        enum: ["daily", "practice"],
        default: "daily",
        description: "Game mode: 'daily' for the daily challenge letters, 'practice' for random letters"
      }
    }
  };

  const submitLexiconWordJsonSchema = {
    type: "object",
    properties: {
      gameId: {
        type: "string",
        description: "The game session ID returned from start_lexicon_smith"
      },
      word: {
        type: "string",
        minLength: 4,
        pattern: "^[A-Za-z]+$",
        description: "A word to submit (minimum 4 letters, case-insensitive)"
      }
    },
    required: ["gameId", "word"]
  };

  // Twenty Questions schemas
  const start20QuestionsSchema = z.object({
    mode: z.enum(["ai-guesses", "user-guesses"]),
    category: z.enum(["people", "places", "things", "characters", "any"]).optional().default("any"),
  });

  const answer20QuestionsSchema = z.object({
    gameId: z.string(),
    question: z.string().min(3),
    answer: z.enum(["yes", "no", "maybe", "unknown"]),
  });

  const guess20QuestionsSchema = z.object({
    gameId: z.string(),
    guess: z.string().min(1),
  });

  const start20QuestionsJsonSchema = {
    type: "object",
    properties: {
      mode: {
        type: "string",
        enum: ["ai-guesses", "user-guesses"],
        description: "'ai-guesses' = AI asks questions to guess what you're thinking, 'user-guesses' = you ask questions to guess what the AI is thinking"
      },
      category: {
        type: "string",
        enum: ["people", "places", "things", "characters", "any"],
        default: "any",
        description: "Optional category for the target (used in user-guesses mode)"
      }
    },
    required: ["mode"]
  };

  const answer20QuestionsJsonSchema = {
    type: "object",
    properties: {
      gameId: {
        type: "string",
        description: "The game session ID returned from start_20_questions"
      },
      question: {
        type: "string",
        minLength: 3,
        description: "The question you (AI) just asked the user"
      },
      answer: {
        type: "string",
        enum: ["yes", "no", "maybe", "unknown"],
        description: "The user's answer to your question"
      }
    },
    required: ["gameId", "question", "answer"]
  };

  const guess20QuestionsJsonSchema = {
    type: "object",
    properties: {
      gameId: {
        type: "string",
        description: "The game session ID returned from start_20_questions"
      },
      guess: {
        type: "string",
        minLength: 1,
        description: "Your final guess at what the target is"
      }
    },
    required: ["gameId", "guess"]
  };

  // Connections schemas
  const startConnectionsSchema = z.object({
    mode: z.enum(["daily", "practice"]),
  });

  const submitConnectionsGuessSchema = z.object({
    gameId: z.string(),
    words: z.array(z.string()).length(4),
  });

  const shuffleConnectionsSchema = z.object({
    gameId: z.string(),
  });

  /**
   * Start a new Word Morph game.
   */
  server.registerTool(
    "gamebox.start_word_morph",
    {
      title: "Start Word Morph Game",
      description:
        "Use this when the user explicitly asks to play Word Morph, use the Word Morph connector, or launch the Word Morph app. This is a unique word transformation puzzle where users guess 5-letter words and receive feedback (teal = correct position, coral = wrong position, slate = not in word). Do NOT use for general word games, Wordle, or other word-related tasks - only when the user specifically mentions Word Morph or asks to use this connector.",
      inputSchema: startWordMorphSchema,
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
      inputSchema: checkWordMorphGuessSchema,
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
      inputSchema: getWordMorphHintSchema,
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
   * Start a new Lexicon Smith game.
   */
  server.registerTool(
    "gamebox.start_lexicon_smith",
    {
      title: "Start Lexicon Smith Game",
      description:
        "Use this when the user explicitly asks to play Lexicon Smith, use the Lexicon Smith connector, or launch the Lexicon Smith app. This is a word-building puzzle where players create words from 7 letters (1 center, 6 outer). Every word must include the center letter. Find as many words as possible! Do NOT use for general word games - only when user specifically mentions Lexicon Smith.",
      inputSchema: startLexiconSmithSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/lexicon-smith.html",
        "openai/toolInvocation/invoking": "Starting Lexicon Smith",
        "openai/toolInvocation/invoked": "Lexicon Smith ready! Start building words.",
      },
    },
    async (params: unknown) => {
      const { mode } = startLexiconSmithSchema.parse(params);
      const userId = DEFAULT_USER_ID;

      const streakData = await loadStreakData(userId);
      const winRate = calculateWinRate(streakData);

      // Generate letter set based on mode
      const letterSet =
        mode === "daily"
          ? generateLetterSet(new Date())
          : generateLetterSet(new Date(Date.now() + Math.random() * DAYS_PER_YEAR * MS_PER_DAY));

      // Create new game (no word list = use dictionary validation)
      const game = new LexiconSmithGame(letterSet);
      const sessionId = generateLexiconSessionId();
      activeLexiconGames.set(sessionId, { game, mode, userId });

      const state = game.getState();
      const modeLabel = mode === "daily" ? "Daily" : "Practice";

      // Build welcome message
      const welcomeMessage = `
🔤 ${modeLabel} Lexicon Smith Started!

**Game Rules:**
- Create words using the 7 letters: ${state.letterSet.centerLetter} (center) + ${state.letterSet.outerLetters.join(" ")}
- Every word MUST include the center letter: **${state.letterSet.centerLetter}**
- Minimum word length: 4 letters
- Scoring: 4-letter=1pt, 5-letter=2pts, 6+ letter=3pts, Pangram (uses all 7)=7pts!

**Available Tools:**
- \`gamebox.submit_lexicon_word\` - Submit a word you've found

**Your Stats:**
- Current Streak: ${streakData.currentStreak}
- Max Streak: ${streakData.maxStreak}
- Total Games: ${streakData.totalGamesPlayed}
- Win Rate: ${(winRate * 100).toFixed(1)}%

Start building words! How many can you find?
`.trim();

      return {
        content: [textContent(welcomeMessage)],
        structuredContent: {
          gameId: sessionId,
          mode,
          letterSet: state.letterSet,
          foundWords: state.foundWords,
          score: state.score,
          totalPossibleWords: state.totalPossibleWords,
          status: state.status,
          streak: streakData.currentStreak,
          maxStreak: streakData.maxStreak,
          totalGamesPlayed: streakData.totalGamesPlayed,
          winRate,
        },
      };
    }
  );

  /**
   * Submit a word in the active Lexicon Smith game.
   */
  server.registerTool(
    "gamebox.submit_lexicon_word",
    {
      title: "Submit Lexicon Smith Word",
      description:
        "Use this to submit a word in an active Lexicon Smith game session. Only use after gamebox.start_lexicon_smith has been called. Validates the word and awards points if valid.",
      inputSchema: submitLexiconWordSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/lexicon-smith.html",
      },
    },
    async (params: unknown) => {
      const { gameId, word } = submitLexiconWordSchema.parse(params);

      const session = activeLexiconGames.get(gameId);
      if (!session) {
        return createErrorResponse("Game not found. Please start a new game with start_lexicon_smith.");
      }

      const { game, mode, userId } = session;

      try {
        const result = game.submitWord(word);
        const state = game.getState();

        // Build result message
        let message = "";
        if (result.validation === "valid") {
          message = result.isPangram
            ? `🎉 **PANGRAM!** "${result.word}" uses all 7 letters! +${result.points} points! 🌟`
            : `✅ **"${result.word}"** is valid! +${result.points} points`;
        } else {
          const errorMessages = {
            "too-short": "❌ Word is too short (minimum 4 letters)",
            "missing-center": `❌ Word must contain the center letter: **${state.letterSet.centerLetter}**`,
            duplicate: "⚠️ You've already found that word!",
            "not-in-dictionary": "❌ Word not in dictionary",
            "invalid-letters": "❌ Word contains letters not in the set",
            invalid: "❌ Invalid word",
          };
          message = errorMessages[result.validation] || "❌ Invalid word";
        }

        // Update streak data if game is complete
        let streakData = await loadStreakData(userId);
        if (game.isComplete()) {
          streakData = mode === "daily" ? updateDailyStreak(streakData, true) : updatePracticeStreak(streakData, true);
          await saveStreakData(userId, streakData);
          message += `\n\n🏆 **Game Complete!** You found all ${state.foundWords.length} words!`;
        }

        return {
          content: [textContent(message)],
          structuredContent: {
            gameId,
            word: result.word,
            validation: result.validation,
            points: result.points,
            isPangram: result.isPangram,
            foundWords: state.foundWords,
            score: state.score,
            totalPossibleWords: state.totalPossibleWords,
            status: state.status,
            message,
            shareText: game.isComplete() ? game.getShareText() : undefined,
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
   * Start a new Twenty Questions game.
   */
  server.registerTool(
    "gamebox.start_20_questions",
    {
      title: "Start Twenty Questions Game",
      description:
        "Use this when the user explicitly asks to play 20 Questions, Twenty Questions, or a guessing game. This is a classic yes/no question game with two modes: 'ai-guesses' (you think of something, AI asks questions) or 'user-guesses' (AI thinks of something, you ask questions). Do NOT use for other games - only when user specifically mentions 20 Questions or wants to play a guessing game.",
      inputSchema: start20QuestionsSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/twenty-questions.html",
        "openai/toolInvocation/invoking": "Starting Twenty Questions",
        "openai/toolInvocation/invoked": "Twenty Questions ready! Let's play.",
      },
    },
    async (params: unknown) => {
      const { mode, category } = start20QuestionsSchema.parse(params);
      const userId = DEFAULT_USER_ID;

      const streakData = await loadStreakData(userId);

      // Determine target based on mode
      let target: string;
      if (mode === "user-guesses") {
        // AI thinks of something - pick from predefined list
        target = getRandomTarget(category || "any");
      } else {
        // AI guesses - user thinks of something (hidden target)
        target = "USER_THINKING"; // Placeholder
      }

      // Create new game
      const game = new TwentyQuestionsGame(mode, target, category);
      const sessionId = generateTwentyQuestionsSessionId();
      activeTwentyQuestionsGames.set(sessionId, { game, mode, category, userId });

      const state = game.getState();
      const modeLabel = mode === "ai-guesses" ? "AI Guesses" : "User Guesses";

      // Build welcome message
      const welcomeMessage =
        mode === "ai-guesses"
          ? `
🎯 ${modeLabel} Mode - Twenty Questions Started!

**How to Play:**
- Think of something (person, place, thing, or character)
- I'll ask up to 20 yes/no questions to guess it
- Answer with yes, no, maybe, or unknown
- I'll make a guess when I'm confident!

**Your Stats:**
- Current Streak: ${streakData.currentStreak}
- Total Games: ${streakData.totalGamesPlayed}
- Win Rate: ${(calculateWinRate(streakData) * 100).toFixed(1)}%

Ready? Think of something interesting! I'll start asking questions.

Is it a real person (past or present)?
`.trim()
          : `
🎯 ${modeLabel} Mode - Twenty Questions Started!

**How to Play:**
- I'm thinking of: **${category === "any" ? "something" : `a ${category?.slice(0, -1)}`}**
- Ask me up to 20 yes/no questions
- I'll answer yes, no, or maybe
- Make a guess when you think you know!

**Your Stats:**
- Current Streak: ${streakData.currentStreak}
- Total Games: ${streakData.totalGamesPlayed}
- Win Rate: ${(calculateWinRate(streakData) * 100).toFixed(1)}%

**Available Tools:**
- \`gamebox.guess_20_questions\` - Make your final guess

Questions remaining: ${state.maxQuestions}

Go ahead, ask your first question!
`.trim();

      return {
        content: [textContent(welcomeMessage)],
        structuredContent: {
          gameId: sessionId,
          mode,
          category: category || "any",
          target: state.target, // Hidden in ai-guesses, visible in user-guesses
          questionAnswers: [],
          currentQuestionNumber: 1,
          questionsRemaining: state.maxQuestions,
          maxQuestions: state.maxQuestions,
          status: "playing",
          streak: streakData.currentStreak,
          totalGamesPlayed: streakData.totalGamesPlayed,
          winRate: calculateWinRate(streakData),
        },
      };
    }
  );

  /**
   * Submit an answer to the AI's question in Twenty Questions.
   */
  server.registerTool(
    "gamebox.answer_20_questions",
    {
      title: "Answer Twenty Questions",
      description:
        "Use this when the user provides a yes/no answer to your question in an active Twenty Questions game (ai-guesses mode). Include both the question you asked and the user's answer. Only use after gamebox.start_20_questions has been called in ai-guesses mode.",
      inputSchema: answer20QuestionsSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/twenty-questions.html",
      },
    },
    async (params: unknown) => {
      const { gameId, question, answer } = answer20QuestionsSchema.parse(params);

      const session = activeTwentyQuestionsGames.get(gameId);
      if (!session) {
        return createErrorResponse("Game session not found. Please start a new game with start_20_questions.");
      }

      const { game, mode } = session;

      if (mode !== "ai-guesses") {
        return createErrorResponse("This tool is only for ai-guesses mode. Use guess_20_questions to make a guess.");
      }

      try {
        // Record the AI's question first
        game.askQuestion(question, "ai");

        // Then record the user's answer
        game.submitAnswer(answer);

        const state = game.getState();
        const questionsRemaining = game.getQuestionsRemaining();

        // Build response with next question or game over
        let message = `✅ Answer recorded: **${answer}**\n\nQuestions used: ${state.currentQuestionNumber - 1} of ${state.maxQuestions}`;

        if (state.status === "lost") {
          message += "\n\n❌ I've used all 20 questions and haven't guessed it yet. You win! What were you thinking of?";
        } else if (questionsRemaining > 0) {
          message += "\n\nLet me think of my next question...";
        }

        return {
          content: [textContent(message)],
          structuredContent: {
            gameId,
            answer,
            currentQuestionNumber: state.currentQuestionNumber,
            questionsRemaining,
            maxQuestions: state.maxQuestions,
            status: state.status,
            questionAnswers: state.questionAnswers,
          },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        return createErrorResponse(errorMessage);
      }
    }
  );

  /**
   * Make a final guess in Twenty Questions.
   */
  server.registerTool(
    "gamebox.guess_20_questions",
    {
      title: "Guess Twenty Questions",
      description:
        "Use this when making a final guess in an active Twenty Questions game. Works in both ai-guesses and user-guesses modes. For ai-guesses mode, this is how the AI makes its final guess. For user-guesses mode, this is how the user makes their guess.",
      inputSchema: guess20QuestionsSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/twenty-questions.html",
      },
    },
    async (params: unknown) => {
      const { gameId, guess } = guess20QuestionsSchema.parse(params);

      const session = activeTwentyQuestionsGames.get(gameId);
      if (!session) {
        return createErrorResponse("Game not found. Please start a new game with start_20_questions.");
      }

      const { game, userId } = session;

      try {
        const result = game.makeGuess(guess);
        const state = game.getState();

        // Update streak data
        let streakData = await loadStreakData(userId);
        if (result.correct) {
          streakData = updatePracticeStreak(streakData, true);
        } else {
          streakData = updatePracticeStreak(streakData, false);
        }
        await saveStreakData(userId, streakData);

        // Build result message
        let message = "";
        if (result.correct) {
          message = result.wasAI
            ? `🎉 **Correct!** I guessed it: **${result.target}**!\n\nI figured it out in ${state.currentQuestionNumber - 1} questions. Great game!`
            : `🎉 **Correct!** You guessed it: **${result.target}**!\n\nYou figured it out in ${state.questionAnswers.length} questions. Well done!`;
        } else {
          message = result.wasAI
            ? `❌ Hmm, my guess of **"${guess}"** was wrong. The answer was **${result.target}**. You win!`
            : `❌ Not quite! You guessed **"${guess}"** but it was **${result.target}**. Better luck next time!`;
        }

        message += `\n\n**Updated Stats:**\n- Current Streak: ${streakData.currentStreak}\n- Total Games: ${streakData.totalGamesPlayed}\n- Win Rate: ${(calculateWinRate(streakData) * 100).toFixed(1)}%`;

        return {
          content: [textContent(message)],
          structuredContent: {
            gameId,
            guess,
            correct: result.correct,
            target: result.target,
            status: result.status,
            questionCount: state.questionAnswers.length,
            questionAnswers: state.questionAnswers,
            shareText: game.getShareText(),
            streak: streakData.currentStreak,
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
   * Start a new Connections game.
   */
  server.registerTool(
    "gamebox.start_connections",
    {
      title: "Start Connections Game",
      description:
        "Use this when the user explicitly asks to play Connections, use the Connections connector, or launch the Connections app. This is a word grouping puzzle where users find 4 groups of 4 related words from a 4x4 grid. Do NOT use for other games - only when user specifically mentions Connections or wants to play a category matching game.",
      inputSchema: startConnectionsSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/connections.html",
        "openai/toolInvocation/invoking": "Starting Connections",
        "openai/toolInvocation/invoked": "Connections ready! Find the groups.",
      },
    },
    async (params: unknown) => {
      const { mode } = startConnectionsSchema.parse(params);
      const userId = DEFAULT_USER_ID;

      const streakData = await loadStreakData(userId);

      // Get puzzle based on mode
      const puzzle = mode === "daily" ? getDailyPuzzle(new Date()) : getRandomPuzzle();

      // Create new game
      const game = new ConnectionsGame(puzzle);
      const sessionId = generateConnectionsSessionId();
      activeConnectionsGames.set(sessionId, { game, mode, userId });

      const state = game.getState();
      const modeLabel = mode === "daily" ? "Daily" : "Practice";

      const welcomeMessage = `
🎯 ${modeLabel} Connections Started!

**How to Play:**
- Find 4 groups of 4 related words
- Select 4 words and submit your guess
- Categories are color-coded by difficulty:
  🟨 Yellow = Easiest
  🟩 Green = Easy
  🟦 Blue = Medium
  🟪 Purple = Hardest
- You have 4 mistakes before game over

**Available Tools:**
- \`gamebox.submit_connections_guess\` - Submit 4 words as a group
- \`gamebox.shuffle_connections\` - Shuffle the grid

**Your Stats:**
- Current Streak: ${streakData.currentStreak}
- Total Games: ${streakData.totalGamesPlayed}

Mistakes remaining: ${game.getMistakesRemaining()}

Find the connections!
`.trim();

      return {
        content: [textContent(welcomeMessage)],
        structuredContent: {
          gameId: sessionId,
          mode,
          puzzleId: puzzle.id,
          remainingWords: state.remainingWords,
          solvedGroups: state.solvedGroups,
          mistakeCount: state.mistakeCount,
          mistakesRemaining: game.getMistakesRemaining(),
          maxMistakes: state.maxMistakes,
          status: state.status,
          streak: streakData.currentStreak,
          totalGamesPlayed: streakData.totalGamesPlayed,
          winRate: calculateWinRate(streakData),
        },
      };
    }
  );

  /**
   * Submit a group guess in Connections.
   */
  server.registerTool(
    "gamebox.submit_connections_guess",
    {
      title: "Submit Connections Guess",
      description:
        "Use this to submit a guess of 4 words that you think form a group in an active Connections game. Only use after gamebox.start_connections has been called.",
      inputSchema: submitConnectionsGuessSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/connections.html",
      },
    },
    async (params: unknown) => {
      const { gameId, words } = submitConnectionsGuessSchema.parse(params);

      const session = activeConnectionsGames.get(gameId);
      if (!session) {
        return createErrorResponse(`Game not found: ${gameId}`);
      }

      const { game, mode, userId } = session;

      try {
        const result = game.submitGuess(words);
        const state = game.getState();
        let streakData = await loadStreakData(userId);

        const difficultyEmoji: Record<Difficulty, string> = {
          yellow: "🟨",
          green: "🟩",
          blue: "🟦",
          purple: "🟪",
        };

        let message: string;
        if (result.correct) {
          message = `✅ Correct! ${difficultyEmoji[result.difficulty!]} **${result.category}**`;

          if (state.status === "won") {
            streakData = mode === "daily"
              ? updateDailyStreak(streakData, true)
              : updatePracticeStreak(streakData, true);
            await saveStreakData(userId, streakData);
            message += `\n\n🎉 **Congratulations!** You found all 4 groups!`;
            message += `\n\n**Updated Stats:**\n- Current Streak: ${streakData.currentStreak}\n- Total Games: ${streakData.totalGamesPlayed}`;
          }
        } else {
          message = result.wordsAway === 1
            ? `❌ So close! You're **one word away** from a group.`
            : `❌ Not a group. Mistakes: ${state.mistakeCount}/${state.maxMistakes}`;

          if (state.status === "lost") {
            streakData = mode === "daily"
              ? updateDailyStreak(streakData, false)
              : updatePracticeStreak(streakData, false);
            await saveStreakData(userId, streakData);
            const unsolved = game.getUnsolvedGroups();
            message += `\n\n💔 **Game Over!** The remaining groups were:`;
            for (const group of unsolved) {
              message += `\n- ${group.category}: ${group.words.join(", ")}`;
            }
            message += `\n\n**Updated Stats:**\n- Current Streak: ${streakData.currentStreak}\n- Total Games: ${streakData.totalGamesPlayed}`;
          }
        }

        return {
          content: [textContent(message)],
          structuredContent: {
            gameId,
            correct: result.correct,
            category: result.category,
            difficulty: result.difficulty,
            wordsAway: result.wordsAway,
            remainingWords: state.remainingWords,
            solvedGroups: state.solvedGroups,
            mistakeCount: state.mistakeCount,
            mistakesRemaining: game.getMistakesRemaining(),
            maxMistakes: state.maxMistakes,
            status: state.status,
            shareText: state.status !== "playing" ? game.generateShareText() : undefined,
          },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        return createErrorResponse(errorMessage);
      }
    }
  );

  /**
   * Shuffle the Connections grid.
   */
  server.registerTool(
    "gamebox.shuffle_connections",
    {
      title: "Shuffle Connections Grid",
      description:
        "Use this to shuffle the word grid in an active Connections game. Only use after gamebox.start_connections has been called.",
      inputSchema: shuffleConnectionsSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/connections.html",
      },
    },
    async (params: unknown) => {
      const { gameId } = shuffleConnectionsSchema.parse(params);

      const session = activeConnectionsGames.get(gameId);
      if (!session) {
        return createErrorResponse(`Game not found: ${gameId}`);
      }

      const { game } = session;

      try {
        game.shuffle();
        const state = game.getState();

        return {
          content: [textContent("🔀 Grid shuffled!")],
          structuredContent: {
            gameId,
            remainingWords: state.remainingWords,
            solvedGroups: state.solvedGroups,
            mistakeCount: state.mistakeCount,
            mistakesRemaining: game.getMistakesRemaining(),
            status: state.status,
          },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        return createErrorResponse(errorMessage);
      }
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
          { id: "connections", name: "Connections" },
          { id: "twenty-questions", name: "Twenty Questions" },
          { id: "lexicon-smith", name: "Lexicon Smith" },
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
async function handleMcpRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
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
