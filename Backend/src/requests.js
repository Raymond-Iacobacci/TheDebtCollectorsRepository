const express = require('express');
const requestsRouter = express.Router();
const multer = require('multer');
const { executeQuery, uuidToString } = require('./db');

requestsRouter.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function getDate() {
  const moment = require("moment-timezone");
  return moment().tz("America/Los_Angeles").format("YYYY-MM-DD");
}

requestsRouter.get('/get-manager-view', async (req, res) => {
  try {
    const managerID = '0x' + req.query['manager-id'];
    const query = `SELECT r.requestID, CONCAT(t.firstname, ' ', t.lastname) AS name, t.address, r.type, r.status, r.date FROM requests 
    AS r JOIN tenants AS t ON r.tenantID = t.tenantID WHERE r.managerID = ${managerID} ORDER BY r.date;`;
    const requestResults = await executeQuery(query);

    if (!requestResults) {
      res.send('No requests for this managerID').end();
      return;
    }

    for(let request of requestResults){
      request.requestID = request.requestID.toString('hex').toUpperCase();
    }

    res.send(requestResults).end();
  } catch (error) {
    res.status(500).json({ error: `ERROR LOADING MANAGER VIEW: ERROR ${error}` }).end();
  }
});

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

requestsRouter.get('/specifics/header-info', async (req, res) => {
  try {
    const requestID = '0x' + req.query['request-id'];
    const query = `SELECT r.type, CONCAT(t.firstname, ' ', t.lastname) AS tenant, t.address, r.description, r.status FROM requests 
    AS r JOIN tenants AS t ON r.tenantID = t.tenantID WHERE r.requestID = ${requestID};`
    const requestInfo = await executeQuery(query);

    if (!requestInfo) {
      res.status(404).json({ error: 'requestID not found in requests table' });
      return;
    }

    res.send(requestInfo[0]).end();
  } catch (error) {
    res.status(500).json({ error: `HEADER-INFO ERROR: ${error}` }).end();
  }
});

requestsRouter.get('/specifics/comments', async (req, res) => {
  try {
    const requestID = '0x' + req.query['request-id'];
    const commentResults = await executeQuery(`SELECT commentID, userID, comment, date FROM comments WHERE requestID = ${requestID} ORDER BY date;`);

    if (commentResults.length === 0) {
      res.send([]).end();
      return;
    }
    
    for(let commentEntry of commentResults){
      const userResults = await executeQuery(`SELECT firstName, lastName FROM tenants WHERE tenantID = ${uuidToString(commentEntry.userID)};`);
      let user = userResults[0];
      if(!user){
        const userResults = await executeQuery(`SELECT firstName, lastName FROM managers WHERE managerID = ${uuidToString(commentEntry.userID)};`);
        user = userResults[0];
        if(!user){
          res.status(404).json({ error: 'No user found with this userID' });
        }
      }
      commentEntry.commentID = commentEntry.commentID.toString('hex').toUpperCase();
      commentEntry.user = user.firstName + ' ' + user.lastName;
      delete commentEntry.userID;
    }
    res.send(commentResults).end();
  } catch (error) {
    res.status(500).json({ error: `COMMENTS ERROR: ${error}` }).end();
  }
});

requestsRouter.post('/specifics/new-comment', async (req, res) => {
  try {
    const requestID = Buffer.from(req.query['request-id'], 'hex');
    const userID = Buffer.from(req.body.userID, 'hex');
    const comment = req.body.comment;
    const date = getDate();
    const query = 'INSERT INTO comments (requestID, date, comment, userID) VALUES (?, ?, ?, ?)';
    const values = [requestID, date, comment, userID];
    const results = await executeQuery(query, values);
    res.send(results);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting into table' });
  }
});

requestsRouter.post('/new', upload.single('attachment'), async (req, res) => {
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

requestsRouter.put('/specifics/change-status', async (req, res) => {
  try {
    const requestID = '0x' + req.query['request-id'];
    const newStatusString = req.body.status;
    const results = await executeQuery(`UPDATE requests SET status = '${newStatusString}' WHERE requestID = ${requestID};`);
    res.send(results);
  } catch (error) {
    res.status(500).json({ error: 'Error updating status'});
  }
});

requestsRouter.get('/specifics/attachments', async (req, res) => { 
  try {
    const requestID = '0x' + req.query['request-id'];
    const attachments = await executeQuery(`SELECT title, description, date, attachment FROM attachments where requestID = ${requestID} ORDER BY date;`);
    for(let attachmentObject of attachments){
      attachmentObject.attachment = attachmentObject.attachment.toString('base64');
    }
    res.send(attachments);
  } catch (error) {
    res.status(500).json({ error: 'There are no attachments given this requestID' });
  }
});

requestsRouter.post('/delete-request', async (req, res) => { 
  try {
    const requestID = '0x' + req.query['request-id'];
    await executeQuery(`DELETE FROM attachments where requestID = ${requestID}`);
    await executeQuery(`DELETE FROM comments where requestID = ${requestID}`);
    await executeQuery(`DELETE FROM requests where requestID = ${requestID}`);
    res.send(200);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting request' });
  }
});

module.exports = requestsRouter;