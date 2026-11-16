import { defineLab } from '@core/model';
import type { TerminalState } from '../simulators/terminal/engine';
import type { SchedulerState } from '../simulators/scheduler/engine';
import { isFinished } from '../simulators/scheduler/engine';

export const secureKeyLab = defineLab({
  slug: 'secure-the-key',
  domainId: 'linux-os',
  title: 'Secure the SSH key',
  summary: 'Find the private key, see why SSH would reject it, and fix its permissions.',
  estimatedMinutes: 4,
  prerequisites: ['linux-os/permissions'],
  simulatorId: 'linux-os/terminal',
  goal: 'Make ~/.ssh/id_ed25519 readable and writable by its owner only (mode 600) and the ~/.ssh directory mode 700.',
  instructions: [
    {
      type: 'list',
      ordered: true,
      items: [
        'Look at the current modes: `ls -la ~/.ssh`',
        'Fix the key with `chmod`, then the directory',
        'Verify with `stat ~/.ssh/id_ed25519`',
      ],
    },
  ],
  check: (state) => {
    const s = state as TerminalState;
    const key = s.fs['/home/learner/.ssh/id_ed25519'];
    const dir = s.fs['/home/learner/.ssh'];
    if (!key)
      return {
        passed: false,
        message: 'The key file is gone — press Reset and try again without deleting it.',
        score: 0,
      };
    const keyOk = key.mode === 0o600;
    const dirOk = dir?.mode === 0o700;
    if (keyOk && dirOk)
      return {
        passed: true,
        message: 'Key is 600 and the directory is 700. SSH would accept this.',
        score: 100,
      };
    if (keyOk)
      return {
        passed: false,
        message: 'The key is 600 — now tighten the ~/.ssh directory to 700.',
        score: 70,
      };
    return {
      passed: false,
      message: `The key is still mode ${key.mode.toString(8)}; others can read it. Use chmod 600 on it.`,
      score: 20,
    };
  },
});

export const quantumLab = defineLab({
  slug: 'tune-the-quantum',
  domainId: 'linux-os',
  title: 'Tune the time quantum',
  summary: 'Balance responsiveness against context-switch overhead.',
  estimatedMinutes: 3,
  prerequisites: ['linux-os/processes'],
  simulatorId: 'linux-os/scheduler',
  goal: 'Keep the quantum at 6 ms or less (responsiveness) and finish the workload with at most 4 context switches (overhead). Run it to the end.',
  instructions: [
    {
      type: 'paragraph',
      text: 'Set the quantum, press Play (or Step to the end), then check. Changing the quantum restarts the run.',
    },
  ],
  check: (state) => {
    const s = state as SchedulerState;
    if (!isFinished(s))
      return { passed: false, message: 'Run the workload to completion first.', score: 10 };
    if (s.quantum > 6)
      return {
        passed: false,
        message: `Quantum ${String(s.quantum)} ms finishes with few switches, but short tasks wait too long. Try 6 or less.`,
        score: 40,
      };
    if (s.contextSwitches > 4)
      return {
        passed: false,
        message: `Quantum ${String(s.quantum)} ms needs ${String(s.contextSwitches)} context switches — too much overhead. Try a longer slice.`,
        score: 50,
      };
    return {
      passed: true,
      message: `Quantum ${String(s.quantum)} ms: ${String(s.contextSwitches)} switches, responsive and efficient.`,
      score: 100,
    };
  },
});
