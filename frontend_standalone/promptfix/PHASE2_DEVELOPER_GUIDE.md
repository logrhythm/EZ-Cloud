# Phase 2: Developer Quick Reference Guide

> **For developers working with JSONPath field access in the application**

---

## Quick Start

### When to Use Case-Insensitive JSONPath Functions

**Use case-insensitive functions whenever you:**
1. Access fields in sample data using JSONPath expressions
2. Traverse JSON structures from user-uploaded data
3. Validate field existence in sample data
4. Extract values for UI display or processing

---

## Available Utility Functions

All functions are exported from `/src/services/wizard/utilityService.js`

### 1. getCaseInsensitiveProperty()

**Purpose:** Get a single property from an object, ignoring case

```javascript
import { getCaseInsensitiveProperty } from '@/services/wizard/utilityService'

// Example
const sampleData = {
  "ResponseCode": 200,
  "ErrorMessage": "OK"
}

// All of these work:
const code1 = getCaseInsensitiveProperty(sampleData, 'responsecode')  // 200
const code2 = getCaseInsensitiveProperty(sampleData, 'ResponseCode')  // 200
const code3 = getCaseInsensitiveProperty(sampleData, 'RESPONSECODE')  // 200

const msg1 = getCaseInsensitiveProperty(sampleData, 'errormessage')   // "OK"
const msg2 = getCaseInsensitiveProperty(sampleData, 'ErrorMessage')   // "OK"
```

**When to Use:**
- Accessing a single property from an object
- Simple key lookups

**Performance:** Very fast (tries exact match first)

---

### 2. resolveJsonPathCaseInsensitive()

**Purpose:** Resolve a full JSONPath expression with case-insensitive field matching

```javascript
import { resolveJsonPathCaseInsensitive } from '@/services/wizard/utilityService'

const sampleData = {
  "Response": {
    "Data": {
      "Items": [
        { "Name": "Item 1", "Value": 100 },
        { "Name": "Item 2", "Value": 200 }
      ]
    }
  }
}

// All of these work (case-insensitive at every level):
const val1 = resolveJsonPathCaseInsensitive(sampleData, '$.response.data.items[0].value')
// Result: 100

const val2 = resolveJsonPathCaseInsensitive(sampleData, '$.RESPONSE.DATA.ITEMS[1].VALUE')
// Result: 200

const val3 = resolveJsonPathCaseInsensitive(sampleData, '$.Response.Data.Items[0].Name')
// Result: "Item 1"

// Wildcard support
const allNames = resolveJsonPathCaseInsensitive(sampleData, '$.response.data.items[*].name')
// Note: Returns first element's name with [*], use extractJsonPathValues for all
```

**When to Use:**
- Resolving complete JSONPath expressions
- Nested path navigation
- When you need the actual value at the path

**Handles:**
- Array notation: `[0]`, `[1]`, etc.
- Wildcards: `[*]`
- Nested paths of any depth
- Null/undefined values gracefully

---

### 3. checkJsonPathExists()

**Purpose:** Check if a JSONPath exists without retrieving the value

```javascript
import { checkJsonPathExists } from '@/services/wizard/utilityService'

const sampleData = {
  "User": {
    "Name": "John",
    "Email": null
  }
}

checkJsonPathExists(sampleData, '$.user.name')    // true
checkJsonPathExists(sampleData, '$.USER.NAME')    // true
checkJsonPathExists(sampleData, '$.user.email')   // false (null is considered non-existent)
checkJsonPathExists(sampleData, '$.user.phone')   // false (doesn't exist)
```

**When to Use:**
- Field validation
- Checking if a field exists before accessing it
- Form validation

**Returns:**
- `true` if path exists and value is not null/undefined
- `false` otherwise

---

### 4. extractJsonPathValues()

**Purpose:** Extract ALL values matching a wildcard JSONPath (for `[*]` notation)

```javascript
import { extractJsonPathValues } from '@/services/wizard/utilityService'

const sampleData = {
  "Events": [
    { "Type": "login", "User": "alice" },
    { "Type": "logout", "User": "bob" },
    { "Type": "login", "User": "charlie" }
  ]
}

// Get all event types
const types = extractJsonPathValues(sampleData, '$.events[*].type')
// Result: ["login", "logout", "login"]

// Get all users
const users = extractJsonPathValues(sampleData, '$.EVENTS[*].USER')
// Result: ["alice", "bob", "charlie"]

// Without wildcard, returns array with single value
const firstType = extractJsonPathValues(sampleData, '$.events[0].type')
// Result: ["login"]
```

