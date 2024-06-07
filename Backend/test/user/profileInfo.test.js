const request = require('supertest');
const express = require('express');
const profileInfoRouter = require('../../src/user/profileInfo');
const { executeQuery, getUserType } = require('../../src/utils');

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn(),
  getUserType: jest.fn(),
}));

const app = express();
app.use('/profile-info', profileInfoRouter);

describe('Profile Info API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /profile-info/get-attributes should return user attributes for a given user ID', async () => {
    const userId = 'abc123';
    const mockUserType = 'manager';
    const mockUser = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };

    getUserType.mockResolvedValueOnce(mockUserType);
    executeQuery.mockResolvedValueOnce([mockUser]);
    const response = await request(app).get(`/profile-info/get-attributes?user-id=${userId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  test('GET /profile-info/get-attributes should handle user not found', async () => {
    const userId = 'abc123';
    getUserType.mockResolvedValueOnce(null);
    const response = await request(app).get(`/profile-info/get-attributes?user-id=${userId}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ err: 'User not found.' });
  });
});
