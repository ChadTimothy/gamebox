# GameBox Rebranding Codebase Audit

**Epic:** #17 - Legal Safety Game Rebranding
**Audit Date:** 2026-01-19
**Auditor:** Automated grep analysis
**Dependency:** Issue #17.1 (REBRANDING_SPEC.md)

## Executive Summary

### Total Impact

| Metric | Count |
|--------|-------|
| **Total References** | 850 |
| **Total Files Affected** | ~82 |
| **Critical Files** | 15 |
| **High Impact Files** | 23 |
| **Medium Impact Files** | 28 |
| **Low Impact Files** | 16 |

### Breakdown by Game

| Game | Old Name | References | Impact Level | Status |
|------|----------|------------|--------------|--------|
| 1 | Word Challenge | 668 | 🔴 Critical | Fully implemented |
| 2 | Connections | 48 | 🟡 Medium | Menu only |
| 3 | Spelling Bee | 59 | 🟡 Medium | Menu only |
| 4 | 20 Questions | 43 | 🟢 Low | Menu only |
| 5 | Trivia Challenge | 32 | 🟢 Low | Menu only |

### Breakdown by File Type

| File Type | Files Affected | Complexity |
|-----------|----------------|------------|
| **Backend Code (.ts)** | 15 | 🔴 High |
| **Frontend Code (.tsx)** | 5 | 🔴 High |
| **E2E Tests (.spec.ts)** | 4 | 🔴 Critical |
| **Documentation (.md)** | 48 | 🟡 Medium |
| **Configuration (.json, .config)** | 3 | 🟢 Low |
| **CSS Styles** | 2 | 🟢 Low |
| **Other** | 5 | 🟢 Low |

### Estimated Effort

| Task Category | Files | Est. Hours |
|---------------|-------|------------|
| **Backend Refactoring** | 15 | 8-10 |
| **Frontend Refactoring** | 5 | 6-8 |
| **E2E Test Updates** | 4 | 4-6 |
| **Documentation Updates** | 48 | 6-8 |
| **Configuration Updates** | 3 | 1-2 |
| **Total** | 75 | **25-34 hours** |

## 1. Word Challenge → Word Morph

**Total References:** 668
**Files Affected:** ~45
**Impact:** 🔴 CRITICAL (fully implemented game)

### 1.1 Backend Files (Critical Path)

#### Core Game Logic

**`/server/src/games/wordChallenge.ts`** - 🔴 CRITICAL
- **Line Count:** 250 lines
- **References:** 5 direct name references
- **Impact:** Entire file needs renaming to `wordMorph.ts`
- **Changes Required:**
  - File rename: `wordChallenge.ts` → `wordMorph.ts`
  - Class name: `WordChallengeGame` → `WordMorphGame`
  - All JSDoc comments
  - All internal function names
- **Risk:** HIGH - Core game logic, must maintain functionality
- **Dependencies:** Used by index.ts, tested by wordChallenge.test.ts

**`/server/src/games/wordChallenge.test.ts`** - 🔴 CRITICAL
- **References:** 23 occurrences
- **Impact:** File rename + all test descriptions
- **Changes Required:**
  - File rename: `wordChallenge.test.ts` → `wordMorph.test.ts`
  - Import statements
  - Test suite names
  - Test descriptions
- **Risk:** HIGH - Must verify all tests still pass

**`/server/src/index.ts`** - 🔴 CRITICAL (Most Important File)
- **Line Count:** 619 lines
- **References:** 31 occurrences
- **Impact:** HIGHEST - MCP tool registrations, widget resources
- **Changes Required:**
  - Tool ID: `gamebox.start_word_challenge` → `gamebox.start_word_morph`
  - Tool ID: `gamebox.check_word_guess` → `gamebox.check_word_morph_guess`
  - Tool titles and descriptions
  - Resource URI: `ui://widget/word-challenge.html` → `ui://widget/word-morph.html`
  - Import statements
  - Game menu array (all 5 games)
  - Widget HTML generation
  - All UI strings
