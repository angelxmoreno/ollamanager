import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ModelDetailsModal } from './ModelDetailsModal';

describe('ModelDetailsModal', () => {
  it('does not show the raw payload section for empty object or array payloads', () => {
    const details = { name: 'llama3:8b' };
    const onClose = vi.fn();

    const { rerender } = render(<ModelDetailsModal details={details} raw={{}} onClose={onClose} />);
    expect(screen.queryByText('Raw payload')).not.toBeInTheDocument();

    rerender(<ModelDetailsModal details={details} raw={[]} onClose={onClose} />);
    expect(screen.queryByText('Raw payload')).not.toBeInTheDocument();
  });

  it('shows the raw payload section when structured details are absent and raw data has content', () => {
    render(<ModelDetailsModal details={{ name: 'llama3:8b' }} raw={{ size: 1024 }} onClose={vi.fn()} />);

    expect(screen.getByText('Raw payload')).toBeInTheDocument();
    expect(screen.getByText(/"size": 1024/)).toBeInTheDocument();
  });
});
