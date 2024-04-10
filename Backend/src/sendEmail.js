// const sgMail = require('@sendgrid/mail')
// require('dotenv').config({ path: '../.env' });

// const sendEmail = (toEmail, emailSubject, emailText, req, res) => {

//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     const message = {
//         to: toEmail,
//         from: 'debtcollectors4@gmail.com',
//         subject: emailSubject,
//         text: emailText
//     }

//     sgMail.send(message)
//         .then(() => {
//             res.send('Email sent successfully');
//         })
//         .catch(error => {
//             console.error(error.toString());
//             res.status(500).send('Error sending email');
//         });
// };

// module.exports = sendEmail;

// const nodemailer = require('nodemailer');

// const sendEmail = (toEmail, emailSubject, emailText, callback) => {
//     let transporter = nodemailer.createTransport({
//         host: 'smtp.sendgrid.net',
//         port: 587, 
//         secure: false, 
//         auth: {
//             user: 'apikey', 
//             pass: process.env.SENDGRID_API_KEY 
//         }
//     });

//     let mailOptions = {
//         from: 'ajay.talanki@gmail.com',
//         to: toEmail,
//         subject: emailSubject,
//         text: emailText
//     };

//     transporter.sendMail(mailOptions, (error) => {
//         if (error) {
//             callback(error);
//         } else {
//             callback(null);
//         }
//     });
// };

const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config({ path: '../.env' });

// These id's and secrets should come from .env file.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04pG4VaPnVKufCgYIARAAGAQSNwF-L9IrUs_fcsBKNuQeMD7Xjf0DmsMKZ9fx18MnZArktHiyUitgPV7C0YMlW7Dso7B_qM-wU0E';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendEmail(toEmail, emailSubject, emailText) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'ajay.talanki@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: 'ajay.talanki@gmail.com',
      to: toEmail,
      subject: emailSubject,
      text: emailText,
    };

    const results = await transport.sendMail(mailOptions);
    return results;
  } catch (error) {
    return error;
  }
}

module.exports = sendEmail;