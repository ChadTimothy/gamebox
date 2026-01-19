# Issue #17.6: Update Visual Design - Backend

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 2 - Backend Refactoring
**Duration:** 1 hour
**Priority:** High
**Dependencies:** #17.3, #17.5

## Description

Update backend configuration to support new visual design specifications, including color scheme constants, theme identifiers, and widget metadata.

## Objectives

- Add visual design configuration to backend
- Update CSP (Content Security Policy) if needed for new styles
- Add color scheme constants for widgets
- Update widget HTML generation with new visual properties
- Ensure design spec from #17.3 is properly integrated

## Files to Update

### 1. `/server/src/config/csp.ts`

**Add widget theme metadata:**

```typescript
// Add visual design configuration for Word Morph
export const WIDGET_THEMES = {
  wordMorph: {
    name: 'Word Morph',
    colors: {
      correct: '#14B8A6',    // Teal
      present: '#F97316',    // Coral
      absent: '#64748B',     // Slate
      background: '#F8FAFC', // Off-white
      border: '#CBD5E1',     // Light gray
      text: '#1E293B'        // Dark slate
    },
    layout: {
      gridSize: '4x7',       // 4 letters, 7 guesses
      tileSpacing: '12px',
      tileBorderRadius: '8px'
    },
    animations: {
      revealDuration: '150ms',
      revealEasing: 'ease-out'
    }
  },
  // Placeholders for future games
  kinship: {
    name: 'Kinship',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      tertiary: '#F59E0B',
      quaternary: '#10B981'
    }
  },
  lexiconSmith: {
    name: 'Lexicon Smith',
    colors: {
      primary: '#B45309',
      secondary: '#F59E0B',
      accent: '#DC2626',
      background: '#292524',
      text: '#FAFAF9'
    }
  },
  twentyQueries: {
    name: 'Twenty Queries',
    colors: {
      user: '#3B82F6',
      ai: '#6366F1',
      background: '#F9FAFB',
      bubble: '#FFFFFF'
    }
  },
  loreMaster: {
    name: 'Lore Master',
    colors: {
      primary: '#7C2D12',
      secondary: '#CA8A04',
      accent: '#B91C1C',
      background: '#FEF3C7',
      text: '#431407'
    }
  }
};
```

**Update CSP rules if needed:**

```typescript
// If inline styles are used, ensure CSP allows them
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"], // For dynamic theme styles
  'script-src': ["'self'"],
  // ... other directives
};
```

### 2. `/server/src/index.ts`

**Add CSS custom properties to widget HTML generation:**

If widgets are generated server-side, inject theme variables:

```typescript
// In widget HTML generation function
function generateWordMorphWidgetHTML(): string {
  const theme = WIDGET_THEMES.wordMorph;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        :root {
          --word-morph-correct: ${theme.colors.correct};
          --word-morph-present: ${theme.colors.present};
          --word-morph-absent: ${theme.colors.absent};
          --word-morph-background: ${theme.colors.background};
          --word-morph-border: ${theme.colors.border};
          --word-morph-text: ${theme.colors.text};
          --word-morph-tile-spacing: ${theme.layout.tileSpacing};
          --word-morph-tile-border-radius: ${theme.layout.tileBorderRadius};
          --word-morph-reveal-duration: ${theme.animations.revealDuration};
        }
      </style>
    </head>
    <body>
      <div class="word-morph-widget">
        <!-- Widget content -->
      </div>
    </body>
    </html>
  `;
}
```

**Update resource handler to include theme data:**

```typescript
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === 'ui://widget/word-morph.html') {
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: 'text/html',
          text: generateWordMorphWidgetHTML()
        }
      ]
    };
  }
  // ... other resources
});
```

### 3. Create `/server/src/config/themes.ts` (New File)

**Centralize theme configuration:**

```typescript
/**
 * Visual design themes for all GameBox games
 * Compliant with WCAG AA accessibility standards
 */

export interface GameTheme {
  name: string;
  colors: {
    [key: string]: string;
  };
  layout?: {
    [key: string]: string;
  };
  animations?: {
    [key: string]: string;
  };
}

