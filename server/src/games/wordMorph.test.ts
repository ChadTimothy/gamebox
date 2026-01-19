import { describe, it, expect, beforeEach } from "vitest";
import {
  checkGuess,
  generateShareText,
  WordMorphGame,
  type LetterResult,
  type LetterFeedback,
} from "./wordMorph.js";

describe("checkGuess", () => {
  describe("exact matches", () => {
    it("should mark all letters as correct when guess matches target", () => {
      const result = checkGuess("CRANE", "CRANE");
      expect(result).toEqual([
        { letter: "C", feedback: "correct" },
        { letter: "R", feedback: "correct" },
        { letter: "A", feedback: "correct" },
        { letter: "N", feedback: "correct" },
        { letter: "E", feedback: "correct" },
      ]);
    });

    it("should mark letters as correct in matching positions", () => {
      const result = checkGuess("CRANE", "CRATE");
      expect(result[0]).toEqual({ letter: "C", feedback: "correct" });
      expect(result[1]).toEqual({ letter: "R", feedback: "correct" });
      expect(result[2]).toEqual({ letter: "A", feedback: "correct" });
      expect(result[4]).toEqual({ letter: "E", feedback: "correct" });
    });
  });

  describe("present letters", () => {
    it("should mark letters as present when in word but wrong position", () => {
      const result = checkGuess("TRACE", "CRATE");
      expect(result[0]).toEqual({ letter: "T", feedback: "present" });
      expect(result[1]).toEqual({ letter: "R", feedback: "correct" });
      expect(result[2]).toEqual({ letter: "A", feedback: "correct" });
      expect(result[3]).toEqual({ letter: "C", feedback: "present" });
      expect(result[4]).toEqual({ letter: "E", feedback: "correct" });
    });
  });

  describe("absent letters", () => {
    it("should mark letters as absent when not in word", () => {
      const result = checkGuess("XYZAB", "CRANE");
      expect(result[0]).toEqual({ letter: "X", feedback: "absent" });
      expect(result[1]).toEqual({ letter: "Y", feedback: "absent" });
      expect(result[2]).toEqual({ letter: "Z", feedback: "absent" });
      expect(result[3]).toEqual({ letter: "A", feedback: "present" });
      expect(result[4]).toEqual({ letter: "B", feedback: "absent" });
    });

    it("should mark all letters as absent when none match", () => {
      const result = checkGuess("BOXES", "TRICK");
      result.forEach((r) => {
        expect(r.feedback).toBe("absent");
      });
    });
  });

  describe("duplicate letter handling", () => {
    it("should handle duplicate letters correctly - both present", () => {
      // Target: SPEED = S(0) P(1) E(2) E(3) D(4)
      // Guess:  ERASE = E(0) R(1) A(2) S(3) E(4)
      // E at pos 0: present (E exists in SPEED at pos 2,3)
      // E at pos 4: present (E exists in SPEED at pos 2,3)
      const result = checkGuess("ERASE", "SPEED");

      expect(result[0]).toEqual({ letter: "E", feedback: "present" });
      expect(result[1]).toEqual({ letter: "R", feedback: "absent" });
      expect(result[2]).toEqual({ letter: "A", feedback: "absent" });
      expect(result[3]).toEqual({ letter: "S", feedback: "present" });
      expect(result[4]).toEqual({ letter: "E", feedback: "present" });
    });

    it("should handle duplicate letters - one correct, one absent", () => {
      // Target: ROBOT = R(0) O(1) B(2) O(3) T(4) - two O's at pos 1,3
      // Guess:  FLOOR = F(0) L(1) O(2) O(3) R(4) - two O's at pos 2,3
      // O at pos 2: present (ROBOT has O at pos 1,3, not 2)
      // O at pos 3: correct (matches ROBOT pos 3)
      const result = checkGuess("FLOOR", "ROBOT");

      expect(result[0]).toEqual({ letter: "F", feedback: "absent" });
      expect(result[1]).toEqual({ letter: "L", feedback: "absent" });
      expect(result[2]).toEqual({ letter: "O", feedback: "present" });
      expect(result[3]).toEqual({ letter: "O", feedback: "correct" });
      expect(result[4]).toEqual({ letter: "R", feedback: "present" });
    });

    it("should handle duplicate letters - both correct", () => {
      // Target: SPEED (two E's)
      // Guess: GEESE (two E's in same positions)
      const result = checkGuess("CREEP", "SPEED");

      expect(result[0]).toEqual({ letter: "C", feedback: "absent" });
      expect(result[1]).toEqual({ letter: "R", feedback: "absent" });
      expect(result[2]).toEqual({ letter: "E", feedback: "correct" });
      expect(result[3]).toEqual({ letter: "E", feedback: "correct" });
      expect(result[4]).toEqual({ letter: "P", feedback: "present" });
    });

    it("should handle triple letters correctly", () => {
      // Target: EERIE (3 E's)
      // Guess: EVERY (2 E's)
      const result = checkGuess("EVERY", "EERIE");

      expect(result[0]).toEqual({ letter: "E", feedback: "correct" });
      expect(result[1]).toEqual({ letter: "V", feedback: "absent" });
      expect(result[2]).toEqual({ letter: "E", feedback: "present" });
      expect(result[3]).toEqual({ letter: "R", feedback: "present" });
      expect(result[4]).toEqual({ letter: "Y", feedback: "absent" });
    });
  });

  describe("edge cases", () => {
    it("should preserve letter casing in result", () => {
      const result = checkGuess("CRANE", "CRANE");
      result.forEach((r) => {
        expect(r.letter).toBe(r.letter.toUpperCase());
      });
    });
  });
});

