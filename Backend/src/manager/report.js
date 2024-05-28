const express = require('express');
const reportRouter = express.Router();
const { executeQuery } = require('./utils');

reportRouter.use(express.json());

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

function getPaymentsQuery(managerID, description, startDate, endDate) {
  const formattedStartDate = startDate.toISOString().slice(0, 10);
  const formattedEndDate = endDate.toISOString().slice(0, 10);

  return `
    SELECT SUM(amount) AS amount
    FROM (
      SELECT type, description, amount, date
      FROM paymentsLedger p
      INNER JOIN (
        SELECT tenantID
        FROM tenants
        WHERE managerID = ${managerID}
      ) AS t ON t.tenantID = p.tenantID
    ) AS final
    WHERE final.type = 'Payment' AND final.description = '${description}' AND final.date >= '${formattedStartDate}' AND final.date <= '${formattedEndDate}';`;
}

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

function getExpensesQuery(managerID, type, startDate, endDate) {
  return `
    SELECT SUM(amount) AS amount
    FROM expenses
    WHERE type IN ('${type}')
    AND managerID = ${managerID} AND date >= '${startDate.toISOString()}' AND date <= '${endDate.toISOString()}';`;
}

async function performQueries(managerID, startDate, endDate){
  const reportDataObject = {} 
  
  const totalPaidRent = await executeQuery(getPaymentsQuery(managerID, 'Rent', startDate, endDate));
  const totalPaidUtilities = await executeQuery(getPaymentsQuery(managerID, 'Utilities', startDate, endDate));
  const totalPaidOther = await executeQuery(getPaymentsQuery(managerID, 'Other', startDate, endDate));

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
      const yearStartDate = new Date(today.getFullYear(), 0, 1); // January 1st
      const yearEndDate = new Date(today.getFullYear(), 11, 31); // December 31st
      const reportDataObject = await performQueries(managerID, yearStartDate, yearEndDate);
      reportData.push(reportDataObject);
  }
  return reportData;
}

module.exports = reportRouter;