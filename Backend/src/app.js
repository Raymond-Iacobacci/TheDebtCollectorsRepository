const express = require('express');
const { pool, displayConnectionError, displayQueryError } = require('./pool.js');
const authRouter = require('./auth');
const cors = require('cors'); 
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/auth', authRouter);

const showEntries = (tableName, res) => {
  pool.getConnection((err, connection) => {
      if (err) {
          displayConnectionError(err, res);
          return;
      }
      const query = `SELECT * FROM ${tableName};`;
      connection.query(query, (queryErr, results) => {
          connection.release();
          if (queryErr) {
              displayQueryError(queryErr, res);
              return;
          }
          res.json(results);
      });
  });
}

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

app.get('/requests/specifics/header-info', (req, res) => {
  const requestId = req.query['request-id'];
  pool.getConnection((err, connection) => {
    if (err) {
      displayConnectionError(err, res);
      return;
    }
    connection.query('SELECT tenantID, description, status FROM requests where requestID = ?', [requestId], (queryErr, requestResults) => {
      if (queryErr) {
        connection.release();
        displayQueryError(queryErr, res);
        return;
      }
      const request = requestResults[0]; 
      if (!request) {
        connection.release();
        res.status(404).json({ error: 'Request not found' });
        return;
      }
      connection.query('SELECT firstName, lastName FROM tenants WHERE tenantID = ?', [request.tenantID], (queryErr, tenantResults) => {
        if (queryErr) {
          connection.release();
          displayQueryError(queryErr, res);
          return;
        }
        const tenant = tenantResults[0]; 
        res.json({
          description: request.description,
          tenant: tenant ? `${tenant.firstName} ${tenant.lastName}` : null,
          status: request.status,
          unit : request.unit
        });
        connection.release();
      });
    });
  });
});

app.get('/requests/specifics/comments', (req, res) => {
  const requestId = req.query['request-id'];
  pool.getConnection((err, connection) => {
    if (err) {
      displayConnectionError(err, res);
      return;
    }
    connection.query('SELECT comment, datePosted FROM comments WHERE requestID = ?', [requestId], (queryErr, commentResults) => {
      if (queryErr) {
        connection.release();
        displayQueryError(queryErr, res);
        return;
      }
      const comment = commentResults[0]; 
      if (!comment) {
        connection.release();
        res.status(404).json({ error: 'Comments not found for this request' });
        return;
      }
      connection.query('SELECT tenantID FROM requests WHERE requestID = ?', [requestId], (queryErr, requestResults) => {
        if (queryErr) {
          connection.release();
          displayQueryError(queryErr, res);
          return;
        }
        const request = requestResults[0];
        if (!request) {
          connection.release();
          res.status(404).json({ error: 'Request not found' });
          return;
        }
        connection.query('SELECT firstName, lastName FROM tenants WHERE tenantID = ?', [request.tenantID], (queryErr, tenantResults) => {
          if (queryErr) {
            connection.release();
            displayQueryError(queryErr, res);
            return;
          }
          const tenant = tenantResults[0];
          res.json({
            tenant: tenant ? `${tenant.firstName} ${tenant.lastName}` : null,
            comment: comment.comment,
            datePosted: comment.datePosted
          });
          connection.release(); 
        }); 
      });
    });
  });
});

app.get('/show-tenants', (req, res) => {
  showEntries('tenants', res);
});

app.get('/show-managers', (req, res) => {
  showEntries('managers', res);
});

app.get('/show-requests', (req, res) => {
  showEntries('requests', res);
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