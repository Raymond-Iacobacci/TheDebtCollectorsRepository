const express = require('express');
const cors = require('cors');

const usersRouter = require('./users');
const requestsRouter = require('./requests');
const dashBoardRouter = require('./dashboard')
const managerRouter = require('./manager')
const tenantRouter = require('./tenant');

require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', usersRouter);
app.use('/requests', requestsRouter);
app.use('/dashboard', dashBoardRouter);
app.use('/manager', managerRouter);
app.use('/tenant', tenantRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});