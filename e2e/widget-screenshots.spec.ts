import { test, Page } from '@playwright/test';

/**
 * Widget Screenshot Capture
 *
 * Takes screenshots of the widget at various states for visual inspection.
 */

const typeLetters = async (page: Page, letters: string) => {
  for (const letter of letters) {
    await page.getByRole('button', { name: letter, exact: true }).click();
  }
};

test.describe('Widget Screenshots', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4444/');
    await page.waitForSelector('h1:has-text("Word Morph")');
  });

  test('capture widget initial state', async ({ page }) => {
    await page.screenshot({
      path: 'testing/screenshots/widget-initial-state.png',
      fullPage: true
    });
  });

  test('capture widget after typing', async ({ page }) => {
    await typeLetters(page, 'CRANE');
    await page.screenshot({
      path: 'testing/screenshots/widget-with-letters.png',
      fullPage: true
    });
  });

  test('capture widget on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:4444/');
    await page.waitForSelector('h1:has-text("Word Morph")');
    await page.screenshot({
      path: 'testing/screenshots/widget-mobile.png',
      fullPage: true
    });
  });

  test('capture widget tiles closeup', async ({ page }) => {
    await typeLetters(page, 'CRA');
    const gameBoard = page.locator('text=Guess 1 of 6').locator('..');
    await gameBoard.screenshot({
      path: 'testing/screenshots/widget-tiles-closeup.png'
    });
  });
});
