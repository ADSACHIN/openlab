import { useEffect } from 'react';

const SUFFIX = 'OPENLAB';

/** Sets `document.title` to "<title> · OPENLAB" (or just "OPENLAB" when empty). */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : SUFFIX;
  }, [title]);
}
