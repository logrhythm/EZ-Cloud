 # Update Mode - Step 3: Handle Missing Fields from Policy File

## Problem Statement
When in **Update Mode**, the policy file may reference JSON paths or "String to JSON" conversion fields that do not exist in the sample data uploaded in Step 2. This creates a mismatch between the policy configuration and the available data.

## Business Requirement
Users need clear visibility when a policy file references fields that are not present in their current sample data. This helps them:
- Understand why certain configurations might not work with their data
- Decide whether to update their sample data or modify the policy
- Avoid runtime errors due to missing field references

---

## Functional Requirements

### Scenario 1: "String to JSON" Field Missing from Sample Data

**Problem:**
- Policy file contains a field in `schemaRule.convertoJson` array (e.g., `$.log`)
- The uploaded sample data in Step 2 does NOT contain this field
- Step 3 tries to pre-fill the "String to JSON" checkbox but the field doesn't exist

**Solution:**
In Step 3, when pre-filling from policy in Update Mode:

1. **Check if the field exists in the sample data**
   - Parse the sample data JSON
   - Check if the path specified in `convertoJson` array exists
   
2. **If field does NOT exist in sample data:**
   - **Still display the field** in the "String to JSON" section
   - **Check the checkbox** (to reflect the policy configuration)
   - **Add a warning indicator** next to the field:
     - Display a warning icon (⚠️ or ⚠️ badge)
     - Show tooltip: "This field is defined in the policy but not found in the current sample data"
     - Use a different visual style (e.g., orange/yellow highlight or italic text)
   
3. **If field EXISTS in sample data:**
   - Display normally with checkbox checked
   - No warning needed
   - Proceed with standard "String to JSON" processing

### Scenario 2: Fanout Path Missing from Sample Data

**Problem:**
- Policy file contains `schemaRule.fanout.inputField` path (e.g., `$.data[*]`)
- The uploaded sample data does NOT contain this array path
- Step 3 tries to select the fanout path in the tree but it doesn't exist

**Solution:**
In Step 3, when pre-filling fanout configuration:

1. **Check if fanout path exists in sample data**
   - Build the JSON tree from sample data
   - Verify the fanout path is present and is an array
   
2. **If fanout path does NOT exist:**
   - Display a warning message at the top of the fanout section:
     - ⚠️ "Policy defines fanout path `$.data[*]` which is not found in the current sample data"
   - Store the fanout path in Vuex state anyway (for later use)
   - Do NOT attempt to select it in the tree (would cause errors)
   - Provide option: "Update sample data" or "Modify policy"
   
3. **If fanout path EXISTS:**
   - Automatically select it in the tree
   - Highlight it visually
   - Proceed normally

### Scenario 3: Child Fanout Path Missing from Sample Data

**Problem:**
- Policy file contains `schemaRule.childfanouts` with nested array paths
- The parent or child path doesn't exist in sample data

**Solution:**
Similar to Scenario 2, display warnings for missing child fanout paths.

---

## UI/UX Design

### Step 3 - "String to JSON" Section

**Normal Field (exists in data):**
```
☑️ $.log         [String contains JSON data]
```

**Missing Field (not in data):**
```
☑️ $.log  ⚠️     [String contains JSON data - Not found in current sample data]
   └─ Warning: This field is defined in the policy but not present in the uploaded sample data
```

### Step 3 - Fanout Section

**Warning Banner (when fanout path missing):**
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Policy Configuration Notice                                  │
│                                                                  │
│ The policy defines the following paths that are not found in    │
│ the current sample data:                                        │
│                                                                  │
│ • Fanout Path: $.Records[*]                                    │
│ • Child Fanout: $.Records[*].tags[*]                           │
│                                                                  │
│ Options:                                                         │
│ [Upload Different Sample Data]  [Continue Anyway]              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Step 3 Component Logic

**File:** `Step3_SchemaConfig.vue`

