# src/core

The learning engine — framework-agnostic business logic shared by every domain.
Planned sub-modules: `model/` (Lesson, Lab, Simulator, DomainModule types), `registry/` (domain registration + route generation), `progress/` (versioned localStorage store, export/import), `search/` (client-side index).
May import from: types, utils. Must NOT import React components or any domain.
