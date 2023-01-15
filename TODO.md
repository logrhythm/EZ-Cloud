# TODO - Backend

### Target: v1.0

## TO DO
- Refactor
  - [x] Socket - Tail - Streamline `tailInit()` for LR Beats
  - [x] API - `updateStreamConfigurationForBeat()` for LR Beats
  - [x] API - `deleteStreamConfigurationForBeat()` for LR Beats
- Add support for Beats that require file dropped as part of Config
  - [x] PubSub
  - [x] WebHook HTTPS
- Beat Support
  - [x] S3
  - [x] PubSub
  - [x] EventHub
  - [x] WebHook HTTPS
- [ ] API - Admin - MS SQL - Add MS SQL test
- [x] API - Admin - Update Database - Do not use `EZ` as target DB when testing MS SQL availability/version
- [x] API - Admin - Update Database - Return errors to the user when checking the DB version details
- [x] Use Beats's configuration provided by Frontend when starting Tail, instead of using local copy of `collectionConfigToYml()`

## TO FIX
- Installer
  - [x] Issue #17 - 0.9.7 installer might not update OpenCollectors table
- Documentation
  - [x] Issue #16 - Document the general `ERROR QUERYING PERSISTENCE LAYER` error code
- API
  - [x] Crash when no MasterID is returned from EMDB
  - [x] Issue #21 - Deployment fails at last step with LR 7.9 SIEM
- Athentication
  - [x] Private key for encryption of JWT token is cached incorectly as empty if OC-DB is not ready on the first try
- SIEM SQL
  - [x] Issue #28 - Last step of Deployment always fail the first time

## TO TEST

### Target: v0.9

## TO DO
- Installer
  - [ ] ~~Offer to use Trusted SQL Connection for run time~~ (👈 Trusted mode not supported by Tedious)
  - [ ] ~~Make SQL Trusted Connection the default~~ (👈 Trusted mode not supported by Tedious)
  - [ ] ~~Offer to use Encrypted Connection for run time~~ (👈 Now set by default to TRUE)
  - [x] Make Encrypted SQL connection the default
  - [x] Create Docker dedicated MS SQL DB creation script
- SQL
  - [ ] ~~Add configuration parameters to enable SQL Trusted Connection Auth~~ (👈 Trusted mode not supported by Tedious)
  - [ ] ~~Handle SQL Trusted Connection~~ (👈 Trusted mode not supported by Tedious)
  - [x] Move EZ database to PostgreSQL
    - [x] Tables
    - [x] Stored Procedures
    - [x] Functions
  - [x] Move MS SQL connection configuration from JSON file to record in PostgreSQL Table
  - [x] Check connection to the SQL systems at start-up and keep checkin until they are all good
  - [x] Function to retrieve the current Persistence Layer Availability
  - [x] Add API to check Persistence Layer Availability
  - [x] Move Stored Procedures and Views from EZ database to EMDB
    - [x] Rename specific Stored Procedure and Views to match EMDB style
      - [x] upsert_LogSource_Type.sql
      - [x] clone_MPE_Rule.sql
      - [x] upsert_MPE_SubRule.sql
      - [x] upsert_Processing_Policy.sql
      - [x] upsert_Log_Source_Virtualisation_Template.sql
      - [x] upsert_Log_Source_Virtualisation_Template_Item.sql
      - [x] list_OpenCollector_Log_Sources.sql
      - [x] upsert_Log_Source_Virtualisation_To_OpenCollector_LogSource.sql
      - [x] get_SIEM_Master_ID
  - [x] Create EZ_Get_Versions view to gather EZ DB's content versions
- SQL Utils
  - [x] Split utilitarian functions to deal with both MS SQL and PostgreSQL
    - [ ] Depreciate said functions and force using MS SQL and PostgreSQL specific functions instead
- Multi-platform
  - [x] Allow to run on:
    - [x] Windows
      - [x] Log to Event Journal Application
    - [x] Linux
      - [x] Log to flat file (`/var/log/ez`)
    - [x] Containerised Linux
- RBAC
  - [x] Move RBAC tables and Stored Procedures to PostgreSQL
  - [x] Use PostgreSQL for Authenticaion instead of MS SQL
    - [x] Validate login with PgSQL or MS SQL depending on DB Mode
    - [x] Gather RBAC access rights from table of PgSQL instead of MS SQL, if DB Mode is Split or PgSQL
  - [x] Collect JWT config from PgSQL instead of JSON file, if DB Mode is Split or PgSQL
  - [x] Modify RBAC API enpoints to use PostgreSQL, if DB Mode is Split or PgSQL
- EZ Marketplace
  - [x] Collect EZ Market Place config from PgSQL instead of JSON file if DB Mode is Split or PgSQL
  - [x] Create function to pull Master License ID from SIEM and store it in PgSQL, if DB Mode is Split or PgSQL
