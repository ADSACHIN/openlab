import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

// Vite content hashes are exactly 8 base64url characters and may start with "-" (e.g. domain-linux-os--IvjgpHb.js),
// so anchor on that fixed-length tail rather than splitting on dashes.
/** Records which domains' code the browser fetched: dev serves /src/domains/<id>/…, production serves assets/domain-<id>-<hash>.js. */
function trackDomains(page: Page): Set<string> {
  const seen = new Set<string>();
  page.on('request', (r) => {
    const m = /\/src\/domains\/([^/]+)\/|\/assets\/domain-(.+)-[\w-]{8}\.js(?:$|\?)/.exec(r.url());
    const id = m?.[1] ?? m?.[2];
    if (id) seen.add(id);
  });
  return seen;
}

test.describe('lazy domain loading', () => {
  // Suspense misuse surfaces only as a console error, so treat any console error as a failure.
  let consoleErrors: string[] = [];
  test.beforeEach(({ page }) => {
    consoleErrors = [];
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text());
    });
  });
  test.afterEach(() => {
    expect(consoleErrors).toEqual([]);
  });

  test('home downloads no domain code; a domain page downloads only its own', async ({ page }) => {
    const seen = trackDomains(page);
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn technology');
    await expect(
      page.getByRole('article', { name: 'Networking' }).getByText('Available'),
    ).toBeVisible();
    expect([...seen]).toEqual([]);

    await page.getByRole('link', { name: 'Networking' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Networking');
    await expect(page.getByRole('list', { name: 'Networking lessons' })).toBeVisible();
    expect([...seen]).toEqual(['networking']);
  });

  test('search loads every domain', async ({ page }) => {
    const seen = trackDomains(page);
    await page.goto('./#/search');
    await page.getByRole('searchbox').fill('scheduler');
    await expect(page.getByRole('link', { name: 'Processes and the scheduler' })).toBeVisible();
    expect([...seen].sort()).toEqual([
      'ai-ml',
      'cloud-devops',
      'computer-science',
      'cybersecurity',
      'linux-os',
      'networking',
      'programming',
      'system-design',
    ]);
  });

  test('a cross-domain prerequisite loads the other domain too', async ({ page }) => {
    const seen = trackDomains(page);
    await page.goto('./#/domains/cybersecurity/lessons/sql-injection');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('SQL injection');
    // "Before this" links to a Programming lesson, so the Programming chunk is needed.
    await expect(
      page
        .getByRole('complementary', { name: 'Lesson overview' })
        .getByRole('link', { name: 'A program is state plus steps' }),
    ).toBeVisible();
    expect([...seen].sort()).toEqual(['cybersecurity', 'programming']);
  });
});
