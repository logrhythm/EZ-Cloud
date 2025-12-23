# Navigation Button Positioning Standardization

## Overview
Standardized the navigation buttons (Previous/Next) across all wizard steps to ensure consistent positioning, attributes, and accessibility.

## Date
December 20, 2025

## Changes Made

### All Steps (2-6) Now Follow This Standard Format:

```vue
<div class="step-actions">
  <q-btn
    flat
    icon="arrow_back"
    label="Previous"
    :disable="isSaving"              <!-- Added where applicable -->
    @click="$emit('prev-step')"
    class="wizard-btn wizard-btn--secondary"
    aria-label="Go to previous step"  <!-- ADDED for accessibility -->
  />

  <q-btn
    unelevated
    color="primary"
    icon-right="arrow_forward"
    label="Continue to [Next Step]"
    :loading="isSaving"               <!-- Added where applicable -->
    @click="proceedToNext"
    class="wizard-btn wizard-btn--primary"
    aria-label="Continue to [next step] step"  <!-- ADDED for accessibility -->
  />
</div>
```

### Step-by-Step Changes:

#### Step 2 - Data Upload
- ✅ Added `aria-label="Go to previous step"` to Previous button
- ✅ Added `aria-label="Continue to schema rules step"` to Next button
- ✅ Positioned at bottom of step content
- ✅ Maintains `:disable="!isStepValid"` for validation

#### Step 3 - Schema Config
- ✅ Added `aria-label="Go to previous step"` to Previous button
- ✅ Added `aria-label="Continue to filter rules step"` to Next button
- ✅ Positioned at bottom of step content

#### Step 4 - Filter Config
- ✅ Already had proper `aria-label` attributes (used as reference)
- ✅ Positioned at bottom of step content
- ✅ Maintains `:disable="isSaving"` and `:loading="isSaving"` states

#### Step 5 - Mapping
- ✅ Added `aria-label="Go to previous step"` to Previous button
- ✅ Added `aria-label="Continue to sub transform step"` to Next button
- ✅ Positioned at bottom of step content
- ✅ Maintains `:disable="isSaving"` and `:loading="isSaving"` states
- ✅ Label: "Continue to Sub transform"

#### Step 6 - SubTransform Config
- ✅ Added `aria-label="Go to previous step"` to Previous button
- ✅ Added `aria-label="Continue to export step"` to Next button
- ✅ Positioned at bottom of step content
- ✅ Maintains `:disable="isSaving"` and `:loading="isSaving"` states

## Consistency Checklist

### Position
- ✅ All buttons positioned at the bottom of each step
- ✅ Wrapped in `<div class="step-actions">` container
- ✅ Buttons appear after all step content

### Attributes
- ✅ Previous button: `flat`, `icon="arrow_back"`, `label="Previous"`
- ✅ Next button: `unelevated`, `color="primary"`, `icon-right="arrow_forward"`
- ✅ Both buttons have appropriate CSS classes: `wizard-btn`
- ✅ Both buttons have `aria-label` for accessibility

### State Management
- ✅ Steps with saving operations (4, 5, 6) have `:disable="isSaving"` on Previous
- ✅ Steps with saving operations (4, 5, 6) have `:loading="isSaving"` on Next
- ✅ Step 2 has `:disable="!isStepValid"` on Next for validation
- ✅ Step 3 has no disable/loading states (as intended)

### Event Handlers
- ✅ Previous button: `@click="$emit('prev-step')"`
- ✅ Next button: `@click="proceedToNext"`

## Accessibility Improvements

All steps now include proper ARIA labels:
- Previous buttons: `aria-label="Go to previous step"`
- Next buttons: Descriptive labels indicating the destination step

## Files Modified

1. `frontend_standalone/src/components/wizard/steps/Step2_DataUpload.vue`
2. `frontend_standalone/src/components/wizard/steps/Step3_SchemaConfig.vue`
3. `frontend_standalone/src/components/wizard/steps/Step4_FilterConfig.vue` (reference - no changes)
4. `frontend_standalone/src/components/wizard/steps/Step5_Mapping.vue`
5. `frontend_standalone/src/components/wizard/steps/Step6_SubTransformConfig.vue`

## Validation

All files have been validated and contain no errors.

## Benefits

1. **Consistent User Experience**: Users see the same button layout on every step
2. **Improved Accessibility**: Screen readers can properly announce button purposes
3. **Better Maintainability**: Standardized code is easier to update in the future
4. **Professional Polish**: Consistent UI elements throughout the wizard
