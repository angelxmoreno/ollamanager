import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ModelsPanel } from './ModelsPanel';

const onActivity = vi.fn();
const onToast = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  onActivity.mockReset();
  onToast.mockReset();
});

describe('ModelsPanel', () => {
  it('renders model list and handles delete confirmation', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ models: [{ name: 'llama3:8b', size: 1024 }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response('', { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ models: [] }), { status: 200 }))
    );

    render(<ModelsPanel baseUrl="http://localhost:11434" onActivity={onActivity} onToast={onToast} />);

    await screen.findByText('llama3:8b');

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('dialog', { name: 'Confirm model delete' });
    fireEvent.click(within(dialog).getByRole('button', { name: /^Delete$/i }));
    await waitFor(() => expect(onToast).toHaveBeenCalledWith('success', 'Deleted llama3:8b'));
  });

  it('runs pull flow with fallback progress', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ models: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response('', { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ models: [] }), { status: 200 }))
    );

    render(<ModelsPanel baseUrl="http://localhost:11434" onActivity={onActivity} onToast={onToast} />);

    fireEvent.change(screen.getByLabelText('Model name'), { target: { value: 'llama3:8b' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pull model' }));

    await waitFor(() => expect(onToast).toHaveBeenCalledWith('success', 'Pulled llama3:8b'));
  });

  it('shows api error state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('down', { status: 500, statusText: 'Server Error' })));

    render(<ModelsPanel baseUrl="http://localhost:11434" onActivity={onActivity} onToast={onToast} />);

    await screen.findByText(/Request failed/);
  });
});
