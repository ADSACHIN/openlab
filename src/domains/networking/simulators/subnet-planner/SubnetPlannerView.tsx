import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import {
  broadcastAddress,
  formatIpv4,
  maskFromPrefix,
  networkAddress,
  toBinary,
  usableHosts,
} from '../../lib/ipv4';
import type { SubnetPlannerAction, SubnetPlannerState } from './engine';
import styles from './SubnetPlannerView.module.css';

export function SubnetPlannerView({
  state,
  dispatch,
}: SimulatorViewProps<SubnetPlannerState, SubnetPlannerAction>) {
  const id = useId();
  const hosts = usableHosts(state.prefix);
  const fits = hosts >= state.requiredHosts;
  const ratio = Math.min(1, state.requiredHosts / Math.max(1, hosts));
  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <label htmlFor={id}>
          Prefix length: <strong>/{state.prefix}</strong>
        </label>
        <input
          id={id}
          type="range"
          min={8}
          max={32}
          value={state.prefix}
          onChange={(e) => dispatch({ type: 'set-prefix', prefix: Number(e.target.value) })}
          aria-valuetext={`/${String(state.prefix)}, ${String(hosts)} usable hosts`}
        />
      </div>
      <dl className={styles.facts}>
        <div>
          <dt>Network</dt>
          <dd>
            {formatIpv4(networkAddress(state.baseIp, state.prefix))}/{state.prefix}
          </dd>
        </div>
        <div>
          <dt>Mask</dt>
          <dd>{formatIpv4(maskFromPrefix(state.prefix))}</dd>
        </div>
        <div>
          <dt>Broadcast</dt>
          <dd>{formatIpv4(broadcastAddress(state.baseIp, state.prefix))}</dd>
        </div>
        <div>
          <dt>Usable hosts</dt>
          <dd className={fits ? styles.ok : styles.bad}>
            {hosts} {fits ? '≥' : '<'} {state.requiredHosts} needed
          </dd>
        </div>
      </dl>
      <SvgStage
        viewBox={[0, 0, 640, 70]}
        title="Address block usage"
        description={`${String(state.requiredHosts)} required of ${String(hosts)} usable addresses`}
      >
        <rect x={0} y={20} width={640} height={24} rx={6} fill="var(--color-accent-soft)" />
        <rect
          x={0}
          y={20}
          width={640 * (fits ? ratio : 1)}
          height={24}
          rx={6}
          fill={fits ? 'var(--color-success)' : 'var(--color-danger)'}
        />
        <text
          x={8}
          y={62}
          fontSize={11}
          fill="var(--color-text-muted)"
          fontFamily="var(--font-mono)"
        >
          mask {toBinary(maskFromPrefix(state.prefix))}
        </text>
      </SvgStage>
    </div>
  );
}
