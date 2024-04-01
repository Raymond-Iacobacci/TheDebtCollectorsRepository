const express = require('express');
const cors = require('cors');
const authRouter = require('./auth');
const requestsRouter = require('./requests');
require('dotenv').config({ path: '../.env' });
const sendEmail = require('./sendEmail');
const crypto = require('crypto');
const { insertQuery } = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.put('/update-profile-pic', async (req, res) => {
    try {
        const tenantID = req.query['tenant-id'];
        const profilePic = req.file.buffer;
        const query = 'UPDATE tenants SET profilePic = (?) WHERE tenantID = (?)';
        const values = [profilePic, tenantID];
        const results = await insertQuery(query, values);
    } catch (error) {
        res.status(500).json({ error: 'Error inserting into table' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});