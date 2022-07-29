# v0.9.🚧
*🚧🚧🚧🚧-🚧🚧-🚧🚧*

## Requirements
- a non-HA and non-DR LogRhythm deployment (v7.5 or above)
- Ideally, one or more already configured, running and collected Open Collectors
  - Docker version 20 or above (on the Open Collectors)
### Windows Standalone version - ![Windows](/medias/Windows_logo_16x16.png "Windows")
- NodeJS (v12.16 or above) 👈 Installer will offer to install NodeJS v14.17.6-x64 for you
- MS SQL (v2012 or above) 👈 The one of your LogRhythm XM or PM
- Microsoft Windows (v2012 or above)

### Containerised version - ![Docker](/medias/Docker_logo_23x16.png "Docker")
- Docker (v20.10 or above)
- CURL

### Linux Standalone version - ![Linux](/medias/Linux_logo_14x16.png "Linux") - **EXPERIMENTAL** _(Will never be supported)_
- NodeJS (v12.16 or above)
- MS SQL (v2016 or above, on the XM or PM)

## Setup
### Docker - ![Docker](/medias/Docker_logo_23x16.png "Docker")
#### 1. Download and Run
- Two containers will be created:
  - `oc-db`: to host OC-Admin configuration
  - `oc-admin`: OC-Admin itself
- On the host's Firewall, if any, open the port TCP/8400 to allow inbound connections
- Run the following command:
```
mkdir dummyDir && cd dummyDir && curl -fsSOL https://raw.githubusercontent.com/logrhythm/EZ-Cloud/installer/pseudo_lrctl.sh && sh pseudo_lrctl.sh
```

#### 2. Create your configuration
- During the Install, when prompted, please provide a password for the new user `ocAdmin`

#### 3. Connect to the OC Admin Server
- Open https://`<ip-of-the-OC-Admin-server>`:8400/
- Login with `ocAdmin` and the password you specified during the installation

#### 4. Create your configuration
- At first login, you will be prompted to edit the connection to the SIEM database, please follow the instruction and provide the correct credentials for the MS SQL that runs on your XM or Platform Manager

### Microsoft Windows - ![Windows](/medias/Windows_logo_16x16.png "Windows")

#### 1. Download and Install
- If upgrading a previous **EZ Cloud** version to **OC Admin** v0.9.5
  - Backup your `\Program Files\EZ Server\config` folder
  - Un-install **EZ Cloud**
  - Once you have installed **OC Admin**, you want to copy the following backed up files to `\Program Files\OC Admin\config`
    - `ez-market-place.json` - As it contains your unique deployment ID
    - `secure.json` - As it contains your private key to secure the content of the SQL database
    - any of the `https.*.pem` files if you had brought in your own HTTPS certificates
