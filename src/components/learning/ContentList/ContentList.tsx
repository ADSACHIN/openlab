import { CircleCheck, Circle, Clock } from 'lucide-react';
import { Link } from 'react-router';
import { cx } from '@utils/cx';
import styles from './ContentList.module.css';

export interface ContentListItem {
  id: string;
  title: string;
  summary: string;
  to: string;
  minutes: number;
  done: boolean;
  /** Optional small label, e.g. "Lab". */
  badge?: string;
}

export interface ContentListProps {
  items: readonly ContentListItem[];
  ariaLabel: string;
}

export function ContentList({ items, ariaLabel }: ContentListProps) {
  return (
    <ol className={styles.list} aria-label={ariaLabel}>
      {items.map((item, i) => (
        <li key={item.id} className={cx(styles.item, item.done && styles.itemDone)}>
          <span className={styles.status} aria-hidden="true">
            {item.done ? <CircleCheck size={20} /> : <Circle size={20} />}
          </span>
          <div className={styles.body}>
            <Link to={item.to} className={styles.link}>
              <span className={styles.index}>{String(i + 1)}.</span> {item.title}
              {item.badge && <span className={styles.badge}>{item.badge}</span>}
              {item.done && <span className="visually-hidden"> (completed)</span>}
            </Link>
            <p className={styles.summary}>{item.summary}</p>
          </div>
          <span className={styles.minutes}>
            <Clock size={14} aria-hidden="true" focusable="false" />
            {String(item.minutes)} min
          </span>
        </li>
      ))}
    </ol>
  );
}
