# Step 4 Filter Update Mode - Quick Reference Guide

## For Developers: How to Use

### 1. Filter Expression Parser

```javascript
import { FilterRuleService } from '@/services/wizard/filterRuleService'

// Parse a filter expression from policy
const result = FilterRuleService.parseFilterExpression("$.user == 'admin' && $.status != 'inactive'")

if (result.success) {
  console.log('Parsed conditions:', result.conditions)
  // conditions = [
  //   { field: '@.user', operator: '==', value: 'admin', logicalOperator: 'AND', ... },
  //   { field: '@.status', operator: '!=', value: 'inactive', logicalOperator: 'AND', ... }
  // ]
} else {
  console.error('Parse error:', result.error)
}
```

### 2. Supported Operators

#### Comparison Operators
- `==` - Equals
- `!=` - Not Equals
- `>` - Greater Than
- `<` - Less Than
- `>=` - Greater Than or Equal
- `<=` - Less Than or Equal

#### String Operators
- `.contains()` - Contains substring
- `.startsWith()` - Starts with string
- `.endsWith()` - Ends with string

#### Existence Operator
- `exists` - Field exists (no value needed)

#### Logical Operators
- `&&` - AND
- `||` - OR

### 3. Path Formats Handled

The parser handles multiple path formats:
```javascript
// All these are normalized to @.user.name
"$.user.name"
"@.user.name"
"$['user']['name']"
"user.name"
```

### 4. Example Filter Expressions

```javascript
// Simple equality
"$.status == 'active'"

// Multiple conditions with AND
"$.level > 3 && $.priority == 'high'"

// Multiple conditions with OR
"$.type == 'error' || $.type == 'warning'"

// String operations
"$.message.contains('error')"
"$.filename.startsWith('log_')"
"$.extension.endsWith('.json')"

// Existence check
"$.optionalField exists"

// Nested fields
"$.user.profile.email.contains('@company.com')"

// Array fields
"$.items[*].status == 'complete'"
```

### 5. Missing Field Detection

```javascript
// In Step4_FilterConfig.vue component

// Check if field exists
if (this.checkFieldExistsInSampleData('@.user.name')) {
  // Field exists in sample data
}

// Check if field is missing
if (this.isFieldMissing('@.user.name')) {
  // Field is missing from sample data
}

// Get warning message
const message = this.getFieldWarningMessage('@.user.name')
// Returns: "Field defined in policy but not found in current sample data"
```

### 6. Pre-fill from Policy

```javascript
// Automatic in created() hook if in update mode
// Manual call:
await this.prefillFromPolicy(policyData)

// policyData format:
// {
//   filter: "$.user == 'admin' && $.status == 'active'",
//   ... other policy data
// }
```

### 7. Missing Field Injection

When a field from the policy is not found in sample data, it's automatically injected:

```javascript
// Synthetic field structure
{
  path: 'user.name',
  label: '@.user.name',
  type: 'string',
  sampleValues: [],
  isNested: true,
  isMissing: true  // ← Key flag
}
```

### 8. Visual Indicator Usage

In template:
```vue
<!-- Badge for missing fields -->
<q-badge
  v-if="isFieldMissing(condition.field)"
  color="orange"
  text-color="white"
  class="missing-field-badge"
>
  <q-icon name="warning" size="14px" class="q-mr-xs" />
  missing
  <q-tooltip>
    {{ getFieldWarningMessage(condition.field) }}
  </q-tooltip>
</q-badge>
```

### 9. Testing in Update Mode

```javascript
// 1. Set mode to update
this.$store.commit('wizard/UPDATE_PROJECT_CONFIG', {
  mode: 'update'
})

// 2. Upload policy data
this.$store.commit('wizard/SET_UPLOADED_POLICY_DATA', {
  policyData: {
    filter: "$.user == 'admin'",
    // ... other fields
  },
  validationResult: { valid: true, errors: [], warnings: [] },
  metadata: {}
})

// 3. Navigate to Step 4
// prefillFromPolicy() will be called automatically
```

