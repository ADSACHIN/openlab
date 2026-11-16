import { expect, test } from '@playwright/test';

test.describe('programming domain', () => {
  test('tracer lesson steps through the program', async ({ page }) => {
    await page.goto('./#/domains/programming/lessons/state-and-steps');
    // 2 setup lines + 4 iterations × 3 lines + final loop check + print = 16 steps
    for (let i = 0; i < 16; i++) await page.getByRole('button', { name: 'Step' }).click();
    await expect(page.getByRole('status', { name: 'Simulation status' })).toContainText(
      'Output: 10',
    );
  });

  test('lab: nearly sorted data with insertion sort', async ({ page }) => {
    await page.goto('./#/domains/programming/labs/nearly-sorted');
    await page.getByRole('radio', { name: 'Nearly sorted' }).check();
    await page.getByRole('radio', { name: 'Insertion' }).check();
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByText('Finished', { exact: true })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText(/only moves the few out-of-place items/)).toBeVisible();
  });

  test('lab: binary search by hand in five guesses', async ({ page }) => {
    await page.goto('./#/domains/programming/labs/five-guesses');
    const group = page.getByRole('group', { name: /Sorted list/ });
    for (let i = 0; i < 6; i++) {
      const status = await page.getByRole('status', { name: 'Simulation status' }).textContent();
      if (status?.includes('Found')) break;
      const enabled = group.getByRole('button', { disabled: false });
      const count = await enabled.count();
      await enabled.nth(Math.floor((count - 1) / 2)).click();
    }
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText(/worst case for 31 items is five/)).toBeVisible();
  });
});
