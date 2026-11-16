/**
 * OPENLAB content model — the contract every domain module fulfils.
 * Pure data plus pure functions. The only React import is the `ReactNode`
 * *type* for simulator views; `src/core` never imports React at runtime.
 */
import type { ReactNode } from 'react';
import type { DomainId } from '@typings/domain';

/** `${DomainId}/${slug}` — globally unique, URL-safe. */
export type LessonId = string;
export type LabId = string;
export type SimulatorId = string;
export type QuizId = string;

// ---------- Quiz ----------
export interface QuizChoice {
  id: string;
  text: string;
}
export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: readonly QuizChoice[];
  answerId: string;
  explanation: string;
}
export interface Quiz {
  id: QuizId;
  title?: string;
  questions: readonly QuizQuestion[];
}

// ---------- Content blocks ----------
export type CalloutTone = 'info' | 'tip' | 'warning';

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'list'; ordered?: boolean; items: readonly string[] }
  | { type: 'callout'; tone: CalloutTone; title?: string; text: string }
  | { type: 'code'; language: string; code: string; caption?: string }
  | { type: 'interactive'; simulatorId: SimulatorId; caption?: string }
  | { type: 'quiz'; quiz: Quiz };

// ---------- Lesson ----------
export interface LessonMeta {
  id: LessonId;
  slug: string;
  domainId: DomainId;
  title: string;
  summary: string;
  estimatedMinutes: number;
  /** Lesson ids that should be completed first. May cross domains. */
  prerequisites: readonly LessonId[];
  /** "After this you can …" statements. */
  outcomes: readonly string[];
  tags: readonly string[];
}
export interface Lesson extends LessonMeta {
  blocks: readonly ContentBlock[];
}

// ---------- Simulator ----------
/**
 * A deterministic engine: same seed + same actions ⇒ same states.
 * All functions are pure; the host owns time and React state.
 */
export interface SimulatorEngine<S, A = never> {
  init(seed: number): S;
  step(state: S): S;
  apply?(state: S, action: A): S;
  isDone?(state: S): boolean;
  /** One sentence for screen-reader announcements. */
  describe(state: S): string;
}

export interface SimulatorViewProps<S, A = never> {
  state: S;
  dispatch: (action: A) => void;
  reducedMotion: boolean;
}

export interface SimulatorDefinition<S, A = never> {
  id: SimulatorId;
  domainId: DomainId;
  slug: string;
  title: string;
  description: string;
  engine: SimulatorEngine<S, A>;
  /** A function component. Declared as a plain function so modules with different state types can share one registry. */
  View: (props: SimulatorViewProps<S, A>) => ReactNode;
  /** Engine steps per second at speed ×1. Default 2. */
  tickRate?: number;
  /**
   * 'playback' (default) shows Play, Step and Speed. 'reset' shows only Reset, for simulators
   * driven entirely by the learner (a shell, a form, a slider) where time has no meaning.
   */
  controls?: 'playback' | 'reset';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- existential type: a module holds simulators with heterogeneous state/action types
export type AnySimulatorDefinition = SimulatorDefinition<any, any>;

// ---------- Lab ----------
export interface LabResult {
  passed: boolean;
  message: string;
  /** 0–100 when meaningful. */
  score?: number;
}

export interface Lab {
  id: LabId;
  slug: string;
  domainId: DomainId;
  title: string;
  summary: string;
  estimatedMinutes: number;
  prerequisites: readonly LessonId[];
  simulatorId: SimulatorId;
  /** One sentence shown as the objective. */
  goal: string;
  instructions: readonly ContentBlock[];
  /** Receives the simulator's current state. Must be pure. */
  check(state: unknown): LabResult;
}

// ---------- Domain module ----------
export interface DomainModule {
  id: DomainId;
  lessons: readonly Lesson[];
  labs: readonly Lab[];
  simulators: readonly AnySimulatorDefinition[];
}