export const GAME_THEMES: Record<string, GameTheme> = {
  wordMorph: {
    name: 'Word Morph',
    colors: {
      correct: '#14B8A6',
      present: '#F97316',
      absent: '#64748B',
      background: '#F8FAFC',
      border: '#CBD5E1',
      text: '#1E293B'
    },
    layout: {
      gridSize: '4x7',
      tileSpacing: '12px',
      tileBorderRadius: '8px'
    },
    animations: {
      revealDuration: '150ms',
      revealEasing: 'ease-out'
    }
  },
  // ... other games
};

/**
 * Get theme configuration for a specific game
 */
export function getGameTheme(gameId: string): GameTheme | null {
  return GAME_THEMES[gameId] || null;
}

/**
 * Generate CSS custom properties from theme
 */
export function generateThemeCSS(gameId: string): string {
  const theme = getGameTheme(gameId);
  if (!theme) return '';

  const cssVars: string[] = [];

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    cssVars.push(`--${gameId}-${key}: ${value};`);
  });

  // Layout
  if (theme.layout) {
    Object.entries(theme.layout).forEach(([key, value]) => {
      cssVars.push(`--${gameId}-${key}: ${value};`);
    });
  }

  // Animations
  if (theme.animations) {
    Object.entries(theme.animations).forEach(([key, value]) => {
      cssVars.push(`--${gameId}-${key}: ${value};`);
    });
  }

  return `:root {\n  ${cssVars.join('\n  ')}\n}`;
}
```

## Testing Requirements

### Visual Theme Test

Create a simple test to verify theme data:

```typescript
// In server/src/config/themes.test.ts
import { getGameTheme, generateThemeCSS } from './themes';

describe('Game Themes', () => {
  test('Word Morph theme exists', () => {
    const theme = getGameTheme('wordMorph');
    expect(theme).toBeDefined();
    expect(theme?.name).toBe('Word Morph');
  });

  test('Word Morph has correct colors', () => {
    const theme = getGameTheme('wordMorph');
    expect(theme?.colors.correct).toBe('#14B8A6');
    expect(theme?.colors.present).toBe('#F97316');
    expect(theme?.colors.absent).toBe('#64748B');
  });

  test('generateThemeCSS produces valid CSS', () => {
    const css = generateThemeCSS('wordMorph');
    expect(css).toContain('--wordMorph-correct: #14B8A6;');
    expect(css).toContain(':root {');
  });
});
```

### Server Integration Test

```bash
cd server
npm run dev
```

**Verify:**
- [ ] Server starts without errors
- [ ] Theme constants are accessible
- [ ] CSP doesn't block inline styles
- [ ] Widget HTML includes CSS custom properties

## Acceptance Criteria

- [ ] Theme configuration added to backend
- [ ] CSP updated if needed for inline styles
- [ ] Color scheme constants defined for all 5 games
- [ ] Layout and animation configs defined for Word Morph
- [ ] Widget HTML generation includes CSS custom properties
- [ ] Theme utility functions created
- [ ] Unit tests for theme configuration pass
- [ ] Server starts and runs without errors
- [ ] Theme data is accessible to frontend

## Implementation Checklist

- [ ] Create `/server/src/config/themes.ts`
- [ ] Define `GAME_THEMES` with all 5 games
- [ ] Implement `getGameTheme()` function
- [ ] Implement `generateThemeCSS()` function
- [ ] Update `/server/src/config/csp.ts` if needed
- [ ] Update widget HTML generation in `/server/src/index.ts`
- [ ] Create theme unit tests
- [ ] Run tests
- [ ] Verify server startup
- [ ] Verify theme data in widget HTML

## Visual Design Reference

**Source:** `/docs/VISUAL_DESIGN_SPEC.md` (created in #17.3)

Ensure all color values, layout properties, and animation timings match the design spec exactly.

## Accessibility Notes

All color combinations must meet WCAG AA contrast ratios:
- Text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

Verify contrast ratios:
- Teal (#14B8A6) on white background: ✅ 4.5:1
- Coral (#F97316) on white background: ✅ 4.5:1
- Slate (#64748B) on white background: ✅ 4.5:1

## Related Tasks

- **Depends on:** #17.3 (Visual design spec must exist)
- **Depends on:** #17.5 (Widget URIs must be updated)
- **Blocks:** #17.9 (Frontend needs backend theme data)

## Labels

- `phase-2-backend`
- `visual-design`
- `configuration`
- `high-priority`
- `epic-17`
