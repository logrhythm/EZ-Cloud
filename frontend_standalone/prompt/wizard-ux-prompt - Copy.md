# Wizard-Type User Experience Prompt for LogRhythm JSON Policy Builder

## Background
The LogRhythm JSON Policy Builder is a Vue.js/Quasar-based application for building JSON policies that help process log data. Currently, users navigate through various components with minimal guided assistance. Adding a wizard-type experience would make the process more intuitive, especially for new users.

## Goals
- Create a step-by-step guided workflow for first-time users
- Reduce complexity and cognitive load when creating JSON policies
- Improve user success rates and reduce time-to-value
- Maintain the flexibility of the existing advanced interface for experienced users
- The final output after all wizard steps should be policy files with defined parsing rules as in file [text](exabeam_cases.json). The file is an example to learn

## Architecture

### Framework Components
- Build on top of the existing Vue.js/Quasar framework
- Leverage Quasar's built-in components like q-stepper, q-dialog, q-card, and q-page for consistency
- Use Vue's component system to create modular wizard steps
- Refer to files [./Newtonsoft.Json](<Newtonsoft.Json JSONPath Tutorial.pdf>) JSONPath Tutorial.pdf, [./policybuilder.pdf](policybuilder.pdf) and [JSon Filter.pdf](<JSon Filter.pdf>) to create expression and policy file

### Wizard Flow Implementation

#### Entry Point
- Add a "Create/Update Mode" button/toggle prominently on the main page
- The button lets user to create a new policy or edit exsisting policy
- On clicking create new policy it takes user to wizard to create a new policy.
- On clicking update it will give option to upload policy file.

#### Wizard Structure
1. **Introduction/Selection Screen when Create Mode is selected**
   - The user is shown option to upload file or paste Json data, have same option in current implemetation.
   - The data or file is parsed to data objet is created to populate data for next steps

2 **Introduction/Selection Screen when update Mode is selected**
   - The user is shown option to upload policy file.
   - The Json data in file is parsed to data objet is created to populate data for next step

3. **Step-by-Step Interface**
   - Implement a Quasar stepper component (q-stepper) with clear navigation
   - Provide persistent header showing current step and overall progress
   - Include help tooltips and contextual guidance at each step

