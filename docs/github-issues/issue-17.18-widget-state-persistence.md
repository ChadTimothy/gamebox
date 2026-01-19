# Issue #17.18: Implement Widget State Persistence

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** Apps SDK Compliance
**Duration:** 2-3 hours
**Priority:** CRITICAL (Blocks App Store Submission)
**Dependencies:** None

## Description

Implement `window.openai.setWidgetState()` to persist game state across conversation turns. This is required for proper widget functionality in ChatGPT and enables the agent to see and reference game state.

## Problem Statement

**Current State:**
- Game state only exists in server memory
- Widget doesn't persist UI state
- Agent cannot see widget state
- Users lose progress when widget reloads
- State doesn't persist across conversation turns

**Required State:**
- Widget state persists using `window.openai.setWidgetState()`
- State rehydrates from `window.openai.widgetState`
- Agent can see and reference widget state
- User progress maintained across turns
- Clue history, guesses, UI state all persist

## Objectives

- Create `useWidgetState` custom hook
- Implement state persistence with `window.openai.setWidgetState()`
- Hydrate state from `window.openai.widgetState` on load
- Persist all relevant game state
- Enable agent to reference widget state
- Test persistence across conversation turns

## Widget State Architecture

### What to Store

**DO Store (Visible to Agent):**
- Current guess progress
- Guess history with results
- Clues received
- Remaining clues
- Game status (playing, won, lost)
- Streak information
- Statistics

**DON'T Store:**
- Target word (security - agent already knows this)
- Animation states
- Temporary UI state
- Internal implementation details

### Size Considerations

> "Keep the payload focused and well under 4k tokens for performance"

**Estimate Token Usage:**
```typescript
// Example widget state
{
  currentGuess: "SLA",              // ~5 tokens
  guessHistory: [                   // ~100 tokens
    { word: "CRANE", result: "🟨⬜⬜⬜🟩" },
    { word: "SLATE", result: "🟩🟩🟩🟩🟩" }
  ],
  cluesReceived: [                  // ~200 tokens
    {
      text: "Rock's smooth surface (5)",
      timestamp: 1234567890
    }
  ],
  cluesRemaining: 2,                // ~5 tokens
  gameStatus: "playing",            // ~5 tokens
  streak: 5                         // ~5 tokens
}
// Total: ~320 tokens (well under 4k limit ✅)
```

## Implementation

### 1. Create useWidgetState Hook

**File:** `/web/src/hooks/useWidgetState.ts` (new file)

```typescript
import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting widget state using window.openai API
 *
 * State is automatically persisted to ChatGPT and visible to the agent.
 * State rehydrates from window.openai.widgetState on initial load.
 *
 * @param initialState - Default state when no persisted state exists
 * @returns [state, setState] tuple like useState
 */
export function useWidgetState<T extends object>(
  initialState: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    // Hydrate from persisted state if available
    if (typeof window !== 'undefined' && window.openai?.widgetState) {
      return { ...initialState, ...window.openai.widgetState };
    }
    return initialState;
  });

  // Persist state whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.openai?.setWidgetState) {
      window.openai.setWidgetState(state);
    }
  }, [state]);

  return [state, setState];
}
```

### 2. Define Widget State Interface

**File:** `/web/src/types/widgetState.ts` (new file)

```typescript
export interface GuessResult {
  word: string;
  result: string; // Emoji string like "🟩🟨⬜⬜⬜"
  timestamp: number;
}

export interface ClueReceived {
  text: string;
  type: 'cryptic' | 'definition' | 'rhyme' | 'anagram';
  timestamp: number;
}

export interface WordMorphWidgetState {
  // Current game state
  currentGuess: string;
  guessHistory: GuessResult[];
  gameStatus: 'idle' | 'playing' | 'won' | 'lost';

  // Clues
  cluesReceived: ClueReceived[];
  cluesRemaining: number;
  maxClues: number;

  // Stats
  streak: number;
  gamesPlayed: number;
  gamesWon: number;

  // Metadata
  gameStartTime: number;
  lastUpdated: number;
}

export const DEFAULT_WIDGET_STATE: WordMorphWidgetState = {
  currentGuess: '',
  guessHistory: [],
  gameStatus: 'idle',
  cluesReceived: [],
  cluesRemaining: 3,
  maxClues: 3,
  streak: 0,
  gamesPlayed: 0,
  gamesWon: 0,
  gameStartTime: 0,
  lastUpdated: 0
};
```

