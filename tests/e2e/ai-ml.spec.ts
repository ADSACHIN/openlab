import { expect, test } from '@playwright/test';

test.describe('ai-ml domain', () => {
  test('perceptron converges on separable data', async ({ page }) => {
    await page.goto('./#/domains/ai-ml/lessons/the-perceptron');
    await page.getByLabel('Speed').selectOption('4');
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByText('Finished', { exact: true })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('status', { name: 'Simulation status' })).toContainText(
      'every point is on the correct side',
    );
  });

  test('lab: tune the learning rate', async ({ page }) => {
    await page.goto('./#/domains/ai-ml/labs/tune-the-learning-rate');
    await page.getByLabel('Learning rate', { exact: true }).selectOption('0.08');
    for (let i = 0; i < 30; i++) await page.getByRole('button', { name: 'Step' }).click();
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText(/Below 0.01 after \d+ steps at learning rate 0.08/)).toBeVisible();
  });

  test('lab: compress the corpus with exactly six merges', async ({ page }) => {
    await page.goto('./#/domains/ai-ml/labs/compress-the-corpus');
    for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'Step' }).click();
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(
      page.getByText('48 tokens after 6 merges; one fewer would leave 54.'),
    ).toBeVisible();
  });
});
