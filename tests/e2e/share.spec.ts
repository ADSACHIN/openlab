import { expect, test } from '@playwright/test';

test('share a solved subnet lab and open it fresh', async ({ page, browser }) => {
  await page.goto('./#/domains/networking/labs/size-a-subnet');
  const slider = page.getByRole('slider');
  await slider.focus();
  await slider.press('ArrowRight');
  await slider.press('ArrowRight');
  await page.getByRole('button', { name: 'Copy link to this setup' }).click();
  const url = await page.getByLabel('Link to this setup').inputValue();
  expect(url).toMatch(/\?setup=[A-Za-z0-9_-]+$/);

  const fresh = await browser.newPage();
  const errors: string[] = [];
  fresh.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await fresh.goto(url);
  await expect(fresh.getByText(/Restored a shared setup/)).toBeVisible();
  await fresh.getByRole('button', { name: 'Check my work' }).click();
  await expect(fresh.getByText(/tightest fit/)).toBeVisible();
  expect(errors).toEqual([]);
  await fresh.close();
});