### 3. Update WordMorph Component

**File:** `/web/src/widgets/WordMorph.tsx`

```tsx
import { useWidgetState } from '../hooks/useWidgetState';
import { WordMorphWidgetState, DEFAULT_WIDGET_STATE } from '../types/widgetState';

function WordMorph() {
  const [widgetState, setWidgetState] = useWidgetState<WordMorphWidgetState>(
    DEFAULT_WIDGET_STATE
  );

  // Get tool output (initial game data from server)
  const toolOutput = window.openai?.toolOutput;

  // Handle new guess
  function handleGuess(guess: string) {
    // Submit guess to server via MCP tool
    window.openai.callTool('gamebox.check_word_morph_guess', { guess })
      .then((response) => {
        // Update widget state with result
        setWidgetState({
          ...widgetState,
          currentGuess: '',
          guessHistory: [
            ...widgetState.guessHistory,
            {
              word: guess,
              result: response.result.feedback, // Emoji string
              timestamp: Date.now()
            }
          ],
          gameStatus: response.result.gameOver
            ? response.result.won ? 'won' : 'lost'
            : 'playing',
          lastUpdated: Date.now()
        });
      });
  }

  // Handle letter input
  function handleLetterInput(letter: string) {
    if (widgetState.currentGuess.length < 5) {
      setWidgetState({
        ...widgetState,
        currentGuess: widgetState.currentGuess + letter
      });
    }
  }

  // Handle backspace
  function handleBackspace() {
    setWidgetState({
      ...widgetState,
      currentGuess: widgetState.currentGuess.slice(0, -1)
    });
  }

  return (
    <div className="word-morph-container">
      <GameGrid
        guessHistory={widgetState.guessHistory}
        currentGuess={widgetState.currentGuess}
      />

      <Keyboard
        onLetterClick={handleLetterInput}
        onBackspace={handleBackspace}
        onEnter={() => handleGuess(widgetState.currentGuess)}
        usedLetters={getUsedLetters(widgetState.guessHistory)}
      />

      <GameStatus status={widgetState.gameStatus} />
    </div>
  );
}
```

### 4. State Persistence Behavior

**When State Updates:**
```typescript
// User types a letter
setWidgetState({
  ...widgetState,
  currentGuess: widgetState.currentGuess + 'A'
});

// Automatically persisted via useEffect in hook
// Agent can now see: { currentGuess: "A", ... }
```

**When Widget Reloads:**
```typescript
// Widget initializes
const [widgetState] = useWidgetState(DEFAULT_STATE);

// State rehydrates from window.openai.widgetState
// User sees their previous progress
// { currentGuess: "SLA", guessHistory: [...], ... }
```

**Agent Can Reference State:**
```
User: "How many guesses do I have left?"
Agent: *Checks widgetState.guessHistory.length*
Agent: "You've used 3 guesses, you have 3 remaining!"
```

### 5. Add Type Definitions for window.openai

**File:** `/web/src/types/window.d.ts` (new file)

```typescript
export interface OpenAIWidget {
  // Widget state management
  widgetState?: any;
  setWidgetState: (state: any) => void;

  // Tool invocation
  callTool: (toolName: string, args: any) => Promise<any>;

  // Tool output (from server)
  toolOutput?: any;

  // Theme
  theme?: 'light' | 'dark';

  // Display mode
  displayMode?: 'inline' | 'picture-in-picture' | 'fullscreen';
  requestDisplayMode: (options: { mode: string }) => Promise<any>;

  // Other APIs
  sendFollowUpMessage: (options: { prompt: string }) => Promise<void>;
  openExternal: (options: { href: string }) => void;
  uploadFile: (file: File) => Promise<{ url: string }>;
}

declare global {
  interface Window {
    openai?: OpenAIWidget;
  }
}

export {};
```

