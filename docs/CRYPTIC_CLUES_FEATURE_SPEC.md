# Feature Specification: Cryptic Clues for Word Morph

## Overview

Enhance Word Morph with an AI-powered cryptic clue system that provides clever, crossword-style hints without giving away the answer. This leverages the ChatGPT agent's creativity to generate unique clues for each game.

## Core Concept

When a player needs help:
1. Player requests a clue (or triggers one by failing)
2. MCP server provides the target word to the agent (hidden from user)
3. Agent generates a cryptic clue following specific guidelines
4. User sees only the cryptic clue, not the answer
5. This maintains challenge while providing intelligent assistance

## User Stories

### Story 1: Requesting a Clue
**As a player**, I want to request a cryptic clue when I'm stuck, so I can get hints without being told the answer directly.

**Acceptance Criteria:**
- [ ] "Get Clue" button visible in widget
- [ ] Button disabled if no clues remaining (optional limit)
- [ ] Clicking button invokes MCP tool
- [ ] Agent receives target word + clue generation instructions
- [ ] User sees cryptic clue in UI
- [ ] Clue doesn't reveal the word directly

### Story 2: Automatic Clue After Wrong Guesses
**As a player**, I want to receive a clue after several wrong guesses, so I don't get completely stuck.

**Acceptance Criteria:**
- [ ] Clue offered after 3-4 wrong guesses
- [ ] User can accept or decline the clue
- [ ] Declining preserves "no clue" achievement
- [ ] Clue generation same as manual request

### Story 3: Clue History
**As a player**, I want to see all clues I've received, so I can reference them while guessing.

**Acceptance Criteria:**
- [ ] Clues displayed in a list below the grid
- [ ] Each clue timestamped or numbered
- [ ] Previous clues remain visible
- [ ] Can hide/show clue panel

## Cryptic Clue Guidelines

### What Makes a Good Cryptic Clue?

**Characteristics:**
1. **Clever wordplay** - Puns, double meanings, anagrams
2. **Misdirection** - Leads you astray initially
3. **Definition included** - Usually at start or end
4. **Letter count** - Always includes word length in parentheses
5. **Fair but challenging** - Solvable with lateral thinking

### Cryptic Clue Styles

#### 1. Definition + Wordplay
- "Bird that lifts heavy loads (5)" → CRANE
- "Rock's smooth surface (5)" → SLATE
- "Staff of life, kneaded reading (5)" → BREAD

#### 2. Anagram Clues
- "Confused later about the rock (5)" → SLATE (anagram of "later")
- "Mixed up bread for staff of life (5)" → BREAD
- "Bird in confused crane (5)" → CRANE

#### 3. Hidden Word Clues
- "Part of the last late arrival (5)" → SLATE (hidden in "laST LATe")
- "Partially embrace and hold (4)" → BEAD (hidden in "emBrAcE AnD")

#### 4. Charade Clues (word built from parts)
- "S + drink = rock (5)" → S + LATE = SLATE
- "Angry without initial rage about bird (5)" → C + RANE = CRANE

#### 5. Container Clues
- "Bird holds crane with nothing removed (5)" → CRANE
- "Rock contains 's' and 'late' together (5)" → SLATE

### Clue Difficulty Levels

**Easy (Definition-heavy):**
- "A writing surface or roofing material (5)" → SLATE
- Clear definition, minimal wordplay

**Medium (Balanced):**
- "Rock's smooth surface holds a secret (5)" → SLATE
- Definition + some wordplay

**Hard (Cryptic):**
- "Confused later, this rock appears (5)" → SLATE
- Heavy wordplay, obscured definition

## MCP Tool Design

### Tool: `gamebox.get_word_morph_clue`

**Purpose:** Provide the target word to the agent with instructions to generate a cryptic clue.

**Parameters:**
```typescript
interface GetClueParams {
  clue_type?: 'cryptic' | 'definition' | 'rhyme' | 'anagram' | 'auto';
  difficulty?: 'easy' | 'medium' | 'hard';
  clue_number?: number; // Which clue in sequence (1st, 2nd, etc.)
}
```

**Response:**
```typescript
interface ClueResponse {
  target_word: string;           // The answer (agent sees, user doesn't)
  previous_guesses: string[];    // What they've already tried
  letters_correct: number;       // How many letters they got right
  instructions: string;          // Instructions for agent
  clue_context: {
    word_length: number;
    game_type: 'word-morph';
    remaining_guesses: number;
  };
}
```

