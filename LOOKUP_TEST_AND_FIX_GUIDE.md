# Lookup Attribute - Complete Test and Fix Guide

## Summary
After reviewing the code, the `Lookup` attribute preservation logic in Step7_Export.vue appears correct. The issue is likely with:
1. **Vuex state persistence** between steps
2. **State being cleared** when navigating
3. **Store mapping** issues

## Enhanced Debugging Now in Place

The following console logging has been added to `Step7_Export.vue` in the `generatePolicyObject()` method:

```javascript
// Logs policyUpload state existence
console.log('[Step 7] policyUpload state:', {...})

// Logs all keys in uploaded policy
console.log('[Step 7] Uploaded policy has keys:', Object.keys(uploadedPolicy))

// Specifically checks for Lookup attribute
console.log('[Step 7] Lookup check:', {
  hasLookup: uploadedPolicy.lookup !== undefined,
  hasCapitalLookup: uploadedPolicy.Lookup !== undefined,
  lookupValue: lookupValue
})

// Confirms preservation with key count
console.log('[Step 7] Preserving Lookup attribute (capital L) with X keys')
```

## Testing Steps

### 1. Open the Application
Start the wizard application and open browser developer console (F12).

### 2. Upload the Test Policy File
1. In Step 1, select "Update Existing Policy"
2. Upload: `g:\GO_Workspace\src\github.com\logrhythm\LRSIEM\Source\LogRhythm\scsmw\Policies\eventHub_common_field_compute.json`
3. Watch console for: `[PolicyValidator] Parsed policy: {...}`
4. Verify the parsed policy contains `"Lookup": {...}`

### 3. Check Vuex State After Upload
In browser console, run:
```javascript
// Get Vuex store
const store = document.querySelector('#q-app').__vue__.$store

// Check uploaded policy data
console.log('Uploaded Policy Data:', store.state.wizard.policyUpload.uploadedPolicyData)

// Check specifically for Lookup
console.log('Has Lookup:', store.state.wizard.policyUpload.uploadedPolicyData?.Lookup)
```

### 4. Navigate Through Steps
Complete Step 2 through Step 6 normally.

### 5. Check State Before Step 7
Before clicking "Next" to go to Step 7, run the Vuex check again:
```javascript
const store = document.querySelector('#q-app').__vue__.$store
console.log('Policy Upload (before Step 7):', store.state.wizard.policyUpload.uploadedPolicyData)
console.log('Has Lookup:', !!store.state.wizard.policyUpload.uploadedPolicyData?.Lookup)
```

### 6. Enter Step 7 and Check Console
Click "Next" to enter Step 7. Look for these console messages:
- `[Step 7] Component mounted - subTransforms state:`
- `[Step 7] generatePolicyObject called`
- `[Step 7] policyUpload state:`
- `[Step 7] Uploaded policy has keys:`
- `[Step 7] Lookup check:`

### 7. Inspect Exported Policy
1. Download the policy JSON
2. Open it in a text editor
3. Search for `"Lookup"` or `"lookup"`
4. Verify it contains the full Lookup object

## Possible Issues and Fixes

### Issue 1: State Cleared When File Changes
**Symptom**: Console shows "No uploaded policy data available"

**Cause**: The `clearDownstreamState()` method in Step1 might be clearing too much

**Fix**: Check Step1_Introduction.vue line ~660 (`clearDownstreamState` method)

### Issue 2: Vuex State Not Persisting
**Symptom**: State exists in Step 1 but is null in Step 7

**Cause**: Vuex store might not have persistence plugin configured

**Fix**: Check if vuex-persistedstate or similar plugin is installed and configured

### Issue 3: State Cleared on Navigation
**Symptom**: State exists until you navigate to another step

**Cause**: Navigation might trigger state reset

**Fix**: Check router guards or navigation handlers

## Quick Fix: Add Defensive Logging

If you still can't find the issue, add this to `mounted()` in Step7_Export.vue:

```javascript
mounted () {
  // EXISTING CODE
  console.log('[Step 7] Component mounted - subTransforms state:', {...})
  
  // ADD THIS NEW LOGGING
  console.log('[Step 7] Full policyUpload state:', JSON.stringify(this.policyUpload, null, 2))
  console.log('[Step 7] projectConfig:', JSON.stringify(this.projectConfig, null, 2))
  console.log('[Step 7] All Vuex wizard state keys:', Object.keys(this.$store.state.wizard))
  
  // EXISTING CODE continues...
}
```

## Verify the Fix Works

After implementing any fixes, verify with this test:

1. Upload `eventHub_common_field_compute.json` in Step 1
2. Complete wizard to Step 7
3. Download exported policy
4. Verify exported policy contains:
   - `"group": "Eventhub"`
   - `"grouporder": 5`
   - `"Lookup": { "common": {...}, "vmid": {...}, "vendorinfo": {...} }`

## Expected Console Output (Working Correctly)

```
[Step 7] policyUpload state: {
  exists: true,
  hasUploadedPolicyData: true,
  uploadedPolicyDataKeys: ["name", "group", "grouporder", "filter", "schemarule", "transforms", "Lookup"]
}

[Step 7] Uploaded policy has keys: ["name", "group", "grouporder", "filter", "schemarule", "transforms", "Lookup"]

[Step 7] Preserving group attribute: "Eventhub"
[Step 7] Preserving grouporder attribute: 5

[Step 7] Lookup check: {
  hasLookup: false,
  hasCapitalLookup: true,
  lookupValue: {common: {...}, vmid: {...}, vendorinfo: {...}}
}

[Step 7] Preserving Lookup attribute (capital L) with 3 keys
```

## If Lookup Is Still Missing

If after all debugging you still see:
```
[Step 7] WARNING: No Lookup/lookup attribute found in uploaded policy!
```

Then run this in console to see the ACTUAL uploaded policy data:
```javascript
const store = document.querySelector('#q-app').__vue__.$store
const uploadedData = store.state.wizard.policyUpload.uploadedPolicyData
console.log('Full Uploaded Policy:', JSON.stringify(uploadedData, null, 2))
```

Copy the output and compare it with the original file to see what's different.

## Manual Workaround (Temporary)

If you need to test the rest of the wizard while debugging this issue, you can manually add the Lookup object in Step 7 by editing the downloaded JSON file after export.

## Next Steps

1. Run the test procedure above
2. Copy all console output
3. Share the results to identify exactly where the Lookup attribute is being lost
4. Based on the console output, we can pinpoint the exact fix needed
