import type { ModuleLoaders } from './moduleStore';

/**
 * Every domain with content, as a lazy loader. Each `import()` becomes its own
 * chunk (named `assets/domain-<id>-<hash>.js` in production), so a learner
 * downloads only the domains they open. Order here is irrelevant; the
 * catalogue order comes from `src/data/domains.ts`.
 */
export const MODULE_LOADERS: ModuleLoaders = {
  networking: () => import('@domains/networking').then((m) => m.networkingModule),
  'linux-os': () => import('@domains/linux-os').then((m) => m.linuxOsModule),
  programming: () => import('@domains/programming').then((m) => m.programmingModule),
  'computer-science': () =>
    import('@domains/computer-science').then((m) => m.computerScienceModule),
  cybersecurity: () => import('@domains/cybersecurity').then((m) => m.cybersecurityModule),
  'system-design': () => import('@domains/system-design').then((m) => m.systemDesignModule),
  'cloud-devops': () => import('@domains/cloud-devops').then((m) => m.cloudDevopsModule),
  'ai-ml': () => import('@domains/ai-ml').then((m) => m.aiMlModule),
};
