import { test, expect, Page } from '@playwright/test';

/**
 * Word Challenge Widget UI Tests
 *
 * Visual and interaction testing of the widget itself.
 * Tests the React component rendering, styling, and user interactions.
 */

// Helper functions
const getTiles = (page: Page) => page.locator('div[class*="w-14 h-14"]');

const clickButton = (page: Page, letter: string) =>
  page.getByRole('button', { name: letter, exact: true }).click();

const typeLetters = async (page: Page, letters: string) => {
  for (const letter of letters) {
    await clickButton(page, letter);
  }
};

test.describe('Word Challenge Widget UI', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4444/');
    await page.waitForSelector('h1:has-text("Word Challenge")');
  });

  test('should render the game title', async ({ page }) => {
    const title = page.locator('h1:has-text("Word Challenge")');
    await expect(title).toBeVisible();
    await expect(title).toHaveClass(/font-bold/);
  });

  test('should render 6x5 grid of tiles', async ({ page }) => {
    await expect(getTiles(page)).toHaveCount(30);
  });

  test('should display current guess indicator', async ({ page }) => {
    const guessIndicator = page.locator('text=Guess 1 of 6');
    await expect(guessIndicator).toBeVisible();
  });

  test('should render complete keyboard', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Q', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'A', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Z', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ENTER', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '⌫', exact: true })).toBeVisible();
  });

  test('should respond to keyboard clicks', async ({ page }) => {
    const tiles = getTiles(page);
    const letters = ['C', 'R', 'A', 'N', 'E'];

    for (let i = 0; i < letters.length; i++) {
      await clickButton(page, letters[i]);
      await expect(tiles.nth(i)).toHaveText(letters[i]);
    }
  });

  test('should handle backspace key', async ({ page }) => {
    await typeLetters(page, 'CRA');
    await clickButton(page, '⌫');

    const tiles = getTiles(page);
    await expect(tiles.nth(0)).toHaveText('C');
    await expect(tiles.nth(1)).toHaveText('R');
    await expect(tiles.nth(2)).toHaveText('');
  });

  test('should not allow more than 5 letters', async ({ page }) => {
    const tiles = getTiles(page);
    await typeLetters(page, 'CRANE');
    await expect(tiles.nth(4)).toHaveText('E');

    await clickButton(page, 'S');

    // Verify S was ignored - still CRANE
    const expected = ['C', 'R', 'A', 'N', 'E'];
    for (let i = 0; i < expected.length; i++) {
      await expect(tiles.nth(i)).toHaveText(expected[i]);
    }
  });

  test('should show validation message for incomplete guess', async ({ page }) => {
    await typeLetters(page, 'CAT');
    await clickButton(page, 'ENTER');
    await expect(page.getByText('Word must be 5 letters')).toBeVisible();
  });

  test('should show placeholder message for complete guess', async ({ page }) => {
    await typeLetters(page, 'CRANE');
    await clickButton(page, 'ENTER');
    await expect(page.getByText(/Connect to game server/)).toBeVisible();
  });

  test('should have correct tile styling', async ({ page }) => {
    const tile = getTiles(page).first();
    await expect(tile).toHaveCSS('width', '56px');
    await expect(tile).toHaveCSS('height', '56px');

    const borderRadius = await tile.evaluate((el) => window.getComputedStyle(el).borderRadius);
    expect(borderRadius).not.toBe('0px');
  });

  test('should have empty tiles with border', async ({ page }) => {
    await expect(getTiles(page).first()).toHaveClass(/border/);
  });

  test('should show keyboard with proper layout', async ({ page }) => {
    // First row: QWERTYUIOP
    const firstRow = page.locator('button:has-text("Q")').locator('..').locator('button');
    await expect(firstRow).toHaveCount(10);

    // Second row: ASDFGHJKL
    const secondRow = page.locator('button:has-text("A")').locator('..').locator('button');
    await expect(secondRow).toHaveCount(9);

    // Third row: ENTER Z X C V B N M ⌫
    const thirdRow = page.locator('button:has-text("Z")').locator('..').locator('button');
    await expect(thirdRow).toHaveCount(9);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: 'Word Challenge' })).toBeVisible();
    await expect(getTiles(page).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Q', exact: true })).toBeVisible();
  });

  test('should have proper text styling', async ({ page }) => {
    const title = page.getByRole('heading', { name: 'Word Challenge' });
    const fontSize = await title.evaluate((el) => window.getComputedStyle(el).fontSize);
    const fontWeight = await title.evaluate((el) => window.getComputedStyle(el).fontWeight);

    expect(parseInt(fontSize)).toBeGreaterThan(20);
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(700);
  });
});
