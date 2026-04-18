import { useEffect } from 'react';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  kind: ToastKind;
  message: string;
}

export const ToastRegion = ({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) => {
  useEffect(() => {
    const timers = toasts.map((toast) =>
      globalThis.setTimeout(() => {
        onDismiss(toast.id);
      }, 3200),
    );

    return () => {
      timers.forEach((timer) => globalThis.clearTimeout(timer));
    };
  }, [toasts, onDismiss]);

  return (
    <div className="toast-region" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.kind}`} role="status">
          <span>{toast.message}</span>
          <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
