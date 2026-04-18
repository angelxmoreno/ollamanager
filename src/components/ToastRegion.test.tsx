import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToastRegion, type ToastMessage } from './ToastRegion';

describe('ToastRegion', () => {
  it('does not reset existing toast timers when adding new toasts', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    const firstToast: ToastMessage = { id: '1', kind: 'info', message: 'First' };
    const secondToast: ToastMessage = { id: '2', kind: 'success', message: 'Second' };

    const { rerender } = render(<ToastRegion toasts={[firstToast]} onDismiss={onDismiss} />);

    vi.advanceTimersByTime(2000);
    rerender(<ToastRegion toasts={[firstToast, secondToast]} onDismiss={onDismiss} />);

    vi.advanceTimersByTime(1200);
    expect(onDismiss).toHaveBeenCalledWith('1');
    expect(onDismiss).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2000);
    expect(onDismiss).toHaveBeenCalledWith('2');

    vi.useRealTimers();
  });
});
