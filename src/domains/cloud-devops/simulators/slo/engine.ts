import type { SimulatorEngine } from '@core/model';

export const TARGETS: readonly number[] = [99, 99.5, 99.9, 99.95, 99.99];
export const PERIOD_DAYS = 30;
export const MINUTES_PER_DAY = 24 * 60;

/** Downtime allowed over `days` at an availability target given in percent. */
export function budgetMinutes(targetPercent: number, days = PERIOD_DAYS): number {
  return ((100 - targetPercent) / 100) * days * MINUTES_PER_DAY;
}

/** A month of incidents: (day, minutes of downtime). */
export const INCIDENTS: readonly { day: number; minutes: number }[] = [
  { day: 3, minutes: 12 },
  { day: 11, minutes: 25 },
  { day: 19, minutes: 9 },
  { day: 26, minutes: 4 },
];

export interface SloState {
  target: number;
  day: number;
  used: number;
  /** Day the budget ran out, if it did. */
  exhaustedOn: number | null;
}
export interface SloAction {
  type: 'set-target';
  target: number;
}

const fresh = (target: number): SloState => ({ target, day: 0, used: 0, exhaustedOn: null });

export function stepSlo(s: SloState): SloState {
  if (s.day >= PERIOD_DAYS) return s;
  const day = s.day + 1;
  const used = s.used + INCIDENTS.filter((i) => i.day === day).reduce((n, i) => n + i.minutes, 0);
  const exhaustedOn = s.exhaustedOn ?? (used > budgetMinutes(s.target) ? day : null);
  return { ...s, day, used, exhaustedOn };
}

export function formatMinutes(m: number): string {
  if (m >= 120) return `${(m / 60).toFixed(1)} h`;
  return `${m.toFixed(m < 10 ? 2 : 1)} min`;
}

export const sloEngine: SimulatorEngine<SloState, SloAction> = {
  init: () => fresh(99.9),
  step: stepSlo,
  isDone: (s) => s.day >= PERIOD_DAYS,
  apply: (_s, a) => (TARGETS.includes(a.target) ? fresh(a.target) : _s),
  describe: (s) => {
    const budget = budgetMinutes(s.target);
    const left = budget - s.used;
    const head = `Target ${String(s.target)}%: ${formatMinutes(budget)} of downtime allowed per ${String(PERIOD_DAYS)} days.`;
    if (s.day === 0) return `${head} Press Step to live through the month.`;
    return `${head} Day ${String(s.day)}: ${formatMinutes(s.used)} used, ${left >= 0 ? `${formatMinutes(left)} left` : `over budget by ${formatMinutes(-left)}`}${s.exhaustedOn !== null ? ` (ran out on day ${String(s.exhaustedOn)}: freeze risky deploys)` : ''}.`;
  },
};
