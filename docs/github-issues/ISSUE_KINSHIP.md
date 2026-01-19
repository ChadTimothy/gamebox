# Implement Kinship Game (Family Relationship Puzzle)

## Overview

Implement the **Kinship** game - a family relationship puzzle where players deduce relationships between family members by analyzing clues and making logical connections.

**Game Type**: Puzzle/Logic
**Complexity**: Medium
**Estimated Time**: 12-16 hours

## Game Description

Players are presented with a family tree and must identify relationships between family members. The game provides progressive hints and uses AI to explain connections, making genealogy fun and educational.

### Core Gameplay

1. **Setup**: Generate or select a family tree with 8-12 family members
2. **Objective**: Identify all relationships correctly (parent, sibling, spouse, cousin, etc.)
3. **Hints**: Progressive hint system (4 levels) from vague to explicit
4. **Explanation**: AI-generated explanations for correct/incorrect guesses
5. **Win Condition**: All relationships correctly identified

### Game Modes

- **Daily Challenge**: Same family tree for all players each day
- **Practice Mode**: Random family trees for unlimited practice
- **Difficulty Levels**: Easy (6 members), Medium (9 members), Hard (12 members)

## Implementation Checklist

### Phase 1: Backend - Game Logic (3-4 hours)

- [ ] **Create `/server/src/games/kinship.ts`**
  - [ ] Define types:
    ```typescript
    export type RelationshipType = "parent" | "child" | "sibling" |
                                    "spouse" | "grandparent" | "grandchild" |
                                    "cousin" | "aunt/uncle" | "niece/nephew";

    export interface FamilyMember {
      id: string;
      name: string;
      gender: "male" | "female" | "other";
      birthYear: number;
    }

    export interface Relationship {
      person1Id: string;
      person2Id: string;
      type: RelationshipType;
    }

    export interface FamilyTree {
      members: FamilyMember[];
      relationships: Relationship[];
    }

    export interface RelationshipGuess {
      person1Id: string;
      person2Id: string;
      guessedType: RelationshipType;
      correct: boolean;
      actualType?: RelationshipType;
    }

    export interface KinshipGameState {
      readonly familyTree: FamilyTree;
      readonly guesses: readonly RelationshipGuess[];
      readonly status: GameStatus;
      readonly hintsUsed: number;
      readonly maxGuesses: number;
    }
    ```

  - [ ] Implement `KinshipGame` class:
    ```typescript
    export class KinshipGame {
      constructor(familyTree: FamilyTree) { }
      makeGuess(person1Id: string, person2Id: string, type: RelationshipType): RelationshipGuess
      getHint(level: number): string
      getState(): Readonly<KinshipGameState>
      isGameOver(): boolean
      getShareText(): string
    }
    ```

  - [ ] Implement relationship validation logic
  - [ ] Implement hint generation (4 levels of specificity)
  - [ ] Implement share text generation (emoji representation)

- [ ] **Create `/server/src/games/kinship.test.ts`**
  - [ ] Test constructor validation (minimum 6 members, valid relationships)
  - [ ] Test relationship guess validation (valid member IDs, valid types)
  - [ ] Test correct relationship detection
  - [ ] Test incorrect relationship feedback
  - [ ] Test hint progression (level 1-4)
  - [ ] Test win condition (all relationships found)
  - [ ] Test state immutability
  - [ ] Test edge cases (duplicate guesses, invalid IDs)
  - [ ] **Target**: 40+ tests, >85% coverage

### Phase 2: Backend - Data & Tools (2-3 hours)

- [ ] **Create `/server/src/data/familyTrees.ts`**
  - [ ] Define 30+ family tree templates:
    ```typescript
    export const FAMILY_TREES: readonly FamilyTree[] = [
      {
        id: "shakespeare-families",
        members: [ /* 9 members */ ],
        relationships: [ /* 12 relationships */ ],
        theme: "Literary families",
        difficulty: "medium",
      },
      // ... more trees
    ];
    ```

  - [ ] Implement `getDailyFamilyTree(date: Date): FamilyTree`
  - [ ] Implement `getRandomFamilyTree(difficulty: string): FamilyTree`
  - [ ] Implement relationship lookup utilities

