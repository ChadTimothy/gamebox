# Implementation Tasks: Cryptic Clues Feature

## Overview

This document outlines the implementation tasks for adding cryptic clues to Word Morph.

**Feature Spec:** `/docs/CRYPTIC_CLUES_FEATURE_SPEC.md`
**Estimated Total Time:** 9-13 hours
**Suggested Epic:** #18 (or add to existing Epic #4)

## Task Breakdown

### Task 1: Backend - Add Clue MCP Tool
**Duration:** 2-3 hours | **Priority:** High

#### Objectives
- Create `gamebox.get_word_morph_clue` MCP tool
- Add clue tracking to game state
- Build agent instruction templates
- Implement clue allowance logic

#### Files to Modify
- `/server/src/games/wordMorph.ts`
  - Add `clues` field to game state
  - Add `requestClue()` method
  - Add `generateClueInstructions()` method
- `/server/src/index.ts`
  - Register `gamebox.get_word_morph_clue` tool
  - Add tool handler for clue requests
- `/server/src/games/wordMorph.test.ts`
  - Add tests for clue functionality

#### Implementation Details

**Game State Extension:**
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

**MCP Tool:**
```typescript
// In server/src/index.ts
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'gamebox.get_word_morph_clue') {
    if (!currentGame) {
      throw new Error('No active Word Morph game');
    }

    const { clue_type = 'cryptic', difficulty = 'medium' } = request.params.arguments;

    const clueResponse = currentGame.requestClue(clue_type, difficulty);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(clueResponse, null, 2)
      }]
    };
  }
  // ... other tools
});
```

#### Acceptance Criteria
- [ ] New MCP tool registered
- [ ] Tool returns target word + instructions
- [ ] Clue allowance tracked correctly
- [ ] Instructions emphasize not revealing answer
- [ ] Unit tests pass

---

### Task 2: Frontend - Add Clue UI
**Duration:** 3-4 hours | **Priority:** High

#### Objectives
- Add "Get Clue" button to widget
- Create clue display panel
- Implement widget state management for clues
- Style clue components
- Use window.openai API (Apps SDK best practice)

#### Files to Modify
- `/web/src/widgets/WordMorph.tsx`
  - Add clue button
  - Add clue display panel
  - Integrate window.openai.callTool()
  - Implement window.openai.setWidgetState()
- `/web/src/hooks/useWidgetState.ts` (new file)
  - Custom hook wrapping window.openai.setWidgetState()
- `/web/src/styles/globals.css`
  - Add clue-related styles
- `/web/src/widgets/WordMorph.test.tsx`
  - Add clue UI tests

#### Implementation Details

**Widget State Hook:**
```typescript
// /web/src/hooks/useWidgetState.ts
export function useWidgetState<T>(initialState: T) {
  const [state, setState] = useState<T>(() => {
    // Hydrate from window.openai.widgetState if available
    return window.openai?.widgetState || initialState;
  });

  // Persist to widget state whenever it changes
  useEffect(() => {
    window.openai?.setWidgetState(state);
  }, [state]);

  return [state, setState] as const;
}
```

**Widget UI with window.openai:**
```tsx
// In WordMorph.tsx
function WordMorph() {
  const [widgetState, setWidgetState] = useWidgetState({
    clues: [],
    cluesRemaining: 3,
    currentGuess: '',
    guessHistory: []
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleRequestClue() {
    if (widgetState.cluesRemaining === 0) return;

    setIsLoading(true);
    try {
      // Call MCP tool directly from widget
      const response = await window.openai.callTool(
        'gamebox.get_word_morph_clue',
        { clue_type: 'cryptic', difficulty: 'medium' }
      );

      // Agent responds with cryptic clue
      // Update widget state with new clue
      setWidgetState({
        ...widgetState,
        clues: [
          ...widgetState.clues,
          {
            text: response.result?.clue || 'Clue not available',
            timestamp: Date.now()
          }
        ],
        cluesRemaining: widgetState.cluesRemaining - 1
      });
    } catch (error) {
      console.error('Failed to get clue:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="word-morph-container">
      {/* Grid */}

      {/* Clue Button */}
      <button
        className="word-morph-clue-button"
        onClick={handleRequestClue}
        disabled={widgetState.cluesRemaining === 0 || isLoading}
      >
        {isLoading ? (
          '🔍 Generating clue...'
        ) : widgetState.cluesRemaining > 0 ? (
          `🔍 Get Clue (${widgetState.cluesRemaining} left)`
        ) : (
          '🔍 No clues left'
        )}
      </button>

      {/* Clue Display */}
      {widgetState.clues.length > 0 && (
        <div className="word-morph-clues">
          <h3>💡 Clues:</h3>
          {widgetState.clues.map((clue, i) => (
            <div key={i} className="word-morph-clue">
              {i + 1}. {clue.text}
            </div>
          ))}
        </div>
      )}

      {/* Keyboard */}
    </div>
  );
}
```

