import { Info, Lightbulb, TriangleAlert } from 'lucide-react';
import type { CalloutTone } from '@core/model/types';
import { cx } from '@utils/cx';
import { InlineText } from '../InlineText';
import styles from './Callout.module.css';

const META: Record<CalloutTone, { Icon: typeof Info; defaultTitle: string }> = {
  info: { Icon: Info, defaultTitle: 'Note' },
  tip: { Icon: Lightbulb, defaultTitle: 'Tip' },
  warning: { Icon: TriangleAlert, defaultTitle: 'Careful' },
};

export interface CalloutProps {
  tone: CalloutTone;
  title?: string;
  text: string;
}

export function Callout({ tone, title, text }: CalloutProps) {
  const { Icon, defaultTitle } = META[tone];
  return (
    <aside className={cx(styles.callout, styles[tone])} aria-label={title ?? defaultTitle}>
      <Icon size={18} aria-hidden="true" focusable="false" className={styles.icon} />
      <div>
        <p className={styles.title}>{title ?? defaultTitle}</p>
        <p className={styles.text}>
          <InlineText text={text} />
        </p>
      </div>
    </aside>
  );
}
