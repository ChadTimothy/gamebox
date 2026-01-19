# Issue #17.15: Verify Complete Rebranding

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 4 - Testing & Documentation
**Duration:** 2 hours
**Priority:** Critical
**Dependencies:** #17.14

## Description

Perform comprehensive verification that the rebranding is complete, all old references are removed, all tests pass, builds succeed, and the application runs correctly with the new branding.

## Objectives

- Verify zero old game name references in code
- Verify all builds succeed
- Verify all tests pass
- Verify runtime functionality
- Verify visual appearance
- Verify documentation accuracy
- Create final verification report

## Verification Checklist

### Phase 1: Code Reference Verification

**Must return 0 results for old names in code files**

#### Backend Verification

```bash
cd server/src

# Word Challenge → Word Morph
grep -r "Word Challenge" --include="*.ts" --include="*.js"
grep -r "word-challenge" --include="*.ts" --include="*.js"
grep -r "wordChallenge" --include="*.ts" --include="*.js"
grep -r "WordChallenge" --include="*.ts" --include="*.js"

# Tool IDs
grep -r "gamebox.start_word_challenge" --include="*.ts"
grep -r "gamebox.check_word_guess" --include="*.ts"

# Connections → Kinship
grep -r "Connections" --include="*.ts" | grep -v "network connections" | grep -v "database connections"

# Spelling Bee → Lexicon Smith
grep -r "Spelling Bee" --include="*.ts"
grep -r "spelling-bee" --include="*.ts"
grep -r "spellingBee" --include="*.ts"

# 20 Questions → Twenty Queries
grep -r "20 Questions" --include="*.ts"
grep -r "twenty-questions" --include="*.ts"

# Trivia Challenge → Lore Master
grep -r "Trivia Challenge" --include="*.ts"
grep -r "trivia-challenge" --include="*.ts"
```

**Expected:** 0 results for all searches

#### Frontend Verification

```bash
cd web/src

# Same searches as backend
grep -r "Word Challenge" --include="*.tsx" --include="*.ts" --include="*.js"
grep -r "word-challenge" --include="*.tsx" --include="*.ts" --include="*.css"
grep -r "WordChallenge" --include="*.tsx" --include="*.ts"

# CSS classes
grep -r "word-challenge-" --include="*.css" --include="*.tsx"
```

**Expected:** 0 results for all searches

#### E2E Test Verification

```bash
cd e2e

# Test files
grep -r "word-challenge" --include="*.ts"
grep -r "Word Challenge" --include="*.ts"

# Selectors
grep -r "word-challenge-grid" --include="*.ts"
grep -r "word-challenge-tile" --include="*.ts"
```

**Expected:** 0 results (except in archived files or comments)

#### Configuration Files

```bash
# Root directory
grep -r "word-challenge" package.json tsconfig.json
grep -r "Word Challenge" package.json
```

**Expected:** 0 results

### Phase 2: Build Verification

**All builds must succeed without errors**

#### Server Build

```bash
cd server
npm run build
```

**Expected:**
- ✅ Build completes successfully
- ✅ No TypeScript errors
- ✅ No warnings about missing modules
- ✅ Output in `dist/` directory

#### Frontend Build

```bash
cd web
npm run build
```

**Expected:**
- ✅ Build completes successfully
- ✅ No TypeScript errors
- ✅ No build warnings
- ✅ Output in `dist/` directory

#### Type Checking

```bash
# Backend
cd server && npm run type-check

# Frontend
cd web && npm run type-check
```

**Expected:**
- ✅ No type errors in either project

### Phase 3: Test Verification

**All tests must pass with 100% success rate**

#### Unit Tests

```bash
# Backend unit tests
cd server
npm test

# Frontend unit tests
cd web
npm test
```

**Expected:**
- ✅ All tests pass
- ✅ No test failures
- ✅ No skipped tests
- ✅ Coverage meets requirements

#### E2E Tests

```bash
# From root or appropriate directory
npm run test:e2e
```

**Expected:**
- ✅ All Playwright tests pass
- ✅ Screenshot tests pass (with new baselines)
- ✅ No flaky tests
- ✅ All browsers pass (if multi-browser)

#### Integration Tests

```bash
npm run test:integration
```

