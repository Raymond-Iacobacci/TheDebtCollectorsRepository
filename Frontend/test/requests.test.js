import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RequestsView from 'src/sections/requests/view/requests-view';
import { usePathname } from 'src/routes/hooks';
import { getTenantRequests, getManagerRequests } from '../hooks/request-specifics';

jest.mock('src/routes/hooks', () => ({
  usePathname: jest.fn('localhost:3030/dashboard/manager/11EEDCD88EB60DF78F5742010A7F6002/requests'),
}));

jest.mock('src/sections/requests/hooks/request-specifics', () => ({
  getTenantRequests: jest.fn(),
  getManagerRequests: jest.fn(),
}));

describe('RequestsView', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/manager/report/1234');
    getTenantRequests.mockResolvedValue([]);
    getManagerRequests.mockResolvedValue([]);
  });

  test('renders loading state initially', () => {
    render(<RequestsView />);
    expect(screen.getByText('Requests')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders requests data correctly for manager', async () => {
    getManagerRequests.mockResolvedValue([
      {
        requestID: 1,
        name: 'John Doe',
        address: '123 Main St',
        type: 'Repair',
        date: '2023-05-01',
        status: 'Pending',
      },
    ]);

    render(<RequestsView />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Repair')).toBeInTheDocument();
      expect(screen.getByText('2023-05-01')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  test('renders requests data correctly for tenant', async () => {
    getTenantRequests.mockResolvedValue([
      {
        requestID: 1,
        type: 'Repair',
        description: 'Fix the sink',
        date: '2023-05-01',
        status: 'Pending',
      },
    ]);

    render(<RequestsView />);

    await waitFor(() => {
      expect(screen.getByText('Fix the sink')).toBeInTheDocument();
      expect(screen.getByText('Repair')).toBeInTheDocument();
      expect(screen.getByText('2023-05-01')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  test('opens and closes new request dialog for tenant', async () => {

    render(<RequestsView />);

    fireEvent.click(screen.getByText('New Request'));

    await waitFor(() => {
      expect(screen.getByText('Maintenance request')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.queryByText('Maintenance request')).not.toBeInTheDocument();
    });
  });

  test('renders error message if fetch fails', async () => {
    getManagerRequests.mockRejectedValue(new Error('Fetch failed'));

    render(<RequestsView />);

    await waitFor(() => {
      expect(screen.getByText('Fetch failed')).toBeInTheDocument();
    });
  });
});
