# Issue #17.10: Update Frontend Tool Integration

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 3 - Frontend Refactoring
**Duration:** 1.5 hours
**Priority:** Critical
**Dependencies:** #17.5, #17.8

## Description

Update all frontend MCP tool integration code to use the new Word Morph tool IDs and resource URIs. This ensures the frontend communicates correctly with the updated backend.

## Objectives

- Update tool IDs in frontend code
- Update resource URIs
- Update widget state management
- Update hooks for tool communication
- Update error messages
- Ensure end-to-end tool flow works

## Files to Update

### 1. `/web/src/hooks/useToolInput.ts`

**Update tool ID constants:**

```typescript
// OLD
const TOOL_IDS = {
  START_GAME: 'gamebox.start_word_challenge',
  CHECK_GUESS: 'gamebox.check_word_guess',
} as const;

// NEW
const TOOL_IDS = {
  START_GAME: 'gamebox.start_word_morph',
  CHECK_GUESS: 'gamebox.check_word_morph_guess',
} as const;
```

**Update function calls:**

```typescript
// OLD
function startWordChallenge(difficulty: Difficulty) {
  return invokeTool('gamebox.start_word_challenge', { difficulty });
}

function checkWordGuess(guess: string) {
  return invokeTool('gamebox.check_word_guess', { guess });
}

// NEW
function startWordMorph(difficulty: Difficulty) {
  return invokeTool('gamebox.start_word_morph', { difficulty });
}

function checkWordMorphGuess(guess: string) {
  return invokeTool('gamebox.check_word_morph_guess', { guess });
}
```

**Update hook exports:**

```typescript
// OLD
export function useWordChallenge() {
  // ...
}

// NEW
export function useWordMorph() {
  // ...
}
```

### 2. `/web/src/hooks/useToolOutput.ts`

**Update tool output handling:**

```typescript
// OLD
function handleToolOutput(output: ToolOutput) {
  if (output.toolName === 'gamebox.start_word_challenge') {
    // Handle Word Challenge start
  }
  if (output.toolName === 'gamebox.check_word_guess') {
    // Handle Word Challenge guess
  }
}

// NEW
function handleToolOutput(output: ToolOutput) {
  if (output.toolName === 'gamebox.start_word_morph') {
    // Handle Word Morph start
  }
  if (output.toolName === 'gamebox.check_word_morph_guess') {
    // Handle Word Morph guess
  }
}
```

**Update type definitions:**

```typescript
// Update if there are Word Challenge specific types
type WordMorphToolOutput = {
  toolName: 'gamebox.start_word_morph' | 'gamebox.check_word_morph_guess';
  result: GameState;
};
```

### 3. `/web/src/hooks/useWidgetState.ts`

**Update state management:**

```typescript
// OLD
interface WidgetState {
  gameType: 'word-challenge';
  // ...
}

// NEW
interface WidgetState {
  gameType: 'word-morph';
  // ...
}
```

**Update initialization:**

```typescript
// OLD
const initialState: WidgetState = {
  gameType: 'word-challenge',
  isActive: false,
  // ...
};

// NEW
const initialState: WidgetState = {
  gameType: 'word-morph',
  isActive: false,
  // ...
};
```

**Update local storage keys:**

```typescript
// OLD
const STORAGE_KEY = 'gamebox-word-challenge-state';

// NEW
const STORAGE_KEY = 'gamebox-word-morph-state';
```

### 4. `/web/src/main.tsx`

**Update widget registration:**

```typescript
// OLD
const widgets = {
  'word-challenge': {
    component: WordChallenge,
    uri: 'ui://widget/word-challenge.html',
    name: 'Word Challenge'
  }
};

// NEW
const widgets = {
  'word-morph': {
    component: WordMorph,
    uri: 'ui://widget/word-morph.html',
    name: 'Word Morph'
  }
};
```

**Update resource URI handling:**

```typescript
// OLD
if (resourceUri === 'ui://widget/word-challenge.html') {
  return <WordChallenge />;
}

// NEW
if (resourceUri === 'ui://widget/word-morph.html') {
  return <WordMorph />;
}
```

### 5. Error Messages

**Update error messages in all hooks:**

```typescript
// OLD
throw new Error('Failed to start Word Challenge game');
throw new Error('No active Word Challenge game');
throw new Error('Invalid Word Challenge guess');

// NEW
throw new Error('Failed to start Word Morph game');
throw new Error('No active Word Morph game');
throw new Error('Invalid Word Morph guess');
```

### 6. Type Definitions

**Update type files if they exist:**

```typescript
// In types/game.ts or similar
// OLD
export type GameType = 'word-challenge' | 'connections' | 'spelling-bee' | '20-questions' | 'trivia-challenge';

// NEW
export type GameType = 'word-morph' | 'kinship' | 'lexicon-smith' | 'twenty-queries' | 'lore-master';
```

### 7. Hook Tests

**Update hook test files:**

```typescript
// In useToolInput.test.ts
// OLD
describe('useWordChallenge', () => {
  it('calls gamebox.start_word_challenge', async () => {
    const { result } = renderHook(() => useWordChallenge());
    await result.current.startGame('medium');
    expect(mockInvokeTool).toHaveBeenCalledWith(
      'gamebox.start_word_challenge',
      { difficulty: 'medium' }
    );
  });
});

// NEW
describe('useWordMorph', () => {
  it('calls gamebox.start_word_morph', async () => {
    const { result } = renderHook(() => useWordMorph());
    await result.current.startGame('medium');
    expect(mockInvokeTool).toHaveBeenCalledWith(
      'gamebox.start_word_morph',
      { difficulty: 'medium' }
    );
  });
});
```

