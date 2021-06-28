# TODO - Frontend

### Target: v0.6

## TO DO
- OpenCollectors list
  - [ ] Load SSH Token from file instead of copy/paste in field
  - [ ] Use alternative to Filebeat
    - [ ] [jsBeat](https://github.com/TonyMasse/jsBeat/releases)
      - [x] Install NodeJS
        - [x] Store NodeJS download URL on GitHub
      - [x] Install jsBeat
        - [x] Store jsBeat download URL on GitHub
      - [x] Communicate each step to Frontend
      - [x] Display Install progress in Frontend
      - [ ] Create jsBeat configuration
      - [ ] Use jsBeat / FlatFile for Tail
    - [ ] LR Rest Beat
      - [ ] Install LR Rest
      - [ ] Communicate each step to Frontend
      - [ ] Display Install progress in Frontend
      - [ ] Create LR Rest Beat configuration
      - [ ] Use LR Rest Beat for Tail
- Pipeline list
  - [ ] Ability to rename Pipeline in Pipeline list
  - [ ] Add Collection Type in Pipeline list
  - [ ] Add Mapping stats in Pipeline list
  - [ ] Change status of Pipeline when adding Collection or Mapping
- [ ] Hide Settings page for Prod
- [ ] Create Logging shared Lib to push logs to Console and Windows Journal
- [ ] Prevent user from using Tail for Pipeline set to HTTP-JSON collection
- Day mode
  - [ ] Polish CSS / Styling to get good color scheme in Day mode too
- [ ] Add a simple Wizard from landing page
  - [ ] Ask for name for Log Source
  - [ ] Create collection configuation
    - [ ] Pick type of collection (Flat File, Syslog, REST, etc...)
    - [ ] Configure it
  - [ ] Pick up Open Collector
    - [ ] Add one if none in the list
  - [ ] Create field mapping
    - [ ] Run pre-configured Tail
  - [ ] Recap page
    - [ ] Ability to rename Log Source
    - [ ] Ability to assing Log Source to other Open Collectors
    - [ ] Ability to Enable / Commit the Log Source creation

## TO FIX
- [ ] Damn Tedious saving NULL as 'null' in OC list
- [ ] Open Collector List - Installation progress bar showing always full, even when progress is not yet 100%
- [x] Dark / Day mode - Not loading from Local Storage correctly

## TO TEST
- [ ] Tail with jsBeat
- [ ] Collection with jsBeat

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