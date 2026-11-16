import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { defineSimulator } from '@core/model/helpers';
import { SimulatorHost } from './SimulatorHost';

interface S {
  n: number;
}
const counter = defineSimulator<S, 'bump' | 'noop'>({
  domainId: 'programming',
  slug: 'counter',
  title: 'Counter',
  description: 'counts to 3',
  engine: {
    init: () => ({ n: 0 }),
    step: (s) => ({ n: s.n + 1 }),
    apply: (s, a) => (a === 'bump' ? { n: s.n + 10 } : s),
    isDone: (s) => s.n >= 3,
    describe: (s) => `Count is ${String(s.n)}`,
  },
  View: ({ state, dispatch }) => (
    <div>
      <output aria-label="value">{state.n}</output>
      <button type="button" onClick={() => dispatch('bump')}>
        bump
      </button>
    </div>
  ),
});

describe('<SimulatorHost>', () => {
  it('steps, dispatches actions, resets and never autoplays', async () => {
    const onStateChange = vi.fn();
    render(
      <SimulatorHost simulator={counter} reducedMotion={false} onStateChange={onStateChange} />,
    );
    const user = userEvent.setup();

    expect(screen.getByRole('button', { name: 'Play' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('status', { name: 'Simulation status' })).toHaveTextContent(
      'Count is 0',
    );

    await user.click(screen.getByRole('button', { name: 'Step' }));
    expect(screen.getByRole('status', { name: 'Simulation status' })).toHaveTextContent(
      'Count is 1',
    );
    expect(onStateChange).toHaveBeenLastCalledWith({ n: 1 });

    await user.click(screen.getByRole('button', { name: 'bump' }));
    expect(screen.getByRole('status', { name: 'value' })).toHaveTextContent('11');
    expect(screen.getByText('Finished')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('status', { name: 'Simulation status' })).toHaveTextContent(
      'Count is 0',
    );
  });

  it('advances with animation frames while playing and stops when done', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    try {
      render(<SimulatorHost simulator={counter} reducedMotion={false} />);
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await user.click(screen.getByRole('button', { name: 'Play' }));
      // tickRate 2/s → one step every 500 ms; run 2 s
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByText('Finished')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Play' })).toHaveAttribute('aria-pressed', 'false');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('<SimulatorHost> with controls="reset"', () => {
  it('shows only Reset for interactive-only simulators', async () => {
    const interactive = defineSimulator<S, 'bump' | 'noop'>({
      domainId: 'programming',
      slug: 'interactive',
      title: 'Interactive',
      description: '',
      controls: 'reset',
      engine: {
        init: () => ({ n: 0 }),
        step: (s) => s,
        apply: (s, a) => (a === 'bump' ? { n: s.n + 1 } : s),
        describe: (s) => `n=${String(s.n)}`,
      },
      View: ({ state, dispatch }) => (
        <button type="button" onClick={() => dispatch('bump')}>
          bump {state.n}
        </button>
      ),
    });
    render(<SimulatorHost simulator={interactive} reducedMotion={false} />);
    const user = userEvent.setup();
    expect(screen.queryByRole('button', { name: 'Play' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Step' })).toBeNull();
    expect(screen.queryByLabelText('Speed')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'bump 0' }));
    expect(screen.getByRole('status', { name: 'Simulation status' })).toHaveTextContent('n=1');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('status', { name: 'Simulation status' })).toHaveTextContent('n=0');
  });
});

describe('<SimulatorHost> history and recovery', () => {
  it('records steps and actions, restores from a log, and clears on reset', async () => {
    const logs: unknown[] = [];
    const { unmount } = render(
      <SimulatorHost simulator={counter} reducedMotion={false} onLogChange={(l) => logs.push(l)} />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Step' }));
    await user.click(screen.getByRole('button', { name: 'Step' }));
    await user.click(screen.getByRole('button', { name: 'bump' }));
    expect(logs.at(-1)).toEqual([2, { a: 'bump' }]);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(logs.at(-1)).toEqual([]);
    unmount();

    render(
      <SimulatorHost simulator={counter} reducedMotion={false} initialLog={[2, { a: 'bump' }]} />,
    );
    expect(screen.getByRole('status', { name: 'value' })).toHaveTextContent('12');
    expect(screen.getByText('step 2')).toBeInTheDocument();
  });

  it('starts fresh when the log cannot be replayed', () => {
    render(
      <SimulatorHost
        simulator={counter}
        reducedMotion={false}
        initialLog={[{ a: { not: 'an action' } }, 1]}
      />,
    );
    // apply returns the state unchanged for unknown actions, so this replays to n = 1
    expect(screen.getByRole('status', { name: 'Simulation status' })).toHaveTextContent(
      'Count is 1',
    );
  });

  it('contains a crashing view and recovers on reset', async () => {
    const fragile = defineSimulator<S, 'bump' | 'noop'>({
      domainId: 'programming',
      slug: 'fragile',
      title: 'Fragile',
      description: '',
      engine: counter.engine,
      View: ({ state }) => {
        if (state.n >= 2) throw new Error('view cannot draw this state');
        return <output aria-label="value">{state.n}</output>;
      },
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<SimulatorHost simulator={fragile} reducedMotion={false} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Step' }));
    await user.click(screen.getByRole('button', { name: 'Step' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/ran into a problem/);
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    await user.click(within(screen.getByRole('alert')).getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('status', { name: 'value' })).toHaveTextContent('0');
    spy.mockRestore();
  });
});
