# Phase 2 Testing Guide: Step 3 Schema Configuration Pre-fill

## Overview
This guide provides step-by-step testing instructions for Phase 2 of the update feature, which pre-fills Step 3 (Schema Configuration) with data from an uploaded policy file.

## Prerequisites

### Test Environment Setup
1. Start the development server
2. Clear browser cache and local storage
3. Open browser developer console
4. Navigate to the wizard (Step 1 - Introduction)

### Test Data Requirements

You'll need the following test files:

#### Test File 1: Policy with Fanout Only
**Filename:** `test-policy-fanout.json`
```json
{
  "name": "test-fanout-policy",
  "schemaRule": {
    "fanout": {
      "inputField": ["$.events[*]"]
    }
  },
  "transforms": [
    {
      "sourcePath": "$.id",
      "targetField": "event_id"
    }
  ]
}
```

#### Test File 2: Policy with Convert-to-JSON Only
**Filename:** `test-policy-converttojson.json`
```json
{
  "name": "test-converttojson-policy",
  "schemaRule": {
    "convertoJson": ["$.metadata", "$.payload"]
  },
  "transforms": [
    {
      "sourcePath": "$.id",
      "targetField": "event_id"
    }
  ]
}
```

#### Test File 3: Policy with Both
**Filename:** `test-policy-complete.json`
```json
{
  "name": "test-complete-policy",
  "schemaRule": {
    "fanout": {
      "inputField": ["$.logs[*]"]
    },
    "convertoJson": ["$.data"],
    "childfanouts": [
      {
        "field": "$.logs[*]",
        "parentpath": null
      },
      {
        "field": "$.entries[*]",
        "parentpath": "$.logs[*]"
      }
    ]
  },
  "transforms": [
    {
      "sourcePath": "$.id",
      "targetField": "event_id"
    }
  ]
}
```

#### Test File 4: Policy with Child Fanouts
**Filename:** `test-policy-childfanouts.json`
```json
{
  "name": "test-childfanouts-policy",
  "schemaRule": {
    "childfanouts": [
      {
        "field": "$.orders[*]",
        "parentpath": null
      },
      {
        "field": "$.items[*]",
        "parentpath": "$.orders[*]"
      },
      {
        "field": "$.subItems[*]",
        "parentpath": "$.items[*]"
      }
    ]
  },
  "transforms": [
    {
      "sourcePath": "$.id",
      "targetField": "event_id"
    }
  ]
}
```

#### Sample Data File
**Filename:** `sample-data.json`
```json
{
  "id": "12345",
  "timestamp": "2025-12-12T10:00:00Z",
  "events": [
    {"eventId": 1, "type": "login"},
    {"eventId": 2, "type": "logout"}
  ],
  "metadata": "{\"source\": \"api\", \"version\": \"1.0\"}",
  "payload": "{\"data\": [1, 2, 3]}",
  "data": "{\"items\": [\"a\", \"b\", \"c\"]}",
  "logs": [
    {
      "level": "info",
      "message": "test",
      "entries": [
        {"id": 1, "value": "entry1"},
        {"id": 2, "value": "entry2"}
      ]
    }
  ],
  "orders": [
    {
      "orderId": "order1",
      "items": [
        {
          "itemId": "item1",
          "subItems": [
            {"subId": "sub1"},
            {"subId": "sub2"}
          ]
        }
      ]
    }
  ]
}
```

---

## Test Scenarios

### Test 1: Policy with Fanout Only

**Objective:** Verify fanout path is auto-selected from policy

**Steps:**
1. Navigate to Step 1 (Introduction)
2. Select **"Update"** radio button
3. Upload `test-policy-fanout.json`
4. Wait for success notification
5. Click **"Continue to Sample Data"**
6. In Step 2, upload or paste `sample-data.json`
7. Click **"Continue to Schema Configuration"**
8. **Observe Step 3**

