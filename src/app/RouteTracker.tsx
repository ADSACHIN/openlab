import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useProgress } from './providers/ProgressContext';

/** Remembers the last visited route so the home page can offer "continue". */
export function RouteTracker() {
  const { pathname } = useLocation();
  const { store } = useProgress();
  useEffect(() => {
    if (pathname.startsWith('/domains/')) store.setLastVisited(pathname);
  }, [pathname, store]);
  return null;
}
