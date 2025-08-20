# Wizard-Type User Experience Prompt for LogRhythm JSON Policy Builder

## Background
The LogRhythm JSON Policy Builder is a Vue.js/Quasar-based application for building JSON policies that help process log data. Currently, users navigate through various components with minimal guided assistance. Adding a wizard-type experience would make the process more intuitive, especially for new users.

## Goals
- Create a step-by-step guided workflow for first-time users
- Reduce complexity and cognitive load when creating JSON policies
- Improve user success rates and reduce time-to-value
- Maintain the flexibility of the existing advanced interface for experienced users
- Generate complete policy files with defined parsing rules as demonstrated in the example file [exabeam_cases.json](exabeam_cases.json)

## Architecture

### Framework Components
- Build on top of the existing Vue.js/Quasar framework
- Leverage Quasar's built-in components like q-stepper, q-dialog, q-card, and q-page for consistency
- Use Vue's component system to create modular wizard steps

### Reference Documentation
- [Newtonsoft.Json JSONPath Tutorial](<Newtonsoft.Json JSONPath Tutorial.pdf>)
- [Policy Builder Guide](policybuilder.pdf)
- [JSON Filter Documentation](<JSon Filter.pdf>)
- [LogRhythm-Schema-Dictionary-and-Guide](<LogRhythm-Schema-Dictionary-and-Guide-RevC (2).pdf>)

### Wizard Flow Implementation

#### Entry Point
- Add a "Create/Update Mode" button/toggle prominently on the main page
- The toggle allows users to either create a new policy or edit an existing policy
- Selecting "Create" directs users to the wizard to build a new policy
- Selecting "Update" provides an option to upload an existing policy file

#### Wizard Structure

| Step | Create Mode | Update Mode |
|------|------------|------------|
| **1. Introduction** | Present options to upload a file or paste JSON data | Present option to upload an existing policy file |
| **2. Data Processing** | Parse the data or file into a data object | Parse the JSON data from the file into a data object |
| **3. Navigation** | Implement a Quasar stepper with clear navigation | Same as Create Mode |
| **4. Completion** | Summary screen with export options | Summary screen with implementation options |

## Technical Implementation

### Wizard Component Hierarchy

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
- Store wizard progress in Vuex state to enable seamless navigation without data loss
- Implement validation at each step before allowing progression to the next step
- Provide functionality to save in-progress wizard state and allow users to resume later

### Integration Points
- Connect with existing JSON processing logic from `mixin-Shared-BuildSmaPolicy.js`
- Integrate with sample message processing from `MappingEdit.vue`
- Leverage existing field mapping functionality with simplified UI

## UI/UX Design

### General Design Principles
- Maintain the existing application's design language and visual identity
- Support both light and dark modes with appropriate contrast ratios
- Implement progressive disclosure of complexity to reduce cognitive load
- Provide clear feedback at each step with visual cues and confirmation messages
- Design for various screen sizes with responsive layouts

### Key UI Components
1. **Progress Indicator**
   - Provide clear visual tracking of completed, current, and upcoming steps
   - Include estimated time remaining or completion percentage
   - Use color and iconography to indicate step status (completed, in-progress, upcoming)
   - Allow direct navigation to previously completed steps

2. **Contextual Help System**
   - Offer inline explanations for technical concepts with tooltips and popovers
   - Show visual examples of expected inputs and correct formats
   - Include links to relevant documentation for advanced concepts
   - Implement a "Help" panel that can be toggled open without leaving the current step
   - Provide short video demonstrations for complex operations

3. **Decision Points**
   - Present clear binary choices when possible to simplify decision-making
   - Use visual differentiation for options (cards, buttons, selectors)
   - Display previews of outcomes where applicable
   - Include the ability to compare options side-by-side
   - Offer recommendations based on common use cases

## Wizard Steps in Detail

### Step 1: Introduction & Project Setup
- Display welcome message explaining the wizard's purpose and benefits
- Collect project/policy name and basic metadata
- Present radio button selection to create a new policy or update an existing policy file
- Include a prominent Next button to proceed to the following screen
### Step 2: Sample Data Input
- **When creating a new policy:**
   - Provide simplified interface for inputting sample JSON logs
   - Offer options to:
      - Paste a single JSON log
      - Upload a file containing logs
      - Select from pre-configured examples
   - Implement real-time validation of JSON format
   - Show preview of parsed structure