describe("generateShareText", () => {
  it("should generate share text for won game", () => {
    const text = generateShareText(["CRANE", "GRACE"], "GRACE", 6, true);

    expect(text).toContain("Word Morph 2/6");
    expect(text).toContain("🟩"); // correct
    expect(text).toContain("🟨"); // present
    expect(text).toContain("⬜"); // absent
  });

  it("should generate share text for lost game", () => {
    const text = generateShareText(
      ["CRANE", "TRAIN", "BRAIN", "DRAIN", "GRAIN", "PLAIN"],
      "STAIN",
      6,
      false
    );

    expect(text).toContain("Word Morph X/6");
    expect(text).not.toContain("6/6"); // Should use X for lost games
  });

  it("should generate correct emoji pattern", () => {
    const text = generateShareText(["CRANE"], "GRACE", 6, false);

    // CRANE vs GRACE:
    // C - present (yellow)
    // R - correct (green)
    // A - correct (green)
    // N - absent (white)
    // E - correct (green)
    const lines = text.split("\n");
    const emojiLine = lines[2]; // First guess line
    expect(emojiLine).toBe("🟨🟩🟩⬜🟩");
  });

  it("should handle multiple guesses", () => {
    const text = generateShareText(
      ["CRANE", "TRACE", "GRACE"],
      "GRACE",
      6,
      true
    );

    const lines = text.split("\n");
    expect(lines).toHaveLength(5); // Title, blank line, 3 guess lines
  });
});

