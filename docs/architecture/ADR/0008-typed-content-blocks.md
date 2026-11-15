# ADR-0008: Lessons are typed content blocks, not Markdown or HTML

- **Status:** Accepted
- **Date:** 2026-11-15
- **Deciders:** project owner

## Context

Lessons mix prose with interactive simulators, quizzes and code. Rendering raw HTML or Markdown
would need a sanitiser (security), a parser (bundle size) and a convention for embedding
components. The security policy forbids `dangerouslySetInnerHTML` without strong justification.

## Decision

A lesson is a `Lesson` object whose `blocks` is an array of discriminated-union `ContentBlock`
values (`paragraph`, `heading`, `list`, `callout`, `code`, `interactive`, `quiz`). Inline prose
supports only backtick code spans, rendered by splitting the string — no HTML is ever interpreted.
Modules are TypeScript, so authoring errors are compile errors and the registry validates
cross-references (prerequisites, simulator ids, quiz answers) at startup.

## Alternatives considered

| Option                 | Pros                                                                      | Cons                                                                                 |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Markdown + MDX         | Familiar authoring                                                        | MDX compiler dependency, arbitrary JSX in content, sanitising story unclear          |
| Sanitised HTML strings | Flexible                                                                  | Sanitiser dependency, XSS surface, no type checking                                  |
| Typed blocks (chosen)  | Zero dependencies, type-checked, trivially testable, renderer stays small | Less expressive prose formatting; adding a block type touches the union and renderer |

## Consequences

- `LessonRenderer` is an exhaustive `switch`; TypeScript forces a renderer for every new block type.
- Rich formatting needs (tables, images, maths) will be added as new block types with their own
  accessibility requirements, not by opening the door to HTML.
- A future `scripts/new-lesson.mjs` can scaffold modules because the shape is plain data.
