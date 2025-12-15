# Testing Guide: Scenario 1 - Missing "String to JSON" Fields

## Quick Test Setup

### Test Data Files

Create these test files for easy testing:

#### Test 1: Field Missing - `test_sample_missing.json`
```json
{
  "message": "test message",
  "timestamp": "2025-12-12T10:00:00Z"
}
```

#### Test 1: Policy - `test_policy_missing.json`
```json
{
  "name": "test_policy",
  "filter": "true",
  "schemaRule": {
    "convertoJson": ["$.log"]
  },
  "transforms": [
    {
      "sourcePath": "$.message",
      "targetField": "message"
    }
  ]
}
```

**Expected Result:**
- `$.log` field appears in Step 3
- Checkbox is checked
- ⚠️ Warning icon displayed
- Badge shows "missing"
- Caption: "Not found in current sample data"

---

#### Test 2: All Fields Present - `test_sample_present.json`
```json
{
  "log": "{\"level\":\"info\",\"data\":\"test\"}",
  "message": "test message"
}
```

#### Test 2: Policy - `test_policy_present.json`
```json
{
  "name": "test_policy",
  "filter": "true",
  "schemaRule": {
    "convertoJson": ["$.log"]
  },
  "transforms": [
    {
      "sourcePath": "$.message",
      "targetField": "message"
    }
  ]
}
```

**Expected Result:**
- `$.log` field appears in Step 3
- Checkbox is checked
- NO warning icon
- Badge shows "string"
- Caption: "Contains stringified JSON"

---

#### Test 3: Mixed - `test_sample_mixed.json`
```json
{
  "log": "{\"level\":\"info\"}",
  "message": "test"
}
```

#### Test 3: Policy - `test_policy_mixed.json`
```json
{
  "name": "test_policy",
  "filter": "true",
  "schemaRule": {
    "convertoJson": ["$.log", "$.metadata", "$.payload"]
  },
  "transforms": [
    {
      "sourcePath": "$.message",
      "targetField": "message"
    }
  ]
}
```

**Expected Result:**
- `$.log` - checked, no warning (exists)
- `$.metadata` - checked, ⚠️ warning (missing)
- `$.payload` - checked, ⚠️ warning (missing)
- Notification: "2 fields not found in sample data"

---

#### Test 4: Nested Path - `test_sample_nested.json`
```json
{
  "data": {
    "items": []
  }
}
```

#### Test 4: Policy - `test_policy_nested.json`
```json
{
  "name": "test_policy",
  "filter": "true",
  "schemaRule": {
    "convertoJson": ["$.data.nested.field"]
  },
  "transforms": [
    {
      "sourcePath": "$.data",
      "targetField": "data"
    }
  ]
}
```

**Expected Result:**
- `$.data.nested.field` - checked, ⚠️ warning (missing)

---

## Manual Testing Steps

### Setup
1. Start the development server
2. Navigate to the wizard (Step 1)
3. Select **"Update"** mode
4. Upload a policy file from the test data above

### Test Execution

#### For Each Test Case:

1. **Upload Policy File (Step 1)**
   - Click "Update" radio button
   - Upload policy JSON file
   - Verify validation passes
   - Click "Next"

2. **Upload Sample Data (Step 2)**
   - Upload corresponding sample JSON file
   - Verify parsing succeeds
   - Click "Next"

3. **Verify Step 3 Display**
   - Check the "Convert to JSON" section
   - Verify fields are listed
   - Verify checkboxes are checked
   - Verify warning indicators (if missing)
   - Hover over warning icons to see tooltips

4. **Check Console Output**
   - Open browser DevTools console
   - Look for `[Step 3]` log messages
   - Verify field existence checking logs
   - Verify missing field warnings

5. **Verify Notifications**
   - Check notification type (positive/warning)
   - Verify notification message
   - Verify caption with field counts

6. **Selected Fields Section**
   - Scroll down to "Selected Fields"
   - Verify warning indicators appear here too
   - Verify warning captions

## Console Output Examples

### Normal Field (Exists)
```
[Step 3] Checking field existence: {
  originalPath: "$.log",
  normalizedPath: "log",
  sampleDataKeys: ["log", "message"]
}
[Step 3] Field "$.log" EXISTS in sample data
[Step 3] Field from policy FOUND in sample data: $.log
```

### Missing Field
```
[Step 3] Checking field existence: {
  originalPath: "$.log",
  normalizedPath: "log",
  sampleDataKeys: ["message", "timestamp"]
}
[Step 3] Property "log" not found in current object at path segment 0/1
[Step 3] Field from policy NOT FOUND in sample data: $.log
[Step 3] Added missing field to convertToJsonCandidates: $.log
[Step 3] Missing fields: [{
  type: "convertoJson",
  path: "$.log",
  message: "Field defined in policy but not found in current sample data"
}]
```

