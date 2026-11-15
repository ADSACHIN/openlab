# src/components

Shared, reusable UI. Each component lives in its own folder with `Component.tsx`, `Component.module.css`, `Component.test.tsx` and an `index.ts` barrel.
Planned groups: `ui/` (Button, Card, Tabs…), `layout/`, `learning/` (LessonRenderer, SimulatorHost, Quiz), `viz/` (SvgStage, CanvasStage, Timeline).
May import from: hooks, styles, types, utils. Must NOT import domains or app.
