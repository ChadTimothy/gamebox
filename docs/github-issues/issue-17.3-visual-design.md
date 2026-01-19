# Issue #17.3: Design Visual Differentiation

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 1 - Planning & Design
**Duration:** 2 hours
**Priority:** High
**Dependencies:** #17.1

## Description

Design distinctive visual identities for all 5 games that clearly differentiate them from NYT Games, particularly focusing on Word Morph (previously Word Challenge) to avoid Wordle similarities.

## Objectives

- Create unique color palettes for each game
- Design distinctive layout patterns
- Specify icons/emoji for each game
- Define animation style guidelines
- Ensure accessibility (WCAG AA compliance)

## Deliverable

Create `/docs/VISUAL_DESIGN_SPEC.md` with the following sections:

### 1. Word Morph Visual Identity

**Primary Goal:** Differentiate from Wordle's green/yellow/gray scheme and 5×6 grid

**Color Palette:**
```css
--word-morph-correct: #14B8A6;    /* Teal (not green) */
--word-morph-present: #F97316;    /* Coral (not yellow) */
--word-morph-absent: #64748B;     /* Slate (not gray) */
--word-morph-background: #F8FAFC; /* Off-white */
--word-morph-border: #CBD5E1;     /* Light gray */
--word-morph-text: #1E293B;       /* Dark slate */
```

**Layout Differentiation:**
- **Grid Size Options:**
  - Option A: 4×7 grid (4 letters, 7 guesses)
  - Option B: 3×8 grid (3 letters, 8 guesses)
  - Option C: Horizontal flow (not vertical stacking)
- **Tile Styling:**
  - Rounded corners (8px, not square)
  - Subtle shadow instead of solid border
  - Animated flip on reveal (different timing than Wordle)
- **Spacing:**
  - Wider gap between tiles (12px vs 5px)
  - More padding within tiles

**Typography:**
- Font: System font stack (not special game font)
- Letter sizing: Slightly smaller (not prominent)
- Weight: 500 (medium, not bold)

**Animations:**
- Tile reveal: Fade + scale (not just flip)
- Success: Subtle bounce (not shake)
- Timing: 150ms (not 250ms)

**Icon/Emoji:**
- 🔄 (transformation symbol)
- Or custom SVG of morphing shapes

### 2. Kinship Visual Identity

**Primary Goal:** Radial/circular layout distinct from Connections' grid

**Color Palette:**
```css
--kinship-primary: #8B5CF6;       /* Purple */
--kinship-secondary: #EC4899;     /* Pink */
--kinship-tertiary: #F59E0B;      /* Amber */
--kinship-quaternary: #10B981;    /* Emerald */
--kinship-background: #FAFAFA;
--kinship-border: #E5E7EB;
```

**Layout:**
- Circular/radial arrangement of word bubbles
- Drag to center to group
- Visual connections with animated lines
- Not grid-based

**Typography:**
- Sans-serif, friendly
- Variable sizing based on importance

**Animations:**
- Smooth drag and snap
- Line drawing for connections
- Ripple effect on group formation

**Icon/Emoji:**
- 🔗 (link/connection symbol)
- Or custom SVG of interconnected nodes

### 3. Lexicon Smith Visual Identity

**Primary Goal:** Medieval forge theme, not honeycomb

**Color Palette:**
```css
--lexicon-smith-primary: #B45309;    /* Bronze */
--lexicon-smith-secondary: #F59E0B;  /* Gold */
--lexicon-smith-accent: #DC2626;     /* Hot iron red */
--lexicon-smith-background: #292524; /* Charcoal */
--lexicon-smith-text: #FAFAF9;       /* Off-white */
```

**Layout:**
- Anvil-shaped game board
- Letters arranged in arc (not hexagon)
- Central word display area
- Forge-inspired UI elements

**Typography:**
- Strong, industrial font
- Sharp edges (not rounded)