- **When updating an existing policy:**
   - Provide options to:
      - Upload policy file
      - Paste a complete policy file
      - Validate the uploaded policy file
      - Show options to input Json as Suggested above while creating new policy

- Include Back and Next navigation buttons prominently on the screen



### Step 3: Schema Rule Configuration (Convert to JSON)
- Purpose: Create schema rules to convert stringified JSON values to proper JSON objects
- Features:
   - Enable users to select multiple JSON attributes that contain stringified JSON
   - When an attribute is selected, parse its value and identify any nested in stringified JSON
   - Store the parsed JSON in temporary memory for reference
   - Replace stringified values with parsed objects when users navigate between steps
   - Clear temporary memory when navigating away from this screen
   - Assign selected JSON attributes to the `$.schemarule.ConvertoJson` array using the format:
     ```json
     ConvertoJson = ["$.a", "$.a.b", "$.c"]
     ```
     where $ represents the root element
- Design an intuitive UI that visualizes the JSON structure and enables easy selection of attributes to convert

### Step 4: Schema Rule Configuration (Fanout)
- Purpose: Enable users to select array elements in JSON for processing
- Features:
   - Automatically detect and highlight JSON array elements when the screen loads
   - Present an aggregated JSON view similar to the current JSON Mapping tab, but with:
     - No Mapping or Rule flags columns
     - Only JSON structure and checkboxes near array elements
   - When a checkbox is selected, track both the attribute and its hierarchical order in the JSON
   - Parse the provided JSON data to identify all array attributes
   - Generate schema rules in the following format when arrays are selected:

{
  "schemaRule": {
    "childfanouts": [
      {
        "field": "$.path.to.array.from.parentarray[*]",
        "parentpath": "$.parentElement[*]"
      }
    ]
  }
}

- In Above JSON, Childfanout is any Array object which has object which define each array element user want to parse 
      {
        "field": "$.path.to.array.from.parentarray[*]",
        "parentpath": "$.parentElement[*]"
      }

      - `field` is an attribute that contains the path to an array attribute relative to the parent attribute
      - `parentpath` is set when the JSON array mentioned in `field` is inside a parent array. It references the parent array path. If the array is not inside any parent element, `parentpath` will be null. When set, `parentpath` value should match the `field` value provided for the parent array.

      - For below Json 
       {
  "company": "TechCorp",
  "departments": [
    {
      "name": "Engineering",
      "teams": [
        {
          "teamName": "Frontend",
          "members": [
            {
              "name": "Alice Johnson",
              "role": "Senior Developer",
              "skills": ["React", "TypeScript", "CSS"]
            },
            {
              "name": "Bob Smith",
              "role": "Junior Developer", 
              "skills": ["JavaScript", "HTML", "Vue.js"]
            }
          ]
        },
        {
          "teamName": "Backend",
          "members": [
            {
              "name": "Carol Davis",
              "role": "Lead Developer",
              "skills": ["Python", "Django", "PostgreSQL"]
            },
            {
              "name": "David Wilson",
              "role": "DevOps Engineer",
              "skills": ["Docker", "Kubernetes", "AWS"]
            }
          ]
        }
      ]
    },
    {
      "name": "Marketing",
      "teams": [
        {
          "teamName": "Digital Marketing",
          "members": [
            {
              "name": "Emma Brown",
              "role": "Marketing Manager",
              "skills": ["SEO", "Google Ads", "Analytics"]
            }
          ]
        },
        {
          "teamName": "Content",
          "members": [
            {
              "name": "Frank Miller",
              "role": "Content Writer",
              "skills": ["Copywriting", "Blog Writing", "Social Media"]
            },
            {
              "name": "Grace Lee",
              "role": "Graphic Designer",
              "skills": ["Photoshop", "Illustrator", "Figma"]
            }
          ]
        }
      ]
    }
  ],
  "projects": [
    [
      {
        "projectId": "P001",
        "name": "Mobile App Redesign",
        "phases": [
          ["Research", "User Interviews", "Market Analysis"],
          ["Design", "Wireframing", "Prototyping", "UI Design"],
          ["Development", "Frontend Implementation", "Backend Integration", "Testing"]
        ]
      }
    ],
    [
      {
        "projectId": "P002", 
        "name": "E-commerce Platform",
        "phases": [
          ["Planning", "Requirements Gathering", "Architecture Design"],
          ["Implementation", "Database Setup", "API Development", "Frontend Build"],
          ["Launch", "Deployment", "Monitoring", "User Training"]
        ]
      }
    ]
  ]
}
   
   
   -the schemarule will set like below

   {
  "schemaRule": {
    "childfanouts": [
      {
        "field": "$.departments",
        "parentpath": null
      },
      {
        "field": "$.projects",
        "parentpath": null
      },
      {
        "field": "$.teams",
        "parentpath": "$.departments"
      },
       {
        "field": "$.members",
        "parentpath": "$.teams"
      },
       {
        "field": "$.skills",
        "parentpath": "$.members"
      },
       {
        "field": "$.phases",
        "parentpath": "$.projects"
      }
    ]
  }
}


