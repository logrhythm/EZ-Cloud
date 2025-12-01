# SubTransform Feature Specification

## Overview
SubTransform is an advanced conditional mapping feature that allows different field mappings to be applied based on runtime conditions.

## Wizard Flow Position
- **Step 5:** Field Mapping (Base transforms)
- **Step 6:** SubTransform Configuration (Conditional transforms) ← NEW STEP
- **Step 7:** Generate Policy (Final output)

## What is SubTransform?
SubTransform is an array of conditional transform groups that parse JSON data when specific conditions are met. Each SubTransform entry contains:
1. **Condition:** A filter expression that determines when this transform group applies
2. **Transforms:** An array of field mappings (identical structure to Step 5 mappings)
3. **ExitOnMatch:** Boolean flag controlling execution flow
4. **SubTransForms:** Optional nested SubTransforms (rare, but supported)

## Execution Flow
1. Base transforms from Step 5 are always applied first
2. Each SubTransform is evaluated in order:
   - If `condition` matches AND `ExitOnMatch: true` → Apply transforms and STOP processing remaining SubTransforms
   - If `condition` matches AND `ExitOnMatch: false` → Apply transforms and CONTINUE to next SubTransform
   - If `condition` does NOT match → Skip this SubTransform and continue to next

## UI/UX Requirements
- **Reuse existing components** from Steps 3 (Filter) and 5 (Field Mapping):
  - Filter creation UI for `condition` field
  - Field mapping table/form for `Transforms` array
  - Add toggle/checkbox for `ExitOnMatch` flag
- Allow users to create, edit, delete, and reorder multiple SubTransforms
- Display clear visual indication of execution order and exit conditions
- Support nested SubTransforms (accordion/tree view)

## Example Policy Structure
Below is a real-world policy with SubTransforms:

