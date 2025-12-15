# Scenario 1: Flow Diagram

## Pre-fill Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Uploads Policy File                     │
│                    (Update Mode - Step 1)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              User Uploads Sample Data (Step 2)                  │
│              Sample Data Parsed: parsedData                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│          User Navigates to Step 3 (Schema Config)               │
│          mounted() hook checks for Update mode                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              prefillFromPolicy(schemaRule) Called               │
│              Extract: convertoJson: ["$.log", "$.metadata"]     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                   ┌─────────┴─────────┐
                   │                   │
                   ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │   For $.log      │  │  For $.metadata  │
        │                  │  │                  │
        │ checkFieldExists │  │ checkFieldExists │
        │ InSampleData()   │  │ InSampleData()   │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 ▼                     ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ Sample Data:     │  │ Sample Data:     │
        │ { message: ... } │  │ { message: ... } │
        │                  │  │                  │
        │ Has $.log? NO ❌ │  │ Has $.metadata?  │
        │                  │  │ NO ❌            │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 ▼                     ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ Mark as MISSING  │  │ Mark as MISSING  │
        │                  │  │                  │
        │ Add to:          │  │ Add to:          │
        │ missingPolicy    │  │ missingPolicy    │
        │ Fields[]         │  │ Fields[]         │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 └─────────┬───────────┘
                           │
                           ▼
        ┌────────────────────────────────────┐
        │ Add to convertToJsonCandidates[]   │
        │ (so they can be displayed in UI)   │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │ Add to selectedConvertToJsonFields │
        │ (checkbox will be checked)         │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │    Skip parsing (field missing)    │
        │    No nested arrays to discover    │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │         Store in Vuex State        │
        │  - selectedConvertToJsonFields     │
        │  - missingPolicyFields             │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │      Show Warning Notification     │
        │ "2 fields not found in sample data"│
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │          Render UI with            │
        │       Warning Indicators           │
        └────────────────────────────────────┘
