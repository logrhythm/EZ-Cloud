# LogRhythm JSON Policy Builder Wizard Implementation Plan

## 1. Overall Architecture

### Component Hierarchy
```
WizardContainer
├── WizardNavigation (progress, prev/next buttons)
├── WizardStepContainer (dynamic content area)
│   ├── Step1_Introduction
│   ├── Step2_Dataupload
│   ├── Step3_SchemaRuleCreation_toJson
│   ├── Step4_SchemaRuleCreation_Fanout
│   ├── Step5_FilterCreation
│   ├── Step6_MappingCreation
│   └── Step7_Review_and_Export
└── WizardActions (export, exit, help)
```

### State Management
- Create a dedicated Vuex module for wizard state
- Track completion status of each step
- Persist policy data between steps
- Enable save/resume functionality

### Integration Points
- `mixin-Shared-BuildSmaPolicy.js` for policy generation
- `MappingEdit.vue` for reusing existing JSON processing functionality

## 2. File Structure

```
/src
├── components
│   └── wizard
│       ├── WizardContainer.vue          # Main wizard component
│       ├── WizardNavigation.vue         # Navigation and progress tracking
│       ├── WizardStepContainer.vue      # Dynamic step content renderer
│       ├── WizardActions.vue            # Action buttons (save, exit, etc.)
│       └── steps
│           ├── Step1_Introduction.vue   # Introduction and mode selection
│           ├── Step2_Dataupload.vue     # JSON data input
│           ├── Step3_ToJson.vue         # Schema rules for JSON conversion
│           ├── Step4_Fanout.vue         # Schema rules for arrays
│           ├── Step5_Filter.vue         # Filter rule creation
│           ├── Step6_Mapping.vue        # Schema mapping
│           └── Step7_Export.vue         # Review and export
├── mixins
│   └── mixin-Wizard-State.js           # Shared wizard state methods
└── store
    └── wizard-module.js                # Vuex module for wizard state
```

## 3. UI/UX Design for Each Step

### General UI Elements
- **Progress Indicator**: Horizontal stepper showing completed and current steps
- **Navigation Controls**: Back/Next buttons with conditional disabling
- **Help Panel**: Context-sensitive help with expandable sections
- **Mode Toggle**: Create/Update switch for mode selection
- **Consistent Layout**: Maintain consistent spacing, typography and controls

### Step 1: Introduction & Project Setup

**UI Components:**
- Welcome message explaining wizard purpose
- Project metadata input fields (name, description)
- Mode selection (Create/Update) with radio buttons
- File upload zone for existing policies (in Update mode)

**User Flow:**
1. User enters project name and description
2. User selects Create or Update mode
3. If Update is selected, user is prompted to upload existing policy
4. User clicks Next to proceed

**Technical Implementation:**
```javascript
// Vuex state for Step 1
{
  projectName: '',
  projectDescription: '',
  wizardMode: 'create', // or 'update'
  existingPolicy: null, // for update mode
}
```

### Step 2: Sample Data Input

**UI Components:**
- Tab interface for different input methods:
  - Single JSON log input (textarea)
  - Multiple logs input (textarea with one JSON per line)
  - File upload for JSON files
- JSON validation with error highlighting
- Preview of parsed structure

**User Flow:**
1. User selects input method
2. User provides JSON data
3. System validates JSON format
4. Preview shows parsed structure
5. User clicks Next to process data

**Technical Implementation:**
- Reuse existing JSON parsing logic from MappingEdit.vue
- Add JSON structure visualization
- Store parsed data in Vuex state

### Step 3: Schema Rule Configuration (Convert to JSON)

**UI Components:**
- JSON structure visualization with selectable fields
- Checkboxes for stringified JSON fields
- Visual indication of nested stringified JSON
- Preview of parsed results

**User Flow:**
1. System automatically detects potential stringified JSON fields
2. User selects fields to convert to JSON
3. System shows preview of converted structure
4. User clicks Next to proceed

**Technical Implementation:**
```javascript
// Schema rule data structure
{
  schemaRule: {
    convertoJson: ["$.field1", "$.field2.subfield"]
  }
}
```

### Step 4: Schema Rule Configuration (Fanout)

**UI Components:**
- Hierarchical view of JSON structure with array elements highlighted
- Checkboxes for selecting arrays for fanout
- Visual indication of array hierarchy
- Preview of schema rules

**User Flow:**
1. System automatically detects array elements
2. User selects arrays for fanout processing
3. System generates schema rules with proper parent relationships
4. User clicks Next to proceed

