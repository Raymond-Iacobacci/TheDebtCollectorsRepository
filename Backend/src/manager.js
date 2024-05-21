const express = require("express");
const managerRouter = express.Router();
const { executeQuery } = require("./db");
const { sendEmail } = require("./sendEmail");
const charge = 'Charge';
const payment = 'Payment';
const credit = 'Credit';
managerRouter.use(express.json());

// const intervalMinutes = 1;
// const interval = intervalMinutes * 60000;
// const i = 10000
// const timerID = setInterval(fillRentPayments, interval);

// async function fillRentPayments(){
//     const tenantPayments = await selectQuery(`SELECT * FROM tenants where rents IS NOT NULL`);
//     for (const payment of tenantPayments) {
//         const { rents, type, tenantID } = payment;
//         const date = getDate();
//         await insertQuery("INSERT INTO paymentsDue (date, amount, type, tenantID) VALUES (?, ?, ?, ?)", [date, rents, 'Rent', tenantID]);
//     }
//     console.log(tenantPayments);
// }

// NOTE: late fees logic
// const interval = 10000;
// setInterval(crawlForLatePayments, interval);

// function getAbbrDate() {
//   const date = new Date();
//   return date.toISOString().split('T')[0];
// }

// async function crawlForLatePayments() {
//   var tenantsWithLatePayments = await selectQuery(`SELECT id, tenantID, description, date FROM paymentsLedger WHERE type = 'Charge' AND idLate is NULL AND paidAmount > 0 AND DATEDIFF('${getAbbrDate()}', date) > -50`); // TODO: change to < 11
//   console.log(tenantsWithLatePayments);

//   for (let tenantWithLateCharges of tenantsWithLatePayments) {

//     const chargeBalance = await selectQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${charge}' AND tenantID=${uuidToString(tenantWithLateCharges.tenantID)}`);
//     const paymentBalance = await selectQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${payment}' AND tenantID=${uuidToString(tenantWithLateCharges.tenantID)}`);
//     let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0);
//     balance = 10 + balance;
    
//     const date = tenantWithLateCharges.date
//     const parts = date.toISOString().split('T');
//     const datePart = parts[0];
//     const dateFinal = `${datePart.split('-')[1]}/${datePart.split('-')[2]}/${datePart.split('-')[0]}`;

//     const query = "INSERT INTO paymentsLedger (type, description, date, amount, tenantID, idLate, balance, paidAmount) VALUES (?,?,?,?,?,?,?,?);";
//     const values = ['Charge', `Late: ${tenantWithLateCharges.description}, ${dateFinal}`, getDatePayment(), 10, tenantWithLateCharges.tenantID, tenantWithLateCharges.id, balance, 10];
//     await insertQuery(query, values);

//   }
// }

