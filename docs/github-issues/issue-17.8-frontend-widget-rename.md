# Issue #17.8: Rename Word Morph Widget

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 3 - Frontend Refactoring
**Duration:** 2 hours
**Priority:** Critical
**Dependencies:** #17.4

## Description

Rename the Word Challenge React widget component to Word Morph, including file renaming, component naming, UI strings, CSS classes, and accessibility attributes.

## Objectives

- Rename frontend widget files
- Update React component names
- Update all UI display strings
- Update CSS class names
- Update accessibility attributes (aria-labels)
- Update imports and dependencies
- Ensure all React tests pass

## Files to Rename

### Primary Widget Files

**Rename:**
```bash
/web/src/widgets/WordChallenge.tsx → /web/src/widgets/WordMorph.tsx
/web/src/widgets/WordChallenge.test.tsx → /web/src/widgets/WordMorph.test.tsx
```

## Code Changes Required

### 1. `/web/src/widgets/WordMorph.tsx` (formerly WordChallenge.tsx)

**Component Name:**
```typescript
// OLD
export function WordChallenge() {
  // ...
}

// NEW
export function WordMorph() {
  // ...
}
```

**Component Props (if any):**
```typescript
// OLD
interface WordChallengeProps {
  // ...
}

// NEW
interface WordMorphProps {
  // ...
}
```

**Display Strings:**
```typescript
// OLD
<h1>Word Challenge</h1>
<p>Guess the 5-letter word in 6 tries</p>

// NEW
<h1>Word Morph</h1>
<p>Transform letters to find the target word</p>
```

**CSS Classes:**
```typescript
// OLD
<div className="word-challenge-container">
  <div className="word-challenge-grid">
    <div className="word-challenge-tile">
      // ...
    </div>
  </div>
</div>

// NEW
<div className="word-morph-container">
  <div className="word-morph-grid">
    <div className="word-morph-tile">
      // ...
    </div>
  </div>
</div>
```

**All CSS class patterns to update:**
- `.word-challenge-*` → `.word-morph-*`
- Examples:
  - `word-challenge-container` → `word-morph-container`
  - `word-challenge-grid` → `word-morph-grid`
  - `word-challenge-tile` → `word-morph-tile`
  - `word-challenge-row` → `word-morph-row`
  - `word-challenge-keyboard` → `word-morph-keyboard`
  - `word-challenge-header` → `word-morph-header`
  - `word-challenge-message` → `word-morph-message`

**Accessibility Attributes:**
```typescript
// OLD
aria-label="Word Challenge game"
aria-label="Word Challenge grid"
aria-label="Word Challenge tile, letter A, correct position"

// NEW
aria-label="Word Morph game"
aria-label="Word Morph grid"
aria-label="Word Morph tile, letter A, correct position"
```

**Button and UI Text:**
```typescript
// OLD
<button>New Word Challenge</button>
<p>Word Challenge game won!</p>
<p>Word Challenge game over</p>

// NEW
<button>New Word Morph Game</button>
<p>Word Morph game won!</p>
<p>Word Morph game over</p>
```

**Data Attributes:**
```typescript
// OLD
data-testid="word-challenge-grid"
data-game="word-challenge"

// NEW
data-testid="word-morph-grid"
data-game="word-morph"
```

### 2. `/web/src/widgets/WordMorph.test.tsx` (formerly WordChallenge.test.tsx)

**Import Statement:**
```typescript
// OLD
import { WordChallenge } from './WordChallenge';

// NEW
import { WordMorph } from './WordMorph';
```

**Test Descriptions:**
```typescript
// OLD
describe('WordChallenge', () => {
  it('renders Word Challenge game', () => {
    // ...
  });

  it('handles Word Challenge guesses', () => {
    // ...
  });
});

// NEW
describe('WordMorph', () => {
  it('renders Word Morph game', () => {
    // ...
  });

  it('handles Word Morph guesses', () => {
    // ...
  });
});
```

**Component Rendering:**
```typescript
// OLD
render(<WordChallenge />);
expect(screen.getByText('Word Challenge')).toBeInTheDocument();

// NEW
render(<WordMorph />);
expect(screen.getByText('Word Morph')).toBeInTheDocument();
```

**Test Queries:**
```typescript
// OLD
screen.getByTestId('word-challenge-grid')
screen.getByLabelText('Word Challenge game')

// NEW
screen.getByTestId('word-morph-grid')
screen.getByLabelText('Word Morph game')
```

### 3. `/web/src/main.tsx` (Update Imports)

```typescript
// OLD
import { WordChallenge } from './widgets/WordChallenge';

// NEW
import { WordMorph } from './widgets/WordMorph';
```

**Component Usage:**
```typescript
// OLD
<WordChallenge />

// NEW
<WordMorph />
```

### 4. `/web/src/styles/globals.css` (Update CSS Classes)

**Find and replace all CSS class definitions:**

