import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { PageLoading } from '@components/ui/PageLoading';
import { ThemeToggle } from '@components/ui/ThemeToggle';
import { nextTheme } from '@core/preferences/preferences';
import { useT } from '@i18n';
import { usePreferences } from '@app/providers/PreferencesContext';
import { REPO_URL } from '@app/config';
import { cx } from '@utils/cx';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { preferences, setTheme } = usePreferences();
  const t = useT();
  const navClass = ({ isActive }: { isActive: boolean }) =>
    cx(styles.navLink, isActive && styles.navLinkActive);
  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        {t('app.skipLink')}
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand} aria-label={t('app.homeLabel')}>
            <span className={styles.brandMark} aria-hidden="true" />
            OPENLAB
          </Link>
          <nav aria-label={t('app.nav.label')} className={styles.nav}>
            <NavLink to="/" end className={navClass}>
              {t('app.nav.domains')}
            </NavLink>
            <NavLink to="/search" className={navClass}>
              {t('app.nav.search')}
            </NavLink>
            <NavLink to="/progress" className={navClass}>
              {t('app.nav.progress')}
            </NavLink>
            <NavLink to="/paths" className={navClass}>
              {t('app.nav.paths')}
            </NavLink>
            <a href={REPO_URL} className={styles.navLink} rel="noopener">
              {t('app.nav.source')}
            </a>
          </nav>
          <ThemeToggle
            value={preferences.theme}
            next={nextTheme(preferences.theme)}
            onChange={setTheme}
          />
        </div>
      </header>
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>{t('app.footer.about')}</p>
          <p>
            <a href={REPO_URL} rel="noopener">
              {t('app.footer.contribute')}
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
