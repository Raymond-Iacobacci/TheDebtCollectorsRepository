const express = require('express');
const announcementsRouter = require('./announcements');
const {transactionsRouter} = require('./transactions');
const requestsRouter = require('./requests');

const tenantRouter = express.Router();

tenantRouter.use('/announcements', announcementsRouter);
tenantRouter.use('/transactions', transactionsRouter);
tenantRouter.use('/requests', requestsRouter);

module.exports = tenantRouter;