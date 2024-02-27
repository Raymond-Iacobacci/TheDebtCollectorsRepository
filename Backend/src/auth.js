const express = require('express');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require('passport');
const crypto = require('crypto');
const {pool} = require('./pool');
const sendEmail = require('./sendEmail');
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
  callbackURL: 'https://backend-kxfzqfz2rq-uc.a.run.app/auth/google/callback',
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

      connection.query("INSERT INTO tenants (email, firstName, lastName, address, unit, googleID) values (null, null, null, null, null, null);", function(queryErr, results) {
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

authRouter.get('/login', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect(req.baseUrl + '/loggedout');
  });
});

authRouter.get("/success", (req, res) => {
    res.send("Authentication Succesful!");
});

authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.baseUrl + '/success');
});

authRouter.get("/loggedout", (req, res) => {
    res.send("You have succesfully logged out!");
});

authRouter.get("/failure", (req, res) => {
  res.send("You are not authenticated.");
});

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
      res.send("Welcome");
  } else {
      res.redirect(req.baseUrl + '/failure');
  }
}

authRouter.get('/protected', checkAuthentication, (req, res) => {
  res.send('This is a protected route');
});

module.exports = authRouter;