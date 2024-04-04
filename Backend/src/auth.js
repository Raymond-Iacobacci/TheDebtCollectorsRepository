const express = require('express');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require('passport');
const {pool, selectQuery, insertQuery} = require('./db');
require('dotenv').config({ path: '../.env' });

const authRouter = express.Router();

authRouter.use(express.json());
authRouter.use(express.urlencoded({ extended: true }));
authRouter.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
authRouter.use(passport.initialize());
authRouter.use(passport.session());

// Function to handle authentication
function handleAuthentication(userType, profile, done) {
  const tableName = userType === 'tenant' ? 'tenants' : 'managers';
  const uuidType = userType === 'tenant' ? 'tenantID' : 'managerID';

  pool.getConnection(function(err, connection) {
    if (err) {
      return done(err);
    }

    connection.query(`SELECT * FROM ${tableName} WHERE email = ?`, [profile.email], function(queryErr, results) {
      if (queryErr) {
        connection.release();
        return done(queryErr);
      }

      // There is no account under this email, NO authentication
      if (results.length == 0) {
        connection.release();
        return done(null, false);
      }

      const user = results[0];
      const uuid = user[uuidType].toString('hex').toUpperCase();

      // There is an account under the email, but no googleID has been created
      if (!user.googleID) {
        connection.query(`UPDATE ${tableName} SET googleID = ? WHERE email = ?`, [profile.id, profile.email], function(queryErr, updateResults) {
          connection.release();
          if (queryErr) {
            console.error('Error executing update query:', queryErr);
            return done(queryErr);
          }

          return done(null, {user, uuid});
        });
      } else {
        if (user.googleID === profile.id) {
          return done(null, {user, uuid});
        } else {
          return done(null, false);
        }
      }
    });
  });
}

// Tenant login strategy
passport.use('tenant-login', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://backend-kxfzqfz2rq-uc.a.run.app/auth/google/callback/tenant',
  passReqToCallback: true
}, function(request, accessToken, refreshToken, profile, done) {
  handleAuthentication('tenant', profile, done);
}));

// Manager login strategy
passport.use('manager-login', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://backend-kxfzqfz2rq-uc.a.run.app/auth/google/callback/manager',
  passReqToCallback: true
}, function(request, accessToken, refreshToken, profile, done) {
  handleAuthentication('manager', profile, done);
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

authRouter.post('/create-tenant', async (req, res) => {
  try{
    const managerID = Buffer.from(req.query['manager-id'], 'hex');
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const address = req.body.address;

    const query = `SELECT * FROM tenants where email = '${email}';`;

    const results = await selectQuery(query);
    
    if(results.length != 0){
      res.redirect(req.baseUrl + '/already-created');
      return;
    }
    
    const data = await insertQuery('INSERT INTO tenants (email, firstName, lastName, address, managerID) values (?, ?, ?, ?, ?)', [email, firstName, lastName, address, managerID]);
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting into table' });
  }
})

authRouter.get('/tenant-login', passport.authenticate('tenant-login', { scope: ['profile', 'email'] }));

authRouter.get('/manager-login', passport.authenticate('manager-login', { scope: ['profile', 'email'] }));

authRouter.get('/google/callback/tenant', passport.authenticate('tenant-login', { failureRedirect: '/failure' }), (req, res) => {
  res.send(req.user.uuid);
});

authRouter.get('/google/callback/manager', passport.authenticate('manager-login', { failureRedirect: '/failure' }), (req, res) => {
  res.send(req.user.uuid);
});

authRouter.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect(req.baseUrl + '/loggedout');
  });
});

authRouter.get("/loggedout", (req, res) => {
  res.send("You have succesfully logged out!");
});

authRouter.get("/success", (req, res) => {
    res.send("Authentication Succesful!");
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