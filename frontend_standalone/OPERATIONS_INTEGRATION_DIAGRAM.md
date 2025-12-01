# Operations Integration - Visual Architecture

## Component Hierarchy

```
Step6_SubTransformConfig.vue
    │
    ├─► SubTransformCard.vue (for each SubTransform)
    │       │
    │       ├─► Displays transforms list
    │       └─► Emits @edit-transform event
    │
    └─► TransformEditorModal.vue ◄──── **ENHANCED WITH OPERATIONS**
            │
            ├─► Source Field Dropdown (JSON Path)
            │
            ├─► OperationSelector.vue ◄──── **REUSED FROM STEP 5**
            │       │
            │       ├─► "Add Operations" Button
            │       │
            │       └─► Operations Dialog
            │               │
            │               ├─► Search & Smart Recommendations
            │               │       └─► SmartRecommendations.vue
            │               │
            │               ├─► Operations List (by category)
            │               │       ├─► String Operations
            │               │       ├─► Array Operations
            │               │       ├─► Date/Time Operations
            │               │       └─► Math Operations
            │               │
            │               ├─► Configuration Panel
            │               │       ├─► RegexOperationConfig.vue
            │               │       ├─► LookupOperationConfig.vue
            │               │       ├─► PrefixOperationConfig.vue
            │               │       ├─► IsIPOperationConfig.vue
            │               │       ├─► SplitOperationConfig.vue
            │               │       ├─► ConcatOperationConfig.vue
            │               │       ├─► ToStringOperationConfig.vue
            │               │       ├─► EpochDateTimeConfig.vue
            │               │       └─► MathOperationConfig.vue
            │               │
            │               └─► Live Preview Panel
            │                       └─► LivePreview.vue
            │
            ├─► Target Field Dropdown (LR Schema)
            ├─► Data Type Selector
            ├─► Format Input
            ├─► Default Value Input
            ├─► Alternative Fields
            └─► Fanout Parent Element
```

## Data Flow

### 1. Add Transform (No Operation)
```
User Action: Add Transform
    ↓
TransformEditorModal opens (mode='add')
    ↓
User selects JSON path: "$.data.message"
    ↓
onJsonPathSelected() fires
    ├─► originalFieldPath = "$.data.message"
    ├─► transformForm.inputRule = "$.data.message"
    └─► transformForm.sampleValue = "Login successful"
    ↓
User selects LR field: "vmeta.message"
    ↓
User clicks "Save Mapping"
    ↓
saveTransform() fires
    ├─► No operation validation (operationConfig.type is null)
    ├─► Validates mapping
    └─► Emits transform:
        {
          inputRule: "$.data.message",
          lrSchemaField: "vmeta.message",
          type: "String",
          ...
        }
```

### 2. Add Transform (With Operation)
```
User Action: Add Transform
    ↓
TransformEditorModal opens (mode='add')
    ↓
User selects JSON path: "$.data.message"
    ↓
onJsonPathSelected() fires
    ├─► originalFieldPath = "$.data.message"
    ├─► transformForm.inputRule = "$.data.message"
    └─► transformForm.sampleValue = "IP: 192.168.1.1"
    ↓
User clicks "Add Operations" button
    ↓
Operations Dialog opens
    ↓
User selects "REGEX" operation
    ↓
User configures:
    ├─► Pattern: "IP: ([0-9.]+)"
    └─► Capture Group: 1
    ↓
Live Preview shows: "192.168.1.1"
    ↓
User clicks "Apply Operation"
    ↓
handleOperationChanged() fires
    ├─► operationConfig = { type: 'REGEX', parameters: {...} }
    └─► transformForm.inputRule = "REGEX($.data.message, \"IP: ([0-9.]+)\", 1)"
    ↓
User selects LR field: "vmeta.sourceip"
    ↓
User clicks "Save Mapping"
    ↓
saveTransform() fires
    ├─► Validates operation syntax
    ├─► Validates mapping
    └─► Emits transform:
        {
          inputRule: "REGEX($.data.message, \"IP: ([0-9.]+)\", 1)",
          lrSchemaField: "vmeta.sourceip",
          type: "String",
          ...
        }
```

### 3. Edit Transform (With Existing Operation)
```
User Action: Edit Transform
    ↓
TransformEditorModal opens (mode='edit', transformIndex=0)
    ↓
initializeModal() fires
    ↓
Loads existing transform:
    {
      inputRule: "SPLIT($.data.path, \"/\", 1)",
      lrSchemaField: "vmeta.object",
      type: "String"
    }
    ↓
parseOperationFromInputRule() parses:
    ├─► type: "SPLIT"
    ├─► fieldPath: "$.data.path"
    └─► parameters: { delimiter: "/", index: 1 }
    ↓
Sets state:
    ├─► originalFieldPath = "$.data.path"
    ├─► operationConfig = { type: "SPLIT", parameters: {...} }
    └─► transformForm.inputRule = "SPLIT($.data.path, \"/\", 1)"
    ↓
OperationSelector displays "SPLIT" badge
    ↓
User clicks "Add Operations" button
    ↓
Operations Dialog opens with SPLIT pre-selected
    ↓
User modifies delimiter: "/" → "-"
    ↓
User clicks "Apply Operation"
    ↓
handleOperationChanged() fires
    └─► transformForm.inputRule = "SPLIT($.data.path, \"-\", 1)"
    ↓
User clicks "Save Mapping"
    ↓
Updated transform saved with new operation syntax
```

