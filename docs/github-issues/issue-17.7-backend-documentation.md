# Issue #17.7: Update Backend Documentation

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 2 - Backend Refactoring
**Duration:** 1 hour
**Priority:** High
**Dependencies:** #17.6

## Description

Update all backend documentation to reflect the new game names, tool IDs, and visual design changes. This includes README files, JSDoc comments, and inline documentation.

## Objectives

- Update `/server/README.md`
- Update JSDoc comments in `index.ts`
- Update server startup logs
- Update any API documentation
- Ensure consistency with new naming

## Files to Update

### 1. `/server/README.md`

**Update tool listings:**

```markdown
# GameBox MCP Server

A Model Context Protocol (MCP) server providing interactive game widgets for ChatGPT.

## Available Games

1. **Word Morph** (Available) - A unique word transformation puzzle game
2. **Kinship** (Coming Soon) - Connect words through linguistic relationships
3. **Lexicon Smith** (Coming Soon) - Forge words in a medieval-themed puzzle
4. **Twenty Queries** (Coming Soon) - AI-powered investigation game
5. **Lore Master** (Coming Soon) - Test your knowledge as a lore keeper

## MCP Tools

### Game Tools

#### `gamebox.start_word_morph`

Start a new Word Morph game.

**Parameters:**
- `difficulty` (optional): Game difficulty level
  - `easy`: 3-letter words
  - `medium`: 4-letter words (default)
  - `hard`: 5-letter words

**Returns:**
- Game state with initial display
- Number of guesses remaining
- Game ID

**Example:**
```json
{
  "name": "gamebox.start_word_morph",
  "arguments": {
    "difficulty": "medium"
  }
}
```

#### `gamebox.check_word_morph_guess`

Check a word guess in the current Word Morph game.

**Parameters:**
- `guess` (required): The word to check (string)

**Returns:**
- Feedback for each letter (correct, present, absent)
- Updated game state
- Win/lose status

**Example:**
```json
{
  "name": "gamebox.check_word_morph_guess",
  "arguments": {
    "guess": "SLATE"
  }
}
```

### Widget Resources

#### `ui://widget/word-morph.html`

Interactive Word Morph game widget with:
- Real-time guess feedback
- Visual tile animations
- Keyboard support
- Distinctive teal/coral/slate color scheme

## Installation

```bash
cd server
npm install
npm run build
npm start
```

## Development

```bash
npm run dev  # Start in development mode
npm test     # Run tests
npm run type-check  # TypeScript validation
```

## Configuration

### Theme Configuration

Visual themes for all games are defined in `/server/src/config/themes.ts`:
- Color palettes
- Layout properties
- Animation timings

### Content Security Policy

CSP rules are configured in `/server/src/config/csp.ts` to allow:
- Inline styles for dynamic theming
- Safe script execution
- Widget resource loading

## Architecture

```
server/
├── src/
│   ├── index.ts           # MCP server + tool handlers
│   ├── games/
│   │   ├── wordMorph.ts   # Word Morph game logic
│   │   └── wordMorph.test.ts
│   ├── data/
│   │   ├── wordLists.ts   # Word dictionaries
│   │   └── streaks.ts     # User progress tracking
│   └── config/
│       ├── themes.ts      # Visual design themes
│       └── csp.ts         # Security policies
└── README.md
```

## Tool Naming Convention

All GameBox tools follow the pattern:
- `gamebox.start_<game-id>` - Start a new game
- `gamebox.check_<game-id>_guess` - Submit a guess
- `gamebox.get_<game-id>_state` - Get current state

## Legal & Compliance

All game names and designs are legally distinct from NYT Games:
- Word Morph uses teal/coral/slate colors (not green/yellow/gray)
- Unique game mechanics and presentation
- Trademark-safe naming

See `/docs/REBRANDING_SPEC.md` for full legal compliance details.
```

### 2. JSDoc Comments in `/server/src/index.ts`

**Update tool handler comments:**

```typescript
/**
 * Start a new Word Morph game
 *
 * Word Morph is a word transformation puzzle where players guess
 * the target word through strategic letter placement.
 *
 * @tool gamebox.start_word_morph
 * @param difficulty - Game difficulty (easy|medium|hard)
 * @returns Game state with initial setup
 */

/**
 * Check a word guess in Word Morph
 *
 * Validates the guess and returns feedback on letter positions.
 * Colors: Teal (correct), Coral (present), Slate (absent)
 *
 * @tool gamebox.check_word_morph_guess
 * @param guess - Word to check (string)
 * @returns Feedback and updated game state
 */
