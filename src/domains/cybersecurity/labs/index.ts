import { defineLab } from '@core/model';
import { USERS } from '../simulators/sqli/engine';
import type { SqliState } from '../simulators/sqli/engine';
import { analyse, renderComment } from '../simulators/xss/engine';
import type { XssState } from '../simulators/xss/engine';

const ADMIN_PASSWORD = USERS.find((u) => u.name === 'admin')?.password ?? '';

export const bypassLab = defineLab({
  slug: 'bypass-the-login',
  domainId: 'cybersecurity',
  title: 'Bypass a vulnerable login',
  summary: 'Get in as admin without knowing the password — in a sandbox built for it.',
  estimatedMinutes: 4,
  prerequisites: ['cybersecurity/sql-injection'],
  simulatorId: 'cybersecurity/sql-login',
  goal: 'Using the vulnerable (string concatenation) mode, log in as admin without entering admin’s real password.',
  instructions: [
    {
      type: 'paragraph',
      text: 'Then switch to the parameterized mode and submit the same input. That second result is the real lesson.',
    },
  ],
  check: (state) => {
    const s = state as SqliState;
    const r = s.result;
    if (!r) return { passed: false, message: 'Submit the form first.', score: 0 };
    if (r.kind === 'ok' && r.user === 'admin' && s.password === ADMIN_PASSWORD)
      return {
        passed: false,
        message: 'That is admin’s real password. The point is to get in without it.',
        score: 30,
      };
    if (r.kind === 'ok' && r.user === 'admin' && s.mode === 'concatenated')
      return {
        passed: true,
        message:
          'You are admin without the password. Now switch to parameterized and watch the same input fail.',
        score: 100,
      };
    if (s.mode === 'parameterized')
      return {
        passed: false,
        message:
          'Parameterized queries treat your input as data, so injection cannot work here. Use the vulnerable mode for this exercise.',
        score: 40,
      };
    if (r.kind === 'ok')
      return {
        passed: false,
        message: `Logged in as ${r.user}, not admin. Close to it — target the admin row specifically.`,
        score: 60,
      };
    if (r.kind === 'error')
      return {
        passed: false,
        message:
          'You broke the query, which proves your input is being parsed as SQL. Now make it valid.',
        score: 40,
      };
    return {
      passed: false,
      message: 'Access denied. Try ending the name string early.',
      score: 10,
    };
  },
});

export const escapeLab = defineLab({
  slug: 'neutralise-the-payload',
  domainId: 'cybersecurity',
  title: 'Neutralise an XSS payload',
  summary: 'Make a malicious comment harmless without changing what the user typed.',
  estimatedMinutes: 3,
  prerequisites: ['cybersecurity/cross-site-scripting'],
  simulatorId: 'cybersecurity/xss-comments',
  goal: 'With a comment that would run script in raw mode, change only how the page outputs it so nothing runs.',
  instructions: [
    {
      type: 'paragraph',
      text: 'Pick or type a payload, confirm the simulated browser would run it, then fix the output. Do not edit the comment itself — real users will type anything.',
    },
  ],
  check: (state) => {
    const s = state as XssState;
    const dangerous = analyse(renderComment(s.input, 'raw')).executes;
    if (!dangerous)
      return {
        passed: false,
        message:
          'This comment would not run script even raw. Choose a payload that does, such as the script tag or image example.',
        score: 20,
      };
    if (s.mode === 'raw')
      return {
        passed: false,
        message: 'Raw output would run the payload. Change how it is output.',
        score: 50,
      };
    return {
      passed: true,
      message: 'Escaped: the browser shows the payload as text and nothing runs.',
      score: 100,
    };
  },
});
