# Issue #17.20: Add Picture-in-Picture Mode

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** Apps SDK Enhancement
**Duration:** 2-3 hours
**Priority:** MEDIUM (Recommended Enhancement)
**Dependencies:** #17.18

## Description

Implement Picture-in-Picture (PiP) mode for Word Morph to allow the game to stay visible while users chat with the agent. This is explicitly recommended by OpenAI for game widgets and provides a significantly better user experience.

## Problem Statement

**Current State:**
- Widget only appears inline in conversation
- Game disappears when scrolling
- Hard to play while chatting about strategy
- Can't see game while requesting clues

**With PiP Mode:**
- Game stays visible in floating window
- Persistent during scroll
- Can chat and play simultaneously
- Perfect for requesting/discussing clues
- Better overall game experience

## OpenAI Recommendation

> "Picture-in-Picture mode perfect for games that run alongside conversation"
>
> — Apps SDK Documentation

**Use Cases for PiP:**
- Games that benefit from persistence
- Activities users do while chatting
- Reference materials needed during conversation
- Long-running tasks

**Word Morph fits perfectly:**
- Players often want clues from agent
- Strategic discussions benefit from seeing board
- Game state needs to stay visible
- Natural conversational gameplay

## Implementation

### 1. Request PiP Mode

**File:** `/web/src/widgets/WordMorph.tsx`

```tsx
import { useState, useEffect } from 'react';

function WordMorph() {
  const [displayMode, setDisplayMode] = useState<string>('inline');

  // Automatically request PiP when game starts
  useEffect(() => {
    async function requestPiP() {
      try {
        const result = await window.openai?.requestDisplayMode({
          mode: 'picture-in-picture'
        });

        // May be granted or denied
        setDisplayMode(result?.mode || 'inline');
      } catch (error) {
        console.log('PiP not available:', error);
        setDisplayMode('inline');
      }
    }

    requestPiP();
  }, []);

  // Adapt UI based on display mode
  const isPiP = displayMode === 'picture-in-picture';

  return (
    <div className="word-morph-container" data-display-mode={displayMode}>
      {/* Adjust layout for PiP */}
      {isPiP && <CompactHeader />}
      {!isPiP && <FullHeader />}

      <GameGrid />
      <Keyboard />
    </div>
  );
}
```

### 2. Manual PiP Toggle (Optional)

**Add button to let users control PiP:**

```tsx
function PiPToggle() {
  const [displayMode, setDisplayMode] = useState('inline');

  async function togglePiP() {
    const newMode = displayMode === 'inline' ? 'picture-in-picture' : 'inline';

    try {
      const result = await window.openai?.requestDisplayMode({
        mode: newMode
      });

      setDisplayMode(result?.mode || 'inline');
    } catch (error) {
      console.error('Failed to change display mode:', error);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={togglePiP}
      aria-label={displayMode === 'inline' ? 'Open in picture-in-picture' : 'Return to inline'}
    >
      {displayMode === 'inline' ? '⬈' : '⬊'}
    </Button>
  );
}
```

### 3. Detect Current Display Mode

**Read from window.openai:**

```tsx
function WordMorph() {
  const [displayMode, setDisplayMode] = useState(() => {
    return window.openai?.displayMode || 'inline';
  });

  // Listen for display mode changes (if host notifies)
  useEffect(() => {
    function handleDisplayModeChange(event: CustomEvent) {
      setDisplayMode(event.detail.mode);
    }

    window.addEventListener(
      'displaymodechange',
      handleDisplayModeChange as EventListener
    );

    return () => {
      window.removeEventListener(
        'displaymodechange',
        handleDisplayModeChange as EventListener
      );
    };
  }, []);

  return (
    <div data-display-mode={displayMode}>
      {/* Adapt UI */}
    </div>
  );
}
```

### 4. Adaptive UI for PiP

**Adjust layout when in PiP:**

