import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Quiz as QuizModel } from '@core/model/types';
import { Quiz } from './Quiz';

const quiz: QuizModel = {
  id: 'q',
  questions: [
    {
      id: 'q1',
      prompt: 'Which layer is `TCP`?',
      choices: [
        { id: 'a', text: 'Transport' },
        { id: 'b', text: 'Network' },
      ],
      answerId: 'a',
      explanation: 'TCP is layer 4.',
    },
    {
      id: 'q2',
      prompt: '2 + 2?',
      choices: [
        { id: 'a', text: '3' },
        { id: 'b', text: '4' },
      ],
      answerId: 'b',
      explanation: 'Arithmetic.',
    },
  ],
};

describe('<Quiz>', () => {
  it('requires every question answered, then grades and reports', async () => {
    const onComplete = vi.fn();
    render(<Quiz quiz={quiz} onComplete={onComplete} />);
    const user = userEvent.setup();
    const check = screen.getByRole('button', { name: /check answers/i });
    expect(check).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'Transport' }));
    await user.click(screen.getByRole('radio', { name: '3' }));
    expect(check).toBeEnabled();
    await user.click(check);

    expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 2 });
    expect(screen.getByRole('status')).toHaveTextContent('You got 1 of 2 correct.');
    expect(screen.getByText(/TCP is layer 4/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Transport' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(screen.getByRole('button', { name: /check answers/i })).toBeDisabled();
  });
});
