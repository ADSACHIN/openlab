import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * The one class component in the codebase: React still requires a class for
 * `componentDidCatch`. Shows a recoverable message instead of a blank page.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // No telemetry by design: log locally only.
    console.error('OPENLAB render error', error, info.componentStack);
  }

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <main className={styles.wrap} role="alert">
        <h1 className={styles.title}>Something went wrong</h1>
        <p>The page hit an unexpected error. Reloading usually fixes it; your progress is safe.</p>
        <pre className={styles.detail}>{error.message}</pre>
        <button
          type="button"
          className={styles.button}
          onClick={() => {
            window.location.reload();
          }}
        >
          Reload
        </button>
      </main>
    );
  }
}