```tsx
function WordMorph() {
  const isPiP = displayMode === 'picture-in-picture';

  return (
    <div className={isPiP ? 'pip-layout' : 'inline-layout'}>
      {/* Compact header in PiP */}
      {isPiP ? (
        <Stack direction="horizontal" spacing="sm" justify="between">
          <Text size="sm">WM</Text>
          <Text size="xs">{guessCount}/6</Text>
        </Stack>
      ) : (
        <Stack spacing="md">
          <Heading size="lg">Word Morph</Heading>
          <Text>Guess {guessCount} of 6</Text>
        </Stack>
      )}

      {/* Game grid (same in both modes) */}
      <GameGrid />

      {/* Compact keyboard in PiP */}
      <Keyboard compact={isPiP} />
    </div>
  );
}
```

**CSS for PiP:**

```css
/* Picture-in-Picture specific styles */
.word-morph-container[data-display-mode="picture-in-picture"] {
  /* More compact spacing */
  --spacing-scale: 0.8;

  /* Smaller tiles */
  --tile-size: 48px;

  /* Smaller keyboard */
  --key-size: 32px;

  /* Reduce padding */
  padding: var(--token-spacing-sm);
}

.pip-layout {
  /* Maximize vertical space */
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pip-layout .word-morph-keyboard {
  /* Smaller keyboard keys */
  font-size: 12px;
  gap: 4px;
}
```

## Display Mode Strategies

### Strategy 1: Auto-PiP on Start

**When:** Game starts
**Action:** Automatically request PiP
**Benefit:** Immediately available for conversation
**Risk:** User might not expect it

```tsx
useEffect(() => {
  if (gameStarted && !hasRequestedPiP) {
    requestPiP();
    setHasRequestedPiP(true);
  }
}, [gameStarted]);
```

### Strategy 2: PiP on First Clue Request

**When:** User requests first clue
**Action:** Switch to PiP before showing clue
**Benefit:** Clear UX - game stays visible while agent responds
**Risk:** None (natural trigger)

```tsx
async function handleGetClue() {
  // Switch to PiP so game stays visible while agent responds
  if (displayMode === 'inline') {
    await requestPiP();
  }

  // Request clue
  await window.openai.callTool('gamebox.get_word_morph_clue', {
    clue_type: 'cryptic'
  });
}
```

### Strategy 3: User Choice (Recommended)

**When:** User clicks PiP button
**Action:** Toggle between inline and PiP
**Benefit:** User control
**Risk:** None

```tsx
<Stack direction="horizontal" justify="between">
  <Heading>Word Morph</Heading>
  <PiPToggle />
</Stack>
```

## User Experience

### In PiP Mode

**User Flow:**
1. User clicks "Open in PiP" or game auto-opens
2. Widget moves to floating window
3. User can scroll conversation
4. Game stays visible in corner
5. User types clue request in main chat
6. Game remains visible while agent responds
7. User makes guesses based on clue
8. Can close PiP anytime to return inline

**Benefits:**
- ✅ Game never disappears
- ✅ Can chat and play simultaneously
- ✅ Natural for clue-based gameplay
- ✅ Better strategic thinking
- ✅ More engaging experience

## Testing Requirements

### Manual Testing

**Test Scenarios:**

1. **PiP Request:**
   ```
   - Start game
   - Click PiP button
   - Verify window opens
   - Verify game still works
   - Verify can interact with game
   ```

2. **PiP with Clues:**
   ```
   - Open game in PiP
   - Request clue in main chat
   - Verify game stays visible
   - Verify clue displays correctly
   - Make guess based on clue
   ```

3. **PiP Toggle:**
   ```
   - Open PiP
   - Close PiP (return inline)
   - Re-open PiP
   - Verify state preserved
   ```

4. **Scroll Behavior:**
   ```
   - Open PiP
   - Scroll conversation
   - Verify PiP stays fixed
   - Verify no z-index issues
   ```

### E2E Testing

