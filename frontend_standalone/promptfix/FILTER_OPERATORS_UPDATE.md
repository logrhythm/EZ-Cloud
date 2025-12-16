# Filter Operators Update - Implementation Summary

## Date
December 14, 2025

## Changes Completed

### 1. Removed startsWith and endsWith Operators

**Files Modified:**
- `src/services/wizard/filterRuleService.js`

**Changes:**
- ✅ Removed `startsWith` case from `_buildSingleConditionExpression` method
- ✅ Removed `endsWith` case from `_buildSingleConditionExpression` method
- ✅ Updated comment from "contains, startsWith, endsWith" to just "contains"
- ✅ Removed startsWith and endsWith from operator patterns array in parser

**Impact:**
- These operators are no longer available in both **create mode** and **update mode**
- Users cannot select these operators from the UI dropdown
- Filter expressions using these operators will no longer be generated

---

### 2. Fixed Contains Operator for Update Mode

**Files Modified:**
- `src/services/wizard/filterRuleService.js`
- `src/components/wizard/steps/Step4_FilterConfig.vue`

**Implementation Details:**

#### A. Parser Updates (filterRuleService.js)

**Changed Pattern Recognition:**
```javascript
// OLD (incorrect):
{ regex: /\.contains\(/g, value: 'contains', label: 'Contains' }

// NEW (correct):
{ regex: /\s*=~\s*/g, value: 'contains', label: 'Contains' }
```

**New Parsing Logic:**
- Recognizes `=~` operator with regex patterns: `@.field =~ /pattern/`
- Extracts pattern between `/` delimiters
- Detects `(?i)` prefix for case-insensitive matching
- Removes `(?i)` from the displayed value
- Stores case-sensitivity in `caseInsensitive` property

**Example Parsing:**
| Policy Expression | Parsed Field | Operator | Value | Case Insensitive |
|-------------------|--------------|----------|-------|------------------|
| `@.name =~ /(?i)test/` | `name` | `contains` | `test` | `true` |
| `@.device_type =~ /cloud trail/` | `device_type` | `cloud trail` | `false` |

#### B. Expression Builder Updates (filterRuleService.js)

**Updated `_buildSingleConditionExpression`:**
```javascript
case 'contains': {
  const escapedValue = this._escapeRegex(value)
  const caseInsensitiveFlag = condition.caseInsensitive ? '(?i)' : ''
  return `${sanitizedField} =~ /${caseInsensitiveFlag}.*${escapedValue}.*/`
}
```

**Behavior:**
- When building expression, checks `caseInsensitive` flag
- If `true`, adds `(?i)` prefix: `@.field =~ /(?i).*value.*/`
- If `false`, omits prefix: `@.field =~ /.*value.*/`

#### C. UI Updates (Step4_FilterConfig.vue)

**Added Case-Insensitive Checkbox:**
- Checkbox appears next to value input when `contains` operator is selected
- Bound to `condition.caseInsensitive` property
- Has tooltip explaining functionality
- Updates expression when toggled

**New Handler Method:**
```javascript
onCaseInsensitiveChange(index) {
  // Updates filter expression when checkbox is toggled
  this.debouncedUpdateExpression()
}
```

**Condition Initialization:**
```javascript
const newCondition = {
  // ...existing fields...
  caseInsensitive: false // Default for new conditions
}
```

**UI Layout:**
```vue
<div class="condition-value-group">
  <q-select ... /> <!-- Value input -->
  <q-checkbox 
    v-if="condition.operator === 'contains'"
    v-model="condition.caseInsensitive"
    label="Case Insensitive"
  />
</div>
```

---

### 3. Fixed Exists Operator for Update Mode

**Files Modified:**
- `src/services/wizard/filterRuleService.js`

**Implementation Details:**

**Changed Pattern Recognition:**
```javascript
// OLD (incorrect):
{ regex: /\s+exists\s*/g, value: 'exists', label: 'Has Attribute (exists)' }

// NEW (correct):
{ value: 'exists', label: 'Has Attribute (exists)' } // No regex - handled specially
```

