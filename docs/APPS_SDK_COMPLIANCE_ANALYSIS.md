# ChatGPT Apps SDK Compliance Analysis

**Date:** 2026-01-19
**Purpose:** Verify GameBox Word Morph implementation aligns with OpenAI Apps SDK requirements
**Status:** ✅ Generally Compliant with Recommendations

---

## Executive Summary

### Overall Assessment: ✅ Good Foundation

**Current Implementation:**
- ✅ Correct MCP architecture (tools, resources, widgets)
- ✅ `ui://widget/` resource URI pattern is correct
- ✅ `window.openai` API understanding is accurate
- ✅ Game state management approach is sound
- ✅ Tool registration pattern follows best practices

**Recommendations:**
- 🔧 Add dark mode support (CRITICAL for App Store)
- 🔧 Integrate `@openai/apps-sdk-ui` design system
- 🔧 Implement `window.openai.setWidgetState()` for persistence
- 🔧 Consider Picture-in-Picture mode for games
- 🔧 Update cryptic clues feature to leverage widget state better

---

## Detailed Analysis

### 1. MCP Server Implementation ✅ CORRECT

**What We're Doing:**
```typescript
// server/src/index.ts
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'gamebox.start_word_morph',
        description: 'Start a new Word Morph game',
        inputSchema: { /* ... */ }
      }
    ]
  };
});
```

**Apps SDK Requirement:**
> "Servers list available tools with JSON Schema input/output contracts"

**Status:** ✅ Compliant
**Evidence:** Tool registration matches MCP spec exactly

---

### 2. Resource URI Pattern ✅ CORRECT

**What We're Doing:**
```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'ui://widget/word-morph.html',
        name: 'Word Morph Widget',
        mimeType: 'text/html'
      }
    ]
  };
});
```

**Apps SDK Requirement:**
> "Register resources as ui://widget/[name].html"
> "mimeType: 'text/html+skybridge'"

**Status:** ✅ Mostly Correct
**Recommendation:** Change MIME type to `text/html+skybridge` (not critical but more accurate)

**Updated:**
```typescript
uri: 'ui://widget/word-morph.html',
mimeType: 'text/html+skybridge'  // Add +skybridge
```

---

### 3. Tool Output Structure ✅ CORRECT

**What We're Doing:**
```typescript
return {
  content: [{
    type: 'text',
    text: JSON.stringify(gameState)
  }],
  _meta: {
    'openai/outputTemplate': 'ui://widget/word-morph.html'
  }
};
```

**Apps SDK Requirement:**
> "Tools can optionally reference embedded resources via _meta"
> "Use 'openai/outputTemplate' to specify widget URI"

**Status:** ✅ Compliant
**Evidence:** Pattern matches official examples

---

### 4. Widget HTML Structure ✅ CORRECT WITH ENHANCEMENTS NEEDED

**What We're Doing:**
```html
<div id="root"></div>
<script type="module" src="https://example.com/widget.js"></script>
```

**Apps SDK Requirement:**
> "Register HTML content with script that loads from CDN"
> "Use window.openai API to interact with host"

**Status:** ✅ Pattern Correct, but missing key features

**Missing Features:**

#### A. window.openai.toolOutput Access
**Current:** Assumed but not explicitly implemented
**Required:**
```javascript
// In widget JavaScript
const gameState = window.openai.toolOutput;
console.log('Game state:', gameState);
```

#### B. window.openai.setWidgetState() ❌ NOT IMPLEMENTED
**Critical Missing Feature:**
```javascript
// Should implement state persistence
function saveGameState(state) {
  window.openai.setWidgetState({
    currentGuess: state.currentGuess,
    guessesRemaining: state.guessesRemaining,
    gameOver: state.gameOver
  });
}
```

**Why This Matters:**
- State persists across conversation turns
- Agent can see widget state
- Better user experience (no lost progress)

#### C. window.openai.callTool() ❌ NOT IMPLEMENTED
**Missing for Cryptic Clues:**
```javascript
// Widget should call tools directly
async function requestClue() {
  const response = await window.openai.callTool('gamebox.get_word_morph_clue', {
    clue_type: 'cryptic'
  });
  // Handle response
}
```

**Current Plan:** Uses hooks, but should use window.openai API directly

---

### 5. Cryptic Clues Feature 🔧 NEEDS REVISION

