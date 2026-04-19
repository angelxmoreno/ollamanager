# GEMINI.md - OllaManager Project Context

## Project Overview
**OllaManager** is a desktop-first application built with **React**, **Vite**, and **Tauri**. It provides a user interface for managing **Ollama** instances, allowing users to:
- Configure and switch between multiple Ollama connections (local or remote).
- Browse, pull, and delete local AI models.
- View detailed model metadata (show API).
- Monitor recent activity and pull progress.

The project uses **TypeScript** for type safety and **Vitest** for unit and component testing.

## Tech Stack
- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Desktop Runtime:** Tauri 2.0
- **State Management:** Custom store using `useSyncExternalStore` (`src/store/useConnectionsStore.ts`).
- **Persistence:** Abstracted persistence layer supporting `localStorage` (Web) and `@tauri-apps/plugin-store` (Tauri).
- **Styling:** CSS (standard `.css` files).
- **Testing:** Vitest + React Testing Library.

## Project Structure
- `src/`: React frontend source code.
    - `components/`: Shared UI components (e.g., Toast, Dialogs).
    - `features/`: Feature-based modules (connections, models, activity).
    - `hooks/`: Custom React hooks.
    - `lib/`: Core logic, API client, persistence, and validation.
    - `store/`: State management.
    - `types/`: TypeScript definitions.
- `src-tauri/`: Rust backend and Tauri configuration.
- `public/`: Static assets.

## Building and Running

### Development
- **Web only:** `bun run dev` (Runs on `http://localhost:1420`)
- **Tauri App:** `bun run dev:app` (Launches the desktop window)

### Testing
- **Run tests:** `bun run test`
- **UI mode:** `bun run test:ui`
- **Type checking:** `bun run typecheck`

### Production Build
- **Build app:** `bun run build`

## Development Conventions

### State Management
- Use `useConnectionsStore` for connection-related state. It follows a snapshot-based pattern with `useSyncExternalStore`.
- Prefer keeping feature-specific state local to the feature components or specialized hooks unless it needs to be global.

### API Interaction
- All Ollama API calls should go through the `OllamaClient` class in `src/lib/api/ollamaClient.ts`.
- The client handles streaming responses (NDJSON) for model pulling and provides error mapping via `src/lib/api/errors.ts`.

### Persistence
- Use the persistence adapter in `src/lib/persistence/connectionsPersistence.ts` to ensure data is saved correctly across both web and desktop environments.

### Testing Practices
- New features should include Vitest tests (`.test.tsx` or `.test.ts`).
- Mock the `OllamaClient` or `fetch` when testing components that interact with the Ollama API.

### Styling
- Adhere to the existing CSS variables and layout patterns defined in `src/styles.css`.
- Use functional class names and avoid inline styles where possible.
