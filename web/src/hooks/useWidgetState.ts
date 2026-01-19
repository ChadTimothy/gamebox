import { useState, useEffect, useCallback, useRef } from "react";
import { useOpenAiGlobal } from "./useOpenAiGlobal";

/**
 * Type for setState actions (value or updater function).
 */
type SetStateAction<T> = T | ((prev: T) => T);

/**
 * Hook for managing persistent widget state that syncs with ChatGPT.
 *
 * This hook uses the official OpenAI pattern:
 * 1. Hydrates initial state from window.openai.widgetState (or defaultState)
 * 2. Subscribes to future updates via useOpenAiGlobal("widgetState")
 * 3. Mirrors writes back through window.openai.setWidgetState()
 *
 * This keeps the widget in sync even if multiple components mutate the same state.
 *
 * IMPORTANT: Keep state under 4k tokens to avoid truncation.
 *
 * @param defaultState - The default state value or initializer function
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
  defaultState: T | (() => T)
): [T, (state: SetStateAction<T>) => void] {
  // Subscribe to widgetState updates from ChatGPT
  const widgetStateFromWindow = useOpenAiGlobal<T>("widgetState");

  // Track if we're currently updating to prevent circular updates
  const isUpdatingRef = useRef(false);

  // Initialize local state
  const [widgetState, _setWidgetState] = useState<T>(() => {
    // Prioritize state from window.openai if available
    if (widgetStateFromWindow != null) {
      return widgetStateFromWindow;
    }

    // Otherwise use defaultState (or call it if it's a function)
    return typeof defaultState === "function"
      ? (defaultState as () => T)()
      : defaultState;
  });

  // Sync with updates from window.openai (only if we didn't cause the update)
  useEffect(() => {
    if (widgetStateFromWindow != null && !isUpdatingRef.current) {
      _setWidgetState(widgetStateFromWindow);
    }
  }, [widgetStateFromWindow]);

  // Create setter that persists to ChatGPT
  const setWidgetState = useCallback(
    (state: SetStateAction<T>) => {
      _setWidgetState((prevState) => {
        const newState =
          typeof state === "function" ? (state as (prev: T) => T)(prevState) : state;

        // Persist to ChatGPT with a flag to prevent echo
        isUpdatingRef.current = true;
        const openai = (window as any).openai;
        if (openai?.setWidgetState) {
          try {
            openai.setWidgetState(newState);
          } catch (error) {
            console.error("Error persisting widget state:", error);
          }
        }

        // Reset flag on next tick
        queueMicrotask(() => {
          isUpdatingRef.current = false;
        });

        return newState;
      });
    },
    []
  );

  return [widgetState, setWidgetState] as const;
}