**Current Plan:**
```typescript
// Planned: Use MCP tool to get clue
const response = await invokeTool('gamebox.get_word_morph_clue', {
  clue_type: 'cryptic'
});
```

**Apps SDK Best Practice:**
```typescript
// Recommended: Use window.openai API
async function requestClue() {
  const response = await window.openai.callTool(
    'gamebox.get_word_morph_clue',
    { clue_type: 'cryptic' }
  );

  // Update widget state
  window.openai.setWidgetState({
    cluesReceived: [...state.cluesReceived, response.result]
  });
}
```

**Why This is Better:**
1. Widget is self-contained
2. Doesn't require separate hook infrastructure
3. State persists properly
4. Agent can see clue history via widgetState

**Recommendation:** Update cryptic clues implementation to use window.openai API

---

### 6. Dark Mode Support ❌ CRITICAL GAP

**Current Implementation:**
```css
/* Only light mode colors */
:root {
  --word-morph-correct: #14B8A6;
  --word-morph-present: #F97316;
  --word-morph-absent: #64748B;
}
```

**Apps SDK Requirement:**
> "Apps must support both light and dark modes"
> "Use system-defined palettes for text, icons, dividers"

**Status:** ❌ NOT COMPLIANT - Will likely be rejected

**Required Implementation:**
```javascript
// Detect theme from window.openai
const theme = window.openai.theme; // 'light' or 'dark'

// Or use @openai/apps-sdk-ui
import { AppsSDKUIProvider } from '@openai/apps-sdk-ui';

function App() {
  return (
    <AppsSDKUIProvider>
      <WordMorph />
    </AppsSDKUIProvider>
  );
}
```

**CSS with Dark Mode:**
```css
/* Use @openai/apps-sdk-ui tokens */
@import '@openai/apps-sdk-ui/dist/index.css';

.word-morph-tile--correct {
  background-color: var(--token-success-500); /* Auto dark/light */
}

.word-morph-tile--present {
  background-color: var(--token-warning-500);
}

.word-morph-tile--absent {
  background-color: var(--token-gray-500);
}
```

---

### 7. Design System Integration 🔧 RECOMMENDED

**Current Implementation:**
Custom Tailwind setup with manual colors

**Apps SDK Recommendation:**
```bash
npm install @openai/apps-sdk-ui
```

**Benefits:**
- Pre-built accessible components
- Automatic dark mode support
- Consistent with ChatGPT design
- Faster development
- Better App Store approval chances

**Example Usage:**
```tsx
import { Button, Card } from '@openai/apps-sdk-ui';

function WordMorph() {
  return (
    <Card>
      <h2>Word Morph</h2>
      <GameGrid />
      <Button onClick={handleNewGame}>New Game</Button>
    </Card>
  );
}
```

---

### 8. Picture-in-Picture Mode 🔧 RECOMMENDED FOR GAMES

**Current Implementation:**
Inline mode only

**Apps SDK Guidance:**
> "Picture-in-Picture mode perfect for games that run alongside conversation"

**How to Implement:**
```javascript
// Request PiP mode
window.openai.requestDisplayMode({ mode: 'picture-in-picture' });

// Check if granted
const displayMode = window.openai.displayMode;
// 'inline', 'picture-in-picture', or 'fullscreen'
```

**Why This Matters for Word Morph:**
1. Game stays visible while chatting
2. Can get clues without losing game state
3. Better user experience for longer games
4. Natural fit for our use case

**Recommendation:** Add PiP support as enhancement

---

### 9. State Persistence Architecture ✅ CORRECT CONCEPT, NEEDS IMPLEMENTATION

**Current Approach:**
Server-side game state storage

**Apps SDK Best Practice:**
Hybrid approach:
1. **Server State:** Authoritative game logic (target word, valid guesses)
2. **Widget State:** UI state (current input, clue history, animations)

**Implementation Pattern:**
```typescript
// Server returns initial state
function startWordMorphTool() {
  return {
    structuredContent: {
      targetWord: 'SLATE',
      maxGuesses: 6,
      gameId: 'game-123'
    },
    content: [{ type: 'text', text: 'Game started!' }],
    _meta: {
      'openai/outputTemplate': 'ui://widget/word-morph.html'
    }
  };
}

// Widget maintains UI state
function WordMorphWidget() {
  const gameData = window.openai.toolOutput;
  const [widgetState, setWidgetState] = useWidgetState({
    currentGuess: '',
    cluesReceived: [],
    animationState: 'idle'
  });

  // Save state for persistence
  useEffect(() => {
    window.openai.setWidgetState(widgetState);
  }, [widgetState]);
}
```

