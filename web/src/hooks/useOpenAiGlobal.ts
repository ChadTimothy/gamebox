import { useSyncExternalStore } from "react";

/**
 * Custom event type for OpenAI global updates.
 */
type SetGlobalsEvent = CustomEvent<{ globals: Record<string, any> }>;

/**
 * Event type dispatched when ChatGPT updates window.openai globals.
 */
const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";

/**
 * Base hook for accessing window.openai properties with reactive updates.
 *
 * This hook uses useSyncExternalStore to subscribe to changes in the
 * window.openai global object via the "openai:set_globals" event.
 * This is the official pattern recommended by OpenAI Apps SDK.
 *
 * @param key - The property key to access from window.openai
 * @returns The current value of window.openai[key]
 *
 * @example
 * ```tsx
 * const metadata = useOpenAiGlobal('toolResponseMetadata');
 * const sessionId = useOpenAiGlobal('sessionId');
 * ```
 */
export function useOpenAiGlobal<T>(key: string): T | undefined {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event: Event) => {
        const customEvent = event as SetGlobalsEvent;
        const value = customEvent.detail?.globals?.[key];

        // Only trigger re-render if this specific key was updated
        if (value === undefined) {
          return;
        }

        onChange();
      };

      // Listen for ChatGPT's global update events
      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true,
      });

      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    () => {
      // Get current snapshot from window.openai
      const openai = (window as any).openai;
      return openai?.[key];
    }
  );
}