{
  "name": "gsuite",
  "filter": "@.@metadata.beat == 'gsbeat' && @.response.id.applicationName != 'calendar' && @.response.id.applicationName != 'token' ",
  "schemarule": {
    "fanout": {
      "InputField": [ "$.response.events[*]" ]
    },
    "ConvertoJson": null
  },
  "transforms": [
    {
      "inputrule": "$.@metadata.beat",
      "LRSchemaField": "beatname",
      "type": "String",
      "default": null,
      "alternativefields": null,
      "format": null
    },
    {
      "inputrule": "$.@metadata.beat",
      "LRSchemaField": "device_type",
      "type": "String",
      "default": null,
      "alternativefields": null,
      "format": null
    },
    {
      "inputRule": "$.fullyqualifiedbeatname",
      "LRSchemaField": "fullyqualifiedbeatname",
      "type": "String",
      "default": null,
      "alternativeFields": [ "$.@metadata.beat" ],
      "format": null
    },
    {
      "inputRule": "$.response.id.time",
      "LRSchemaField": "normal_msg_date",
      "type": "Datetime",
      "default": null,
      "alternativeFields": [ "$.@timestamp" ],
      "format": "yyyy-MM-ddTHH:mm:ss.fffK"
    },
    {
      "inputrule": "$.response.id.time",
      "LRSchemaField": "time",
      "type": "Datetime",
      "default": null,
      "alternativefields": [ "$.@timestamp" ],
      "format": "yyyy-MM-ddTHH:mm:ss.fffK"
    },
    {
      "inputrule": "$.response.id.applicationName",
      "LRSchemaField": "parentprocessname",
      "type": "String",
      "default": null,
      "alternativefields": null,
      "format": null
    },
    {
      "inputrule": "$.@metadata.version",
      "LRSchemaField": "version",
      "type": "String",
      "default": null,
      "alternativefields": null,
      "format": null
    },
    {
      "inputrule": "$.response.actor.email",
      "LRSchemaField": "login",
      "type": "String",
      "default": null,
      "alternativefields": null,
      "format": null
    },
    {
      "inputrule": "$.response.ipAddress",
      "LRSchemaField": "sip",
      "type": "String",
      "default": null,
      "alternativefields": null,
      "format": null
    },
    {
      "inputrule": "$.name",
      "LRSchemaField": "vendorinfo",
      "type": "String",
      "default": null,
      "alternativefields": null,
      "format": null,
      "FanoutParentElement": "$.response.events[*]"
    },
    {
      "inputrule": "$.type",
      "LRSchemaField": "tag1",
      "type": "String",
      "default": null,
      "alternativefields": [ "$.response.id.applicationName" ],
      "format": null,
      "FanoutParentElement": "$.response.events[*]"
    },
    {
      "inputrule": "$.name",
      "LRSchemaField": "tag2",
      "type": "String",
      "default": null,
      "alternativefields": null,
      "format": null,
      "FanoutParentElement": "$.response.events[*]"
    }
  ],
  "subtransforms": [
    {
      "condition": "@.type=='access'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'owner')].value",
          "LRSchemaField": "account",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'doc_id')].value",
          "LRSchemaField": "object",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'doc_title')].value",
          "LRSchemaField": "objectname",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'doc_type')].value",
          "LRSchemaField": "objecttype",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'destination_folder_title')].multiValue[0]",
          "LRSchemaField": "parentprocesspath",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type=='acl_change'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'owner')].value",
          "LRSchemaField": "account",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'doc_id')].value",
          "LRSchemaField": "object",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'doc_title')].value",
          "LRSchemaField": "objectname",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'doc_type')].value",
          "LRSchemaField": "objecttype",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'visibility_change')].value",
          "LRSchemaField": "status",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type == 'APPLICATION_SETTINGS'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'NEW_VALUE')].value",
          "LRSchemaField": "object",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'APPLICATION_NAME')].value",
          "LRSchemaField": "objectname",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'SETTING_NAME')].value",
          "LRSchemaField": "subject",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }

      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type == 'DELEGATED_ADMIN_SETTINGS'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'USER_EMAIL')].value",
          "LRSchemaField": "account",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'ROLE_NAME')].value",
          "LRSchemaField": "objectname",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type=='DOMAIN_SETTINGS'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'DOMAIN_NAME')].value",
          "LRSchemaField": "domainimpacted",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'NEW_VALUE')].value",
          "LRSchemaField": "object",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'SETTING_NAME')].value",
          "LRSchemaField": "objectname",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type=='EMAIL_SETTINGS'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'EMAIL_LOG_SEARCH_MSG_ID')].value",
          "LRSchemaField": "object",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'EMAIL_LOG_SEARCH_RECIPIENT')].value",
          "LRSchemaField": "recipient",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'EMAIL_LOG_SEARCH_SENDER')].value",
          "LRSchemaField": "sender",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type=='GROUP_SETTINGS'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'GROUP_EMAIL')].value",
          "LRSchemaField": "group",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'USER_EMAIL')].value",
          "LRSchemaField": "account",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'NEW_VALUE')].value",
          "LRSchemaField": "object",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'SETTING_NAME')].value",
          "LRSchemaField": "objectname",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'SETTING_NAME')].value",
          "LRSchemaField": "tag3",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type=='login'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'login_type')].value",
          "LRSchemaField": "objecttype",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'is_suspicious')].value",
          "LRSchemaField": "tag3",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type=='moderator_action'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'group_email')].value",
          "LRSchemaField": "group",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type=='ORG_SETTINGS'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'DOMAIN_NAME')].value",
          "LRSchemaField": "domainimpacted",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'NEW_VALUE')].value",
          "LRSchemaField": "object",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'SERVICE_NAME')].value",
          "LRSchemaField": "objectname",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'NEW_VALUE')].value",
          "LRSchemaField": "tag3",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type=='rule_match_type'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'rule_name')].value",
          "LRSchemaField": "policy",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'resource_name')].value",
          "LRSchemaField": "objectname",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'actions')].multiValue[0]",
          "LRSchemaField": "action",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type=='USER_SETTINGS'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'USER_EMAIL')].value",
          "LRSchemaField": "account",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        },
        {
          "inputrule": "$.parameters[?(@.name == 'NEW_VALUE')].value",
          "LRSchemaField": "object",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type=='LICENSES_SETTINGS'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'USER_EMAIL')].value",
          "LRSchemaField": "account",
          "type": "String",
          "default": null,
          "alternativefields": null,
          "format": null,
          "FanoutParentElement": "$.response.events[*]"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    }
  ]
}

