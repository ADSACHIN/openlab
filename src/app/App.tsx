import { HashRouter } from 'react-router';
import type { DomainModule } from '@core/model';
import type { ProgressStore } from '@core/progress';
import { ErrorBoundary } from './ErrorBoundary';
import { MODULES } from './modules';
import { PreferencesProvider } from './providers/PreferencesProvider';
import { ProgressProvider } from './providers/ProgressProvider';
import { RegistryProvider } from './providers/RegistryProvider';
import { RouteTracker } from './RouteTracker';
import { AppRoutes } from './routes';

export interface AppProps {
  /** Injectable for tests; defaults to the registered modules. */
  modules?: readonly DomainModule[];
  progressStore?: ProgressStore;
}

export function App({ modules = MODULES, progressStore }: AppProps) {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <RegistryProvider modules={modules}>
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
