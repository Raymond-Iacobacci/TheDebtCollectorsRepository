const request = require('supertest');
const express = require('express');
const dashBoardRouter = require('../../src/manager/dashboard'); 
const app = express();
app.use('/dashboard', dashBoardRouter);

const { executeQuery } = require('../../src/utils');
jest.mock('../../src/utils')

describe('Dashboard API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /dashboard/get-number-of-tenants should return the number of tenants under the manager', async () => {
    executeQuery.mockResolvedValueOnce([{ numberOfTenants: 5 }]);
    const managerId = 'abc123'; 
    const response = await request(app).get(`/dashboard/get-number-of-tenants?manager-id=${managerId}`);
    expect(response.body).toEqual({ numberOfTenants: 5 });
  });

  test('GET /dashboard/get-number-of-unresolved-requests should return the number of unresolved requests', async () => {
    executeQuery.mockResolvedValueOnce([{ count: 3 }]); 
    const managerId = 'abc123'; 
    const response = await request(app).get(`/dashboard/get-number-of-unresolved-requests?manager-id=${managerId}`);
    expect(response.body).toEqual({ count: 3 });
  });

  test('GET /dashboard/get-number-of-rent-payments should return the number of rent payments paid this month', async () => {
    executeQuery.mockResolvedValueOnce([{ count: 5 }]); 
    const managerId = 'abc123'; 
    const response = await request(app).get(`/dashboard/get-number-of-rent-payments?manager-id=${managerId}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ count: 5 });
  });

  test('GET /dashboard/get-total-balance should return the total balance of all tenants', async () => {
    const mockManagerID = '1234567890abcdef';

    const mockChargeBalance = [{ amount: '1000' }];
    const mockPaymentBalance = [{ amount: '300' }];
    const mockCreditBalance = [{ amount: '200' }];

    executeQuery
      .mockResolvedValueOnce(mockChargeBalance)
      .mockResolvedValueOnce(mockPaymentBalance)
      .mockResolvedValueOnce(mockCreditBalance);

    const response = await request(app).get('/dashboard/get-total-balance').query({ 'manager-id': mockManagerID });
    const expectedBalance = Number(mockChargeBalance[0].amount) - Number(mockPaymentBalance[0].amount) - Number(mockCreditBalance[0].amount);
    expect(response.body).toEqual({ balance: expectedBalance });
  });

  it('should return the outstanding balances for tenants under a given manager-id', async () => {
    const mockManagerID = '1234567890abcdef';

    const mockTenantsList = [
      { tenantID: Buffer.from('1', 'hex'), firstName: 'John', lastName: 'Doe' },
      { tenantID: Buffer.from('2', 'hex'), firstName: 'Jane', lastName: 'Smith' },
    ];

    const mockChargeBalances = [
      [{ amount: '500' }],
      [{ amount: '600' }]
    ];
    const mockPaymentBalances = [
      [{ amount: '200' }],
      [{ amount: '150' }]
    ];
    const mockCreditBalances = [
      [{ amount: '50' }],
      [{ amount: '100' }]
    ];

    executeQuery
      .mockResolvedValueOnce(mockTenantsList)
      .mockResolvedValueOnce(mockChargeBalances[0])
      .mockResolvedValueOnce(mockPaymentBalances[0])
      .mockResolvedValueOnce(mockCreditBalances[0])
      .mockResolvedValueOnce(mockChargeBalances[1])
      .mockResolvedValueOnce(mockPaymentBalances[1])
      .mockResolvedValueOnce(mockCreditBalances[1]);

    const response = await request(app).get('/dashboard/get-outstanding-balances-per-tenant').query({ 'manager-id': mockManagerID });

    const expectedBalances = [
      {
        firstName: 'Jane',
        lastName: 'Smith',
        balance: 350, 
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        balance: 250,
      }
    ];
    response.body.forEach((item, index) => {
      expect(item.firstName).toBe(expectedBalances[index].firstName);
      expect(item.lastName).toBe(expectedBalances[index].lastName);
      expect(item.balance).toBe(expectedBalances[index].balance);
    });
  });

});