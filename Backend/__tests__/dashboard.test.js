const request = require('supertest');
const express = require('express');
const dashBoardRouter = require('../src/dashboard'); 
const app = express();
app.use('/dashboard', dashBoardRouter);

const { executeQuery } = require('../src/utils');
jest.mock('../src/utils', () => ({
  executeQuery: jest.fn(),
}));

describe('Dashboard API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /dashboard/get-number-of-tenants should return the number of tenants under the manager', async () => {
    executeQuery.mockResolvedValueOnce([{ numberOfTenants: 5 }]);
    
    const managerId = 'abc123'; 
    const response = await request(app).get(`/dashboard/get-number-of-tenants?manager-id=${managerId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ numberOfTenants: 5 });
    expect(executeQuery).toHaveBeenCalledWith(`SELECT COUNT(*) AS numberOfTenants FROM tenants WHERE managerID = 0x${managerId};`);
  });

  test('GET /dashboard/get-number-of-unresolved-requests should return the number of unresolved requests', async () => {
    executeQuery.mockResolvedValueOnce([{ count: 3 }]); 
    const managerId = 'abc123'; 
    const response = await request(app).get(`/dashboard/get-number-of-unresolved-requests?manager-id=${managerId}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ count: 3 });
    expect(executeQuery).toHaveBeenCalledWith(`select count(*) AS count from requests where managerID=0x${managerId} and status='Unresolved' OR status='Ongoing'`);
  });

  test('GET /dashboard/get-number-of-rent-payments should return the number of rent payments paid this month', async () => {
    executeQuery.mockResolvedValueOnce([{ count: 5 }]); 
    const managerId = 'abc123'; 
    const response = await request(app).get(`/dashboard/get-number-of-rent-payments?manager-id=${managerId}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ count: 5 });
  });

  /* THESE TESTS ARE FAILING */ 

  test('GET /dashboard/get-total-balance should return the total balance of all tenants', async () => {
    executeQuery.mockResolvedValueOnce([{ balance: 1000 }]); 
    const managerId = 'abc123'; 
    const response = await request(app).get(`/dashboard/get-total-balance?manager-id=${managerId}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ balance: 1000 });
  });

  test('GET /dashboard/get-outstanding-balances-per-tenant should return a list of tenants with the top 5 most outstanding balances', async () => {
    executeQuery.mockResolvedValueOnce([{ firstName: 'John', lastName: 'Doe', tenantID: '1', balance: 500 }]); 
    const managerId = 'abc123'; 
    const response = await request(app).get(`/dashboard/get-outstanding-balances-per-tenant?manager-id=${managerId}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ firstName: 'John', lastName: 'Doe', tenantID: '1', balance: 500 }]);
  });
});