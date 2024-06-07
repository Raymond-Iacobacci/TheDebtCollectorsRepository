import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import { ExpensesView } from 'src/sections/expenses/view';

// ----------------------------------------------------------------------

jest.mock('src/routes/hooks', () => ({
  usePathname: jest.fn(
    () => 'localhost:3030/dashboard/manager/11EEDCD88EB60DF78F5742010A7F6002/expenses'
  ),
}));

jest.mock('src/sections/expenses/hooks/expense-specifics', () => ({
  getExpenses: jest.fn(),
  getRequests: jest.fn(),
  addExpense: jest.fn()
}));

jest.mock('src/components/scrollbar', () => ({ children }) => <div>{children}</div>);

jest.mock('src/sections/expenses/table-components/table-row', () => ({ type, amount, description, date }) => (
  <tr>
    <td>{type}</td>
    <td>{amount}</td>
    <td>{description}</td>
    <td>{date}</td>
  </tr>
));

jest.mock('src/sections/expenses/table-components/table-head', () => () => (
  <thead><tr><th>Type</th><th>Amount</th><th>Description</th><th>Date</th></tr></thead>
));

jest.mock('src/sections/expenses/table-components/table-toolbar', () => ({ filterName, onFilterName }) => (
  <input
    value={filterName}
    onChange={onFilterName}
    placeholder="Filter by name"
  />
));

jest.mock('src/sections/expenses/table-components/table-empty-rows', () => () => <tr><td>No rows</td></tr>);

jest.mock('src/sections/expenses/table-components/table-no-data', () => ({ query }) => (
  <tr><td>No data for "{query}"</td></tr>
));

const mockExpenses = [
  { expenseID: 1, type: 'Maintenance Request', amount: 100, description: 'Fix leak', date: '2023-01-01', requestID: 1 },
  { expenseID: 2, type: 'Wages', amount: 200, description: 'Salary', date: '2023-01-02', requestID: null }
];

const mockRequests = [
  { requestID: 1, type: 'Plumbing', name: 'John Doe' }
];

describe("ExpensesView Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly and displays data", async () => {
    const { getExpenses, getRequests } = require('src/sections/expenses/hooks/expense-specifics');
    getExpenses.mockResolvedValue(mockExpenses);
    getRequests.mockResolvedValue(mockRequests);

    render(<BrowserRouter><ExpensesView /></BrowserRouter>);

    expect(screen.getByText(/Expenses/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Expense/i })).toBeInTheDocument();

    await waitFor(() => {
      mockExpenses.forEach(expense => {
        expect(screen.getByText(expense.type)).toBeInTheDocument();
        expect(screen.getByText(expense.amount.toString())).toBeInTheDocument();
        expect(screen.getByText(expense.description)).toBeInTheDocument();
        expect(screen.getByText(expense.date)).toBeInTheDocument();
      });
    });
  });

  test("displays loading spinner and handles error messages", async () => {
    const { getExpenses, getRequests } = require('src/sections/expenses/hooks/expense-specifics');
    getExpenses.mockRejectedValue(new Error('Failed to fetch expenses'));
    getRequests.mockResolvedValue(mockRequests);

    render(<BrowserRouter><ExpensesView /></BrowserRouter>);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch expenses')).toBeInTheDocument();
    });
  });

  test("opens and submits new expense dialog", async () => {
    const { addExpense, getExpenses, getRequests } = require('src/sections/expenses/hooks/expense-specifics');
    getExpenses.mockResolvedValue(mockExpenses);
    getRequests.mockResolvedValue(mockRequests);
    addExpense.mockResolvedValue({ ok: true });

    render(<BrowserRouter><ExpensesView /></BrowserRouter>);

    fireEvent.click(screen.getByRole('button', { name: /New Expense/i }));

    expect(screen.getByText(/Add Expense/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Expense Type/i), { target: { value: 'Wages' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Bonus' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(getExpenses).toHaveBeenCalledTimes(2); // Initially and after submit
    });
  });
});
