const request = require('supertest');
const express = require('express');
const requestsRouter = require('../../src/manager/requests');
const { executeQuery } = require('../../src/utils');

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn(),
}));

const app = express();
app.use('/requests', requestsRouter);

describe('Requests API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /requests/get-view should return requests for a given manager ID', async () => {
    const managerId = 'abc123';
    const mockRequests = [
      { requestID: 'REQUEST123', name: 'John Doe', address: '123 Main St', type: 'Maintenance', status: 'Pending', date: new Date('2024-06-01') },
      { requestID: 'REQUEST246', name: 'Jane Smith', address: '456 Elm St', type: 'Repair', status: 'Completed', date: new Date('2024-06-02') },
    ];

    executeQuery.mockResolvedValueOnce(mockRequests);
    const response = await request(app).get(`/requests/get-view?manager-id=${managerId}`);
    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual([
      { requestID: 'REQUEST123', name: 'John Doe', address: '123 Main St', type: 'Maintenance', status: 'Pending', date: '2024-06-01T00:00:00.000Z' },
      { requestID: 'REQUEST246', name: 'Jane Smith', address: '456 Elm St', type: 'Repair', status: 'Completed', date: '2024-06-02T00:00:00.000Z' },
    ]);
  });

  test('GET /requests/get-view should provide no requests for an invalid managerID', async () => {
    const managerId = 'abc123';
    executeQuery.mockResolvedValueOnce(null);
    const response = await request(app).get(`/requests/get-view?manager-id=${managerId}`);
    expect(response.text).toBe('No requests for this managerID');
  });
});
