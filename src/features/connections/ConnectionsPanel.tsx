import { useEffect, useMemo, useState } from 'react';

import { validateConnection } from '../../lib/validation/connectionSchema';
import { useConnectionsStore } from '../../store/useConnectionsStore';
import { buildConnectionUrl, type ConnectionDraft, type ConnectionProtocol, type ConnectionRecord } from '../../types/connections';

type Mode = 'create' | 'edit';
type FormState = ConnectionDraft;

const defaultFormState: FormState = {
  name: '',
  protocol: 'http',
  host: 'localhost',
  port: 11434,
  notes: '',
  isFavorite: false,
};

const formatTimestamp = (value: string | null): string => {
  if (!value) return 'Never';
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
  const [issues, setIssues] = useState<Record<string, string>>({});

  const title = mode === 'create' ? 'Add connection' : 'Edit connection';

  return (
    <div className="dialog-backdrop" role="presentation">
      <form
        className="dialog-card"
        onSubmit={async (event) => {
          event.preventDefault();
          const validation = validateConnection(formState);
          if (!validation.success) {
            setIssues(Object.fromEntries(validation.issues.map((item) => [item.field, item.message])));
            return;
          }

          setIssues({});
          await onSubmit(validation.data);
        }}
      >
        <h3>{title}</h3>
        <label>
          Name
          <input value={formState.name} onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))} required />
          {issues.name && <small className="error-text">{issues.name}</small>}
        </label>
        <label>
          Protocol
          <select value={formState.protocol} onChange={(event) => setFormState((prev) => ({ ...prev, protocol: event.target.value as ConnectionProtocol }))}>
            <option value="http">http</option>
            <option value="https">https</option>
          </select>
        </label>
        <label>
          Host
          <input value={formState.host} onChange={(event) => setFormState((prev) => ({ ...prev, host: event.target.value }))} required />
          {issues.host && <small className="error-text">{issues.host}</small>}
        </label>
        <label>
          Port
          <input type="number" value={formState.port} onChange={(event) => setFormState((prev) => ({ ...prev, port: Number(event.target.value) }))} required />
          {issues.port && <small className="error-text">{issues.port}</small>}
        </label>
        <label>
          Notes
          <textarea value={formState.notes} onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))} />
          {issues.notes && <small className="error-text">{issues.notes}</small>}
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={Boolean(formState.isFavorite)} onChange={(event) => setFormState((prev) => ({ ...prev, isFavorite: event.target.checked }))} />
          Favorite
        </label>

        <div className="dialog-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export const ConnectionsPanel = ({
  onActivity,
  onToast,
  onConnectionUrlChange,
}: {
  onActivity?: (message: string, level: 'success' | 'error' | 'info') => void;
  onToast?: (kind: 'success' | 'error' | 'info', message: string) => void;
  onConnectionUrlChange?: (url: string | null) => void;
}) => {
  const { connections, activeConnectionId, addConnection, updateConnection, deleteConnection, setActiveConnection, testConnection, load } = useConnectionsStore();

  const [mode, setMode] = useState<Mode | null>(null);
  const [editing, setEditing] = useState<ConnectionRecord | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const activeConnection = useMemo(() => connections.find((connection) => connection.id === activeConnectionId) ?? null, [connections, activeConnectionId]);

  useEffect(() => {
    onConnectionUrlChange?.(activeConnection ? buildConnectionUrl(activeConnection) : null);
  }, [activeConnection, onConnectionUrlChange]);

  const sortedConnections = useMemo(() => [...connections].sort((a, b) => Number(Boolean(b.isFavorite)) - Number(Boolean(a.isFavorite))), [connections]);

  const initialFormValue = editing
    ? { name: editing.name, protocol: editing.protocol, host: editing.host, port: editing.port, notes: editing.notes, isFavorite: editing.isFavorite }
    : defaultFormState;

  return (
    <main className="connections-layout">
      <aside className="connections-sidebar">
        <div className="sidebar-header">
          <h2>Connections</h2>
          <button onClick={() => { setEditing(null); setMode('create'); }}>+ Add</button>
        </div>
        {sortedConnections.length === 0 ? <p className="muted">No saved connections</p> : null}
        <ul>
          {sortedConnections.map((connection) => (
            <li key={connection.id}>
              <button className={connection.id === activeConnectionId ? 'active' : ''} onClick={() => setActiveConnection(connection.id)}>
                <span>{connection.isFavorite ? '★ ' : ''}{connection.name}</span>
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
            <p>{activeConnection.notes || 'No notes.'}</p>
            <p>Status: <strong className={`status-${activeConnection.status}`}>{activeConnection.status}</strong></p>
            <p className="muted">Last checked: {formatTimestamp(activeConnection.lastCheckedAt)}</p>
            <div className="detail-actions">
              <button
                onClick={async () => {
                  await testConnection(activeConnection.id);
                  onActivity?.(`Tested connection ${activeConnection.name}`, 'info');
                }}
                disabled={activeConnection.status === 'loading'}
              >
                {activeConnection.status === 'loading' ? 'Testing...' : 'Test connection'}
              </button>
              <button onClick={() => { setEditing(activeConnection); setMode('edit'); }}>Edit</button>
              <button
                onClick={async () => {
                  await deleteConnection(activeConnection.id);
                  onActivity?.(`Deleted connection ${activeConnection.name}`, 'success');
                  onToast?.('success', `Deleted connection ${activeConnection.name}`);
                }}
                className="danger"
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <p>No saved connections yet. Add one from the sidebar.</p>
        )}
      </section>

      {mode && (
        <ConnectionDialog
          mode={mode}
          initialValue={initialFormValue}
          onCancel={() => { setMode(null); setEditing(null); }}
          onSubmit={async (value) => {
            if (mode === 'create') {
              await addConnection(value);
              onActivity?.(`Added connection ${value.name}`, 'success');
            } else if (editing) {
              await updateConnection(editing.id, value);
              onActivity?.(`Updated connection ${value.name}`, 'success');
            }
            onToast?.('success', `Saved connection ${value.name}`);
            setMode(null);
            setEditing(null);
          }}
        />
      )}
    </main>
  );
};
