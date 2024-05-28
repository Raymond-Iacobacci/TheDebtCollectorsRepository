const express = require('express');
const announcementsRouter = express.Router();
const { executeQuery, getDate } = require('../utils');

announcementsRouter.use(express.json());

announcementsRouter.get('/get-announcements', async (req, res) => {
  try {
    const managerID = '0x' + req.query['manager-id'];
    const query = `SELECT title, description, date FROM announcements where managerID = ${managerID};`;
    const announcements = await executeQuery(query);
    res.send(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

module.exports = announcementsRouter;