```css
/* OLD */
.word-challenge-container {
  /* ... */
}

.word-challenge-grid {
  /* ... */
}

.word-challenge-tile {
  /* ... */
}

.word-challenge-tile--correct {
  background-color: var(--color-correct);
}

/* NEW */
.word-morph-container {
  /* ... */
}

.word-morph-grid {
  /* ... */
}

.word-morph-tile {
  /* ... */
}

.word-morph-tile--correct {
  background-color: var(--color-correct);
}
```

**CSS Custom Properties (will be updated in #17.9):**
```css
/* Note: Color values stay the same for now, will change in #17.9 */
:root {
  --word-morph-correct: #14B8A6;  /* Will be updated */
  --word-morph-present: #F97316;  /* Will be updated */
  --word-morph-absent: #64748B;   /* Will be updated */
}
```

## Testing Requirements

### Unit Tests

```bash
cd web
npm test -- WordMorph.test.tsx
```

**Expected Results:**
- [ ] All component tests pass
- [ ] No import errors
- [ ] Component renders correctly
- [ ] Event handlers work
- [ ] Accessibility tests pass

### Visual Smoke Test

```bash
cd web
npm run dev
```

Open browser to verify:
- [ ] Component renders (no white screen)
- [ ] No console errors
- [ ] Text shows "Word Morph" (not "Word Challenge")
- [ ] CSS classes applied correctly
- [ ] No broken styles

### Type Checking

```bash
cd web
npm run type-check
```

**Expected Results:**
- [ ] No TypeScript errors
- [ ] All imports resolve
- [ ] Component props typed correctly

## Acceptance Criteria

- [ ] Files renamed successfully:
  - [ ] `WordChallenge.tsx` → `WordMorph.tsx`
  - [ ] `WordChallenge.test.tsx` → `WordMorph.test.tsx`
- [ ] Component renamed: `WordChallenge` → `WordMorph`
- [ ] All UI strings updated:
  - [ ] "Word Challenge" → "Word Morph"
  - [ ] Button labels
  - [ ] Messages
  - [ ] Headings
- [ ] All CSS classes updated:
  - [ ] `.word-challenge-*` → `.word-morph-*`
  - [ ] No old class names remain
- [ ] All accessibility attributes updated:
  - [ ] aria-labels
  - [ ] aria-descriptions
  - [ ] role attributes
- [ ] All data-testid attributes updated
- [ ] Imports updated in dependent files
- [ ] Unit tests pass (100%)
- [ ] Visual smoke test passes
- [ ] Type checking passes
- [ ] No console errors or warnings

## Search and Verify

Before marking complete:

```bash
cd web/src
grep -rn "WordChallenge" .
grep -rn "word-challenge" .
grep -rn "Word Challenge" .
```

**Expected:** Zero results except in:
- Git history
- Comments explaining the change

## Implementation Checklist

**Pre-flight:**
- [ ] Review #17.2 audit for complete file list
- [ ] Create feature branch: `refactor/frontend-word-morph-rename`
- [ ] Ensure backend rename (#17.4) is complete

**Rename Phase:**
- [ ] Rename `WordChallenge.tsx` → `WordMorph.tsx`
- [ ] Rename `WordChallenge.test.tsx` → `WordMorph.test.tsx`
- [ ] Update git tracking

**Code Update Phase:**
- [ ] Update component name in `WordMorph.tsx`
- [ ] Update component export
- [ ] Update UI display strings
- [ ] Update CSS class names
- [ ] Update accessibility attributes
- [ ] Update data-testid attributes
- [ ] Update test file imports
- [ ] Update test descriptions
- [ ] Update test queries
- [ ] Update `main.tsx` imports
- [ ] Update `globals.css` class definitions

**Verification Phase:**
- [ ] Run unit tests
- [ ] Run visual smoke test
- [ ] Run type checker
- [ ] Search for remaining references
- [ ] Manual code review

**Cleanup:**
- [ ] Remove debug code
- [ ] Commit changes with clear message
- [ ] Push to remote branch

## Search and Replace Patterns

**Use with caution - review each change:**

```bash
# In WordMorph.tsx and WordMorph.test.tsx
"WordChallenge" → "WordMorph"
"word-challenge" → "word-morph"
"Word Challenge" → "Word Morph"

# In globals.css
".word-challenge-" → ".word-morph-"
"word-challenge-" → "word-morph-"
```

## Common Pitfalls

⚠️ **Watch out for:**
- Partial matches (e.g., "challenge" in other contexts)
- Comments that should be updated
- String literals in tests
- CSS class names in JS template literals
- Accessibility descriptions

## Related Tasks

- **Depends on:** #17.4 (Backend module must be renamed first)
- **Blocks:** #17.9 (Visual design needs component renamed)
- **Blocks:** #17.10 (Tool integration needs component renamed)
- **Related:** #17.12 (E2E tests will need updates)

## Labels

- `phase-3-frontend`
- `refactoring`
- `critical`
- `epic-17`
- `react`
