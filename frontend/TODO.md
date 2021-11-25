# TODO - Frontend

### Target: v0.8

## TO DO
- RBAC
  - [x] Add User Admin page
  - [x] Add Roles Admin page
  - [x] Add landing Admin page
  - [x] Add navigation in Users and Roles Admin pages
- General
  - [x] Settings - Only show Backend settings in Dev Mode
  - [x] Error messages
    - [x] Add pop up with error details and pointer to Wiki
    - [x] Write Wiki with error explanation
- Mapping Editor
  - [x] Warn user if Socket is not connected to Backend (as Tail feature needs it)
  - [x] Automatically start Parsing when starting Tail
  - [ ] Handle Sub Rules
  - [ ] Resurface the `.message` feature
    - [ ] In UI (menu Settings)
    - [ ] When generating JQ Transform
      - [ ] In Field Mapping Editor
      - [ ] In deployment
    - [ ] Allow for different holder
      - [ ] `.message`
      - [ ] `.response`
      - [ ] Configurable in the Collection Template
- [ ] Add a simple Wizard from landing page
  - [ ] Ask for name for Log Source
  - [ ] Create collection configuation
    - [ ] Pick Shipper
    - [ ] Pick type of collection (Flat File, Syslog, REST, etc...)
    - [ ] Configure it
  - [ ] Pick up Open Collector
    - [ ] Add one if none in the list
    - [ ] Offer to deploy required Shipper if not already on OC
  - [ ] Create field mapping
    - [ ] Run pre-configured Tail
  - [ ] Recap page
    - [ ] Ability to rename Log Source
    - [ ] Ability to assign Log Source to other Open Collectors
    - [ ] Ability to Enable / Commit the Log Source creation
- [ ] Provide feedback if failing to connect over SSH
  - [ ] In Open Collectors list page
    - [ ] On version check
    - [ ] On Shipper deployment
  - [ ] In Tail
  - [ ] In Deployment
- [ ] Market Place
  - [ ] Find a Free-tiered public database
  - [ ] Find a Free-tiered public hosting (for Admin and API)
  - [ ] Find / register domain
  - [ ] List available Collection Templates
  - [ ] Import Collection Template
  - [ ] Export to Market Place
    - [ ] Sanitization of secrets
    - [ ] Export to Market Place
  - [ ] Market Place Admin
    - [ ] Approval / Review / Moderation of submissions
    - [ ] Change Status of submission
      - Under review
      - Rejected
      - Approved
    - [ ] Change Visibility of submission
      - Visible
      - Hidden
    - [ ] Delete submission
- [ ] Import/Export of Collection
  - [ ] Import Collection from file
  - [ ] Import Collection from Copy/Paste
  - [ ] Export Collection to file
  - [ ] Export Collection to Copy/Paste
- [ ] Import/Export of Fields Mapping
  - [ ] Import Mapping from file
  - [ ] Import Mapping from Copy/Paste
  - [ ] Export Mapping to file
  - [ ] Export Mapping to Copy/Paste
- [ ] LogRhythm Beats mapping for Collection Configuration
  - [ ] Azure Event Hub
  - [ ] S3
  - [ ] WebHook
  - [ ] PubSub
  - [ ] Kafka
  - ...
- Open Collector Properties
  - [ ] SUDO requirement
    - [ ] Collect optional SUDO Username
    - [ ] Collect optional SUDO Password

## TO FIX
- [ ] Fan Out feature - OC refuses to import JQ Transform
- [x] Admin - Roles - Creates new duplicated Role instead of updating existing one when changing the Priviledge
- [ ] Ability to collect data from external site (Github, ...)

## TO TEST
- [ ] Fan Out feature
- [ ] `.message` feature

### Target: v0.7

