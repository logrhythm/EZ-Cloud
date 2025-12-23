# Quick Reference: Debugging Lookup Attribute

## 🔍 Quick Diagnosis

Run this in browser console when you're in Step 7:
```javascript
const store = document.querySelector('#q-app').__vue__.$store
console.log('Has Lookup:', !!store.state.wizard.policyUpload.uploadedPolicyData?.Lookup)
console.log('Lookup:', store.state.wizard.policyUpload.uploadedPolicyData?.Lookup)
```

## 📋 What to Look For

### Console Output in Step 7

**✅ WORKING**:
```
[Step 7] Preserving Lookup attribute (capital L) with 3 keys
```

**❌ NOT WORKING - Scenario A**:
```
[Step 7] No uploaded policy data available - running in create mode or policy not uploaded
```
→ Fix: Check Vuex state persistence

**❌ NOT WORKING - Scenario B**:
```
[Step 7] WARNING: No Lookup/lookup attribute found in uploaded policy!
```
→ Fix: Check policy upload processing

## 🛠️ Quick Fixes

### Fix 1: Check if Lookup is in Vuex State
```javascript
// Run in console
const store = document.querySelector('#q-app').__vue__.$store
const policy = store.state.wizard.policyUpload.uploadedPolicyData
console.log('Policy Keys:', Object.keys(policy || {}))
```

**If "Lookup" is in the list**: State is fine, issue is in Step7_Export.vue mapping
**If "Lookup" is NOT in the list**: Issue is in Step 1 upload or validation

### Fix 2: Check Exported Policy
1. Download the exported policy
2. Open in text editor
3. Search for `"Lookup"`
4. If found: Issue is just with preview
5. If not found: Issue is real, check console logs

## 📁 Test File
```
g:\GO_Workspace\src\github.com\logrhythm\LRSIEM\Source\LogRhythm\scsmw\Policies\eventHub_common_field_compute.json
```

## 📚 Full Documentation
- **Debug Guide**: `LOOKUP_ATTRIBUTE_DEBUG_GUIDE.md`
- **Test Guide**: `LOOKUP_TEST_AND_FIX_GUIDE.md`
- **Summary**: `LOOKUP_DEBUGGING_SUMMARY.md`

## 🎯 Expected Result
Exported policy should contain:
```json
{
  "name": "EventHub_common_fields_compute",
  "group": "Eventhub",
  "grouporder": 5,
  "filter": "...",
  "transforms": [...],
  "Lookup": {
    "common": { ... },
    "vmid": { ... },
    "vendorinfo": { ... }
  }
}
```

## 🚀 Testing in 3 Steps
1. Upload policy file in Step 1 (Update mode)
2. Complete wizard to Step 7
3. Check console for `[Step 7]` messages
