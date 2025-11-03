# Nested Arrays Display Fix - Visual Diagram

## Problem: Before the Fix

```
Input Data (Root Array):
┌─────────────────────────────────────────────────────────────┐
│ [                                                           │
│   {                                                         │
│     "timestamp": "2025-10-24T12:00:00Z",                   │
│     "data": {                                              │
│       "users": [                        ← NESTED ARRAY    │
│         {                                                  │
│           "orders": [                   ← NESTED ARRAY    │
│             {                                              │
│               "items": [                ← NESTED ARRAY    │
│                 {                                          │
│                   "tags": ["..."]       ← NESTED ARRAY    │
│                 }                                          │
│               ]                                            │
│             }                                              │
│           ]                                                │
│         }                                                  │
│       ]                                                    │
│     }                                                      │
│   }                                                        │
│ ]                                                          │
└─────────────────────────────────────────────────────────────┘

Tree View Displayed:
┌─────────────────────────────────────────────────────────────┐
│ ▼ Array (3 items)                                          │
│   ├─ [0] Object { timestamp, event, data }                │
│   ├─ [1] Object { timestamp, event, data }                │
│   └─ [2] Object { timestamp, event, data }                │
│                                                             │
│ ❌ NO NESTED ARRAYS SHOWN!                                 │
│ ❌ CANNOT SELECT data.users                                │
│ ❌ CANNOT SELECT data.users[*].orders                      │
│ ❌ CANNOT SELECT data.users[*].orders[*].items            │
└─────────────────────────────────────────────────────────────┘
```

## Solution: After the Fix

```
Input Data (Root Array):
┌─────────────────────────────────────────────────────────────┐
│ [                                                           │
│   {                                                         │
│     "timestamp": "2025-10-24T12:00:00Z",                   │
│     "data": {                                              │
│       "users": [                        ← DETECTED!       │
│         {                                                  │
│           "orders": [                   ← DETECTED!       │
│             {                                              │
│               "items": [                ← DETECTED!       │
│                 {                                          │
│                   "tags": ["..."]       ← DETECTED!       │
│                 }                                          │
│               ]                                            │
│             }                                              │
│           ]                                                │
│         }                                                  │
│       ]                                                    │
│     }                                                      │
│   },                                                       │
│   {...}, {...}                                             │
│ ]                                                          │
└─────────────────────────────────────────────────────────────┘

Processing Steps:
┌─────────────────────────────────────────────────────────────┐
│ 1. Detect Root is Array                                    │
│    ✓ isRootArray = true                                    │
│                                                             │
│ 2. Extract First Element Structure                         │
│    ✓ sourceData = data[0]                                  │
│                                                             │
│ 3. Find All Array Paths                                    │
│    ✓ [0].data.users                                        │
│    ✓ [0].data.users[0].orders                             │
│    ✓ [0].data.users[0].orders[0].items                    │
│    ✓ [0].data.users[0].orders[0].items[0].tags            │
│                                                             │
│ 4. Normalize Paths (Remove [0]. prefix)                   │
│    ✓ data.users                                            │
│    ✓ data.users[0].orders                                 │
│    ✓ data.users[0].orders[0].items                        │
│    ✓ data.users[0].orders[0].items[0].tags                │
│                                                             │
│ 5. Build Hierarchical Structure                            │
│    ✓ Create data object                                    │
│    ✓ Add users array                                       │
│    ✓ Add orders array (nested in users[0])               │
│    ✓ Add items array (nested in orders[0])               │
│    ✓ Add tags array (nested in items[0])                 │
└─────────────────────────────────────────────────────────────┘

Tree View Displayed:
┌─────────────────────────────────────────────────────────────┐
│ ▼ root Object                                               │
│   └─▼ data Object                                          │
│       ├─☐ users Array (2 items)                           │
│       │   └─▼ [0] Object                                   │
│       │       ├── id: 1                                    │
│       │       ├── name: "Manish Bhatnagar"                 │
│       │       ├── email: "manish@example.com"              │
│       │       └─☐ orders Array (2 items)                  │
│       │           └─▼ [0] Object                           │
│       │               ├── orderId: "ORD1001"               │
│       │               ├── date: "2025-10-20"               │
│       │               └─☐ items Array (1 item)            │
│       │                   └─▼ [0] Object                   │
│       │                       ├── productId: "P101"        │
│       │                       ├── name: "Laptop"           │
│       │                       ├── quantity: 1              │
│       │                       └─☐ tags Array (2 items)    │
│       │                           ├── [0] "electronics"    │
│       │                           └── [1] "computers"      │
│       └── metadata Object                                  │
│           ├── totalUsers: 2                                │
│           └── syncTime: "2025-10-24T12:00:00Z"             │
│                                                             │
│ ✅ ALL NESTED ARRAYS SHOWN!                                │
│ ✅ CAN SELECT data.users                                   │
│ ✅ CAN SELECT data.users[0].orders                         │
│ ✅ CAN SELECT data.users[0].orders[0].items               │
│ ✅ CAN SELECT data.users[0].orders[0].items[0].tags       │
└─────────────────────────────────────────────────────────────┘
```

