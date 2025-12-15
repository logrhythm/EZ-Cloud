# Phase 2 Implementation: Step 3 Schema Configuration Pre-fill

## Overview
This document describes the implementation of Phase 2 of the update feature, which pre-fills Step 3 (Schema Configuration) with data from an uploaded policy file when in "Update" mode.

## Implementation Date
2025-12-12

## Files Modified

### 1. `/src/store/wizardModule.js`
**Changes:** Added new Vuex mutations for schema configuration management

**New Mutations:**
```javascript
SET_CHILD_FANOUTS (state, childFanouts)
SET_CONVERT_TO_JSON_FIELDS (state, fields)
SET_SCHEMA_TYPE (state, schemaType)
```

**Purpose:**
- Store child fanout configurations from policy
- Update convert-to-JSON field selections
- Track schema type (multiline/singleline) for future use

**Location:** Lines 460-475

---

### 2. `/src/components/wizard/steps/Step3_SchemaConfig.vue`
**Changes:** Added pre-fill logic for Update mode

#### A. New Lifecycle Hook: `mounted()`
**Location:** Lines 1151-1185

**Purpose:** Detects Update mode and triggers pre-fill from policy data

**Logic Flow:**
1. Check if Step 3 already has data (user navigating back)
   - If yes: Skip pre-fill, use existing selections
2. Check wizard mode (`projectConfig.mode`)
   - If `create`: Skip pre-fill
   - If `update`: Proceed with pre-fill
3. Verify policy data exists (`policyUpload.uploadedPolicyData.schemaRule`)
4. Call `prefillFromPolicy()` method

**Console Logging:**
- Logs mode detection
- Logs existing data check
- Logs policy data availability

---

#### B. New Method: `prefillFromPolicy(schemaRule)`
**Location:** Lines 709-852

**Purpose:** Extracts schema configuration from uploaded policy and populates UI

**Parameters:**
- `schemaRule` (Object): The schemaRule object from uploaded policy

**Implementation Steps:**

##### Step 1: Extract and Pre-fill Convert-to-JSON Fields
```javascript
const convertToJsonFields = schemaRule.convertoJson || schemaRule.ConvertoJson || []
```

**Logic:**
- Extracts fields that should be converted from JSON strings
- Filters to only include fields that exist in `convertToJsonCandidates`
- Updates `selectedConvertToJsonFields` array
- Triggers `updateFanoutCandidatesFromParsedJson()` to parse JSON and discover nested arrays

**Example:**
```javascript
// Policy has:
schemaRule.convertoJson = ["$.metadata", "$.details"]

// Result:
this.selectedConvertToJsonFields = ["$.metadata", "$.details"]
// Checkboxes automatically checked via v-model binding
```

---

##### Step 2: Extract and Pre-fill Fanout Path
```javascript
const fanoutPath = schemaRule.fanout?.inputField?.[0] || null
```

**Logic:**
- Extracts the first fanout path from `fanout.inputField` array
- Normalizes path format (removes `$.` prefix if present)
- Checks if path exists in `fanoutCandidates`
- Adds to `selectedFanoutFields` if valid

**Path Normalization:**
```javascript
// Policy has: "$.items[*]"
// Normalized to: "items[*]" (to match fanoutCandidates format)
```

**Example:**
```javascript
// Policy has:
schemaRule.fanout = {
  inputField: ["$.orders[*]"]
}

// Result:
this.selectedFanoutFields = ["orders[*]"]
// Tree node automatically selected via JsonTreeViewer
```

---

##### Step 3: Extract Child Fanouts
```javascript
const childFanouts = schemaRule.childfanouts || []
```

**Logic:**
- Extracts child fanout configurations
- Stores in Vuex via `SET_CHILD_FANOUTS` mutation
- Iterates through child fanouts and adds each field to selections
- Validates each path exists in `fanoutCandidates` before adding

**Child Fanout Structure:**
```javascript
[
  {
    field: "$.parent[*]",
    parentpath: null  // Root-level array
  },
  {
    field: "$.child[*]",
    parentpath: "$.parent[*]"  // Nested array
  }
]
```

**Example:**
```javascript
// Policy has:
schemaRule.childfanouts = [
  { field: "$.orders[*]", parentpath: null },
  { field: "$.items[*]", parentpath: "$.orders[*]" }
]

// Result:
this.selectedFanoutFields = ["orders[*]", "items[*]"]
// Both arrays selected in tree
```

