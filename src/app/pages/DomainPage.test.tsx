import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { DomainPage } from './DomainPage';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="domains/:domainId" element={<DomainPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('<DomainPage>', () => {
  it('renders a known domain with its topics and roadmap notice', () => {
    renderAt('/domains/networking');
    expect(screen.getByRole('heading', { level: 1, name: 'Networking' })).toBeInTheDocument();
    expect(screen.getByText('Subnetting')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/not built yet/i);
    expect(document.title).toBe('Networking · OPENLAB');
  });

  it('falls back to the not-found page for unknown ids', () => {
    renderAt('/domains/unknown');
    expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument();
  });
});
