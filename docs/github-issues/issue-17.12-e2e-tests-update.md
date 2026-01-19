# Issue #17.12: Update E2E Tests

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 4 - Testing & Documentation
**Duration:** 2 hours
**Priority:** Critical
**Dependencies:** #17.10

## Description

Update all end-to-end Playwright tests to use the new Word Morph game name, tool IDs, UI selectors, and expected text strings. Prepare for screenshot baseline updates.

## Objectives

- Rename E2E test files
- Update test descriptions
- Update UI selectors and data-testid
- Update tool invocation tests
- Update expected text assertions
- Prepare for screenshot baseline regeneration
- Ensure all tests pass

## Files to Rename

**Rename primary test file:**
```bash
/e2e/word-challenge.spec.ts → /e2e/word-morph.spec.ts
```

## Files to Update

### 1. `/e2e/word-morph.spec.ts` (formerly word-challenge.spec.ts)

**Update test suite description:**

```typescript
// OLD
import { test, expect } from '@playwright/test';

test.describe('Word Challenge Game', () => {
  // ...
});

// NEW
import { test, expect } from '@playwright/test';

test.describe('Word Morph Game', () => {
  // ...
});
```

**Update test descriptions:**

```typescript
// OLD
test('should start a new Word Challenge game', async ({ page }) => {
  // ...
});

test('should display Word Challenge title', async ({ page }) => {
  expect(await page.textContent('h1')).toBe('Word Challenge');
});

// NEW
test('should start a new Word Morph game', async ({ page }) => {
  // ...
});

test('should display Word Morph title', async ({ page }) => {
  expect(await page.textContent('h1')).toBe('Word Morph');
});
```

**Update selectors:**

```typescript
// OLD
await page.locator('[data-testid="word-challenge-grid"]').waitFor();
await page.locator('.word-challenge-tile').first().click();
const tiles = await page.locator('.word-challenge-row').all();

// NEW
await page.locator('[data-testid="word-morph-grid"]').waitFor();
await page.locator('.word-morph-tile').first().click();
const tiles = await page.locator('.word-morph-row').all();
```

**Update text content assertions:**

```typescript
// OLD
await expect(page.locator('text=Word Challenge')).toBeVisible();
await expect(page.locator('text=New Word Challenge')).toBeVisible();
await expect(page.locator('text=Word Challenge game won!')).toBeVisible();

// NEW
await expect(page.locator('text=Word Morph')).toBeVisible();
await expect(page.locator('text=New Word Morph Game')).toBeVisible();
await expect(page.locator('text=Word Morph game won!')).toBeVisible();
```

**Update tool invocation mocks (if applicable):**

```typescript
// OLD
await page.route('**/mcp-tool', (route) => {
  if (route.request().postDataJSON().name === 'gamebox.start_word_challenge') {
    // Mock response
  }
});

// NEW
await page.route('**/mcp-tool', (route) => {
  if (route.request().postDataJSON().name === 'gamebox.start_word_morph') {
    // Mock response
  }
});
```

### 2. `/e2e/widget-ui.spec.ts`

**Update widget UI tests:**

```typescript
// OLD
test.describe('Word Challenge Widget UI', () => {
  test('should render Word Challenge widget', async ({ page }) => {
    await page.goto('/widget/word-challenge');
    // ...
  });
});

// NEW
test.describe('Word Morph Widget UI', () => {
  test('should render Word Morph widget', async ({ page }) => {
    await page.goto('/widget/word-morph');
    // ...
  });
});
```

**Update selector tests:**

```typescript
// OLD
test('should have correct CSS classes', async ({ page }) => {
  const container = page.locator('.word-challenge-container');
  await expect(container).toBeVisible();

  const grid = page.locator('.word-challenge-grid');
  await expect(grid).toBeVisible();
});

// NEW
test('should have correct CSS classes', async ({ page }) => {
  const container = page.locator('.word-morph-container');
  await expect(container).toBeVisible();

  const grid = page.locator('.word-morph-grid');
  await expect(grid).toBeVisible();
});
```

**Update color tests (prepare for new colors):**

```typescript
// OLD
test('should use correct colors', async ({ page }) => {
  const correctTile = page.locator('.word-challenge-tile--correct').first();
  const bgColor = await correctTile.evaluate((el) =>
    window.getComputedStyle(el).backgroundColor
  );
  // Check for green color
  expect(bgColor).toBe('rgb(106, 170, 100)'); // Old green
});

// NEW (will be updated in #17.13 with actual values)
test('should use correct colors', async ({ page }) => {
  const correctTile = page.locator('.word-morph-tile--correct').first();
  const bgColor = await correctTile.evaluate((el) =>
    window.getComputedStyle(el).backgroundColor
  );
  // Check for teal color
  expect(bgColor).toBe('rgb(20, 184, 166)'); // New teal
});
```

### 3. `/e2e/widget-screenshots.spec.ts`

**Update screenshot test descriptions:**

