# Case-Insensitive Policy Validation & Enhanced Comment Handling

## Summary
Updated the policy file validation in `policyValidator.js` to:
1. Handle attribute names in a case-insensitive manner
2. Remove JavaScript-style comments (`//` and `/* */`) from JSON files before validation
3. Automatically fix trailing commas that result from comment removal

This allows policy files with different casing variations and embedded comments to be properly validated.

## Changes Made

### 1. Added Helper Function
Created a new helper function `getCaseInsensitiveProperty()` that retrieves object properties regardless of case:

```javascript
function getCaseInsensitiveProperty (obj, key) {
  if (!obj || typeof obj !== 'object') return undefined
  
  const lowerKey = key.toLowerCase()
  const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKey)
  return foundKey ? obj[foundKey] : undefined
}
```

### 2. Enhanced Comment Stripping
Completely rewrote the `stripJsonComments()` function to handle:
- **Single-line comments** (`//`) - Removes everything after `//` until end of line
- **Multi-line block comments** (`/* ... */`) - Removes entire comment blocks
- **Preserves comments in strings** - Comments inside quoted strings (like URLs) are preserved
- **Character-by-character parsing** - More accurate than line-based parsing
- **Proper string escape handling** - Correctly handles escaped quotes within strings

### 3. Added Trailing Comma Fixer
Created a new helper function `fixTrailingCommas()` that:
- Automatically removes trailing commas that appear before `]` or `}`
- Fixes structural issues that arise from removing commented-out array/object elements
- Uses regex to clean up commas followed by closing brackets/braces

### 4. Updated PolicyMetadata Class
Modified the `PolicyMetadata` class constructor and `calculateComplexity()` method to use case-insensitive property access for:
- `name`
- `filter`
- `transforms`
- `schemaRule`
- `subtransforms`
- `convertoJson`
- `childfanouts`
- `fanout`

### 3. Updated Validation Methods
Updated the following methods to use case-insensitive property lookups:

#### `validatePolicyStructure()`
- Checks for `name`, `filter`, `transforms`, `schemaRule`, `subtransforms`
- Validates nested properties like `convertoJson`, `fanout`, `inputField`, `childfanouts`

#### `validatePolicyDataTypes()`
- Validates transforms with case-insensitive `sourcePath`, `inputRule`, `targetField`, `LRSchemaField`, `transformations`
- Validates schemaRule properties: `convertoJson`, `fanout`, `inputField`, `childfanouts`, `field`
- Validates subtransforms with case-insensitive `condition` and `transforms`

#### `validatePathExpressions()`
- Validates JSONPath expressions in transforms, schemaRule, and subtransforms using case-insensitive property access
- Checks `sourcePath`, `inputRule`, `convertoJson`, `inputField`, `field`, `parentpath`

## Supported Case Variations

The validation now accepts any case variation of policy attributes, including:

### Top-level attributes:
- `name` / `Name` / `NAME`
- `filter` / `Filter` / `FILTER`
- `transforms` / `Transforms` / `TRANSFORMS`
- `schemaRule` / `schemarule` / `SchemaRule` / `SCHEMARULE`
- `subtransforms` / `subTransforms` / `SubTransforms` / `SUBTRANSFORMS`

### SchemaRule sub-attributes:
- `convertoJson` / `ConvertoJson` / `convertToJson` / `CONVERTTOJSON`
- `fanout` / `Fanout` / `FANOUT`
- `inputField` / `InputField` / `INPUTFIELD`
- `childfanouts` / `childFanouts` / `ChildFanouts` / `CHILDFANOUTS`

### Transform attributes:
- `sourcePath` / `SourcePath` / `SOURCEPATH`
- `targetField` / `TargetField` / `TARGETFIELD`
- `inputRule` / `InputRule` / `INPUTRULE`
- `transformations` / `Transformations` / `TRANSFORMATIONS`

### Other attributes:
- `field` / `Field` / `FIELD`
- `parentpath` / `parentPath` / `ParentPath` / `PARENTPATH`
- `condition` / `Condition` / `CONDITION`