**New Parsing Logic:**
- Recognizes standalone field references: `@.field` (no operator, no value)
- Pattern: `@.fieldName` without any comparison operator
- Correctly distinguishes from other expressions:
  - `@.name` ✓ → exists
  - `@.name == 'value'` ✗ → equality operator
  - `@.name =~ /test/` ✗ → contains operator

**Parsing Priority:**
1. First tries to match `contains` with `=~` operator
2. Then tries standard comparison operators (`==`, `!=`, `>`, etc.)
3. Finally checks for standalone field reference (exists)

**Example Parsing:**
| Policy Expression | Parsed As |
|-------------------|-----------|
| `@.name` | Field: `name`, Operator: `exists`, Value: (none) |
| `@.name && @.age > 18` | Two conditions: `name` exists AND `age > 18` |

**Expression Builder:**
```javascript
case 'exists':
  // Returns only the field path (no comparison)
  return sanitizedField
```

**UI Behavior:**
- Value input is hidden when `exists` is selected
- Shows placeholder: "No value needed"
- Tooltip explains: "checks if attribute exists"

---

## Testing Scenarios

### Create Mode
1. ✅ Add new condition with `contains` operator
2. ✅ Toggle case-insensitive checkbox
3. ✅ Verify expression includes/excludes `(?i)` flag
4. ✅ Add condition with `exists` operator
5. ✅ Verify value input is hidden
6. ✅ Verify `startsWith` and `endsWith` are not in operator dropdown

### Update Mode
1. ✅ Load policy with `@.field =~ /(?i)pattern/`
   - Should parse as `contains` with case-insensitive checked
2. ✅ Load policy with `@.field =~ /pattern/`
   - Should parse as `contains` with case-insensitive unchecked
3. ✅ Load policy with `@.field`
   - Should parse as `exists` with no value
4. ✅ Load policy with compound expression: `@.name && @.name =~ /test/`
   - Should parse as two conditions with correct operators

### Expression Generation
1. ✅ Create `contains` with case-insensitive → `@.field =~ /(?i).*value.*/`
2. ✅ Create `contains` without case-insensitive → `@.field =~ /.*value.*/`
3. ✅ Create `exists` → `@.field`
4. ✅ No `startsWith` or `endsWith` expressions can be created

---

## Files Modified

### Service Layer
- `src/services/wizard/filterRuleService.js`
  - Updated operator patterns array
  - Rewrote contains parsing logic (=~ operator)
  - Rewrote exists parsing logic (standalone field)
  - Updated expression builder for contains
  - Removed startsWith and endsWith cases

### UI Layer
- `src/components/wizard/steps/Step4_FilterConfig.vue`
  - Added case-insensitive checkbox
  - Added `onCaseInsensitiveChange` handler
  - Updated condition initialization
  - Added CSS styling for value group and checkbox

---

## Backward Compatibility

### Existing Policies
- ✅ Policies with `=~` operator will now parse correctly
- ✅ Policies with standalone field references will parse as exists
- ⚠️ Policies with old `.contains()` function syntax may not parse (unlikely to exist)
- ⚠️ Policies with `.startsWith()` or `.endsWith()` will fail to parse (expected behavior)

### Create Mode
- ✅ All existing functionality preserved
- ✅ New case-insensitive option enhances capabilities
- ✅ Removal of startsWith/endsWith simplifies UI

---

## Next Steps

### Optional Enhancements
1. Add visual indicator when case-insensitive is enabled in expression preview
2. Add validation for regex special characters in contains value
3. Add test cases for edge cases (special characters, nested fields, etc.)
4. Consider adding regex operator documentation/help text

### Documentation
1. Update user manual with new contains behavior
2. Document case-insensitive checkbox usage
3. Update API documentation for filter expression format
4. Add migration guide for startsWith/endsWith removal

---

## Related Files

**Requirements:**
- `promptfix/filterstring.md` - Detailed requirements and specifications

**Documentation:**
- `STEP4_UPDATE_MODE_IMPLEMENTATION.md` - Overall Step 4 update mode documentation
- `FEATURE_VALUE_VALIDATION.md` - Value validation feature documentation

**Code:**
- Service: `src/services/wizard/filterRuleService.js`
- Component: `src/components/wizard/steps/Step4_FilterConfig.vue`
