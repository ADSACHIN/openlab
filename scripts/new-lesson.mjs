#!/usr/bin/env node
// @ts-check
/** Usage: npm run new:lesson -- <domain> <slug> */
import { formatFiles, lessonFiles, parseArgs, toCamel, writeNew } from './lib/scaffold.mjs';

const { root, domain, slug } = parseArgs(
  process.argv.slice(2),
  'Usage: npm run new:lesson -- <domain> <slug>   e.g. npm run new:lesson -- networking http-basics',
);
try {
  const written = writeNew(root, lessonFiles(domain, slug));
  await formatFiles(root, written);
  for (const p of written) console.log(`created ${p}`);
  console.log(
    `\nNext: add ${toCamel(slug)}Lesson to the lessons array in src/domains/${domain}/index.ts,`,
  );
  console.log('then follow docs/contribution/AUTHORING_GUIDE.md.');
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}
