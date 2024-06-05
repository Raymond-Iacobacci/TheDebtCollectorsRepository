const express = require('express');
const announcementsRouter = express.Router();
const { executeQuery, getDate } = require('../utils');

announcementsRouter.use(express.json());

/* 
   Description: Given a managerID, return all announcements made by the manager from the database
   input: manager-id (binary(16))
   output: array of announcements [{title (string), description (string), managerID (binary16), date (date)}]
*/
announcementsRouter.get('/get-announcements', async (req, res) => {
  try {
    const managerID = '0x' + req.query['manager-id'];
    const query = `SELECT announcementID, title, description, date FROM announcements where managerID = ${managerID};`;
    const announcements = await executeQuery(query);
    res.send(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 
   Description: Given a managerID, post an announcement to the SQL database
   input: manager-id (binary(16))
   output: status code
*/
announcementsRouter.post('/make-announcement', async (req, res) => {
  try {
    const managerID = Buffer.from(req.query['manager-id'], 'hex')
    const title = req.body['title'];
    const description = req.body['description'];
    const date = getDate();
    const query = `INSERT INTO announcements (title, description, managerID, date) values (?,?,?,?);`;
    const values = [title, description, managerID, date];
    await executeQuery(query, values);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 
   Description: Given an announcementID, delete an announcement from the database
   input: announcementID (int)
   output: status code  
*/
announcementsRouter.post('/delete-announcement', async (req, res) => {
  try {
    const announcementID = req.query['announcement-id'];
    const query = `DELETE FROM announcements where announcementID = ${announcementID}`;
    await executeQuery(query);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = announcementsRouter;