# Bug Fix: Step 5 and Step 6 State Reset Issue

## Problem Description

When data is changed on Step 2 (Data Upload) or when the reset button is clicked in the wizard, the state of Step 5 (Field Mapping) and Step 6 (SubTransform Configuration) was NOT being reset properly. This caused old mappings and subtransforms to persist even after the underlying data structure changed, leading to inconsistent state and potential runtime errors.

## Root Cause Analysis

1. **Missing Reset Mutations**: The Vuex store did not have dedicated reset mutations for `fieldMappings` and `subTransforms` state modules.

2. **Step 2 Only Reset Step 4**: When data changed in Step 2, only Step 4 (Filter Rules) was being reset. Steps 5 and 6 were left untouched.

3. **Local State Not Synchronized**: Step 5 maintains local state (`localMappings`) that was not automatically synchronized when the Vuex store was reset.

4. **Incomplete Reset Button Logic**: The reset wizard function in WizardContainer called `clearState()` which reset the entire wizard, but did not explicitly ensure all step-specific state was cleared.

## Solution Implemented

### 1. Added Reset Mutations in Vuex Store (`src/store/wizardModule.js`)

#### Added `RESET_FIELD_MAPPINGS` mutation (lines 480-488):
```javascript
RESET_FIELD_MAPPINGS (state) {
  console.log('[Vuex] RESET_FIELD_MAPPINGS mutation called')
  state.fieldMappings = {
    mappings: [],
    unmappedFields: [],
    validationIssues: [],
    previewResults: null
  }
}
```

#### Added `RESET_SUBTRANSFORMS` mutation (lines 548-561):
```javascript
RESET_SUBTRANSFORMS (state) {
  console.log('[Vuex] RESET_SUBTRANSFORMS mutation called')
  state.subTransforms = {
    skipSubTransforms: false,
    subTransformsList: [],
    testResults: {
      lastRun: null,
      executionTrace: [],
      finalOutput: {}
    },
    validationIssues: [],
    templates: []
  }
}
```

### 2. Updated Step 2 Data Change Handler (`src/components/wizard/steps/Step2_DataUpload.vue`)

#### Modified `validateJsonData()` method (lines 841-854):
When data changes, now resets Steps 4, 5, and 6:
```javascript
// ALWAYS reset Step 4, 5, and 6 when data changes
// These steps depend on the sample data structure and fields
console.log('=== Step 2: Resetting Step 4, 5, and 6 due to data change ===')
this.$store.commit('wizard/RESET_FILTER_RULES')
this.$store.commit('wizard/RESET_FIELD_MAPPINGS')
this.$store.commit('wizard/RESET_SUBTRANSFORMS')

// Also reset step status for steps 4, 5, and 6
this.$store.commit('wizard/RESET_STEP_STATUS', 3) // Step 4
this.$store.commit('wizard/RESET_STEP_STATUS', 4) // Step 5
this.$store.commit('wizard/RESET_STEP_STATUS', 5) // Step 6
```

#### Updated `clearData()` method (lines 965-1006):
Now explicitly resets Steps 4, 5, and 6 when clear button is clicked:
```javascript
// Reset Step 4, 5, and 6 when data is cleared
this.$store.commit('wizard/RESET_FILTER_RULES')
this.$store.commit('wizard/RESET_FIELD_MAPPINGS')
this.$store.commit('wizard/RESET_SUBTRANSFORMS')

// Also reset step status for steps 3, 4, 5, and 6
this.$store.commit('wizard/RESET_STEP_STATUS', 2) // Step 3
this.$store.commit('wizard/RESET_STEP_STATUS', 3) // Step 4
this.$store.commit('wizard/RESET_STEP_STATUS', 4) // Step 5
this.$store.commit('wizard/RESET_STEP_STATUS', 5) // Step 6
```

#### Updated `clearDataPreserveInputMethod()` method (lines 1008-1053):
Same reset logic applied when input method changes.

### 3. Added Watchers to Step 5 Component (`src/components/wizard/steps/Step5_Mapping.vue`)

