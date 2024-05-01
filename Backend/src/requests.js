const express = require('express');
const requestsRouter = express.Router();
const multer = require('multer');
const { selectQuery, insertQuery, uuidToString } = require('./db');

requestsRouter.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function getDate(){
  const date = new Date();
  return date.toISOString();
}

requestsRouter.get('/get-manager-view', async (req, res) => {
  try {
    const managerID = '0x' + req.query['manager-id'];
    const query = `SELECT r.requestID, CONCAT(t.firstname, ' ', t.lastname) AS name, t.address, r.type, r.status FROM requests 
    AS r JOIN tenants AS t ON r.tenantID = t.tenantID WHERE r.managerID = ${managerID} ORDER BY r.dateRequested;`;
    const requestResults = await selectQuery(query);

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
    const requestResults = await selectQuery(`SELECT requestID, description, type, status, dateRequested FROM requests WHERE tenantID = ${tenantID};`);
    
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
    const requestInfo = await selectQuery(query);

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
    const commentResults = await selectQuery(`SELECT commentID, userID, comment, datePosted FROM comments WHERE requestID = ${requestID} ORDER BY datePosted;`);

    if (commentResults.length === 0) {
      res.send([]).end();
      return;
    }
    
    for(let commentEntry of commentResults){
      const userResults = await selectQuery(`SELECT firstName, lastName FROM tenants WHERE tenantID = ${uuidToString(commentEntry.userID)};`);
      let user = userResults[0];
      if(!user){
        const userResults = await selectQuery(`SELECT firstName, lastName FROM managers WHERE managerID = ${uuidToString(commentEntry.userID)};`);
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
    const datePosted = getDate();
    const query = 'INSERT INTO comments (requestID, datePosted, comment, userID) VALUES (?, ?, ?, ?)';
    const values = [requestID, datePosted, comment, userID];
    const results = await insertQuery(query, values);
    res.send(results);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting into table' });
  }
});

requestsRouter.post('/specifics/new-attachment', upload.single('attachment'), async (req, res) => { 
  try {
    const requestID = Buffer.from(req.query['request-id'], 'hex');
    const title = req.body.title;
    const description = req.body.description;
    const attachmentFile = req.file.buffer; 
    const datePosted = getDate();
    const query = 'INSERT INTO attachments (title, description, attachment, requestID, datePosted) VALUES (?, ?, ?, ?, ?)';
    const values = [title, description, attachmentFile, requestID, datePosted];
    const results = await insertQuery(query, values);
    res.send(results);
  } catch (error) {
    console.error('Error adding attachment:', error);
    res.status(500).json({ error: 'Error adding attachment' });
  }
});

requestsRouter.post('/new', upload.single('attachment'), async (req, res) => {
  try {
    const tenantID = req.query['tenant-id'];
    const description = req.body.description;
    const type = req.body.type;
    const status = 'Unresolved';
    const dateRequested = getDate();
    const managerResult = await selectQuery(`SELECT managerID FROM tenants where tenantID = ${'0x' + tenantID};`);

    if (!managerResult) {
      res.status(404).json({ error: 'managerID not found in managers table' });
      return;
    }

    const managerID = managerResult[0].managerID;

    const query = 'INSERT INTO requests (description, tenantID, managerID, status, dateRequested, type) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [description, Buffer.from(tenantID, 'hex'), Buffer.from(managerID, 'hex'), status, dateRequested, type];
    await insertQuery(query, values);

    const results = await selectQuery(`SELECT requestID FROM requests where tenantID = ${'0x' + tenantID} AND dateRequested = '${dateRequested}';`);
    const requestIDObject = results[0];

    if (!requestIDObject) {
      res.status(404).json({ error: 'requestID not found in requests table.' });
      return;
    }

    const requestID = uuidToString(requestIDObject.requestID);
    const attachmentFile = req.file.buffer; 
    const datePosted = getDate();
    const thisSTring = 'INSERT INTO attachments (title, description, attachment, requestID, datePosted) VALUES (?, ?, ?, ?, ?)';
    const thesevalues= [type, description, attachmentFile, requestIDObject.requestID, datePosted];
    const attachmentResults = await insertQuery(thisSTring, thesevalues);
    res.send(requestID);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting into table' });
  }
});

requestsRouter.put('/specifics/change-status', async (req, res) => {
  try {
    const requestID = '0x' + req.query['request-id'];
    const newStatusString = req.body.status;
    const results = await selectQuery(`UPDATE requests SET status = '${newStatusString}' WHERE requestID = ${requestID};`);
    res.send(results);
  } catch (error) {
    res.status(500).json({ error: 'Error updating status'});
  }
});

requestsRouter.get('/specifics/attachments', async (req, res) => { 
  try {
    const requestID = '0x' + req.query['request-id'];
    const attachments = await selectQuery(`SELECT title, description, datePosted, attachment FROM attachments where requestID = ${requestID} ORDER BY datePosted;`);
    for(let attachmentObject of attachments){
      attachmentObject.attachment = attachmentObject.attachment.toString('base64');
    }
    res.send(attachments);
  } catch (error) {
    res.status(500).json({ error: 'There are no attachments given this requestID' });
  }
});

module.exports = requestsRouter;