## Integration Testing

### Manual MCP Integration Test

**Test the complete flow:**

1. **Start Game:**
```typescript
// Frontend calls
invokeTool('gamebox.start_word_morph', { difficulty: 'medium' })

// Backend receives and responds
✅ New game created with Word Morph
```

2. **Check Guess:**
```typescript
// Frontend calls
invokeTool('gamebox.check_word_morph_guess', { guess: 'SLATE' })

// Backend receives and responds
✅ Guess processed, feedback returned
```

3. **Widget Display:**
```typescript
// Frontend requests
resourceUri: 'ui://widget/word-morph.html'

// Backend responds
✅ Widget HTML with Word Morph branding
```

### Mock Test

**Create integration test file:**

```typescript
// In web/src/__tests__/integration/wordMorphFlow.test.ts
describe('Word Morph MCP Integration', () => {
  beforeEach(() => {
    mockMCPClient.reset();
  });

  it('completes full game flow', async () => {
    // 1. Start game
    const startResponse = await mockMCPClient.invokeTool(
      'gamebox.start_word_morph',
      { difficulty: 'medium' }
    );
    expect(startResponse.success).toBe(true);

    // 2. Make guess
    const guessResponse = await mockMCPClient.invokeTool(
      'gamebox.check_word_morph_guess',
      { guess: 'SLATE' }
    );
    expect(guessResponse.success).toBe(true);

    // 3. Load widget
    const widgetResponse = await mockMCPClient.getResource(
      'ui://widget/word-morph.html'
    );
    expect(widgetResponse).toContain('Word Morph');
  });
});
```

## Testing Requirements

### Hook Tests

```bash
cd web
npm test -- useToolInput.test.ts
npm test -- useToolOutput.test.ts
npm test -- useWidgetState.test.ts
```

**Expected:**
- [ ] All hook tests pass
- [ ] Tool IDs match backend
- [ ] Resource URIs match backend
- [ ] State management works

### Integration Tests

```bash
npm test -- integration/
```

**Expected:**
- [ ] MCP tool invocation works
- [ ] Widget rendering works
- [ ] State synchronization works

### End-to-End Manual Test

**With backend running:**

```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd web && npm run dev
```

**Test in browser:**
1. Open widget in browser
2. Click "New Game"
3. Verify MCP tool `gamebox.start_word_morph` is called
4. Make a guess
5. Verify MCP tool `gamebox.check_word_morph_guess` is called
6. Check browser console for errors
7. Verify game state updates correctly

**Expected:**
- [ ] No console errors
- [ ] Tools invoke successfully
- [ ] Game state updates
- [ ] UI reflects changes

## Acceptance Criteria

- [ ] Tool IDs updated to `start_word_morph` and `check_word_morph_guess`
- [ ] Resource URI updated to `ui://widget/word-morph.html`
- [ ] All hook functions renamed
- [ ] Widget state management updated
- [ ] Local storage keys updated
- [ ] Error messages updated
- [ ] Type definitions updated
- [ ] Hook tests pass
- [ ] Integration tests pass
- [ ] Manual E2E test passes
- [ ] No console errors
- [ ] MCP communication works correctly

## Search and Verify

Before marking complete:

```bash
cd web/src
grep -rn "word_challenge" .
grep -rn "word-challenge.html" .
grep -rn "gamebox.start_word_challenge" .
grep -rn "gamebox.check_word_guess" .
```

**Expected:** Zero results (all updated to new tool IDs)

## Implementation Checklist

**Tool ID Updates:**
- [ ] Update `TOOL_IDS` constants
- [ ] Update hook functions
- [ ] Update hook exports
- [ ] Update tool output handlers

**Resource Updates:**
- [ ] Update widget URI references
- [ ] Update widget registration
- [ ] Update resource handling

**State Management:**
- [ ] Update state types
- [ ] Update initial state
- [ ] Update storage keys

**Error Handling:**
- [ ] Update error messages
- [ ] Update error types

**Tests:**
- [ ] Update hook tests
- [ ] Create integration tests
- [ ] Run all tests
- [ ] Manual E2E test

**Verification:**
- [ ] Search for old tool IDs
- [ ] Verify no references remain
- [ ] Test with backend running

## Breaking Changes

**Old Tool IDs (Removed):**
- `gamebox.start_word_challenge` ❌
- `gamebox.check_word_guess` ❌

**New Tool IDs (Added):**
- `gamebox.start_word_morph` ✅
- `gamebox.check_word_morph_guess` ✅

**Old Resource URI (Removed):**
- `ui://widget/word-challenge.html` ❌

**New Resource URI (Added):**
- `ui://widget/word-morph.html` ✅

## Related Tasks

- **Depends on:** #17.5 (Backend tools must be updated)
- **Depends on:** #17.8 (Component must be renamed)
- **Blocks:** #17.12 (E2E tests need tool integration)
- **Related:** #17.16 (Migration guide documents these changes)

## Labels

- `phase-3-frontend`
- `critical`
- `breaking-change`
- `mcp-integration`
- `epic-17`
