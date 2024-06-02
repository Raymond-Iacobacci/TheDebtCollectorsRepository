const express = require('express');
const requestsRouter = require('./requests');
const cookiesRouter = require('./cookies');
const profileInfoRouter = require('./profileInfo');

const userRouter = express.Router();

userRouter.use('/cookies', cookiesRouter);
userRouter.use('/requests', requestsRouter);
userRouter.use('/profile-info', profileInfoRouter);

module.exports = userRouter;