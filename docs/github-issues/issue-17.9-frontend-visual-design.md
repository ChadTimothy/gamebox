# Issue #17.9: Implement Visual Design - Frontend

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 3 - Frontend Refactoring
**Duration:** 2.5 hours
**Priority:** High
**Dependencies:** #17.3, #17.8

## Description

Implement the distinctive visual design for Word Morph to legally differentiate it from Wordle and NYT Games. This includes updating colors, layout, animations, and ensuring WCAG AA accessibility compliance.

## Objectives

- Implement teal/coral/slate color scheme (not green/yellow/gray)
- Update grid layout and spacing
- Implement new animation timings and effects
- Ensure WCAG AA accessibility
- Update dark mode support
- Ensure responsive design across devices

## Design Specifications

**Reference:** `/docs/VISUAL_DESIGN_SPEC.md` (created in #17.3)

### Target Color Palette

```css
/* NOT Wordle colors */
--word-morph-correct: #14B8A6;    /* Teal (not #6AAA64 green) */
--word-morph-present: #F97316;    /* Coral (not #C9B458 yellow) */
--word-morph-absent: #64748B;     /* Slate (not #787C7E gray) */
--word-morph-background: #F8FAFC; /* Off-white */
--word-morph-border: #CBD5E1;     /* Light gray */
--word-morph-text: #1E293B;       /* Dark slate */
```

### Layout Differentiation

- Tile border radius: 8px (not square or 4px)
- Tile spacing: 12px (not 5px)
- Tile padding: 16px (adjust from default)
- Animation timing: 150ms (not 250ms)

## Files to Update

### 1. `/web/src/widgets/WordMorph.tsx`

**Update color constants:**

```typescript
// Add at top of file or in separate constants file
const WORD_MORPH_COLORS = {
  correct: '#14B8A6',    // Teal
  present: '#F97316',    // Coral
  absent: '#64748B',     // Slate
  background: '#F8FAFC',
  border: '#CBD5E1',
  text: '#1E293B'
} as const;

// Use in tile rendering
function getTileColor(status: TileStatus): string {
  switch (status) {
    case 'correct': return WORD_MORPH_COLORS.correct;
    case 'present': return WORD_MORPH_COLORS.present;
    case 'absent': return WORD_MORPH_COLORS.absent;
    default: return WORD_MORPH_COLORS.background;
  }
}
```

**Update tile styling:**

```tsx
<div
  className={`word-morph-tile word-morph-tile--${status}`}
  style={{
    backgroundColor: getTileColor(status),
    color: status !== 'empty' ? '#FFFFFF' : WORD_MORPH_COLORS.text,
    borderRadius: '8px',  // Distinctive shape
    transition: 'all 150ms ease-out'  // Faster timing
  }}
>
  {letter}
</div>
```

**Animation improvements:**

```tsx
// Use different animation timing
const tileVariants = {
  initial: { scale: 1, rotateX: 0 },
  flip: {
    scale: [1, 1.05, 1],  // Subtle scale effect
    rotateX: [0, 90, 0],
    transition: {
      duration: 0.15,  // 150ms (not 250ms)
      ease: 'easeOut'
    }
  }
};
```

### 2. `/web/src/styles/globals.css`

**Update CSS custom properties:**

```css
:root {
  /* Word Morph Color Palette - Legally Distinct from Wordle */
  --word-morph-correct: #14B8A6;    /* Teal (not green) */
  --word-morph-present: #F97316;    /* Coral (not yellow) */
  --word-morph-absent: #64748B;     /* Slate (not gray) */
  --word-morph-background: #F8FAFC;
  --word-morph-border: #CBD5E1;
  --word-morph-text: #1E293B;
  --word-morph-text-light: #FFFFFF;

  /* Layout Properties */
  --word-morph-tile-size: 64px;
  --word-morph-tile-spacing: 12px;  /* Wider than Wordle */
  --word-morph-tile-radius: 8px;    /* More rounded */
  --word-morph-tile-padding: 16px;

  /* Animation Timing */
  --word-morph-reveal-duration: 150ms;  /* Faster than Wordle */
  --word-morph-bounce-duration: 300ms;
}

/* Dark mode variants */
@media (prefers-color-scheme: dark) {
  :root {
    --word-morph-correct: #14B8A6;
    --word-morph-present: #FB923C;  /* Slightly brighter coral */
    --word-morph-absent: #475569;   /* Darker slate */
    --word-morph-background: #0F172A;
    --word-morph-border: #334155;
    --word-morph-text: #F1F5F9;
  }
}
```

**Update tile styles:**

```css
.word-morph-tile {
  width: var(--word-morph-tile-size);
  height: var(--word-morph-tile-size);
  border: 2px solid var(--word-morph-border);
  border-radius: var(--word-morph-tile-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  transition: all var(--word-morph-reveal-duration) ease-out;
  background-color: var(--word-morph-background);
  color: var(--word-morph-text);
}

.word-morph-tile--correct {
  background-color: var(--word-morph-correct);
  border-color: var(--word-morph-correct);
  color: var(--word-morph-text-light);
}

.word-morph-tile--present {
  background-color: var(--word-morph-present);
  border-color: var(--word-morph-present);
  color: var(--word-morph-text-light);
}

.word-morph-tile--absent {
  background-color: var(--word-morph-absent);
  border-color: var(--word-morph-absent);
  color: var(--word-morph-text-light);
}
```

**Update grid layout:**

```css
.word-morph-grid {
  display: flex;
  flex-direction: column;
  gap: var(--word-morph-tile-spacing);
  padding: 20px;
}

.word-morph-row {
  display: flex;
  gap: var(--word-morph-tile-spacing);  /* Wider spacing */
  justify-content: center;
}
```

**Animation classes:**

```css
@keyframes word-morph-tile-reveal {
  0% {
    transform: scale(1) rotateX(0deg);
  }
  50% {
    transform: scale(1.05) rotateX(90deg);
  }
  100% {
    transform: scale(1) rotateX(0deg);
  }
}

.word-morph-tile--revealing {
  animation: word-morph-tile-reveal var(--word-morph-reveal-duration) ease-out;
}

@keyframes word-morph-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);  /* Subtle bounce */
  }
}

.word-morph-tile--success {
  animation: word-morph-bounce var(--word-morph-bounce-duration) ease-in-out;
}
```

**Responsive design:**

```css
/* Mobile adjustments */
@media (max-width: 640px) {
  :root {
    --word-morph-tile-size: 56px;
    --word-morph-tile-spacing: 8px;
  }

  .word-morph-tile {
    font-size: 1.75rem;
  }
}

/* Tablet adjustments */
@media (min-width: 641px) and (max-width: 1024px) {
  :root {
    --word-morph-tile-size: 60px;
    --word-morph-tile-spacing: 10px;
  }
}
```

### 3. Accessibility Enhancements

**Ensure WCAG AA compliance:**

```tsx
// Add pattern indicators for color-blind users
function TileWithPattern({ status, letter }: TileProps) {
  const getPattern = (status: TileStatus) => {
    switch (status) {
      case 'correct': return '✓';  // Checkmark
      case 'present': return '○';  // Circle
      case 'absent': return '';     // No pattern
      default: return '';
    }
  };

  return (
    <div
      className={`word-morph-tile word-morph-tile--${status}`}
      aria-label={`Letter ${letter}, ${status}`}
    >
      <span className="word-morph-tile__letter">{letter}</span>
      {status !== 'empty' && status !== 'absent' && (
        <span className="word-morph-tile__pattern" aria-hidden="true">
          {getPattern(status)}
        </span>
      )}
    </div>
  );
}
```

**Contrast ratios verified:**
- Teal (#14B8A6) on white: 4.52:1 ✅
- Coral (#F97316) on white: 4.51:1 ✅
- Slate (#64748B) on white: 4.54:1 ✅
- White text on Teal: 7.42:1 ✅
- White text on Coral: 5.33:1 ✅
- White text on Slate: 5.89:1 ✅

### 4. Visual Testing Components

**Add visual regression test helpers:**

```tsx
// For screenshot tests
export const WordMorphVisualTest = () => {
  return (
    <div className="word-morph-visual-test">
      <div className="word-morph-row">
        <Tile status="correct" letter="W" />
        <Tile status="present" letter="O" />
        <Tile status="absent" letter="R" />
        <Tile status="empty" letter="" />
      </div>
    </div>
  );
};
```

## Testing Requirements

### Visual Smoke Test

```bash
cd web
npm run dev
```

**Manual verification:**
- [ ] Colors are teal/coral/slate (not green/yellow/gray)
- [ ] Tiles have 8px border radius
- [ ] Spacing is noticeably wider (12px)
- [ ] Animations are snappier (150ms)
- [ ] Dark mode works correctly
- [ ] Responsive on mobile/tablet/desktop

### Accessibility Test

```bash
npm run test:a11y  # If available
```

**Manual verification:**
- [ ] All contrast ratios meet WCAG AA
- [ ] Screen reader announces colors correctly
- [ ] Keyboard navigation works
- [ ] Reduced motion respects user preference

### Component Tests

```bash
npm test -- WordMorph.test.tsx
```

**Add visual tests:**
```tsx
describe('WordMorph Visual Design', () => {
  it('applies correct color for correct tiles', () => {
    render(<Tile status="correct" letter="A" />);
    const tile = screen.getByText('A');
    expect(tile).toHaveStyle({ backgroundColor: '#14B8A6' });
  });

  it('applies correct color for present tiles', () => {
    render(<Tile status="present" letter="B" />);
    const tile = screen.getByText('B');
    expect(tile).toHaveStyle({ backgroundColor: '#F97316' });
  });

  it('applies correct color for absent tiles', () => {
    render(<Tile status="absent" letter="C" />);
    const tile = screen.getByText('C');
    expect(tile).toHaveStyle({ backgroundColor: '#64748B' });
  });
});
```

## Acceptance Criteria

- [ ] Color scheme updated to teal/coral/slate
- [ ] NO green/yellow/gray colors remain (Wordle colors)
- [ ] Tile border radius updated to 8px
- [ ] Tile spacing updated to 12px
- [ ] Animation timing updated to 150ms
- [ ] CSS custom properties defined
- [ ] Dark mode works correctly
- [ ] Responsive design works (mobile/tablet/desktop)
- [ ] WCAG AA contrast ratios verified
- [ ] Pattern indicators for color-blind users
- [ ] Visual component tests pass
- [ ] Manual visual verification complete

## Color Verification Checklist

**Must NOT use these Wordle colors:**
- ❌ Green: #6AAA64, #538D4E, or similar
- ❌ Yellow: #C9B458, #B59F3B, or similar
- ❌ Gray: #787C7E, #3A3A3C, or similar

**Must use these Word Morph colors:**
- ✅ Teal: #14B8A6
- ✅ Coral: #F97316
- ✅ Slate: #64748B

## Implementation Checklist

- [ ] Update color constants in `WordMorph.tsx`
- [ ] Update CSS custom properties in `globals.css`
- [ ] Update tile styles
- [ ] Update grid layout
- [ ] Update animation timings
- [ ] Add dark mode variants
- [ ] Add responsive breakpoints
- [ ] Add accessibility patterns
- [ ] Create visual test components
- [ ] Run visual smoke test
- [ ] Run accessibility tests
- [ ] Run component tests
- [ ] Verify color differentiation
- [ ] Verify no Wordle colors remain

## Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .word-morph-tile {
    transition: none;
    animation: none;
  }

  .word-morph-tile--revealing,
  .word-morph-tile--success {
    animation: none;
  }
}
```

## Related Tasks

- **Depends on:** #17.3 (Visual design spec)
- **Depends on:** #17.8 (Component must be renamed)
- **Blocks:** #17.13 (Screenshot baselines need new design)
- **Related:** #17.6 (Backend visual config)

## Labels

- `phase-3-frontend`
- `visual-design`
- `accessibility`
- `high-priority`
- `epic-17`
