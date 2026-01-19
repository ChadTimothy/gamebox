/**
 * Word Challenge game logic.
 *
 * Implements core game mechanics for a Wordle-style word guessing game:
 * - Guess validation and feedback generation
 * - Game state management
 * - Win/lose detection
 * - Share text generation
 *
 * @module games/wordChallenge
 */

import { isValidWord } from "../data/wordLists.js";

/**
 * Feedback type for each letter in a guess.
 * - correct: Letter is in the correct position (green)
 * - present: Letter is in the word but wrong position (yellow)
 * - absent: Letter is not in the word (gray)
 */
export type LetterFeedback = "correct" | "present" | "absent";

/**
 * Result for a single letter in a guess.
 */
export interface LetterResult {
  letter: string;
  feedback: LetterFeedback;
}

/**
 * Game status.
 */
export type GameStatus = "playing" | "won" | "lost";

/**
 * Complete game state.
 */
export interface GameState {
  word: string;
  guesses: string[];
  status: GameStatus;
  maxGuesses: number;
}

/**
 * Check a guess against the target word and return feedback.
 *
 * Algorithm:
 * 1. First pass: mark exact matches as 'correct'
 * 2. Build array of remaining letters from target
 * 3. Second pass: mark 'present' or 'absent' based on remaining letters
 *
 * This correctly handles duplicate letters.
 *
 * @param guess - The guessed word (uppercase)
 * @param target - The target word (uppercase)
 * @returns Array of letter results with feedback
 *
 * @example
 * ```ts
 * checkGuess("SPEED", "ERASE")
 * // Returns:
 * // [
 * //   { letter: 'S', feedback: 'absent' },
 * //   { letter: 'P', feedback: 'absent' },
 * //   { letter: 'E', feedback: 'present' },
 * //   { letter: 'E', feedback: 'present' },
 * //   { letter: 'D', feedback: 'absent' }
 * // ]
 * ```
 */
export function checkGuess(guess: string, target: string): LetterResult[] {
  const result: LetterResult[] = new Array(guess.length);
  const remainingTargetLetters: string[] = [];

  // First pass: mark exact matches as 'correct'
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = { letter: guess[i], feedback: "correct" };
    } else {
      // Not an exact match, add target letter to remaining pool
      remainingTargetLetters.push(target[i]);
    }
  }

  // Second pass: mark 'present' or 'absent'
  for (let i = 0; i < guess.length; i++) {
    // Skip letters already marked as correct
    if (result[i]) continue;

    const letter = guess[i];
    const indexInRemaining = remainingTargetLetters.indexOf(letter);

    if (indexInRemaining !== -1) {
      // Letter is present in remaining letters
      result[i] = { letter, feedback: "present" };
      // Remove this letter from remaining pool
      remainingTargetLetters.splice(indexInRemaining, 1);
    } else {
      // Letter is not in remaining letters
      result[i] = { letter, feedback: "absent" };
    }
  }

  return result;
}

/**
 * Generate shareable emoji grid for game results.
 *
 * Creates a text representation using emoji squares:
 * - 🟩 correct (green)
 * - 🟨 present (yellow)
 * - ⬜ absent (gray)
 *
 * @param guesses - Array of guesses made
 * @param target - The target word
 * @param maxGuesses - Maximum allowed guesses
 * @param won - Whether the game was won
 * @returns Shareable emoji text
 *
 * @example
 * ```ts
 * generateShareText(["CRANE", "TRACE"], "GRACE", 6, true)
 * // Returns:
 * // "Word Challenge 2/6\n\n⬜🟨⬜⬜🟩\n🟨🟩🟩🟩🟩"
 * ```
 */
export function generateShareText(
  guesses: string[],
  target: string,
  maxGuesses: number,
  won: boolean
): string {
  const emojiMap: Record<LetterFeedback, string> = {
    correct: "🟩",
    present: "🟨",
    absent: "⬜",
  };

  const title = won
    ? `Word Challenge ${guesses.length}/${maxGuesses}`
    : `Word Challenge X/${maxGuesses}`;

  const grid = guesses
    .map((guess) => {
      const result = checkGuess(guess, target);
      return result.map((r) => emojiMap[r.feedback]).join("");
    })
    .join("\n");

  return `${title}\n\n${grid}`;
}

/**
 * Word Challenge game instance.
 *
 * Manages game state and validates guesses.
 */
export class WordChallengeGame {
  private word: string;
  private guesses: string[] = [];
  private status: GameStatus = "playing";
  private readonly maxGuesses: number;

  constructor(word: string, maxGuesses: number = 6) {
    if (!word || word.length !== 5) {
      throw new Error("Word must be exactly 5 letters");
    }

    this.word = word.toUpperCase();
    this.maxGuesses = maxGuesses;
  }

  /**
   * Make a guess.
   *
   * @param guess - The guessed word
   * @returns Feedback for the guess
   * @throws Error if game is over or guess is invalid
   */
  makeGuess(guess: string): LetterResult[] {
    if (this.status !== "playing") {
      throw new Error(`Game is already ${this.status}`);
    }

    const normalizedGuess = guess.toUpperCase();

    if (normalizedGuess.length !== 5) {
      throw new Error("Guess must be exactly 5 letters");
    }

    if (!isValidWord(normalizedGuess)) {
      throw new Error("Not a valid word");
    }

    const result = checkGuess(normalizedGuess, this.word);
    this.guesses.push(normalizedGuess);

    // Check win condition
    if (normalizedGuess === this.word) {
      this.status = "won";
    }
    // Check lose condition
    else if (this.guesses.length >= this.maxGuesses) {
      this.status = "lost";
    }

    return result;
  }

  /**
   * Get current game state.
   */
  getState(): Readonly<GameState> {
    return {
      word: this.word,
      guesses: [...this.guesses],
      status: this.status,
      maxGuesses: this.maxGuesses,
    };
  }

  /**
   * Check if game is over.
   */
  isGameOver(): boolean {
    return this.status !== "playing";
  }

  /**
   * Get shareable result text.
   */
  getShareText(): string {
    return generateShareText(
      this.guesses,
      this.word,
      this.maxGuesses,
      this.status === "won"
    );
  }
}