**Key Advantages:**
- ✅ Uses `window.openai.callTool()` directly (Apps SDK best practice)
- ✅ Widget state persists via `window.openai.setWidgetState()`
- ✅ Agent can see clue history for better responses
- ✅ Self-contained widget (no external hook dependencies)
- ✅ Simpler architecture

#### Acceptance Criteria
- [ ] Clue button renders correctly
- [ ] Button disabled when no clues left
- [ ] Loading state shows during clue generation
- [ ] Clues display in list format
- [ ] Component tests pass
- [ ] Accessible (keyboard nav, screen reader)

---

### Task 3: Integration & E2E Testing
**Duration:** 2-3 hours | **Priority:** High

#### Objectives
- Test full clue flow end-to-end
- Verify agent generates good clues
- Ensure agent doesn't reveal answers
- Add E2E tests for clue system

#### Files to Create/Modify
- `/e2e/word-morph-clues.spec.ts` (new file)
  - E2E tests for clue functionality
- `/docs/CRYPTIC_CLUES_GUIDE.md` (new file)
  - User guide for cryptic clues

#### E2E Tests

```typescript
// /e2e/word-morph-clues.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Word Morph Cryptic Clues', () => {
  test('should request and display a clue', async ({ page }) => {
    await page.goto('/widget/word-morph');

    // Start game
    await page.click('[data-testid="new-game-button"]');

    // Click get clue
    await page.click('[data-testid="get-clue-button"]');

    // Wait for clue to appear
    await page.waitForSelector('[data-testid="clue-text"]');

    // Verify clue exists
    const clue = await page.textContent('[data-testid="clue-text"]');
    expect(clue).toBeTruthy();
    expect(clue).toContain('('); // Should have letter count

    // Verify clue count decremented
    const button = await page.textContent('[data-testid="get-clue-button"]');
    expect(button).toContain('2 left');
  });

  test('should disable button after max clues used', async ({ page }) => {
    await page.goto('/widget/word-morph');
    await page.click('[data-testid="new-game-button"]');

    // Use all 3 clues
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="get-clue-button"]');
      await page.waitForTimeout(1000);
    }

    // Button should be disabled
    const button = page.locator('[data-testid="get-clue-button"]');
    await expect(button).toBeDisabled();
  });

  test('should show clue history', async ({ page }) => {
    await page.goto('/widget/word-morph');
    await page.click('[data-testid="new-game-button"]');

    // Request 2 clues
    await page.click('[data-testid="get-clue-button"]');
    await page.waitForTimeout(1000);
    await page.click('[data-testid="get-clue-button"]');
    await page.waitForTimeout(1000);

    // Should show both clues
    const clues = page.locator('[data-testid="clue-text"]');
    await expect(clues).toHaveCount(2);
  });
});
```

#### Agent Testing

**Manual Test Script:**
1. Start Word Morph game
2. Request a clue
3. Verify agent response:
   - Does NOT contain the target word
   - DOES contain a cryptic clue
   - DOES contain letter count like "(5)"
   - IS creative and clever
4. Test with different words
5. Test with different clue types

#### Acceptance Criteria
- [ ] E2E tests pass
- [ ] Agent consistently generates cryptic clues
- [ ] Agent never reveals answer directly (0% in testing)
- [ ] Clue generation time < 500ms average
- [ ] User guide documentation complete

---

### Task 4: Polish & Enhancements
**Duration:** 2-3 hours | **Priority:** Medium

#### Objectives
- Add clue type selector
- Implement difficulty selector
- Add animations for clues
- Track clue statistics
- Add achievements

#### Features

