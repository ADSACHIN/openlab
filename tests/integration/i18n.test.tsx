import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '@app/App';
import { createProgressStore } from '@core/progress';
import { en, pseudoLocalize } from '@i18n';
import { exampleModule } from '../fixtures/exampleModule';

/** Text nodes under `root`, trimmed and non-empty. */
function texts(root: Element): string[] {
  const out: string[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const v = n.textContent?.trim() ?? '';
    if (v) out.push(v);
  }
  return out;
}

const isWrapped = (s: string) => s.startsWith('⟦') && s.endsWith('⟧');

function renderPseudo(hash: string) {
  window.location.hash = hash;
  return render(
    <App
      modules={[exampleModule]}
      progressStore={createProgressStore({ debounceMs: 0 })}
      locale="en-XA"
      messages={pseudoLocalize(en)}
    />,
  );
}

afterEach(() => {
  window.location.hash = '';
});

describe('UI text flows through the i18n catalogue (pseudo-locale)', () => {
  it('app shell: every header and footer string is translated, and <html lang> follows the locale', async () => {
    renderPseudo('#/');
    const header = await screen.findByRole('banner');
    // The brand name is a proper noun and intentionally untranslated.
    expect(
      texts(header)
        .filter((s) => s !== 'OPENLAB')
        .every(isWrapped),
    ).toBe(true);
    expect(texts(screen.getByRole('contentinfo')).every(isWrapped)).toBe(true);
    expect(screen.getByRole('link', { name: '⟦Skip to main content⟧' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      '⟦Learn technology by ⟧⟦doing⟧⟦.⟧',
    );
    expect(screen.getByRole('heading', { name: '⟦Learning domains⟧' })).toBeInTheDocument();
    expect(screen.getAllByText('⟦Coming soon⟧').length).toBeGreaterThan(0);
    expect(document.documentElement.lang).toBe('en-XA');
  });

  it('lesson page: quiz and lesson chrome are translated', async () => {
    renderPseudo('#/domains/programming/lessons/loops');
    await screen.findByRole('heading', { level: 1, name: 'Loops' });
    expect(screen.getByRole('button', { name: '⟦Check answers⟧' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⟦Mark as complete⟧/ })).toBeInTheDocument();
    const overview = screen.getByRole('complementary', { name: '⟦Lesson overview⟧' });
    expect(within(overview).getByText('⟦Before this⟧')).toBeInTheDocument();
  });

  it('a page with a simulator: every control label is translated', async () => {
    renderPseudo('#/domains/programming/lessons/intro');
    await screen.findByRole('heading', { level: 1, name: 'What is a program?' });
    const group = screen.getByRole('group', { name: /controls⟧$/ });
    expect(texts(group).every(isWrapped)).toBe(true);
    expect(screen.getByRole('status', { name: '⟦Simulation status⟧' })).toBeInTheDocument();
  });
});
