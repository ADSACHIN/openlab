import { Pause, Play, RotateCcw, StepForward } from 'lucide-react';
import { useCallback, useId, useRef, useState } from 'react';
import type { SimulatorDefinition } from '@core/model/types';
import { useAnimationFrame } from '@hooks/useAnimationFrame';
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
}: SimulatorHostProps<S, A>) {
  const { engine, View, tickRate = 2 } = simulator;
  const base = useId();
  const [state, setState] = useState<S>(() => engine.init(seed));
  // The frame loop may run several times between renders; it reads the latest state from here.
  const stateRef = useRef(state);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [ticks, setTicks] = useState(0);
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

  const stepOnce = useCallback(() => {
    if (done) return;
    update(engine.step(state), 1);
  }, [done, engine, state, update]);

  const reset = () => {
    setRunning(false);
    accumulator.current = 0;
    const init = engine.init(seed);
    setTicks(0);
    update(init, 0);
  };

  const dispatch = useCallback(
    (action: A) => {
      if (!engine.apply) return;
      update(engine.apply(state, action), 0);
    },
    [engine, state, update],
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
          step {String(ticks)}
        </span>
      </figcaption>

      <div className={styles.stage}>
        <View state={state} dispatch={dispatch} reducedMotion={reducedMotion} />
      </div>

      <div className={styles.controls} role="group" aria-label={`${simulator.title} controls`}>
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
          {running ? (
            <Pause size={16} aria-hidden="true" focusable="false" />
          ) : (
            <Play size={16} aria-hidden="true" focusable="false" />
          )}
          {isRunning ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={stepOnce}
          disabled={running || done}
        >
          <StepForward size={16} aria-hidden="true" focusable="false" />
          Step
        </button>
        <button type="button" className={styles.button} onClick={reset}>
          <RotateCcw size={16} aria-hidden="true" focusable="false" />
          Reset
        </button>
        <label className={styles.speed}>
          Speed
          <select
            value={speed}
            onChange={(e) => {
              const v = Number(e.target.value);
              setSpeed(SPEEDS.find((s) => s === v) ?? 1);
            }}
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                ×{String(s)}
              </option>
            ))}
          </select>
        </label>
        {done && <span className={styles.done}>Finished</span>}
      </div>

      <p className={styles.live} role="status" aria-live="polite" aria-label="Simulation status">
        {announcement}
      </p>
      {caption && <p className={styles.caption}>{caption}</p>}
    </figure>
  );
}
