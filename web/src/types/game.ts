/**
 * Shared game types for GameBox widgets.
 *
 * This module contains common types used across multiple game widgets
 * to ensure consistency and reduce duplication.
 *
 * @module types/game
 */

/**
 * Letter feedback type for word-based games.
 *
 * Matches server-side LetterFeedback enum.
 *
 * - `correct`: Letter is in the correct position
 * - `present`: Letter is in the word but wrong position
 * - `absent`: Letter is not in the word
 * - `empty`: Tile has no letter yet
 */
export type LetterFeedback = "correct" | "present" | "absent" | "empty";

/**
 * Result for a single letter in a guess.
 *
 * Used by word-based games to represent individual letter feedback.
 */
export interface LetterResult {
  /** The letter character (A-Z) */
  letter: string;
  /** Feedback for this letter's correctness */
  feedback: LetterFeedback;
}

/**
 * Game status across all game types.
 *
 * - `playing`: Game is in progress
 * - `won`: Player has won the game
 * - `lost`: Player has lost/failed the game
 */
export type GameStatus = "playing" | "won" | "lost";

/**
 * Tool output structure from MCP server.
 *
 * Generic interface for game responses from backend MCP tools.
 * Individual games may extend this with game-specific fields.
 */
export interface ToolOutput {
  /** Unique game session ID */
  gameId?: string;
  /** The target word (revealed after game ends) */
  word?: string;
  /** Array of guesses made so far */
  guesses?: string[];
  /** Feedback array for the most recent guess */
  result?: LetterFeedback[];
  /** Current game status */
  status?: GameStatus;
  /** Current streak count (daily mode) */
  streak?: number;
  /** Maximum streak achieved */
  maxStreak?: number;
  /** Total games played by user */
  totalGamesPlayed?: number;
  /** Win rate percentage (0-100) */
  winRate?: number;
  /** Optional message from server (errors, hints, etc.) */
  message?: string;
}
