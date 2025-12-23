# Policy Name Editing in Update Mode - Implementation Summary

## Overview
Added functionality to allow users to edit the policy name when in update mode. The updated name is reflected in the final exported policy in Step 7.

## Changes Made

### 1. Step 1 - Introduction Component (`Step1_Introduction.vue`)

#### Policy Name Input Visibility
- **Before**: Policy name input was only shown in "create" mode
- **After**: Policy name input is now shown in both "create" mode AND "update" mode (after a policy is uploaded)

```vue
<!-- Now shows in both create mode and update mode with uploaded policy -->
<div v-if="projectConfig.mode === 'create' || (projectConfig.mode === 'update' && existingPolicyPreview)" class="policy-name-input q-mt-md">
```

#### Dynamic Hint Text
- The hint text updates based on the mode:
  - **Create mode**: "Enter a name for your new policy"
  - **Update mode**: "Edit the policy name (will update the exported policy)"

#### Validation Updates
- **`isStepValid` computed property**: Now requires a policy name in update mode
  ```javascript
  // For update mode: Check if we have a valid uploaded policy AND a policy name
  return Boolean(
    this.existingPolicyFile &&
    this.policyUpload.validationResult.valid &&
    this.policyUpload.uploadedPolicyData &&
    this.projectConfig.name?.trim() // <- Added this requirement
  )
  ```

- **`validateAllFields` method**: Now validates the policy name in update mode
  ```javascript
  // Also validate the policy name in update mode
  const nameValidation = Step1Validator.validateProjectName(this.projectConfig.name)
  this.errors.name = nameValidation.errors.map(e => e.message)
  ```

#### Visual Feedback
Added an informational banner that appears when the policy name is changed from the original:
- Shows the original policy name from the uploaded file
- Displays a blue info banner when the name is modified
- Banner shows: "Policy will be exported with updated name: **[new name]**"

### 2. Step 7 - Export Component (No Changes Required)

The Step 7 component already uses `this.projectConfig.name` in the `generatePolicyObject()` method:
```javascript
const policy = {
  name: this.projectConfig.name || 'Untitled Policy',
  description: this.projectConfig.description || ''
}
```

This means any changes to the policy name in Step 1 automatically flow through to the exported policy.

## User Flow

### Update Mode Workflow:
1. User selects "Update Existing Policy" mode
2. User uploads a policy JSON file
3. Policy name input field appears with the original policy name pre-populated
4. User can edit the policy name
5. If changed, a blue info banner shows the new name that will be used
6. Validation ensures the name is not empty and follows naming rules
7. User proceeds through the wizard
8. In Step 7, the exported policy uses the updated name

## Benefits

1. **Flexibility**: Users can rename policies during the update process without manual JSON editing
2. **Clarity**: Visual feedback shows when the name has been changed
3. **Consistency**: The updated name is used throughout the wizard and in the final export
4. **Validation**: Name changes are validated to ensure they meet requirements
5. **Non-breaking**: Original policy data is preserved; only the name is updated

## Testing Recommendations

1. **Upload a policy** and verify the original name appears in the input field
2. **Change the name** and verify:
   - The info banner appears showing the new name
   - The "Start Building Policy" button remains enabled
   - The validation accepts valid names
   - The validation rejects invalid names (empty, too long, etc.)
3. **Proceed through the wizard** to Step 7
4. **Verify in Step 7**:
   - The Policy Summary shows the updated name
   - The JSON preview shows the updated name
   - Downloaded/copied policy contains the updated name
5. **Test edge cases**:
   - Upload policy, change name, then switch to create mode (should clear name)
   - Upload policy, change name, upload different policy (should reset to new policy name)
   - Upload policy without a name field (should allow entering a new name)

## Related Files Modified

- `frontend_standalone/src/components/wizard/steps/Step1_Introduction.vue`

## Related Files (No Changes Required)

- `frontend_standalone/src/components/wizard/steps/Step7_Export.vue` (already supports dynamic name)
- Vuex store `wizard` module (already stores and manages `projectConfig.name`)

## Related Features

See also: **POLICY_GROUP_ATTRIBUTES_PRESERVATION.md** - Documents how `group` and `grouporder` attributes from uploaded policies are automatically preserved in the exported policy without requiring UI editing.
