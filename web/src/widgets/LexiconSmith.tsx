/**
 * Lexicon Smith widget component.
 *
 * Displays the word-building puzzle game with:
 * - Letter circle (1 center + 6 outer letters)
 * - Current word input
 * - Found words list with points
 * - Score and progress tracking
 *
 * @module widgets/LexiconSmith
 */

import { useState, useEffect, useCallback } from "react";
import { useWidgetState } from "../hooks/useWidgetState.js";
import { useOpenAiGlobal } from "../hooks/useOpenAiGlobal.js";
import type { GameStatus } from "../types/game.js";

/**
 * Get the OpenAI window API if available.
 */
function getOpenAiApi(): { callTool: (name: string, params: object) => Promise<unknown> } | undefined {
  const openai = (window as { openai?: { callTool?: (name: string, params: object) => Promise<unknown> } }).openai;
  if (openai?.callTool) {
    return openai as { callTool: (name: string, params: object) => Promise<unknown> };
  }
  return undefined;
}

/**
 * Letter set for the puzzle.
 */
interface LetterSet {
  centerLetter: string;
  outerLetters: readonly string[];
}

/**
 * Tool output from MCP server.
 */
interface LexiconToolOutput {
  gameId?: string;
  letterSet?: LetterSet;
  foundWords?: string[];
  score?: number;
  totalPossibleWords?: number;
  status?: GameStatus;
  streak?: number;
  maxStreak?: number;
  word?: string;
  validation?: string;
  points?: number;
  isPangram?: boolean;
  message?: string;
}

/**
 * Widget state persisted across sessions.
 */
interface LexiconSmithState {
  gameId?: string;
  letterSet?: LetterSet;
  foundWords: string[];
  score: number;
  totalPossibleWords: number;
  status: GameStatus;
  streak: number;
  maxStreak?: number;
}

/**
 * Default initial state.
 */
const DEFAULT_STATE: LexiconSmithState = {
  foundWords: [],
  score: 0,
  totalPossibleWords: 0,
  status: "playing",
  streak: 0,
};

/**
 * Lexicon Smith game widget.
 */
