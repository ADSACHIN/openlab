import { act, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DOMAINS } from '@data/domains';
import { renderWithProviders } from '../../../tests/fixtures/renderWithProviders';
import { exampleModule } from '../../../tests/fixtures/exampleModule';
import { HomePage } from './HomePage';

describe('<HomePage>', () => {
  it('renders the hero and one card per domain', () => {
    renderWithProviders(<HomePage />);
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

  it('marks domains with registered content as available and offers to resume', () => {
    const { store } = renderWithProviders(<HomePage />, { modules: [exampleModule] });
    const card = screen.getByRole('article', { name: 'Programming' });
    expect(within(card).getByText('Available')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /continue where you left off/i })).toBeNull();
    act(() => {
      store.setLastVisited('/domains/programming');
    });
    expect(screen.getByRole('link', { name: /continue where you left off/i })).toHaveAttribute(
      'href',
      '/domains/programming',
    );
  });

  it('sets the document title', () => {
    renderWithProviders(<HomePage />);
    expect(document.title).toBe('OPENLAB');
  });
});
