# Bet bot website architecture

## Principles

- Follow Bulletproof React's feature-first organization and SOLID principles.
- Depend on narrow interfaces and pass dependencies or callbacks where that makes
  components easier to test and reuse.
- Do not create abstractions speculatively. Shared code must remove real duplication
  or establish a stable boundary.
- Keep frontend and backend domain contracts aligned when changing API payloads.

## Frontend

The frontend code will live under `src/client`

Use the [Bulletproof React](https://github.com/alan2207/bulletproof-react) architecture for all frontend code.

- Organize domain code by feature; keep feature-specific components, hooks, types, API code, and utilities together.
- Keep shared code in top-level shared modules and promote code there only when multiple features use it.
- Enforce one-way dependencies: shared modules -> features -> application layer.
- Never import between features; compose features in the application layer instead.
- Use direct file imports, avoid feature barrel files, and create only the directories and abstractions currently needed.


## Backend

Organize the NestJS backend by domain modules under `src/server`.

- Keep each domain's `*.module.ts` at the domain root.
- Place Nest roles in dedicated plural directories within the domain, such as
  `controllers`, `services`, `entities`, `dto`, `guards`, `middlewares`,
  `decorators`, and `types`. Do not mix these role files back into the domain root.
- Controllers handle HTTP concerns and validation boundaries.
- Services own domain and persistence behavior.
- Entities define TypeORM persistence models.
- DTOs define and validate request payloads.
- Shared server utilities belong in `src/server/common`.

A typical domain has this shape:

```text
src/server/notes/
  notes.module.ts
  controllers/
  dto/
  entities/
  services/
```