- **Implementation Guidelines:**
  - Use Newtonsoft JSONPath notation with `[*]` for array wildcards
  - Example notation: `$.parentElement.arrayelement[*]` 
  - Automatically detect all arrays in nested JSON structures
  - Generate the exact schema format specified
  - Include error handling for invalid JSON

### Step 5: Filter Rule Configuration
- Purpose: Create filter conditions that determine when parsing rules apply to JSON fields

- **For new policy creation:**
   - Generate filter sections in the format: 
     ```
     "filter": "@.@metadata.beat == 'eventhubbeat' && @.response.category =='FrontDoorAccessLog'"
     ```
   - Reference JSon Filter.pdf
   - Provide guided interface for JSON field selection to create filters
   - Allow users to either select existing values or enter custom values
   - Enable selection of multiple fields with AND/OR conditions between them
   - Generate Newtonsoft JSON Array filter expressions using JSONPath syntax
   - Include simplified explanation of mapping concepts

- **For policy file updates:**
   - Parse existing filter sections from the policy file
   - Convert JSONPath expressions to visual mappings in the UI

- **Navigation:**
   - Include Next and Back buttons
   - When Next is clicked, save filters and proceed to the next screen
   - When Back is clicked:
     - Detect changes
     - If changes exist, prompt user to save or discard
     - If user selects save, update the state with current values
     - If user selects discard, revert to previous filter state

- Design an intuitive UI for JSON visualization and attribute selection


### Step 6: Schema Mapping Creation
- Purpose: Map JSON attributes to LogRhythm Schema fields

- **UI Components:**
   - Display aggregated JSON similar to the current JSON Mapping tab
   - Include mapping column as currently implemented, refer LogRhythm-Schema-Dictionary-and-Guide for LR schema fields
   - Replace rule flag column with Operation column (list of operations for value transformation)
     - Reference policybuilder.pdf for operation details
   - Add Format column for specifying formatting rules
     - Reference Formatters section in policybuilder.pdf
   - Add column for selecting alternative fields when primary fields are null or missing
   - Include UI components for defining default values and data types

- **Data Structure:**
   - Store mappings in transforms JSON array using the following structure:
      {
   "inputRule": "$.source.field.path",
   "LRSchemaField": "normalized_field_name",
   "type": "String",
   "default": null,
   "alternativeFields": ["$.backup.field.path", "$.backup.another.field.path"],
   "format": null,
   "FanoutParentElement": "$.path.to.array[*]"
   }
- **Properties definition:**
   - `inputRule`: The JSON path leading to the source field (or a literal value)
   - `LRSchemaField`: The name of the target field
   - `type`: The data type (e.g., String, DateTime, Number, Decimal)
   - `default`: The value assigned if the field is absent
   - `alternativeFields`: Fields that serve as backup options
   - `format`: The pattern used for formatting (e.g., applicable for dates) - store the value from formatter column here
   - `FanoutParentElement`: The path to the parent array
