# LogRhythm JSON Policy Builder Wizard - Deployment Guide

This guide provides instructions for deploying and testing the JSON Policy Builder Wizard prototype UI.

## Overview

The JSON Policy Builder Wizard is a step-by-step interface for creating and updating LogRhythm JSON parsing policies. The prototype implements the first two steps with full functionality and includes skeleton implementations of the remaining steps.

## Prerequisites

- Node.js (v12.x or higher)
- npm (v6.x or higher)
- Git

## Deployment Steps

### 1. Install Dependencies

First, ensure all dependencies are installed:

```bash
cd /path/to/frontend_standalone
npm install
```

### 2. Configure Routes

The wizard routes are already configured in the prototype. They can be accessed at the `/wizard` route in the application.

### 3. Build the Application

For development testing:

```bash
npm run dev
```

For production deployment:

```bash
npm run build
```

### 4. Access the Wizard

After starting the development server or deploying to production:

1. Navigate to `http://localhost:8080` (or your configured host)
2. Click on the "Wizard" option in the navigation menu or directly visit `http://localhost:8080/#/wizard`

## Component Structure

The wizard prototype consists of the following key components:

```
src/components/wizard/
├── WizardContainer.vue          # Main wizard component
├── WizardNavigation.vue         # Navigation sidebar
├── WizardHelp.vue              # Help system
├── components/
│   └── JsonTreeViewer.vue      # JSON visualization
└── steps/
    ├── Step1_Introduction.vue   # Project setup
    ├── Step2_DataUpload.vue     # Data input
    ├── Step3_SchemaConfig.vue   # Schema rules (stub)
    ├── Step4_FilterConfig.vue   # Filter rules (stub)  
    ├── Step5_Mapping.vue        # Field mapping (stub)
    └── Step6_Export.vue         # Review & export (stub)
```

## State Management

The wizard uses Vuex for state management. The wizard state is defined in:

```
src/store/wizard-module.js
```

## Testing the Prototype

To test the wizard functionality:

1. Start with Step 1 (Introduction):
   - Enter project name and description
   - Select Create/Update mode
   - If updating, upload an existing policy file

2. Proceed to Step 2 (Data Upload):
   - Paste JSON data, upload a file, or enter multiple JSON logs
   - View the JSON structure analysis and validation results
   - Experiment with the JSON tree viewer

3. The remaining steps (3-6) are implemented as stubs with basic navigation only

## Customization

### Themes

The wizard supports both light and dark themes. The theme toggle is available in the top-right corner of the wizard interface.

### Adding Additional Steps

To add functionality to the stub steps:

1. Edit the corresponding step component in `src/components/wizard/steps/`
2. Implement the required functionality
3. Ensure state is properly managed in the Vuex module

## Known Limitations

- This is a prototype implementation, focusing primarily on the user interface and experience
- Steps 3-6 are implemented as skeleton components only
- Integration with the backend for actual policy generation is not included

## Feedback and Issue Reporting

For feedback or issues with the wizard prototype, please contact the development team or submit an issue to the project repository.

## Next Steps for Production Implementation

1. Complete the implementation of Steps 3-6
2. Integrate with the backend for policy generation and validation
3. Add comprehensive testing suite
4. Implement user feedback from prototype testing