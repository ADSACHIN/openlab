#!/usr/bin/env node
// @ts-check
/** Usage: npm run new:simulator -- <domain> <slug> */
import {
  formatFiles,
  parseArgs,
  simulatorFiles,
  simulatorRegistration,
  writeNew,
} from './lib/scaffold.mjs';

const { root, domain, slug } = parseArgs(
  process.argv.slice(2),
  'Usage: npm run new:simulator -- <domain> <slug>   e.g. npm run new:simulator -- networking arp-table',
);
try {
  const written = writeNew(root, simulatorFiles(domain, slug));
  await formatFiles(root, written);
  for (const p of written) console.log(`created ${p}`);
  console.log(`\nNext: register it in src/domains/${domain}/simulators/index.ts:\n`);
  console.log(simulatorRegistration(slug));
  console.log('\nThen follow docs/contribution/AUTHORING_GUIDE.md.');
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}
