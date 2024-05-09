
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

// const interval = 86400;
// setInterval(crawlForLatePayments, interval);

// function getAbbrDate() {
//   const date = new Date();
//   return date.toISOString().split('T')[0];
// }

// async function crawlForLatePayments() {
//   var tenantsWithLatePayments = await selectQuery(`SELECT id, tenantID, description, time FROM paymentsLedger WHERE type = 'Charge' AND idLate is NULL AND paidAmount > 0 AND DATEDIFF('${getAbbrDate()}', time) < 11`); // TODO: change to < 11
//   console.log(tenantsWithLatePayments);

//   for (let tenantWithLateCharges of tenantsWithLatePayments) {

//     const chargeBalance = await selectQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${charge}' AND tenantID=${uuidToString(tenantWithLateCharges.tenantID)}`);
//     const paymentBalance = await selectQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${payment}' AND tenantID=${uuidToString(tenantWithLateCharges.tenantID)}`);
//     let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0);
//     balance = 10 + balance;
    
//     const time = tenantWithLateCharges.time
//     const parts = time.toISOString().split('T');
//     const datePart = parts[0];
//     const timeFinal = `${datePart.split('-')[1]}/${datePart.split('-')[2]}/${datePart.split('-')[0]}`;

//     const query = "INSERT INTO paymentsLedger (type, description, time, amount, tenantID, idLate, balance, paidAmount) VALUES (?,?,?,?,?,?,?,?);";
//     const values = ['Charge', `Late: ${tenantWithLateCharges.description}, ${timeFinal}`, getDatePayment(), 10, tenantWithLateCharges.tenantID, tenantWithLateCharges.id, balance, 10];
//     await insertQuery(query, values);


//   }
// }

managerRouter.get("/get-report", async (req, res) => {
  try {
    console.log(`This is the date: ${getDate()}`);
    const managerID = "0x" + req.query["manager-id"];
    const reportData = await generateReportData(managerID);
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function generateReportData(managerID) {
  const reportData = {};
  const totalPaidRent = await selectQuery(
    `select SUM(amount) as amount from (select type, description, amount from paymentsLedger p INNER JOIN (select tenantID from tenants where managerID = ${managerID}) AS t where t
.tenantID = p.tenantID) AS final where final.type='Payment' and final.description='Rent'`
  );
  reportData.income_rent = totalPaidRent[0].amount || 0;


  const totalPaidUtilities = await selectQuery(
    `select SUM(amount) as amount from (select type, description, amount from paymentsLedger p INNER JOIN (select tenantID from tenants where managerID = ${managerID}) AS t where t
.tenantID = p.tenantID) AS final where final.type='Payment' and final.description='Utilities'`);
  reportData.income_utilities = totalPaidUtilities[0].amount || 0;


  const totalPaidOther = await selectQuery(
    `select SUM(amount) as amount from (select type, description, amount from paymentsLedger p INNER JOIN (select tenantID from tenants where managerID = ${managerID}) AS t where t
.tenantID = p.tenantID) AS final where final.type='Payment' and final.description='Other'`);
reportData.income_other = totalPaidOther[0].amount || 0;

  const other = await selectQuery(`
    SELECT SUM(amount) AS other
    FROM expenses WHERE type IN ('Other') and managerID = ${managerID}
  `);

  reportData.expenses_other = other[0].other || 0;

  // ------------------

  const maintenance = await selectQuery(`
  SELECT SUM(amount) AS maintenance
  FROM expenses
  WHERE type IN ('Maintenance Request') and managerID = ${managerID}
  `);
  reportData.expenses_maintenance = maintenance[0].maintenance || 0;

  const wages = await selectQuery(`
  SELECT SUM(amount) AS wages
  FROM expenses
  WHERE type IN ('Wages') and managerID = ${managerID}
  `);
  reportData.expenses_wages = wages[0].wages || 0;

  const mortgage = await selectQuery(`
  SELECT SUM(amount) AS mortgage
  FROM expenses
  WHERE type IN ('Mortgage Interest') and managerID = ${managerID}
  `);
  reportData.expenses_mortgage = mortgage[0].mortgage || 0;

  const utilities = await selectQuery(`
    SELECT SUM(amount) AS utilities
    FROM expenses
    WHERE type IN ('Utilities') and managerID = ${managerID}
  `);
  reportData.expenses_utilities = utilities[0].utilities || 0;

  // -----------------------

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
  while (amount > 0) {
      const oldestCharge = await selectQuery(`SELECT paidAmount AS oldestCharge, id FROM paymentsLedger WHERE type='Charge' AND paidAmount > 0 LIMIT 1`);
      if (oldestCharge.length === 0) {
          break;
      }
      newCharge = oldestCharge[0].oldestCharge;
      subtractAmount = Math.min(oldestCharge[0].oldestCharge, amount);
      newCharge -= subtractAmount;
      amount -= subtractAmount;
      await selectQuery(`UPDATE paymentsLedger SET paidAmount=${newCharge} WHERE id=${oldestCharge[0].id}`);
  }
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