**Clue Type Selector:**
```tsx
<select onChange={(e) => setClueType(e.target.value)}>
  <option value="cryptic">Cryptic</option>
  <option value="definition">Definition</option>
  <option value="rhyme">Rhyme</option>
  <option value="anagram">Anagram Hint</option>
</select>
```

**Difficulty Selector:**
```tsx
<select onChange={(e) => setDifficulty(e.target.value)}>
  <option value="easy">Easy</option>
  <option value="medium">Medium</option>
  <option value="hard">Hard</option>
</select>
```

**Clue Animation:**
```css
@keyframes clue-appear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.word-morph-clue {
  animation: clue-appear 0.3s ease-out;
}
```

**Statistics Tracking:**
```typescript
interface GameStats {
  // ... existing stats
  clues_used: number;
  clues_by_type: Record<ClueType, number>;
  games_solved_with_clues: number;
  games_solved_without_clues: number;
}
```

**Achievements:**
- "No Help Needed" - Solve without using clues
- "Clue Master" - Use all clue types
- "One Hint Wonder" - Solve with exactly 1 clue
- "Cryptic Expert" - Solve 10 games with only cryptic clues

#### Acceptance Criteria
- [ ] Clue type selector working
- [ ] Difficulty selector working
- [ ] Clue animations smooth
- [ ] Statistics tracking implemented
- [ ] Achievements system working

---

## Implementation Order

**Recommended sequence:**

1. **Task 1: Backend** (Must do first)
   - Foundation for entire feature
   - Can test MCP tool independently

2. **Task 2: Frontend** (After Task 1)
   - Depends on backend tool
   - Core UI functionality

3. **Task 3: Integration** (After Task 2)
   - Verify everything works together
   - Catch edge cases

4. **Task 4: Polish** (After Task 3)
   - Enhancement, not critical
   - Can be done incrementally

## Testing Checklist

### Unit Tests
- [ ] Clue allowance tracking
- [ ] Clue request validation
- [ ] Instruction generation
- [ ] State management

### Component Tests
- [ ] Clue button rendering
- [ ] Clue display
- [ ] Loading states
- [ ] Disabled states
- [ ] Accessibility

### Integration Tests
- [ ] MCP tool invocation
- [ ] Agent response handling
- [ ] Clue history management
- [ ] Error handling

### E2E Tests
- [ ] Full clue request flow
- [ ] Multiple clues in one game
- [ ] Clue limit enforcement
- [ ] Visual verification
- [ ] Cross-browser testing

### Agent Behavior Tests
- [ ] Agent generates cryptic clues
- [ ] Agent never reveals answer
- [ ] Clues are creative and helpful
- [ ] Different clue types work
- [ ] Different difficulties work

## Documentation Updates

### Files to Update
- [ ] `/README.md` - Mention cryptic clue feature
- [ ] `/server/README.md` - Document new MCP tool
- [ ] `/web/README.md` - Document clue UI
- [ ] `/docs/TESTING_GUIDE.md` - Add clue testing section

### Files to Create
- [ ] `/docs/CRYPTIC_CLUES_GUIDE.md` - User guide
- [ ] `/docs/CRYPTIC_CLUES_AGENT_GUIDE.md` - Agent instructions

## Success Criteria

**Feature Complete When:**
- [ ] All 4 tasks complete
- [ ] All tests passing
- [ ] Agent consistently generates good clues
- [ ] Agent never reveals answers (verified in testing)
- [ ] UI is polished and accessible
- [ ] Documentation complete
- [ ] Code reviewed and merged

**User Experience Goals:**
- Clue usage rate: 40-60% of games
- Average clues per game: 1-2
- User satisfaction: Positive feedback
- Zero instances of answer revelation

## Future Iterations

### V2 Ideas
- Community-submitted clues
- Clue quality ratings
- Adaptive difficulty (clues get easier)
- Themed clue packs
- Multiplayer clue challenges

## Notes

- This feature leverages ChatGPT's creativity uniquely
- Important: Agent instructions must prevent answer revelation
- Consider A/B testing clue limits (3 vs unlimited)
- Monitor clue usage patterns for insights
- Could expand to other word games in the future

---

**Created:** 2026-01-19
**Feature Spec:** `/docs/CRYPTIC_CLUES_FEATURE_SPEC.md`
**Status:** Ready for implementation
