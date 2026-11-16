import { expect, test } from '@playwright/test';

// The service worker exists only in production builds (CI runs e2e against `vite preview`).
test.skip(
  !process.env.PLAYWRIGHT_BASE_URL,
  'service worker is production-only; run against the preview build',
);

test('keeps working offline after the first visit, including domains not opened yet', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn technology');
  // Wait until the worker has installed (precache complete) and controls the page.
  // Evaluated in the browser; passed as strings because the Node-side tsconfig has no DOM types.
  await page.evaluate('navigator.serviceWorker.ready.then(() => true)');
  await page.reload();
  await expect.poll(() => page.evaluate('navigator.serviceWorker.controller !== null')).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn technology');

  // Linux & OS has not been loaded in this session: its chunk must come from the precache.
  await page.getByRole('link', { name: 'Linux & OS' }).click();
  await expect(page.getByRole('list', { name: 'Linux & OS lessons' })).toBeVisible();
  await page.getByRole('link', { name: /The shell: talking to the operating system/ }).click();
  const input = page.getByRole('textbox', { name: /learner@openlab-vm/ });
  await input.fill('whoami');
  await input.press('Enter');
  await expect(page.getByRole('region', { name: 'Terminal output' })).toContainText('learner');

  await context.setOffline(false);
  expect(errors).toEqual([]);
});
