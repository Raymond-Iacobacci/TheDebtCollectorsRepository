const express = require('express');
const reportRouter = express.Router();
const { executeQuery } = require('../utils');

reportRouter.use(express.json());

/* 
   Description: Given a managerID and schedule type, return the report data 
   input: manager-id (binary16), schedule (string)
   output: array of report objects [{income_rent, income_utilities, income_other, expenses_other, expenses_maintenence,
                                    expenses_wages, expenses_mortgage, expenses_utilities}] (floats)
*/
reportRouter.get("/get-report", async (req, res) => {
  try {
    const managerID = "0x" + req.query["manager-id"];
    const schedule = req.query["schedule"];
    const reportData = await generateReportData(managerID, schedule);
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Given a managerID, description, and start/end dates, generate a query to get the income in the database satisfying these conditions */
function getIncomeQuery(managerID, description, startDate, endDate) {
  const formattedStartDate = startDate.toISOString().slice(0, 10);
  const formattedEndDate = endDate.toISOString().slice(0, 10);

  return `
    SELECT SUM(amount) AS amount
    FROM (
      SELECT type, description, amount, date, paidAmount, idLate
      FROM paymentsLedger p
      INNER JOIN (
        SELECT tenantID
        FROM tenants
        WHERE managerID = ${managerID}
      ) AS t ON t.tenantID = p.tenantID
    ) AS final
    WHERE (final.type = 'Charge' AND final.description = '${description}' AND final.paidAmount = 0 OR final.idLate IS NOT NULL) AND final.date >= '${formattedStartDate}' AND final.date <= '${formattedEndDate}';`;
}

/* Given a managerID and start/end dates, generate a query to get the credits in the database satisfying these conditions */
function getCreditsQuery(managerID, startDate, endDate) {
  const formattedStartDate = startDate.toISOString().slice(0, 10);
  const formattedEndDate = endDate.toISOString().slice(0, 10);

  return `
    SELECT SUM(amount) AS amount
    FROM (
      SELECT type, amount, date
      FROM paymentsLedger p
      INNER JOIN (
        SELECT tenantID
        FROM tenants
        WHERE managerID = ${managerID}
      ) AS t ON t.tenantID = p.tenantID
    ) AS final
    WHERE final.type = 'Credit' AND final.date >= '${formattedStartDate}' AND final.date <= '${formattedEndDate}';`;
}

/* Given a managerID, type, and start/end dates, generate a query to get the expenses in the database satisfying these conditions */
function getExpensesQuery(managerID, type, startDate, endDate) {
  return `
    SELECT SUM(amount) AS amount
    FROM expenses
    WHERE type IN ('${type}')
    AND managerID = ${managerID} AND date >= '${startDate.toISOString()}' AND date <= '${endDate.toISOString()}';`;
}

/* Given a managerID and time period, return a report of income, expenses, and credits */
async function performQueries(managerID, startDate, endDate){
  const reportDataObject = {} 
  
  const totalPaidRent = await executeQuery(getIncomeQuery(managerID, 'Rent', startDate, endDate));
  const totalPaidUtilities = await executeQuery(getIncomeQuery(managerID, 'Utilities', startDate, endDate));
  const totalPaidOther = await executeQuery(getIncomeQuery(managerID, 'Other', startDate, endDate));

  reportDataObject.income_rent = totalPaidRent[0].amount || 0;
  reportDataObject.income_utilities = totalPaidUtilities[0].amount || 0;
  reportDataObject.income_other = totalPaidOther[0].amount || 0;

  const expenses_other = await executeQuery(getExpensesQuery(managerID, 'Other', startDate, endDate));
  const expenses_maintenance = await executeQuery(getExpensesQuery(managerID, 'Maintenance Request', startDate, endDate));
  const expenses_wages = await executeQuery(getExpensesQuery(managerID, 'Wages', startDate, endDate));
  const expenses_mortgage = await executeQuery(getExpensesQuery(managerID, 'Mortgage Interest', startDate, endDate));
  const expenses_utilities = await executeQuery(getExpensesQuery(managerID, 'Utilities', startDate, endDate));
  
  reportDataObject.expenses_other = expenses_other[0].amount || 0;
  reportDataObject.expenses_maintenance = expenses_maintenance[0].amount || 0;
  reportDataObject.expenses_wages = expenses_wages[0].amount || 0;
  reportDataObject.expenses_mortgage = expenses_mortgage[0].amount || 0;  
  reportDataObject.expenses_utilities = expenses_utilities[0].amount || 0;

  const credits = await executeQuery(getCreditsQuery(managerID, startDate, endDate));
  reportDataObject.credits = credits[0].amount || 0;

  return reportDataObject;
}

/* Given a managerID and schedule type, return a report of income, expenses, and credits */
async function generateReportData(managerID, schedule) {
  const reportData = [];
  const today = new Date();

  if(schedule === "monthly"){
    for (let i = 0; i < 12; i++) {
      const monthStartDate = new Date(today.getFullYear(), i, 1);
      const monthEndDate = new Date(today.getFullYear(), i + 1, 0); 
      const reportDataObject = await performQueries(managerID, monthStartDate, monthEndDate);
      reportData.push(reportDataObject);
    }
  } else if(schedule === "quarterly"){
    for (let i = 0; i < 4; i++) {
      const quarterStartDate = new Date(today.getFullYear(), i * 3, 1);
      const quarterEndDate = new Date(today.getFullYear(), (i+1)*3, 0); 
      const reportDataObject = await performQueries(managerID, quarterStartDate, quarterEndDate);
      reportData.push(reportDataObject);
    }
  } else if(schedule === "yearly"){
      const yearStartDate = new Date(today.getFullYear(), 0, 1); 
      const yearEndDate = new Date(today.getFullYear(), 11, 31); 
      const reportDataObject = await performQueries(managerID, yearStartDate, yearEndDate);
      reportData.push(reportDataObject);
  }
  return reportData;
}

module.exports = reportRouter;