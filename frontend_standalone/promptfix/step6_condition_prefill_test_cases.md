# Step 6 Condition Pre-fill - Test Cases

## Quick Test Checklist

### Prerequisites
- [ ] Application running in update mode
- [ ] Policy uploaded with subtransforms
- [ ] Sample data loaded
- [ ] Navigate to Step 6 (SubTransform Configuration)

---

## Test Case 1: Simple Equality Condition
**Condition:** `@.errorMessage == "failure"`

**Expected Result:**
- Modal opens with 1 condition row
- Field: `@.errorMessage`
- Operator: `==` (equals)
- Value: `failure`

**Pass Criteria:** ✅ All fields pre-filled correctly

---

## Test Case 2: Multiple AND Conditions
**Condition:** `@.errorCode == "500" && @.severity == "high"`

**Expected Result:**
- Modal opens with 2 condition rows
- **Condition 1:**
  - Field: `@.errorCode`
  - Operator: `==`
  - Value: `500`
  - Logical Operator: `AND`
- **Condition 2:**
  - Field: `@.severity`
  - Operator: `==`
  - Value: `high`

**Pass Criteria:** ✅ Both conditions with AND operator

---

## Test Case 3: Multiple OR Conditions
**Condition:** `@.errorMessage == "failure" || @.errorCode == "404"`

**Expected Result:**
- Modal opens with 2 condition rows
- **Condition 1:**
  - Field: `@.errorMessage`
  - Operator: `==`
  - Value: `failure`
  - Logical Operator: `OR`
- **Condition 2:**
  - Field: `@.errorCode`
  - Operator: `==`
  - Value: `404`

**Pass Criteria:** ✅ Both conditions with OR operator

---

## Test Case 4: Not Equals Operator
**Condition:** `@.status != "success"`

**Expected Result:**
- Modal opens with 1 condition row
- Field: `@.status`
- Operator: `!=` (not equals)
- Value: `success`

**Pass Criteria:** ✅ Not equals operator selected

---

## Test Case 5: Exists Operator (Has Attribute)
**Condition:** `@.errorMessage`

**Expected Result:**
- Modal opens with 1 condition row
- Field: `@.errorMessage`
- Operator: `exists` (Has Attribute)
- Value: (no value field - shows "No value needed")

**Pass Criteria:** ✅ Exists operator, no value field

---

## Test Case 6: Contains Operator
**Condition:** `@.message =~ /.*error.*/`

**Expected Result:**
- Modal opens with 1 condition row
- Field: `@.message`
- Operator: `contains`
- Value: `error`

**Pass Criteria:** ✅ Regex converted to contains operator

---

## Test Case 7: Starts With Operator
**Condition:** `@.message =~ /^Error.*/`

**Expected Result:**
- Modal opens with 1 condition row
- Field: `@.message`
- Operator: `startsWith`
- Value: `Error`

**Pass Criteria:** ✅ Regex converted to startsWith operator

---

## Test Case 8: Ends With Operator
**Condition:** `@.message =~ /.*failed$/`

**Expected Result:**
- Modal opens with 1 condition row
- Field: `@.message`
- Operator: `endsWith`
- Value: `failed`

**Pass Criteria:** ✅ Regex converted to endsWith operator

---

## Test Case 9: Comparison Operators
**Condition:** `@.responseTime > 1000`

**Expected Result:**
- Modal opens with 1 condition row
- Field: `@.responseTime`
- Operator: `>` (greater than)
- Value: `1000`

**Pass Criteria:** ✅ Comparison operator selected

---

## Test Case 10: Complex Mixed Conditions
**Condition:** `@.severity == "critical" && (@.errorCode == "500" || @.errorCode == "503")`

**Expected Result:**
- Modal opens with 3 condition rows
- Conditions properly nested with AND/OR

**Pass Criteria:** ✅ Complex expression parsed (Note: may require parentheses handling)

---

## Test Case 11: Empty/Catch-All Condition
**Condition:** `""` (empty string or null)

**Expected Result:**
- Modal opens with empty state
- "No filter conditions defined yet" message
- No condition rows

**Pass Criteria:** ✅ Empty state displayed

---

## Test Case 12: Edit and Save
**Action:** Edit a pre-filled condition and save

**Steps:**
1. Open modal with existing condition
2. Change operator from `==` to `!=`
3. Click "Save Condition"
4. Verify card shows updated condition

**Pass Criteria:** ✅ Changes saved and reflected on card

---

## Test Case 13: Cancel Without Saving
**Action:** Open modal, make changes, then cancel

**Steps:**
1. Open modal with existing condition
2. Change field value
3. Click "Cancel"
4. Reopen modal

**Pass Criteria:** ✅ Original condition still intact

---

## Test Case 14: Multiple SubTransforms
**Action:** Test multiple SubTransforms with different conditions

**Steps:**
1. Open condition modal for SubTransform 1
2. Verify correct pre-fill
3. Close modal
4. Open condition modal for SubTransform 2
5. Verify correct pre-fill (different from SubTransform 1)

**Pass Criteria:** ✅ Each SubTransform opens with its own condition

---

## Console Log Verification

When opening the modal, you should see these logs in order:

```
[Step 6] Edit condition for SubTransform: <id>
[Step 6] Setting currentCondition: <condition>
[Step 6] conditionDialog is now: true
[Step 6] currentCondition prop should be set to: <condition>
[ConditionEditorModal] value changed to: true
[ConditionEditorModal] Initializing modal...
[ConditionEditorModal] ========== INITIALIZE MODAL ==========
[ConditionEditorModal] Existing condition prop: <condition>
[ConditionEditorModal] Available fields extracted: <count>
[ConditionEditorModal] Parsing existing condition...
[ConditionEditorModal] Initialization complete, localConditions: [...]
```

---

## Known Edge Cases

### ✅ Handled:
- Numeric values (automatically detected)
- String values with/without quotes
- Boolean values
- Null/undefined/empty conditions (catch-all)
- Special characters in field names
- Nested JSON paths (e.g., `@.data.error.message`)

### ⚠️ Limitations:
- Complex nested parentheses may not parse perfectly
- Custom regex patterns beyond contains/startsWith/endsWith may need manual adjustment
- Field names with spaces require bracket notation (e.g., `@['field name']`)

---

## Debugging Tips

If conditions don't pre-fill:

1. **Check Console Logs:**
   - Look for `[ConditionEditorModal] Existing condition prop:` log
   - Verify condition string is not empty

2. **Check Timing:**
   - Look for `condition prop changed` log
   - Should see re-initialization if timing issue

3. **Verify Sample Data:**
   - Ensure `availableFields.length > 0`
   - Fields must exist in sample data to appear in dropdown

4. **Check Condition Format:**
   - Verify condition uses `@.fieldName` notation
   - Operators must match supported list: `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`, `startsWith`, `endsWith`, `=~`, `exists`

---

## Success Indicators

✅ **All GREEN means fix is working:**
- [ ] Modal opens without errors
- [ ] Condition rows appear (not empty state)
- [ ] Field dropdowns show correct selected value
- [ ] Operator dropdowns show correct selected value
- [ ] Value inputs show correct value (or "No value needed" for exists)
- [ ] Logical operators (AND/OR) correctly positioned between conditions
- [ ] Generated expression preview matches original condition
- [ ] Save button is enabled
- [ ] Saving updates the SubTransform card

---

**Last Updated:** 2025-12-15
**Status:** Ready for Testing
