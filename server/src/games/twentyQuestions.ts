/**
 * Twenty Questions game logic.
 *
 * Classic guessing game with two modes:
 * - AI Guesses: User thinks of something, AI asks yes/no questions to guess it
 * - User Guesses: AI thinks of something, user asks yes/no questions to guess it
 *
 * @module games/twentyQuestions
 */

// Game constants
const MAX_QUESTIONS = 20;
const MIN_QUESTION_LENGTH = 3;

/**
 * Game mode types.
 */
export type GameMode = "ai-guesses" | "user-guesses";

/**
 * Answer types for yes/no questions.
 */
export type AnswerType = "yes" | "no" | "maybe" | "unknown";

/**
 * Game status.
 */
export type GameStatus = "playing" | "won" | "lost";

/**
 * Question category types.
 */
export type Category = "people" | "places" | "things" | "characters" | "any";

/**
 * Represents a single question-answer pair in the game.
 */
export interface QuestionAnswer {
  /** Question number (1-20) */
  questionNumber: number;
  /** The question text */
  question: string;
  /** The answer given (yes/no/maybe/unknown) */
  answer?: AnswerType;
  /** Who asked the question */
  askedBy: "ai" | "user";
  /** Timestamp when question was asked */
  timestamp: number;
}

/**
 * Complete game state (immutable).
 */
export interface TwentyQuestionsState {
  /** Game mode */
  readonly mode: GameMode;
  /** Category of the target */
  readonly category?: Category;
  /** What's being guessed (hidden in ai-guesses mode) */
  readonly target?: string;
  /** All question-answer pairs */
  readonly questionAnswers: readonly QuestionAnswer[];
  /** Current game status */
  readonly status: GameStatus;
  /** Maximum questions allowed */
  readonly maxQuestions: number;
  /** Current question count */
  readonly currentQuestionNumber: number;
}

/**
 * Result of a guess attempt.
 */
export interface GuessResult {
  /** Whether the guess was correct */
  correct: boolean;
  /** The actual target (revealed on game end) */
  target: string;
  /** Whether the AI made the guess */
  wasAI: boolean;
  /** New game status */
  status: GameStatus;
}

/**
 * Twenty Questions game class.
 *
 * Manages the state and logic for a 20 questions game session.
 * ChatGPT handles the intelligent question generation - this class
 * just tracks state and enforces rules.
 */
export class TwentyQuestionsGame {
  private readonly mode: GameMode;
  private readonly category?: Category;
  private readonly target: string;
  private questionAnswers: QuestionAnswer[];
  private status: GameStatus;
  private readonly maxQuestions: number;
  private currentQuestionNumber: number;

  /**
   * Create a new Twenty Questions game.
   *
   * @param mode - Game mode (ai-guesses or user-guesses)
   * @param target - What's being guessed
   * @param category - Optional category for the target
   * @throws {Error} If target is invalid
   */
  constructor(mode: GameMode, target: string, category?: Category) {
    if (!target || target.trim().length === 0) {
      throw new Error("Target must be a non-empty string");
    }

    this.mode = mode;
    this.target = target.trim();
    this.category = category;
    this.questionAnswers = [];
    this.status = "playing";
    this.maxQuestions = MAX_QUESTIONS;
    this.currentQuestionNumber = 1;
  }

  /**
   * Record a question asked by the AI or user.
   *
   * @param question - The question text
   * @param askedBy - Who asked the question
   * @throws {Error} If game is over or question is invalid
   */
  askQuestion(question: string, askedBy: "ai" | "user"): void {
    if (this.status !== "playing") {
      throw new Error("Game is not in playing state");
    }

    if (this.currentQuestionNumber > this.maxQuestions) {
      throw new Error(`Maximum of ${this.maxQuestions} questions reached`);
    }

    const trimmed = question.trim();
    if (trimmed.length < MIN_QUESTION_LENGTH) {
      throw new Error(`Question must be at least ${MIN_QUESTION_LENGTH} characters`);
    }

    const qa: QuestionAnswer = {
      questionNumber: this.currentQuestionNumber,
      question: trimmed,
      askedBy,
      timestamp: Date.now(),
    };

    this.questionAnswers.push(qa);
  }

  /**
   * Submit an answer to the most recent question.
   *
   * @param answer - The answer (yes/no/maybe/unknown)
   * @throws {Error} If no question to answer or game is over
   */
  submitAnswer(answer: AnswerType): void {
    if (this.status !== "playing") {
      throw new Error("Game is not in playing state");
    }

    if (this.questionAnswers.length === 0) {
      throw new Error("No question to answer");
    }

    const lastQuestion = this.questionAnswers[this.questionAnswers.length - 1];
    if (lastQuestion.answer) {
      throw new Error("Last question already has an answer");
    }

    // Update the last question with the answer
    lastQuestion.answer = answer;

    // Move to next question number
    this.currentQuestionNumber++;

    // Check if max questions reached without a guess
    if (this.currentQuestionNumber > this.maxQuestions) {
      this.status = "lost";
    }
  }

  /**
   * Make a final guess at the target.
   *
   * @param guess - The guess text
   * @returns Guess result with correctness and revealed target
   * @throws {Error} If game is over
   */
  makeGuess(guess: string): GuessResult {
    if (this.status !== "playing") {
      throw new Error("Game is not in playing state");
    }

    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedTarget = this.target.toLowerCase();

    // Check if guess matches target (case-insensitive)
    const correct = normalizedGuess === normalizedTarget;

    this.status = correct ? "won" : "lost";

    return {
      correct,
      target: this.target,
      wasAI: this.mode === "ai-guesses",
      status: this.status,
    };
  }

  /**
   * Get current game state (immutable).
   *
   * @returns Current state
   */
  getState(): Readonly<TwentyQuestionsState> {
    return {
      mode: this.mode,
      category: this.category,
      // Hide target in ai-guesses mode while game is playing
      target: this.mode === "user-guesses" || this.status !== "playing"
        ? this.target
        : undefined,
      questionAnswers: [...this.questionAnswers],
      status: this.status,
      maxQuestions: this.maxQuestions,
      currentQuestionNumber: this.currentQuestionNumber,
    };
  }

  /**
   * Check if game is over.
   *
   * @returns True if game is won or lost
   */
  isGameOver(): boolean {
    return this.status !== "playing";
  }

  /**
   * Get number of questions asked so far.
   *
   * @returns Question count
   */
  getQuestionCount(): number {
    return this.questionAnswers.length;
  }

  /**
   * Get number of questions remaining.
   *
   * @returns Remaining questions
   */
  getQuestionsRemaining(): number {
    return Math.max(0, this.maxQuestions - this.currentQuestionNumber + 1);
  }

  /**
   * Generate share text for social media.
   *
   * Format:
   * ```
   * Twenty Questions 🎯
   * Mode: AI Guesses
   * Result: Won in 12 questions
   * Target: Eiffel Tower
   * ```
   *
   * @returns Formatted share text
   */
  getShareText(): string {
    const modeText = this.mode === "ai-guesses" ? "AI Guesses" : "I Guess";
    const resultText = this.status === "won"
      ? `Won in ${this.questionAnswers.length} questions`
      : `Lost (${this.questionAnswers.length} questions)`;
    const categoryText = this.category ? `\nCategory: ${this.category}` : "";

    return [
      "Twenty Questions 🎯",
      `Mode: ${modeText}`,
      `Result: ${resultText}`,
      `Target: ${this.target}`,
      categoryText,
    ]
      .filter(Boolean)
      .join("\n");
  }
}
