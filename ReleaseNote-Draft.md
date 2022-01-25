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
- During the Install, if prompted, please provide the correct credentials for SQL
- During the Install, if prompted, please provide the credentials for the new user ezAdmin

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

## Where is the documentation?
- Wiki: [Home](https://github.com/TonyMasse/EZ-Cloud/wiki/)
- Wiki: [Getting Started](https://github.com/TonyMasse/EZ-Cloud/wiki/Help#getting-started)
- Wiki: [Troubleshooting](https://github.com/TonyMasse/EZ-Cloud/wiki/Troubleshooting)

## What's new in this release?
**v0.8.0**
- [v0.8.0] Role Based Access Control
  - Users can belong to different types of Roles (by default `Admin` or `User`)
  - Any Role can be created
  - Role can be privileged or not
  - Privileged Roles can create, modify and delete Roles and User Accounts 
- [v0.8.0] Installer - Automated `ezAdmin` account creation
- [v0.8.0] Installer - Offers options to Upgrade existing (v0.6 and v0.7) deployment
- [v0.8.0] Better and more logging on the Backend for:
  - User Authentication
  - User and Role creation/updates
- [v0.8.0] General - Error messages - Add pop up with error details and pointer to online Wiki
- [v0.8.0] Mapping Editor - Warn user if Socket is not connected to Backend when trying to run a Tail
- [v0.8.0] Mapping Editor - Optimise Parsing Start/Stop:
  - Automatically start Parsing when entries are added to the Queue
  - Automatically stop Parsing when the Queue is fully processed
- [v0.8.0] Mapping Editor - Change scheduling method for the Background Processing to allow changes in the Settings to be picked up once already running
- [v0.8.0] Mapping Editor - Add Manual Import of log samples
    - Single log at a time, including Array of logs
    - Multiple logs at a time, as one per line
    - From file(s)
      - As a Single Log per file
      - As an Array of Logs per file
      - As an Set of Logs
      - Offer to direct to a Wiki help page to explain the difference
        - https://github.com/TonyMasse/EZ-Cloud/wiki/Help#ref-whatsthedifferencefileimport

**v0.8.1**
- [v0.8.1] Pipelines - Import/Export of Collection and Mapping
- [v0.8.1] Mapping Editor - Persist the "Extract Beat's .message" option
- [v0.8.1] Mapping Editor - Resurface the `.message` feature (UI, API and JQ)
- [v0.8.1] Provide feedback if failing to connect over SSH, in Open Collectors list page
  - On version check
  - On Shipper deployment

**v0.8.2**
- [v0.8.2] Collection - Add support for LogRhythm Webhook Beat (HTTP only)
- [v0.8.2] General - Error messages - Change "Error updating persistance layer" to a less misleading and more generic message
- [v0.8.🚧] 

## What has been fixed in this release?
**v0.8.1**
- [v0.8.1] Security - URL might contain directory traversal attempt
- [v0.8.1] Security - Error message returned to client is too complete:
  - The value of the URL path filename is copied into the application's response.
- [v0.8.1] Admin - Roles - Creates new duplicated Role instead of updating existing one when changing the Priviledge
- [v0.8.1] Mapping Editor - JQ small nags
  - `.message` is commented in Transform template
  - Filter uses un-cleaned Stream Name for `device_type`
- [v0.8.1] Change "priviledged" to "privileged", through out
  - Frontend - UI
  - Frontend - Actions (Store)
  - Backend - SQL Scripts
  - Backend - API
- [v0.8.1] SQL Connection seem not to close automatically, and time out only after +/-50 minutes
- [v0.8.1] Privileged access is only valid if member of Role `Admin`. Needs to change to use `isPrivileged` instead
- [v0.8.1] No version number showing in logs when in Production
- [v0.8.🚧] 

**v0.8.2**
- [v0.8.2] Security - CVE-2020-26301 - Upgrade `simple-ssh` to v1.1.0 to benefit from `ssh2` v1.5.0
- [v0.8.2] Security - Fix/upgrade several dependencies with low and medium risks
- [v0.8.2] Security - Fix several low and medium security risks in EZ Backend source code
- [v0.8.2] Shipper installer - Content Security Policy prevents download of `shippers_url.json` from GitHub
- [v0.8.🚧] 

## Know issues :bug: :beetle:
- Will fail silently (start Tail, Deploy, etc...) if SSH Credentials are incorrect
- Will fail to deploy log shippers if not using the `root` account or an account with full `sudo` access
- If using the Fan Out feature - OpenCollector will refuse to import JQ Transform

## Report a bug or issue
- Use the [Issues](https://github.com/TonyMasse/EZ-Cloud/issues) on GitHub

Enjoy,

Tony