**Expected Results:**
- ✅ Fanout section shows tree with arrays
- ✅ `events[*]` array is **selected** (checkbox checked)
- ✅ Selected Arrays list shows: `events[*]`
- ✅ Convert to JSON section shows available fields (no selections)
- ✅ Console shows:
  ```
  [Step 3] Update mode detected with policy data - initiating pre-fill
  [Step 3] Extracted fanout path: $.events[*]
  [Step 3] Added fanout path to selections: events[*]
  ```
- ✅ Notification: "Schema configuration loaded from policy"

**Validation:**
1. Open browser console
2. Execute: `vm.$store.state.wizard.schemaRules.fanout`
3. Should return: `["events[*]"]` or `["$.events[*]"]`

---

### Test 2: Policy with Convert-to-JSON Only

**Objective:** Verify string-to-JSON checkboxes are pre-checked

**Steps:**
1. Clear wizard state (refresh page or click "Start Over")
2. Navigate to Step 1 (Introduction)
3. Select **"Update"** radio button
4. Upload `test-policy-converttojson.json`
5. Wait for success notification
6. Click **"Continue to Sample Data"**
7. In Step 2, upload or paste `sample-data.json`
8. Click **"Continue to Schema Configuration"**
9. **Observe Step 3**

**Expected Results:**
- ✅ Convert to JSON section shows:
  - ✅ `$.metadata` checkbox is **checked**
  - ✅ `$.payload` checkbox is **checked**
- ✅ Selected Fields list shows both fields
- ✅ Fanout section automatically scans parsed JSON for arrays
- ✅ If parsed JSON contains arrays, they appear in fanout candidates
- ✅ Console shows:
  ```
  [Step 3] Extracted convertToJson fields: ["$.metadata", "$.payload"]
  [Step 3] Pre-filled convertToJson fields: ["$.metadata", "$.payload"]
  ```
- ✅ Notification: "Schema configuration loaded from policy (2 string-to-JSON fields, 0 fanout arrays)"

**Validation:**
1. Open browser console
2. Execute: `vm.$store.state.wizard.schemaRules.convertToJson`
3. Should return: `["$.metadata", "$.payload"]`

---

### Test 3: Policy with Both Fanout and Convert-to-JSON

**Objective:** Verify both sections are pre-filled correctly

**Steps:**
1. Clear wizard state
2. Navigate to Step 1 (Introduction)
3. Select **"Update"** radio button
4. Upload `test-policy-complete.json`
5. Wait for success notification
6. Click **"Continue to Sample Data"**
7. In Step 2, upload or paste `sample-data.json`
8. Click **"Continue to Schema Configuration"**
9. **Observe Step 3**

**Expected Results:**
- ✅ Convert to JSON section:
  - ✅ `$.data` checkbox is **checked**
- ✅ Fanout section:
  - ✅ `logs[*]` array is **selected**
  - ✅ `entries[*]` array is **selected** (child fanout)
- ✅ Selected Arrays list shows both arrays
- ✅ Console shows:
  ```
  [Step 3] Pre-filled convertToJson fields: ["$.data"]
  [Step 3] Added fanout path to selections: logs[*]
  [Step 3] Added child fanout path to selections: entries[*]
  [Step 3] Stored child fanouts: 2
  ```
- ✅ Notification: "Schema configuration loaded from policy (1 string-to-JSON fields, 2 fanout arrays)"

**Validation:**
1. Execute: `vm.$store.state.wizard.schemaRules.convertToJson`
   - Should return: `["$.data"]`
2. Execute: `vm.$store.state.wizard.schemaRules.fanout`
   - Should return: `["logs[*]", "entries[*]"]`
3. Execute: `vm.$store.state.wizard.schemaRules.childfanouts`
   - Should return the childfanouts array from policy

---

### Test 4: Policy with Nested Child Fanouts

**Objective:** Verify hierarchical fanout structure is handled

