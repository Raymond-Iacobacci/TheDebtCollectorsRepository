const request = require('supertest');
const express = require('express');
const expensesRouter = require('../../src/manager/expenses');
const { executeQuery, getDate } = require('../../src/utils');

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn(),
  getDate: jest.fn(),
}));

const app = express();
app.use('/expenses', expensesRouter);

describe('Expenses API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /expenses/get-expenses should return all expenses for the manager', async () => {
    const managerId = 'abc123'; // Change this to the manager ID you want to test with
    const mockExpenses = [
      { expenseID: 1, managerID: 'abc123', amount: 100, type: 'Food', description: 'Groceries', date: '2024-06-02', requestID: null },
      { expenseID: 2, managerID: 'abc123', amount: 50, type: 'Transportation', description: 'Taxi fare', date: '2024-06-01', requestID: 'def456' }
    ];
    executeQuery.mockResolvedValueOnce(mockExpenses);

    const response = await request(app).get(`/expenses/get-expenses?manager-id=${managerId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockExpenses.map(expense => ({
      ...expense,
      managerID: expense.managerID, // Assuming frontend expects lowercase hex string
      requestID: expense.requestID ? expense.requestID: null
    })));
    expect(executeQuery).toHaveBeenCalledWith(`SELECT expenseID, managerID, amount, type, description, date, requestID FROM expenses where managerID = 0x${managerId};`);
  });

  test('POST /expenses/add-expense should add a new expense', async () => {
    const managerId = 'abc123'; // Change this to the manager ID you want to test with
    const newExpense = {
      amount: 75,
      type: 'Miscellaneous',
      description: 'Office supplies',
      requestID: 'ghi789'
    };
    getDate.mockReturnValueOnce('2024-06-03');

    const response = await request(app)
      .post(`/expenses/add-expense?manager-id=${managerId}`)
      .send(newExpense);
    
    expect(response.status).toBe(200);
    expect(executeQuery).toHaveBeenCalledWith(`INSERT INTO expenses (managerID, amount, type, description, date, requestID) VALUES (?, ?, ?, ?, ?, ?);`, [
      Buffer.from(managerId, 'hex'), newExpense.amount, newExpense.type, newExpense.description, '2024-06-03', Buffer.from(newExpense.requestID, 'hex')
    ]);
  });

  test('POST /expenses/delete-expense should delete an expense', async () => {
    const expenseId = 123; // Change this to the expense ID you want to test with

    const response = await request(app).post(`/expenses/delete-expense?expense-id=${expenseId}`);
    
    expect(response.status).toBe(200);
    expect(executeQuery).toHaveBeenCalledWith(`DELETE FROM expenses where expenseID = ${expenseId};`);
  });
});
