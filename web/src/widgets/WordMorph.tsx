/**
 * Word Morph widget component.
 *
 * Displays the word transformation puzzle game board with:
 * - 6x5 tile grid
 * - Color-coded feedback (correct, present, absent)
 * - Flip animations
 * - Win/lose states
 * - Share functionality
 *
 * @module widgets/WordMorph
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useWidgetState } from "../hooks/useWidgetState.js";
import { useOpenAiGlobal } from "../hooks/useOpenAiGlobal.js";
import type {
  LetterFeedback,
  LetterResult,
  GameStatus,
  ToolOutput,
} from "../types/game.js";

// Constants
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
] as const;

/**
 * Widget state persisted across sessions.
 * Note: currentGuess is NOT persisted to avoid excessive updates.
 */
interface WordMorphState {
  gameId?: string;
  word?: string;
  guesses: string[];
  results: LetterResult[][];
  status: GameStatus;
  streak: number;
  maxStreak?: number;
  totalGamesPlayed?: number;
  winRate?: number;
}

/**
 * Default initial state.
 */
const DEFAULT_STATE: WordMorphState = {
  guesses: [],
  results: [],
  status: "playing",
  streak: 0,
};

/**
 * Get CSS classes for tile background based on feedback.
 */
function getTileClasses(feedback: LetterFeedback): string {
  switch (feedback) {
    case "correct":
      return "word-morph-correct";
    case "present":
      return "word-morph-present";
    case "absent":
      return "word-morph-absent";
    case "empty":
      return "bg-transparent border-2 border-gray-300 text-black";
  }
}

interface TileProps {
  letter: string;
  feedback: LetterFeedback;
  index: number;
}

/**
 * Tile component - renders a single letter tile.
 */
