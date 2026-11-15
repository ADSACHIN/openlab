import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import type { DomainModule } from '@core/model';
import { createProgressStore } from '@core/progress';
import { PreferencesProvider } from '@app/providers/PreferencesProvider';
import { ProgressProvider } from '@app/providers/ProgressProvider';
import { RegistryProvider } from '@app/providers/RegistryProvider';

export interface RenderOptions {
  modules?: readonly DomainModule[];
  initialEntries?: string[];
}

/** Renders a page component inside every app provider plus a MemoryRouter. */
export function renderWithProviders(
  ui: ReactElement,
  { modules = [], initialEntries = ['/'] }: RenderOptions = {},
) {
  const store = createProgressStore({ debounceMs: 0 });
  const utils = render(
    <PreferencesProvider>
      <RegistryProvider modules={modules}>
        <ProgressProvider store={store}>
          <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
        </ProgressProvider>
      </RegistryProvider>
    </PreferencesProvider>,
  );
  return { ...utils, store };
}
