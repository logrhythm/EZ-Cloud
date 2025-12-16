# Sub-Transform Configuration (Step 6) - Update Mode Pre-fill

## Objective
Implement pre-fill functionality for Step 6 (Sub-Transform Configuration) when in **Update Mode**, by reading the `subtransforms` attribute from the uploaded policy file and populating the UI with existing sub-transform rules.

---

## Data Structure

### Policy File Structure
The `subtransforms` attribute in the uploaded policy is an **array of JSON objects**, where each object represents one sub-transform rule:

```json
{
  "condition": "@.errorMessage || @.errorCode",
  "exitonmatch": true,
  "transforms": [
    {
      "inputRule": "Failure",
      "LRSchemaField": "tag2",
      "FanoutParentElement": "$.log.Records[*]",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null,
      "subtransforms": null 
    }
  ]
}
```

### Attribute Mapping

| Policy Attribute | UI Component | Description | Special Handling |
|-----------------|--------------|-------------|------------------|
| `condition` | Filter Condition input field | JSONPath filter expression (e.g., `@.errorMessage \|\| @.errorCode`) | Can be `null` = "catch-all" scenario |
| `exitonmatch` | "Exit on Match" checkbox | Boolean flag to stop processing after first match | Direct boolean mapping |
| `transforms` | Mappings section (like Step 5) | Array of field mappings for this sub-transform | Reuse Step 5 mapping logic |

---

## Implementation Requirements

### 1. **Read Sub-Transforms from Policy**
   - **Source**: `$store.state.wizard.policyUpload.uploadedPolicyData.subtransforms`
   - **Type**: Array of sub-transform objects
   - **Validation**: Check if array exists and has items before processing

### 2. **UI Representation**
   - **Each array item** → One **sub-transform card** in the UI
   - Cards should be visually distinct and numbered (e.g., "Sub-Transform 1", "Sub-Transform 2")
   - Display in the order they appear in the policy file

### 3. **Condition Field Handling**
   - **Reuse logic from Step 4** (Filter Rules) for condition validation
   - **Special Case**: `condition: null` or empty string
     - Display as **"Catch-All"** or **"Default Rule"** in the UI
     - Add visual indicator (e.g., badge or icon) to highlight catch-all rules
   - **Validation**: Check if condition JSONPath exists in current sample data
   - **Missing Fields**: Track fields referenced in condition that don't exist in sample data (similar to Step 4)

### 4. **Exit on Match Checkbox**
   - Direct boolean mapping: `exitonmatch: true` → checkbox checked
   - Default to `false` if attribute is missing
   - Add tooltip explaining: "Stop processing additional sub-transforms if this rule matches"

### 5. **Transforms/Mappings Section**
   - **Reuse logic from Step 5** (Field Mapping) for the `transforms` array
   - Each sub-transform can have **multiple field mappings**
   - Handle all transform attributes:
     - `inputRule` → JSON Path
     - `LRSchemaField` → LogRhythm schema field
     - `FanoutParentElement` → Fanout parent (if applicable)
     - `type` → Data type
     - `default` → Default value
     - `alternativeFields` → Alternative field paths (array)
     - `format` → Date/time format (for DateTime types)
     - `subtransforms` → Nested sub-transforms (can be null)

### 6. **Missing Data Handling**

#### A. Missing Conditions (like Step 4)
   - **Scenario**: Condition references a field path that doesn't exist in current sample data
   - **Detection**: Use same logic as Step 4 `checkFieldExistsInSampleData()` with fanout support
   - **UI Indication**:
     - Orange warning badge on sub-transform card
     - Icon with tooltip: "Condition references field not found in sample data"
     - Display warning message in condition field
   - **Tracking**: Store in `missingPolicyFields` array with type: `'subtransform-condition'`

#### B. Missing Mappings (like Step 5)
   - **Scenario**: Transform `inputRule` references a field that doesn't exist in sample data
   - **Detection**: Use same logic as Step 5 `checkFieldExistsInSampleData()` with fanout parent support
   - **UI Indication**:
     - Orange warning badge on the specific mapping row
     - Icon with tooltip: "Field defined in policy but not found in sample data"
     - Highlight mapping row with orange background (like Step 5)
   - **Tracking**: Store in `missingPolicyFields` array with type: `'subtransform-mapping'`