- OpenCollectors and Pipeline API
  - [x] Modify API endpoints to use PostgreSQL, if DB Mode is Split or PgSQL
- MS SQL Admin
  - [x] Add API for MS SQL Connection admin page on Frontend
    - [x] Get MS SQL config
    - [x] Update MS SQL config
  - [x] Encrypt MS SQL credentials using deployment specific private key
  - [x] Store them safely in PgSQL
  - [x] Add API to collect MS SQL, EZ DB, EZ_Get_Versions view and EZ DB's content versions
  - [x] Add API to update the EZ DB

## TO FIX
- [x] Save/Read of Fields Mapping from PgSQL
- [x] Tail actions doesn't fail if no or incomplete SSH details for Primary OC for Pipeline
- [x] Linux obfuscation executable

## TO TEST

---
### Target: v0.8

## TO DO
- Installer
  - [x] Start the Service by default
  - [x] Provide blank SQL password in prompt (instead of CHANGE_ME, as it confuses people thinking there is already a valid password)
  - [x] ezAdmin account creation
    - [x] Prompt for ezAdmin password
    - [x] Create account in SQL
- [x] RBAC
  - [x] Create SQL Table
    - [x] Roles
      - Admin
      - User
    - [x] UserToRole
  - [x] API
    - [x] Embed Role in JWT token
    - [x] Check for Role in each API query
    - [x] Endpoints for
      - [x] GetUsersList
      - [x] UpdateUser
      - [x] DeleteUser
      - [x] GetRolesList
      - [x] UpdateRole
      - [x] DeleteRole
  - [x] Create SQL Stored Procedures
    - [x] upsert_RBAC_User
      - [x] Update to deal with non EZ accounts
    - [x] delete_RBAC_User
      - [x] Update to deal with non EZ accounts
    - [x] upsert_RBAC_Role
    - [x] delete_RBAC_Role
    - [x] Update create_database.bat
- [x] Upgradable Install
  - [x] Update SQL scripts to be runnable multiple times and ignore unnecessary tasks
  - [x] Update/Complement Installer to allow for upgrade from previous versions
- [x] More logging in the API for User and Role updates
- [x] Persist the `pipeline.extractMessageFieldOnly` value, to save the `.message` feature
  - [x] Update `[pipelines]` table creation script
  - [x] Update API endpoint `UpdatePipeline`
  - [x] Update API endpoint `GetPipeline`
- [x] SQL - Log an error when SQL fails to connect
- [x] Move Repository to LogRhythm Corp GitHub account
  - [x] Transfer Repo's ownership
  - [x] Check move
  - [x] Check Repo is still Public
  - [x] Check Wiki is still Visible and Public
  - [x] Check "Pages" is still Visible and Public
  - [x] Update source code to swap any mention of `github.com/TonyMasse/EZ-Cloud` to `github.com/logrhythm/EZ-Cloud`

## TO FIX
- [x] URL might contain directory traversal attempt
- [x] Error message returned to client is too complete:
  - [x] The value of the URL path filename is copied into the application's response.
- [x] SQL Connection seem not to close automatically, and time out only after +/-50 minutes
- [x] Privileged access is only valid if member of Role `Admin`. Needs to change to use `isPrivileged` instead
- [x] No version number showing in logs when in Production
- [x] Change "priviledged" to "privileged", through out
  - [x] SQL Scripts
  - [x] API
  - [x] Rest of the source code

## TO TEST

---

### Target: v0.7

## TO DO
- [x] Build packaged version
  - [x] Compress into a versionned archive
