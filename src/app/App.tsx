import { useState } from 'react';
import { HashRouter } from 'react-router';
import type { DomainModule } from '@core/model';
import type { ProgressStore } from '@core/progress';
import { I18nProvider, pickLocale } from '@i18n';
import type { Messages } from '@i18n';
import { ErrorBoundary } from './ErrorBoundary';
import { createModuleStore } from './moduleStore';
import { MODULE_LOADERS } from './modules';
import { PreferencesProvider } from './providers/PreferencesProvider';
import { ProgressProvider } from './providers/ProgressProvider';
import { RegistryProvider } from './providers/RegistryProvider';
import { RouteTracker } from './RouteTracker';
import { AppRoutes } from './routes';

export interface AppProps {
  /** Injectable for tests: modules available synchronously instead of the lazy loaders. */
  modules?: readonly DomainModule[];
  progressStore?: ProgressStore;
  /** Injectable for tests (e.g. a pseudo-locale); defaults to the best match for the browser. */
  locale?: string;
  messages?: Messages;
}

export function App({ modules, progressStore, locale, messages }: AppProps) {
  const [activeLocale] = useState(
    () => locale ?? pickLocale(typeof navigator === 'undefined' ? [] : navigator.languages),
  );
  const [store] = useState(() =>
    modules
      ? createModuleStore({ preloaded: modules })
      : createModuleStore({ loaders: MODULE_LOADERS }),
  );
  return (
    <I18nProvider locale={activeLocale} {...(messages ? { messages } : {})}>
      <ErrorBoundary>
        <PreferencesProvider>
          <RegistryProvider store={store}>
            {progressStore ? (
              <ProgressProvider store={progressStore}>
                <Shell />
              </ProgressProvider>
            ) : (
              <ProgressProvider>
                <Shell />
              </ProgressProvider>
            )}
          </RegistryProvider>
        </PreferencesProvider>
      </ErrorBoundary>
    </I18nProvider>
  );
}

function Shell() {
  return (
    <HashRouter>
      <RouteTracker />
      <AppRoutes />
    </HashRouter>
  );
}