- If upgrading a previous **OC Admin** version, it's a good idea to backup your `\Program Files\OC Admin\config` folder
- Get [OC-Admin.v0.9.🚧.Server-Installer.exe](https://github.com/logrhythm/EZ-Cloud/releases/download/v0.9.🚧/OC-Admin.v0.9.🚧.Server-Installer.exe)
- Run it

It's possible to install OC Admin Server onto a separate machine than the SQL Server (XM/PM)
  - If you want to use this:
    - Run the installer on the SQL server (XM/PM) first
    - Select `Only SQL Database and configuration (EZ Database)` in the drop down list on the **Select Components** screen
    - Finish the install
    - Run the installer on the Windows server where you want to run the OC Admin Server
    - Select `Full installation (OC Admin Server + EZ Database + Frontend + NodeJS)` (or whichever is the most appropriate for you) in the drop down list
    - Untick `EZ Database and SQL User` in the list of **Components**
    - Finish the install

#### 2. Create your configuration
- During the Install, if prompted, please provide the correct credentials for SQL
- During the Install, if prompted, please provide the credentials for the new user ocAdmin

#### 3. Connect to the OC Admin Server
- Open https://`<ip-of-the-OC-Admin-server>`:8400/
- Login with `ocAdmin` and the password you specified during the installation

## Advice: Create and use a non privileged User
- Login as `ocAdmin`
- Click **Admin** (just above **Settings**, on the bottom left)
- Click **Manage User Accounts**
- Click **Add New Account**
- Provide a Username and Password
- Select **Role**: `User` (or any other non-privileged Role you might have created)
- Click **Add New User Account**
- Click **Logout**
- Log back in as the new non-privileged user

## Where is the documentation?
- Wiki: [Home](https://github.com/logrhythm/EZ-Cloud/wiki/)
- Wiki: [Getting Started](https://github.com/logrhythm/EZ-Cloud/wiki/Help#getting-started)
- Wiki: [Troubleshooting](https://github.com/logrhythm/EZ-Cloud/wiki/Troubleshooting)

## What's new in this release?
**v0.9.5**
- [v0.9.5] **EZ Cloud** is now called **OC Admin** 🎉🎉🎉
  - This is part of the plan to move ~~EZ Cloud~~ OC Admin to run *on/with/as part of* the Open Collector
- [v0.9.5] Backend - Multi-platform - Same codebase now supports/builds for multiple OSes and deployment methods:
  - ![Windows](/medias/Windows_logo_16x16.png "Windows") Windows
  - ![Docker](/medias/Docker_logo_23x16.png "Docker") Docker - As a new `oc-admin` container
  - ![Linux](/medias/Linux_logo_14x16.png "Linux") Linux - **EXPERIMENTAL** _(Will never be supported)_
- [v0.9.5] Backend - Multi-platform - Logs are stored in appropriate locations
  - ![Windows](/medias/Windows_logo_16x16.png "Windows") - To Windows Event Journal (as always with EZ)
  - ![Docker](/medias/Docker_logo_23x16.png "Docker") - To the Console (to be picked by Docker, and not fill up the container's volume)
  - ![Linux](/medias/Linux_logo_14x16.png "Linux") Linux - To flat file (`/var/log/ez`)
- [v0.9.5] Backend - Multi-platform - ![Docker](/medias/Docker_logo_23x16.png "Docker") - Create a sister container `oc-db` to host PostgreSQL and store all the OC Admin configuration
- [v0.9.5] Backend - Multi-platform - ![Docker](/medias/Docker_logo_23x16.png "Docker") - Port all the SQL (EZ database) to PostgreSQL
- [v0.9.5] Backend - Multi-platform - ![Docker](/medias/Docker_logo_23x16.png "Docker") - Move MS SQL connection configuration from JSON file to record in PostgreSQL Table
  - And encrypt all the sensitive information (MS SQL Hostname, login and password)
- [v0.9.5] Backend - Multi-platform - ![Docker](/medias/Docker_logo_23x16.png "Docker") - Add API for MS SQL Connection Admin page on Frontend
- [v0.9.5] Backend - Multi-platform - ![Docker](/medias/Docker_logo_23x16.png "Docker") - Modify API endpoints to use PostgreSQL, if Database Mode is Split or PgSQL
  - Database Mode = "Split" means OC Admin config sits in PostgreSQL, but the SIEM is still to be reached via MS SQL. This is the default for ![Docker](/medias/Docker_logo_23x16.png "Docker") deployments
  - Database Mode = "MsSQL" means OC Admin config sits in MS SQL on the SIEM, and there is no PostgresSQL. This is the default for ![Windows](/medias/Windows_logo_16x16.png "Windows") deployments.
  - Database Mode = "PgSQL" means OC Admin config sits in PostgreSQL, and there is no MS SQL. This is a future state, for when the SIEM will be accessed purely by API.
- [v0.9.5] Backend - Multi-platform - ![Docker](/medias/Docker_logo_23x16.png "Docker") - Move RBAC tables and logic to PostgreSQL
- [v0.9.5] Backend - Multi-platform - ![Docker](/medias/Docker_logo_23x16.png "Docker") - Move EZ Market Place config to PostgreSQL instead of JSON file
- [v0.9.5] Backend - Multi-platform - ![Docker](/medias/Docker_logo_23x16.png "Docker") - Pull Master License ID from SIEM and store it in PostgreSQL
- [v0.9.5] Backend - Check connection to the SQL systems at start-up and keep checkin until they are all good
- [v0.9.5] Frontend - 💬 Internationalisation - Right-To-Left langauge support (For Arabic and Hebrew)
- [v0.9.5] Frontend - 💬 Internationalisation - Multilanguage support with all text internationalised in: (some langauges still need to be reviewed and corrected by native speakers, they are marked with a "🚧")
  - British English
  - French
  - Spanish (🚧)
  - German (🚧)
  - Simplified Chinese (🚧)
  - Arabic (🚧)
  - Korean (🚧)
  - Portugese (🚧)
  - Hebrew (🚧)
  - Italian (🚧)
  - Japanese (🚧)
- [v0.9.5] Frontend - 💬 Internationalisation - Add Language switch in Settings and Login page
- [v0.9.5] Frontend - Login page - Show status of Backend services and databases
- [v0.9.5] Frontend - Login page - Disable Logon button if no SQL server is available
- [v0.9.5] Frontend - Admin - Configuration page for SIEM MS SQL, for ![Docker](/medias/Docker_logo_23x16.png "Docker") deployments
- [v0.9.5] Frontend - MarketPlace notification indicator to show on **Notification** sub-menu too
- [v0.9.🚧] 

**v0.9.0**
- [v0.9.0] Backend - Make Encrypted SQL connection the default

**v0.8.5-0.8.7**
_(Backend v0.8.5 / Frontend v0.8.7)_
- [v0.8.5-0.8.7] Frontend - Market - Export Pipeline to EZ Market Place
  - Deal with non-existing Publisher Profile
  - Pipeline name
  - Icon / Visual
  - Readme
  - Sanitization of Collection
  - Sanitization of Fields Mapping
  - Pre-Submit Final Check-list
- [v0.8.5-0.8.7] Frontend - Empty Publisher details on Log-out

**v0.8.5-0.8.6**
_(Backend v0.8.5 / Frontend v0.8.6)_
_(Below "Market" relates to the backend API of the Market Place, and "Market Admin" to the frontend UI of the Market place administrative website)_
- [v0.8.5-0.8.6] Frontend - Exclude Beats' Heartbeat messages from custom parsing (based on presence of `.heartbeat`)
- [v0.8.5-0.8.6] Frontend - Fix - JQ Filter template - Deal with jsBeat sending `stream_id` and `stream_name` in `."@metadata".filter_helpers`
- [v0.8.5-0.8.6] Frontend - Allow for sub menus in drawer menu
- [v0.8.5-0.8.6] Frontend - Menu links - Make Sub-Menu LTR-RTL friendly
- [v0.8.5-0.8.6] Frontend - Market Place - Split link into sub menues, Add and update Routes, Create separate page for Market, Notifications and Pipeline Templates
- [v0.8.5-0.8.6] Frontend - Market Place - Pipeline Templates listing, Pipeline Template Properties
- [v0.8.5-0.8.6] Frontend - parsing collection config and fields mapping when loading a Pipeline Template in mutation `updateEzMarketPipelineTemplateById`
- [v0.8.5-0.8.6] Frontend - Market Place - Pipeline Template Properties - Add Collection Config
- [v0.8.5-0.8.6] Frontend - Market Place - Pipeline Template Properties - Fiels Mapping
- [v0.8.5-0.8.6] Frontend - Market Place - Pipeline Template Properties - Frequency stats
- [v0.8.5-0.8.6] Frontend - Market Place - Pipeline Template - Import into new Pipeline
- [v0.8.5-0.8.6] Frontend - Market Place - Pipeline Template - Import into existing Pipeline
- [v0.8.5-0.8.6] Frontend - Pipeline Properties - Import Collection and Fields Mapping from Marketplace - Menu, Popup, Template listing, Get overide confirmation, Load Template, Import to current Pipeline
- [v0.8.5-0.8.6] Frontend - Market - Publisher profile's properties - Create Publisher profile with user's Pseudo-name, Edit Publisher profile
- [v0.8.5-0.8.6] Market Admin - Pipelines - Review - Delete Icon/logo/visual
- [v0.8.5-0.8.6] Market Admin - Pipelines - Review - ReadMe - Edit and Save
- [v0.8.5-0.8.6] Market Admin - Pipelines - Review - Options, Collection, Stats
- [v0.8.5-0.8.6] Market Admin - Pipelines - Review - Fields Mapping
- [v0.8.5-0.8.6] Market Admin - Pipelines - Review - Hide Raw data with Expansion item
- [v0.8.5-0.8.6] Market Admin - Pipelines - Review - Properties
- [v0.8.5-0.8.6] Market Admin - Move raw data to the bottom of the page
- [v0.8.5-0.8.6] Market Admin - Move `options` from `pipelineTemplateCollectionConfiguration` to `pipelineTemplateMappingConfiguration`
- [v0.8.5-0.8.6] Market Admin - Pipelines - Review - Calculate and display Statistics (`detectedFields`, `mappedFields`, `sharedFieldFrequencies`, `sharedFieldValues`, `sharedFieldMapping`, `sharedFieldModifiers`)
- [v0.8.5-0.8.6] Market - Publishers - New `/publishers/` enpoints
- [v0.8.5-0.8.6] Market - Update Test
- [v0.8.5-0.8.6] Market - Publishers - Prevent the creation of Publisher other than themselves

**v0.8.5**
_(Below "Market" relates to the backend API of the Market Place, and "Market Admin" to the frontend UI of the Market place administrative website)_
- [v0.8.5] Market - Admin - New API endpoints
  - Statuses
    - Get Statuses
  - Publishers
    - Add Publisher, Modify Publisher Name, Delete Publisher
  - Notifications
    - List Notification, Add Message/Notification, Modify Notification, Delete Notification
  - Pipelines
    - List Pipeline, Add Pipeline, Modify Pipeline, Delete Pipeline
- [v0.8.5] Market - Admin Publishers - List Publishers - Include stats about received and send messages and published templates
- [v0.8.5] Market - Admin Notifications - Better logging
- [v0.8.5] Market - SQL - Add `readmeMarkdown` and `iconPicture` fields to `pipeline_templates`
  - `readmeMarkdown` is going to be used to store the user provided ReadMe of their own Pipeline Template submissions
  - `iconPicture` is going to be used to store the picture/icon/visual of the Pipeline Template submissions
- [v0.8.5] Market - Admin - Get templates to return `readmeMarkdown` and `iconPicture` fields
- [v0.8.5] Market Admin - MFA - Update code to deal with both Dev and Prod Okta environments
- [v0.8.5] Market Admin - Better API error handling
- [v0.8.5] Market Admin - Better logging in Console on API call responses
- [v0.8.5] Market Admin - Clean up popup messages
- [v0.8.5] Market Admin - Better tab titles for Admin pages
- [v0.8.5] Market Admin - Notifications - Get Publishers, Get Statuses, Review Notifications, Sends Message/Notification, Modify Notification, Delete Notification
- [v0.8.5] Market Admin - Notifications - Better management of the Publishers
- [v0.8.5] Market Admin - Notification - Change opacity of `to be deleted` icon to match Pipeline Templates admin page
- [v0.8.5] Market Admin - Publishers - Review Publishers, Add Publisher, Modify Publisher Display Name, Delete Publisher
- [v0.8.5] Market Admin - Publishers - Review Publishers - Display stats about received and send messages and published templates
- [v0.8.5] Market Admin - Notification - Add Identicons avatars, Display timestamps as "Time ago"
- [v0.8.5] Market Admin - Change locker's colour depending on authentication status for authenticated pages
- [v0.8.5] Market Admin - Pipeline Templates - Move page to better path
- [v0.8.5] Market Admin - Pipeline Templates - Get Pipelines, List Pipelines, Add Pipeline, part Modify Pipeline, Delete Pipeline
- [v0.8.5] Market Admin - Pipeline Templates - Use IconPicture to display the Icon/logo/visual of the Pipeline Template
- [v0.8.5] Market Admin - Pipeline Templates Review - Page stub, Route, Link to Review page from Pipeline Templates
- [v0.8.5] Market Admin - Pipeline Template Review - Icon/logo/visual - Save Picture/Logo
- [v0.8.5] Frontend - Better logging in Console on API call responses
- [v0.8.5] Frontend - Implement more robust timestamp parsing in JQ Transform
- [v0.8.5] Frontend - Notifications - Multi lines support

**v0.8.4**
- [v0.8.4] Backend - Installer able to separate SQL from EZ Server
  - If you want to use this:
    - Run the installer on the SQL server first
    - Select `Only SQL Database and configuration (EZ Database)` in the drop down list on the **Select Components** screen
    - Finish the install
    - Run the installer on the Windows server where you want to run the EZ Server
    - Select `Full installation (EZ Cloud Server + EZ Database + Frontend + NodeJS)` (or whichever is the most appropriate for you) in the drop down list
    - Untick `EZ Database and SQL User` in the list of **Components**
    - Finish the install
- [v0.8.4] Frontend - Display EZ server version on rollover
- [v0.8.4] Market Admin - API Functions - Consolidate Axios functions
- [v0.8.4] Market Admin - Code clean-up

**v0.8.3**
- [v0.8.3] Market - Provide public statistics
  - Market high level statitics: total hits, number of unique deployments, number of unique users
  - Statitics about the Pipeline Templates: number of created pipeline templates, number of unique publishers
- [v0.8.3] Market Admin - Initial Admin UI
  - Layout and pages placeholders
  - Enable Okta Authentication
- [v0.8.3] Backend - Install Shipper - Deal with `sudo` command by providing password

**v0.8.2**
- [v0.8.2] Collection - Add support for LogRhythm Webhook Beat (HTTP only)
- [v0.8.2] General - Error messages - Change "Error updating persistance layer" to a less misleading and more generic message
- [v0.8.2] Installer and Backend - Add support for EZ Market Place
  - Deployment UID randomly generated at installation time
  - URL for the EZ Market Place stored in configuration file
  - Publisher UID column added to user table
  - Pass all the necessary details to Frontend to connect to EZ Market Place
- [v0.8.2] Mapping Editor - Provide password to Sudo commands during Tail operations
- [v0.8.2] EZ Market - First version
  - Database structure
  - API endpoints:
    - PipelinesTemplate
    - Notifications
- [v0.8.2] Frontend - Integrate EZ Market Place, Market Icon, Market Page, Market Notifications
- [v0.8.2] Frontend - Update Favicons with the new LogRhythm logo
- [v0.8.2] Installer - Provides a SHA256 checksum of the installation file
- [v0.8.2] Installer - Prevent overiding exisiting configuration files, HTTPS certificates and `.env` file
- [v0.8.2] Move EZ-Cloud Repository from TonyMasse GitHub account to LogRhythm GitHub Corp account

**v0.8.1**
- [v0.8.1] Pipelines - Import/Export of Collection and Mapping
- [v0.8.1] Mapping Editor - Persist the "Extract Beat's .message" option
- [v0.8.1] Mapping Editor - Resurface the `.message` feature (UI, API and JQ)
- [v0.8.1] Provide feedback if failing to connect over SSH, in Open Collectors list page
  - On version check
  - On Shipper deployment

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
        - https://github.com/logrhythm/EZ-Cloud/wiki/Help#ref-whatsthedifferencefileimport

## What has been fixed in this release?
**v0.8.4**
- [v0.8.5] Frontend - Fix #8 (JQ Filter doesn't catch on logs coming from LR Webhook Beat) - Add filtering by `.fullyqualifiedbeatname` in JQ Filter
- [v0.8.5] Frontend - Fix - `DeploymentEdit` page didn't implement `extractMessageFieldOnly` correctly when producing the JQ Transform at deployment time

**v0.8.4**
- [v0.8.4] Frontend - Remove Webhook shipper duplicate entry

**v0.8.3**
- [v0.8.3] Backend - Increased the API timeout value (multiplied by 3), changed `maxCheckInterval` from 20 seconds to 60 seconds
- [v0.8.3] Backend - Install Shipper - Prevent error if `steps[stepCounter]` doesn't exist
- [v0.8.3] Frontend - Square avatars for navigation bar

**v0.8.2**
- [v0.8.2] Security - CVE-2020-26301 - Upgrade `simple-ssh` to v1.1.0 to benefit from `ssh2` v1.5.0
- [v0.8.2] Security - CVE-2022-0122, CVE-2022-0155, Sonatype-2012-0022 - Upgrade several Frontend packages
- [v0.8.2] Security - CVE-2021-23566, CVE-2022-0355, CVE-2022-0155 - Upgrade several Backend packages
- [v0.8.2] Security - CVE-2022-0536 - Upgrade `follow-redirects` to ^1.14.8 on both Backend and Frontend
- [v0.8.2] Security - sonatype-2021-4879 - Upgrade `minimatch` to ^3.0.5 on both Backend, Frontend and Market
- [v0.8.2] Security - Fix/upgrade several dependencies with low and medium risks
- [v0.8.2] Security - Fix several low and medium security risks in EZ Backend source code
- [v0.8.2] Shipper installer - Content Security Policy prevents download of `shippers_url.json` from GitHub
- [v0.8.2] Collection Editor - Provide default value for `cursor_header_type` for Genericbeat
- [v0.8.2] Frontend - Fix JQ Filter and JQ Transform
  - Filter in on `device_type` from multiple locations
  - Parse `.message` only if present

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

## Know issues :bug: :beetle:
- Will fail to deploy log shippers if not using the `root` account or an account with full `sudo` access
- Open Collector machines running older versions of Docker (anything below v20) will fail to Tail
- HA and DR deployments of LogRhythm SIEM are not supported

## Report a bug or issue
- Use the [Issues](https://github.com/logrhythm/EZ-Cloud/issues) on GitHub

Enjoy,

Tony
