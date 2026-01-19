# Issue #17.14: Update Project Documentation

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 4 - Testing & Documentation
**Duration:** 2 hours
**Priority:** High
**Dependencies:** #17.13

## Description

Update all project-level documentation files to reflect the new game names, tool IDs, visual designs, and legal compliance information. This includes README files, contributing guides, technical documentation, and testing guides.

## Objectives

- Update main README.md
- Update CONTRIBUTING.md
- Update all technical documentation
- Update testing guides
- Update design documents
- Ensure consistency across all documentation

## Files to Update

### 1. `/README.md` (Main Project Documentation)

**High-visibility file - first impression for users**

**Update game list:**

```markdown
# GameBox

MCP-powered interactive games for ChatGPT.

## Available Games

### 🎮 Currently Available

- **Word Morph** - A unique word transformation puzzle with distinctive visual design

### 🔜 Coming Soon

- **Kinship** - Connect words through linguistic relationships
- **Lexicon Smith** - Forge words in a medieval-themed puzzle
- **Twenty Queries** - AI-powered investigation game
- **Lore Master** - Test your knowledge as a lore keeper

## Features

- 🎨 Legally distinct visual designs (teal/coral/slate color scheme)
- ♿ WCAG AA accessible
- 📱 Fully responsive
- 🌙 Dark mode support
- ⌨️ Keyboard navigation

## Quick Start

### Play Word Morph

1. Install GameBox MCP server
2. Connect to ChatGPT
3. Say "Let's play Word Morph"

### For Developers

```bash
# Install dependencies
npm install

# Start MCP server
cd server && npm run dev

# Start widget frontend
cd web && npm run dev
```

## MCP Tools

### Word Morph Tools

#### `gamebox.start_word_morph`

Start a new Word Morph game.

**Parameters:**
- `difficulty`: "easy" | "medium" | "hard"

#### `gamebox.check_word_morph_guess`

Check a guess in the current Word Morph game.

**Parameters:**
- `guess`: string (the word to check)

## Architecture

```
gamebox/
├── server/          # MCP server with game logic
│   └── src/
│       ├── games/
│       │   └── wordMorph.ts
│       └── index.ts # MCP tool handlers
├── web/             # React widgets
│   └── src/
│       └── widgets/
│           └── WordMorph.tsx
├── e2e/             # End-to-end tests
│   └── word-morph.spec.ts
└── docs/            # Documentation
```

## Legal Compliance

GameBox games are designed to be legally distinct from NYT Games:

- **Word Morph** (not Wordle): Teal/Coral/Slate colors, 8px radius, unique animations
- **Kinship** (not Connections): Radial layout, different mechanics
- **Lexicon Smith** (not Spelling Bee): Medieval forge theme
- **Twenty Queries** (not 20 Questions): Conversation-based interface
- **Lore Master** (not Trivia): Knowledge keeper narrative theme

See `/docs/REBRANDING_SPEC.md` for full legal compliance details.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Testing

```bash
npm test              # Unit tests
npm run test:e2e     # End-to-end tests
npm run test:a11y    # Accessibility tests
```

## License

MIT

## Acknowledgments

Built with:
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- React
- TypeScript
- Playwright
```

### 2. `/CONTRIBUTING.md`

**Update Epic list:**

```markdown
## Active Epics

### Epic #17: Legal Safety Game Rebranding ✅ Complete

Comprehensive rebranding of all 5 games for legal compliance and trademark safety.

**Completed Tasks:**
- ✅ #17.1-17.3: Planning & Design
- ✅ #17.4-17.7: Backend Refactoring
- ✅ #17.8-17.11: Frontend Refactoring
- ✅ #17.12-17.16: Testing & Documentation

**Key Changes:**
- Word Challenge → Word Morph
- Connections → Kinship
- Spelling Bee → Lexicon Smith
- 20 Questions → Twenty Queries
- Trivia Challenge → Lore Master

**Breaking Changes:**
- Tool IDs updated (see Migration Guide)
- Visual design differentiated from NYT Games

**Migration:** See `/docs/REBRANDING_MIGRATION.md`
```