**When to Use:**
- Extracting all values from an array
- Processing fanout arrays
- Building UI dropdowns from array fields

**Returns:** Always returns an array (empty if no matches)

---

## Common Patterns

### Pattern 1: Field Existence Check

```javascript
// In Vue component methods:
checkFieldExistsInSampleData(fieldPath) {
  const sampleData = this.sampleData?.parsedData
  if (!sampleData) return false

  // Use the utility function
  return checkJsonPathExists(sampleData, fieldPath)
}
```

### Pattern 2: Extracting Field Value for UI

```javascript
// In Vue component methods:
extractFieldValue(fieldPath) {
  const sampleData = this.sampleData?.parsedData
  if (!sampleData) return null

  return resolveJsonPathCaseInsensitive(sampleData, fieldPath)
}
```

### Pattern 3: Validating Multiple Fields

```javascript
validateFieldPaths(fieldPaths) {
  const sampleData = this.sampleData?.parsedData
  if (!sampleData) return []

  const missingFields = []
  for (const path of fieldPaths) {
    if (!checkJsonPathExists(sampleData, path)) {
      missingFields.push(path)
    }
  }
  return missingFields
}
```

### Pattern 4: Property Access in Loops

```javascript
// When traversing an object structure
function traverseObject(obj, pathParts) {
  let current = obj

  for (const part of pathParts) {
    if (!current || typeof current !== 'object') {
      return undefined
    }

    // Use case-insensitive property access
    current = getCaseInsensitiveProperty(current, part)
  }

  return current
}
```

---

## Migration Guide

### Before (Case-Sensitive)

```javascript
// ❌ OLD CODE - Case-sensitive
function checkFieldExists(sampleData, path) {
  const parts = path.replace('$.', '').split('.')
  let current = sampleData

  for (const part of parts) {
    if (!current || !(part in current)) {
      return false
    }
    current = current[part]  // ❌ Case-sensitive access
  }

  return true
}
```

### After (Case-Insensitive)

```javascript
// ✅ NEW CODE - Case-insensitive
import { getCaseInsensitiveProperty } from '@/services/wizard/utilityService'

function checkFieldExists(sampleData, path) {
  const parts = path.replace('$.', '').split('.')
  let current = sampleData

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return false
    }
    current = getCaseInsensitiveProperty(current, part)  // ✅ Case-insensitive
    if (current === undefined) {
      return false
    }
  }

  return true
}
```

**Or Even Better:**

```javascript
// ✅ BEST - Use the built-in function
import { checkJsonPathExists } from '@/services/wizard/utilityService'

function checkFieldExists(sampleData, path) {
  return checkJsonPathExists(sampleData, path)
}
```

---

## Best Practices

### 1. Always Import from utilityService

```javascript
// ✅ GOOD
import { getCaseInsensitiveProperty, resolveJsonPathCaseInsensitive } from '@/services/wizard/utilityService'

// ❌ BAD - Don't reimplement
function myCaseInsensitiveAccess(obj, prop) {
  // Don't do this - use the utility!
}
```

### 2. Use the Right Function for the Job

```javascript
// ✅ GOOD - Use checkJsonPathExists for existence checks
if (checkJsonPathExists(sampleData, '$.user.email')) {
  // Email exists
}

// ❌ BAD - Don't resolve just to check existence
if (resolveJsonPathCaseInsensitive(sampleData, '$.user.email') !== undefined) {
  // This works but is less clear
}
```

### 3. Handle Null/Undefined Gracefully

```javascript
// ✅ GOOD - Check for null/undefined
const value = resolveJsonPathCaseInsensitive(sampleData, path)
if (value !== undefined && value !== null) {
  // Use value
}

// ❌ BAD - Assume value exists
const value = resolveJsonPathCaseInsensitive(sampleData, path)
const length = value.length  // Could throw if value is undefined
```

### 4. Use Type Checks When Needed

