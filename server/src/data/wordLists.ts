/**
 * Word lists for Word Challenge game.
 *
 * Contains curated word lists for a Wordle-style word guessing game:
 * - WORD_LIST: Common 5-letter words used as daily answers (~2,300 words)
 * - VALID_GUESSES: All valid 5-letter English words (~10,600+ words)
 *
 * @module data/wordLists
 */

// TODO: Implement word lists
export const WORD_LIST: readonly string[] = [];
export const VALID_GUESSES: readonly string[] = [];

/**
 * Check if a word is valid for guessing.
 */
export function isValidWord(word: string): boolean {
  // TODO: Implement validation
  return false;
}

/**
 * Get the daily word for a given date.
 */
export function getDailyWord(date: Date): string {
  // TODO: Implement daily word selection
  return "";
}
