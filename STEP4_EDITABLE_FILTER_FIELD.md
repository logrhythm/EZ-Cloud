# Step 4: Case Mismatch Detection for Filter Fields

## Overview
Implemented case-insensitive field matching with proper warnings to distinguish between missing fields and case mismatches when loading filter configuration from a policy file during update mode.

## Changes Made

### File: `frontend_standalone/src/components/wizard/steps/Step4_FilterConfig.vue`

#### Case Mismatch Detection (Script Changes)

**Updated `checkFieldExistsInSampleData` Method:**
- Changed return type from `boolean` to `Object` with detailed match information
- Returns: `{ exists: boolean, exactMatch: boolean, matchedField: string|null }`
- Now performs both exact match and case-insensitive match checks
- Logs detailed match information for debugging

**Added New Helper Methods:**
- `isFieldCaseMismatch(fieldPath)` - Checks if a field has case mismatch warning
- `getFieldWarningColor(fieldPath)` - Returns badge color ('warning' for case mismatch, 'orange' for missing)
- `getFieldWarningLabel(fieldPath)` - Returns badge label ('case mismatch' or 'missing')

**Updated `prefillFromPolicy` Method:**
- Now distinguishes between three scenarios:
  1. **Field not found** - Marks as 'missing' and injects synthetic field
  2. **Case mismatch** - Marks as 'case-mismatch' with reference to actual field in sample data
  3. **Exact match** - No warning, proceeds normally
- Tracks case mismatches with detailed information (policy field name vs sample data field name)
- Updates notification message to show separate counts for missing fields and case mismatches

**Updated Template:**
- Added separate badges in dropdown options for 'case mismatch' vs 'missing'
- Shows appropriate warning badge next to field selector (yellow for case mismatch, orange for missing)
- Tooltip displays detailed message about the specific issue

## Benefits

### Case Mismatch Detection
- **Better Diagnostics**: Users can now see if a field exists but with different casing
- **Clearer Warnings**: Distinguishes between truly missing fields vs fields that just have different casing
- **Actionable Information**: Tooltip shows both the policy field name and the actual sample data field name
- **Reduced Confusion**: Users understand that the field exists and filtering will work, just with different casing

## User Experience

### Case Mismatch Warnings

**Before:**
- Fields with different casing (e.g., `Device_Type` in policy vs `device_type` in sample) showed as "missing"
- Users were confused because the field actually existed in the data
- No indication that it was just a casing issue

**After:**
- Fields with case mismatch show a yellow "case mismatch" badge
- Truly missing fields show an orange "missing" badge
- Tooltip provides clear explanation: "Field casing differs: policy has 'Device_Type' but sample data has 'device_type'"
- Notification message separately counts missing fields and case mismatches

## Example Scenarios

### Scenario 1: Exact Match (No Warning)
- **Policy field**: `@.device_type`
- **Sample data field**: `@.device_type`
- **Result**: ✅ No warning, field loads normally

### Scenario 2: Case Mismatch (Yellow Warning)
- **Policy field**: `@.Device_Type`
- **Sample data field**: `@.device_type`
- **Result**: ⚠️ Yellow "case mismatch" badge with tooltip: "Field casing differs: policy has '@.Device_Type' but sample data has '@.device_type'"

### Scenario 3: Missing Field (Orange Warning)
- **Policy field**: `@.custom_field`
- **Sample data field**: (not present)
- **Result**: ⚠️ Orange "missing" badge with tooltip: "Field defined in policy but not found in current sample data"

### Scenario 4: Missing Field (Orange Warning)
- **Policy field**: `@.custom_field`
- **Sample data field**: (not present)
- **Result**: ⚠️ Orange "missing" badge with tooltip: "Field defined in policy but not found in current sample data"

## Technical Details

### Case Mismatch Detection Algorithm
1. **First Pass**: Check for exact case-sensitive match
   - Compare field paths exactly as they appear
   - Return immediately if exact match found

2. **Second Pass**: Check for case-insensitive match
   - Convert all field paths to lowercase
   - Compare normalized paths
   - Track the actual matched field name for reporting

3. **Result Classification**:
   - `exists: true, exactMatch: true` → No warning
   - `exists: true, exactMatch: false` → Case mismatch warning (yellow badge)
   - `exists: false, exactMatch: false` → Missing field warning (orange badge)

### Data Structure for Field Issues
```javascript
{
  type: 'filter',
  path: '@.Device_Type',              // Field name from policy
  matchedField: '@.device_type',      // Actual field name in sample data (only for case mismatch)
  message: 'Field casing differs...',  // User-friendly message
  reason: 'case-mismatch'             // 'missing' or 'case-mismatch'
}
```

## Testing Scenarios

### Case Mismatch Detection Tests
1. **Exact match**: Load policy with `@.device_type`, sample has `@.device_type` → No warning
2. **Case mismatch**: Load policy with `@.Device_Type`, sample has `@.device_type` → Yellow "case mismatch" badge
3. **Missing field**: Load policy with `@.custom_field`, field not in sample → Orange "missing" badge
4. **Multiple issues**: Load policy with mix of exact matches, case mismatches, and missing fields → Correct badges and notification counts
5. **Nested paths**: Verify case mismatch detection works with nested paths like `@.user.Name` vs `@.user.name`
6. **Tooltip content**: Verify tooltip shows correct message with policy and sample field names for case mismatches

## Visual Indicators

| Scenario | Badge Color | Badge Text | Icon |
|----------|-------------|------------|------|
| Exact Match | None | - | - |
| Case Mismatch | Yellow (warning) | "case mismatch" | ⚠️ warning |
| Missing Field | Orange | "missing" | ⚠️ warning |

## Notification Messages

**All fields match:**
- Type: `positive` (green)
- Message: "Filter configuration loaded from policy"
- Caption: "X condition(s) loaded"

**Case mismatches only:**
- Type: `warning` (yellow)
- Message: "Filter configuration loaded from policy"
- Caption: "X condition(s) loaded (Y field(s) with case mismatch)"

**Missing fields only:**
- Type: `warning` (yellow)
- Message: "Filter configuration loaded from policy"
- Caption: "X condition(s) loaded (Y field(s) not found)"

**Both issues present:**
- Type: `warning` (yellow)
- Message: "Filter configuration loaded from policy"
- Caption: "X condition(s) loaded (Y missing, Z case mismatch)"

## Notes

- The field dropdown is a standard select dropdown (select from available fields only)
- All existing functionality (prefill from policy, field type detection, validation) remains intact
- Case mismatch detection uses case-insensitive comparison for field existence
- Filter expressions will work correctly even with case mismatches (the condition uses the policy field name as-is)
- Case mismatch warnings help users understand that filtering will work, but they may want to update their policy to match the actual data casing
