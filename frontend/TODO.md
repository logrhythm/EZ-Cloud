# TODO - Frontend

### Target: v0.7

## TO DO
- OpenCollectors list
  - [ ] Load SSH Token from file instead of copy/paste in field
  - [ ] Use alternative to Filebeat
    - [ ] LR Rest Beat
      - [ ] Install LR Rest
      - [ ] Communicate each step to Frontend
      - [ ] Display Install progress in Frontend
      - [ ] Create LR Rest Beat configuration
      - [ ] Use LR Rest Beat for Tail
  - [x] Move `OS version` to the left of `Open Collector Version`
  - [x] Change `Filebeat version` to `Shippers version`
  - [ ] Collect different Shippers versions from Backend
  - [ ] Add action button to `Shippers version` column, when empty
    - [ ] Install
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
  - [ ] Ability to assign Log Source to Open Collectors for Production
- [ ] Assign Log Source to Open Collectors for Production page
  - [ ] Get list of OC Log Sources from Backend
  - [ ] Try to map EZ OCs with OC Log Sources
  - [ ] Flag EZ OCs that do not have the right Shipper for the Pipeline
  - [ ] Capture user selection of OC Log Source
- [ ] Hide Settings page for Prod
- [ ] Create Logging shared Lib to push logs to Console and Windows Journal
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

## TO FIX
- [ ] Damn Tedious saving NULL as 'null' in OC list
- [ ] Open Collector List - Installation progress bar showing always full, even when progress is not yet 100%
- [ ] Field Mapping - JQ Transform - Put the Pipeline name in .output.device_name, and the Beat name in .output.beatname, so to comply with LS Virtualisation templates

## TO TEST

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