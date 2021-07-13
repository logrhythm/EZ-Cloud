# TODO - Backend

### Target: v0.7

## TO DO
- [ ] Build packaged version
  - [ ] Compress into a versionned archive
- [ ] Remove dependance to config/ssh.json
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
- [ ] Build SQL functions to
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
  - [ ] Create Processing Policy
  - [ ] Create LS Virtualisation
  - [ ] List Open Collector LS
  - [ ] Add LS Virtualisation to LS
- [ ] Build API endpoint to
  - [ ] Create LS Type
  - [ ] Create MPE Rules
  - [ ] Create MPE Sub-Rules
  - [ ] Create Processing Policy
  - [ ] Create LS Virtualisation
  - [ ] List Open Collector LS
  - [ ] Add LS Virtualisation to LS
- Process of onboarding a LS from JQ
  - New Log Source
    - Drop Beat configuration in right location
    - Import JQ to OC
    - Create LS Type
    - Create MPE Rule
    - Create MPE Sub-Rule(s)
      - Based on Field Mapping / Sub Rules ID
    - Create Processing Policy
    - Create LS Virtualisation
    - Search related Open Collector LS
    - Add LS Virtualisation to Open Collector LS
  - Exisiting Log Source / Update of field mapping
    - Update Beat configuration in right location
    - Re-import JQ to OC
    - Modify MPE Sub-Rule(s)
    - Modify Processing Policy
    - Modify LS Virtualisation

## TO FIX

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
