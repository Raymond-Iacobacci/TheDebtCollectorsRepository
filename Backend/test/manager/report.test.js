const request = require('supertest');
const express = require('express');
const reportRouter = require('../../src/manager/report');
const { executeQuery } = require('../../src/utils');

// Mock the executeQuery function
jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn()
}));

const app = express();
app.use('/reports', reportRouter);

describe('GET /reports/get-report', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return report data for monthly schedule', async () => {
    executeQuery.mockImplementation((query) => {
      if (query.includes("SUM(amount) AS amount")) {
        return [{ amount: 100 }];
      }
      return [];
    });

    const response = await request(app)
      .get('/reports/get-report')
      .query({ 'manager-id': '1', schedule: 'monthly' });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(12); // 12 months
    response.body.forEach((report) => {
      expect(report).toHaveProperty('income_rent', 100);
      expect(report).toHaveProperty('income_utilities', 100);
      expect(report).toHaveProperty('income_other', 100);
      expect(report).toHaveProperty('expenses_other', 100);
      expect(report).toHaveProperty('expenses_maintenance', 100);
      expect(report).toHaveProperty('expenses_wages', 100);
      expect(report).toHaveProperty('expenses_mortgage', 100);
      expect(report).toHaveProperty('expenses_utilities', 100);
      expect(report).toHaveProperty('credits', 100);
    });
  });

  test('should handle errors gracefully', async () => {
    executeQuery.mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .get('/reports/get-report')
      .query({ 'manager-id': '1', schedule: 'monthly' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Database error');
  });
});
