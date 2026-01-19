# Issue #17.11: Update Frontend Documentation

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 3 - Frontend Refactoring
**Duration:** 0.5 hours
**Priority:** Medium
**Dependencies:** #17.10

## Description

Update frontend documentation to reflect the new Word Morph widget name, component structure, and visual design. Ensure all code examples and documentation are accurate.

## Objectives

- Update `/web/README.md`
- Update component documentation
- Update code examples
- Update development guides
- Ensure consistency with new naming

## Files to Update

### 1. `/web/README.md`

**Update main documentation:**

```markdown
# GameBox Widgets - Frontend

React-based widget components for GameBox MCP games.

## Available Widgets

### Word Morph

A unique word transformation puzzle game with distinctive visual design.

**Features:**
- Teal/Coral/Slate color scheme (legally distinct from Wordle)
- Smooth animations and transitions
- Keyboard and mouse support
- WCAG AA accessible
- Dark mode support
- Fully responsive design

**Component:**
```tsx
import { WordMorph } from './widgets/WordMorph';

function App() {
  return <WordMorph />;
}
```

**MCP Integration:**
```typescript
// Start a new game
invokeTool('gamebox.start_word_morph', {
  difficulty: 'medium'  // 'easy' | 'medium' | 'hard'
});

// Check a guess
invokeTool('gamebox.check_word_morph_guess', {
  guess: 'SLATE'
});
```

**Widget Resource URI:**
```
ui://widget/word-morph.html
```

### Coming Soon

- **Kinship** - Linguistic relationship connections
- **Lexicon Smith** - Medieval word forging puzzle
- **Twenty Queries** - AI-powered investigation game
- **Lore Master** - Knowledge keeper trivia

## Installation

```bash
cd web
npm install
```

## Development

```bash
npm run dev          # Start development server
npm test             # Run tests
npm run type-check   # TypeScript validation
npm run build        # Production build
```

## Project Structure

```
web/
├── src/
│   ├── widgets/
│   │   ├── WordMorph.tsx          # Word Morph component
│   │   └── WordMorph.test.tsx     # Component tests
│   ├── hooks/
│   │   ├── useToolInput.ts        # MCP tool invocation
│   │   ├── useToolOutput.ts       # MCP tool response handling
│   │   └── useWidgetState.ts      # Widget state management
│   ├── styles/
│   │   └── globals.css            # Global styles and themes
│   └── main.tsx                   # App entry point
├── public/                        # Static assets
└── README.md
```

## Widget Development

### Creating a New Widget

1. Create component in `/src/widgets/YourWidget.tsx`
2. Create test file `/src/widgets/YourWidget.test.tsx`
3. Add styles to `/src/styles/globals.css`
4. Register in `/src/main.tsx`

### Widget Guidelines

**Styling:**
- Use CSS custom properties for theming
- Support dark mode
- Ensure WCAG AA compliance
- Test on mobile/tablet/desktop

**MCP Integration:**
- Use `useToolInput` hook for tool invocation
- Use `useToolOutput` hook for handling responses
- Use `useWidgetState` for state management

**Testing:**
- Write component tests with React Testing Library
- Test accessibility with jest-axe
- Test keyboard navigation
- Test responsive behavior

## Visual Design

### Word Morph Theme

**Colors:**
```css
--word-morph-correct: #14B8A6;    /* Teal */
--word-morph-present: #F97316;    /* Coral */
--word-morph-absent: #64748B;     /* Slate */
```

**Layout:**
- Tile size: 64px (56px on mobile)
- Tile spacing: 12px (8px on mobile)
- Border radius: 8px
- Animation duration: 150ms

**Accessibility:**
- All colors meet WCAG AA contrast ratios
- Pattern indicators for color-blind users
- Full keyboard navigation support
- Screen reader friendly
- Reduced motion support

## Testing

### Unit Tests

```bash
npm test                           # All tests
npm test -- WordMorph.test.tsx    # Specific widget
npm test -- --coverage            # With coverage
```

### Visual Testing

```bash
npm run test:visual               # Screenshot tests
```

### Accessibility Testing

```bash
npm run test:a11y                 # Accessibility audit
```

## Building for Production

```bash
npm run build
```

Output in `/dist` directory, ready for deployment.

## Legal Compliance

All GameBox widgets are designed with legal compliance in mind:

- **Distinctive Visual Design:** Teal/Coral/Slate colors (not green/yellow/gray)
- **Unique Layouts:** Different grid sizes and spacing patterns
- **Original Names:** Legally distinct from trademarked games
- **Custom Animations:** Unique timing and effects

See `/docs/REBRANDING_SPEC.md` for full compliance details.

## Troubleshooting

### Widget not rendering

1. Check console for errors
2. Verify MCP server is running
3. Check tool IDs match backend
4. Verify resource URI is correct

### Styles not applying

1. Check CSS custom properties are defined
2. Verify globals.css is imported
3. Check dark mode media query
4. Inspect element in dev tools

### MCP tools not working

1. Verify backend server is running
2. Check tool IDs are correct
3. Check network tab for MCP calls
4. Verify request/response format

## Contributing

See `/CONTRIBUTING.md` for guidelines on:
- Code style
- Testing requirements
- Pull request process
- Epic and task workflow
```