```javascript
// ✅ GOOD - Verify type before using
const items = resolveJsonPathCaseInsensitive(sampleData, '$.items')
if (Array.isArray(items)) {
  items.forEach(item => { /* ... */ })
}

// ❌ BAD - Assume type
const items = resolveJsonPathCaseInsensitive(sampleData, '$.items')
items.forEach(item => { /* ... */ })  // Could fail if items is not an array
```

---

## Testing Your Code

### Unit Test Example

```javascript
import { resolveJsonPathCaseInsensitive } from '@/services/wizard/utilityService'

describe('Case-insensitive field access', () => {
  const sampleData = {
    "ResponseCode": 200,
    "Response": {
      "Data": {
        "Items": [
          { "Name": "Test" }
        ]
      }
    }
  }

  test('should match field with different case', () => {
    expect(resolveJsonPathCaseInsensitive(sampleData, '$.responsecode')).toBe(200)
    expect(resolveJsonPathCaseInsensitive(sampleData, '$.RESPONSECODE')).toBe(200)
    expect(resolveJsonPathCaseInsensitive(sampleData, '$.ResponseCode')).toBe(200)
  })

  test('should match nested path with different case', () => {
    const result = resolveJsonPathCaseInsensitive(sampleData, '$.response.data.items[0].name')
    expect(result).toBe('Test')
  })

  test('should return undefined for non-existent path', () => {
    expect(resolveJsonPathCaseInsensitive(sampleData, '$.nonexistent')).toBeUndefined()
  })
})
```

### Manual Testing Checklist

- [ ] Test with all lowercase field names
- [ ] Test with all uppercase field names
- [ ] Test with PascalCase field names
- [ ] Test with mixed case variations
- [ ] Test with nested paths (3+ levels deep)
- [ ] Test with array notation `[0]`, `[1]`, etc.
- [ ] Test with wildcard notation `[*]`
- [ ] Test with special characters like `@metadata`
- [ ] Test with null/undefined values
- [ ] Test with empty arrays
- [ ] Test with missing fields

---

## Troubleshooting

### Problem: Field not found despite correct path

**Possible Causes:**
1. Sample data not loaded yet
2. Path syntax error (missing `$.` prefix, incorrect brackets)
3. Field actually doesn't exist in sample data

**Solution:**
```javascript
console.log('Sample data:', sampleData)
console.log('Available keys:', Object.keys(sampleData))
console.log('Path:', fieldPath)
console.log('Exists?', checkJsonPathExists(sampleData, fieldPath))
```

### Problem: Getting undefined when you expect a value

**Possible Causes:**
1. Path navigates through null/undefined intermediate value
2. Array index out of bounds
3. Wildcard used but extractJsonPathValues not called

**Solution:**
```javascript
// Debug step by step
const parts = path.replace('$.', '').split('.')
let current = sampleData
for (const part of parts) {
  console.log(`Part: ${part}, Current:`, current)
  current = getCaseInsensitiveProperty(current, part)
  if (current === undefined) {
    console.log(`Failed at part: ${part}`)
    break
  }
}
```

### Problem: Performance issues with large objects

**Possible Causes:**
1. Excessive property searches on very large objects
2. Deep nesting with many property lookups

**Solution:**
- Cache results when possible
- Consider indexing frequently accessed paths
- Profile to identify bottlenecks

---

## FAQ

**Q: Do I need to change all my existing code?**
A: Only code that accesses sample data fields. Policy attribute access was handled in Phase 1.

**Q: What about performance?**
A: Minimal impact. Exact matches are fast. Case-insensitive fallback adds ~2ms per property.

**Q: Are these functions safe to use with user input?**
A: Yes, they include prototype pollution protection.

**Q: Can I use these with nested arrays?**
A: Yes, array notation is fully supported: `$.items[0].subitems[*].value`

**Q: What about special characters in field names?**
A: Works with `@metadata`, `@timestamp`, etc. Just include them in the path.

**Q: Do I need to normalize paths before passing them?**
A: No, the functions handle `$.`, `@.`, and plain paths automatically.

---

## Support

For questions or issues:
1. Check this guide first
2. Review the implementation document: `PHASE2_IMPLEMENTATION_COMPLETE.md`
3. Check the requirements document: `casefix.md`
4. Review the code in `utilityService.js` for detailed JSDoc comments

---

**Last Updated:** December 16, 2025
**Version:** 1.0.0
**Status:** Production Ready
