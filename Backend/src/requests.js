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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Vary');

    const managerID = '0x' + req.query['manager-id'];
    const tenantResults = await selectQuery(`SELECT tenantID, firstName, lastName, address FROM tenants WHERE managerID = ${managerID};`);
    const requests = [];

    if (!tenantResults) {
      res.send('TenantID not found for managerID').end();
      return;
    }

    for (const tenant of tenantResults) {
      const requestResults = await selectQuery(`SELECT requestID, type, status FROM requests WHERE tenantID = ${uuidToString(tenant.tenantID)} ORDER BY dateRequested;`);
      if (!requestResults) {
        res.send('requestID not found for request').end();
        return;
      }
      for (const request of requestResults) {
        requests.push({
          "requestID" : request.requestID.toString('hex').toUpperCase(),
          "name" : tenant.firstName + " " + tenant.lastName,
          "address" : tenant.address,
          "type" : request.type,
          "status" : request.status
        });
      }
    }
    res.send(requests).end();
  } catch (error) {
    res.status(500).json({ error: `MANAGER VIEW ERROR: ${error}` }).end();
  }
});

requestsRouter.get('/get-tenant-view', async (req, res) => {
  try {
    const tenantID = '0x' + req.query['tenant-id'];
    const requestResults = await selectQuery(`SELECT description, type, status, dateRequested FROM requests WHERE tenantID = ${tenantID};`);
    const requests = []
    if(!requestResults){
      res.send('no requestID for this tenantID');
      return;
    }
    for(const request of requestResults){
      requests.push({
        description: request.description,
        type: request.type,
        status: request.status,
        dateRequested : request.dateRequested
      });
    }
    res.send(requests).end();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

requestsRouter.get('/specifics/header-info', async (req, res) => {
  try {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Vary');

    const requestId = '0x' + req.query['request-id'];
    const requestQuery = `SELECT tenantID, description, status, type FROM requests where requestID = ${requestId};`;
    const requestResults = await selectQuery(requestQuery);
    const request = requestResults[0];

    if (!request) {
      res.status(404).json({ error: 'requestID not found in requests table' });
      return;
    }

    const tenantQuery = `SELECT firstName, lastName, address FROM tenants WHERE tenantID = ${uuidToString(request.tenantID)};`
    const tenantResults = await selectQuery(tenantQuery);
    const tenant = tenantResults[0];

    if (!tenant) {
      res.status(404).json({ error: 'tenantID not found in tenants table.' });
      return;
    }

    res.send({
      type: request.type,
      tenant: `${tenant.firstName} ${tenant.lastName}`,
      address: tenant.address,
      description: request.description, 
      status: request.status
    }).end();
  } catch (error) {
    res.status(500).json({ error: `HEADER-INFO ERROR: ${error}` }).end();
  }
});

requestsRouter.get('/specifics/comments', async (req, res) => {
  try {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Vary');

    const requestID = '0x' + req.query['request-id'];
    const commentResults = await selectQuery(`SELECT userID, comment, datePosted FROM comments WHERE requestID = ${requestID} ORDER BY datePosted DESC;`);
    const comments = [];

    if (commentResults.length === 0) {
      res.send({}).end();
      return;
    }
    
    for(const commentEntry of commentResults){
      const userQuery = `select firstName, lastName FROM tenants WHERE tenantID = ${uuidToString(commentEntry.userID)};`
      const userResults = await selectQuery(userQuery);
      let user = userResults[0];
      if(!user){
        const userQuery = `select firstName, lastName FROM managers WHERE managerID = ${uuidToString(commentEntry.userID)};`
        const userResults = await selectQuery(userQuery);
        user = userResults[0];
      }
      comments.push({
        user: user.firstName + ' ' + user.lastName,
        comment: commentEntry.comment,
        datePosted: commentEntry.datePosted
      })
    }
    res.send(comments).end();
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
    const attachmentFile = req.file.buffer; 
    const datePosted = getDate();
    const query = 'INSERT INTO attachments (requestID, attachment, datePosted) VALUES (?, ?, ?)';
    const values = [requestID, attachmentFile, datePosted];
    const results = await insertQuery(query, values);
    res.send(results);
  } catch (error) {
    console.error('Error adding attachment:', error);
    res.status(500).json({ error: 'Error adding attachment' });
  }
});

requestsRouter.post('/new', async (req, res) => {
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
    const requestID = results[0];

    if (!requestID) {
      res.status(404).json({ error: 'requestID not found in requests table.' });
      return;
    }

    res.send(uuidToString(requestID.requestID));
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
    const requestResults = await selectQuery(`SELECT attachment, datePosted FROM attachments where requestID = ${requestID} ORDER BY datePosted;`);
    attachments = []
    for(const request of requestResults){
      const data = request.attachment;
      const base64Data = data.toString('base64');
      attachments.push(base64Data);
    }
    res.send(attachments);
  } catch (error) {
    res.status(500).json({ error: 'There are no attachments given this requestID' });
  }
});

module.exports = requestsRouter;