```

## UI Rendering Flow

```
Step 3: Convert to JSON Section
┌───────────────────────────────────────────────────────────────┐
│ Available Fields (2)                    [Select fields to...] │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ☑️ $.log  ⚠️                            [missing]    │   │
│  │    ℹ️ Not found in current sample data              │   │
│  │    (Tooltip: "This field is defined in the policy...)│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ☑️ $.metadata  ⚠️                       [missing]    │   │
│  │    ℹ️ Not found in current sample data              │   │
│  │    (Tooltip: "This field is defined in the policy...)│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ Selected Fields (2)                         [Clear All]       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ $.log  ⚠️                                        [🗑️] │   │
│  │ Not found in current sample data                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ $.metadata  ⚠️                                   [🗑️] │   │
│  │ Not found in current sample data                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      Upload Phase                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Policy File                    Sample Data                 │
│  ┌─────────────────┐           ┌──────────────────┐        │
│  │ {               │           │ {                │        │
│  │   schemaRule: { │           │   "message": ... │        │
│  │     convertoJson│           │ }                │        │
│  │     ["$.log"]   │           └──────────────────┘        │
│  │   }             │                                        │
│  │ }               │                                        │
│  └─────────────────┘                                        │
│         │                              │                    │
│         └──────────────┬───────────────┘                    │
│                        │                                    │
│                        ▼                                    │
├──────────────────────────────────────────────────────────────┤
│                   Validation Phase                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  checkFieldExistsInSampleData("$.log")                      │
│                                                              │
│  Sample Data: { "message": "..." }                         │
│  Looking for: "log"                                         │
│  Result: NOT FOUND ❌                                       │
│                                                              │
│         │                                                   │
│         ▼                                                   │
├──────────────────────────────────────────────────────────────┤
│                   Tracking Phase                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  missingPolicyFields = [                                    │
│    {                                                        │
│      type: "convertoJson",                                  │
│      path: "$.log",                                         │
│      message: "Field defined in policy but not found..."    │
│    }                                                        │
│  ]                                                          │
│                                                              │
│         │                                                   │
│         ▼                                                   │
├──────────────────────────────────────────────────────────────┤
│                   Display Phase                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  convertToJsonCandidates = ["$.log"]  // Added for display │
│  selectedConvertToJsonFields = ["$.log"]  // Checkbox on   │
│                                                              │
│  Template checks: isFieldMissing("$.log") → true           │
│                                                              │
│  Renders:                                                   │
│  - Warning icon ⚠️                                          │
│  - Warning badge [missing]                                  │
│  - Warning caption                                          │
│  - Tooltip with explanation                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Method Call Sequence

```
┌──────────────────────────────────────────────────────────────┐
│                    Component Lifecycle                       │
└──────────────────────────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │    created()    │
                    │  - Load from    │
                    │    Vuex store   │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │    mounted()    │
                    │  - Check mode   │
                    └────────┬────────┘
                             │
                             ▼
                   ┌─────────────────┐
                   │ mode='update'?  │
                   └────┬────────┬───┘
                        │ YES    │ NO
                        │        └──────→ (Normal Create flow)
                        ▼
            ┌─────────────────────────┐
            │ prefillFromPolicy()     │
            │  - Extract convertoJson │
            └───────────┬─────────────┘
                        │
            ┌───────────┴───────────┐
            │ For each field path:  │
            ├───────────────────────┤
            │                       │
            │ checkFieldExists      │
            │ InSampleData(path)    │
            │        │              │
            │        ▼              │
            │  ┌──────────┐         │
            │  │ Exists?  │         │
            │  └────┬─────┘         │
            │   YES │ NO            │
            │       │ │             │
            │       │ └──→ Add to   │
            │       │    missing[]  │
            │       │               │
            │       └──→ Normal     │
            │          processing   │
            │                       │
            └───────────┬───────────┘
                        │
            ┌───────────┴───────────┐
            │ Update component data:│
            ├───────────────────────┤
            │ - missingPolicyFields │
            │ - convertToJson       │
            │   Candidates          │
            │ - selectedConvertTo   │
            │   JsonFields          │
            └───────────┬───────────┘
                        │
            ┌───────────┴───────────┐
            │ Update Vuex store     │
            └───────────┬───────────┘
                        │
            ┌───────────┴───────────┐
            │ Force UI update:      │
            │ - $nextTick()         │
            │ - $forceUpdate()      │
            └───────────┬───────────┘
                        │
            ┌───────────┴───────────┐
            │ Show notification     │
            └───────────────────────┘
```

## Template Rendering Logic

```
v-for="field in convertToJsonCandidates"
        │
        ▼
  ┌─────────────────┐
  │ Render q-item   │
  └────────┬────────┘
           │
    ┌──────┴──────┐
    │  Checkbox   │
    │ (v-model)   │
    └──────┬──────┘
           │
    ┌──────┴──────────────┐
    │  Field Label        │
    │  {{ field }}        │
    └──────┬──────────────┘
           │
    ┌──────┴──────────────────────────┐
    │ v-if="isFieldMissing(field)"    │
    │         │                        │
    │         ▼                        │
    │  YES → Show warning icon ⚠️     │
    │         with tooltip             │
    │         │                        │
    │  NO  → Skip                      │
    └──────┬──────────────────────────┘
           │
    ┌──────┴──────────────────────────┐
    │ Caption:                        │
    │ v-if="!isFieldMissing(field)"   │
    │  → "Contains stringified JSON"  │
    │ v-else                          │
    │  → "Not found in sample data"   │
    └──────┬──────────────────────────┘
           │
    ┌──────┴──────────────────────────┐
    │ Badge:                          │
    │ v-if="!isFieldMissing(field)"   │
    │  → [string] (primary color)     │
    │ v-else                          │
    │  → [missing] (warning color)    │
    └─────────────────────────────────┘
```

## State Management

```
┌────────────────────────────────────────────────────────────┐
│                   Component State (data)                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  selectedConvertToJsonFields: ["$.log", "$.metadata"]     │
│      ↑                                                     │
│      │ User can modify (check/uncheck)                    │
│      │                                                     │
│  missingPolicyFields: [                                   │
│    { type: "convertoJson", path: "$.log", ... },         │
│    { type: "convertoJson", path: "$.metadata", ... }     │
│  ]                                                         │
│      ↑                                                     │
│      │ Populated during prefillFromPolicy()               │
│      │ Used by isFieldMissing() for display               │
│                                                            │
│  convertToJsonCandidates: ["$.log", "$.metadata"]         │
│      ↑                                                     │
│      │ Contains ALL fields (existing + missing)           │
│      │ Used in v-for to render checkboxes                 │
│                                                            │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│                   Vuex Store State                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  schemaRules: {                                           │
│    convertToJson: ["$.log", "$.metadata"],               │
│    fanout: [...],                                         │
│    childfanouts: [...]                                    │
│  }                                                         │
│      ↑                                                     │
│      │ Updated by UPDATE_SCHEMA_RULES mutation            │
│      │ Persisted across navigation                        │
│                                                            │
│  policyUpload: {                                          │
│    uploadedPolicyData: {                                  │
│      schemaRule: {                                        │
│        convertoJson: ["$.log", "$.metadata"]             │
│      }                                                     │
│    }                                                       │
│  }                                                         │
│      ↑                                                     │
│      │ Source of truth for policy data                    │
│                                                            │
│  sampleData: {                                            │
│    parsedData: { message: "..." }                        │
│  }                                                         │
│      ↑                                                     │
│      │ Used by checkFieldExistsInSampleData()             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Legend

```
✅ = Success / Field exists
❌ = Failure / Field missing
⚠️ = Warning icon
[missing] = Warning badge
[string] = Normal badge
ℹ️ = Info icon
🗑️ = Delete button
☑️ = Checked checkbox
```
