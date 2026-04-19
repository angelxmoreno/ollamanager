# AGENTS.md

## Purpose
This repository is a Tauri desktop app with a React + TypeScript frontend in `src/` and the Rust/Tauri shell in `src-tauri/`. Use this file as the working contract for coding agents making changes here.

## Repo Map
- `src/features/`: feature UI for connections, models, and activity
- `src/components/`: shared presentational components
- `src/lib/`: API client, normalization, formatting, persistence, validation
- `src/store/`: app state hooks and store logic
- `src/test/`: shared Vitest setup
- `src-tauri/src/`: Rust entry points
- `src-tauri/icons/`: required app icons for Tauri builds

## Commands
- `npm install`: install JS dependencies
- `npm run dev`: run the Vite frontend on port `1420`
- `npm run dev:app`: run the Tauri desktop app in development
- `npm run build`: TypeScript build plus Vite bundle
- `npm run typecheck`: strict TypeScript checks
- `npm test`: run the full Vitest suite
- `npm test -- path/to/file.test.tsx`: run a focused test file

## Working Rules
- Use TypeScript strict-mode friendly code. `tsconfig.app.json` enables `strict`, `noUnusedLocals`, and `noUnusedParameters`.
- Match local file style instead of inventing new formatting. TS files here use 2-space indentation; Rust uses 4 spaces.
- Keep tests colocated as `*.test.ts` or `*.test.tsx`.
- Prefer small, focused patches. Do not rewrite unrelated files.
- Do not commit generated `src-tauri/gen/` output.

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
ed.
