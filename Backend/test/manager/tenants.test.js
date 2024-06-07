const request = require('supertest');
const express = require('express');
const tenantsRouter = require('../../src/manager/tenants'); 
const { executeQuery } = require('../../src/utils'); 

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn(),
}));

const app = express();
app.use('/tenants', tenantsRouter);

describe('Tenants API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // test('POST /tenants/create-tenant should insert a tenant into the database', async () => {
  //   executeQuery.mockResolvedValueOnce([{ count: 2 }]);

  //   const response = await request(app)
  //     .post('/tenants/create-tenant')
  //     .send({
  //       firstName: 'John',
  //       lastName: 'Doe',
  //       email: 'john@example.com',
  //       address: '123 Main St',
  //       monthlyRent: 1000,
  //       monthlyUtilities: 200,
  //     })
  //     .query({
  //       'manager-id': 'abc123',
  //     });

  //   expect(response.statusCode).toBe(200);

  //   executeQuery.mockResolvedValueOnce([{ count: 3 }]);

  //   const getResponse = await request(app).get('/tenants/get-tenants?manager-id=abc123');
  //   expect(getResponse.statusCode).toBe(200);
  //   expect(getResponse.body.length).toBe(3); 
  // });

  test('GET /tenants/get-tenants should return all tenants under the manager', async () => {
    const mockManagerID = 'abc123';
    const mockTenants = [
      { firstName: 'John', lastName: 'Doe', email: 'johndoe@gmail.com', address: '123 Main St', tenantID: '1' },
      { firstName: 'Jane', lastName: 'Smith', email: 'janesmith@gmail.com', address: '456 Elm St', tenantID: '2' }
    ];
    const formattedMockTenants = mockTenants.map(tenant => ({
      ...tenant,
      tenantID: tenant.tenantID.toUpperCase()
    }));

    executeQuery.mockResolvedValueOnce(mockTenants);
    const response = await request(app).get(`/tenants/get-tenants?manager-id=${mockManagerID}`);
    expect(response.body).toEqual(formattedMockTenants);
  });
});
