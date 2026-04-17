import { useSyncExternalStore } from "react";

import { loadConnections, saveConnections } from "../lib/persistence/connectionsPersistence";
import { validateConnection } from "../lib/validation/connectionSchema";
import { buildConnectionUrl, type ConnectionDraft, type ConnectionRecord } from "../types/connections";

interface ConnectionsState {
  connections: ConnectionRecord[];
  activeConnectionId: string | null;
  isLoaded: boolean;
}

interface ConnectionsActions {
  load: () => Promise<void>;
  addConnection: (draft: ConnectionDraft) => Promise<void>;
  updateConnection: (id: string, draft: ConnectionDraft) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  setActiveConnection: (id: string | null) => void;
  testConnection: (id: string) => Promise<void>;
}

export type ConnectionsStore = ConnectionsState & ConnectionsActions;

type Listener = () => void;

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const state: ConnectionsState = {
  connections: [],
  activeConnectionId: null,
  isLoaded: false,
};

const listeners = new Set<Listener>();

let snapshot: ConnectionsStore;

const emit = () => {
  listeners.forEach((listener) => listener());
};

const setState = (partial: Partial<ConnectionsState>) => {
  Object.assign(state, partial);
  snapshot = {
    ...state,
    ...actions,
  };
  emit();
};

const getState = (): ConnectionsState => state;

const persistConnections = async (connections: ConnectionRecord[]): Promise<void> => {
  await saveConnections(connections);
};

const actions: ConnectionsActions = {
  load: async () => {
    if (getState().isLoaded) {
      return;
    }

    const connections = await loadConnections();

    setState({
      connections,
      activeConnectionId: connections[0]?.id ?? null,
      isLoaded: true,
    });
  },
  addConnection: async (draft) => {
    const validated = validateConnection(draft);
    if (!validated.success) {
      throw new Error(validated.issues[0]?.message ?? "Invalid connection details.");
    }

    const newConnection: ConnectionRecord = {
      ...validated.data,
      id: generateId(),
      status: "unreachable",
      lastCheckedAt: null,
    };

    const current = getState();
    const connections = [...current.connections, newConnection];

    setState({
      connections,
      activeConnectionId: current.activeConnectionId ?? newConnection.id,
    });

    await persistConnections(connections);
  },
  updateConnection: async (id, draft) => {
    const validated = validateConnection(draft);
    if (!validated.success) {
      throw new Error(validated.issues[0]?.message ?? "Invalid connection details.");
    }

    const current = getState();
    const connections = current.connections.map((connection) =>
      connection.id === id
        ? {
            ...connection,
            ...validated.data,
          }
        : connection,
    );

    setState({ connections });
    await persistConnections(connections);
  },
  deleteConnection: async (id) => {
    const current = getState();
    const connections = current.connections.filter((connection) => connection.id !== id);
    setState({
      connections,
      activeConnectionId: current.activeConnectionId === id ? (connections[0]?.id ?? null) : current.activeConnectionId,
    });

    await persistConnections(connections);
  },
  setActiveConnection: (id) => {
    setState({ activeConnectionId: id });
  },
  testConnection: async (id) => {
    const current = getState();
    const target = current.connections.find((connection) => connection.id === id);
    if (!target) {
      return;
    }

    setState({
      connections: current.connections.map((connection) =>
        connection.id === id
          ? {
              ...connection,
              status: "loading",
              lastCheckedAt: new Date().toISOString(),
            }
          : connection,
      ),
    });

    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), 4000);

    let status: ConnectionRecord["status"] = "unreachable";

    try {
      const response = await fetch(buildConnectionUrl(target), {
        method: "GET",
        signal: controller.signal,
      });
      status = response.ok ? "connected" : "unreachable";
    } catch {
      status = "unreachable";
    } finally {
      globalThis.clearTimeout(timeout);
    }

    const latest = getState();
    const connections = latest.connections.map((connection) =>
      connection.id === id
        ? {
            ...connection,
            status,
            lastCheckedAt: new Date().toISOString(),
          }
        : connection,
    );

    setState({ connections });
    await persistConnections(connections);
  },
};

snapshot = {
  ...state,
  ...actions,
};

const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = (): ConnectionsStore => snapshot;

export const useConnectionsStore = (): ConnectionsStore =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
