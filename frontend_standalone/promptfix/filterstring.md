# Filter String Parsing - Requirements for Update Mode

## Current Issues

The logic to identify `contains` and `exists` operators in update mode is incorrect. The current implementation in `filterRuleService.js` uses these patterns:

```javascript
{ regex: /\.contains\(/g, value: 'contains', label: 'Contains' },
{ regex: /\s+exists\s*/g, value: 'exists', label: 'Has Attribute (exists)' }
```

These patterns do not correctly handle the actual filter expressions from policy files.

---

## Contains Operator Implementation

### Overview
The `contains` operator is implemented as a **regular expression** that searches for text within a string value.

### Expression Format
```
@.fieldName =~ /pattern/
```

### Example
```
@.name =~ /(?i)test/
```

### Parsing Requirements

1. **Operator Recognition**
   - The `=~` operator indicates a regex match operation
   - Pattern: `@.fieldName =~ /pattern/`
   - This should be recognized as the `contains` operator in the UI

2. **Case-Insensitive Flag**
   - The `(?i)` prefix inside the regex pattern indicates case-insensitive matching
   - Example: `/(?i)test/` means "contains 'test' (case-insensitive)"
   - Example: `/test/` means "contains 'test' (case-sensitive)"

3. **UI Implementation**
   - Add a **"Case Insensitive"** checkbox next to the value input field
   - When parsing from policy:
     - If the pattern starts with `(?i)`, check the checkbox and remove `(?i)` from the displayed value
     - If no `(?i)` prefix, leave the checkbox unchecked
   - When building expression:
     - If checkbox is checked, prefix the pattern with `(?i)`
     - If unchecked, use the pattern as-is

4. **Pattern Extraction**
   - Extract the text between `/` delimiters
   - Remove the `(?i)` prefix if present for display in the value field
   - Store the case-sensitivity preference separately

### Examples

| Policy Expression | UI Field | UI Value | Case Insensitive |
|-------------------|----------|----------|------------------|
| `@.name =~ /(?i)test/` | `name` | `test` | ✓ Checked |
| `@.name =~ /test/` | `name` | `test` | ☐ Unchecked |
| `@.device_type =~ /(?i)cloud trail/` | `device_type` | `cloud trail` | ✓ Checked |

---

## Exists Operator Implementation

### Overview
The `exists` operator checks whether a JSON attribute exists in the data, **regardless of its value**.

### Expression Format
```
@.fieldName
```

### Example (Standalone)
```
@.name
```

### Example (Combined with Other Conditions)
```
@.name && @.name =~ /(?i)test/
```

In this compound expression, `@.name` (before the `&&` operator) is the `exists` check.

### Parsing Requirements

1. **Operator Recognition**
   - A condition that only mentions the field path without any comparison operator is an `exists` check
   - Pattern: `@.fieldName` (no `==`, `!=`, `=~`, `>`, `<`, etc.)
   - This should be recognized as the `exists` operator in the UI

2. **Distinguishing Exists from Other Operators**
   - Look for field references that are NOT followed by a comparison operator
   - Examples of exists:
     - `@.name` ✓
     - `@.user.email` ✓
     - `@.@metadata.beat` ✓
   - Examples that are NOT exists:
     - `@.name == 'value'` ✗ (equality operator)
     - `@.name =~ /test/` ✗ (regex/contains operator)
     - `@.count > 5` ✗ (comparison operator)

3. **Handling in Compound Expressions**
   - When parsing expressions like `@.name && @.name =~ /(?i)test/`:
     - First condition: `@.name` → `exists` operator
     - Logical operator: `AND`
     - Second condition: `@.name =~ /(?i)test/` → `contains` operator
   - Each condition should be parsed separately

4. **UI Implementation**
   - For `exists` operator:
     - Show the field selector
     - Show the operator as "Has Attribute" or "exists"
     - **Hide** or **disable** the value input field (no value is needed)
     - Display helper text: "No value needed - checks if attribute exists"

### Examples

| Policy Expression | UI Interpretation |
|-------------------|-------------------|
| `@.name` | Field: `name`, Operator: `exists`, Value: (none) |
| `@.user.email` | Field: `user.email`, Operator: `exists`, Value: (none) |
| `@.name && @.age > 18` | Condition 1: Field `name` exists (AND) Condition 2: Field `age` > 18 |

---

## Implementation Checklist

### For Contains Operator
- [ ] Update parser to recognize `=~` operator with regex patterns
- [ ] Extract pattern between `/` delimiters
- [ ] Detect `(?i)` prefix for case-insensitive flag
- [ ] Add "Case Insensitive" checkbox to UI
- [ ] Store case-sensitivity preference in condition data
- [ ] When building expression, wrap value in `/(?i)value/` or `/value/` based on checkbox
- [ ] Support both `@.field` and `$.field` notation

### For Exists Operator
- [ ] Update parser to recognize standalone field references (no operator)
- [ ] Distinguish field reference from comparison expressions
- [ ] Handle exists in compound expressions (e.g., before `&&` or `||`)
- [ ] Hide/disable value input when exists is selected
- [ ] Show helper text explaining exists operator
- [ ] When building expression, output only field path (e.g., `@.name`)
- [ ] Support both `@.field` and `$.field` notation

### General
- [ ] Test parsing of real policy filter expressions
- [ ] Ensure UI correctly displays parsed conditions
- [ ] Verify expression generation produces valid filter strings
- [ ] Handle edge cases (nested fields, special characters, etc.)
- [ ] Add validation and error messages for invalid patterns