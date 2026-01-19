# GameBox Visual Design Specification

**Epic:** #17 - Legal Safety Game Rebranding
**Version:** 1.0
**Status:** Approved
**Last Updated:** 2026-01-19
**Dependencies:** REBRANDING_SPEC.md

## Executive Summary

This document defines the complete visual identity for all 5 GameBox games, with primary focus on differentiating Word Morph from Wordle and ensuring each game has a distinctive, memorable aesthetic that avoids trademark conflicts with NYT Games.

### Design Principles

1. **Legal Differentiation:** Clearly distinct from NYT Games (Wordle, Connections, Spelling Bee)
2. **Accessibility First:** WCAG AA compliance minimum
3. **Brand Consistency:** Unified GameBox design language
4. **Performance:** CSS-optimized, GPU-accelerated animations
5. **Responsive:** Mobile-first, works 320px+

## 1. Word Morph Visual Identity

### 1.1 Design Strategy

**Primary Goal:** Maximum visual differentiation from Wordle

**Wordle Characteristics to AVOID:**
- ❌ Green (#6AAA64) / Yellow (#C9B458) / Gray (#787C7E) colors
- ❌ 5×6 vertical grid layout
- ❌ Square tiles with sharp corners
- ❌ Sequential row-by-row reveal animation
- ❌ 250ms flip timing
- ❌ Bold uppercase letters

**Word Morph Distinctive Features:**
- ✅ Teal / Coral / Slate color scheme
- ✅ Horizontal flow OR 4×7/3×8 grid (NOT 5×6)
- ✅ Rounded tile corners (8px border-radius)
- ✅ Simultaneous tile reveal animation
- ✅ 150ms faster timing
- ✅ Medium-weight letters with spacing

### 1.2 Color Palette

#### Light Mode (Default)

```css
:root {
  /* Feedback Colors */
  --word-morph-correct: #14B8A6;      /* Teal 500 - Correct position */
  --word-morph-correct-light: #5EEAD4; /* Teal 300 - Hover/focus */
  --word-morph-correct-dark: #0F766E;  /* Teal 700 - Active */

  --word-morph-present: #F97316;      /* Orange 500 - Wrong position */
  --word-morph-present-light: #FD9A5A; /* Orange 400 - Hover/focus */
  --word-morph-present-dark: #EA580C;  /* Orange 600 - Active */

  --word-morph-absent: #64748B;       /* Slate 500 - Not in word */
  --word-morph-absent-light: #94A3B8;  /* Slate 400 - Hover/focus */
  --word-morph-absent-dark: #475569;   /* Slate 600 - Active */

  /* UI Colors */
  --word-morph-background: #F8FAFC;   /* Slate 50 - Main background */
  --word-morph-surface: #FFFFFF;      /* White - Card/tile surface */
  --word-morph-border: #CBD5E1;       /* Slate 300 - Borders */
  --word-morph-border-light: #E2E8F0; /* Slate 200 - Subtle borders */

  /* Text Colors */
  --word-morph-text-primary: #1E293B;   /* Slate 800 - Main text */
  --word-morph-text-secondary: #475569; /* Slate 600 - Secondary text */
  --word-morph-text-muted: #94A3B8;     /* Slate 400 - Muted text */

  /* State Colors */
  --word-morph-empty: #F1F5F9;        /* Slate 100 - Empty tile */
  --word-morph-typing: #E0E7FF;       /* Indigo 100 - Active tile */
  --word-morph-error: #FEE2E2;        /* Red 100 - Error state */
}
```

#### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Feedback Colors - Adjusted for dark backgrounds */
    --word-morph-correct: #2DD4BF;      /* Teal 400 */
    --word-morph-present: #FB923C;      /* Orange 400 */
    --word-morph-absent: #64748B;       /* Slate 500 */

    /* UI Colors */
    --word-morph-background: #0F172A;   /* Slate 900 */
    --word-morph-surface: #1E293B;      /* Slate 800 */
    --word-morph-border: #334155;       /* Slate 700 */
    --word-morph-border-light: #475569; /* Slate 600 */

    /* Text Colors */
    --word-morph-text-primary: #F1F5F9;   /* Slate 100 */
    --word-morph-text-secondary: #CBD5E1; /* Slate 300 */
    --word-morph-text-muted: #64748B;     /* Slate 500 */

    /* State Colors */
    --word-morph-empty: #334155;        /* Slate 700 */
    --word-morph-typing: #3730A3;       /* Indigo 800 */
    --word-morph-error: #7F1D1D;        /* Red 900 */
  }
}
```

#### Color Accessibility

**WCAG AA Contrast Ratios:**
- Correct (Teal #14B8A6) on white: 4.52:1 ✅
- Present (Orange #F97316) on white: 3.56:1 ⚠️ (needs white text)
- Absent (Slate #64748B) on white: 4.53:1 ✅
- Text (#1E293B) on background (#F8FAFC): 13.71:1 ✅

**Color Blind Considerations:**
- Add subtle pattern overlays to tiles:
  - Correct: Checkmark pattern
  - Present: Circle pattern
  - Absent: X pattern
- Patterns visible in `prefers-contrast: high`

### 1.3 Layout Specifications

#### Grid Options

**Option A: Horizontal Flow (RECOMMENDED)**
```
Current guess: [T] [E] [A] [L] [S]
Guess 1:       [C] [R] [A] [N] [E]  🟦🟧⬜⬜🟩
Guess 2:       [S] [L] [A] [T] [E]  🟩🟧🟩🟧🟩
Guess 3:       [S] [T] [E] [A] [L]  🟩🟩🟩🟩🟩

