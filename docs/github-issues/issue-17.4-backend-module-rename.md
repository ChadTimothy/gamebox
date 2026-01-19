# Issue #17.4: Rename Word Morph Backend Module

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 2 - Backend Refactoring
**Duration:** 1.5 hours
**Priority:** Critical
**Dependencies:** #17.2

## Description

Rename the Word Challenge backend module to Word Morph, including file renaming, class renaming, and updating all internal references.

## Objectives

- Rename backend module files
- Update class names and exports
- Update internal variables and functions
- Update JSDoc comments
- Update test files
- Ensure all unit tests pass

## Files to Rename

### Primary Module Files

**Rename:**
```bash
/server/src/games/wordChallenge.ts → /server/src/games/wordMorph.ts
/server/src/games/wordChallenge.test.ts → /server/src/games/wordMorph.test.ts
```

## Code Changes Required

### 1. `/server/src/games/wordMorph.ts` (formerly wordChallenge.ts)

**Class Name:**
```typescript
// OLD
export class WordChallengeGame {
  // ...
}

// NEW
export class WordMorphGame {
  // ...
}
```

**Internal Variables:**
- Update any variables referencing "challenge" → "morph"
- Update function names if they include "challenge"
- Update internal comments

**JSDoc Comments:**
```typescript
// OLD
/**
 * Word Challenge game implementation
 * Manages game state for word guessing puzzles similar to Wordle
 */

// NEW
/**
 * Word Morph game implementation
 * Manages game state for word transformation puzzles
 */
```

### 2. `/server/src/games/wordMorph.test.ts` (formerly wordChallenge.test.ts)

**Test Descriptions:**
```typescript
// OLD
describe('WordChallengeGame', () => {
  it('should initialize a new Word Challenge game', () => {
    // ...
  });
});

// NEW
describe('WordMorphGame', () => {
  it('should initialize a new Word Morph game', () => {
    // ...
  });
});
```

**Update all test strings:**
- "Word Challenge" → "Word Morph"
- "challenge" → "morph" (where appropriate)
- Error messages
- Success messages

## Files to Update (Imports)

### 3. `/server/src/data/wordLists.ts`

**Update imports if present:**
```typescript
// OLD
import { WordChallengeGame } from '../games/wordChallenge';

// NEW
import { WordMorphGame } from '../games/wordMorph';
```

### 4. `/server/src/data/streaks.ts`

**Update comments:**
```typescript
// OLD
// Manages streak data for Word Challenge game

// NEW
// Manages streak data for Word Morph game
```

## Testing Requirements

### Unit Tests

Run and verify all tests pass:
```bash
cd server
npm test -- wordMorph.test.ts
```

**Expected Results:**
- All tests pass
- No import errors
- No reference errors
- Test coverage maintained

### Type Checking

```bash
cd server
npm run type-check
```

**Expected Results:**
- No TypeScript errors
- All exports resolve correctly
- All imports resolve correctly

## Acceptance Criteria

- [ ] Files renamed successfully
  - [ ] `wordChallenge.ts` → `wordMorph.ts`
  - [ ] `wordChallenge.test.ts` → `wordMorph.test.ts`
- [ ] Class renamed: `WordChallengeGame` → `WordMorphGame`
- [ ] All internal references updated
- [ ] All JSDoc comments updated
- [ ] All test descriptions updated
- [ ] All imports in dependent files updated
- [ ] Unit tests pass (100%)
- [ ] Type checking passes
- [ ] No console errors or warnings

## Implementation Checklist

**Pre-flight:**
- [ ] Review #17.2 audit for complete file list
- [ ] Backup current files (via git branch)
- [ ] Create feature branch: `refactor/backend-word-morph-rename`

**Rename Phase:**
- [ ] Rename primary module file
- [ ] Rename test file
- [ ] Update git tracking

**Code Update Phase:**
- [ ] Update class name in module file
- [ ] Update exports
- [ ] Update internal variables/functions
- [ ] Update JSDoc comments
- [ ] Update test file class references
- [ ] Update test descriptions
- [ ] Update imports in `wordLists.ts`
- [ ] Update comments in `streaks.ts`

**Verification Phase:**
- [ ] Run unit tests
- [ ] Run type checker
- [ ] Search for remaining "wordChallenge" references
- [ ] Manual code review

**Cleanup:**
- [ ] Remove any debug code
- [ ] Commit changes with clear message
- [ ] Push to remote branch

## Search and Replace Patterns

Use these patterns carefully (review each change):

```bash
# Find remaining references
grep -rn "WordChallenge" server/src/games/
grep -rn "wordChallenge" server/src/games/
grep -rn "Word Challenge" server/src/games/

# In wordMorph.ts and wordMorph.test.ts
# Replace carefully with context awareness
"WordChallengeGame" → "WordMorphGame"
"wordChallenge" → "wordMorph"
"Word Challenge" → "Word Morph"
```

## Risk Mitigation

- Create feature branch before starting
- Make one change type at a time
- Run tests after each major change
- Keep changes focused (don't refactor other code)
- Document any unexpected issues

## Related Files

**Will be updated in later tasks:**
- `/server/src/index.ts` - Tool registrations (Task #17.5)
- `/server/README.md` - Documentation (Task #17.7)

## Labels

- `phase-2-backend`
- `refactoring`
- `critical`
- `epic-17`
- `breaking-change`
