# Testing Guide for OpenAI Apps SDK Applications

**GameBox Pre-Submission Testing & Validation Strategy**

This guide outlines comprehensive testing approaches for OpenAI Apps SDK applications, with a focus on agent-based testing and automated validation before submission to the ChatGPT App Directory.

---

## Table of Contents

- [Overview](#overview)
- [Testing Requirements](#testing-requirements)
- [Testing Pyramid](#testing-pyramid)
- [1. Unit Testing](#1-unit-testing)
- [2. MCP Server Testing](#2-mcp-server-testing)
- [3. Integration Testing](#3-integration-testing)
- [4. Playwright Widget Testing](#4-playwright-widget-testing)
- [5. Agent-Based E2E Testing](#5-agent-based-e2e-testing)
- [6. ChatGPT Integration Testing](#6-chatgpt-integration-testing)
- [7. Pre-Submission Validation](#7-pre-submission-validation)
- [Automated Testing Pipeline](#automated-testing-pipeline)
- [Testing Tools](#testing-tools)
- [Best Practices](#best-practices)
- [Common Issues](#common-issues)

---

## Overview

OpenAI requires apps to be "thoroughly tested to ensure stability, responsiveness, and low latency across a wide range of scenarios." Apps should not crash, hang, or show inconsistent behavior.

### Core Testing Areas

According to OpenAI's testing documentation, focus on three critical areas:

1. **Tool Correctness** - Verify tool functions work with representative inputs
2. **Component UX** - Ensure widgets render properly and maintain state
3. **Discovery Precision** - Validate tools trigger on correct prompts and avoid false positives

---

## Testing Requirements

### Pre-Submission Standards

Before submission, your app must pass:

✅ **Stability Testing** - No crashes, hangs, or inconsistent behavior
✅ **Performance Testing** - Low latency and responsiveness
✅ **Completeness** - Fully functional (no trial/demo versions)
✅ **Authentication** - Valid flows with meaningful error messages
✅ **Accuracy** - Correct results with proper error handling
✅ **Documentation** - Clear tool descriptions and annotations

### Quality Gates

| Category | Requirement | Validation Method |
|----------|-------------|-------------------|
| Tool Schema | All tools have accurate descriptions | Schema validation |
| Error Handling | Clear error messages for all failure modes | Unit tests |
| Authentication | Demo account works, OAuth flows tested | Integration tests |
| Widget Rendering | No errors, state preserved | Component tests |
| Discovery | Correct tool selection on golden prompts | Agent testing |
| Mobile | Works on iOS and Android | Manual testing |

---

## Testing Pyramid

```
                    /\
                   /  \
                  / E2E \ ←── Agent-based ChatGPT testing
                 /______\
                /        \
               /Integration\ ←── MCP server + widget integration
              /____________\
             /              \
            /   Unit Tests   \ ←── Tool handlers, game logic, components
           /________________\
```

**Distribution**: 70% Unit, 20% Integration, 10% E2E

---

## 1. Unit Testing

### Tool Handler Testing

Test each MCP tool function directly with representative inputs.

**File**: `server/src/__tests__/tools/wordChallenge.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { startWordChallenge, submitGuess } from '../../tools/wordChallenge';

describe('Word Challenge Tool', () => {
  describe('startWordChallenge', () => {
    it('should create new daily challenge', async () => {
      const result = await startWordChallenge({ mode: 'daily' });

      expect(result).toMatchObject({
        gameId: expect.any(String),
        mode: 'daily',
        targetWord: expect.stringMatching(/^[A-Z]{5}$/),
        guesses: [],
        maxGuesses: 6,
        isComplete: false
      });
    });

    it('should handle invalid mode gracefully', async () => {
      await expect(
        startWordChallenge({ mode: 'invalid' as any })
      ).rejects.toThrow('Invalid game mode');
    });

    it('should return same daily puzzle for all users', async () => {
      const result1 = await startWordChallenge({ mode: 'daily' });
      const result2 = await startWordChallenge({ mode: 'daily' });

      expect(result1.targetWord).toBe(result2.targetWord);
    });
  });

  describe('submitGuess', () => {
    let gameId: string;

    beforeEach(async () => {
      const game = await startWordChallenge({ mode: 'practice' });
      gameId = game.gameId;
    });

    it('should validate guess length', async () => {
      await expect(
        submitGuess({ gameId, guess: 'CAT' })
      ).rejects.toThrow('Guess must be exactly 5 letters');
    });

    it('should validate guess is a real word', async () => {
      await expect(
        submitGuess({ gameId, guess: 'ZZZZZ' })
      ).rejects.toThrow('Not a valid word');
    });

    it('should return correct feedback', async () => {
      const result = await submitGuess({
        gameId,
        guess: 'CRANE'
      });

      expect(result.feedback).toHaveLength(5);
      expect(result.feedback).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            letter: expect.any(String),
            status: expect.stringMatching(/^(correct|present|absent)$/)
          })
        ])
      );
    });

    it('should detect win condition', async () => {
      // Mock or seed the target word for deterministic testing
      const result = await submitGuess({
        gameId,
        guess: 'CRANE' // Assuming this is the target
      });

      if (result.isWin) {
        expect(result.isComplete).toBe(true);
        expect(result.feedback.every(f => f.status === 'correct')).toBe(true);
      }
    });

    it('should handle game over after max guesses', async () => {
      // Submit 6 wrong guesses
      for (let i = 0; i < 6; i++) {
        await submitGuess({ gameId, guess: 'WRONG' });
      }

      await expect(
        submitGuess({ gameId, guess: 'CRANE' })
      ).rejects.toThrow('Game is already complete');
    });
  });
});
```

### Game Logic Testing

**File**: `server/src/__tests__/games/spellingBee.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  isValidWord,
  calculateScore,
  isPangram,
  getRank
} from '../../games/spellingBee';

describe('Spelling Bee Logic', () => {
  const letters = ['P', 'A', 'N', 'G', 'R', 'M', 'I'];
  const centerLetter = 'A';

  it('should reject words without center letter', () => {
    expect(isValidWord('GRIMP', letters, centerLetter)).toBe(false);
  });

  it('should reject words with invalid letters', () => {
    expect(isValidWord('PAINT', letters, centerLetter)).toBe(false);
  });

  it('should accept valid words', () => {
    expect(isValidWord('GRAM', letters, centerLetter)).toBe(true);
  });

  it('should calculate correct scores', () => {
    expect(calculateScore('GRAM')).toBe(4); // 4-letter word = 4 points
    expect(calculateScore('GRAMPS')).toBe(6); // 6-letter word = 6 points
  });

  it('should identify pangrams', () => {
    expect(isPangram('MARGINAL', letters)).toBe(false);
    expect(isPangram('MARGINING', letters)).toBe(true); // Uses all 7 letters
  });

  it('should award bonus for pangrams', () => {
    expect(calculateScore('MARGINING', true)).toBe(16); // 9 letters + 7 bonus
  });

  it('should calculate correct rank', () => {
    expect(getRank(0, 100)).toBe('Beginner');
    expect(getRank(10, 100)).toBe('Good');
    expect(getRank(50, 100)).toBe('Amazing');
    expect(getRank(100, 100)).toBe('Queen Bee');
  });
});
```

### React Component Testing

**File**: `web/src/__tests__/widgets/WordChallengeWidget.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WordChallengeWidget } from '../../widgets/WordChallengeWidget';

describe('WordChallengeWidget', () => {
  const mockGameState = {
    gameId: 'test-123',
    mode: 'daily' as const,
    guesses: [],
    maxGuesses: 6,
    isComplete: false
  };

  it('should render initial state', () => {
    render(<WordChallengeWidget gameState={mockGameState} />);

    expect(screen.getByText(/Word Challenge/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter 5-letter word/i)).toBeInTheDocument();
  });

  it('should validate guess input', async () => {
    render(<WordChallengeWidget gameState={mockGameState} />);

    const input = screen.getByPlaceholderText(/Enter 5-letter word/i);
    fireEvent.change(input, { target: { value: 'CAT' } });

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be 5 letters/i)).toBeInTheDocument();
    });
  });

  it('should display previous guesses', () => {
    const gameStateWithGuesses = {
      ...mockGameState,
      guesses: [
        { word: 'CRANE', feedback: [
          { letter: 'C', status: 'absent' },
          { letter: 'R', status: 'present' },
          { letter: 'A', status: 'correct' },
          { letter: 'N', status: 'absent' },
          { letter: 'E', status: 'absent' }
        ]}
      ]
    };

    render(<WordChallengeWidget gameState={gameStateWithGuesses} />);

    expect(screen.getByText('CRANE')).toBeInTheDocument();
  });

  it('should show win state', () => {
    const winState = {
      ...mockGameState,
      isComplete: true,
      isWin: true
    };

    render(<WordChallengeWidget gameState={winState} />);

    expect(screen.getByText(/You won!/i)).toBeInTheDocument();
  });
});
```

### Run Unit Tests

```bash
# Server tests
cd server
npm run test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Web tests
cd web
npm run test
```

---

## 2. MCP Server Testing

### Using MCP Inspector

The **MCP Inspector** is the official tool for testing MCP servers without connecting to ChatGPT.

#### Installation & Setup

```bash
# No installation needed - use npx directly
npx @modelcontextprotocol/inspector node server/dist/index.js
```

#### Testing Workflow

1. **Start Your Server**
   ```bash
   cd server
   npm run dev
   ```

2. **Launch Inspector**
   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

3. **Test Tools**
   - Navigate to the "Tools" tab
   - Select a tool (e.g., "startWordChallenge")
   - Enter test inputs:
     ```json
     {
       "mode": "daily"
     }
     ```
   - Click "Call Tool"
   - Verify the response matches expected schema

4. **Test Resources** (if applicable)
   - Navigate to "Resources" tab
   - Check available resources
   - Test resource retrieval

5. **Test Prompts** (if applicable)
   - Navigate to "Prompts" tab
   - Test prompt templates with sample arguments

6. **Monitor Logs**
   - Check "Notifications" pane for errors
   - Verify no unexpected warnings

#### Inspector Test Checklist

- [ ] All tools listed correctly
- [ ] Tool schemas validate properly
- [ ] Sample inputs return expected outputs
- [ ] Error cases return meaningful messages
- [ ] No console errors or warnings
- [ ] Performance is acceptable (< 2s for most operations)

### Using MCP Testing Framework

For automated MCP server testing, use the `@haakco/mcp-testing-framework`.

#### Installation

```bash
cd server
npm install --save-dev @haakco/mcp-testing-framework
```

#### Generate Tests

```bash
npx mcp-test generate --server dist/index.js --output src/__tests__/mcp
```

#### Configuration

**File**: `server/mcp-test.config.js`

```javascript
export default {
  server: {
    command: 'node',
    args: ['dist/index.js']
  },
  coverage: {
    enabled: true,
    threshold: {
      lines: 80,
      functions: 80,
      branches: 70
    }
  },
  performance: {
    enabled: true,
    maxResponseTime: 2000, // 2 seconds
    maxThroughput: 100 // requests per second
  },
  reporters: ['console', 'junit', 'markdown']
};
```

#### Run MCP Tests

```bash
# Run all tests
npx mcp-test run

# With coverage
npx mcp-test run --coverage

# Performance benchmarks
npx mcp-test benchmark
```

#### Custom MCP Integration Tests

**File**: `server/src/__tests__/mcp/integration.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { MCPTestClient } from '@haakco/mcp-testing-framework';

describe('MCP Server Integration', () => {
  let client: MCPTestClient;

  beforeEach(async () => {
    client = new MCPTestClient({
      command: 'node',
      args: ['dist/index.js']
    });
    await client.connect();
  });

  afterEach(async () => {
    await client.disconnect();
  });

  it('should list all tools', async () => {
    const tools = await client.listTools();

    expect(tools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'startWordChallenge' }),
        expect.objectContaining({ name: 'submitGuess' }),
        expect.objectContaining({ name: 'start20Questions' })
      ])
    );
  });

  it('should execute tool and return valid response', async () => {
    const response = await client.callTool('startWordChallenge', {
      mode: 'daily'
    });

    expect(response).toBeValidMCPResponse();
    expect(response.content).toHaveProperty('gameId');
  });

  it('should handle multi-step game flow', async () => {
    // Start game
    const startResponse = await client.callTool('startWordChallenge', {
      mode: 'practice'
    });
    const gameId = startResponse.content.gameId;

    // Submit guess
    const guessResponse = await client.callTool('submitGuess', {
      gameId,
      guess: 'CRANE'
    });

    expect(guessResponse).toBeValidMCPResponse();
    expect(guessResponse.content.feedback).toHaveLength(5);
  });

  it('should maintain performance under load', async () => {
    const startTime = Date.now();

    // Simulate 50 concurrent tool calls
    const promises = Array(50).fill(null).map(() =>
      client.callTool('startWordChallenge', { mode: 'practice' })
    );

    await Promise.all(promises);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // Should complete in 5 seconds
  });
});
```

---

## 3. Integration Testing

Test the complete flow from MCP server to widget rendering.

### Server + Widget Integration

**File**: `server/src/__tests__/integration/wordChallenge.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { Server } from 'http';
import { startWordChallenge, submitGuess } from '../../tools/wordChallenge';

describe('Word Challenge Integration', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());

    // Mount tool endpoints
    app.post('/tools/startWordChallenge', async (req, res) => {
      try {
        const result = await startWordChallenge(req.body);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    app.post('/tools/submitGuess', async (req, res) => {
      try {
        const result = await submitGuess(req.body);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    server = app.listen(0);
    const address = server.address();
    baseUrl = `http://localhost:${address.port}`;
  });

  afterAll(() => {
    server.close();
  });

  it('should complete full game flow', async () => {
    // Start game
    const startRes = await fetch(`${baseUrl}/tools/startWordChallenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'practice' })
    });
    const game = await startRes.json();

    expect(game.gameId).toBeDefined();

    // Submit valid guess
    const guessRes = await fetch(`${baseUrl}/tools/submitGuess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId: game.gameId,
        guess: 'CRANE'
      })
    });
    const guessResult = await guessRes.json();

    expect(guessResult.feedback).toHaveLength(5);
    expect(guessResult.guessesRemaining).toBe(5);
  });

  it('should handle authentication flow', async () => {
    // Test OAuth or custom auth
    // This depends on your auth implementation
  });
});
```

---

## 4. Playwright Widget Testing

Playwright provides powerful browser automation for testing React widgets in real browser environments. This is essential for validating widget rendering, user interactions, and visual behavior.

### Why Playwright for Widget Testing?

- **Real Browser Testing**: Test widgets in actual Chrome, Firefox, and Safari
- **Visual Validation**: Capture screenshots and detect visual regressions
- **User Interaction**: Simulate clicks, typing, and complex user flows
- **Network Control**: Mock API responses and test error states
- **Parallel Execution**: Run tests across multiple browsers simultaneously
- **Debugging**: Step through tests with built-in debugging tools

### Setup Playwright

**File**: `web/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4444',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4444',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Install Playwright

```bash
cd web
npm install --save-dev @playwright/test
npx playwright install
```

### Widget Rendering Tests

**File**: `web/src/__tests__/playwright/wordChallenge.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Word Challenge Widget', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to widget test page
    await page.goto('/widgets/word-challenge');
  });

  test('should render initial game state', async ({ page }) => {
    // Check title is visible
    await expect(page.getByRole('heading', { name: 'Word Challenge' }))
      .toBeVisible();

    // Check input field exists
    const input = page.getByPlaceholder('Enter 5-letter word');
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    // Check submit button exists
    const submitButton = page.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeVisible();
  });

  test('should validate guess input length', async ({ page }) => {
    const input = page.getByPlaceholder('Enter 5-letter word');
    const submitButton = page.getByRole('button', { name: 'Submit' });

    // Type short word
    await input.fill('CAT');
    await submitButton.click();

    // Check error message
    await expect(page.getByText(/must be 5 letters/i)).toBeVisible();

    // Type long word
    await input.fill('CATERPILLAR');
    await submitButton.click();

    // Check error message
    await expect(page.getByText(/must be 5 letters/i)).toBeVisible();
  });

  test('should display guess feedback visually', async ({ page }) => {
    const input = page.getByPlaceholder('Enter 5-letter word');
    const submitButton = page.getByRole('button', { name: 'Submit' });

    // Submit a valid guess
    await input.fill('CRANE');
    await submitButton.click();

    // Wait for feedback to appear
    await page.waitForSelector('[data-testid="guess-row-0"]', {
      state: 'visible'
    });

    // Check that 5 letter boxes are rendered
    const letterBoxes = page.locator('[data-testid="guess-row-0"] .letter-box');
    await expect(letterBoxes).toHaveCount(5);

    // Check that each box has a status class
    for (let i = 0; i < 5; i++) {
      const box = letterBoxes.nth(i);
      const classes = await box.getAttribute('class');
      expect(classes).toMatch(/letter-box-(correct|present|absent)/);
    }
  });

  test('should handle keyboard input', async ({ page }) => {
    const input = page.getByPlaceholder('Enter 5-letter word');

    // Focus input
    await input.focus();

    // Type using keyboard
    await page.keyboard.type('SLATE');

    // Verify input value
    await expect(input).toHaveValue('SLATE');

    // Press Enter to submit
    await page.keyboard.press('Enter');

    // Verify guess was submitted
    await expect(page.locator('[data-testid="guess-row-0"]')).toBeVisible();
  });

  test('should disable input after game over', async ({ page }) => {
    // Mock game state with 6 guesses (game over)
    await page.route('**/api/submitGuess', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isComplete: true,
          isWin: false,
          guessesRemaining: 0
        })
      });
    });

    const input = page.getByPlaceholder('Enter 5-letter word');
    const submitButton = page.getByRole('button', { name: 'Submit' });

    await input.fill('CRANE');
    await submitButton.click();

    // Wait for game over state
    await page.waitForTimeout(500);

    // Input should be disabled
    await expect(input).toBeDisabled();
    await expect(submitButton).toBeDisabled();

    // Game over message should be visible
    await expect(page.getByText(/Game Over/i)).toBeVisible();
  });

  test('should show win celebration', async ({ page }) => {
    // Mock winning response
    await page.route('**/api/submitGuess', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isComplete: true,
          isWin: true,
          feedback: [
            { letter: 'C', status: 'correct' },
            { letter: 'R', status: 'correct' },
            { letter: 'A', status: 'correct' },
            { letter: 'N', status: 'correct' },
            { letter: 'E', status: 'correct' }
          ]
        })
      });
    });

    const input = page.getByPlaceholder('Enter 5-letter word');
    await input.fill('CRANE');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Check for win message
    await expect(page.getByText(/You won!/i)).toBeVisible();

    // Check for share button
    await expect(page.getByRole('button', { name: /Share/i })).toBeVisible();
  });

  test('should render correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to widget
    await page.goto('/widgets/word-challenge');

    // Check elements are visible and not overlapping
    const title = page.getByRole('heading', { name: 'Word Challenge' });
    const input = page.getByPlaceholder('Enter 5-letter word');
    const button = page.getByRole('button', { name: 'Submit' });

    await expect(title).toBeVisible();
    await expect(input).toBeVisible();
    await expect(button).toBeVisible();

    // Check touch target size (minimum 44x44 for mobile)
    const buttonBox = await button.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });
});
```

### Visual Regression Testing

**File**: `web/src/__tests__/playwright/visual.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('Word Challenge widget initial state', async ({ page }) => {
    await page.goto('/widgets/word-challenge');

    // Take screenshot of entire widget
    await expect(page).toHaveScreenshot('word-challenge-initial.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Word Challenge with guesses', async ({ page }) => {
    await page.goto('/widgets/word-challenge');

    // Mock state with 3 guesses
    await page.evaluate(() => {
      // Set up mock state (implementation depends on your state management)
    });

    await expect(page).toHaveScreenshot('word-challenge-with-guesses.png');
  });

  test('Spelling Bee widget', async ({ page }) => {
    await page.goto('/widgets/spelling-bee');

    // Wait for honeycomb to render
    await page.waitForSelector('[data-testid="honeycomb"]');

    await expect(page).toHaveScreenshot('spelling-bee-initial.png');
  });

  test('Connections widget', async ({ page }) => {
    await page.goto('/widgets/connections');

    await expect(page).toHaveScreenshot('connections-initial.png');
  });
});
```

### Interaction Testing

**File**: `web/src/__tests__/playwright/interactions.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Interactions', () => {
  test('Spelling Bee letter selection', async ({ page }) => {
    await page.goto('/widgets/spelling-bee');

    // Click center letter
    const centerLetter = page.locator('[data-testid="center-letter"]');
    await centerLetter.click();

    // Check letter appears in word input
    const wordInput = page.locator('[data-testid="current-word"]');
    const centerText = await centerLetter.textContent();
    await expect(wordInput).toHaveText(centerText || '');

    // Click another letter
    const outerLetter = page.locator('[data-testid="outer-letter"]').first();
    await outerLetter.click();

    // Check both letters in word
    const outerText = await outerLetter.textContent();
    await expect(wordInput).toHaveText(`${centerText}${outerText}`);

    // Press backspace
    await page.keyboard.press('Backspace');

    // Check letter removed
    await expect(wordInput).toHaveText(centerText || '');
  });

  test('Connections group selection', async ({ page }) => {
    await page.goto('/widgets/connections');

    // Select 4 words
    const words = page.locator('[data-testid="word-card"]');
    for (let i = 0; i < 4; i++) {
      await words.nth(i).click();
    }

    // Check submit button is enabled
    const submitButton = page.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeEnabled();

    // Click submit
    await submitButton.click();

    // Check for feedback (correct or incorrect)
    await expect(
      page.getByText(/Correct|Not quite/i)
    ).toBeVisible({ timeout: 3000 });
  });

  test('20 Questions conversation flow', async ({ page }) => {
    await page.goto('/widgets/20-questions');

    // Start game
    await page.getByRole('button', { name: 'Start Game' }).click();

    // Type question
    const input = page.getByPlaceholder('Ask a yes/no question');
    await input.fill('Is it alive?');

    // Submit question
    await page.keyboard.press('Enter');

    // Wait for response
    await expect(
      page.locator('[data-testid="ai-response"]')
    ).toBeVisible({ timeout: 5000 });

    // Check response is Yes or No
    const response = page.locator('[data-testid="ai-response"]');
    const responseText = await response.textContent();
    expect(responseText).toMatch(/Yes|No/);
  });
});
```

### Network Mocking and Error Handling

**File**: `web/src/__tests__/playwright/network.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Network Error Handling', () => {
  test('should handle API timeout', async ({ page }) => {
    // Abort all API requests (simulate timeout)
    await page.route('**/api/**', (route) => route.abort('timedout'));

    await page.goto('/widgets/word-challenge');

    const input = page.getByPlaceholder('Enter 5-letter word');
    await input.fill('CRANE');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Check error message appears
    await expect(
      page.getByText(/network error|try again/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should handle 500 server error', async ({ page }) => {
    await page.route('**/api/submitGuess', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    );

    await page.goto('/widgets/word-challenge');

    const input = page.getByPlaceholder('Enter 5-letter word');
    await input.fill('CRANE');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Check error message
    await expect(
      page.getByText(/something went wrong/i)
    ).toBeVisible();
  });

  test('should retry failed requests', async ({ page }) => {
    let callCount = 0;

    await page.route('**/api/submitGuess', async (route) => {
      callCount++;

      // Fail first request, succeed on retry
      if (callCount === 1) {
        await route.abort('failed');
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            feedback: [
              { letter: 'C', status: 'correct' },
              { letter: 'R', status: 'present' },
              { letter: 'A', status: 'absent' },
              { letter: 'N', status: 'absent' },
              { letter: 'E', status: 'absent' }
            ]
          })
        });
      }
    });

    await page.goto('/widgets/word-challenge');

    const input = page.getByPlaceholder('Enter 5-letter word');
    await input.fill('CRANE');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Should succeed after retry
    await expect(page.locator('[data-testid="guess-row-0"]')).toBeVisible();
    expect(callCount).toBeGreaterThan(1);
  });
});
```

### Accessibility Testing

**File**: `web/src/__tests__/playwright/accessibility.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('Word Challenge widget should be accessible', async ({ page }) => {
    await page.goto('/widgets/word-challenge');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/widgets/word-challenge');

    // Tab to input
    await page.keyboard.press('Tab');
    const input = page.getByPlaceholder('Enter 5-letter word');
    await expect(input).toBeFocused();

    // Tab to submit button
    await page.keyboard.press('Tab');
    const button = page.getByRole('button', { name: 'Submit' });
    await expect(button).toBeFocused();

    // Space to click button
    await page.keyboard.press('Space');

    // Check validation message appears
    await expect(page.getByText(/enter a word/i)).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/widgets/word-challenge');

    // Check input has label
    const input = page.getByPlaceholder('Enter 5-letter word');
    const ariaLabel = await input.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();

    // Check button has accessible name
    const button = page.getByRole('button', { name: 'Submit' });
    await expect(button).toBeVisible();

    // Check game board has proper structure
    const gameBoard = page.locator('[role="region"][aria-label*="game"]');
    await expect(gameBoard).toBeVisible();
  });
});
```

### Performance Testing

**File**: `web/src/__tests__/playwright/performance.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('widget should load quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/widgets/word-challenge');

    // Wait for widget to be interactive
    await page.waitForSelector('[data-testid="game-board"]', {
      state: 'visible'
    });

    const loadTime = Date.now() - startTime;

    // Should load in under 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('should render 100 word cards without lag', async ({ page }) => {
    await page.goto('/widgets/spelling-bee');

    // Add 100 found words
    await page.evaluate(() => {
      const words = Array(100).fill(null).map((_, i) => `WORD${i}`);
      // Trigger rendering of 100 words (implementation specific)
    });

    // Measure frame rate
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();

        function countFrame() {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frameCount);
          }
        }

        requestAnimationFrame(countFrame);
      });
    });

    // Should maintain 30+ FPS
    expect(metrics).toBeGreaterThan(30);
  });

  test('should handle rapid interactions', async ({ page }) => {
    await page.goto('/widgets/connections');

    // Rapidly click 16 word cards
    const cards = page.locator('[data-testid="word-card"]');
    const clickPromises = [];

    for (let i = 0; i < 16; i++) {
      clickPromises.push(cards.nth(i).click());
    }

    const startTime = Date.now();
    await Promise.all(clickPromises);
    const duration = Date.now() - startTime;

    // Should complete in under 500ms
    expect(duration).toBeLessThan(500);
  });
});
```

### Run Playwright Tests

```bash
# Run all tests
cd web
npx playwright test

# Run specific test file
npx playwright test wordChallenge.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run with UI mode (interactive)
npx playwright test --ui

# Debug specific test
npx playwright test --debug wordChallenge.spec.ts

# Run on specific browser
npx playwright test --project=chromium

# Generate report
npx playwright show-report
```

### CI Integration

Add to your GitHub Actions workflow:

```yaml
- name: Install Playwright Browsers
  working-directory: ./web
  run: npx playwright install --with-deps

- name: Run Playwright tests
  working-directory: ./web
  run: npx playwright test

- name: Upload Playwright Report
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: web/playwright-report/
    retention-days: 30
```

### Playwright Best Practices

1. **Use Data Test IDs**: Add `data-testid` attributes for reliable selectors
   ```tsx
   <div data-testid="game-board">...</div>
   ```

2. **Wait for Elements**: Use built-in waiting instead of `setTimeout`
   ```typescript
   await expect(page.locator('.result')).toBeVisible();
   ```

3. **Isolate Tests**: Each test should be independent
   ```typescript
   test.beforeEach(async ({ page }) => {
     // Reset state before each test
   });
   ```

4. **Mock External APIs**: Don't hit real APIs in tests
   ```typescript
   await page.route('**/api/**', (route) => route.fulfill({...}));
   ```

5. **Test Across Browsers**: Use projects configuration
   ```typescript
   projects: [
     { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
     { name: 'webkit', use: { ...devices['iPhone 12'] } }
   ]
   ```

---

## 5. Agent-Based E2E Testing

Use AI agents to test your app like a real user would interact with it in ChatGPT.

### Approach: Synthetic User Testing

Create an automated agent that simulates user interactions and validates responses.

**File**: `server/src/__tests__/e2e/agent-testing.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import OpenAI from 'openai';

describe('Agent-Based E2E Tests', () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  it('should handle natural language game start', async () => {
    const messages = [
      {
        role: 'user' as const,
        content: 'I want to play a word guessing game'
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      tools: [
        {
          type: 'function' as const,
          function: {
            name: 'startWordChallenge',
            description: 'Start a new Word Challenge game (Wordle-style)',
            parameters: {
              type: 'object',
              properties: {
                mode: {
                  type: 'string',
                  enum: ['daily', 'practice'],
                  description: 'Game mode: daily for the puzzle of the day, practice for random puzzles'
                }
              },
              required: ['mode']
            }
          }
        }
      ]
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];
    expect(toolCall).toBeDefined();
    expect(toolCall?.function.name).toBe('startWordChallenge');
  });

  it('should extract correct parameters from conversational input', async () => {
    const messages = [
      {
        role: 'user' as const,
        content: 'Let me try guessing CRANE for my current word game'
      }
    ];

    // Mock the current game state context
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      tools: [
        {
          type: 'function' as const,
          function: {
            name: 'submitGuess',
            description: 'Submit a guess for the active Word Challenge game',
            parameters: {
              type: 'object',
              properties: {
                gameId: { type: 'string' },
                guess: {
                  type: 'string',
                  description: 'A 5-letter word guess'
                }
              },
              required: ['gameId', 'guess']
            }
          }
        }
      ]
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];
    const args = JSON.parse(toolCall?.function.arguments || '{}');

    expect(args.guess).toBe('CRANE');
  });
});
```

### Golden Prompt Testing

Create a suite of "golden prompts" that should trigger your tools correctly.

**File**: `server/src/__tests__/e2e/golden-prompts.test.ts`

```typescript
import { describe, it, expect } from 'vitest';

const goldenPrompts = {
  wordChallenge: {
    positive: [
      'I want to play Wordle',
      'Start a word guessing game',
      'Can we play the daily word challenge?',
      'Let me guess a 5-letter word'
    ],
    negative: [
      'Tell me a joke',
      'What\'s the weather?',
      'I want to play Connections', // Should trigger different tool
    ]
  },
  twentyQuestions: {
    positive: [
      'Let\'s play 20 questions',
      'I\'m thinking of something, try to guess it',
      'Can you guess what I\'m thinking?'
    ],
    negative: [
      'What is 20 + 20?',
      'Tell me 20 facts'
    ]
  }
};

describe('Golden Prompt Testing', () => {
  describe('Word Challenge Discovery', () => {
    it.each(goldenPrompts.wordChallenge.positive)(
      'should trigger on: %s',
      async (prompt) => {
        // Use OpenAI API to test tool selection
        const toolSelected = await testPromptTriggersaTool(
          prompt,
          'startWordChallenge'
        );
        expect(toolSelected).toBe(true);
      }
    );

    it.each(goldenPrompts.wordChallenge.negative)(
      'should NOT trigger on: %s',
      async (prompt) => {
        const toolSelected = await testPromptTriggersaTool(
          prompt,
          'startWordChallenge'
        );
        expect(toolSelected).toBe(false);
      }
    );
  });
});

async function testPromptTriggersaTool(
  prompt: string,
  expectedTool: string
): Promise<boolean> {
  // Implementation using OpenAI API
  // Returns true if the expected tool was selected
  return true; // Placeholder
}
```

### Conversation Flow Testing

Test multi-turn conversations to ensure state is maintained.

**File**: `server/src/__tests__/e2e/conversation-flows.test.ts`

```typescript
import { describe, it, expect } from 'vitest';

describe('Conversation Flow Testing', () => {
  it('should maintain game state across multiple turns', async () => {
    const conversation = [
      {
        user: 'Start a new word game',
        expectedTool: 'startWordChallenge',
        validate: (response) => {
          expect(response.gameId).toBeDefined();
        }
      },
      {
        user: 'I guess CRANE',
        expectedTool: 'submitGuess',
        validate: (response) => {
          expect(response.feedback).toHaveLength(5);
        }
      },
      {
        user: 'Try SLATE',
        expectedTool: 'submitGuess',
        validate: (response) => {
          expect(response.guessNumber).toBe(2);
        }
      }
    ];

    // Execute conversation and validate each step
    // This requires integration with your actual MCP server
  });

  it('should handle errors gracefully in conversation', async () => {
    const conversation = [
      {
        user: 'Start a word game',
        expectedTool: 'startWordChallenge'
      },
      {
        user: 'I guess CAT', // Invalid: too short
        expectedTool: 'submitGuess',
        expectError: true,
        errorMessage: /must be exactly 5 letters/i
      },
      {
        user: 'Okay, CRANE then',
        expectedTool: 'submitGuess',
        expectError: false
      }
    ];

    // Test error recovery in conversation flow
  });
});
```

---

## 6. ChatGPT Integration Testing

**This is the most critical testing phase** - validating your app works in the actual ChatGPT environment before submitting to the App Directory.

### Overview

Testing in ChatGPT validates:
- ✅ Your MCP server connects properly
- ✅ Tools are discovered correctly
- ✅ Widgets render in the ChatGPT UI
- ✅ The full user experience works end-to-end
- ✅ Mobile apps work correctly

**Budget 2-3 days for thorough ChatGPT integration testing before submission.**

---

### Step 1: Deploy Your Server

Your server must be publicly accessible via HTTPS. You have two options:

#### Option A: Production Deployment (Recommended for Final Testing)

Deploy to your production hosting (Fly.io, Railway, Vercel, etc.):

```bash
# Example with Fly.io
cd server
fly deploy

# Get your URL
fly status
# https://gamebox.fly.dev
```

#### Option B: Local Development with ngrok

For rapid iteration during development:

```bash
# Start your local server
cd server
npm run dev

# In another terminal, start ngrok
ngrok http 8000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Important ngrok notes:**
- Free tier URLs change on each restart
- Paid tier ($8/month) provides static URLs
- Remember to update ChatGPT connector URL after each restart

---

### Step 2: Enable Developer Mode in ChatGPT

#### Desktop (Web)

1. Open [ChatGPT](https://chat.openai.com)
2. Click your profile (bottom left)
3. Go to **Settings**
4. Navigate to **Features** → **Developer mode**
5. Toggle **Enable developer mode**
6. You'll see a new **Connectors** section appear

#### Mobile (iOS/Android)

1. Open ChatGPT mobile app
2. Tap your profile icon
3. Go to **Settings**
4. Scroll to **Features**
5. Enable **Developer mode**
6. Go back and tap **Connectors**

---

### Step 3: Add Your MCP Server as a Connector

#### Connect Your Server

1. In ChatGPT, go to **Settings** → **Connectors**
2. Click **Add connector**
3. Enter your server details:

```
Name: GameBox Dev
URL: https://your-ngrok-url.ngrok.io
OR
URL: https://gamebox.fly.dev
```

4. Click **Connect**

#### Verify Connection

ChatGPT will attempt to connect to your server. You should see:

✅ **Connected** - Your server is reachable
❌ **Failed to connect** - Check the error message

**Common connection errors:**

| Error | Solution |
|-------|----------|
| "Cannot reach server" | Verify URL is correct and server is running |
| "SSL certificate error" | Ensure HTTPS is properly configured |
| "Invalid MCP response" | Check server logs for errors |
| "Timeout" | Server taking too long (must respond within 10s) |

#### Check Server Logs

Monitor your server logs while ChatGPT connects:

```bash
# Local development
cd server
npm run dev

# Fly.io
fly logs

# Check for:
# - Incoming connection from OpenAI
# - Tool registration logs
# - Any errors or warnings
```

---

### Step 4: Verify Tools are Registered

After connecting, verify ChatGPT can see your tools.

#### View Available Tools

1. Start a new chat
2. Type: `@GameBox` (or your connector name)
3. You should see a list of available tools

**Expected tools for GameBox:**
- Start Word Challenge
- Submit Guess
- Start 20 Questions
- Ask Question
- Start Connections
- Submit Connection Group
- Start Spelling Bee
- Submit Spelling Bee Word
- Start Trivia
- Submit Trivia Answer

#### If Tools Don't Appear

**Check your server is returning tools correctly:**

```bash
# Test locally with curl
curl https://your-server.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Should return:
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "startWordChallenge",
        "description": "Start a new Word Challenge game...",
        "inputSchema": {...}
      },
      ...
    ]
  }
}
```

---

### Step 5: Test Tool Discovery

Test that ChatGPT correctly identifies when to use your tools based on natural language.

#### Golden Prompt Testing

Create a test document with prompts that should/shouldn't trigger your tools:

**File**: `testing/chatgpt-prompts.md`

```markdown
# ChatGPT Integration Test Prompts

## Word Challenge (SHOULD trigger)
- [ ] "I want to play Wordle"
- [ ] "Let's play a word guessing game"
- [ ] "Can we do the daily word challenge?"
- [ ] "Start a 5-letter word game"

## Word Challenge (SHOULD NOT trigger)
- [ ] "Tell me about Wordle"
- [ ] "How do you play word games?"
- [ ] "What words start with W?"

## 20 Questions (SHOULD trigger)
- [ ] "Let's play 20 questions"
- [ ] "I'm thinking of something, can you guess it?"
- [ ] "Want to play a guessing game?"

## 20 Questions (SHOULD NOT trigger)
- [ ] "I have 20 questions for you"
- [ ] "Answer these 20 questions"

## Connections (SHOULD trigger)
- [ ] "Let's play Connections"
- [ ] "I want to find word groups"
- [ ] "Can we play the NYT Connections game?"

## Spelling Bee (SHOULD trigger)
- [ ] "Let's play Spelling Bee"
- [ ] "I want to make words from letters"
- [ ] "Start the honeycomb word game"

## Trivia (SHOULD trigger)
- [ ] "Let's play trivia"
- [ ] "Quiz me on random knowledge"
- [ ] "I want to answer trivia questions"
```

#### Run Through Each Prompt

1. Start a **new chat** for each test (to avoid context pollution)
2. Type the prompt exactly
3. **Observe ChatGPT's response:**
   - Does it call the correct tool?
   - Does it ask for clarification if needed?
   - Does it extract parameters correctly?

#### Document Results

Create a spreadsheet to track results:

| Prompt | Expected Tool | Actual Tool | Passed? | Notes |
|--------|---------------|-------------|---------|-------|
| "I want to play Wordle" | startWordChallenge | startWordChallenge | ✅ | Perfect |
| "Tell me about Wordle" | None | None | ✅ | Correctly didn't trigger |
| "Let's play 20 questions" | start20Questions | start20Questions | ✅ | Good |

**Failure example:**
| Prompt | Expected | Actual | Passed? | Notes |
|--------|----------|--------|---------|-------|
| "Word game please" | startWordChallenge | None | ❌ | Tool description needs improvement |

**If tools don't trigger correctly:**
1. Improve tool descriptions to be more specific
2. Add more keywords
3. Test again

---

### Step 6: Test Widget Rendering

Once tools trigger correctly, test that widgets render properly in ChatGPT.

#### Desktop Testing

1. Trigger a tool: "Let's play Word Challenge"
2. **Observe the widget:**
   - Does it load within 2 seconds?
   - Are all visual elements visible?
   - Are colors/fonts correct?
   - Are buttons clickable?

3. **Interact with the widget:**
   - Type in input fields
   - Click buttons
   - Check animations work
   - Verify state updates

4. **Open browser DevTools:**
   - Press `F12` or `Cmd+Option+I` (Mac)
   - Go to **Console** tab
   - Look for errors (there should be none)
   - Go to **Network** tab
   - Monitor API calls as you interact

**What to check in DevTools:**

```
Console Tab:
✅ No errors (red messages)
✅ No warnings about missing dependencies
⚠️  Some info logs are okay

Network Tab:
✅ Widget bundle loads successfully (200 status)
✅ API calls complete within 2s
✅ No CORS errors
✅ No 400/500 errors
```

#### Widget Checklist

- [ ] Widget loads without errors
- [ ] All UI elements are visible
- [ ] Text is readable (not too small/large)
- [ ] Colors match your design
- [ ] Buttons are clickable
- [ ] Input fields accept text
- [ ] Keyboard shortcuts work (if applicable)
- [ ] Animations are smooth
- [ ] Widget responds to interactions
- [ ] State persists across interactions
- [ ] Error states display properly

#### Test Different Scenarios

**Test each game thoroughly:**

```markdown
## Word Challenge
1. Start daily game
2. Submit valid guess → Check feedback colors
3. Submit invalid guess (too short) → Check error message
4. Win the game → Check celebration animation
5. Lose the game → Check game over state
6. Share results → Check share button works
7. Start practice mode → Check it's different from daily

## Spelling Bee
1. Start game → Check honeycomb renders
2. Click letters → Check word builds
3. Submit valid word → Check points update
4. Submit invalid word → Check error
5. Find pangram → Check bonus points
6. Delete letters → Check backspace works
7. Shuffle letters → Check animation

## Connections
1. Start game → Check 16 words display
2. Select 4 words → Check selection highlights
3. Submit correct group → Check animation
4. Submit incorrect group → Check shake/error
5. Make 4 mistakes → Check game over
6. Complete all groups → Check victory

## 20 Questions
1. Start game (AI guesses mode)
2. Type yes/no answer → Check it registers
3. AI makes guess → Check guess displays
4. Complete game → Check result
5. Switch to user guesses mode
6. Ask question → Check AI response
```

---

### Step 7: Debug Issues in ChatGPT

When something doesn't work, here's how to debug:

#### Widget Not Rendering

**Symptoms:** Widget area is blank or shows error

**Debug steps:**

1. **Check browser console (F12)**
   ```
   Look for:
   - "Failed to load widget bundle"
   - CORS errors
   - JavaScript errors
   - CSP violations
   ```

2. **Verify widget URL is accessible**
   ```bash
   # Test widget bundle loads
   curl https://your-cdn.com/widgets/word-challenge.js
   # Should return JavaScript code
   ```

3. **Check Content Security Policy**
   - Widgets must be served from HTTPS
   - CSP headers must allow your widget domain

   ```typescript
   // server/src/index.ts
   app.use((req, res, next) => {
     res.setHeader(
       'Content-Security-Policy',
       "default-src 'self'; script-src 'self' https://your-cdn.com"
     );
     next();
   });
   ```

4. **Check widget bundle size**
   ```bash
   # Widgets should be < 500KB
   ls -lh web/dist/assets/*.js
   ```

#### Tool Parameters Wrong

**Symptoms:** Tool is called but with incorrect parameters

**Debug steps:**

1. **Check server logs for incoming request**
   ```bash
   # You should see the raw tool call
   {
     "method": "tools/call",
     "params": {
       "name": "startWordChallenge",
       "arguments": {
         "mode": "dailly"  // Typo!
       }
     }
   }
   ```

2. **Validate input schema**
   ```typescript
   // Make sure schema matches expected format
   inputSchema: {
     type: 'object',
     properties: {
       mode: {
         type: 'string',
         enum: ['daily', 'practice'], // ChatGPT will try to match these
         description: 'Game mode: "daily" for daily puzzle, "practice" for random'
       }
     },
     required: ['mode']
   }
   ```

3. **Improve tool description**
   ```typescript
   description: 'Start a new Word Challenge game. The user can choose between "daily" mode (the same puzzle for everyone today) or "practice" mode (a random puzzle).'
   ```

#### State Not Persisting

**Symptoms:** Widget resets between interactions

**Debug steps:**

1. **Check if you're using proper state management**
   ```typescript
   // Use React state or context
   const [gameState, setGameState] = useState<GameState>();

   // Don't rely on server to maintain state
   // Each tool call should include necessary state
   ```

2. **Return state in tool response**
   ```typescript
   // Tool should return current state
   return {
     content: [{
       type: 'widget',
       url: 'https://cdn.com/widget.js',
       data: {
         gameId: 'abc123',
         guesses: [...],
         currentState: 'in_progress'
       }
     }]
   };
   ```

3. **Test widget in isolation**
   ```bash
   # Open widget directly in browser
   open http://localhost:4444/widgets/word-challenge

   # Test interactions work standalone
   ```

---

### Step 8: Test on Mobile Devices

**Critical:** ChatGPT has iOS and Android apps. Your widgets MUST work on mobile.

#### iOS Testing

1. **Install ChatGPT on iPhone/iPad**
   - Download from App Store
   - Sign in with same account

2. **Enable Developer Mode**
   - Settings → Features → Developer mode

3. **Add Your Connector**
   - Settings → Connectors → Add
   - Enter same URL as desktop

4. **Test Each Game**
   - Start game
   - Check widget renders properly
   - Check touch targets are big enough (44x44px minimum)
   - Check text is readable
   - Test all interactions with touch
   - Check landscape mode works
   - Test on both iPhone and iPad sizes

#### Android Testing

1. **Install ChatGPT on Android device**
   - Download from Play Store
   - Sign in with same account

2. **Enable Developer Mode**
   - Settings → Features → Developer mode

3. **Add Your Connector**
   - Settings → Connectors → Add
   - Enter same URL

4. **Test Each Game**
   - Same checks as iOS
   - Test on different screen sizes
   - Check keyboard behavior
   - Test dark mode (if supported)

#### Mobile-Specific Issues

**Common problems:**

| Issue | Solution |
|-------|----------|
| Text too small | Increase font size, use rem units |
| Buttons hard to tap | Ensure 44x44px minimum touch targets |
| Widget too wide | Use responsive design, max-width: 100% |
| Keyboard covers input | Use proper viewport meta tag |
| Animations laggy | Reduce animation complexity, use CSS transforms |

**Test responsive design:**

```css
/* Ensure widgets are mobile-friendly */
.widget-container {
  max-width: 100%;
  padding: 1rem;
}

@media (max-width: 768px) {
  .game-board {
    font-size: 0.875rem;
  }

  .button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

### Step 9: Performance Testing in ChatGPT

Test that your app is responsive and doesn't cause delays in ChatGPT.

#### Measure Response Times

1. **Tool Execution Time**
   - Tools should respond within 2 seconds
   - Widget should render within 2 seconds

2. **Monitor in DevTools**
   ```
   Network Tab:
   - Click tool call request
   - Check "Time" column
   - Should be < 2000ms
   ```

3. **Add logging to measure**
   ```typescript
   export async function startWordChallenge(input) {
     const startTime = Date.now();

     try {
       const result = await createGame(input);
       const duration = Date.now() - startTime;

       console.log(`startWordChallenge took ${duration}ms`);

       if (duration > 2000) {
         console.warn('⚠️  Tool took longer than 2s!');
       }

       return result;
     } catch (error) {
       const duration = Date.now() - startTime;
       console.error(`startWordChallenge failed after ${duration}ms`);
       throw error;
     }
   }
   ```

#### Load Testing

Test that your app handles concurrent users:

1. **Multiple concurrent games**
   ```bash
   # Start 10 games simultaneously
   for i in {1..10}; do
     curl -X POST https://your-server.com/tools/startWordChallenge &
   done
   ```

2. **Monitor server resources**
   ```bash
   # Fly.io
   fly metrics

   # Check:
   # - CPU usage < 80%
   # - Memory usage stable
   # - Response times consistent
   ```

---

### Step 10: Final Pre-Submission Testing

Before submitting, complete this final checklist:

#### Complete Testing Checklist

**Connection & Setup**
- [ ] Server is deployed to production (not ngrok)
- [ ] HTTPS is working correctly
- [ ] Connection to ChatGPT succeeds
- [ ] All tools appear in ChatGPT

**Tool Discovery (Desktop)**
- [ ] All positive prompts trigger correct tools
- [ ] Negative prompts don't trigger tools
- [ ] Parameter extraction works correctly
- [ ] Tool descriptions are clear and accurate

**Widget Rendering (Desktop)**
- [ ] All widgets load within 2 seconds
- [ ] No console errors
- [ ] All visual elements render correctly
- [ ] Interactions work as expected
- [ ] State persists correctly

**Complete Game Flows (Desktop)**
- [ ] Word Challenge: Start → Play → Win/Lose → Share
- [ ] 20 Questions: Start → Play → Complete
- [ ] Connections: Start → Select → Submit → Complete
- [ ] Spelling Bee: Start → Enter words → Reach rank
- [ ] Trivia: Start → Answer → Complete

**Mobile Testing (iOS)**
- [ ] Connection works
- [ ] Tools trigger correctly
- [ ] Widgets render on iPhone
- [ ] Widgets render on iPad
- [ ] Touch interactions work
- [ ] No layout issues
- [ ] Performance is good

**Mobile Testing (Android)**
- [ ] Connection works
- [ ] Tools trigger correctly
- [ ] Widgets render correctly
- [ ] Touch interactions work
- [ ] No layout issues
- [ ] Performance is good

**Error Handling**
- [ ] Invalid inputs show clear errors
- [ ] Network errors handled gracefully
- [ ] Server errors don't crash widget
- [ ] User can recover from errors

**Performance**
- [ ] Tools respond within 2 seconds
- [ ] Widgets load within 2 seconds
- [ ] No lag during interactions
- [ ] Server handles concurrent users

**Polish**
- [ ] Animations are smooth
- [ ] Loading states are clear
- [ ] Success states are celebratory
- [ ] Error messages are helpful
- [ ] Overall UX is delightful

---

### Step 11: Create Test Report

Document your testing for submission:

**File**: `testing/chatgpt-integration-report.md`

```markdown
# ChatGPT Integration Test Report

**Date:** 2026-01-19
**Tester:** Your Name
**Environment:** Production (https://gamebox.fly.dev)

## Summary
✅ All tests passed
⚠️  2 minor issues found and fixed
❌ 0 critical issues

## Test Environment
- **Desktop Browser:** Chrome 120 (Mac)
- **Mobile:** iPhone 14 Pro (iOS 17), Samsung Galaxy S23 (Android 14)
- **ChatGPT Version:** Web + Mobile apps
- **Server:** Production deployment on Fly.io

## Tool Discovery Results

### Word Challenge
| Prompt | Expected | Actual | Status | Notes |
|--------|----------|--------|--------|-------|
| "I want to play Wordle" | startWordChallenge | ✅ | Pass | Perfect trigger |
| "Start word game" | startWordChallenge | ✅ | Pass | Works great |
| "Tell me about Wordle" | None | ✅ | Pass | Correctly didn't trigger |

### 20 Questions
...

## Widget Rendering

### Desktop
✅ All widgets render perfectly
✅ No console errors
✅ Smooth animations
✅ Fast load times (< 1s)

### Mobile (iOS)
✅ iPhone 14 Pro: Perfect
✅ iPad Air: Perfect
⚠️  iPhone SE: Text slightly small (fixed by adjusting font size)

### Mobile (Android)
✅ Galaxy S23: Perfect
✅ Pixel 7: Perfect

## Performance
- Average tool response time: 450ms
- Average widget load time: 800ms
- Server uptime: 99.9%

## Issues Found & Fixed

### Issue #1: Widget text too small on iPhone SE
**Severity:** Minor
**Status:** Fixed
**Solution:** Increased base font size for small screens

### Issue #2: Connection pool exhaustion under load
**Severity:** Minor
**Status:** Fixed
**Solution:** Increased database connection pool size

## Recommendation
✅ **READY FOR SUBMISSION**

All critical functionality works correctly. App provides excellent user experience on both desktop and mobile. Performance is well within acceptable limits.
```

---

### Debugging Tips & Tricks

#### Enable Verbose Logging

```typescript
// server/src/index.ts
const DEBUG = process.env.NODE_ENV === 'development';

app.post('/mcp', async (req, res) => {
  if (DEBUG) {
    console.log('📥 Incoming MCP request:', JSON.stringify(req.body, null, 2));
  }

  const result = await handleMCPRequest(req.body);

  if (DEBUG) {
    console.log('📤 MCP response:', JSON.stringify(result, null, 2));
  }

  res.json(result);
});
```

#### Use ChatGPT's Debug Mode

If available, enable debug mode to see:
- Exact tool calls made
- Parameters extracted
- Response times

#### Test in Multiple Browsers

- Chrome (most users)
- Safari (iOS users)
- Firefox (some users)

#### Keep Testing Logs

Save your testing sessions for reference:
- Screenshot each widget
- Record videos of interactions
- Save error logs

---

### Common ChatGPT Integration Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Tools don't appear | Server not responding | Check server logs, verify URL |
| Wrong tool triggered | Poor description | Improve tool description and examples |
| Widget doesn't load | CORS/CSP issue | Configure proper headers |
| Widget renders blank | JavaScript error | Check console for errors |
| Slow performance | Database queries | Add caching, optimize queries |
| Mobile layout broken | Not responsive | Add mobile-specific CSS |
| State doesn't persist | Not returning state | Include state in tool response |

---

By following this comprehensive ChatGPT integration testing process, you'll ensure your app works perfectly in the real ChatGPT environment before submitting to the App Directory. Budget adequate time for this phase - it's your final validation before users see your app!

---

### 🤖 Automated ChatGPT Testing with Playwright

**This is the pinnacle of testing** - using Playwright to automate testing in the actual ChatGPT environment, ensuring your app works exactly as users will experience it.

#### Why Automate ChatGPT Testing?

- ✅ **Consistent Testing**: Run the same tests every time
- ✅ **Faster Iteration**: Test all scenarios in minutes vs. hours
- ✅ **Regression Detection**: Catch breaking changes immediately
- ✅ **CI/CD Integration**: Validate before every deployment
- ✅ **Real Environment**: Test in actual ChatGPT, not mocks

#### Setup Automated ChatGPT Testing

**File**: `e2e/playwright.chatgpt.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/chatgpt',
  timeout: 60000, // ChatGPT responses can take time
  fullyParallel: false, // Run tests sequentially for ChatGPT
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // Only one ChatGPT session at a time
  reporter: [
    ['html', { outputFolder: 'playwright-report/chatgpt' }],
    ['json', { outputFile: 'test-results/chatgpt-results.json' }]
  ],

  use: {
    baseURL: 'https://chat.openai.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chatgpt-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

#### Authentication Setup

Store your ChatGPT session for automated testing:

**File**: `e2e/tests/chatgpt/setup.ts`

```typescript
import { test as setup } from '@playwright/test';

const authFile = 'e2e/.auth/chatgpt-user.json';

setup('authenticate with ChatGPT', async ({ page }) => {
  // Navigate to ChatGPT
  await page.goto('https://chat.openai.com');

  // Wait for manual login on first run
  console.log('🔐 Please login to ChatGPT in the browser...');
  await page.waitForURL('**/chat.openai.com/**', { timeout: 120000 });

  // Wait for chat interface to be ready
  await page.waitForSelector('[data-testid="chat-input"]', { timeout: 30000 });

  // Save authenticated state
  await page.context().storageState({ path: authFile });

  console.log('✅ Authentication saved!');
});
```

#### Core ChatGPT Test Helpers

**File**: `e2e/tests/chatgpt/helpers.ts`

```typescript
import { Page, expect } from '@playwright/test';

export class ChatGPTTester {
  constructor(private page: Page) {}

  /**
   * Start a new chat conversation
   */
  async startNewChat() {
    await this.page.click('[data-testid="new-chat-button"]');
    await this.page.waitForSelector('[data-testid="chat-input"]');
  }

  /**
   * Send a message to ChatGPT
   */
  async sendMessage(message: string) {
    const input = this.page.locator('[data-testid="chat-input"]');
    await input.fill(message);
    await input.press('Enter');

    // Wait for response to start
    await this.page.waitForTimeout(1000);
  }

  /**
   * Wait for ChatGPT to finish responding
   */
  async waitForResponse(timeout = 30000) {
    // Wait for stop button to disappear (response complete)
    await this.page.waitForSelector(
      '[data-testid="stop-button"]',
      { state: 'hidden', timeout }
    );
  }

  /**
   * Check if a tool was called
   */
  async wasToolCalled(toolName: string): Promise<boolean> {
    const toolCalls = await this.page.locator('[data-tool-call]').all();

    for (const call of toolCalls) {
      const name = await call.getAttribute('data-tool-name');
      if (name === toolName) return true;
    }

    return false;
  }

  /**
   * Check if widget rendered
   */
  async isWidgetVisible(): Promise<boolean> {
    const widget = this.page.locator('[data-widget-id]');
    return await widget.isVisible();
  }

  /**
   * Get widget iframe
   */
  async getWidgetFrame() {
    // Widgets typically render in iframes
    const iframe = this.page.frameLocator('[data-widget-frame]');
    return iframe;
  }

  /**
   * Interact with widget element
   */
  async interactWithWidget(selector: string, action: 'click' | 'fill', value?: string) {
    const frame = await this.getWidgetFrame();
    const element = frame.locator(selector);

    if (action === 'click') {
      await element.click();
    } else if (action === 'fill' && value) {
      await element.fill(value);
    }
  }

  /**
   * Take screenshot of entire chat
   */
  async screenshotChat(filename: string) {
    await this.page.screenshot({
      path: `screenshots/chatgpt/${filename}`,
      fullPage: true
    });
  }
}
```

#### Automated ChatGPT Integration Tests

**File**: `e2e/tests/chatgpt/word-challenge.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { ChatGPTTester } from './helpers';

test.describe('Word Challenge in ChatGPT', () => {
  let chatGPT: ChatGPTTester;

  test.beforeEach(async ({ page }) => {
    chatGPT = new ChatGPTTester(page);

    // Navigate to ChatGPT
    await page.goto('https://chat.openai.com');

    // Start new chat
    await chatGPT.startNewChat();
  });

  test('should trigger startWordChallenge tool', async () => {
    // Send prompt that should trigger the tool
    await chatGPT.sendMessage('I want to play Wordle');

    // Wait for response
    await chatGPT.waitForResponse();

    // Verify tool was called
    const toolCalled = await chatGPT.wasToolCalled('startWordChallenge');
    expect(toolCalled).toBe(true);

    // Verify widget is visible
    const widgetVisible = await chatGPT.isWidgetVisible();
    expect(widgetVisible).toBe(true);

    // Screenshot for visual verification
    await chatGPT.screenshotChat('word-challenge-initial.png');
  });

  test('should complete full Word Challenge game flow', async () => {
    // Start game
    await chatGPT.sendMessage('Let\'s play Word Challenge');
    await chatGPT.waitForResponse();

    // Verify game started
    expect(await chatGPT.isWidgetVisible()).toBe(true);

    // Interact with widget - submit guess
    await chatGPT.interactWithWidget(
      'input[placeholder*="5-letter"]',
      'fill',
      'CRANE'
    );

    await chatGPT.interactWithWidget(
      'button[type="submit"]',
      'click'
    );

    // Wait for feedback to render
    await chatGPT.page.waitForTimeout(2000);

    // Verify feedback row appeared
    const frame = await chatGPT.getWidgetFrame();
    const feedbackRow = frame.locator('[data-testid="guess-row-0"]');
    await expect(feedbackRow).toBeVisible();

    // Screenshot the result
    await chatGPT.screenshotChat('word-challenge-after-guess.png');
  });

  test('should handle invalid guess gracefully', async () => {
    await chatGPT.sendMessage('Start a word game');
    await chatGPT.waitForResponse();

    // Try to submit invalid guess (too short)
    await chatGPT.interactWithWidget(
      'input[placeholder*="5-letter"]',
      'fill',
      'CAT'
    );

    await chatGPT.interactWithWidget(
      'button[type="submit"]',
      'click'
    );

    // Verify error message appears
    const frame = await chatGPT.getWidgetFrame();
    const errorMessage = frame.locator('text=/must be.*5 letters/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should NOT trigger on negative prompts', async () => {
    // This prompt should NOT trigger the tool
    await chatGPT.sendMessage('Tell me about Wordle');
    await chatGPT.waitForResponse();

    // Verify tool was NOT called
    const toolCalled = await chatGPT.wasToolCalled('startWordChallenge');
    expect(toolCalled).toBe(false);

    // Verify widget is NOT visible
    const widgetVisible = await chatGPT.isWidgetVisible();
    expect(widgetVisible).toBe(false);
  });
});
```

#### Test All Games Automatically

**File**: `e2e/tests/chatgpt/all-games.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { ChatGPTTester } from './helpers';

const GAME_PROMPTS = {
  wordChallenge: {
    trigger: 'I want to play Wordle',
    tool: 'startWordChallenge',
    negative: 'Tell me about Wordle'
  },
  twentyQuestions: {
    trigger: 'Let\'s play 20 questions',
    tool: 'start20Questions',
    negative: 'I have 20 questions for you'
  },
  connections: {
    trigger: 'Let\'s play Connections',
    tool: 'startConnections',
    negative: 'Tell me about the NYT Connections game'
  },
  spellingBee: {
    trigger: 'Let\'s play Spelling Bee',
    tool: 'startSpellingBee',
    negative: 'How do you spell bee?'
  },
  trivia: {
    trigger: 'Let\'s play trivia',
    tool: 'startTrivia',
    negative: 'What is trivia?'
  }
};

test.describe('All Games Discovery', () => {
  for (const [gameName, config] of Object.entries(GAME_PROMPTS)) {
    test(`${gameName}: should trigger on positive prompt`, async ({ page }) => {
      const chatGPT = new ChatGPTTester(page);

      await page.goto('https://chat.openai.com');
      await chatGPT.startNewChat();

      await chatGPT.sendMessage(config.trigger);
      await chatGPT.waitForResponse();

      const toolCalled = await chatGPT.wasToolCalled(config.tool);
      expect(toolCalled).toBe(true);

      const widgetVisible = await chatGPT.isWidgetVisible();
      expect(widgetVisible).toBe(true);

      await chatGPT.screenshotChat(`${gameName}-success.png`);
    });

    test(`${gameName}: should NOT trigger on negative prompt`, async ({ page }) => {
      const chatGPT = new ChatGPTTester(page);

      await page.goto('https://chat.openai.com');
      await chatGPT.startNewChat();

      await chatGPT.sendMessage(config.negative);
      await chatGPT.waitForResponse();

      const toolCalled = await chatGPT.wasToolCalled(config.tool);
      expect(toolCalled).toBe(false);
    });
  }
});
```

#### Mobile ChatGPT Testing

**File**: `e2e/tests/chatgpt/mobile.spec.ts`

```typescript
import { test, expect, devices } from '@playwright/test';
import { ChatGPTTester } from './helpers';

test.describe('ChatGPT Mobile Testing', () => {
  test.use({
    ...devices['iPhone 14 Pro'],
    locale: 'en-US'
  });

  test('Word Challenge should work on mobile', async ({ page }) => {
    const chatGPT = new ChatGPTTester(page);

    await page.goto('https://chat.openai.com');
    await chatGPT.startNewChat();

    // Trigger game
    await chatGPT.sendMessage('Play Wordle');
    await chatGPT.waitForResponse();

    // Verify widget renders
    expect(await chatGPT.isWidgetVisible()).toBe(true);

    // Check touch targets are adequate
    const frame = await chatGPT.getWidgetFrame();
    const submitButton = frame.locator('button[type="submit"]');
    const box = await submitButton.boundingBox();

    // Verify minimum touch target size (44x44px)
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);

    // Test touch interaction
    await submitButton.tap();

    // Screenshot mobile view
    await chatGPT.screenshotChat('word-challenge-mobile.png');
  });
});
```

#### Performance Monitoring

**File**: `e2e/tests/chatgpt/performance.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { ChatGPTTester } from './helpers';

test.describe('ChatGPT Performance', () => {
  test('tools should respond within 2 seconds', async ({ page }) => {
    const chatGPT = new ChatGPTTester(page);

    await page.goto('https://chat.openai.com');
    await chatGPT.startNewChat();

    // Measure tool call time
    const startTime = Date.now();

    await chatGPT.sendMessage('Start Word Challenge');
    await chatGPT.waitForResponse();

    const duration = Date.now() - startTime;

    // Tool should respond within 2 seconds
    expect(duration).toBeLessThan(2000);

    console.log(`✅ Tool responded in ${duration}ms`);
  });

  test('widgets should render within 2 seconds', async ({ page }) => {
    const chatGPT = new ChatGPTTester(page);

    await page.goto('https://chat.openai.com');
    await chatGPT.startNewChat();

    await chatGPT.sendMessage('Play Wordle');
    await chatGPT.waitForResponse();

    // Measure widget render time
    const startTime = Date.now();

    await page.waitForSelector('[data-widget-id]', {
      state: 'visible',
      timeout: 5000
    });

    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(2000);

    console.log(`✅ Widget rendered in ${duration}ms`);
  });
});
```

#### Run Automated ChatGPT Tests

```bash
# First time setup - authenticate
cd e2e
npx playwright test tests/chatgpt/setup.ts --headed

# Run all ChatGPT tests
npx playwright test --config=playwright.chatgpt.config.ts

# Run specific test
npx playwright test tests/chatgpt/word-challenge.spec.ts

# Run with headed browser (see what's happening)
npx playwright test --config=playwright.chatgpt.config.ts --headed

# Run and keep browser open on failure
npx playwright test --config=playwright.chatgpt.config.ts --headed --debug

# Generate report
npx playwright show-report playwright-report/chatgpt
```

#### CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
name: ChatGPT Integration Tests

on:
  push:
    branches: [main, staging]
  schedule:
    # Run daily at 2am to catch ChatGPT API changes
    - cron: '0 2 * * *'

jobs:
  chatgpt-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        working-directory: ./e2e
        run: npm ci

      - name: Install Playwright
        working-directory: ./e2e
        run: npx playwright install --with-deps chromium

      - name: Deploy server to staging
        run: |
          cd server
          fly deploy --app gamebox-staging

      - name: Run ChatGPT integration tests
        working-directory: ./e2e
        env:
          CHATGPT_EMAIL: ${{ secrets.CHATGPT_TEST_EMAIL }}
          CHATGPT_PASSWORD: ${{ secrets.CHATGPT_TEST_PASSWORD }}
        run: npx playwright test --config=playwright.chatgpt.config.ts

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: chatgpt-test-results
          path: |
            e2e/playwright-report/chatgpt/
            e2e/screenshots/chatgpt/
          retention-days: 30

      - name: Notify on failure
        if: failure()
        run: |
          # Send notification (Slack, email, etc.)
          echo "ChatGPT integration tests failed!"
```

#### Monitoring & Alerts

**File**: `e2e/tests/chatgpt/monitoring.ts`

```typescript
import { test } from '@playwright/test';
import { ChatGPTTester } from './helpers';

// Health check that runs every hour in CI
test('ChatGPT health check', async ({ page }) => {
  const chatGPT = new ChatGPTTester(page);

  await page.goto('https://chat.openai.com');
  await chatGPT.startNewChat();

  // Test basic functionality
  await chatGPT.sendMessage('Start Word Challenge');
  await chatGPT.waitForResponse();

  const widgetVisible = await chatGPT.isWidgetVisible();

  if (!widgetVisible) {
    // Send alert - something is broken!
    await sendAlert({
      severity: 'critical',
      message: 'GameBox widgets not rendering in ChatGPT',
      timestamp: new Date().toISOString()
    });

    throw new Error('Widget not visible - critical failure');
  }

  console.log('✅ ChatGPT integration is healthy');
});

async function sendAlert(alert: any) {
  // Send to Slack, PagerDuty, email, etc.
  console.error('🚨 ALERT:', alert);
}
```

#### Benefits of Automated ChatGPT Testing

✅ **Catch Breaking Changes**: Know immediately if ChatGPT updates break your app
✅ **Faster Development**: Test all scenarios in 5 minutes vs. 1 hour manually
✅ **Consistent Results**: Same tests every time, no human error
✅ **Regression Prevention**: Ensure new features don't break existing ones
✅ **CI/CD Integration**: Block deployments if ChatGPT integration fails
✅ **Documentation**: Test code serves as live documentation
✅ **Confidence**: Deploy knowing everything works in real ChatGPT

#### Best Practices

1. **Keep authentication fresh**: Re-authenticate weekly to avoid session expiry
2. **Run tests on staging first**: Test against staging environment before production
3. **Monitor ChatGPT changes**: OpenAI may update their UI, tests may need updates
4. **Use stable selectors**: Prefer `data-testid` over CSS classes that may change
5. **Add retry logic**: ChatGPT responses can vary in timing
6. **Record videos**: Keep videos of failures for debugging
7. **Test on real devices**: Use BrowserStack/Sauce Labs for mobile device testing

---

This automated testing approach is **the pinnacle of testing** - it validates your app works perfectly in the actual ChatGPT environment that users will experience, all automatically through Claude Code!

---

### 🎯 Using Claude Code's Playwright Plugin

**Even better** - Since you have the Playwright plugin installed in Claude Code, you can test your app in ChatGPT **directly through Claude Code** using MCP browser tools!

#### Available Playwright MCP Tools

The Claude Code Playwright plugin provides these browser automation tools:

- `browser_navigate` - Navigate to URLs (ChatGPT)
- `browser_snapshot` - Capture accessibility snapshot of the page
- `browser_click` - Click elements
- `browser_type` - Type text into inputs
- `browser_fill_form` - Fill multiple form fields
- `browser_take_screenshot` - Capture screenshots
- `browser_evaluate` - Run JavaScript on the page
- `browser_console_messages` - Get console logs
- `browser_network_requests` - Monitor network activity

#### Quick Test Example Using Claude Code

You can ask Claude Code to test your app in ChatGPT like this:

**Example prompt to Claude Code:**

```
Test my GameBox app in ChatGPT:

1. Navigate to chat.openai.com
2. Start a new chat
3. Type "I want to play Wordle"
4. Take a snapshot to see if the widget rendered
5. Check console logs for errors
6. Take a screenshot of the result
```

#### Step-by-Step Testing with Playwright Plugin

**File**: `testing/chatgpt-manual-test.md`

```markdown
# ChatGPT Testing Checklist (Using Claude Code Playwright Plugin)

## Test 1: Word Challenge Tool Discovery

Ask Claude Code to run:

1. Navigate to https://chat.openai.com
2. Click new chat button
3. Type "I want to play Wordle" into chat input
4. Press Enter
5. Wait 5 seconds for response
6. Take snapshot to see page structure
7. Take screenshot named "word-challenge-test.png"
8. Check console messages for errors

Expected Results:
- ✅ startWordChallenge tool was called
- ✅ Widget iframe is present
- ✅ No console errors
- ✅ Screenshot shows game board

## Test 2: Full Game Flow

Ask Claude Code to run:

1. Start at chat.openai.com
2. Type "Play Word Challenge"
3. Wait for widget to load
4. Fill input with "CRANE"
5. Click submit button
6. Wait 2 seconds
7. Take snapshot - should see feedback row
8. Check network requests show successful API call

## Test 3: All Games Discovery

For each game, ask Claude Code:
- Navigate to ChatGPT
- Type trigger prompt
- Verify tool called via snapshot
- Screenshot result
- Document if working
```

#### Interactive Testing Session

Here's how to run a live testing session with Claude Code:

**Prompt to Claude Code:**

```
Help me test my GameBox app in ChatGPT. Please:

1. Navigate to chat.openai.com
2. Take a snapshot so I can see the page structure
3. Start a new chat
4. Send the message "I want to play Wordle"
5. Wait for the response to complete
6. Take another snapshot to see if my widget loaded
7. Check for any console errors
8. Take a screenshot for documentation
9. Tell me if the test passed or failed

My server is running at: https://gamebox-dev.fly.dev
```

Claude Code will execute each step and report back with:
- ✅ What worked
- ❌ What failed
- 📸 Screenshots of the current state
- 🐛 Any errors found

#### Debugging Widget Issues

If widgets aren't showing, ask Claude Code to:

```
Debug my ChatGPT widget:

1. Navigate to chat.openai.com
2. Open browser console
3. Trigger "Play Wordle"
4. Get all console messages
5. Get network requests
6. Check if widget iframe exists
7. Evaluate this JavaScript:
   document.querySelector('[data-widget-id]') !== null
8. Screenshot the result
9. Report what you found
```

#### Automated Test Script for Claude Code

Create a test script that Claude Code can run repeatedly:

**File**: `testing/claude-code-test-script.md`

```markdown
# Automated ChatGPT Test Script for Claude Code

Run this test daily before deployment:

## Pre-Test Setup
- [ ] Ensure server is running at production URL
- [ ] Verify ngrok tunnel is active (if using local dev)
- [ ] Clear browser cache (optional)

## Test Suite

### Test 1: Connection Test
1. Navigate to https://chat.openai.com
2. Verify page loads (check title)
3. Take snapshot
4. **PASS/FAIL**: Page loaded successfully

### Test 2: Word Challenge - Positive Trigger
1. Click new chat
2. Type: "I want to play Wordle"
3. Press Enter
4. Wait 10 seconds
5. Take snapshot
6. Evaluate: `document.querySelector('[data-widget-id]') !== null`
7. Screenshot as "test-word-challenge-success.png"
8. **PASS/FAIL**: Widget rendered

### Test 3: Word Challenge - Negative Trigger
1. Click new chat
2. Type: "Tell me about Wordle"
3. Press Enter
4. Wait 10 seconds
5. Take snapshot
6. Evaluate: `document.querySelector('[data-widget-id]') === null`
7. **PASS/FAIL**: Widget did NOT render (correct)

### Test 4: Widget Interaction
1. Start new chat
2. Type: "Play Word Challenge"
3. Wait for widget
4. Fill form field (input): "CRANE"
5. Click submit button
6. Wait 3 seconds
7. Take snapshot
8. Check for feedback row
9. Screenshot as "test-widget-interaction.png"
10. **PASS/FAIL**: Guess submitted and feedback shown

### Test 5: Error Handling
1. Start new chat
2. Trigger Word Challenge
3. Fill input: "CAT" (invalid - too short)
4. Click submit
5. Wait 2 seconds
6. Take snapshot
7. Look for error message in DOM
8. **PASS/FAIL**: Error message displayed

### Test 6: Mobile View
1. Resize browser to 375x667 (iPhone size)
2. Navigate to chat.openai.com
3. Trigger Word Challenge
4. Take snapshot
5. Screenshot as "test-mobile-view.png"
6. **PASS/FAIL**: Widget is responsive

### Test 7: Performance Check
1. Start new chat
2. Note timestamp
3. Type "Play Wordle"
4. Wait for widget to appear
5. Note timestamp
6. Calculate duration
7. **PASS/FAIL**: Widget appeared in < 2 seconds

### Test 8: Console Error Check
1. Start fresh chat
2. Trigger any game
3. Get console messages (error level)
4. **PASS/FAIL**: No console errors

## Test Results Template

| Test | Status | Notes | Screenshot |
|------|--------|-------|------------|
| Connection | ✅/❌ | | |
| Word Challenge Trigger | ✅/❌ | | test-word-challenge-success.png |
| Negative Trigger | ✅/❌ | | |
| Widget Interaction | ✅/❌ | | test-widget-interaction.png |
| Error Handling | ✅/❌ | | |
| Mobile View | ✅/❌ | | test-mobile-view.png |
| Performance | ✅/❌ | Duration: ___ ms | |
| Console Errors | ✅/❌ | | |

## Next Steps
- [ ] If all tests pass → Ready for submission
- [ ] If tests fail → Fix issues and re-test
- [ ] Document any findings in GitHub issues
```

#### Example: Running a Test with Claude Code

**Your prompt:**
```
Run Test 2 from the test script: Check if "I want to play Wordle" triggers the Word Challenge widget
```

**Claude Code will:**
1. Navigate to ChatGPT
2. Start a new chat
3. Send the message
4. Wait for response
5. Check if widget appeared
6. Report results with screenshot

**Claude Code response:**
```
✅ Test 2: PASSED

Results:
- Navigated to chat.openai.com successfully
- Started new chat
- Sent message: "I want to play Wordle"
- Waited 10 seconds for response
- Widget detected: YES (found [data-widget-id] element)
- Screenshot saved: test-word-challenge-success.png

Console messages: No errors
Network requests: All successful (200 status)

The startWordChallenge tool was triggered correctly and the widget rendered!
```

#### Daily Automated Testing

Set up a daily routine where you ask Claude Code:

```
Run the full ChatGPT test suite from testing/claude-code-test-script.md
and report all results in a table format
```

Claude Code will:
- Execute all 8 tests sequentially
- Capture screenshots at each step
- Log all results
- Provide a summary report
- Flag any failures with details

#### Benefits of Using Claude Code's Playwright Plugin

✅ **No setup required** - Plugin is already installed
✅ **Interactive testing** - Ask questions, get immediate feedback
✅ **Natural language** - Describe tests in plain English
✅ **Visual results** - Get snapshots and screenshots automatically
✅ **Debugging help** - Claude Code can investigate issues
✅ **Flexible** - Test on-demand, no need to write code first
✅ **Fast iteration** - Modify tests in real-time during conversation

#### Advanced: Continuous Testing Loop

You can ask Claude Code to run tests in a loop:

```
Please run this testing loop 5 times and report if all iterations pass:

1. Navigate to chat.openai.com
2. Clear cookies/start fresh
3. Trigger Word Challenge
4. Verify widget loads
5. Take screenshot with timestamp
6. Wait 30 seconds
7. Repeat

Report: How many times did it work vs fail?
```

This helps identify flaky behavior or intermittent issues.

#### Integration with Your Workflow

**Before deploying:**
```
"Test my app in ChatGPT and tell me if it's ready for production"
```

**After code changes:**
```
"Run a quick smoke test of Word Challenge in ChatGPT to verify nothing broke"
```

**When debugging:**
```
"Help me figure out why my widget isn't showing in ChatGPT - check console, network, and DOM"
```

**Before submitting to App Directory:**
```
"Run the complete test suite from claude-code-test-script.md and create a test report"
```

---

With Claude Code's Playwright plugin, you have **instant access to real ChatGPT environment testing** without writing a single line of test code - just describe what you want tested in natural language!

### Manual Testing Checklist

#### Tool Discovery

- [ ] Type "I want to play Wordle" → Correct tool triggers
- [ ] Type "Start a word game" → Correct tool triggers
- [ ] Type "Play 20 questions" → Correct tool triggers
- [ ] Negative: "Tell me a joke" → No game tools trigger

#### Tool Execution

- [ ] Tool parameters are correctly extracted from natural language
- [ ] Tool responses display properly in ChatGPT
- [ ] Widgets render inline without errors
- [ ] Error messages are clear and actionable

#### Widget Testing

- [ ] Widgets load within 2 seconds
- [ ] Interactive elements (buttons, inputs) work correctly
- [ ] State persists across tool calls
- [ ] Widgets are responsive on mobile (iOS and Android)
- [ ] No console errors in browser DevTools

#### Authentication (if applicable)

- [ ] OAuth flow completes successfully
- [ ] Invalid credentials show meaningful error
- [ ] Token refresh works correctly
- [ ] Logout/reauth flows work

#### Edge Cases

- [ ] Concurrent games don't interfere with each other
- [ ] Network errors are handled gracefully
- [ ] Rate limiting works as expected
- [ ] Large responses don't timeout

### Mobile Testing

Test on actual devices:

**iOS:**
1. Open ChatGPT app on iPhone/iPad
2. Enable your developer connector
3. Run through all test scenarios
4. Check layout, touch targets, rendering

**Android:**
1. Open ChatGPT app on Android device
2. Enable your developer connector
3. Run through all test scenarios
4. Check layout, touch targets, rendering

---

## 6. Pre-Submission Validation

Before submitting to the ChatGPT App Directory, complete this checklist.

### Automated Pre-Submission Script

**File**: `scripts/pre-submission-check.ts`

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

async function runPreSubmissionChecks(): Promise<void> {
  console.log(chalk.bold('\n🚀 GameBox Pre-Submission Validation\n'));

  const checks: CheckResult[] = [];

  // 1. Unit tests
  checks.push(await runCheck(
    'Unit Tests',
    'npm run test',
    'All unit tests must pass'
  ));

  // 2. Type checking
  checks.push(await runCheck(
    'Type Check',
    'npm run type-check',
    'No TypeScript errors'
  ));

  // 3. Linting
  checks.push(await runCheck(
    'ESLint',
    'npm run lint',
    'No linting errors'
  ));

  // 4. Build
  checks.push(await runCheck(
    'Build',
    'npm run build',
    'Build completes successfully'
  ));

  // 5. Coverage threshold
  checks.push(await runCheck(
    'Test Coverage',
    'npm run test:coverage',
    'Coverage meets 80% threshold'
  ));

  // 6. MCP validation
  checks.push(await validateMCPServer());

  // 7. Tool descriptions
  checks.push(await validateToolDescriptions());

  // 8. Schema validation
  checks.push(await validateSchemas());

  // 9. Widget bundle size
  checks.push(await checkBundleSize());

  // 10. Security audit
  checks.push(await runCheck(
    'Security Audit',
    'npm audit --audit-level=moderate',
    'No moderate or higher vulnerabilities'
  ));

  // Print results
  console.log(chalk.bold('\n📊 Results:\n'));

  let allPassed = true;
  checks.forEach(check => {
    const icon = check.passed ? '✅' : '❌';
    const color = check.passed ? chalk.green : chalk.red;
    console.log(`${icon} ${color(check.name)}: ${check.message}`);
    if (!check.passed) allPassed = false;
  });

  console.log('\n' + '='.repeat(60) + '\n');

  if (allPassed) {
    console.log(chalk.green.bold('✅ All checks passed! Ready for submission.\n'));
    process.exit(0);
  } else {
    console.log(chalk.red.bold('❌ Some checks failed. Please fix before submission.\n'));
    process.exit(1);
  }
}

async function runCheck(
  name: string,
  command: string,
  description: string
): Promise<CheckResult> {
  try {
    await execAsync(command, { cwd: process.cwd() });
    return { name, passed: true, message: description };
  } catch (error) {
    return {
      name,
      passed: false,
      message: `${description} - FAILED`
    };
  }
}

async function validateMCPServer(): Promise<CheckResult> {
  // Use MCP Inspector to validate server
  try {
    const { stdout } = await execAsync(
      'npx @modelcontextprotocol/inspector node dist/index.js --validate'
    );
    return {
      name: 'MCP Server',
      passed: true,
      message: 'Server validates correctly'
    };
  } catch {
    return {
      name: 'MCP Server',
      passed: false,
      message: 'Server validation failed'
    };
  }
}

async function validateToolDescriptions(): Promise<CheckResult> {
  // Check that all tools have proper descriptions
  const tools = await loadToolDefinitions();

  for (const tool of tools) {
    if (!tool.description || tool.description.length < 20) {
      return {
        name: 'Tool Descriptions',
        passed: false,
        message: `Tool "${tool.name}" needs a more descriptive description`
      };
    }

    if (!tool.inputSchema) {
      return {
        name: 'Tool Descriptions',
        passed: false,
        message: `Tool "${tool.name}" missing input schema`
      };
    }
  }

  return {
    name: 'Tool Descriptions',
    passed: true,
    message: 'All tools have proper descriptions and schemas'
  };
}

async function validateSchemas(): Promise<CheckResult> {
  // Validate that all schemas are well-formed
  const tools = await loadToolDefinitions();

  for (const tool of tools) {
    try {
      JSON.parse(JSON.stringify(tool.inputSchema));
      if (tool.outputSchema) {
        JSON.parse(JSON.stringify(tool.outputSchema));
      }
    } catch {
      return {
        name: 'Schema Validation',
        passed: false,
        message: `Invalid schema in tool "${tool.name}"`
      };
    }
  }

  return {
    name: 'Schema Validation',
    passed: true,
    message: 'All schemas are valid JSON'
  };
}

async function checkBundleSize(): Promise<CheckResult> {
  // Check widget bundle sizes
  const maxSize = 500 * 1024; // 500KB

  // Check dist/assets/*.js files
  const { stdout } = await execAsync('du -sb web/dist/assets/*.js');
  const sizes = stdout.split('\n').map(line => {
    const match = line.match(/^(\d+)/);
    return match ? parseInt(match[1]) : 0;
  });

  const totalSize = sizes.reduce((sum, size) => sum + size, 0);

  if (totalSize > maxSize) {
    return {
      name: 'Bundle Size',
      passed: false,
      message: `Widgets exceed ${maxSize / 1024}KB (${totalSize / 1024}KB)`
    };
  }

  return {
    name: 'Bundle Size',
    passed: true,
    message: `Widgets are ${(totalSize / 1024).toFixed(2)}KB`
  };
}

async function loadToolDefinitions(): Promise<any[]> {
  // Load your tool definitions
  // This depends on how you structure your tools
  return [];
}

// Run checks
runPreSubmissionChecks();
```

### Run Pre-Submission Check

```bash
npm run pre-submit
```

### Manual Submission Checklist

Before clicking "Submit":

#### Documentation

- [ ] README.md is complete and accurate
- [ ] All tool descriptions are clear and specific
- [ ] Privacy policy is provided (if handling user data)
- [ ] Support contact information is current

#### Credentials

- [ ] Demo account credentials provided (if auth required)
- [ ] Demo account has sample data
- [ ] No 2FA or additional signup steps needed

#### Tool Configuration

- [ ] Tool names are human-readable
- [ ] Tool hints are correctly set:
  - `readOnlyHint`: true for read-only tools
  - `openWorldHint`: false for internal tools
  - `destructiveHint`: true for destructive actions
- [ ] Tool parameters are minimal and purpose-driven

#### Quality

- [ ] No crashes, hangs, or inconsistent behavior
- [ ] Error messages are clear and actionable
- [ ] Performance is acceptable (< 2s for most operations)
- [ ] Mobile experience tested on iOS and Android

#### Compliance

- [ ] App complies with [OpenAI App Submission Guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines/)
- [ ] Content is appropriate
- [ ] No violations of OpenAI policies

---

## Automated Testing Pipeline

Create a CI/CD pipeline for continuous validation.

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, development]
  pull_request:
    branches: [main, development]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install server dependencies
        working-directory: ./server
        run: npm ci

      - name: Install web dependencies
        working-directory: ./web
        run: npm ci

      - name: Type check (server)
        working-directory: ./server
        run: npm run type-check

      - name: Type check (web)
        working-directory: ./web
        run: npm run type-check

      - name: Lint (server)
        working-directory: ./server
        run: npm run lint

      - name: Lint (web)
        working-directory: ./web
        run: npm run lint

      - name: Unit tests (server)
        working-directory: ./server
        run: npm run test:coverage

      - name: Unit tests (web)
        working-directory: ./web
        run: npm run test:coverage

      - name: Build server
        working-directory: ./server
        run: npm run build

      - name: Build web
        working-directory: ./web
        run: npm run build

      - name: MCP validation
        working-directory: ./server
        run: |
          npx @modelcontextprotocol/inspector node dist/index.js --validate

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./server/coverage/coverage-final.json,./web/coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js 20.x
        uses: actions/setup-node@v3
        with:
          node-version: 20.x

      - name: Install dependencies
        run: |
          cd server && npm ci
          cd ../web && npm ci

      - name: Build
        run: |
          cd server && npm run build
          cd ../web && npm run build

      - name: Start server
        working-directory: ./server
        run: |
          npm start &
          sleep 5

      - name: Run E2E tests
        working-directory: ./server
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: npm run test:e2e
```

---

## Testing Tools

### Recommended Tools

| Tool | Purpose | Link |
|------|---------|------|
| **Vitest** | Unit testing framework | [vitest.dev](https://vitest.dev) |
| **Playwright** | Browser automation & E2E testing | [playwright.dev](https://playwright.dev) |
| **MCP Inspector** | Official MCP server testing | [GitHub](https://github.com/modelcontextprotocol/inspector) |
| **MCP Testing Framework** | Automated MCP testing | [GitHub](https://github.com/haakco/mcp-testing-framework) |
| **Testing Library** | React component testing | [testing-library.com](https://testing-library.com) |
| **OpenAI API** | Agent-based testing | [platform.openai.com](https://platform.openai.com) |
| **ngrok** | Local HTTPS tunneling | [ngrok.com](https://ngrok.com) |

### Development Tools

```bash
# Install testing dependencies
cd server
npm install --save-dev vitest @vitest/coverage-v8 @haakco/mcp-testing-framework

cd web
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

---

## Best Practices

### 1. Test-Driven Development

Write tests before implementing features:

```typescript
// 1. Write the test
it('should reject invalid guess length', async () => {
  await expect(
    submitGuess({ gameId: 'test', guess: 'CAT' })
  ).rejects.toThrow('Guess must be exactly 5 letters');
});

// 2. Implement the feature
export async function submitGuess(input: GuessInput) {
  if (input.guess.length !== 5) {
    throw new Error('Guess must be exactly 5 letters');
  }
  // ... rest of implementation
}

// 3. Verify test passes
```

### 2. Maintain Test Fixtures

Keep test data alongside code:

```
server/src/__tests__/
├── fixtures/
│   ├── wordLists.ts
│   ├── sampleGames.ts
│   └── mockResponses.ts
└── tools/
    └── wordChallenge.test.ts
```

### 3. Document Test Scenarios

Add comments explaining complex test scenarios:

```typescript
it('should handle rapid consecutive guesses', async () => {
  // Simulates user submitting multiple guesses quickly
  // This can happen if user clicks submit button multiple times
  // Expected: Only first guess should be processed

  const gameId = 'test-123';
  const promises = [
    submitGuess({ gameId, guess: 'CRANE' }),
    submitGuess({ gameId, guess: 'SLATE' }),
    submitGuess({ gameId, guess: 'PRIME' })
  ];

  const results = await Promise.allSettled(promises);

  // Only one should succeed
  const succeeded = results.filter(r => r.status === 'fulfilled');
  expect(succeeded).toHaveLength(1);
});
```

### 4. Use Factories for Test Data

Create helper functions to generate test data:

```typescript
// server/src/__tests__/factories/gameFactory.ts
export function createGame(overrides = {}) {
  return {
    gameId: `test-${Date.now()}`,
    mode: 'practice',
    targetWord: 'CRANE',
    guesses: [],
    maxGuesses: 6,
    isComplete: false,
    ...overrides
  };
}

// Usage in tests
const game = createGame({ mode: 'daily' });
```

### 5. Test Error Paths

Don't just test happy paths:

```typescript
describe('Error Handling', () => {
  it('should handle database connection failure', async () => {
    // Mock database failure
    mockDatabase.connect.mockRejectedValue(new Error('Connection refused'));

    await expect(startWordChallenge({ mode: 'daily' }))
      .rejects.toThrow('Unable to start game. Please try again.');
  });

  it('should handle rate limiting', async () => {
    // Make 100 requests rapidly
    const promises = Array(100).fill(null).map(() =>
      startWordChallenge({ mode: 'practice' })
    );

    const results = await Promise.allSettled(promises);
    const rateLimited = results.filter(
      r => r.status === 'rejected' &&
      r.reason.message.includes('rate limit')
    );

    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

### 6. Keep Tests Fast

- Use mocks for external dependencies
- Avoid unnecessary sleeps/waits
- Run tests in parallel when possible

```typescript
// Good: Fast test with mocks
const mockWordList = ['CRANE', 'SLATE', 'PRIME'];
vi.mock('../../data/wordList', () => ({
  getRandomWord: () => mockWordList[0]
}));

// Bad: Slow test with real database
await database.connect();
const word = await database.query('SELECT word FROM words ORDER BY RANDOM() LIMIT 1');
```

---

## Common Issues

### Issue 1: Tool Not Triggering

**Problem**: ChatGPT doesn't call your tool when expected.

**Solutions**:
- Improve tool description to be more specific
- Add more keywords to description
- Test with "golden prompts"
- Check tool name is descriptive

### Issue 2: Schema Validation Errors

**Problem**: Tool calls fail with schema errors.

**Solutions**:
- Validate schemas with JSON Schema validator
- Ensure `required` fields are present
- Check parameter types match schema
- Test with MCP Inspector first

### Issue 3: Widget Not Rendering

**Problem**: Widget shows blank or error state.

**Solutions**:
- Check browser console for errors
- Verify widget bundle loads correctly
- Ensure CSP headers allow widget domain
- Test widget in isolation first

### Issue 4: Slow Performance

**Problem**: Tools take too long to respond.

**Solutions**:
- Add performance benchmarks to tests
- Profile slow operations
- Add caching where appropriate
- Optimize database queries

### Issue 5: Flaky Tests

**Problem**: Tests sometimes pass, sometimes fail.

**Solutions**:
- Identify race conditions
- Use proper async/await
- Mock time-dependent code
- Increase timeouts only as last resort

---

## Sources & References

- [App submission guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines/)
- [Test your integration](https://developers.openai.com/apps-sdk/deploy/testing/)
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)
- [MCP Testing Framework](https://github.com/haakco/mcp-testing-framework)
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk)

---

## Next Steps

1. **Set up testing infrastructure**
   ```bash
   cd server && npm install --save-dev vitest @vitest/coverage-v8
   cd ../web && npm install --save-dev @testing-library/react
   ```

2. **Create your first tests**
   - Start with unit tests for game logic
   - Add component tests for widgets
   - Implement integration tests

3. **Use MCP Inspector**
   - Test each tool individually
   - Verify error handling
   - Check performance

4. **Run pre-submission check**
   ```bash
   npm run pre-submit
   ```

5. **Test in ChatGPT**
   - Deploy to ngrok or production
   - Test with golden prompts
   - Validate on mobile devices

6. **Submit your app**
   - Review submission checklist
   - Provide demo credentials
   - Submit for review

---

**Ready to build with confidence!** 🎮

Your GameBox app will be thoroughly tested and ready for the ChatGPT App Directory with this comprehensive testing strategy.