## Benefits

1. **Improved Compatibility**: Policy files created with different casing conventions will now validate successfully
2. **Better User Experience**: Users don't need to worry about exact casing when creating or modifying policy files
3. **Comment Support**: Policy files can include JavaScript-style comments for documentation purposes
4. **Automatic Cleanup**: Trailing commas from comment removal are automatically fixed
5. **Backward Compatible**: All existing policies with correct casing will continue to work as before
6. **Consistent Behavior**: The validation logic now matches the expected behavior for JSON property access

## Comment Handling Examples

The enhanced validator now properly handles all these comment scenarios:

### Example 1: Single-line comments in arrays
```json
{
  "alternativefields": [
    "$.response.properties.RegistryValueData",
    "$.response.properties.FolderPath",
    // "$.response.properties.ConnectedNetworks",  ← This will be removed
    "$.response.resourceId"
  ]
}
```

### Example 2: Multi-line block comments
```json
{
  "transforms": [
    /*
    {
      "inputrule": "$.response.properties.Title",
      "LRSchemaField": "vendorinfo",
      "type": "String"
    },
    */
    {
      "inputrule": "$.response.category",
      "LRSchemaField": "subject"
    }
  ]
}
```

### Example 3: Inline comments
```json
{
  "alternativefields": [
    // "SPLIT($.response.properties.IPAddresses,'\\\\',3)"  ← Comment removed
    "$.response.properties.IPAddresses[0].IPAddress"
  ]
}
```

### Example 4: Comments preserved in strings
```json
{
  "url": "https://example.com//path",  // URL with // preserved
  "description": "Use // for comments"  // Text with // preserved
}
```

## Trailing Comma Handling

After removing comments, the validator automatically fixes trailing commas:

**Before cleanup:**
```json
{
  "fields": [
    "field1",
    "field2",  // ← Trailing comma after comment removal
  ]
}
```

**After cleanup:**
```json
{
  "fields": [
    "field1",
    "field2"  // ← Trailing comma removed
  ]
}
```

## Benefits

## Testing Recommendations

To test the changes, create policy files with various casing combinations and comment styles:

### Example 1: Mixed case with inline comments
```json
{
  "Name": "Test Policy",
  "Filter": "$.eventType == 'login'",  // Filter expression
  "Transforms": [...]
}
```

### Example 2: Different schemaRule casing with block comments
```json
{
  "name": "Test Policy",
  "SchemaRule": {
    "ConvertoJson": ["$.data"],
    /*
    "Fanout": {
      "InputField": ["$.old_field"]
    },
    */
    "Fanout": {
      "InputField": ["$.events"]
    }
  }
}
```

### Example 3: Policy file from real-world scenario (eventHub example)
```json
{
  "schemarule": {
    "fanout": {
      "InputField": null
    },
    "ConvertoJson": ["$.response.properties.LoggedOnUsers"]
  },
  "transforms": [
    {
      "inputrule": "$.response.properties.ActivityObjects[0].Type",
      "LRSchemaField": "object",
      "alternativefields": [
        "$.response.properties.ConnectedNetworks[0].Name",
        //"SPLIT($.response.properties.ConnectedNetworks,'\\\\',3)",
        "$.response.resourceId"
      ]
    }
  ]
}
```

All these variations should now pass validation successfully, with comments automatically removed and structure preserved.

## Implementation Details

### Comment Stripping Algorithm
1. **Character-by-character parsing** for accuracy
2. **State tracking**: Monitors whether parser is in string, line comment, or block comment
3. **Escape sequence handling**: Properly handles `\"` and `\\` in strings
4. **Preservation logic**: Comments inside strings are kept intact
5. **Two-pass approach**: First removes comments, then fixes trailing commas

### Trailing Comma Fix
- Uses regex pattern: `/,(\s*)([\]}])/g`
- Matches: comma + optional whitespace + closing bracket/brace
- Replaces with: whitespace + closing bracket/brace (comma removed)

## Testing Recommendations

## Implementation Date
December 16, 2025
