# Implement Lore Master Game (Narrative Trivia)

## Overview

Implement the **Lore Master** game - a narrative-driven trivia game where questions are woven into immersive stories. Players become the protagonist in historical, fictional, or educational scenarios.

**Game Type**: Trivia/Story
**Complexity**: Medium-High
**Estimated Time**: 12-16 hours

## Game Description

Players experience trivia through narrative storytelling. Each question is embedded in an engaging story context, making learning feel like an adventure. The AI adapts the narrative based on correct/incorrect answers.

### Core Gameplay

1. **Setup**: Select a story theme (history, science, literature, pop culture)
2. **Narrative**: Story unfolds with trivia questions embedded naturally
3. **Questions**: Multiple choice (A/B/C/D) with 1 correct answer
4. **Progression**: Story adapts based on answers (branching narrative)
5. **Win Condition**: Complete story with score above threshold

### Game Modes

- **Daily Chronicle**: Same story for all players each day
- **Theme Mode**: Choose from different story themes
- **Challenge Mode**: Timed questions with score multipliers

## Implementation Checklist

### Phase 1: Backend - Game Logic (3-4 hours)

- [ ] **Create `/server/src/games/loreMaster.ts`**

  - [ ] Define types:
    ```typescript
    export interface StorySegment {
      id: string;
      text: string;  // Narrative text (2-3 paragraphs)
      question: string;
      options: string[];  // 4 options (A, B, C, D)
      correctOption: string;  // "A", "B", "C", or "D"
      explanation: string;  // Why this answer is correct
      difficulty: "easy" | "medium" | "hard";
      points: number;
    }

    export interface Story {
      id: string;
      title: string;
      theme: string;
      description: string;
      segments: StorySegment[];
      totalPoints: number;
      passingScore: number;
    }

    export interface AnswerResult {
      correct: boolean;
      selectedOption: string;
      correctOption: string;
      explanation: string;
      pointsEarned: number;
      narrativeFeedback: string;  // Story-specific feedback
    }

    export interface LoreMasterGameState {
      readonly story: Story;
      readonly currentSegment: number;
      readonly answers: readonly AnswerResult[];
      readonly score: number;
      readonly status: GameStatus;
    }
    ```

  - [ ] Implement `LoreMasterGame` class:
    ```typescript
    export class LoreMasterGame {
      constructor(story: Story) { }

      answerQuestion(option: string): AnswerResult
      getCurrentSegment(): StorySegment
      isComplete(): boolean
      hasPassed(): boolean  // score >= passingScore
      getState(): Readonly<LoreMasterGameState>
      getShareText(): string
    }
    ```

  - [ ] Implement answer validation:
    - [ ] Check option is A, B, C, or D
    - [ ] Check if question already answered
    - [ ] Award points for correct answers

  - [ ] Implement narrative feedback:
    ```typescript
    function generateNarrativeFeedback(
      segment: StorySegment,
      correct: boolean
    ): string {
      if (correct) {
        return "Your knowledge serves you well! The story continues...";
      }
      return "That wasn't quite right, but you press on...";
    }
    ```

  - [ ] Implement share text (score + segments completed)

- [ ] **Create `/server/src/games/loreMaster.test.ts`**
  - [ ] Test constructor validation (story with segments)
  - [ ] Test answer validation (valid options A-D)
  - [ ] Test correct answer detection
  - [ ] Test incorrect answer handling
  - [ ] Test point calculation
  - [ ] Test segment progression
  - [ ] Test completion detection
  - [ ] Test passing score calculation
  - [ ] Test state immutability
  - [ ] **Target**: 35+ tests, >85% coverage

### Phase 2: Backend - Data & Tools (3-4 hours)

- [ ] **Create `/server/src/data/stories.ts`**

  - [ ] Define 30+ story templates:
    ```typescript
    export const STORIES: readonly Story[] = [
      {
        id: "library-alexandria",
        title: "The Library of Alexandria",
        theme: "ancient-history",
        description: "Journey through ancient Egypt to save the world's knowledge",
        segments: [
          {
            id: "seg1",
            text: `You stand before the ancient Library of Alexandria, flames
                   beginning to lick at its pillars. The head librarian rushes
                   toward you, clutching a single scroll.

                   'Please,' she gasps, 'tell me - what year is it? I must
                   know if there's time to save the knowledge!'

                   You recall your history lessons...`,
            question: "What year was the Library of Alexandria destroyed?",
            options: [
              "48 BCE (Julius Caesar's siege)",
              "391 CE (Theodosius decree)",
              "640 CE (Muslim conquest)",
              "It was destroyed multiple times throughout history",
            ],
            correctOption: "D",
            explanation: `The Library of Alexandria experienced multiple
                         destructions over centuries, not a single event.
                         The most significant damage occurred during
                         Caesar's siege (48 BCE), Theodosius's decree (391 CE),
                         and the Muslim conquest (640 CE).`,
            difficulty: "hard",
            points: 3,
          },
          // ... 4-6 more segments per story
        ],
        totalPoints: 15,
        passingScore: 10,
      },
      // ... more stories
    ];

    export const THEMES = [
      "ancient-history",
      "modern-science",
      "literature",
      "pop-culture",
      "mythology",
      "technology",
    ] as const;
    ```

  - [ ] Implement `getDailyStory(date: Date): Story`
  - [ ] Implement `getRandomStory(theme?: string): Story`
  - [ ] Implement story validation utilities

