# Lookup Attribute Debug Guide

## Problem Description
The `Lookup` attribute from uploaded policy files is not appearing in the exported policy JSON in Step 7, even though the code to preserve it exists.

## Enhanced Debugging

### Changes Made to Step7_Export.vue
Added comprehensive console logging to the `generatePolicyObject()` method to help diagnose the issue:

1. **Policy Upload State Check**
   ```javascript
   console.log('[Step 7] policyUpload state:', {
     exists: !!this.policyUpload,
     hasUploadedPolicyData: !!this.policyUpload?.uploadedPolicyData,
     uploadedPolicyDataKeys: this.policyUpload?.uploadedPolicyData ? Object.keys(this.policyUpload.uploadedPolicyData) : null
   })
   ```

2. **Uploaded Policy Keys**
   ```javascript
   console.log('[Step 7] Uploaded policy has keys:', Object.keys(uploadedPolicy))
   ```

3. **Lookup Attribute Detection**
   ```javascript
   console.log('[Step 7] Lookup check:', {
     hasLookup: uploadedPolicy.lookup !== undefined,
     hasCapitalLookup: uploadedPolicy.Lookup !== undefined,
     lookupValue: lookupValue
   })
   ```

4. **Lookup Preservation Confirmation**
   - Shows number of keys when `Lookup` is preserved
   - Shows warning if no `Lookup`/`lookup` attribute found

## Debugging Steps

### Step 1: Open Browser Developer Console
1. Open the wizard in your browser
2. Press `F12` or right-click and select "Inspect"
3. Go to the "Console" tab

### Step 2: Upload a Policy File
1. In Step 1, select "Update Existing Policy" mode
2. Upload `eventHub_common_field_compute.json` (or any policy file with a `Lookup` attribute)
3. Check console logs for upload confirmation

### Step 3: Navigate Through the Wizard
Complete all wizard steps and reach Step 7 (Export).

### Step 4: Check Console Logs in Step 7
When Step 7 loads, look for these console messages:

#### Expected Output if Working Correctly:
```
[Step 7] Component mounted - subTransforms state: {...}
[Step 7] generatePolicyObject called - subTransforms: {...}
[Step 7] policyUpload state: {
  exists: true,
  hasUploadedPolicyData: true,
  uploadedPolicyDataKeys: ['name', 'group', 'grouporder', 'filter', 'schemarule', 'transforms', 'Lookup']
}
[Step 7] Uploaded policy has keys: ['name', 'group', 'grouporder', 'filter', 'schemarule', 'transforms', 'Lookup']
[Step 7] Preserving group attribute: "Eventhub"
[Step 7] Preserving grouporder attribute: 5
[Step 7] Lookup check: {
  hasLookup: false,
  hasCapitalLookup: true,
  lookupValue: {...}
}
[Step 7] Preserving Lookup attribute (capital L) with 3 keys
```

#### Possible Issue Scenarios:

**Scenario A: policyUpload is null/undefined**
```
[Step 7] policyUpload state: {
  exists: false,
  hasUploadedPolicyData: false,
  uploadedPolicyDataKeys: null
}
[Step 7] No uploaded policy data available - running in create mode or policy not uploaded
```
**Resolution**: The policy upload state is not being persisted. Check Vuex state management.

**Scenario B: uploadedPolicyData is null/undefined**
```
[Step 7] policyUpload state: {
  exists: true,
  hasUploadedPolicyData: false,
  uploadedPolicyDataKeys: null
}
[Step 7] No uploaded policy data available - running in create mode or policy not uploaded
```
**Resolution**: The uploaded policy data was not stored correctly in Vuex. Check Step 1 upload handler.

**Scenario C: Lookup attribute missing from uploadedPolicyData**
```
[Step 7] Uploaded policy has keys: ['name', 'group', 'grouporder', 'filter', 'schemarule', 'transforms']
[Step 7] Lookup check: {
  hasLookup: false,
  hasCapitalLookup: false,
  lookupValue: undefined
}
[Step 7] WARNING: No Lookup/lookup attribute found in uploaded policy!
```
**Resolution**: The `Lookup` attribute was stripped during policy parsing/validation. Check Step 1 policy file processing.

