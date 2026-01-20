/**
 * Lexicon Smith game logic.
 *
 * Implements core game mechanics for a word-building puzzle:
 * - Word validation (length, center letter, available letters)
 * - Scoring system (length-based + pangrams)
 * - Hint generation
 * - Game state management
 * - Share text generation
 *
 * @module games/lexiconSmith
 */

import { isValidWord } from "../data/wordLists.js";

// Game constants
const MIN_WORD_LENGTH = 4;
const TOTAL_LETTERS = 7;
const OUTER_LETTERS = 6;
const PANGRAM_BONUS = 7;

/**
 * Word validation result types.
 */
export type WordValidation =
  | "valid"
  | "invalid"
  | "too-short"
  | "missing-center"
  | "duplicate"
  | "not-in-dictionary"
  | "invalid-letters";

/**
 * Set of 7 letters for the puzzle.
 */
export interface LetterSet {
  /** The required center letter (must appear in every word) */
  centerLetter: string;
  /** The 6 surrounding letters */
  outerLetters: readonly string[];
}

/**
 * Result of a word submission attempt.
 */
export interface WordSubmission {
  /** The submitted word (uppercase) */
  word: string;
  /** Validation result */
  validation: WordValidation;
  /** Points earned (0 if invalid) */
  points: number;
  /** Whether this word uses all 7 letters */
  isPangram: boolean;
}

/**
 * Game status.
 */
export type GameStatus = "playing" | "won" | "lost";

/**
 * Complete game state (immutable).
 */
export interface LexiconSmithGameState {
  /** The letter set for this puzzle */
  readonly letterSet: LetterSet;
  /** Successfully found words */
  readonly foundWords: readonly string[];
  /** All submission attempts (valid and invalid) */
  readonly submissions: readonly WordSubmission[];
  /** Current score */
  readonly score: number;
  /** Total possible words in solution */
  readonly totalPossibleWords: number;
  /** Current game status */
  readonly status: GameStatus;
  /** Number of hints used */
  readonly hintsUsed: number;
}

/**
 * Calculate score for a single word.
 *
 * Scoring:
 * - 4 letters: 1 point
 * - 5 letters: 2 points
 * - 6+ letters: 3 points
 * - Pangram (uses all 7 letters): 7 points
 *
 * @param word - The word to score
 * @param isPangram - Whether the word uses all 7 letters
 * @returns Point value
 */
function calculateWordScore(word: string, isPangram: boolean): number {
  if (isPangram) return PANGRAM_BONUS;
  if (word.length === 4) return 1;
  if (word.length === 5) return 2;
  return 3; // 6+ letters
}

/**
 * Lexicon Smith game class.
 *
 * Manages the state and logic for a single game session where players
 * build words from a set of 7 letters (1 center, 6 outer).
 */
export class LexiconSmithGame {
  private readonly letterSet: LetterSet;
  private readonly allLetters: Set<string>;
  private readonly possibleWords: Set<string>;
  private foundWords: Set<string>;
  private submissions: WordSubmission[];
  private score: number;
  private status: GameStatus;
  private hintsUsed: number;

  /**
   * Create a new Lexicon Smith game.
   *
   * @param letterSet - The letter set for this puzzle
   * @param wordList - Array of valid words (optional, defaults to dictionary)
   * @throws {Error} If letter set is invalid
   */
  constructor(letterSet: LetterSet, wordList?: string[]) {
    // Validate letter set
    if (!letterSet.centerLetter || letterSet.centerLetter.length !== 1) {
      throw new Error("Center letter must be a single character");
    }
    if (letterSet.outerLetters.length !== OUTER_LETTERS) {
      throw new Error(`Must have exactly ${OUTER_LETTERS} outer letters`);
    }

    // Ensure all letters are unique and uppercase
    const allLettersArray = [
      letterSet.centerLetter.toUpperCase(),
      ...letterSet.outerLetters.map((l) => l.toUpperCase()),
    ];
    const uniqueLetters = new Set(allLettersArray);
    if (uniqueLetters.size !== TOTAL_LETTERS) {
      throw new Error("All 7 letters must be unique");
    }

    this.letterSet = {
      centerLetter: letterSet.centerLetter.toUpperCase(),
      outerLetters: letterSet.outerLetters.map((l) => l.toUpperCase()),
    };
    this.allLetters = uniqueLetters;

    // Find all possible words from dictionary if no word list provided
    if (wordList) {
      this.possibleWords = new Set(wordList.map((w) => w.toUpperCase()));
    } else {
      this.possibleWords = this.findAllPossibleWords();
    }

    // Initialize game state
    this.foundWords = new Set();
    this.submissions = [];
    this.score = 0;
    this.status = "playing";
    this.hintsUsed = 0;
  }

  /**
   * Find all valid words that can be made from the letter set.
   *
   * A valid word must:
   * - Be at least 4 letters long
   * - Contain the center letter
   * - Only use letters from the available set
   *
   * @returns Set of valid words (uppercase)
   */
  private findAllPossibleWords(): Set<string> {
    const possibleWords = new Set<string>();

    // Note: In production, this should check against a comprehensive dictionary
    // For now, we'll rely on the validation during submission
    // This is a placeholder that would be populated by a word list loader

    return possibleWords;
  }