---

##### Step 4: Update Vuex Store
```javascript
this.UPDATE_SCHEMA_RULES({
  convertToJson: [...this.selectedConvertToJsonFields],
  fanout: [...this.selectedFanoutFields],
  childfanouts: childFanouts
})
```

**Purpose:** Persist selections to Vuex for:
- Navigation between steps
- Policy generation in Step 7
- State preservation on refresh (if auto-save enabled)

---

##### Step 5: UI Update and Notification
```javascript
await this.$nextTick()
this.$forceUpdate()
```

**Purpose:**
- Force Vue to re-render components with new data
- Ensure JsonTreeViewer receives updated selections
- Display success notification to user

**Notification Example:**
```
✓ Schema configuration loaded from policy
  2 string-to-JSON fields, 3 fanout arrays
```

---

#### C. Error Handling

**Error Cases:**
1. Invalid schemaRule structure
2. Fields not found in candidates
3. Path normalization failures
4. Vuex mutation failures

**Error Notification:**
```javascript
this.$q?.notify({
  type: 'negative',
  message: 'Failed to load schema configuration from policy',
  caption: error.message,
  timeout: 5000,
  position: 'top'
})
```

**Console Logging:**
- All errors logged with stack traces
- Warning for fields not found in candidates
- Info logs for successful operations

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Action                             │
│                  (Navigate to Step 3)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  mounted()     │
                    │  Lifecycle     │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
         ┌──────▼──────┐          ┌──────▼──────┐
         │ Has Existing│          │ Check Wizard│
         │    Data?    │          │    Mode     │
         └──────┬──────┘          └──────┬──────┘
                │                         │
         ┌──────▼──────┐          ┌──────▼──────┐
         │     YES     │          │   update    │
         │  Skip Pre-  │          │   mode?     │
         │    fill     │          └──────┬──────┘
         └─────────────┘                 │
                                  ┌──────▼──────┐
                                  │ Policy Data │
                                  │  Exists?    │
                                  └──────┬──────┘
                                         │
                                  ┌──────▼──────────────────┐
                                  │  prefillFromPolicy()    │
                                  └──────┬──────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
            ┌───────▼───────┐   ┌────────▼────────┐  ┌───────▼───────┐
            │Extract Convert│   │Extract Fanout   │  │Extract Child  │
            │  to JSON      │   │    Paths        │  │   Fanouts     │
            └───────┬───────┘   └────────┬────────┘  └───────┬───────┘
                    │                    │                    │
                    └────────────────────┼────────────────────┘
                                         │
                                  ┌──────▼──────────────────┐
                                  │ Update Component State  │
                                  │ - selectedConvertToJson │
                                  │ - selectedFanoutFields  │
                                  └──────┬──────────────────┘
                                         │
                                  ┌──────▼──────────────────┐
                                  │   Update Vuex Store     │
                                  │   UPDATE_SCHEMA_RULES   │
                                  └──────┬──────────────────┘
                                         │
                                  ┌──────▼──────────────────┐
                                  │    Force UI Update      │
                                  │   Show Notification     │
                                  └─────────────────────────┘
```

---

## UI Behavior

### Convert-to-JSON Section
**Before Pre-fill:**
```
[ ] $.metadata
[ ] $.details
[ ] $.config
```

**After Pre-fill (if policy has `["$.metadata", "$.details"]`):**
```
[✓] $.metadata
[✓] $.details
[ ] $.config

Selected Fields (2):
  • $.metadata
  • $.details
```

---

### Fanout Section
**Before Pre-fill:**
```
JSON Structure:
  ○ orders[*]
  ○ items[*]
  ○ users[*]
```

**After Pre-fill (if policy has `["$.orders[*]"]`):**
```
JSON Structure:
  ● orders[*]         ← Selected
  ○ items[*]
  ○ users[*]

Selected Arrays for Fanout (1):
  • orders[*]
