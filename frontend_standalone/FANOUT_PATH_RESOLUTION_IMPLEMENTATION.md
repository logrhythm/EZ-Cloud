# Fanout Array Path Resolution - Implementation Summary

## Overview
This document describes the implementation of fanout array path resolution for Step 5 (Field Mapping) based on fanout selections made in Step 3 (Schema Rules).

## Core Implementation

### 1. Vuex Store Enhancement
**File:** `/src/store/wizardModule.js`

**Added Getter:**
```javascript
// Fanout arrays getter for Step 5 path resolution
getFanoutArrays: (state) => state.schemaRules?.fanout || [],
```

This getter provides access to the fanout array selections from Step 3.

### 2. MappingService Path Resolution
**File:** `/src/services/wizard/mappingService.js`

#### Method: `resolvePathForFanout(absolutePath, fanoutArrays)`

**Purpose:** Converts absolute JSON paths to relative paths when fields are within fanout arrays.

**Algorithm:**
1. **Normalize paths** - Convert numeric array indices `[0]`, `[1]` to `[*]` notation
2. **Sort fanout arrays by depth** - Process deepest fanout arrays first (nearest parent)
3. **Find nearest fanout parent** - Match the path against fanout array prefixes
4. **Generate relative path** - Remove fanout parent prefix and replace with `$`
5. **Return result** - Both the resolved path and the fanout parent element

**Examples:**

| Fanout Selection | Input Path | Output JSON Path | Output Fanout Parent |
|------------------|------------|------------------|---------------------|
| None | `$.teamMembers[*].name` | `$.teamMembers[*].name` | `null` |
| `$.teamMembers` | `$.teamMembers[*].name` | `$.name` | `$.teamMembers` |
| `$.teamMembers` | `$.teamMembers[*].contact.email` | `$.contact.email` | `$.teamMembers` |
| `$.teamMembers` | `$.teamMembers[*].contact.tasks[*].title` | `$.contact.tasks[*].title` | `$.teamMembers` |
| `$.teamMembers`<br>`$.teamMembers[*].contact.tasks` | `$.teamMembers[*].contact.tasks[*].title` | `$.title` | `$.teamMembers[*].contact.tasks` |
| `$.teamMembers`<br>`$.teamMembers[*].contact.tasks` | `$.teamMembers[*].name` | `$.name` | `$.teamMembers` |

#### Method: `validateFanoutParentElement(fanoutParent, fanoutArrays)`

**Purpose:** Validates that a fanout parent element matches one of the selected fanout arrays from Step 3.

**Returns:** `true` if valid or no fanout parent, `false` if invalid

### 3. Step 5 Integration
**File:** `/src/components/wizard/steps/Step5_Mapping.vue`

#### Changes Made:

1. **Added computed property to access fanout arrays:**
```javascript
computed: {
  ...mapState('wizard', ['sampleData', 'fieldMappings', 'schemaRules']),

  fanoutArrays () {
    return this.$store.getters['wizard/getFanoutArrays']
  }
}
```

2. **Updated `createMappingFromNode` method:**
   - Calls `MappingService.resolvePathForFanout()` to resolve the path
   - Auto-populates `inputRule` with the resolved path (relative if in fanout)
   - Auto-populates `fanoutParentElement` with the fanout parent
   - Shows notification when field is within fanout array

3. **Added fanout validation in `saveMapping` method:**
   - Validates fanout parent element against Step 3 selections
   - Shows error notification if fanout parent is invalid
   - Prevents saving invalid fanout configurations

4. **Enhanced UI for fanout parent field:**
   - Made field read-only (auto-populated)
   - Added helpful hint text based on fanout status
   - Added tooltip showing available fanout arrays from Step 3
   - Blue background when fanout parent is set

## User Experience Flow

### Scenario 1: No Fanout Arrays Selected (Step 3)
1. User goes to Step 5
2. User clicks on any field in the JSON tree
3. **Result:**
   - JSON Path shows absolute path with `[*]` notation
   - Fanout Parent Element is empty
   - Hint: "No fanout arrays configured in Step 3"

### Scenario 2: Single Fanout Array Selected (e.g., `$.teamMembers`)
1. User selects `$.teamMembers` as fanout in Step 3
2. User goes to Step 5
3. User clicks on `$.teamMembers[*].name` field
4. **Result:**
   - JSON Path shows relative path: `$.name`
   - Fanout Parent Element: `$.teamMembers`
   - Notification: "Field is within fanout array"
   - Hint: "Auto-populated based on fanout selection from Step 3"