**Expected:**
- ✅ MCP tool integration tests pass
- ✅ Widget communication works
- ✅ State management works

### Phase 4: Runtime Verification

**Application must run correctly end-to-end**

#### Start Backend Server

```bash
cd server
npm run dev
```

**Verify:**
- [ ] Server starts without errors
- [ ] No warnings in console
- [ ] Startup logs show "Word Morph" (not "Word Challenge")
- [ ] MCP tools registered correctly
- [ ] Server responds to health checks

**Check startup output:**
```
Expected output includes:
✅ Word Morph - Unique word transformation puzzle
✅ gamebox.start_word_morph
✅ gamebox.check_word_morph_guess
```

#### Start Frontend Development Server

```bash
cd web
npm run dev
```

**Verify:**
- [ ] Development server starts
- [ ] No compilation errors
- [ ] No warnings in terminal
- [ ] Browser opens automatically (if configured)

#### Test Widget in Browser

**Open browser to widget URL**

**Visual Verification:**
- [ ] Title shows "Word Morph" (not "Word Challenge")
- [ ] Colors are teal/coral/slate (not green/yellow/gray)
- [ ] Tiles have 8px border radius (rounded corners)
- [ ] Spacing is 12px between tiles (noticeably wider)
- [ ] No visual artifacts or broken layouts
- [ ] Responsive on mobile viewport (resize to 375px)
- [ ] **Dark mode works correctly (CRITICAL - test both light and dark themes)**
- [ ] **Theme switches automatically with OS/browser settings**

**Functional Verification:**
- [ ] "New Game" button works
- [ ] Can type letters
- [ ] Can submit guesses
- [ ] Tile colors update correctly (teal/coral/slate)
- [ ] Win condition works
- [ ] Loss condition works
- [ ] Keyboard shortcuts work
- [ ] Tab navigation works (accessibility)

**Console Verification:**
```bash
# Open browser console (F12)
# Should see NO errors
```

#### Apps SDK Compliance Verification (CRITICAL)

**Test window.openai API Integration:**

```javascript
// In browser console, verify window.openai exists
console.log('window.openai:', window.openai);

// Expected: Object with setWidgetState, callTool, theme, etc.
```

**Widget State Persistence:**
- [ ] Type some letters in the game
- [ ] Verify `window.openai.widgetState` contains current game state
- [ ] Refresh page
- [ ] Verify game state persists (letters still there)
- [ ] Agent can reference game state in conversation

**Dark Mode Support:**
- [ ] Switch OS/browser to dark mode
- [ ] Widget automatically switches to dark theme
- [ ] All colors readable and accessible
- [ ] No pure white/black colors (uses design tokens)
- [ ] Switch back to light mode - widget follows

**Apps SDK UI Components (if implemented):**
- [ ] Buttons use Apps SDK Button component
- [ ] Layout uses Card/Stack components
- [ ] Typography uses Heading/Text components
- [ ] Components follow ChatGPT design patterns

**Picture-in-Picture Mode (if implemented):**
- [ ] Click PiP button (if present)
- [ ] Widget opens in floating window
- [ ] Game remains functional in PiP
- [ ] State persists across mode changes
- [ ] Can close PiP and return to inline

#### Test MCP Integration

**Manual MCP tool test (using MCP inspector or similar):**

```json
// Test start_word_morph
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "gamebox.start_word_morph",
    "arguments": { "difficulty": "medium" }
  },
  "id": 1
}
```

**Expected:**
- ✅ Tool invokes successfully
- ✅ Returns game state
- ✅ No errors

```json
// Test check_word_morph_guess
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "gamebox.check_word_morph_guess",
    "arguments": { "guess": "SLATE" }
  },
  "id": 2
}
```

**Expected:**
- ✅ Tool invokes successfully
- ✅ Returns feedback
- ✅ Tile colors update in UI

### Phase 5: Visual Appearance Verification

**Compare new design to specification**

