import type { SimulatorEngine } from '@core/model';

export type Op = 'LDA' | 'ADD' | 'SUB' | 'STA' | 'JMP' | 'JZ' | 'OUT' | 'HLT';
export interface Instr {
  op: Op;
  arg: number;
}
export type Cell = Instr | number;
export type Phase = 'fetch' | 'decode' | 'execute';

export const MEMORY_SIZE = 16;
export const N_ADDRESS = 10;
export const ONE_ADDRESS = 11;
/** Program cells end at 6; data starts at 8. */
export const FIRST_DATA_ADDRESS = 8;
export const CYCLE_LIMIT = 200;

const i = (op: Op, arg = 0): Instr => ({ op, arg });

/** Count down from n (cell 10) to 1, printing each value. */
export function countdownProgram(n: number): Cell[] {
  const mem: Cell[] = [
    i('LDA', N_ADDRESS),
    i('OUT'),
    i('SUB', ONE_ADDRESS),
    i('STA', N_ADDRESS),
    i('JZ', 6),
    i('JMP', 0),
    i('HLT'),
  ];
  while (mem.length < MEMORY_SIZE) mem.push(0);
  mem[N_ADDRESS] = n;
  mem[ONE_ADDRESS] = 1;
  return mem;
}

export const OP_HELP: Record<Op, string> = {
  LDA: 'load memory[addr] into ACC',
  ADD: 'ACC = ACC + memory[addr]',
  SUB: 'ACC = ACC − memory[addr]',
  STA: 'store ACC into memory[addr]',
  JMP: 'jump to addr',
  JZ: 'jump to addr if ACC is 0',
  OUT: 'print ACC',
  HLT: 'stop',
};

export interface CpuState {
  memory: readonly Cell[];
  pc: number;
  acc: number;
  ir: Instr | null;
  phase: Phase;
  output: readonly number[];
  halted: boolean;
  /** Instructions fully executed. */
  cycles: number;
  note: string;
}
export interface CpuAction {
  type: 'set-data';
  address: number;
  value: number;
}

export const isInstr = (c: Cell | undefined): c is Instr => typeof c === 'object';
export const formatCell = (c: Cell | undefined): string =>
  c === undefined
    ? ''
    : isInstr(c)
      ? c.op === 'OUT' || c.op === 'HLT'
        ? c.op
        : `${c.op} ${String(c.arg)}`
      : String(c);

function boot(memory: readonly Cell[]): CpuState {
  return {
    memory,
    pc: 0,
    acc: 0,
    ir: null,
    phase: 'fetch',
    output: [],
    halted: false,
    cycles: 0,
    note: 'Ready. The first step fetches the instruction at address 0.',
  };
}

function read(mem: readonly Cell[], addr: number): number {
  const c = mem[addr];
  return typeof c === 'number' ? c : 0;
}

function execute(s: CpuState, ins: Instr): CpuState {
  const base = { ...s, phase: 'fetch' as const, cycles: s.cycles + 1 };
  switch (ins.op) {
    case 'LDA':
      return {
        ...base,
        acc: read(s.memory, ins.arg),
        note: `LDA: ACC ← memory[${String(ins.arg)}] = ${String(read(s.memory, ins.arg))}.`,
      };
    case 'ADD':
      return {
        ...base,
        acc: (s.acc + read(s.memory, ins.arg)) & 0xff,
        note: `ADD: ACC = ${String((s.acc + read(s.memory, ins.arg)) & 0xff)}.`,
      };
    case 'SUB':
      return {
        ...base,
        acc: (s.acc - read(s.memory, ins.arg)) & 0xff,
        note: `SUB: ACC = ${String((s.acc - read(s.memory, ins.arg)) & 0xff)}.`,
      };
    case 'STA': {
      const memory = [...s.memory];
      memory[ins.arg] = s.acc;
      return { ...base, memory, note: `STA: memory[${String(ins.arg)}] ← ${String(s.acc)}.` };
    }
    case 'JMP':
      return { ...base, pc: ins.arg, note: `JMP: PC ← ${String(ins.arg)}.` };
    case 'JZ':
      return s.acc === 0
        ? { ...base, pc: ins.arg, note: `JZ: ACC is 0, so PC ← ${String(ins.arg)}.` }
        : { ...base, note: 'JZ: ACC is not 0, so no jump.' };
    case 'OUT':
      return { ...base, output: [...s.output, s.acc], note: `OUT: printed ${String(s.acc)}.` };
    case 'HLT':
      return { ...base, halted: true, note: 'HLT: the CPU stops.' };
  }
}

export function stepCpu(s: CpuState): CpuState {
  if (s.halted) return s;
  if (s.phase === 'fetch') {
    const cell = s.memory[s.pc];
    if (!isInstr(cell))
      return {
        ...s,
        halted: true,
        note: `Address ${String(s.pc)} holds data, not an instruction. Halted.`,
      };
    return {
      ...s,
      ir: cell,
      pc: s.pc + 1,
      phase: 'decode',
      note: `Fetch: IR ← memory[${String(s.pc)}] (${formatCell(cell)}); PC ← ${String(s.pc + 1)}.`,
    };
  }
  if (s.phase === 'decode') {
    const ir = s.ir;
    return {
      ...s,
      phase: 'execute',
      note: ir
        ? `Decode: ${formatCell(ir)} means ${OP_HELP[ir.op]}.`
        : 'Decode: nothing to decode.',
    };
  }
  const ir = s.ir;
  if (!ir) return { ...s, phase: 'fetch' };
  const next = execute(s, ir);
  if (!next.halted && next.cycles >= CYCLE_LIMIT)
    return {
      ...next,
      halted: true,
      note: `Stopped after ${String(CYCLE_LIMIT)} instructions: probably an infinite loop.`,
    };
  return next;
}

export const cpuEngine: SimulatorEngine<CpuState, CpuAction> = {
  init: () => boot(countdownProgram(3)),
  step: stepCpu,
  isDone: (s) => s.halted,
  apply: (s, a) => {
    if (
      a.address < FIRST_DATA_ADDRESS ||
      a.address >= MEMORY_SIZE ||
      !Number.isInteger(a.value) ||
      a.value < 0 ||
      a.value > 255
    )
      return s;
    const memory = [...boot(s.memory).memory];
    memory[a.address] = a.value;
    // Editing memory reloads the program from the start, like resetting a real board.
    return {
      ...boot(memory),
      note: `memory[${String(a.address)}] set to ${String(a.value)}. Program restarted.`,
    };
  },
  describe: (s) =>
    `${s.halted ? 'Halted' : `Phase ${s.phase}`}. PC ${String(s.pc)}, ACC ${String(s.acc)}. ${s.note} Output: ${s.output.join(', ') || 'none'}.`,
};
