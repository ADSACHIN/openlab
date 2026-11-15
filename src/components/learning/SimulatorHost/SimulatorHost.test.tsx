import { act, render, screen } from '@testing-library/react';
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