```

---

## Testing Scenarios

### Scenario 1: Policy with Fanout Only
**Policy Data:**
```json
{
  "schemaRule": {
    "fanout": {
      "inputField": ["$.events[*]"]
    }
  }
}
```

**Expected Result:**
- `events[*]` selected in tree
- No Convert-to-JSON selections
- Vuex updated with fanout: `["events[*]"]`

---

### Scenario 2: Policy with Convert-to-JSON Only
**Policy Data:**
```json
{
  "schemaRule": {
    "convertoJson": ["$.payload", "$.metadata"]
  }
}
```

**Expected Result:**
- `$.payload` and `$.metadata` checkboxes checked
- Parsed JSON fields scanned for arrays
- Discovered arrays added to fanout candidates
- Vuex updated with convertToJson: `["$.payload", "$.metadata"]`

---

### Scenario 3: Policy with Both
**Policy Data:**
```json
{
  "schemaRule": {
    "fanout": {
      "inputField": ["$.logs[*]"]
    },
    "convertoJson": ["$.data"]
  }
}
```

**Expected Result:**
- `$.data` checkbox checked
- `logs[*]` selected in tree
- Both sections populated
- Vuex updated with both configurations

---

### Scenario 4: Policy with Child Fanouts
**Policy Data:**
```json
{
  "schemaRule": {
    "childfanouts": [
      {
        "field": "$.orders[*]",
        "parentpath": null
      },
      {
        "field": "$.items[*]",
        "parentpath": "$.orders[*]"
      }
    ]
  }
}
```

**Expected Result:**
- `orders[*]` selected (root)
- `items[*]` selected (child)
- Child fanouts stored in Vuex
- Both arrays visible in selected list

---

### Scenario 5: Policy with Nested Arrays in Parsed JSON
**Policy Data:**
```json
{
  "schemaRule": {
    "convertoJson": ["$.stringifiedData"]
  }
}
```

**Sample Data ($.stringifiedData value):**
```json
"{\"events\": [{\"id\": 1}, {\"id\": 2}]}"
```

**Expected Result:**
- `$.stringifiedData` checkbox checked
- Parsing triggered automatically
- `$.stringifiedData.events[*]` discovered and added to fanout candidates
- User can now select the nested array
- Vuex updated with both convertToJson and discovered arrays

---

### Scenario 6: Policy without schemaRule
**Policy Data:**
```json
{
  "name": "test-policy",
  "transforms": [...]
}
```

**Expected Result:**
- No pre-fill occurs
- UI shows empty/default state
- No errors thrown
- User can configure manually
- Console log: "Update mode but no policy schemaRule found"

---

### Scenario 7: Back Navigation
**Steps:**
1. Navigate to Step 3 in Update mode
2. Pre-fill occurs (2 fields selected)
3. User modifies selection (adds 1 more field)
4. Navigate to Step 4
5. Navigate back to Step 3

**Expected Result:**
- Step 3 shows 3 selected fields (modified state)
- Pre-fill skipped (existing data detected)
- Selections preserved from previous visit
- Console log: "Step 3 already has data, skipping pre-fill"

---

### Scenario 8: Mode Switch
**Steps:**
1. Start in Update mode
2. Upload policy with schema config
3. Navigate to Step 3 (pre-fill occurs)
4. Go back to Step 1
5. Switch to Create mode
6. Navigate to Step 3

**Expected Result:**
- Step 3 shows empty/default state
- Previous pre-filled data cleared
- No pre-fill occurs (Create mode)
- User starts fresh configuration

---

## Console Logging

### Pre-fill Start
```
╔══════════════════════════════════════════════════════════════════════════════
║ [Step 3] Mounted: Checking for Update mode pre-fill
╚══════════════════════════════════════════════════════════════════════════════
[Step 3] Wizard mode: update
[Step 3] Update mode detected with policy data - initiating pre-fill
╔══════════════════════════════════════════════════════════════════════════════
║ [Step 3] prefillFromPolicy: Starting pre-fill process
╠══════════════════════════════════════════════════════════════════════════════
║ schemaRule: {
║   "fanout": { "inputField": ["$.events[*]"] },
║   "convertoJson": ["$.metadata"]
║ }
╚══════════════════════════════════════════════════════════════════════════════
```

### Convert-to-JSON Processing
```
[Step 3] Extracted convertToJson fields: ["$.metadata"]
[Step 3] Valid convertToJson fields (exist in candidates): ["$.metadata"]
[Step 3] Pre-filled convertToJson fields: ["$.metadata"]
```

### Fanout Processing
```
[Step 3] Extracted fanout path: $.events[*]
[Step 3] Normalized fanout path: events[*]
[Step 3] Added fanout path to selections: events[*]
```

### Child Fanouts Processing
```
[Step 3] Extracted child fanouts: [{"field": "$.items[*]", "parentpath": "$.events[*]"}]
[Vuex] SET_CHILD_FANOUTS mutation called with: [{"field": "$.items[*]", "parentpath": "$.events[*]"}]
[Step 3] Stored child fanouts in Vuex
[Step 3] Processing child fanout field: $.items[*] → items[*]
[Step 3] Added child fanout path to selections: items[*]
```

### Pre-fill Complete
```
╔══════════════════════════════════════════════════════════════════════════════
║ [Step 3] Pre-fill completed successfully
╠══════════════════════════════════════════════════════════════════════════════
║ Final selectedConvertToJsonFields: ["$.metadata"]
║ Final selectedFanoutFields: ["events[*]", "items[*]"]
║ Stored child fanouts: 1
╚══════════════════════════════════════════════════════════════════════════════
```

---

## Edge Cases Handled

### 1. Missing Fields in Candidates
**Scenario:** Policy specifies a field that doesn't exist in sample data

**Handling:**
- Field filtered out during validation
- Warning logged to console
- Pre-fill continues with valid fields
- No error notification (graceful degradation)

**Console Output:**
```
[Step 3] No valid convertToJson fields found in candidates
```

---

### 2. Path Format Variations
**Scenario:** Policy uses different path formats than component

**Handling:**
- Automatic normalization of paths
- Supports both `$.field` and `field` formats
- Handles `[*]` and `[0]` array notation
- Checks multiple path variants during validation

**Examples:**
```javascript
// Policy has: "$.items[*]"
// Component expects: "items[*]"
// Normalization: Remove "$." prefix

