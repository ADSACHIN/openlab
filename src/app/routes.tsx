import { Route, Routes } from 'react-router';
import { AppLayout } from './layout/AppLayout';
import { DomainPage } from './pages/DomainPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * Phase 1 route table. From Phase 2 the registry in `src/core` generates
 * domain routes from each DomainModule instead of this hand-written list.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="domains/:domainId" element={<DomainPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
