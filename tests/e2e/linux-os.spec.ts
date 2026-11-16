import { expect, test } from '@playwright/test';

test.describe('linux-os domain', () => {
  test('terminal lesson: run commands in the sandbox shell', async ({ page }) => {
    await page.goto('./#/domains/linux-os/lessons/shell-basics');
    const input = page.getByRole('textbox', { name: /learner@openlab-vm/ });
    await input.fill('ls -la /etc');
    await input.press('Enter');
    await expect(page.getByRole('region', { name: 'Terminal output' })).toContainText('hostname');
    await input.fill('cat /etc/shadow');
    await input.press('Enter');
    await expect(page.getByRole('region', { name: 'Terminal output' })).toContainText(
      'Permission denied',
    );
  });

  test('lab: secure the key with chmod', async ({ page }) => {
    await page.goto('./#/domains/linux-os/labs/secure-the-key');
    const input = page.getByRole('textbox', { name: /learner@openlab-vm/ });
    await input.fill('chmod 600 ~/.ssh/id_ed25519');
    await input.press('Enter');
    await input.fill('chmod 700 ~/.ssh');
    await input.press('Enter');
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText('SSH would accept this.')).toBeVisible();
  });

  test('lab: tune the quantum and run to completion', async ({ page }) => {
    await page.goto('./#/domains/linux-os/labs/tune-the-quantum');
    const slider = page.getByRole('slider');
    await slider.focus();
    await slider.press('ArrowRight'); // 4 → 5
    for (let i = 0; i < 18; i++) await page.getByRole('button', { name: 'Step' }).click();
    await expect(page.getByText('Finished', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText(/responsive and efficient/)).toBeVisible();
  });
});
