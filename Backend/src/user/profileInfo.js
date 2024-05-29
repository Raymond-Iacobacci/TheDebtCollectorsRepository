const express = require('express');
const profileInfoRouter = express.Router();
const { executeQuery} = require('../utils');

profileInfoRouter.use(express.json());

/* 
  Description: Given a user-id, return attributes of the user
  input: user-id
  output: return firstName, lastName, email of the user
*/
profileInfoRouter.get('/get-attributes', async (req, res) => {
  const userID = '0x' + req.query['user-id'];
  const userType = await getUserType(userID);
  if(userType === null){
    res.status(404).send({ err: "User not found." });
    return;
  }
  const user = await executeQuery(`SELECT firstName, lastName, email FROM ${userType}s WHERE ${userType}ID = ${userID};`);
  res.send(user[0]);
});

module.exports = profileInfoRouter;