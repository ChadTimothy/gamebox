/**
 * Twenty Questions widget component.
 *
 * Displays a minimal UI for the 20 Questions game:
 * - Game mode (AI Guesses or User Guesses)
 * - Question counter and remaining questions
 * - Question/answer history
 * - Game status
 *
 * Most gameplay happens through chat interaction.
 *
 * @module widgets/TwentyQuestions
 */

import { useWidgetState } from "../hooks/useWidgetState.js";
import { useOpenAiGlobal } from "../hooks/useOpenAiGlobal.js";
import type { GameStatus } from "../types/game.js";

/**
 * Game mode types.
 */
type GameMode = "ai-guesses" | "user-guesses";

/**
 * Answer types for yes/no questions.
 */
type AnswerType = "yes" | "no" | "maybe" | "unknown";

/**
 * Question category types.
 */
type Category = "people" | "places" | "things" | "characters" | "any";

/**
 * Question-answer pair.
 */
interface QuestionAnswer {
  questionNumber: number;
  question: string;
  answer?: AnswerType;
  askedBy: "ai" | "user";
}

/**
 * Tool output from MCP server.
 */
interface TwentyQuestionsToolOutput {
  gameId?: string;
  mode?: GameMode;
  category?: Category;
  target?: string;
  questionAnswers?: QuestionAnswer[];
  currentQuestionNumber?: number;
  questionsRemaining?: number;
  status?: GameStatus;
  message?: string;
}

/**
 * Widget state persisted across sessions.
 */
interface TwentyQuestionsState {
  gameId?: string;
  mode?: GameMode;
  category?: Category;
  target?: string;
  questionAnswers: QuestionAnswer[];
  currentQuestionNumber: number;
  questionsRemaining: number;
  status: GameStatus;
}

/**
 * Default initial state.
 */
const DEFAULT_STATE: TwentyQuestionsState = {
  questionAnswers: [],
  currentQuestionNumber: 1,
  questionsRemaining: 20,
  status: "playing",
};

/**
 * Twenty Questions game widget.
 */
export function TwentyQuestions(): JSX.Element {
  // Persisted state
  const [state, setState] = useWidgetState<TwentyQuestionsState>(DEFAULT_STATE);

  // Tool output listener
  const toolOutput = useOpenAiGlobal<TwentyQuestionsToolOutput>("toolOutput");

  // Update state when tool output changes
  if (toolOutput) {
    const updates: Partial<TwentyQuestionsState> = {};

    if (toolOutput.gameId !== undefined) updates.gameId = toolOutput.gameId;
    if (toolOutput.mode !== undefined) updates.mode = toolOutput.mode;
    if (toolOutput.category !== undefined) updates.category = toolOutput.category;
    if (toolOutput.target !== undefined) updates.target = toolOutput.target;
    if (toolOutput.questionAnswers !== undefined) updates.questionAnswers = toolOutput.questionAnswers;
    if (toolOutput.currentQuestionNumber !== undefined) updates.currentQuestionNumber = toolOutput.currentQuestionNumber;
    if (toolOutput.questionsRemaining !== undefined) updates.questionsRemaining = toolOutput.questionsRemaining;
    if (toolOutput.status !== undefined) updates.status = toolOutput.status;

    if (Object.keys(updates).length > 0) {
      setState((prev) => ({ ...prev, ...updates }));
    }
  }

  // Helper to format mode for display
  const formatMode = (mode?: GameMode): string => {
    if (!mode) return "";
    return mode === "ai-guesses" ? "AI Guesses" : "User Guesses";
  };

  // Helper to format answer for display
  const formatAnswer = (answer?: AnswerType): string => {
    if (!answer) return "...";
    return answer.charAt(0).toUpperCase() + answer.slice(1);
  };

  // Render: No active game
  if (!state.gameId) {
    return (
      <div className="twenty-questions-widget" style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
        <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>Twenty Questions 🎯</h2>
        <p style={{ color: "#666", margin: "0" }}>
          Ask me to start a game of 20 Questions!
        </p>
        <div style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
          <p><strong>AI Guesses mode:</strong> Think of something, I'll ask yes/no questions</p>
          <p><strong>User Guesses mode:</strong> I'll think of something, you ask questions</p>
        </div>
      </div>
    );
  }

  // Render: Active game
  return (
    <div className="twenty-questions-widget" style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ margin: "0 0 4px 0", fontSize: "24px" }}>Twenty Questions 🎯</h2>

      {/* Game info */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#666" }}>
        <div><strong>Mode:</strong> {formatMode(state.mode)}</div>
        {state.category && state.category !== "any" && (
          <div><strong>Category:</strong> {state.category}</div>
        )}
        {state.target && (
          <div><strong>Target:</strong> {state.target}</div>
        )}
      </div>

      {/* Question counter */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginBottom: "16px",
        padding: "12px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
      }}>
        <div>
          <div style={{ fontSize: "12px", color: "#666" }}>Question</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {state.currentQuestionNumber - 1}/20
          </div>
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#666" }}>Remaining</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {state.questionsRemaining}
          </div>
        </div>
      </div>

      {/* Question history */}
      {state.questionAnswers.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Question History</h3>
          <div style={{
            maxHeight: "200px",
            overflowY: "auto",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "8px",
          }}>
            {state.questionAnswers.map((qa) => (
              <div
                key={qa.questionNumber}
                style={{
                  marginBottom: "8px",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div style={{ fontSize: "12px", color: "#999" }}>
                  Q{qa.questionNumber} {qa.askedBy === "ai" ? "🤖" : "👤"}
                </div>
                <div style={{ fontSize: "14px", marginTop: "4px" }}>
                  {qa.question}
                </div>
                {qa.answer && (
                  <div style={{
                    fontSize: "13px",
                    color: "#2563eb",
                    marginTop: "4px",
                    fontWeight: "500",
                  }}>
                    → {formatAnswer(qa.answer)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game status */}
      {state.status !== "playing" && (
        <div style={{
          padding: "12px",
          backgroundColor: state.status === "won" ? "#dcfce7" : "#fee2e2",
          borderRadius: "8px",
          textAlign: "center",
          fontWeight: "bold",
        }}>
          {state.status === "won" ? "🎉 Correct!" : "Game Over"}
        </div>
      )}
    </div>
  );
}
