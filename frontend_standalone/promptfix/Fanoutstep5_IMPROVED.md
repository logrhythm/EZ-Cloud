# Step 6 Mapping: Fanout Array Path Resolution on Add field mapping pop up in Json Filed Drop down

## Overview
This specification defines how JSON paths and fanout parent elements should be displayed and populated in Step 6 ( Add field mapping pop up) based on the fanout array selections made in Step 3 (Schema Rules).

## Background
When users select arrays for "fanout" processing in Step 3, it affects how JSON paths are constructed in Step 6. Fanout arrays are parent arrays that will be iterated over to generate multiple log events. Fields within or below fanout arrays should have their paths adjusted to be relative to the nearest fanout parent.

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