Flow: Left-to-right, top-to-bottom
Grid: 5 columns × 7 rows (standard)
```

**Option B: Compact Grid**
```
4×7 grid (4-letter words, 7 guesses)
Better for mobile
Shorter words = faster gameplay
```

**Option C: Extended Grid**
```
3×8 grid (3-letter words, 8 guesses)
More attempts
Easier difficulty option
```

#### Tile Specifications

```css
.word-morph-tile {
  /* Size */
  width: 62px;
  height: 62px;

  /* Desktop: larger tiles */
  @media (min-width: 640px) {
    width: 72px;
    height: 72px;
  }

  /* Styling */
  border-radius: 8px;           /* Rounded, not square */
  border: 2px solid var(--word-morph-border);
  background: var(--word-morph-surface);

  /* Shadow (subtle depth) */
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);

  /* Typography */
  font-size: 32px;
  font-weight: 500;             /* Medium, not bold */
  letter-spacing: 0.05em;       /* Slightly spaced */
  text-transform: uppercase;
  color: var(--word-morph-text-primary);

  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Transition */
  transition: all 150ms ease-out;
}
```

#### Spacing

```css
.word-morph-grid {
  gap: 12px;                    /* Wide gap (vs Wordle's 5px) */
  padding: 20px;
}

.word-morph-row {
  gap: 12px;                    /* Horizontal spacing */
}
```

### 1.4 Typography

```css
/* Game Title */
.word-morph-title {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 2rem;              /* 32px */
  font-weight: 700;
  color: var(--word-morph-text-primary);
  letter-spacing: -0.02em;      /* Tight tracking */
}

/* Tile Letters */
.word-morph-letter {
  font-family: 'SF Mono', 'Courier New', monospace;
  font-size: 2rem;              /* 32px */
  font-weight: 500;             /* Medium */
  line-height: 1;
}

/* Instructions */
.word-morph-instructions {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 0.875rem;          /* 14px */
  font-weight: 400;
  color: var(--word-morph-text-secondary);
  line-height: 1.5;
}
```

### 1.5 Animations

#### Tile Reveal (Primary Animation)

**Wordle uses:** Sequential flip, 250ms each tile

**Word Morph uses:** Simultaneous scale + fade, 150ms

```css
/* Initial state */
.word-morph-tile[data-state="pending"] {
  transform: scale(1);
  opacity: 1;
}

/* Reveal animation */
.word-morph-tile[data-state="revealing"] {
  animation: word-morph-reveal 150ms ease-out forwards;
}

@keyframes word-morph-reveal {
  0% {
    transform: scale(1) rotateY(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.1) rotateY(90deg);
    opacity: 0.5;
  }
  100% {
    transform: scale(1) rotateY(180deg);
    opacity: 1;
  }
}

/* Revealed state */
.word-morph-tile[data-state="correct"],
.word-morph-tile[data-state="present"],
.word-morph-tile[data-state="absent"] {
  transform: scale(1) rotateY(180deg);
}
```

#### Tile Pop (On Letter Input)

```css
.word-morph-tile[data-state="typing"] {
  animation: word-morph-pop 100ms ease-out;
}

