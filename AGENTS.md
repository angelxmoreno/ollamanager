# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the React + TypeScript frontend. Keep UI in `src/components/` and feature-specific screens in `src/features/activity`, `src/features/connections`, and `src/features/models`. Shared client logic lives under `src/lib/` (`api/`, `persistence/`, `validation/`, `format/`), app state is in `src/store/`, and shared types are in `src/types/`. Tests are mostly colocated as `*.test.ts` or `*.test.tsx`, with shared test setup in `src/test/setup.ts`. The Tauri shell and native packaging files live in `src-tauri/`, with Rust entry points under `src-tauri/src/`.

## Build, Test, and Development Commands
Use `npm install` once to install frontend and Tauri CLI dependencies.

- `npm run dev` starts the Vite frontend on port `1420`.
- `npm run build` runs `tsc -b` and produces the frontend bundle.
- `npm run typecheck` runs strict TypeScript checks without emitting files.
- `npm test` runs the Vitest suite once.
- `npm test -- src/lib/api/normalize.test.ts` runs a single test file.
- `npm run test:ui` opens the Vitest UI.
- `npm run tauri dev` launches the desktop app with the Rust wrapper.

## Coding Style & Naming Conventions
Follow the existing TypeScript style: functional React components, PascalCase component files (`ModelsPanel.tsx`), camelCase utility modules (`connectionsPersistence.ts`), and `use...` naming for store hooks (`useConnectionsStore.ts`). Frontend files use TypeScript `strict` mode with `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` enabled. Match the current formatting in the surrounding file: TypeScript code is primarily 2-space indented, and Rust code in `src-tauri/` uses standard 4-space indentation. No standalone ESLint or Prettier config is checked in.

## Testing Guidelines
Vitest runs in `jsdom` with Testing Library and `@testing-library/jest-dom` loaded from `src/test/setup.ts`. Prefer colocated tests named `*.test.ts` or `*.test.tsx`. Cover UI behavior, validation, persistence, and API normalization when changing those paths. Run `npm test` before opening a PR; use the single-file form above while iterating.

## Commit & Pull Request Guidelines
Recent history uses short, imperative commit subjects such as `Add typed Ollama API client utilities`, `Fix health mapping...`, and `Stabilize build config...`. Keep commits focused and descriptive. Merge commits from PRs are preserved in history, so keep branch work clean enough to review as a standalone series.
