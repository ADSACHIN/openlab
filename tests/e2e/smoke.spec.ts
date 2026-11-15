import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
  test('home page loads with the domain catalogue', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle(/OPENLAB/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn technology');
    await expect(page.getByRole('article')).toHaveCount(8);
  });

  test('navigates to a domain and back via hash routes', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('link', { name: 'Networking' }).click();
    await expect(page).toHaveURL(/#\/domains\/networking$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Networking');
    await page.getByRole('link', { name: 'All domains' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn technology');
  });

  test('deep link and reload keep working (HashRouter)', async ({ page }) => {
    await page.goto('./#/domains/ai-ml');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('AI & ML');
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('AI & ML');
  });

  test('unknown routes show the 404 page', async ({ page }) => {
    await page.goto('./#/nothing/here');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  });

  test('theme toggle persists across reload', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /system theme/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('skip link moves focus to main content', async ({ page }) => {
    await page.goto('./');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });
});
