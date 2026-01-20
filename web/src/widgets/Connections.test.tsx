import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { Connections } from "./Connections.js";

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

describe("Connections Widget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state before each test
    mockState = null;
    mockSetState = vi.fn();
  });

  describe("Initial State (No Game)", () => {
    it("should render the game title", () => {
      render(<Connections />);
      expect(screen.getByText("Connections")).toBeInTheDocument();
    });

    it("should show prompt to start game when no game is active", () => {
      render(<Connections />);
      expect(screen.getByText("Ask me to start a game of Connections!")).toBeInTheDocument();
    });

    it("should show game description", () => {
      render(<Connections />);
      expect(screen.getByText("Find 4 groups of 4 related words")).toBeInTheDocument();
    });
  });

  describe("Active Game State", () => {
    beforeEach(() => {
      mockState = {
        gameId: "cn_123_test",
        mode: "daily",
        remainingWords: [
          "MARS", "VENUS", "EARTH", "JUPITER",
          "APPLE", "BANANA", "CHERRY", "DATE",
          "RED", "BLUE", "GREEN", "YELLOW",
          "DOG", "CAT", "BIRD", "FISH"
        ],
        solvedGroups: [],
        selectedWords: [],
        mistakeCount: 0,
        mistakesRemaining: 4,
        status: "playing" as const,
      };
    });

    it("should render the word grid", () => {
      render(<Connections />);
      expect(screen.getByText("MARS")).toBeInTheDocument();
      expect(screen.getByText("APPLE")).toBeInTheDocument();
      expect(screen.getByText("RED")).toBeInTheDocument();
      expect(screen.getByText("DOG")).toBeInTheDocument();
    });

    it("should display all 16 words as buttons", () => {
      render(<Connections />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(16);
    });

    it("should show selection count", () => {
      render(<Connections />);
      expect(screen.getByText("Selected: 0/4")).toBeInTheDocument();
    });

    it("should show mistake dots", () => {
      render(<Connections />);
      expect(screen.getByText("Mistakes:")).toBeInTheDocument();
    });
  });

  describe("Word Selection", () => {
    beforeEach(() => {
      mockState = {
        gameId: "cn_123_test",
        mode: "daily",
        remainingWords: ["MARS", "VENUS", "EARTH", "JUPITER"],
        solvedGroups: [],
        selectedWords: ["MARS", "VENUS"],
        mistakeCount: 0,
        mistakesRemaining: 4,
        status: "playing" as const,
      };
    });

    it("should show correct selection count", () => {
      render(<Connections />);
      expect(screen.getByText("Selected: 2/4")).toBeInTheDocument();
    });

    it("should call setState when word is clicked", () => {
      render(<Connections />);
      const button = screen.getByText("EARTH");
      fireEvent.click(button);
      expect(mockSetState).toHaveBeenCalled();
    });

    it("should show submit hint when 4 words selected", () => {
      mockState.selectedWords = ["MARS", "VENUS", "EARTH", "JUPITER"];
      render(<Connections />);
      expect(screen.getByText("Ask me to submit your guess!")).toBeInTheDocument();
    });
  });

  describe("Solved Groups", () => {
    beforeEach(() => {
      mockState = {
        gameId: "cn_123_test",
        mode: "daily",
        remainingWords: ["RED", "BLUE", "GREEN", "YELLOW", "DOG", "CAT", "BIRD", "FISH"],
        solvedGroups: [
          {
            category: "PLANETS",
            words: ["MARS", "VENUS", "EARTH", "JUPITER"],
            difficulty: "yellow",
          },
          {
            category: "FRUITS",
            words: ["APPLE", "BANANA", "CHERRY", "DATE"],
            difficulty: "green",
          },
        ],
        selectedWords: [],
        mistakeCount: 1,
        mistakesRemaining: 3,
        status: "playing" as const,
      };
    });

    it("should display solved groups", () => {
      render(<Connections />);
      expect(screen.getByText("PLANETS")).toBeInTheDocument();
      expect(screen.getByText("FRUITS")).toBeInTheDocument();
    });

    it("should display words in solved groups", () => {
      render(<Connections />);
      expect(screen.getByText("MARS, VENUS, EARTH, JUPITER")).toBeInTheDocument();
      expect(screen.getByText("APPLE, BANANA, CHERRY, DATE")).toBeInTheDocument();
    });

    it("should show remaining words in grid", () => {
      render(<Connections />);
      expect(screen.getByText("RED")).toBeInTheDocument();
      expect(screen.getByText("DOG")).toBeInTheDocument();
    });
  });

  describe("Mistake Tracking", () => {
    it("should show full mistake dots when no mistakes", () => {
      mockState = {
        gameId: "cn_123_test",
        mode: "daily",
        remainingWords: ["A", "B", "C", "D"],
        solvedGroups: [],
        selectedWords: [],
        mistakeCount: 0,
        mistakesRemaining: 4,
        status: "playing" as const,
      };
      render(<Connections />);
      // Should have 4 filled dots (mistakesRemaining)
      const container = screen.getByText("Mistakes:").parentElement;
      expect(container).toBeInTheDocument();
    });

    it("should show reduced mistake dots after mistakes", () => {
      mockState = {
        gameId: "cn_123_test",
        mode: "daily",
        remainingWords: ["A", "B", "C", "D"],
        solvedGroups: [],
        selectedWords: [],
        mistakeCount: 2,
        mistakesRemaining: 2,
        status: "playing" as const,
      };
      render(<Connections />);
      // Should have 2 filled and 2 empty dots
      const container = screen.getByText("Mistakes:").parentElement;
      expect(container).toBeInTheDocument();
    });
  });

  describe("Game Won State", () => {
    beforeEach(() => {
      mockState = {
        gameId: "cn_won_test",
        mode: "daily",
        remainingWords: [],
        solvedGroups: [
          { category: "GROUP 1", words: ["A", "B", "C", "D"], difficulty: "yellow" },
          { category: "GROUP 2", words: ["E", "F", "G", "H"], difficulty: "green" },
          { category: "GROUP 3", words: ["I", "J", "K", "L"], difficulty: "blue" },
          { category: "GROUP 4", words: ["M", "N", "O", "P"], difficulty: "purple" },
        ],
        selectedWords: [],
        mistakeCount: 2,
        mistakesRemaining: 2,
        status: "won" as const,
      };
    });

    it("should show congratulations message", () => {
      render(<Connections />);
      expect(screen.getByText("Congratulations!")).toBeInTheDocument();
    });

    it("should show success message", () => {
      render(<Connections />);
      expect(screen.getByText("You found all 4 groups!")).toBeInTheDocument();
    });

    it("should show celebration emoji", () => {
      render(<Connections />);
      expect(screen.getByText("🎉")).toBeInTheDocument();
    });

    it("should not show word grid", () => {
      render(<Connections />);
      // Grid should not be present when game is won
      const buttons = screen.queryAllByRole("button");
      expect(buttons).toHaveLength(0);
    });
  });

  describe("Game Lost State", () => {
    beforeEach(() => {
      mockState = {
        gameId: "cn_lost_test",
        mode: "daily",
        remainingWords: ["A", "B", "C", "D", "E", "F", "G", "H"],
        solvedGroups: [
          { category: "GROUP 1", words: ["I", "J", "K", "L"], difficulty: "yellow" },
          { category: "GROUP 2", words: ["M", "N", "O", "P"], difficulty: "green" },
        ],
        selectedWords: [],
        mistakeCount: 4,
        mistakesRemaining: 0,
        status: "lost" as const,
      };
    });

    it("should show game over message", () => {
      render(<Connections />);
      expect(screen.getByText("Game Over")).toBeInTheDocument();
    });

    it("should show loss emoji", () => {
      render(<Connections />);
      expect(screen.getByText("💔")).toBeInTheDocument();
    });

    it("should show encouragement message", () => {
      render(<Connections />);
      expect(screen.getByText("Better luck next time!")).toBeInTheDocument();
    });

    it("should not show word grid after loss", () => {
      render(<Connections />);
      // Grid should not be present when game is lost
      const buttons = screen.queryAllByRole("button");
      expect(buttons).toHaveLength(0);
    });
  });

  describe("Difficulty Colors", () => {
    it("should render yellow difficulty group", () => {
      mockState = {
        gameId: "cn_color_test",
        mode: "daily",
        remainingWords: [],
        solvedGroups: [
          { category: "EASY GROUP", words: ["A", "B", "C", "D"], difficulty: "yellow" },
        ],
        selectedWords: [],
        mistakeCount: 0,
        mistakesRemaining: 4,
        status: "playing" as const,
      };
      render(<Connections />);
      expect(screen.getByText("EASY GROUP")).toBeInTheDocument();
      expect(screen.getByText("A, B, C, D")).toBeInTheDocument();
    });

    it("should render green difficulty group", () => {
      mockState = {
        gameId: "cn_color_test",
        mode: "daily",
        remainingWords: [],
        solvedGroups: [
          { category: "MEDIUM GROUP", words: ["A", "B", "C", "D"], difficulty: "green" },
        ],
        selectedWords: [],
        mistakeCount: 0,
        mistakesRemaining: 4,
        status: "playing" as const,
      };
      render(<Connections />);
      expect(screen.getByText("MEDIUM GROUP")).toBeInTheDocument();
      expect(screen.getByText("A, B, C, D")).toBeInTheDocument();
    });

    it("should render blue difficulty group", () => {
      mockState = {
        gameId: "cn_color_test",
        mode: "daily",
        remainingWords: [],
        solvedGroups: [
          { category: "HARD GROUP", words: ["A", "B", "C", "D"], difficulty: "blue" },
        ],
        selectedWords: [],
        mistakeCount: 0,
        mistakesRemaining: 4,
        status: "playing" as const,
      };
      render(<Connections />);
      expect(screen.getByText("HARD GROUP")).toBeInTheDocument();
      expect(screen.getByText("A, B, C, D")).toBeInTheDocument();
    });

    it("should render purple difficulty group", () => {
      mockState = {
        gameId: "cn_color_test",
        mode: "daily",
        remainingWords: [],
        solvedGroups: [
          { category: "HARDEST GROUP", words: ["A", "B", "C", "D"], difficulty: "purple" },
        ],
        selectedWords: [],
        mistakeCount: 0,
        mistakesRemaining: 4,
        status: "playing" as const,
      };
      render(<Connections />);
      expect(screen.getByText("HARDEST GROUP")).toBeInTheDocument();
      expect(screen.getByText("A, B, C, D")).toBeInTheDocument();
    });
  });

  describe("Non-Interactive States", () => {
    it("should not allow selection when game is won", () => {
      mockState = {
        gameId: "cn_won_test",
        mode: "daily",
        remainingWords: ["A", "B", "C", "D"],
        solvedGroups: [],
        selectedWords: [],
        mistakeCount: 0,
        mistakesRemaining: 4,
        status: "won" as const,
      };
      render(<Connections />);
      // Word grid should not be shown when status is won
      const buttons = screen.queryAllByRole("button");
      expect(buttons).toHaveLength(0);
    });

    it("should not allow selection when game is lost", () => {
      mockState = {
        gameId: "cn_lost_test",
        mode: "daily",
        remainingWords: ["A", "B", "C", "D"],
        solvedGroups: [],
        selectedWords: [],
        mistakeCount: 4,
        mistakesRemaining: 0,
        status: "lost" as const,
      };
      render(<Connections />);
      // Word grid should not be shown when status is lost
      const buttons = screen.queryAllByRole("button");
      expect(buttons).toHaveLength(0);
    });
  });
});
