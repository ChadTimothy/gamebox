# New Game Implementation Checklist

Quick reference for starting a new game implementation using established patterns.

## Before You Start

1. ✅ Read `/docs/IMPLEMENTATION_PATTERNS.md` (comprehensive patterns)
2. ✅ Read `/docs/IMPLEMENTATION_GUIDE.md` (step-by-step guide)
3. ✅ Choose which game to implement next:
   - **Lexicon Smith** (easiest, word building)
   - **Kinship** (logic puzzle, clean data structures)
   - **Twenty Queries** (AI integration, most complex)
   - **Lore Master** (narrative trivia)

## Step 1: Create GitHub Issue

Copy the appropriate template from `/docs/github-issues/`:
- `ISSUE_KINSHIP.md`
- `ISSUE_LEXICON_SMITH.md`
- `ISSUE_TWENTY_QUERIES.md`
- `ISSUE_LORE_MASTER.md`

Paste into new GitHub issue, assign to yourself.

## Step 2: Create Feature Branch

```bash
git checkout -b feat/game-name-implementation
```

## Step 3: Backend - Game Logic (Phase 1)

**File to create**: `server/src/games/gameName.ts`

**Copy structure from**: `server/src/games/wordMorph.ts`

**Key components to implement**:
```typescript
// 1. Types and interfaces
interface GameState { }
interface GameConfig { }

// 2. Game data (if needed)
export const GAME_DATA: readonly GameData[] = [ ];

// 3. Main game class
export class GameNameGame {
  constructor(config: GameConfig) { }
  makeMove(move: Move): Result { }
  getState(): Readonly<GameState> { }
  isGameOver(): boolean { }
  getShareText(): string { }
}

// 4. Helper functions
export function getDailyContent(date: Date): GameData { }
```

**Unit tests**: Create `server/src/games/gameName.test.ts` (35-40 tests)

## Step 4: Backend - MCP Tools (Phase 2)

**File to modify**: `server/src/index.ts`

**Register tools**:
```typescript
// Start game tool
server.registerTool("gamebox.start_game_name", {
  title: "Start Game Name",
  inputSchema: startGameSchema,
}, async (params) => {
  // Zod validation
  // Create game instance
  // Create session
  // Load user stats
  // Return response
});

// Make move tool
server.registerTool("gamebox.action_game_name", {
  title: "Action for Game Name",
  inputSchema: actionSchema,
}, async (params) => {
  // Validate session exists
  // Get game instance
  // Process move
  // Update stats if game over
  // Return result
});
```

**E2E tests**: Create `e2e/game-name.spec.ts` (13-18 tests)

## Step 5: Frontend - React Widget (Phase 3)

**File to create**: `web/src/widgets/GameName.tsx`

**Copy structure from**: `web/src/widgets/WordMorph.tsx`

**Reuse components**:
- Import `Keyboard` from `../components/Keyboard.tsx` (if word game)
- Import types from `../types/game.ts`

**Key components to implement**:
```typescript
// 1. State interface
interface GameNameState {
  gameId?: string;
  // ... game-specific state
}

// 2. Main component
export function GameName(): JSX.Element {
  // Persisted state
  const [state, setState] = useWidgetState<GameNameState>(DEFAULT_STATE);

  // Tool output listener
  const toolOutput = useOpenAiGlobal<ToolOutput>("toolOutput");

  // Process tool output
  useEffect(() => { }, [toolOutput]);

  // User input handlers
  const handleAction = useCallback(() => { }, []);

  // Render
  return (<div>{ /* Game UI */ }</div>);
}
```

**Register widget**: Update `web/src/main.tsx` to include new game

**Widget UI tests**: Create `web/src/widgets/GameName.test.tsx` (12+ tests)

## Step 6: Integration & Polish (Phase 4)

- [ ] Update game menu in `server/src/index.ts`
- [ ] Add resource URI registration
- [ ] Test in browser at `http://localhost:4444/`
- [ ] Verify mobile responsive (375x667)
- [ ] Test keyboard navigation
- [ ] Check accessibility (screen reader, ARIA)

## Step 7: Documentation (Phase 5)

- [ ] Add JSDoc to all public APIs
- [ ] Update README.md with game description
- [ ] Update CONTRIBUTING.md with new game info
- [ ] Create PR with comprehensive description

## Verification Checklist

Before marking complete, verify:

### Tests
- [ ] All unit tests passing (35-40+ tests, >85% coverage)
- [ ] All E2E tests passing (13-18+ tests)
- [ ] All widget UI tests passing (12+ tests)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Builds succeed (`npm run build`)

### User Experience
- [ ] Widget renders in browser
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Animations smooth
- [ ] Error messages user-friendly
- [ ] Share text generates correctly

### Integration
- [ ] Server starts without errors
- [ ] MCP tools register correctly
- [ ] Game appears in menu
- [ ] Streaks update (daily mode)
- [ ] All modes work

## Helpful Commands

```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Build (both server and web)
npm run build

# Start dev server
npm run dev

# Open browser widget
open http://localhost:4444/
```

## Time Estimates

- Backend (Phase 1-2): 5-9 hours
- Frontend (Phase 3): 4-5 hours
- Testing (Phase 4): 4-7 hours
- Documentation (Phase 5): 1-2 hours
- **Total**: 14-23 hours per game

## Reference Files

- **Word Morph**: Working reference implementation
  - Backend: `server/src/games/wordMorph.ts`
  - Frontend: `web/src/widgets/WordMorph.tsx`
  - Tests: `e2e/word-morph.spec.ts`

- **Shared Resources**:
  - Types: `web/src/types/game.ts`
  - Keyboard: `web/src/components/Keyboard.tsx`
  - Hooks: `web/src/hooks/`

- **Documentation**:
  - Patterns: `/docs/IMPLEMENTATION_PATTERNS.md`
  - Guide: `/docs/IMPLEMENTATION_GUIDE.md`
  - Issues: `/docs/github-issues/`

## Questions?

- Refer to IMPLEMENTATION_PATTERNS.md for architectural decisions
- Check Word Morph implementation for working examples
- Create GitHub issue with `question` label if stuck

---

**Ready to start?** Follow the Ralph Loop process:
1. Research (read patterns & game spec)
2. Implement (follow phases 1-5)
3. Simplify (code review & refactor)
4. Test (run all tests, fix bugs)
5. Review (code quality check)
6. Commit (descriptive messages)
7. Repeat for next phase
