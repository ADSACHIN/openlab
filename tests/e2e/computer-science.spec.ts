import { expect, test } from '@playwright/test';

test.describe('computer-science domain', () => {
  test('binary lesson: flipping bits updates every reading', async ({ page }) => {
    await page.goto('./#/domains/computer-science/lessons/bits-and-binary');
    const bits = page.getByRole('group', { name: 'Eight bits, most significant first' });
    await bits.getByRole('button', { name: /^Bit 3,/ }).click();
    await bits.getByRole('button', { name: /^Bit 1,/ }).click();
    await bits.getByRole('button', { name: /^Bit 0,/ }).click();
    await expect(page.getByRole('status', { name: 'Simulation status' })).toHaveText(
      "00001011: 11 unsigned, 11 signed (two's complement), hex 0B.",
    );
  });

  test('lab: overflow the adder to zero', async ({ page }) => {
    await page.goto('./#/domains/computer-science/labs/overflow-to-zero');
    await page.getByLabel('A', { exact: true }).selectOption('9');
    await page.getByLabel('B', { exact: true }).selectOption('7');
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Step' }).click();
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText(/9 \+ 7 = 16, which needs five bits/)).toBeVisible();
  });

  test('lab: reprogram the CPU to count down from five', async ({ page }) => {
    await page.goto('./#/domains/computer-science/labs/countdown-from-five');
    await page.getByLabel('Set n (memory[10])').fill('5');
    await page
      .getByRole('button', { name: 'Speed' })
      .or(page.getByLabel('Speed'))
      .selectOption('4');
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByText('Finished', { exact: true })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText('Printed 5, 4, 3, 2, 1 in 30 instructions.')).toBeVisible();
  });

  test('automaton: 111 is rejected with remainder 1', async ({ page }) => {
    await page.goto('./#/domains/computer-science/lessons/finite-automata');
    await page.getByLabel('Binary input').fill('111');
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Step' }).click();
    await expect(page.getByText('Rejected: remainder 1.')).toBeVisible();
  });
});
