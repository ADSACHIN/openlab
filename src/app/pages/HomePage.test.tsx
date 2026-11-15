import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { DOMAINS } from '@data/domains';
import { HomePage } from './HomePage';

describe('<HomePage>', () => {
  it('renders the hero and one card per domain', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/learn technology/i);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(DOMAINS.length);
    for (const d of DOMAINS) {
      expect(screen.getByRole('link', { name: d.title })).toHaveAttribute(
        'href',
        `/domains/${d.id}`,
      );
    }
    const [first] = cards;
    if (!first) throw new Error('expected at least one card');
    expect(within(first).getByText('Coming soon')).toBeInTheDocument();
  });

  it('sets the document title', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(document.title).toBe('OPENLAB');
  });
});
