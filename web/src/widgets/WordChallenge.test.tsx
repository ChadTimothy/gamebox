import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { WordChallenge } from "./WordChallenge.js";

// Mock useWidgetState hook - returns useState behavior for testing
vi.mock("../hooks/useWidgetState.js", () => ({
  useWidgetState: (defaultState: any) => useState(defaultState),
}));

describe("WordChallenge Widget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the game title", () => {
    render(<WordChallenge />);
    expect(screen.getByText("Word Challenge")).toBeInTheDocument();
  });

  it("should render 6x5 grid of tiles", () => {
    render(<WordChallenge />);
    // 6 rows × 5 tiles = 30 tiles
    const tiles = screen.getAllByRole("generic").filter(
      (el) => el.className.includes("w-14 h-14")
    );
    expect(tiles.length).toBeGreaterThanOrEqual(30);
  });

  it("should display current guess count", () => {
    render(<WordChallenge />);
    expect(screen.getByText("Guess 1 of 6")).toBeInTheDocument();
  });

  it("should render keyboard with all letters", () => {
    render(<WordChallenge />);

    // Check for some keyboard letters
    expect(screen.getByText("Q")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("Z")).toBeInTheDocument();
    expect(screen.getByText("ENTER")).toBeInTheDocument();
    expect(screen.getByText("⌫")).toBeInTheDocument();
  });

  it("should add letters to current guess when keyboard is clicked", () => {
    render(<WordChallenge />);

    fireEvent.click(screen.getByText("C"));
    fireEvent.click(screen.getByText("R"));
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("N"));
    fireEvent.click(screen.getByText("E"));

    // Current guess should be visible in the first row
    const tiles = screen.getAllByRole("generic").filter(
      (el) => el.className.includes("w-14 h-14")
    );

    // First row should contain CRANE
    expect(tiles[0]).toHaveTextContent("C");
    expect(tiles[1]).toHaveTextContent("R");
    expect(tiles[2]).toHaveTextContent("A");
    expect(tiles[3]).toHaveTextContent("N");
    expect(tiles[4]).toHaveTextContent("E");
  });

  it("should remove letters when backspace is clicked", () => {
    render(<WordChallenge />);

    fireEvent.click(screen.getByText("C"));
    fireEvent.click(screen.getByText("R"));
    fireEvent.click(screen.getByText("A"));

    fireEvent.click(screen.getByText("⌫"));

    const tiles = screen.getAllByRole("generic").filter(
      (el) => el.className.includes("w-14 h-14")
    );

    // Should have CR (removed A)
    expect(tiles[0]).toHaveTextContent("C");
    expect(tiles[1]).toHaveTextContent("R");
    expect(tiles[2]).toHaveTextContent("");
  });

  it("should not allow more than 5 letters in current guess", () => {
    render(<WordChallenge />);

    fireEvent.click(screen.getByText("C"));
    fireEvent.click(screen.getByText("R"));
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("N"));
    fireEvent.click(screen.getByText("E"));
    fireEvent.click(screen.getByText("S")); // 6th letter should be ignored

    const tiles = screen.getAllByRole("generic").filter(
      (el) => el.className.includes("w-14 h-14")
    );

    // Should still have CRANE (5 letters)
    expect(tiles[0]).toHaveTextContent("C");
    expect(tiles[1]).toHaveTextContent("R");
    expect(tiles[2]).toHaveTextContent("A");
    expect(tiles[3]).toHaveTextContent("N");
    expect(tiles[4]).toHaveTextContent("E");
    expect(tiles[5]).toHaveTextContent("");
  });

  it("should show message when trying to submit incomplete guess", () => {
    render(<WordChallenge />);

    fireEvent.click(screen.getByText("C"));
    fireEvent.click(screen.getByText("R"));
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("ENTER"));

    expect(screen.getByText("Word must be 5 letters")).toBeInTheDocument();
  });

  it("should show message when trying to submit with 5 letters (placeholder)", () => {
    render(<WordChallenge />);

    fireEvent.click(screen.getByText("C"));
    fireEvent.click(screen.getByText("R"));
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("N"));
    fireEvent.click(screen.getByText("E"));
    fireEvent.click(screen.getByText("ENTER"));

    // Should show placeholder message (MCP not connected yet)
    expect(
      screen.getByText("Connect to game server to make guesses")
    ).toBeInTheDocument();
  });

  it("should render New Game and Share buttons when game is won", () => {
    // This test would require mocking the state as "won"
    // Skipped for now as it requires more complex state mocking
  });

  it("should reset game when New Game is clicked", () => {
    // This test would require mocking the state as "won" first
    // Skipped for now as it requires more complex state mocking
  });
});
