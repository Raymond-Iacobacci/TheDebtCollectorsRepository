const express = require('express');
const tenantRouter = express.Router();

tenantRouter.use(express.json());

module.exports = tenantRouter;