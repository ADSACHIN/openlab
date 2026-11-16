/**
 * A tiny immutable virtual filesystem: a map from absolute path to node.
 * Enough to teach paths, listing, permissions and chmod. Pure functions only.
 */
export interface VfsNode {
  type: 'file' | 'dir';
  /** Permission bits, e.g. 0o644. */
  mode: number;
  owner: string;
  content?: string;
}
export type Vfs = Readonly<Record<string, VfsNode>>;

export type VfsResult = { ok: true; fs: Vfs } | { ok: false; error: string };

export function normalize(path: string, cwd: string): string {
  const abs = path.startsWith('/')
    ? path
    : path.startsWith('~')
      ? `/home/learner${path.slice(1)}`
      : `${cwd}/${path}`;
  const out: string[] = [];
  for (const seg of abs.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') out.pop();
    else out.push(seg);
  }
  return `/${out.join('/')}`;
}

export function parentOf(path: string): string {
  const i = path.lastIndexOf('/');
  return i <= 0 ? '/' : path.slice(0, i);
}

export function basename(path: string): string {
  return path === '/' ? '/' : path.slice(path.lastIndexOf('/') + 1);
}

export function children(fs: Vfs, dir: string): string[] {
  const prefix = dir === '/' ? '/' : `${dir}/`;
  return Object.keys(fs)
    .filter((p) => p !== dir && p.startsWith(prefix) && !p.slice(prefix.length).includes('/'))
    .map(basename)
    .sort((a, b) => a.localeCompare(b));
}

/** Can `user` do `op` on the node? Owner bits apply to the owner, "other" bits to everyone else. */
export function canAccess(node: VfsNode, user: string, op: 'r' | 'w' | 'x'): boolean {
  const shift = node.owner === user ? 6 : 0;
  const bit = op === 'r' ? 4 : op === 'w' ? 2 : 1;
  return ((node.mode >> shift) & bit) !== 0;
}

export function modeToString(mode: number, type: VfsNode['type']): string {
  const triplet = (m: number) => `${m & 4 ? 'r' : '-'}${m & 2 ? 'w' : '-'}${m & 1 ? 'x' : '-'}`;
  return `${type === 'dir' ? 'd' : '-'}${triplet(mode >> 6)}${triplet(mode >> 3)}${triplet(mode)}`;
}

export function modeToOctal(mode: number): string {
  return mode.toString(8).padStart(3, '0');
}

export function parseMode(text: string): number | null {
  return /^[0-7]{3}$/.test(text) ? parseInt(text, 8) : null;
}

export function mkdir(fs: Vfs, path: string, owner: string): VfsResult {
  if (path in fs)
    return { ok: false, error: `mkdir: cannot create directory '${path}': File exists` };
  const parent = fs[parentOf(path)];
  if (parent?.type !== 'dir')
    return {
      ok: false,
      error: `mkdir: cannot create directory '${path}': No such file or directory`,
    };
  if (!canAccess(parent, owner, 'w'))
    return { ok: false, error: `mkdir: cannot create directory '${path}': Permission denied` };
  return { ok: true, fs: { ...fs, [path]: { type: 'dir', mode: 0o755, owner } } };
}

export function writeFile(
  fs: Vfs,
  path: string,
  content: string,
  user: string,
  append = false,
): VfsResult {
  const existing = fs[path];
  if (existing?.type === 'dir') return { ok: false, error: `bash: ${path}: Is a directory` };
  if (existing) {
    if (!canAccess(existing, user, 'w'))
      return { ok: false, error: `bash: ${path}: Permission denied` };
    return {
      ok: true,
      fs: {
        ...fs,
        [path]: { ...existing, content: append ? `${existing.content ?? ''}${content}` : content },
      },
    };
  }
  const parent = fs[parentOf(path)];
  if (parent?.type !== 'dir')
    return { ok: false, error: `bash: ${path}: No such file or directory` };
  if (!canAccess(parent, user, 'w'))
    return { ok: false, error: `bash: ${path}: Permission denied` };
  return { ok: true, fs: { ...fs, [path]: { type: 'file', mode: 0o644, owner: user, content } } };
}

export function remove(fs: Vfs, path: string, user: string, recursive: boolean): VfsResult {
  const node = fs[path];
  if (!node) return { ok: false, error: `rm: cannot remove '${path}': No such file or directory` };
  const parent = fs[parentOf(path)];
  if (!parent || !canAccess(parent, user, 'w'))
    return { ok: false, error: `rm: cannot remove '${path}': Permission denied` };
  if (node.type === 'dir') {
    if (!recursive) return { ok: false, error: `rm: cannot remove '${path}': Is a directory` };
    const next: Record<string, VfsNode> = {};
    for (const [p, n] of Object.entries(fs))
      if (p !== path && !p.startsWith(`${path}/`)) next[p] = n;
    return { ok: true, fs: next };
  }
  const { [path]: _removed, ...rest } = fs;
  return { ok: true, fs: rest };
}

export function chmod(fs: Vfs, path: string, mode: number, user: string): VfsResult {
  const node = fs[path];
  if (!node)
    return { ok: false, error: `chmod: cannot access '${path}': No such file or directory` };
  if (node.owner !== user && user !== 'root')
    return {
      ok: false,
      error: `chmod: changing permissions of '${path}': Operation not permitted`,
    };
  return { ok: true, fs: { ...fs, [path]: { ...node, mode } } };
}

/** The learner's starting machine. */
export function createHomeFs(): Vfs {
  const d = (owner = 'root', mode = 0o755): VfsNode => ({ type: 'dir', mode, owner });
  const f = (content: string, owner = 'root', mode = 0o644): VfsNode => ({
    type: 'file',
    mode,
    owner,
    content,
  });
  return {
    '/': d(),
    '/bin': d(),
    '/etc': d(),
    '/etc/hostname': f('openlab-vm\n'),
    '/etc/passwd': f(
      'root:x:0:0:root:/root:/bin/bash\nlearner:x:1000:1000:Learner:/home/learner:/bin/bash\n',
    ),
    '/etc/shadow': f('root:$6$…:19700:0:99999:7:::\n', 'root', 0o640),
    '/home': d(),
    '/home/learner': d('learner'),
    '/home/learner/notes.txt': f('Remember: everything is a file.\n', 'learner'),
    '/home/learner/projects': d('learner'),
    '/home/learner/projects/README.md': f('# projects\n', 'learner'),
    '/home/learner/.ssh': d('learner', 0o755),
    '/home/learner/.ssh/id_ed25519': f(
      '-----BEGIN OPENSSH PRIVATE KEY-----\n…\n',
      'learner',
      0o644,
    ),
    '/home/learner/.ssh/id_ed25519.pub': f('ssh-ed25519 AAAA… learner@openlab-vm\n', 'learner'),
    '/proc': d(),
    '/proc/cpuinfo': f('model name : OPENLAB virtual CPU\ncpu cores  : 2\n', 'root', 0o444),
    '/tmp': d('root', 0o777),
    '/usr': d(),
    '/usr/bin': d(),
    '/var': d(),
    '/var/log': d(),
    '/var/log/syslog': f('kernel: OPENLAB booting\nsshd: listening on port 22\n', 'root', 0o640),
  };
}
