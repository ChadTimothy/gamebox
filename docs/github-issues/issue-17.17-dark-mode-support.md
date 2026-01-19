# Issue #17.17: Add Dark Mode Support

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** Apps SDK Compliance
**Duration:** 2-3 hours
**Priority:** CRITICAL (Blocks App Store Submission)
**Dependencies:** #17.9

## Description

Implement dark mode support for Word Morph widget to comply with OpenAI Apps SDK requirements. All ChatGPT apps must support both light and dark themes to pass App Store review.

## Problem Statement

**Current State:**
- Widget only supports light mode
- Fixed hex color values don't adapt to theme
- Will be rejected from App Store without dark mode

**Required State:**
- Automatic theme detection
- Colors adapt to light/dark mode
- Uses Apps SDK design tokens
- Seamless transition between themes

## Objectives

- Install and integrate `@openai/apps-sdk-ui` design system
- Replace fixed colors with theme-aware tokens
- Support both light and dark modes automatically
- Test theme switching without visual breakage
- Ensure WCAG AA contrast in both modes

## Implementation Steps

### 1. Install Apps SDK UI

```bash
cd web
npm install @openai/apps-sdk-ui
```

### 2. Wrap App with Provider

**File:** `/web/src/main.tsx`

```tsx
import { AppsSDKUIProvider } from '@openai/apps-sdk-ui';
import '@openai/apps-sdk-ui/dist/index.css';
import { WordMorph } from './widgets/WordMorph';

function App() {
  return (
    <AppsSDKUIProvider>
      <WordMorph />
    </AppsSDKUIProvider>
  );
}

export default App;
```

### 3. Update Color System

**File:** `/web/src/styles/globals.css`

**Before (Fixed Colors):**
```css
:root {
  --word-morph-correct: #14B8A6;  /* Teal */
  --word-morph-present: #F97316;  /* Coral */
  --word-morph-absent: #64748B;   /* Slate */
  --word-morph-background: #F8FAFC;
  --word-morph-text: #1E293B;
}
```

**After (Theme Tokens):**
```css
/* Import Apps SDK UI tokens */
@import '@openai/apps-sdk-ui/dist/index.css';

:root {
  /* Use semantic tokens that auto-adapt */
  --word-morph-correct: var(--token-success-500);
  --word-morph-present: var(--token-warning-500);
  --word-morph-absent: var(--token-gray-500);
  --word-morph-background: var(--token-background-primary);
  --word-morph-text: var(--token-text-primary);
  --word-morph-border: var(--token-border-primary);
}

/* Tile states */
.word-morph-tile--correct {
  background-color: var(--word-morph-correct);
  color: var(--token-text-on-color);
}

.word-morph-tile--present {
  background-color: var(--word-morph-present);
  color: var(--token-text-on-color);
}

.word-morph-tile--absent {
  background-color: var(--word-morph-absent);
  color: var(--token-text-on-color);
}

/* Tiles adjust automatically in dark mode */
.word-morph-tile {
  background-color: var(--word-morph-background);
  border-color: var(--word-morph-border);
  color: var(--word-morph-text);
}
```

### 4. Access Theme in Widget

**File:** `/web/src/widgets/WordMorph.tsx`

```tsx
import { useTheme } from '@openai/apps-sdk-ui';

function WordMorph() {
  const { theme } = useTheme(); // 'light' or 'dark'

  // Can use for theme-specific logic if needed
  console.log('Current theme:', theme);

  return (
    <div className="word-morph-container" data-theme={theme}>
      {/* Widget content */}
    </div>
  );
}
```

### 5. Alternative: Detect from window.openai

If not using full Apps SDK UI:

```typescript
function WordMorph() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Detect theme from ChatGPT host
    const chatGPTTheme = window.openai?.theme || 'light';
    setTheme(chatGPTTheme);

    // Listen for theme changes
    const handleThemeChange = (event: CustomEvent) => {
      setTheme(event.detail.theme);
    };

    window.addEventListener('themechange', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('themechange', handleThemeChange as EventListener);
    };
  }, []);

  return (
    <div className="word-morph-container" data-theme={theme}>
      {/* Widget content */}
    </div>
  );
}
```

### 6. Update Keyboard Colors

```css
/* Keyboard adapts to theme */
.word-morph-keyboard {
  background-color: var(--token-background-secondary);
}

.word-morph-key {
  background-color: var(--token-background-tertiary);
  color: var(--token-text-primary);
  border-color: var(--token-border-secondary);
}

.word-morph-key:hover {
  background-color: var(--token-background-hover);
}

.word-morph-key:active {
  background-color: var(--token-background-pressed);
}

/* Key states (used letters) */
.word-morph-key--correct {
  background-color: var(--word-morph-correct);
  color: var(--token-text-on-color);
}

.word-morph-key--present {
  background-color: var(--word-morph-present);
  color: var(--token-text-on-color);
}

.word-morph-key--absent {
  background-color: var(--word-morph-absent);
  color: var(--token-text-on-color);
}
```