#### Added watcher for `fieldMappings.mappings` (lines 804-826):
```javascript
// Watch for changes in field mappings from Vuex store
// This ensures local state is updated when store is reset
'fieldMappings.mappings': {
  handler (newMappings) {
    // Only update local mappings if they differ from store
    // This prevents circular updates
    const storeJson = JSON.stringify(newMappings || [])
    const localJson = JSON.stringify(this.localMappings || [])

    if (storeJson !== localJson) {
      console.log('[Step 5] Detected mappings change in store, updating local state')
      this.restoreStateFromStore()

      // If mappings were cleared (reset), also rebuild the tree
      if (!newMappings || newMappings.length === 0) {
        console.log('[Step 5] Mappings were reset, rebuilding tree')
        this.buildJsonTree()
      }
    }
  },
  deep: true
}
```

### 4. Added Watcher to Step 6 Component (`src/components/wizard/steps/Step6_SubTransformConfig.vue`)

#### Added watcher for `subTransformsList` (lines 273-284):
```javascript
// Watch for changes in subTransforms list from Vuex store
// This ensures component reacts when store is reset
subTransformsList: {
  handler (newList) {
    console.log('[Step 6] Detected subTransformsList change in store:', newList?.length || 0)
    // The component already reads from Vuex directly via computed property
    // So we just need to validate the step when the list changes
    this.validateStep()
  },
  deep: true
}
```

### 5. Enhanced `clearState` Action (`src/store/wizardModule.js`)

#### Updated `clearState()` action (lines 909-939):
```javascript
async clearState ({ commit, state }) {
  try {
    console.log('[Vuex] clearState action called - resetting all wizard state')

    // Remove saved state from storage
    storage.remove(STORAGE_KEY)

    // Reset wizard state completely
    commit('RESET_WIZARD')

    // Explicitly reset all step-specific state to ensure clean reset
    commit('RESET_FILTER_RULES')
    commit('RESET_FIELD_MAPPINGS')
    commit('RESET_SUBTRANSFORMS')

    // Reset current step to 0 (first step)
    commit('SET_CURRENT_STEP', 0)

    // Clear status for all steps
    for (let i = 0; i < state.steps.length; i++) {
      commit('RESET_STEP_STATUS', i)
    }

    console.log('[Vuex] clearState completed - all state reset')

    return true
  } catch (error) {
    console.error('Failed to clear wizard state:', error)
    return false
  }
}
```

## Testing Recommendations

### Test Case 1: Data Change on Step 2
1. Complete Steps 1-6 with valid data
2. Go back to Step 2
3. Change the sample data to a different JSON structure
4. Verify that:
   - Step 5 mappings are cleared
   - Step 6 subtransforms are cleared
   - Step status for Steps 4, 5, and 6 is reset to "pending"

### Test Case 2: Reset Button
1. Complete Steps 1-6 with valid data
2. Click the "Reset Wizard" button
3. Verify that:
   - All wizard state is cleared
   - User is navigated to Step 1
   - Steps 5 and 6 show empty state
   - All step statuses are reset

### Test Case 3: Clear Data Button on Step 2
1. Complete Steps 1-6 with valid data
2. Go back to Step 2
3. Click the "Clear" button
4. Verify that:
   - Sample data is cleared
   - Step 5 mappings are cleared
   - Step 6 subtransforms are cleared
   - Step status for Steps 3, 4, 5, and 6 is reset

## Impact Assessment

### Files Modified
1. `/src/store/wizardModule.js` - Added reset mutations and enhanced clearState action
2. `/src/components/wizard/steps/Step2_DataUpload.vue` - Updated data change handlers
3. `/src/components/wizard/steps/Step5_Mapping.vue` - Added watcher for store changes
4. `/src/components/wizard/steps/Step6_SubTransformConfig.vue` - Added watcher for store changes

### Backward Compatibility
- All changes are backward compatible
- No breaking changes to the API or data structures
- Enhanced logging for better debugging

### Performance Impact
- Minimal performance impact
- Watchers use deep comparison to prevent unnecessary updates
- Console logging can be removed in production build

## Conclusion

This fix ensures that Steps 5 and 6 state is properly reset whenever:
1. Sample data changes on Step 2
2. Reset wizard button is clicked
3. Clear data button is clicked on Step 2

The solution implements proper state management patterns with Vuex mutations, watchers for reactive updates, and comprehensive logging for debugging. All changes maintain backward compatibility and follow Vue.js and Vuex best practices.
