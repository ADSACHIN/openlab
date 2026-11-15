import {
  BrainCircuit,
  Boxes,
  Cloud,
  Code,
  Cpu,
  Network,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { DomainIconName } from '@typings/domain';

const ICONS: Record<DomainIconName, React.ComponentType<LucideProps>> = {
  network: Network,
  terminal: Terminal,
  shield: ShieldCheck,
  code: Code,
  boxes: Boxes,
  cpu: Cpu,
  brain: BrainCircuit,
  cloud: Cloud,
};

export interface DomainIconProps {
  name: DomainIconName;
  size?: number;
  /** Decorative by default. Pass a label when the icon stands alone. */
  label?: string;
}

export function DomainIcon({ name, size = 24, label }: DomainIconProps) {
  const Icon = ICONS[name];
  return label ? (
    <Icon size={size} aria-label={label} role="img" />
  ) : (
    <Icon size={size} aria-hidden="true" focusable="false" />
  );
}
