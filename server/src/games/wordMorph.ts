/**
 * Word Morph game logic.
 *
 * Implements core game mechanics for a word transformation puzzle:
 * - Guess validation and feedback generation
 * - Game state management
 * - Win/lose detection
 * - Share text generation
 *
 * @module games/wordMorph
 */

import { isValidWord } from "../data/wordLists.js";

// Game constants
const DEFAULT_MAX_GUESSES = 6;
const WORD_LENGTH = 5;

// Emoji characters for share text
const EMOJI_CORRECT = "\uD83D\uDFE9"; // Green square
const EMOJI_PRESENT = "\uD83D\uDFE8"; // Yellow square
const EMOJI_ABSENT = "\u2B1C"; // White square

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
 * Convert letter feedback to emoji.
 */
function feedbackToEmoji(feedback: LetterFeedback): string {
  switch (feedback) {
    case "correct":
      return EMOJI_CORRECT;
    case "present":
      return EMOJI_PRESENT;
    case "absent":
      return EMOJI_ABSENT;
  }
}

/**
 * Generate shareable emoji grid for game results.
 *
 * Creates a text representation using emoji squares:
 * - Green square: correct position
 * - Yellow square: present but wrong position
 * - White square: absent
 *
 * @param guesses - Array of guesses made
 * @param target - The target word
 * @param maxGuesses - Maximum allowed guesses
 * @param won - Whether the game was won
 * @returns Shareable emoji text
 */
export function generateShareText(
  guesses: string[],
  target: string,
  maxGuesses: number,
  won: boolean
): string {
  const scoreDisplay = won ? guesses.length.toString() : "X";
  const title = `Word Morph ${scoreDisplay}/${maxGuesses}`;

  const grid = guesses
    .map((guess) => {
      const result = checkGuess(guess, target);
      return result.map((r) => feedbackToEmoji(r.feedback)).join("");
    })
    .join("\n");

  return `${title}\n\n${grid}`;
}

/**
 * Word Morph game instance.
 *
 * Manages game state and validates guesses.
 */
export class WordMorphGame {
  private readonly word: string;
  private readonly maxGuesses: number;
  private guesses: string[] = [];
  private status: GameStatus = "playing";

  constructor(word: string, maxGuesses: number = DEFAULT_MAX_GUESSES) {
    if (!word || word.length !== WORD_LENGTH) {
      throw new Error(`Word must be exactly ${WORD_LENGTH} letters`);
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

    if (normalizedGuess.length !== WORD_LENGTH) {
      throw new Error(`Guess must be exactly ${WORD_LENGTH} letters`);
    }

    if (!isValidWord(normalizedGuess)) {
      throw new Error("Not a valid word");
    }

    const result = checkGuess(normalizedGuess, this.word);
    this.guesses.push(normalizedGuess);

    // Update game status
    if (normalizedGuess === this.word) {
      this.status = "won";
    } else if (this.guesses.length >= this.maxGuesses) {
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
