/**
 * React hooks for integrating with ChatGPT via window.openai API.
 *
 * These hooks provide reactive access to the window.openai global object
 * and enable state persistence across widget re-renders.
 *
 * @module hooks
 */

export { useOpenAiGlobal } from "./useOpenAiGlobal";
export { useToolOutput } from "./useToolOutput";
export { useToolInput } from "./useToolInput";
export { useWidgetState } from "./useWidgetState";