- **Risk:** CRITICAL - Breaking change for tool IDs, affects all integrations
- **Dependencies:** Imports from wordChallenge.ts, affects all clients

**`/server/src/index.test.ts`** - 🔴 HIGH
- **References:** 14 occurrences
- **Impact:** Test descriptions and assertions
- **Changes Required:**
  - Update all tool invocation tests
  - Update expected output strings
  - Update test descriptions
- **Risk:** MEDIUM - Tests must validate new names

#### Supporting Files

**`/server/src/data/wordLists.ts`** - 🟢 LOW
- **References:** 1 occurrence (comment)
- **Impact:** Comment update only
- **Changes Required:** Update JSDoc comment

**`/server/src/data/streaks.ts`** - 🟢 LOW
- **References:** 1 occurrence (comment)
- **Impact:** Comment update only
- **Changes Required:** Update JSDoc comment

**`/server/src/config/csp.ts`** - 🟡 MEDIUM
- **References:** 4 occurrences
- **Impact:** CSP configuration for widget
- **Changes Required:**
  - Widget URL references
  - Resource identifiers
  - Comments
- **Risk:** LOW - Configuration only

### 1.2 Frontend Files (Critical Path)

**`/web/src/widgets/WordChallenge.tsx`** - 🔴 CRITICAL
- **Line Count:** 618 lines
- **References:** 9 direct references
- **Impact:** HIGHEST - Primary UI component
- **Changes Required:**
  - File rename: `WordChallenge.tsx` → `WordMorph.tsx`
  - Component name: `WordChallenge` → `WordMorph`
  - All UI strings: "Word Challenge" → "Word Morph"
  - CSS classes: `.word-challenge-*` → `.word-morph-*`
  - Share text generation
  - Title and headings
  - aria-labels for accessibility
- **Risk:** CRITICAL - Primary user-facing component
- **Dependencies:** Used by main.tsx, tested by WordChallenge.test.tsx

**`/web/src/widgets/WordChallenge.test.tsx`** - 🔴 HIGH
- **References:** 12 occurrences
- **Impact:** File rename + all test assertions
- **Changes Required:**
  - File rename: `WordChallenge.test.tsx` → `WordMorph.test.tsx`
  - Import statements
  - Test suite names
  - Text assertions (expect "Word Morph" in document)
  - Component render calls
- **Risk:** HIGH - Must verify all UI tests pass

**`/web/src/main.tsx`** - 🔴 HIGH
- **References:** 3 occurrences
- **Impact:** Entry point imports and comments
- **Changes Required:**
  - Import: `./widgets/WordChallenge` → `./widgets/WordMorph`
  - Component name in render
  - Comments
- **Risk:** MEDIUM - Entry point for widget

**`/web/src/styles/globals.css`** - 🟡 MEDIUM
- **Impact:** CSS class names
- **Changes Required:**
  - `.word-challenge-*` → `.word-morph-*`
  - Any game-specific style rules
- **Risk:** LOW - Visual only, no functionality impact

**`/web/src/hooks/useToolOutput.ts`** - 🟢 LOW
- **References:** 1 occurrence (comment or string)
- **Impact:** Hook documentation or example
- **Changes Required:** Update comments/examples
- **Risk:** LOW

### 1.3 E2E Test Files (Critical for Quality)

**`/e2e/word-challenge.spec.ts`** - 🔴 CRITICAL
- **Line Count:** 353 lines
- **References:** 17 occurrences
- **Impact:** HIGHEST - Comprehensive E2E tests
- **Changes Required:**
  - File rename: `word-challenge.spec.ts` → `word-morph.spec.ts`
  - Test suite descriptions
  - UI selectors: `[data-testid="word-challenge-*"]` → `[data-testid="word-morph-*"]`
  - Text assertions
  - Tool invocation calls
  - Expected output validation
