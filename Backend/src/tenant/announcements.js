const express = require('express');
const announcementsRouter = express.Router();
const { executeQuery } = require('../utils');

announcementsRouter.use(express.json());

announcementsRouter.get('/get-announcements', async (req, res) => {
  try {
    const tenantID = '0x' + req.query['tenant-id'];
    const query = `SELECT a.title, a.description, a.date FROM announcements a JOIN tenants t ON a.managerID = t.managerID WHERE t.tenantID = ${tenantID};`;
    const announcements = await executeQuery(query);
    res.send(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message});
  }
});

module.exports = announcementsRouter;