### 10. Error Handling Pattern

```javascript
try {
  const result = FilterRuleService.parseFilterExpression(expression)
  
  if (!result.success) {
    // Handle parse error
    this.$q.notify({
      type: 'warning',
      message: 'Could not parse filter expression',
      caption: result.error
    })
    return
  }
  
  // Process conditions
  for (const condition of result.conditions) {
    // ...
  }
  
} catch (error) {
  // Handle unexpected error
  console.error('Error:', error)
  this.$q.notify({
    type: 'negative',
    message: 'Failed to load filter configuration',
    caption: error.message
  })
}
```

---

## Common Issues & Solutions

### Issue 1: Fields not loading
**Solution**: Ensure `extractFieldsFromSampleData()` completes before `prefillFromPolicy()`
```javascript
await this.$nextTick()
await this.prefillFromPolicy(policyData)
```

### Issue 2: Missing field badge not showing
**Solution**: Check `missingPolicyFields` array is populated
```javascript
console.log('Missing fields:', this.missingPolicyFields)
```

### Issue 3: Parse errors
**Solution**: Validate filter expression format
```javascript
const validation = FilterRuleService.validateFilterExpression(expression)
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors)
}
```

### Issue 4: Wrong field types
**Solution**: Field types are inferred from sample data. For missing fields, default is 'string'
```javascript
// Manually set field type if needed
condition.fieldType = 'number'
```

---

## Debugging Tips

### Enable Verbose Logging
```javascript
// Check console for detailed logs
// Look for:
console.log('[Step 4] prefillFromPolicy: Starting pre-fill process')
console.log('[FilterRuleService] Parsing filter expression:', filterExpression)
console.log('[Step 4] Processing condition from policy')
```

### Inspect State
```javascript
// In Vue DevTools:
// - Check wizard/projectConfig.mode === 'update'
// - Check wizard/policyUpload.uploadedPolicyData
// - Check wizard/filterRules.conditions
// - Check component missingPolicyFields array
```

### Test Parser Directly
```javascript
// In browser console:
const result = FilterRuleService.parseFilterExpression("$.test == 'value'")
console.log(result)
```

---

## Performance Considerations

- ✅ Parser runs once during initialization
- ✅ Field extraction is debounced
- ✅ Missing field checks use simple array lookups
- ✅ No re-parsing on every render
- ✅ Efficient condition validation

---

## Maintenance Notes

### Adding New Operators
1. Update operator patterns in `parseFilterExpression()`
2. Add regex pattern for the operator
3. Update `_buildSingleConditionExpression()` to handle it
4. Add to operator list in UI

### Extending Field Validation
1. Update `checkFieldExistsInSampleData()` for custom logic
2. Add new validation types in `validateValueForFieldType()`
3. Update UI to show new validation errors

---

## Security Notes

- ✅ All values are HTML-escaped
- ✅ Regex patterns are escaped
- ✅ No `eval()` usage
- ✅ Input sanitization applied
- ✅ XSS protection in place

---

## Related Files

- `filterRuleService.js` - Core parsing logic
- `Step4_FilterConfig.vue` - UI component
- `wizardModule.js` - Vuex state management
- `updateFilter.md` - Original requirements

---

## Quick Commands

```bash
# Search for filter parsing code
grep -r "parseFilterExpression" src/

# Search for missing field handling
grep -r "isFieldMissing" src/

# Find filter-related tests
find test/ -name "*filter*"
```

---

## Next Steps After Implementation

1. ✅ Test with real policy files
2. ✅ Test with various filter expressions
3. ✅ Test missing field scenarios
4. ✅ Verify backward compatibility
5. ✅ User acceptance testing
6. ✅ Performance profiling
7. ✅ Documentation update

---

**Last Updated**: December 14, 2025  
**Status**: ✅ Production Ready
