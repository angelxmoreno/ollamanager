import type { OllamaModelDetails } from '../../lib/api/mappers';

const renderRecord = (record?: Record<string, unknown>) => {
  if (!record || Object.keys(record).length === 0) {
    return <p className="muted">No structured metadata available.</p>;
  }

  return (
    <dl>
      {Object.entries(record).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{typeof value === 'string' ? value : JSON.stringify(value)}</dd>
        </div>
      ))}
    </dl>
  );
};

export const ModelDetailsModal = ({
  details,
  raw,
  onClose,
}: {
  details: OllamaModelDetails;
  raw?: unknown;
  onClose: () => void;
}) => (
  <div className="dialog-backdrop" role="presentation">
    <div className="dialog-card model-details" role="dialog" aria-label="Model details">
      <h3>{details.name}</h3>
      {details.modelfile && <pre>{details.modelfile}</pre>}
      {details.parameters && <pre>{details.parameters}</pre>}
      {details.template && <pre>{details.template}</pre>}
      {details.license && <pre>{details.license}</pre>}

      <h4>Details</h4>
      {renderRecord(details.details)}
      <h4>Model info</h4>
      {renderRecord(details.modelInfo)}

      {(!details.details || Object.keys(details.details).length === 0) && raw && (
        <>
          <h4>Raw payload</h4>
          <pre>{JSON.stringify(raw, null, 2)}</pre>
        </>
      )}

      <div className="dialog-actions">
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);
