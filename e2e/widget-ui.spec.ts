import { test, expect } from '@playwright/test';

/**
 * Word Challenge Widget UI Tests
 *
 * Visual and interaction testing of the widget itself.
 * Tests the React component rendering, styling, and user interactions.
 */

test.describe('Word Challenge Widget UI', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the widget (served by Vite)
    await page.goto('http://localhost:4444/');

    // Wait for the widget to load
    await page.waitForSelector('h1:has-text("Word Challenge")');
  });

  test('should render the game title', async ({ page }) => {
    const title = page.locator('h1:has-text("Word Challenge")');
    await expect(title).toBeVisible();
    await expect(title).toHaveClass(/font-bold/);
  });

  test('should render 6x5 grid of tiles', async ({ page }) => {
    // Count all tiles in the game board
    // Should be 6 rows × 5 tiles = 30 tiles
    const tiles = page.locator('[class*="w-14 h-14"]');
    await expect(tiles).toHaveCount(30);
  });

  test('should display current guess indicator', async ({ page }) => {
    const guessIndicator = page.locator('text=Guess 1 of 6');
    await expect(guessIndicator).toBeVisible();
  });

  test('should render complete keyboard', async ({ page }) => {
    // Check for key letters
    await expect(page.locator('button:has-text("Q")')).toBeVisible();
    await expect(page.locator('button:has-text("A")')).toBeVisible();
    await expect(page.locator('button:has-text("Z")')).toBeVisible();

    // Check for special keys
    await expect(page.locator('button:has-text("ENTER")')).toBeVisible();
    await expect(page.locator('button:has-text("⌫")')).toBeVisible();
  });

  test('should respond to keyboard clicks', async ({ page }) => {
    // Click letters to spell "CRANE"
    // Use getByRole with exact name to avoid matching substrings (e.g., R in ENTER)
    const allTiles = page.locator('div[class*="w-14 h-14"]');

    await page.getByRole('button', { name: 'C', exact: true }).click();
    await expect(allTiles.nth(0)).toHaveText('C');

    await page.getByRole('button', { name: 'R', exact: true }).click();
    await expect(allTiles.nth(1)).toHaveText('R');

    await page.getByRole('button', { name: 'A', exact: true }).click();
    await expect(allTiles.nth(2)).toHaveText('A');

    await page.getByRole('button', { name: 'N', exact: true }).click();
    await expect(allTiles.nth(3)).toHaveText('N');

    await page.getByRole('button', { name: 'E', exact: true }).click();
    await expect(allTiles.nth(4)).toHaveText('E');
  });

  test('should handle backspace key', async ({ page }) => {
    // Type some letters
    await page.click('button:has-text("C")');
    await page.click('button:has-text("R")');
    await page.click('button:has-text("A")');

    // Click backspace
    await page.click('button:has-text("⌫")');

    // Verify last letter removed
    const allTiles = page.locator('div[class*="w-14 h-14"]');
    await expect(allTiles.nth(0)).toHaveText('C');
    await expect(allTiles.nth(1)).toHaveText('R');
    await expect(allTiles.nth(2)).toHaveText('');
  });

  test('should not allow more than 5 letters', async ({ page }) => {
    // Try to type 6 letters
    const allTiles = page.locator('div[class*="w-14 h-14"]');

    await page.getByRole('button', { name: 'C', exact: true }).click();
    await page.getByRole('button', { name: 'R', exact: true }).click();
    await page.getByRole('button', { name: 'A', exact: true }).click();
    await page.getByRole('button', { name: 'N', exact: true }).click();
    await page.getByRole('button', { name: 'E', exact: true }).click();

    // Verify 5 letters entered
    await expect(allTiles.nth(4)).toHaveText('E');

    // Try to add 6th letter - should be ignored
    await page.getByRole('button', { name: 'S', exact: true }).click();

    // Verify still only 5 letters (S was ignored)
    await expect(allTiles.nth(0)).toHaveText('C');
    await expect(allTiles.nth(1)).toHaveText('R');
    await expect(allTiles.nth(2)).toHaveText('A');
    await expect(allTiles.nth(3)).toHaveText('N');
    await expect(allTiles.nth(4)).toHaveText('E');
  });

  test('should show validation message for incomplete guess', async ({ page }) => {
    // Type only 3 letters
    await page.click('button:has-text("C")');
    await page.click('button:has-text("A")');
    await page.click('button:has-text("T")');

    // Try to submit
    await page.click('button:has-text("ENTER")');

    // Verify error message
    await expect(page.locator('text=Word must be 5 letters')).toBeVisible();
  });

  test('should show placeholder message for complete guess', async ({ page }) => {
    // Type 5 letters
    await page.getByRole('button', { name: 'C', exact: true }).click();
    await page.getByRole('button', { name: 'R', exact: true }).click();
    await page.getByRole('button', { name: 'A', exact: true }).click();
    await page.getByRole('button', { name: 'N', exact: true }).click();
    await page.getByRole('button', { name: 'E', exact: true }).click();

    // Try to submit
    await page.getByRole('button', { name: 'ENTER', exact: true }).click();

    // Verify placeholder message (since MCP not fully integrated in test harness)
    // Use partial text match in case of whitespace differences
    await expect(page.getByText(/Connect to game server/)).toBeVisible();
  });

  test('should have correct tile styling', async ({ page }) => {
    const tiles = page.locator('[class*="w-14 h-14"]').first();

    // Check tile dimensions
    await expect(tiles).toHaveCSS('width', '56px'); // w-14 = 3.5rem = 56px
    await expect(tiles).toHaveCSS('height', '56px'); // h-14 = 3.5rem = 56px

    // Check tile has rounded corners
    const borderRadius = await tiles.evaluate((el) =>
      window.getComputedStyle(el).borderRadius
    );
    expect(borderRadius).not.toBe('0px');
  });

  test('should have empty tiles with border', async ({ page }) => {
    // Empty tiles should have border
    const emptyTile = page.locator('[class*="w-14 h-14"]').first();
    await expect(emptyTile).toHaveClass(/border/);
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
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

    // Widget should still be visible
    await expect(page.locator('h1:has-text("Word Challenge")')).toBeVisible();

    // Game board should be visible
    await expect(page.locator('[class*="w-14 h-14"]').first()).toBeVisible();

    // Keyboard should be visible
    await expect(page.locator('button:has-text("Q")')).toBeVisible();
  });

  test('should have proper text styling', async ({ page }) => {
    const title = page.locator('h1:has-text("Word Challenge")');

    // Check font size (text-3xl)
    const fontSize = await title.evaluate((el) =>
      window.getComputedStyle(el).fontSize
    );
    expect(parseInt(fontSize)).toBeGreaterThan(20); // Should be large

    // Check font weight (font-bold)
    const fontWeight = await title.evaluate((el) =>
      window.getComputedStyle(el).fontWeight
    );
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(700);
  });
});
