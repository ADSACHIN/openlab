import { Route, Routes } from 'react-router';
import { AppLayout } from './layout/AppLayout';
import { DomainPage } from './pages/DomainPage';
import { HomePage } from './pages/HomePage';
import { LabPage } from './pages/LabPage';
import { LessonPage } from './pages/LessonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PathsPage } from './pages/PathsPage';
import { ProgressPage } from './pages/ProgressPage';
import { SearchPage } from './pages/SearchPage';

/**
 * Route *shapes* are fixed here; the registry resolves which domain, lesson
 * or lab a URL refers to, so adding content never touches this file.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="domains/:domainId" element={<DomainPage />} />
        <Route path="domains/:domainId/lessons/:slug" element={<LessonPage />} />
        <Route path="domains/:domainId/labs/:slug" element={<LabPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="paths" element={<PathsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
