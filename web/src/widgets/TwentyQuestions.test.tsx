import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { TwentyQuestions } from "./TwentyQuestions.js";

// Create a mock state that can be controlled per test
let mockState: any = null;
let mockSetState: any = null;

// Mock useWidgetState hook - returns controlled state for testing
vi.mock("../hooks/useWidgetState.js", () => ({
  useWidgetState: <T,>(defaultState: T) => {
    if (mockState !== null) {
      // Use the manually set mock state
      return [mockState, mockSetState];
    }
    // Otherwise use default useState behavior
    return useState(defaultState);
  },
}));

// Mock useOpenAiGlobal hook - returns undefined (no tool output)
vi.mock("../hooks/useOpenAiGlobal.js", () => ({
  useOpenAiGlobal: () => undefined,
}));

describe("TwentyQuestions Widget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state before each test
    mockState = null;
    mockSetState = vi.fn();
  });

  describe("Initial State (No Game)", () => {
    it("should render the game title", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText("Twenty Questions 🎯")).toBeInTheDocument();
    });

    it("should show prompt to start game when no game is active", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText("Ask me to start a game of 20 Questions!")).toBeInTheDocument();
    });

    it("should show mode descriptions", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText(/AI Guesses mode:/)).toBeInTheDocument();
      expect(screen.getByText(/User Guesses mode:/)).toBeInTheDocument();
    });
  });

  describe("Active Game State - AI Guesses Mode", () => {
    beforeEach(() => {
      mockState = {
        gameId: "tq_123_test",
        mode: "ai-guesses" as const,
        category: "places" as const,
        questionAnswers: [],
        currentQuestionNumber: 1,
        questionsRemaining: 20,
        status: "playing" as const,
      };
    });

    it("should render game mode", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText(/Mode:/)).toBeInTheDocument();
      expect(screen.getByText("AI Guesses")).toBeInTheDocument();
    });

    it("should render category", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText(/Category:/)).toBeInTheDocument();
      expect(screen.getByText("places")).toBeInTheDocument();
    });

    it("should display question counter", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText("0/20")).toBeInTheDocument();
    });

    it("should display questions remaining", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText("20")).toBeInTheDocument();
    });

    it("should not show category when category is 'any'", () => {
      mockState.category = "any";
      render(<TwentyQuestions />);
      expect(screen.queryByText(/Category:/)).not.toBeInTheDocument();
    });

    it("should not show target in ai-guesses mode while playing", () => {
      render(<TwentyQuestions />);
      expect(screen.queryByText(/Target:/)).not.toBeInTheDocument();
    });
  });

  describe("Active Game State - User Guesses Mode", () => {
    beforeEach(() => {
      mockState = {
        gameId: "tq_456_test",
        mode: "user-guesses" as const,
        category: "people" as const,
        target: "Albert Einstein",
        questionAnswers: [],
        currentQuestionNumber: 1,
        questionsRemaining: 20,
        status: "playing" as const,
      };
    });

    it("should render game mode", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText("User Guesses")).toBeInTheDocument();
    });

    it("should show target in user-guesses mode", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText(/Target:/)).toBeInTheDocument();
      expect(screen.getByText("Albert Einstein")).toBeInTheDocument();
    });
  });

  describe("Question History", () => {
    beforeEach(() => {
      mockState = {
        gameId: "tq_789_test",
        mode: "ai-guesses" as const,
        category: "things" as const,
        questionAnswers: [
          {
            questionNumber: 1,
            question: "Is it made of metal?",
            answer: "yes" as const,
            askedBy: "ai" as const,
          },
          {
            questionNumber: 2,
            question: "Is it electronic?",
            answer: "no" as const,
            askedBy: "ai" as const,
          },
          {
            questionNumber: 3,
            question: "Is it used in cooking?",
            answer: "maybe" as const,
            askedBy: "user" as const,
          },
        ],
        currentQuestionNumber: 4,
        questionsRemaining: 17,
        status: "playing" as const,
      };
    });

    it("should display question history section", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText("Question History")).toBeInTheDocument();
    });

    it("should display all questions", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText("Is it made of metal?")).toBeInTheDocument();
      expect(screen.getByText("Is it electronic?")).toBeInTheDocument();
      expect(screen.getByText("Is it used in cooking?")).toBeInTheDocument();
    });

    it("should display answers with proper formatting", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText("→ Yes")).toBeInTheDocument();
      expect(screen.getByText("→ No")).toBeInTheDocument();
      expect(screen.getByText("→ Maybe")).toBeInTheDocument();
    });

    it("should show question numbers", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText(/Q1/)).toBeInTheDocument();
      expect(screen.getByText(/Q2/)).toBeInTheDocument();
      expect(screen.getByText(/Q3/)).toBeInTheDocument();
    });

    it("should update question count", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText("3/20")).toBeInTheDocument();
    });

    it("should update questions remaining", () => {
      render(<TwentyQuestions />);
      expect(screen.getByText("17")).toBeInTheDocument();
    });
  });

  describe("Game Status", () => {
    it("should show won status", () => {
      mockState = {
        gameId: "tq_won_test",
        mode: "ai-guesses" as const,
        category: "places" as const,
        target: "Paris",
        questionAnswers: [
          {
            questionNumber: 1,
            question: "Is it in Europe?",
            answer: "yes" as const,
            askedBy: "ai" as const,
          },
        ],
        currentQuestionNumber: 2,
        questionsRemaining: 19,
        status: "won" as const,
      };

      render(<TwentyQuestions />);
      expect(screen.getByText("🎉 Correct!")).toBeInTheDocument();
    });

    it("should show lost status", () => {
      mockState = {
        gameId: "tq_lost_test",
        mode: "user-guesses" as const,
        category: "people" as const,
        target: "Marie Curie",
        questionAnswers: [],
        currentQuestionNumber: 1,
        questionsRemaining: 20,
        status: "lost" as const,
      };

      render(<TwentyQuestions />);
      expect(screen.getByText("Game Over")).toBeInTheDocument();
    });

    it("should reveal target after game ends", () => {
      mockState = {
        gameId: "tq_ended_test",
        mode: "ai-guesses" as const,
        category: "places" as const,
        target: "Eiffel Tower",
        questionAnswers: [],
        currentQuestionNumber: 1,
        questionsRemaining: 20,
        status: "won" as const,
      };

      render(<TwentyQuestions />);
      expect(screen.getByText(/Target:/)).toBeInTheDocument();
      expect(screen.getByText("Eiffel Tower")).toBeInTheDocument();
    });
  });

  describe("Question Counter Edge Cases", () => {
    it("should show 20/20 after all questions answered", () => {
      mockState = {
        gameId: "tq_maxed_test",
        mode: "ai-guesses" as const,
        questionAnswers: Array.from({ length: 20 }, (_, i) => ({
          questionNumber: i + 1,
          question: `Question ${i + 1}?`,
          answer: "no" as const,
          askedBy: "ai" as const,
        })),
        currentQuestionNumber: 21,
        questionsRemaining: 0,
        status: "lost" as const,
      };

      render(<TwentyQuestions />);
      expect(screen.getByText("20/20")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument(); // Remaining
    });
  });
});
