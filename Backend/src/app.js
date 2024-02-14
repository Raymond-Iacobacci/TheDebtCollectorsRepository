const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const session = require('express-session');
require('dotenv').config({ path: '../.env' });
const mysql = require('mysql');
const sendEmail = require('./sendEmail');

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://localhost:8080/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // You can implement logic to store user profile information in the database
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

function generateUniqueLink() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Define a route for generating a unique link
app.get('/generate-link', (req, res) => {
    const uniqueLink = generateUniqueLink();
    res.send(`Unique link generated: <a href="/${uniqueLink}">${uniqueLink}</a>`);
});

// Define a route for handling the unique link and using Passport to authenticate with Google OAuth 2.0
app.get('/:uniqueLink', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Define a route for Google OAuth 2.0 callback
app.get('/google/callback', 
  passport.authenticate('google', 
  { successRedirect: '/success',
    failureRedirect: '/failure' }));

app.get('/success', (req, res) => {
  res.send("Success");
});

app.get('/failure', (req, res) => {
  res.send("failure");
});

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    connectionLimit : 1000
});

const displayConnectionError = (err, res) => {
    console.error('Error getting database connection:', err);
    res.status(500).send('Error getting database connection');
}

const displayQueryError = (queryErr, res) => {
    console.error('Error executing query:', queryErr);
    res.status(500).send('Error executing query');
}

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

const login = (tableName, req, res) => {
  pool.getConnection((err, connection) => {
      if (err) {
          displayConnectionError(err, res);
          return;
      }

      const { username, password } = req.body;
      connection.query(`SELECT * FROM ${tableName} WHERE username = ?;`, [username], (queryErr, results) => {
          connection.release();
          if (queryErr) {
              displayQueryError(queryErr, res);
              return;
          }

          if (results.length === 0) {
              res.status(404).send('Username not found');
              return;
          }

          const storedPassword = results[0].password;

          if (password === storedPassword) {
              res.send('Login successful');
          } else {
              res.send('Incorrect password');
          }
      });
  });
};

app.post('/alert-tenant', (req, res) => {
  const { link, unit, email } = req.body; 
  const subject = 'Create a DebtCollectors Account';
  const text = "Your manager has invited you to create a DebtCollectors Account:\n\n" + "Link: " + link + '\n' + "Unit: " + unit;
  sendEmail(email, subject, text);
  res.send('Email Sent');
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

app.post('/login-tenant', (req, res) => {
    login('tenants', req, res);
});

app.post('/login-manager', (req, res) => {
  login('managers', req, res);
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});