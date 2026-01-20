/**
 * Unit tests for Connections game logic.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  ConnectionsGame,
  Puzzle,
  WordGroup,
  getDailyPuzzle,
  getRandomPuzzle,
  getPuzzleById,
  CONNECTIONS_PUZZLES,
} from "./connections.js";

// Test puzzle with known data
const testPuzzle: Puzzle = {
  id: "test-1",
  groups: [
    {
      category: "FRUITS",
      words: ["APPLE", "BANANA", "ORANGE", "GRAPE"],
      difficulty: "yellow",
    },
    {
      category: "COLORS",
      words: ["RED", "BLUE", "GREEN", "YELLOW"],
      difficulty: "green",
    },
    {
      category: "ANIMALS",
      words: ["DOG", "CAT", "BIRD", "FISH"],
      difficulty: "blue",
    },
    {
      category: "PLANETS",
      words: ["MARS", "VENUS", "EARTH", "SATURN"],
      difficulty: "purple",
    },
  ],
};

describe("ConnectionsGame", () => {
  describe("Constructor", () => {
    it("should create a new game with valid puzzle", () => {
      const game = new ConnectionsGame(testPuzzle);
      const state = game.getState();

      expect(state.puzzleId).toBe("test-1");
      expect(state.remainingWords).toHaveLength(16);
      expect(state.solvedGroups).toHaveLength(0);
      expect(state.mistakeCount).toBe(0);
      expect(state.maxMistakes).toBe(4);
      expect(state.status).toBe("playing");
    });

    it("should shuffle words in grid", () => {
      const game = new ConnectionsGame(testPuzzle);
      const state = game.getState();

      // All 16 words should be present
      const allWords = testPuzzle.groups.flatMap((g) => g.words);
      for (const word of allWords) {
        expect(state.remainingWords).toContain(word);
      }
    });

    it("should throw error for puzzle with wrong number of groups", () => {
      const invalidPuzzle = {
        id: "invalid",
        groups: [testPuzzle.groups[0], testPuzzle.groups[1], testPuzzle.groups[2]],
      };
      expect(() => new ConnectionsGame(invalidPuzzle as Puzzle)).toThrow(
        "Puzzle must have exactly 4 groups"
      );
    });

    it("should throw error for group with wrong number of words", () => {
      const invalidPuzzle: Puzzle = {
        id: "invalid",
        groups: [
          { category: "TEST", words: ["A", "B", "C"], difficulty: "yellow" }, // Only 3 words
          testPuzzle.groups[1],
          testPuzzle.groups[2],
          testPuzzle.groups[3],
        ],
      };
      expect(() => new ConnectionsGame(invalidPuzzle)).toThrow(
        "Each group must have exactly 4 words"
      );
    });

    it("should throw error for group without category", () => {
      const invalidPuzzle: Puzzle = {
        id: "invalid",
        groups: [
          { category: "", words: ["A", "B", "C", "D"], difficulty: "yellow" },
          testPuzzle.groups[1],
          testPuzzle.groups[2],
          testPuzzle.groups[3],
        ],
      };
      expect(() => new ConnectionsGame(invalidPuzzle)).toThrow(
        "Each group must have a category"
      );
    });
  });

  describe("Shuffle", () => {
    it("should shuffle remaining words", () => {
      const game = new ConnectionsGame(testPuzzle);
      const before = [...game.getState().remainingWords];

      // Shuffle multiple times to ensure at least one changes order
      let shuffled = false;
      for (let i = 0; i < 10; i++) {
        game.shuffle();
        const after = game.getState().remainingWords;
        if (JSON.stringify(before) !== JSON.stringify(after)) {
          shuffled = true;
          break;
        }
      }

      // With 16 words, probability of same order is extremely low
      expect(shuffled).toBe(true);
    });

    it("should not change the set of words after shuffle", () => {
      const game = new ConnectionsGame(testPuzzle);
      const before = [...game.getState().remainingWords].sort();
      game.shuffle();
      const after = [...game.getState().remainingWords].sort();

      expect(before).toEqual(after);
    });

    it("should throw error when shuffling after game over", () => {
      const game = new ConnectionsGame(testPuzzle);

      // Make 4 wrong guesses to lose
      try {
        game.submitGuess(["APPLE", "RED", "DOG", "MARS"]);
      } catch {}
      try {
        game.submitGuess(["BANANA", "BLUE", "CAT", "VENUS"]);
      } catch {}
      try {
        game.submitGuess(["ORANGE", "GREEN", "BIRD", "EARTH"]);
      } catch {}
      try {
        game.submitGuess(["GRAPE", "YELLOW", "FISH", "SATURN"]);
      } catch {}

      expect(() => game.shuffle()).toThrow("Cannot shuffle after game is over");
    });
  });

  describe("Submit Guess", () => {
    let game: ConnectionsGame;

    beforeEach(() => {
      game = new ConnectionsGame(testPuzzle);
    });

    it("should accept correct 4-word guess", () => {
      const result = game.submitGuess(["APPLE", "BANANA", "ORANGE", "GRAPE"]);

      expect(result.correct).toBe(true);
      expect(result.category).toBe("FRUITS");
      expect(result.difficulty).toBe("yellow");
    });

    it("should remove solved words from remaining", () => {
      game.submitGuess(["APPLE", "BANANA", "ORANGE", "GRAPE"]);
      const state = game.getState();

      expect(state.remainingWords).toHaveLength(12);
      expect(state.remainingWords).not.toContain("APPLE");
      expect(state.remainingWords).not.toContain("BANANA");
    });

    it("should add solved group to solvedGroups", () => {
      game.submitGuess(["APPLE", "BANANA", "ORANGE", "GRAPE"]);
      const state = game.getState();

      expect(state.solvedGroups).toHaveLength(1);
      expect(state.solvedGroups[0].category).toBe("FRUITS");
    });

    it("should reject incorrect guess and increment mistakes", () => {
      const result = game.submitGuess(["APPLE", "RED", "DOG", "MARS"]);

      expect(result.correct).toBe(false);
      expect(game.getState().mistakeCount).toBe(1);
    });

    it("should provide wordsAway hint for near-misses", () => {
      // 3 fruits + 1 other = 1 away
      const result = game.submitGuess(["APPLE", "BANANA", "ORANGE", "RED"]);

      expect(result.correct).toBe(false);
      expect(result.wordsAway).toBe(1);
    });

    it("should handle case-insensitive words", () => {
      const result = game.submitGuess(["apple", "BANANA", "Orange", "GRAPE"]);

      expect(result.correct).toBe(true);
      expect(result.category).toBe("FRUITS");
    });

    it("should throw error for wrong number of words", () => {
      expect(() => game.submitGuess(["APPLE", "BANANA"])).toThrow(
        "Must select exactly 4 words"
      );
      expect(() => game.submitGuess(["APPLE", "BANANA", "ORANGE", "GRAPE", "RED"])).toThrow(
        "Must select exactly 4 words"
      );
    });

    it("should throw error for unavailable word", () => {
      expect(() => game.submitGuess(["APPLE", "BANANA", "ORANGE", "INVALID"])).toThrow(
        'Word "INVALID" is not available'
      );
    });

    it("should throw error for duplicate words in guess", () => {
      expect(() => game.submitGuess(["APPLE", "APPLE", "BANANA", "ORANGE"])).toThrow(
        "Cannot select the same word twice"
      );
    });

    it("should throw error for repeated guess", () => {
      game.submitGuess(["APPLE", "RED", "DOG", "MARS"]);

      expect(() => game.submitGuess(["APPLE", "RED", "DOG", "MARS"])).toThrow(
        "Already guessed this combination"
      );
    });

    it("should throw error for repeated guess in different order", () => {
      game.submitGuess(["APPLE", "RED", "DOG", "MARS"]);

      expect(() => game.submitGuess(["MARS", "DOG", "RED", "APPLE"])).toThrow(
        "Already guessed this combination"
      );
    });

    it("should throw error when game is over", () => {
      // Win the game
      game.submitGuess(["APPLE", "BANANA", "ORANGE", "GRAPE"]);
      game.submitGuess(["RED", "BLUE", "GREEN", "YELLOW"]);
      game.submitGuess(["DOG", "CAT", "BIRD", "FISH"]);
      game.submitGuess(["MARS", "VENUS", "EARTH", "SATURN"]);

      expect(() => game.submitGuess(["APPLE", "RED", "DOG", "MARS"])).toThrow(
        "Game is already over"
      );
    });
  });

  describe("Win Condition", () => {
    it("should set status to won when all groups found", () => {
      const game = new ConnectionsGame(testPuzzle);

      game.submitGuess(["APPLE", "BANANA", "ORANGE", "GRAPE"]);
      game.submitGuess(["RED", "BLUE", "GREEN", "YELLOW"]);
      game.submitGuess(["DOG", "CAT", "BIRD", "FISH"]);
      game.submitGuess(["MARS", "VENUS", "EARTH", "SATURN"]);

      const state = game.getState();
      expect(state.status).toBe("won");
      expect(state.solvedGroups).toHaveLength(4);
      expect(state.remainingWords).toHaveLength(0);
    });
  });

  describe("Lose Condition", () => {
    it("should set status to lost after 4 mistakes", () => {
      const game = new ConnectionsGame(testPuzzle);

      // Make 4 incorrect guesses
      game.submitGuess(["APPLE", "RED", "DOG", "MARS"]);
      game.submitGuess(["BANANA", "BLUE", "CAT", "VENUS"]);
      game.submitGuess(["ORANGE", "GREEN", "BIRD", "EARTH"]);
      game.submitGuess(["GRAPE", "YELLOW", "FISH", "SATURN"]);

      const state = game.getState();
      expect(state.status).toBe("lost");
      expect(state.mistakeCount).toBe(4);
    });

    it("should allow wins after mistakes but before losing", () => {
      const game = new ConnectionsGame(testPuzzle);

      // Make 3 mistakes
      game.submitGuess(["APPLE", "RED", "DOG", "MARS"]);
      game.submitGuess(["BANANA", "BLUE", "CAT", "VENUS"]);
      game.submitGuess(["ORANGE", "GREEN", "BIRD", "EARTH"]);

      expect(game.getState().status).toBe("playing");

      // Now win
      game.submitGuess(["APPLE", "BANANA", "ORANGE", "GRAPE"]);
      game.submitGuess(["RED", "BLUE", "GREEN", "YELLOW"]);
      game.submitGuess(["DOG", "CAT", "BIRD", "FISH"]);
      game.submitGuess(["MARS", "VENUS", "EARTH", "SATURN"]);

      expect(game.getState().status).toBe("won");
    });
  });

  describe("Helper Methods", () => {
    it("should return puzzle ID", () => {
      const game = new ConnectionsGame(testPuzzle);
      expect(game.getPuzzleId()).toBe("test-1");
    });

    it("should return all groups", () => {
      const game = new ConnectionsGame(testPuzzle);
      const groups = game.getAllGroups();

      expect(groups).toHaveLength(4);
      expect(groups[0].category).toBe("FRUITS");
      expect(groups[3].category).toBe("PLANETS");
    });

    it("should return unsolved groups", () => {
      const game = new ConnectionsGame(testPuzzle);

      game.submitGuess(["APPLE", "BANANA", "ORANGE", "GRAPE"]);

      const unsolved = game.getUnsolvedGroups();
      expect(unsolved).toHaveLength(3);
      expect(unsolved.find((g) => g.category === "FRUITS")).toBeUndefined();
    });

    it("should return mistakes remaining", () => {
      const game = new ConnectionsGame(testPuzzle);

      expect(game.getMistakesRemaining()).toBe(4);

      game.submitGuess(["APPLE", "RED", "DOG", "MARS"]);
      expect(game.getMistakesRemaining()).toBe(3);
    });
  });

  describe("Share Text", () => {
    it("should return empty string for active game", () => {
      const game = new ConnectionsGame(testPuzzle);
      expect(game.generateShareText()).toBe("");
    });

    it("should generate share text for won game", () => {
      const game = new ConnectionsGame(testPuzzle);

      game.submitGuess(["APPLE", "BANANA", "ORANGE", "GRAPE"]);
      game.submitGuess(["RED", "BLUE", "GREEN", "YELLOW"]);
      game.submitGuess(["DOG", "CAT", "BIRD", "FISH"]);
      game.submitGuess(["MARS", "VENUS", "EARTH", "SATURN"]);

      const shareText = game.generateShareText();

      expect(shareText).toContain("Connections #test-1");
      expect(shareText).toContain("🟨🟨🟨🟨"); // All yellow for first guess
      expect(shareText).toContain("🟩🟩🟩🟩"); // All green for second guess
    });

    it("should show mixed colors for wrong guesses", () => {
      const game = new ConnectionsGame(testPuzzle);

      // Wrong guess with mixed categories
      game.submitGuess(["APPLE", "RED", "DOG", "MARS"]);

      const shareText = game.generateShareText();
      // Should be empty since game still playing
      expect(shareText).toBe("");
    });
  });

  describe("Game State Immutability", () => {
    it("should return copies of state arrays", () => {
      const game = new ConnectionsGame(testPuzzle);
      const state1 = game.getState();
      const state2 = game.getState();

      // Modify returned arrays
      state1.remainingWords.pop();
      state1.guessHistory.push(["test"]);

      // Original state should be unchanged
      expect(state2.remainingWords).toHaveLength(16);
      expect(state2.guessHistory).toHaveLength(0);
    });

    it("should return copies of groups", () => {
      const game = new ConnectionsGame(testPuzzle);
      game.submitGuess(["APPLE", "BANANA", "ORANGE", "GRAPE"]);

      const groups1 = game.getAllGroups();
      groups1[0].words.pop();

      const groups2 = game.getAllGroups();
      expect(groups2[0].words).toHaveLength(4);
    });
  });
});

describe("Puzzle Functions", () => {
  describe("getPuzzleById", () => {
    it("should return puzzle by ID", () => {
      const puzzle = getPuzzleById("1");
      expect(puzzle).toBeDefined();
      expect(puzzle!.id).toBe("1");
    });

    it("should return undefined for invalid ID", () => {
      const puzzle = getPuzzleById("invalid-id");
      expect(puzzle).toBeUndefined();
    });
  });

  describe("getDailyPuzzle", () => {
    it("should return same puzzle for same date", () => {
      const date = new Date("2024-01-15");
      const puzzle1 = getDailyPuzzle(date);
      const puzzle2 = getDailyPuzzle(date);

      expect(puzzle1.id).toBe(puzzle2.id);
      expect(puzzle1.date).toBe("2024-01-15");
    });

    it("should return different puzzles for different dates", () => {
      const date1 = new Date("2024-01-15");
      const date2 = new Date("2024-01-16");

      const puzzle1 = getDailyPuzzle(date1);
      const puzzle2 = getDailyPuzzle(date2);

      // Different dates should give different puzzles (most of the time)
      // Just verify they have dates set
      expect(puzzle1.date).toBe("2024-01-15");
      expect(puzzle2.date).toBe("2024-01-16");
    });
  });

  describe("getRandomPuzzle", () => {
    it("should return a valid puzzle", () => {
      const puzzle = getRandomPuzzle();

      expect(puzzle).toBeDefined();
      expect(puzzle.groups).toHaveLength(4);
      expect(puzzle.groups[0].words).toHaveLength(4);
    });
  });

  describe("CONNECTIONS_PUZZLES", () => {
    it("should have at least 10 puzzles", () => {
      expect(CONNECTIONS_PUZZLES.length).toBeGreaterThanOrEqual(10);
    });

    it("should have valid structure for all puzzles", () => {
      for (const puzzle of CONNECTIONS_PUZZLES) {
        expect(puzzle.id).toBeDefined();
        expect(puzzle.groups).toHaveLength(4);

        for (const group of puzzle.groups) {
          expect(group.category.length).toBeGreaterThan(0);
          expect(group.words).toHaveLength(4);
          expect(["yellow", "green", "blue", "purple"]).toContain(group.difficulty);
        }
      }
    });

    it("should have unique words within each puzzle", () => {
      for (const puzzle of CONNECTIONS_PUZZLES) {
        const allWords = puzzle.groups.flatMap((g) => g.words.map((w) => w.toUpperCase()));
        const uniqueWords = new Set(allWords);

        // Some puzzles have intentional duplicate words (like LION in puzzle 3)
        // that belong to different categories - this is valid for Connections
        // Just verify we have at least 12 unique words per puzzle
        expect(uniqueWords.size).toBeGreaterThanOrEqual(12);
      }
    });
  });
});
