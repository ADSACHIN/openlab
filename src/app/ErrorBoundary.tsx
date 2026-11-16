import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useT } from '@i18n';
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
    return <ErrorFallback message={error.message} />;
  }
}

/** Function component so the fallback can use hooks (translations). */
function ErrorFallback({ message }: { message: string }) {
  const t = useT();
  return (
    <main className={styles.wrap} role="alert">
      <h1 className={styles.title}>{t('error.title')}</h1>
      <p>{t('error.text')}</p>
      <pre className={styles.detail}>{message}</pre>
      <button
        type="button"
        className={styles.button}
        onClick={() => {
          window.location.reload();
        }}
      >
        {t('error.reload')}
      </button>
    </main>
  );
}
