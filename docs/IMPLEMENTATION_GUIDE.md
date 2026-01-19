# Implementation Guide: Remaining Games

## Overview

This guide explains how to use the implementation patterns and GitHub issue templates to build the remaining 4 games in GameBox.

## What's Been Created

### 1. Implementation Patterns Document

**File**: `/docs/IMPLEMENTATION_PATTERNS.md`

A comprehensive 700+ line document that synthesizes all architectural patterns from the Word Morph implementation, covering:

- **Backend Architecture**: Game logic classes, MCP tool registration, session management, data persistence
- **Frontend React Architecture**: Component structure, custom hooks, state management, styling
- **Testing Architecture**: Unit tests, E2E tests, widget UI tests, screenshot tests
- **Build & Configuration**: TypeScript, Vite, CSP, package dependencies

This document serves as the **blueprint** for all new game implementations.

### 2. GitHub Issue Templates

**Location**: `/docs/github-issues/`

Four detailed issue templates ready to be copied into GitHub:

1. **ISSUE_KINSHIP.md** - Family relationship puzzle (12-17 hours)
2. **ISSUE_LEXICON_SMITH.md** - Word building game (12-17 hours)
3. **ISSUE_TWENTY_QUERIES.md** - AI guessing game (16-21 hours)
4. **ISSUE_LORE_MASTER.md** - Narrative trivia (13-18 hours)

Each template includes:
- Game description and core gameplay
- 5-phase implementation checklist
- Backend, frontend, testing, and integration tasks
- Code examples and patterns to follow
- Success criteria
- Time estimates
- References to implementation patterns

## How to Create GitHub Issues

### Step 1: Choose a Game to Implement

Pick one of the 4 games based on:
- **Easiest First**: Kinship or Lexicon Smith (familiar patterns)
- **Most Interesting**: Twenty Queries (AI integration challenge)
- **Most Fun**: Lore Master (narrative storytelling)

### Step 2: Create GitHub Issue

1. Go to GitHub repository
2. Click "New Issue"
3. Copy content from corresponding template file:
   - For Kinship: Copy contents of `docs/github-issues/ISSUE_KINSHIP.md`
   - For Lexicon Smith: Copy contents of `docs/github-issues/ISSUE_LEXICON_SMITH.md`
   - For Twenty Queries: Copy contents of `docs/github-issues/ISSUE_TWENTY_QUERIES.md`
   - For Lore Master: Copy contents of `docs/github-issues/ISSUE_LORE_MASTER.md`
4. Paste into GitHub issue body
5. Set title: "Implement [Game Name] Game"
6. Add labels as specified in template
7. Assign to yourself (or team member)
8. Create issue

### Step 3: Start Implementation

Follow the **Ralph Loop** workflow:

```
1. Research: Read IMPLEMENTATION_PATTERNS.md + game-specific GAME_ENHANCEMENT_SPEC.md
2. Implement: Follow Phase 1-5 checklist in the GitHub issue
3. Test: Run tests after each phase
4. Review: Code review and simplification
5. Commit: Commit with descriptive messages
6. Repeat: Move to next phase
```

### Step 4: Track Progress

Use the GitHub issue checklist to track progress:
- [ ] Check off each task as you complete it
- [ ] Update issue comments with any blockers or questions
- [ ] Link commits to the issue (use `#issue-number` in commit messages)

## Implementation Order Recommendation

### Option 1: Complexity-Based (Easiest to Hardest)

1. **Lexicon Smith** (12-17 hours) - Word building, similar to Word Morph patterns
2. **Kinship** (12-17 hours) - Logic puzzle, clean data structures
3. **Lore Master** (13-18 hours) - Narrative trivia, branching stories
4. **Twenty Queries** (16-21 hours) - AI integration, most complex

**Rationale**: Build confidence with familiar patterns, save AI integration for last.

### Option 2: User Value-Based (Most Requested First)

1. **Twenty Queries** (16-21 hours) - Most unique, AI-powered experience
2. **Lore Master** (13-18 hours) - Educational and engaging
3. **Lexicon Smith** (12-17 hours) - Vocabulary building
4. **Kinship** (12-17 hours) - Niche appeal

**Rationale**: Deliver highest-impact features first.

### Option 3: Parallel Development (Team-Based)

If you have multiple developers:
- **Developer 1**: Kinship (simpler data structures)
- **Developer 2**: Lexicon Smith (simpler validation logic)
- **Developer 3**: Lore Master (narrative focus)
- **Developer 4**: Twenty Queries (AI integration specialist)

**Rationale**: Maximize throughput, complete all 4 games in parallel.

## Key Patterns to Follow

### Backend Pattern (Every Game)

```typescript
// 1. Game logic class
export class GameNameGame {
  constructor(config: GameConfig) { }
  makeMove(move: Move): Result { }
  getState(): Readonly<GameState> { }
  isGameOver(): boolean { }
  getShareText(): string { }
}

// 2. MCP tool registration
server.registerTool("gamebox.start_game_name", {
  title: "Start Game Name",
  inputSchema: jsonSchema,
  // ...
}, async (params) => {
  // Zod validation
  // Create game instance
  // Create session
  // Load user stats
  // Return response
});

// 3. Data management
export const GAME_DATA: readonly GameData[] = [ /* ... */ ];
export function getDailyContent(date: Date): GameData { }
```

### Frontend Pattern (Every Game)

