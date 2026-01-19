# Implement Twenty Queries Game (AI-Powered Guessing Game)

## Overview

Implement the **Twenty Queries** game - an AI-powered guessing game where players ask yes/no questions to identify a secret concept. The AI thinks through each question and provides thoughtful responses.

**Game Type**: Logic/Deduction with AI
**Complexity**: High (requires AI integration)
**Estimated Time**: 14-18 hours

## Game Description

The AI picks a secret thing (object, person, place, concept). Players have 20 questions to figure out what it is by asking yes/no questions. The AI shows its "thinking" process and provides hints based on question quality.

### Core Gameplay

1. **Setup**: AI selects a secret concept from a curated list
2. **Objective**: Identify the secret in 20 questions or fewer
3. **Questions**: Players ask yes/no questions
4. **AI Thinking**: AI shows reasoning before answering
5. **Hints**: AI provides hints based on question quality and progress
6. **Win Condition**: Correct guess within 20 questions

### Game Modes

- **Daily Challenge**: Same secret for all players each day
- **Category Mode**: Pick a category (animals, technology, famous people, etc.)
- **Difficulty Levels**: Easy (broad hints), Medium (standard), Hard (minimal hints)

## Implementation Checklist

### Phase 1: Backend - Game Logic (4-5 hours)

- [ ] **Create `/server/src/games/twentyQueries.ts`**

  - [ ] Define types:
    ```typescript
    export type QuestionType = "yes_no" | "open_ended" | "guess";

    export interface Question {
      text: string;
      questionNumber: number;
      type: QuestionType;
      timestamp: Date;
    }

    export interface Answer {
      response: "yes" | "no" | "partially" | "unknown";
      reasoning: string;  // AI's thought process
      hint?: string;      // Optional hint based on question quality
    }

    export interface Guess {
      guess: string;
      correct: boolean;
      questionsUsed: number;
      timestamp: Date;
    }

    export interface TwentyQueriesGameState {
      readonly secretThing: string;  // Hidden from response
      readonly category: string;
      readonly questions: readonly Question[];
      readonly answers: readonly Answer[];
      readonly guesses: readonly Guess[];
      readonly status: GameStatus;
      readonly questionsRemaining: number;
      readonly difficulty: "easy" | "medium" | "hard";
    }
    ```

  - [ ] Implement `TwentyQueriesGame` class:
    ```typescript
    export class TwentyQueriesGame {
      constructor(secretThing: string, category: string, difficulty: string) { }

      askQuestion(question: string): { answer: Answer; questionNumber: number }
      makeGuess(guess: string): Guess

      // AI-powered methods (to be integrated with Claude/GPT)
      generateReasoning(question: string, secret: string): string
      generateHint(questionNumber: number, questionQuality: "good" | "poor"): string
      evaluateQuestionQuality(question: string): "good" | "poor"

      getState(): Readonly<TwentyQueriesGameState>
      isGameOver(): boolean
      getShareText(): string
    }
    ```

  - [ ] Implement question validation:
    - [ ] Detect yes/no vs. open-ended
    - [ ] Validate question count (max 20)
    - [ ] Handle edge cases (unclear questions)

  - [ ] Implement AI reasoning generation:
    ```typescript
    async function generateReasoning(
      question: string,
      secret: string
    ): Promise<{ response: "yes" | "no"; reasoning: string }> {
      // Call Claude API or use rule-based system
      // Example output:
      // {
      //   response: "yes",
      //   reasoning: "The secret is a bicycle. Since a bicycle has wheels
      //               and is a mode of transportation, the answer is yes."
      // }
    }
    ```

  - [ ] Implement hint system:
    ```typescript
    function generateHint(
      questionNumber: number,
      questionQuality: "good" | "poor",
      category: string
    ): string {
      if (questionQuality === "poor") {
        return "Try asking about physical characteristics or common uses.";
      }

      if (questionNumber > 15) {
        return "You're close! Think about items commonly used outdoors.";
      }

      return "";  // No hint yet
    }
    ```

  - [ ] Implement share text (question count + win/lose)

- [ ] **Create `/server/src/games/twentyQueries.test.ts`**
  - [ ] Test constructor validation
  - [ ] Test question asking (valid/invalid)
  - [ ] Test question count tracking
  - [ ] Test guess validation
  - [ ] Test win condition (correct guess)
  - [ ] Test lose condition (20 questions exhausted)
  - [ ] Test reasoning generation (mock AI responses)
  - [ ] Test hint generation
  - [ ] Test question quality evaluation
  - [ ] Test state immutability
  - [ ] **Target**: 40+ tests, >80% coverage

### Phase 2: Backend - Data & Tools (3-4 hours)

