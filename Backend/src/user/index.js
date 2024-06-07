const express = require('express');
const requestsRouter = require('./requests');
const cookiesRouter = require('./cookies');
const profileInfoRouter = require('./profileInfo');
const {transactionsRouter}= require('./transactions')

const userRouter = express.Router();

userRouter.use('/cookies', cookiesRouter);
userRouter.use('/requests', requestsRouter);
userRouter.use('/profile-info', profileInfoRouter);
userRouter.use('/transactions', transactionsRouter);

module.exports = userRouter;