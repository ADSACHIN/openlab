import type { SimulatorEngine } from '@core/model';
import {
  basename,
  canAccess,
  children,
  chmod,
  createHomeFs,
  mkdir,
  modeToOctal,
  modeToString,
  normalize,
  parseMode,
  remove,
  writeFile,
} from '../../lib/vfs';
import type { Vfs } from '../../lib/vfs';

export interface TerminalEntry {
  command: string;
  output: string;
  error: boolean;
}

export interface TerminalState {
  fs: Vfs;
  cwd: string;
  user: string;
  host: string;
  history: readonly TerminalEntry[];
}

export interface TerminalAction {
  type: 'run';
  command: string;
}

export const COMMANDS = [
  'help',
  'pwd',
  'ls',
  'cd',
  'cat',
  'echo',
  'mkdir',
  'touch',
  'rm',
  'chmod',
  'stat',
  'whoami',
  'hostname',
  'clear',
] as const;

export function prompt(s: TerminalState): string {
  const shown =
    s.cwd === '/home/learner'
      ? '~'
      : s.cwd.startsWith('/home/learner/')
        ? `~${s.cwd.slice('/home/learner'.length)}`
        : s.cwd;
  return `${s.user}@${s.host}:${shown}$`;
}

function tokenize(line: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) out.push(m[1] ?? m[2] ?? m[3] ?? '');
  return out;
}

interface Outcome {
  output: string;
  error?: boolean;
  fs?: Vfs;
  cwd?: string;
  clear?: boolean;
}

