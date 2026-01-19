# Implement Lexicon Smith Game (Word Building Puzzle)

## Overview

Implement the **Lexicon Smith** game - a word-building puzzle where players create words from a set of letters with one required center letter. Modern and clean design (not medieval forge theme).

**Game Type**: Word Puzzle/Vocabulary
**Complexity**: Medium
**Estimated Time**: 10-14 hours

## Game Description

Players are given 7 letters (6 outer, 1 center) and must create as many valid words as possible. Every word must include the center letter. Finding all words earns a "pangram" bonus.

### Core Gameplay

1. **Setup**: 7 letters presented (1 center, 6 outer) in clean circular layout
2. **Objective**: Find as many valid words as possible (minimum 4 letters)
3. **Constraint**: Every word must contain the center letter
4. **Scoring**: 4-letter word = 1pt, 5-letter = 2pts, 6+ letter = 3pts, Pangram (uses all 7) = 7pts
5. **Hints**: Progressive discovery hints and AI coach feedback

### Game Modes

- **Daily Challenge**: Same letters for all players each day
- **Speed Mode**: 3-minute timed challenge
- **Cooperative Mode**: Shared word list with friends

## Implementation Checklist

### Phase 1: Backend - Game Logic (3-4 hours)

- [ ] **Create `/server/src/games/lexiconSmith.ts`**

  - [ ] Define types:
    ```typescript
    export type WordValidation = "valid" | "invalid" | "too-short" |
                                  "missing-center" | "duplicate" | "not-in-dictionary";

    export interface LetterSet {
      centerLetter: string;
      outerLetters: string[];  // 6 letters
    }

    export interface WordSubmission {
      word: string;
      validation: WordValidation;
      points: number;
      isPangram: boolean;
    }

    export interface LexiconSmithGameState {
      readonly letterSet: LetterSet;
      readonly foundWords: readonly string[];
      readonly submissions: readonly WordSubmission[];
      readonly score: number;
      readonly totalPossibleWords: number;
      readonly status: GameStatus;
      readonly hintsUsed: number;
    }
    ```

  - [ ] Implement `LexiconSmithGame` class:
    ```typescript
    export class LexiconSmithGame {
      constructor(letterSet: LetterSet, wordList: string[]) { }
      submitWord(word: string): WordSubmission
      getHint(): string
      calculateScore(): number
      findPangrams(): string[]
      getState(): Readonly<LexiconSmithGameState>
      isComplete(): boolean  // All words found
      getShareText(): string
    }
    ```

  - [ ] Implement word validation:
    - [ ] Check length (min 4 letters)
    - [ ] Check center letter inclusion
    - [ ] Check all letters available
    - [ ] Check dictionary validity
    - [ ] Check for duplicates

  - [ ] Implement scoring system:
    ```typescript
    function calculateWordScore(word: string, isPangram: boolean): number {
      if (isPangram) return 7;
      if (word.length === 4) return 1;
      if (word.length === 5) return 2;
      return 3;  // 6+ letters
    }
    ```

  - [ ] Implement hint system (progressive word discovery)
  - [ ] Implement share text (progress bar + emoji grid)

- [ ] **Create `/server/src/games/lexiconSmith.test.ts`**
  - [ ] Test constructor validation (7 unique letters)
  - [ ] Test word validation (too short, missing center, invalid letters)
  - [ ] Test duplicate word rejection
  - [ ] Test scoring calculation (1pt, 2pt, 3pt, 7pt)
  - [ ] Test pangram detection
  - [ ] Test hint generation
  - [ ] Test state immutability
  - [ ] Test completion detection (all words found)
  - [ ] **Target**: 35+ tests, >85% coverage

### Phase 2: Backend - Data & Tools (2-3 hours)

- [ ] **Create `/server/src/data/letterSets.ts`**

  - [ ] Define 50+ letter set templates:
    ```typescript
    export interface LetterSetTemplate {
      centerLetter: string;
      outerLetters: string[];
      possibleWords: string[];  // Pre-calculated valid words
      difficulty: "easy" | "medium" | "hard";
      theme?: string;  // Optional: "nature", "tech", etc.
    }

    export const LETTER_SETS: readonly LetterSetTemplate[] = [
      {
        centerLetter: "R",
        outerLetters: ["S", "T", "O", "N", "G", "E"],
        possibleWords: ["STRONGER", "STONE", "TONE", "STORE", ...],  // 23+ words
        difficulty: "medium",
      },
      // ... more sets
    ];
    ```

  - [ ] Implement `getDailyLetterSet(date: Date): LetterSetTemplate`
  - [ ] Implement `getRandomLetterSet(difficulty: string): LetterSetTemplate`
  - [ ] Implement word generation utility (find all valid words from letters)

