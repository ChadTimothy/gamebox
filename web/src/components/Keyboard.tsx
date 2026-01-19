/**
 * Reusable Keyboard component for word-based games.
 *
 * Provides an on-screen QWERTY keyboard with:
 * - Color-coded feedback for guessed letters
 * - Enter and Backspace special keys
 * - Visual feedback on press
 * - Responsive sizing
 *
 * @module components/Keyboard
 */

import type { LetterFeedback } from "../types/game.js";

/**
 * Standard QWERTY keyboard layout in 3 rows.
 */
export const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
] as const;

/**
 * Props for the Keyboard component.
 */
export interface KeyboardProps {
  /** Callback when a key is pressed */
  onKeyPress: (key: string) => void;
  /** Map of letters to their feedback (for color coding) */
  guessedLetters: Map<string, LetterFeedback>;
  /** Optional CSS class prefix for custom styling (default: "word-morph") */
  classPrefix?: string;
}

/**
 * Get Tailwind classes for keyboard key based on feedback.
 *
 * @param key - The key letter
 * @param feedback - Optional feedback for the key
 * @param classPrefix - CSS class prefix for game-specific colors
 * @returns Tailwind CSS classes
 */
function getKeyClasses(
  key: string,
  feedback: LetterFeedback | undefined,
  classPrefix: string
): string {
  // Special keys always use neutral colors
  if (key === "ENTER" || key === "BACKSPACE") {
    return "bg-gray-400 hover:bg-gray-500";
  }

  switch (feedback) {
    case "correct":
      return `${classPrefix}-key-correct`;
    case "present":
      return `${classPrefix}-key-present`;
    case "absent":
      return `${classPrefix}-key-absent`;
    default:
      return "bg-gray-300 hover:bg-gray-400";
  }
}

/**
 * Get display text for a keyboard key.
 *
 * @param key - The key identifier
 * @returns Display text (e.g., "⌫" for BACKSPACE)
 */
function getKeyDisplay(key: string): string {
  return key === "BACKSPACE" ? "\u232B" : key;
}

/**
 * Keyboard component - renders on-screen keyboard with color feedback.
 *
 * @example
 * ```tsx
 * <Keyboard
 *   onKeyPress={handleKeyPress}
 *   guessedLetters={letterFeedbackMap}
 *   classPrefix="word-morph"
 * />
 * ```
 */
export function Keyboard({
  onKeyPress,
  guessedLetters,
  classPrefix = "word-morph",
}: KeyboardProps): JSX.Element {
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
                ${getKeyClasses(key, guessedLetters.get(key), classPrefix)}
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
