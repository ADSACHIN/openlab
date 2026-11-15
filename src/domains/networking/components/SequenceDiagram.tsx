import { SvgStage } from '@components/viz/SvgStage';

export interface SequenceMessage {
  from: string;
  to: string;
  text: string;
  /** Rendered with a dashed stroke. */
  muted?: boolean;
}

export interface SequenceDiagramProps {
  actors: readonly string[];
  messages: readonly SequenceMessage[];
  /** How many messages are visible (the latest is highlighted). */
  visible: number;
  title: string;
  description: string;
  reducedMotion: boolean;
}

const WIDTH = 640;
const MARGIN = 70;
const TOP = 44;
const ROW = 36;
const PAD = 24;

/** A lightweight sequence diagram in SVG shared by the DNS, TCP and TLS simulators. */
export function SequenceDiagram({
  actors,
  messages,
  visible,
  title,
  description,
  reducedMotion,
}: SequenceDiagramProps) {
  const width = WIDTH;
  const height = TOP + ROW * (messages.length + 1) + PAD;
  const gap = actors.length > 1 ? (WIDTH - MARGIN * 2) / (actors.length - 1) : 0;
  const x = (actor: string) => MARGIN + Math.max(0, actors.indexOf(actor)) * gap;
  return (
    <SvgStage viewBox={[0, 0, width, height]} title={title} description={description}>
      {actors.map((a) => (
        <g key={a}>
          <rect
            x={x(a) - 54}
            y={6}
            width={108}
            height={26}
            rx={6}
            fill="var(--color-accent-soft)"
            stroke="var(--color-border-strong)"
          />
          <text
            x={x(a)}
            y={24}
            textAnchor="middle"
            fontSize={13}
            fontWeight={600}
            fill="var(--color-text)"
          >
            {a}
          </text>
          <line
            x1={x(a)}
            y1={34}
            x2={x(a)}
            y2={height - PAD}
            stroke="var(--color-border)"
            strokeDasharray="4 4"
          />
        </g>
      ))}
      {messages.slice(0, visible).map((m, i) => {
        const y = TOP + ROW * (i + 1);
        const x1 = x(m.from);
        const x2 = x(m.to);
        const dir = x2 > x1 ? 1 : -1;
        const latest = i === visible - 1;
        const color = latest ? 'var(--color-accent)' : 'var(--color-text-muted)';
        return (
          <g key={`${String(i)}-${m.text}`} opacity={latest || reducedMotion ? 1 : 0.75}>
            <line
              x1={x1}
              y1={y}
              x2={x2 - dir * 8}
              y2={y}
              stroke={color}
              strokeWidth={latest ? 2.5 : 1.5}
              strokeDasharray={m.muted ? '5 4' : undefined}
            />
            <polygon
              points={`${String(x2)},${String(y)} ${String(x2 - dir * 10)},${String(y - 5)} ${String(x2 - dir * 10)},${String(y + 5)}`}
              fill={color}
            />
            <text
              x={(x1 + x2) / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize={12}
              fill="var(--color-text)"
              fontWeight={latest ? 600 : 400}
            >
              {m.text}
            </text>
          </g>
        );
      })}
    </SvgStage>
  );
}
