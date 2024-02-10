const nodemailer = require('nodemailer');

sendEmail = (toEmail, emailSubject, emailText) => {
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
            return console.log('Error occurred:', error);
        }
        console.log('Email Sent');
    });
}

module.exports = sendEmail;