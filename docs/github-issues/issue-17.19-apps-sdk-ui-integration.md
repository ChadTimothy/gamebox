# Issue #17.19: Integrate Apps SDK UI Design System

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** Apps SDK Compliance
**Duration:** 4-6 hours
**Priority:** HIGH (Strongly Recommended for App Store)
**Dependencies:** #17.17

## Description

Integrate the official `@openai/apps-sdk-ui` design system to ensure Word Morph feels native to ChatGPT, uses accessible components, and follows OpenAI's design guidelines. This significantly improves App Store approval chances.

## Problem Statement

**Current State:**
- Custom components and styling
- Manual accessibility implementation
- Potential inconsistencies with ChatGPT design
- Higher review risk

**With Apps SDK UI:**
- Pre-built accessible components
- Automatic ChatGPT design consistency
- Faster development
- Better App Store approval chances
- Professional polish

## Objectives

- Replace custom components with Apps SDK UI components
- Use design system typography and spacing
- Implement consistent interaction patterns
- Ensure accessibility out-of-the-box
- Maintain Word Morph's unique game feel

## Apps SDK UI Components

### Available Components

**Layout:**
- `Card` - Container for content
- `Stack` - Vertical/horizontal layout
- `Grid` - Grid layout
- `Divider` - Visual separator

**Typography:**
- `Heading` - Headings (h1-h6)
- `Text` - Body text
- `Caption` - Small text

**Interactive:**
- `Button` - Primary/secondary buttons
- `IconButton` - Icon-only buttons
- `Input` - Text inputs
- `Select` - Dropdowns
- `Checkbox` - Checkboxes
- `RadioGroup` - Radio buttons

**Feedback:**
- `Alert` - Messages and notifications
- `Badge` - Status indicators
- `Spinner` - Loading states
- `Toast` - Temporary notifications

**Utility:**
- `Portal` - Render outside DOM hierarchy
- `VisuallyHidden` - Screen reader only content

## Implementation Plan

### Phase 1: Replace Layout Components

#### 1.1 Main Container

**Before:**
```tsx
<div className="word-morph-container">
  <h1 className="word-morph-title">Word Morph</h1>
  {/* ... */}
</div>
```

**After:**
```tsx
import { Card, Heading, Stack } from '@openai/apps-sdk-ui';

<Card padding="md">
  <Stack spacing="lg">
    <Heading size="xl">Word Morph</Heading>
    {/* ... */}
  </Stack>
</Card>
```

#### 1.2 Game Stats Header

**Before:**
```tsx
<div className="word-morph-header">
  <div className="streak">🔥 Streak: {streak}</div>
  <div className="guesses">Guess {current} of {max}</div>
</div>
```

**After:**
```tsx
import { Stack, Text, Badge } from '@openai/apps-sdk-ui';

<Stack direction="horizontal" spacing="md" justify="between">
  <Stack direction="horizontal" spacing="sm" align="center">
    <Text>🔥</Text>
    <Badge variant="success">{streak} day streak</Badge>
  </Stack>
  <Text size="sm" color="secondary">
    Guess {current} of {max}
  </Text>
</Stack>
```

### Phase 2: Replace Interactive Components

#### 2.1 New Game Button

**Before:**
```tsx
<button className="word-morph-new-game" onClick={handleNewGame}>
  New Game
</button>
```

**After:**
```tsx
import { Button } from '@openai/apps-sdk-ui';

<Button
  variant="primary"
  size="md"
  onClick={handleNewGame}
>
  New Game
</Button>
```

#### 2.2 Clue Button

**Before:**
```tsx
<button
  className="word-morph-clue-button"
  onClick={handleGetClue}
  disabled={cluesRemaining === 0 || isLoading}
>
  {isLoading ? 'Generating...' : `Get Clue (${cluesRemaining} left)`}
</button>
```

