# Backend Documentation

## Directory Structure
The Backend is split into three main subdirectories. The **manager** directory contains all the API routes that are called directly by a manager.
The **tenant** directory holds the API routes that are called directly by a tenant. Lastly, the **user** directory contains API calls
that are needed by all users of the application, regardless if they are a tenant or a manager. For example, posting a comment on a request should be the same regardless if you are a tenant or a manager. 

## app.js
*app.js* mounts the routers for the subdirectories, enables CORS, and allows the server to listen on port 8080. 

## utils.js
*utils.js* file contains helper functions that are used in multiple files. The most notable functions from here are getDate() and executeQuery() which are used signficantly throughout the application. 

## Requests
Tenants can post new requests with an additional attachment and description. This inserts a new entry into the requests table in the database
with a new requestID (primary key, binary(16)). This entry contains the tenantID and managerID (binary(16)) associated with the request, along with an 'Unresolved' status. The description, type, and date are stored in the request as well. The information for posting a request can be found in t

### Comments
Any 


## Transactions
### Payments Table
The table contains 9 fields : id, date, description, amount, balance, idLate, tenantID, type, paidAmount. The the id is primary key for each entry. The balance is the current balance of the ledger at that entry. The idLate field is only used for late charges. tenantID specifies which tenant the transactio belongs to. The paidAmount field is only used for charges and is initialized to the amount value upon charge creation. The type is specifies wether it is a credit, charge, or payment. 

### Creating Charge.
The manager can create charges based on monthly requirements



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
