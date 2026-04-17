export type ConnectionProtocol = "http" | "https";

export type ConnectionStatus = "loading" | "connected" | "unreachable";

export interface SavedConnection {
  id: string;
  name: string;
  protocol: ConnectionProtocol;
  host: string;
  port: number;
  notes: string;
  isFavorite?: boolean;
}

export interface ConnectionHealth {
  status: ConnectionStatus;
  lastCheckedAt: string | null;
}

export type ConnectionRecord = SavedConnection & ConnectionHealth;

export interface ConnectionDraft {
  name: string;
  protocol: ConnectionProtocol;
  host: string;
  port: number;
  notes: string;
  isFavorite?: boolean;
}

export const buildConnectionUrl = (connection: Pick<SavedConnection, "protocol" | "host" | "port">): string =>
  `${connection.protocol}://${connection.host}:${connection.port}`;
