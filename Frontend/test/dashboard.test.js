import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import { AppView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

jest.mock('src/sections/overview/hooks/summary', () => ({
  getNumberTenants: jest.fn(() => Promise.resolve({ numberOfTenants: 10 })),
  getNumberRequests: jest.fn(() => Promise.resolve({ count: 5 })),
  getNumberPayments: jest.fn(() => Promise.resolve({ count: 15 })),
  getTotalOutstandingBalance: jest.fn(() => Promise.resolve({ balance: 5000 })),
  getListOfOutstandingTenants: jest.fn(() => Promise.resolve([{ id: 1, name: 'Tenant 1' }])),
  getListofUnresolvedRequests: jest.fn(() =>
    Promise.resolve([
      { id: 1, status: 'Pending' },
      { id: 2, status: 'Resolved' },
    ])
  ),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('Dashboard Page', () => {
  test('Header', async () => {
    render(
      <BrowserRouter>
        <AppView />
      </BrowserRouter>
    );
    const header = screen.getByText(/Manager Dashboard/i);
    expect(header).toBeInTheDocument();
  });

  test('Analytic Widgets', async () => {
    render(
      <BrowserRouter>
        <AppView />
      </BrowserRouter>
    );
    const numTenants = screen.getByTestId('numTenantsWidget');
    const numPayments = screen.getByTestId('numPaymentsWidget');
    const numRequests = screen.getByTestId('numRequestsWidget');
    const numBalance = screen.getByTestId('numBalanceWidget');

    expect(numTenants).toBeInTheDocument();
    expect(numPayments).toBeInTheDocument();
    expect(numRequests).toBeInTheDocument();
    expect(numBalance).toBeInTheDocument();

    await waitFor(() => {
      expect(numTenants).toHaveTextContent('10');
      expect(numPayments).toHaveTextContent('15');
      expect(numRequests).toHaveTextContent('5');
      expect(numBalance).toHaveTextContent('5000');
    });
  });

  test('Analytic Lists', async () => {
    render(
      <BrowserRouter>
        <AppView />
      </BrowserRouter>
    );
    const outstandingTenants = screen.getByTestId('outstandingTenantsList');
    const unresolvedRequests = screen.getByTestId('unresolvedRequestsList');

    expect(outstandingTenants).toBeInTheDocument();
    expect(unresolvedRequests).toBeInTheDocument();
  });
});
