/**
 * Connections Widget
 *
 * Displays a 4x4 grid of words for the NYT Connections-style game.
 * Users find 4 groups of 4 related words, with color-coded difficulties.
 */
import { useWidgetState } from "../hooks/useWidgetState.js";
import { useOpenAiGlobal } from "../hooks/useOpenAiGlobal.js";
import type { GameStatus } from "../types/game.js";

// Difficulty colors matching NYT Connections
const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  yellow: { bg: "#f9df6d", text: "#000", label: "🟨" },
  green: { bg: "#a0c35a", text: "#000", label: "🟩" },
  blue: { bg: "#b0c4ef", text: "#000", label: "🟦" },
  purple: { bg: "#ba81c5", text: "#fff", label: "🟪" },
};

interface WordGroup {
  category: string;
  words: string[];
  difficulty: string;
}

interface ConnectionsToolOutput {
  gameId?: string;
  mode?: string;
  puzzleId?: string;
  remainingWords?: string[];
  solvedGroups?: WordGroup[];
  mistakeCount?: number;
  mistakesRemaining?: number;
  maxMistakes?: number;
  status?: GameStatus;
  correct?: boolean;
  category?: string;
  difficulty?: string;
  wordsAway?: number;
  shareText?: string;
}

interface ConnectionsState {
  gameId: string | null;
  mode: string;
  remainingWords: string[];
  solvedGroups: WordGroup[];
  selectedWords: string[];
  mistakeCount: number;
  mistakesRemaining: number;
  status: GameStatus;
}

const DEFAULT_STATE: ConnectionsState = {
  gameId: null,
  mode: "daily",
  remainingWords: [],
  solvedGroups: [],
  selectedWords: [],
  mistakeCount: 0,
  mistakesRemaining: 4,
  status: "playing",
};

/**
 * Main Connections widget component.
 */
export function Connections(): JSX.Element {
  const [state, setState] = useWidgetState<ConnectionsState>(DEFAULT_STATE);
  const toolOutput = useOpenAiGlobal<ConnectionsToolOutput>("toolOutput");

  // Update state when tool output changes
  if (toolOutput) {
    const isNewGame = toolOutput.gameId !== undefined && toolOutput.gameId !== state.gameId;
    const isGuessResult = toolOutput.correct !== undefined;

    const updates: Partial<ConnectionsState> = {
      ...(toolOutput.gameId !== undefined && { gameId: toolOutput.gameId }),
      ...(toolOutput.mode !== undefined && { mode: toolOutput.mode }),
      ...(toolOutput.remainingWords !== undefined && { remainingWords: toolOutput.remainingWords }),
      ...(toolOutput.solvedGroups !== undefined && { solvedGroups: toolOutput.solvedGroups }),
      ...(toolOutput.mistakeCount !== undefined && { mistakeCount: toolOutput.mistakeCount }),
      ...(toolOutput.mistakesRemaining !== undefined && { mistakesRemaining: toolOutput.mistakesRemaining }),
      ...(toolOutput.status !== undefined && { status: toolOutput.status }),
      ...((isNewGame || isGuessResult) && { selectedWords: [] }),
    };

    if (Object.keys(updates).length > 0) {
      setState((prev) => ({ ...prev, ...updates }));
    }
  }

  // Render: No active game
  if (!state.gameId) {
    return (
      <div className="connections-widget p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Connections</h2>
        <p className="text-gray-600">Ask me to start a game of Connections!</p>
        <p className="text-sm text-gray-500 mt-2">Find 4 groups of 4 related words</p>
      </div>
    );
  }

  // Toggle word selection
  const toggleWord = (word: string): void => {
    if (state.status !== "playing") return;

    setState((prev: ConnectionsState) => {
      const isSelected = prev.selectedWords.includes(word);
      if (isSelected) {
        return { ...prev, selectedWords: prev.selectedWords.filter((w: string) => w !== word) };
      } else if (prev.selectedWords.length < 4) {
        return { ...prev, selectedWords: [...prev.selectedWords, word] };
      }
      return prev;
    });
  };

  // Render mistake dots
  function renderMistakeDots(): JSX.Element[] {
    const remainingDots = Array.from({ length: state.mistakesRemaining }, (_, i) => (
      <span key={i} className="w-3 h-3 bg-gray-800 rounded-full inline-block mx-0.5" />
    ));
    const usedDots = Array.from({ length: state.mistakeCount }, (_, i) => (
      <span key={`used-${i}`} className="w-3 h-3 bg-gray-300 rounded-full inline-block mx-0.5" />
    ));
    return [...remainingDots, ...usedDots];
  }

  return (
    <div className="connections-widget p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">Connections</h2>

      {/* Solved groups */}
      {state.solvedGroups.length > 0 && (
        <div className="mb-4 space-y-2">
          {state.solvedGroups.map((group, idx) => {
            const colors = DIFFICULTY_COLORS[group.difficulty] || DIFFICULTY_COLORS.yellow;
            return (
              <div
                key={idx}
                className="p-3 rounded-lg text-center"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                <div className="font-bold uppercase text-sm">{group.category}</div>
                <div className="text-xs mt-1">{group.words.join(", ")}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Word grid */}
      {state.remainingWords.length > 0 && state.status === "playing" && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {state.remainingWords.map((word, idx) => {
            const isSelected = state.selectedWords.includes(word);
            return (
              <button
                key={idx}
                onClick={() => toggleWord(word)}
                className={`
                  p-2 rounded-lg text-xs font-bold uppercase
                  transition-all duration-200
                  ${isSelected
                    ? "bg-gray-800 text-white scale-95"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }
                `}
                style={{ minHeight: "50px" }}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}

      {/* Selection count and mistakes */}
      {state.status === "playing" && (
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <div>Selected: {state.selectedWords.length}/4</div>
          <div className="flex items-center">
            <span className="mr-2">Mistakes:</span>
            {renderMistakeDots()}
          </div>
        </div>
      )}

      {/* Game over state */}
      {state.status === "won" && (
        <div className="text-center p-4 bg-green-100 rounded-lg">
          <div className="text-2xl mb-2">🎉</div>
          <div className="font-bold text-green-800">Congratulations!</div>
          <div className="text-sm text-green-600">You found all 4 groups!</div>
        </div>
      )}

      {state.status === "lost" && (
        <div className="text-center p-4 bg-red-100 rounded-lg">
          <div className="text-2xl mb-2">💔</div>
          <div className="font-bold text-red-800">Game Over</div>
          <div className="text-sm text-red-600">Better luck next time!</div>
        </div>
      )}

      {/* Instructions */}
      {state.status === "playing" && state.selectedWords.length === 4 && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Ask me to submit your guess!
        </div>
      )}
    </div>
  );
}

export default Connections;
