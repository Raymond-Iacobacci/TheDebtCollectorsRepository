const request = require('supertest');
const express = require('express');
const announcementsRouter = require('../../src/tenant/announcements');
const { executeQuery } = require('../../src/utils');

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn(),
  getDate: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/announcements', announcementsRouter);

describe('Announcements API routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /announcements/get-announcements should return all announcements for a given tenant', async () => {
    const mockTenantID = 'abc123';
    const mockAnnouncements = [
      { title: 'Announcement 1', description: 'Description 1', date: '2024-06-01' },
      { title: 'Announcement 2', description: 'Description 2', date: '2024-06-02' }
    ];
    executeQuery.mockResolvedValueOnce(mockAnnouncements);

    const response = await request(app).get(`/announcements/get-announcements?tenant-id=${mockTenantID}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockAnnouncements);
  });
});