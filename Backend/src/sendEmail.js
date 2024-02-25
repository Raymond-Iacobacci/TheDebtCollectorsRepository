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

const nodemailer = require('nodemailer');

const sendEmail = (toEmail, emailSubject, emailText, callback) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587, 
        secure: false, 
        auth: {
            user: 'apikey', 
            pass: process.env.SENDGRID_API_KEY 
        }
    });

    let mailOptions = {
        from: 'debtcollectors4@gmail.com',
        to: toEmail,
        subject: emailSubject,
        text: emailText
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            callback(error);
        } else {
            callback(null);
        }
    });
};

module.exports = sendEmail;