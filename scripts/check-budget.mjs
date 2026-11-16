#!/usr/bin/env node
// @ts-check
/** Usage: node scripts/check-budget.mjs [distDir]. Exits 1 when the build is over budget. */
import { existsSync } from 'node:fs';
import { evaluate, formatReport, measure } from './lib/budget.mjs';

const dist = process.argv[2] ?? 'dist';
if (!existsSync(`${dist}/index.html`)) {
  console.error(`No build found at ${dist}/index.html. Run "npm run build" first.`);
  process.exit(2);
}
const report = measure(dist);
console.log(formatReport(report));
const violations = evaluate(report);
if (violations.length > 0) {
  console.error('\nPerformance budget exceeded:');
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}
console.log('\nWithin budget.');