- [ ] **Update `/server/src/index.ts`** - Register MCP Tools

  **Zod Schemas**:
  ```typescript
  const startLoreMasterSchema = z.object({
    mode: z.enum(["daily", "theme", "challenge"]).default("daily"),
    theme: z.enum(THEMES).optional(),
  });

  const answerLoreQuestionSchema = z.object({
    gameId: z.string().min(1),
    option: z.enum(["A", "B", "C", "D"]),
  });

  const getLoreSegmentSchema = z.object({
    gameId: z.string().min(1),
  });
  ```

  **JSON Schemas** (duplicate for ChatGPT):
  ```typescript
  const startLoreMasterJsonSchema = { /* ... */ };
  const answerLoreQuestionJsonSchema = { /* ... */ };
  const getLoreSegmentJsonSchema = { /* ... */ };
  ```

  **Tools to Register**:
  - [ ] `gamebox.start_lore_master` - Start new story
    - Input: `{ mode, theme? }`
    - Output: Story title, theme, first segment with question

  - [ ] `gamebox.answer_lore_question` - Submit answer
    - Input: `{ gameId, option }`
    - Output: Correct/incorrect, explanation, narrative feedback, next segment or completion

  - [ ] `gamebox.get_current_lore_segment` - Get current segment (if user lost track)
    - Input: `{ gameId }`
    - Output: Current segment text and question

  - [ ] Update game menu:
    ```typescript
    games: [
      { id: "word-morph", name: "Word Morph" },
      { id: "kinship", name: "Kinship" },
      { id: "lexicon-smith", name: "Lexicon Smith" },
      { id: "twenty-queries", name: "Twenty Queries" },
      { id: "lore-master", name: "Lore Master" },  // Add this
    ]
    ```

  - [ ] Register widget resource:
    ```typescript
    server.registerResource(
      "lore-master-widget",
      "ui://widget/lore-master.html",
      {},
      async () => ({
        contents: [{
          uri: "ui://widget/lore-master.html",
          mimeType: "text/html+skybridge",
          text: getLoreMasterWidgetHtml(),
          _meta: getWidgetMetadata(),
        }],
      })
    );
    ```

### Phase 3: Frontend - Widget Component (4-5 hours)

- [ ] **Create `/web/src/widgets/LoreMaster.tsx`**

  **Main Component Structure**:
  ```typescript
  interface LoreMasterState {
    gameId?: string;
    storyTitle?: string;
    theme?: string;
    currentSegment?: StorySegment;
    answers: AnswerResult[];
    score: number;
    status: GameStatus;
    streak: number;
  }

  export function LoreMaster(): JSX.Element {
    const [state, setState] = useWidgetState<LoreMasterState>(DEFAULT_STATE);
    const toolOutput = useOpenAiGlobal<ToolOutput>("toolOutput");

    // UI state
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [message, setMessage] = useState("");

    // Render story title and theme
    // Render narrative text (2-3 paragraphs)
    // Render question
    // Render 4 options (A/B/C/D)
    // Render explanation (after answer)
    // Render score and progress
  }
  ```

  **Sub-Components to Create**:
  - [ ] `StoryHeader` - Title, theme, progress (segment X of Y)
  - [ ] `NarrativeText` - Story text display (book/scroll theme)
  - [ ] `QuestionCard` - Question display with options
  - [ ] `OptionButton` - Individual option (A/B/C/D) with hover states
  - [ ] `ExplanationPanel` - Correct/incorrect feedback with explanation
  - [ ] `ScoreDisplay` - Current score with progress bar
  - [ ] `CompletionSummary` - Final score, passed/failed, share button

  **Visual Design** (book/scroll theme):
  ```css
  /* CSS Variables */
  :root {
    --lore-master-primary: #8B5CF6;       /* Purple - mystical theme */
    --lore-master-correct: #10B981;       /* Emerald */
    --lore-master-incorrect: #EF4444;     /* Red */
    --lore-master-selected: #3B82F6;      /* Blue */
    --lore-master-background: #FEF3C7;    /* Parchment color */
    --lore-master-text: #1F2937;          /* Dark gray */
    --lore-master-border: #92400E;        /* Brown border */
  }
  ```

  - [ ] Implement book/scroll aesthetic (parchment background, serif font)
  - [ ] Implement option selection animation (glow on hover)
  - [ ] Implement answer reveal animation (green check / red X)
  - [ ] Implement narrative text fade-in for new segments
  - [ ] Implement completion celebration (confetti + final score)
  - [ ] Make responsive for mobile (375x667)

  **Key Features**:
  - [ ] Click option to select (A/B/C/D)
  - [ ] Submit button to confirm answer
  - [ ] Immediate feedback (correct/incorrect with explanation)
  - [ ] "Continue" button to proceed to next segment
  - [ ] Progress indicator: Segment X/Y
  - [ ] Score display: X/Y points
  - [ ] Final summary: score, pass/fail status, share text