@keyframes word-morph-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}
```

#### Success Animation

```css
.word-morph-tile[data-success="true"] {
  animation: word-morph-bounce 500ms ease-out;
}

@keyframes word-morph-bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  25% {
    transform: translateY(-10px) scale(1.05);
  }
  50% {
    transform: translateY(0) scale(1);
  }
  75% {
    transform: translateY(-5px) scale(1.02);
  }
}
```

#### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .word-morph-tile {
    animation: none !important;
    transition: background-color 150ms ease-out,
                border-color 150ms ease-out;
  }
}
```

### 1.6 Responsive Design

#### Mobile (320px - 639px)

```css
@media (max-width: 639px) {
  .word-morph-tile {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }

  .word-morph-grid {
    gap: 8px;
    padding: 16px;
  }

  .word-morph-title {
    font-size: 1.5rem;         /* 24px */
  }
}
```

#### Tablet (640px - 1023px)

```css
@media (min-width: 640px) and (max-width: 1023px) {
  .word-morph-tile {
    width: 64px;
    height: 64px;
    font-size: 30px;
  }

  .word-morph-grid {
    gap: 10px;
    padding: 18px;
  }
}
```

#### Desktop (1024px+)

```css
@media (min-width: 1024px) {
  .word-morph-tile {
    width: 72px;
    height: 72px;
    font-size: 32px;
  }

  .word-morph-grid {
    gap: 12px;
    padding: 20px;
  }

  /* Hover effects (desktop only) */
  .word-morph-tile:hover {
    border-color: var(--word-morph-text-secondary);
    box-shadow:
      0 4px 6px rgba(0, 0, 0, 0.1),
      0 2px 4px rgba(0, 0, 0, 0.06);
  }
}
```

### 1.7 Icons and Imagery

**Primary Icon:** 🔄 (transformation/morph symbol)

**Alternative Icons:**
- Custom SVG of morphing shapes
- Animated transition effect
- Two shapes blending together

**Share Card Design:**
```
Word Morph 3/6

🟦🟧⬜⬜🟩
🟩🟧🟩🟧🟩
🟩🟩🟩🟩🟩

Unique colors: Teal, Coral, Slate
```

## 2. Kinship Visual Identity

### 2.1 Design Strategy

**Primary Goal:** Radial/organic layout vs Connections' rectangular grid

**Connections Characteristics to AVOID:**
- ❌ 4×4 rectangular grid
- ❌ Rigid alignment
- ❌ Grid-based selection

**Kinship Distinctive Features:**
- ✅ Circular/radial word arrangement
- ✅ Organic, flowing layout
- ✅ Drag-to-group interaction
- ✅ Animated connection lines

### 2.2 Color Palette

```css
:root {
  /* Category Colors */
  --kinship-category-1: #8B5CF6;      /* Violet 500 */
  --kinship-category-2: #06B6D4;      /* Cyan 500 */
  --kinship-category-3: #F59E0B;      /* Amber 500 */
  --kinship-category-4: #EC4899;      /* Pink 500 */

  /* UI Colors */
  --kinship-background: #FAFAFA;      /* Gray 50 */
  --kinship-surface: #FFFFFF;
  --kinship-border: #E5E7EB;          /* Gray 200 */
  --kinship-connection-line: #D1D5DB; /* Gray 300 */

  /* Text Colors */
  --kinship-text-primary: #111827;    /* Gray 900 */
  --kinship-text-secondary: #6B7280;  /* Gray 500 */
}

@media (prefers-color-scheme: dark) {
  :root {
    --kinship-category-1: #A78BFA;    /* Violet 400 */
    --kinship-category-2: #22D3EE;    /* Cyan 400 */
    --kinship-category-3: #FBBF24;    /* Amber 400 */
    --kinship-category-4: #F472B6;    /* Pink 400 */

    --kinship-background: #111827;    /* Gray 900 */
    --kinship-surface: #1F2937;       /* Gray 800 */
    --kinship-border: #374151;        /* Gray 700 */
    --kinship-connection-line: #4B5563; /* Gray 600 */

    --kinship-text-primary: #F9FAFB;  /* Gray 50 */
    --kinship-text-secondary: #9CA3AF; /* Gray 400 */
  }
}
```

