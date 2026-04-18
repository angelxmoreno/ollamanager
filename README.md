# OllaManager

A React + Vite UI for managing Ollama connections, browsing local models, pulling/deleting models, and reviewing recent activity.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

## Test

```bash
npm test
```

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