### Scenario 3: Nested Fanout Arrays (e.g., `$.teamMembers` + `$.teamMembers[*].contact.tasks`)
1. User selects both arrays as fanout in Step 3
2. User goes to Step 5
3. User clicks on `$.teamMembers[*].contact.tasks[*].title`
4. **Result:**
   - JSON Path shows: `$.title` (relative to nearest parent)
   - Fanout Parent Element: `$.teamMembers[*].contact.tasks`
   - Uses the **deepest/nearest** fanout parent

### Scenario 4: Field Outside Fanout Array
1. User has fanout arrays selected in Step 3
2. User clicks on field outside any fanout array (e.g., `$.projectName`)
3. **Result:**
   - JSON Path shows absolute path: `$.projectName`
   - Fanout Parent Element is empty
   - Hint: "Field is not within any fanout array"

## Technical Details

### Path Normalization
Both input paths and fanout arrays are normalized for comparison:
- `$.teamMembers[0].name` → `$.teamMembers[*].name`
- `$.teamMembers[1].name` → `$.teamMembers[*].name`
- Ensures consistent matching regardless of array index notation

### Depth Sorting
Fanout arrays are sorted by depth (deepest first) to ensure the **nearest** fanout parent is used:
```javascript
// Example:
// Input: ['$.teamMembers', '$.teamMembers[*].contact.tasks']
// Sorted: ['$.teamMembers[*].contact.tasks', '$.teamMembers']
//         ↑ Deepest first (used for nested fields)
```

### Relative Path Generation
When a field is within a fanout array:
1. Remove the fanout parent prefix from the absolute path
2. Replace with `$` to indicate relative root
3. Clean up any path syntax issues (e.g., `$.[*]` → `$`)

Example:
```
Absolute:  $.teamMembers[*].contact.email
Fanout:    $.teamMembers
Relative:  $.contact.email
           ↑ Starts from teamMembers context
```

### Validation Rules
- Fanout parent element must be one of the arrays selected in Step 3
- If no fanout arrays are configured, fanout parent must be empty/null
- Validation happens before saving the mapping

## Benefits

1. **Automatic Path Resolution:** Users don't need to manually calculate relative paths
2. **Error Prevention:** Invalid fanout parent elements are caught and prevented
3. **Clear Visual Feedback:** Blue highlighting and notifications when fanout is active
4. **Backward Compatible:** Existing mappings without fanout continue to work
5. **Nested Fanout Support:** Correctly handles multiple levels of nested fanout arrays

## Testing Scenarios

### Test Case 1: No Fanout
**Setup:** No fanout arrays selected in Step 3

**Steps:**
1. Go to Step 5
2. Click on `$.teamMembers[*].contact.tasks[*].title`

**Expected:**
- JSON Path: `$.teamMembers[*].contact.tasks[*].title`
- Fanout Parent: (empty)

### Test Case 2: Single Fanout (teamMembers)
**Setup:** Select `$.teamMembers` as fanout in Step 3

**Steps:**
1. Go to Step 5
2. Click on `$.teamMembers[*].name`

**Expected:**
- JSON Path: `$.name`
- Fanout Parent: `$.teamMembers`

### Test Case 3: Single Fanout - Nested Field
**Setup:** Select `$.teamMembers` as fanout in Step 3

**Steps:**
1. Go to Step 5
2. Click on `$.teamMembers[*].contact.email`

**Expected:**
- JSON Path: `$.contact.email`
- Fanout Parent: `$.teamMembers`

### Test Case 4: Single Fanout - Non-Fanout Array Inside
**Setup:** Select `$.teamMembers` as fanout in Step 3 (NOT tasks)

**Steps:**
1. Go to Step 5
2. Click on `$.teamMembers[*].contact.tasks[*].title`

**Expected:**
- JSON Path: `$.contact.tasks[*].title` (preserves `[*]` for tasks)
- Fanout Parent: `$.teamMembers`

### Test Case 5: Multiple Fanout (teamMembers + tasks)
**Setup:** Select both `$.teamMembers` and `$.teamMembers[*].contact.tasks` as fanout in Step 3

**Steps:**
1. Go to Step 5
2. Click on `$.teamMembers[*].contact.tasks[*].title`

