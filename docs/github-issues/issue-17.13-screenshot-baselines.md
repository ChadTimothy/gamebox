# Issue #17.13: Update Screenshot Baselines

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 4 - Testing & Documentation
**Duration:** 1 hour
**Priority:** High
**Dependencies:** #17.9, #17.12

## Description

Regenerate all Playwright screenshot test baselines to reflect the new Word Morph visual design (teal/coral/slate colors, new spacing, updated UI text). This ensures visual regression tests pass with the new branding.

## Objectives

- Regenerate screenshot baselines with new visual design
- Verify new screenshots show correct colors
- Update screenshot file names
- Ensure all visual regression tests pass
- Archive old screenshots for reference

## Prerequisites

**Must be completed first:**
- ✅ Visual design implemented (#17.9)
- ✅ E2E tests updated (#17.12)
- ✅ Widget displays "Word Morph" (not "Word Challenge")
- ✅ Colors are teal/coral/slate (not green/yellow/gray)

## Baseline Screenshots to Regenerate

### Current Screenshots (to be replaced)

Located in `/testing/screenshots/`:
- `widget-initial-state.png`
- `widget-mobile.png`
- `widget-tiles-closeup.png`
- `widget-with-letters.png`
- `theme-light-mode.png`
- And any others referenced in E2E tests

### New Screenshot Names

After regeneration, screenshots should reflect new branding:
- Filenames stay the same (content changes)
- Or renamed if they explicitly referenced "word-challenge"

## Regeneration Process

### 1. Verify Visual Design

**Before regenerating, manually verify:**

```bash
cd web
npm run dev
```

**Open browser and check:**
- [ ] Title shows "Word Morph" (not "Word Challenge")
- [ ] Correct tile colors show teal #14B8A6
- [ ] Present tile colors show coral #F97316
- [ ] Absent tile colors show slate #64748B
- [ ] Border radius is 8px (rounded corners)
- [ ] Spacing is 12px between tiles
- [ ] Animations are smooth
- [ ] No visual artifacts or broken layouts

### 2. Archive Old Screenshots

**Create backup for reference:**

```bash
mkdir -p testing/screenshots/archive/word-challenge-old
cp testing/screenshots/*.png testing/screenshots/archive/word-challenge-old/
```

**Document archive:**
```bash
echo "Screenshots from Word Challenge (before Word Morph rebranding)" > testing/screenshots/archive/word-challenge-old/README.md
echo "Archived on: $(date)" >> testing/screenshots/archive/word-challenge-old/README.md
```

### 3. Regenerate All Screenshots

**Run Playwright with update flag:**

```bash
cd web  # or root directory depending on setup
npm run test:e2e -- --update-snapshots
```

**Or more specific:**
```bash
npx playwright test --update-snapshots
npx playwright test widget-screenshots.spec.ts --update-snapshots
```

**For specific browsers:**
```bash
npx playwright test --update-snapshots --project=chromium
npx playwright test --update-snapshots --project=webkit
npx playwright test --update-snapshots --project=firefox
```

### 4. Verify New Screenshots

**Manual review of generated screenshots:**

```bash
# View screenshots in testing/screenshots/
open testing/screenshots/
```

**Visual checklist for each screenshot:**
- [ ] Shows "Word Morph" branding
- [ ] Correct colors (teal/coral/slate)
- [ ] No "Word Challenge" text visible
- [ ] Layout looks correct
- [ ] No visual artifacts
- [ ] Sharp and clear (not blurry)
- [ ] Correct viewport size

### 5. Test with New Baselines

**Run tests again to ensure they pass:**

```bash
npm run test:e2e
```

**Expected results:**
- ✅ All screenshot tests pass
- ✅ No pixel differences detected
- ✅ Tests complete without failures

## Screenshot Verification

### Specific Screenshots to Verify

#### `widget-initial-state.png`
**Should show:**
- "Word Morph" title
- Empty grid with default tile colors
- Clean initial state
- New color scheme visible in borders/background

#### `widget-with-letters.png`
**Should show:**
- Word Morph game in progress
- Tiles with letters
- Color-coded feedback:
  - Teal tiles (correct positions)
  - Coral tiles (present but wrong position)
  - Slate tiles (not in word)

#### `widget-tiles-closeup.png`
**Should show:**
- Close-up of tiles
- Clear color differentiation
- 8px border radius visible
- 12px spacing visible

#### `widget-mobile.png`
**Should show:**
- Mobile viewport (typically 375px or 414px wide)
- Word Morph responsive layout
- Smaller tile sizes (56px)
- Correct spacing for mobile

#### `theme-light-mode.png` / `theme-dark-mode.png`
**Should show:**
- Light mode colors properly applied
- Dark mode colors (if applicable)
- Proper contrast in both modes

## Color Verification

**Expected RGB values in screenshots:**

```
Teal (#14B8A6)   = rgb(20, 184, 166)
Coral (#F97316)  = rgb(249, 115, 22)
Slate (#64748B)  = rgb(100, 116, 139)
```

**Should NOT see these old Wordle colors:**
```
Green (#6AAA64)  = rgb(106, 170, 100)  ❌
Yellow (#C9B458) = rgb(201, 180, 88)   ❌
Gray (#787C7E)   = rgb(120, 124, 126)  ❌
```

## Troubleshooting

### Screenshots look identical to old ones

**Problem:** Visual design changes not applied yet
**Solution:** Complete #17.9 first, verify changes in browser

### Colors don't match specification

**Problem:** CSS not loaded or custom properties not set
**Solution:** Check globals.css, verify CSS custom properties

### Screenshots have rendering artifacts

**Problem:** Timing issues, animations mid-frame
**Solution:** Add wait conditions before screenshot:
```typescript
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500); // Wait for animations
```

### Different screenshots on different machines

**Problem:** Font rendering, OS differences
**Solution:** Use Docker or consistent CI environment, or accept minor pixel differences

### Tests still failing after regeneration

**Problem:** Flaky tests, timing issues
**Solution:**
- Add explicit waits
- Increase timeout
- Check for dynamic content
- Disable animations for screenshots

## Acceptance Criteria

- [ ] Old screenshots archived with date/context
- [ ] All screenshot baselines regenerated
- [ ] New screenshots show "Word Morph" branding
- [ ] New screenshots show teal/coral/slate colors
- [ ] New screenshots show 8px border radius
- [ ] New screenshots show 12px spacing
- [ ] No "Word Challenge" visible in any screenshot
- [ ] All screenshot tests pass
- [ ] Visual verification complete
- [ ] Screenshots committed to repository

## Implementation Checklist

**Pre-flight:**
- [ ] Verify visual design is implemented (#17.9)
- [ ] Verify E2E tests updated (#17.12)
- [ ] Manual browser verification of new design
- [ ] Create feature branch: `test/screenshot-baselines-update`

**Archive:**
- [ ] Create archive directory
- [ ] Copy old screenshots
- [ ] Document archive with README

**Regenerate:**
- [ ] Run Playwright with --update-snapshots
- [ ] Generate for all browsers/viewports
- [ ] Wait for completion

**Verify:**
- [ ] Manual review of each screenshot
- [ ] Check colors with eyedropper tool (optional)
- [ ] Verify branding/text
- [ ] Check layout and spacing
- [ ] Run tests with new baselines
- [ ] Ensure all tests pass

**Commit:**
- [ ] Stage new screenshots
- [ ] Commit with clear message
- [ ] Push to remote branch

## Git Commit Message

**Example:**
```
test: regenerate screenshot baselines for Word Morph rebranding

- Archive old Word Challenge screenshots
- Regenerate all baselines with new teal/coral/slate design
- Update screenshots to show "Word Morph" branding
- Verify 8px border radius and 12px spacing
- All visual regression tests now pass

Related: #17 (Epic), #17.9 (Visual Design), #17.12 (E2E Tests)
```

## Documentation Updates

**Update test documentation:**

```markdown
# Screenshot Tests

## Current Baselines

Screenshots were last updated on [DATE] for the Word Morph rebranding (Epic #17).

**Visual Design:**
- Colors: Teal (#14B8A6), Coral (#F97316), Slate (#64748B)
- Layout: 8px border radius, 12px tile spacing
- Branding: "Word Morph" (legally distinct from Wordle)

## Updating Baselines

To regenerate screenshots after design changes:

\`\`\`bash
npm run test:e2e -- --update-snapshots
\`\`\`

Always archive old screenshots before regenerating.
```

## Related Tasks

- **Depends on:** #17.9 (Visual design must be implemented)
- **Depends on:** #17.12 (E2E tests must be updated)
- **Blocks:** #17.15 (Final verification needs passing tests)

## Labels

- `phase-4-testing`
- `visual-regression`
- `high-priority`
- `playwright`
- `epic-17`