**Example Response:**
```json
{
  "target_word": "SLATE",
  "previous_guesses": ["CRANE", "TRACE", "BRAKE"],
  "letters_correct": 3,
  "instructions": "Create a cryptic crossword-style clue for the word 'SLATE'. Your clue should:\n- Be clever and use wordplay (anagrams, double meanings, etc.)\n- Include a definition somewhere in the clue\n- Include the letter count '(5)' at the end\n- NOT reveal the word directly\n- Be fair but challenging\n- Match the 'medium' difficulty level\n\nExample style: 'Rock's smooth surface holds a secret (5)'\n\nDo NOT tell the user the answer is 'SLATE'. Only give them the cryptic clue.",
  "clue_context": {
    "word_length": 5,
    "game_type": "word-morph",
    "remaining_guesses": 3
  }
}
```

### Agent Instructions (Built into Tool Response)

The tool response includes detailed instructions that guide the agent:

```
CRYPTIC CLUE GENERATION INSTRUCTIONS

You have been given the target word: [WORD]

Your job is to create a CRYPTIC CLUE that helps the player guess the word without revealing it directly.

RULES:
1. DO NOT tell the user the word is "[WORD]"
2. DO NOT say "the word is..." or "the answer is..."
3. CREATE a clever, cryptic clue instead
4. INCLUDE the letter count at the end: ([N])
5. USE wordplay: anagrams, double meanings, hidden words, etc.
6. INCLUDE a definition somewhere in the clue
7. MAKE it challenging but fair

CRYPTIC CLUE STYLES:
- Definition + Wordplay: "Bird that lifts heavy loads (5)" → CRANE
- Anagram: "Confused later about the rock (5)" → SLATE
- Hidden Word: "Part of the last late arrival (5)" → SLATE
- Charade: "S + drink = rock (5)" → SLATE

DIFFICULTY: [DIFFICULTY_LEVEL]
- Easy: Clear definition, light wordplay
- Medium: Balanced definition and wordplay
- Hard: Heavy wordplay, obscured definition

PREVIOUS GUESSES: [LIST]
(Consider these when crafting your clue - avoid making them seem too correct)

Now create your cryptic clue and present it to the user as a helpful hint.
```

## UI/UX Design

### Widget Layout

```
┌─────────────────────────────────────┐
│         Word Morph                  │
├─────────────────────────────────────┤
│   [Grid of letter tiles]            │
│                                     │
│   ┌─────────────────────────┐      │
│   │  🔍 Get Clue (2 left)   │      │
│   └─────────────────────────┘      │
│                                     │
│   💡 Clues:                         │
│   1. "Rock's smooth surface (5)"   │
│   2. "Confused later arrives (5)"  │
│                                     │
│   [Keyboard]                        │
└─────────────────────────────────────┘
```

### Button States

**Get Clue Button:**
- Default: `🔍 Get Clue`
- Loading: `🔍 Generating clue...`
- No clues left: `🔍 No clues left` (disabled)
- After game over: (hidden)

### Clue Display

**Clue Panel:**
```
💡 Clues Received:
┌────────────────────────────────────┐
│ 1. Rock's smooth surface (5)      │
│    [1 minute ago]                  │
├────────────────────────────────────┤
│ 2. Confused later arrives (5)     │
│    [Just now]                      │
└────────────────────────────────────┘
```

**Visual Indicators:**
- New clue: Highlight/animation
- Clue used: Badge on game summary
- No clues: Achievement badge

## Game Mechanics

### Clue Limits

**Option A: Limited Clues**
- 3 clues per game
- Encourages strategic use
- Better for scoring/leaderboards

**Option B: Unlimited Clues**
- No limit on clues
- More accessible
- Track clue count for stats

**Recommendation:** Start with Option A (3 clues), configurable

### Clue Triggers

**Manual Request:**
- User clicks "Get Clue" button
- Deducts from clue allowance
- Immediate clue generation

**Auto-Offer (Optional):**
- After 3 wrong guesses: "Need a hint?"
- User can accept or decline
- If accepted, counts against allowance
- If declined, can request later

### Scoring Impact

**Without Clues:**
- Full score (100 points)
- "Perfect Solve" achievement

**With 1 Clue:**
- 90% score (90 points)
- "Clever Solver" achievement

**With 2+ Clues:**
- 80% score (80 points)
- "Persistent" achievement

**Recommendation:** Track but don't penalize heavily - encourage using feature

## Implementation Plan

### Phase 1: Backend - MCP Tool
**Tasks:**
1. Create `get_word_morph_clue` MCP tool
2. Implement clue request handler
3. Build clue instruction template
4. Add clue tracking to game state
5. Write unit tests for clue logic