```typescript
export function GameName(): JSX.Element {
  // 1. Persisted state
  const [state, setState] = useWidgetState<GameState>(DEFAULT_STATE);

  // 2. Tool output listener
  const toolOutput = useOpenAiGlobal<ToolOutput>("toolOutput");

  // 3. Process tool output
  useEffect(() => {
    if (!toolOutput?.gameId) return;
    // Update state
  }, [toolOutput]);

  // 4. User input handler
  const handleAction = useCallback((action: Action) => {
    // Call MCP tool
    const api = getOpenAiApi();
    if (api) {
      api.callTool("gamebox.action_name", { /* ... */ });
    }
  }, [dependencies]);

  // 5. Render
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Game UI */}
    </div>
  );
}
```

### Testing Pattern (Every Game)

```typescript
// Unit test
describe("GameNameGame", () => {
  it("should validate input", () => { });
  it("should handle valid moves", () => { });
  it("should detect win condition", () => { });
});

// E2E test
test("should start game and accept moves", async ({ request }) => {
  const startResponse = await mcpCall(request, "tools/call", {
    name: "gamebox.start_game_name",
    arguments: { mode: "daily" },
  });
  // Verify response
});

// Widget UI test
test("should render game board", async ({ page }) => {
  await page.goto("http://localhost:4444/");
  await expect(page.getByText("Game Name")).toBeVisible();
});
```

## Common Pitfalls to Avoid

### 1. Skipping Tests
❌ DON'T: Write all code first, then test
✅ DO: Test after each phase (TDD approach)

### 2. Ignoring Patterns
❌ DON'T: Invent new patterns or shortcuts
✅ DO: Follow IMPLEMENTATION_PATTERNS.md exactly

### 3. Not Checking References
❌ DON'T: Guess how things work
✅ DO: Reference Word Morph implementation

### 4. Incomplete Validation
❌ DON'T: Trust user input
✅ DO: Validate all inputs with Zod + JSON Schema

### 5. Forgetting Mobile
❌ DON'T: Only test on desktop
✅ DO: Test at 375x667 mobile viewport

### 6. Skipping Accessibility
❌ DON'T: Mouse-only interactions
✅ DO: Support keyboard navigation

## Success Metrics

For each game implementation, verify:

### Code Quality
- [ ] All unit tests passing (35-40+ tests, >85% coverage)
- [ ] All E2E tests passing (13-18+ tests)
- [ ] All widget UI tests passing (12+ tests)
- [ ] Type checking passes (zero errors)
- [ ] Builds succeed (server + web)
- [ ] No console errors or warnings

### User Experience
- [ ] Widget renders correctly in browser
- [ ] Mobile responsive (375x667)
- [ ] Keyboard navigation works
- [ ] Animations smooth and performant
- [ ] Error messages user-friendly
- [ ] Share text generates correctly

### Integration
- [ ] Server starts without errors
- [ ] MCP tools register correctly
- [ ] Game appears in menu
- [ ] Streaks update for daily mode
- [ ] All modes work (daily/practice/etc.)

## Getting Help

### Documentation Resources
1. **IMPLEMENTATION_PATTERNS.md** - Architectural patterns (read first)
2. **GAME_ENHANCEMENT_SPEC.md** - Game-specific features and AI enhancements
3. **Word Morph Source Code** - Reference implementation:
   - `/server/src/games/wordMorph.ts`
   - `/web/src/widgets/WordMorph.tsx`
   - `/e2e/word-morph.spec.ts`

### Ask Questions
- Create GitHub issue with `question` label
- Tag team members for review
- Reference specific sections of patterns document

### Code Review Process
1. Complete a phase (Phase 1-5)
2. Run all tests
3. Commit code
4. Request review from team
5. Address feedback
6. Move to next phase

## Timeline Estimates

Based on Word Morph implementation experience:

| Game | Backend | Frontend | Testing | Total |
|------|---------|----------|---------|-------|
| Kinship | 5-7h | 4-5h | 4-6h | 13-18h |
| Lexicon Smith | 5-7h | 4-5h | 4-6h | 13-18h |
| Twenty Queries | 7-9h | 4-5h | 5-7h | 16-21h |
| Lore Master | 6-8h | 4-5h | 3-5h | 13-18h |

**Total for all 4 games**: 55-75 hours

### Parallel Development Timeline
If working with 4 developers:
- **Week 1-2**: All 4 games in parallel
- **Week 3**: Integration, testing, polish
- **Total**: 2-3 weeks to complete all games

### Sequential Development Timeline
If working solo:
- **Week 1**: Game 1 (backend + frontend)
- **Week 2**: Game 1 (testing) + Game 2 (backend)
- **Week 3**: Game 2 (frontend + testing)
- **Week 4**: Game 3 (backend + frontend)
- **Week 5**: Game 3 (testing) + Game 4 (backend)
- **Week 6**: Game 4 (frontend + testing)
- **Week 7**: Integration, testing, polish
- **Total**: 6-8 weeks to complete all games

## Next Steps

1. ✅ Read this guide completely
2. ✅ Review IMPLEMENTATION_PATTERNS.md
3. ✅ Review GAME_ENHANCEMENT_SPEC.md
4. ✅ Choose first game to implement
5. ✅ Create GitHub issue from template
6. ✅ Start Phase 1: Backend - Game Logic
7. ✅ Follow Ralph Loop workflow
8. ✅ Complete all 5 phases
9. ✅ Move to next game

## Questions?

If you have questions about:
- **Patterns**: Re-read IMPLEMENTATION_PATTERNS.md
- **Game Features**: Check GAME_ENHANCEMENT_SPEC.md
- **Specific Code**: Reference Word Morph implementation
- **Still Stuck**: Create GitHub issue with `question` label

---

**Ready to start?** Create your first GitHub issue and begin implementing!