## TO DO
- OpenCollectors list
  - [ ] ~~Load SSH Token from file instead of copy/paste in field~~ (👈 Keep it as is for now, as LRCloud users won't have access to their local files)
  - [x] Use alternative to Filebeat
    - [x] LR Rest Beat
      - [x] Install LR Rest
      - [x] Communicate each step to Frontend
      - [x] Display Install progress in Frontend
      - [x] Create LR Rest Beat configuration
      - [x] Use LR Rest Beat for Tail
    - [x] jsBeat
  - [x] Move `OS version` to the left of `Open Collector Version`
  - [x] Change `Filebeat version` to `Shippers version`
  - [x] Collect different Shippers versions from Backend
    - [x] Collect active OC Beats versions
      - [x] Use merged API (CheckOpenCollectorAndBeatsVersions) intead of CheckOCVersion
      - [x] Create icons for the LogRhythm Beats
    - [x] Collect jsBeat version
  - [x] Load and display different Shippers and versions
  - [x] Add action button to `Shippers version` column, when empty
    - [x] Install
  - [ ] Add action buttons to `Actions` column
    - [ ] Install Shipper
    - [ ] Upgrade Shipper
    - [ ] Uninstall Shipper
- Pipeline list
  - [x] Ability to rename Pipeline in Pipeline list
  - [x] Ability to change Status Pipeline in Pipeline list
  - [ ] Ability to deploy Log Source to Open Collectors for Production
    - [ ] Add `Deployed` status
- Pipeline properties page
  - [x] List Deployments
  - [x] Delete Deployment
  - [x] Ability to assign Log Source to Open Collectors for Production
- [x] Assign Log Source to Open Collectors for Production page
  - [x] Create new Edit Deployment page
  - [x] Get list of OC Log Sources from Backend
  - [x] Try to map EZ OCs with OC Log Sources
  - [x] Flag EZ OCs that do not have the right Shipper for the Pipeline
  - [x] Capture user selection of OC Log Source
  - [x] Kick off deployment of Stream on OC and creation of LogSource and all the chain in EMDB
    - [x] Deployment of Stream on OC
      - [x] Finish rigging Front and Back (`openCollector`, `beat` and `stream` parameters)
    - [x] Creation of LogSource and all the chain in EMDB
    - [x] Add Skipped step status
    - [x] Better icon colours
    - [x] Skipped and Error information panel
    - [ ] ~~Handle Sub Rules~~ (👈 irrelevant until FieldMappingEditor allow for better Sub Rule design)
    - [x] Add deployment to list and persist
    - [x] Add indicator to the Deployment list of already deployed Stream(s)
    - [x] Offer action to un-deploy
      - [x] Button (-) and action
- [ ] Hide Settings page for Prod
- [x] Create Logging shared Lib to push logs to Console and Windows Journal
- Day mode
  - [x] Polish CSS / Styling to get good color scheme in Day mode too
    - [x] Header bar background
    - [x] Roll over line in Mapping
    - [x] Frequency line graphs in Mapping
    - [x] Drop down list background
    - [x] Text colour
    - [x] Navigation icons colour
  - [x] Add Day/Dark mode switch on Logon page/card
- [x] Highlight the current active page in the navigation bar
- [x] Pipeline Mapping Edit
  - [x] Use the right beat name, instead of pipeline name in `beatName ()`
  - [x] Use the real Beat name in the JQ
  - [x] Rename the JQ Filter area to match what the backend names it
  - [ ] Persist extractMessageFieldOnly (and use it in DeploymentEdit when ready)
- [x] Collection Builder Edit
  - [x] Add way to encrypt password
  - [x] Add way to encrypt normal text and multi-lines

## TO FIX
- [ ] Open Collector List - Installation progress bar showing always full, even when progress is not yet 100%
- [x] Field Mapping - JQ Transform - Put the Pipeline name in .output.device_name, and the Beat name in .output.beatname, so to comply with LS Virtualisation templates
- [x] Rename "New Pipeline Details" popup title to "Pipeline Details"
- [x] NPM modules with vulnerabilities
- [x] Do not assume `.message` is always present (LR Generic Beat puts data in `.response`) when generating JQ Transform
- [x] Incomplete JQ Transform once deployed
- [x] Pipeline Properties - Deployment shows an item for brand new (not yet deployed) Pipeline
- [x] Collection Editor - Drop down menu background colour wrong when in Light mode
- [ ] Shipper installer - Content Security Policy prevents download of `shippers_url.json` from GitHub
  - `app.ab179f5f.js:1 Refused to connect to 'https://raw.githubusercontent.com/TonyMasse/EZ-Cloud/main/resources/shippers_url.json' because it violates the following Content Security Policy directive: "default-src 'self'". Note that 'connect-src' was not explicitly set, so 'default-src' is used as a fallback.`

## TO TEST
- [ ] Trying to deploy on dead/non-existent OC
- [ ] Trying to deploy on OC with jsBeat

---

### Target: v0.6

## TO DO
- OpenCollectors list
  - [ ] Load SSH Token from file instead of copy/paste in field
  - [ ] Use alternative to Filebeat
    - [x] [jsBeat](https://github.com/TonyMasse/jsBeat/releases)
      - [x] Install NodeJS
        - [x] Store NodeJS download URL on GitHub
      - [x] Install jsBeat
        - [x] Store jsBeat download URL on GitHub
      - [x] Communicate each step to Frontend
      - [x] Display Install progress in Frontend
      - [x] Create jsBeat configuration
        - [x] Create configuration template
        - [x] Update function that create fresh config
        - [x] Update function that create output config (ready for Beat to use)
      - [x] Use jsBeat / FlatFile for Tail
    - [ ] LR Rest Beat
      - [ ] Install LR Rest
      - [ ] Communicate each step to Frontend
      - [ ] Display Install progress in Frontend
      - [ ] Create LR Rest Beat configuration
      - [ ] Use LR Rest Beat for Tail
    - [x] Update UI to not be Filebeat centric
      - [x] Download button and function
      - [x] Copy to Clipboard button and function
      - [x] Add icons for Shippers
- Pipeline list
  - [ ] Ability to rename Pipeline in Pipeline list
  - [x] Add Collection Shipper in Pipeline list
  - [x] Add Collection Method in Pipeline list
  - [x] Add Mapping stats in Pipeline list
  - [x] Change status of Pipeline when adding Collection or Mapping
    - [x] when adding Collection
    - [x] when adding Mapping
  - [x] Make Sorting by Status to make sense (Ready > Dev > New)
- [ ] Hide Settings page for Prod
- [ ] Create Logging shared Lib to push logs to Console and Windows Journal
- [ ] ~~Prevent user from using Tail for Pipeline set to HTTP-JSON collection~~ (👈 irrelevant as we are moving away from Filebeat)
- Day mode
  - [ ] Polish CSS / Styling to get good color scheme in Day mode too
    - [ ] Header bar background
    - [ ] Roll over line in Mapping
    - [ ] Drop down list background
    - [ ] Text colour
    - [ ] Navigation icons colour
- [ ] Add a simple Wizard from landing page
  - [ ] Ask for name for Log Source
  - [ ] Create collection configuation
    - [ ] Pick Shipper
    - [ ] Pick type of collection (Flat File, Syslog, REST, etc...)
    - [ ] Configure it
  - [ ] Pick up Open Collector
    - [ ] Add one if none in the list
  - [ ] Create field mapping
    - [ ] Run pre-configured Tail
  - [ ] Recap page
    - [ ] Ability to rename Log Source
    - [ ] Ability to assign Log Source to other Open Collectors
    - [ ] Ability to Enable / Commit the Log Source creation
- Field Mapping
  - [x] Show popup for ERROR messages
  - [x] Add "Console" view, and display STDERR messages there
  - [x] Add "Console" view, and display STDOUT messages there

## TO FIX
- [ ] Damn Tedious saving NULL as 'null' in OC list
- [ ] Open Collector List - Installation progress bar showing always full, even when progress is not yet 100%
- [x] Dark / Day mode - Not loading from Local Storage correctly

## TO TEST
- [x] Tail with jsBeat
- [x] Collection with jsBeat

---

### Target: v0.5-rc2

## TO DO
- OpenCollectors list
  - [x] Get API to check OC host for OC / OS / FB versions, and display it in OC List (Frontend and Backend)
    - [x] Get SSH config for a given OC UID (BACKEND)
  - [x] Hide LS columns in OC list
  - [x] Hide Open OC button in OC list
  - [ ] Load SSH Token from file instead of copy/paste in field
  - [x] Install Filebeat when click on INSTALL button (BACKEND)
    - [x] Store Filebeat download URL on GitHub
    - [ ] Gather Filebeat URL from GitHub
    - [x] Offer choice to user to select package/version, fall back to URL to 7.13
    - [x] Download Filebeat
    - [ ] Run checksum
    - [x] Install
    - [x] Communicate each step to Frontend
    - [x] Display Install progress in Frontend
- Pipeline list
  - [ ] Ability to rename Pipeline in Pipeline list
  - [ ] Add Collection Type in Pipeline list
  - [ ] Add Mapping stats in Pipeline list
  - [ ] Change status of Pipeline when adding Collection or Mapping
- [x] Use OC IP when tailing in Mapping
- [ ] Hide Settings page for Prod
- [ ] Create Logging shared Lib to push logs to Console and Windows Journal
- [ ] Prevent user from using Tail for Pipeline set to HTTP-JSON collection
- [x] Hide empty dashboard (or put something in it)
- Day mode
  - [x] Add Dark/Day mode switch under Settings
  - [x] Save user preference in web browser's localStorage
  - [ ] Polish CSS / Styling to get good color scheme in Day mode too
## TO FIX
- [x] OC password not updated in Store
- [x] OC Load tries to update TableLoading read only computed
- [ ] Damn Tedious saving NULL as 'null' in OC list
- [x] `v0.5-rc1` limitations
  - [x] Split Syslog collection into `Syslog over TCP` and `Syslog over UDP`
  - [x] Stop using SSH details from `/src/config/ssh.json` on tail, and use the specified Pipeline default Collector instead
- [x] Clear collection config after clicking on Delete Configuration (Pipeline Property page)

## TO TEST
- [x] SSH via Token
- [x] Filebeat on-demand deployment

---

### Target: v0.5-rc1

## TO DO
- OpenCollectors list
  - [x] Get API to check OC host for OC / OS / FB versions, and display it in OC List (Frontend and Backend)
    - [x] Get SSH config for a given OC UID (BACKEND)
  - [x] Hide LS columns in OC list
  - [x] Hide Open OC button in OC list
  - [ ] Load SSH Token from file instead of copy/paste in field
  - [x] Install Filebeat when click on INSTALL button (BACKEND)
    - [x] Store Filebeat download URL on GitHub
    - [ ] Gather Filebeat URL from GitHub
    - [x] Offer choice to user to select package/version, fall back to URL to 7.13
    - [x] Download Filebeat
    - [ ] Run checksum
    - [x] Install
    - [x] Communicate each step to Frontend
    - [x] Display Install progress in Frontend
- Pipeline list
  - [ ] Ability to rename Pipeline in Pipeline list
  - [ ] Add Collection Type in Pipeline list
  - [ ] Add Mapping stats in Pipeline list
  - [ ] Change status of Pipeline when adding Collection or Mapping
- [ ] Use OC IP when tailing in Mapping
- [ ] Hide Settings page for Prod
- [ ] Create Logging shared Lib to push logs to Console and Windows Journal
- [ ] Prevent user from using Tail for Pipeline set to HTTP-JSON collection
- [x] Hide empty dashboard (or put something in it)

## TO FIX
- [x] OC password not updated in Store
- [x] OC Load tries to update TableLoading read only computed
- [ ] Damn Tedious saving NULL as 'null' in OC list

## TO TEST
- [ ] SSH via Token
- [x] Filebeat on-demand deployment