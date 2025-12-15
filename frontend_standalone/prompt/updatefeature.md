# Feature: Update Existing Policy via File Upload

## Overview
Implement functionality that allows users to update an existing policy by uploading a JSON policy file. When the user selects the "Update" mode and uploads a policy file, the wizard should parse the file and pre-fill all wizard steps with the configuration from the uploaded policy.

## Business Requirement
Users need the ability to:
1. Load an existing policy configuration from a JSON file
2. Navigate through wizard steps with all fields pre-populated based on the policy file
3. Modify any configuration in the pre-filled wizard steps
4. Save the updated policy configuration

This feature enables users to:
- Update existing policies without manual re-entry
- Clone and modify existing policies
- Version control policies via JSON files
- Reduce configuration errors through file-based updates

## Implementation Approach
This feature will be implemented in **phases**, with each wizard step handled incrementally to ensure stability and proper testing.

---

## Phase 1: Policy File Upload and Validation

### User Flow
1. User selects **"Update"** radio button (as opposed to "Create New")
2. User uploads a JSON policy file via file picker
3. System validates the uploaded file
4. Upon successful validation, the policy data is stored in Vuex store for processing in next steps
5. User proceeds through wizard steps with pre-filled data

### Technical Requirements

#### 1. Policy File Validation
The uploaded JSON policy file must be validated for:

**Format Validation:**
- Valid JSON syntax
- Expected root structure (verify it matches policy schema)
- Required fields are present

**Content Validation:**
- Schema version compatibility (if versioning exists)
- Valid data types for all fields
- Valid enum values (e.g., operators, data types)
- Path expressions are syntactically correct
- No malformed or injection attacks

**Error Handling:**
- Display clear error messages for validation failures:
  - "Invalid JSON format"
  - "Missing required field: [fieldName]"
  - "Invalid value for field: [fieldName]"
  - "Unsupported schema version"
- Allow user to upload a different file on validation failure
- Preserve "Create New" mode if validation fails

#### 2. Vuex Store Changes
**File:** `wizardModule.js`

**New State Properties:**
```javascript
state: {
  mode: 'create', // 'create' or 'update'
  uploadedPolicyFile: null, // Original file object
  uploadedPolicyData: null, // Parsed JSON policy object
  // ...existing state
}
```

**New Mutations:**
- `SET_WIZARD_MODE`: Set wizard mode ('create' or 'update')
- `SET_UPLOADED_POLICY_FILE`: Store the uploaded file object
- `SET_UPLOADED_POLICY_DATA`: Store the parsed policy JSON object
- `CLEAR_UPLOADED_POLICY`: Clear policy file and data (when switching back to create mode)

**New Actions:**
- `uploadPolicyFile`: Handle file upload, validation, parsing, and storage
- `clearPolicyFile`: Clear uploaded policy and reset to create mode

#### 3. Policy Data Structure
The uploaded policy JSON should contain the complete pipeline configuration including:
- Pipeline metadata (name) is reqired
- Schema configuration (fanout,childfanouts,convertoJson) is optional
- Filter conditions (required)
- Field mappings (source paths, transformations) is required
- SubTransforms (conditions, nested mappings) is optional
- Output configuration

**Example Policy Structure:**
```json
{
  "name": "source_name",
  "filter": "condition_expression",
  "schemaRule": {
    "fanout": {
      "inputField": ["$.path.to.array[*]"]
    },
    "childfanouts": [
      {
        "field": "$.child[*]",
        "parentpath": "$.parent[*]"
      }
    ],
    "convertoJson": ["$.path.to.convert"]
  },
  "transforms": [
    {
      "sourcePath": "$.field",
      "targetField": "targetName",
      "transformations": []
    }
  ],
  "subtransforms": [
    {
      "condition": "$.status == 'active'",
      "transforms": []
    }
  ]
}
```

#### 4. Validation Function
**Location:** New utility file `src/services/wizard/policyValidator.js`

```javascript
export function validatePolicyFile(policyData) {
  // Returns: { valid: boolean, errors: string[], warnings: string[] }
}
```

**Validation Checks:**
- JSON structure integrity
- Required fields presence
- Data type validation
- Path expression syntax
- Operator validity
- Schema version compatibility

### Success Criteria for Phase 1
- [ ] User can select "Update" mode via radio button
- [ ] User can upload a JSON policy file
- [ ] File is validated for proper JSON format and structure
- [ ] Validation errors are displayed clearly to the user
- [ ] Valid policy data is parsed and stored in Vuex store (`uploadedPolicyData`)
- [ ] Policy file name is displayed after successful upload
- [ ] User can clear uploaded policy and return to "Create" mode
- [ ] Console logging shows parsed policy structure for debugging