describe("WordMorphGame", () => {
  describe("constructor", () => {
    it("should create game with valid word", () => {
      const game = new WordMorphGame("CRANE");
      const state = game.getState();

      expect(state.word).toBe("CRANE");
      expect(state.status).toBe("playing");
      expect(state.guesses).toHaveLength(0);
      expect(state.maxGuesses).toBe(6);
    });

    it("should normalize word to uppercase", () => {
      const game = new WordMorphGame("crane");
      expect(game.getState().word).toBe("CRANE");
    });

    it("should accept custom max guesses", () => {
      const game = new WordMorphGame("CRANE", 10);
      expect(game.getState().maxGuesses).toBe(10);
    });

    it("should throw error for invalid word length", () => {
      expect(() => new WordMorphGame("TOO")).toThrow(
        "Word must be exactly 5 letters"
      );
      expect(() => new WordMorphGame("TOOLONG")).toThrow(
        "Word must be exactly 5 letters"
      );
      expect(() => new WordMorphGame("")).toThrow(
        "Word must be exactly 5 letters"
      );
    });
  });

  describe("makeGuess", () => {
    let game: WordMorphGame;

    beforeEach(() => {
      game = new WordMorphGame("CRANE");
    });

    it("should accept valid guess", () => {
      const result = game.makeGuess("TRAIN");

      expect(result).toBeDefined();
      expect(result).toHaveLength(5);
      expect(game.getState().guesses).toContain("TRAIN");
    });

    it("should normalize guess to uppercase", () => {
      game.makeGuess("train");
      expect(game.getState().guesses).toContain("TRAIN");
    });

    it("should throw error for invalid guess length", () => {
      expect(() => game.makeGuess("TOO")).toThrow(
        "Guess must be exactly 5 letters"
      );
      expect(() => game.makeGuess("TOOLONG")).toThrow(
        "Guess must be exactly 5 letters"
      );
    });

    it("should throw error for invalid word", () => {
      expect(() => game.makeGuess("ZZZZZ")).toThrow("Not a valid word");
      expect(() => game.makeGuess("XXXXX")).toThrow("Not a valid word");
    });

    it("should return correct feedback", () => {
      const result = game.makeGuess("TRACE");

      expect(result[0].letter).toBe("T");
      expect(result[1].letter).toBe("R");
      expect(result[2].letter).toBe("A");
      expect(result[3].letter).toBe("C");
      expect(result[4].letter).toBe("E");
    });
  });

  describe("win condition", () => {
    it("should set status to won when correct guess", () => {
      const game = new WordMorphGame("CRANE");
      game.makeGuess("CRANE");

      expect(game.getState().status).toBe("won");
      expect(game.isGameOver()).toBe(true);
    });

    it("should not allow guesses after winning", () => {
      const game = new WordMorphGame("CRANE");
      game.makeGuess("CRANE");

      expect(() => game.makeGuess("TRAIN")).toThrow("Game is already won");
    });
  });

  describe("lose condition", () => {
    it("should set status to lost after max guesses", () => {
      const game = new WordMorphGame("CRANE", 3);

      game.makeGuess("TRAIN");
      game.makeGuess("BRAIN");
      game.makeGuess("DRAIN");

      expect(game.getState().status).toBe("lost");
      expect(game.isGameOver()).toBe(true);
    });

    it("should not allow guesses after losing", () => {
      const game = new WordMorphGame("CRANE", 1);
      game.makeGuess("TRAIN");

      expect(() => game.makeGuess("BRAIN")).toThrow("Game is already lost");
    });
  });

  describe("getState", () => {
    it("should return immutable state", () => {
      const game = new WordMorphGame("CRANE");
      game.makeGuess("TRAIN");

      const state1 = game.getState();
      const state2 = game.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
      expect(state1.guesses).not.toBe(state2.guesses); // Different arrays
    });

    it("should reflect current game state", () => {
      const game = new WordMorphGame("CRANE");

      expect(game.getState().guesses).toHaveLength(0);

      game.makeGuess("TRAIN");
      expect(game.getState().guesses).toHaveLength(1);

      game.makeGuess("BRAIN");
      expect(game.getState().guesses).toHaveLength(2);
    });
  });

  describe("getShareText", () => {
    it("should generate share text for current game state", () => {
      const game = new WordMorphGame("GRACE");
      game.makeGuess("CRANE");

      const text = game.getShareText();

      expect(text).toContain("Word Morph");
      expect(text).toContain("🟩"); // Has some correct letters
    });

    it("should show won status", () => {
      const game = new WordMorphGame("CRANE");
      game.makeGuess("TRAIN");
      game.makeGuess("CRANE");

      const text = game.getShareText();
      expect(text).toContain("2/6");
      expect(text).not.toContain("X/");
    });

    it("should show lost status", () => {
      const game = new WordMorphGame("CRANE", 2);
      game.makeGuess("TRAIN");
      game.makeGuess("BRAIN");

      const text = game.getShareText();
      expect(text).toContain("X/2");
    });
  });
});
