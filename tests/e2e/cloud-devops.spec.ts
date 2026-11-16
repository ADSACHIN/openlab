import { expect, test } from '@playwright/test';

test.describe('cloud-devops domain', () => {
  test('lab: branch, commit, merge with a real merge commit', async ({ page }) => {
    await page.goto('./#/domains/cloud-devops/labs/merge-a-feature');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByLabel('Checkout').selectOption('feature');
    await page.getByRole('button', { name: 'Commit on feature' }).click();
    await page.getByRole('button', { name: 'Commit on feature' }).click();
    await page.getByLabel('Checkout').selectOption('main');
    await page.getByRole('button', { name: 'Commit on main' }).click();
    await page.getByLabel('Merge into main').selectOption('feature');
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText(/joins 2 feature commits with 1 on main/)).toBeVisible();
  });

  test('lab: reorder the Dockerfile for a 17 s rebuild', async ({ page }) => {
    await page.goto('./#/domains/cloud-devops/labs/cache-friendly-dockerfile');
    await page.getByRole('button', { name: 'Move "COPY . ." down' }).click();
    await page.getByRole('button', { name: 'Move "COPY . ." down' }).click();
    await expect(page.getByText(/Rebuild after this edit:\s*17 s/)).toBeVisible();
    for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'Step' }).click();
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText('17 s: dependencies stay cached across code edits.')).toBeVisible();
  });

  test('lab: fast and safe pipeline', async ({ page }) => {
    await page.goto('./#/domains/cloud-devops/labs/fast-and-safe');
    await page.getByLabel(/The code has a bug/).uncheck();
    await page.getByLabel(/in parallel/).check();
    await page.getByLabel('Speed').selectOption('4');
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByText('Finished', { exact: true })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText(/Green in 8 units/)).toBeVisible();
  });
});
