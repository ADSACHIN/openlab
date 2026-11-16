import type { SimulatorEngine } from '@core/model';

/**
 * A deliberately vulnerable login, evaluated by a tiny SQL WHERE-clause
 * interpreter so that injected text genuinely changes the query's meaning.
 * Everything runs on the in-memory table below; nothing touches a real database.
 */
export interface User {
  name: string;
  password: string;
}
export const USERS: readonly User[] = [
  { name: 'alice', password: 's3cret!' },
  { name: 'admin', password: 'Xk9#qL2!' },
  { name: 'bob', password: 'hunter2' },
];

export type Mode = 'concatenated' | 'parameterized';

export function buildQuery(username: string, password: string): string {
  return `SELECT * FROM users WHERE name = '${username}' AND password = '${password}'`;
}

type Token =
  | { kind: 'ident'; value: string }
  | { kind: 'string'; value: string }
  | { kind: 'eq' }
  | { kind: 'and' }
  | { kind: 'or' };

export class SqlError extends Error {}

export function tokenize(where: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < where.length) {
    const ch = where.charAt(i);
    if (/\s/.test(ch)) {
      i++;
    } else if (where.startsWith('--', i)) {
      break; // comment: the rest of the line is ignored
    } else if (ch === "'") {
      const end = where.indexOf("'", i + 1);
      if (end === -1) throw new SqlError('unterminated string literal');
      out.push({ kind: 'string', value: where.slice(i + 1, end) });
      i = end + 1;
    } else if (ch === '=') {
      out.push({ kind: 'eq' });
      i++;
    } else if (/[a-z_]/i.test(ch)) {
      const m = /^[a-z_][a-z0-9_]*/i.exec(where.slice(i));
      const word = m?.[0] ?? ch;
      const upper = word.toUpperCase();
      out.push(
        upper === 'AND'
          ? { kind: 'and' }
          : upper === 'OR'
            ? { kind: 'or' }
            : { kind: 'ident', value: word.toLowerCase() },
      );
      i += word.length;
    } else {
      throw new SqlError(`syntax error near "${ch}"`);
    }
  }
  return out;
}

type Expr = (u: User) => boolean;

/** Grammar: or := and (OR and)* ; and := cmp (AND cmp)* ; cmp := operand = operand. AND binds tighter than OR. */
export function parseWhere(where: string): Expr {
  const tokens = tokenize(where);
  let pos = 0;
  const peek = () => tokens[pos];
  const operand = (): ((u: User) => string) => {
    const t = tokens[pos++];
    if (t?.kind === 'string') return () => t.value;
    if (t?.kind === 'ident') {
      if (t.value === 'name' || t.value === 'password') {
        const col = t.value;
        return (u) => u[col];
      }
      throw new SqlError(`no such column: ${t.value}`);
    }
    throw new SqlError('expected a column or a string');
  };
  const cmp = (): Expr => {
    const left = operand();
    if (peek()?.kind !== 'eq') throw new SqlError('expected =');
    pos++;
    const right = operand();
    return (u) => left(u) === right(u);
  };
  const and = (): Expr => {
    let e = cmp();
    while (peek()?.kind === 'and') {
      pos++;
      const l = e;
      const r = cmp();
      e = (u) => l(u) && r(u);
    }
    return e;
  };
  const or = (): Expr => {
    let e = and();
    while (peek()?.kind === 'or') {
      pos++;
      const l = e;
      const r = and();
      e = (u) => l(u) || r(u);
    }
    return e;
  };
  const expr = or();
  if (pos < tokens.length) throw new SqlError('unexpected input after the condition');
  return expr;
}

export type LoginResult =
  | { kind: 'ok'; user: string; rows: number }
  | { kind: 'denied' }
  | { kind: 'error'; message: string };

export function login(mode: Mode, username: string, password: string): LoginResult {
  let rows: readonly User[];
  if (mode === 'parameterized') {
    // The values are passed separately from the SQL text, so they can only ever be data.
    rows = USERS.filter((u) => u.name === username && u.password === password);
  } else {
    const query = buildQuery(username, password);
    const where = query.slice(query.indexOf('WHERE ') + 'WHERE '.length);
    try {
      const pred = parseWhere(where);
      rows = USERS.filter(pred);
    } catch (e) {
      return { kind: 'error', message: e instanceof SqlError ? e.message : 'query failed' };
    }
  }
  const first = rows[0];
  return first ? { kind: 'ok', user: first.name, rows: rows.length } : { kind: 'denied' };
}

export interface SqliState {
  mode: Mode;
  username: string;
  password: string;
  attempts: number;
  result: LoginResult | null;
}
export type SqliAction =
  | { type: 'set-username'; value: string }
  | { type: 'set-password'; value: string }
  | { type: 'set-mode'; mode: Mode }
  | { type: 'submit' };

export const sqliEngine: SimulatorEngine<SqliState, SqliAction> = {
  init: () => ({
    mode: 'concatenated',
    username: 'alice',
    password: 's3cret!',
    attempts: 0,
    result: null,
  }),
  step: (s) => s,
  isDone: () => false,
  apply: (s, a) => {
    switch (a.type) {
      case 'set-username':
        return { ...s, username: a.value.slice(0, 80), result: null };
      case 'set-password':
        return { ...s, password: a.value.slice(0, 80), result: null };
      case 'set-mode':
        return { ...s, mode: a.mode, result: null };
      case 'submit':
        return { ...s, attempts: s.attempts + 1, result: login(s.mode, s.username, s.password) };
    }
  },
  describe: (s) => {
    const r = s.result;
    if (!r) return `${s.mode === 'concatenated' ? 'Vulnerable' : 'Parameterized'} login ready.`;
    if (r.kind === 'ok')
      return `Logged in as ${r.user}. The query matched ${String(r.rows)} row${r.rows === 1 ? '' : 's'}.`;
    if (r.kind === 'denied') return 'Access denied: no rows matched.';
    return `Database error: ${r.message}.`;
  },
};