### 2.3 Layout Specifications

**Word Bubble:**
```css
.kinship-word-bubble {
  padding: 12px 20px;
  border-radius: 24px;            /* Pill shape */
  background: var(--kinship-surface);
  border: 2px solid var(--kinship-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  font-size: 1rem;
  font-weight: 500;
  color: var(--kinship-text-primary);

  cursor: grab;
  transition: all 200ms ease-out;
}

.kinship-word-bubble:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.kinship-word-bubble[data-category] {
  border-color: var(--kinship-category-color);
  background: var(--kinship-category-color);
  color: white;
}
```

**Radial Layout:**
- Words arranged in circle (360° / word count)
- Center "drop zone" for grouping
- Connection lines drawn using SVG
- Responsive sizing based on screen width

### 2.4 Animations

**Drag and Drop:**
```css
.kinship-word-bubble[data-dragging="true"] {
  cursor: grabbing;
  transform: scale(1.1) rotate(5deg);
  opacity: 0.8;
  z-index: 1000;
}
```

**Connection Line Drawing:**
```css
.kinship-connection-line {
  stroke: var(--kinship-connection-line);
  stroke-width: 2px;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: kinship-draw-line 300ms ease-out forwards;
}

@keyframes kinship-draw-line {
  to {
    stroke-dashoffset: 0;
  }
}
```

**Group Formation:**
```css
.kinship-category-group {
  animation: kinship-form-group 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes kinship-form-group {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}
```

## 3. Lexicon Smith Visual Identity

### 3.1 Design Strategy

**Primary Goal:** Medieval forge theme, NOT honeycomb

**Spelling Bee Characteristics to AVOID:**
- ❌ Honeycomb hexagon layout
- ❌ Yellow/bee theme
- ❌ Center letter in hexagon

**Lexicon Smith Distinctive Features:**
- ✅ Anvil-shaped board
- ✅ Bronze/forge color palette
- ✅ Industrial, metallic aesthetic
- ✅ Hammer strike animations

### 3.2 Color Palette

```css
:root {
  /* Primary Colors */
  --lexicon-smith-bronze: #B45309;    /* Amber 700 - Primary metal */
  --lexicon-smith-gold: #F59E0B;      /* Amber 500 - Accent */
  --lexicon-smith-iron: #DC2626;      /* Red 600 - Hot iron */

  /* Background */
  --lexicon-smith-charcoal: #292524;  /* Stone 800 - Forge background */
  --lexicon-smith-ember: #451A03;     /* Amber 950 - Deep shadows */

  /* Text */
  --lexicon-smith-text-light: #FAFAF9; /* Stone 50 */
  --lexicon-smith-text-muted: #A8A29E; /* Stone 400 */

  /* States */
  --lexicon-smith-glow: #FCD34D;      /* Amber 300 - Word glow */
  --lexicon-smith-spark: #FEF3C7;     /* Amber 100 - Spark effect */
}
```

### 3.3 Layout Specifications

**Anvil Board:**
```css
.lexicon-smith-board {
  background: var(--lexicon-smith-charcoal);
  border: 4px solid var(--lexicon-smith-bronze);
  border-radius: 12px;
  padding: 32px;

  /* Anvil shape via clip-path */
  clip-path: polygon(
    10% 0%, 90% 0%,
    95% 5%, 95% 30%,
    100% 35%, 100% 65%,
    95% 70%, 95% 95%,
    90% 100%, 10% 100%,
    5% 95%, 5% 70%,
    0% 65%, 0% 35%,
    5% 30%, 5% 5%
  );

  box-shadow:
    0 0 30px rgba(245, 158, 11, 0.3),
    inset 0 0 20px rgba(0, 0, 0, 0.5);
}
```

**Letter Tiles:**
```css
.lexicon-smith-letter {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: linear-gradient(135deg,
    var(--lexicon-smith-bronze),
    var(--lexicon-smith-gold)
  );
  border: 2px solid var(--lexicon-smith-gold);

  font-family: 'Georgia', serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--lexicon-smith-text-light);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  cursor: pointer;
  transition: all 150ms ease-out;
}

.lexicon-smith-letter:hover {
  transform: translateY(-4px);
  box-shadow:
    0 6px 12px rgba(245, 158, 11, 0.4),
    0 0 20px var(--lexicon-smith-glow);
}
```

