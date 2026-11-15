import { HashRouter } from 'react-router';
import { ErrorBoundary } from './ErrorBoundary';
import { PreferencesProvider } from './providers/PreferencesProvider';
import { AppRoutes } from './routes';

export function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}
