const request = require('supertest');
const express = require('express');
const transactionsRouter = require('../../src/manager/transactions');

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn(),
  getBalance: jest.fn(),
  getDate: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/transactions', transactionsRouter);

describe('Transactions API routes', () => {
  const mockTenantID = '1a2b3c';
  const mockDescription = 'Test Credit';
  const mockAmount = 100;
  const mockDate = '2024-06-01';
  const mockPaymentID = [788,789];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /transactions/create-credit should create a credit for the tenant and return status 200', async () => {
    const { executeQuery, getBalance, getDate } = require('../../src/utils');

    getBalance.mockResolvedValue(200);
    getDate.mockReturnValue(mockDate);
    executeQuery.mockResolvedValue();

    const response = await request(app)
      .post('/transactions/create-credit')
      .send({ tenantID: mockTenantID, description: mockDescription, amount: mockAmount });

    expect(response.status).toBe(200);

    const expectedQuery = 'INSERT INTO paymentsLedger (type, description, date, amount, tenantID, balance, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const expectedValues = ['Credit', mockDescription, mockDate, mockAmount, Buffer.from(mockTenantID, 'hex'), 100, 0];

    expect(executeQuery).toHaveBeenCalledWith(expectedQuery, expectedValues);
  });

  test('POST /transactions/create-charge should create a charge for the tenant and return the current date', async () => {
    const { executeQuery, getBalance, getDate } = require('../../src/utils');

    getBalance.mockResolvedValue(200);
    getDate.mockReturnValue(mockDate);
    executeQuery.mockResolvedValue();

    const response = await request(app)
      .post('/transactions/create-charge')
      .send({ tenantID: mockTenantID, description: mockDescription, amount: mockAmount });

    expect(response.status).toBe(200);
    expect(response.text).toBe(mockDate);

    const expectedQuery = 'INSERT INTO paymentsLedger (type, description, date, amount, tenantID, balance, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const expectedValues = ['Charge', mockDescription, mockDate, mockAmount, Buffer.from(mockTenantID, 'hex'), 300, mockAmount];

    expect(executeQuery).toHaveBeenCalledWith(expectedQuery, expectedValues);
    expect(executeQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO paymentsLedger'), expect.anything());
  });

  test('POST /transactions/create-charge should return status 500 if there is an error', async () => {
    const { executeQuery, getBalance, getDate } = require('../../src/utils');

    getBalance.mockResolvedValue(200);
    getDate.mockReturnValue(mockDate);
    executeQuery.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/transactions/create-charge')
      .send({ tenantID: mockTenantID, description: mockDescription, amount: mockAmount });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Database error' });
  });

  test('POST /transactions/delete-payment should delete the payment and return status 200', async () => {
    const { executeQuery } = require('../../src/utils');

    executeQuery.mockResolvedValue();

    const response = await request(app)
      .post('/transactions/delete-payment?tenant-id=' + mockTenantID[0])
      .send({ amount: mockAmount, id: mockPaymentID[0] });

    expect(response.status).toBe(200);
    expect(executeQuery).toHaveBeenCalledWith(`DELETE FROM paymentsLedger WHERE id=${mockPaymentID[0]}`);
    // expect(executeQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE paymentsLedger SET paidAmount=100 WHERE id='), expect.anything());
  });

  test('POST /transactions/delete-payment should return status 500 if there is an error', async () => {
    const { executeQuery } = require('../../src/utils');

    executeQuery.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/transactions/delete-payment?tenant-id=' + mockTenantID[1])
      .send({ amount: mockAmount, id: mockPaymentID[1] });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Database error' });
  });

});