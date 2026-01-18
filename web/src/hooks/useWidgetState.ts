import { useState, useEffect, useCallback } from "react";

/**
 * Hook for managing persistent widget state that syncs with ChatGPT.
 *
 * Similar to React's useState, but automatically persists state changes
 * to ChatGPT via window.openai.setWidgetState(). State is restored when
 * the widget remounts.
 *
 * IMPORTANT: Keep state under 4k tokens to avoid truncation.
 *
 * @param initialState - The initial state value
 * @returns A tuple of [state, setState] similar to React.useState
 *
 * @example
 * ```tsx
 * interface GameState {
 *   guesses: string[];
 *   score: number;
 *   streak: number;
 * }
 *
 * function GameWidget() {
 *   const [state, setState] = useWidgetState<GameState>({
 *     guesses: [],
 *     score: 0,
 *     streak: 0,
 *   });
 *
 *   const makeGuess = (word: string) => {
 *     setState(prev => ({
 *       ...prev,
 *       guesses: [...prev.guesses, word],
 *     }));
 *   };
 *
 *   return <div>Score: {state.score}</div>;
 * }
 * ```
 */
export function useWidgetState<T>(
  initialState: T
): [T, (state: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate state from window.openai.widgetState on mount
  useEffect(() => {
    const openai = (window as any).openai;
    if (openai?.widgetState) {
      setState(openai.widgetState);
    }
    setIsHydrated(true);
  }, []);

  // Persist state to ChatGPT
  const setWidgetState = useCallback(
    (nextState: T | ((prev: T) => T)) => {
      setState((prevState) => {
        const computed =
          typeof nextState === "function"
            ? (nextState as (prev: T) => T)(prevState)
            : nextState;

        // Persist to ChatGPT (only after hydration to avoid overwriting)
        if (isHydrated && (window as any).openai?.setWidgetState) {
          (window as any).openai.setWidgetState(computed);
        }

        return computed;
      });
    },
    [isHydrated]
  );

  return [state, setWidgetState];
}
