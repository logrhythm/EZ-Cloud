# Regex Patterns - Named Groups Update ✅

## Overview
All regex quick patterns have been updated to use **named capture groups** instead of numeric indices. This makes the patterns more readable, maintainable, and compatible with applications that only understand named groups.

## Changes Made

### File: `constants/operations.js`
**Location**: `COMMON_REGEX_PATTERNS` array (lines 38-118)

### Pattern Updates

#### 1. IP Address (IPv4)
- **Before**: `/(\\d+\\.\\d+\\.\\d+\\.\\d+)/` with `captureGroup: 1`
- **After**: `/(?<ipAddress>\\d+\\.\\d+\\.\\d+\\.\\d+)/` with `captureGroup: 'ipAddress'`
- **Group Name**: `ipAddress`

#### 2. IPv6 Address
- **Before**: `/([0-9a-fA-F:]+)/` with `captureGroup: 1`
- **After**: `/(?<ipv6Address>[0-9a-fA-F:]+)/` with `captureGroup: 'ipv6Address'`
- **Group Name**: `ipv6Address`

#### 3. Email Address
- **Before**: `/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/` with `captureGroup: 1`
- **After**: `/(?<email>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/` with `captureGroup: 'email'`
- **Group Name**: `email`

#### 4. URL
- **Before**: `/(https?:\\/\\/[^\\s]+)/` with `captureGroup: 1`
- **After**: `/(?<url>https?:\\/\\/[^\\s]+)/` with `captureGroup: 'url'`
- **Group Name**: `url`

#### 5. MAC Address
- **Before**: `/([0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2})/` with `captureGroup: 1`
- **After**: `/(?<macAddress>[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2})/` with `captureGroup: 'macAddress'`
- **Group Name**: `macAddress`

#### 6. Hostname/Domain
- **Before**: `/([a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+)/` with `captureGroup: 1`
- **After**: `/(?<hostname>[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+)/` with `captureGroup: 'hostname'`
- **Group Name**: `hostname`

#### 7. Port Number
- **Before**: `/:([0-9]{1,5})/` with `captureGroup: 1`
- **After**: `/:(?<port>[0-9]{1,5})/` with `captureGroup: 'port'`
- **Group Name**: `port`

#### 8. Windows File Path
- **Before**: `/([A-Za-z]:\\\\[^\\s]+)/` with `captureGroup: 1`
- **After**: `/(?<windowsPath>[A-Za-z]:\\\\[^\\s]+)/` with `captureGroup: 'windowsPath'`
- **Group Name**: `windowsPath`

#### 9. Linux File Path
- **Before**: `/(/[^\\s]+)/` with `captureGroup: 1`
- **After**: `/(?<linuxPath>/[^\\s]+)/` with `captureGroup: 'linuxPath'`
- **Group Name**: `linuxPath`

#### 10. Username
- **Before**: `/user[:\\s]+(\\w+)/` with `captureGroup: 1`
- **After**: `/user[:\\s]+(?<username>\\w+)/` with `captureGroup: 'username'`
- **Group Name**: `username`

#### 11. UUID
- **Before**: `/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/` with `captureGroup: 1`
- **After**: `/(?<uuid>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/` with `captureGroup: 'uuid'`
- **Group Name**: `uuid`

#### 12. Error/Exception
- **Before**: `/(Error|Exception|Fault):\\s*(.+)/` with `captureGroup: 2`
- **After**: `/(?<errorType>Error|Exception|Fault):\\s*(?<errorMessage>.+)/` with `captureGroup: 'errorMessage'`
- **Group Names**: `errorType` (error type) and `errorMessage` (error message to extract)

## Named Group Syntax

Named capture groups use the syntax: `(?<name>pattern)`

Where:
- `(?<...>)` - Named capture group delimiter
- `name` - The name of the capture group (alphanumeric, descriptive)
- `pattern` - The regex pattern to match

## Benefits

1. **Readability**: Group names are self-documenting (e.g., `ipAddress` vs `1`)
2. **Maintainability**: Adding or removing groups doesn't break existing code
3. **Type Safety**: String-based access is more explicit than numeric indices
4. **Compatibility**: Works with applications that require named groups
5. **Flexibility**: Can reference groups by name in replacement operations