## Code Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    JsonTreeViewer.vue                        │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  props.data (Root Array)              │
        │  [{ obj1 }, { obj2 }, { obj3 }]       │
        └───────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
    ┌─────────────────────┐  ┌─────────────────────┐
    │   arrayPaths        │  │  processedData      │
    │   computed()        │  │  computed()         │
    └─────────────────────┘  └─────────────────────┘
                │                       │
                │                       ▼
                │            ┌─────────────────────┐
                │            │ selectionMode ==    │
                │            │ 'array'?            │
                │            └─────────────────────┘
                │                       │
                │                   YES │
                │                       ▼
                │            ┌─────────────────────────────┐
                │            │  filterToArraysOnly()       │
                │            │  • Detect root is array     │
                │            │  • Extract data[0]          │
                │            │  • Normalize paths          │
                │            │  • Build hierarchy          │
                │            └─────────────────────────────┘
                │                       │
                ▼                       ▼
    ┌─────────────────────┐  ┌─────────────────────┐
    │ normalizedArrayPaths│  │ Filtered data       │
    │ computed()          │  │ { data: { users:... │
    └─────────────────────┘  └─────────────────────┘
                │                       │
                └───────────┬───────────┘
                            │
                            ▼
            ┌─────────────────────────────────┐
            │      JsonTreeNode Component     │
            │  Receives:                      │
            │  • :node="processedData"        │
            │  • :array-paths=                │
            │    "normalizedArrayPaths"       │
            └─────────────────────────────────┘
                            │
                            ▼
            ┌─────────────────────────────────┐
            │   Recursively Renders Tree      │
            │   • Shows nested structure      │
            │   • Adds checkboxes to arrays   │
            │   • Emits selection events      │
            └─────────────────────────────────┘
```

## Key Functions

### 1. filterToArraysOnly() - Enhanced

```javascript
BEFORE:
┌────────────────────────────────────────────────────┐
│ function filterToArraysOnly(data, arrayPaths) {   │
│   const filtered = {}                             │
│   for (const path of arrayPaths) {                │
│     const value = getFieldValueByPath(data, path) │
│     if (Array.isArray(value)) {                   │
│       setFieldValueByPath(filtered, path, value)  │
│     }                                              │
│   }                                                │
│   return filtered                                  │
│ }                                                  │
│                                                    │
│ ❌ Problem: Doesn't handle root arrays            │
│ ❌ Problem: Paths include [0]. prefix             │
└────────────────────────────────────────────────────┘

AFTER:
┌────────────────────────────────────────────────────┐
│ function filterToArraysOnly(data, arrayPaths) {   │
│   // Detect root array                            │
│   const isRootArray = Array.isArray(data)         │
│   const sourceData = isRootArray ? data[0] : data │
│                                                    │
│   // Normalize paths                              │
│   const normalizedPaths = arrayPaths.map(p => {   │
│     return p.replace(/^\[\d+\]\.?/, '')          │
│   })                                               │
│                                                    │
│   // Build hierarchy                              │
│   const filtered = {}                             │
│   for (const path of normalizedPaths) {           │
│     const value = getFieldValueByPath(            │
│       sourceData, path                            │
│     )                                              │
│     if (Array.isArray(value)) {                   │
│       setFieldValueByPath(filtered, path, value)  │
│     }                                              │
│   }                                                │
│   return filtered                                  │
│ }                                                  │
│                                                    │
│ ✅ Handles root arrays                            │
│ ✅ Normalizes paths                               │
│ ✅ Builds proper hierarchy                        │
└────────────────────────────────────────────────────┘
```

### 2. normalizedArrayPaths - New Computed Property

```javascript
┌────────────────────────────────────────────────────┐
│ const normalizedArrayPaths = computed(() => {     │
│   const isRootArray = Array.isArray(props.data)   │
│   if (!isRootArray) return arrayPaths.value       │
│                                                    │
│   // Remove [0]. prefix for display               │
│   return arrayPaths.value.map(path => {           │
│     return path.replace(/^\[\d+\]\.?/, '')       │
│   }).filter(p => p.trim() !== '')                 │
│ })                                                 │
│                                                    │
│ Input:  ["[0].data.users", "[0].data.users[0].."] │
│ Output: ["data.users", "data.users[0].orders"]    │
└────────────────────────────────────────────────────┘
```

## Selection Flow

```
User Interaction:
┌─────────────────────────────────────────────────┐
│ User clicks checkbox next to "users" array      │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ JsonTreeNode emits select-field event           │
│ • path: "data.users"                            │
│ • type: "array"                                 │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ JsonTreeViewer.selectField()                    │
│ • Updates selectedPaths                         │
│ • Emits update:selected                         │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ Step3_SchemaConfig.handleArraySelection()       │
│ • Updates selectedFanoutFields                  │
│ • Adds "data.users" to selection list           │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ User proceeds to next step                      │
│ SchemaRuleService.buildChildFanouts()           │
│ • Creates fanout configuration                  │
│ • Stores in Vuex                                │
└─────────────────────────────────────────────────┘
```

## Result

**Before Fix:**
- Only root array visible
- No nested arrays selectable
- Poor user experience

**After Fix:**
- All nested arrays visible
- Proper hierarchical display
- Checkbox for each array
- Correct paths for fanout processing
- Better user experience
