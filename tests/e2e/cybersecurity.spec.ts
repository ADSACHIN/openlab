import { expect, test } from '@playwright/test';

test.describe('cybersecurity domain', () => {
  test('lab: bypass the vulnerable login, then see parameterized queries stop it', async ({
    page,
  }) => {
    await page.goto('./#/domains/cybersecurity/labs/bypass-the-login');
    await page.getByLabel('Username').fill("admin' --");
    await page.getByLabel(/^Password/).fill('anything');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('status', { name: 'Simulation status' })).toHaveText(
      'Logged in as admin. The query matched 1 row.',
    );
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText(/You are admin without the password/)).toBeVisible();
    await page.getByRole('radio', { name: /Parameterized query/ }).check();
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByText('Access denied.')).toBeVisible();
  });

  test('lab: neutralise an XSS payload by escaping output', async ({ page }) => {
    await page.goto('./#/domains/cybersecurity/labs/neutralise-the-payload');
    await page.getByRole('button', { name: 'Script tag' }).click();
    await expect(page.getByText(/Would run JavaScript via a/)).toBeVisible();
    await page.getByRole('radio', { name: /Escape for HTML/ }).check();
    await expect(page.getByText(/Shows the comment as text/)).toBeVisible();
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText(/nothing runs/).last()).toBeVisible();
    // The payload must never become a real element in OPENLAB's own page.
    await expect(page.locator('main script')).toHaveCount(0);
  });

  test('hash cracker: salted run costs 40 hashes and still cracks 3', async ({ page }) => {
    await page.goto('./#/domains/cybersecurity/lessons/hashing-and-salting');
    await page.getByLabel(/per-user salt/).check();
    for (let i = 0; i < 10; i++) await page.getByRole('button', { name: 'Step' }).click();
    await expect(page.getByRole('status', { name: 'Simulation status' })).toContainText(
      '3 of 4 accounts cracked after 40 hash computations (salted)',
    );
  });
});
