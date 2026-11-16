import { expect, test } from '@playwright/test';

test('learning paths: pick a goal, follow the path into another domain', async ({ page }) => {
  await page.goto('./');
  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'Paths' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Learning paths');
  await page.getByLabel('Goal lesson').selectOption('cloud-devops/containers-and-layers');
  await expect(page.getByRole('status')).toContainText('5 lessons · 2 domains');
  await page
    .getByRole('list', { name: 'Lessons in order' })
    .getByRole('link', { name: 'Processes and the scheduler' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Processes and the scheduler');
  await page.getByRole('link', { name: 'Path to this lesson' }).click();
  await expect(page.getByLabel('Goal lesson')).toHaveValue('linux-os/processes');
});
