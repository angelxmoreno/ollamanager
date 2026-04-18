import { render, screen } from '@testing-library/react';
import { beforeEach } from 'vitest';

import App from './App';
import { __resetConnectionsStore } from './store/useConnectionsStore';

beforeEach(() => {
  window.localStorage.clear();
  __resetConnectionsStore();
});

describe('App', () => {
  it('renders the app heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'OllaManager' })).toBeInTheDocument();
  });
});
