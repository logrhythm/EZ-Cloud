# JavaScript Comment Support in Policy Files

## Overview
The policy validator now supports **JavaScript-style comments** in JSON policy files. Comments are automatically stripped during validation, allowing developers to document their policy configurations without causing validation errors.

## Supported Comment Styles

### 1. Single-Line Comments (`//`)
Everything after `//` until the end of the line is treated as a comment and removed.

```json
{
  "name": "My Policy",  // This is a comment
  "filter": "$.type == 'event'"  // Filter expression
}
```

### 2. Multi-Line Block Comments (`/* ... */`)
Everything between `/*` and `*/` is treated as a comment and removed, even across multiple lines.

```json
{
  "name": "My Policy",
  /*
   * This entire block is a comment
   * Multiple lines are supported
   */
  "filter": "$.type == 'event'"
}
```

## How It Works

### Processing Pipeline
1. **Read File**: Policy file is read as text
2. **Strip Comments**: Both `//` and `/* */` comments are removed
3. **Fix Trailing Commas**: Commas before `]` or `}` are automatically removed
4. **Parse JSON**: Clean JSON is parsed with `JSON.parse()`
5. **Validate Structure**: Policy structure is validated

### Smart Preservation
Comments inside **quoted strings are preserved**:

```json
{
  "url": "https://example.com//api/endpoint",  // URL preserved
  "regex": "/(?i)pattern/",  // Regex pattern preserved
  "description": "Use // for comments"  // Text preserved
}
```

## Real-World Example: eventHub Policy

### Original Policy (with comments)
```json
{
  "name": "EventHub_common_fields_defender_ATP_info",
  "schemarule": {
    "fanout": {
      "InputField": null
    },
    "ConvertoJson": [
      "$.response.properties.LoggedOnUsers",
      "$.response.properties.AdditionalFields"
    ]
  },
  "transforms": [
    {
      "inputrule": "$.response.properties.ActivityObjects[0].Type",
      "LRSchemaField": "object",
      "alternativefields": [
        "$.response.properties.RegistryValueData",
        "$.response.properties.ConnectedNetworks[0].Name",
        //"SPLIT($.response.properties.ConnectedNetworks,'\\\\',3)",
        "$.response.resourceId"
      ]
    },
    {
      "inputrule": "$.response.properties.PublicIP",
      "LRSchemaField": "snatip",
      "alternativefields": [
        // "SPLIT($.response.properties.IPAddresses,'\\\\',3)"
        "$.response.properties.IPAddresses[0].IPAddress"
      ]
    },
    //{
    //  "inputrule": "$.response.properties.Title",
    //  "LRSchemaField": "vendorinfo",
    //  "type": "String",
    //  "alternativefields": [
    //    "$.response.operationName"
    //  ]
    //},
    {
      "inputrule": "$.response.category",
      "LRSchemaField": "subject"
    }
  ]
}
```

### After Comment Removal (internal processing)
```json
{
  "name": "EventHub_common_fields_defender_ATP_info",
  "schemarule": {
    "fanout": {
      "InputField": null
    },
    "ConvertoJson": [
      "$.response.properties.LoggedOnUsers",
      "$.response.properties.AdditionalFields"
    ]
  },
  "transforms": [
    {
      "inputrule": "$.response.properties.ActivityObjects[0].Type",
      "LRSchemaField": "object",
      "alternativefields": [
        "$.response.properties.RegistryValueData",
        "$.response.properties.ConnectedNetworks[0].Name",
        "$.response.resourceId"
      ]
    },
    {
      "inputrule": "$.response.properties.PublicIP",
      "LRSchemaField": "snatip",
      "alternativefields": [
        "$.response.properties.IPAddresses[0].IPAddress"
      ]
    },
    {
      "inputrule": "$.response.category",
      "LRSchemaField": "subject"
    }
  ]
}
```

Notice how:
- All commented lines are removed
- The entire commented-out transform object is removed
- Trailing commas are automatically fixed
- Structure remains valid JSON

## Automatic Trailing Comma Fix

A common issue when removing comments is trailing commas. The validator automatically fixes these:

