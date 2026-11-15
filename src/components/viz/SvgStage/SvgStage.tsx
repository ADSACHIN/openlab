import { useId } from 'react';
import type { ReactNode } from 'react';
import { cx } from '@utils/cx';
import styles from './SvgStage.module.css';

export interface SvgStageProps {
  /** Logical coordinate space, e.g. [0, 0, 800, 400]. */
  viewBox: readonly [number, number, number, number];
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  /** Aspect ratio lock; defaults to the viewBox ratio. */
  maxHeight?: number;
}

/**
 * Responsive, accessible SVG canvas. Every visualisation renders inside one so
 * that theming (CSS variables), scaling and the text alternative are uniform.
 */
export function SvgStage({
  viewBox,
  title,
  description,
  children,
  className,
  maxHeight,
}: SvgStageProps) {
  const id = useId();
  const [x, y, w, h] = viewBox;
  return (
    <svg
      className={cx(styles.svg, className)}
      viewBox={`${String(x)} ${String(y)} ${String(w)} ${String(h)}`}
      role="img"
      aria-labelledby={`${id}-t ${id}-d`}
      preserveAspectRatio="xMidYMid meet"
      style={maxHeight !== undefined ? { maxHeight } : undefined}
    >
      <title id={`${id}-t`}>{title}</title>
      <desc id={`${id}-d`}>{description}</desc>
      {children}
    </svg>
  );
}
