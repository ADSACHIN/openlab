// @ts-check
/**
 * Templates for new lessons and simulators (Phase 5). The generated files pass
 * the project's strict typecheck, lint and tests as-is; contributors replace
 * the TODOs. See docs/contribution/AUTHORING_GUIDE.md.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const SLUG = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/** @param {string} slug */
export const toPascal = (slug) =>
  slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
/** @param {string} slug */
export const toCamel = (slug) => {
  const p = toPascal(slug);
  return p.charAt(0).toLowerCase() + p.slice(1);
};

/**
 * @param {string} root repository root
 * @param {string} domain
 * @param {string} slug
 * @returns {string | null} an error message, or null if the arguments are usable
 */
export function validate(root, domain, slug) {
  if (!existsSync(join(root, 'src', 'domains', domain, 'index.ts')))
    return `Unknown domain "${domain}": src/domains/${domain}/index.ts does not exist.`;
  if (!SLUG.test(slug))
    return `Slug "${slug}" must be kebab-case: lowercase letters and digits separated by single dashes.`;
  return null;
}

/**
 * @param {string} domain
 * @param {string} slug
 * @returns {Record<string, string>} repository-relative path → file content
 */
export function lessonFiles(domain, slug) {
  const name = `${toCamel(slug)}Lesson`;
  return {
    [`src/domains/${domain}/lessons/${slug}.ts`]: `import { defineLesson } from '@core/model';

/**
 * TODO: write the lesson. Checklist: docs/contribution/AUTHORING_GUIDE.md.
 * Register it by adding \`${name}\` to the \`lessons\` array in src/domains/${domain}/index.ts.
 */
export const ${name} = defineLesson({
  slug: '${slug}',
  domainId: '${domain}',
  title: 'TODO: lesson title',
  summary: 'TODO: one sentence on what the learner gets from this lesson.',
  estimatedMinutes: 5,
  prerequisites: [],
  outcomes: ['TODO: after this lesson the learner can …'],
  tags: ['${slug.split('-')[0] ?? slug}'],
  blocks: [{ type: 'paragraph', text: 'TODO: open with the idea in plain language.' }],
});
`,
  };
}

/**
 * @param {string} domain
 * @param {string} slug
 * @returns {Record<string, string>}
 */
export function simulatorFiles(domain, slug) {
  const P = toPascal(slug);
  const c = toCamel(slug);
  const dir = `src/domains/${domain}/simulators/${slug}`;
  return {
    [`${dir}/engine.ts`]: `import type { SimulatorEngine } from '@core/model';

/** TODO: replace this counter with the real model. Keep it pure: no Date, no Math.random, no DOM. */
export const STEPS = 10;

export interface ${P}State {
  tick: number;
}
export interface ${P}Action {
  type: 'set-tick';
  value: number;
}

export const ${c}Engine: SimulatorEngine<${P}State, ${P}Action> = {
  init: () => ({ tick: 0 }),
  step: (s) => ({ tick: Math.min(STEPS, s.tick + 1) }),
  isDone: (s) => s.tick >= STEPS,
  apply: (s, a) => (Number.isInteger(a.value) && a.value >= 0 && a.value <= STEPS ? { tick: a.value } : s),
  describe: (s) => \`Tick \${String(s.tick)} of \${String(STEPS)}.\`,
};
`,
    [`${dir}/${P}View.tsx`]: `import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { STEPS, ${c}Engine } from './engine';
import type { ${P}Action, ${P}State } from './engine';
import styles from './${P}View.module.css';

export function ${P}View({ state, dispatch }: SimulatorViewProps<${P}State, ${P}Action>) {
  return (
    <div className={styles.wrap}>
      <SvgStage viewBox={[0, 0, 400, 60]} title="TODO: what this picture shows" description={${c}Engine.describe(state)}>
        <rect x={0} y={20} width={(state.tick / STEPS) * 400} height={20} rx={4} fill="var(--color-accent)" />
      </SvgStage>
      <button type="button" className={styles.button} onClick={() => dispatch({ type: 'set-tick', value: 0 })}>
        Back to zero
      </button>
    </div>
  );
}
`,
    [`${dir}/${P}View.module.css`]: `.wrap {
  display: grid;
  gap: var(--space-3);
}

.button {
  justify-self: start;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border-strong);
  color: var(--color-text);
}
`,
    [`${dir}/engine.test.ts`]: `import { describe, expect, it } from 'vitest';
import { STEPS, ${c}Engine } from './engine';

describe('${slug} engine', () => {
  it('is deterministic and finishes', () => {
    let s = ${c}Engine.init(1);
    expect(${c}Engine.init(1)).toEqual(s);
    while (!${c}Engine.isDone?.(s)) s = ${c}Engine.step(s);
    expect(s.tick).toBe(STEPS);
  });

  it('rejects invalid actions', () => {
    const s = ${c}Engine.init(1);
    expect(${c}Engine.apply?.(s, { type: 'set-tick', value: -1 })).toBe(s);
  });

  // TODO: add a test for every number the lesson text states (AUTHORING_GUIDE: "numbers are tested").
});
`,
  };
}

/**
 * Registration snippet to paste into src/domains/<domain>/simulators/index.ts.
 * @param {string} slug
 */
export function simulatorRegistration(slug) {
  const P = toPascal(slug);
  const c = toCamel(slug);
  return `import { ${c}Engine } from './${slug}/engine';
import { ${P}View } from './${slug}/${P}View';

export const ${c} = defineSimulator({ domainId, slug: '${slug}', title: 'TODO', description: 'TODO', engine: ${c}Engine, View: ${P}View });
// …and add ${c} to the exported \`simulators\` array.`;
}

/**
 * Write files, refusing to overwrite anything.
 * @param {string} root
 * @param {Record<string, string>} files
 * @returns {string[]} the paths written
 */
export function writeNew(root, files) {
  const clash = Object.keys(files).filter((p) => existsSync(join(root, p)));
  if (clash.length > 0) throw new Error(`Refusing to overwrite: ${clash.join(', ')}`);
  for (const [p, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, p)), { recursive: true });
    writeFileSync(join(root, p), content);
  }
  return Object.keys(files);
}

/**
 * Shared CLI handling: `<domain> <slug> [--root <dir>]`.
 * @param {string[]} argv
 * @param {string} usage
 * @returns {{ root: string; domain: string; slug: string }}
 */
export function parseArgs(argv, usage) {
  const args = [...argv];
  let root = process.cwd();
  const i = args.indexOf('--root');
  if (i !== -1) {
    root = args[i + 1] ?? root;
    args.splice(i, 2);
  }
  const [domain, slug] = args;
  if (!domain || !slug) {
    console.error(usage);
    process.exit(2);
  }
  const err = validate(root, domain, slug);
  if (err) {
    console.error(err);
    process.exit(2);
  }
  return { root, domain, slug };
}

/**
 * Format files in place with the repository's Prettier config, so generated
 * code passes `npm run format:check` exactly as a hand-written file would.
 * @param {string} root
 * @param {readonly string[]} paths repository-relative
 */
export async function formatFiles(root, paths) {
  const prettier = await import('prettier');
  const { readFile, writeFile } = await import('node:fs/promises');
  for (const p of paths) {
    const file = join(root, p);
    const config = (await prettier.resolveConfig(file)) ?? {};
    const source = await readFile(file, 'utf8');
    await writeFile(file, await prettier.format(source, { ...config, filepath: file }));
  }
}
