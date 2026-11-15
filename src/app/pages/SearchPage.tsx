import { Search as SearchIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { search } from '@core/search';
import { findDomain } from '@data/domains';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useRegistry } from '@app/providers/RegistryContext';
import styles from './SearchPage.module.css';

export function SearchPage() {
  useDocumentTitle('Search');
  const id = useId();
  const { searchIndex } = useRegistry();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const hits = search(searchIndex, query, 20);
  const total = searchIndex.documents.length;

  return (
    <section aria-labelledby={`${id}-title`} className={styles.page}>
      <h1 id={`${id}-title`} className={styles.title}>
        Search lessons and labs
      </h1>
      <form
        role="search"
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          setParams(query ? { q: query } : {});
        }}
      >
        <label htmlFor={`${id}-q`} className="visually-hidden">
          Search query
        </label>
        <SearchIcon size={18} aria-hidden="true" focusable="false" className={styles.icon} />
        <input
          id={`${id}-q`}
          type="search"
          className={styles.input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder={total > 0 ? 'e.g. handshake, subnet, scheduler' : 'No content yet'}
          autoComplete="off"
          disabled={total === 0}
        />
      </form>
      <p className={styles.status} role="status" aria-live="polite">
        {total === 0
          ? 'Nothing to search yet — the first lessons arrive with the Networking domain.'
          : query.trim() === ''
            ? `${String(total)} lessons and labs indexed.`
            : `${String(hits.length)} result${hits.length === 1 ? '' : 's'} for “${query}”.`}
      </p>
      {hits.length > 0 && (
        <ol className={styles.results}>
          {hits.map((h) => (
            <li key={h.id} className={styles.hit}>
              <Link to={h.path} className={styles.hitLink}>
                {h.title}
              </Link>
              <span className={styles.hitMeta}>
                {findDomain(h.domainId)?.title ?? h.domainId} · {h.kind}
              </span>
              <p className={styles.hitSummary}>{h.summary}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
