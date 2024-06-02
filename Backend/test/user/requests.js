const express = require('express');
const requestsRouter = express.Router();
const { executeQuery, uuidToString, getDate } = require('../utils');

requestsRouter.use(express.json());

/* 
  Description: Given a request, return the request details 
  input: request-id
  output: type, firstName, lastName, address, description, status of the request
*/
requestsRouter.get('/get-request-info', async (req, res) => {
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

/* 
  Description: Given a request, return the comments of the request
  input: request-id
  output: array of comments
*/
requestsRouter.get('/get-comments', async (req, res) => {
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

/* 
  Description: Given a request-id and user-id, post a comment on the request
  input: request-id, user-id
  output: status code
*/
requestsRouter.post('/add-comment', async (req, res) => {
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

requestsRouter.put('/change-status', async (req, res) => {
  try {
    const requestID = '0x' + req.query['request-id'];
    const newStatusString = req.body.status;
    const results = await executeQuery(`UPDATE requests SET status = '${newStatusString}' WHERE requestID = ${requestID};`);
    res.send(results);
  } catch (error) {
    res.status(500).json({ error: 'Error updating status'});
  }
});

requestsRouter.get('/get-attachments', async (req, res) => { 
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