```typescript
test.describe('Picture-in-Picture', () => {
  test('should request PiP mode', async ({ page }) => {
    await page.goto('/widget/word-morph');

    // Mock window.openai.requestDisplayMode
    await page.evaluate(() => {
      window.openai = {
        requestDisplayMode: async ({ mode }) => ({ mode }),
        displayMode: 'inline'
      };
    });

    // Click PiP button
    await page.click('[aria-label="Open in picture-in-picture"]');

    // Verify PiP requested
    const displayMode = await page.evaluate(() => window.openai.displayMode);
    expect(displayMode).toBe('picture-in-picture');
  });

  test('should adapt UI for PiP', async ({ page }) => {
    await page.goto('/widget/word-morph');

    // Set PiP mode
    await page.evaluate(() => {
      window.openai = { displayMode: 'picture-in-picture' };
    });

    // Reload component
    await page.reload();

    // Verify compact layout
    const container = page.locator('[data-display-mode="picture-in-picture"]');
    await expect(container).toBeVisible();
  });
});
```

## UI/UX Considerations

### PiP Window Size

**Typical Dimensions:**
- Width: 300-400px
- Height: 400-600px
- Adjustable by user

**Adapt layout:**
- Compact header (save space)
- Smaller tiles (fit better)
- Smaller keyboard
- Hide non-essential elements

### Mobile PiP

**Note:** PiP may not be available on all mobile devices

```tsx
function usePiPSupport() {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Check if PiP is supported
    const isPiPSupported = 'requestDisplayMode' in (window.openai || {});
    setSupported(isPiPSupported);
  }, []);

  return supported;
}

function PiPToggle() {
  const supported = usePiPSupport();

  if (!supported) return null;

  return <Button onClick={togglePiP}>PiP</Button>;
}
```

## Acceptance Criteria

- [ ] `window.openai.requestDisplayMode()` implemented
- [ ] PiP mode can be toggled by user
- [ ] Widget detects current display mode
- [ ] UI adapts to PiP layout (compact)
- [ ] Game functionality preserved in PiP
- [ ] Clues work correctly in PiP
- [ ] State persists across mode changes
- [ ] E2E tests for PiP
- [ ] Mobile graceful degradation
- [ ] Documentation updated

## Optional Enhancements

### 1. Auto-PiP on Clue Request

```tsx
async function handleGetClue() {
  // Automatically open PiP when getting clue
  if (displayMode === 'inline' && isPiPSupported) {
    await requestPiP();
  }

  await getClue();
}
```

### 2. PiP Persistence

```tsx
// Remember user's PiP preference
const [prefersPiP, setPrefersPiP] = useLocalStorage('word-morph-pip', false);

useEffect(() => {
  if (prefersPiP && displayMode === 'inline') {
    requestPiP();
  }
}, [prefersPiP, displayMode]);
```

### 3. Smart PiP Suggestions

```tsx
// Suggest PiP after first clue request
if (cluesRequested === 1 && displayMode === 'inline') {
  showToast('Tip: Open in PiP to keep the game visible while chatting!');
}
```

## Performance

**PiP Mode Impact:**
- ✅ No performance penalty
- ✅ Same React component
- ✅ Just CSS adjustments
- ✅ No additional rendering

## Documentation

**Add to `/web/README.md`:**

```markdown
## Picture-in-Picture Mode

Word Morph supports Picture-in-Picture mode for a better gaming experience:

### Benefits
- Keep game visible while chatting
- Perfect for requesting and discussing clues
- Natural conversational gameplay

### Usage
Click the PiP button in the game header to open/close Picture-in-Picture mode.

### API
```typescript
// Request PiP mode
await window.openai.requestDisplayMode({ mode: 'picture-in-picture' });

// Return to inline
await window.openai.requestDisplayMode({ mode: 'inline' });

// Check current mode
const mode = window.openai.displayMode; // 'inline' | 'picture-in-picture' | 'fullscreen'
```
```

## Related Tasks

- **Enhances:** Cryptic clues feature (perfect for viewing clues)
- **Depends on:** #17.18 (Widget state - state must persist across modes)
- **Related:** #17.19 (Apps SDK UI - use Button component)

## Labels

- `medium-priority`
- `apps-sdk-enhancement`
- `user-experience`
- `epic-17`
- `pip-mode`
