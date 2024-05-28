const express = require('express');
const requestsRouter = express.Router();
const multer = require('multer');
const { executeQuery, uuidToString, getDate } = require('../utils');

requestsRouter.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

requestsRouter.get('/get-tenant-view', async (req, res) => {
  try {
    const tenantID = '0x' + req.query['tenant-id'];
    const requestResults = await executeQuery(`SELECT requestID, description, type, status, date FROM requests WHERE tenantID = ${tenantID};`);
    
    if(!requestResults){
      res.send('no requests for this tenantID');
      return;
    }

    for(let request of requestResults){
        request.requestID = request.requestID.toString('hex').toUpperCase();
    }

    res.send(requestResults).end();
  } catch (error) {
    res.status(500).json({ error: `ERROR LOADING TENANT VIEW: ERROR ${error}` });
  }
});

requestsRouter.post('/new-request', upload.single('attachment'), async (req, res) => {
  try {
    const tenantID = req.query['tenant-id'];
    const description = req.body.description;
    const type = req.body.type;
    const status = 'Unresolved';
    const date = getDate();
    const managerResult = await executeQuery(`SELECT managerID FROM tenants where tenantID = ${'0x' + tenantID};`);

    if (!managerResult) {
      res.status(404).json({ error: 'managerID not found in managers table' });
      return;
    }

    const managerID = managerResult[0].managerID;

    const query = 'INSERT INTO requests (description, tenantID, managerID, status, date, type) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [description, Buffer.from(tenantID, 'hex'), Buffer.from(managerID, 'hex'), status, date, type];
    await executeQuery(query, values);

    const results = await executeQuery(`SELECT requestID FROM requests ORDER BY id DESC LIMIT 1;`);
    const requestIDObject = results[0];

    if (!requestIDObject) {
      res.status(404).json({ error: 'requestID not found in requests table.' });
      return;
    }

    const requestID = '0x' + requestIDObject.requestID.toString('hex').toUpperCase();
    const attachmentFile = req.file.buffer; 
    const attachmentsQuery = 'INSERT INTO attachments (title, description, attachment, requestID, date) VALUES (?, ?, ?, ?, ?)';
    const attachmentsValues= [type, description, attachmentFile, requestIDObject.requestID, date];
    await executeQuery(attachmentsQuery, attachmentsValues);
    res.send(requestID);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting into table' });
  }
});

module.exports = requestsRouter;