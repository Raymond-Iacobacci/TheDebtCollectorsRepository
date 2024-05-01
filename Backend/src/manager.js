const express = require("express");
const managerRouter = express.Router();
const { selectQuery, insertQuery, uuidToString } = require("./db");
const { sendEmail } = require("./sendEmail");
const charge = 'Charge';
const payment = 'Payment';
managerRouter.use(express.json());

function getDate(){
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
        const reportData = await generateReportData(managerID);
        res.json(reportData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function generateReportData(managerID) {
    const reportData = {};
    console.log(`This is the managerID: ${managerID}`);
    const totalPaidRent = await selectQuery(
        `SELECT SUM(amount) AS totalPaidRent FROM paymentsMade WHERE type = 'Rent' AND tenantID IN (SELECT tenantID FROM tenants WHERE managerID = ${managerID})`
    );
    reportData.paidRent = totalPaidRent[0].totalPaidRent || 0;
    const overdueRent = await selectQuery(`
    SELECT SUM(amount) AS overdueRent
    FROM paymentsDue
    WHERE type = 'Rent' AND late = 'LATE' AND tenantID IN (
      SELECT tenantID
      FROM tenants
      WHERE managerID = ${managerID}
    )
  `);
    reportData.overdueRent = overdueRent[0].overdueRent || 0;
    const pendingRent = await selectQuery(`
    SELECT SUM(amount) AS pendingRent
    FROM paymentsDue
    WHERE type = 'Rent' AND late = 'NOT LATE' AND tenantID IN (
      SELECT tenantID
      FROM tenants
      WHERE managerID = ${managerID}
    )
  `);
    reportData.pendingRent = pendingRent[0].pendingRent || 0;
    const totalPaidUtilities = await selectQuery(`
    SELECT SUM(amount) AS totalPaidUtilities
    FROM paymentsMade
    WHERE type IN ('Electricity', 'Water') AND tenantID IN (
      SELECT tenantID
      FROM tenants
      WHERE managerID = ${managerID}
    )
  `);
    reportData.paidUtilities = totalPaidUtilities[0].totalPaidUtilities || 0;
    const overdueUtilities = await selectQuery(`
    SELECT SUM(amount) AS overdueUtilities
    FROM paymentsDue
    WHERE type IN ('Electricity', 'Water') AND late = 'LATE' AND tenantID IN (
      SELECT tenantID
      FROM tenants
      WHERE managerID = ${managerID}
    )
  `);
    reportData.overdueUtilities = overdueUtilities[0].overdueUtilities || 0;
    const pendingUtilities = await selectQuery(`
    SELECT SUM(amount) AS pendingUtilities
    FROM paymentsDue
    WHERE type IN ('Electricity', 'Water') AND late = 'NOT LATE' AND tenantID IN (
      SELECT tenantID
      FROM tenants
      WHERE managerID = ${managerID}
    )
  `);
    reportData.pendingUtilities = pendingUtilities[0].pendingUtilities || 0;
    const totalPaidUpkeep = await selectQuery(`
    SELECT SUM(amount) AS totalPaidUpkeep
    FROM paymentsMade
    WHERE type NOT IN ('Rent', 'Electricity', 'Water') AND tenantID IN (
      SELECT tenantID
      FROM tenants
      WHERE managerID = ${managerID}
    )
  `);
    reportData.paidUpkeep = totalPaidUpkeep[0].totalPaidUpkeep || 0;
    const overdueUpkeep = await selectQuery(`
  SELECT SUM(amount) AS overdueUpkeep
  FROM paymentsDue
  WHERE type NOT IN ('Rent', 'Electricity', 'Water') AND late = 'LATE' AND tenantID IN (
    SELECT tenantID
    FROM tenants
    WHERE managerID = ${managerID}
  )
`);
    reportData.overdueUpkeep = overdueUpkeep[0].overdueUpkeep || 0;
    const pendingUpkeep = await selectQuery(`
SELECT SUM(amount) AS pendingUpkeep
FROM paymentsDue
WHERE type NOT IN ('Rent', 'Electricity', 'Water') AND late = 'NOT LATE' AND tenantID IN (
  SELECT tenantID
  FROM tenants
  WHERE managerID = ${managerID}
)
`);
    reportData.pendingUpkeep = pendingUpkeep[0].pendingUpkeep || 0;

    return reportData;
}

managerRouter.get("/get-tenant-payments", async (req, res) => {
    try {
        const managerID = "0x" + req.query["manager-id"];
        const tenantsQuery = await selectQuery(
            `SELECT firstName, lastName, address, amount, type, p.tenantID, time FROM paymentsDue p INNER JOIN tenants t ON p.tenantID = t.tenantID WHERE t.managerID =${managerID};`
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
         balance = Number(amount) + balance;
        const query = "INSERT INTO paymentsLedger (type, description, time, amount, tenantID, balance) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [charge, description, currentDate, amount, tenantID[0].tenantID, balance];
        await insertQuery(query, values);
        
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

managerRouter.get('/get-expenses', async(req,res) => {
    try{
        const managerID = '0x' + req.query['manager-id'];
        const expenses = await selectQuery(`SELECT managerID, amount, type, description, datePosted, requestID FROM expenses where managerID = ${managerID};`);
        if(!expenses){
          res.status(404).json({ error: 'no expenses for this manager' });
          return;
        }
        for(let expense of expenses){
          expense.managerID = expense.managerID.toString('hex').toUpperCase();
          if(expense.requestID !== null){
              expense.requestID = expense.requestID.toString('hex').toUpperCase();
          }
        }
        res.send(expenses);  
      }catch(error){
        res.status(500).json({error: error.message});
      }
  });
  
  managerRouter.post('/add-expense', async(req,res) => {
    try{
      const managerID = Buffer.from(req.query['manager-id'], 'hex');
      const amount = req.body.amount;
      const type = req.body.type;
      const description = req.body.description;
      let requestID = null;
      const datePosted = getDate();
      if(req.body.requestID !== null){
        requestID = Buffer.from(req.body['requestID'], 'hex');
      }
      const query = `INSERT INTO expenses (managerID, amount, type, description, datePosted, requestID) VALUES (?, ?, ?, ?, ?, ?);`;
      const values = [managerID, amount, type, description, datePosted, requestID];
      await insertQuery(query, values);
      res.sendStatus(200);  
      } catch(error){
        res.status(500).json({error: error.message});
      }
});

module.exports = managerRouter;