```typescript
// OLD
test.describe('Word Challenge Screenshots', () => {
  test('widget initial state', async ({ page }) => {
    await page.goto('/widget/word-challenge');
    await expect(page).toHaveScreenshot('word-challenge-initial.png');
  });

  test('widget with guesses', async ({ page }) => {
    // Setup game state
    await expect(page).toHaveScreenshot('word-challenge-playing.png');
  });
});

// NEW
test.describe('Word Morph Screenshots', () => {
  test('widget initial state', async ({ page }) => {
    await page.goto('/widget/word-morph');
    await expect(page).toHaveScreenshot('word-morph-initial.png');
  });

  test('widget with guesses', async ({ page }) => {
    // Setup game state
    await expect(page).toHaveScreenshot('word-morph-playing.png');
  });
});
```

**Update screenshot filenames:**

```typescript
// All screenshot filenames need to change:
'word-challenge-*.png' → 'word-morph-*.png'

// Examples:
'word-challenge-initial.png' → 'word-morph-initial.png'
'word-challenge-playing.png' → 'word-morph-playing.png'
'word-challenge-won.png' → 'word-morph-won.png'
'word-challenge-lost.png' → 'word-morph-lost.png'
```

**Note:** Screenshot baselines will be regenerated in Task #17.13

### 4. Update Test Configuration

**Update playwright.config.ts if needed:**

```typescript
// If there are Word Challenge specific settings
export default defineConfig({
  // ...
  projects: [
    {
      name: 'word-morph',  // Updated project name
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### 5. Update Test Helpers

**Update helper functions if they exist:**

```typescript
// In e2e/helpers/game-helpers.ts or similar
// OLD
export async function startWordChallenge(page: Page, difficulty = 'medium') {
  await page.click('[data-testid="start-word-challenge"]');
  // ...
}

export async function getWordChallengeTiles(page: Page) {
  return page.locator('.word-challenge-tile').all();
}

// NEW
export async function startWordMorph(page: Page, difficulty = 'medium') {
  await page.click('[data-testid="start-word-morph"]');
  // ...
}

export async function getWordMorphTiles(page: Page) {
  return page.locator('.word-morph-tile').all();
}
```

## Testing Requirements

### Run Tests (Expect Some Failures)

```bash
npm run test:e2e
```

**Expected at this stage:**
- ✅ Tests with updated selectors pass
- ✅ Tests with updated text pass
- ⏭️ Screenshot tests will fail (baselines need regeneration in #17.13)

### Manual Test Verification

**Key tests to verify:**
- [ ] Game initialization
- [ ] Tile rendering
- [ ] Guess submission
- [ ] Win/loss conditions
- [ ] Keyboard navigation
- [ ] Accessibility

## Acceptance Criteria

- [ ] Test files renamed:
  - [ ] `word-challenge.spec.ts` → `word-morph.spec.ts`
- [ ] All test descriptions updated
- [ ] All UI selectors updated:
  - [ ] data-testid attributes
  - [ ] CSS class selectors
  - [ ] Text content selectors
- [ ] All tool invocation tests updated
- [ ] All expected text assertions updated
- [ ] Screenshot test filenames updated
- [ ] Helper functions updated (if applicable)
- [ ] Non-screenshot tests pass
- [ ] No "Word Challenge" references in test files

## Search and Verify

```bash
cd e2e
grep -rn "word-challenge" .
grep -rn "Word Challenge" .
grep -rn "wordChallenge" .
```

**Expected:** Zero results except:
- Screenshot filenames (will be updated in #17.13)
- Comments explaining the change

## Implementation Checklist

**Pre-flight:**
- [ ] Review current test suite
- [ ] Identify all test files needing updates
- [ ] Create feature branch: `test/e2e-word-morph-update`

**Rename Phase:**
- [ ] Rename `word-challenge.spec.ts` → `word-morph.spec.ts`
- [ ] Update git tracking

**Update Phase:**
- [ ] Update test suite descriptions
- [ ] Update individual test descriptions
- [ ] Update all selectors
- [ ] Update text assertions
- [ ] Update tool invocation mocks
- [ ] Update screenshot test descriptions
- [ ] Update screenshot filenames (in code, not baselines)
- [ ] Update helper functions
- [ ] Update test configuration

**Verification Phase:**
- [ ] Run non-screenshot tests
- [ ] Verify selector updates work
- [ ] Verify text assertions work
- [ ] Search for remaining references
- [ ] Manual code review

**Documentation:**
- [ ] Update test README if it exists
- [ ] Document any test-specific changes
- [ ] Note screenshot baseline regeneration needed

## Known Issues

**Screenshot Tests Will Fail:**
Screenshot tests are expected to fail until baselines are regenerated in Task #17.13. This is normal and expected.

**Color Tests:**
Color value tests will need actual RGB values once the visual design is implemented (#17.9).

## Related Tasks

- **Depends on:** #17.10 (Frontend tool integration must be complete)
- **Blocks:** #17.13 (Screenshot baselines need updated tests)
- **Related:** #17.15 (Final verification includes E2E tests)

## Labels

- `phase-4-testing`
- `critical`
- `e2e-tests`
- `playwright`
- `epic-17`