**Status:** Architecture is sound, needs explicit implementation

---

## Compliance Checklist

### Critical Requirements (Must Fix for App Store)

- ❌ **Dark mode support** - Add theme detection and dark mode colors
- ❌ **window.openai.setWidgetState()** - Implement state persistence
- ⚠️ **Accessibility** - Ensure WCAG AA compliance (mostly done)
- ✅ **MCP tool structure** - Already correct
- ✅ **Resource URI pattern** - Already correct

### High Priority Recommendations

- 🔧 **Apps SDK UI integration** - Use `@openai/apps-sdk-ui` design system
- 🔧 **window.openai.callTool()** - Use for cryptic clues
- 🔧 **Picture-in-Picture mode** - Better UX for games
- 🔧 **MIME type update** - Use `text/html+skybridge`

### Medium Priority Enhancements

- 📋 **Submission guidelines review** - Ensure UX principles checklist passes
- 📋 **Performance optimization** - Test 60fps animations
- 📋 **Error handling UI** - Better visual feedback
- 📋 **Mobile touch targets** - Minimum 44x44px

---

## Updated Implementation Plan

### Immediate Actions (Before App Store Submission)

#### 1. Dark Mode Support (CRITICAL)
**Duration:** 2-3 hours

```bash
# Install Apps SDK UI
npm install @openai/apps-sdk-ui

# Update WordMorph.tsx
import { AppsSDKUIProvider } from '@openai/apps-sdk-ui';

function App() {
  return (
    <AppsSDKUIProvider>
      <WordMorph />
    </AppsSDKUIProvider>
  );
}
```

#### 2. Widget State Persistence (CRITICAL)
**Duration:** 2-3 hours

```typescript
// Add to WordMorph.tsx
function WordMorph() {
  const [widgetState, setWidgetState] = useWidgetState({
    currentGuess: '',
    guessHistory: [],
    cluesReceived: [],
    gameOver: false
  });

  // Persist state
  useEffect(() => {
    window.openai.setWidgetState(widgetState);
  }, [widgetState]);
}
```

#### 3. Update Cryptic Clues to Use window.openai (HIGH)
**Duration:** 1-2 hours

```typescript
// Update cryptic clue request
async function requestClue() {
  const response = await window.openai.callTool(
    'gamebox.get_word_morph_clue',
    { clue_type: 'cryptic' }
  );

  setWidgetState(prev => ({
    ...prev,
    cluesReceived: [...prev.cluesReceived, response.result]
  }));
}
```

### Enhanced Features (Post-Launch)

#### 4. Picture-in-Picture Mode
**Duration:** 2-3 hours

```typescript
// Add PiP button
function requestPiP() {
  window.openai.requestDisplayMode({ mode: 'picture-in-picture' });
}
```

#### 5. Apps SDK UI Components
**Duration:** 4-6 hours

Replace custom components with SDK components for:
- Buttons
- Cards
- Typography
- Spacing system

---

## Cryptic Clues Feature - Updated Design

### Current Plan Issues

**Problem:** Planned implementation uses separate hook infrastructure
**Issue:** Doesn't leverage window.openai API properly

### Recommended Approach

**Architecture:**
```
User clicks "Get Clue"
  ↓
Widget calls window.openai.callTool()
  ↓
MCP server returns {target_word, instructions}
  ↓
Agent generates cryptic clue
  ↓
Clue rendered in widget
  ↓
Widget state updated via setWidgetState()
```

**Implementation:**
```typescript
// In WordMorph widget
function CrypticClueButton() {
  const [loading, setLoading] = useState(false);
  const [widgetState, setWidgetState] = useWidgetState();

  async function handleGetClue() {
    setLoading(true);
    try {
      const response = await window.openai.callTool(
        'gamebox.get_word_morph_clue',
        { clue_type: 'cryptic', difficulty: 'medium' }
      );

      // Agent will respond with cryptic clue
      // Add to widget state
      setWidgetState({
        ...widgetState,
        clues: [
          ...(widgetState.clues || []),
          {
            text: response.result.clue,
            timestamp: Date.now()
          }
        ],
        cluesRemaining: widgetState.cluesRemaining - 1
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleGetClue}
      disabled={loading || widgetState.cluesRemaining === 0}
    >
      {loading ? 'Generating...' : `Get Clue (${widgetState.cluesRemaining} left)`}
    </Button>
  );
}
```

