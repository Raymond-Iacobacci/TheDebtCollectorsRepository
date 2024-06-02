const express = require('express');
const reportRouter = require('./report');
const expensesRouter = require('./expenses');
const announcementsRouter = require('./announcements');
const tenantsRouter = require('./tenants');
const transactionsRouter = require('./transactions');
const requestsRouter = require('./requests');

const managerRouter = express.Router();

managerRouter.use('/report', reportRouter);
managerRouter.use('/expenses', expensesRouter);
managerRouter.use('/announcements', announcementsRouter);
managerRouter.use('/tenants', tenantsRouter);
managerRouter.use('/transactions', transactionsRouter);
managerRouter.use('/requests', requestsRouter);

module.exports = managerRouter;