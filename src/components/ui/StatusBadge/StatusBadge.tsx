import { useT } from '@i18n';
import type { DomainStatus } from '@typings/domain';
import { cx } from '@utils/cx';
import styles from './StatusBadge.module.css';

export interface StatusBadgeProps {
  status: DomainStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useT();
  return <span className={cx(styles.badge, styles[status])}>{t(`status.${status}`)}</span>;
}
