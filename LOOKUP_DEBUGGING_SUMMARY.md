# Lookup Attribute Debugging Enhancement - Summary

## Date: December 23, 2025

## Issue Reported
The `Lookup` attribute from uploaded policy files (like `eventHub_common_field_compute.json`) is not appearing in the exported policy JSON in Step 7, despite code being in place to preserve it.

## Changes Made

### 1. Enhanced Debugging in Step7_Export.vue

**Location**: `frontend_standalone/src/components/wizard/steps/Step7_Export.vue`

**Method**: `generatePolicyObject()`

**Added Logging**:

```javascript
// DEBUG: Log policyUpload state
console.log('[Step 7] policyUpload state:', {
  exists: !!this.policyUpload,
  hasUploadedPolicyData: !!this.policyUpload?.uploadedPolicyData,
  uploadedPolicyDataKeys: this.policyUpload?.uploadedPolicyData ? Object.keys(this.policyUpload.uploadedPolicyData) : null
})

// Log all keys in uploaded policy
console.log('[Step 7] Uploaded policy has keys:', Object.keys(uploadedPolicy))

// Detailed Lookup attribute detection
console.log('[Step 7] Lookup check:', {
  hasLookup: uploadedPolicy.lookup !== undefined,
  hasCapitalLookup: uploadedPolicy.Lookup !== undefined,
  lookupValue: lookupValue
})

// Confirmation when Lookup is preserved
if (uploadedPolicy.Lookup !== undefined) {
  console.log('[Step 7] Preserving Lookup attribute (capital L) with', Object.keys(uploadedPolicy.Lookup).length, 'keys')
} else if (uploadedPolicy.lookup !== undefined) {
  console.log('[Step 7] Preserving lookup attribute (lowercase l) with', Object.keys(uploadedPolicy.lookup).length, 'keys')
}

// Warning when Lookup is missing
else {
  console.log('[Step 7] WARNING: No Lookup/lookup attribute found in uploaded policy!')
}

// Message when no uploaded policy
else {
  console.log('[Step 7] No uploaded policy data available - running in create mode or policy not uploaded')
}
```

### 2. Created Debug Guide Documentation

**File**: `LOOKUP_ATTRIBUTE_DEBUG_GUIDE.md`

**Contents**:
- Problem description
- Enhanced debugging details
- Step-by-step debugging procedure
- Expected console output scenarios
- Root cause investigation methods
- Common solutions
- Browser DevTools testing instructions

### 3. Created Test and Fix Guide

**File**: `LOOKUP_TEST_AND_FIX_GUIDE.md`

**Contents**:
- Summary of findings
- Testing procedures with step-by-step instructions
- Console commands for Vuex state inspection
- Expected working console output
- Possible issues and their fixes
- Verification procedures
- Manual workaround if needed

## Code Analysis Findings

### Files Reviewed

1. **Step7_Export.vue** - Policy export component
   - Contains correct code to preserve `Lookup` attribute
   - Handles both `lookup` and `Lookup` (case-insensitive)
   - Copies entire object as-is

2. **wizardModule.js** - Vuex store
   - Has `policyUpload` state defined
   - Contains `SET_UPLOADED_POLICY_DATA` mutation
   - Calls `PolicyValidator.validatePolicyFile()`

3. **policyValidator.js** - Policy validation service
   - Uses `JSON.parse()` to parse policy files
   - **Does NOT strip or modify any attributes**
   - Returns parsed policy object directly

4. **Step1_Introduction.vue** - Policy upload handling
   - Uses Vuex action `uploadPolicyFile()`
   - Handles file upload correctly
   - May clear state on file change

### Conclusion from Code Review

**The preservation code is CORRECT**. The issue is likely:

1. **Vuex state not persisting** between steps
2. **State being cleared** during navigation
3. **Policy upload data not being stored** in Vuex correctly
4. **Store mapping issues** in Step7_Export.vue

## How to Use These Enhancements

### For Debugging:

1. Open the wizard application
2. Open browser console (F12)
3. Upload a policy file with `Lookup` attribute
4. Navigate through all steps to Step 7
5. Review console output
6. Match output against expected scenarios in the debug guide

### To Identify the Issue:

The console logs will reveal exactly where the problem occurs:

- **If state exists in Step 7**: Code is working, issue is elsewhere
- **If state is null in Step 7**: State is being cleared during navigation
- **If `Lookup` is missing from state**: Validation or upload is stripping it

### To Test the Fix:

Follow the procedures in `LOOKUP_TEST_AND_FIX_GUIDE.md` to:
1. Verify the issue
2. Identify the root cause
3. Apply the appropriate fix
4. Verify the fix works

## Test Policy File

**Location**: `g:\GO_Workspace\src\github.com\logrhythm\LRSIEM\Source\LogRhythm\scsmw\Policies\eventHub_common_field_compute.json`

**Contains**:
- `group: "Eventhub"`
- `grouporder: 5`
- `Lookup: { ... }` with 3 main keys: `common`, `vmid`, `vendorinfo`

This file should be used for all testing.

## Expected Behavior

When working correctly:

1. Upload policy file in Step 1
2. Console shows: `[PolicyValidator] Parsed policy:` with Lookup visible
3. Navigate through steps
4. In Step 7, console shows: `[Step 7] Preserving Lookup attribute (capital L) with 3 keys`
5. Downloaded policy JSON contains full `Lookup` object

## Files Modified

1. `frontend_standalone/src/components/wizard/steps/Step7_Export.vue` - Added enhanced logging
2. `LOOKUP_ATTRIBUTE_DEBUG_GUIDE.md` - New debug documentation
3. `LOOKUP_TEST_AND_FIX_GUIDE.md` - New testing guide
4. `LOOKUP_DEBUGGING_SUMMARY.md` - This summary document

## Next Steps for User

1. **Run the wizard with browser console open**
2. **Upload the test policy file**
3. **Complete all steps to Step 7**
4. **Copy all console output** starting from `[Step 7]`
5. **Share the console output** to identify the exact issue
6. **Follow the appropriate fix** from the guides based on the console output

## Status

✅ Enhanced debugging logging implemented
✅ Comprehensive documentation created
✅ Code analysis completed
✅ No syntax errors
⏳ Awaiting user testing to identify root cause
⏳ Fix to be applied based on test results
