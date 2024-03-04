const express = require('express');
const requestsRouter = express.Router();
const multer = require('multer');
const { selectQuery, insertQuery, uuidToString } = require('./db');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function getDate(){
  const date = new Date();
  return date.toISOString();
}

requestsRouter.get('/get', async (req, res) => {
  try {
    const tenantID = '0x' + req.query['user-id'];
    const requestResults = await selectQuery(`SELECT requestID FROM requests where tenantID = ${tenantID} ORDER BY dateRequested;`);
    if (!requestResults) {
      res.status(404).json({ error: 'requestIDs not found for tenant' });
      return;
    }
    res.send(requestResults);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

requestsRouter.get('/specifics/header-info', async (req, res) => {
  try {
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

    res.json({
      type: request.type,
      tenant: `${tenant.firstName} ${tenant.lastName}`,
      address: tenant.address,
      description: request.description,
      status: request.status
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

requestsRouter.get('/specifics/comments', async (req, res) => {
  try {
    const requestID = '0x' + req.query['request-id'];
    const requestQuery = `SELECT userID, comment, datePosted FROM comments WHERE requestID = ${requestID} ORDER BY datePosted DESC;`;
    const commentResults = await selectQuery(requestQuery);
    const comments = [];

    if (commentResults.length === 0) {
      res.status(404).json({ error: 'Comments not found for this request' });
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
    res.send(comments);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

requestsRouter.post('/specifics/new-comment', async (req, res) => {
  try {
    const requestID = Buffer.from(req.query['request-id'], 'hex');
    const userID = Buffer.from(req.query['user-id'], 'hex');
    const comment = req.query['comment'];
    const datePosted = getDate();
    const query = 'INSERT INTO comments (requestID, datePosted, comment, userID) VALUES (?, ?, ?, ?)';
    const values = [requestID, datePosted, comment, userID];
    const results = await insertQuery(query, values);
    console.log(results.insertId)
    res.send(results);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting into table' });
  }
});

requestsRouter.post('/new', async (req, res) => {
  try {
    const tenantID = req.query['user-id'];
    const description = req.query['description'];
    const status = 'Unresolved';
    const dateRequested = getDate();

    const managerIDQuery = `SELECT managerID FROM tenants where tenantID = ${'0x' + tenantID};`;
    const managerResults = await selectQuery(managerIDQuery);
    const managerObject = managerResults[0];

    if (!managerObject) {
      res.status(404).json({ error: 'managerID not found in managers table' });
      return;
    }

    const managerID = managerObject.managerID;

    const query = 'INSERT INTO requests (description, tenantID, managerID, status, dateRequested) VALUES (?, ?, ?, ?, ?)';
    const values = [description, Buffer.from(tenantID, 'hex'), Buffer.from(managerID, 'hex'), status, dateRequested];
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
    const requestID = req.query['request-id'];
    const newStatusString = req.query['status'];
    const query = `UPDATE requests SET status = '${newStatusString}' WHERE requestID = ${requestID};`;
    const results = await selectQuery(query);
    res.send(results);
  } catch (error) {
    res.status(500).json({ error: 'Error updating status'});
  }
});

requestsRouter.post('/specifics/new-attachment', upload.single('attachment'), async (req, res) => { 
  try {
    const requestID = Buffer.from(req.body['request-id'], 'hex');
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

requestsRouter.get('/specifics/attachments', async (req, res) => { 
  try {
    const requestID = '0x' + req.query['request-id'];
    const requestResults = await selectQuery(`SELECT attachment, datePosted FROM attachments where requestID = ${requestID} ORDER BY datePosted;`);
    res.send(requestResults);
  } catch (error) {
    res.status(500).json({ error: 'There are no attachments given this requestID' });
  }
});

module.exports = requestsRouter;