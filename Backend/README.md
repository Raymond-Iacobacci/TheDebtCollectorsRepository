# Backend Documentation

## Directory Structure
The Backend is split into three main subdirectories. The **manager** directory contains all the API routes that are called directly by a manager.
The **tenant** directory holds the API routes that are called directly by a tenant. Lastly, the **user** directory contains API calls
that are needed by all users of the application, regardless if they are a tenant or a manager. For example, posting a comment on a request should be the same regardless if you are a tenant or a manager. 

*app.js* mounts the routers for the subdirectories, enables CORS, and allows the server to listen on port 8080. The *utils.js* file contains helper functions that are used in multiple files. The most notable functions from here are getDate() and executeQuery() which are used signficantly throughout the application. 

## Working with UUIDs
The database stores the tenantID, managerID, requestID, commentID, and attachmentID as binary(16) UUIDs. The frontend retrieves and returns these UUID's without the '0x' in front. When performing a SELECT query with a UUID in the databse, you must insert the '0x' at the beginning of the ID. When performing an INSERT query with a UUID, you must use Buffer.from(UUID, 'hex') as the data you are inserting. (Note that the UUID should NOT have '0x' in this case). 

## Developing/Testing code locally
1. From the root directory, enter the command: cd Backend
2. Enter the command: npm install\
This command will install the dependencies listed in the package.json and populate the node_modules folder.
3. Enter the command: npm start\
You should now have a localhost started on port 8080. You can now test API calls using postman or other services.

**WARNING**: When testing code locally, ensure the DB_HOST field in the Backend/.env file is set to the databases's public IP address. Also make sure your current IP address is listed as an authorized network for the Cloud SQL database. If either of these conditions are not met, your application will not connect to the database.
