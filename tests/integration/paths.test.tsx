import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '@app/App';
import { createProgressStore } from '@core/progress';
import { cloudDevopsModule } from '@domains/cloud-devops';
import { linuxOsModule } from '@domains/linux-os';

afterEach(() => {
  window.location.hash = '';
});

describe('learning paths page', () => {
  it('shows the cross-domain path to Containers, in order, with progress', async () => {
    const store = createProgressStore({ debounceMs: 0 });
    window.location.hash = '#/paths?goal=cloud-devops/containers-and-layers';
    render(<App modules={[cloudDevopsModule, linuxOsModule]} progressStore={store} />);
    await screen.findByRole('heading', { level: 1, name: /Learning paths/ });
    expect(screen.getByRole('status')).toHaveTextContent(
      '5 lessons · 2 domains · about 43 min · 0 done',
    );

    const steps = within(screen.getByRole('list', { name: 'Lessons in order' })).getAllByRole(
      'link',
    );
    const titles = steps.map((a) => a.textContent);
    expect(titles.at(-1)).toBe('Containers and image layers');
    expect(titles).toContain('Processes and the scheduler');
    expect(titles.indexOf('The shell: talking to the operating system')).toBeLessThan(
      titles.indexOf('Processes and the scheduler'),
    );
    expect(titles.indexOf('Version control with Git')).toBeLessThan(
      titles.indexOf('CI/CD pipelines'),
    );
    expect(screen.getAllByText('Next up')).toHaveLength(1);

    act(() => {
      store.markLessonComplete('linux-os/shell-basics');
    });
    expect(screen.getByRole('status')).toHaveTextContent('1 done');
  });

  it('switching goal updates the path and the URL', async () => {
    window.location.hash = '#/paths';
    render(
      <App
        modules={[cloudDevopsModule, linuxOsModule]}
        progressStore={createProgressStore({ debounceMs: 0 })}
      />,
    );
    const user = userEvent.setup();
    await user.selectOptions(await screen.findByLabelText('Goal lesson'), 'linux-os/permissions');
    expect(window.location.hash).toContain('goal=linux-os%2Fpermissions');
    expect(screen.getByRole('status')).toHaveTextContent('3 lessons · 1 domain · ');
  });
});