### Testing Scenarios for Phase 1
1. **Valid Policy Upload:** Upload a valid policy JSON → SUCCESS, data stored
2. **Invalid JSON:** Upload malformed JSON → ERROR displayed
3. **Missing Required Fields:** Upload JSON missing key fields → ERROR displayed
4. **Large File:** Upload >5MB file → ERROR: "File too large"
5. **Wrong File Type:** Upload .txt or .xml → ERROR: "Invalid file type"
6. **Mode Switch:** Upload policy, then switch to "Create" mode → Policy data cleared
7. **Re-upload:** Upload policy, then upload different policy → Previous data replaced

---

## Phase 2: Pre-fill Step 3 (Schema Configuration)

### Overview
Step 3 (Schema Configuration) needs to support pre-filling data when the wizard is in "Update" mode. When a policy file is uploaded, the schema configuration (fanout paths, child fanouts, and convertToJson fields) should be automatically populated and displayed.

### Step 2 Behavior
- **No changes required** for Step 2 (Data Upload) in Update mode
- Step 2 continues to work the same way for both "Create" and "Update" modes
- Sample data upload and parsing remain unchanged

### Step 3 Update Mode Requirements

#### Pre-fill Logic Flow
When the user navigates to Step 3:

1. **Check if Vuex state already has Step 3 data:**
   - If Step 3 state exists (user previously configured this step), display those values
   - This handles the case where user is navigating back to Step 3

2. **If Step 3 state is empty, check wizard mode:**
   
   **Create Mode (default):**
   - No pre-filling
   - Display empty/default UI as it currently works
   - User manually selects schema configuration
   
   **Update Mode (policy uploaded):**
   - Fetch schema configuration from `uploadedPolicyData.schemaRule`
   - Pre-populate all Step 3 fields based on policy data
   - Display configuration in read-only or editable mode (user can modify if needed)

#### Data Extraction from Policy

**Extract from `uploadedPolicyData.schemaRule`:**

```javascript
const schemaRule = uploadedPolicyData.schemaRule;

// 1. Extract fanout path
const fanoutPath = schemaRule.fanout?.inputField?.[0] || null;
// Example: "$.path.to.array[*]"

// 2. Extract child fanouts
const childFanouts = schemaRule.childfanouts || [];
// Example: [{ field: "$.child[*]", parentpath: "$.parent[*]" }]

// 3. Extract convertToJson fields
const convertToJsonFields = schemaRule.convertoJson || [];
// Example: ["$.stringField", "$.anotherStringField"]
```

#### UI Pre-population Steps

**1. Render Fanout Array Tree:**
   - Parse the sample data (from Step 2) to build the JSON tree structure
   - If `fanoutPath` exists in policy, automatically select it in the fanout tree UI
   - Highlight the selected fanout path in the tree view
   - Store fanout path in Vuex state

**2. Pre-check "String to JSON" Checkboxes:**
   - For each field in `convertoJson` array from the policy:
     - Find the corresponding checkbox in the UI
     - Check the checkbox automatically
     - Mark the field as "convert to JSON"
   
**3. Scan for Additional Arrays After String-to-JSON Conversion:**
   - After checking the "String to JSON" checkboxes:
     - Parse each selected field's value (treat it as JSON string)
     - Scan for array attributes within the parsed JSON
     - Display any discovered arrays in the fanout section
   - This mimics the behavior when user manually selects "String to JSON" in Create mode

**4. Store Configuration in Vuex:**
   - Update Vuex state with:
     - `dataType`: 'json' (or from policy if specified)
     - `schemaType`: 'multiline' or 'singleline' (determine from fanout presence)
     - `fanout`: Array of fanout paths
     - `childfanouts`: Array of child fanout configurations
     - `stringToJsonFields`: Array of fields marked for conversion

#### Implementation Details

**Component:** `Step3_SchemaConfig.vue`

**Mounted/Created Hook Logic:**
```javascript
async mounted() {
  // Check if Step 3 already has data in Vuex
  if (this.hasExistingStep3Data) {
    // Load existing data (user navigating back)
    this.loadExistingData();
    return;
  }

  // Check wizard mode
  const mode = this.$store.state.wizard.mode;
  
  if (mode === 'update') {
    const policyData = this.$store.state.wizard.uploadedPolicyData;
    
    if (policyData && policyData.schemaRule) {
      await this.prefillFromPolicy(policyData.schemaRule);
    }
  }
  
  // Otherwise, default Create mode behavior (no pre-fill)
}
```

