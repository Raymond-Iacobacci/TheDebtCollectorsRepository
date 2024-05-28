const express = require('express');
const { executeQuery } = require('./utils');
const tenantRouter = express.Router();
const charge = "Charge"
const payment = "Payment"
const credit = "Credit"
tenantRouter.use(express.json());




module.exports = tenantRouter;