**Files:**
- `/server/src/games/wordMorph.ts` - Add clue tracking
- `/server/src/index.ts` - Register new MCP tool
- `/server/src/games/wordMorph.test.ts` - Clue tests

**Estimated Time:** 2-3 hours

### Phase 2: Frontend - Clue UI
**Tasks:**
1. Add "Get Clue" button to widget
2. Create clue display panel
3. Implement clue state management
4. Add clue history list
5. Style clue components
6. Write component tests

**Files:**
- `/web/src/widgets/WordMorph.tsx` - Add clue UI
- `/web/src/hooks/useClues.ts` - New hook for clue management
- `/web/src/styles/globals.css` - Clue styles
- `/web/src/widgets/WordMorph.test.tsx` - Clue tests

**Estimated Time:** 3-4 hours

### Phase 3: Integration & Testing
**Tasks:**
1. Connect frontend to MCP tool
2. Test clue generation flow
3. Test agent responses
4. Add E2E tests for clue system
5. Update documentation

**Files:**
- `/e2e/word-morph-clues.spec.ts` - New E2E tests
- `/docs/CRYPTIC_CLUES_GUIDE.md` - User guide

**Estimated Time:** 2-3 hours

### Phase 4: Polish & Enhancement
**Tasks:**
1. Add clue difficulty selector
2. Implement clue types (cryptic, definition, etc.)
3. Add clue animations
4. Create achievement system
5. Add clue statistics tracking

**Estimated Time:** 2-3 hours

**Total Estimated Time:** 9-13 hours

## Technical Specifications

### Backend Changes

#### Game State Extension
```typescript
interface WordMorphGameState {
  // ... existing fields
  clues: {
    requested: number;
    max_allowed: number;
    history: Array<{
      clue_text: string;
      timestamp: number;
      type: string;
    }>;
  };
}
```

#### Clue Generation
```typescript
class WordMorphGame {
  // ... existing methods

  requestClue(type: ClueType, difficulty: ClueDifficulty): ClueResponse {
    if (this.clues.requested >= this.clues.max_allowed) {
      throw new Error('No clues remaining');
    }

    this.clues.requested++;

    return {
      target_word: this.targetWord,
      previous_guesses: this.guesses.map(g => g.word),
      letters_correct: this.getCorrectLetterCount(),
      instructions: this.generateClueInstructions(type, difficulty),
      clue_context: {
        word_length: this.targetWord.length,
        game_type: 'word-morph',
        remaining_guesses: this.maxGuesses - this.guesses.length
      }
    };
  }

  private generateClueInstructions(type: ClueType, difficulty: ClueDifficulty): string {
    // Build instruction template based on type and difficulty
    // Include examples and guidelines
    // Emphasize not revealing the answer
    return instructionTemplate;
  }
}
```

### Frontend Changes

#### Clue Hook
```typescript
// /web/src/hooks/useClues.ts
interface UseCluesReturn {
  clues: ClueHistory[];
  cluesRemaining: number;
  requestClue: (type?: ClueType) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useClues(): UseCluesReturn {
  const [clues, setClues] = useState<ClueHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const requestClue = async (type: ClueType = 'cryptic') => {
    setIsLoading(true);
    try {
      const response = await invokeTool('gamebox.get_word_morph_clue', {
        clue_type: type,
        difficulty: 'medium'
      });

      // Agent response will include the cryptic clue
      // Add to history
      setClues(prev => [...prev, response.clue]);
    } finally {
      setIsLoading(false);
    }
  };

  return { clues, cluesRemaining, requestClue, isLoading, error };
}
```

## Agent Behavior Examples

### Example 1: Good Agent Response

**Tool Response:**
```json
{
  "target_word": "SLATE",
  "instructions": "Create a cryptic clue..."
}
```

**Agent Message to User:**
```
🔍 Here's a cryptic clue to help you:

"Rock's smooth surface holds a secret (5)"

Think about what kind of rock has a smooth surface and is commonly used for writing!
```

**Why it's good:**
- Doesn't say "the answer is SLATE"
- Provides cryptic clue
- Adds helpful context without revealing
- Engaging tone

### Example 2: Bad Agent Response (to avoid)

**Agent Message to User:**
```
🔍 The word you're looking for is SLATE.
```

**Why it's bad:**
- Reveals answer directly
- Defeats purpose of cryptic clues
- No challenge left

**Prevention:**
- Clear instructions in tool response
- Testing with various prompts
- Agent system message reinforcement

## Configuration Options

