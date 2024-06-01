## Developing/Testing code locally
1. From the root directory, enter the command: cd Backend\
2. Enter the command: npm install\
This command will install the dependencies listed in the node_modules.
3. Enter the command: npm start\
You should now have a localhost started on port 8080\

**WARNING**: Make sure the DB_HOST field in the Backend/.env file is set to the databases's public IP address. Also make sure your current IP address is listed as an authorized network for the database. If either of these conditions are not met, your application will not connect to the database.