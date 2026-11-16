import { defineSimulator } from '@core/model';
import { caesarEngine } from './caesar/engine';
import { CaesarView } from './caesar/CaesarView';
import { crackerEngine } from './hash-cracker/engine';
import { CrackerView } from './hash-cracker/CrackerView';
import { passwordEngine } from './password/engine';
import { PasswordView } from './password/PasswordView';
import { sqliEngine } from './sqli/engine';
import { SqliView } from './sqli/SqliView';
import { xssEngine } from './xss/engine';
import { XssView } from './xss/XssView';

const domainId = 'cybersecurity' as const;

export const caesar = defineSimulator({
  domainId,
  slug: 'caesar',
  title: 'Caesar cipher and brute force',
  description: 'Encrypt with a key, then watch an attacker try all 26.',
  engine: caesarEngine,
  View: CaesarView,
  tickRate: 4,
});
export const password = defineSimulator({
  domainId,
  slug: 'password-strength',
  title: 'Password strength estimator',
  description: 'Entropy and brute-force time for a candidate password.',
  engine: passwordEngine,
  View: PasswordView,
  tickRate: 0.5,
});
export const cracker = defineSimulator({
  domainId,
  slug: 'hash-cracker',
  title: 'Dictionary attack on leaked hashes',
  description: 'Crack unsalted and salted SHA-256 hashes with a wordlist.',
  engine: crackerEngine,
  View: CrackerView,
  tickRate: 2,
});
export const sqli = defineSimulator({
  domainId,
  slug: 'sql-login',
  title: 'Vulnerable login',
  description: 'A login form backed by a query you can break.',
  engine: sqliEngine,
  View: SqliView,
  controls: 'reset',
});
export const xss = defineSimulator({
  domainId,
  slug: 'xss-comments',
  title: 'Comment box',
  description: 'User input placed into a page as HTML, raw or escaped.',
  engine: xssEngine,
  View: XssView,
  tickRate: 0.5,
});

export const simulators = [caesar, password, cracker, sqli, xss];
