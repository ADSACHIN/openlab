import type { DomainStatus } from '@typings/domain';
import { cx } from '@utils/cx';
import styles from './StatusBadge.module.css';

const LABELS: Record<DomainStatus, string> = {
  planned: 'Coming soon',
  'in-progress': 'In progress',
  available: 'Available',
};

export interface StatusBadgeProps {
  status: DomainStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={cx(styles.badge, styles[status])}>{LABELS[status]}</span>;
}