### 2. Component Documentation

**Add JSDoc to WordMorph.tsx:**

```typescript
/**
 * Word Morph Game Widget
 *
 * A unique word transformation puzzle game with distinctive visual design.
 * Legally differentiated from Wordle through:
 * - Teal/Coral/Slate color scheme (not green/yellow/gray)
 * - 8px border radius and 12px spacing
 * - 150ms animation timing
 * - WCAG AA accessible design
 *
 * @component
 * @example
 * ```tsx
 * <WordMorph />
 * ```
 */
export function WordMorph() {
  // ...
}

/**
 * Word Morph game tile component
 *
 * @param {Object} props - Component props
 * @param {string} props.letter - Letter to display
 * @param {TileStatus} props.status - Tile status (empty, correct, present, absent)
 * @param {number} props.index - Tile index for animation delay
 */
function Tile({ letter, status, index }: TileProps) {
  // ...
}
```

### 3. Hook Documentation

**Update hook JSDoc:**

```typescript
// In useToolInput.ts
/**
 * Hook for invoking Word Morph MCP tools
 *
 * @returns {Object} Word Morph tool functions
 * @returns {Function} startGame - Start a new Word Morph game
 * @returns {Function} checkGuess - Check a word guess
 * @returns {boolean} isLoading - Tool invocation loading state
 * @returns {Error} error - Tool invocation error state
 *
 * @example
 * ```tsx
 * const { startGame, checkGuess, isLoading } = useWordMorph();
 *
 * // Start a new game
 * await startGame('medium');
 *
 * // Check a guess
 * await checkGuess('SLATE');
 * ```
 */
export function useWordMorph() {
  // ...
}
```

### 4. Style Documentation

**Add comments to globals.css:**

```css
/**
 * Word Morph Visual Theme
 *
 * Legally distinct color palette and design system.
 * All colors meet WCAG AA contrast ratio requirements.
 */

/* Color Palette - Distinct from Wordle */
:root {
  --word-morph-correct: #14B8A6;    /* Teal (not green) */
  --word-morph-present: #F97316;    /* Coral (not yellow) */
  --word-morph-absent: #64748B;     /* Slate (not gray) */
  /* ... */
}

/* Tile Styles - Unique Design */
.word-morph-tile {
  /* 8px radius for distinctive shape (not square) */
  border-radius: var(--word-morph-tile-radius);
  /* ... */
}
```

## Acceptance Criteria

- [ ] `/web/README.md` updated with Word Morph documentation
- [ ] Component examples use new name
- [ ] MCP tool examples use new tool IDs
- [ ] Visual design documented
- [ ] Accessibility features documented
- [ ] Legal compliance noted
- [ ] Troubleshooting guide updated
- [ ] JSDoc comments added to components
- [ ] Hook documentation updated
- [ ] CSS comments added
- [ ] No "Word Challenge" references remain

## Search and Verify

```bash
cd web
grep -rn "Word Challenge" .
grep -rn "word-challenge" .
grep -rn "wordChallenge" .
```

**Expected:** Zero results in code/docs (only in git history)

## Implementation Checklist

- [ ] Update `/web/README.md`
  - [ ] Widget name and description
  - [ ] Component examples
  - [ ] MCP tool examples
  - [ ] Visual design documentation
  - [ ] Project structure
  - [ ] Development guides
  - [ ] Legal compliance section
- [ ] Add JSDoc to `WordMorph.tsx`
- [ ] Add JSDoc to hooks
- [ ] Add CSS comments
- [ ] Update any other frontend docs
- [ ] Run grep verification
- [ ] Review for consistency

## Documentation Style

**Naming Consistency:**
- "Word Morph" (title case) in prose
- `word-morph` (kebab-case) in IDs/URIs
- `wordMorph` (camelCase) in JavaScript
- `WordMorph` (PascalCase) for components
- `word_morph` (snake_case) in tool IDs

**Tone:**
- Clear and concise
- Focus on distinctive features
- Emphasize legal compliance
- Professional but friendly

## Related Tasks

- **Depends on:** #17.10 (Tool integration must be complete)
- **Related:** #17.7 (Backend documentation)
- **Related:** #17.14 (Project-wide documentation)

## Labels

- `phase-3-frontend`
- `documentation`
- `medium-priority`
- `epic-17`