## Testing Requirements

### Visual Testing

**Light Mode:**
```bash
npm run dev
# Open in browser
# Verify colors look good in light mode
```

**Dark Mode:**
```bash
# Method 1: Use browser DevTools
# - Open DevTools
# - Command+Shift+P (Mac) or Ctrl+Shift+P (Windows)
# - Type "Emulate CSS prefers-color-scheme: dark"

# Method 2: Change OS theme
# - Switch OS to dark mode
# - Refresh widget
```

**Verify:**
- [ ] All tiles visible in both modes
- [ ] Text is readable (good contrast)
- [ ] Keyboard keys visible
- [ ] No pure white/black colors (use tokens)
- [ ] Animations work in both themes
- [ ] No visual breakage on theme switch

### Contrast Testing

**Use browser contrast checker:**
```javascript
// In DevTools console
const correctTile = document.querySelector('.word-morph-tile--correct');
const bgColor = getComputedStyle(correctTile).backgroundColor;
const textColor = getComputedStyle(correctTile).color;

// Check contrast ratio (should be >= 4.5:1)
console.log('Background:', bgColor);
console.log('Text:', textColor);
```

**Or use online tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools Accessibility panel

**Required Ratios:**
- Normal text: >= 4.5:1
- Large text: >= 3:1
- UI components: >= 3:1

### E2E Testing

**Update screenshot tests:**
```typescript
// In e2e/word-morph.spec.ts
test.describe('Dark Mode', () => {
  test('should render correctly in dark mode', async ({ page }) => {
    // Set dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto('/widget/word-morph');

    // Take screenshot
    await expect(page).toHaveScreenshot('word-morph-dark.png');
  });

  test('should have good contrast in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/widget/word-morph');

    // Check contrast (manual or automated)
    const tile = page.locator('.word-morph-tile--correct').first();
    const bgColor = await tile.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Verify it's dark mode color (not light mode)
    expect(bgColor).not.toBe('rgb(20, 184, 166)'); // Not light teal
  });
});
```

## Available Apps SDK UI Tokens

**Common Tokens:**
```css
/* Backgrounds */
--token-background-primary
--token-background-secondary
--token-background-tertiary
--token-background-hover
--token-background-pressed
--token-background-overlay

/* Text */
--token-text-primary
--token-text-secondary
--token-text-tertiary
--token-text-on-color
--token-text-inverse

/* Borders */
--token-border-primary
--token-border-secondary
--token-border-focus

/* Semantic Colors */
--token-success-500  /* For correct tiles */
--token-warning-500  /* For present tiles */
--token-error-500    /* For errors */
--token-gray-500     /* For absent tiles */

/* Interactive */
--token-interactive-primary
--token-interactive-hover
--token-interactive-pressed
```

## Acceptance Criteria

- [ ] Apps SDK UI installed and configured
- [ ] App wrapped with `AppsSDKUIProvider`
- [ ] All color values use theme tokens (no hardcoded hex)
- [ ] Widget renders correctly in light mode
- [ ] Widget renders correctly in dark mode
- [ ] Theme switches automatically with ChatGPT
- [ ] WCAG AA contrast ratios met in both modes
- [ ] No visual breakage or missing elements
- [ ] Screenshot tests updated for dark mode
- [ ] Documentation updated

## Breaking Changes

**None** - This is an enhancement, not a breaking change.

**User Impact:**
- ✅ Better experience in dark mode
- ✅ Consistent with ChatGPT theme
- ✅ Reduced eye strain for dark mode users

## Documentation Updates

**Files to update:**
- `/web/README.md` - Add dark mode section
- `/docs/DESIGN_REQUIREMENTS.md` - Mark dark mode as complete
- `/docs/VISUAL_DESIGN_SPEC.md` - Add dark mode color palette

## Resources

- [Apps SDK UI Documentation](https://openai.github.io/apps-sdk-ui/)
- [Apps SDK UI GitHub](https://github.com/openai/apps-sdk-ui)
- [Design Tokens Reference](https://openai.github.io/apps-sdk-ui/?path=/docs/tokens--docs)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

## Success Metrics

- [ ] Widget passes Apps SDK design review
- [ ] No contrast violations in either mode
- [ ] Theme detection works 100% of time
- [ ] Zero visual bugs reported
- [ ] App Store submission approved

## Related Tasks

- **Depends on:** #17.9 (Frontend visual design must be implemented)
- **Blocks:** App Store submission
- **Related:** #17.3 (Visual design spec)

## Labels

- `critical`
- `apps-sdk-compliance`
- `dark-mode`
- `design-system`
- `epic-17`
- `app-store-required`