**Pre-fill Method:**
```javascript
async prefillFromPolicy(schemaRule) {
  try {
    // 1. Extract fanout path
    const fanoutPath = schemaRule.fanout?.inputField?.[0];
    if (fanoutPath) {
      this.selectFanoutPath(fanoutPath);
    }

    // 2. Extract and apply convertToJson fields
    const convertToJsonFields = schemaRule.convertoJson || [];
    for (const field of convertToJsonFields) {
      this.checkStringToJsonCheckbox(field);
      await this.scanForArraysInField(field);
    }

    // 3. Store child fanouts for next phase
    if (schemaRule.childfanouts) {
      this.$store.commit('SET_CHILD_FANOUTS', schemaRule.childfanouts);
    }

    console.log('[Step3] Pre-filled from policy:', {
      fanoutPath,
      convertToJsonFields,
      childFanouts: schemaRule.childfanouts
    });
  } catch (error) {
    console.error('[Step3] Error pre-filling from policy:', error);
    this.$emit('error', 'Failed to load schema configuration from policy');
  }
}
```

#### Vuex Mutations Needed

**Add to `wizardModule.js`:**
```javascript
SET_CHILD_FANOUTS(state, childFanouts) {
  state.childfanouts = childFanouts;
},

SET_CONVERT_TO_JSON_FIELDS(state, fields) {
  state.stringToJsonFields = fields;
},

SET_SCHEMA_TYPE(state, schemaType) {
  state.schemaType = schemaType; // 'multiline' or 'singleline'
}
```

### Success Criteria for Phase 2
- [ ] Step 3 correctly detects "Update" mode on mount
- [ ] Fanout path from policy is automatically selected in the tree view
- [ ] "String to JSON" checkboxes are pre-checked based on policy data
- [ ] After checking "String to JSON" fields, arrays within those fields are scanned and displayed
- [ ] Schema configuration is stored correctly in Vuex state
- [ ] User can modify pre-filled values if needed
- [ ] Switching between Create and Update modes works correctly
- [ ] Console logging shows pre-fill process for debugging
- [ ] No regression in Create mode (existing behavior unchanged)

### Testing Scenarios for Phase 2
1. **Policy with Fanout:** Upload policy with fanout path → Step 3 shows fanout selected
2. **Policy with convertToJson:** Upload policy with convertToJson fields → Checkboxes pre-checked
3. **Policy with Both:** Upload policy with both fanout and convertToJson → Both pre-filled correctly
4. **Policy with Nested Arrays:** convertToJson field contains nested arrays → Arrays displayed in fanout section
5. **Policy without schemaRule:** Upload policy without schemaRule → Step 3 shows empty (no errors)
6. **Navigate Back:** Pre-fill Step 3, go to Step 4, navigate back → Previous selections preserved
7. **Switch to Create Mode:** Pre-fill Step 3 in Update mode, switch to Create → Fields cleared
8. **Modify Pre-filled Data:** Pre-filled Step 3, modify fanout path → New selection saved correctly

### Known Limitations (Phase 2)
- **Child fanouts handling:** Stored in Vuex but full UI interaction deferred to Phase 2.1
- The focus is on `fanout.inputField` and `convertoJson` pre-population
- Child fanout array tree selection will be implemented in the next phase

---

## Future Phases (To Be Implemented)

### Phase 2.1: Complete Child Fanouts Handling in Step 3
- Render child fanout paths in the UI
- Allow selection/deselection of child fanouts
- Display parent-child relationship in tree view
- Validate child fanout paths against parent paths


### Phase 3: Pre-fill Step 4 (Filter Conditions)
- Parse filter conditions from policy
- Reconstruct condition tree with AND/OR logic
- Display in UI condition builder

### Phase 4: Pre-fill Step 5 (Field Mappings)
- Parse field mappings from policy
- Populate source path, target field, transformations
- Handle fanout-based mappings correctly

### Phase 5: Pre-fill Step 6 (SubTransforms)
- Parse subtransform configurations
- Reconstruct conditions and nested field mappings
- Handle multiple subtransforms per mapping

### Phase 6: Complete Update Flow
- Final validation before save
- Track modified fields
- Generate diff view (optional)
- Save updated policy

---

## Technical Notes
- Maintain backward compatibility with "Create New" mode
- Ensure wizard reset properly clears policy data when switching modes
- Consider adding policy file export feature for symmetry
- Log all policy parsing steps for debugging
- Handle edge cases like partial policy files gracefully
- Consider adding a "Review Changes" step before saving

## UI/UX Considerations
- Clear visual distinction between "Create" and "Update" modes
- Breadcrumb or indicator showing current mode
- Confirmation dialog when switching modes with unsaved changes
- Loading spinner during file parsing
- Success message after successful policy load
- Tooltip explaining policy file format requirements