4. **Completion & Handoff**
   - Summary screen showing what was created
   - Clear call-to-action for next steps
   - Option to export, save, or immediately implement the policy

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
│   └── Step6_MappingCreation
|   └── Step7_Review_and_Export
└── WizardActions (export, exit, help)
```

### State Management
- Store wizard progress in Vuex state to allow for navigation without data loss
- Implement validation at each step before allowing progression
- Allow users to save in-progress wizard state and return later

### Integration Points
- Connect with existing JSON processing logic from `mixin-Shared-BuildSmaPolicy.js`
- Integrate with sample message processing from `MappingEdit.vue`
- Leverage existing field mapping functionality with simplified UI

## UI/UX Design

### General Design Principles
- Maintain the existing application's design language
- Support both light and dark modes
- Focus on progressive disclosure of complexity
- Provide clear feedback at each step

### Key UI Components
1. **Progress Indicator**
   - Clear visual tracking of completed, current, and upcoming steps
   - Optional estimated time remaining or completion percentage

2. **Contextual Help**
   - Inline explanations for technical concepts
   - Visual examples of expected inputs
   - Links to documentation for advanced concepts

3. **Decision Points**
   - Clear binary choices when possible
   - Visual differentiation of options (cards, buttons)
   - Preview of outcomes where applicable

## Wizard Steps in Detail

### Step 1: Introduction & Project Setup
- Welcome message explaining the wizard's purpose
- Project/policy naming and basic metadata
- Showing a radio button to create a new policy or update existing policy file
- A Next button will be there to take user to next screen.  
### Step 2: Sample Data Input
-When create new policy file is selected
   - Simplified interface to input sample JSON logs
   - Options to:
      - Paste a single JSON log
      - Upload a file containing logs
      - Use a pre-configured example
      - Real-time validation of JSON format
      - Preview of parsed structure
- When update policy is called 
   - Also Add Option to 
      - upload policy file
      - paste a complete policy file 
      - validate the uploaded policy file 
- The back button to go to previous screen and next button to go to next screen must be on screen.  



### Step 3: Schema Rule to convert to JSON set up Screen
- This screen create Schema rules which select fields:
   - To convert a json attribute string values to Json object. In Json the attribute values is some time stringify Json, to parse the value we have to convert stringy json to Json Object
- The user should have ability to select multiple json attributes
- After an attributes is selected, parse the value of selected attributes by converting to JSON,identify any attribute with which have stringify JSON add them to list for selection.
- please save the parsed Json in temp memory for future reference. The  values in temp memory will replace respective stringify values when user click next or choose to save the state when clicking back. The temp memory will be cleared when user goes to another screen.
- The multiple JSON attribute selected will be assigned to Json array attribute $.schemarule.ConvertoJson like  ConvertoJson = ["$.a", "$.a.b", "$.c"], $ represent root element. 
- Create an UI which has best user experience user can easily visualize the Json and select Json attributes to Convert form string to Json

### Step 4: Schema Rule for Fanout
- This screen lets user to select Array elements in Json
- When you come on this screen Json array Elements should be auto detected and highlighted
- The UI should show an aggregated JSON as shown  currently in Json Mapping tab. the difference will be that there will be no Mapping and Rule flags columns only Json  and checkbox near Json Array Elements.
- When user select a checkbox the attribute and hierarchical order in Json should also remembered
- Parse the provided JSON data and identify all array attributes. Create a user interface that allows selection of these arrays and generates a schema rule in the following format:

{
  "schemaRule": {
    "childfanouts": [
      {
        "field": "$.path.to.array.from.parentarray[*]",
        "parentpath": $.parentElement[*]
      }
    ]
  }
}

- In Above JSON, Childfanout is any Array object which has object which define each array element user want to parse 
      {
        "field": "$.path.to.array.from.parentarray[*]",
        "parentpath": $.parentElement[*]
      }

      - field is attribute which contain path to array attribute relative to parent attribute
      - parentpath is an attribute which is set if the Json Array mention in field is inside the parent array. parentpath is set to parent array. if it is not inside any parent element it will be null. parentpath value should be same as filed value provided for parentarray.

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


- Use Newstonsoft JSONPath notation with [*] for array wildcards, the expression used by newstonsoft to parse Json look like $.parentElement.arrayelement[*] 
- Automatically detect all arrays in nested JSON structures
- Generate the exact schema format specified
-  Include error handling for invalid JSON

### Step 5: Filter Rule set up Screen
- This screen create filter condition which apply on JSON data to check if parsing rules can be applied to parse JSON fields 
- When Customer selects to create new policy file
   - The example of filter section in policy file is "filter": "@.@metadata.beat == 'eventhubbeat' && @.response.category =='FrontDoorAccessLog'"'
   - Guided interface to select JSON field to create filter 
   - The user will have option to choose existing value or put a put a manual value against json attribute in filter condition 
   - The user should be able to select multiple fields and define and/or conditions between them.
   - The Final output should be Newtonsoft  Json Array filter expressions JSONPath Expressions which is explained on url  https://claude.ai/public/artifacts/5a22c0dc-81c1-43f1-b48c-f3682914df0c
   - The expression is assigned to filter attribute as shared in above expression.
   - Simplified explanation of mapping concepts
- When customer selects to update the existing policy file
   - The filter section of policy file should be parsed as Json Array filter expressions JSONPath Expressions which is explained on url  https://claude.ai/public/artifacts/5a22c0dc-81c1-43f1-b48c-f3682914df0c and converted to mappings which cam be shown on UI.
- The screen must have a next and back button, when customer click next the filters should be saved and go to next screen. 
- If back is clicked, detect if any changes are made, if changes are made show a prompt to discard the changes or save the changes.if customer click discard, discard the values and revert to previous filter state, if save is clicked, save the values and update the state. 
- Create an UI which has best user experience user can easily visualize the Json and select attribute 


### Step 6: Schema Mapping Creation 
- This screen allow Json attributes mapped to LRSchema fields
- The UI should show an aggregated JSON as shown  currently in Json Mapping tab.
- It should show mapping column  currently shown and user should be able to.
- replace rule flag column with Operation column, it a list of Operation in which values can be passed to  transfrom the values
- usage of operation is defined in document policybuilder.pdf 
- A second column to define the format, please Formatters section in policybuilder.pdf.
- A third column to select multiple attributes if the the field mentioned in input rule in null or not present.
- Add ui components to define default and type values described below
- The the mapping be stored in transforms Json array with structure as below
      {
   "inputRule": "$.source.field.path",
   "LRSchemaField": "normalized_field_name",
   "type": "String",
   "default": null,
   "alternativeFields": ["$.backup.field.path", "$.backup.another.field.path"],
   "format": null,
   "FanoutParentElement": "$.path.to.array[*]",
   }
- Properties definition 
   - inputRule: The JSON path leading to the source field (or a literal value)
   - LRSchemaField: The name of the target field
   - type: The data type (e.g., string, dateTime, number, decimal.)
   - default: The value assigned if the field is absent
   - alternativeFields: Fields that serve as backup options
   - format: The pattern used for formatting (e.g., applicable for dates), the value of formatter column should be saved herer
   - FanoutParentElement: The path to the parent array
- FanoutParerent Element should be autodetected, if attribute it is inside array element mentioned in schemaRule.childfanouts.field, the FanoutParentElement should be set to that schemaRule.childfanouts.field and input filed should be relative to pararent array elements
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
inputfield value will be members name attribute will  $.name and FanoutParerent element will $.members if defined in childfanouts.
if the the parent array is not defined in child fanout the inputfield will be $.teams[*].members[*].name
- Use Newstonsoft JSONPath expression which parsed to Json in selectTokens method and format is like $.attr1.child1.child2 to get value of json attribute.




### Step 7: Review & Export
- Create a Json policy file by combining all save data in format explained in Policy File Structure section in policybuilder.pdf.
- Summary of all configurations
- Preview of the generated policy
- Export options (download JSON, copy to clipboard)
- Implementation guidance and next steps

## User Experience Considerations

### Accessibility
- Keyboard navigation support for all wizard steps
- Screen reader compatibility
- Sufficient color contrast in both light and dark modes
- Text alternatives for visual indicators

### Internationalization
- Support for all languages currently in the application
- Localized help content and examples
- Direction support for RTL languages

### Error Handling
- Clear error messages with actionable guidance
- Inline validation to prevent progression with invalid configurations
- Recovery options for common mistakes

## Development Implementation Plan

### Phase 1: Core Wizard Framework
- Implement basic stepper component and navigation
- Create wizard state management
- Build entry/exit points from main application

### Phase 2: Step Implementation
- Develop individual step components
- Connect to existing application logic
- Implement validation rules

### Phase 3: UX Refinement
- Add contextual help and tooltips
- Improve visual design and transitions
- Optimize for common user paths

### Phase 4: Testing & Optimization
- Usability testing with target users
- Performance optimization
- Refinement based on feedback

## Success Metrics
- Reduction in time to create first policy
- Increased completion rate for new users
- Positive feedback on wizard experience
- Reduction in support requests related to policy creation