import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('<App>', () => {
  it('routes with the hash, shows 404 for unknown routes, and toggles theme', async () => {
    window.location.hash = '#/does-not-exist';
    render(<App />);
    expect(
      await screen.findByRole('heading', { level: 1, name: /page not found/i }),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('link', { name: /back to all domains/i }));
    expect(
      await screen.findByRole('heading', { level: 1, name: /learn technology/i }),
    ).toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /system theme/i });
    await user.click(toggle);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem('openlab:preferences:v1')).toContain('"theme":"light"');
    window.location.hash = '';
  });
});
