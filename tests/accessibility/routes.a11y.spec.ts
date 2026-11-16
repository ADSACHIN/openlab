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
  { name: 'linux-lesson', path: './#/domains/linux-os/lessons/permissions' },
  { name: 'linux-lab', path: './#/domains/linux-os/labs/secure-the-key' },
  { name: 'programming-lesson', path: './#/domains/programming/lessons/sorting' },
  { name: 'programming-lab', path: './#/domains/programming/labs/five-guesses' },
  { name: 'cs-lesson', path: './#/domains/computer-science/lessons/logic-gates' },
  { name: 'cs-lab', path: './#/domains/computer-science/labs/countdown-from-five' },
  { name: 'security-lesson', path: './#/domains/cybersecurity/lessons/hashing-and-salting' },
  { name: 'security-lab', path: './#/domains/cybersecurity/labs/neutralise-the-payload' },
  { name: 'sd-lesson', path: './#/domains/system-design/lessons/replication-and-consistency' },
  { name: 'sd-lab', path: './#/domains/system-design/labs/handle-five-per-tick' },
  { name: 'devops-lesson', path: './#/domains/cloud-devops/lessons/containers-and-layers' },
  { name: 'devops-lab', path: './#/domains/cloud-devops/labs/merge-a-feature' },
  { name: 'ai-lesson', path: './#/domains/ai-ml/lessons/the-perceptron' },
  { name: 'ai-lab', path: './#/domains/ai-ml/labs/tune-the-learning-rate' },
  { name: 'paths', path: './#/paths?goal=cloud-devops/containers-and-layers' },
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
