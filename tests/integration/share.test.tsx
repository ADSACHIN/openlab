import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '@app/App';
import { createProgressStore } from '@core/progress';
import { encodeSetup } from '@utils/share';
import { exampleModule } from '../fixtures/exampleModule';

afterEach(() => {
  window.location.hash = '';
});

const renderLab = (hash: string) => {
  window.location.hash = hash;
  return render(
    <App modules={[exampleModule]} progressStore={createProgressStore({ debounceMs: 0 })} />,
  );
};

describe('shared lab setups', () => {
  it('restores a shared setup that already solves the lab', async () => {
    const setup = encodeSetup([{ a: 'add5' }, { a: 'add5' }]) ?? '';
    renderLab(`#/domains/programming/labs/reach-ten?setup=${setup}`);
    expect(await screen.findByText(/Restored a shared setup/)).toBeInTheDocument();
    expect(screen.getByLabelText('counter value')).toHaveTextContent('10');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Check my work' }));
    expect(screen.getByText(/The counter reached ten/)).toBeInTheDocument();
  });

  it('falls back to a fresh lab for a tampered link', async () => {
    renderLab('#/domains/programming/labs/reach-ten?setup=eyJub3QiOiJhIGxvZyJ9');
    expect(await screen.findByText(/could not be restored/)).toBeInTheDocument();
    expect(screen.getByLabelText('counter value')).toHaveTextContent('0');
  });

  it('produces a link that round-trips to the same setup', async () => {
    const { unmount } = renderLab('#/domains/programming/labs/reach-ten');
    const user = userEvent.setup();
    await screen.findByRole('heading', { level: 1, name: 'Reach ten' });
    await user.click(screen.getByRole('button', { name: 'Add five' }));
    await user.click(screen.getByRole('button', { name: 'Step' }));
    await user.click(screen.getByRole('button', { name: 'Copy link to this setup' }));
    // user-event installs a clipboard stub, so the copy succeeds; the link is shown either way.
    expect(screen.getByText(/Link copied|Copy the link below/)).toBeInTheDocument();
    const url = screen.getByLabelText<HTMLInputElement>('Link to this setup').value;
    expect(url).toMatch(/#\/domains\/programming\/labs\/reach-ten\?setup=[A-Za-z0-9_-]+$/);
    unmount();

    renderLab(url.slice(url.indexOf('#')));
    expect(await screen.findByText(/Restored a shared setup/)).toBeInTheDocument();
    expect(screen.getByLabelText('counter value')).toHaveTextContent('6');
  });
});
