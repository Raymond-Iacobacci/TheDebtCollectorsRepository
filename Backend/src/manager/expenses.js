const express = require('express');
const expensesRouter = express.Router();
const { executeQuery, getDate } = require('../utils');

expensesRouter.use(express.json());

/* 
   Description: Given a managerID, return all the expenses of the manager in the database
   input: manager-id (binary16)
   output: array of expenses [{expenseID (int), managerID (binary16), amound(float), type (string), description (string)
                               date (date), requestID (binary16)}]
*/
expensesRouter.get('/get-expenses', async (req, res) => {
  try {
    const managerID = '0x' + req.query['manager-id'];
    const expenses = await executeQuery(`SELECT expenseID, managerID, amount, type, description, date, requestID FROM expenses where managerID = ${managerID};`);
    if (!expenses) {
      res.status(404).json({ error: 'no expenses for this manager' });
      return;
    }
    /* Converts uuid buffer to a string for frontend */
    for (let expense of expenses) {
      expense.managerID = expense.managerID.toString('hex').toUpperCase();
      /* if the expense is linked to a maintenance request, return the requestID */
      if (expense.requestID !== null) {
        expense.requestID = expense.requestID.toString('hex').toUpperCase();
      }
    }
    res.send(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 
   Description: Given a managerID, insert an expense to the database
   input: manager-id
   output: status code 
*/
expensesRouter.post('/add-expense', async (req, res) => {
  try {
    const managerID = Buffer.from(req.query['manager-id'], 'hex');
    const amount = req.body.amount;
    const type = req.body.type;
    const description = req.body.description;
    let requestID = null;
    const date = getDate();
    if (req.body.requestID !== null) {
      requestID = Buffer.from(req.body['requestID'], 'hex');
    }
    const query = `INSERT INTO expenses (managerID, amount, type, description, date, requestID) VALUES (?, ?, ?, ?, ?, ?);`;
    const values = [managerID, amount, type, description, date, requestID];
    await executeQuery(query, values);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 
   Description: Given a managerID, delete an expense from the database
   input: manager-id
   output: status code 
*/
expensesRouter.post('/delete-expense', async (req, res) => {
  try {
    const expenseID = req.query['expense-id'];
    const query = `DELETE FROM expenses where expenseID = ${expenseID};`;
    await executeQuery(query);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = expensesRouter;