- [ ] **Create `/server/src/data/secretThings.ts`**

  - [ ] Define 100+ secret concepts:
    ```typescript
    export interface SecretThing {
      id: string;
      name: string;
      category: string;
      difficulty: "easy" | "medium" | "hard";
      hints: string[];  // Progressive hints
      commonQuestions: Array<{ question: string; answer: "yes" | "no" }>;
    }

    export const SECRET_THINGS: readonly SecretThing[] = [
      {
        id: "bicycle",
        name: "Bicycle",
        category: "transportation",
        difficulty: "easy",
        hints: [
          "It has two wheels",
          "You can ride it",
          "It's powered by pedaling",
        ],
        commonQuestions: [
          { question: "Is it alive?", answer: "no" },
          { question: "Is it made by humans?", answer: "yes" },
          { question: "Does it have wheels?", answer: "yes" },
        ],
      },
      // ... more things
    ];

    export const CATEGORIES = [
      "animals",
      "transportation",
      "technology",
      "famous people",
      "places",
      "food",
      "abstract concepts",
    ] as const;
    ```

  - [ ] Implement `getDailySecret(date: Date): SecretThing`
  - [ ] Implement `getRandomSecret(category?: string, difficulty?: string): SecretThing`

- [ ] **Update `/server/src/index.ts`** - Register MCP Tools

  **Zod Schemas**:
  ```typescript
  const startTwentyQueriesSchema = z.object({
    mode: z.enum(["daily", "category"]).default("daily"),
    category: z.enum(CATEGORIES).optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  });

  const askQuestionSchema = z.object({
    gameId: z.string().min(1),
    question: z.string().min(5).max(200),
  });

  const makeGuessSchema = z.object({
    gameId: z.string().min(1),
    guess: z.string().min(1).max(100),
  });
  ```

  **JSON Schemas** (duplicate for ChatGPT):
  ```typescript
  const startTwentyQueriesJsonSchema = { /* ... */ };
  const askQuestionJsonSchema = { /* ... */ };
  const makeGuessJsonSchema = { /* ... */ };
  ```

  **Tools to Register**:
  - [ ] `gamebox.start_twenty_queries` - Start new game
    - Input: `{ mode, category?, difficulty? }`
    - Output: Game state (secret hidden), category revealed, difficulty

  - [ ] `gamebox.ask_question` - Ask a yes/no question
    - Input: `{ gameId, question }`
    - Output: Answer (yes/no), AI reasoning, optional hint, questions remaining

  - [ ] `gamebox.make_twenty_queries_guess` - Submit a guess
    - Input: `{ gameId, guess }`
    - Output: Correct/incorrect, reveal secret if wrong, game status

  - [ ] Update game menu:
    ```typescript
    games: [
      { id: "word-morph", name: "Word Morph" },
      { id: "kinship", name: "Kinship" },
      { id: "lexicon-smith", name: "Lexicon Smith" },
      { id: "twenty-queries", name: "Twenty Queries" },  // Add this
      // ...
    ]
    ```

  - [ ] Register widget resource:
    ```typescript
    server.registerResource(
      "twenty-queries-widget",
      "ui://widget/twenty-queries.html",
      {},
      async () => ({
        contents: [{
          uri: "ui://widget/twenty-queries.html",
          mimeType: "text/html+skybridge",
          text: getTwentyQueriesWidgetHtml(),
          _meta: getWidgetMetadata(),
        }],
      })
    );
    ```

### Phase 3: Frontend - Widget Component (4-5 hours)

