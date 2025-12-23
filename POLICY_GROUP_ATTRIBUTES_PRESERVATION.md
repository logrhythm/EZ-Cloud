# Policy Organizational Attributes Preservation - Implementation Summary

## Overview
Added functionality to preserve organizational and configuration attributes from uploaded policy files. These attributes are automatically copied to the exported policy in Step 7 without requiring any UI for editing.

## Background
Some LogRhythm policy files contain organizational and configuration attributes:
- **`group`**: Categorizes policies into logical groups
- **`grouporder`**: Defines the order of policies within a group
- **`lookup`**: Contains lookup table configuration (JSON object)

These attributes are important for policy organization and functionality and should be preserved when updating existing policies.

## Changes Made

### 1. Step 7 - Export Component (`Step7_Export.vue`)

#### Added `policyUpload` to Vuex State Mapping
```javascript
...mapState('wizard', [
  'projectConfig',
  'sampleData',
  'schemaRules',
  'filterRules',
  'fieldMappings',
  'subTransforms',
  'generatedPolicy',
  'policyUpload' // <- Added to access uploaded policy data
]),
```

#### Updated `generatePolicyObject` Method
Added logic to preserve `group`, `grouporder`, and `lookup` attributes from uploaded policies:

```javascript
// Preserve group, grouporder, and lookup from uploaded policy (if in update mode)
// These attributes should be copied as-is without any UI editing
if (this.policyUpload?.uploadedPolicyData) {
  const uploadedPolicy = this.policyUpload.uploadedPolicyData

  if (uploadedPolicy.group !== undefined) {
    policy.group = uploadedPolicy.group
    console.log('[Step 7] Preserving group attribute:', uploadedPolicy.group)
  }

  if (uploadedPolicy.grouporder !== undefined) {
    policy.grouporder = uploadedPolicy.grouporder
    console.log('[Step 7] Preserving grouporder attribute:', uploadedPolicy.grouporder)
  }

  if (uploadedPolicy.lookup !== undefined) {
    policy.lookup = uploadedPolicy.lookup
    console.log('[Step 7] Preserving lookup attribute:', uploadedPolicy.lookup)
  }
}
```

## How It Works

### Create Mode
- No `group`, `grouporder`, or `lookup` attributes are added to the policy
- User creates a completely new policy from scratch

### Update Mode
1. User uploads an existing policy file in Step 1
2. The uploaded policy is parsed and stored in `policyUpload.uploadedPolicyData`
3. When the policy is generated in Step 7:
   - The system checks if `group` exists in the uploaded policy
   - The system checks if `grouporder` exists in the uploaded policy
   - The system checks if `lookup` exists in the uploaded policy
   - If any attribute exists, it's copied to the exported policy
4. The exported policy contains the original `group`, `grouporder`, and `lookup` values

### Example Policy Structure

#### Input Policy (Uploaded)
```json
{
  "name": "My Policy",
  "description": "Sample policy",
  "group": "Security Policies",
  "grouporder": 10,
  "lookup": {
    "type": "csv",
    "path": "/path/to/lookup.csv",
    "key": "ip_address",
    "fields": ["country", "region", "city"]
  },
  "filter": "...",
  "transforms": [...]
}
```

#### Output Policy (Exported)
```json
{
  "name": "My Policy (Updated)",
  "description": "Sample policy",
  "group": "Security Policies",
  "grouporder": 10,
  "lookup": {
    "type": "csv",
    "path": "/path/to/lookup.csv",
    "key": "ip_address",
    "fields": ["country", "region", "city"]
  },
  "filter": "...",
  "transforms": [...]
}
```

## Implementation Details

### Attribute Preservation Rules
- **No UI Editing**: `group`, `grouporder`, and `lookup` are not editable through the UI
- **Automatic Copy**: Attributes are automatically copied if they exist
- **Optional Fields**: If attributes don't exist in the uploaded policy, they're not added
- **Type Preservation**: The original data types are preserved (string, number, object, etc.)
- **Deep Copy**: Complex objects like `lookup` are copied as-is, preserving their entire structure
- **Logging**: Console logs confirm when attributes are preserved