// Policy has: "$.items[0]"
// Component expects: "items[*]"
// Normalization: Replace [0] with [*] (handled by fanoutCandidates)
```

---

### 3. Async Race Conditions
**Scenario:** Pre-fill runs before sample data analysis completes

**Handling:**
- `await this.$nextTick()` before processing
- Multiple nextTick calls to ensure DOM updates
- Validation checks before accessing candidates
- Fallback to empty arrays if data not ready

---

### 4. Component Re-mount
**Scenario:** Component destroyed and re-created during navigation

**Handling:**
- Check for existing data in `created()` hook
- Restore from Vuex if available
- Skip pre-fill if data already exists
- Preserve user modifications

---

## Success Criteria Verification

✅ **Step 3 detects "Update" mode on mount**
- Implemented in `mounted()` hook (line 1170)
- Checks `projectConfig.mode === 'update'`

✅ **Fanout path from policy is auto-selected in tree**
- Implemented in `prefillFromPolicy()` (lines 750-775)
- Normalizes path and adds to `selectedFanoutFields`
- JsonTreeViewer automatically reflects selection via `initial-selected-paths` prop

✅ **"String to JSON" checkboxes are pre-checked**
- Implemented in `prefillFromPolicy()` (lines 722-747)
- Updates `selectedConvertToJsonFields`
- Quasar q-checkbox automatically checks via v-model binding

✅ **Arrays within converted fields are scanned and displayed**
- Implemented via `updateFanoutCandidatesFromParsedJson()` call (line 740)
- Automatically triggered after setting convertToJson fields
- Discovered arrays added to fanoutCandidates

✅ **Schema config stored in Vuex correctly**
- Implemented via `UPDATE_SCHEMA_RULES()` mutation (lines 811-815)
- Stores convertToJson, fanout, and childfanouts
- Data persisted across navigation

✅ **User can modify pre-filled values**
- No restrictions on user modifications
- All UI controls remain interactive
- Changes tracked in component state
- Saved to Vuex on navigation

✅ **Switching between modes works correctly**
- Handled by existing wizard logic
- Mode switch clears previous state
- Create mode skips pre-fill (line 1183)

✅ **Console logging shows pre-fill process**
- Comprehensive logging throughout
- Box-drawing characters for visual separation
- Logs all data transformations
- Helps debugging and verification

✅ **No regression in Create mode**
- Pre-fill only runs in Update mode
- Create mode logic unchanged
- Existing functionality preserved

---

## Known Limitations

### 1. Child Fanout Full UI Interaction
**Status:** Deferred to future phase

**Current Behavior:**
- Child fanouts stored in Vuex
- Fields added to selections
- Tree shows selections

**Future Enhancement:**
- Visual indication of parent-child relationships
- Hierarchical selection UI
- Validation of parent-child integrity

---

### 2. Schema Type Detection
**Status:** Mutation added but not fully utilized

**Current Behavior:**
- `SET_SCHEMA_TYPE` mutation exists
- Not currently set during pre-fill
- No impact on functionality

**Future Enhancement:**
- Detect multiline vs singleline from policy
- Use schema type for validation
- Display schema type in UI

---

## Integration Points

### Vuex Store
**Module:** `wizard`

**State Used:**
- `projectConfig.mode` - Wizard mode (create/update)
- `policyUpload.uploadedPolicyData` - Parsed policy JSON
- `schemaRules` - Schema configuration state

**Mutations Called:**
- `UPDATE_SCHEMA_RULES` - Update schema configuration
- `SET_CHILD_FANOUTS` - Store child fanouts
- `SET_PARSED_STRINGIFIED_JSON` - Store parsed JSON data

---

### JsonTreeViewer Component
**Integration:**
- Receives `initial-selected-paths` prop
- Displays pre-selected arrays
- Emits selection changes
- Handles path format variations

---

### SchemaRuleService
**Methods Used:**
- `parseJsonFieldForArrays()` - Parse JSON strings for arrays
- `updateRepresentativeDataWithParsedFields()` - Update tree data
- `buildChildFanouts()` - Build childfanouts structure

---

## Future Enhancements

### Phase 3: Step 4 Pre-fill (Filter Rules)
- Extract filter conditions from policy
- Pre-populate filter builder
- Display filter expression

### Phase 4: Step 5 Pre-fill (Field Mappings)
- Extract transforms from policy
- Pre-populate mapping table
- Handle transformations

### Phase 5: Step 6 Pre-fill (SubTransforms)
- Extract subtransforms from policy
- Pre-populate nested conditions
- Handle nested transforms

---

## Troubleshooting

### Issue: Pre-fill not triggered
**Symptoms:** Step 3 shows empty state in Update mode

**Checks:**
1. Verify mode is set to 'update' in Step 1
2. Check policy file was uploaded successfully
3. Verify `schemaRule` exists in policy
4. Check console for warnings

**Console Commands:**
```javascript
// Check mode
console.log(this.$store.state.wizard.projectConfig.mode)