#### C. Validation Before Proceeding
   - If missing fields detected, show confirmation dialog:
     ```
     Title: "Missing Fields in Sub-Transforms"
     Message: "X sub-transform(s) reference fields not found in the current sample data. Do you want to continue anyway?"
     Buttons: [Continue] [Review Sub-Transforms]
     ```

---

## Implementation Steps

### Step 1: Create Pre-fill Method
```javascript
async prefillFromPolicy(policyData) {
  // 1. Extract subtransforms array
  const subtransforms = policyData?.subtransforms || []
  
  // 2. For each subtransform:
  //    a. Check if condition exists in sample data
  //    b. Map exitonmatch to checkbox
  //    c. Process transforms array (reuse Step 5 logic)
  //    d. Track missing fields
  
  // 3. Update local state and Vuex store
  // 4. Show notification with summary
}
```

### Step 2: Condition Validation
```javascript
validateCondition(condition, fanoutParentElement = null) {
  // Reuse Step 4 logic:
  // - Parse JSONPath expression
  // - Extract field references (e.g., @.errorMessage, @.errorCode)
  // - Check each field against availableJsonPaths
  // - Support fanout parent context
  // - Handle null/empty = catch-all (always valid)
}
```

### Step 3: Transform Mapping Validation
```javascript
validateSubTransformMappings(transforms, fanoutParentElement = null) {
  // Reuse Step 5 logic:
  // - Check each inputRule against availableJsonPaths
  // - Support fanout parent element resolution
  // - Track missing fields with details
  // - Validate LRSchemaField against schema
}
```

### Step 4: UI Rendering
- Render sub-transform cards with proper visual hierarchy
- Show condition (or "Catch-All" badge)
- Display exit-on-match checkbox state
- List all mappings in a table (like Step 5)
- Add warning badges for missing fields
- Enable edit/delete actions per sub-transform

### Step 5: Store Management
```javascript
// Vuex mutation
UPDATE_SUB_TRANSFORMS({ subtransforms, missingPolicyFields })

// State structure
{
  subtransforms: [
    {
      id: 'generated-id',
      condition: '@.errorMessage || @.errorCode',
      exitonmatch: true,
      transforms: [...],
      missingConditionFields: [...],  // Track missing in condition
      missingMappingFields: [...]     // Track missing in mappings
    }
  ],
  missingPolicyFields: [...]  // Global list for summary
}
```

---

## Edge Cases to Handle

1. **Empty subtransforms array**: Show empty state with "No sub-transforms defined in policy"
2. **Null condition**: Display as "Catch-All Rule" with special styling
3. **Empty transforms array**: Show warning "Sub-transform has no mappings"
4. **Nested subtransforms**: Currently `null`, but prepare for future support
5. **Invalid JSONPath in condition**: Show validation error
6. **Fanout parent mismatch**: Handle when FanoutParentElement doesn't match Step 3 configuration
7. **Duplicate conditions**: Warn if multiple sub-transforms have identical conditions

---

## Success Criteria

✅ All sub-transforms from policy are loaded into Step 6 UI  
✅ Conditions are validated against sample data  
✅ Mappings are validated with fanout support  
✅ Missing fields are tracked and displayed with warnings  
✅ Exit-on-match checkboxes are correctly set  
✅ Catch-all rules are visually distinguished  
✅ User can review and confirm before proceeding  
✅ Consistent behavior with Steps 4 and 5 for missing data handling  

---

## Testing Scenarios

1. **Policy with valid sub-transforms**: All fields exist in sample data
2. **Policy with missing condition fields**: Condition references non-existent field
3. **Policy with missing mapping fields**: Transform inputRule references non-existent field
4. **Policy with catch-all rule**: condition is null or empty
5. **Policy with multiple sub-transforms**: Various combinations
6. **Policy with complex conditions**: Multiple field references with operators
7. **Policy with fanout parent elements**: Nested array processing