**Steps:**
1. Clear wizard state
2. Navigate to Step 1 (Introduction)
3. Select **"Update"** radio button
4. Upload `test-policy-childfanouts.json`
5. Wait for success notification
6. Click **"Continue to Sample Data"**
7. In Step 2, upload or paste `sample-data.json`
8. Click **"Continue to Schema Configuration"**
9. **Observe Step 3**

**Expected Results:**
- ✅ Fanout section shows:
  - ✅ `orders[*]` selected (root level)
  - ✅ `items[*]` selected (child of orders)
  - ✅ `subItems[*]` selected (child of items)
- ✅ All three arrays appear in Selected Arrays list
- ✅ Console shows processing of all child fanouts
- ✅ Notification: "Schema configuration loaded from policy (0 string-to-JSON fields, 3 fanout arrays)"

**Validation:**
1. Execute: `vm.$store.state.wizard.schemaRules.childfanouts`
2. Should return array with 3 objects:
   ```javascript
   [
     { field: "$.orders[*]", parentpath: null },
     { field: "$.items[*]", parentpath: "$.orders[*]" },
     { field: "$.subItems[*]", parentpath: "$.items[*]" }
   ]
   ```

---

### Test 5: Policy without schemaRule

**Objective:** Verify graceful handling when no schema config exists

**Steps:**
1. Clear wizard state
2. Navigate to Step 1 (Introduction)
3. Select **"Update"** radio button
4. Create and upload a policy without schemaRule:
   ```json
   {
     "name": "simple-policy",
     "transforms": [
       {
         "sourcePath": "$.id",
         "targetField": "event_id"
       }
     ]
   }
   ```
5. Continue to Step 2, upload sample data
6. Continue to Step 3
7. **Observe Step 3**

**Expected Results:**
- ✅ Step 3 shows default/empty state
- ✅ No pre-fill occurs
- ✅ No error messages
- ✅ User can configure manually
- ✅ Console shows: `[Step 3] Update mode but no policy schemaRule found`
- ✅ No notification shown

---

### Test 6: Back Navigation Preserves Selections

**Objective:** Verify pre-filled data is preserved when navigating back

**Steps:**
1. Complete Test 3 (Policy with Both)
2. In Step 3, observe pre-filled selections
3. **Modify selections:**
   - Uncheck `$.data` (remove from convertToJson)
   - Select an additional array `orders[*]`
4. Click **"Continue to Filter Rules"** (Step 4)
5. Click **"Previous"** to return to Step 3
6. **Observe Step 3**

**Expected Results:**
- ✅ Modifications are preserved
- ✅ `$.data` is **unchecked** (user removed it)
- ✅ `logs[*]`, `entries[*]`, and `orders[*]` are selected
- ✅ Pre-fill does **not** run again
- ✅ Console shows: `[Step 3] Step 3 already has data, skipping pre-fill`

**Validation:**
1. Execute: `vm.$store.state.wizard.schemaRules.convertToJson`
   - Should return: `[]` (user removed $.data)
2. Execute: `vm.$store.state.wizard.schemaRules.fanout`
   - Should include: `["logs[*]", "entries[*]", "orders[*]"]`

---

### Test 7: Mode Switch Clears Pre-filled Data

**Objective:** Verify switching from Update to Create clears data

**Steps:**
1. Complete Test 3 (Policy with Both)
2. In Step 3, observe pre-filled selections
3. Click **"Previous"** to return to Step 2
4. Click **"Previous"** to return to Step 1
5. Select **"Create New"** radio button
6. Click **"Continue to Sample Data"**
7. In Step 2, upload same `sample-data.json`
8. Click **"Continue to Schema Configuration"**
9. **Observe Step 3**

**Expected Results:**
- ✅ Step 3 shows empty/default state
- ✅ No selections from previous Update mode session
- ✅ User can configure manually from scratch
- ✅ Console shows: `[Step 3] Create mode - no pre-fill needed`

---