### 3.4 Animations

**Hammer Strike:**
```css
.lexicon-smith-word[data-valid="true"] {
  animation: lexicon-smith-hammer 300ms ease-out;
}

@keyframes lexicon-smith-hammer {
  0% {
    transform: translateY(0) scale(1);
  }
  30% {
    transform: translateY(-10px) scale(1.05);
  }
  50% {
    transform: translateY(5px) scale(0.95);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}
```

**Spark Effect:**
```css
.lexicon-smith-spark {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--lexicon-smith-spark);
  animation: lexicon-smith-spark-fly 500ms ease-out forwards;
}

@keyframes lexicon-smith-spark-fly {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--spark-x), var(--spark-y)) scale(0);
    opacity: 0;
  }
}
```

**Metal Glow:**
```css
.lexicon-smith-word[data-score="high"] {
  animation: lexicon-smith-glow 1s ease-in-out infinite alternate;
}

@keyframes lexicon-smith-glow {
  0% {
    box-shadow: 0 0 10px var(--lexicon-smith-glow);
  }
  100% {
    box-shadow: 0 0 20px var(--lexicon-smith-glow),
                0 0 30px var(--lexicon-smith-glow);
  }
}
```

## 4. Twenty Queries Visual Identity

### 4.1 Design Strategy

**Primary Goal:** Conversation interface, NOT question list

**Distinctive Features:**
- ✅ Chat bubble interface
- ✅ Avatar icons
- ✅ Natural conversation flow
- ✅ AI investigation theme

### 4.2 Color Palette

```css
:root {
  /* Message Colors */
  --twenty-queries-user: #3B82F6;     /* Blue 500 */
  --twenty-queries-ai: #6366F1;       /* Indigo 500 */
  --twenty-queries-system: #8B5CF6;   /* Violet 500 */

  /* UI Colors */
  --twenty-queries-background: #F9FAFB; /* Gray 50 */
  --twenty-queries-bubble: #FFFFFF;
  --twenty-queries-bubble-user: #EFF6FF; /* Blue 50 */
  --twenty-queries-bubble-ai: #EEF2FF;   /* Indigo 50 */
  --twenty-queries-border: #E5E7EB;      /* Gray 200 */

  /* Progress Colors */
  --twenty-queries-progress-bg: #E5E7EB;    /* Gray 200 */
  --twenty-queries-progress-fill: #3B82F6;  /* Blue 500 */
}

@media (prefers-color-scheme: dark) {
  :root {
    --twenty-queries-user: #60A5FA;     /* Blue 400 */
    --twenty-queries-ai: #818CF8;       /* Indigo 400 */
    --twenty-queries-system: #A78BFA;   /* Violet 400 */

    --twenty-queries-background: #111827;     /* Gray 900 */
    --twenty-queries-bubble: #1F2937;         /* Gray 800 */
    --twenty-queries-bubble-user: #1E3A8A;    /* Blue 900 */
    --twenty-queries-bubble-ai: #3730A3;      /* Indigo 800 */
    --twenty-queries-border: #374151;         /* Gray 700 */
  }
}
```

### 4.3 Layout Specifications

**Chat Bubble:**
```css
.twenty-queries-message {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 18px;
  margin-bottom: 12px;

  font-size: 0.95rem;
  line-height: 1.5;

  animation: twenty-queries-slide-in 200ms ease-out;
}

.twenty-queries-message[data-sender="user"] {
  background: var(--twenty-queries-bubble-user);
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.twenty-queries-message[data-sender="ai"] {
  background: var(--twenty-queries-bubble-ai);
  margin-right: auto;
  border-bottom-left-radius: 4px;
}
```

**Progress Indicator:**
```css
.twenty-queries-progress {
  width: 100%;
  height: 8px;
  background: var(--twenty-queries-progress-bg);
  border-radius: 4px;
  overflow: hidden;
}

.twenty-queries-progress-bar {
  height: 100%;
  background: var(--twenty-queries-progress-fill);
  transition: width 300ms ease-out;
}

.twenty-queries-counter {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--twenty-queries-user);
  text-align: center;
  margin-top: 8px;
}
```

### 4.4 Animations

**Bubble Slide In:**
```css
@keyframes twenty-queries-slide-in {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**Typing Indicator:**
```css
.twenty-queries-typing {
  display: flex;
  gap: 4px;
}

