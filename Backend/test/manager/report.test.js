const request = require('supertest');
const express = require('express');
const reportRouter = require('../../src/manager/report');
const { executeQuery } = require('../../src/utils');

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn(),
}));

const app = express();
app.use('/report', reportRouter);

describe('Report API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /report/get-report with monthly schedule should return monthly report data', async () => {
    const managerId = 'abc123'; 
    const mockReportData = [
      { income_rent: 1000, income_utilities: 500, income_other: 200, expenses_other: 300, expenses_maintenance: 150, expenses_wages: 800, expenses_mortgage: 1200, expenses_utilities: 400, credits: 300 },
      { income_rent: 1100, income_utilities: 600, income_other: 250, expenses_other: 320, expenses_maintenance: 180, expenses_wages: 900, expenses_mortgage: 1300, expenses_utilities: 450, credits: 320 }
    ];
    executeQuery.mockResolvedValueOnce(mockReportData);
    const response = await request(app).get(`/report/get-report?manager-id=${managerId}&schedule=monthly`);
    console.log(response.body)
    expect(response.body).toEqual(mockReportData);
  });
});
