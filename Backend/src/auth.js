const express = require('express');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require('passport');
const crypto = require('crypto');
const {pool} = require('./pool')
require('dotenv').config({ path: '../.env' });

const authRouter = express.Router();

authRouter.use(express.json());
authRouter.use(express.urlencoded({ extended: true }));
authRouter.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
authRouter.use(passport.initialize());
authRouter.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/auth/google/callback",
  passReqToCallback: true
},
function(request, accessToken, refreshToken, profile, done) {
  pool.getConnection(function(err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      return done(err);
    }
  
    connection.query('SELECT * FROM tenants WHERE googleID = ?', [profile.id], function(queryErr, results) {
      
      if (queryErr) {
        console.error('Error executing SELECT query:', queryErr);
        connection.release();
        return done(queryErr);
      }
  
      if (results.length > 0) {
        console.log("USER WAS FOUND IN THE DATABASE!");
        connection.release();
        return done(null, results[0]);
      }
  
      connection.query('INSERT INTO tenants VALUES (?, ?)', [profile.id, profile.email], function(queryErr, results) {
        connection.release();
        if (queryErr) {
          console.error('Error executing INSERT query:', queryErr);
          return done(queryErr);
        }

        const newUser = {
          id: results.insertId,
          email: profile.email
        };

        console.log("USER WAS ADDED TO THE DATABASE!");
        return done(null, newUser);
      });
    });
  });
})
); 

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

authRouter.get('/send-email', (req, res) => {
  const emailToken = crypto.randomBytes(20).toString('hex');
  const oauthLink = `http://localhost:8080/auth/google?oauth_token=${emailToken}`;
  res.send(`Unique link generated: <a href="${oauthLink}">${oauthLink}</a>`);
});

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.get("/success", (req, res) => {
    res.send("success");
});

authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('http://localhost:8080/auth/success');
});

module.exports = authRouter;