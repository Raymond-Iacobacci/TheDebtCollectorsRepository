import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import ListTenantView from 'src/sections/list-tenants/view';
import { getListTenants, createTenant } from '../hooks/list-tenants-specifics';

// ----------------------------------------------------------------------

jest.mock('src/routes/hooks', () => ({
  usePathname: jest.fn(() => 'localhost:3030/dashboard/manager/11EEDCD88EB60DF78F5742010A7F6002/list-tenants'),
}));

jest.mock('../hooks/list-tenants-specifics', () => ({
  getListTenants: jest.fn(),
  createTenant: jest.fn(),
}));

const mockTenants = [
  { tenantID: '1', email: 'tenant1@example.com', firstName: 'John', lastName: 'Doe', address: '123 Main St', rent: '1000' },
  { tenantID: '2', email: 'tenant2@example.com', firstName: 'Jane', lastName: 'Smith', address: '456 Elm St', rent: '1200' },
];

describe('ListTenantView', () => {
  beforeEach(() => {
    getListTenants.mockResolvedValue(mockTenants);
  });

  it('renders the component and displays tenants', async () => {
    render(
      <BrowserRouter>
        <ListTenantView />
      </BrowserRouter>
    );

    expect(screen.getByText('Tenants')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('tenant1@example.com')).toBeInTheDocument();
      expect(screen.getByText('tenant2@example.com')).toBeInTheDocument();
    });
  });

  it('handles pagination changes', async () => {
    render(
      <BrowserRouter>
        <ListTenantView />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('tenant1@example.com')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByLabelText('Next page');
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('tenant1@example.com')).toBeInTheDocument(); // Assuming only one page of data
    });
  });

  it('filters tenants by name', async () => {
    render(
      <BrowserRouter>
        <ListTenantView />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('tenant1@example.com')).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText('Search tenant...');
    fireEvent.change(filterInput, { target: { value: 'Jane' } });

    await waitFor(() => {
      expect(screen.getByText('tenant2@example.com')).toBeInTheDocument();
      expect(screen.queryByText('tenant1@example.com')).not.toBeInTheDocument();
    });
  });

  it('opens and closes the create tenant dialog', async () => {
    render(
      <BrowserRouter>
        <ListTenantView />
      </BrowserRouter>
    );

    const createButton = screen.getByText('Create Tenant');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('New Tenant')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('New Tenant')).not.toBeInTheDocument();
    });
  });

  it('creates a new tenant', async () => {
    createTenant.mockResolvedValue({ ok: true });

    render(
      <BrowserRouter>
        <ListTenantView />
      </BrowserRouter>
    );

    const createButton = screen.getByText('Create Tenant');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('New Tenant')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Johnson' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '789 Oak St' } });
    fireEvent.change(screen.getByLabelText('Rent'), { target: { value: '1300' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createTenant).toHaveBeenCalledWith('11EEDCD88EB60DF78F5742010A7F6002', 'Alice', 'Johnson', 'alice@example.com', '789 Oak St', '1300');
      expect(screen.queryByText('New Tenant')).not.toBeInTheDocument();
    });
  });

  it('displays loading and error states', async () => {
    getListTenants.mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch')));

    render(
      <BrowserRouter>
        <ListTenantView />
      </BrowserRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });
});
