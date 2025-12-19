# Step 4 Case Mismatch Warning - Quick Reference

## Visual Indicators

| Status | Badge Color | Badge Text | Meaning |
|--------|-------------|------------|---------|
| ✅ OK | None | - | Field found with exact match |
| ⚠️ Warning | Yellow | "case mismatch" | Field exists but with different casing |
| ⚠️ Error | Orange | "missing" | Field not found in sample data |

## Tooltip Messages

### Case Mismatch
```
Field casing differs: policy has "@.Device_Type" but sample data has "@.device_type"
```

### Missing Field
```
Field defined in policy but not found in current sample data
```

## Notification Examples

### No Issues
```
✅ Filter configuration loaded from policy
   3 conditions loaded
```

### Case Mismatch Only
```
⚠️ Filter configuration loaded from policy
   3 conditions loaded (2 fields with case mismatch)
```

### Missing Fields Only
```
⚠️ Filter configuration loaded from policy
   3 conditions loaded (1 field not found)
```

### Both Issues
```
⚠️ Filter configuration loaded from policy
   3 conditions loaded (1 missing, 2 case mismatch)
```

## Common Scenarios

### 1. Standard Field Names
| Policy | Sample Data | Result |
|--------|-------------|--------|
| `@.device_type` | `@.device_type` | ✅ No warning |
| `@.Device_Type` | `@.device_type` | ⚠️ Case mismatch (yellow) |
| `@.custom_field` | (not present) | ⚠️ Missing (orange) |

### 2. Nested Paths
| Policy | Sample Data | Result |
|--------|-------------|--------|
| `@.user.name` | `@.user.name` | ✅ No warning |
| `@.user.Name` | `@.user.name` | ⚠️ Case mismatch (yellow) |
| `@.User.Name` | `@.user.name` | ⚠️ Case mismatch (yellow) |

### 3. Array Paths
| Policy | Sample Data | Result |
|--------|-------------|--------|
| `@.items[0].id` | `@.items[0].id` | ✅ No warning |
| `@.items[0].ID` | `@.items[0].id` | ⚠️ Case mismatch (yellow) |

## What Users Should Do

### For Case Mismatches (Yellow Badge)
- **Impact**: Filter will work, but field names don't match exactly
- **Action**: Consider updating the policy to match sample data casing for consistency
- **Urgency**: Low - functional, just a style/consistency issue

### For Missing Fields (Orange Badge)
- **Impact**: Field from policy not found in current sample data
- **Action**: 
  1. Verify the field name is correct
  2. Check if sample data is representative
  3. May need to update policy or provide different sample data
- **Urgency**: Medium - may indicate a problem with the filter configuration

## Developer Notes

### Key Methods
- `checkFieldExistsInSampleData(fieldPath)` - Returns match details
- `isFieldCaseMismatch(fieldPath)` - Check if case mismatch
- `isFieldMissing(fieldPath)` - Check if truly missing
- `getFieldWarningColor(fieldPath)` - Get badge color
- `getFieldWarningLabel(fieldPath)` - Get badge text

### Data Structure
```javascript
missingPolicyFields = [
  {
    type: 'filter',
    path: '@.Device_Type',           // From policy
    matchedField: '@.device_type',   // From sample (if case mismatch)
    message: '...',                   // User message
    reason: 'case-mismatch'          // or 'missing'
  }
]
```

### Console Logging
- ✅ Exact match: `Field from policy FOUND in sample data (exact match)`
- ⚠️ Case mismatch: `Field from policy has CASE MISMATCH: X → Y`
- ❌ Missing: `Field from policy NOT FOUND in sample data`
