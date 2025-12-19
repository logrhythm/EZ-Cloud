# Case-Insensitive Property Access - Developer Guide

## Quick Reference

### When to Use
Use `getCaseInsensitiveProperty()` when accessing properties from policy data that might have inconsistent casing.

### Common Use Cases
✅ **DO USE** for:
- Policy file properties (`schemaRule`, `transforms`, `subtransforms`, etc.)
- Schema rule properties (`convertoJson`, `fanout`, `childfanouts`)
- Transform properties (`inputRule`, `LRSchemaField`, `type`, `format`, etc.)
- Any property loaded from external JSON files

❌ **DON'T USE** for:
- Internal component state variables
- Vue props and data properties
- Constants and hardcoded values
- Performance-critical loops (if exact casing is guaranteed)

## Usage Examples

### Step 3 (Standalone Function)
```javascript
// Accessing policy data
const schemaRule = getCaseInsensitiveProperty(policyData, 'schemaRule')
const convertToJson = getCaseInsensitiveProperty(schemaRule, 'convertoJson')
const fanout = getCaseInsensitiveProperty(schemaRule, 'fanout')

// Nested access
if (fanout) {
  const inputField = getCaseInsensitiveProperty(fanout, 'inputField')
}
```

### Steps 4-7 (Vue Method)
```javascript
// In Vue methods
methods: {
  prefillFromPolicy(policyData) {
    // Access with this. prefix
    const filter = this.getCaseInsensitiveProperty(policyData, 'filter')
    const transforms = this.getCaseInsensitiveProperty(policyData, 'transforms') || []
    
    // Process array items
    transforms.forEach(transform => {
      const inputRule = this.getCaseInsensitiveProperty(transform, 'inputRule')
      const lrField = this.getCaseInsensitiveProperty(transform, 'LRSchemaField')
    })
  }
}
```

## Pattern Recognition

### Correct Patterns ✅
```javascript
// Step 3 (standalone)
const value = getCaseInsensitiveProperty(obj, 'property')

// Steps 4-7 (Vue method)
const value = this.getCaseInsensitiveProperty(obj, 'property')

// With fallback
const value = getCaseInsensitiveProperty(obj, 'property') || defaultValue
const array = getCaseInsensitiveProperty(obj, 'property') || []
```

### Incorrect Patterns ❌
```javascript
// DON'T: Direct property access on policy data
const value = policyData.schemaRule  // ❌ Won't work with different casing

// DON'T: Using this. in Step 3
const value = this.getCaseInsensitiveProperty(obj, 'key')  // ❌ Not defined as method in Step 3

// DON'T: Missing this. in Steps 4-7
const value = getCaseInsensitiveProperty(obj, 'key')  // ❌ Not in scope
```

## Common Properties and Their Variations

### Policy Level
```javascript
// All these variations should work:
schemaRule / SchemaRule / schemarule / SCHEMARULE
transforms / Transforms / TRANSFORMS
subtransforms / SubTransforms / SUBTRANSFORMS
filter / Filter / FILTER
```

### Schema Rule Level
```javascript
// Convert to JSON
convertoJson / ConvertToJson / convertToJson / CONVERTTOJSON

// Fanout
fanout / Fanout / FANOUT
childfanouts / childFanouts / ChildFanouts / CHILDFANOUTS
```

### Transform Level
```javascript
inputRule / InputRule / INPUTRULE
LRSchemaField / lrSchemaField / lrschemafield
type / Type / TYPE
format / Format / FORMAT
default / Default / DEFAULT
alternativeFields / AlternativeFields / alternativefields
FanoutParentElement / fanoutParentElement / fanoutparentelement
```

## Performance Tips

### The function is optimized for exact matches
```javascript
// ⚡ FAST: Exact match (O(1))
const value = getCaseInsensitiveProperty({ schemaRule: 'x' }, 'schemaRule')

// 🐌 SLOWER: Case-insensitive search (O(n))
const value = getCaseInsensitiveProperty({ schemaRule: 'x' }, 'SchemaRule')
```

### Recommendation
When creating new policy files or objects, **use exact casing** to benefit from the optimization:
```javascript
// Preferred format (exact matches are faster)
const policy = {
  schemaRule: { ... },
  transforms: [ ... ],
  subtransforms: [ ... ]
}
```