- [ ] **Create `/web/src/widgets/TwentyQueries.tsx`**

  **Main Component Structure**:
  ```typescript
  interface TwentyQueriesState {
    gameId?: string;
    category?: string;
    questions: Question[];
    answers: Answer[];
    guesses: Guess[];
    status: GameStatus;
    questionsRemaining: number;
    streak: number;
  }

  export function TwentyQueries(): JSX.Element {
    const [state, setState] = useWidgetState<TwentyQueriesState>(DEFAULT_STATE);
    const toolOutput = useOpenAiGlobal<ToolOutput>("toolOutput");

    // UI state
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentGuess, setCurrentGuess] = useState("");
    const [showGuessInput, setShowGuessInput] = useState(false);
    const [message, setMessage] = useState("");

    // Render conversation history (questions + answers)
    // Render AI thinking bubbles
    // Render question input
    // Render guess button + input
    // Render questions remaining counter
  }
  ```

  **Sub-Components to Create**:
  - [ ] `ConversationBubble` - Question/answer chat interface
  - [ ] `ThinkingBubble` - AI reasoning visualization (animated dots, then text reveal)
  - [ ] `QuestionInput` - Text input for questions
  - [ ] `GuessInput` - Text input for final guess
  - [ ] `QuestionsRemaining` - Progress bar/counter (20 → 0)
  - [ ] `QuestionQualityMeter` - Visual indicator of question quality (★★★★☆)

  **Visual Design**:
  ```css
  /* CSS Variables */
  :root {
    --twenty-queries-user: #3B82F6;       /* Blue - user questions */
    --twenty-queries-ai: #8B5CF6;         /* Purple - AI answers */
    --twenty-queries-thinking: #F59E0B;   /* Amber - AI thinking */
    --twenty-queries-correct: #10B981;    /* Emerald - correct guess */
    --twenty-queries-incorrect: #EF4444;  /* Red - incorrect */
    --twenty-queries-background: #F9FAFB;
  }
  ```

  - [ ] Implement conversation bubble interface (chat-like layout)
  - [ ] Implement AI thinking animation (dots → reasoning reveal)
  - [ ] Implement smooth scroll to latest message
  - [ ] Implement question quality meter (visual feedback)
  - [ ] Implement celebration animation on correct guess
  - [ ] Make responsive for mobile (375x667)

  **Key Features**:
  - [ ] Type question and press Enter to submit
  - [ ] See AI thinking process before answer
  - [ ] View question history with answers
  - [ ] Visual quality rating for each question (★ system)
  - [ ] "Make a Guess" button appears after 5 questions
  - [ ] Progress indicator: X/20 questions used
  - [ ] Hint display when AI provides one

- [ ] **Create `/web/src/widgets/TwentyQueries.test.tsx`**
  - [ ] Test title rendering
  - [ ] Test conversation history display
  - [ ] Test question input
  - [ ] Test question submission
  - [ ] Test AI thinking bubble display
  - [ ] Test answer display
  - [ ] Test guess button visibility (after 5 questions)
  - [ ] Test guess input and submission
  - [ ] Test questions remaining counter
  - [ ] **Target**: 12+ tests

### Phase 4: Testing - E2E (3-4 hours)

- [ ] **Create `/e2e/twentyQueries.spec.ts`**

  **Test Categories**:
  - [ ] Server health and tools registration (3 tests)
  - [ ] Game start (daily/category modes) (2 tests)
  - [ ] Ask yes/no question (2 tests)
  - [ ] AI reasoning generation (1 test)
  - [ ] Hint generation (2 tests)
  - [ ] Question quality evaluation (2 tests)
  - [ ] Make correct guess (1 test)
  - [ ] Make incorrect guess (1 test)
  - [ ] Exhaust 20 questions (lose condition) (1 test)
  - [ ] Game menu display (1 test)

  **Example Test**:
  ```typescript
  test("should provide AI reasoning with answer", async ({ request }) => {
    const startResponse = await mcpCall(request, "tools/call", {
      name: "gamebox.start_twenty_queries",
      arguments: { mode: "daily" },
    });

    const { gameId } = startResponse.json().result.structuredContent;

    const questionResponse = await mcpCall(request, "tools/call", {
      name: "gamebox.ask_question",
      arguments: { gameId, question: "Is it alive?" },
    });

    const data = await questionResponse.json();
    expect(data.result.structuredContent.answer.response).toMatch(/^(yes|no)$/);
    expect(data.result.structuredContent.answer.reasoning).toBeDefined();
    expect(data.result.structuredContent.answer.reasoning.length).toBeGreaterThan(10);
  });

  test("should accept correct guess and end game", async ({ request }) => {
    // Start game
    // Ask questions to narrow down
    // Make correct guess
    // Expect status: "won", correct: true
  });
  ```

  - [ ] **Target**: 16+ tests, all passing

- [ ] **Create `/e2e/widget-ui-twenty-queries.spec.ts`**
  - [ ] Test widget rendering (title, category)
  - [ ] Test question input field
  - [ ] Test question submission
  - [ ] Test conversation history display
  - [ ] Test AI thinking bubble appearance
  - [ ] Test answer display with reasoning
  - [ ] Test guess button visibility
  - [ ] Test guess submission
  - [ ] Test questions remaining counter
  - [ ] Test responsive layout (mobile)
  - [ ] **Target**: 12+ tests

- [ ] **Create `/e2e/widget-screenshots-twenty-queries.spec.ts`**
  - [ ] Capture initial state (empty conversation)
  - [ ] Capture with questions/answers
  - [ ] Capture AI thinking bubble
  - [ ] Capture guess input
  - [ ] Capture win state
  - [ ] Capture mobile viewport

### Phase 5: Integration & Polish (2-3 hours)

- [ ] **AI Integration** (if not done in Phase 1)
  - [ ] Integrate with Claude API for reasoning generation
  - [ ] OR implement rule-based reasoning system
  - [ ] Handle API errors gracefully
  - [ ] Add caching for common questions

