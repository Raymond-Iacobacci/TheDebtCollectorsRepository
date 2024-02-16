const nodemailer = require('nodemailer');

const sendEmail = (toEmail, emailSubject, emailText, callback) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'debtcollectors4@gmail.com',
            pass: 'vfqe olcx idww quzl'
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