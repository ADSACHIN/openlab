import { useEffect, useRef } from 'react';

/**
 * Calls `onFrame(deltaMs)` every animation frame while `active` is true.
 * The latest callback is captured after each render so callers can pass
 * inline functions without restarting the loop.
 */
export function useAnimationFrame(onFrame: (deltaMs: number) => void, active: boolean): void {
  const cb = useRef(onFrame);
  useEffect(() => {
    cb.current = onFrame;
  });

  useEffect(() => {
    if (!active) return;
    let handle = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = t - last;
      last = t;
      cb.current(dt);
      handle = requestAnimationFrame(loop);
    };
    handle = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(handle);
    };
  }, [active]);
}
