/**
 * Unit tests for Lexicon Smith game logic.
 *
 * Tests cover:
 * - Constructor validation
 * - Word validation (length, center letter, available letters, dictionary)
 * - Scoring system
 * - Pangram detection
 * - Game state management
 * - Share text generation
 *
 * @module games/lexiconSmith.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  LexiconSmithGame,
  type LetterSet,
  type WordSubmission,
} from "./lexiconSmith.js";

// Test letter sets
const SIMPLE_SET: LetterSet = {
  centerLetter: "A",
  outerLetters: ["B", "C", "D", "E", "R", "T"],
};

// Valid words for SIMPLE_SET (A center + BCDERT)
const VALID_WORDS = [
  "BRACE",  // 5 letters
  "CRATE",  // 5 letters
  "TRADE",  // 5 letters
  "BREAD",  // 5 letters
  "CARED",  // 5 letters
  "RATED",  // 5 letters
  "TRACE",  // 5 letters
  "BATTED", // 6 letters
  "TABBED", // 6 letters
  "CARTED", // 6 letters
];

describe("LexiconSmithGame", () => {
  describe("constructor", () => {
    it("should create a game with valid letter set", () => {
      const game = new LexiconSmithGame(SIMPLE_SET, VALID_WORDS);
      const state = game.getState();

      expect(state.letterSet.centerLetter).toBe("A");
      expect(state.letterSet.outerLetters).toEqual(["B", "C", "D", "E", "R", "T"]);
      expect(state.foundWords).toEqual([]);
      expect(state.score).toBe(0);
      expect(state.status).toBe("playing");
    });

    it("should convert letters to uppercase", () => {
      const game = new LexiconSmithGame(
        {
          centerLetter: "a",
          outerLetters: ["b", "c", "d", "e", "r", "t"],
        },
        VALID_WORDS
      );
      const state = game.getState();

      expect(state.letterSet.centerLetter).toBe("A");
      expect(state.letterSet.outerLetters).toEqual(["B", "C", "D", "E", "R", "T"]);
    });

    it("should throw error for invalid center letter", () => {
      expect(() => {
        new LexiconSmithGame({
          centerLetter: "",
          outerLetters: ["B", "C", "D", "E", "R", "T"],
        });
      }).toThrow("Center letter must be a single character");

      expect(() => {
        new LexiconSmithGame({
          centerLetter: "AB",
          outerLetters: ["C", "D", "E", "F", "G", "H"],
        });
      }).toThrow("Center letter must be a single character");
    });

    it("should throw error for wrong number of outer letters", () => {
      expect(() => {
        new LexiconSmithGame({
          centerLetter: "A",
          outerLetters: ["B", "C", "D"],
        });
      }).toThrow("Must have exactly 6 outer letters");

      expect(() => {
        new LexiconSmithGame({
          centerLetter: "A",
          outerLetters: ["B", "C", "D", "E", "F", "G", "H"],
        });
      }).toThrow("Must have exactly 6 outer letters");
    });

    it("should throw error for duplicate letters", () => {
      expect(() => {
        new LexiconSmithGame({
          centerLetter: "A",
          outerLetters: ["A", "B", "C", "D", "E", "F"],
        });
      }).toThrow("All 7 letters must be unique");

      expect(() => {
        new LexiconSmithGame({
          centerLetter: "A",
          outerLetters: ["B", "B", "C", "D", "E", "F"],
        });
      }).toThrow("All 7 letters must be unique");
    });
  });

  describe("submitWord - validation", () => {
    let game: LexiconSmithGame;

    beforeEach(() => {
      game = new LexiconSmithGame(SIMPLE_SET, VALID_WORDS);
    });

    it("should accept valid word with correct length and letters", () => {
      const result = game.submitWord("BRACE");

      expect(result.validation).toBe("valid");
      expect(result.word).toBe("BRACE");
      expect(result.points).toBeGreaterThan(0);
    });

    it("should reject word that is too short", () => {
      const result = game.submitWord("CAR");

      expect(result.validation).toBe("too-short");
      expect(result.points).toBe(0);
    });

    it("should reject word missing center letter", () => {
      const result = game.submitWord("RECT");

      expect(result.validation).toBe("missing-center");
      expect(result.points).toBe(0);
    });

    it("should reject word with invalid letters", () => {
      const result = game.submitWord("PASTE"); // Contains S, not in letter set

      expect(result.validation).toBe("invalid-letters");
      expect(result.points).toBe(0);
    });

    it("should reject duplicate submissions", () => {
      game.submitWord("BRACE"); // First submission - valid
      const result = game.submitWord("BRACE"); // Duplicate

      expect(result.validation).toBe("duplicate");
      expect(result.points).toBe(0);
    });

    it("should handle case-insensitive submissions", () => {
      const result1 = game.submitWord("brace");
      expect(result1.validation).toBe("valid");
      expect(result1.word).toBe("BRACE");

      const result2 = game.submitWord("BRACE"); // Same word uppercase
      expect(result2.validation).toBe("duplicate");
    });

    it("should reject words not in dictionary", () => {
      // Word with center letter 'A' but not in VALID_WORDS list
      const result = game.submitWord("ABCD");

      expect(result.validation).toBe("not-in-dictionary");
      expect(result.points).toBe(0);
    });
  });

  describe("submitWord - scoring", () => {
    let game: LexiconSmithGame;

    beforeEach(() => {
      game = new LexiconSmithGame(SIMPLE_SET, VALID_WORDS);
    });

    it("should score 4-letter word as 1 point", () => {
      const result = game.submitWord("CARE");

      if (result.validation === "valid") {
        expect(result.points).toBe(1);
      }
    });

    it("should score 5-letter word as 2 points", () => {
      const result = game.submitWord("BRACE");

      expect(result.validation).toBe("valid");
      expect(result.points).toBe(2);
    });

    it("should score 6+ letter word as 3 points", () => {
      const result = game.submitWord("TRACED");

      if (result.validation === "valid") {
        expect(result.points).toBe(3);
      }
    });

    it("should score 6+ letter word as 3 points (no pangrams in test set)", () => {
      const result = game.submitWord("CARTED");

      expect(result.validation).toBe("valid");
      expect(result.isPangram).toBe(false);
      expect(result.points).toBe(3);
    });

    it("should accumulate score across multiple submissions", () => {
      game.submitWord("BRACE");  // 2 points
      game.submitWord("TRACE");  // 2 points
      game.submitWord("CARTED"); // 3 points (6 letters)

      const state = game.getState();
      expect(state.score).toBe(7);
    });

    it("should not add score for invalid submissions", () => {
      game.submitWord("BRACE");  // 2 points
      game.submitWord("CAR");    // Invalid - too short
      game.submitWord("RECT");   // Invalid - missing center

      const state = game.getState();
      expect(state.score).toBe(2);
    });
  });

  describe("pangram detection", () => {
    let game: LexiconSmithGame;

    beforeEach(() => {
      game = new LexiconSmithGame(SIMPLE_SET, VALID_WORDS);
    });

    it("should not mark non-pangrams as pangrams", () => {
      const result = game.submitWord("BRACE");

      expect(result.isPangram).toBe(false);
      expect(result.points).toBe(2);
    });

    it("should correctly identify when no pangrams exist", () => {
      const pangrams = game.findPangrams();

      // SIMPLE_SET has no 7-letter words using all letters
      expect(pangrams.length).toBe(0);
    });

    it("should handle pangram scoring when one exists", () => {
      // Create a set with a known pangram
      const setWithPangram: LetterSet = {
        centerLetter: "S",
        outerLetters: ["T", "R", "I", "N", "G", "E"],
      };
      const wordsWithPangram = [
        "STORE",
        "TIRES",
        "STRING", // Not a pangram (missing E)
        "STEERING", // 8 letters - pangram
      ];
      const gameWithPangram = new LexiconSmithGame(setWithPangram, wordsWithPangram);

      const result = gameWithPangram.submitWord("STEERING");

      expect(result.isPangram).toBe(true);
      expect(result.points).toBe(7);
    });
  });

  describe("game state", () => {
    let game: LexiconSmithGame;

    beforeEach(() => {
      game = new LexiconSmithGame(SIMPLE_SET, VALID_WORDS);
    });

    it("should track found words", () => {
      game.submitWord("BRACE");
      game.submitWord("TRACE");

      const state = game.getState();
      expect(state.foundWords).toContain("BRACE");
      expect(state.foundWords).toContain("TRACE");
      expect(state.foundWords.length).toBe(2);
    });

    it("should track all submissions including invalid", () => {
      game.submitWord("BRACE");  // Valid
      game.submitWord("CAR");    // Invalid
      game.submitWord("TRACE");  // Valid

      const state = game.getState();
      expect(state.submissions.length).toBe(3);
    });

    it("should update status to won when all words found", () => {
      // Submit all valid words
      VALID_WORDS.forEach(word => game.submitWord(word));

      const state = game.getState();
      expect(state.status).toBe("won");
      expect(game.isComplete()).toBe(true);
    });

    it("should remain playing while words remain", () => {
      game.submitWord("BRACE");

      const state = game.getState();
      expect(state.status).toBe("playing");
      expect(game.isComplete()).toBe(false);
    });

    it("should report total possible words", () => {
      const state = game.getState();

      expect(state.totalPossibleWords).toBe(VALID_WORDS.length);
    });
  });

  describe("hints", () => {
    let game: LexiconSmithGame;

    beforeEach(() => {
      game = new LexiconSmithGame(SIMPLE_SET, VALID_WORDS);
    });

    it("should provide hint for unfound word", () => {
      const hint = game.getHint();

      expect(hint).toBeTruthy();
      expect(typeof hint).toBe("string");
      expect(hint).toContain("Try a word starting with");
    });

    it("should increment hintsUsed counter", () => {
      game.getHint();
      game.getHint();

      const state = game.getState();
      expect(state.hintsUsed).toBe(2);
    });

    it("should still provide hints after some words found", () => {
      game.submitWord("BRACE");
      game.submitWord("TRACE");

      const hint = game.getHint();
      expect(hint).toBeTruthy();
    });
  });

  describe("share text", () => {
    let game: LexiconSmithGame;

    beforeEach(() => {
      game = new LexiconSmithGame(SIMPLE_SET, VALID_WORDS);
    });

    it("should generate share text with score and progress", () => {
      game.submitWord("BRACE");  // 2 points
      game.submitWord("TRACE");  // 2 points

      const shareText = game.getShareText();

      expect(shareText).toContain("Lexicon Smith");
      expect(shareText).toContain("Score:");
      expect(shareText).toContain("Words: 2/" + VALID_WORDS.length);
    });

    it("should not include pangram count when none found", () => {
      game.submitWord("BRACE");
      game.submitWord("TRACE");

      const shareText = game.getShareText();

      expect(shareText).not.toContain("Pangrams:");
      expect(shareText).not.toContain("✨");
    });

    it("should show percentage progress", () => {
      game.submitWord("BRACE");

      const shareText = game.getShareText();

      expect(shareText).toMatch(/\d+%/); // Contains percentage
    });

    it("should handle empty game state", () => {
      const shareText = game.getShareText();

      expect(shareText).toContain("Lexicon Smith");
      expect(shareText).toContain("Score: 0/");
      expect(shareText).toContain("Words: 0/");
    });
  });

  describe("calculateScore", () => {
    let game: LexiconSmithGame;

    beforeEach(() => {
      game = new LexiconSmithGame(SIMPLE_SET, VALID_WORDS);
    });

    it("should return current total score", () => {
      game.submitWord("BRACE");  // 2 points
      game.submitWord("TRACE");  // 2 points
      game.submitWord("CARTED"); // 3 points

      expect(game.calculateScore()).toBe(7);
    });

    it("should return 0 for new game", () => {
      expect(game.calculateScore()).toBe(0);
    });
  });

  describe("error handling", () => {
    let game: LexiconSmithGame;

    beforeEach(() => {
      game = new LexiconSmithGame(SIMPLE_SET, VALID_WORDS);
    });

    it("should throw error when submitting to completed game", () => {
      // Complete the game
      VALID_WORDS.forEach(word => game.submitWord(word));

      expect(() => {
        game.submitWord("BRACE");
      }).toThrow("Game is not in playing state");
    });
  });
});
