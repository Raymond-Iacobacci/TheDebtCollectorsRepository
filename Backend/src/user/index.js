const express = require('express');
const requestsRouter = require('./requests');
const cookiesRouter = require('./cookies');

const userRouter = express.Router();

userRouter.use('/cookies', cookiesRouter);
userRouter.use('/requests', requestsRouter);

module.exports = userRouter;