import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { defineLesson } from '@core/model/helpers';
import { LessonRenderer } from './LessonRenderer';

const lesson = defineLesson({
  slug: 'demo',
  domainId: 'programming',
  title: 'Demo',
  summary: '',
  estimatedMinutes: 1,
  prerequisites: [],
  outcomes: [],
  tags: [],
  blocks: [
    { type: 'heading', level: 2, text: 'Section' },
    { type: 'paragraph', text: 'Use `const` here.' },
    { type: 'list', ordered: true, items: ['one', 'two'] },
    { type: 'callout', tone: 'tip', text: 'A tip.' },
    { type: 'code', language: 'ts', code: 'let x = 1;', caption: 'Example' },
    { type: 'interactive', simulatorId: 'programming/missing' },
  ],
});

describe('<LessonRenderer>', () => {
  it('renders each block type and warns about unknown simulators', () => {
    render(<LessonRenderer lesson={lesson} resolveSimulator={() => undefined} reducedMotion />);
    expect(screen.getByRole('heading', { level: 2, name: 'Section' })).toBeInTheDocument();
    expect(screen.getByText('const').tagName).toBe('CODE');
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Tip' })).toHaveTextContent('A tip.');
    expect(screen.getByText('let x = 1;')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Missing simulator' })).toBeInTheDocument();
  });
});