- [ ] Build full installer
  - [x] Build solution that can be called from WebPack during build (`npm run build`)
  - [x] Offer options to:
    - [x] Install:
      - [x] EZ Backend
      - [x] EZ Frontend
      - [x] NodeJS
    - [x] Create and Configure `EZ` SQL Database
    - [x] Create / Configure EZ Server Service
    - [x] Start EZ Server Service immediately
    - [x] Automatically generate private tokens for:
      - [x] For JWT (Authentication token encryption/decripion key)
      - [x] For AES (Encryption / Decryption private key)
    - [x] Open and manually review:
      - [x] JWT configuration file
      - [x] AES configuration file
      - [x] HTTPS Certificate file
      - [x] HTTPS RSA Private Key file
      - [x] HTTPS Encrypted Key file
  - [x] Copy files in right location (Program Files)
  - [x] Create Start menu shortcuts to:
    - [x] Configuration Folder
    - [x] Configuration Sample Folder
    - [x] Access Source Code on GitHub
    - [x] Uninstall EZ Cloud Server
  - [x] Generate random tokens, if asked, for:
    - [x] JWT
    - [x] AES
  - [x] Prompt for SQL Credentials and details
    - [x] User
    - [x] Password
    - [x] Host
    - [x] Port
  - [ ] ~~Download and install NodeJS if requested~~ (👈 In the interest of time, let's just package a version of NodeJS with the installer)
  - [x] Package NodeJS
    - [x] Install it if requested
  - [x] Build clean and parameters accepting script to create EZ Server Service
    - [x] Build scripts
    - [x] Create Webpack config to build the distributable version
    - [x] Integrate the distributable version into the Installer
    - [x] Add necessary Uninstall steps and actions
  - [x] Update `create_database.bat` to allow for unprompted install (not asking the user to press a key to continue)
  - [x] Ability to fully Un-install
    - [x] Stop EZ Server Service
    - [x] Delete EZ Server Service
  - [ ] Allow for Silent install
    - [x] Apply default settings during Silent install
    - [ ] Ability to specify user choice from command line, to decide:
      - [ ] Install EZ Frontend
      - [ ] Install NodeJS
      - [ ] Create and Configure `EZ` SQL Database
      - [ ] Create / Configure EZ Server Service
      - [ ] Start EZ Server Service immediately
      - [ ] Automatically generate private tokens for:
        - [ ] For JWT (Authentication token encryption/decripion key)
        - [ ] For AES (Encryption / Decryption private key)
  - [ ] Sign Install package
  - [x] Add Welcome page
  - [x] Add License page
    - [x] Modify WebPack script to use the MIT License from Repo
- [x] Remove dependance to config/ssh.json
- [x] Collect different Shippers versions for the Frontend
  - [x] Collect running OC Beats and their versions
    - [x] Get active Beats names and version into a JSON
    - [x] Merge CheckOpenCollectorBeatsVersions and CheckOCVersion
  - [x] Collect jsBeat version
- [x] Store different Shippers information in EZ DB
- [x] Reverse engineer Log Source creation and Virtualisation process
  - [x] LS Type
    - [x] List LS Types
    - [x] Create LS Types
    - [x] Update LS Types
  - [x] MPE Rules
    - [x] List MPE Rules
    - [x] Create MPE Rules
    - [x] Update MPE Rules
  - [x] MPE Sub-Rules
    - [x] List MPE Sub-Rules
    - [x] Create MPE Sub-Rules
    - [x] Update MPE Sub-Rules
  - [x] Processing Policy
    - [x] List Processing Policy
    - [x] Create Processing Policy
    - [x] Update Processing Policy
  - [x] LS Virtualisation
    - [x] List LS Virtualisation
    - [x] Create LS Virtualisation
    - [x] Update LS Virtualisation
  - [x] Mapping Virtualisation to Open Collector LS
    - [x] List Entities Hosts
    - [x] List Log Sources
    - [x] Add LS Virtualisation to LS
    - [x] Update LS Virtualisation to LS
- [x] Build SQL functions to
  - [x] Upsert LS Type
    - Param: UID
    - Param: Name
  - [x] Clone MPE Rules
    - Param: UID
    - Param: Name
    - Param: SourceMsgSourceTypeID (default 1000772 // "BETA : Syslog - Open Collector - Azure Event Hub")
    - Param: TargetCommonEventID (default 1029941 // Information // Generic Record)
    - Param: TargetRuleStatus (default 2 // Test)
  - [x] Upsert MPE Sub-Rules
    - Param: UID
    - Param: SubRuleUid
    - Param: SubRuleName
    - Param: TargetCommonEventID (default 1029941 // Information // Generic Record)
    - Param: TargetRuleStatus (default 2 // Test)
    - Param: ForwardAsEvent (default 0 // 0 Not an Event, 1 Is an event)
    - Param: Tag1 .. Tag10 (default '*')
  - [x] Upsert Processing Policy
    - Param: UID
    - Param: Name
    - Param: MPEPolicy_Name
  - [x] Upsert LS Virtualisation Template
    - Param: Virt_Template_UID (default '0d7544aa-5760-4c5e-be62-26262f3cd1db', UID of the EZ Cloud Template)
    - Param: Virt_Template_Name (default 'EZ CLoud', Name of the new Template)
    - Param: ItemToInsert_ID (default NULL, ID of Template Item to insert, or NULL if none)
    - Param: ItemToInsert_SortOrder (default NULL, SortOrder of the Template Item to insert, or NULL if none or happy to get the Max +1)
    - Param: ItemToDelete_ID (default NULL, ID of Template Item to delete, or NULL if none)
  - [x] Upsert LS Virtualisation Template Item
    - Param: UID // UID of the Log Source
    - Param: Name // Name of Log Source
    - Param: RegexFilter (default NULL, If not provided, we build it up from UID and Name)
    - Param: MPEProcessingPolicyID (default NULL, If not provided, we look for it. If none found, it will error and do nothing)
  - [x] List Open Collector LS
    - Get Log Sources
    - Get Host Identifiers as JSON object
  - [x] Add LS Virtualisation to LS
    - Param: UID // UID of the Log Source
    - Param: OpenCollectorMotherLogSourceID // Log Source ID of the Open Collector
    - Param: Virt_Template_UID (default '0d7544aa-5760-4c5e-be62-26262f3cd1db', UID of the EZ Cloud Template)
    - Param: OpenCollectorLogSourceTypeID (default 1000759, ID of the Open collector Log Source Type)
- [x] Build API endpoints to
  - [x] Create LS Type
  - [x] Create MPE Rules
  - [x] Create MPE Sub-Rules
  - [x] Create Processing Policy
  - [x] Create LS Virtualisation
  - [x] Create LS Virtualisation Item
  - [x] List Open Collector LS
  - [x] Add LS Virtualisation Item to LS
- [x] Update UpdateCollector API to persist `.pipelines` into TABLE `openCollectorsPipelines`
- [x] Build API endpoints to enable stream on OC for production
  - [x] Drop Beat configuration in right location
    - [x] For Filebeat
    - [x] For jsBeat
    - [x] For LR Generic REST Beat
  - [x] Create `/oc/DeleteStreamConfigurationForBeat` API endpoint to remove/disable the Beat configuration
  - [x] Import JQ to OC
    - [x] Create Bash command lines/script
    - [x] Update `upsert_Log_Source_Virtualisation_Template_Item` SQL SP to use and sanitise the right Beat and Pipeline names
    - [x] Create Pipeline template
    - [x] Create API enpoint
- [x] Tail for LogRhythm Beats
  - [x] Generic Beat
    - [x] Tail
    - [x] Kill Tail Shipper
- Process of onboarding a LS (Beat Config, JQ Pipeline and SIEM LogSource)
  - New Log Source
    - Drop Beat configuration in right location
    - Import JQ to OC
    - Create LS Type
    - Create MPE Rule
    - Create MPE Sub-Rule(s)
      - Based on Field Mapping / Sub Rules ID
    - Create Processing Policy
    - Create LS Virtualisation
    - Create new LS Virtualisation Item and associate it to LS Virtualisation
    - Search related Open Collector LS
    - Add LS Virtualisation to Open Collector LS
  - Exisiting Log Source / Update of field mapping
    - Update Beat configuration in right location
    - Re-import JQ to OC
    - Modify MPE Sub-Rule(s)
    - Modify Processing Policy
    - Modify LS Virtualisation Item
- Process for un-deploying a LS on OC
  - Delete Beat configuration from OC

## TO FIX
- [x] Damn Tedious saving NULL as 'null' in OC list
- [x] Refactor: upsert_Log_Source_Virtualisation_Template to not need to add a SP to EMDB
- [x] Refactor: upsert_Processing_Policy to not need to add a SP to EMDB
- [ ] Add a KILL SIGTERM to the post Tail cleaning up process
- [x] NPM modules with vulnerabilities
- [x] Generated Pipeline imported with a missing YAML file, causing OC to fail to start/restart
- [x] Use SUDO to run the Tail for GenericBeat
- [x] Improve logging for Tail for GenericBeat

## TO TEST

---

### Target: v0.6

## TO DO
- [ ] Build packaged version
  - [x] Install and configure webpack
  - [x] Create and use global enviromnent variable to store the root path of the app
    - [x] Detect it at startup
    - [x] Use it to load any configuration file or web file
  - [x] Create build sequence / script to:
    - [x] Run webpack
    - [x] Prep config file / samples
    - [x] Prep web file for Frontend
      - [ ] Build Frontend (? not sure)
    - [ ] Compress into a versionned archive
- [x] Build central logging lib
  - [x] Use lib to log to Windows Journal System
  - [x] Log Web access to Windows Journal System
- [ ] Remove dependance to config/ssh.json
- [ ] Reverse engineer Log Source creation and Virtualisation process
  - [ ] LS Type
    - [ ] List LS Types
    - [ ] Create LS Types
    - [ ] Update LS Types
  - [ ] MPE Rules
    - [ ] List MPE Rules
    - [ ] Create MPE Rules
    - [ ] Update MPE Rules
  - [ ] MPE Sub-Rules
    - [ ] List MPE Sub-Rules
    - [ ] Create MPE Sub-Rules
    - [ ] Update MPE Sub-Rules
  - [ ] Processing Policy
    - [ ] List Processing Policy
    - [ ] Create Processing Policy
    - [ ] Update Processing Policy
  - [ ] LS Virtualisation
    - [ ] List LS Virtualisation
    - [ ] Create LS Virtualisation
    - [ ] Update LS Virtualisation
  - [ ] LS creation
    - [ ] List Log Sources
    - [ ] Create LS creation
    - [ ] Update LS creation

## TO FIX

## TO TEST