```

---

## Key Implementation Notes

### 1. JSON Structure Mapping
```json
{
  "condition": "string",        // ← Filter expression (reuse Step 3 Filter UI)
  "Transforms": [],             // ← Field mappings array (reuse Step 5 Mapping UI)
  "ExitOnMatch": boolean,       // ← New toggle/checkbox component
  "SubTransForms": [] | null    // ← Optional nested SubTransforms (recursive structure)
}
```

### 2. Field Name Consistency
⚠️ **Important:** The example policy uses inconsistent casing:
- Some fields: `"inputrule"` (lowercase)
- Some fields: `"inputRule"` (camelCase)
- Some fields: `"alternativefields"` (lowercase)
- Some fields: `"alternativeFields"` (camelCase)

**Recommendation:** Standardize to camelCase throughout:
- `inputRule` ✅
- `LRSchemaField` ✅
- `alternativeFields` ✅
- `FanoutParentElement` ✅

### 3. Condition Syntax
Conditions use JSONPath-style expressions with comparison operators:
- `@.type == 'access'` - Check if type equals 'access'
- `@.type == 'acl_change'` - Check if type equals 'acl_change'
- `@.@metadata.beat == 'gsbeat' && @.response.id.applicationName != 'calendar'` - Complex conditions with AND/OR

These should be created using the same Filter Builder from Step 3.

### 4. Component Reuse Strategy
| SubTransform Element | Reuse From | Notes |
|---------------------|------------|-------|
| `condition` | Step 3 Filter UI | May need minor adjustments for `@.` syntax |
| `Transforms` array | Step 5 Mapping UI | Exact same structure, should work as-is |
| `ExitOnMatch` | New component | Simple boolean toggle |
| `SubTransForms` | Recursive | Same UI, nested within parent SubTransform |

### 5. User Workflow
1. User completes Step 5 (Base Field Mappings)
2. User enters Step 6 (SubTransforms)
3. User clicks "Add SubTransform"
4. User creates condition using Filter Builder
5. User adds field mappings using Mapping UI
6. User sets ExitOnMatch flag (default: true)
7. User can optionally add nested SubTransforms
8. User can add more SubTransforms at the same level
9. User can reorder SubTransforms (execution order matters!)
10. User proceeds to Step 7 (Generate Policy)

### 6. Validation Rules
- ✅ At least one Transform must exist in each SubTransform
- ✅ Condition must be a valid filter expression
- ✅ ExitOnMatch must be explicitly set (no undefined)
- ✅ Warn if no SubTransform has ExitOnMatch: true (infinite evaluation possible)
- ✅ Nested SubTransforms should be limited to 2-3 levels deep (UX complexity)

### 7. Testing Scenarios
Users should be able to test SubTransforms with sample data:
- Show which SubTransform(s) matched
- Show transformed output for each match
- Highlight when ExitOnMatch stops further evaluation
- Show warning if no SubTransform matched

---

## Visual Design Suggestions

### SubTransform Card Layout
```
┌─────────────────────────────────────────────────────────┐
│ SubTransform #1                            [↑] [↓] [×]  │
├─────────────────────────────────────────────────────────┤
│ Condition: @.type == 'access'                           │
│ Exit on Match: ✓ Yes  ○ No                              │
├─────────────────────────────────────────────────────────┤
│ Field Mappings (3):                                     │
│   • $.parameters[?(@.name == 'owner')].value → account  │
│   • $.parameters[?(@.name == 'doc_id')].value → object  │
│   • $.parameters[?(@.name == 'doc_title')] → objectname│
│                                                          │
│ [+ Add Field Mapping] [+ Add Nested SubTransform]      │
└─────────────────────────────────────────────────────────┘

[+ Add SubTransform]
```

### Execution Flow Visualization
```
Base Transforms (Step 5)
    ↓
SubTransform #1 [condition] → Match? → Apply & Exit (if ExitOnMatch)
    ↓ (if no exit)
SubTransform #2 [condition] → Match? → Apply & Exit (if ExitOnMatch)
    ↓ (if no exit)
SubTransform #3 [condition] → Match? → Apply & Continue
    ↓
Done
```

---

## Common Use Cases

### Use Case 1: Event Type Routing
Different log event types require different field mappings:
- Login events → Extract login_type, is_suspicious
- Access events → Extract owner, doc_id, doc_title
- Settings events → Extract setting_name, new_value

### Use Case 2: Conditional Enrichment
Apply additional mappings only when certain conditions are met:
- If `severity == 'high'` → Add priority escalation fields
- If `source == 'external'` → Add threat intelligence lookups

### Use Case 3: Data Normalization
Handle vendor-specific variations:
- If `vendor == 'cisco'` → Map cisco_field_names
- If `vendor == 'palo_alto'` → Map palo_alto_field_names

---

## Questions for Clarification

1. **Priority:** Should SubTransforms have numeric priority instead of array order?
2. **Default Behavior:** What happens if NO SubTransform matches? (Currently: only base transforms apply)
3. **Nested Depth:** Should we enforce a maximum nesting level? (Suggest: 3 levels)
4. **Testing:** Should Step 6 include live testing with sample data from Step 2?
5. **Import/Export:** Should users be able to import SubTransform templates?

---

## Implementation Checklist

- [ ] Create Step 6 component structure
- [ ] Integrate Filter Builder for `condition` field
- [ ] Integrate Field Mapping UI for `Transforms` array
- [ ] Add ExitOnMatch toggle component
- [ ] Implement add/edit/delete SubTransform functionality
- [ ] Implement drag-and-drop reordering
- [ ] Support nested SubTransforms (recursive component)
- [ ] Add validation logic
- [ ] Add test/preview functionality
- [ ] Add visual execution flow diagram
- [ ] Update policy export to include SubTransforms
- [ ] Add SubTransforms to policy import
- [ ] Update documentation and tooltips
- [ ] Add example templates/presets