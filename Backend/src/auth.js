const express = require('express');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require('passport');
const {pool} = require('./db');
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
      return done(err);
    }

    console.log(profile.id);

    connection.query('SELECT * FROM tenants WHERE email = ?', [profile.email], function(queryErr, results) {
      if (queryErr) {
        console.log("SELECT QUERY ERROR");
        connection.release();
        return done(queryErr);
      }

      // There is no account under this email, NO authentication
      if (results.length == 0) {
        connection.release();
        return done(null, false);
      }

      const tenant = results[0];

      // There is an account under the email, but no googleID has been created
      if (!tenant.googleID) {
        connection.query("UPDATE tenants SET googleID = ? WHERE email = ?", [profile.id, profile.email], function(queryErr, updateResults) {
          connection.release();
          if (queryErr) {
            console.log("UPDATE ERROR");
            console.error('Error executing update query:', queryErr);
            return done(queryErr);
          }

          const user = {
            id: tenant.id,
            email: profile.email
          };

          return done(null, user);
        });
      } else {
        if (tenant.googleID === profile.id) {
          console.log("AUTHENTICATION SUCCESSFUL");
          const user = {
            id: tenant.id,
            email: profile.email
          };
          return done(null, user);
        } else {
          console.log("NOT AUTHENTICATED");
          return done(null, false);
        }
      }
    });
  });
}));

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

authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failure' }), (req, res) => {
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