- [ ] **Create `/web/src/widgets/LoreMaster.test.tsx`**
  - [ ] Test title and theme display
  - [ ] Test narrative text rendering
  - [ ] Test question display
  - [ ] Test option buttons (4 buttons A-D)
  - [ ] Test option selection
  - [ ] Test answer submission
  - [ ] Test explanation panel display
  - [ ] Test score updates
  - [ ] Test segment progression
  - [ ] Test completion summary
  - [ ] **Target**: 12+ tests

### Phase 4: Testing - E2E (2-3 hours)

- [ ] **Create `/e2e/loreMaster.spec.ts`**

  **Test Categories**:
  - [ ] Server health and tools registration (3 tests)
  - [ ] Game start (daily/theme modes) (2 tests)
  - [ ] Answer question correctly (2 tests)
  - [ ] Answer question incorrectly (2 tests)
  - [ ] Segment progression (1 test)
  - [ ] Story completion (1 test)
  - [ ] Passing score check (1 test)
  - [ ] Game menu display (1 test)

  **Example Test**:
  ```typescript
  test("should accept answer and provide feedback", async ({ request }) => {
    const startResponse = await mcpCall(request, "tools/call", {
      name: "gamebox.start_lore_master",
      arguments: { mode: "daily" },
    });

    const { gameId, currentSegment } = startResponse.json().result.structuredContent;

    const answerResponse = await mcpCall(request, "tools/call", {
      name: "gamebox.answer_lore_question",
      arguments: { gameId, option: "A" },
    });

    const data = await answerResponse.json();
    expect(data.result.structuredContent.result).toBeDefined();
    expect(data.result.structuredContent.result.correct).toBeDefined();
    expect(data.result.structuredContent.result.explanation).toBeDefined();
  });

  test("should complete story after all segments", async ({ request }) => {
    // Start game
    // Answer all segments
    // Check status === "won" or "lost" based on score
  });
  ```

  - [ ] **Target**: 13+ tests, all passing

- [ ] **Create `/e2e/widget-ui-lore-master.spec.ts`**
  - [ ] Test widget rendering (title, theme, narrative)
  - [ ] Test question display
  - [ ] Test option buttons (4 buttons visible)
  - [ ] Test option selection (clicking highlights)
  - [ ] Test answer submission
  - [ ] Test explanation display
  - [ ] Test segment progression
  - [ ] Test score display
  - [ ] Test completion summary
  - [ ] Test responsive layout (mobile)
  - [ ] **Target**: 12+ tests

- [ ] **Create `/e2e/widget-screenshots-lore-master.spec.ts`**
  - [ ] Capture initial state (story start)
  - [ ] Capture question with options
  - [ ] Capture selected option
  - [ ] Capture explanation panel
  - [ ] Capture completion summary
  - [ ] Capture mobile viewport

### Phase 5: Integration & Polish (1-2 hours)

- [ ] **Update Documentation**
  - [ ] Add Lore Master to `/README.md` game list
  - [ ] Update `/CONTRIBUTING.md` with Lore Master examples
  - [ ] Add story creation guidelines if needed

- [ ] **Verify Integration**
  - [ ] Run all tests: `npm test` (server + web)
  - [ ] Run E2E tests: `npm run test:e2e`
  - [ ] Type check: `npm run type-check`
  - [ ] Build: `npm run build` (both server and web)
  - [ ] Manual testing:
    - [ ] Start server, load widget in browser
    - [ ] Test daily mode
    - [ ] Test theme mode
    - [ ] Test all answer options
    - [ ] Test narrative progression
    - [ ] Test passing/failing score
    - [ ] Test mobile responsiveness

