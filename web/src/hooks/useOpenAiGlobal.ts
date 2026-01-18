import { useEffect, useState } from "react";

/**
 * Base hook for accessing window.openai properties with reactive updates.
 *
 * This hook subscribes to changes in the window.openai global object
 * and updates the component when the specified property changes.
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
  const [value, setValue] = useState<T>();

  useEffect(() => {
    const checkValue = () => {
      const openai = (window as any).openai;
      if (openai?.[key] !== value) {
        setValue(openai?.[key]);
      }
    };

    // Initial check
    checkValue();

    // Poll for changes (ChatGPT updates window.openai dynamically)
    const interval = setInterval(checkValue, 100);

    return () => clearInterval(interval);
  }, [key, value]);

  return value;
}
