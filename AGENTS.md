# AGENTS.md

## Purpose
This repository is a Tauri desktop app with a React + TypeScript frontend in `src/` and the Rust/Tauri shell in `src-tauri/`. Use this file as the working contract for coding agents making changes here.

## Canonical UX Reference
- The desktop UX source of truth is: https://gist.github.com/angelxmoreno/9e580cfd6f3f59f76ec635fa2c6ef09b#file-desktop-ux-web-app-standards-md
- When editing UI, preserve the "desktop tool, not website" interaction model from that document unless the task explicitly calls for a different pattern.

## Repo Map
- `src/features/`: feature UI for connections, models, and activity
- `src/components/`: shared presentational components
- `src/lib/`: API client, normalization, formatting, persistence, validation
- `src/store/`: app state hooks and store logic
- `src/test/`: shared Vitest setup
- `src-tauri/src/`: Rust entry points
- `src-tauri/icons/`: required app icons for Tauri builds

## Commands
- `bun install`: install JS dependencies
- `bun run dev`: run the Vite frontend on port `1420`
- `bun run dev:app`: run the Tauri desktop app in development
- `bun run build`: TypeScript build plus Vite bundle
- `bun run typecheck`: strict TypeScript checks
- `bun run test`: run the full Vitest suite
- `bun run test -- path/to/file.test.tsx`: run a focused test file

## Working Rules
- Use TypeScript strict-mode friendly code. `tsconfig.app.json` enables `strict`, `noUnusedLocals`, and `noUnusedParameters`.
- Match local file style instead of inventing new formatting. TS files here use 2-space indentation; Rust uses 4 spaces.
- Keep tests colocated as `*.test.ts` or `*.test.tsx`.
- Prefer small, focused patches. Do not rewrite unrelated files.
- Do not commit generated `src-tauri/gen/` output.

## UI Standards
- Favor persistent workspace layouts over page-like flows: sidebar + main panel + inspector is preferred to full-surface route replacement.
- Prefer panel-local scrolling over document scrolling for core app surfaces.
- Do not let the router define the UX. Use routes for true top-level destinations and use app state or search params for in-workspace state such as selection, tabs, filters, sort mode, inspector state, and panel widths.
- Keep detail views non-blocking when possible. Use inspectors or split views before adding centered modals for read-heavy workflows.
- Treat selection, filters, sort state, panel widths, and inspector visibility as persistent workspace state when they materially affect flow.
- Keyboard and focus behavior are part of the product. Preserve visible `:focus-visible` states and predictable `Esc` dismissal behavior.
- Optimize repeated actions for power users: reduce click count, support context menus where appropriate, and avoid hiding critical actions behind hover only.
- Keep empty, loading, and error states inline within the affected panel instead of replacing the whole workspace.
- Prefer optimistic or local-first feedback for primary actions when rollback is feasible.
- Motion should communicate state changes and spatial relationships, not decorate the UI. Keep transitions fast and purposeful.

## Tauri Notes
- Tauri dev requires `src-tauri/icons/icon.png`. If it is missing or invalid, `tauri::generate_context!()` will fail during compile.
- `src-tauri/tauri.conf.json` uses `beforeDevCommand: bun run dev`, so stale Vite processes can block `bun run dev:app` by holding port `1420`.

## Frontend Notes
- `src/main.tsx` uses `React.StrictMode`. Development-only remounts can duplicate effects; guard async UI side effects accordingly.
- The app expects an Ollama server at the configured connection URL. `127.0.0.1:11434` will fail with network errors if Ollama is not running.

## Before Finishing
- Run the narrowest relevant tests first, then `bun run test` if the change is broad enough.
- If you touch startup or Tauri config, verify with `bun run dev:app`.
- Summaries and commit messages should reflect only the files actually changed.
