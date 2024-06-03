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
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockReportData);
  });

  test('GET /report/get-report with quarterly schedule should return quarterly report data', async () => {
    const managerId = 'abc123'; 
    const mockReportData = [
      { income_rent: 3000, income_utilities: 1500, income_other: 600, expenses_other: 900, expenses_maintenance: 450, expenses_wages: 2400, expenses_mortgage: 3600, expenses_utilities: 1200, credits: 900 },
      { income_rent: 3300, income_utilities: 1800, income_other: 750, expenses_other: 960, expenses_maintenance: 540, expenses_wages: 2700, expenses_mortgage: 3900, expenses_utilities: 1350, credits: 960 }
    ];
    executeQuery.mockResolvedValueOnce(mockReportData);

    const response = await request(app).get(`/report/get-report?manager-id=${managerId}&schedule=quarterly`);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockReportData);
  });

  test('GET /report/get-report with yearly schedule should return yearly report data', async () => {
    const managerId = 'abc123'; 
    const mockReportData = [
      { income_rent: 12000, income_utilities: 6000, income_other: 2400, expenses_other: 3600, expenses_maintenance: 1800, expenses_wages: 9600, expenses_mortgage: 14400, expenses_utilities: 4800, credits: 3600 }
    ];
    executeQuery.mockResolvedValueOnce(mockReportData);

    const response = await request(app).get(`/report/get-report?manager-id=${managerId}&schedule=yearly`);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockReportData);
  });
});
