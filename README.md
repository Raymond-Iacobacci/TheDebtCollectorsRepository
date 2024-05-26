# Setting Up the Google Cloud Project on the Google Cloud Console
This documentation provides a step-by-step guide to setting up a Google Cloud Project on the Google Cloud Console, integrating Cloud SQL, and setting up OAuth 2.0.

## Prerequisites
- A Google account
- Billing information 

### 1. Sign in to Google Cloud Console
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in using your Google account credentials.

### 2. Create a New Project
1. Click the project drop-down menu located next to the Google Cloud Platform logo
2. Click on **New Project**
3. **Configure the Project**:
   - **Project Name**: Enter a name for your project (e.g., "Property Management Suite").
   - **Billing Account**: Select a billing account if prompted (required for Cloud SQL and Cloud Run).
   - **Organization**: If applicable, select your organization.
   - **Location**: If applicable, select the folder or organization.
4. Click **Create**

### 3. Set Up Billing
1. In the left-hand navigation pane, click on **Billing**
2. **Link Billing Account**:
   - If prompted, link your billing account to the new project.
   - If no billing account is available, follow the prompts to create and configure a new billing account.

### 4. Enable APIs and Services
1. **APIs & Services Dashboard**:
   - In the left-hand navigation pane, click on **APIs & Services** > **Dashboard**.
2. **Enable APIs**:
   - Click on **Enable APIs and Services**.
   - Search for and enable the APIs required for your project:
     - Compute Engine API
     - Cloud SQL Admin API
     - OAuth 2.0 Client IDs API
   - Click on each API and then click **Enable**.

### 5. Configure IAM (Identity and Access Management)
1. **Navigate to IAM & Admin**:
   - In the left-hand navigation pane, click on **IAM & Admin** > **IAM**.
2. **Add Members**:
   - Click on **Add**.
   - Enter the email address of the user you want to add.
   - Select a role for the user (e.g., Project Editor, Viewer, etc.).
   - Click **Save**.

### 6. Setup Cloud SQL
1. **Navigate to Cloud SQL**:
   - In the left-hand navigation pane, click on **SQL**.
2. **Create a New Instance**:
   - Click **Create Instance**.
   - Select the database engine you want to use, in this case MySQL.
3. **Configure Instance Settings**:
   - **Instance ID**: Enter a unique identifier for your instance.
   - **Password**: Set a password for the root user.
   - **Region**: Select the region where you want your instance to be located.
   - **Zone Availability**: Choose if you want a single-zone or multi-zone instance.
   - Configure any additional settings as needed.
   - Click **Create Instance**.
4. **Set Up Databases and Users**:
   - Once the instance is created, click on the instance name.
   - **Databases**: Under the **Databases** tab, click **Create Database** and enter the database name.
   - **Users**: Under the **Users** tab, click **Add User Account** and configure the user details.

### 7. Integrate OAuth 2.0
1. **Navigate to the Credentials Page**:
   - In the left-hand navigation pane, click on **APIs & Services** > **Credentials**.
2. **Create OAuth 2.0 Client IDs**:
   - Click on **Create Credentials** and select **OAuth 2.0 Client ID**.
3. **Configure Consent Screen**:
   - If this is your first time creating an OAuth 2.0 Client ID, you will be prompted to configure the consent screen.
   - **OAuth Consent Screen**: Provide application name, support email, and other required information.
   - **Scopes**: Add the necessary scopes required for your application.
   - **Test Users**: Add any test users who will have access to the application during the testing phase.
   - Click **Save and Continue**.
4. **Set Up OAuth 2.0 Client ID**:
   - **Application Type**: Select the application type (e.g., Web application).
   - **Name**: Enter a name for the OAuth 2.0 client ID.
   - **Authorized JavaScript Origins**: Enter the origins that are allowed to use this client ID (usually this will be the link to the application as well as your localhost server).
   - **Authorized Redirect URIs**: Enter the URIs to which the OAuth 2.0 server can send responses (usually this will be the link to the application as well as your localhost server).
   - Click **Create**.
5. **Integrate Client ID and Secret into Application**:
   - After creating the client ID, you will see the **Client ID** and **Client Secret**. 
   - Navigate to the Backend/.env file.
   - Paste the Client ID and Client Secret into the .env file.
6. **Integrate OAuth 2.0 in Your Application**:
   - Use the client ID and client secret in your application to set up OAuth 2.0 authentication.
   - Follow the specific instructions for your programming language or framework to implement the OAuth 2.0 flow (e.g., obtaining authorization codes, exchanging them for access tokens).

# Integrating Cloud SQL in your project
1. **Navigate to the Cloud SQL page on the Google Console**:
   - On the Google Console, click on the navigation pane > **Cloud SQL**.
2. **Retrieve Public and Private IP Address**
   - 

# Deploying containers to Cloud Run