## How It Works in the UI

### Before (Numeric Groups)
```javascript
{
  pattern: '/(\\d+\\.\\d+\\.\\d+\\.\\d+)/',
  captureGroup: 1  // Extract group 1
}
```

### After (Named Groups)
```javascript
{
  pattern: '/(?<ipAddress>\\d+\\.\\d+\\.\\d+\\.\\d+)/',
  captureGroup: 'ipAddress'  // Extract group by name
}
```

### In RegexOperationConfig.vue

The component already supports both numeric and named groups:

```javascript
const applyRegex = (input, pattern, captureGroup) => {
  const regex = new RegExp(regexPattern)
  const match = input.match(regex)
  
  let output
  if (typeof captureGroup === 'number') {
    // Numeric group (legacy)
    output = match[captureGroup] !== undefined ? match[captureGroup] : match[0]
  } else if (typeof captureGroup === 'string') {
    // Named group (new)
    output = match.groups && match.groups[captureGroup]
      ? match.groups[captureGroup]
      : match[0]
  }
  
  return output
}
```

## Testing

### Test Each Pattern

1. **IP Address**: Test with `"Connection from 192.168.1.1"`
   - Expected output: `192.168.1.1`
   - Group name: `ipAddress`

2. **Email**: Test with `"Contact user@example.com for info"`
   - Expected output: `user@example.com`
   - Group name: `email`

3. **URL**: Test with `"Visit https://example.com/path"`
   - Expected output: `https://example.com/path`
   - Group name: `url`

4. **MAC Address**: Test with `"Device MAC: 00:1A:2B:3C:4D:5E"`
   - Expected output: `00:1A:2B:3C:4D:5E`
   - Group name: `macAddress`

5. **Username**: Test with `"user: admin logged in"`
   - Expected output: `admin`
   - Group name: `username`

6. **Error/Exception**: Test with `"Error: File not found"`
   - Expected output: `File not found`
   - Group name: `errorMessage`

### Test Procedure

1. Open the Regex Operation configuration dialog
2. Select a quick pattern from the dropdown
3. Verify the pattern and capture group are auto-filled
4. Check that the capture group shows the name (e.g., `ipAddress`)
5. Enter a sample input value
6. Click "Test Operation"
7. Verify the extraction works correctly

## Backward Compatibility

The `RegexOperationConfig.vue` component supports both:
- **Numeric groups**: `captureGroup: 1`
- **Named groups**: `captureGroup: 'ipAddress'`

This ensures:
- Existing mappings with numeric groups continue to work
- New patterns use named groups for better clarity
- Users can manually enter either numeric or named groups

## Example Usage

### JavaScript Match Example
```javascript
const pattern = /(?<ipAddress>\d+\.\d+\.\d+\.\d+)/
const text = "Connection from 192.168.1.1"
const match = text.match(pattern)

console.log(match.groups.ipAddress)  // "192.168.1.1"
```

### Backend Syntax Generated
```
REGEX($.logMessage, '/(?<ipAddress>\d+\.\d+\.\d+\.\d+)/', 'ipAddress')
```

## Files Modified

1. **constants/operations.js** (lines 38-118)
   - Updated all 12 patterns in `COMMON_REGEX_PATTERNS`
   - Changed numeric capture groups to named groups
   - Updated `captureGroup` field to use string names

## Group Naming Conventions

All group names follow these conventions:
- **camelCase** format
- **Descriptive** of what they capture
- **No spaces** or special characters
- **Consistent** with the pattern's purpose

Examples:
- `ipAddress` (not `ip` or `IP_ADDRESS`)
- `username` (not `user` or `name`)
- `errorMessage` (not `error` or `msg`)
- `windowsPath` (not `path` or `win_path`)

## Success Criteria

- [x] All 12 patterns converted to named groups
- [x] No linting errors in operations.js
- [ ] All patterns tested in UI
- [ ] Extraction works correctly for each pattern
- [ ] Backend accepts named group syntax
- [ ] Round-trip editing preserves named groups
- [ ] Documentation updated

---

**Status**: Code changes complete, ready for testing
**Date**: December 29, 2025
**Impact**: All regex quick patterns now use named capture groups for better readability and compatibility
