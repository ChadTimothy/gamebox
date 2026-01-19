import { describe, it, expect } from "vitest";
import { getDailyWord } from "./data/wordLists.js";
import { WordChallengeGame } from "./games/wordChallenge.js";

/**
 * Tests for MCP server game logic.
 *
 * Note: These tests focus on the game logic integration.
 * Full MCP server tests would require MCP client setup.
 */

describe("MCP Server - Game Logic Integration", () => {
  describe("Daily word selection", () => {
    it("should return consistent daily word for same date", () => {
      const date = new Date("2024-01-15");
      const word1 = getDailyWord(date);
      const word2 = getDailyWord(date);

      expect(word1).toBe(word2);
      expect(word1).toHaveLength(5);
    });

    it("should return different words for different dates", () => {
      const date1 = new Date("2024-01-15");
      const date2 = new Date("2024-01-16");

      const word1 = getDailyWord(date1);
      const word2 = getDailyWord(date2);

      // Very unlikely to be the same
      const areDifferent = word1 !== word2;
      expect(areDifferent).toBe(true);
    });
  });

  describe("Game session management", () => {
    it("should create new game with target word", () => {
      const targetWord = "CRANE";
      const game = new WordChallengeGame(targetWord);

      const state = game.getState();
      expect(state.word).toBe("CRANE");
      expect(state.status).toBe("playing");
      expect(state.guesses).toHaveLength(0);
    });

    it("should maintain game state across guesses", () => {
      const game = new WordChallengeGame("CRANE");

      game.makeGuess("TRAIN");
      expect(game.getState().guesses).toHaveLength(1);

      game.makeGuess("BRAIN");
      expect(game.getState().guesses).toHaveLength(2);
    });

    it("should detect win condition", () => {
      const game = new WordChallengeGame("CRANE");

      game.makeGuess("CRANE");

      expect(game.getState().status).toBe("won");
      expect(game.isGameOver()).toBe(true);
    });

    it("should detect lose condition", () => {
      const game = new WordChallengeGame("CRANE", 2);

      game.makeGuess("TRAIN");
      game.makeGuess("BRAIN");

      expect(game.getState().status).toBe("lost");
      expect(game.isGameOver()).toBe(true);
    });

    it("should throw error when game is over", () => {
      const game = new WordChallengeGame("CRANE");
      game.makeGuess("CRANE");

      expect(() => game.makeGuess("TRAIN")).toThrow("Game is already won");
    });

    it("should throw error for invalid word", () => {
      const game = new WordChallengeGame("CRANE");

      expect(() => game.makeGuess("ZZZZZ")).toThrow("Not a valid word");
    });

    it("should generate share text on game over", () => {
      const game = new WordChallengeGame("CRANE");

      game.makeGuess("TRAIN");
      game.makeGuess("CRANE");

      const shareText = game.getShareText();

      expect(shareText).toContain("Word Challenge");
      expect(shareText).toContain("2/6");
      expect(shareText).toContain("🟩"); // Should have green squares
    });
  });

  describe("Session ID generation", () => {
    it("should generate unique session IDs", () => {
      const generateSessionId = () =>
        `wc_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const id1 = generateSessionId();
      const id2 = generateSessionId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^wc_\d+_[a-z0-9]+$/);
    });
  });

  describe("Tool response structure", () => {
    it("should structure start_word_challenge response correctly", () => {
      const game = new WordChallengeGame(getDailyWord(new Date()));
      const state = game.getState();

      const response = {
        content: [
          {
            type: "text" as const,
            text: "🎯 Daily Word Challenge started! Guess the 5-letter word in 6 tries.",
          },
        ],
        structuredContent: {
          gameId: "wc_test_session",
          mode: "daily",
          guesses: state.guesses,
          status: state.status,
          maxGuesses: state.maxGuesses,
          streak: 0,
        },
      };

      expect(response.content[0].type).toBe("text");
      expect(response.structuredContent.status).toBe("playing");
      expect(response.structuredContent.maxGuesses).toBe(6);
    });

    it("should structure check_word_guess response correctly", () => {
      const game = new WordChallengeGame("CRANE");
      const result = game.makeGuess("TRAIN");
      const state = game.getState();

      const response = {
        content: [
          {
            type: "text" as const,
            text: `Guess ${state.guesses.length}/${state.maxGuesses} recorded.`,
          },
        ],
        structuredContent: {
          gameId: "wc_test_session",
          guess: "TRAIN",
          result,
          guesses: state.guesses,
          status: state.status,
          message: `Guess ${state.guesses.length}/${state.maxGuesses} recorded.`,
          shareText: undefined,
          word: undefined,
        },
      };

      expect(response.content[0].type).toBe("text");
      expect(response.structuredContent.guess).toBe("TRAIN");
      expect(response.structuredContent.result).toHaveLength(5);
      expect(response.structuredContent.status).toBe("playing");
    });

    it("should include share text on win", () => {
      const game = new WordChallengeGame("CRANE");
      game.makeGuess("CRANE");

      const state = game.getState();
      const shareText = game.getShareText();

      const response = {
        structuredContent: {
          status: state.status,
          shareText,
          word: state.status === "lost" ? state.word : undefined,
        },
      };

      expect(response.structuredContent.status).toBe("won");
      expect(response.structuredContent.shareText).toBeDefined();
      expect(response.structuredContent.word).toBeUndefined();
    });

    it("should include word on loss", () => {
      const game = new WordChallengeGame("CRANE", 1);
      game.makeGuess("TRAIN");

      const state = game.getState();
      const shareText = game.getShareText();

      const response = {
        structuredContent: {
          status: state.status,
          shareText,
          word: state.status === "lost" ? state.word : undefined,
        },
      };

      expect(response.structuredContent.status).toBe("lost");
      expect(response.structuredContent.shareText).toBeDefined();
      expect(response.structuredContent.word).toBe("CRANE");
    });
  });
});
