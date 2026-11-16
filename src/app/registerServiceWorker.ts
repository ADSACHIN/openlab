/**
 * Registers the build-generated service worker (ADR-0011) so the site keeps
 * working offline after the first visit. Production only: the dev server has
 * no sw.js and must never serve stale modules.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch((err: unknown) => {
        // Offline support is an enhancement; the app works without it.
        console.warn('OPENLAB: offline support is unavailable.', err);
      });
  });
}
