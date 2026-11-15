import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES: readonly { name: string; path: string }[] = [
  { name: 'home', path: './' },
  { name: 'domain', path: './#/domains/networking' },
  { name: 'not-found', path: './#/missing' },
  { name: 'search', path: './#/search' },
  { name: 'progress', path: './#/progress' },
  { name: 'lesson', path: './#/domains/networking/lessons/tcp-handshake' },
  { name: 'lab', path: './#/domains/networking/labs/size-a-subnet' },
];

for (const theme of ['light', 'dark'] as const) {
  for (const route of ROUTES) {
    test(`${route.name} has no axe violations (${theme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(route.path);
      await page.getByRole('heading', { level: 1 }).waitFor();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }
}