### Test 8: Invalid Field Paths Handled Gracefully

**Objective:** Verify fields not in sample data are filtered out

**Steps:**
1. Clear wizard state
2. Navigate to Step 1 (Introduction)
3. Select **"Update"** radio button
4. Create and upload policy with non-existent fields:
   ```json
   {
     "name": "invalid-fields-policy",
     "schemaRule": {
       "convertoJson": ["$.nonExistentField", "$.metadata"],
       "fanout": {
         "inputField": ["$.nonExistentArray[*]"]
       }
     },
     "transforms": [
       {
         "sourcePath": "$.id",
         "targetField": "event_id"
       }
     ]
   }
   ```
5. Continue to Step 2, upload `sample-data.json`
6. Continue to Step 3
7. **Observe Step 3**

**Expected Results:**
- ✅ Only valid fields are pre-filled
- ✅ `$.metadata` checkbox is checked (exists in sample data)
- ✅ `$.nonExistentField` is **not** checked (doesn't exist)
- ✅ Fanout section shows no selections (array doesn't exist)
- ✅ Console shows warnings:
  ```
  [Step 3] Fanout path not found in candidates: nonExistentArray[*]
  ```
- ✅ No error notification
- ✅ Graceful degradation

---

### Test 9: Nested Arrays in Parsed JSON

**Objective:** Verify arrays within parsed JSON are discovered

**Steps:**
1. Clear wizard state
2. Navigate to Step 1 (Introduction)
3. Select **"Update"** radio button
4. Upload policy:
   ```json
   {
     "name": "nested-arrays-policy",
     "schemaRule": {
       "convertoJson": ["$.data"]
     },
     "transforms": [
       {
         "sourcePath": "$.id",
         "targetField": "event_id"
       }
     ]
   }
   ```
5. Continue to Step 2
6. Upload sample data where `$.data` contains stringified JSON with arrays:
   ```json
   {
     "id": "12345",
     "data": "{\"items\": [{\"id\": 1}, {\"id\": 2}], \"users\": [{\"name\": \"Alice\"}]}"
   }
   ```
7. Continue to Step 3
8. **Observe Step 3**

**Expected Results:**
- ✅ `$.data` checkbox is checked
- ✅ Parsing triggered automatically
- ✅ Fanout section shows discovered arrays:
  - `$.data.items[*]` (from parsed JSON)
  - `$.data.users[*]` (from parsed JSON)
- ✅ Arrays marked with "Parsed JSON" badge
- ✅ Console shows:
  ```
  [DEBUG] Found arrays in parsed JSON: ["$.data.items[*]", "$.data.users[*]"]
  ```

---

### Test 10: Large Policy with Many Fields

**Objective:** Verify performance with large configurations

**Steps:**
1. Clear wizard state
2. Navigate to Step 1 (Introduction)
3. Select **"Update"** radio button
4. Upload policy with many fields:
   ```json
   {
     "name": "large-policy",
     "schemaRule": {
       "convertoJson": [
         "$.field1", "$.field2", "$.field3", "$.field4", "$.field5",
         "$.field6", "$.field7", "$.field8", "$.field9", "$.field10"
       ],
       "fanout": {
         "inputField": ["$.arrays[*]"]
       }
     },
     "transforms": [{"sourcePath": "$.id", "targetField": "event_id"}]
   }
   ```
5. Continue to Step 2
6. Upload sample data with all fields
7. Continue to Step 3
8. **Observe Step 3**

**Expected Results:**
- ✅ All valid fields pre-filled
- ✅ Pre-fill completes in <2 seconds
- ✅ UI remains responsive
- ✅ No performance degradation
- ✅ Console logs are comprehensive but not excessive

---

## Console Debugging Commands

### Check Current State
```javascript
// Check wizard mode
vm.$store.state.wizard.projectConfig.mode

// Check uploaded policy
vm.$store.state.wizard.policyUpload.uploadedPolicyData

// Check schema rules in store
vm.$store.state.wizard.schemaRules

// Check component selections
vm.selectedConvertToJsonFields
vm.selectedFanoutFields
vm.fanoutCandidates
vm.convertToJsonCandidates
```

### Trigger Pre-fill Manually
```javascript
// Get policy schema rule
const schemaRule = vm.$store.state.wizard.policyUpload.uploadedPolicyData.schemaRule

// Call pre-fill method
await vm.prefillFromPolicy(schemaRule)
```

### Inspect Vuex Mutations
```javascript
// Enable Vuex devtools logging
vm.$store._mutations
vm.$store._actions
```

---

## Common Issues and Solutions

### Issue: Pre-fill not working

**Symptoms:** Step 3 shows empty state despite policy upload

**Debugging Steps:**
1. Check mode: `vm.$store.state.wizard.projectConfig.mode`
   - Should be: `"update"`
2. Check policy data: `vm.$store.state.wizard.policyUpload.uploadedPolicyData`
   - Should contain schemaRule object
3. Check console for errors
4. Verify sample data was uploaded in Step 2

**Solution:**
- Ensure Update mode is selected in Step 1
- Re-upload policy if data is missing
- Check policy file has valid schemaRule structure

---

### Issue: Some fields not pre-filled

**Symptoms:** Only partial pre-fill occurs

**Debugging Steps:**
1. Check candidates: `vm.convertToJsonCandidates`
2. Check candidates: `vm.fanoutCandidates`
3. Look for console warnings about missing fields

**Solution:**
- Verify sample data contains the fields specified in policy
- Check path format matches between policy and sample data
- Add missing fields to sample data

---

### Issue: Navigation loses selections

**Symptoms:** Selections disappear when navigating back

**Debugging Steps:**
1. Check store before navigation: `vm.$store.state.wizard.schemaRules`
2. Navigate back
3. Check store after navigation: `vm.$store.state.wizard.schemaRules`
4. Check `beforeDestroy` hook is saving data

**Solution:**
- Verify `UPDATE_SCHEMA_RULES` is called
- Check Vuex state persistence
- Verify `created()` hook restores data

---

## Success Criteria Checklist

After completing all tests, verify:

- [ ] Pre-fill works with fanout-only policies
- [ ] Pre-fill works with convertToJson-only policies
- [ ] Pre-fill works with policies containing both
- [ ] Child fanouts are stored and processed
- [ ] Invalid fields are filtered gracefully
- [ ] Back navigation preserves selections
- [ ] Mode switch clears previous data
- [ ] Create mode is unaffected
- [ ] Console logging is comprehensive
- [ ] Error handling is robust
- [ ] UI remains responsive
- [ ] Notifications are clear and helpful
- [ ] Vuex state is updated correctly
- [ ] No regressions in existing functionality

---

## Performance Benchmarks

Expected performance metrics:

| Operation | Expected Time | Acceptable Time |
|-----------|---------------|-----------------|
| Pre-fill execution | < 500ms | < 2s |
| UI update after pre-fill | < 200ms | < 500ms |
| Navigation with preserved data | < 100ms | < 300ms |
| Large policy (20+ fields) | < 1s | < 3s |

---

## Reporting Issues

When reporting issues, include:

1. **Test scenario** being executed
2. **Expected result** vs **actual result**
3. **Console logs** (full output)
4. **Vuex state** (JSON export)
5. **Sample data** used
6. **Policy file** used
7. **Browser** and version
8. **Screenshots** if UI issue

---

## Next Steps

After Phase 2 testing is complete:

1. Document any issues found
2. Verify all fixes
3. Create test report summary
4. Prepare for Phase 3: Filter Rules Pre-fill
5. Update integration tests

---

## Conclusion

This testing guide ensures comprehensive validation of Phase 2 implementation. Follow each test scenario carefully and document results for verification.

Happy testing! 🚀