- `FanoutParentElement` should be auto-detected. If an attribute is inside an array element mentioned in `schemaRule.childfanouts.field`, the `FanoutParentElement` should be set to that `schemaRule.childfanouts.field` value, and the input field should be relative to parent array elements
 in Json sample 
 {
      "name": "Engineering",
      "teams": [
        {
          "teamName": "Frontend",
          "members": [
            {
              "name": "Alice Johnson",
              "role": "Senior Developer",
              "skills": ["React", "TypeScript", "CSS"]
            },
            {
              "name": "Bob Smith",
              "role": "Junior Developer", 
              "skills": ["JavaScript", "HTML", "Vue.js"]
            }
          ]
        }
      ]
   }
- For the example above:
  - If `members` is defined in `childfanouts`, the input field value for the name attribute would be `$.name` and `FanoutParentElement` would be `$.members`
  - If the parent array is not defined in child fanout, the input field would be the fully qualified path: `$.teams[*].members[*].name`
- Use Newstonsoft JSONPath expression which parsed to Json in selectTokens method and format is like $.attr1.child1.child2 to get value of json attribute.




### Step 7: Review & Export
- Purpose: Finalize and export the completed policy

- **Features:**
   - Generate complete JSON policy file by combining all data from previous steps
     - Follow the format explained in the Policy File Structure section of policybuilder.pdf
   - Display comprehensive summary of all configurations
   - Provide interactive preview of the generated policy
   - Offer multiple export options:
     - Download as JSON file
     - Copy to clipboard
     - Direct implementation
   - Include implementation guidance and next steps for users

## User Experience Considerations

### Accessibility
- Implement full keyboard navigation support for all wizard steps
- Ensure screen reader compatibility with ARIA labels and proper semantic HTML
- Maintain sufficient color contrast (minimum 4.5:1) in both light and dark modes
- Provide text alternatives for all visual indicators and icons
- Add focus indicators that are visible in all color schemes

### Internationalization
- Support all languages currently in the application
- Implement localized help content and examples
- Provide bidirectional text support for RTL languages
- Use flexible layout designs that accommodate text expansion/contraction
- Separate text from code for easier translation management

### Error Handling
- Display clear, specific error messages with actionable guidance
- Implement inline validation to prevent progression with invalid configurations
- Highlight problematic fields or selections
- Provide recovery options and suggestions for common mistakes
- Include undo/redo functionality for error recovery

## Development Implementation Plan

| Phase | Duration | Tasks |
|-------|----------|-------|
| **1. Core Framework** | 2 weeks | - Implement basic stepper component and navigation<br>- Create wizard state management using Vuex<br>- Build entry/exit points from main application<br>- Set up scaffolding for all wizard steps<br>- Implement save/restore functionality for wizard progress |
| **2. Step Implementation** | 3 weeks | - Develop individual step components following the component hierarchy<br>- Connect to existing application logic in `mixin-Shared-BuildSmaPolicy.js`<br>- Implement validation rules for each step<br>- Create data model transformations between steps<br>- Build reusable components for common UI patterns |
| **3. UX Refinement** | 2 weeks | - Add contextual help system and tooltips<br>- Improve visual design and transitions between steps<br>- Optimize for common user paths based on initial testing<br>- Implement accessibility features<br>- Add error handling and recovery mechanisms |
| **4. Testing & Optimization** | 2 weeks | - Conduct usability testing with target users<br>- Perform performance optimization<br>- Implement refinements based on feedback<br>- Create automated tests for critical paths<br>- Document usage guidelines and examples |

## Success Metrics

| Category | Metric | Target |
|----------|--------|--------|
| **Efficiency** | Reduction in time to create first policy | 50% reduction |
|  | Decrease in policy creation errors | 75% reduction |
| **User Adoption** | Completion rate for new users | 90%+ completion |
|  | User satisfaction rating | 4+ out of 5 rating |
| **Support Impact** | Reduction in support requests | 60% reduction |
|  | Increase in self-service policy creation | 40% increase |