**After:**
```tsx
import { Button, Spinner } from '@openai/apps-sdk-ui';

<Button
  variant="secondary"
  size="sm"
  onClick={handleGetClue}
  disabled={cluesRemaining === 0 || isLoading}
  leftIcon={isLoading ? <Spinner size="sm" /> : '🔍'}
>
  {isLoading ? 'Generating...' : `Get Clue (${cluesRemaining} left)`}
</Button>
```

### Phase 3: Typography and Spacing

#### 3.1 Use Design Tokens

**Before:**
```css
.word-morph-title {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 20px;
}
```

**After:**
```tsx
<Heading size="xl" marginBottom="lg">
  Word Morph
</Heading>
```

#### 3.2 Consistent Spacing

**Use Stack instead of manual margins:**

```tsx
<Stack spacing="md">
  <Heading>Word Morph</Heading>
  <GameGrid />
  <Keyboard />
  <Stack direction="horizontal" spacing="sm">
    <Button>New Game</Button>
    <Button variant="secondary">Get Clue</Button>
  </Stack>
</Stack>
```

### Phase 4: Game-Specific Components

**Keep Custom Components for Game Logic:**

The game grid and keyboard should remain custom since they have unique requirements. Style them using Apps SDK design tokens:

#### 4.1 Game Grid (Custom)

```tsx
// Keep custom grid but use design tokens
import { useTheme } from '@openai/apps-sdk-ui';

function GameGrid() {
  const { tokens } = useTheme();

  return (
    <div
      className="word-morph-grid"
      style={{
        gap: tokens.spacing.md,
        padding: tokens.spacing.lg
      }}
    >
      {/* Custom tile rendering */}
    </div>
  );
}
```

#### 4.2 Keyboard (Custom)

```tsx
function Keyboard() {
  const { tokens } = useTheme();

  return (
    <div className="word-morph-keyboard">
      {keys.map(key => (
        <button
          key={key}
          className="word-morph-key"
          style={{
            borderRadius: tokens.borderRadius.md,
            padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
            backgroundColor: tokens.colors.background.tertiary
          }}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
```

### Phase 5: Feedback Components

#### 5.1 Game Status Messages

**Before:**
```tsx
{gameStatus === 'won' && (
  <div className="word-morph-message success">
    🎉 You won!
  </div>
)}

{gameStatus === 'lost' && (
  <div className="word-morph-message error">
    Better luck next time!
  </div>
)}
```

**After:**
```tsx
import { Alert } from '@openai/apps-sdk-ui';

{gameStatus === 'won' && (
  <Alert variant="success" icon="🎉">
    You won! The word was {targetWord}.
  </Alert>
)}

{gameStatus === 'lost' && (
  <Alert variant="neutral" icon="💭">
    Better luck next time! The word was {targetWord}.
  </Alert>
)}
```

#### 5.2 Loading States

**Before:**
```tsx
{isLoading && <div className="loading">Loading...</div>}
```

**After:**
```tsx
import { Spinner, Stack, Text } from '@openai/apps-sdk-ui';

{isLoading && (
  <Stack direction="horizontal" spacing="sm" align="center">
    <Spinner size="sm" />
    <Text size="sm" color="secondary">Loading...</Text>
  </Stack>
)}
```

## Component Mapping

### Complete Replacement Guide

| Custom | Apps SDK UI | Notes |
|--------|-------------|-------|
| `<div className="container">` | `<Card>` | Main container |
| `<h1>` | `<Heading size="xl">` | Page titles |
| `<h2>` | `<Heading size="lg">` | Section titles |
| `<p>` | `<Text>` | Body text |
| `<span className="small">` | `<Text size="sm">` | Small text |
| `<button>` | `<Button>` | Primary actions |
| `<div className="flex">` | `<Stack direction="horizontal">` | Flexbox layouts |
| `<div className="grid">` | `<Grid>` | Grid layouts |
| Custom margin/padding | Use `margin*` / `padding*` props | Consistent spacing |
| Custom loading | `<Spinner>` | Loading states |
| Custom messages | `<Alert>` | Status messages |
| Custom badges | `<Badge>` | Counts, status |

## Files to Update