- [ ] **Update `/server/src/index.ts`** - Register MCP Tools

  **Zod Schemas**:
  ```typescript
  const startKinshipSchema = z.object({
    mode: z.enum(["daily", "practice"]).default("daily"),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  });

  const makeKinshipGuessSchema = z.object({
    gameId: z.string().min(1),
    person1Id: z.string().min(1),
    person2Id: z.string().min(1),
    relationshipType: z.enum([
      "parent", "child", "sibling", "spouse",
      "grandparent", "grandchild", "cousin",
      "aunt/uncle", "niece/nephew"
    ]),
  });

  const getKinshipHintSchema = z.object({
    gameId: z.string().min(1),
  });
  ```

  **JSON Schemas** (duplicate for ChatGPT):
  ```typescript
  const startKinshipJsonSchema = { /* ... */ };
  const makeKinshipGuessJsonSchema = { /* ... */ };
  const getKinshipHintJsonSchema = { /* ... */ };
  ```

  **Tools to Register**:
  - [ ] `gamebox.start_kinship` - Start new game
    - Input: `{ mode, difficulty? }`
    - Output: Family tree, game state, initial message

  - [ ] `gamebox.make_kinship_guess` - Submit relationship guess
    - Input: `{ gameId, person1Id, person2Id, relationshipType }`
    - Output: Guess result (correct/incorrect), updated state, AI explanation

  - [ ] `gamebox.get_kinship_hint` - Request progressive hint
    - Input: `{ gameId }`
    - Output: Hint text (level increases automatically)

  - [ ] Update game menu:
    ```typescript
    games: [
      { id: "word-morph", name: "Word Morph" },
      { id: "kinship", name: "Kinship" },  // Add this
      // ...
    ]
    ```

  - [ ] Register widget resource:
    ```typescript
    server.registerResource(
      "kinship-widget",
      "ui://widget/kinship.html",
      {},
      async () => ({
        contents: [{
          uri: "ui://widget/kinship.html",
          mimeType: "text/html+skybridge",
          text: getKinshipWidgetHtml(),
          _meta: getWidgetMetadata(),
        }],
      })
    );
    ```

### Phase 3: Frontend - Widget Component (4-5 hours)

- [ ] **Create `/web/src/widgets/Kinship.tsx`**

  **Main Component Structure**:
  ```typescript
  interface KinshipState {
    gameId?: string;
    familyTree?: FamilyTree;
    guesses: RelationshipGuess[];
    status: GameStatus;
    hintsUsed: number;
    streak: number;
  }

  export function Kinship(): JSX.Element {
    // State management
    const [state, setState] = useWidgetState<KinshipState>(DEFAULT_STATE);
    const toolOutput = useOpenAiGlobal<ToolOutput>("toolOutput");

    // UI state
    const [selectedPerson1, setSelectedPerson1] = useState<string | null>(null);
    const [selectedPerson2, setSelectedPerson2] = useState<string | null>(null);
    const [selectedRelation, setSelectedRelation] = useState<RelationshipType | null>(null);
    const [message, setMessage] = useState("");

    // Render family tree visualization
    // Render relationship selector
    // Render guess history
    // Render hint button
  }
  ```

  **Sub-Components to Create**:
  - [ ] `FamilyTreeVisual` - Graphical display of family members (modern circular layout)
  - [ ] `PersonCard` - Individual family member card (selectable)
  - [ ] `RelationshipSelector` - Dropdown/buttons for relationship types
  - [ ] `GuessHistory` - List of previous guesses with correct/incorrect indicators
  - [ ] `HintDisplay` - Progressive hints with AI explanations

  **Visual Design** (modern, not medieval):
  ```css
  /* CSS Variables */
  :root {
    --kinship-correct: #10B981;    /* Emerald */
    --kinship-incorrect: #EF4444;  /* Red */
    --kinship-pending: #6B7280;    /* Gray */
    --kinship-highlight: #3B82F6;  /* Blue */
    --kinship-background: #F9FAFB;
  }
  ```

  - [ ] Implement smooth fade-in animations for family members
  - [ ] Implement connection line animations between selected persons
  - [ ] Implement celebration animation on correct guess (confetti burst)
  - [ ] Implement shake animation on incorrect guess
  - [ ] Make responsive for mobile (375x667)

- [ ] **Create `/web/src/widgets/Kinship.test.tsx`**
  - [ ] Test title rendering
  - [ ] Test family tree visualization
  - [ ] Test person selection
  - [ ] Test relationship selector
  - [ ] Test guess submission
  - [ ] Test hint button
  - [ ] Test guess history display
  - [ ] **Target**: 12+ tests

### Phase 4: Testing - E2E (2-3 hours)

