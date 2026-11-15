import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InlineText } from './InlineText';

describe('<InlineText>', () => {
  it('renders code spans and bold runs, never HTML', () => {
    render(<InlineText text="Use `ls -la` for a **long** list <b>not html</b>" />);
    expect(screen.getByText('ls -la').tagName).toBe('CODE');
    expect(screen.getByText('long').tagName).toBe('STRONG');
    expect(screen.getByText(/<b>not html<\/b>/)).toBeInTheDocument();
    expect(document.querySelector('b')).toBeNull();
  });
});
