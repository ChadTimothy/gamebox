import { describe, it, expect } from "vitest";
import { WORD_LIST, VALID_GUESSES, isValidWord, getDailyWord } from "./wordLists.js";

describe("wordLists", () => {
  describe("WORD_LIST", () => {
    it("should contain exactly 2,315 words", () => {
      expect(WORD_LIST).toHaveLength(2315);
    });

    it("should contain only 5-letter words", () => {
      const invalidWords = WORD_LIST.filter((word) => word.length !== 5);
      expect(invalidWords).toHaveLength(0);
    });

    it("should contain only uppercase words", () => {
      const lowercaseWords = WORD_LIST.filter((word) => word !== word.toUpperCase());
      expect(lowercaseWords).toHaveLength(0);
    });

    it("should contain no duplicate words", () => {
      const uniqueWords = new Set(WORD_LIST);
      expect(uniqueWords.size).toBe(WORD_LIST.length);
    });

    it("should contain only alphabetic characters", () => {
      const nonAlphaWords = WORD_LIST.filter((word) => !/^[A-Z]+$/.test(word));
      expect(nonAlphaWords).toHaveLength(0);
    });

    it("should contain known Wordle words", () => {
      // Test a few known official Wordle answers
      expect(WORD_LIST).toContain("SCOWL");
      expect(WORD_LIST).toContain("WAGER");
      expect(WORD_LIST).toContain("CRANE");
      expect(WORD_LIST).toContain("HEART");
    });
  });

  describe("VALID_GUESSES", () => {
    it("should contain exactly 12,972 words", () => {
      expect(VALID_GUESSES).toHaveLength(12972);
    });

    it("should contain only 5-letter words", () => {
      const invalidWords = VALID_GUESSES.filter((word) => word.length !== 5);
      expect(invalidWords).toHaveLength(0);
    });

    it("should contain only uppercase words", () => {
      const lowercaseWords = VALID_GUESSES.filter((word) => word !== word.toUpperCase());
      expect(lowercaseWords).toHaveLength(0);
    });

    it("should contain no duplicate words", () => {
      const uniqueWords = new Set(VALID_GUESSES);
      expect(uniqueWords.size).toBe(VALID_GUESSES.length);
    });

    it("should contain only alphabetic characters", () => {
      const nonAlphaWords = VALID_GUESSES.filter((word) => !/^[A-Z]+$/.test(word));
      expect(nonAlphaWords).toHaveLength(0);
    });

    it("should include all WORD_LIST words", () => {
      const wordListSet = new Set(WORD_LIST);
      const validGuessesSet = new Set(VALID_GUESSES);

      const missingWords = WORD_LIST.filter((word) => !validGuessesSet.has(word));

      // All answer words should be valid guesses
      expect(missingWords).toHaveLength(0);
    });
  });

  describe("isValidWord", () => {
    it("should return true for words in VALID_GUESSES", () => {
      expect(isValidWord("CRANE")).toBe(true);
      expect(isValidWord("HEART")).toBe(true);
      expect(isValidWord("ALIEN")).toBe(true);
    });

    it("should return false for words not in VALID_GUESSES", () => {
      expect(isValidWord("ZZZZZ")).toBe(false);
      expect(isValidWord("XXXXX")).toBe(false);
      expect(isValidWord("ABCDE")).toBe(false);
    });

    it("should be case-insensitive", () => {
      // Assuming "CRANE" is in the list
      expect(isValidWord("crane")).toBe(true);
      expect(isValidWord("Crane")).toBe(true);
      expect(isValidWord("cRaNe")).toBe(true);
      expect(isValidWord("CRANE")).toBe(true);
    });

    it("should return false for invalid input", () => {
      expect(isValidWord("")).toBe(false);
      expect(isValidWord("TOO")).toBe(false);
      expect(isValidWord("TOOLONG")).toBe(false);
      expect(isValidWord("12345")).toBe(false);
    });
  });

  describe("getDailyWord", () => {
    it("should return a word from WORD_LIST", () => {
      const today = new Date();
      const word = getDailyWord(today);
      expect(WORD_LIST).toContain(word);
    });

    it("should return the same word for the same date", () => {
      const date1 = new Date("2024-01-15");
      const date2 = new Date("2024-01-15");

      const word1 = getDailyWord(date1);
      const word2 = getDailyWord(date2);

      expect(word1).toBe(word2);
    });

    it("should return different words for different dates", () => {
      const date1 = new Date("2024-01-15");
      const date2 = new Date("2024-01-16");
      const date3 = new Date("2024-01-17");

      const word1 = getDailyWord(date1);
      const word2 = getDailyWord(date2);
      const word3 = getDailyWord(date3);

      // At least one should be different (very unlikely all 3 are the same)
      const allSame = word1 === word2 && word2 === word3;
      expect(allSame).toBe(false);
    });

    it("should be deterministic across years", () => {
      const date1 = new Date("2024-06-15");
      const date2 = new Date("2024-06-15");

      const word1 = getDailyWord(date1);
      const word2 = getDailyWord(date2);

      expect(word1).toBe(word2);
    });

    it("should handle dates far in the past", () => {
      const oldDate = new Date("2000-01-01");
      const word = getDailyWord(oldDate);

      expect(word).toBeDefined();
      expect(WORD_LIST).toContain(word);
    });

    it("should handle dates far in the future", () => {
      const futureDate = new Date("2030-12-31");
      const word = getDailyWord(futureDate);

      expect(word).toBeDefined();
      expect(WORD_LIST).toContain(word);
    });

    it("should cycle through all words over time", () => {
      // Test that we get WORD_LIST.length unique words over WORD_LIST.length days
      const startDate = new Date("2024-01-01");
      const words = new Set<string>();

      for (let i = 0; i < WORD_LIST.length; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        words.add(getDailyWord(date));
      }

      // Should have WORD_LIST.length unique words
      expect(words.size).toBe(WORD_LIST.length);
    });
  });
});
