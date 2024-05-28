const express = require("express");
const managerRouter = express.Router();
const { executeQuery, uuidToString, sendEmail } = require("./utils");
const charge = 'Charge';
const payment = 'Payment';
const credit = 'Credit';
managerRouter.use(express.json());




module.exports = managerRouter;
