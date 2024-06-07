import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportView from 'src/sections/report/view';

jest.mock('src/routes/hooks', () => ({
  usePathname: jest.fn(
    () => 'localhost:3030/dashboard/manager/11EEDCD88EB60DF78F5742010A7F6002/report'
  ),
}));

jest.mock('src/utils/format-number', () => ({
  fCurrency: jest.fn((val) => `$${val}`),
}));

describe('ReportView', () => {
  test('renders loading state initially', () => {
    render(<ReportView />);
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  test('renders report data correctly', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve([
          {
            income_rent: 1000,
            income_utilities: 200,
            expense_maintenance: 300,
            credit_refund: 50,
          },
        ]),
      })
    );

    render(<ReportView />);

    await waitFor(() => {
      expect(screen.getByText('Income')).toBeInTheDocument();
      expect(screen.getByText('Expenses')).toBeInTheDocument();
      expect(screen.getByText('Credits')).toBeInTheDocument();
      expect(screen.getByText('Totals')).toBeInTheDocument();
    });

    expect(screen.getByText('$1000')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
    expect(screen.getByText('$300')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  test('changes time period and fetches new data', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve([
          {
            income_rent: 1000,
            income_utilities: 200,
            expense_maintenance: 300,
            credit_refund: 50,
          },
        ]),
      })
    );

    render(<ReportView />);

    await waitFor(() => {
      expect(screen.getByText('Monthly')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /eva:more-vertical-fill/i }));
    fireEvent.click(screen.getByText('Quarterly'));

    await waitFor(() => {
      expect(screen.getByText('Quarterly')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('schedule=quarterly'));
  });

  test('renders error message if fetch fails', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.reject(new Error('Fetch failed'))
    );

    render(<ReportView />);

    await waitFor(() => {
      expect(screen.getByText('Fetch failed')).toBeInTheDocument();
    });
  });
});