**Expected:**
- JSON Path: `$.title`
- Fanout Parent: `$.teamMembers[*].contact.tasks` (nearest parent)

### Test Case 6: Multiple Fanout - Field in Outer Array
**Setup:** Select both `$.teamMembers` and `$.teamMembers[*].contact.tasks` as fanout in Step 3

**Steps:**
1. Go to Step 5
2. Click on `$.teamMembers[*].contact.email`

**Expected:**
- JSON Path: `$.contact.email`
- Fanout Parent: `$.teamMembers` (nearest parent for this field)

### Test Case 7: Validation - Invalid Fanout Parent
**Setup:** Select `$.teamMembers` as fanout in Step 3

**Steps:**
1. Go to Step 5
2. Create a mapping
3. Manually change fanout parent to `$.invalid`
4. Try to save

**Expected:**
- Error notification: "Invalid fanout parent element"
- Mapping is not saved

## Sample Data Structure for Testing

```json
{
  "projectId": 2001,
  "projectName": "DemoProject",
  "teamMembers": [
    {
      "id": 1,
      "name": "Manish",
      "role": "Developer",
      "contact": {
        "email": "manish@example.com",
        "phone": "+1-555-1234",
        "tasks": [
          {
            "taskId": "T001",
            "title": "Setup Environment",
            "status": "Completed",
            "details": {
              "assignedTo": "Manish",
              "estimatedHours": 4
            }
          },
          {
            "taskId": "T002",
            "title": "Code Review",
            "status": "In Progress",
            "details": {
              "assignedTo": "Manish",
              "estimatedHours": 2
            }
          }
        ]
      }
    },
    {
      "id": 2,
      "name": "Sarah",
      "role": "Designer",
      "contact": {
        "email": "sarah@example.com",
        "phone": "+1-555-5678",
        "tasks": [
          {
            "taskId": "T003",
            "title": "UI Mockups",
            "status": "Completed",
            "details": {
              "assignedTo": "Sarah",
              "estimatedHours": 8
            }
          }
        ]
      }
    }
  ]
}
```

## Files Modified

1. **`/src/store/wizardModule.js`**
   - Added `getFanoutArrays` getter

2. **`/src/services/wizard/mappingService.js`**
   - Added `resolvePathForFanout()` method
   - Added `validateFanoutParentElement()` method

3. **`/src/components/wizard/steps/Step5_Mapping.vue`**
   - Added `fanoutArrays` computed property
   - Updated `createMappingFromNode()` to use path resolution
   - Added fanout validation in `saveMapping()`
   - Enhanced fanout parent element input field UI
   - Added `getFanoutParentHint()` helper method

## Console Debugging

The implementation includes extensive console logging for debugging:

```
╔════════════════════════════════════════════════════════════════════════
║ [MappingService] resolvePathForFanout - START
╠════════════════════════════════════════════════════════════════════════
║ absolutePath: $.teamMembers[*].contact.tasks[*].title
║ fanoutArrays: ["$.teamMembers","$.teamMembers[*].contact.tasks"]
╚════════════════════════════════════════════════════════════════════════
[MappingService] normalizedPath: $.teamMembers[*].contact.tasks[*].title
[MappingService] sortedFanouts: ["$.teamMembers[*].contact.tasks","$.teamMembers"]
[MappingService] Checking fanout: "$.teamMembers[*].contact.tasks"
[MappingService] ✓ MATCH! Nearest fanout: "$.teamMembers[*].contact.tasks"
╔════════════════════════════════════════════════════════════════════════
║ [MappingService] resolvePathForFanout - RESULT
╠════════════════════════════════════════════════════════════════════════
║ jsonPath: $.title
║ fanoutParent: $.teamMembers[*].contact.tasks
╚════════════════════════════════════════════════════════════════════════
```

## Future Enhancements

1. **Dropdown for Fanout Parent:** Convert read-only input to dropdown showing available fanout arrays
2. **Visual Indicators in Tree:** Show badges next to fields indicating their fanout context
3. **Fanout Preview:** Show how many log events will be generated based on fanout selections
4. **Path Builder:** Visual tool to help users understand relative vs absolute paths

## Conclusion

The fanout array path resolution feature is now fully implemented and integrated into Step 5. It automatically resolves JSON paths based on fanout selections from Step 3, making it easier for users to create correct field mappings without manually calculating relative paths.
