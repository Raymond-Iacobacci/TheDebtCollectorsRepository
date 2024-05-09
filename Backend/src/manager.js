
const express = require("express");
const managerRouter = express.Router();
const { selectQuery, insertQuery, uuidToString } = require("./db");
const { sendEmail } = require("./sendEmail");
const charge = 'Charge';
const payment = 'Payment';
managerRouter.use(express.json());

function getDate() {
  const date = new Date();
  return date.toISOString();
}

// const intervalMinutes = 1;
// const interval = intervalMinutes * 60000;
// const i = 10000
// const timerID = setInterval(fillRentPayments, interval);

// async function fillRentPayments(){
//     const tenantPayments = await selectQuery(`SELECT * FROM tenants where rents IS NOT NULL`);
//     for (const payment of tenantPayments) {
//         const { rents, type, tenantID } = payment;
//         const time = getDate();
//         await insertQuery("INSERT INTO paymentsDue (time, amount, type, tenantID) VALUES (?, ?, ?, ?)", [time, rents, 'Rent', tenantID]);
//     }
//     console.log(tenantPayments);
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
      SELECT type, description, amount, time
      FROM paymentsLedger p
      INNER JOIN (
        SELECT tenantID
        FROM tenants
        WHERE managerID = ${managerID}
      ) AS t ON t.tenantID = p.tenantID
    ) AS final
    WHERE final.type = 'Payment' AND final.description = '${description}' AND final.time >= '${formattedStartDate}' AND final.time <= '${formattedEndDate}';`;
}

function getExpensesQuery(managerID, type, startDate, endDate) {
  return `
    SELECT SUM(amount) AS ${type.toLowerCase().replace(/\s/g, '_')}
    FROM expenses
    WHERE type IN ('${type}')
    AND managerID = ${managerID} AND datePosted >= '${startDate.toISOString()}' AND datePosted <= '${endDate.toISOString()}';`;
}

async function performQueries(managerID, startDate, endDate){
  const reportDataObject = {} 
  
  const totalPaidRent = await selectQuery(getPaymentsQuery(managerID, 'Rent', startDate, endDate));
  const totalPaidUtilities = await selectQuery(getPaymentsQuery(managerID, 'Utilities', startDate, endDate));
  const totalPaidOther = await selectQuery(getPaymentsQuery(managerID, 'Other', startDate, endDate));

  reportDataObject.income_rent = totalPaidRent[0].amount || 0;
  reportDataObject.income_utilities = totalPaidUtilities[0].amount || 0;
  reportDataObject.income_other = totalPaidOther[0].amount || 0;

  const expenses_other = await selectQuery(getExpensesQuery(managerID, 'Other', startDate, endDate));
  const expenses_maintenance = await selectQuery(getExpensesQuery(managerID, 'Maintenance Request', startDate, endDate));
  const expenses_wages = await selectQuery(getExpensesQuery(managerID, 'Wages', startDate, endDate));
  const expenses_mortgage = await selectQuery(getExpensesQuery(managerID, 'Mortgage Interest', startDate, endDate));
  const expenses_utilities = await selectQuery(getExpensesQuery(managerID, 'Utilities', startDate, endDate));
  
  reportDataObject.expenses_other = expenses_other[0].other || 0;
  reportDataObject.expenses_maintenance = expenses_maintenance[0].maintenance_request || 0;
  reportDataObject.expenses_wages = expenses_wages[0].wages || 0;
  reportDataObject.expenses_mortgage = expenses_mortgage[0].mortgage_interest || 0;  
  reportDataObject.expenses_utilities = expenses_utilities[0].utilities || 0;
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

managerRouter.get("/get-tenant-payments", async (req, res) => {
  try {
    const managerID = "0x" + req.query["manager-id"];
    const tenantsQuery = await selectQuery(
      `SELECT firstName, lastName, address, amount, type, p.tenantID, timeAssigned FROM paymentsDue p INNER JOIN tenants t ON p.tenantID = t.tenantID WHERE t.managerID =${managerID};`
    );
    for (let tenant of tenantsQuery) {
      tenant.tenantID = tenant.tenantID.toString("hex").toUpperCase();
    }
    res.send(tenantsQuery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
function getDatePayment() {
    const moment = require("moment-timezone");
    return moment().tz("America/Los_Angeles").format("YYYY-MM-DD");
}
function getDateTenant() {
  const moment = require("moment-timezone");
  return moment().tz("America/Los_Angeles").format();
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
    const managerResult = await selectQuery(
      `SELECT firstName,lastName FROM managers where managerID = ${"0x" + managerId
      };`
    );

    const currentDate = getDateTenant();
    //const timestamp = currentDate.getTime();
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
    await insertQuery(query, values);

    const message = `Hello ${firstName} ${lastName} welcome to the DebtCollectors.`;
    sendEmail(email, 'Test Subject', message)
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
  console.log(amount);
  let newCharge = 0;
  let subtractAmount = 0;
  do {
      const oldestCharge = await selectQuery(`SELECT paidAmount AS oldestCharge, id FROM paymentsLedger WHERE type='Charge' AND paidAmount > 0 LIMIT 1`);
      if (oldestCharge.length === 0) {
          break;
      }
      newCharge = oldestCharge[0].oldestCharge;
      subtractAmount = Math.min(oldestCharge[0].oldestCharge, amount);
      newCharge -= subtractAmount;
      amount -= subtractAmount;
      await selectQuery(`UPDATE paymentsLedger SET paidAmount=${newCharge} WHERE id=${oldestCharge[0].id}`);
  } while (amount > 0);
}

managerRouter.post("/create-payment", async (req, res) => {
    try {
        const email = req.body.email;
        const description = req.body.description;
        const amount = req.body.amount;
        const currentDate = getDatePayment();
        const tenantID = await selectQuery(
            `SELECT tenantID from tenants where email='${email}';`
        );
        
        const chargeBalance = await selectQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${charge}' AND tenantID=${uuidToString(tenantID[0].tenantID)}`);
        const paymentBalance = await selectQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${payment}' AND tenantID=${uuidToString(tenantID[0].tenantID)}`);
        // console.log(`This is the amount: ${amount}`);
        // console.log(chargeBalance[0].amount-paymentBalance[0].amount)
        let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0);
        let temp = balance;
        balance = Number(amount) + balance;
        const query = "INSERT INTO paymentsLedger (type, description, time, amount, tenantID, balance, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const values = [charge, description, currentDate, amount, tenantID[0].tenantID, balance, amount];
        await insertQuery(query, values);
        
        updatePayment(-temp);


        
        // const message = `Hello ${firstName} ${lastName} welcome to the DebtCollectors.`;
        // sendEmail(email, 'Test Subject', message)
        //     .then(data => {
        //         res.send('Email sent successfully:');
        //     })
        //     .catch(error => {
        //         res.send('Error sending email:');
        //     });
        res.send(currentDate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

managerRouter.get("/get-tenants", async (req, res) => {
  try {
    const managerID = req.query["manager-id"];
    const tenantsList = await selectQuery(
      `SELECT firstName, lastName, email, address from tenants where managerID = ${"0x" + managerID
      }`
    );
    const formattedData = tenantsList.map((row) => ({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      address: row.address,
    }));
    res.send(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

managerRouter.get('/get-expenses', async (req, res) => {
  try {
    const managerID = '0x' + req.query['manager-id'];
    const expenses = await selectQuery(`SELECT managerID, amount, type, description, datePosted, requestID FROM expenses where managerID = ${managerID};`);
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
    const datePosted = getDate();
    if (req.body.requestID !== null) {
      requestID = Buffer.from(req.body['requestID'], 'hex');
    }
    const query = `INSERT INTO expenses (managerID, amount, type, description, datePosted, requestID) VALUES (?, ?, ?, ?, ?, ?);`;
    const values = [managerID, amount, type, description, datePosted, requestID];
    await insertQuery(query, values);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = managerRouter;
