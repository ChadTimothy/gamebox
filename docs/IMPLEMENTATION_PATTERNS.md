# Implementation Patterns for GameBox Games

This document synthesizes the architectural patterns discovered from the Word Morph implementation. Use these patterns as a blueprint when implementing new games (Kinship, Lexicon Smith, Twenty Queries, Lore Master).

## Table of Contents

1. [Backend Architecture](#backend-architecture)
2. [Frontend React Architecture](#frontend-react-architecture)
3. [Testing Architecture](#testing-architecture)
4. [Build & Configuration](#build--configuration)
5. [Implementation Checklist](#implementation-checklist)

---

## Backend Architecture

### 1. Game Logic Class Pattern

**File Location**: `/server/src/games/{gameName}.ts`

Every game follows this structure:

```typescript
// 1. Type Definitions
export type GameStatus = "playing" | "won" | "lost";
export type FeedbackType = "correct" | "present" | "absent";

export interface LetterResult {
  letter: string;
  feedback: FeedbackType;
}

export interface GameState {
  readonly word: string;
  readonly guesses: readonly string[];
  readonly status: GameStatus;
  readonly maxGuesses: number;
}

// 2. Pure Functions (No Side Effects)
export function checkGuess(guess: string, target: string): LetterResult[] {
  // Two-pass algorithm for accurate feedback
  // Handles duplicate letters correctly
  // Case normalization
}

export function generateShareText(
  guesses: string[],
  target: string,
  maxGuesses: number,
  won: boolean
): string {
  // Produces shareable emoji grid
  // Game-agnostic format
}

// 3. Game Class (Stateful)
export class WordMorphGame {
  private readonly word: string;
  private guesses: string[] = [];
  private status: GameStatus = "playing";
  private maxGuesses: number;

  constructor(word: string) {
    // Validate input
    if (word.length !== 5) {
      throw new Error("Word must be exactly 5 letters");
    }
    this.word = word.toUpperCase();
    this.maxGuesses = DEFAULT_MAX_GUESSES;
  }

  makeGuess(guess: string): LetterResult[] {
    // 1. Validate game state
    if (this.isGameOver()) {
      throw new Error("Game is already over");
    }

    // 2. Validate input
    const normalized = guess.toUpperCase();
    if (!isValidWord(normalized)) {
      throw new Error("Not a valid word");
    }

    // 3. Calculate feedback
    const result = checkGuess(normalized, this.word);

    // 4. Update state
    this.guesses.push(normalized);
    if (normalized === this.word) {
      this.status = "won";
    } else if (this.guesses.length >= this.maxGuesses) {
      this.status = "lost";
    }

    return result;
  }

  getState(): Readonly<GameState> {
    return {
      word: this.word,
      guesses: [...this.guesses],  // Shallow copy
      status: this.status,
      maxGuesses: this.maxGuesses,
    };
  }

  isGameOver(): boolean {
    return this.status !== "playing";
  }

  getShareText(): string {
    return generateShareText(
      this.guesses,
      this.word,
      this.maxGuesses,
      this.status === "won"
    );
  }
}
```

**Key Principles**:
- **Immutable State Returns**: `getState()` returns `Readonly<GameState>` with spread operators
- **Input Validation**: Constructor and methods validate all inputs before processing
- **Two-Phase Logic**: Separation of feedback calculation from game state management
- **Error Handling**: Throws specific errors with descriptive messages
- **Pure Functions**: Game logic functions are deterministic and testable

### 2. MCP Tool Registration Pattern

**File Location**: `/server/src/index.ts`

Every game needs 3-4 MCP tools following this structure:

```typescript
// Tool 1: Start Game
server.registerTool(
  "gamebox.start_game_name",  // Namespace: gamebox.{action}_{game}
  {
    title: "Start Game Name",
    description: "Clear description of when/how to use this tool",
    inputSchema: startGameNameJsonSchema,  // JSON Schema for ChatGPT
    annotations: {
      readOnlyHint: false,    // Does this modify state?
      openWorldHint: false,   // Does this accept open-ended input?
      destructiveHint: false, // Is this irreversible?
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/game-name.html",
      "openai/toolInvocation/invoking": "Starting Game Name...",
      "openai/toolInvocation/invoked": "Game Name ready!",
    },
  },
  async (params: unknown) => {
    // 1. Zod validation
    const { mode } = startGameNameSchema.parse(params);

    // 2. Create game instance
    const targetWord = getDailyWord(new Date());
    const game = new GameNameGame(targetWord);

    // 3. Create session
    const sessionId = generateSessionId();
    activeGames.set(sessionId, { game, mode, userId });

    // 4. Load user stats
    const streakData = await loadStreakData(userId);

    // 5. Return bi-modal response
    return {
      content: [textContent(`
🎯 Game Name Started!

**Game Rules:**
- Rule 1
- Rule 2

**Your Stats:**
- Current Streak: ${streakData.currentStreak}
- Win Rate: ${calculateWinRate(streakData)}%
      `)],
      structuredContent: {
        gameId: sessionId,
        mode,
        status: "playing",
        streak: streakData.currentStreak,
        // ... other state
      },
    };
  }
);

// Tool 2: Make Move/Guess
server.registerTool(
  "gamebox.make_game_name_move",
  {
    title: "Make Game Name Move",
    description: "Submit a move/guess in Game Name",
    inputSchema: makeGameNameMoveJsonSchema,
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/game-name.html",
    },
  },
  async (params: unknown) => {
    // 1. Validate
    const { gameId, guess } = makeGameNameMoveSchema.parse(params);

    // 2. Get session
    const session = activeGames.get(gameId);
    if (!session) {
      return createErrorResponse("Game not found. Please start a new game.");
    }

    // 3. Execute move
    try {
      const result = session.game.makeGuess(guess);
      const state = session.game.getState();

      // 4. Handle game end
      if (session.game.isGameOver()) {
        const won = state.status === "won";
        let streakData = await loadStreakData(session.userId);
        streakData = session.mode === "daily"
          ? updateDailyStreak(streakData, won)
          : updatePracticeStreak(streakData, won);
        await saveStreakData(session.userId, streakData);
      }

      // 5. Return response
      return {
        content: [textContent(buildGameStatusMessage(state))],
        structuredContent: {
          gameId,
          result,
          status: state.status,
          shareText: session.game.isGameOver() ? session.game.getShareText() : undefined,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      return createErrorResponse(errorMessage);
    }
  }
);

// Tool 3: Get Hint (optional)
// Tool 4: Forfeit/End Game (optional)
```

**Dual Schema Pattern** (CRITICAL):

```typescript
// 1. Zod Schema (runtime validation)
const startGameNameSchema = z.object({
  mode: z.enum(["daily", "practice"]).optional().default("daily"),
});

// 2. JSON Schema (ChatGPT App Store compliance)
const startGameNameJsonSchema = {
  type: "object",
  properties: {
    mode: {
      type: "string",
      enum: ["daily", "practice"],
      default: "daily",
      description: "Game mode: 'daily' for the daily challenge, 'practice' for unlimited games",
    },
  },
};

// Usage in tool:
inputSchema: startGameNameJsonSchema as any,  // For ChatGPT
const { mode } = startGameNameSchema.parse(params);  // For validation
```

### 3. Session Management Pattern

**File Location**: `/server/src/index.ts` (lines 51-74)

```typescript
// Session storage
const activeGames = new Map<string, GameSession>();

interface GameSession {
  game: WordMorphGame | KinshipGame | /* other game types */;
  gameType: "word-morph" | "kinship" | /* other types */;
  mode: "daily" | "practice" | "standard";
  userId: string;
  createdAt: Date;
  expiresAt: Date;  // For cleanup
}

// Session ID generation
function generateSessionId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// Session factory
function createGameSession(
  userId: string,
  gameType: string,
  mode: string
): { sessionId: string; session: GameSession } {
  let game: GameSession["game"];

  switch (gameType) {
    case "word-morph":
      game = new WordMorphGame(getDailyWord(new Date()));
      break;
    case "kinship":
      game = new KinshipGame(getDailyFamilyTree(new Date()));
      break;
    // ... other games
  }

  const sessionId = generateSessionId();
  const session = {
    game,
    gameType,
    mode,
    userId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  activeGames.set(sessionId, session);
  return { sessionId, session };
}

// Session validation
function getSession(gameId: string): GameSession {
  const session = activeGames.get(gameId);
  if (!session) {
    throw new Error("Game not found. Please start a new game.");
  }
  return session;
}
```

### 4. Data Persistence Pattern

**File Location**: `/server/src/data/streaks.ts`

```typescript
// Storage directory
const STORAGE_DIR = join(process.cwd(), ".data", "streaks");

// File path helper
function getUserStreakPath(userId: string): string {
  return join(STORAGE_DIR, `${userId}.json`);
}

// Ensure directory exists
async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create storage directory:", error);
  }
}

// Load with fallback
export async function loadStreakData(userId: string): Promise<StreakData> {
  try {
    const filePath = getUserStreakPath(userId);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as StreakData;
  } catch (error) {
    return { ...DEFAULT_STREAK_DATA };
  }
}

// Save with error handling
export async function saveStreakData(
  userId: string,
  data: StreakData
): Promise<void> {
  try {
    await ensureStorageDir();
    const filePath = getUserStreakPath(userId);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save streak data:", error);
    throw new Error("Failed to save streak data");
  }
}
```

### 5. Widget HTML Generation Pattern

**File Location**: `/server/src/index.ts`

```typescript
function getGameNameWidgetHtml(): string {
  const WIDGET_BASE_URL = process.env.WIDGET_BASE_URL || "http://localhost:4444";
  const WIDGET_VERSION = Date.now();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Name</title>
  <script type="module" crossorigin
          src="${WIDGET_BASE_URL}/assets/index.js?v=${WIDGET_VERSION}">
  </script>
  <link rel="stylesheet" crossorigin
        href="${WIDGET_BASE_URL}/assets/index.css?v=${WIDGET_VERSION}">
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
}
```

---

## Frontend React Architecture

### 1. Component Structure Pattern

**File Location**: `/web/src/widgets/GameName.tsx`

```typescript
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWidgetState } from "../hooks/useWidgetState.js";
import { useOpenAiGlobal } from "../hooks/useOpenAiGlobal.js";

// 1. Type Definitions
interface GameNameState {
  gameId?: string;
  guesses: string[];
  results: LetterResult[][];
  status: GameStatus;
  streak: number;
  maxStreak?: number;
}

interface ToolOutput {
  gameId?: string;
  result?: LetterResult[];
  status?: GameStatus;
  message?: string;
}

const DEFAULT_STATE: GameNameState = {
  guesses: [],
  results: [],
  status: "playing",
  streak: 0,
};

// 2. Main Component
export function GameName(): JSX.Element {
  // Persisted state (syncs with ChatGPT)
  const [state, setState] = useWidgetState<GameNameState>(DEFAULT_STATE);

  // Transient state (not persisted)
  const [currentGuess, setCurrentGuess] = useState("");
  const [message, setMessage] = useState("");

  // Tool output listener
  const toolOutput = useOpenAiGlobal<ToolOutput>("toolOutput");

  // Deduplication ref
  const lastProcessedRef = useRef<string>("");

  // 3. Process Tool Output
  useEffect(() => {
    if (!toolOutput?.gameId) return;

    // Prevent duplicate processing
    const outputKey = `${toolOutput.gameId}-${toolOutput.guesses?.length}-${toolOutput.status}`;
    if (lastProcessedRef.current === outputKey) return;
    lastProcessedRef.current = outputKey;

    // Update persisted state
    setState((prev) => ({
      ...prev,
      gameId: toolOutput.gameId,
      result: toolOutput.result,
      status: toolOutput.status || prev.status,
      // ... other fields
    }));

    // Update transient state
    setCurrentGuess("");
    setMessage(toolOutput.message || "");
  }, [toolOutput, setState]);

  // 4. User Input Handler
  const handleKeyPress = useCallback(
    (key: string) => {
      if (state.status !== "playing" || !state.gameId) return;

      if (key === "ENTER") {
        // Validate and submit
        if (currentGuess.length !== 5) {
          setMessage("Word must be 5 letters");
          return;
        }

        // Call MCP tool
        const api = getOpenAiApi();
        if (api) {
          api.callTool("gamebox.make_game_name_move", {
            gameId: state.gameId,
            guess: currentGuess,
          }).catch((error: unknown) => {
            console.error("Error:", error);
            setMessage("Error submitting guess");
          });
        }
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [state.status, state.gameId, currentGuess]
  );

  // 5. Physical Keyboard Support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Enter") {
        handleKeyPress("ENTER");
      } else if (e.key === "Backspace") {
        handleKeyPress("BACKSPACE");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  // 6. Render
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Game Name</h1>

      {/* Game Board */}
      <GameBoard guesses={state.guesses} results={state.results} />

      {/* Keyboard */}
      <Keyboard onKeyPress={handleKeyPress} />

      {/* Status Display */}
      {message && <div className="text-sm">{message}</div>}
    </div>
  );
}

// 7. Helper: API Detection
function getOpenAiApi(): { callTool: (name: string, params: object) => Promise<unknown> } | undefined {
  const openai = (window as { openai?: { callTool?: any } }).openai;
  if (openai?.callTool) {
    return openai as { callTool: (name: string, params: object) => Promise<unknown> };
  }
  return undefined;
}
```

### 2. Custom Hooks Pattern

**useWidgetState** - Most Important Hook:
```typescript
// Persists state to window.openai.widgetState (< 4KB limit)
const [state, setState] = useWidgetState<GameState>(DEFAULT_STATE);

// setState works like React.useState but persists
setState(prev => ({ ...prev, score: prev.score + 1 }));
```

**useOpenAiGlobal** - Reactive Global Access:
```typescript
// Subscribes to window.openai updates
const toolOutput = useOpenAiGlobal<ToolOutput>("toolOutput");
const sessionId = useOpenAiGlobal<string>("sessionId");
```

### 3. Styling Pattern

**CSS Variables** (`/web/src/styles/globals.css`):
```css
:root {
  --game-name-correct: #14B8A6;    /* Teal */
  --game-name-present: #F97316;    /* Coral */
  --game-name-absent: #64748B;     /* Slate */
  --game-name-background: #F8FAFC; /* Light bg */
  --game-name-border: #CBD5E1;     /* Border */
}

/* Custom animations */
@keyframes flip {
  0% { transform: rotateX(0); }
  50% { transform: rotateX(90deg); }
  100% { transform: rotateX(0); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Custom classes */
.game-name-correct {
  background-color: var(--game-name-correct);
  color: white;
}

.game-name-present {
  background-color: var(--game-name-present);
  color: white;
}

.game-name-absent {
  background-color: var(--game-name-absent);
  color: white;
}
```

**Tailwind Utilities**:
```typescript
<div className={`
  w-14 h-14 flex items-center justify-center
  text-2xl font-bold uppercase rounded-md
  transition-all duration-300
  ${shouldAnimate ? "animate-flip" : ""}
  ${getTileClasses(feedback)}
`}>
```

---

## Testing Architecture

### 1. Unit Test Pattern

**File Location**: `/server/src/games/gameName.test.ts`

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { GameNameGame, checkGuess } from "./gameName.js";

describe("GameNameGame", () => {
  describe("constructor", () => {
    it("should create game with valid input", () => {
      const game = new GameNameGame("CRANE");
      expect(game.getState().word).toBe("CRANE");
    });

    it("should throw error for invalid input", () => {
      expect(() => new GameNameGame("TOO")).toThrow(
        "Word must be exactly 5 letters"
      );
    });
  });

  describe("makeGuess", () => {
    let game: GameNameGame;

    beforeEach(() => {
      game = new GameNameGame("CRANE");
    });

    it("should accept valid guess", () => {
      const result = game.makeGuess("TRAIN");
      expect(result).toHaveLength(5);
    });

    it("should reject invalid guess", () => {
      expect(() => game.makeGuess("ZZZZZ")).toThrow("Not a valid word");
    });

    it("should update game state", () => {
      game.makeGuess("TRAIN");
      const state = game.getState();
      expect(state.guesses).toHaveLength(1);
    });
  });

  describe("win condition", () => {
    it("should detect win", () => {
      const game = new GameNameGame("CRANE");
      game.makeGuess("CRANE");
      expect(game.getState().status).toBe("won");
      expect(game.isGameOver()).toBe(true);
    });

    it("should prevent guesses after winning", () => {
      const game = new GameNameGame("CRANE");
      game.makeGuess("CRANE");
      expect(() => game.makeGuess("TRAIN")).toThrow("Game is already won");
    });
  });
});
```

### 2. E2E Test Pattern

**File Location**: `/e2e/gameName.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

// Helper function
async function mcpCall(request: any, method: string, params?: any) {
  return request.post("http://localhost:8000/mcp", {
    headers: { "Content-Type": "application/json" },
    data: { jsonrpc: "2.0", id: 1, method, params },
  });
}

test.describe("Game Name MCP Server", () => {
  test("should respond to health check", async ({ request }) => {
    const response = await request.get("http://localhost:8000/");
    expect(response.ok()).toBeTruthy();
  });

  test("should list tools", async ({ request }) => {
    const response = await mcpCall(request, "tools/list");
    const data = await response.json();
    const tools = data.result.tools.map((t: any) => t.name);
    expect(tools).toContain("gamebox.start_game_name");
  });

  test("should start game in daily mode", async ({ request }) => {
    const response = await mcpCall(request, "tools/call", {
      name: "gamebox.start_game_name",
      arguments: { mode: "daily" },
    });

    const data = await response.json();
    expect(data.result.structuredContent).toBeDefined();
    expect(data.result.structuredContent.gameId).toBeDefined();
    expect(data.result.structuredContent.mode).toBe("daily");
    expect(data.result.structuredContent.status).toBe("playing");
  });

  test("should accept valid move", async ({ request }) => {
    // Start game
    const startResponse = await mcpCall(request, "tools/call", {
      name: "gamebox.start_game_name",
      arguments: { mode: "practice" },
    });
    const startData = await startResponse.json();
    const gameId = startData.result.structuredContent.gameId;

    // Make move
    const moveResponse = await mcpCall(request, "tools/call", {
      name: "gamebox.make_game_name_move",
      arguments: { gameId, guess: "CRANE" },
    });

    const moveData = await moveResponse.json();
    expect(moveData.result.structuredContent.result).toBeDefined();
  });

  test("should reject invalid move", async ({ request }) => {
    // Similar pattern...
  });
});
```

### 3. Widget UI Test Pattern

**File Location**: `/e2e/widget-ui-gameName.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Game Name Widget UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:4444/");
    await page.waitForSelector('h1:has-text("Game Name")');
  });

  test("should render title", async ({ page }) => {
    const title = page.getByRole("heading", { name: "Game Name" });
    await expect(title).toBeVisible();
  });

  test("should handle keyboard clicks", async ({ page }) => {
    await page.getByRole("button", { name: "C" }).click();
    await page.getByRole("button", { name: "R" }).click();

    const tiles = page.locator("div").filter({ hasText: /^[A-Z]$/ });
    await expect(tiles.first()).toHaveText("C");
  });

  test("should show validation message", async ({ page }) => {
    await page.getByRole("button", { name: "C" }).click();
    await page.getByRole("button", { name: "ENTER" }).click();

    await expect(page.getByText(/must be.*letters/i)).toBeVisible();
  });
});
```

### 4. Component Test Pattern

**File Location**: `/web/src/widgets/GameName.test.tsx`

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameName } from "./GameName.js";
import { useState } from "react";

// Mock hooks
vi.mock("../hooks/useWidgetState.js", () => ({
  useWidgetState: <T,>(defaultState: T) => useState(defaultState),
}));

vi.mock("../hooks/useOpenAiGlobal.js", () => ({
  useOpenAiGlobal: () => undefined,
}));

describe("GameName Component", () => {
  it("should render title", () => {
    render(<GameName />);
    expect(screen.getByText("Game Name")).toBeInTheDocument();
  });

  it("should handle letter clicks", () => {
    render(<GameName />);
    fireEvent.click(screen.getByText("C"));
    expect(screen.getAllByRole("generic")[0]).toHaveTextContent("C");
  });
});
```

---

## Build & Configuration

### 1. TypeScript Configuration

**Server** (`/server/tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Web** (`/web/tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "types": ["vite/client"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 2. Vite Configuration

**File**: `/web/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",  // Relative paths for widget embedding
  server: {
    port: 4444,
    host: "0.0.0.0",
    strictPort: true,
    cors: true,
  },
  build: {
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
```

### 3. Package Scripts

**Server**:
```json
{
  "scripts": {
    "dev": "nodemon --watch src --ext ts --exec tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

**Web**:
```json
{
  "scripts": {
    "dev": "vite --port 4444",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## Implementation Checklist

When implementing a new game, follow this comprehensive checklist:

### Backend (Server)

- [ ] **Create game logic class** (`/server/src/games/gameName.ts`)
  - [ ] Define types (GameStatus, FeedbackType, GameState)
  - [ ] Implement pure functions (validation, feedback calculation)
  - [ ] Implement game class (constructor, makeGuess, getState, isGameOver, getShareText)
  - [ ] Add input validation with descriptive errors
  - [ ] Return immutable state from getState()

- [ ] **Create unit tests** (`/server/src/games/gameName.test.ts`)
  - [ ] Test constructor validation
  - [ ] Test valid/invalid moves
  - [ ] Test win/lose conditions
  - [ ] Test edge cases (duplicates, boundaries)
  - [ ] Test state immutability
  - [ ] Aim for >80% coverage

- [ ] **Create game data** (`/server/src/data/gameNameData.ts`)
  - [ ] Define data structures (word lists, puzzles, etc.)
  - [ ] Implement getDailyContent() function
  - [ ] Export validation functions if needed

- [ ] **Register MCP tools** (`/server/src/index.ts`)
  - [ ] Create Zod + JSON schemas for each tool
  - [ ] Register start_game_name tool
  - [ ] Register make_game_name_move tool
  - [ ] Register optional hint/forfeit tools
  - [ ] Add game to menu array
  - [ ] Register widget resource
  - [ ] Create widget HTML generator function

### Frontend (Web)

- [ ] **Create widget component** (`/web/src/widgets/GameName.tsx`)
  - [ ] Define GameState and ToolOutput interfaces
  - [ ] Set up useWidgetState for persisted state
  - [ ] Set up useState for transient state
  - [ ] Process tool output with deduplication
  - [ ] Implement user input handlers
  - [ ] Add physical keyboard support
  - [ ] Create sub-components (Board, Keyboard, etc.)

- [ ] **Create component tests** (`/web/src/widgets/GameName.test.tsx`)
  - [ ] Mock hooks (useWidgetState, useOpenAiGlobal)
  - [ ] Test rendering
  - [ ] Test user interactions
  - [ ] Test input constraints
  - [ ] Test validation messages

- [ ] **Add styles** (`/web/src/styles/globals.css`)
  - [ ] Define CSS variables for colors
  - [ ] Create custom animations
  - [ ] Add game-specific utility classes

### Testing (E2E)

- [ ] **Create E2E tests** (`/e2e/gameName.spec.ts`)
  - [ ] Test health check
  - [ ] Test tools registration
  - [ ] Test daily/practice modes
  - [ ] Test valid/invalid inputs
  - [ ] Test win/lose conditions
  - [ ] Test game menu display

- [ ] **Create widget UI tests** (`/e2e/widget-ui-gameName.spec.ts`)
  - [ ] Test title rendering
  - [ ] Test game board structure
  - [ ] Test keyboard interactions
  - [ ] Test validation messages
  - [ ] Test mobile responsiveness

- [ ] **Create screenshot tests** (`/e2e/widget-screenshots-gameName.spec.ts`)
  - [ ] Capture initial state
  - [ ] Capture with user input
  - [ ] Capture mobile viewport
  - [ ] Capture component closeups

### Documentation

- [ ] **Update README.md** with new game description
- [ ] **Update CONTRIBUTING.md** with game-specific notes
- [ ] **Create game-specific docs** if needed

### Verification

- [ ] All unit tests passing (npm run test)
- [ ] All E2E tests passing (npm run test:e2e)
- [ ] Type checking passes (npm run type-check)
- [ ] Builds succeed (npm run build)
- [ ] Server starts without errors
- [ ] Widget renders correctly in browser
- [ ] Physical keyboard works
- [ ] Mobile responsive (375x667)
- [ ] Win/lose states work
- [ ] Share text generates correctly
- [ ] Streaks update correctly

---

## Key Principles

1. **Consistency**: Follow existing patterns exactly
2. **Type Safety**: Use TypeScript strictly, no `any` types
3. **Validation**: Validate all inputs (Zod + JSON Schema)
4. **Immutability**: Never mutate state, always return copies
5. **Error Handling**: Descriptive errors, graceful degradation
6. **Testing**: Test-driven development, >80% coverage
7. **Accessibility**: Keyboard support, ARIA labels, color contrast
8. **Performance**: Prevent duplicate processing, optimize renders
9. **Documentation**: JSDoc comments, clear naming
10. **User Experience**: Rich feedback, helpful messages

---

## Next Steps

For each game implementation:

1. Review GAME_ENHANCEMENT_SPEC.md for game-specific features
2. Create GitHub issue using this checklist
3. Implement following Ralph Loop workflow
4. Test thoroughly at each step
5. Review and refactor for quality
6. Commit with descriptive messages
7. Verify against checklist before marking complete
