const express = require('express');
const dashBoardRouter = express.Router();
const { executeQuery } = require('./db');

dashBoard.use(express.json());

module.exports = dashBoardRouter;