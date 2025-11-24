# Step 5 Mapping: Fanout Array Path Resolution

## Overview
This specification defines how JSON paths and fanout parent elements should be displayed and populated in Step 5 (Field Mapping) based on the fanout array selections made in Step 3 (Schema Rules).

## Background
When users select arrays for "fanout" processing in Step 3, it affects how JSON paths are constructed in Step 5. Fanout arrays are parent arrays that will be iterated over to generate multiple log events. Fields within or below fanout arrays should have their paths adjusted to be relative to the nearest fanout parent.

## Sample Data Structure

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
            "title": "API Testing",
            "status": "In Progress",
            "details": {
              "assignedTo": "Aisha",
              "estimatedHours": 6
            }
          }
        ]
      }
    },
    {
      "id": 2,
      "name": "Aisha",
      "role": "Tester",
      "contact": {
        "email": "aisha@example.com",
        "phone": "+1-555-5678",
        "tasks": [
          {
            "taskId": "T003",
            "title": "Write Test Cases",
            "status": "Pending",
            "details": {
              "assignedTo": "Aisha",
              "estimatedHours": 8
            }
          }
        ]
      }
    }
  ]
}
```

## Path Resolution Rules

### Rule 1: No Fanout Selected
**Scenario**: User has NOT selected any arrays for fanout in Step 3.

**Behavior**: 
- JSON paths use standard JSONPath notation with `[*]` for all arrays
- No fanout parent element is set

**Example**:
- **Field Selected**: `title` (inside `tasks` array)
- **JSON Path Label**: `$.teamMembers[*].contact.tasks[*].title`
- **Fanout Parent Element**: *(empty/null)*

---

### Rule 2: Single Fanout Selected (Top-Level Array)
**Scenario**: User selected `teamMembers` array for fanout in Step 3.

**Behavior**:
- Paths for fields within or below `teamMembers` are **relative** to the fanout parent
- The `$` root refers to the fanout parent context
- Fanout parent element is set to the absolute path of the fanout array

**Examples**:

#### Example 2a: Field directly in fanout array
- **Field Selected**: `name` (direct child of `teamMembers` item)
- **JSON Path Label**: `$.name`
- **Fanout Parent Element**: `$.teamMembers`

#### Example 2b: Field in nested object (not in array)
- **Field Selected**: `email` (inside `contact` object)
- **JSON Path Label**: `$.contact.email`
- **Fanout Parent Element**: `$.teamMembers`

#### Example 2c: Field in nested array (not selected for fanout)
- **Field Selected**: `title` (inside `tasks` array, `tasks` NOT selected for fanout)
- **JSON Path Label**: `$.contact.tasks[*].title`
- **Fanout Parent Element**: `$.teamMembers`
- **Note**: `tasks` array still uses `[*]` notation since it's not a fanout array

---

### Rule 3: Multiple Fanout Selected (Nested Arrays)
**Scenario**: User selected BOTH `teamMembers` AND `tasks` arrays for fanout in Step 3.

**Behavior**:
- Paths are relative to the **most immediate/nearest** fanout parent
- Each nested fanout creates a new relative context
- Fanout parent element points to the immediate fanout parent

**Examples**:

#### Example 3a: Field in inner fanout array
- **Field Selected**: `title` (inside `tasks` array, which is selected for fanout)
- **JSON Path Label**: `$.title`
- **Fanout Parent Element**: `$.contact.tasks`
- **Note**: Path is relative to `tasks` (immediate parent), not `teamMembers`

#### Example 3b: Field in nested object within inner fanout
- **Field Selected**: `assignedTo` (inside `details` object within `tasks`)
- **JSON Path Label**: `$.details.assignedTo`
- **Fanout Parent Element**: `$.contact.tasks`

#### Example 3c: Field in outer fanout but outside inner fanout
- **Field Selected**: `email` (in `contact`, under `teamMembers` but outside `tasks`)
- **JSON Path Label**: `$.contact.email`
- **Fanout Parent Element**: `$.teamMembers`
- **Note**: Since `email` is not within `tasks`, its context is `teamMembers`

---

### Rule 4: Partial Fanout (Parent Selected, Child Not)
**Scenario**: User selected `teamMembers` for fanout but did NOT select `tasks` for fanout.

**Behavior**:
- Outer array (`teamMembers`) paths are relative
- Inner array (`tasks`) uses `[*]` notation since it's not a fanout

**Example**:
- **Field Selected**: `title` (inside `tasks`, but `tasks` NOT selected for fanout)
- **JSON Path Label**: `$.contact.tasks[*].title`
- **Fanout Parent Element**: `$.teamMembers`
- **Note**: `tasks[*]` notation is preserved because `tasks` is not a fanout array

---

### Rule 5: Partial Fanout (Child Selected, Parent Not)
**Scenario**: User selected `tasks` for fanout but did NOT select `teamMembers` for fanout.

**Behavior**:
- This scenario is typically invalid/prevented, as inner arrays cannot be fanout parents without their parent arrays being selected first
- If allowed by the system, treat as follows:

**Example**:
- **Field Selected**: `title` (inside `tasks`)
- **JSON Path Label**: `$.teamMembers[*].contact.tasks[*].title` *(full absolute path with all arrays marked)*
- **Fanout Parent Element**: `$.teamMembers[*].contact.tasks`
- **Note**: This scenario should ideally be prevented at Step 3 validation

---

## JSON Tree Display Behavior

### Tree Structure
- **No Change to Visual Display**: The JSON tree structure on Step 5 remains unchanged regardless of fanout selections
- Tree continues to show the hierarchical structure as-is
- Array notation `[0]`, `[1]`, etc., may be shown in the tree for visualization

### Path Generation
- **Click Handler**: When a user clicks on a field node in the tree:
  1. Determine if the field is within any fanout array(s)
  2. Apply the appropriate path resolution rule (Rules 1-5 above)
  3. Auto-populate the "Source Field (JSON Path)" input with the resolved path
  4. Auto-populate the "Fanout Parent Element" input with the appropriate fanout parent (if applicable)

---

## Implementation Requirements

### Data Structure
Store fanout selections from Step 3 in Vuex state:
```javascript
// In wizard store
{
  schemaRules: {
    fanoutArrays: [
      '$.teamMembers',
      '$.teamMembers[*].contact.tasks'
    ]
  }
}
```

### Path Resolution Algorithm

```javascript
function resolvePathForFanout(absolutePath, fanoutArrays) {
  // 1. Sort fanout arrays by depth (deepest first)
  const sortedFanouts = fanoutArrays.sort((a, b) => 
    b.split('.').length - a.split('.').length
  )
  
  // 2. Find the nearest fanout parent that contains this path
  let nearestFanout = null
  for (const fanout of sortedFanouts) {
    if (absolutePath.startsWith(fanout)) {
      nearestFanout = fanout
      break
    }
  }
  
  // 3. If no fanout parent found, return absolute path
  if (!nearestFanout) {
    return {
      jsonPath: absolutePath,
      fanoutParent: null
    }
  }
  
  // 4. Make path relative to fanout parent
  const relativePath = absolutePath.replace(nearestFanout, '$')
  
  // 5. Remove [*] notation for arrays that ARE in the fanout chain
  let cleanPath = relativePath
  for (const fanout of sortedFanouts) {
    if (relativePath.includes(fanout)) {
      cleanPath = cleanPath.replace(/\[\*\]/g, '')
    }
  }
  
  return {
    jsonPath: cleanPath,
    fanoutParent: nearestFanout
  }
}
```

### Component Updates

#### `Step5_Mapping.vue`
1. **Import fanout selections** from Vuex store (from Step 3)
2. **Enhance `handleTreeNodeClick(nodeData)`**:
   - Get absolute path from nodeData
   - Call `resolvePathForFanout(absolutePath, fanoutArrays)`
   - Set `mappingForm.inputRule` to resolved relative path
   - Set `mappingForm.fanoutParentElement` to fanout parent

#### `MappingService.js`
1. Add new method: `resolvePathForFanout(absolutePath, fanoutArrays)`
2. Add validation: `validateFanoutParentElement(fanoutParent, fanoutArrays)`

---

## Edge Cases

### Edge Case 1: Root-Level Array
- If the root element itself is an array selected for fanout (e.g., `$` is an array)
- Path: `$.fieldName`
- Fanout Parent: `$`

### Edge Case 2: Deeply Nested Fanouts (3+ levels)
- Follow nearest fanout parent rule
- Example: `teamMembers` → `tasks` → `subtasks` (all selected)
- Field in `subtasks`: Path relative to `subtasks`, fanout parent = `$.subtasks`

### Edge Case 3: Sibling Arrays
- If multiple sibling arrays exist and only one is fanout
- Non-fanout sibling arrays retain `[*]` notation

### Edge Case 4: Empty Fanout Selection
- If user selects an array for fanout then deselects it in Step 3
- Revert to absolute paths (Rule 1)

---

## Validation Rules

### At Step 5 Save Time
1. **Fanout Parent Existence**: If `fanoutParentElement` is set, it must match one of the fanout arrays from Step 3
2. **Path Consistency**: `inputRule` path must be within the `fanoutParentElement` scope
3. **Relative Path Validity**: Relative paths must resolve correctly when combined with fanout parent

---

## Testing Scenarios

### Test Case 1: No Fanout
- [ ] Map `projectName` → Path: `$.projectName`, Fanout: null
- [ ] Map `title` → Path: `$.teamMembers[*].contact.tasks[*].title`, Fanout: null

### Test Case 2: Single Fanout (teamMembers)
- [ ] Map `name` → Path: `$.name`, Fanout: `$.teamMembers`
- [ ] Map `email` → Path: `$.contact.email`, Fanout: `$.teamMembers`
- [ ] Map `title` → Path: `$.contact.tasks[*].title`, Fanout: `$.teamMembers`

### Test Case 3: Nested Fanout (teamMembers + tasks)
- [ ] Map `name` → Path: `$.name`, Fanout: `$.teamMembers`
- [ ] Map `title` → Path: `$.title`, Fanout: `$.contact.tasks`
- [ ] Map `assignedTo` → Path: `$.details.assignedTo`, Fanout: `$.contact.tasks`

### Test Case 4: Edit Existing Mapping
- [ ] Editing a mapping retains correct fanout parent and relative path
- [ ] Changing fanout selection in Step 3 updates existing mappings in Step 5

---

## Files to Modify

1. **`src/store/modules/wizard.js`**
   - Ensure fanout arrays are stored from Step 3
   - Add getter: `getFanoutArrays`

2. **`src/services/wizard/mappingService.js`**
   - Add: `resolvePathForFanout(absolutePath, fanoutArrays)`
   - Add: `validateFanoutParentElement(fanoutParent, fanoutArrays)`
   - Add: `convertAbsoluteToRelativePath(path, fanoutParent)`

3. **`src/components/wizard/steps/Step5_Mapping.vue`**
   - Import fanout arrays from store
   - Update `handleTreeNodeClick()` to call path resolution
   - Auto-populate fanout parent element field
   - Add validation for fanout consistency

4. **`src/components/wizard/components/JsonTreeViewer.vue`**
   - No changes needed (display remains the same)

---

## Expected Behavior Summary

| Fanout Selection | Field Location | JSON Path | Fanout Parent |
|------------------|----------------|-----------|---------------|
| None | `title` in `tasks` | `$.teamMembers[*].contact.tasks[*].title` | *(null)* |
| `teamMembers` | `name` in `teamMembers` | `$.name` | `$.teamMembers` |
| `teamMembers` | `title` in `tasks` (not fanout) | `$.contact.tasks[*].title` | `$.teamMembers` |
| `teamMembers` + `tasks` | `title` in `tasks` | `$.title` | `$.contact.tasks` |
| `teamMembers` + `tasks` | `assignedTo` in `details` | `$.details.assignedTo` | `$.contact.tasks` |

---

## Notes
- **Backward Compatibility**: Existing mappings without fanout arrays should continue to work with absolute paths
- **User Experience**: Auto-filling fanout parent element reduces user error and confusion
- **Validation**: Prevent saving mappings with mismatched fanout parents
- **Documentation**: Update user documentation to explain fanout path behavior