**Animations:**
- Hammer strike on word creation
- Spark effects
- Metal glow on valid words

**Icon/Emoji:**
- 🔨 (hammer/anvil)
- Or custom SVG of anvil

### 4. Twenty Queries Visual Identity

**Primary Goal:** Conversation interface, not question list

**Color Palette:**
```css
--twenty-queries-user: #3B82F6;      /* Blue */
--twenty-queries-ai: #6366F1;        /* Indigo */
--twenty-queries-background: #F9FAFB;
--twenty-queries-bubble: #FFFFFF;
--twenty-queries-border: #E5E7EB;
```

**Layout:**
- Chat bubble interface
- Messages stack vertically
- Avatar icons for user/AI
- Progress indicator (queries remaining)

**Typography:**
- Conversational font
- Comfortable reading size

**Animations:**
- Bubble slide-in
- Typing indicator
- Smooth scrolling

**Icon/Emoji:**
- 🔍 (magnifying glass/investigation)
- Or custom SVG of question mark

### 5. Lore Master Visual Identity

**Primary Goal:** Book/scroll theme for knowledge

**Color Palette:**
```css
--lore-master-primary: #7C2D12;      /* Dark brown */
--lore-master-secondary: #CA8A04;    /* Aged gold */
--lore-master-accent: #B91C1C;       /* Red seal */
--lore-master-background: #FEF3C7;   /* Parchment */
--lore-master-text: #431407;         /* Dark brown */
```

**Layout:**
- Book page layout
- Question on one "page"
- Answers on facing "page"
- Page turn animation

**Typography:**
- Serif font (book-like)
- Classic proportions

**Animations:**
- Page turn effect
- Ink writing effect for answers
- Seal stamp on completion

**Icon/Emoji:**
- 📚 (book/knowledge)
- Or custom SVG of open book

### 6. Accessibility Requirements

All games must meet:
- WCAG AA contrast ratios (4.5:1 for text)
- Keyboard navigation support
- Screen reader compatibility
- Reduced motion alternatives
- Color-blind friendly palettes

**Color Blind Considerations:**
- Word Morph: Use patterns in addition to colors
- Kinship: Use distinct shapes
- Lexicon Smith: Use texture/glow intensity
- Twenty Queries: Use icons in bubbles
- Lore Master: Use clear text labels

### 7. Dark Mode Support

Each game should have a dark mode variant:
- Invert background/foreground
- Maintain contrast ratios
- Adjust accent colors for dark backgrounds
- Use CSS custom properties for easy switching

### 8. Responsive Design

All games must work on:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)

Layout adjustments for each breakpoint documented.

### 9. Animation Guidelines

**Performance:**
- Use CSS transforms (not position)
- Use will-change sparingly
- Provide reduced-motion alternatives

**Timing:**
- Fast: 150ms (micro-interactions)
- Medium: 300ms (state changes)
- Slow: 500ms (complex transitions)

**Easing:**
- `ease-out` for entrances
- `ease-in` for exits
- `ease-in-out` for continuous motion

### 10. Design System Integration

All designs should use:
- Consistent spacing scale (4px base unit)
- Consistent border radius values
- Consistent shadow depths
- Shared typography scale

## Acceptance Criteria

- [ ] `/docs/VISUAL_DESIGN_SPEC.md` created
- [ ] All 5 games have complete visual specifications
- [ ] Color palettes defined with hex codes
- [ ] Layout wireframes described
- [ ] Accessibility requirements documented
- [ ] Dark mode considerations included
- [ ] Animation guidelines established
- [ ] Design reviewed for legal differentiation

## Implementation Notes

- Focus on Word Morph first (most critical)
- Ensure designs are implementable in React + CSS
- Designs should be distinctive but maintain GameBox brand
- Balance uniqueness with consistency

## Labels

- `phase-1-planning`
- `design`
- `documentation`
- `high-priority`
- `epic-17`
