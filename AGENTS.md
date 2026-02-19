# Repository Guidelines

## Project Structure & Module Organization
This package is a TypeScript core library published as `@igen/core`.

- Source code lives in `src/`:
- `src/domain/`: HLA domain models (`HlaAllele`, `HlaHaplotype`)
- `src/enum/`: locus, chain, class, and group enums
- `src/error/`: error types (`ApiError`)
- `src/service/`: shared services (`LoggerService`)
- `src/index.ts`: public package exports
- Tests live in `test/` and mirror source modules (for example `test/hla-allele.test.ts`).
- Build artifacts are generated in `dist/` (do not edit manually).

## Build, Test, and Development Commands
Use `pnpm` in this repository.

- `pnpm run build`: compile TypeScript to `dist/` with declarations.
- `pnpm run typecheck`: run strict TypeScript checks without emitting files.
- `pnpm run lint`: run ESLint across the repository.
- `pnpm run test`: run Vitest test suite from `test/`.

Typical local verification before opening a PR:

```bash
pnpm run lint && pnpm run typecheck && pnpm run test && pnpm run build
```

## Coding Style & Naming Conventions
- Formatting is defined by `.prettierrc.json`: 4 spaces, single quotes, semicolons, trailing commas, max width 150.
- ESLint uses `typescript-eslint` with strict rules, including explicit function return types and strict boolean expressions.
- Prefer `camelCase` for methods/properties, `PascalCase` for classes/types, and `UPPER_SNAKE_CASE` for constants.
- Keep files focused by domain (for example, add new domain models under `src/domain/` plus barrel exports).

## Testing Guidelines
- Framework: Vitest.
- Place tests in `test/` with `*.test.ts` suffix.
- Cover both success and failure paths for parsing/validation-heavy logic.
- When adding public APIs, add at least one export-level test (see `test/index-exports.test.ts`).

## Commit & Pull Request Guidelines
Current history follows Conventional Commits with optional gitmoji, e.g.:
- `feat: :sparkles: create typescript implementation of igen-core-py`

Use format: `type: short description` (`feat`, `fix`, `refactor`, `test`, `chore`).

PRs should include:
- Clear summary of behavioral changes
- Linked issue/task (if available)
- Test evidence (commands run and results)
- Notes on any API/export changes