  /**
   * Validate a submitted word.
   *
   * Checks:
   * 1. Length (minimum 4 letters)
   * 2. Contains center letter
   * 3. Only uses available letters
   * 4. Is in dictionary
   * 5. Not already found
   *
   * @param word - The word to validate (any case)
   * @returns Validation result
   */
  private validateWord(word: string): WordValidation {
    const upperWord = word.toUpperCase();

    // Check length
    if (upperWord.length < MIN_WORD_LENGTH) {
      return "too-short";
    }

    // Check for center letter
    if (!upperWord.includes(this.letterSet.centerLetter)) {
      return "missing-center";
    }

    // Check if already found
    if (this.foundWords.has(upperWord)) {
      return "duplicate";
    }

    // Check if all letters are available
    const wordLetters = upperWord.split("");
    for (const letter of wordLetters) {
      if (!this.allLetters.has(letter)) {
        return "invalid-letters";
      }
    }

    // Check against possible words (if word list was provided)
    if (this.possibleWords.size > 0) {
      if (!this.possibleWords.has(upperWord)) {
        return "not-in-dictionary";
      }
    } else {
      // Fallback to general dictionary for 5-letter words
      // (Note: isValidWord only supports 5-letter words)
      if (upperWord.length === 5 && !isValidWord(upperWord)) {
        return "not-in-dictionary";
      }
    }

    return "valid";
  }

  /**
   * Check if a word is a pangram (uses all 7 letters).
   *
   * @param word - The word to check
   * @returns True if word uses all 7 letters
   */
  private isPangram(word: string): boolean {
    const upperWord = word.toUpperCase();
    const wordLetters = new Set(upperWord.split(""));
    return wordLetters.size === TOTAL_LETTERS &&
           Array.from(this.allLetters).every(l => wordLetters.has(l));
  }

  /**
   * Submit a word for validation and scoring.
   *
   * @param word - The word to submit
   * @returns Submission result with validation and points
   */
  submitWord(word: string): WordSubmission {
    if (this.status !== "playing") {
      throw new Error("Game is not in playing state");
    }

    const upperWord = word.toUpperCase();
    const validation = this.validateWord(upperWord);
    const isPangram = validation === "valid" && this.isPangram(upperWord);
    const points = validation === "valid" ? calculateWordScore(upperWord, isPangram) : 0;

    const submission: WordSubmission = {
      word: upperWord,
      validation,
      points,
      isPangram,
    };

    this.submissions.push(submission);

    // If valid, add to found words and update score
    if (validation === "valid") {
      this.foundWords.add(upperWord);
      this.score += points;

      // Check if all words found (win condition)
      if (this.possibleWords.size > 0 &&
          this.foundWords.size === this.possibleWords.size) {
        this.status = "won";
      }
    }

    return submission;
  }

  /**
   * Get a hint for the next word to find.
   *
   * Returns the first letter of an unfound word.
   *
   * @returns Hint string or null if no hints available
   */
  getHint(): string | null {
    if (this.possibleWords.size === 0) {
      return null;
    }

    // Find first unfound word
    for (const word of this.possibleWords) {
      if (!this.foundWords.has(word)) {
        this.hintsUsed++;
        return `Try a word starting with '${word[0]}'`;
      }
    }

    return null;
  }

  /**
   * Get all pangrams in the possible words set.
   *
   * @returns Array of pangram words
   */
  findPangrams(): string[] {
    return Array.from(this.possibleWords).filter(word => this.isPangram(word));
  }

  /**
   * Calculate current score from found words.
   *
   * @returns Total score
   */
  calculateScore(): number {
    return this.score;
  }

  /**
   * Check if the game is complete (all words found).
   *
   * @returns True if all possible words have been found
   */
  isComplete(): boolean {
    return this.status === "won" ||
           (this.possibleWords.size > 0 &&
            this.foundWords.size === this.possibleWords.size);
  }

  /**
   * Get current game state (immutable).
   *
   * @returns Current state
   */
  getState(): Readonly<LexiconSmithGameState> {
    return {
      letterSet: this.letterSet,
      foundWords: Array.from(this.foundWords),
      submissions: [...this.submissions],
      score: this.score,
      totalPossibleWords: this.possibleWords.size,
      status: this.status,
      hintsUsed: this.hintsUsed,
    };
  }

  /**
   * Generate share text for social media.
   *
   * Format:
   * ```
   * Lexicon Smith 🔤
   * Score: 42/100 (42%)
   * Words: 15/25
   * Pangrams: 2 ✨
   * ```
   *
   * @returns Formatted share text
   */
  getShareText(): string {
    const maxScore = this.possibleWords.size > 0
      ? Array.from(this.possibleWords).reduce(
          (sum, word) => sum + calculateWordScore(word, this.isPangram(word)),
          0
        )
      : 0;

    const percentage = maxScore > 0
      ? Math.round((this.score / maxScore) * 100)
      : 0;

    const pangrams = this.findPangrams().filter(p => this.foundWords.has(p));
    const pangramText = pangrams.length > 0
      ? `\nPangrams: ${pangrams.length} ✨`
      : "";

    return [
      "Lexicon Smith 🔤",
      `Score: ${this.score}/${maxScore} (${percentage}%)`,
      `Words: ${this.foundWords.size}/${this.possibleWords.size}`,
      pangramText,
    ]
      .filter(Boolean)
      .join("\n");
  }
}