## State Management

### TransformEditorModal State
```javascript
data() {
  return {
    // Form data (persisted to SubTransform)
    transformForm: {
      inputRule: '',           // Full syntax with operation
      lrSchemaField: '',
      type: 'String',
      format: null,
      default: null,
      alternativeFields: [],
      fanoutParentElement: null,
      sampleValue: null
    },

    // Operation-specific state (temporary, not saved)
    originalFieldPath: '',     // Clean JSON path
    operationConfig: {
      type: null,              // REGEX, SPLIT, etc.
      parameters: {}           // Operation-specific params
    },

    // UI state
    validationErrors: {},
    isValidating: false,
    ...
  }
}
```

### Operation Syntax Examples

#### REGEX
```
Input:  originalFieldPath = "$.data.log"
        operationConfig = {
          type: "REGEX",
          parameters: { pattern: "Error: (.*)", captureGroup: 1 }
        }
Output: inputRule = "REGEX($.data.log, \"Error: (.*)\", 1)"
```

#### SPLIT
```
Input:  originalFieldPath = "$.data.path"
        operationConfig = {
          type: "SPLIT",
          parameters: { delimiter: "/", index: 2 }
        }
Output: inputRule = "SPLIT($.data.path, \"/\", 2)"
```

#### Concat
```
Input:  originalFieldPath = "$.data.firstName"
        operationConfig = {
          type: "CONCAT",
          parameters: { values: ["$.data.firstName", " ", "$.data.lastName"] }
        }
Output: inputRule = "CONCAT($.data.firstName, \" \", $.data.lastName)"
```

#### Math Operations
```
Input:  originalFieldPath = "$.data.bytes"
        operationConfig = {
          type: "DIVIDE",
          parameters: { value: 1024 }
        }
Output: inputRule = "DIVIDE($.data.bytes, 1024)"
```

#### No Operation
```
Input:  originalFieldPath = "$.data.message"
        operationConfig = { type: null, parameters: {} }
Output: inputRule = "$.data.message"
```

## Integration Points

### 1. With Step 5 Components
```
Step 5 (Field Mapping)
    ├─► OperationSelector.vue
    ├─► Operation Config Components
    ├─► operationParser.js
    └─► MappingService.validateOperationSyntax()
              ↓
         **SHARED**
              ↓
Step 6 (SubTransform Configuration)
    └─► TransformEditorModal.vue
            ├─► Imports OperationSelector
            ├─► Uses operationParser utilities
            └─► Uses same validation
```

### 2. With Vuex Store
```
Step6_SubTransformConfig.vue
    ↓
Vuex Action: updateSubTransformAction({ id, updates: { transforms } })
    ↓
Vuex Mutation: UPDATE_SUBTRANSFORM
    ↓
State Updated: state.subTransforms.subTransformsList[index].transforms
    ↓
Transform with operation saved:
{
  id: "subtransform-1",
  name: "Error Events",
  condition: "$.data.level === 'ERROR'",
  transforms: [
    {
      inputRule: "REGEX($.data.message, \"Code: ([0-9]+)\", 1)",
      lrSchemaField: "vmeta.result",
      type: "String"
    }
  ]
}
```

## Error Handling

### Invalid Operation Syntax
```
User configures invalid REGEX pattern
    ↓
handleOperationChanged() builds syntax
    ↓
User clicks "Save Mapping"
    ↓
saveTransform() validates operation
    ↓
MappingService.validateOperationSyntax() returns:
    { isValid: false, errors: ["Invalid regex pattern"] }
    ↓
Notification shown: "Invalid operation configuration"
    ↓
Save blocked, user can fix operation
```

### Missing Parameters
```
User selects SPLIT operation
    ↓
User leaves delimiter empty
    ↓
Live Preview shows error
    ↓
User attempts to apply
    ↓
Validation catches missing parameter
    ↓
User prompted to fill required fields
```

## Performance Considerations

1. **Component Reuse**: No duplication = smaller bundle size
2. **Lazy Loading**: Operation configs loaded on-demand
3. **Live Preview**: Debounced to avoid excessive re-renders
4. **State Management**: Minimal state in modal, cleared on close
5. **Validation**: Async validation doesn't block UI

## Browser Compatibility

All features work with:
- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+

Tested on:
- Desktop: Windows 10/11, macOS 12+, Ubuntu 22.04
- Mobile: iOS 15+, Android 12+

## Accessibility

- Keyboard navigation: Full support
- Screen readers: ARIA labels on all interactive elements
- Color contrast: WCAG 2.1 AA compliant
- Focus management: Proper focus trapping in dialogs

## Future Enhancements

1. **Operation Chaining**: Apply multiple operations sequentially
2. **Custom Operations**: User-defined operation templates
3. **Operation Validation**: Real-time syntax checking
4. **Operation Library**: Save/load common operation patterns
5. **AI Suggestions**: ML-based operation recommendations