### 1. Main Widget Component

**File:** `/web/src/widgets/WordMorph.tsx`

- Import Apps SDK UI components
- Replace layout divs with Card/Stack
- Replace buttons with Button component
- Replace headings with Heading component
- Use design tokens for custom components

### 2. Styles

**File:** `/web/src/styles/globals.css`

- Remove custom component styles that are now handled by Apps SDK
- Keep game-specific styles (grid, tiles, keyboard)
- Use Apps SDK design tokens for custom styles

### 3. Component Tests

**File:** `/web/src/widgets/WordMorph.test.tsx`

- Update test queries for Apps SDK components
- Test accessibility (built-in to components)
- Verify proper component rendering

## Benefits

### For Development

- ✅ Faster component development
- ✅ Less custom CSS to maintain
- ✅ Built-in accessibility
- ✅ Consistent design patterns
- ✅ TypeScript support

### For Users

- ✅ Familiar ChatGPT design
- ✅ Better accessibility
- ✅ Consistent interactions
- ✅ Professional polish
- ✅ Dark mode support

### For App Store

- ✅ Higher approval chances
- ✅ Meets design guidelines
- ✅ Professional appearance
- ✅ Accessibility compliance
- ✅ Native ChatGPT feel

## Testing Requirements

### Visual Regression

```bash
# Take screenshots before/after
npm run test:e2e -- --update-snapshots
```

**Verify:**
- [ ] Layout looks good
- [ ] Spacing is consistent
- [ ] Typography is readable
- [ ] Buttons are clear
- [ ] Dark mode works
- [ ] No visual breakage

### Accessibility Testing

```bash
# Run axe DevTools
npm run test:a11y
```

**Should improve accessibility scores:**
- Before: ~85%
- After: ~95%+

### Component Testing

```typescript
import { render } from '@testing-library/react';
import { AppsSDKUIProvider } from '@openai/apps-sdk-ui';

function renderWithProvider(component) {
  return render(
    <AppsSDKUIProvider>
      {component}
    </AppsSDKUIProvider>
  );
}

test('renders with Apps SDK UI', () => {
  renderWithProvider(<WordMorph />);
  expect(screen.getByText('Word Morph')).toBeInTheDocument();
});
```

## Migration Strategy

**Incremental Approach:**

1. **Phase 1:** Layout only (Card, Stack, Grid)
2. **Phase 2:** Typography (Heading, Text)
3. **Phase 3:** Interactive (Button)
4. **Phase 4:** Feedback (Alert, Spinner)
5. **Phase 5:** Polish and refinement

**Each phase:**
- Update components
- Update tests
- Visual review
- Commit

## Acceptance Criteria

- [ ] Apps SDK UI components imported
- [ ] Layout uses Card/Stack/Grid
- [ ] Typography uses Heading/Text
- [ ] Buttons use Button component
- [ ] Alerts use Alert component
- [ ] Loading uses Spinner component
- [ ] Design tokens used for custom components
- [ ] Game grid remains custom (styled with tokens)
- [ ] Keyboard remains custom (styled with tokens)
- [ ] Tests updated and passing
- [ ] Visual review complete
- [ ] Accessibility improved
- [ ] Dark mode works
- [ ] No layout breakage

## Documentation

- [Apps SDK UI Documentation](https://openai.github.io/apps-sdk-ui/)
- [Component Storybook](https://openai.github.io/apps-sdk-ui/?path=/docs/components--docs)
- [Design Tokens](https://openai.github.io/apps-sdk-ui/?path=/docs/tokens--docs)
- [Migration Guide](https://github.com/openai/apps-sdk-ui/blob/main/MIGRATION.md)

## Related Tasks

- **Depends on:** #17.17 (Dark mode - Apps SDK UI provides this)
- **Enhances:** All UI tasks in Epic #17
- **Improves:** App Store submission chances

## Labels

- `high-priority`
- `apps-sdk-compliance`
- `design-system`
- `ui-polish`
- `epic-17`
- `app-store-recommended`