- [ ] **Create `/e2e/kinship.spec.ts`**

  **Test Categories**:
  - [ ] Server health and tools registration (3 tests)
  - [ ] Game start (daily/practice modes) (2 tests)
  - [ ] Valid relationship guess (3 tests)
  - [ ] Invalid guess handling (2 tests)
  - [ ] Hint system (2 tests)
  - [ ] Win condition (1 test)
  - [ ] Game menu display (1 test)

  **Example Test**:
  ```typescript
  test("should accept valid relationship guess", async ({ request }) => {
    const startResponse = await mcpCall(request, "tools/call", {
      name: "gamebox.start_kinship",
      arguments: { mode: "practice", difficulty: "easy" },
    });

    const { gameId, familyTree } = startResponse.json().result.structuredContent;
    const [person1, person2] = familyTree.members.slice(0, 2);

    const guessResponse = await mcpCall(request, "tools/call", {
      name: "gamebox.make_kinship_guess",
      arguments: {
        gameId,
        person1Id: person1.id,
        person2Id: person2.id,
        relationshipType: "sibling",
      },
    });

    const data = await guessResponse.json();
    expect(data.result.structuredContent.guess).toBeDefined();
    expect(data.result.structuredContent.guess.correct).toBeDefined();
  });
  ```

  - [ ] **Target**: 14+ tests, all passing

- [ ] **Create `/e2e/widget-ui-kinship.spec.ts`**
  - [ ] Test widget rendering (title, family tree)
  - [ ] Test person selection (click to select)
  - [ ] Test relationship selector display
  - [ ] Test guess submission flow
  - [ ] Test hint button functionality
  - [ ] Test guess history updates
  - [ ] Test responsive layout (mobile)
  - [ ] **Target**: 10+ tests

- [ ] **Create `/e2e/widget-screenshots-kinship.spec.ts`**
  - [ ] Capture initial state (empty family tree)
  - [ ] Capture with person selected
  - [ ] Capture with guess history
  - [ ] Capture mobile viewport
  - [ ] Capture win state

### Phase 5: Integration & Polish (1-2 hours)

- [ ] **Update Documentation**
  - [ ] Add Kinship to `/README.md` game list
  - [ ] Update `/CONTRIBUTING.md` with Kinship examples
  - [ ] Add Kinship to `/docs/GAME_ENHANCEMENT_SPEC.md` if not already present

- [ ] **Verify Integration**
  - [ ] Run all tests: `npm test` (server + web)
  - [ ] Run E2E tests: `npm run test:e2e`
  - [ ] Type check: `npm run type-check`
  - [ ] Build: `npm run build` (both server and web)
  - [ ] Manual testing:
    - [ ] Start server, load widget in browser
    - [ ] Test daily mode
    - [ ] Test practice mode
    - [ ] Test all hint levels
    - [ ] Test win condition
    - [ ] Test mobile responsiveness

- [ ] **Code Quality**
  - [ ] Run code simplifier if available
  - [ ] Review for consistency with Word Morph patterns
  - [ ] Ensure no TODO comments remain
  - [ ] Verify error messages are user-friendly
  - [ ] Check accessibility (keyboard navigation, ARIA labels)

## AI Enhancement Features (from GAME_ENHANCEMENT_SPEC.md)

Implement these AI-powered features:

### 1. Dynamic Hint System (Progressive)
```typescript
Level 1 (Free): "Think about generational differences..."
Level 2 (After 1 wrong): "One of them was born 30 years before the other"
Level 3 (After 2 wrong): "They share the same last name in a parent-child way"
Level 4 (Emergency): "John is Mary's father"
```

### 2. AI Explanation Generator
```typescript
// On correct guess
"✅ Correct! Mary and John are father and daughter. Mary was born in 1985,
and John was born in 1955, making him 30 years older - a typical
parent-child age gap."

// On incorrect guess
"❌ Not quite. While Sarah and Emma are close in age, they're actually
sisters, not cousins. Notice they share the same parents: Robert and Linda."
```

### 3. Relationship Visualization
- Modern circular layout (not grid-based)
- Connection lines between related persons
- Color-coded relationships (parent=blue, sibling=green, spouse=purple)
- Animated line drawing on correct guess

### 4. Educational Mode
- Show family tree terminology
- Explain relationship calculations
- Quiz mode: "If A is B's uncle, and C is B's child, what is A to C?"

## Success Criteria

- [ ] All unit tests passing (40+ tests, >85% coverage)
- [ ] All E2E tests passing (14+ tests)
- [ ] All widget UI tests passing (10+ tests)
- [ ] Type checking passes with zero errors
- [ ] Builds succeed (server + web)
- [ ] Server starts without errors or warnings
- [ ] Widget renders correctly in browser
- [ ] Progressive hints work correctly
- [ ] AI explanations generate appropriately
- [ ] Win/lose states display correctly
- [ ] Share text generates with emoji representation
- [ ] Streaks update correctly for daily mode
- [ ] Mobile responsive (tested at 375x667)
- [ ] Keyboard navigation works
- [ ] No console errors or warnings

## References

- **Implementation Patterns**: `/docs/IMPLEMENTATION_PATTERNS.md`
- **Game Enhancement Spec**: `/docs/GAME_ENHANCEMENT_SPEC.md` (Kinship section)
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

`enhancement`, `game-implementation`, `kinship`, `priority-high`
