import { useCallback, useState } from 'react';

import { ToastRegion, type ToastMessage } from './components/ToastRegion';
import { ActivityLog, type ActivityEntry } from './features/activity/ActivityLog';
import { ConnectionsPanel } from './features/connections';
import { ModelsPanel } from './features/models';

const generateId = (): string => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function App() {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeConnectionUrl, setActiveConnectionUrl] = useState<string | null>(null);

  const pushActivity = useCallback((entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    setActivity((prev) => [{ id: generateId(), timestamp: new Date().toISOString(), ...entry }, ...prev].slice(0, 20));
  }, []);

  const pushToast = useCallback((kind: ToastMessage['kind'], message: string) => {
    setToasts((prev) => [...prev, { id: generateId(), kind, message }]);
  }, []);

  return (
    <>
      <header className="top-header">
        <h1>OllaManager</h1>
      </header>
      <ConnectionsPanel
        onConnectionUrlChange={setActiveConnectionUrl}
        onActivity={(message, level) => pushActivity({ message, level })}
        onToast={pushToast}
      />
      <section className="secondary-layout">
        {activeConnectionUrl ? (
          <ModelsPanel baseUrl={activeConnectionUrl} onActivity={pushActivity} onToast={pushToast} />
        ) : (
          <p className="muted">Select a connection to manage models.</p>
        )}
        <ActivityLog entries={activity} />
      </section>
      <ToastRegion toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />
    </>
  );
}

export default App;