**Reference:** `/docs/VISUAL_DESIGN_SPEC.md` (from #17.3)

**Color Verification:**
- [ ] Correct tiles: Teal #14B8A6 (measured with eyedropper)
- [ ] Present tiles: Coral #F97316
- [ ] Absent tiles: Slate #64748B
- [ ] NOT using: Green #6AAA64, Yellow #C9B458, Gray #787C7E

**Layout Verification:**
- [ ] Border radius: 8px (inspect element)
- [ ] Tile spacing: 12px (inspect element)
- [ ] Animation duration: 150ms (check CSS)
- [ ] Grid size: 4×7 or as specified

**Accessibility Verification:**
- [ ] WCAG AA contrast ratios met
- [ ] Screen reader friendly (test with VoiceOver/NVDA)
- [ ] Keyboard navigation complete
- [ ] Focus indicators visible
- [ ] Reduced motion support

### Phase 6: Documentation Verification

**All documentation must be accurate**

#### Check Main Files

```bash
# README.md
cat README.md | grep "Word Morph"  # Should find
cat README.md | grep "Word Challenge"  # Should NOT find

# CONTRIBUTING.md
cat CONTRIBUTING.md | grep "Epic #17"  # Should find

# All docs
find docs/ -name "*.md" -exec grep -l "Word Challenge" {} \;
# Should return 0 files (except migration guide explaining the change)
```

#### Verify Links

**Check all markdown links work:**
```bash
# Manual verification or use link checker
# No broken links allowed
```

#### Verify Code Examples

**Ensure code examples in documentation are valid:**
- Import statements correct
- Tool IDs match implementation
- Component names accurate
- Syntax valid

### Phase 7: ChatGPT App Store Submission Checklist (CRITICAL - Added from Agent Review)

**Complete this before App Store submission:**

#### Transport & Architecture
- [ ] **SSE transport implemented** (not StreamableHTTPServerTransport)
- [ ] **Session management using Map<sessionId, SessionRecord>**
- [ ] **GET /mcp endpoint** for SSE connection
- [ ] **POST /mcp/messages endpoint** for message handling

#### Required Endpoints (BLOCKS SUBMISSION)
- [ ] **`/.well-known/openai-apps-challenge`** endpoint returns challenge token
- [ ] **`/privacy`** endpoint serves HTML privacy policy
- [ ] **`/terms`** endpoint serves HTML terms of service
- [ ] **`/health` or `/`** endpoint returns health check JSON
- [ ] **OPENAI_CHALLENGE_TOKEN** environment variable configured

#### Tool Schema Compliance
- [ ] **Tool definitions use JSON Schema** (not Zod schemas directly)
- [ ] **Separate Zod schemas for runtime validation**
- [ ] **Tool annotations present:** readOnlyHint, destructiveHint, openWorldHint
- [ ] **_meta fields present:** openai/outputTemplate, openai/widgetAccessible
- [ ] **Tool titles and descriptions optimized for discovery**

#### CORS & Security
- [ ] **CORS configured for ChatGPT domains** (chatgpt.com, chat.openai.com)
- [ ] **Security headers set:** X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- [ ] **HTTPS required in production**

#### Golden Prompt Testing (CRITICAL)
- [ ] **Direct prompts tested via ngrok** (5 per game)
  - [ ] "Let's play Word Morph" triggers correctly
  - [ ] "Start Word Morph" triggers correctly
  - [ ] All 5 direct prompts work
- [ ] **Indirect prompts tested** (5 per game)
  - [ ] "I want to play a word guessing game" triggers
  - [ ] Intent-based discovery works
- [ ] **Negative prompts tested** (3 per game)
  - [ ] "Let's play Wordle" does NOT trigger
  - [ ] Competitor names do NOT trigger
- [ ] **Golden prompt test results documented**

#### Widget Integration
- [ ] **window.openai API available in widget**
- [ ] **Widget state persistence** via setWidgetState()
- [ ] **Tool invocation** via callTool() works
- [ ] **Loading state handling** with polling pattern
- [ ] **Dark mode support** (light + dark themes)

#### App Store Domain Verification
- [ ] **Organization verified** on platform.openai.com
- [ ] **Domain ownership verified** via challenge endpoint
- [ ] **Test credentials prepared** for reviewer
- [ ] **Sample data available** for testing

### Phase 8: Final Checklist (Original Requirements)

**Complete this checklist before marking task done:**

- [ ] Zero old game name references in code
- [ ] Backend builds successfully
- [ ] Frontend builds successfully
- [ ] Type checking passes (both projects)
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] All integration tests pass
- [ ] Backend server starts correctly
- [ ] Frontend dev server starts correctly
- [ ] Widget renders in browser
- [ ] Visual design matches specification
  - [ ] Teal/coral/slate colors
  - [ ] 8px border radius
  - [ ] 12px spacing
  - [ ] 150ms animations
