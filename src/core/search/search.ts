import type { Lab, Lesson } from '@core/model/types';
import type { Registry } from '@core/registry/registry';
import { paths } from '@core/registry/registry';

export interface SearchDocument {
  kind: 'lesson' | 'lab';
  id: string;
  domainId: string;
  title: string;
  summary: string;
  path: string;
  /** token → field weight sum */
  terms: Map<string, number>;
}

export interface SearchHit {
  kind: 'lesson' | 'lab';
  id: string;
  domainId: string;
  title: string;
  summary: string;
  path: string;
  score: number;
}

export interface SearchIndex {
  readonly documents: readonly SearchDocument[];
}

const WEIGHTS = { title: 5, tags: 3, outcomes: 2, summary: 1 } as const;

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((t) => t.length >= 2);
}

function addTerms(terms: Map<string, number>, text: string, weight: number): void {
  for (const t of tokenize(text)) terms.set(t, (terms.get(t) ?? 0) + weight);
}

function lessonDoc(l: Lesson): SearchDocument {
  const terms = new Map<string, number>();
  addTerms(terms, l.title, WEIGHTS.title);
  addTerms(terms, l.tags.join(' '), WEIGHTS.tags);
  addTerms(terms, l.outcomes.join(' '), WEIGHTS.outcomes);
  addTerms(terms, l.summary, WEIGHTS.summary);
  return {
    kind: 'lesson',
    id: l.id,
    domainId: l.domainId,
    title: l.title,
    summary: l.summary,
    path: paths.lesson(l.domainId, l.slug),
    terms,
  };
}

function labDoc(l: Lab): SearchDocument {
  const terms = new Map<string, number>();
  addTerms(terms, l.title, WEIGHTS.title);
  addTerms(terms, l.goal, WEIGHTS.outcomes);
  addTerms(terms, l.summary, WEIGHTS.summary);
  return {
    kind: 'lab',
    id: l.id,
    domainId: l.domainId,
    title: l.title,
    summary: l.summary,
    path: paths.lab(l.domainId, l.slug),
    terms,
  };
}

export function buildSearchIndex(registry: Registry): SearchIndex {
  return {
    documents: [...registry.allLessons().map(lessonDoc), ...registry.allLabs().map(labDoc)],
  };
}

/**
 * AND semantics: every query token must match a document term (exact or prefix).
 * Score = sum of matched weights; exact matches count double.
 */
export function search(index: SearchIndex, query: string, limit = 10): SearchHit[] {
  const q = tokenize(query);
  if (q.length === 0) return [];
  const hits: SearchHit[] = [];
  for (const d of index.documents) {
    let score = 0;
    let all = true;
    for (const token of q) {
      let best = 0;
      for (const [term, w] of d.terms) {
        if (term === token) best = Math.max(best, w * 2);
        else if (term.startsWith(token)) best = Math.max(best, w);
      }
      if (best === 0) {
        all = false;
        break;
      }
      score += best;
    }
    if (all)
      hits.push({
        kind: d.kind,
        id: d.id,
        domainId: d.domainId,
        title: d.title,
        summary: d.summary,
        path: d.path,
        score,
      });
  }
  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}