**Update code examples:**

```markdown
## Example: Adding a New Game

```typescript
// In server/src/games/yourGame.ts
export class YourGame {
  // Game logic
}

// In server/src/index.ts
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'gamebox.start_your_game') {
    // Tool handler
  }
});
```

// In web/src/widgets/YourGame.tsx
export function YourGame() {
  // Widget component
}
```

**Note:** Follow naming conventions from `/docs/REBRANDING_SPEC.md`
```

**Update game name references throughout**

### 3. `/docs/TECHNICAL_REVIEW.md`

**Update all game names and tool IDs:**

```markdown
# Technical Review

## MCP Integration

GameBox implements MCP tools for game interactions:

### Word Morph Tools

- `gamebox.start_word_morph` - Start new game
- `gamebox.check_word_morph_guess` - Submit guess

### Widget Resources

- `ui://widget/word-morph.html` - Interactive widget

## Visual Design

Word Morph uses a legally distinct color palette:
- Correct: Teal (#14B8A6)
- Present: Coral (#F97316)
- Absent: Slate (#64748B)

This differentiates from Wordle's green/yellow/gray scheme.
```

### 4. `/docs/TESTING_GUIDE.md`

**Update test examples:**

```markdown
# Testing Guide

## Unit Tests

### Backend Tests

```bash
cd server
npm test -- wordMorph.test.ts
```

### Frontend Tests

```bash
cd web
npm test -- WordMorph.test.tsx
```

## Integration Tests

Test MCP tool integration:

```typescript
// Test Word Morph tool invocation
const response = await invokeTool('gamebox.start_word_morph', {
  difficulty: 'medium'
});
expect(response.success).toBe(true);
```

## E2E Tests

```bash
npm run test:e2e -- word-morph.spec.ts
```

## Visual Regression Tests

Screenshot tests ensure visual consistency:

```bash
npm run test:e2e -- --update-snapshots  # Regenerate baselines
```

Current baselines reflect Word Morph design (teal/coral/slate).
```

### 5. `/docs/DESIGN_REQUIREMENTS.md`

**Update design specifications:**

```markdown
# Design Requirements

## Visual Identity

### Word Morph

**Legal Requirement:** Must be visually distinct from Wordle

**Color Palette:**
- Correct: Teal (#14B8A6) - NOT green
- Present: Coral (#F97316) - NOT yellow
- Absent: Slate (#64748B) - NOT gray

**Layout:**
- Border radius: 8px (distinctive shape)
- Tile spacing: 12px (wider than Wordle)
- Animation: 150ms (faster timing)

**Grid Options:**
- 4×7 or 3×8 (NOT 5×6 like Wordle)

### Future Games

- Kinship: Radial/circular layout
- Lexicon Smith: Medieval forge theme
- Twenty Queries: Conversation bubbles
- Lore Master: Book/scroll interface
```

### 6. `/docs/TECHNICAL_SPIKE_SUMMARY.md`

**Update game references:**

```markdown
# Technical Spike Summary

## Game Implementation: Word Morph

### Backend

- Module: `/server/src/games/wordMorph.ts`
- Class: `WordMorphGame`
- Tools: `start_word_morph`, `check_word_morph_guess`

### Frontend

- Component: `/web/src/widgets/WordMorph.tsx`
- Hooks: `useWordMorph`, `useToolInput`, `useToolOutput`

### Visual Design

Implemented teal/coral/slate color scheme to differentiate from Wordle.
```

### 7. `/docs/ANIMATION_STORYBOARD.md`

**Update animation references:**

```markdown
# Animation Storyboard

## Word Morph Animations

### Tile Reveal (150ms)

1. Scale: 1 → 1.05 → 1
2. RotateX: 0 → 90 → 0
3. Color: background → teal/coral/slate

**Timing:** 150ms (faster than Wordle's 250ms)

### Success Animation

- Subtle bounce (4px translateY)
- 300ms duration
- ease-in-out easing
```

### 8. `/testing/` Directory Documentation

**Update any README or documentation files in /testing/**

### 9. Search and Replace Across All Docs

**Patterns to find and replace:**

```bash
# Find all occurrences
grep -r "Word Challenge" docs/
grep -r "word-challenge" docs/
grep -r "Connections" docs/ | grep -v "network connections"
grep -r "Spelling Bee" docs/
grep -r "20 Questions" docs/
grep -r "Trivia Challenge" docs/
```

**Replace with new names:**
- Word Challenge → Word Morph
- Connections → Kinship
- Spelling Bee → Lexicon Smith
- 20 Questions → Twenty Queries
- Trivia Challenge → Lore Master

## Verification

### Link Checking

```bash
# Check for broken links in markdown
npm run check-links  # If available
# Or manual verification
```

### Code Example Validation

**Ensure all code examples are valid:**
- TypeScript syntax correct
- Tool IDs match implementation
- Import paths correct
- Component names accurate

### Consistency Check

**Verify consistent naming across all docs:**
- "Word Morph" (title case) in prose
- `word-morph` (kebab-case) in IDs/URIs
- `wordMorph` (camelCase) in code
- `WordMorph` (PascalCase) for components
- `word_morph` (snake_case) in tool IDs

## Acceptance Criteria

- [ ] `/README.md` updated with all game names
- [ ] `/CONTRIBUTING.md` updated with Epic #17
- [ ] `/docs/TECHNICAL_REVIEW.md` updated
- [ ] `/docs/TESTING_GUIDE.md` updated
- [ ] `/docs/DESIGN_REQUIREMENTS.md` updated
- [ ] `/docs/TECHNICAL_SPIKE_SUMMARY.md` updated
- [ ] `/docs/ANIMATION_STORYBOARD.md` updated
- [ ] All testing documentation updated
- [ ] No broken links
- [ ] All code examples valid
- [ ] Consistent naming throughout
- [ ] Legal compliance documented

## Search and Verify

```bash
# Should return 0 results in docs (except historical notes)
grep -r "Word Challenge" docs/ --include="*.md"
grep -r "word-challenge" docs/ --include="*.md"
grep -r "gamebox.start_word_challenge" docs/
grep -r "gamebox.check_word_guess" docs/
```

## Implementation Checklist

- [ ] Update `/README.md`
  - [ ] Game list (all 5 games)
  - [ ] Quick start guide
  - [ ] MCP tools section
  - [ ] Architecture diagram
  - [ ] Legal compliance section
- [ ] Update `/CONTRIBUTING.md`
  - [ ] Add Epic #17 to list
  - [ ] Update code examples
  - [ ] Update game references
- [ ] Update `/docs/TECHNICAL_REVIEW.md`
- [ ] Update `/docs/TESTING_GUIDE.md`
- [ ] Update `/docs/DESIGN_REQUIREMENTS.md`
- [ ] Update `/docs/TECHNICAL_SPIKE_SUMMARY.md`
- [ ] Update `/docs/ANIMATION_STORYBOARD.md`
- [ ] Update `/testing/` documentation
- [ ] Run global search and replace
- [ ] Verify all links work
- [ ] Validate all code examples
- [ ] Check naming consistency

## Documentation Style Guide

**Game Names:**
- Always capitalize: "Word Morph", "Kinship", "Lexicon Smith"
- Use full names in prose
- Use IDs in code: `word-morph`, `kinship`

**Legal Language:**
- Emphasize "distinct" and "differentiated"
- Reference specific differences (colors, layouts)
- Avoid comparisons that could suggest copying

**Code Examples:**
- Include full context
- Show imports
- Add comments
- Test examples are valid

## Related Tasks

- **Depends on:** #17.13 (Tests must be passing)
- **Related:** #17.7 (Backend docs)
- **Related:** #17.11 (Frontend docs)
- **Blocks:** #17.15 (Final verification needs complete docs)

## Labels

- `phase-4-testing`
- `documentation`
- `high-priority`
- `epic-17`