## Error Handling

The function safely handles edge cases:
```javascript
// Returns undefined for invalid inputs
getCaseInsensitiveProperty(null, 'key')         // → undefined
getCaseInsensitiveProperty(undefined, 'key')    // → undefined
getCaseInsensitiveProperty('string', 'key')     // → undefined
getCaseInsensitiveProperty(123, 'key')          // → undefined

// Returns undefined for missing properties
getCaseInsensitiveProperty({ a: 1 }, 'b')       // → undefined
```

## Debugging Tips

### Enable Console Logging
Add temporary logging to track property access:
```javascript
const value = getCaseInsensitiveProperty(obj, 'property')
console.log('Accessed property:', 'property', '→', value)
console.log('Object keys:', Object.keys(obj))
```

### Common Issues

#### Issue: "Cannot read property 'X' of undefined"
```javascript
// ❌ BAD: Chaining without null checks
const value = policyData.schemaRule.convertoJson

// ✅ GOOD: Use helper with null checks
const schemaRule = getCaseInsensitiveProperty(policyData, 'schemaRule')
if (schemaRule) {
  const convertToJson = getCaseInsensitiveProperty(schemaRule, 'convertoJson')
}

// ✅ BETTER: With optional chaining
const convertToJson = getCaseInsensitiveProperty(
  getCaseInsensitiveProperty(policyData, 'schemaRule'),
  'convertoJson'
) || []
```

#### Issue: Property returns unexpected value
```javascript
// Check object structure
console.log('Object keys:', Object.keys(obj))
console.log('Looking for:', 'propertyName')
console.log('Result:', getCaseInsensitiveProperty(obj, 'propertyName'))

// Check casing variations
const variations = ['propertyName', 'PropertyName', 'propertyname', 'PROPERTYNAME']
variations.forEach(v => {
  console.log(`${v}:`, getCaseInsensitiveProperty(obj, v))
})
```

## Migration Guide

### Migrating Direct Access to Case-Insensitive Access

#### Before
```javascript
const schemaRule = policyData.schemaRule
const transforms = policyData.transforms || []
const filter = policyData.filter
```

#### After (Step 3)
```javascript
const schemaRule = getCaseInsensitiveProperty(policyData, 'schemaRule')
const transforms = getCaseInsensitiveProperty(policyData, 'transforms') || []
const filter = getCaseInsensitiveProperty(policyData, 'filter')
```

#### After (Steps 4-7)
```javascript
const schemaRule = this.getCaseInsensitiveProperty(policyData, 'schemaRule')
const transforms = this.getCaseInsensitiveProperty(policyData, 'transforms') || []
const filter = this.getCaseInsensitiveProperty(policyData, 'filter')
```

## Testing Your Changes

### Manual Testing Checklist
- [ ] Load policy with lowercase properties (`schemarule`, `transforms`)
- [ ] Load policy with uppercase properties (`SchemaRule`, `Transforms`)
- [ ] Load policy with mixed case (`SchemaRule`, `transforms`)
- [ ] Load policy with missing properties
- [ ] Check console for errors
- [ ] Verify UI displays correctly
- [ ] Test wizard progression through all steps

### Test Policy Files
Create test policy files with different casing:
```json
// test-policy-lowercase.json
{
  "schemarule": { "converttojson": [], "fanout": {} },
  "transforms": [],
  "filter": ""
}

// test-policy-uppercase.json
{
  "SchemaRule": { "ConvertToJson": [], "Fanout": {} },
  "Transforms": [],
  "Filter": ""
}

// test-policy-mixed.json
{
  "SchemaRule": { "convertoJson": [], "Fanout": {} },
  "transforms": [],
  "Filter": ""
}
```

## Best Practices

1. **Always use the helper** for policy data access
2. **Provide fallback values** for optional properties
3. **Check for null/undefined** before nested access
4. **Use exact casing** when creating new objects (for performance)
5. **Document expected property names** in comments
6. **Log warnings** for missing expected properties

## Related Documentation
- [Standardization Report](./CASE_INSENSITIVE_STANDARDIZATION.md)
- [Verification Report](./CASE_INSENSITIVE_VERIFICATION_REPORT.md)

---

**Last Updated**: December 17, 2025
