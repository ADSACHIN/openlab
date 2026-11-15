import { Link, NavLink, Outlet } from 'react-router';
import { ThemeToggle } from '@components/ui/ThemeToggle';
import { nextTheme } from '@core/preferences/preferences';
import { usePreferences } from '@app/providers/PreferencesContext';
import { REPO_URL } from '@app/config';
import { cx } from '@utils/cx';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { preferences, setTheme } = usePreferences();
  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand} aria-label="OPENLAB home">
            <span className={styles.brandMark} aria-hidden="true" />
            OPENLAB
          </Link>
          <nav aria-label="Primary" className={styles.nav}>
            <NavLink
              to="/"
              end
              className={({ isActive }) => cx(styles.navLink, isActive && styles.navLinkActive)}
            >
              Domains
            </NavLink>
            <a href={REPO_URL} className={styles.navLink} rel="noopener">
              Source
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
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>
            OPENLAB is free and open source (MIT). It runs entirely in your browser: no account, no
            tracking, no data leaves your device.
          </p>
          <p>
            <a href={REPO_URL} rel="noopener">
              Contribute on GitHub
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
