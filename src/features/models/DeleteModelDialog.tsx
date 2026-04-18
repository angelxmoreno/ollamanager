export const DeleteModelDialog = ({
  modelName,
  busy,
  onCancel,
  onConfirm,
}: {
  modelName: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) => (
  <div className="dialog-backdrop" role="presentation">
    <div className="dialog-card" role="dialog" aria-label="Confirm model delete">
      <h3>Delete model</h3>
      <p>Are you sure you want to delete <strong>{modelName}</strong>?</p>
      <div className="dialog-actions">
        <button onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="danger" onClick={() => void onConfirm()} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button>
      </div>
    </div>
  </div>
);