export function LexiconSmith(): JSX.Element {
  // Persisted state
  const [state, setState] = useWidgetState<LexiconSmithState>(DEFAULT_STATE);

  // UI state (not persisted)
  const [currentWord, setCurrentWord] = useState("");
  const [message, setMessage] = useState("");
  const [shuffledOuter, setShuffledOuter] = useState<string[]>([]);

  // Tool output listener
  const toolOutput = useOpenAiGlobal<LexiconToolOutput>("toolOutput");

  // Initialize shuffled letters when letter set changes
  useEffect(() => {
    if (state.letterSet?.outerLetters) {
      setShuffledOuter([...state.letterSet.outerLetters]);
    }
  }, [state.letterSet?.centerLetter]); // Only reset when game changes

  // Process tool output
  useEffect(() => {
    if (!toolOutput) return;

    // Update state from tool output
    setState((prev) => ({
      ...prev,
      gameId: toolOutput.gameId ?? prev.gameId,
      letterSet: toolOutput.letterSet ?? prev.letterSet,
      foundWords: toolOutput.foundWords ?? prev.foundWords,
      score: toolOutput.score ?? prev.score,
      totalPossibleWords: toolOutput.totalPossibleWords ?? prev.totalPossibleWords,
      status: toolOutput.status ?? prev.status,
      streak: toolOutput.streak ?? prev.streak,
      maxStreak: toolOutput.maxStreak ?? prev.maxStreak,
    }));

    // Show message if present
    if (toolOutput.message) {
      setMessage(toolOutput.message);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }

    // Clear current word after successful submission
    if (toolOutput.validation === "valid") {
      setCurrentWord("");
    }
  }, [toolOutput, setState]);

  // Handle letter click
  const handleLetterClick = useCallback((letter: string) => {
    setCurrentWord((prev) => prev + letter);
  }, []);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    setCurrentWord((prev) => prev.slice(0, -1));
  }, []);

  // Handle clear
  const handleClear = useCallback(() => {
    setCurrentWord("");
  }, []);

  // Handle shuffle
  const handleShuffle = useCallback(() => {
    if (!state.letterSet) return;
    const shuffled = [...shuffledOuter];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledOuter(shuffled);
  }, [shuffledOuter]);

  // Handle word submission
  const handleSubmit = useCallback(() => {
    if (!currentWord || !state.gameId) return;

    const api = getOpenAiApi();
    if (api) {
      api.callTool("gamebox.submit_lexicon_word", {
        gameId: state.gameId,
        word: currentWord,
      });
    }
  }, [currentWord, state.gameId]);

  // Handle new game
  const handleNewGame = useCallback((mode: "daily" | "practice") => {
    const api = getOpenAiApi();
    if (api) {
      api.callTool("gamebox.start_lexicon_smith", { mode });
      setCurrentWord("");
      setMessage("");
    }
  }, []);

  // Keyboard input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const upperKey = e.key.toUpperCase();
        // Check if letter is available
        if (state.letterSet) {
          const allLetters = [state.letterSet.centerLetter, ...state.letterSet.outerLetters];
          if (allLetters.includes(upperKey)) {
            handleLetterClick(upperKey);
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit, handleBackspace, handleLetterClick, state.letterSet]);

  if (!state.letterSet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <h1 className="text-4xl font-bold mb-4 text-slate-800">Lexicon Smith</h1>
        <p className="text-lg text-slate-600 mb-8">Build words from 7 letters!</p>
        <div className="flex gap-4">
          <button
            onClick={() => handleNewGame("daily")}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors"
          >
            Daily Challenge
          </button>
          <button
            onClick={() => handleNewGame("practice")}
            className="px-6 py-3 bg-slate-500 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
          >
            Practice Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Lexicon Smith</h1>
        <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
          <span>Score: <strong className="text-teal-600">{state.score}</strong></span>
          <span>•</span>
          <span>Words: <strong>{state.foundWords.length}</strong>{state.totalPossibleWords > 0 && `/${state.totalPossibleWords}`}</span>
          <span>•</span>
          <span>Streak: <strong>{state.streak}</strong></span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm max-w-md text-center animate-fade-in">
          {message}
        </div>
      )}

      {/* Letter Circle */}
      <div className="relative w-80 h-80">
        {/* Center Letter */}
        <button
          onClick={() => handleLetterClick(state.letterSet!.centerLetter)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-teal-500 text-white text-3xl font-bold rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          {state.letterSet!.centerLetter}
        </button>

        {/* Outer Letters */}
        {shuffledOuter.map((letter, i) => {
          const angle = (i * 360) / 6;
          const radius = 120;
          const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
          const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;

          return (
            <button
              key={`${letter}-${i}`}
              onClick={() => handleLetterClick(letter)}
              className="absolute w-16 h-16 bg-slate-500 text-white text-2xl font-bold rounded-full shadow-md hover:scale-110 hover:bg-slate-600 hover:shadow-lg transition-all duration-200 flex items-center justify-center"
              style={{
                left: `calc(50% + ${x}px - 2rem)`,
                top: `calc(50% + ${y}px - 2rem)`,
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Current Word */}
      <div className="flex flex-col items-center gap-2">
        <div className="min-w-64 px-6 py-4 bg-white border-2 border-slate-300 rounded-lg text-center">
          <div className="text-2xl font-bold text-slate-800 min-h-8 tracking-wider">
            {currentWord || <span className="text-slate-400">Type or click letters</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBackspace}
            disabled={!currentWord}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Delete
          </button>
          <button
            onClick={handleClear}
            disabled={!currentWord}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleShuffle}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
          >
            Shuffle
          </button>
          <button
            onClick={handleSubmit}
            disabled={!currentWord || currentWord.length < 4}
            className="px-6 py-2 bg-teal-500 text-white rounded-md font-semibold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Found Words */}
      {state.foundWords.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Found Words ({state.foundWords.length})</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {state.foundWords.map((word) => (
              <div
                key={word}
                className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-md text-center text-sm font-medium text-emerald-700"
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Game Button */}
      <button
        onClick={() => handleNewGame("daily")}
        className="mt-4 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
      >
        New Game
      </button>
    </div>
  );
}