// Check policy data
console.log(this.$store.state.wizard.policyUpload.uploadedPolicyData)

// Check schema rule
console.log(this.$store.state.wizard.policyUpload.uploadedPolicyData?.schemaRule)
```

---

### Issue: Fields not appearing in selections
**Symptoms:** Policy has fields but they're not pre-filled

**Possible Causes:**
1. Fields don't exist in sample data
2. Path format mismatch
3. Candidates not analyzed yet

**Resolution:**
- Check convertToJsonCandidates array
- Check fanoutCandidates array
- Verify sample data was uploaded in Step 2
- Check console for "not found in candidates" warnings

---

### Issue: Selections lost on navigation
**Symptoms:** Pre-filled data disappears when navigating back

**Possible Causes:**
1. Vuex not updated
2. Component re-initialization issue
3. Mode switched during navigation

**Resolution:**
- Verify `UPDATE_SCHEMA_RULES` mutation called
- Check Vuex state after navigation
- Ensure `beforeDestroy` saves state

---

## Conclusion

Phase 2 implementation successfully adds Update mode pre-fill functionality to Step 3 (Schema Configuration). The implementation:

- ✅ Extracts schema configuration from uploaded policy
- ✅ Pre-fills Convert-to-JSON fields with checkbox selection
- ✅ Pre-fills Fanout arrays with tree selection
- ✅ Stores child fanouts for future use
- ✅ Handles edge cases and path variations
- ✅ Preserves user modifications
- ✅ Maintains backward compatibility with Create mode
- ✅ Provides comprehensive error handling
- ✅ Includes detailed console logging for debugging

The implementation is production-ready and meets all Phase 2 requirements.

---

## Related Documentation
- Phase 1: Policy Upload and Validation (`prompt/updatefeature.md`)
- Phase 3: Filter Rules Pre-fill (pending)
- Phase 4: Field Mappings Pre-fill (pending)
- Phase 5: SubTransforms Pre-fill (pending)
