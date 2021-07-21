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
    - Create new LS Virtualisation Item and associate it to LS Virtualisation
    - Search related Open Collector LS
    - Add LS Virtualisation to Open Collector LS
  - Exisiting Log Source / Update of field mapping
    - Update Beat configuration in right location
    - Re-import JQ to OC
    - Modify MPE Sub-Rule(s)
    - Modify Processing Policy
    - Modify LS Virtualisation Item

## TO FIX
- Refactor: upsert_Log_Source_Virtualisation_Template to not need to add a SP to EMDB
- Refactor: upsert_Processing_Policy to not need to add a SP to EMDB

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
