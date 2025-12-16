# Step 4 Filter Screen - Update Mode Support

## Objective
Implement logic to display filter conditions on Step 4 filter screen by extracting them from an uploaded policy file and displaying them in the UI for user to edit.

## Current State
- ✅ **Create mode** is working fine - no changes required
- ❌ **Update mode** needs implementation for filter condition pre-filling

## Requirements

### 1. Mode Detection
- Check if the application is in **update mode** (user has uploaded a policy file for editing)
- Verify that a policy file has been uploaded and is stored in Vuex state

### 2. Extract Filter Conditions from Policy
- If application is in update mode, fetch the **`filter`** attribute from the policy object stored in state
- The filter attribute typically contains a string expression with conditions (e.g., `"$.field1 == 'value' && $.field2 != 'test'"`)

### 3. Parse Filter Conditions
Parse the filter condition string to extract:
- **Field paths** with normalized JSONPath format (e.g., `$.field1`, `$.nested.field2`)
- **Operators** for each condition (e.g., `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`, `startsWith`, etc.)
- **Values** for each condition (handle string, number, boolean types)
- **Logical operators** between conditions (e.g., `&&` for AND, `||` for OR)

### 4. Populate UI Controls
- Populate filter field dropdowns from **sample data** as is currently done in create mode
- Use parsed values from the `filter` attribute to pre-populate the UI:
  - Add each condition to the conditions list
  - Set the correct field, operator, and value for each condition
  - Set the correct logical operator (AND/OR) between conditions
  - Pre-select all values in the UI controls

### 5. Handle Missing Fields (Critical Scenario)
**Scenario**: An attribute present in filter conditions is NOT present in current sample data

**Required behavior**:
- **Inject the missing field** into the dropdown data source so it can be displayed
- **Add visual indicator** (badge, icon, or styling) to highlight that the field is missing from sample data
- **Mark the field with metadata** (e.g., `isMissing: true`) for warning display
- **Pre-select the missing field** in the UI condition (maintain policy configuration)
- **Show warning message** to user: "This field is defined in the policy but not found in the current sample data"
- **Track missing fields** in a separate array for summary display

### 6. Implementation Pattern (Follow Step 3 Approach)
Follow the same pattern used in Step 3 Schema Config for handling missing fields:
```javascript
// Pseudo-code example
const missingFields = []

for (const condition of parsedConditions) {
  const fieldExists = checkFieldExistsInSampleData(condition.field)
  
  if (!fieldExists) {
    // Inject synthetic field into dropdown options
    fieldOptions.push({
      path: condition.field,
      isMissing: true,
      originalPolicyPath: condition.field
    })
    
    // Track for warning display
    missingFields.push({
      type: 'filter',
      path: condition.field,
      message: 'Field defined in policy but not found in current sample data',
      reason: 'missing'
    })
  }
  
  // Always add condition to UI (even if missing)
  addConditionToUI(condition)
}
```

### 7. UI Display Requirements
- Show all conditions from policy in the filter UI
- For **existing fields**: Display normally with values from sample data
- For **missing fields**: 
  - Display with orange/yellow badge labeled "missing"
  - Show tooltip: "This field is defined in the policy but not found in the current sample data"
  - Keep the field selected and editable
  - Allow user to modify or remove the condition

### 8. Edge Cases to Handle
- Empty filter attribute in policy (no conditions)
- Malformed filter expressions (syntax errors)
- Fields with special characters in paths
- Array fields with wildcard notation (e.g., `$.items[*].id`)
- Nested object fields (e.g., `$.parent.child.field`)
- Multiple missing fields in a single filter expression
- Complex logical expressions with parentheses

### 9. Success Criteria
✅ Update mode detects uploaded policy and extracts filter conditions  
✅ Filter conditions are parsed correctly (fields, operators, values, logical operators)  
✅ UI is pre-populated with all conditions from policy  
✅ Sample data fields are loaded into dropdowns as in create mode  
✅ Missing fields are injected into dropdowns with visual indicators  
✅ Missing fields show appropriate warnings to user  
✅ User can edit, add, or remove conditions as needed  
✅ No errors when policy filter references fields not in sample data  
✅ Maintains backward compatibility with create mode  

### 10. Testing Scenarios
1. **Normal case**: All filter fields exist in sample data → All conditions display normally
2. **Missing field case**: One or more filter fields missing from sample data → Fields injected and highlighted
3. **No filter case**: Policy has no filter attribute → Empty filter UI (same as create mode)
4. **Complex expression**: Multiple conditions with AND/OR operators → All parsed and displayed correctly
5. **Navigation**: User navigates back to Step 4 after going forward → Conditions remain intact

## Related Files to Modify
- `Step4_FilterConfig.vue` (or similar Step 4 component)
- Vuex store mutations for filter conditions
- Filter parsing utility/service (may need to create)
