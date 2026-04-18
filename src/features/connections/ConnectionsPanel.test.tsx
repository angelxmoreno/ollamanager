import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConnectionsPanel } from './ConnectionsPanel';
import { __resetConnectionsStore } from '../../store/useConnectionsStore';

beforeEach(() => {
  window.localStorage.clear();
  __resetConnectionsStore();
  vi.restoreAllMocks();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
});

describe('ConnectionsPanel', () => {
  it('adds/selects/edits/deletes connection', async () => {
    render(<ConnectionsPanel />);
    await screen.findByText('No saved connections yet. Add one from the sidebar.');

    fireEvent.click(screen.getByRole('button', { name: '+ Add' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Primary' } });
    fireEvent.change(screen.getByLabelText('Host'), { target: { value: '127.0.0.1' } });
    fireEvent.change(screen.getByLabelText('Port'), { target: { value: '11434' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    const createdConnection = await screen.findByRole('button', { name: /Primary/ });
    fireEvent.click(createdConnection);
    await screen.findByRole('heading', { name: 'Primary' });

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Primary-2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('heading', { name: 'Primary-2' });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await screen.findByText('No saved connections yet. Add one from the sidebar.');
  });

  it('shows inline validation errors', async () => {
    render(<ConnectionsPanel />);
    fireEvent.click(screen.getByRole('button', { name: '+ Add' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'a' } });
    fireEvent.change(screen.getByLabelText('Host'), { target: { value: 'bad host' } });
    fireEvent.change(screen.getByLabelText('Port'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText(/Name must be between 2 and 60/)).toBeInTheDocument();
      expect(screen.getByText(/Host must be localhost/)).toBeInTheDocument();
    });
  });
});
