# Backend Documentation

## Directory Structure
The Backend is split into three main subdirectories. The *manager* directory contains all the API routes that are called directly by a manager.
The *tenant* directory holds the API routes that are called directly by a tenant. Lastly, the *user* directory contains API calls
that are needed by all users of the application, regardless if they are a tenant or a manager. For example, posting a comment on a request should be the same regardless if you are a tenant or a manager. 

## app.js
*app.js* mounts the routers for the subdirectories, enables CORS, and allows the server to listen on port 8080. 

## utils.js
*utils.js* file contains helper functions that are used in multiple files. The most notable functions from here are getDate() and executeQuery() which are used signficantly throughout the application. 

## Requests
Tenants can post new requests with an additional attachment and description. This inserts a new entry into the *requests* table in the database. The *requests* table has the following features:
- requestID - (primary key) automatically generated UUID of request
- description - extra information about request
- tenantID - UUID of tenant
- managerID - UUID of manager
- status - current status of request (startes as 'Unresolved')
- date - date of request
- type - optional category of request

The route for making a new request can be found in *tenant/requests.js*. 

### Comments
Any person associated with the request (the manager or tenant) should be able to comment on the request. When a comment is added, a new entry is inserted into the comments table of the database. The *comments* table has the following attributes: 
- commentID - (primary key) automatically generated UUID of the comment
- requestID  - UUID of the request
- date - date of comment
- comment - comment string itself
- userID - manager or tenant UUID of the comment

The routes for posting and retrieving comments is found in *user/requests.js*.

### Attachments
Each request currently has an optional attachment associated with it when posting the request. When the new request is made with an attachment, an entry is inserted into the *attachments* table in the database. *attachments* has the following attributes: 
- attachmentID - (primary key) automatically generated UUID of attachment
- title - attachment title (same as request)
- description - attachment description (same as request)
- attachment - actual attachment stored in a BLOB
- requestID - UUID of request that attachment is stored on
- date (date). 

The attachment itself is stored as a BLOB in the database. When the attachments are retrieved from the middleware, they are converted into base64 format and sent to the frontend. The API for inserting the attachment is found in the new-request route in tenant/requests.js, and the get-attachments route can be found in user/requests.js.

## Expenses
The manager can add and track expenses associated with their property. Currently there are 5 different types of expenses: Maintenence Requests, Utilities, Wages, Mortgage Interest, Other. When a manager adds an expense, a new entry is inserted into the *expenses* table. These are the following attributes of *expenses*: 
- expenseID - (primary key) automatically generated int
- managerID - UUID of manager
- amount - cost of expense 
- type - (maintenance request, utitlities, other, wages, etc.) 
- description - description of expense
- date - when expense was added
- requestID - The requestID is always null UNLESS the expense is associated with a particular request. In that case, the requestID must be referenced here.

The details of these routes can be found in manager/expenses.js.

## Reports
The manager has a *reports* tab in left-hand side of the view. The report is split up into three different categories: 
- Income (payments from tenants)
  - Rent
  - Utilities
  - Other
- Expenses (costs of the manager)
  - Maintenence requests
  - Mortgage Interest
  - Utilities
  - Wages
  - Other
- Credits (credits that manager gives to tenants)

The report has three types of schedules that can be displayed:
- Monthly (Jan, Feb, Mar, ... Dec)
- Quarterly (Jan - Mar, Apr - Jun, Jul - Sep, Oct - Dec)
- Yearly (Year to date)

The SQL queries and functions to generate this report can be found in *manager/report.js*. 

## Transactions
### Payments Table
The table contains 9 fields : *id*, *date*, *description*, *amount*, *balance*, *idLate*, *tenantID*, *type*, *paidAmount*.

- id - Primary key.
- date - Time of transaction.
- description - Describes the transaction.
- amount - Amount transacted.
- Balance - The total balance from the first entry to the current entry.
- idLate - If and only if there is a late charge then idLate is initialized and refers to the charge which is overdue.
- tenantID - The id of the tenant the transactions are carried out for. 
- type - Either 'Charge', 'Credit', or 'Payment'.
- paidAmount - Initialized only for charges and refers to the amount of charge that is paid out. 

### Creating Charge
The manager can create charges relating to rents, maintenance, utilities and other necessities. Calling the create charge method will first insert a charge into the *paymentsLedger* table. Then it will call the *updatePayments* function that will check if there is any previous credit that can pay out the charge. If completed successfully it will return the date. 

### Creating Payment
The tenant can make a payment to cover charges or store credit for future charges. Calling the make payment route will first call the *updatePayment* function which will cover the appropriate number of charges and then insert the payment into the *paymentsLedger* table.

### Creating Credit
The manager can assign credit to a tenant. This functions similarly to making payments. 

### updatePayment function
The *updatePayment* function loops from the oldest charge to the latest charge and finds the charges where the *paidAmount* field is not zero, indicating the charge is not paid out. It goes through such charges and covers them with the accrued credits. 

## Working with UUIDs
The database stores the tenantID, managerID, requestID, commentID, and attachmentID as binary(16) UUIDs. When the middleware recieves a UUID from the frontend in the query or body parameter, the UUID will not have the '0x' attached to the front. When you are performing a SELECT query in the database with the executeQuery() function, you must insert the '0x' at the front of the UUID. When performing an INSERT query with a UUID, you must use Buffer.from(UUID, 'hex') as the data you are inserting. (Note that the UUID should not include the '0x' in this case). 

## Integrating sendEmail functionality into the Backend
1. See the **Setting Up Google Cloud Functions** section in the main README.md file.
2. Once you have set up the Google Cloud Function, retrieve the URL endpoint for the function
3. Go to the Backend/utils.js file
4. Locate the sendEmail function
5. Replace the URL variable the URL endpoint for the Google Cloud Function

## Developing/Testing code locally
1. From the root directory, enter the command: cd Backend
2. Enter the command: npm install\
This command will install the dependencies listed in the package.json and populate the node_modules folder.
3. Enter the command: npm start\
You should now have a localhost started on port 8080. You can now test API calls using postman or other services.

**WARNING**: When testing code locally, ensure the DB_HOST field in the Backend/.env file is set to the databases's public IP address. Also make sure your current IP address is listed as an authorized network for the Cloud SQL database. If either of these conditions are not met, your application will not connect to the database.
