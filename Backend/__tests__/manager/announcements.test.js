const request = require('supertest');
const express = require('express');
const announcementsRouter = require('../../src/manager/announcements');
const { executeQuery, getDate } = require('../../src/utils');

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn(),
  getDate: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/announcements', announcementsRouter);

describe('Announcements Router', () => {

    it('GET/manager/announcemnts/get-announcement should return all announcements for a given managerID', async () => {
      const mockAnnouncements = [
        { announcementID: 1, title: 'Title1', description: 'Description1', date: '2023-01-01' },
        { announcementID: 2, title: 'Title2', description: 'Description2', date: '2023-01-02' },
      ];
      executeQuery.mockResolvedValue(mockAnnouncements);

      const res = await request(app).get('/announcements/get-announcements?manager-id=1234');
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockAnnouncements);
      expect(executeQuery).toHaveBeenCalledWith(
        `SELECT announcementID, title, description, date FROM announcements where managerID = 0x1234;`
      );
    });

    it('POST/manager/announcements/make-announcement should insert a new announcement and return a 200 status code', async () => {
      getDate.mockReturnValue('2023-01-01');
      executeQuery.mockResolvedValue();

      const res = await request(app)
        .post('/announcements/make-announcement?manager-id=1234')
        .send({ title: 'Title1', description: 'Description1' });

      expect(res.status).toBe(200);
      expect(executeQuery).toHaveBeenCalledWith(
        `INSERT INTO announcements (title, description, managerID, date) values (?,?,?,?);`,
        ['Title1', 'Description1', Buffer.from('1234', 'hex'), '2023-01-01']
      );
    });

    it('POST/manager/announcements/delete-announcemnt should delete an announcement and return a 200 status code', async () => {
      executeQuery.mockResolvedValue();

      const res = await request(app)
        .post('/announcements/delete-announcement?announcement-id=1');

      expect(res.status).toBe(200);
      expect(executeQuery).toHaveBeenCalledWith(
        `DELETE FROM announcements where announcementID = 1`
      );
    });
  });