## Root Cause Investigation

### Check 1: Verify Uploaded Policy Data in Vuex State
Add this code in your browser console when you're in Step 7:
```javascript
// Access Vuex store
$vm0.$store.state.wizard.policyUpload
```

This should show:
```javascript
{
  uploadedFile: File {...},
  uploadedPolicyData: {
    name: "EventHub_common_fields_compute",
    group: "Eventhub",
    grouporder: 5,
    Lookup: {...},  // <-- Should be here
    ...
  },
  ...
}
```

### Check 2: Inspect Policy File Upload Handler (Step 1)
Location: `frontend_standalone/src/components/wizard/steps/Step1_Introduction.vue`

Look for the method that processes uploaded policy files. It should:
1. Read the file
2. Parse the JSON
3. Store it in Vuex using `SET_UPLOADED_POLICY_DATA` mutation
4. **NOT strip any attributes** like `Lookup`, `group`, `grouporder`

### Check 3: Verify Vuex Mutations
Location: `frontend_standalone/src/store/wizardModule.js`

Check the `SET_UPLOADED_POLICY_DATA` mutation:
```javascript
SET_UPLOADED_POLICY_DATA (state, { policyData, validationResult, metadata }) {
  state.policyUpload.uploadedPolicyData = policyData  // Should preserve ALL attributes
  // ...
}
```

## Testing with Browser DevTools

### Method 1: Check Vuex State Directly
1. Open Vue DevTools (install browser extension if not installed)
2. Go to "Vuex" tab
3. Navigate to `wizard` module
4. Look at `policyUpload.uploadedPolicyData`
5. Verify `Lookup` attribute is present

### Method 2: Manual State Inspection
In the browser console:
```javascript
// Get the root Vue instance
const app = document.querySelector('#q-app').__vue__

// Access Vuex store
const store = app.$store

// Check policyUpload state
console.log('Policy Upload Data:', store.state.wizard.policyUpload.uploadedPolicyData)

// Check if Lookup exists
console.log('Has Lookup:', store.state.wizard.policyUpload.uploadedPolicyData?.Lookup)
```

## Common Solutions

### Solution 1: Vuex State Not Persisting
If the state is lost when navigating between steps:
- Check if Vuex persistence plugin is configured
- Verify localStorage/sessionStorage is working
- Check if state is being cleared unintentionally

### Solution 2: Policy Validation Stripping Attributes
If policy validation is removing unknown attributes:
- Locate policy validation logic in Step 1
- Ensure it preserves all original attributes
- Update validation to be non-destructive

### Solution 3: Deep Clone Issues
If using deep clone/spread operators incorrectly:
- Ensure `Lookup` object is deeply cloned: `JSON.parse(JSON.stringify(uploadedPolicy.Lookup))`
- Or use lodash `_.cloneDeep()`

## Next Steps After Debugging

Once you identify which scenario matches your console output:

1. **Share Console Logs**: Copy the exact console output when you reach Step 7
2. **Check Vuex State**: Use the browser DevTools methods above to inspect the state
3. **Identify Missing Link**: Determine where the `Lookup` attribute is being lost:
   - During file upload and parsing (Step 1)
   - During Vuex state storage
   - During policy generation (Step 7)

## Expected Behavior

When everything works correctly:
1. Upload a policy file with `Lookup` attribute in Step 1
2. Navigate through all steps
3. In Step 7, the exported policy JSON should include the `Lookup` attribute exactly as it was in the uploaded file
4. Console logs should confirm preservation with key count

## Test Policy File
Use this test file: `g:\GO_Workspace\src\github.com\logrhythm\LRSIEM\Source\LogRhythm\scsmw\Policies\eventHub_common_field_compute.json`

This file contains:
- `group: "Eventhub"`
- `grouporder: 5`
- `Lookup: {...}` (large object with nested data)

All three attributes should appear in the exported policy.
