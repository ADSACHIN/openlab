import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { WRAPS, describeStage, wrapsAt } from './engine';
import type { EncapsulationState } from './engine';

const W = 720;
const H = 200;
const COLORS = ['var(--color-accent)', 'var(--color-success)', 'var(--color-warning)'];

export function EncapsulationView({ state }: SimulatorViewProps<EncapsulationState>) {
  const wraps = wrapsAt(state.stage);
  const onWire = state.stage === 4;
  const receiver = state.stage > 4;
  const cx = onWire ? W / 2 : receiver ? W * 0.75 : W * 0.25;
  const boxes = [];
  for (let i = wraps - 1; i >= 0; i--) {
    const w = WRAPS[i];
    if (!w) continue;
    const pad = (wraps - i) * 18;
    boxes.push(
      <g key={w.label}>
        <rect
          x={cx - 110 - pad}
          y={60 - pad}
          width={220 + pad * 2}
          height={60 + pad * 2}
          rx={8}
          fill="none"
          stroke={COLORS[i]}
          strokeWidth={2}
        />
        <text x={cx - 104 - pad} y={54 - pad + 2} fontSize={11} fill={COLORS[i]} fontWeight={600}>
          {w.label}: {w.header.split(':')[0]} header
        </text>
      </g>,
    );
  }
  return (
    <SvgStage viewBox={[0, 0, W, H]} title="Encapsulation" description={describeStage(state.stage)}>
      <text x={W * 0.25} y={24} textAnchor="middle" fontSize={13} fill="var(--color-text-muted)">
        Sender
      </text>
      <text x={W * 0.75} y={24} textAnchor="middle" fontSize={13} fill="var(--color-text-muted)">
        Receiver
      </text>
      <line
        x1={W * 0.25}
        y1={H - 20}
        x2={W * 0.75}
        y2={H - 20}
        stroke="var(--color-border-strong)"
        strokeWidth={3}
      />
      <text x={W / 2} y={H - 28} textAnchor="middle" fontSize={11} fill="var(--color-text-muted)">
        physical medium
      </text>
      {boxes}
      <rect
        x={cx - 110}
        y={60}
        width={220}
        height={60}
        rx={6}
        fill="var(--color-surface)"
        stroke="var(--color-border-strong)"
      />
      <text
        x={cx}
        y={95}
        textAnchor="middle"
        fontSize={14}
        fontFamily="var(--font-mono)"
        fill="var(--color-text)"
      >
        {onWire ? '0110 1000 0111 0100 …' : 'GET /index.html'}
      </text>
    </SvgStage>
  );
}
