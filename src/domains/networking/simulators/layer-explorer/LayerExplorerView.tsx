import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { LAYERS } from './engine';
import type { LayerExplorerAction, LayerExplorerState } from './engine';
import { cx } from '@utils/cx';
import styles from './LayerExplorerView.module.css';

const ROW = 40;
const W = 640;

export function LayerExplorerView({
  state,
  dispatch,
}: SimulatorViewProps<LayerExplorerState, LayerExplorerAction>) {
  const current = LAYERS[state.selected];
  return (
    <div className={styles.wrap}>
      <div className={styles.stack} role="radiogroup" aria-label="OSI layers">
        {LAYERS.map((l, i) => {
          const active = i === state.selected;
          return (
            <button
              key={l.number}
              type="button"
              role="radio"
              aria-checked={active}
              className={cx(styles.layer, active && styles.layerActive)}
              onClick={() => dispatch({ type: 'select', index: i })}
            >
              <span className={styles.num}>{l.number}</span>
              <span className={styles.name}>{l.name}</span>
              <span className={styles.unit}>{l.unit}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.detail}>
        <SvgStage
          viewBox={[0, 0, W, ROW * 2]}
          title="Selected layer"
          description={current ? `Layer ${String(current.number)} ${current.name}` : ''}
        >
          <rect x={0} y={0} width={W} height={ROW * 2} rx={10} fill="var(--color-accent-soft)" />
          <text x={20} y={30} fontSize={20} fontWeight={700} fill="var(--color-text)">
            {current ? `Layer ${String(current.number)} · ${current.name}` : ''}
          </text>
          <text x={20} y={58} fontSize={14} fill="var(--color-text-muted)">
            {current ? `PDU: ${current.unit} · e.g. ${current.examples}` : ''}
          </text>
        </SvgStage>
        <p className={styles.job}>{current?.job}</p>
      </div>
    </div>
  );
}
