const express = require('express');
const {pool, displayConnectionError, displayQueryError} = require('./pool.js')
const authRouter = require('./auth');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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