function run(s: TerminalState, line: string): Outcome {
  const argv = tokenize(line);
  const [cmd, ...args] = argv;
  if (!cmd) return { output: '' };
  const abs = (p: string) => normalize(p, s.cwd);
  const flags = args.filter((a) => a.startsWith('-'));
  const params = args.filter((a) => !a.startsWith('-'));

  switch (cmd) {
    case 'help':
      return {
        output: `Available commands: ${COMMANDS.join(', ')}\nTry: ls -la, cd /etc, cat hostname, echo hi > file, chmod 600 file, stat file`,
      };
    case 'pwd':
      return { output: s.cwd };
    case 'whoami':
      return { output: s.user };
    case 'hostname':
      return { output: s.host };
    case 'clear':
      return { output: '', clear: true };
    case 'cd': {
      const target = abs(params[0] ?? '~');
      const node = s.fs[target];
      if (!node)
        return { output: `bash: cd: ${params[0] ?? ''}: No such file or directory`, error: true };
      if (node.type !== 'dir')
        return { output: `bash: cd: ${params[0] ?? ''}: Not a directory`, error: true };
      if (!canAccess(node, s.user, 'x'))
        return { output: `bash: cd: ${params[0] ?? ''}: Permission denied`, error: true };
      return { output: '', cwd: target };
    }
    case 'ls': {
      const target = abs(params[0] ?? '.');
      const node = s.fs[target];
      if (!node)
        return {
          output: `ls: cannot access '${params[0] ?? ''}': No such file or directory`,
          error: true,
        };
      if (!canAccess(node, s.user, 'r'))
        return {
          output: `ls: cannot open directory '${params[0] ?? ''}': Permission denied`,
          error: true,
        };
      const all = flags.some((f) => f.includes('a'));
      const long = flags.some((f) => f.includes('l'));
      const names =
        node.type === 'dir'
          ? children(s.fs, target).filter((n) => all || !n.startsWith('.'))
          : [basename(target)];
      if (!long) return { output: names.join('  ') };
      const rows = names.map((n) => {
        const p = node.type === 'dir' ? (target === '/' ? `/${n}` : `${target}/${n}`) : target;
        const x = s.fs[p];
        if (!x) return n;
        const size = x.type === 'dir' ? 4096 : (x.content ?? '').length;
        return `${modeToString(x.mode, x.type)} 1 ${x.owner.padEnd(7)} ${x.owner.padEnd(7)} ${String(size).padStart(5)} ${n}`;
      });
      return { output: rows.join('\n') };
    }
    case 'cat': {
      if (params.length === 0) return { output: 'cat: missing operand', error: true };
      const outs: string[] = [];
      for (const p of params) {
        const node = s.fs[abs(p)];
        if (!node) return { output: `cat: ${p}: No such file or directory`, error: true };
        if (node.type === 'dir') return { output: `cat: ${p}: Is a directory`, error: true };
        if (!canAccess(node, s.user, 'r'))
          return { output: `cat: ${p}: Permission denied`, error: true };
        outs.push((node.content ?? '').replace(/\n$/, ''));
      }
      return { output: outs.join('\n') };
    }
    case 'stat': {
      const p = params[0];
      if (p === undefined) return { output: 'stat: missing operand', error: true };
      const node = s.fs[abs(p)];
      if (!node)
        return { output: `stat: cannot statx '${p}': No such file or directory`, error: true };
      return {
        output: `  File: ${p}\n  Type: ${node.type === 'dir' ? 'directory' : 'regular file'}\nAccess: (${modeToOctal(node.mode)}/${modeToString(node.mode, node.type)})  Uid: ${node.owner}`,
      };
    }
    case 'echo': {
      const gt = args.findIndex((a) => a === '>' || a === '>>');
      if (gt === -1) return { output: args.join(' ') };
      const text = `${args.slice(0, gt).join(' ')}\n`;
      const file = args[gt + 1];
      if (file === undefined)
        return { output: "bash: syntax error near unexpected token `newline'", error: true };
      const r = writeFile(s.fs, abs(file), text, s.user, args[gt] === '>>');
      return r.ok ? { output: '', fs: r.fs } : { output: r.error, error: true };
    }
    case 'mkdir': {
      if (params.length === 0) return { output: 'mkdir: missing operand', error: true };
      let fs = s.fs;
      for (const p of params) {
        const r = mkdir(fs, abs(p), s.user);
        if (!r.ok) return { output: r.error, error: true };
        fs = r.fs;
      }
      return { output: '', fs };
    }
    case 'touch': {
      if (params.length === 0) return { output: 'touch: missing operand', error: true };
      let fs = s.fs;
      for (const p of params) {
        if (abs(p) in fs) continue;
        const r = writeFile(fs, abs(p), '', s.user);
        if (!r.ok) return { output: r.error.replace('bash:', 'touch: cannot touch'), error: true };
        fs = r.fs;
      }
      return { output: '', fs };
    }
    case 'rm': {
      if (params.length === 0) return { output: 'rm: missing operand', error: true };
      let fs = s.fs;
      for (const p of params) {
        const r = remove(
          fs,
          abs(p),
          s.user,
          flags.some((f) => f.includes('r')),
        );
        if (!r.ok) return { output: r.error, error: true };
        fs = r.fs;
      }
      return { output: '', fs };
    }
    case 'chmod': {
      const [modeText, ...files] = params;
      const mode = modeText === undefined ? null : parseMode(modeText);
      if (mode === null)
        return {
          output: `chmod: invalid mode: '${modeText ?? ''}' (use three octal digits, e.g. 600)`,
          error: true,
        };
      if (files.length === 0) return { output: 'chmod: missing operand', error: true };
      let fs = s.fs;
      for (const p of files) {
        const r = chmod(fs, abs(p), mode, s.user);
        if (!r.ok) return { output: r.error, error: true };
        fs = r.fs;
      }
      return { output: '', fs };
    }
    default:
      return { output: `bash: ${cmd}: command not found`, error: true };
  }
}

export function runCommand(s: TerminalState, line: string): TerminalState {
  const command = line.trim();
  if (command === '') return s;
  const r = run(s, command);
  if (r.clear) return { ...s, history: [] };
  return {
    ...s,
    fs: r.fs ?? s.fs,
    cwd: r.cwd ?? s.cwd,
    history: [...s.history, { command, output: r.output, error: r.error ?? false }],
  };
}

export const terminalEngine: SimulatorEngine<TerminalState, TerminalAction> = {
  init: () => ({
    fs: createHomeFs(),
    cwd: '/home/learner',
    user: 'learner',
    host: 'openlab-vm',
    history: [],
  }),
  step: (s) => s,
  isDone: () => false,
  apply: (s, a) => runCommand(s, a.command),
  describe: (s) => {
    const last = s.history[s.history.length - 1];
    if (!last) return `Shell ready in ${s.cwd}. Type a command, or help.`;
    const out = last.output === '' ? 'no output' : last.output.split('\n').slice(0, 2).join(' / ');
    return `${last.command}: ${last.error ? 'error, ' : ''}${out}. Now in ${s.cwd}.`;
  },
};