managerRouter.get("/get-report", async (req, res) => {
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

managerRouter.post("/create-credit", async(req, res) =>{
try {  
  const tenantID = req.body.tenantID;
  const description = req.body.description;
  const amount = req.body.amount;
  const currentDate = getDate();
  
  const chargeBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${charge}' AND tenantID=${'0x' + tenantID}`);
  const paymentBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${payment}' AND tenantID=${'0x' + tenantID}`);
  const creditBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${credit}' AND tenantID=${'0x' + tenantID}`)

  let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0)-Number(creditBalance[0].amount || 0);
  balance =  balance -Number(amount);
  updatePayment(amount);
  const query = "INSERT INTO paymentsLedger (type, description, date, amount, tenantID, balance, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const values = [credit, description, currentDate, amount, Buffer.from(tenantID, 'hex'), balance, 0];
  await executeQuery(query, values);
  

  res.send(200);
  }catch(error){
    res.status(500).json({ error: error });
  }
});

function getDate() {
    const moment = require("moment-timezone");
    return moment().tz("America/Los_Angeles").format("YYYY-MM-DD");
}

managerRouter.post("/create-tenant", async (req, res) => {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const address = req.body.address;
    const monthlyRent = req.body.monthlyRent;
    const monthlyUtilites = req.body.monthlyUtilities;
    const managerId = req.query["manager-id"];
    const managerResult = await executeQuery(
      `SELECT firstName,lastName FROM managers where managerID = ${"0x" + managerId
      };`
    );
    const query =
      "INSERT INTO tenants (firstName, lastName, email, address, managerID, rents, utilities) VALUES (?, ?, ?, ?, ?, ?, ?);";
    const values = [
      firstName,
      lastName,
      email,
      address,
      Buffer.from(managerId, "hex"),
      monthlyRent,
      monthlyUtilites,
    ];
    await executeQuery(query, values);

    const message = `Hello ${firstName} ${lastName}, you have been added as a tenant to the DebtCollectors Property Management Suite. You can login here: https://frontend-kxfzqfz2rq-uc.a.run.app`
    sendEmail(email, 'Welcome to the DebtCollectors Property Management Suite', message)
      .then(data => {
        res.send('Email sent successfully:');
      })
      .catch(error => {
        res.send('Error sending email:');
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function updatePayment(amount){
  let newCharge = 0;
  let subtractAmount = 0;
  while (amount > 0) {
      const oldestCharge = await executeQuery(`SELECT paidAmount AS oldestCharge, id FROM paymentsLedger WHERE type='Charge' AND paidAmount > 0 LIMIT 1`);
      if (oldestCharge.length === 0) {
          break;
      }
      newCharge = oldestCharge[0].oldestCharge;
      subtractAmount = Math.min(oldestCharge[0].oldestCharge, amount);
      newCharge -= subtractAmount;
      amount -= subtractAmount;
      await executeQuery(`UPDATE paymentsLedger SET paidAmount=${newCharge} WHERE id=${oldestCharge[0].id}`);
  }
}

managerRouter.post("/create-payment", async (req, res) => {
    try {
        const tenantID = req.body.tenantID;
        const description = req.body.description;
        const amount = req.body.amount;
        const currentDate = getDate();
        
        const chargeBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${charge}' AND tenantID=${'0x' + tenantID}`);
        const paymentBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${payment}' AND tenantID=${'0x' + tenantID}`);
        const creditBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${credit}' AND tenantID=${'0x' + tenantID}`)

        let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0) - Number(creditBalance[0].amount || 0);
        let temp = balance;
        balance = Number(amount) + balance;
        const query = "INSERT INTO paymentsLedger (type, description, date, amount, tenantID, balance, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const values = [charge, description, currentDate, amount, Buffer.from(tenantID, 'hex'), balance, amount];
        await executeQuery(query, values);
        updatePayment(-temp);
        res.send(currentDate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

managerRouter.get("/get-tenants", async (req, res) => {
  try {
    const managerID = req.query["manager-id"];
    const tenantsList = await executeQuery(
      `SELECT firstName, lastName, email, address, tenantID from tenants where managerID = ${"0x" + managerID
      }`
    );
    const formattedData = tenantsList.map((row) => ({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      address: row.address,
      tenantID: row.tenantID.toString('hex').toUpperCase(),
    }));
    res.send(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

managerRouter.get('/get-expenses', async (req, res) => {
  try {
    const managerID = '0x' + req.query['manager-id'];
    const expenses = await executeQuery(`SELECT expenseID, managerID, amount, type, description, date, requestID FROM expenses where managerID = ${managerID};`);
    if (!expenses) {
      res.status(404).json({ error: 'no expenses for this manager' });
      return;
    }
    for (let expense of expenses) {
      expense.managerID = expense.managerID.toString('hex').toUpperCase();
      if (expense.requestID !== null) {
        expense.requestID = expense.requestID.toString('hex').toUpperCase();
      }
    }
    res.send(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

managerRouter.post('/add-expense', async (req, res) => {
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

managerRouter.post('/delete-expense', async (req, res) => {
  try {
    const expenseID = req.query['expense-id'];
    const query = `DELETE FROM expenses where expenseID = ${expenseID};`;
    await executeQuery(query);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

managerRouter.get('/get-announcements', async (req, res) => {
  try {
    const managerID = '0x' + req.query['manager-id'];
    const query = `SELECT title, description, date FROM announcements where managerID = ${managerID};`;
    const announcements = await executeQuery(query);
    res.send(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

managerRouter.post('/make-announcement', async (req, res) => {
  try {
    const managerID = Buffer.from(req.query['manager-id'], 'hex')
    const title = req.body['title'];
    const description = req.body['description'];
    const date = getDate();
    const query = `INSERT INTO announcements (title, description, managerID, date) values (?,?,?,?);`;
    const values = [title, description, managerID, date];
    await executeQuery(query, values);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = managerRouter;
