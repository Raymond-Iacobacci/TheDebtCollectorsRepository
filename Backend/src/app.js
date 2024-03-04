const express = require('express');
const { pool, selectQuery} = require('./db');
const authRouter = require('./auth');
const requestsRouter = require('./requests'); 
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
app.use('/requests', requestsRouter); 

app.get('/send-email', (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});