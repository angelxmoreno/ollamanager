import { useState } from 'react';

export const PullModelForm = ({
  isPulling,
  progressLabel,
  progressValue,
  onPull,
}: {
  isPulling: boolean;
  progressLabel: string;
  progressValue: number | null;
  onPull: (modelName: string) => Promise<void>;
}) => {
  const [name, setName] = useState('');

  return (
    <form
      className="pull-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!name.trim() || isPulling) {
          return;
        }

        await onPull(name.trim());
      }}
    >
      <h3>Pull model</h3>
      <label>
        Model name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="llama3:8b"
          required
        />
      </label>
      <button type="submit" disabled={isPulling || !name.trim()}>{isPulling ? 'Pulling…' : 'Pull model'}</button>
      {isPulling && (
        <div>
          <p className="muted">{progressLabel}</p>
          {progressValue !== null ? <progress max={100} value={progressValue} /> : <progress />}
        </div>
      )}
    </form>
  );
};