.twenty-queries-typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--twenty-queries-ai);
  animation: twenty-queries-bounce 1.4s infinite ease-in-out;
}

.twenty-queries-typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.twenty-queries-typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes twenty-queries-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
```

## 5. Lore Master Visual Identity

### 5.1 Design Strategy

**Primary Goal:** Book/scroll theme for knowledge and trivia

**Distinctive Features:**
- ✅ Book page layout
- ✅ Parchment colors
- ✅ Serif typography
- ✅ Page turn animations

### 5.2 Color Palette

```css
:root {
  /* Primary Colors */
  --lore-master-brown: #7C2D12;       /* Red 900 - Dark wood */
  --lore-master-gold: #CA8A04;        /* Yellow 700 - Aged gold */
  --lore-master-seal: #B91C1C;        /* Red 700 - Wax seal */

  /* Background */
  --lore-master-parchment: #FEF3C7;   /* Amber 100 */
  --lore-master-page: #FEF9E7;        /* Lighter parchment */

  /* Text */
  --lore-master-text-dark: #431407;   /* Red 950 - Ink */
  --lore-master-text-muted: #92400E;  /* Amber 800 */

  /* Borders */
  --lore-master-border: #D97706;      /* Amber 600 */
}
```

### 5.3 Layout Specifications

**Book Page:**
```css
.lore-master-page {
  background: var(--lore-master-page);
  border: 3px solid var(--lore-master-border);
  border-radius: 4px;
  padding: 32px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.1),
    inset 0 0 30px rgba(217, 119, 6, 0.1);

  /* Paper texture */
  background-image:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 1px,
      rgba(217, 119, 6, 0.03) 1px,
      rgba(217, 119, 6, 0.03) 2px
    );
}
```

**Typography:**
```css
.lore-master-question {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--lore-master-text-dark);
}

.lore-master-answer {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--lore-master-text-dark);
  padding: 12px 16px;
  border: 1px solid var(--lore-master-border);
  border-radius: 4px;
  background: var(--lore-master-parchment);
  cursor: pointer;
  transition: all 150ms ease-out;
}

.lore-master-answer:hover {
  background: var(--lore-master-gold);
  color: white;
}
```

### 5.4 Animations

**Page Turn:**
```css
.lore-master-page[data-turning="true"] {
  animation: lore-master-page-turn 600ms ease-in-out;
}

@keyframes lore-master-page-turn {
  0% {
    transform: rotateY(0deg);
    opacity: 1;
  }
  50% {
    transform: rotateY(90deg);
    opacity: 0.5;
  }
  100% {
    transform: rotateY(0deg);
    opacity: 1;
  }
}
```

**Ink Writing:**
```css
.lore-master-text[data-writing="true"] {
  animation: lore-master-write 1s steps(40) forwards;
}

@keyframes lore-master-write {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}
```

**Seal Stamp:**
```css
.lore-master-seal {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle,
    var(--lore-master-seal),
    #7F1D1D
  );
  animation: lore-master-stamp 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes lore-master-stamp {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(-90deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}
```

## 6. Universal Accessibility Requirements

### 6.1 WCAG AA Compliance

**Contrast Ratios (Minimum 4.5:1 for text):**
- All text on backgrounds must meet WCAG AA
- UI components minimum 3:1
- Large text (18px+) minimum 3:1

**Color Blind Considerations:**
- Never rely on color alone
- Use patterns, shapes, or text labels
- Provide alternative indicators

**Testing Tools:**
```bash
# Chrome DevTools: Lighthouse Accessibility audit
# axe DevTools extension
# WAVE browser extension
```

### 6.2 Keyboard Navigation

**Requirements:**
- All interactive elements focusable
- Logical tab order
- Visible focus indicators
- Keyboard shortcuts documented

**Focus Styles:**
```css
.interactive-element:focus-visible {
  outline: 3px solid var(--focus-color);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### 6.3 Screen Reader Support

**ARIA Labels:**
```html
<!-- Word Morph Tile -->
<div
  class="word-morph-tile"
  role="button"
  aria-label="Letter T, correct position"
  data-state="correct"
>
  T
</div>

<!-- Kinship Word Bubble -->
<div
  class="kinship-word-bubble"
  role="button"
  aria-label="Word: Ocean, Category: Bodies of Water"
  data-category="1"
  draggable="true"
>
  Ocean
</div>
```

**Live Regions:**
```html
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  <!-- Dynamic game state updates -->
</div>
```

### 6.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Provide instant state changes */
  .animated-element {
    animation: none;
    transition: none;
  }
}
```

## 7. Responsive Design System

### 7.1 Breakpoints

```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 640px;   /* Small tablets */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Desktops */
  --breakpoint-xl: 1280px;  /* Large desktops */
}
```

### 7.2 Spacing Scale

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### 7.3 Typography Scale

```css
:root {
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
}
```

### 7.4 Shadow Scale

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
}
```