**MCP Tool Response:**
```json
{
  "structuredContent": {
    "target_word": "SLATE",
    "clue_instructions": "Create a cryptic clue..."
  },
  "content": [{
    "type": "text",
    "text": "I'll give you a cryptic clue:\n\n'Rock's smooth surface (5)'\n\nThink about what kind of rock has a smooth surface!"
  }]
}
```

**Key Improvements:**
1. Widget is self-contained
2. Uses proper window.openai API
3. State persists correctly
4. Agent response is more natural
5. Clue history visible to agent via widgetState

---

## Rebranding Epic #17 - Compliance Check

### Current Plan: ✅ Generally Good

**Positive:**
- Tool ID changes are correct
- Widget URI updates follow best practices
- Visual differentiation is smart for legal reasons

**Additions Needed:**

1. **Add Dark Mode to Visual Design Spec**
   - Current: Only defines light mode colors
   - Need: Dark mode color palette
   - Leverage: Apps SDK UI design tokens

2. **Update Color Palette**
   ```css
   /* Instead of fixed hex values */
   --word-morph-correct: #14B8A6;

   /* Use Apps SDK tokens */
   --word-morph-correct: var(--token-success-500);
   /* Automatically adapts to light/dark */
   ```

3. **Add window.openai Implementation to Tasks**
   - Task #17.10 should include window.openai API
   - Task #17.9 should use Apps SDK UI

---

## Action Items

### Critical (Block App Store Submission)

1. ✅ **Verify Current MCP Implementation**
   - Review server/src/index.ts
   - Confirm tool registration format
   - Check resource URI pattern

2. ❌ **Implement Dark Mode**
   - Install @openai/apps-sdk-ui
   - Wrap app with AppsSDKUIProvider
   - Update color system to use design tokens
   - Test in both light/dark modes

3. ❌ **Add Widget State Persistence**
   - Implement window.openai.setWidgetState()
   - Create useWidgetState hook
   - Test state persistence across turns

4. ⚠️ **Update MIME Type**
   - Change to 'text/html+skybridge'
   - Verify no breaking changes

### High Priority

5. 🔧 **Update Cryptic Clues Implementation**
   - Use window.openai.callTool()
   - Simplify hook architecture
   - Leverage widget state

6. 🔧 **Integrate Apps SDK UI Design System**
   - Replace custom components
   - Use design tokens
   - Ensure consistency with ChatGPT

7. 🔧 **Add Picture-in-Picture Support**
   - Implement requestDisplayMode
   - Test PiP experience
   - Add UI toggle

### Medium Priority

8. 📋 **Update Epic #17 Tasks**
   - Add dark mode to Task #17.9
   - Add window.openai to Task #17.10
   - Add Apps SDK UI integration

9. 📋 **Review Design Requirements Document**
   - Add Apps SDK UI references
   - Update color system approach
   - Add window.openai API section

10. 📋 **Test Accessibility**
    - Run axe DevTools audit
    - Test screen readers
    - Verify keyboard navigation

---

## Conclusion

### Overall Status: ✅ Solid Foundation with Key Gaps

**What's Working:**
- ✅ MCP architecture is correct
- ✅ Tool and resource patterns follow spec
- ✅ Game logic is sound
- ✅ Testing approach is thorough

**What Needs Work:**
- ❌ Dark mode is CRITICAL and missing
- ❌ window.openai integration incomplete
- 🔧 Apps SDK UI would dramatically improve quality
- 🔧 Cryptic clues needs architecture revision

**Timeline to Compliance:**
- Critical fixes: 4-6 hours
- High priority: 6-8 hours
- Total: 10-14 hours to full compliance

**Recommendation:**
1. Fix critical items immediately (dark mode, widget state)
2. Update cryptic clues architecture
3. Integrate Apps SDK UI for polish
4. Submit to App Store with confidence

The foundation is strong - we're mainly missing integration with OpenAI's official design system and APIs. These are straightforward additions that will dramatically improve app quality and approval chances.

---

**Document Status:** ✅ Analysis Complete
**Next Action:** Implement critical fixes
**Priority:** HIGH - Required for App Store submission
**Estimated Effort:** 10-14 hours to full compliance
