const express = require('express');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require('passport');
const mysql = require('mysql');
const sendEmail = require('./sendEmail');
const crypto = require('crypto')
require('dotenv').config({ path: '../.env' });

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
  callbackURL: "http://localhost:8080/google/callback",
  passReqToCallback: true
},
function(request, accessToken, refreshToken, profile, done) {
  return done(null, profile);
}
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Route for sending OAuth email
app.get('/send-email', (req, res) => {
  const emailToken = crypto.randomBytes(20).toString('hex');
  const oauthLink = `http://localhost:8080/auth/google?oauth_token=${emailToken}`;
  res.send(`Unique link generated: <a href="${oauthLink}">${oauthLink}</a>`);
});

// Route for initiating OAuth authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// OAuth callback route
app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // Successful authentication, redirect user to appropriate page
    res.redirect('/success');
});

app.get("/success", (req, res) => {
  res.send("success");
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