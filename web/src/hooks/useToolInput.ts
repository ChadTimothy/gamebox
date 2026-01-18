import { useOpenAiGlobal } from "./useOpenAiGlobal";

/**
 * Hook to access the arguments passed to the current tool call.
 *
 * Returns the input parameters that were provided when the MCP tool
 * was invoked by ChatGPT.
 *
 * @returns The input arguments for the tool call
 *
 * @example
 * ```tsx
 * interface ToolArgs {
 *   mode: 'easy' | 'medium' | 'hard';
 *   category?: string;
 * }
 *
 * function GameWidget() {
 *   const input = useToolInput<ToolArgs>();
 *
 *   return (
 *     <div>
 *       <p>Difficulty: {input?.mode || 'medium'}</p>
 *       {input?.category && <p>Category: {input.category}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useToolInput<T = any>(): T | undefined {
  return useOpenAiGlobal<T>("toolInput");
}
