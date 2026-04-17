import type { ConnectionRecord } from "../../types/connections";

const STORE_KEY = "connections";
const STORE_FILE = "connections.json";

interface PersistAdapter {
  load(): Promise<ConnectionRecord[]>;
  save(connections: ConnectionRecord[]): Promise<void>;
}

class LocalStorageAdapter implements PersistAdapter {
  async load(): Promise<ConnectionRecord[]> {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as ConnectionRecord[]) : [];
    } catch {
      return [];
    }
  }

  async save(connections: ConnectionRecord[]): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(connections));
    } catch {
      // Ignore storage quota/private mode write failures to avoid crashing UI flows.
    }
  }
}

class TauriStoreAdapter implements PersistAdapter {
  private async getStore() {
    const moduleName = "@tauri-apps/plugin-store";
    const storeModule = (await import(/* @vite-ignore */ moduleName)) as {
      Store: new (file: string) => {
        get<T>(key: string): Promise<T | null>;
        set<T>(key: string, value: T): Promise<void>;
        save(): Promise<void>;
      };
    };

    return new storeModule.Store(STORE_FILE);
  }

  async load(): Promise<ConnectionRecord[]> {
    try {
      const store = await this.getStore();
      const data = await store.get<ConnectionRecord[]>(STORE_KEY);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async save(connections: ConnectionRecord[]): Promise<void> {
    try {
      const store = await this.getStore();
      await store.set(STORE_KEY, connections);
      await store.save();
    } catch {
      // Ignore persistence failures so connection operations still succeed in-memory.
    }
  }
}

const isTauriRuntime = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const getAdapter = (): PersistAdapter => {
  if (isTauriRuntime()) {
    return new TauriStoreAdapter();
  }

  return new LocalStorageAdapter();
};

const adapter = getAdapter();

export const loadConnections = async (): Promise<ConnectionRecord[]> => adapter.load();

export const saveConnections = async (connections: ConnectionRecord[]): Promise<void> => {
  await adapter.save(connections);
};
