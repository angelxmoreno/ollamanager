import type { OllamaModelSummary } from '../../lib/api/mappers';
import { formatBytes, formatDateTime } from '../../lib/format/formatters';

export type SortKey = 'name' | 'size' | 'modifiedAt';

export const ModelListTable = ({
  models,
  loading,
  error,
  search,
  sortKey,
  sortDirection,
  onSearch,
  onSort,
  onRefresh,
  onSelect,
  onDelete,
}: {
  models: OllamaModelSummary[];
  loading: boolean;
  error: string | null;
  search: string;
  sortKey: SortKey;
  sortDirection: 'asc' | 'desc';
  onSearch: (value: string) => void;
  onSort: (key: SortKey) => void;
  onRefresh: () => void;
  onSelect: (modelName: string) => void;
  onDelete: (modelName: string) => void;
}) => {
  return (
    <section className="models-table-wrap" aria-label="Model list">
      <div className="section-head">
        <h2>Models</h2>
        <button onClick={onRefresh} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
      </div>
      <input
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Search models"
        aria-label="Search models"
      />

      {loading && models.length === 0 && <p className="muted">Loading models…</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && models.length === 0 && <p className="muted">No models found.</p>}

      {models.length > 0 && (
        <table>
          <thead>
            <tr>
              <th><button onClick={() => onSort('name')}>Name {sortKey === 'name' ? sortDirection : ''}</button></th>
              <th><button onClick={() => onSort('size')}>Size {sortKey === 'size' ? sortDirection : ''}</button></th>
              <th><button onClick={() => onSort('modifiedAt')}>Modified {sortKey === 'modifiedAt' ? sortDirection : ''}</button></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.name}>
                <td>{model.name}</td>
                <td>{formatBytes(model.size)}</td>
                <td>{formatDateTime(model.modifiedAt)}</td>
                <td>
                  <button onClick={() => onSelect(model.name)}>Details</button>
                  <button className="danger" onClick={() => onDelete(model.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};