## Testing Requirements

### Unit Tests

**File:** `/web/src/hooks/useWidgetState.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useWidgetState } from './useWidgetState';

describe('useWidgetState', () => {
  beforeEach(() => {
    // Mock window.openai
    (window as any).openai = {
      widgetState: null,
      setWidgetState: jest.fn()
    };
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useWidgetState({ count: 0 })
    );

    expect(result.current[0]).toEqual({ count: 0 });
  });

  it('should hydrate from persisted state', () => {
    (window as any).openai.widgetState = { count: 5 };

    const { result } = renderHook(() =>
      useWidgetState({ count: 0 })
    );

    expect(result.current[0]).toEqual({ count: 5 });
  });

  it('should persist state on update', () => {
    const { result } = renderHook(() =>
      useWidgetState({ count: 0 })
    );

    act(() => {
      result.current[1]({ count: 1 });
    });

    expect(window.openai?.setWidgetState).toHaveBeenCalledWith({ count: 1 });
  });
});
```

### Integration Tests

**Test persistence across "turns":**

```typescript
test('should maintain state across widget reloads', async () => {
  // Simulate first load
  const { unmount } = render(<WordMorph />);

  // User types letters
  await userEvent.type(screen.getByRole('textbox'), 'SLA');

  // State is persisted
  const persistedState = (window as any).openai.lastPersistedState;

  // Widget unmounts (simulating new turn)
  unmount();

  // Mock persisted state
  (window as any).openai.widgetState = persistedState;

  // Widget remounts
  render(<WordMorph />);

  // State should be restored
  expect(screen.getByText('SLA')).toBeInTheDocument();
});
```

### Manual Testing

**Test Scenario:**
1. Start a Word Morph game
2. Type some letters: "SLA"
3. Make a guess: "SLATE"
4. Request a clue
5. Type in main ChatGPT composer (creates new widget)
6. Verify game state is preserved
7. Verify clue history is visible
8. Verify guess history is shown

**Expected Behavior:**
- ✅ Current guess restored
- ✅ Guess history visible
- ✅ Clues still shown
- ✅ No data loss

## Acceptance Criteria

### Widget State Persistence
- [ ] `useWidgetState` hook created
- [ ] Widget state interface defined
- [ ] State persists using `window.openai.setWidgetState()`
- [ ] State rehydrates from `window.openai.widgetState`
- [ ] WordMorph component uses hook
- [ ] Current guess persists
- [ ] Guess history persists
- [ ] Clue history persists
- [ ] Game status persists
- [ ] State size under 4k tokens
- [ ] Type definitions added

### Loading State Pattern (CRITICAL - App Store Required)
- [ ] **`useToolOutputPolling` hook created**
- [ ] **Widget polls for toolOutput on mount**
- [ ] **Loading spinner shown while polling**
- [ ] **Error message shown if polling fails**
- [ ] **Initialization guard prevents re-initialization**
- [ ] **Component doesn't render until toolOutput ready**
- [ ] **Polling interval: 100ms**
- [ ] **Max attempts: 50 (5 second timeout)**

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing successful
- [ ] Loading state tested
- [ ] Polling timeout tested

## Loading State Pattern (CRITICAL - Added from Agent Review)

**Problem:** `window.openai.toolOutput` may not be immediately available on widget load. The widget must poll for it.

### Create useToolOutputPolling Hook

**File:** `/web/src/hooks/useToolOutputPolling.ts` (new file)

