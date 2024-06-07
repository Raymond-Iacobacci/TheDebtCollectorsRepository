const request = require('supertest');
const express = require('express');
const announcementsRouter = require('../../src/manager/announcements');

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn(),
  getDate: jest.fn()
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
    jest.clearAllMocks(); 
  });

  test('GET /announcements/get-announcements should return all announcements for a given manager', async () => {
    const { executeQuery } = require('../../src/utils');
    executeQuery.mockResolvedValueOnce(mockAnnouncements.filter(announcement => announcement.managerID === parseInt(mockManagerID, 10)));
    const response = await request(app).get(`/announcements/get-announcements?manager-id=${mockManagerID}`);
    expect(response.body).toEqual(mockAnnouncements.filter(announcement => announcement.managerID === parseInt(mockManagerID, 10)));
  });

  test('POST /announcements/make-announcement should add a new announcement', async () => {
    const { executeQuery, getDate } = require('../../src/utils');
    const title = 'New Announcement';
    const description = 'New Announcement Description';
    const date = '2024-06-04';

    executeQuery.mockResolvedValueOnce();
    getDate.mockReturnValueOnce(date);

    const response = await request(app)
      .post(`/announcements/make-announcement?manager-id=${mockManagerID}`)
      .send({ title, description });

    expect(response.status).toBe(200);

    const query = `INSERT INTO announcements (title, description, managerID, date) values (?,?,?,?);`;
    const values = [title, description, Buffer.from(mockManagerID, 'hex'), date];
    expect(executeQuery).toHaveBeenCalledWith(query, values);
  });

  test('POST /announcements/delete-announcement should delete an announcement', async () => {
    const announcementIDToDelete = 1;
    const { executeQuery } = require('../../src/utils');

    executeQuery.mockResolvedValueOnce();
    const response = await request(app).post(`/announcements/delete-announcement?announcement-id=${announcementIDToDelete}`);
    expect(response.status).toBe(200);

    const query = `DELETE FROM announcements where announcementID = ${announcementIDToDelete}`;
    expect(executeQuery).toHaveBeenCalledWith(query);
  });
});