- [ ] **Update Documentation**
  - [ ] Add Twenty Queries to `/README.md` game list
  - [ ] Update `/CONTRIBUTING.md` with Twenty Queries examples
  - [ ] Add AI integration notes to documentation

- [ ] **Verify Integration**
  - [ ] Run all tests: `npm test` (server + web)
  - [ ] Run E2E tests: `npm run test:e2e`
  - [ ] Type check: `npm run type-check`
  - [ ] Build: `npm run build` (both server and web)
  - [ ] Manual testing:
    - [ ] Start server, load widget in browser
    - [ ] Test daily mode
    - [ ] Test category mode
    - [ ] Test AI reasoning quality
    - [ ] Test hint system
    - [ ] Test question quality meter
    - [ ] Test win/lose conditions
    - [ ] Test mobile responsiveness

- [ ] **Code Quality**
  - [ ] Run code simplifier if available
  - [ ] Review for consistency with Word Morph patterns
  - [ ] Ensure no TODO comments remain
  - [ ] Verify error messages are user-friendly
  - [ ] Check accessibility (keyboard navigation, ARIA labels)

## AI Enhancement Features (from GAME_ENHANCEMENT_SPEC.md)

Implement these AI-powered features:

### 1. Thought Bubble Visualization
```typescript
// User asks question
User: "Is it alive?"

// AI thinking bubble appears (animated dots)
🤔 Thinking...

// Reasoning reveals after 1-2 seconds
🤔 "They're testing the living/non-living boundary first.
   Smart opening move. The secret is a bicycle, which is
   non-living machinery."

// Answer displayed
AI: "No, it is not alive."
```

### 2. Question Quality Meter
```typescript
// Good question (eliminates many possibilities)
Question: "Is it bigger than a breadbox?"
Quality: ★★★★☆ (Classic size elimination!)

// Poor question (too specific too soon)
Question: "Is it a bicycle?"
Quality: ★☆☆☆☆ (Too specific! Try broader categories first)

// Excellent question (logical elimination)
Question: "Is it made by humans?"
Quality: ★★★★★ (Perfect! Narrows down significantly)
```

### 3. Adaptive Hint System
```typescript
// Early game (questions 1-5): No hints
// Mid game (questions 6-12): Subtle hints
Hint: "Think about how people get around..."

// Late game (questions 13-17): More specific
Hint: "It's something you'd find outdoors, often on a sidewalk or road"

// End game (questions 18-20): Very specific
Hint: "It has two wheels and you power it with your legs"
```

### 4. Category-Specific Guidance
```typescript
// When category is "transportation"
Initial Message: "I'm thinking of a form of transportation.
                 Start with broad questions about size, power source,
                 or typical use!"

// When category is "famous people"
Initial Message: "I'm thinking of a famous person.
                 Try asking about their field (entertainment, politics,
                 sports, etc.) or time period!"
```

## Success Criteria

- [ ] All unit tests passing (40+ tests, >80% coverage)
- [ ] All E2E tests passing (16+ tests)
- [ ] All widget UI tests passing (12+ tests)
- [ ] Type checking passes with zero errors
- [ ] Builds succeed (server + web)
- [ ] Server starts without errors or warnings
- [ ] Widget renders correctly in browser
- [ ] Conversation bubble interface works smoothly
- [ ] AI reasoning generates appropriately (or rule-based fallback)
- [ ] Question quality meter displays correctly
- [ ] Hints generate at appropriate times
- [ ] Win/lose states display correctly
- [ ] Share text generates correctly
- [ ] Streaks update correctly for daily mode
- [ ] Mobile responsive (tested at 375x667)
- [ ] Keyboard navigation works (Enter to submit)
- [ ] No console errors or warnings

## References

- **Implementation Patterns**: `/docs/IMPLEMENTATION_PATTERNS.md`
- **Game Enhancement Spec**: `/docs/GAME_ENHANCEMENT_SPEC.md` (Twenty Queries section)
- **Word Morph Reference**: `/server/src/games/wordMorph.ts`, `/web/src/widgets/WordMorph.tsx`
- **Testing Reference**: `/e2e/word-morph.spec.ts`

## Estimated Timeline

- Phase 1: 4-5 hours (Backend logic with AI)
- Phase 2: 3-4 hours (Data & MCP tools)
- Phase 3: 4-5 hours (Frontend widget)
- Phase 4: 3-4 hours (E2E testing)
- Phase 5: 2-3 hours (AI integration & polish)

**Total**: 16-21 hours

## Labels

`enhancement`, `game-implementation`, `twenty-queries`, `ai-integration`, `priority-medium`
