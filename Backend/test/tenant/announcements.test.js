const request = require('supertest');
const express = require('express');
const announcementsRouter = require('../../src/manager/announcements');

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn(),
  getDate: jest.fn() // If getDate is used in your routes, otherwise remove this
}));

const app = express();
app.use(express.json());
app.use('/announcements', announcementsRouter);

describe('Announcements API routes', () => {
  const mockManagerID = '12345';
  const mockAnnouncements = [
    { managerID: 12345, announcementID: 1, title: 'Announcement 1', description: 'Description 1', date: '2024-06-01' },
    { managerID: 12345, announcementID: 2, title: 'Announcement 2', description: 'Description 2', date: '2024-06-02' },
    { managerID: 67890, announcementID: 3, title: 'Announcement 3', description: 'Description 3', date: '2024-06-03' } 
  ];

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('GET /announcements/get-announcements should return all announcements for a given manager', async () => {
    const { executeQuery } = require('../../src/utils');
    executeQuery.mockResolvedValueOnce(mockAnnouncements.filter(announcement => announcement.managerID === parseInt(mockManagerID, 10)));
    const response = await request(app).get(`/announcements/get-announcements?manager-id=${mockManagerID}`);
    expect(response.body).toEqual(mockAnnouncements.filter(announcement => announcement.managerID === parseInt(mockManagerID, 10)));
  });

});