import { Component } from 'react';
import type { ReactNode } from 'react';
import { useT } from '@i18n';
import styles from './SimulatorHost.module.css';

interface Props {
  children: ReactNode;
  /** Called when the learner asks to start again; the host resets the engine. */
  onReset: () => void;
}
interface State {
  failed: boolean;
}

/**
 * Contains a failure inside one simulator view (for example from an odd shared
 * setup) so the rest of the page keeps working and the learner can reset.
 */
export class SimulatorErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error): void {
    // No telemetry by design: log locally only.
    console.error('OPENLAB simulator error', error);
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <SimulatorErrorFallback
        onReset={() => {
          this.setState({ failed: false });
          this.props.onReset();
        }}
      />
    );
  }
}

function SimulatorErrorFallback({ onReset }: { onReset: () => void }) {
  const t = useT();
  return (
    <div className={styles.failure} role="alert">
      <p>{t('sim.error')}</p>
      <button type="button" className={styles.button} onClick={onReset}>
        {t('sim.reset')}
      </button>
    </div>
  );
}
