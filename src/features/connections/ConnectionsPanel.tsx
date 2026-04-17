import { useEffect, useMemo, useState } from "react";

import { validateConnection } from "../../lib/validation/connectionSchema";
import { useConnectionsStore } from "../../store/useConnectionsStore";
import { buildConnectionUrl, type ConnectionDraft, type ConnectionProtocol, type ConnectionRecord } from "../../types/connections";

type Mode = "create" | "edit";

type FormState = ConnectionDraft;

const defaultFormState: FormState = {
  name: "",
  protocol: "http",
  host: "localhost",
  port: 11434,
  notes: "",
  isFavorite: false,
};

const formatTimestamp = (value: string | null): string => {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleString();
};

const ConnectionDialog = ({
  mode,
  initialValue,
  onCancel,
  onSubmit,
}: {
  mode: Mode;
  initialValue: FormState;
  onCancel: () => void;
  onSubmit: (value: FormState) => Promise<void>;
}) => {
  const [formState, setFormState] = useState<FormState>(initialValue);
  const [error, setError] = useState<string | null>(null);

  const title = mode === "create" ? "Add connection" : "Edit connection";

  return (
    <div className="dialog-backdrop" role="presentation">
      <form
        className="dialog-card"
        onSubmit={async (event) => {
          event.preventDefault();

          const validation = validateConnection(formState);
          if (!validation.success) {
            setError(validation.issues[0]?.message ?? "Invalid form data");
            return;
          }

          setError(null);
          await onSubmit(validation.data);
        }}
      >
        <h3>{title}</h3>
        <label>
          Name
          <input
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Local Ollama"
            required
          />
        </label>
        <label>
          Protocol
          <select
            value={formState.protocol}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, protocol: event.target.value as ConnectionProtocol }))
            }
          >
            <option value="http">http</option>
            <option value="https">https</option>
          </select>
        </label>
        <label>
          Host
          <input
            value={formState.host}
            onChange={(event) => setFormState((prev) => ({ ...prev, host: event.target.value }))}
            placeholder="localhost"
            required
          />
        </label>
        <label>
          Port
          <input
            type="number"
            min={1}
            max={65535}
            value={formState.port}
            onChange={(event) => setFormState((prev) => ({ ...prev, port: Number(event.target.value) }))}
            required
          />
        </label>
        <label>
          Notes
          <textarea
            rows={3}
            value={formState.notes}
            onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Optional notes"
          />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(formState.isFavorite)}
            onChange={(event) => setFormState((prev) => ({ ...prev, isFavorite: event.target.checked }))}
          />
          Favorite
        </label>

        {error && <p className="error-text">{error}</p>}

        <div className="dialog-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export const ConnectionsPanel = () => {
  const {
    connections,
    activeConnectionId,
    addConnection,
    updateConnection,
    deleteConnection,
    setActiveConnection,
    testConnection,
    load,
  } = useConnectionsStore();

  const [mode, setMode] = useState<Mode | null>(null);
  const [editing, setEditing] = useState<ConnectionRecord | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string>("");

  useEffect(() => {
    void load();
  }, [load]);

  const activeConnection = useMemo(
    () => connections.find((connection) => connection.id === activeConnectionId) ?? null,
    [connections, activeConnectionId],
  );

  const sortedConnections = useMemo(
    () => [...connections].sort((a, b) => Number(Boolean(b.isFavorite)) - Number(Boolean(a.isFavorite))),
    [connections],
  );

  const initialFormValue = editing
    ? {
        name: editing.name,
        protocol: editing.protocol,
        host: editing.host,
        port: editing.port,
        notes: editing.notes,
        isFavorite: editing.isFavorite,
      }
    : defaultFormState;

  return (
    <main className="connections-layout">
      <aside className="connections-sidebar">
        <div className="sidebar-header">
          <h2>Connections</h2>
          <button
            onClick={() => {
              setEditing(null);
              setMode("create");
            }}
          >
            + Add
          </button>
        </div>
        <ul>
          {sortedConnections.map((connection) => (
            <li key={connection.id}>
              <button
                className={connection.id === activeConnectionId ? "active" : ""}
                onClick={() => setActiveConnection(connection.id)}
              >
                <span>
                  {connection.isFavorite ? "★ " : ""}
                  {connection.name}
                </span>
                <small>{buildConnectionUrl(connection)}</small>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="connection-details">
        {activeConnection ? (
          <>
            <h1>{activeConnection.name}</h1>
            <p className="muted">{buildConnectionUrl(activeConnection)}</p>
            <p>{activeConnection.notes || "No notes."}</p>
            <p>
              Status: <strong className={`status-${activeConnection.status}`}>{activeConnection.status}</strong>
            </p>
            <p className="muted">Last checked: {formatTimestamp(activeConnection.lastCheckedAt)}</p>
            <div className="detail-actions">
              <button onClick={() => void testConnection(activeConnection.id)} disabled={activeConnection.status === "loading"}>
                {activeConnection.status === "loading" ? "Testing..." : "Test connection"}
              </button>
              <button
                onClick={() => {
                  setEditing(activeConnection);
                  setMode("edit");
                }}
              >
                Edit
              </button>
              <button onClick={() => void deleteConnection(activeConnection.id)} className="danger">
                Delete
              </button>
              <button
                onClick={async () => {
                  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(buildConnectionUrl(activeConnection));
                    setCopyFeedback("URL copied");
                    globalThis.setTimeout(() => setCopyFeedback(""), 1500);
                  }
                }}
              >
                Copy URL
              </button>
            </div>
            {copyFeedback && <p className="muted">{copyFeedback}</p>}
          </>
        ) : (
          <p>No saved connections yet. Add one from the sidebar.</p>
        )}
      </section>

      {mode && (
        <ConnectionDialog
          mode={mode}
          initialValue={initialFormValue}
          onCancel={() => {
            setMode(null);
            setEditing(null);
          }}
          onSubmit={async (value) => {
            if (mode === "create") {
              await addConnection(value);
            } else if (editing) {
              await updateConnection(editing.id, value);
            }

            setMode(null);
            setEditing(null);
          }}
        />
      )}
    </main>
  );
};
