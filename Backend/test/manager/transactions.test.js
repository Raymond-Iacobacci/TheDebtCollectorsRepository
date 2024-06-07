const request = require('supertest');
const express = require('express');
const {transactionsRouter, crawlForLatePayments, fillRentPayments} = require('../../src/manager/transactions');

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
    executeQuery.mockResolvedValue([{ oldestCharge: 200, id: 1 }]);

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

    expect(response.body).toEqual({ error: 'Database error' });
  });

  test('POST /transactions/delete-payment should delete the payment and return status 200', async () => {
    const { executeQuery } = require('../../src/utils');

    executeQuery.mockResolvedValue([{ latestCharge : 200, id: 1 }]);

    const response = await request(app)
      .post('/transactions/delete-payment?tenant-id=' + mockTenantID[0])
      .send({ amount: mockAmount, id: mockPaymentID[0] });

    expect(executeQuery).toHaveBeenCalledWith(`DELETE FROM paymentsLedger WHERE id=${mockPaymentID[0]}`);
  });

  test('POST /transactions/delete-payment should return status 500 if there is an error', async () => {
    const { executeQuery } = require('../../src/utils');

    executeQuery.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/transactions/delete-payment?tenant-id=' + mockTenantID[1])
      .send({ amount: mockAmount, id: mockPaymentID[1] });

    expect(response.body).toEqual({ error: 'Database error' });
  });

  test('POST /transactions/delete-charge should delete the charge and return status 200', async () => {
    const { executeQuery } = require('../../src/utils');

    executeQuery.mockResolvedValue();

    const response = await request(app)
    .post('/transactions/delete-charge?payment-id=' +mockPaymentID[1])
    .send({amount: mockAmount, id: mockTenantID});

    expect(executeQuery).toHaveBeenCalledWith(`SELECT amount, paidAmount, date, tenantID from paymentsLedger where id=${mockPaymentID[1]}`);
  });

  describe('crawlForLatePayments', () => {
    it('should insert late payment charges into the paymentsLedger', async () => {
      const mockExecuteQuery = require('../../src/utils').executeQuery;
      const mockGetBalance = require('../../src/utils').getBalance;
  
      mockExecuteQuery.mockResolvedValueOnce([{ tenantID: '123', description: 'Rent', date: new Date(), id: 'abc' }]);
      mockGetBalance.mockResolvedValueOnce(100);
  
      await crawlForLatePayments();
  
      expect(mockExecuteQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO paymentsLedger'), expect.any(Array));
    });
  
    it('should not insert late payment charges if no late payments are found', async () => {
      const mockExecuteQuery = require('../../src/utils').executeQuery;
  
      mockExecuteQuery.mockResolvedValueOnce([]);
  
      await crawlForLatePayments();
  
      expect(mockExecuteQuery).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO paymentsLedger'), expect.any(Array));
    });
  });

  describe('fillRentPayments', () => {
    it('should insert rent payments into the paymentsLedger', async () => {
      const mockExecuteQuery = require('../../src/utils').executeQuery;
      const mockGetBalance = require('../../src/utils').getBalance;

      mockExecuteQuery.mockResolvedValue([{ tenantID: '123', rents: 100 }]);
      mockGetBalance.mockResolvedValueOnce(200);
      require('../../src/utils').getDate.mockReturnValue('2023-01-01');

      await fillRentPayments();

      expect(mockExecuteQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO paymentsLedger'), expect.any(Array));
    });

    it('should not insert rent payments if no tenants with rents are found', async () => {
      const mockExecuteQuery = require('../../src/utils').executeQuery;

      mockExecuteQuery.mockResolvedValue([]);

      await fillRentPayments();

      expect(mockExecuteQuery).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO paymentsLedger'), expect.any(Array));
    });
  });

});