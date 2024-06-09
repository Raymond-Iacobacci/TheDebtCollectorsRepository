const request = require('supertest');
const express = require('express');
const cookiesRouter = require('../../src/user/cookies'); 
const { executeQuery, getUserType } = require('../../src/utils'); 

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn(),
  getUserType: jest.fn(),
}));

const app = express();
app.use('/', cookiesRouter);

describe('Cookies API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('PUT /login-tenant should update tenant token and return UUID', async () => {
    executeQuery.mockResolvedValueOnce([{ tenantID: 'ABC123' }]);
    getUserType.mockResolvedValueOnce('tenant');

    const response = await request(app)
      .put('/login-tenant?email=test@example.com')
      .send({ token: 'testToken' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ uuid: 'ABC123' });
  });

  test('PUT /login-manager should update manager token and return UUID', async () => {
    executeQuery.mockResolvedValueOnce([{ managerID: 'DEF456' }]);
    getUserType.mockResolvedValueOnce('manager');

    const response = await request(app)
      .put('/login-manager?email=test@example.com')
      .send({ token: 'testToken' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ uuid: 'DEF456' });
  });

  test('GET /verify-cookie should verify cookie token', async () => {
    getUserType.mockResolvedValueOnce('tenant');
    executeQuery.mockResolvedValueOnce([{ token: 'testToken' }]);

    const response = await request(app)
      .get('/verify-cookie?user-id=abc123&token=testToken');

    expect(response.status).toBe(200);
  });

  test('PUT /remove-cookie should remove user token', async () => {
    getUserType.mockResolvedValueOnce('manager');
    executeQuery.mockResolvedValueOnce();

    const response = await request(app)
      .put('/remove-cookie?user-id=def456');

    expect(response.status).toBe(200);
  });

});