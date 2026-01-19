import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { LexiconSmith } from "./LexiconSmith.js";

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

describe("LexiconSmith Widget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state before each test
    mockState = null;
    mockSetState = vi.fn();
  });

  describe("Initial State (No Game)", () => {
    it("should render the game title", () => {
      render(<LexiconSmith />);
      expect(screen.getByText("Lexicon Smith")).toBeInTheDocument();
    });

    it("should show description when no game is active", () => {
      render(<LexiconSmith />);
      expect(screen.getByText("Build words from 7 letters!")).toBeInTheDocument();
    });

    it("should render Daily Challenge button", () => {
      render(<LexiconSmith />);
      expect(screen.getByText("Daily Challenge")).toBeInTheDocument();
    });

    it("should render Practice Mode button", () => {
      render(<LexiconSmith />);
      expect(screen.getByText("Practice Mode")).toBeInTheDocument();
    });
  });

  describe("Active Game State", () => {
    // Helper to create a game state
    const createGameState = () => ({
      gameId: "ls_123_test",
      letterSet: {
        centerLetter: "A",
        outerLetters: ["B", "C", "D", "E", "R", "T"],
      },
      foundWords: [],
      score: 0,
      totalPossibleWords: 10,
      status: "playing" as const,
      streak: 0,
    });

    // Set up game state before each test in this block
    beforeEach(() => {
      mockState = createGameState();
    });

    it("should render center letter button", () => {
      render(<LexiconSmith />);
      // Center letter should be displayed
      const letterButtons = screen.getAllByRole("button");
      const centerButton = letterButtons.find(btn => btn.textContent === "A");
      expect(centerButton).toBeInTheDocument();
    });

    it("should render 6 outer letter buttons", () => {
      render(<LexiconSmith />);
      const letterButtons = screen.getAllByRole("button");

      // Check for outer letters
      const expectedLetters = ["B", "C", "D", "E", "R", "T"];
      expectedLetters.forEach(letter => {
        const button = letterButtons.find(btn => btn.textContent === letter);
        expect(button).toBeInTheDocument();
      });
    });

    it("should display score", () => {
      render(<LexiconSmith />);
      expect(screen.getByText(/Score:/)).toBeInTheDocument();
    });

    it("should display word count", () => {
      render(<LexiconSmith />);
      expect(screen.getByText(/Words:/)).toBeInTheDocument();
    });

    it("should display streak", () => {
      render(<LexiconSmith />);
      expect(screen.getByText(/Streak:/)).toBeInTheDocument();
    });

    it("should render control buttons", () => {
      render(<LexiconSmith />);
      expect(screen.getByText("Delete")).toBeInTheDocument();
      expect(screen.getByText("Clear")).toBeInTheDocument();
      expect(screen.getByText("Shuffle")).toBeInTheDocument();
      expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    it("should render New Game button", () => {
      render(<LexiconSmith />);
      expect(screen.getByText("New Game")).toBeInTheDocument();
    });
  });

  describe("Word Input", () => {
    // Set up active game state for all tests in this block
    beforeEach(() => {
      mockState = {
        gameId: "ls_123_test",
        letterSet: {
          centerLetter: "A",
          outerLetters: ["B", "C", "D", "E", "R", "T"],
        },
        foundWords: [],
        score: 0,
        totalPossibleWords: 10,
        status: "playing" as const,
        streak: 0,
      };
    });

    it("should show placeholder text when no letters entered", () => {
      render(<LexiconSmith />);
      expect(screen.getByText("Type or click letters")).toBeInTheDocument();
    });

    it("should disable Delete button when word is empty", () => {
      render(<LexiconSmith />);
      const deleteButton = screen.getByText("Delete");
      expect(deleteButton).toBeDisabled();
    });

    it("should disable Clear button when word is empty", () => {
      render(<LexiconSmith />);
      const clearButton = screen.getByText("Clear");
      expect(clearButton).toBeDisabled();
    });

    it("should disable Submit button when word is too short", () => {
      render(<LexiconSmith />);
      const submitButton = screen.getByText("Submit");
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Found Words Display", () => {
    it("should not show found words section when no words found", () => {
      // Ensure we're testing initial state (no game)
      mockState = null;
      render(<LexiconSmith />);
      expect(screen.queryByText(/Found Words/)).not.toBeInTheDocument();
    });

    it("should show found words count", () => {
      // Set up mock with found words
      mockState = {
        gameId: "ls_123_test",
        letterSet: {
          centerLetter: "A",
          outerLetters: ["B", "C", "D", "E", "R", "T"],
        },
        foundWords: ["BRACE", "CRATE", "TRACE"],
        score: 6,
        totalPossibleWords: 10,
        status: "playing" as const,
        streak: 0,
      };

      render(<LexiconSmith />);
      expect(screen.getByText("Found Words (3)")).toBeInTheDocument();
    });
  });
});