### Before Fix
```json
{
  "fields": [
    "field1",
    "field2",  // Comment here
    // "field3",  ← This line removed leaves trailing comma above
  ]
}
```

### After Fix
```json
{
  "fields": [
    "field1",
    "field2"  // ← Trailing comma automatically removed
  ]
}
```

## Use Cases

### 1. Documenting Alternative Fields
```json
{
  "alternativefields": [
    "$.response.properties.ActionResult",  // Primary field
    "$.response.properties.ResultStatus"   // Fallback field
  ]
}
```

### 2. Temporarily Disabling Configuration
```json
{
  "transforms": [
    {
      "inputrule": "$.active.field",
      "LRSchemaField": "field1"
    },
    /*
    // Temporarily disabled - testing phase
    {
      "inputrule": "$.test.field",
      "LRSchemaField": "field2"
    },
    */
    {
      "inputrule": "$.another.field",
      "LRSchemaField": "field3"
    }
  ]
}
```

### 3. Explaining Complex Regex or JSONPath
```json
{
  "inputrule": "REGEX($.response.resourceId,/(?i)providers/(?<providers>.*?)$,providers)",
  // Pattern explanation:
  // - (?i) = case insensitive
  // - providers/ = match "providers/" literally
  // - (?<providers>.*?) = capture group named "providers"
  // - $ = end of string
  "LRSchemaField": "objecttype"
}
```

### 4. Version History and Change Notes
```json
{
  "name": "EventHub Policy v2.3",
  /*
   * Version History:
   * v2.3 - Added support for AdditionalFields parsing
   * v2.2 - Fixed trailing comma in alternativefields
   * v2.1 - Initial release
   */
  "transforms": [...]
}
```

## Technical Implementation

### Character-by-Character Parser
The comment stripper uses a state machine that tracks:
- `inString`: Whether currently inside a quoted string
- `inBlockComment`: Whether currently inside `/* */` block
- `inLineComment`: Whether currently inside `//` line comment
- `escaped`: Whether the previous character was an escape (`\`)

### Regex-Based Trailing Comma Fix
After comment removal, this regex fixes trailing commas:
```javascript
jsonString.replace(/,(\s*)([\]}])/g, '$1$2')
```

This pattern:
- Matches: `,` followed by optional whitespace, then `]` or `}`
- Replaces with: just the whitespace and closing bracket (comma removed)

## Benefits

1. **Better Documentation**: Add explanatory comments directly in policy files
2. **Easier Debugging**: Comment out sections during testing without deleting them
3. **Version Control**: Track changes with inline comments
4. **Team Collaboration**: Explain complex patterns and logic to team members
5. **Migration Support**: Keep old configurations commented for reference

## Limitations

- Comments are **removed during validation** - they don't persist in the processed policy
- Comments must follow JavaScript syntax (`//` or `/* */`)
- Comments inside string values are preserved (not treated as comments)
- Very large comment blocks may impact parsing performance (though negligible for typical policies)

## Backward Compatibility

- Policies **without comments** work exactly as before
- No changes needed to existing valid JSON policies
- Adding comments to existing policies won't break validation

## Example: Migrating from Old Policy

When updating policies, you can keep old configurations for reference:

```json
{
  "name": "Updated Policy",
  
  // Old configuration (v1.0):
  // "schemarule": { "fanout": { "InputField": ["$.old.path"] } },
  
  // New configuration (v2.0):
  "schemarule": {
    "fanout": {
      "InputField": ["$.new.improved.path"]  // Updated for new schema
    }
  },
  
  "transforms": [
    {
      "inputrule": "$.response.properties.PublicIP",
      "LRSchemaField": "snatip",
      "alternativefields": [
        /*
         * Legacy approach (doesn't work with nested arrays):
         * "SPLIT($.response.properties.IPAddresses,'\\\\',3)"
         */
        // New approach using array indexing:
        "$.response.properties.IPAddresses[0].IPAddress"
      ]
    }
  ]
}
```

## Implementation Date
December 16, 2025

## Related Changes
- Case-insensitive property validation (see CASE_INSENSITIVE_VALIDATION_FIX.md)
- Enhanced error reporting for validation failures