- [ ] MCP tools work correctly
- [ ] Game functionality works (start, guess, win/lose)
- [ ] No console errors
- [ ] Accessibility verified
- [ ] Documentation accurate
- [ ] No broken links

## Verification Report

**Create:** `/docs/REBRANDING_VERIFICATION_REPORT.md`

```markdown
# Rebranding Verification Report

**Date:** [Current Date]
**Epic:** #17 - Legal Safety Game Rebranding
**Verifier:** [Name]

## Summary

✅ All verification checks passed
✅ Zero old game name references in code
✅ All tests passing (unit, E2E, integration)
✅ All builds successful
✅ Runtime verification complete
✅ Visual design matches specification
✅ Documentation accurate

## Detailed Results

### Code Reference Verification
- Backend searches: 0 results ✅
- Frontend searches: 0 results ✅
- E2E searches: 0 results ✅
- Configuration searches: 0 results ✅

### Build Verification
- Server build: SUCCESS ✅
- Frontend build: SUCCESS ✅
- Type checking: PASS ✅

### Test Verification
- Backend unit tests: X/X passing ✅
- Frontend unit tests: X/X passing ✅
- E2E tests: X/X passing ✅
- Integration tests: X/X passing ✅

### Runtime Verification
- Backend server: Running ✅
- Frontend server: Running ✅
- Widget rendering: Working ✅
- MCP tools: Functional ✅
- Game mechanics: Working ✅

### Visual Design Verification
- Colors: Teal/Coral/Slate ✅
- Border radius: 8px ✅
- Spacing: 12px ✅
- Animations: 150ms ✅
- No Wordle colors: Confirmed ✅

### Accessibility Verification
- WCAG AA contrast: Met ✅
- Keyboard navigation: Working ✅
- Screen reader: Compatible ✅
- Focus indicators: Visible ✅

### Documentation Verification
- README.md: Updated ✅
- CONTRIBUTING.md: Updated ✅
- Technical docs: Updated ✅
- Links: All working ✅
- Code examples: Valid ✅

## Known Issues

None identified.

## Sign-off

The Word Morph rebranding is complete and verified. All games have been successfully renamed, all tests pass, and the application runs correctly with the new branding.

**Ready for deployment:** ✅ YES

**Signed:**
[Name], [Date]
```

## Acceptance Criteria

### Rebranding Verification
- [ ] All grep searches return 0 results
- [ ] All builds succeed
- [ ] All tests pass (100%)
- [ ] Server runs without errors
- [ ] Widget displays correctly
- [ ] Visual design matches spec
- [ ] MCP tools work
- [ ] Documentation accurate

### Apps SDK Compliance (CRITICAL)
- [ ] **Dark mode support working (light + dark themes)**
- [ ] **Widget state persists via window.openai.setWidgetState()**
- [ ] **window.openai API integration verified**
- [ ] Apps SDK UI components integrated (if implemented)
- [ ] Picture-in-Picture mode working (if implemented)
- [ ] WCAG AA accessibility standards met
- [ ] **Ready for ChatGPT App Store submission**

### Final Steps
- [ ] Verification report created
- [ ] Final checklist completed
- [ ] Sign-off obtained

## Troubleshooting

### If old references found
1. Note file and line number
2. Update to new name
3. Re-run grep verification
4. Re-run affected tests

### If builds fail
1. Check error message
2. Fix TypeScript/compilation errors
3. Clear build cache if needed
4. Rebuild

### If tests fail
1. Check test output
2. Identify failing test
3. Fix issue or update test
4. Re-run test suite

### If runtime issues
1. Check console errors
2. Check network tab
3. Verify backend is running
4. Check tool IDs match

## Related Tasks

- **Depends on:** #17.14 (All documentation must be updated)
- **Blocks:** #17.16 (Migration guide needs verification complete)
- **Critical path:** This is the final verification before deployment

## Labels

- `phase-4-testing`
- `critical`
- `verification`
- `epic-17`
- `sign-off-required`