```javascript
async prefillFromPolicy(schemaRule) {
  const sampleData = this.$store.state.wizard.parsedData;
  const missingFields = [];

  // 1. Handle convertToJson fields
  const convertToJsonFields = schemaRule.convertoJson || [];
  
  for (const fieldPath of convertToJsonFields) {
    // Check if field exists in sample data
    const fieldExists = this.checkFieldExists(sampleData, fieldPath);
    
    if (!fieldExists) {
      missingFields.push({
        type: 'convertoJson',
        path: fieldPath,
        message: `Field "${fieldPath}" defined in policy not found in sample data`
      });
    }
    
    // Display field anyway with warning indicator
    this.addStringToJsonField({
      path: fieldPath,
      checked: true,
      exists: fieldExists,
      warning: !fieldExists
    });
  }

  // 2. Handle fanout path
  const fanoutPath = schemaRule.fanout?.inputField?.[0];
  if (fanoutPath) {
    const pathExists = this.checkFieldExists(sampleData, fanoutPath);
    
    if (!pathExists) {
      missingFields.push({
        type: 'fanout',
        path: fanoutPath,
        message: `Fanout path "${fanoutPath}" defined in policy not found in sample data`
      });
      
      // Store but don't select in tree
      this.$store.commit('SET_FANOUT_PATH', fanoutPath);
      this.showFanoutWarning(fanoutPath);
    } else {
      // Select in tree normally
      this.selectFanoutInTree(fanoutPath);
    }
  }

  // 3. Handle child fanouts
  const childFanouts = schemaRule.childfanouts || [];
  for (const childFanout of childFanouts) {
    const pathExists = this.checkFieldExists(sampleData, childFanout.field);
    
    if (!pathExists) {
      missingFields.push({
        type: 'childfanout',
        path: childFanout.field,
        parentPath: childFanout.parentpath,
        message: `Child fanout "${childFanout.field}" defined in policy not found in sample data`
      });
    }
  }

  // 4. Display all warnings
  if (missingFields.length > 0) {
    this.displayMissingFieldsWarning(missingFields);
  }
}

// Helper method to check if a JSON path exists in data
checkFieldExists(data, jsonPath) {
  try {
    const result = jsonPath.query(data, jsonPath);
    return result && result.length > 0;
  } catch (error) {
    return false;
  }
}

// Display warning banner for missing fields
displayMissingFieldsWarning(missingFields) {
  this.missingFieldsWarning = {
    show: true,
    fields: missingFields
  };
  
  console.warn('[Step3] Missing fields from policy:', missingFields);
}
```

### Vuex Store State

**Add to `wizardModule.js`:**
```javascript
state: {
  // ...existing state
  policyMissingFields: [], // Track fields from policy not in sample data
}

mutations: {
  SET_POLICY_MISSING_FIELDS(state, fields) {
    state.policyMissingFields = fields;
  },
}
```

---

## Success Criteria

- [ ] Missing "String to JSON" fields are displayed with warning indicators
- [ ] Missing fanout paths show a clear warning banner
- [ ] Missing child fanout paths are logged and displayed
- [ ] User can see which policy fields don't match their sample data
- [ ] User can choose to continue anyway or update sample data
- [ ] No errors/crashes when policy references non-existent fields
- [ ] Warning messages are clear and actionable
- [ ] Console logs show all missing field checks for debugging

---

## Testing Scenarios

### Test 1: ConvertToJson Field Missing
1. Upload sample data without `$.log` field
2. Upload policy with `convertoJson: ["$.log"]`
3. Navigate to Step 3
4. **Expected:** `$.log` checkbox is shown and checked, with ⚠️ warning icon and tooltip

### Test 2: Fanout Path Missing
1. Upload sample data as single-line JSON (no arrays)
2. Upload policy with `fanout.inputField: ["$.Records[*]"]`
3. Navigate to Step 3
4. **Expected:** Warning banner shows "Fanout path $.Records[*] not found in sample data"

### Test 3: All Fields Present
1. Upload sample data with `$.log` and `$.Records[*]`
2. Upload policy with matching paths
3. Navigate to Step 3
4. **Expected:** All fields displayed normally, no warnings

### Test 4: Multiple Missing Fields
1. Upload minimal sample data
2. Upload complex policy with multiple convertToJson and fanout paths
3. Navigate to Step 3
4. **Expected:** Warning banner lists ALL missing paths

### Test 5: Partial Match
1. Upload sample data with `$.log` but not `$.data[*]`
2. Upload policy with both fields
3. Navigate to Step 3
4. **Expected:** `$.log` shows normally, `$.data[*]` shows warning

---

## Edge Cases

1. **Empty Sample Data:** Show warning for all policy fields
2. **Invalid JSON Paths in Policy:** Validate and show error message
3. **Sample Data Changed After Policy Upload:** Re-validate on Step 2 data change
4. **User Updates Sample Data:** Re-check and clear warnings if fields now exist
5. **Nested Paths:** Properly check nested object/array paths (e.g., `$.a.b.c[*].d`)

---

## Future Enhancements

1. **Auto-suggest Alternative Paths:** If `$.log` not found, suggest similar fields like `$.message` or `$.data`
2. **Sample Data Validator:** Before proceeding, validate that sample data matches policy requirements
3. **Policy Editor:** Allow inline editing of policy paths to match available data
4. **Field Mapping Assistant:** Auto-map policy fields to closest matching data fields 