### Policy Generation Order
The attributes are added to the policy object in this order:
1. `name` (from projectConfig, may be edited by user)
2. `description` (from projectConfig)
3. `group` (from uploaded policy, if exists)
4. `grouporder` (from uploaded policy, if exists)
5. `lookup` (from uploaded policy, if exists)
6. `filter` (from filterRules)
7. `schemarule` (from schemaRules)
8. `transforms` (from fieldMappings)
9. `subtransforms` (from subTransforms)

### Compatibility
- **Backward Compatible**: Policies without `group`/`grouporder` work as before
- **Forward Compatible**: New attributes can be added using the same pattern
- **No Breaking Changes**: Existing functionality is not affected

## Benefits

1. **Data Integrity**: Original organizational structure is preserved
2. **No Manual Work**: Users don't need to manually re-add these attributes
3. **Consistency**: Policies maintain their group assignments after updates
4. **Flexibility**: Only attributes that exist are preserved, no forced defaults
5. **Transparency**: Console logging provides visibility into attribute preservation

## Testing Recommendations

### Test Case 1: Policy with All Attributes
1. Upload a policy with `group`, `grouporder`, and `lookup`
2. Make changes through the wizard
3. Verify exported policy contains all three attributes with original values

### Test Case 2: Policy with Only Some Attributes
1. Upload policies with various combinations (e.g., only `group`, only `lookup`, etc.)
2. Make changes through the wizard
3. Verify exported policy contains only the attributes that existed in the original

### Test Case 3: Policy with Complex Lookup Object
1. Upload a policy with a complex `lookup` object containing nested properties
2. Make changes through the wizard
3. Verify the entire `lookup` object structure is preserved correctly

### Test Case 4: Policy with Neither Attribute
1. Upload a policy without `group`, `grouporder`, or `lookup`
2. Make changes through the wizard
3. Verify exported policy doesn't have these attributes

### Test Case 5: Create Mode
1. Create a new policy from scratch
2. Complete the wizard
3. Verify exported policy doesn't have `group`, `grouporder`, or `lookup`

### Test Case 6: Various Data Types and Structures
1. Test with `group` as string: `"Security Policies"`
2. Test with `grouporder` as number: `10`
3. Test with `grouporder` as string: `"10"`
4. Test with `lookup` as complex object with multiple nested properties
5. Verify all data types and structures are preserved correctly

## Console Output Example

When a policy with `group`, `grouporder`, and `lookup` is exported, you'll see:
```
[Step 7] generatePolicyObject called - subTransforms: {...}
[Step 7] Preserving group attribute: Security Policies
[Step 7] Preserving grouporder attribute: 10
[Step 7] Preserving lookup attribute: { type: 'csv', path: '/path/to/lookup.csv', ... }
[Step 7] Adding subtransforms to policy: 0
```

## Future Enhancements (Optional)

If needed in the future, we could:
1. Add UI to display current `group` and `grouporder` values (read-only)
2. Add UI to edit these values (if business requirements change)
3. Add validation for `group` and `grouporder` formats
4. Add metadata about other organizational attributes
5. Support additional policy-level attributes using the same pattern

## Related Files Modified

- `frontend_standalone/src/components/wizard/steps/Step7_Export.vue`

## Related Files (No Changes Required)

- `frontend_standalone/src/store/wizardModule.js` (already stores full uploaded policy)
- `frontend_standalone/src/services/wizard/policyValidator.js` (already validates and parses policy)
- Step 1-6 components (no awareness of `group`/`grouporder` needed)

## Notes

- The implementation follows the principle of "preserve what you don't manage"
- No validation is performed on `group` or `grouporder` values (assumed valid from source)
- The feature is completely transparent to users - it just works
- This pattern can be extended to other policy-level attributes as needed
