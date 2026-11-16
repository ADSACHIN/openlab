import { Pause, Play, RotateCcw, StepForward } from 'lucide-react';
import { useCallback, useId, useRef, useState } from 'react';
import type { SimulatorDefinition } from '@core/model/types';
import { appendAction, appendSteps, replayLog, totalSteps } from '@utils/share';
import type { ActionLog } from '@utils/share';
import { useAnimationFrame } from '@hooks/useAnimationFrame';
import { useT } from '@i18n';
import { SimulatorErrorBoundary } from './SimulatorErrorBoundary';
import styles from './SimulatorHost.module.css';

const SPEEDS = [0.5, 1, 2, 4] as const;
type Speed = (typeof SPEEDS)[number];
const ANNOUNCE_INTERVAL_MS = 1000;

export interface SimulatorHostProps<S, A> {
  simulator: SimulatorDefinition<S, A>;
  seed?: number;
  reducedMotion: boolean;
  /** Fires on every state change (labs use it to run their check). */
  onStateChange?: (state: S) => void;
  caption?: string;
  /** Start from a shared setup (ADR-0013). Ignored if it cannot be replayed. */
  initialLog?: ActionLog;
  /** Fires with the learner's history after every step, action or reset. */
  onLogChange?: (log: ActionLog) => void;
}

/**
 * Owns time and state for a deterministic engine: play / pause / step / reset /
 * speed, an aria-live summary, keyboard-operable controls. Never autoplays.
 */
export function SimulatorHost<S, A>({
  simulator,
  seed = 1,
  reducedMotion,
  onStateChange,
  caption,
  initialLog,
  onLogChange,
}: SimulatorHostProps<S, A>) {
  const t = useT();
  const { engine, View, tickRate = 2 } = simulator;
  const playback = simulator.controls !== 'reset';
  const base = useId();
  // A shared setup is replayed once, on mount; if it cannot be replayed the host starts fresh.
  const [boot] = useState(() => {
    const restored = initialLog ? replayLog(engine, seed, initialLog) : null;
    return restored !== null && initialLog
      ? { state: restored, log: initialLog }
      : { state: engine.init(seed), log: [] as ActionLog };
  });
  const [state, setState] = useState<S>(boot.state);
  // The frame loop may run several times between renders; it reads the latest state from here.
  const stateRef = useRef(state);
  const logRef = useRef<ActionLog>(boot.log);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [ticks, setTicks] = useState(() => totalSteps(boot.log));
  const accumulator = useRef(0);
  // While playing, the live region is refreshed from the frame loop at most once a second.
  const [playingAnnouncement, setPlayingAnnouncement] = useState('');
  const lastAnnounce = useRef(0);

  const done = engine.isDone?.(state) ?? false;
  const isRunning = running && !done;
  const announcement = isRunning ? playingAnnouncement : engine.describe(state);

  const update = useCallback(
    (next: S, tickDelta: number) => {
      stateRef.current = next;
      setState(next);
      setTicks((t) => t + tickDelta);
      onStateChange?.(next);
    },
    [onStateChange],
  );

  const record = useCallback(
    (next: ActionLog) => {
      logRef.current = next;
      onLogChange?.(next);
    },
    [onLogChange],
  );

  const stepOnce = useCallback(() => {
    if (done) return;
    update(engine.step(state), 1);
    record(appendSteps(logRef.current, 1));
  }, [done, engine, state, update, record]);

  const reset = () => {
    setRunning(false);
    accumulator.current = 0;
    const init = engine.init(seed);
    setTicks(0);
    update(init, 0);
    record([]);
  };

  const dispatch = useCallback(
    (action: A) => {
      if (!engine.apply) return;
      update(engine.apply(state, action), 0);
      record(appendAction(logRef.current, action));
    },
    [engine, state, update, record],
  );

  // Time → engine steps. Reduced motion still allows play, but at a calm pace.
  const effectiveRate = tickRate * speed * (reducedMotion ? 0.5 : 1);
  useAnimationFrame((dt) => {
    accumulator.current += dt;
    const interval = 1000 / effectiveRate;
    if (accumulator.current < interval) return;
    const n = Math.floor(accumulator.current / interval);
    accumulator.current -= n * interval;
    let next = stateRef.current;
    let stepped = 0;
    for (let i = 0; i < n; i++) {
      if (engine.isDone?.(next)) break;
      next = engine.step(next);
      stepped++;
    }
    if (stepped > 0) {
      update(next, stepped);
      record(appendSteps(logRef.current, stepped));
      const now = performance.now();
      if (now - lastAnnounce.current >= ANNOUNCE_INTERVAL_MS) {
        lastAnnounce.current = now;
        setPlayingAnnouncement(engine.describe(next));
      }
    }
  }, isRunning);

  return (
    <figure className={styles.host} aria-labelledby={`${base}-title`}>
      <figcaption className={styles.header}>
        <span id={`${base}-title`} className={styles.title}>
          {simulator.title}
        </span>
        <span className={styles.ticks} aria-hidden="true">
          {t('sim.stepCount', { count: ticks })}
        </span>
      </figcaption>

      <div className={styles.stage}>
        <SimulatorErrorBoundary onReset={reset}>
          <View state={state} dispatch={dispatch} reducedMotion={reducedMotion} />
        </SimulatorErrorBoundary>
      </div>

      <div
        className={styles.controls}
        role="group"
        aria-label={t('sim.controls', { title: simulator.title })}
      >
        {playback && (
          <>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                lastAnnounce.current = performance.now();
                setRunning((r) => !r);
              }}
              disabled={done}
              aria-pressed={isRunning}
            >
              {isRunning ? (
                <Pause size={16} aria-hidden="true" focusable="false" />
              ) : (
                <Play size={16} aria-hidden="true" focusable="false" />
              )}
              {isRunning ? t('sim.pause') : t('sim.play')}
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={stepOnce}
              disabled={isRunning || done}
            >
              <StepForward size={16} aria-hidden="true" focusable="false" />
              {t('sim.step')}
            </button>
          </>
        )}
        <button type="button" className={styles.button} onClick={reset}>
          <RotateCcw size={16} aria-hidden="true" focusable="false" />
          {t('sim.reset')}
        </button>
        {playback && (
          <label className={styles.speed}>
            {t('sim.speed')}
            <select
              value={speed}
              onChange={(e) => {
                const v = Number(e.target.value);
                setSpeed(SPEEDS.find((s) => s === v) ?? 1);
              }}
            >
              {SPEEDS.map((s) => (
                <option key={s} value={s}>
                  {t('sim.speedOption', { speed: s })}
                </option>
              ))}
            </select>
          </label>
        )}
        {playback && done && <span className={styles.done}>{t('sim.finished')}</span>}
      </div>

      <p className={styles.live} role="status" aria-live="polite" aria-label={t('sim.status')}>
        {announcement}
      </p>
      {caption && <p className={styles.caption}>{caption}</p>}
    </figure>
  );
}