**Technical Implementation:**
```javascript
// Generated schema rules
{
  schemaRule: {
    childfanouts: [
      {
        field: "$.path.to.array[*]",
        parentpath: null
      },
      {
        field: "$.nested.array[*]",
        parentpath: "$.parent.array[*]"
      }
    ]
  }
}
```

### Step 5: Filter Rule Configuration

**UI Components:**
- JSON field selector for creating filter conditions
- AND/OR condition builder interface
- Value selector with suggested values from sample data
- Preview of generated filter expressions

**User Flow:**
1. User selects fields to include in filter
2. User defines conditions and values
3. System generates filter expression
4. User clicks Next to proceed

**Technical Implementation:**
```javascript
// Filter expression example
{
  filter: "@.@metadata.beat == 'eventhubbeat' && @.response.category =='FrontDoorAccessLog'"
}
```

### Step 6: Schema Mapping Creation

**UI Components:**
- Table-based interface similar to existing JSON Mapping tab
- Mapping dropdown for selecting LogRhythm schema fields
- Operation dropdown for transformation options
- Format options for data formatting
- Alternative field selection for fallbacks

**User Flow:**
1. User selects JSON fields to map
2. User assigns LogRhythm schema fields to each
3. User configures operations, formatting and alternatives
4. User clicks Next to proceed

**Technical Implementation:**
```javascript
// Mapping entry example
{
  inputRule: "$.source.field.path",
  LRSchemaField: "normalized_field_name",
  type: "String",
  default: null,
  alternativeFields: ["$.backup.field.path"],
  format: null,
  FanoutParentElement: "$.path.to.array[*]"
}
```

### Step 7: Review & Export

**UI Components:**
- Complete JSON policy preview with syntax highlighting
- Collapsible sections for each component
- Export options (download, clipboard, implementation)
- Success confirmation message

**User Flow:**
1. User reviews complete policy
2. User selects export method
3. System generates and delivers policy file
4. User completes wizard process

**Technical Implementation:**
- Use mixin-Shared-BuildSmaPolicy.js to generate final policy
- Implement export functionality similar to existing exportSmaPolicy method

## 4. Implementation Roadmap

### Phase 1: Core Framework (2 weeks)
- Create basic component structure
- Implement wizard navigation and state management
- Create mode toggle functionality
- Set up basic layout and styling

### Phase 2: Step Implementation (3 weeks)
- Implement each step component
- Connect to existing JSON processing logic
- Create validation rules
- Build data transformations between steps

### Phase 3: UX Refinement (2 weeks)
- Implement contextual help system
- Improve visual design and transitions
- Optimize common user paths
- Implement accessibility features

### Phase 4: Testing & Optimization (2 weeks)
- Conduct usability testing
- Implement performance optimizations
- Refine based on user feedback
- Create documentation

## 5. Technical Considerations

### State Persistence
- Use localStorage for saving in-progress wizard state
- Implement auto-save at each step completion
- Create restore functionality when wizard is reopened

### Validation Strategy
- Implement validation at each step
- Prevent navigation to next step if validation fails
- Provide clear error messages and recovery guidance
- If users upload files, validate and sanitize inputs to prevent injection or malicious payloads.

### Performance Optimization
- Lazy-load step components as needed
- Optimize JSON parsing for large datasets
- Cache processed data to prevent redundant calculations
- For very large JSON files, consider web workers for parsing to avoid UI blocking.

### Error Handling
- Implement comprehensive error catching
- Provide user-friendly error messages
- Include recovery options for common errors
- In addition to error messages, consider “undo” or “reset step” options for users who make mistakes.

## 6. Integration with Existing Code

### MappingEdit.vue Integration
- Reuse existing JSON parsing and processing functions
- Adapt the visual representation of JSON structure
- Connect to the existing mapping functionality

### BuildSmaPolicy.js Integration
- Leverage existing policy generation logic
- Ensure compatibility with wizard-generated configurations
- Adapt to support the step-by-step approach

## 7. Future Enhancements

### Templates
- Save commonly used configurations as templates
- Create a template library for different data sources
- Implement template import/export functionality

### Advanced Mode
- Create an "Advanced Mode" toggle to reveal additional options
- Allow direct editing of generated JSON code
- Provide syntax validation for manually edited code

### Collaboration Features
- Enable sharing of in-progress configurations
- Implement comment functionality for team collaboration
- Create version history tracking