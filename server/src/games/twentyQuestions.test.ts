/**
 * Unit tests for Twenty Questions game logic.
 *
 * Tests cover:
 * - Constructor validation
 * - Question asking and answering
 * - Guess validation and scoring
 * - Game state management
 * - Win/lose conditions
 * - Share text generation
 *
 * @module games/twentyQuestions.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  TwentyQuestionsGame,
  type GameMode,
  type AnswerType,
  type Category,
} from "./twentyQuestions.js";

describe("TwentyQuestionsGame", () => {
  describe("constructor", () => {
    it("should create a game in ai-guesses mode", () => {
      const game = new TwentyQuestionsGame("ai-guesses", "Eiffel Tower", "places");
      const state = game.getState();

      expect(state.mode).toBe("ai-guesses");
      expect(state.category).toBe("places");
      expect(state.target).toBeUndefined(); // Hidden in ai-guesses mode
      expect(state.questionAnswers).toEqual([]);
      expect(state.status).toBe("playing");
      expect(state.currentQuestionNumber).toBe(1);
      expect(state.maxQuestions).toBe(20);
    });

    it("should create a game in user-guesses mode", () => {
      const game = new TwentyQuestionsGame("user-guesses", "Abraham Lincoln", "people");
      const state = game.getState();

      expect(state.mode).toBe("user-guesses");
      expect(state.category).toBe("people");
      expect(state.target).toBe("Abraham Lincoln"); // Visible in user-guesses mode
      expect(state.status).toBe("playing");
    });

    it("should create a game without a category", () => {
      const game = new TwentyQuestionsGame("ai-guesses", "Pizza");
      const state = game.getState();

      expect(state.category).toBeUndefined();
      expect(state.target).toBeUndefined(); // Hidden in playing ai-guesses mode
    });

    it("should throw error for empty target", () => {
      expect(() => {
        new TwentyQuestionsGame("ai-guesses", "");
      }).toThrow("Target must be a non-empty string");
    });

    it("should throw error for whitespace-only target", () => {
      expect(() => {
        new TwentyQuestionsGame("user-guesses", "   ");
      }).toThrow("Target must be a non-empty string");
    });

    it("should trim target whitespace", () => {
      const game = new TwentyQuestionsGame("user-guesses", "  Paris  ");
      const state = game.getState();

      expect(state.target).toBe("Paris");
    });
  });

  describe("askQuestion", () => {
    let game: TwentyQuestionsGame;

    beforeEach(() => {
      game = new TwentyQuestionsGame("ai-guesses", "Paris", "places");
    });

    it("should record a question asked by AI", () => {
      game.askQuestion("Is it in Europe?", "ai");
      const state = game.getState();

      expect(state.questionAnswers).toHaveLength(1);
      expect(state.questionAnswers[0].question).toBe("Is it in Europe?");
      expect(state.questionAnswers[0].askedBy).toBe("ai");
      expect(state.questionAnswers[0].questionNumber).toBe(1);
      expect(state.questionAnswers[0].answer).toBeUndefined();
    });

    it("should record a question asked by user", () => {
      const userGame = new TwentyQuestionsGame("user-guesses", "Paris", "places");
      userGame.askQuestion("Is it a city?", "user");
      const state = userGame.getState();

      expect(state.questionAnswers[0].askedBy).toBe("user");
    });

    it("should trim question whitespace", () => {
      game.askQuestion("  Is it famous?  ", "ai");
      const state = game.getState();

      expect(state.questionAnswers[0].question).toBe("Is it famous?");
    });

    it("should throw error for question that is too short", () => {
      expect(() => {
        game.askQuestion("No", "ai");
      }).toThrow("Question must be at least 3 characters");
    });

    it("should throw error when game is over", () => {
      game.makeGuess("Paris");

      expect(() => {
        game.askQuestion("Is it old?", "ai");
      }).toThrow("Game is not in playing state");
    });

    it("should record timestamp for question", () => {
      const before = Date.now();
      game.askQuestion("Is it a landmark?", "ai");
      const after = Date.now();

      const state = game.getState();
      const timestamp = state.questionAnswers[0].timestamp;

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe("submitAnswer", () => {
    let game: TwentyQuestionsGame;

    beforeEach(() => {
      game = new TwentyQuestionsGame("ai-guesses", "Paris", "places");
    });

    it("should submit a 'yes' answer", () => {
      game.askQuestion("Is it in Europe?", "ai");
      game.submitAnswer("yes");

      const state = game.getState();
      expect(state.questionAnswers[0].answer).toBe("yes");
      expect(state.currentQuestionNumber).toBe(2);
    });

    it("should submit a 'no' answer", () => {
      game.askQuestion("Is it in Asia?", "ai");
      game.submitAnswer("no");

      const state = game.getState();
      expect(state.questionAnswers[0].answer).toBe("no");
    });

    it("should submit a 'maybe' answer", () => {
      game.askQuestion("Is it very old?", "ai");
      game.submitAnswer("maybe");

      const state = game.getState();
      expect(state.questionAnswers[0].answer).toBe("maybe");
    });

    it("should submit an 'unknown' answer", () => {
      game.askQuestion("Is it expensive?", "ai");
      game.submitAnswer("unknown");

      const state = game.getState();
      expect(state.questionAnswers[0].answer).toBe("unknown");
    });

    it("should throw error if no question to answer", () => {
      expect(() => {
        game.submitAnswer("yes");
      }).toThrow("No question to answer");
    });

    it("should throw error if last question already answered", () => {
      game.askQuestion("Is it in Europe?", "ai");
      game.submitAnswer("yes");

      expect(() => {
        game.submitAnswer("no");
      }).toThrow("Last question already has an answer");
    });

    it("should throw error when game is over", () => {
      game.askQuestion("Is it Paris?", "ai");
      game.makeGuess("Paris");

      expect(() => {
        game.submitAnswer("yes");
      }).toThrow("Game is not in playing state");
    });

    it("should increment question number after answer", () => {
      game.askQuestion("Question 1?", "ai");
      expect(game.getState().currentQuestionNumber).toBe(1);

      game.submitAnswer("yes");
      expect(game.getState().currentQuestionNumber).toBe(2);

      game.askQuestion("Question 2?", "ai");
      expect(game.getState().currentQuestionNumber).toBe(2);

      game.submitAnswer("no");
      expect(game.getState().currentQuestionNumber).toBe(3);
    });

    it("should set status to lost after 20 questions", () => {
      // Ask and answer 20 questions
      for (let i = 1; i <= 20; i++) {
        game.askQuestion(`Question ${i}?`, "ai");
        game.submitAnswer("no");
      }

      const state = game.getState();
      expect(state.status).toBe("lost");
      expect(state.currentQuestionNumber).toBe(21);
      expect(game.isGameOver()).toBe(true);
    });
  });

  describe("makeGuess", () => {
    let game: TwentyQuestionsGame;

    beforeEach(() => {
      game = new TwentyQuestionsGame("ai-guesses", "Paris", "places");
    });

    it("should accept correct guess", () => {
      game.askQuestion("Is it Paris?", "ai");
      const result = game.makeGuess("Paris");

      expect(result.correct).toBe(true);
      expect(result.target).toBe("Paris");
      expect(result.wasAI).toBe(true); // ai-guesses mode
      expect(result.status).toBe("won");
      expect(game.getState().status).toBe("won");
    });

    it("should handle case-insensitive guess", () => {
      const result = game.makeGuess("PARIS");

      expect(result.correct).toBe(true);
    });

    it("should trim guess whitespace", () => {
      const result = game.makeGuess("  Paris  ");

      expect(result.correct).toBe(true);
    });

    it("should reject incorrect guess", () => {
      const result = game.makeGuess("London");

      expect(result.correct).toBe(false);
      expect(result.target).toBe("Paris");
      expect(result.status).toBe("lost");
      expect(game.getState().status).toBe("lost");
    });

    it("should indicate wasAI false in user-guesses mode", () => {
      const userGame = new TwentyQuestionsGame("user-guesses", "Paris", "places");
      const result = userGame.makeGuess("Paris");

      expect(result.wasAI).toBe(false);
    });

    it("should throw error when game is over", () => {
      game.makeGuess("Paris");

      expect(() => {
        game.makeGuess("London");
      }).toThrow("Game is not in playing state");
    });

    it("should reveal target after guess", () => {
      const result = game.makeGuess("London");

      expect(result.target).toBe("Paris");
    });
  });

  describe("game state", () => {
    it("should track multiple question-answer pairs", () => {
      const game = new TwentyQuestionsGame("ai-guesses", "Paris", "places");

      game.askQuestion("Is it in Europe?", "ai");
      game.submitAnswer("yes");

      game.askQuestion("Is it a capital?", "ai");
      game.submitAnswer("yes");

      game.askQuestion("Is it Paris?", "ai");
      game.submitAnswer("yes");

      const state = game.getState();

      expect(state.questionAnswers).toHaveLength(3);
      expect(state.questionAnswers[0].question).toBe("Is it in Europe?");
      expect(state.questionAnswers[0].answer).toBe("yes");
      expect(state.questionAnswers[1].question).toBe("Is it a capital?");
      expect(state.questionAnswers[2].question).toBe("Is it Paris?");
    });

    it("should reveal target after game ends (ai-guesses mode)", () => {
      const game = new TwentyQuestionsGame("ai-guesses", "Paris", "places");

      // Target hidden while playing
      expect(game.getState().target).toBeUndefined();

      game.makeGuess("Paris");

      // Target revealed after game ends
      expect(game.getState().target).toBe("Paris");
    });

    it("should always show target in user-guesses mode", () => {
      const game = new TwentyQuestionsGame("user-guesses", "Paris", "places");

      // Target visible while playing
      expect(game.getState().target).toBe("Paris");

      game.makeGuess("Paris");

      // Target still visible after game ends
      expect(game.getState().target).toBe("Paris");
    });

    it("should maintain correct question numbering", () => {
      const game = new TwentyQuestionsGame("ai-guesses", "Paris", "places");

      for (let i = 1; i <= 5; i++) {
        game.askQuestion(`Question ${i}`, "ai");
        game.submitAnswer("no");
      }

      const state = game.getState();

      state.questionAnswers.forEach((qa, index) => {
        expect(qa.questionNumber).toBe(index + 1);
      });
    });
  });

  describe("helper methods", () => {
    let game: TwentyQuestionsGame;

    beforeEach(() => {
      game = new TwentyQuestionsGame("ai-guesses", "Paris", "places");
    });

    it("should get question count", () => {
      expect(game.getQuestionCount()).toBe(0);

      game.askQuestion("Question 1?", "ai");
      expect(game.getQuestionCount()).toBe(1);

      game.submitAnswer("yes");
      game.askQuestion("Question 2?", "ai");
      expect(game.getQuestionCount()).toBe(2);
    });

    it("should get questions remaining", () => {
      expect(game.getQuestionsRemaining()).toBe(20);

      game.askQuestion("Question 1?", "ai");
      game.submitAnswer("yes");
      expect(game.getQuestionsRemaining()).toBe(19);

      // Ask and answer 18 more questions (total 19)
      for (let i = 0; i < 18; i++) {
        game.askQuestion(`Question ${i + 2}?`, "ai");
        game.submitAnswer("no");
      }

      expect(game.getQuestionsRemaining()).toBe(1);

      // Last question
      game.askQuestion("Question 20?", "ai");
      game.submitAnswer("no");

      expect(game.getQuestionsRemaining()).toBe(0);
    });

    it("should check if game is over", () => {
      expect(game.isGameOver()).toBe(false);

      game.makeGuess("Paris");

      expect(game.isGameOver()).toBe(true);
    });
  });

  describe("share text", () => {
    it("should generate share text for won AI game", () => {
      const game = new TwentyQuestionsGame("ai-guesses", "Paris", "places");

      game.askQuestion("Is it in Europe?", "ai");
      game.submitAnswer("yes");
      game.askQuestion("Is it Paris?", "ai");
      game.submitAnswer("yes");
      game.makeGuess("Paris");

      const shareText = game.getShareText();

      expect(shareText).toContain("Twenty Questions");
      expect(shareText).toContain("Mode: AI Guesses");
      expect(shareText).toContain("Won in 2 questions");
      expect(shareText).toContain("Target: Paris");
      expect(shareText).toContain("Category: places");
    });

    it("should generate share text for lost user game", () => {
      const game = new TwentyQuestionsGame("user-guesses", "Eiffel Tower", "places");

      game.askQuestion("Is it a person?", "user");
      game.submitAnswer("no");
      game.makeGuess("Statue of Liberty");

      const shareText = game.getShareText();

      expect(shareText).toContain("Mode: I Guess");
      expect(shareText).toContain("Lost (1 questions)");
      expect(shareText).toContain("Target: Eiffel Tower");
    });

    it("should generate share text without category", () => {
      const game = new TwentyQuestionsGame("ai-guesses", "Pizza");

      game.makeGuess("Pizza");

      const shareText = game.getShareText();

      expect(shareText).not.toContain("Category:");
    });

    it("should handle empty game (immediate guess)", () => {
      const game = new TwentyQuestionsGame("ai-guesses", "Paris");

      game.makeGuess("Paris");

      const shareText = game.getShareText();

      expect(shareText).toContain("Won in 0 questions");
    });
  });

  describe("edge cases", () => {
    it("should handle 20 questions exactly", () => {
      const game = new TwentyQuestionsGame("ai-guesses", "Paris", "places");

      // Ask exactly 20 questions
      for (let i = 1; i <= 20; i++) {
        game.askQuestion(`Question ${i}?`, "ai");
        game.submitAnswer("no");
      }

      expect(game.getState().status).toBe("lost");
      expect(game.getQuestionCount()).toBe(20);
      expect(game.isGameOver()).toBe(true);
    });

    it("should handle guess before any questions", () => {
      const game = new TwentyQuestionsGame("ai-guesses", "Paris", "places");

      const result = game.makeGuess("Paris");

      expect(result.correct).toBe(true);
      expect(game.getQuestionCount()).toBe(0);
    });

    it("should handle mixed question asking (AI and user)", () => {
      const game = new TwentyQuestionsGame("ai-guesses", "Paris", "places");

      game.askQuestion("Is it in Europe?", "ai");
      game.submitAnswer("yes");

      game.askQuestion("Random user question", "user");
      game.submitAnswer("maybe");

      const state = game.getState();

      expect(state.questionAnswers[0].askedBy).toBe("ai");
      expect(state.questionAnswers[1].askedBy).toBe("user");
    });
  });
});