- [ ] **Update `/server/src/index.ts`** - Register MCP Tools

  **Zod Schemas**:
  ```typescript
  const startLexiconSmithSchema = z.object({
    mode: z.enum(["daily", "speed", "cooperative"]).default("daily"),
  });

  const submitLexiconWordSchema = z.object({
    gameId: z.string().min(1),
    word: z
      .string()
      .min(4)
      .regex(/^[A-Za-z]+$/)
      .transform((s) => s.toUpperCase()),
  });

  const getLexiconHintSchema = z.object({
    gameId: z.string().min(1),
  });
  ```

  **JSON Schemas** (duplicate for ChatGPT):
  ```typescript
  const startLexiconSmithJsonSchema = { /* ... */ };
  const submitLexiconWordJsonSchema = { /* ... */ };
  const getLexiconHintJsonSchema = { /* ... */ };
  ```

  **Tools to Register**:
  - [ ] `gamebox.start_lexicon_smith` - Start new game
    - Input: `{ mode }`
    - Output: Letter set, game state, total possible words (don't reveal count in daily)

  - [ ] `gamebox.submit_lexicon_word` - Submit a word
    - Input: `{ gameId, word }`
    - Output: Validation result, points earned, updated score, AI feedback

  - [ ] `gamebox.get_lexicon_hint` - Request hint (word reveal or letter combo suggestion)
    - Input: `{ gameId }`
    - Output: Hint text (progressive: first letter → full word reveal)

  - [ ] Update game menu:
    ```typescript
    games: [
      { id: "word-morph", name: "Word Morph" },
      { id: "kinship", name: "Kinship" },
      { id: "lexicon-smith", name: "Lexicon Smith" },  // Add this
      // ...
    ]
    ```

  - [ ] Register widget resource:
    ```typescript
    server.registerResource(
      "lexicon-smith-widget",
      "ui://widget/lexicon-smith.html",
      {},
      async () => ({
        contents: [{
          uri: "ui://widget/lexicon-smith.html",
          mimeType: "text/html+skybridge",
          text: getLexiconSmithWidgetHtml(),
          _meta: getWidgetMetadata(),
        }],
      })
    );
    ```

### Phase 3: Frontend - Widget Component (4-5 hours)

- [ ] **Create `/web/src/widgets/LexiconSmith.tsx`**

  **Main Component Structure**:
  ```typescript
  interface LexiconSmithState {
    gameId?: string;
    letterSet?: LetterSet;
    foundWords: string[];
    submissions: WordSubmission[];
    score: number;
    status: GameStatus;
    totalPossibleWords?: number;
    streak: number;
  }

  export function LexiconSmith(): JSX.Element {
    const [state, setState] = useWidgetState<LexiconSmithState>(DEFAULT_STATE);
    const toolOutput = useOpenAiGlobal<ToolOutput>("toolOutput");

    // UI state
    const [currentWord, setCurrentWord] = useState("");
    const [message, setMessage] = useState("");

    // Render letter circle
    // Render current word input
    // Render found words list
    // Render score and progress
  }
  ```

  **Sub-Components to Create**:
  - [ ] `LetterCircle` - Modern circular letter display (center + 6 outer)
  - [ ] `WordInput` - Clean input field with letter buttons
  - [ ] `FoundWordsList` - Grid of found words with points
  - [ ] `ProgressBar` - Clean minimalist progress indicator
  - [ ] `ScoreDisplay` - Current score with celebration animations

  **Visual Design** (modern, clean):
  ```css
  /* CSS Variables */
  :root {
    --lexicon-center: #14B8A6;      /* Teal - center letter */
    --lexicon-outer: #64748B;       /* Slate - outer letters */
    --lexicon-valid: #10B981;       /* Emerald - valid word */
    --lexicon-invalid: #EF4444;     /* Red - invalid */
    --lexicon-pangram: #F59E0B;     /* Amber - pangram */
    --lexicon-background: #F8FAFC;
  }
  ```

  - [ ] Implement letter click animations (smooth scale + glow)
  - [ ] Implement word submission animation (fade-in to found words list)
  - [ ] Implement pangram celebration (confetti burst)
  - [ ] Implement progress bar fill animation
  - [ ] Make responsive for mobile (375x667)

  **Key Features**:
  - [ ] Click letters to build word (or type on keyboard)
  - [ ] Backspace to remove last letter
  - [ ] Enter to submit word
  - [ ] Shuffle button to rearrange outer letters (visual only, doesn't change letters)
  - [ ] Clear button to reset current word
  - [ ] Found words list with points displayed
  - [ ] Progress indicator: X/Y words found, Z points

- [ ] **Create `/web/src/widgets/LexiconSmith.test.tsx`**
  - [ ] Test title rendering
  - [ ] Test letter circle display (7 letters)
  - [ ] Test letter clicking (adds to current word)
  - [ ] Test backspace functionality
  - [ ] Test word submission
  - [ ] Test found words list updates
  - [ ] Test score display updates
  - [ ] Test shuffle button (visual rearrangement)
  - [ ] **Target**: 12+ tests

### Phase 4: Testing - E2E (2-3 hours)

- [ ] **Create `/e2e/lexiconSmith.spec.ts`**

  **Test Categories**:
  - [ ] Server health and tools registration (3 tests)
  - [ ] Game start (daily/speed modes) (2 tests)
  - [ ] Valid word submission (3 tests)
  - [ ] Invalid word rejection (4 tests: too short, missing center, duplicate, invalid)
  - [ ] Pangram detection and bonus points (1 test)
  - [ ] Hint system (2 tests)
  - [ ] Score calculation (2 tests)
  - [ ] Game menu display (1 test)

  **Example Test**:
  ```typescript
  test("should accept valid word with center letter", async ({ request }) => {
    const startResponse = await mcpCall(request, "tools/call", {
      name: "gamebox.start_lexicon_smith",
      arguments: { mode: "daily" },
    });

    const { gameId, letterSet } = startResponse.json().result.structuredContent;

    // Submit a word using the center letter
    const wordResponse = await mcpCall(request, "tools/call", {
      name: "gamebox.submit_lexicon_word",
      arguments: { gameId, word: "TONE" },  // Assuming valid
    });

    const data = await wordResponse.json();
    expect(data.result.structuredContent.submission.validation).toBe("valid");
    expect(data.result.structuredContent.submission.points).toBeGreaterThan(0);
  });

  test("should reject word missing center letter", async ({ request }) => {
    // Start game with center "R"
    // Submit word "STONE" (missing R)
    // Expect validation: "missing-center"
  });

  test("should award pangram bonus", async ({ request }) => {
    // Submit word using all 7 letters
    // Expect 7 points and isPangram: true
  });
  ```

  - [ ] **Target**: 18+ tests, all passing

- [ ] **Create `/e2e/widget-ui-lexicon-smith.spec.ts`**
  - [ ] Test widget rendering (title, letter circle)
  - [ ] Test letter clicking (builds word)
  - [ ] Test backspace button
  - [ ] Test shuffle button (rearranges letters)
  - [ ] Test word submission
  - [ ] Test found words list updates
  - [ ] Test score display updates
  - [ ] Test validation messages
  - [ ] Test responsive layout (mobile)
  - [ ] **Target**: 12+ tests

- [ ] **Create `/e2e/widget-screenshots-lexicon-smith.spec.ts`**
  - [ ] Capture initial state (empty letter circle)
  - [ ] Capture with current word being built
  - [ ] Capture with found words list populated
  - [ ] Capture pangram celebration
  - [ ] Capture mobile viewport

### Phase 5: Integration & Polish (1-2 hours)

- [ ] **Update Documentation**
  - [ ] Add Lexicon Smith to `/README.md` game list
  - [ ] Update `/CONTRIBUTING.md` with Lexicon Smith examples
  - [ ] Verify `/docs/GAME_ENHANCEMENT_SPEC.md` has updated modern theme

- [ ] **Verify Integration**
  - [ ] Run all tests: `npm test` (server + web)
  - [ ] Run E2E tests: `npm run test:e2e`
  - [ ] Type check: `npm run type-check`
  - [ ] Build: `npm run build` (both server and web)
  - [ ] Manual testing:
    - [ ] Start server, load widget in browser
    - [ ] Test daily mode
    - [ ] Test speed mode (if time-based)
    - [ ] Test all hint levels
    - [ ] Test pangram detection
    - [ ] Test score calculation
    - [ ] Test mobile responsiveness

- [ ] **Code Quality**
  - [ ] Run code simplifier if available
  - [ ] Review for consistency with Word Morph patterns
  - [ ] Ensure no TODO comments remain
  - [ ] Verify error messages are user-friendly
  - [ ] Check accessibility (keyboard navigation, ARIA labels)

## AI Enhancement Features (from GAME_ENHANCEMENT_SPEC.md)

Implement these AI-powered features (with updated modern theme):

### 1. Smart Discovery Coach (NOT Medieval Blacksmith)
```typescript
// Modern encouraging feedback
💡 "Nice start! You've found 8 words using these letters: S-T-R-O-N-G-E
   (center: R). Keep going - there are 23 more possibilities."

💡 "Great job! You discovered a 6-letter word for 3 points!
   Total score: 15/47"

🎉 "Wow! STRONGER is a PANGRAM - you used all 7 letters! +7 points!"
```

### 2. Progressive Hint System
```typescript
Hint Level 1 (Free): "Try combining T-O-N-E..."
Hint Level 2 (1 hint used): "There's a 6-letter word starting with 'ST'..."
Hint Level 3 (2 hints used): "The word is: S-T-R-O-N-G"
Hint Level 4 (3+ hints used): Reveals next undiscovered word completely
```

### 3. Clean Letter Display (NOT Forge Visualization)
- Letters arranged in modern circular pattern
- Center letter highlighted with accent color (teal)
- Outer letters in clean circular arrangement
- Smooth animations on letter clicks
- No medieval imagery (no anvils, hammers, swords)

### 4. Word Discovery Feedback
```typescript
// On valid word
✓ "STONE" - 2 points! (5 letters)

// On invalid word
✗ "ROTE" - Too short (minimum 4 letters)
✗ "STONE" - Already found!
✗ "TONE" - Missing center letter 'R'

// On pangram
🎉 "STRONGER" - PANGRAM! 7 points!
```

### 5. Progress Tracking
- Clean progress bar showing % of total words found
- Minimalist score display
- Found words displayed in clean grid layout
- Smooth fade-in animations for new words
- Confetti animation on pangram (not sword forging)

## Success Criteria

- [ ] All unit tests passing (35+ tests, >85% coverage)
- [ ] All E2E tests passing (18+ tests)
- [ ] All widget UI tests passing (12+ tests)
- [ ] Type checking passes with zero errors
- [ ] Builds succeed (server + web)
- [ ] Server starts without errors or warnings
- [ ] Widget renders correctly in browser
- [ ] Letter circle displays cleanly
- [ ] Word validation works correctly (all 6 validation types)
- [ ] Scoring calculation accurate
- [ ] Pangram detection works
- [ ] Progressive hints work
- [ ] AI coach feedback generates appropriately
- [ ] Win/complete state displays correctly
- [ ] Share text generates correctly
- [ ] Streaks update correctly for daily mode
- [ ] Mobile responsive (tested at 375x667)
- [ ] Keyboard navigation works
- [ ] No console errors or warnings

## References

- **Implementation Patterns**: `/docs/IMPLEMENTATION_PATTERNS.md`
- **Game Enhancement Spec**: `/docs/GAME_ENHANCEMENT_SPEC.md` (Lexicon Smith section - modern theme)
- **Word Morph Reference**: `/server/src/games/wordMorph.ts`, `/web/src/widgets/WordMorph.tsx`
- **Testing Reference**: `/e2e/word-morph.spec.ts`

## Estimated Timeline

- Phase 1: 3-4 hours (Backend logic)
- Phase 2: 2-3 hours (Data & MCP tools)
- Phase 3: 4-5 hours (Frontend widget)
- Phase 4: 2-3 hours (E2E testing)
- Phase 5: 1-2 hours (Integration & polish)

**Total**: 12-17 hours

## Labels

`enhancement`, `game-implementation`, `lexicon-smith`, `priority-high`