function Tile({ letter, feedback, index }: TileProps): JSX.Element {
  const shouldAnimate = feedback !== "empty";

  return (
    <div
      className={`
        ${getTileClasses(feedback)}
        w-14 h-14 flex items-center justify-center
        text-2xl font-bold uppercase rounded-md
        transition-all duration-300
        ${shouldAnimate ? "animate-flip" : ""}
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {letter}
    </div>
  );
}

interface GameBoardProps {
  guesses: string[];
  results: LetterResult[][];
  currentGuess: string;
  status: GameStatus;
}

/**
 * Render a single row of tiles.
 */
function GameRow({
  guess,
  result,
  isWinningRow,
  isLosingRow,
}: {
  guess: string;
  result: LetterResult[];
  isWinningRow: boolean;
  isLosingRow: boolean;
}): JSX.Element {
  const rowAnimation = isLosingRow ? "animate-shake" : "";

  return (
    <div className={`flex gap-2 justify-center ${rowAnimation}`}>
      {Array.from({ length: WORD_LENGTH }).map((_, j) => {
        const tileAnimation = isWinningRow ? "animate-bounce" : "";

        return (
          <div
            key={j}
            className={tileAnimation}
            style={tileAnimation ? { animationDelay: `${j * 100}ms` } : undefined}
          >
            <Tile
              letter={guess[j] || ""}
              feedback={result[j]?.feedback || "empty"}
              index={j}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Render an empty row of tiles.
 */
function EmptyRow({ guess = "" }: { guess?: string }): JSX.Element {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: WORD_LENGTH }).map((_, j) => (
        <Tile key={j} letter={guess[j] || ""} feedback="empty" index={j} />
      ))}
    </div>
  );
}

/**
 * Game board component - renders the 6x5 grid.
 */
function GameBoard({ guesses, results, currentGuess, status }: GameBoardProps): JSX.Element {
  const isGameOver = status !== "playing";
  const lastGuessIndex = guesses.length - 1;

  return (
    <div className="flex flex-col gap-2">
      {/* Completed guess rows */}
      {guesses.map((guess, i) => (
        <GameRow
          key={i}
          guess={guess}
          result={results[i] || []}
          isWinningRow={isGameOver && i === lastGuessIndex && status === "won"}
          isLosingRow={isGameOver && i === lastGuessIndex && status === "lost"}
        />
      ))}

      {/* Current guess row (if still playing) */}
      {guesses.length < MAX_GUESSES && <EmptyRow guess={currentGuess} />}

      {/* Remaining empty rows */}
      {Array.from({ length: Math.max(0, MAX_GUESSES - guesses.length - 1) }).map((_, i) => (
        <EmptyRow key={`empty-${i}`} />
      ))}
    </div>
  );
}

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  guessedLetters: Map<string, LetterFeedback>;
}

/**
 * Get Tailwind classes for keyboard key based on feedback.
 */
function getKeyClasses(key: string, feedback: LetterFeedback | undefined): string {
  // Special keys always use neutral colors
  if (key === "ENTER" || key === "BACKSPACE") {
    return "bg-gray-400 hover:bg-gray-500";
  }

  switch (feedback) {
    case "correct":
      return "word-morph-key-correct";
    case "present":
      return "word-morph-key-present";
    case "absent":
      return "word-morph-key-absent";
    default:
      return "bg-gray-300 hover:bg-gray-400";
  }
}

/**
 * Get display text for a keyboard key.
 */
function getKeyDisplay(key: string): string {
  return key === "BACKSPACE" ? "\u232B" : key;
}

/**
 * Keyboard component - renders on-screen keyboard.
 */
function Keyboard({ onKeyPress, guessedLetters }: KeyboardProps): JSX.Element {
  const isWideKey = (key: string) => key === "ENTER" || key === "BACKSPACE";

  return (
    <div className="flex flex-col gap-2 mt-4">
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} className="flex gap-1 justify-center">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => {
                onKeyPress(key);
              }}
              className={`
                ${getKeyClasses(key, guessedLetters.get(key))}
                ${isWideKey(key) ? "px-4" : "w-10"}
                h-12 rounded-md font-bold text-sm
                transition-colors duration-150
                active:scale-95
              `}
            >
              {getKeyDisplay(key)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Feedback priority for keyboard coloring.
 * Higher number = higher priority.
 */
const FEEDBACK_PRIORITY: Record<LetterFeedback, number> = {
  correct: 3,
  present: 2,
  absent: 1,
  empty: 0,
};

/**
 * Convert feedback to emoji for share text.
 */
function feedbackToEmoji(feedback: LetterFeedback): string {
  switch (feedback) {
    case "correct":
      return "\uD83D\uDFE9"; // Green square
    case "present":
      return "\uD83D\uDFE8"; // Yellow square
    default:
      return "\u2B1C"; // White square
  }
}

/**
 * Get the OpenAI window API if available.
 */
function getOpenAiApi(): { callTool: (name: string, params: object) => Promise<unknown> } | undefined {
  const openai = (window as { openai?: { callTool?: (name: string, params: object) => Promise<unknown> } }).openai;
  if (openai?.callTool) {
    return openai as { callTool: (name: string, params: object) => Promise<unknown> };
  }
  return undefined;
}

/**
 * Main Word Morph widget component.
 */
export function WordMorph(): JSX.Element {
  const [state, setState] = useWidgetState<WordMorphState>(DEFAULT_STATE);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [guessedLetters, setGuessedLetters] = useState<Map<string, LetterFeedback>>(new Map());

  // Subscribe to tool output from ChatGPT
  const toolOutput = useOpenAiGlobal<ToolOutput>("toolOutput");

  // Track last processed tool output to prevent duplicate processing
  const lastProcessedRef = useRef<string>("");

  // Process tool output when game starts or guess is made
  useEffect(() => {
    if (!toolOutput?.gameId) return;

    // Create a unique key for this tool output to prevent reprocessing
    const outputKey = `${toolOutput.gameId}-${toolOutput.guesses?.length || 0}-${toolOutput.status}`;
    if (lastProcessedRef.current === outputKey) {
      return; // Already processed this exact output
    }
    lastProcessedRef.current = outputKey;

    setState((prev) => {
      // Build new results array using previous results and new result
      let newResults = prev.results;
      if (toolOutput.result && toolOutput.guesses) {
        newResults = toolOutput.guesses.map((guess, i) => {
          // Use existing results for previous guesses
          if (i < toolOutput.guesses!.length - 1) {
            return prev.results[i] || [];
          }
          // For the latest guess, use the result from the tool
          return toolOutput.result!.map((feedback, j) => ({
            letter: guess[j] || "",
            feedback,
          }));
        });
      }

      return {
        ...prev,
        gameId: toolOutput.gameId,
        guesses: toolOutput.guesses || prev.guesses,
        results: newResults,
        status: toolOutput.status || prev.status,
        streak: toolOutput.streak ?? prev.streak,
        maxStreak: toolOutput.maxStreak,
        totalGamesPlayed: toolOutput.totalGamesPlayed,
        winRate: toolOutput.winRate,
        word: toolOutput.word,
      };
    });

    // Clear current guess after tool response
    setCurrentGuess("");

    // Set appropriate message
    if (toolOutput.message) {
      setMessage(toolOutput.message);
    } else if (toolOutput.status === "won") {
      setMessage(`You won! Streak: ${toolOutput.streak}`);
    } else if (toolOutput.status === "lost") {
      setMessage(`Game over. The word was: ${toolOutput.word}`);
    }
  }, [toolOutput]);

  // Update guessed letters map when results change
  useEffect(() => {
    const newMap = new Map<string, LetterFeedback>();

    state.results.forEach((result) => {
      result.forEach((lr) => {
        const existing = newMap.get(lr.letter);
        const existingPriority = existing ? FEEDBACK_PRIORITY[existing] : 0;
        const newPriority = FEEDBACK_PRIORITY[lr.feedback];

        if (newPriority > existingPriority) {
          newMap.set(lr.letter, lr.feedback);
        }
      });
    });

    setGuessedLetters(newMap);
  }, [state.results]);

  // Handle key press (from keyboard or button click)
  const handleKeyPress = useCallback(
    (key: string) => {

      // Check if game is over
      if (state.status !== "playing") {
        setMessage("Game is over. Start a new game!");
        return;
      }

      if (key === "ENTER") {
        if (currentGuess.length !== WORD_LENGTH) {
          setMessage("Word must be 5 letters");
          return;
        }

        if (!state.gameId) {
          setMessage("Connect to game server to make guesses");
          return;
        }

        const api = getOpenAiApi();
        if (api) {
          setMessage("Checking guess...");
          api
            .callTool("gamebox.check_word_morph_guess", {
              gameId: state.gameId,
              guess: currentGuess,
            })
            .catch((error: unknown) => {
              console.error("Error calling tool:", error);
              setMessage("Error submitting guess. Try again!");
            });
        } else {
          setMessage("Widget API not available");
        }
        return;
      }

      if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        setMessage("");
        return;
      }

      // Handle letter keys
      if (key.length === 1) {
        setCurrentGuess((prev) => {
          // Check length inside setState to avoid stale closure
          if (prev.length < WORD_LENGTH) {
            return prev + key;
          }
          return prev;
        });
        setMessage("");
      }
    },
    [state.status, state.gameId, currentGuess]
  );

  // Listen for physical keyboard input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Enter" || e.key === "Backspace" || /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
      }

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

  function handleShare(): void {
    if (state.status === "playing") {
      setMessage("Finish the game first!");
      return;
    }

    const emojiGrid = state.guesses
      .map((_, i) => state.results[i].map((lr) => feedbackToEmoji(lr.feedback)).join(""))
      .join("\n");

    const shareText = `Word Morph ${state.guesses.length}/${MAX_GUESSES}\n\n${emojiGrid}`;

    navigator.clipboard.writeText(shareText).then(
      () => setMessage("Copied to clipboard!"),
      () => setMessage(shareText)
    );
  }

  function handleNewGame(): void {
    const api = getOpenAiApi();
    if (api) {
      setMessage("Starting new game...");
      setState(DEFAULT_STATE);
      api.callTool("gamebox.start_word_morph", { mode: "daily" }).catch((error: unknown) => {
        console.error("Error starting game:", error);
        setMessage("Error starting game. Try asking ChatGPT!");
      });
    } else {
      setMessage("Ask ChatGPT to start a new game!");
    }
  }

  const isGameOver = state.status !== "playing";

  return (
    <div className="flex flex-col items-center p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-black">Word Morph</h1>

      {/* Status display */}
      <StatusDisplay status={state.status} streak={state.streak} word={state.word} guessCount={state.guesses.length} />

      {/* Game board */}
      <GameBoard
        guesses={state.guesses}
        results={state.results}
        currentGuess={currentGuess}
        status={state.status}
      />

      {/* Keyboard */}
      <Keyboard
        onKeyPress={(key) => {
          handleKeyPress(key);
        }}
        guessedLetters={guessedLetters}
      />

      {/* Message toast */}
      {message && (
        <div className="mt-4 px-4 py-2 bg-gray-100 rounded-md text-gray-700 animate-fade-in-up">
          {message}
        </div>
      )}

      {/* Action buttons (shown when game is over) */}
      {isGameOver && (
        <div className="mt-6 flex gap-4 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <button
            onClick={handleShare}
            className="px-6 py-2 text-white rounded-md font-bold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--word-morph-correct)" }}
          >
            Share Results
          </button>
          <button
            onClick={handleNewGame}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition-colors"
          >
            New Game
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Game status display component.
 */
function StatusDisplay({
  status,
  streak,
  word,
  guessCount,
}: {
  status: GameStatus;
  streak: number;
  word?: string;
  guessCount: number;
}): JSX.Element {
  if (status === "won") {
    return (
      <div
        className="mb-4 text-center text-green-600 font-bold text-xl animate-fade-in-up"
        style={{ animationDelay: "300ms" }}
      >
        You won! Streak: {streak}
      </div>
    );
  }

  if (status === "lost") {
    return (
      <div
        className="mb-4 text-center text-red-600 font-bold text-xl animate-fade-in-up"
        style={{ animationDelay: "300ms" }}
      >
        Game over. The word was: {word}
      </div>
    );
  }

  return (
    <div className="mb-4 text-center text-gray-600">
      Guess {guessCount + 1} of {MAX_GUESSES}
    </div>
  );
}
