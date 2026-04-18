export type ActivityLevel = 'success' | 'error' | 'info';

export interface ActivityEntry {
  id: string;
  message: string;
  level: ActivityLevel;
  timestamp: string;
}

export const ActivityLog = ({ entries }: { entries: ActivityEntry[] }) => {
  return (
    <section className="activity-log" aria-label="Activity log">
      <h2>Recent activity</h2>
      {entries.length === 0 ? (
        <p className="muted">No activity yet.</p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li key={entry.id}>
              <span className={`pill pill-${entry.level}`}>{entry.level}</span>
              <span>{entry.message}</span>
              <time dateTime={entry.timestamp}>{new Date(entry.timestamp).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
