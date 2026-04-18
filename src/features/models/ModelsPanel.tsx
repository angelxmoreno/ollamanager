import { useMemo, useState } from 'react';

import { OllamaClient } from '../../lib/api/ollamaClient';
import { normalizeApiError } from '../../lib/api/normalize';
import type { OllamaModelDetails, OllamaModelSummary } from '../../lib/api/mappers';
import type { ActivityEntry } from '../activity/ActivityLog';
import { DeleteModelDialog } from './DeleteModelDialog';
import { ModelDetailsModal } from './ModelDetailsModal';
import { ModelListTable, type SortKey } from './ModelListTable';
import { PullModelForm } from './PullModelForm';

const nextSort = (current: 'asc' | 'desc'): 'asc' | 'desc' => (current === 'asc' ? 'desc' : 'asc');

export const ModelsPanel = ({
  baseUrl,
  onActivity,
  onToast,
}: {
  baseUrl: string;
  onActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  onToast: (kind: 'success' | 'error' | 'info', message: string) => void;
}) => {
  const [models, setModels] = useState<OllamaModelSummary[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState<number | null>(null);
  const [pullLabel, setPullLabel] = useState('Waiting to start…');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<{ details: OllamaModelDetails; raw?: unknown } | null>(null);

  const client = useMemo(() => new OllamaClient({ baseUrl }), [baseUrl]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.listModels();
      setModels(result);
      onActivity({ level: 'info', message: `Loaded ${result.length} model(s)` });
    } catch (err) {
      const normalized = normalizeApiError(err);
      setError(`${normalized.title}: ${normalized.message}`);
      onToast('error', normalized.message);
      onActivity({ level: 'error', message: `Failed loading models: ${normalized.message}` });
    } finally {
      setLoading(false);
    }
  };

  const visibleModels = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q ? models.filter((model) => model.name.toLowerCase().includes(q)) : models;

    const sorted = [...filtered].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;

      if (sortKey === 'name') return a.name.localeCompare(b.name) * direction;
      if (sortKey === 'size') return ((a.size ?? 0) - (b.size ?? 0)) * direction;
      return (new Date(a.modifiedAt ?? 0).getTime() - new Date(b.modifiedAt ?? 0).getTime()) * direction;
    });

    return sorted;
  }, [models, search, sortKey, sortDirection]);

  return (
    <section className="models-panel">
      <ModelListTable
        models={visibleModels}
        loading={loading}
        error={error}
        search={search}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSearch={setSearch}
        onSort={(key) => {
          if (key === sortKey) {
            setSortDirection((prev) => nextSort(prev));
          } else {
            setSortKey(key);
            setSortDirection('asc');
          }
        }}
        onRefresh={() => void refresh()}
        onSelect={async (modelName) => {
          try {
            const details = await client.getModelDetails(modelName);
            setSelectedDetails({ details, raw: details.rawPayload });
          } catch (err) {
            const normalized = normalizeApiError(err);
            onToast('error', normalized.message);
          }
        }}
        onDelete={setDeleting}
      />

      <PullModelForm
        isPulling={isPulling}
        progressLabel={pullLabel}
        progressValue={pullProgress}
        onPull={async (modelName) => {
          setIsPulling(true);
          setPullLabel('Starting pull…');
          setPullProgress(null);
          try {
            let streamed = false;
            await client.pullModel(modelName, (event) => {
              streamed = true;
              setPullLabel(event.status || 'Pulling…');
              if (typeof event.completed === 'number' && typeof event.total === 'number' && event.total > 0) {
                setPullProgress(Math.floor((event.completed / event.total) * 100));
              } else {
                setPullProgress(null);
              }
            });

            if (!streamed) {
              setPullLabel('Pulled model (stream unavailable)');
            }

            onToast('success', `Pulled ${modelName}`);
            onActivity({ level: 'success', message: `Pulled model ${modelName}` });
            await refresh();
          } catch (err) {
            const normalized = normalizeApiError(err);
            onToast('error', normalized.message);
            onActivity({ level: 'error', message: `Pull failed for ${modelName}: ${normalized.message}` });
          } finally {
            setIsPulling(false);
          }
        }}
      />

      {deleting && (
        <DeleteModelDialog
          modelName={deleting}
          busy={deleteBusy}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            setDeleteBusy(true);
            try {
              await client.deleteModel(deleting);
              onToast('success', `Deleted ${deleting}`);
              onActivity({ level: 'success', message: `Deleted model ${deleting}` });
              setDeleting(null);
              await refresh();
            } catch (err) {
              const normalized = normalizeApiError(err);
              onToast('error', normalized.message);
            } finally {
              setDeleteBusy(false);
            }
          }}
        />
      )}

      {selectedDetails && (
        <ModelDetailsModal
          details={selectedDetails.details}
          raw={selectedDetails.raw}
          onClose={() => setSelectedDetails(null)}
        />
      )}
    </section>
  );
};