- **Risk:** CRITICAL - Must maintain test coverage
- **Dependencies:** Tests against live widget

**`/e2e/widget-ui.spec.ts`** - 🔴 HIGH
- **References:** 6 occurrences
- **Impact:** Widget UI integration tests
- **Changes Required:**
  - Test descriptions
  - Selectors
  - Expected text
- **Risk:** HIGH - Integration testing

**`/e2e/widget-screenshots.spec.ts`** - 🟡 MEDIUM
- **References:** 2 occurrences
- **Impact:** Screenshot baseline tests
- **Changes Required:**
  - Test descriptions
  - Screenshot file names
  - Baseline regeneration (separate task #17.13)
- **Risk:** MEDIUM - Visual regression testing

**`/playwright.config.ts`** - 🟢 LOW
- **References:** 1 occurrence (possibly in comments)
- **Impact:** Minimal configuration reference
- **Changes Required:** Update if referenced
- **Risk:** LOW

### 1.4 Documentation Files (High Visibility)

#### Critical Documentation

**`/README.md`** - 🔴 HIGH VISIBILITY
- **References:** 3 occurrences
- **Impact:** Project introduction, game listings
- **Changes Required:**
  - Game name in features list
  - All 5 game names in available games section
  - Example usage
  - Screenshots/demos if present
- **Risk:** HIGH - First impression for users

**`/CONTRIBUTING.md`** - 🔴 HIGH VISIBILITY
- **References:** 2 occurrences
- **Impact:** Development guidelines, Epic #17 documentation
- **Changes Required:**
  - Epic #17 description
  - Example code snippets
  - Development workflow examples
- **Risk:** HIGH - Developer documentation

**`/server/README.md`** - 🟡 MEDIUM
- **References:** 3 occurrences
- **Impact:** Backend API documentation
- **Changes Required:**
  - Tool listings
  - API examples
  - Usage instructions
- **Risk:** MEDIUM - Technical documentation

**`/web/README.md`** - 🟢 LOW
- **References:** 1 occurrence
- **Impact:** Frontend component documentation
- **Changes Required:** Widget examples
- **Risk:** LOW

#### Technical Documentation (Medium Priority)

**`/docs/TESTING_GUIDE.md`** - 🔴 HIGH (118 references!)
- **References:** 118 occurrences (most affected doc file)
- **Impact:** HIGHEST doc file - Testing procedures and examples
- **Changes Required:**
  - All test examples
  - File paths
  - Test descriptions
  - Expected outputs
  - Screenshots references
- **Risk:** MEDIUM - Important for QA

**`/docs/TECHNICAL_REVIEW.md`** - 🟡 MEDIUM
- **References:** 7 occurrences
- **Impact:** Technical architecture decisions
- **Changes Required:**
  - Game name references
  - Architecture diagrams
  - Code examples
- **Risk:** LOW

**`/docs/DESIGN_REQUIREMENTS.md`** - 🟡 MEDIUM
- **References:** 5 occurrences
- **Impact:** Design specifications
- **Changes Required:**
  - Feature descriptions
  - UI requirements
  - Visual design specs
- **Risk:** LOW

**`/docs/TECHNICAL_SPIKE_SUMMARY.md`** - 🟢 LOW
- **References:** 6 occurrences
- **Impact:** Research documentation
- **Changes Required:** Historical context
- **Risk:** LOW - Historical only

**`/docs/ANIMATION_STORYBOARD.md`** - 🟢 LOW
- **References:** 2 occurrences
- **Impact:** Animation specifications
- **Changes Required:** Animation descriptions
- **Risk:** LOW

**`/docs/ANIMATION_COMPARISON.md`** - 🟢 LOW
- **References:** 2 occurrences
- **Impact:** Animation analysis
- **Changes Required:** Comparison tables
- **Risk:** LOW

**`/docs/CSP_CONFIGURATION.md`** - 🟢 LOW
- **References:** 10 occurrences
- **Impact:** Security configuration docs
- **Changes Required:** CSP policy examples
- **Risk:** LOW

**`/docs/CURRENT_CODE_GAP_ANALYSIS.md`** - 🟡 MEDIUM
- **References:** 11 occurrences
- **Impact:** Recent analysis document
- **Changes Required:** Code analysis references
- **Risk:** LOW - May become obsolete after rebranding

#### Epic #17 Issue Documentation

**`/docs/github-issues/issue-17.*.md`** - 🟡 MEDIUM
- Multiple files affected (10+ files)
- **Impact:** Epic #17 task documentation
- **Changes Required:** Example code in each issue
- **Risk:** LOW - Internal documentation

**Notable issue files:**
- `issue-17.4-backend-module-rename.md` (22 refs) - Task-specific
- `issue-17.8-frontend-widget-rename.md` (57 refs) - Task-specific
- `issue-17.5-mcp-tools-update.md` (20 refs) - Task-specific
- `issue-17.12-e2e-tests-update.md` (38 refs) - Task-specific
- `issue-17.15-final-verification.md` (19 refs) - Verification
- `issue-17.16-migration-guide.md` (16 refs) - Migration
- `issue-17.2-codebase-audit.md` (14 refs) - This audit
- `epic-17-main.md` (5 refs) - Epic overview
- `EPIC-17-SUMMARY.md` (2 refs) - Summary

#### Testing Documentation

**`/testing/` directory** - 🟢 LOW
- Multiple test report files (10+ files)
- **Impact:** Historical test reports
- **Changes Required:** Report text updates
- **Risk:** LOW - Archive/historical

**Notable testing files:**
- `TESTING_GUIDE.md` (118 refs) - Already counted above
- `test-report-2026-01-19.md` (17 refs)
- `word-challenge-SUCCESS-report.md` (17 refs)
- `FINAL-TESTING-SUMMARY.md` (17 refs)
- `PLAYWRIGHT-TEST-RESULTS.md` (15 refs)
- `word-challenge-test-report.md` (14 refs)
- `COMPLETE-TESTING-REPORT.md` (14 refs)
- `UI-TESTING-PROGRESS-REPORT.md` (6 refs)

#### Other Documentation

**`/DEPLOYMENT.md`** - 🟡 MEDIUM
- **References:** 9 occurrences
- **Impact:** Deployment procedures
- **Changes Required:** Deployment examples
- **Risk:** MEDIUM - Operational documentation

**`/WIP-UI-TESTING.md`** - 🟢 LOW
- **References:** 1 occurrence
- **Impact:** Work-in-progress notes
- **Changes Required:** Historical notes
- **Risk:** LOW - May be deleted

## 2. Connections → Kinship

**Total References:** 48
**Files Affected:** ~11
**Impact:** 🟡 MEDIUM (menu only, not implemented)

### Key Files

**`/server/src/index.ts`** - 🟡 MEDIUM
- **References:** 1 occurrence
- **Location:** Game menu array
- **Changes Required:**
  ```typescript
  // OLD
  { id: "connections", name: "Connections" }

  // NEW
  { id: "kinship", name: "Kinship" }
  ```
- **Risk:** LOW - Simple menu update

**Documentation Files:**
- `/README.md` (4 refs) - Game listings
- `/CONTRIBUTING.md` (2 refs) - Examples
- `/docs/TESTING_GUIDE.md` (12 refs) - Future testing examples
- `/docs/REBRANDING_SPEC.md` (8 refs) - Already updated
- `/docs/github-issues/issue-17.*.md` - Issue documentation

### Impact Assessment

Since Connections is NOT yet implemented:
- ✅ NO backend game logic to rename
- ✅ NO frontend widget to refactor
- ✅ NO E2E tests to update
- ✅ Simple menu entry update
- 🟡 Documentation updates only

## 3. Spelling Bee → Lexicon Smith

**Total References:** 59
**Files Affected:** ~11
**Impact:** 🟡 MEDIUM (menu only, not implemented)

### Key Files

**`/server/src/index.ts`** - 🟡 MEDIUM
- **References:** 1 occurrence
- **Location:** Game menu array
- **Changes Required:**
  ```typescript
  // OLD
  { id: "spelling-bee", name: "Spelling Bee" }

  // NEW
  { id: "lexicon-smith", name: "Lexicon Smith" }
  ```
- **Risk:** LOW - Simple menu update

**Documentation Files:**
- `/README.md` (4 refs) - Game listings
- `/CONTRIBUTING.md` (2 refs) - Examples
- `/docs/TESTING_GUIDE.md` (10 refs) - Future testing examples
- `/docs/REBRANDING_SPEC.md` (7 refs) - Already updated
- `/docs/github-issues/issue-17.*.md` - Issue documentation

### Impact Assessment

Since Spelling Bee is NOT yet implemented:
- ✅ NO backend game logic to rename
- ✅ NO frontend widget to refactor
- ✅ NO E2E tests to update
- ✅ Simple menu entry update
- 🟡 Documentation updates only

## 4. 20 Questions → Twenty Queries

**Total References:** 43
**Files Affected:** ~10
**Impact:** 🟢 LOW (menu only, not implemented)

### Key Files

**`/server/src/index.ts`** - 🟡 MEDIUM
- **References:** 1 occurrence
- **Location:** Game menu array
- **Changes Required:**
  ```typescript
  // OLD
  { id: "twenty-questions", name: "20 Questions" }

  // NEW
  { id: "twenty-queries", name: "Twenty Queries" }
  ```
- **Risk:** LOW - Simple menu update

**Documentation Files:**
- `/README.md` (3 refs) - Game listings
- `/CONTRIBUTING.md` (2 refs) - Examples
- `/docs/TESTING_GUIDE.md` (7 refs) - Future testing examples
- `/docs/REBRANDING_SPEC.md` (7 refs) - Already updated
- `/docs/github-issues/issue-17.*.md` - Issue documentation

### Impact Assessment

Since 20 Questions is NOT yet implemented:
- ✅ NO backend game logic to rename
- ✅ NO frontend widget to refactor
- ✅ NO E2E tests to update
- ✅ Simple menu entry update
- 🟡 Documentation updates only

## 5. Trivia Challenge → Lore Master

**Total References:** 32
**Files Affected:** ~10
**Impact:** 🟢 LOW (menu only, not implemented)

### Key Files

**`/server/src/index.ts`** - 🟡 MEDIUM
- **References:** 1 occurrence
- **Location:** Game menu array
- **Changes Required:**
  ```typescript
  // OLD
  { id: "trivia-challenge", name: "Trivia Challenge" }

  // NEW
  { id: "lore-master", name: "Lore Master" }
  ```
- **Risk:** LOW - Simple menu update

**Documentation Files:**
- `/README.md` (3 refs) - Game listings
- `/CONTRIBUTING.md` (2 refs) - Examples
- `/docs/REBRANDING_SPEC.md` (7 refs) - Already updated
- `/docs/github-issues/issue-17.*.md` - Issue documentation

### Impact Assessment

Since Trivia Challenge is NOT yet implemented:
- ✅ NO backend game logic to rename
- ✅ NO frontend widget to refactor
- ✅ NO E2E tests to update
- ✅ Simple menu entry update
- 🟡 Documentation updates only

## 6. Implementation Priority Order

### Phase 1: Planning & Design (Complete First)
**Duration:** 3-4 hours
**Risk:** LOW

1. ✅ **#17.1: REBRANDING_SPEC.md** - Complete
2. 🟡 **#17.2: REBRANDING_AUDIT.md** - This document
3. **#17.3: VISUAL_DESIGN_SPEC.md** - Visual design details

### Phase 2: Backend Refactoring (Critical Path)
**Duration:** 8-10 hours
**Risk:** HIGH

4. **#17.4: Rename Backend Module** - `wordChallenge.ts` → `wordMorph.ts`
   - File: `/server/src/games/wordChallenge.ts` (250 lines)
   - File: `/server/src/games/wordChallenge.test.ts`
   - 🔴 CRITICAL - Core game logic

5. **#17.5: Update MCP Tools** - Tool registrations and IDs
   - File: `/server/src/index.ts` (619 lines, 31 references)
   - File: `/server/src/index.test.ts` (14 references)
   - 🔴 CRITICAL - Breaking change for tool IDs
   - ⚠️ Highest impact file

6. **#17.6: Backend Visual Design** - Configuration updates
   - File: `/server/src/config/csp.ts` (4 references)
   - 🟡 MEDIUM

7. **#17.7: Backend Documentation** - Server docs
   - File: `/server/README.md` (3 references)
   - 🟡 MEDIUM

### Phase 3: Frontend Refactoring (Critical Path)
**Duration:** 6-8 hours
**Risk:** HIGH

8. **#17.8: Rename Widget Component**
   - File: `/web/src/widgets/WordChallenge.tsx` (618 lines, 9 references)
   - File: `/web/src/widgets/WordChallenge.test.tsx` (12 references)
   - File: `/web/src/main.tsx` (3 references)
   - 🔴 CRITICAL - Primary UI component

9. **#17.9: Implement Visual Design**
   - Update colors, layout, animations
   - File: `/web/src/widgets/WordMorph.tsx` (after rename)
   - File: `/web/src/styles/globals.css`
   - 🔴 CRITICAL - Visual differentiation from Wordle

10. **#17.10: Frontend Tool Integration**
    - File: `/web/src/hooks/useToolOutput.ts` (1 reference)
    - Other hooks as needed
    - 🟡 MEDIUM

11. **#17.11: Frontend Documentation**
    - File: `/web/README.md` (1 reference)
    - 🟢 LOW

### Phase 4: Testing & Documentation (Quality Assurance)
**Duration:** 10-12 hours
**Risk:** MEDIUM

12. **#17.12: Update E2E Tests**
    - File: `/e2e/word-challenge.spec.ts` (353 lines, 17 refs) → `word-morph.spec.ts`
    - File: `/e2e/widget-ui.spec.ts` (6 refs)
    - File: `/e2e/widget-screenshots.spec.ts` (2 refs)
    - 🔴 CRITICAL - Test coverage

13. **#17.13: Regenerate Screenshot Baselines**
    - Update all visual regression test baselines
    - 🟡 MEDIUM - Visual QA

14. **#17.14: Update Project Documentation**
    - File: `/README.md` (3 refs) - HIGH VISIBILITY
    - File: `/CONTRIBUTING.md` (2 refs) - HIGH VISIBILITY
    - File: `/docs/TESTING_GUIDE.md` (118 refs!) - HIGHEST DOC FILE
    - File: `/docs/TECHNICAL_REVIEW.md` (7 refs)
    - File: `/docs/DESIGN_REQUIREMENTS.md` (5 refs)
    - File: `/docs/TECHNICAL_SPIKE_SUMMARY.md` (6 refs)
    - All other `/docs/*.md` files
    - All `/docs/github-issues/issue-17.*.md` files
    - All `/testing/*.md` files
    - 🟡 MEDIUM - Many files but low complexity

15. **#17.15: Verify Complete Rebranding**
    - Run all verification commands
    - Test builds, tests, runtime
    - 🔴 CRITICAL - Final QA

16. **#17.16: Create Migration Guide**
    - Document all breaking changes
    - Provide migration steps
    - 🟡 MEDIUM - User communication

## 7. Risk Assessment

### High Risk Areas

#### 1. Tool ID Breaking Changes
- **Risk:** 🔴 CRITICAL
- **Impact:** All existing ChatGPT integrations will break
- **Mitigation:**
  - Clear migration guide
  - Advance communication
  - Document all changes
  - Test golden prompts thoroughly

#### 2. Core Game Logic Rename
- **Risk:** 🔴 HIGH
- **Files:** `wordChallenge.ts` (250 lines)
- **Impact:** Game mechanics must remain unchanged
- **Mitigation:**
  - Comprehensive unit tests before/after
  - Manual gameplay testing
  - Verify no logic changes

#### 3. Primary UI Component
- **Risk:** 🔴 HIGH
- **Files:** `WordChallenge.tsx` (618 lines)
- **Impact:** User-facing interface
- **Mitigation:**
  - E2E tests before/after
  - Visual regression testing
  - Screenshot baseline updates
  - Manual UI testing

#### 4. E2E Test Suite
- **Risk:** 🔴 HIGH
- **Files:** `word-challenge.spec.ts` (353 lines, 17 refs)
- **Impact:** Test coverage must be maintained
- **Mitigation:**
  - Update selectors carefully
  - Run full test suite
  - Verify 100% pass rate

### Medium Risk Areas

#### 5. Documentation Updates
- **Risk:** 🟡 MEDIUM
- **Files:** 48 markdown files
- **Impact:** Outdated docs confuse users/developers
- **Mitigation:**
  - Systematic grep-based verification
  - Multiple review passes
  - Broken link checking

#### 6. Visual Design Changes
- **Risk:** 🟡 MEDIUM
- **Files:** CSS, component styles
- **Impact:** Must differentiate from Wordle
- **Mitigation:**
  - Follow VISUAL_DESIGN_SPEC.md
  - Color contrast validation
  - Accessibility testing

### Low Risk Areas

#### 7. Menu Updates (Games 2-5)
- **Risk:** 🟢 LOW
- **Impact:** Simple string changes
- **Mitigation:** Review menu display

#### 8. Configuration Files
- **Risk:** 🟢 LOW
- **Impact:** Minimal functional impact
- **Mitigation:** Verify builds still work

## 8. Search Commands Used

### Comprehensive Search Commands

**Word Challenge → Word Morph:**
```bash
grep -rn "Word Challenge\|word-challenge\|wordChallenge\|WordChallenge" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git

# Results: 668 references in ~45 files
```

**Connections → Kinship:**
```bash
grep -rn "Connections" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git | \
  grep -v "network connections\|database connections\|HTTP connections"

# Results: 48 references in ~11 files
```

**Spelling Bee → Lexicon Smith:**
```bash
grep -rn "Spelling Bee\|spelling-bee\|spellingBee\|SpellingBee" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git

# Results: 59 references in ~11 files
```

**20 Questions → Twenty Queries:**
```bash
grep -rn "20 Questions\|twenty-questions\|twentyQuestions" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git

# Results: 43 references in ~10 files
```

**Trivia Challenge → Lore Master:**
```bash
grep -rn "Trivia Challenge\|trivia-challenge\|triviaChallenge\|TriviaChallenge" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git

# Results: 32 references in ~10 files
```

### File-Specific Searches

**Get reference counts per file:**
```bash
grep -rn "Word Challenge\|word-challenge\|wordChallenge\|WordChallenge" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git | \
  cut -d: -f1 | sort | uniq -c | sort -rn
```

**Get line counts for critical files:**
```bash
wc -l server/src/index.ts \
      server/src/games/wordChallenge.ts \
      web/src/widgets/WordChallenge.tsx \
      e2e/word-challenge.spec.ts
```

## 9. Verification Strategy

### Pre-Implementation Verification

Before starting refactoring:
```bash
# 1. Run all tests (baseline)
npm test
npm run test:e2e

# 2. Verify builds work
cd server && npm run build
cd web && npm run build

# 3. Document current test pass rate
# 4. Take screenshot baselines backup
```

### Post-Implementation Verification

After each phase:
```bash
# 1. Verify zero old references in code
grep -r "Word Challenge" --include="*.ts" --include="*.tsx" server/ web/
# Should return 0 results

# 2. Verify builds succeed
npm run build:all

# 3. Verify tests pass
npm test                    # Unit tests
npm run test:e2e           # E2E tests
npm run type-check         # TypeScript

# 4. Manual verification
npm run dev                # Start server
# Open widget in browser
# Test gameplay
```

### Final Verification (Issue #17.15)

Comprehensive checklist:
- ✅ Zero old name references in code files
- ✅ All builds successful
- ✅ All tests passing (100%)
- ✅ Visual design matches spec
- ✅ Tool IDs working
- ✅ No console errors
- ✅ Documentation accurate
- ✅ Golden prompts tested
- ✅ App Store requirements met

## 10. Dependencies and Blockers

### File Dependencies

```
server/src/index.ts
  ↓ imports
server/src/games/wordChallenge.ts
  ↓ tested by
server/src/games/wordChallenge.test.ts

web/src/main.tsx
  ↓ imports
web/src/widgets/WordChallenge.tsx
  ↓ tested by
web/src/widgets/WordChallenge.test.tsx

e2e/*.spec.ts
  ↓ tests
Live widget (server + frontend)
```

### Critical Path

**Must be done in order:**
1. #17.1 REBRANDING_SPEC.md → #17.2 (this audit)
2. #17.4 Backend module → #17.5 MCP tools (imports from #17.4)
3. #17.5 MCP tools → #17.8 Frontend widget (tool IDs must match)
4. #17.8 Frontend widget → #17.12 E2E tests (selectors depend on #17.8)
5. All code changes → #17.15 Verification

### Parallel Work Possible

These can be done simultaneously:
- #17.3 Visual design spec (planning only)
- #17.6, #17.7 Backend docs (after #17.5)
- #17.10, #17.11 Frontend integration/docs (after #17.8)
- #17.14 Documentation updates (after all code complete)

## 11. Success Metrics

### Quantitative Metrics

- ✅ **668 Word Challenge references** → 0 in code
- ✅ **48 Connections references** → Updated to Kinship
- ✅ **59 Spelling Bee references** → Updated to Lexicon Smith
- ✅ **43 Twenty Questions references** → Updated to Twenty Queries
- ✅ **32 Trivia Challenge references** → Updated to Lore Master
- ✅ **100% test pass rate** maintained
- ✅ **0 TypeScript errors** after refactoring
- ✅ **0 console errors** in runtime

### Qualitative Metrics

- ✅ Visual design distinctive from Wordle
- ✅ All documentation accurate and up-to-date
- ✅ Migration guide complete and helpful
- ✅ Golden prompts tested and passing
- ✅ ChatGPT App Store requirements met
- ✅ Code maintainability preserved
- ✅ Test coverage maintained

## 12. Recommendations

### Implementation Approach

1. **Follow the critical path** - Don't skip ahead
2. **Test after each phase** - Catch issues early
3. **Commit frequently** - Small, atomic commits
4. **Use the specification** - Reference REBRANDING_SPEC.md
5. **Document as you go** - Update docs with code

### Time Management

- **Don't rush Phase 2** (Backend) - Critical foundation
- **Budget extra time for E2E tests** - Most fragile
- **Parallel work on docs** - Can be done anytime
- **Save verification for end** - Comprehensive final check

### Quality Assurance

- **Run tests frequently** - After each file change
- **Manual testing required** - Automated tests aren't everything
- **Visual review needed** - Verify design differentiation
- **Golden prompt testing** - REQUIRED before App Store

---

**Audit Complete:** 2026-01-19
**Next Step:** Issue #17.3 (Visual Design Specification)
**Status:** Ready for implementation
