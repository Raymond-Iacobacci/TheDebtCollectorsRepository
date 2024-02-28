const express = require('express');
const { pool, displayConnectionError, displayQueryError } = require('./pool.js');
const authRouter = require('./auth');
const cors = require('cors'); 
require('dotenv').config({ path: '../.env' });
const sendEmail = require('./sendEmail');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/auth', authRouter);

const selectQuery = (query) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      connection.query(query, (queryErr, results) => {
        connection.release();
        if (queryErr) {
          reject(queryErr);
          return;
        }
        resolve(results);
      });
    });
  });
};

const addEntries = (tableName, req, res) => {
  pool.getConnection((err, connection) => {
      if (err) {
          displayConnectionError(err, res);
          return;
      }

      let query = "";
      let values = []

      if(tableName == "tenants"){
        const { userID, username, password, unit, email } = req.body;
        values = [userID, username, password, email, unit];
        query = 'INSERT INTO tenants VALUES (?, ?, ?, ?, ?);'
      } else if(tableName == "managers"){
        const { managerID, username, password, email } = req.body;
        values = [managerID, username, password, email];
        query = 'INSERT INTO managers VALUES (?, ?, ?, ?);'
      } else if(tableName == "requests"){
        const { requestID, summary, datePosted, unit, managerID } = req.body;
        values = [requestID, summary, datePosted, unit, managerID];
        query = 'INSERT INTO requests VALUES (?, ?, ?, ?, ?);'
      }

      connection.query(query, values, (queryErr, results) => {
          connection.release();
          if (queryErr) {
              displayQueryError(queryErr, res);
              return;
          }
          res.json(results);
      });
  });
}

authRouter.get('/send-email', (req, res) => {
  const emailToken = crypto.randomBytes(20).toString('hex');
  const oauthLink = `https://thedebtcollectorstest-kxfzqfz2rq-uc.a.run.app/auth/login?oauth_token=${emailToken}`;
  const subject = 'Create a DebtCollectors Account';
  const text = "Your manager has invited you to create a DebtCollectors Account:\n\n" + "Link: " + oauthLink;

  sendEmail('ajay.talanki@gmail.com', subject, text, (err) => {
      if (err) {
          res.status(500).json({ message: 'Failed to send email' });
      } else {
          res.json({ message: 'Email sent successfully' });
      }
  });
});

app.get('/requests/specifics/header-info', async (req, res) => {
  try {
    const requestId = req.query['request-id'];
    let query = `SELECT tenantID, description, status FROM requests where requestID = ${requestId};`;
    const requestResults = await selectQuery(query);
    const request = requestResults[0];
    if (!request) {
      res.status(404).json({ error: 'requestID not found in requests table' });
      return;
    }

    query = `SELECT firstName, lastName, unit FROM tenants WHERE tenantID = ${'0x' + request.tenantID.toString('hex').toUpperCase()};`;
    const tenantResults = await selectQuery(query);

    const tenant = tenantResults[0];
    if (!tenant) {
      res.status(404).json({ error: 'tenantID not found in tenants table.' });
      return;
    }

    res.json({
      description: request.description,
      tenant: `${tenant.firstName} ${tenant.lastName}`,
      status: request.status,
      unit: tenant.unit
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/requests/specifics/comments', async (req, res) => {
  try {
    const requestID = req.query['request-id'];
    const query = `SELECT user, comment, datePosted FROM comments WHERE requestID = ${requestID} ORDER BY datePosted DESC;`;

    const commentResults = await selectQuery(query);

    if (commentResults.length === 0) {
      res.status(404).json({ error: 'Comments not found for this request' });
      return;
    }

    const comments = commentResults.map(commentEntry => ({
      user: commentEntry.user,
      comment: commentEntry.comment,
      datePosted: commentEntry.datePosted
    }));

    res.send(comments);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/show-tenants', (req, res) => {
  selectQuery('tenants', res);
});

app.get('/show-managers', (req, res) => {
  selectQuery('managers', res);
});

app.get('/show-requests', (req, res) => {
  selectQuery('requests', res);
});
  
app.post('/add-tenant', (req, res) => {
  addEntries('tenants', req, res);
});

app.post('/add-manager', (req, res) => {
  addEntries('managers', req, res);
});

app.post('/make-request', (req, res) =>{
  addEntries('requests', req, res);
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});