## Visual Verification Checklist

For each missing field, verify:

- [ ] ⚠️ Warning icon appears next to field name
- [ ] Warning icon is orange/yellow color
- [ ] Tooltip appears on hover with correct message
- [ ] Badge shows "missing" instead of "string"
- [ ] Badge is orange/yellow color (warning)
- [ ] Caption text shows "Not found in current sample data"
- [ ] Caption text is in warning color (orange/yellow)
- [ ] Checkbox is checked
- [ ] Field is included in "Selected Fields" section
- [ ] Warning indicators also appear in "Selected Fields" section

For existing fields, verify:

- [ ] NO warning icon
- [ ] Badge shows "string" in blue/primary color
- [ ] Caption shows "Contains stringified JSON"
- [ ] Checkbox is checked
- [ ] Field is included in "Selected Fields" section
- [ ] NO warning indicators in "Selected Fields" section

## Notification Verification

### All Fields Present
```
Type: positive (green)
Icon: (default success)
Message: "Schema configuration loaded from policy"
Caption: "1 string-to-JSON fields, 0 fanout arrays"
Timeout: 3 seconds
```

### Some Fields Missing
```
Type: warning (orange)
Icon: warning
Message: "Schema configuration loaded from policy"
Caption: "3 string-to-JSON fields, 0 fanout arrays (2 fields not found in sample data)"
Timeout: 5 seconds
```

## Edge Cases to Test

1. **Empty Sample Data**
   - Sample: `{}`
   - Policy: `convertoJson: ["$.field"]`
   - Expected: Field marked as missing

2. **Null Values**
   - Sample: `{"field": null}`
   - Policy: `convertoJson: ["$.field"]`
   - Expected: Field EXISTS (null is a valid value)

3. **Array Fields**
   - Sample: `{"items": []}`
   - Policy: `convertoJson: ["$.items"]`
   - Expected: Field EXISTS (empty array is valid)

4. **Deep Nested Path**
   - Sample: `{"a": {"b": {"c": "value"}}}`
   - Policy: `convertoJson: ["$.a.b.c"]`
   - Expected: Field EXISTS

5. **Deep Nested Missing**
   - Sample: `{"a": {"b": {}}}`
   - Policy: `convertoJson: ["$.a.b.c"]`
   - Expected: Field MISSING

6. **Array Index**
   - Sample: `{"items": [{"data": "test"}]}`
   - Policy: `convertoJson: ["$.items[0].data"]`
   - Expected: Field EXISTS (if array has element)

7. **Array Wildcard**
   - Sample: `{"items": [{"data": "test"}]}`
   - Policy: `convertoJson: ["$.items[*].data"]`
   - Expected: Field EXISTS (array has elements)

## Regression Testing

After implementing Scenario 1, verify:

1. **Create Mode Still Works**
   - Select "Create" mode
   - Upload sample data
   - Go to Step 3
   - Verify normal behavior (no warnings)
   - Manually select convertToJson fields
   - Verify functionality unchanged

2. **Navigation**
   - Pre-fill Step 3 (Update mode)
   - Navigate to Step 4
   - Navigate back to Step 3
   - Verify warnings persist
   - Verify selections maintained

3. **Modify Selections**
   - Pre-fill Step 3 with missing fields
   - Uncheck a missing field
   - Verify warning disappears
   - Re-check the field
   - Verify warning reappears

4. **Clear Selections**
   - Pre-fill Step 3
   - Click "Clear All" button
   - Verify all selections cleared
   - Verify warnings cleared

## Browser Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Performance Check

- [ ] No noticeable lag when loading Step 3
- [ ] Field existence checks complete quickly
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] Console logs don't flood (reasonable amount)

## Accessibility Check

- [ ] Warning icons are keyboard accessible
- [ ] Tooltips appear on focus (not just hover)
- [ ] Screen readers announce warning status
- [ ] Color contrast meets WCAG AA standards
- [ ] Warning is conveyed without relying solely on color

## Success Criteria

All tests pass when:
1. Missing fields are displayed with clear warning indicators
2. Existing fields display normally without warnings
3. Mixed scenarios show correct combination
4. Console logging provides useful debugging information
5. No errors or exceptions thrown
6. Notifications provide appropriate feedback
7. User can understand which fields are missing and why
8. Backward compatibility maintained (Create mode unaffected)

## Reporting Issues

If any test fails, report:
1. Test case number
2. Expected behavior
3. Actual behavior
4. Console errors (if any)
5. Screenshots
6. Browser and version
7. Steps to reproduce
