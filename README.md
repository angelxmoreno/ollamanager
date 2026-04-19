# OllaManager

A React + Vite UI for managing Ollama connections, browsing local models, pulling/deleting models, and reviewing recent activity.

## Setup

```
bun install
```

## Quick Start (Development)

1. **Install Bun:** If you haven't already, [install Bun](https://bun.sh).
2. **Install dependencies:**
   ```
   bun install
   ```
3. **Run the development server (Web):**
   ```
   bun run dev
   ```
4. **Run the desktop app (Tauri):**
   ```
   bun run dev:app
   ```

## Scripts

The following scripts are available in `package.json`:

- `bun run dev`: Starts the Vite development server for the web frontend.
- `bun run dev:app`: Launches the Tauri development window (automatically runs `dev` first).
- `bun run build`: Runs TypeScript type checking and builds the production frontend bundle.
- `bun run preview`: Locally previews the production build.
- `bun run test`: Runs the Vitest suite once.
- `bun run test:watch`: Runs Vitest in interactive watch mode.
- `bun run test:ui`: Opens the Vitest UI in your browser for visual test debugging.
- `bun run typecheck`: Runs `tsc` to verify type safety without emitting files.
- `bun run tauri`: Access the Tauri CLI directly (e.g., `bun run tauri build`).

## Endpoint assumptions

For an active connection base URL (example: `http://localhost:11434`), the app expects:

- `GET /api/tags` → model list payload with a `models` array.
- `POST /api/pull` → NDJSON streaming or single JSON response with pull progress events.
- `DELETE /api/delete` → accepts `{ "name": "<model>" }`.
- `POST /api/show` → model metadata payload.
- `GET /api/version` → simple health/version value.

## Saved-connection JSON example

```json
{
  "id": "fca671f8-14f3-4dfd-829d-7d89e1f56b61",
  "name": "Local Ollama",
  "protocol": "http",
  "host": "localhost",
  "port": 11434,
  "notes": "Default local daemon",
  "isFavorite": true,
  "status": "connected",
  "lastCheckedAt": "2026-04-18T10:22:00.000Z"
}
```
