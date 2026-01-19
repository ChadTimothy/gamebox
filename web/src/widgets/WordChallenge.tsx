/**
 * Word Challenge widget component.
 *
 * Displays the Wordle-style game board with:
 * - 6x5 tile grid
 * - Color-coded feedback (correct, present, absent)
 * - Flip animations
 * - Win/lose states
 * - Share functionality
 *
 * @module widgets/WordChallenge
 */

import { useState, useEffect } from "react";
import { useWidgetState } from "../hooks/useWidgetState.js";

/**
 * Letter feedback type matching server-side LetterFeedback.
 */
type LetterFeedback = "correct" | "present" | "absent" | "empty";

/**
 * Result for a single letter in a guess.
 */
interface LetterResult {
  letter: string;
  feedback: LetterFeedback;
}

/**
 * Game status.
 */
type GameStatus = "playing" | "won" | "lost";

/**
 * Widget state persisted across sessions.
 */
interface WordChallengeState {
  word?: string;
  guesses: string[];
  results: LetterResult[][];
  status: GameStatus;
  streak: number;
  currentGuess: string;
}

/**
 * Default initial state.
 */
const DEFAULT_STATE: WordChallengeState = {
  guesses: [],
  results: [],
  status: "playing",
  streak: 0,
  currentGuess: "",
};

/**
 * Tile component - renders a single letter tile.
 */
function Tile({
  letter,
  feedback,
  index,
}: {
  letter: string;
  feedback: LetterFeedback;
  index: number;
}) {
  const bgColor = {
    correct: "bg-green-600",
    present: "bg-yellow-500",
    absent: "bg-gray-500",
    empty: "bg-transparent border-2 border-gray-300",
  }[feedback];

  const textColor = feedback === "empty" ? "text-gray-900" : "text-white";

  return (
    <div
      className={`
        ${bgColor} ${textColor}
        w-14 h-14 flex items-center justify-center
        text-2xl font-bold uppercase rounded
        transition-all duration-300
        ${feedback !== "empty" ? "animate-flip" : ""}
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {letter}
    </div>
  );
}

/**
 * Game board component - renders the 6x5 grid.
 */
function GameBoard({
  guesses,
  results,
  currentGuess,
  maxGuesses = 6,
}: {
  guesses: string[];
  results: LetterResult[][];
  currentGuess: string;
  maxGuesses?: number;
}) {
  const rows = [];

  // Render completed guesses
  for (let i = 0; i < guesses.length; i++) {
    const guess = guesses[i];
    const result = results[i] || [];

    rows.push(
      <div key={i} className="flex gap-2 justify-center">
        {Array.from({ length: 5 }).map((_, j) => (
          <Tile
            key={j}
            letter={guess[j] || ""}
            feedback={result[j]?.feedback || "empty"}
            index={j}
          />
        ))}
      </div>
    );
  }

  // Render current guess row (if still playing)
  if (guesses.length < maxGuesses) {
    rows.push(
      <div key={guesses.length} className="flex gap-2 justify-center">
        {Array.from({ length: 5 }).map((_, j) => (
          <Tile
            key={j}
            letter={currentGuess[j] || ""}
            feedback="empty"
            index={j}
          />
        ))}
      </div>
    );
  }

  // Render remaining empty rows
  for (let i = guesses.length + 1; i < maxGuesses; i++) {
    rows.push(
      <div key={i} className="flex gap-2 justify-center">
        {Array.from({ length: 5 }).map((_, j) => (
          <Tile key={j} letter="" feedback="empty" index={j} />
        ))}
      </div>
    );
  }

  return <div className="flex flex-col gap-2">{rows}</div>;
}

/**
 * Keyboard component - renders on-screen keyboard.
 */
function Keyboard({
  onKeyPress,
  guessedLetters,
}: {
  onKeyPress: (key: string) => void;
  guessedLetters: Map<string, LetterFeedback>;
}) {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
  ];

  const getKeyColor = (key: string) => {
    if (key === "ENTER" || key === "⌫") return "bg-gray-400 hover:bg-gray-500";

    const feedback = guessedLetters.get(key);
    if (!feedback || feedback === "empty") return "bg-gray-300 hover:bg-gray-400";

    return {
      correct: "bg-green-600 text-white",
      present: "bg-yellow-500 text-white",
      absent: "bg-gray-600 text-white",
    }[feedback];
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-1 justify-center">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={`
                ${getKeyColor(key)}
                ${key === "ENTER" || key === "⌫" ? "px-4" : "w-10"}
                h-12 rounded font-bold text-sm
                transition-colors duration-150
                active:scale-95
              `}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Main Word Challenge widget component.
 */
export function WordChallenge() {
  const [state, setState] = useWidgetState<WordChallengeState>(DEFAULT_STATE);
  const [message, setMessage] = useState<string>("");
  const [guessedLetters, setGuessedLetters] = useState<
    Map<string, LetterFeedback>
  >(new Map());

  // Update guessed letters map when results change
  useEffect(() => {
    const newMap = new Map<string, LetterFeedback>();

    state.results.forEach((result) => {
      result.forEach((lr) => {
        const existing = newMap.get(lr.letter);
        // Prioritize: correct > present > absent
        if (!existing || existing === "absent" || (existing === "present" && lr.feedback === "correct")) {
          newMap.set(lr.letter, lr.feedback);
        }
      });
    });

    setGuessedLetters(newMap);
  }, [state.results]);

  const handleKeyPress = (key: string) => {
    if (state.status !== "playing") {
      setMessage("Game is over. Start a new game!");
      return;
    }

    if (key === "ENTER") {
      if (state.currentGuess.length !== 5) {
        setMessage("Word must be 5 letters");
        return;
      }

      // TODO: Call MCP tool to validate guess and get feedback
      // For now, just show message
      setMessage("Connect to game server to make guesses");
    } else if (key === "⌫") {
      setState((prev) => ({
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1),
      }));
      setMessage("");
    } else if (key.length === 1 && state.currentGuess.length < 5) {
      setState((prev) => ({
        ...prev,
        currentGuess: prev.currentGuess + key,
      }));
      setMessage("");
    }
  };

  const handleShare = () => {
    // TODO: Generate share text from game state
    setMessage("Share functionality coming soon!");
  };

  const handleNewGame = () => {
    setState(DEFAULT_STATE);
    setMessage("New game started!");
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Word Challenge</h1>

      {/* Status and streak */}
      <div className="mb-4 text-center">
        {state.status === "won" && (
          <div className="text-green-600 font-bold text-xl mb-2">
            🎉 You won! Streak: {state.streak}
          </div>
        )}
        {state.status === "lost" && (
          <div className="text-red-600 font-bold text-xl mb-2">
            Game over. The word was: {state.word}
          </div>
        )}
        {state.status === "playing" && (
          <div className="text-gray-600">
            Guess {state.guesses.length + 1} of 6
          </div>
        )}
      </div>

      {/* Game board */}
      <GameBoard
        guesses={state.guesses}
        results={state.results}
        currentGuess={state.currentGuess}
      />

      {/* Keyboard */}
      <Keyboard onKeyPress={handleKeyPress} guessedLetters={guessedLetters} />

      {/* Message */}
      {message && (
        <div className="mt-4 px-4 py-2 bg-gray-100 rounded text-gray-700">
          {message}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex gap-4">
        {state.status !== "playing" && (
          <>
            <button
              onClick={handleShare}
              className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition-colors"
            >
              Share Results
            </button>
            <button
              onClick={handleNewGame}
              className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors"
            >
              New Game
            </button>
          </>
        )}
      </div>
    </div>
  );
}
