# v0.8.🚧
*🚧🚧🚧🚧-🚧🚧-🚧🚧*

## Requirements
- NodeJS (v12.16 or above) 👈 Installer will offer to install NodeJS v14.17.6-x64 for you
- MS SQL (v2012 or above)
- Microsoft Windows (v2012 or above)

## Setup
### Microsoft Windows

#### 1. Download and Install
- Get [EZ-Cloud.v0.8.🚧.Server-Installer.exe](https://github.com/TonyMasse/EZ-Cloud/releases/download/v0.8.🚧/EZ-Cloud.v0.8.🚧.Server-Installer.exe)
- Run it

#### 2. Create your configuration
- During the Install, please provide the correct credentials for SQL
- During the Install, please provide the credentials for the new user ezAdmin

#### 3. Connect to the EZ Server
- Open https://`<ip-of-the-EZ-server>`:8400/
- Login with `ezAdmin` and the password you specified during the installation

## Advice: Create and use a non privileged User
- Login as `ezAdmin`
- Click **Admin** (just above **Settings**, on the bottom left)
- Click **Manage User Accounts**
- Click **Add New Account**
- Provide a Username and Password
- Select **Role**: `User` (or any other non-privileged Role you might have created)
- Click **Add New User Account**
- Click **Logout**
- Log back in as the new non-privileged user

## Know issues :bug: :beetle:
- Will fail silently (to check OC status and version, deploy Shipper, start Tail, Deploy, etc...) if SSH Credentials are incorrect
- Will fail to deploy log shippers if not using the `root` account or an account with full `sudo` access

## Report a bug or issue
- Use the [Issues](https://github.com/TonyMasse/EZ-Cloud/issues) on GitHub

Enjoy,

Tony
