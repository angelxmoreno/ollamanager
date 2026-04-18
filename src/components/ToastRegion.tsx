import { useEffect, useRef } from 'react';

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
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const existingIds = new Set(toasts.map((toast) => toast.id));

    toasts.forEach((toast) => {
      if (timersRef.current.has(toast.id)) {
        return;
      }

      const timer = globalThis.setTimeout(() => {
        timersRef.current.delete(toast.id);
        onDismiss(toast.id);
      }, 3200);

      timersRef.current.set(toast.id, timer);
    });

    for (const [toastId, timer] of timersRef.current.entries()) {
      if (!existingIds.has(toastId)) {
        globalThis.clearTimeout(timer);
        timersRef.current.delete(toastId);
      }
    }
  }, [toasts, onDismiss]);

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) {
        globalThis.clearTimeout(timer);
      }
      timersRef.current.clear();
    },
    [],
  );

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