- [ ] **Code Quality**
  - [ ] Run code simplifier if available
  - [ ] Review for consistency with Word Morph patterns
  - [ ] Ensure no TODO comments remain
  - [ ] Verify error messages are user-friendly
  - [ ] Check accessibility (keyboard navigation, ARIA labels)

## AI Enhancement Features (from GAME_ENHANCEMENT_SPEC.md)

Implement these narrative-driven features:

### 1. Adaptive Storytelling
```typescript
// Story branches based on correct/incorrect answers

// Correct answer path:
Segment 2 (after correct answer):
"Your knowledge impresses the librarian. She leads you deeper into
the archive, where ancient texts reveal..."

// Incorrect answer path:
Segment 2 (after incorrect answer):
"Despite your uncertainty, you press forward. The librarian nods
sympathetically. 'Few know the truth,' she says. 'Let me show you...'"
```

### 2. Educational Explanations
```typescript
// After each answer, provide rich context
Explanation:
"The Library of Alexandria experienced multiple destructions:
 • 48 BCE: Julius Caesar's siege damaged portions
 • 391 CE: Theodosius's decree led to destruction of pagan temples
 • 640 CE: Muslim conquest brought final destruction

 Historical records suggest no single 'burning' but gradual decline."
```

### 3. Immersive Narrative Design
```typescript
// Story segments feel like a novel, not just questions

Example Opening:
"🏛️ The sun sets over Alexandria, casting long shadows across marble
columns. You've traveled here seeking the ancient Library, rumored to
hold all human knowledge. But smoke rises in the distance - something
is wrong.

The year is uncertain. Time itself seems fluid in this moment between
history and legend. As you approach, a figure emerges from the shadows...

[Question about historical context follows naturally]"
```

### 4. Theme-Specific Aesthetics
```typescript
// Different visual themes per story category

Ancient History: Parchment background, serif font, scrollwork borders
Science: Clean modern design, technical diagrams
Mythology: Mystical purple/gold, ornate borders
Pop Culture: Vibrant colors, modern fonts
```

### 5. Score-Based Narrative Endings
```typescript
// Perfect score (all correct):
"🌟 Master of Lore! You've proven yourself a true scholar.
The Library's secrets are yours to keep. Score: 15/15"

// Passing score (10-14):
"✨ Well done, seeker! Your knowledge has saved much of the ancient wisdom.
Score: 12/15"

// Failing score (0-9):
"💭 The path of knowledge is long, but you've taken your first steps.
Return when you're ready to learn more. Score: 8/15"
```

## Success Criteria

- [ ] All unit tests passing (35+ tests, >85% coverage)
- [ ] All E2E tests passing (13+ tests)
- [ ] All widget UI tests passing (12+ tests)
- [ ] Type checking passes with zero errors
- [ ] Builds succeed (server + web)
- [ ] Server starts without errors or warnings
- [ ] Widget renders correctly in browser
- [ ] Narrative text displays beautifully (book/scroll aesthetic)
- [ ] All 4 options (A/B/C/D) selectable
- [ ] Answer validation works correctly
- [ ] Explanations display after each answer
- [ ] Score calculation accurate
- [ ] Segment progression smooth
- [ ] Completion summary displays correctly
- [ ] Share text generates correctly
- [ ] Streaks update correctly for daily mode
- [ ] Mobile responsive (tested at 375x667)
- [ ] Keyboard navigation works (arrow keys + Enter)
- [ ] No console errors or warnings

## References

- **Implementation Patterns**: `/docs/IMPLEMENTATION_PATTERNS.md`
- **Game Enhancement Spec**: `/docs/GAME_ENHANCEMENT_SPEC.md` (Lore Master section)
- **Word Morph Reference**: `/server/src/games/wordMorph.ts`, `/web/src/widgets/WordMorph.tsx`
- **Testing Reference**: `/e2e/word-morph.spec.ts`

## Estimated Timeline

- Phase 1: 3-4 hours (Backend logic)
- Phase 2: 3-4 hours (Data & MCP tools)
- Phase 3: 4-5 hours (Frontend widget)
- Phase 4: 2-3 hours (E2E testing)
- Phase 5: 1-2 hours (Integration & polish)

**Total**: 13-18 hours

## Labels

`enhancement`, `game-implementation`, `lore-master`, `narrative`, `priority-medium`
