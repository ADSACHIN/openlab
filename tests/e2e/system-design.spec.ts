import { expect, test } from '@playwright/test';

test.describe('system-design domain', () => {
  test('lab: least connections on four servers handles 5 per tick', async ({ page }) => {
    await page.goto('./#/domains/system-design/labs/handle-five-per-tick');
    const rate = page.getByRole('slider', { name: /Requests per tick/ });
    await rate.focus();
    await rate.press('ArrowRight');
    await rate.press('ArrowRight');
    await page.getByRole('radio', { name: 'Least connections' }).check();
    await page.getByLabel('Servers').selectOption('4');
    await page.getByLabel('Speed').selectOption('4');
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByText('Finished', { exact: true })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText(/Zero drops on 4 servers with least-connections/)).toBeVisible();
  });

  test('quorum: W=1, R=1 reads stale data', async ({ page }) => {
    await page.goto('./#/domains/system-design/lessons/replication-and-consistency');
    await page.getByRole('button', { name: 'Step' }).click();
    await page.getByRole('button', { name: 'Step' }).click();
    await expect(page.getByText('Read returned version 1: stale.')).toBeVisible();
  });
});
