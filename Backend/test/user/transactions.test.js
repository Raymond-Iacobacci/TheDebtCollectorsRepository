const request = require('supertest');
const express = require('express');
const { transactionsRouter, updateBalance, getPrevBalance } = require('../../src/user/transactions'); 
const { executeQuery } = require('../../src/utils');

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/transactions', transactionsRouter);

describe('Transactions API routes', () => {
  const mockTenantID = '1a2b3c';
  const mockTenantIDHex = '0x1a2b3c';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /transactions/get-ledger', () => {
    test('should return the ledger for the tenant', async () => {
      const mockLedger = [
        { id: 1, type: 'Charge', date: '2024-06-01', amount: 500, description: 'Rent', balance: 500 },
        { id: 2, type: 'Payment', date: '2024-06-05', amount: 500, description: 'Payment', balance: 0 }
      ];

      executeQuery.mockImplementation((query) => {
        if (query.includes("SELECT id, type, date, amount, description, balance FROM paymentsLedger WHERE tenantID=" + mockTenantIDHex)) {
          return mockLedger;
        }
        if (query.includes("sum(amount) as amount from paymentsLedger where type='Charge'")) {
          return [{ amount: 500 }];
        }
        if (query.includes("sum(amount) as amount from paymentsLedger where type='Payment'")) {
          return [{ amount: 500 }];
        }
        if (query.includes("sum(amount) as amount from paymentsLedger where type='Credit'")) {
          return [{ amount: 0 }];
        }
        return [];
      });

      const response = await request(app)
        .get('/transactions/get-ledger')
        .query({ 'tenant-id': mockTenantID });

      expect(response.body).toEqual(mockLedger);
      expect(executeQuery).toHaveBeenNthCalledWith(1, expect.stringContaining("SELECT id, type, date, amount, description, balance FROM paymentsLedger WHERE tenantID=" + mockTenantIDHex));
      expect(executeQuery).toHaveBeenNthCalledWith(2, expect.stringContaining("SELECT sum(amount) as amount from paymentsLedger where type='Charge' AND tenantID=" + mockTenantIDHex));
      expect(executeQuery).toHaveBeenNthCalledWith(3, expect.stringContaining("SELECT sum(amount) as amount from paymentsLedger where type='Payment' AND tenantID=" + mockTenantIDHex));
      expect(executeQuery).toHaveBeenNthCalledWith(4, expect.stringContaining("SELECT sum(amount) as amount from paymentsLedger where type='Credit' AND tenantID=" + mockTenantIDHex));
    });
  });

  describe('updateBalance function', () => {
    test('should update balances correctly', async () => {
      const mockLedgerEntries = [
        { id: 1, type: 'Charge', amount: 500 },
        { id: 2, type: 'Payment', amount: 200 },
        { id: 3, type: 'Credit', amount: 100 }
      ];

      executeQuery.mockImplementation((query) => {
        if (query.includes("SELECT id, type, date, amount, description, balance FROM paymentsLedger WHERE tenantID=" + mockTenantIDHex)) {
          return mockLedgerEntries;
        }
        if (query.includes("sum(amount) as amount from paymentsLedger where type='Charge' AND tenantID=" + mockTenantIDHex)) {
          if (query.includes("AND id <= 1")) {
            return [{ amount: 500 }];
          }
          if (query.includes("AND id <= 2")) {
            return [{ amount: 500 }];
          }
          if (query.includes("AND id <= 3")) {
            return [{ amount: 500 }];
          }
        }
        if (query.includes("sum(amount) as amount from paymentsLedger where type='Payment' AND tenantID=" + mockTenantIDHex)) {
          if (query.includes("AND id <= 1")) {
            return [{ amount: 0 }];
          }
          if (query.includes("AND id <= 2")) {
            return [{ amount: 200 }];
          }
          if (query.includes("AND id <= 3")) {
            return [{ amount: 200 }];
          }
        }
        if (query.includes("sum(amount) as amount from paymentsLedger where type='Credit' AND tenantID=" + mockTenantIDHex)) {
          if (query.includes("AND id <= 1")) {
            return [{ amount: 0 }];
          }
          if (query.includes("AND id <= 2")) {
            return [{ amount: 0 }];
          }
          if (query.includes("AND id <= 3")) {
            return [{ amount: 100 }];
          }
        }
        return [];
      });

      await updateBalance(mockTenantID);

      expect(executeQuery).toHaveBeenNthCalledWith(1, expect.stringContaining("SELECT id, type, date, amount, description, balance FROM paymentsLedger WHERE tenantID=" + mockTenantIDHex));
      expect(executeQuery).toHaveBeenNthCalledWith(2, expect.stringContaining("SELECT sum(amount) as amount from paymentsLedger where type='Charge' AND tenantID=" + mockTenantIDHex + " AND id <= 1"));
      expect(executeQuery).toHaveBeenNthCalledWith(3, expect.stringContaining("SELECT sum(amount) as amount from paymentsLedger where type='Payment' AND tenantID=" + mockTenantIDHex + " AND id <= 1"));
      expect(executeQuery).toHaveBeenNthCalledWith(4, expect.stringContaining("SELECT sum(amount) as amount from paymentsLedger where type='Credit' AND tenantID=" + mockTenantIDHex + " AND id <= 1"));
      expect(executeQuery).toHaveBeenNthCalledWith(5, expect.stringContaining("Update paymentsLedger set balance=500 where id=1"));
      expect(executeQuery).toHaveBeenNthCalledWith(6, expect.stringContaining("SELECT sum(amount) as amount from paymentsLedger where type='Charge' AND tenantID=" + mockTenantIDHex + " AND id <= 2"));
      expect(executeQuery).toHaveBeenNthCalledWith(7, expect.stringContaining("SELECT sum(amount) as amount from paymentsLedger where type='Payment' AND tenantID=" + mockTenantIDHex + " AND id <= 2"));
      expect(executeQuery).toHaveBeenNthCalledWith(8, expect.stringContaining("SELECT sum(amount) as amount from paymentsLedger where type='Credit' AND tenantID=" + mockTenantIDHex + " AND id <= 2"));
      expect(executeQuery).toHaveBeenNthCalledWith(9, expect.stringContaining("Update paymentsLedger set balance=300 where id=2"));
      expect(executeQuery).toHaveBeenNthCalledWith(10, expect.stringContaining("SELECT sum(amount) as amount from paymentsLedger where type='Charge' AND tenantID=" + mockTenantIDHex + " AND id <= 3"));
      expect(executeQuery).toHaveBeenNthCalledWith(11, expect.stringContaining("SELECT sum(amount) as amount from paymentsLedger where type='Payment' AND tenantID=" + mockTenantIDHex + " AND id <= 3"));
      expect(executeQuery).toHaveBeenNthCalledWith(12, expect.stringContaining("SELECT sum(amount) as amount from paymentsLedger where type='Credit' AND tenantID=" + mockTenantIDHex + " AND id <= 3"));
      expect(executeQuery).toHaveBeenNthCalledWith(13, expect.stringContaining("Update paymentsLedger set balance=200 where id=3"));
    });
  });
});