```

**Update resource comments:**

```typescript
/**
 * Word Morph interactive widget
 *
 * Features:
 * - Teal/Coral/Slate color scheme (legally distinct from Wordle)
 * - 4×7 or customizable grid layout
 * - Smooth animations (150ms timing)
 * - Full keyboard support
 * - WCAG AA accessible
 *
 * @resource ui://widget/word-morph.html
 */
```

### 3. Server Startup Logs

**Update console output in `index.ts`:**

```typescript
// OLD
console.log('🎮 GameBox MCP Server started');
console.log('📋 Available games:');
console.log('  - Word Challenge (available)');
console.log('  - Connections (coming soon)');
// ...

// NEW
console.log('🎮 GameBox MCP Server started');
console.log('📋 Available games:');
console.log('  ✅ Word Morph - Unique word transformation puzzle');
console.log('  🔜 Kinship - Linguistic relationship connections');
console.log('  🔜 Lexicon Smith - Medieval word forging');
console.log('  🔜 Twenty Queries - AI investigation game');
console.log('  🔜 Lore Master - Knowledge keeper trivia');
console.log('');
console.log('🔧 Registered MCP tools:');
console.log('  - gamebox.start_word_morph');
console.log('  - gamebox.check_word_morph_guess');
console.log('  - gamebox.get_game_menu');
```

### 4. Error Messages

Update error messages to use new names:

```typescript
// Examples
throw new Error('No active Word Morph game. Start a new game first.');
throw new Error('Word Morph game already completed.');
throw new Error('Invalid guess for Word Morph game.');
```

### 5. Package.json Scripts Documentation

Update script descriptions if present:

```json
{
  "scripts": {
    "dev": "Start Word Morph MCP server in development mode",
    "build": "Build Word Morph server for production",
    "test": "Run Word Morph game tests"
  }
}
```

## Testing Documentation

Create or update `/server/TESTING.md`:

```markdown
# Testing Word Morph Backend

## Unit Tests

Test the Word Morph game logic:

```bash
npm test -- wordMorph.test.ts
```

## Integration Tests

Test MCP tool integration:

```bash
npm run test:integration
```

## Manual Testing

### Start a game
```bash
# Using MCP inspector or curl
{
  "name": "gamebox.start_word_morph",
  "arguments": { "difficulty": "medium" }
}
```

### Check a guess
```bash
{
  "name": "gamebox.check_word_morph_guess",
  "arguments": { "guess": "SLATE" }
}
```

## Visual Design Testing

Verify theme configuration:
```typescript
import { getGameTheme } from './config/themes';
const theme = getGameTheme('wordMorph');
console.log(theme.colors); // Should show teal/coral/slate
```
```

## Acceptance Criteria

- [ ] `/server/README.md` updated with new game names
- [ ] Tool documentation uses new tool IDs
- [ ] All JSDoc comments updated
- [ ] Server startup logs show new game names
- [ ] Error messages use new terminology
- [ ] No references to "Word Challenge" remain
- [ ] Visual design differences documented
- [ ] Legal compliance noted in docs
- [ ] Examples and code snippets updated

## Search and Verify

Before marking complete:

```bash
cd server
grep -rn "Word Challenge" .
grep -rn "word-challenge" .
grep -rn "wordChallenge" .
```

**Expected:** Zero results in code, only in:
- Git history
- Migration notes
- Change documentation (if explaining the rename)

## Implementation Checklist

- [ ] Update `/server/README.md`
  - [ ] Game list (all 5 games)
  - [ ] Tool descriptions
  - [ ] Tool IDs
  - [ ] Example code
  - [ ] Architecture section
  - [ ] Legal compliance section
- [ ] Update JSDoc in `/server/src/index.ts`
  - [ ] Tool handlers
  - [ ] Resource handlers
  - [ ] Helper functions
- [ ] Update startup logs
- [ ] Update error messages
- [ ] Create/update `/server/TESTING.md`
- [ ] Update `package.json` descriptions
- [ ] Run grep verification
- [ ] Review for consistency

## Style Guidelines

**Naming:**
- Use "Word Morph" (title case) in user-facing text
- Use `word-morph` (kebab-case) in IDs
- Use `wordMorph` (camelCase) in code
- Use `WordMorph` (PascalCase) for classes

**Tone:**
- Professional and clear
- Emphasize legal safety and uniqueness
- Focus on distinctive features
- Avoid comparing directly to Wordle/NYT

## Related Tasks

- **Depends on:** #17.6 (Backend code must be finalized)
- **Related:** #17.11 (Frontend documentation)
- **Related:** #17.14 (Project-wide documentation)

## Labels

- `phase-2-backend`
- `documentation`
- `high-priority`
- `epic-17`