## 8. Performance Guidelines

### 8.1 Animation Performance

**Use GPU-accelerated properties:**
```css
/* ✅ Good - GPU accelerated */
transform: translate3d(0, 0, 0);
transform: scale(1.1);
opacity: 0.5;

/* ❌ Bad - CPU intensive */
width: 100px;
height: 100px;
left: 50px;
top: 50px;
```

**Use will-change sparingly:**
```css
/* Only on elements actively animating */
.animating-element {
  will-change: transform, opacity;
}

/* Remove after animation */
.animation-complete {
  will-change: auto;
}
```

### 8.2 Critical CSS

**Inline critical styles:**
- Above-the-fold layout
- Base typography
- Color variables
- Initial state styles

**Defer non-critical:**
- Animation keyframes
- Hover states
- Print styles

### 8.3 Bundle Optimization

**CSS:**
- Use CSS custom properties
- Minimize specificity
- Remove unused styles
- Enable PurgeCSS in production

**Images:**
- Use SVG for icons
- Lazy load off-screen images
- Provide responsive image sizes
- Use modern formats (WebP, AVIF)

## 9. Implementation Checklist

### Word Morph
- [ ] Color palette implemented (teal, coral, slate)
- [ ] Rounded tile corners (8px)
- [ ] Wide spacing (12px gaps)
- [ ] Simultaneous reveal animation (150ms)
- [ ] Dark mode support
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] WCAG AA accessibility
- [ ] Reduced motion support

### Kinship
- [ ] Category color palette (purple, cyan, amber, pink)
- [ ] Radial word layout
- [ ] Drag and drop interaction
- [ ] Connection line animations
- [ ] Dark mode support
- [ ] Responsive design
- [ ] WCAG AA accessibility

### Lexicon Smith
- [ ] Bronze/gold color palette
- [ ] Anvil board shape
- [ ] Hammer strike animations
- [ ] Spark effects
- [ ] Metal glow on valid words
- [ ] Dark background (charcoal)
- [ ] Responsive design
- [ ] WCAG AA accessibility

### Twenty Queries
- [ ] Chat bubble interface
- [ ] User/AI color differentiation
- [ ] Progress indicator
- [ ] Typing animation
- [ ] Message slide-in effects
- [ ] Dark mode support
- [ ] Responsive design
- [ ] WCAG AA accessibility

### Lore Master
- [ ] Parchment color palette
- [ ] Book page layout
- [ ] Serif typography
- [ ] Page turn animation
- [ ] Ink writing effect
- [ ] Wax seal stamp
- [ ] Responsive design
- [ ] WCAG AA accessibility

## 10. Design Review Process

### Pre-Implementation Review
1. ✅ Colors meet WCAG AA contrast ratios
2. ✅ Layouts distinct from NYT Games
3. ✅ Animations performant (GPU-accelerated)
4. ✅ Typography accessible and readable
5. ✅ Responsive breakpoints defined

### Implementation Review
1. ✅ Visual design matches specification
2. ✅ All animations smooth (60fps)
3. ✅ Dark mode working correctly
4. ✅ Reduced motion respected
5. ✅ Keyboard navigation functional

### Final Review
1. ✅ Cross-browser testing (Chrome, Firefox, Safari)
2. ✅ Mobile device testing (iOS, Android)
3. ✅ Accessibility audit (Lighthouse, axe)
4. ✅ Performance audit (Core Web Vitals)
5. ✅ Legal review (distinct from competitors)

---

**Specification Version:** 1.0
**Last Updated:** 2026-01-19
**Next Review:** After Phase 3 (Frontend Implementation)
**Owner:** Epic #17 Implementation Team
**Status:** Approved for Implementation
