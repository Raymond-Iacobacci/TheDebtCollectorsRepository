const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { executeQuery, getDate, getBalance } = require('../../src/utils'); 
const { transactionsRouter, updatePayment } = require('../../src/tenant/transactions');

jest.mock('../../src/utils');
jest.mock('../../src/tenant/transactions', () => {
  const originalModule = jest.requireActual('../../src/tenant/transactions');
  return {
    ...originalModule,
    updatePayment: jest.fn()
  };
});

const app = express();
app.use(bodyParser.json());
app.use('/transactions', transactionsRouter);

describe('POST /transactions/make-payment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a payment and return the current date', async () => {
    const tenantID = 'a1b2c3';
    const description = 'Monthly Rent';
    const amount = 500;
    const currentDate = '2024-06-07';
    const balance = 1000;

    getDate.mockReturnValue(currentDate);
    getBalance.mockImplementationOnce(() => Promise.resolve(balance));
    executeQuery.mockResolvedValue([{ oldestCharge: 200, id: 1 }]);

    updatePayment.mockImplementationOnce((amount, tenantID) => {
        expect(amount).toBe(500);
        expect(tenantID).toBe('a1b2c3');
      
        return Promise.resolve();
      });

    const response = await request(app)
      .post('/transactions/make-payment?tenant-id=' + tenantID)
      .send({ description, amount });

    expect(response.text).toBe(currentDate);
    expect(getDate).toHaveBeenCalledTimes(1);
    expect(getBalance).toHaveBeenCalledWith(tenantID);

    expect(executeQuery).toHaveBeenCalledWith(
      'INSERT INTO paymentsLedger (type, description, date, amount, tenantID, balance) VALUES (?, ?, ?, ?, ?, ?)',
      ['Payment', description, currentDate, amount, Buffer.from(tenantID, 'hex'), balance - amount]
    );
  });

  it('should return 500 on server error', async () => {
    const tenantID = 'a1b2c3';
    const description = 'Monthly Rent';
    const amount = 500;

    getBalance.mockImplementationOnce(() => Promise.reject(new Error('Test Error')));

    const response = await request(app)
      .post('/transactions/make-payment?tenant-id=' + tenantID)
      .send({ description, amount });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Test Error' });

    expect(getBalance).toHaveBeenCalledWith(tenantID);
    expect(updatePayment).not.toHaveBeenCalled();
    expect(executeQuery).not.toHaveBeenCalled();
  });

  it('should handle partial payments for pending charges', async () => {
    const tenantID = 'a1b2c3';
    const description = 'Partial Payment';
    const amount = 300;
    const currentDate = '2024-06-07';
    const balance = 500;

    getDate.mockReturnValue(currentDate);
    getBalance.mockImplementationOnce(() => Promise.resolve(balance));
    updatePayment.mockImplementationOnce(() => Promise.resolve());

    const response = await request(app)
      .post('/transactions/make-payment?tenant-id=' + tenantID)
      .send({ description, amount });

    expect(response.status).toBe(200);
    expect(response.text).toBe(currentDate);

    expect(getDate).toHaveBeenCalledTimes(1);
    expect(getBalance).toHaveBeenCalledWith(tenantID);
    expect(executeQuery).toHaveBeenCalledWith(
      'INSERT INTO paymentsLedger (type, description, date, amount, tenantID, balance) VALUES (?, ?, ?, ?, ?, ?)',
      ['Payment', description, currentDate, amount, Buffer.from(tenantID, 'hex'), balance - amount]
    );
  });
});
