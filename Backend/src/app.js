const express = require('express');
const cors = require('cors');

const usersRouter = require('./users');
const requestsRouter = require('./requests');
const dashBoardRouter = require('./dashboard')
const managerRouter = require('./manager')
const tenantRouter = require('./tenant');

require('dotenv').config({ path: '../.env' });
const { insertQuery } = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', usersRouter);
app.use('/requests', requestsRouter);
app.use('/home', homeRouter);
app.use('/manager', managerRouter);
app.use('/tenant', tenantRouter);

app.put('/update-profile-pic', async (req, res) => {
    try {
        const tenantID = '0x' + req.query['tenant-id'];
        const profilePic = req.file.buffer;
        const query = 'UPDATE tenants SET profilePic = (?) WHERE tenantID = (?)';
        const values = [profilePic, tenantID];
        const results = await insertQuery(query, values);
    } catch (error) {
        res.status(500).json({ error: 'Error updating table' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});