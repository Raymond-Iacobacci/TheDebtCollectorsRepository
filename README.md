# Setting Up the Google Cloud Project on the Google Cloud Console
This documentation provides a step-by-step guide to setting up a Google Cloud Project on the Google Cloud Console, integrating Cloud SQL, and deploying Docker containers to Cloud Run.

## Prerequisites
- A Google account
- Billing information 

### 1. Sign in to Google Cloud Console
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in using your Google account credentials.

### 2. Create a New Project
1. Click the project drop-down menu located next to the Google Cloud Platform logo.
2. Click on **New Project**.
3. Configure the Project:
   - **Project Name**: Enter a name for your project (e.g., "Property Management Suite").
   - **Billing Account**: Select a billing account if prompted (required for Cloud SQL and Cloud Run).
   - **Organization**: If applicable, select your organization.
   - **Location**: If applicable, select the folder or organization.
4. Click **Create**.

### 3. Set Up Billing
1. In the left-hand navigation pane, click on **Billing**.
2. Link Billing Account:
   - If prompted, link your billing account to the new project.
   - If no billing account is available, follow the prompts to create and configure a new billing account.

### 4. Enable APIs and Services
1. In the left-hand navigation pane, click on **APIs & Services** > **Dashboard**.
2. Enable APIs:
1. Click on **Enable APIs and Services**.
2. Search for and enable the APIs required for your project. Here are some of the main ones:
   - Compute Engine API
   - Cloud SQL Admin API
   - OAuth 2.0 Client IDs API
3. Click on each API and then click **Enable**.

### 5. Configure IAM (Identity and Access Management)
1. In the left-hand navigation pane, click on **IAM & Admin** > **IAM**.
2. Click on **Add**.
3. Enter the email address of the user you want to add.
4. Select a role for the user (e.g., Project Editor, Viewer, etc.).
5. Click **Save**.

### 6. Setup Cloud SQL
1. In the left-hand navigation pane, click on **Cloud SQL**.
2. Create a New Instance:
1. Click **Create Instance**.
2. Select the database engine you want to use (MySQL).
3. Configure Instance Settings:
   - **Instance ID**: Enter a unique identifier for your instance.
   - **Password**: Set a password for the root user.
   - **Region**: Select the region where you want your instance to be located.
   - **Zone Availability**: Choose if you want a single-zone or multi-zone instance.
   - Configure any additional settings as needed.
1. Click **Create Instance**.
4. Set Up Databases and Users:
1. Click on the instance name.
2. Under the **Databases** tab, click **Create Database** and enter the database name.
3. Under the **Users** tab, click **Add User Account** and configure the user details.

### 7. Integrate OAuth 2.0
1. In the left-hand navigation pane, click on **APIs & Services** > **Credentials**.
2. Click on **Create Credentials**.
3. Select **OAuth 2.0 Client ID**.
4. Configure Consent Screen:
   - If this is your first time creating an OAuth 2.0 Client ID, you will be prompted to configure the consent screen.
   - **OAuth Consent Screen**: Provide application name, support email, and other required information.
   - **Scopes**: Add the necessary scopes required for your application.
   - **Test Users**: Add any test users who will have access to the application during the testing phase.
1. Click **Save and Continue**.
5. Set Up OAuth 2.0 Client ID:
   - **Application Type**: Select the application type (e.g., Web application).
   - **Name**: Enter a name for the OAuth 2.0 client ID.
   - **Authorized JavaScript Origins**: Enter the origins that are allowed to use this client ID (usually this will be the link to the application as well as your localhost server).
   - **Authorized Redirect URIs**: Enter the URIs to which the OAuth 2.0 server can send responses (usually this will be the link to the application as well as your localhost server).
1. Click **Create**.
6. Integrate Client ID and Secret into Application:  After creating the client ID, you will see the **Client ID** and **Client Secret**. 
1. Navigate to the Backend/.env file.
2. Paste the Client ID in the GOOGLE_CLIENT_ID field.
3. Paste Client Secret into the GOOGLE_CLIENT_SECRET field.

# Integrating Cloud SQL in your project
1. On the Google Console, click on the navigation pane > **Cloud SQL**.
2. Retrieve Public and Private IP Address
If you are connecting to Cloud SQL in your application, your project can be in either of the two states:
- The application is deployed on a Cloud Run container
   - In this case, before you deploy your container to Cloud Run, your DB_HOST field in the Backend/.env file must be set to the Private IP address
- The application is being run on a localhost for testing
   - In this case, the DB_HOST field in the Backend/.env file must be set to the Public IP address.
   - Also, to connect locally to the Cloud SQL database when testing, your current IP Address must be in the list of authorized networks for the database.  Note: If you don't add your IP address to this list, you won't be able to connect to the database.

## Adding your IP Address as an authorized network.
1. Find your current IP address from [Google Cloud Console](https://whatismyipaddress.com/).
2. On the Google Console, Click on the Navigation Menu > **SQL**.
3. Select the database for your project.
4. Click on the **Connections** tab.
5. Click on the **Networking** tab.
6. Click on **Add A Network**.  A **New Network** box will appear.
7. Enter the network name and IP address with the appropriate CIDR notaion.
8. Click **Done** on the New Network box.
9. Click **Save**.

# Deploying containers to Cloud Run