```typescript
import { useState, useEffect } from 'react';

interface PollingOptions {
  interval?: number;      // Polling interval in ms (default: 100ms)
  maxAttempts?: number;   // Max polling attempts (default: 50 = 5s)
}

/**
 * Poll for window.openai.toolOutput on component mount.
 *
 * ChatGPT may not have toolOutput ready immediately when widget loads.
 * This hook polls until toolOutput is available or max attempts reached.
 *
 * @param options - Polling configuration
 * @returns { toolOutput, isLoading, error }
 */
export function useToolOutputPolling(options: PollingOptions = {}) {
  const { interval = 100, maxAttempts = 50 } = options;

  const [toolOutput, setToolOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let attempts = 0;
    let timeoutId: NodeJS.Timeout;

    const checkForToolOutput = () => {
      attempts++;

      // Check if toolOutput is available
      if (window.openai?.toolOutput) {
        setToolOutput(window.openai.toolOutput);
        setIsLoading(false);
        return;
      }

      // Max attempts reached
      if (attempts >= maxAttempts) {
        setError('Failed to load game data after ' + maxAttempts + ' attempts');
        setIsLoading(false);
        return;
      }

      // Continue polling
      timeoutId = setTimeout(checkForToolOutput, interval);
    };

    // Start polling
    checkForToolOutput();

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [interval, maxAttempts]);

  return { toolOutput, isLoading, error };
}
```

### Update WordMorph Component

**File:** `/web/src/widgets/WordMorph.tsx`

```tsx
import { useToolOutputPolling } from '../hooks/useToolOutputPolling';
import { useWidgetState } from '../hooks/useWidgetState';

function WordMorph() {
  // Poll for initial tool output
  const { toolOutput, isLoading, error } = useToolOutputPolling();

  // Widget state persistence
  const [widgetState, setWidgetState] = useWidgetState(DEFAULT_WIDGET_STATE);

  // Show loading state while polling
  if (isLoading) {
    return <LoadingSpinner message="Starting Word Morph..." />;
  }

  // Show error if polling failed
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Initialize game state from toolOutput if starting new game
  useEffect(() => {
    if (toolOutput && widgetState.gameStatus === 'idle') {
      setWidgetState({
        ...widgetState,
        gameStatus: 'playing',
        gameStartTime: Date.now(),
        streak: toolOutput.structuredContent?.streak || 0,
        gamesPlayed: toolOutput.structuredContent?.totalGamesPlayed || 0
      });
    }
  }, [toolOutput]);

  // Rest of component...
}
```

### Loading UI Guards (CRITICAL)

**Problem:** Multiple `window.openai` checks can cause re-initialization.

**Pattern from ChatGPT App Builder skill:**

```tsx
function WordMorph() {
  const { toolOutput, isLoading } = useToolOutputPolling();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only initialize once when toolOutput is ready
    if (toolOutput && !initialized) {
      // Initialize game from toolOutput
      setInitialized(true);
    }
  }, [toolOutput, initialized]);

  // GUARD: Don't render game until initialized
  if (isLoading || !initialized) {
    return <LoadingSpinner />;
  }

  // Safe to render - toolOutput is ready and game is initialized
  return <GameUI />;
}
```

**Key principle:** Use a flag to prevent re-initialization even if window.openai changes.

## Performance Considerations

**Throttle State Updates:**

For rapid state changes (typing), consider throttling:

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

export function useWidgetState<T>(initialState: T) {
  const [state, setState] = useState<T>(/* ... */);

  // Debounce persist calls
  const persistState = useMemo(
    () => debounce((newState: T) => {
      window.openai?.setWidgetState(newState);
    }, 300),
    []
  );

  useEffect(() => {
    persistState(state);
  }, [state, persistState]);

  return [state, setState];
}
```

## Documentation Updates

**Files to update:**
- `/web/README.md` - Add widget state section
- `/docs/APPS_SDK_COMPLIANCE_ANALYSIS.md` - Mark as complete
- Add JSDoc to hook
- Add examples to documentation

## Related Tasks

- **Blocks:** Cryptic clues feature (needs state for clue history)
- **Related:** #17.17 (Dark mode)
- **Related:** Cryptic clues tasks

## Labels

- `critical`
- `apps-sdk-compliance`
- `state-management`
- `epic-17`
- `app-store-required`