### Game Settings
```typescript
interface WordMorphSettings {
  // ... existing settings
  clues: {
    enabled: boolean;
    max_clues_per_game: number;
    auto_offer_after_wrong_guesses: number | null;
    default_difficulty: 'easy' | 'medium' | 'hard';
    scoring_penalty: boolean;
  };
}
```

### Default Configuration
```typescript
const DEFAULT_CLUE_SETTINGS = {
  enabled: true,
  max_clues_per_game: 3,
  auto_offer_after_wrong_guesses: 4,
  default_difficulty: 'medium',
  scoring_penalty: true
};
```

## Testing Strategy

### Unit Tests
- Clue request validation
- Clue allowance tracking
- Instruction generation
- State management

### Integration Tests
- MCP tool invocation
- Agent response handling
- Clue display updates
- Error handling

### E2E Tests
```typescript
test('should request and display cryptic clue', async ({ page }) => {
  await page.goto('/widget/word-morph');
  await startNewGame(page);

  // Make a wrong guess
  await guessWord(page, 'CRANE');

  // Request a clue
  await page.click('[data-testid="get-clue-button"]');

  // Wait for agent response
  await page.waitForSelector('[data-testid="clue-text"]');

  // Verify clue appears
  const clue = await page.textContent('[data-testid="clue-text"]');
  expect(clue).toContain('(5)'); // Letter count
  expect(clue).not.toContain('SLATE'); // Doesn't reveal answer

  // Verify clue count decremented
  const button = page.locator('[data-testid="get-clue-button"]');
  await expect(button).toContainText('2 left');
});

test('should disable clue button when no clues remain', async ({ page }) => {
  await page.goto('/widget/word-morph');
  await startNewGame(page);

  // Use all 3 clues
  for (let i = 0; i < 3; i++) {
    await page.click('[data-testid="get-clue-button"]');
    await page.waitForSelector('[data-testid="clue-text"]');
  }

  // Button should be disabled
  const button = page.locator('[data-testid="get-clue-button"]');
  await expect(button).toBeDisabled();
  await expect(button).toContainText('No clues left');
});
```

## Success Metrics

### Feature Success
- [ ] Clue system implemented end-to-end
- [ ] Agent generates cryptic clues consistently
- [ ] Agent never reveals answer directly
- [ ] UI is intuitive and accessible
- [ ] All tests passing

### User Experience
- Users find clues helpful (survey/feedback)
- Clue usage rate: 40-60% of games
- Average clues per game: 1-2
- User retention with clues vs without

### Technical Quality
- < 500ms clue generation time
- 0% answer revelation rate
- 100% test coverage for clue logic
- No performance degradation

## Future Enhancements

### V2 Features
1. **Multiple Clue Types**
   - Rhyme clues
   - Definition clues
   - Etymology clues
   - Picture clues

2. **Adaptive Difficulty**
   - Clues get easier after more wrong guesses
   - First clue: hard cryptic
   - Second clue: medium
   - Third clue: easy definition

3. **Clue Ratings**
   - Users rate clue quality
   - Agent learns from feedback
   - Generate better clues over time

4. **Community Clues**
   - Users submit their own cryptic clues
   - Vote on best clues
   - Curated clue database

5. **Clue Challenges**
   - Special mode: solve using only clues
   - Timed clue solving
   - Clue master achievements

## Open Questions

1. **Should clues affect scoring?**
   - Option A: Yes, slight penalty
   - Option B: No, encourage usage
   - **Recommendation:** Track but minimal penalty

2. **How many clues should be default?**
   - 1-2: Very limited, strategic
   - 3: Balanced (recommended)
   - Unlimited: Accessible

3. **Should we show example clues in tutorial?**
   - Yes: Helps users understand feature
   - No: Part of discovery

4. **Should agent explain the clue after game?**
   - Yes: Educational, shows cryptic construction
   - No: Keep mystery

## Documentation Needs

1. **User Guide:** How to use cryptic clues
2. **Developer Docs:** MCP tool API reference
3. **Agent Instructions:** How to generate good clues
4. **Testing Guide:** How to test clue system

## Conclusion

The cryptic clue system adds a unique, AI-powered twist to Word Morph that:
- Leverages ChatGPT's creative capabilities
- Maintains game challenge while providing help
- Creates a more engaging, interactive experience
- Differentiates Word Morph from basic Wordle clones
- Provides educational value (learning cryptic clue styles)

**Recommended Next Step:** Implement Phase 1 (Backend MCP Tool) as a proof of concept to validate agent clue generation quality.
