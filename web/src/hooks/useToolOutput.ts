import { useOpenAiGlobal } from "./useOpenAiGlobal";

/**
 * Hook to access structured content returned from MCP tool calls.
 *
 * Returns the `structuredContent` field from the tool's response,
 * which contains the data passed back from the MCP server.
 *
 * @returns The structured content from the tool response
 *
 * @example
 * ```tsx
 * interface GameState {
 *   guesses: string[];
 *   status: 'playing' | 'won' | 'lost';
 *   score: number;
 * }
 *
 * function WordChallengeWidget() {
 *   const data = useToolOutput<GameState>();
 *
 *   return (
 *     <div>
 *       <p>Status: {data?.status}</p>
 *       <p>Score: {data?.score}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useToolOutput<T = any>(): T | undefined {
  return useOpenAiGlobal<T>("toolOutput");
}
