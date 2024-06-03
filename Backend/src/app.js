const express = require('express');
const cors = require('cors');

const managerRouter = require('./manager')
const tenantRouter = require('./tenant');
const userRouter = require('./user');

require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/manager', managerRouter);
app.use('/tenant', tenantRouter);
app.use('/user', userRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});