import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '@app/App';
import { createProgressStore } from '@core/progress';
import { exampleModule } from '../fixtures/exampleModule';

function renderApp(hash: string) {
  window.location.hash = hash;
  const store = createProgressStore({ debounceMs: 0 });
  const utils = render(<App modules={[exampleModule]} progressStore={store} />);
  return { ...utils, store };
}

describe('learning flow (registry + progress + pages)', () => {
  beforeEach(() => {
    window.location.hash = '';
  });
  afterEach(() => {
    window.location.hash = '';
  });

  it('shows a domain as available with lessons in prerequisite order', async () => {
    renderApp('#/domains/programming');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Programming' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Programming lessons' });
    const links = within(list).getAllByRole('link');
    expect(links.map((l) => l.textContent.replace(/^\d+\.\s*/, ''))).toEqual([
      'What is a program?',
      'Loops',
    ]);
    expect(screen.getByText('0 / 2 done')).toBeInTheDocument();
  });

  it('renders a lesson with its simulator, marks it complete and persists', async () => {
    const { store } = renderApp('#/domains/programming/lessons/intro');
    const user = userEvent.setup();
    expect(
      await screen.findByRole('heading', { level: 1, name: 'What is a program?' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Step' }));
    expect(screen.getByLabelText('counter value')).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: /mark as complete/i }));
    expect(screen.getByRole('button', { name: /completed/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(store.getState().completedLessons['programming/intro']).toBeDefined();
    expect(window.localStorage.getItem('openlab:progress:v1')).toContain('programming/intro');

    // Learn next links to the dependent lesson
    await user.click(
      within(screen.getByRole('navigation', { name: 'Learn next' })).getByRole('link', {
        name: 'Loops',
      }),
    );
    expect(await screen.findByRole('heading', { level: 1, name: 'Loops' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('complementary', { name: 'Lesson overview' })).getByText(
        'What is a program?',
      ),
    ).toBeInTheDocument();
  });

  it('records quiz results', async () => {
    const { store } = renderApp('#/domains/programming/lessons/loops');
    const user = userEvent.setup();
    await screen.findByRole('heading', { level: 1, name: 'Loops' });
    await user.click(screen.getByRole('radio', { name: '3' }));
    await user.click(screen.getByRole('button', { name: /check answers/i }));
    expect(store.getState().quizResults['programming/loops/quiz']).toMatchObject({
      correct: 1,
      total: 1,
    });
  });

  it('runs a lab check against live simulator state', async () => {
    const { store } = renderApp('#/domains/programming/labs/reach-ten');
    const user = userEvent.setup();
    await screen.findByRole('heading', { level: 1, name: 'Reach ten' });
    await user.click(screen.getByRole('button', { name: 'Check my work' }));
    expect(screen.getByText(/only at 0 so far/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add five' }));
    await user.click(screen.getByRole('button', { name: 'Add five' }));
    await user.click(screen.getByRole('button', { name: 'Check my work' }));
    expect(screen.getByText(/the counter reached ten/i)).toBeInTheDocument();
    expect(store.getState().labResults['programming/reach-ten']).toMatchObject({
      passed: true,
      attempts: 2,
      score: 100,
    });
  });

  it('searches lessons and labs and shows progress totals', async () => {
    const { store } = renderApp('#/search');
    const user = userEvent.setup();
    await user.type(await screen.findByRole('searchbox'), 'loop');
    expect(screen.getByRole('link', { name: 'Loops' })).toHaveAttribute(
      'href',
      '#/domains/programming/lessons/loops',
    );
    expect(screen.getByRole('status')).toHaveTextContent('1 result');

    store.markLessonComplete('programming/intro');
    window.location.hash = '#/progress';
    expect(await screen.findByText('Lessons completed')).toBeInTheDocument();
    expect(screen.getByText('Lessons completed').nextElementSibling).toHaveTextContent('1 / 2');
  });

  it('404s for a lesson slug the registry does not know', async () => {
    renderApp('#/domains/programming/lessons/nope');
    expect(
      await screen.findByRole('heading', { level: 1, name: /page not found/i }),
    ).toBeInTheDocument();
  });
});
