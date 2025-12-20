# Step 2: Reset Subsequent Steps Only When "Next" is Clicked

## Problem
Previously, when users changed data in Step 2 (pasted new JSON or uploaded a new file), all subsequent steps (Steps 3-6) were reset immediately during validation. This meant:
- Users couldn't edit data without losing their Step 3, 4, 5, and 6 configurations
- Every keystroke or data change would trigger resets
- Poor user experience when making minor edits

## Solution
Modified the behavior so that subsequent steps are reset **only when the user clicks the "Next" button**, not during data validation or editing.

---

## Changes Made

### 1. **Added New Tracking Variable**
Added `lastProceededRawData` to track the data state when the user last clicked "Next":

```javascript
data () {
  return {
    // ... other properties
    lastProcessedRawData: null,  // Tracks last validated data
    lastProceededRawData: null,  // NEW: Tracks data when user last clicked "Next"
  }
}
```

### 2. **Modified `proceedToNext()` Method**
Now checks if data has changed since the last time the user proceeded to the next step:

```javascript
async proceedToNext () {
  if (!this.isStepValid) {
    this.$emit('step-invalid', 'Please provide valid JSON data')
    return
  }

  // Check if data has changed since the last time user proceeded to next step
  const currentRawData = this.sampleData.rawData
  const hasDataChangedSinceLastProceed = this.lastProceededRawData !== currentRawData

  if (hasDataChangedSinceLastProceed) {
    console.log('=== Step 2: Data changed since last proceed - Resetting Steps 3, 4, 5, and 6 ===')
    
    // Reset all subsequent steps
    this.UPDATE_SCHEMA_RULES({ /* ... reset schema rules ... */ })
    this.$store.commit('wizard/RESET_FILTER_RULES')
    this.$store.commit('wizard/RESET_FIELD_MAPPINGS')
    this.$store.commit('wizard/RESET_SUBTRANSFORMS')
    this.$store.commit('wizard/RESET_STEP_STATUS', 2) // Step 3
    this.$store.commit('wizard/RESET_STEP_STATUS', 3) // Step 4
    this.$store.commit('wizard/RESET_STEP_STATUS', 4) // Step 5
    this.$store.commit('wizard/RESET_STEP_STATUS', 5) // Step 6

    // Update the last proceeded data to current data
    this.lastProceededRawData = currentRawData
  } else {
    console.log('=== Step 2: Data unchanged since last proceed - Preserving all steps ===')
  }

  // Proceed to next step
  this.$emit('step-valid')
  this.$emit('next-step')
}
```

### 3. **Simplified `validateJsonData()` Method**
Removed the automatic reset logic. Now it only validates and tracks data changes without resetting steps:

```javascript
async validateJsonData () {
  // ... validation logic ...
  
  if (hasDataChanged && result.validationResult.isValid) {
    console.log('=== Step 2: Raw data has changed ===')
    console.log('Data will be checked against step configurations when user proceeds to next step')

    // Update last processed data (for validation tracking)
    this.lastProcessedRawData = currentRawData

    // NOTE: We do NOT reset steps here anymore.
    // Steps will be reset in proceedToNext() when user clicks "Next" button
  }
}
```

### 4. **Updated `mounted()` Hook**
Initialize both tracking variables when returning to Step 2:

```javascript
mounted () {
  // ... other initialization ...
  
  if (this.sampleData.rawData && this.sampleData.parsedData) {
    this.lastProcessedRawData = this.sampleData.rawData
    // Also initialize lastProceededRawData when returning to this step
    this.lastProceededRawData = this.sampleData.rawData
  }
}
```

### 5. **Updated Clear Methods**
Reset both tracking variables when clearing data:

```javascript
clearData () {
  // ... clear data ...
  this.lastProcessedRawData = null
  this.lastProceededRawData = null
}

clearDataPreserveInputMethod () {
  // ... clear data ...
  this.lastProcessedRawData = null
  this.lastProceededRawData = null
}
```

---

## How It Works

### **Scenario 1: User Uploads File → Clicks Next**
1. User uploads a JSON file
2. Data is validated ✓
3. User clicks "Next"
4. `proceedToNext()` detects data is new (different from `lastProceededRawData`)
5. **All subsequent steps (3-6) are reset** ✓
6. `lastProceededRawData` is updated with current data
7. User proceeds to Step 3

### **Scenario 2: User Edits Data → Navigates to Step 3**
1. User pastes new JSON in manual input
2. Data is validated ✓
3. User manually goes to Step 3 configurations (without clicking Next)
4. **Step 3-6 configurations are preserved** ✓
5. User can see previous configurations and decide whether to keep or change them

### **Scenario 3: User Edits Data → Clicks Next → Comes Back → Clicks Next Again**
1. User uploads file A
2. User clicks "Next" (Steps 3-6 reset, `lastProceededRawData = A`)
3. User configures Step 3, 4, 5, 6
4. User goes back to Step 2
5. User uploads file B
6. User clicks "Next" again
7. `proceedToNext()` detects change (`lastProceededRawData = A`, current = B)
8. **All subsequent steps (3-6) are reset again** ✓
9. `lastProceededRawData` is updated to B

### **Scenario 4: User Goes Back to Step 2 Without Changing Data → Clicks Next**
1. User is on Step 5
2. User goes back to Step 2
3. User doesn't change anything
4. User clicks "Next"
5. `proceedToNext()` detects no change (`lastProceededRawData = current data`)
6. **All steps are preserved** ✓
7. User proceeds to Step 3 with all configurations intact

---

## Benefits

✅ **Better User Experience**: Users can edit data without immediately losing their configurations  
✅ **Intentional Resets**: Steps are only reset when user explicitly proceeds forward  
✅ **Preserved Work**: Coming back to Step 2 without changes preserves all work  
✅ **Clear Workflow**: Reset only happens at a clear decision point (clicking "Next")  
✅ **Efficient Editing**: Users can make multiple edits before committing to proceed  
✅ **Smart Detection**: Tracks both validation state and proceed state separately  

---

## Testing Checklist

- [x] Upload file → Click Next → Steps 3-6 reset ✓
- [x] Paste JSON → Click Next → Steps 3-6 reset ✓
- [x] Edit data → Navigate to Step 3 manually → Configurations preserved ✓
- [x] Upload file → Click Next → Go back → Click Next again without changes → Steps preserved ✓
- [x] Upload file A → Click Next → Go back → Upload file B → Click Next → Steps reset ✓
- [x] Clear data → Steps reset immediately ✓
- [x] Switch input methods → Steps reset immediately ✓

---

## Technical Notes

**Two Tracking Variables:**
- `lastProcessedRawData`: Tracks when data was last validated (used for validation logic)
- `lastProceededRawData`: Tracks when user last clicked "Next" (used for reset logic)

**Why Both Are Needed:**
- `lastProcessedRawData`: Prevents redundant validation on the same data
- `lastProceededRawData`: Determines when to reset subsequent steps

**Reset Trigger:**
- Only when `lastProceededRawData !== currentRawData` **AND** user clicks "Next"
- NOT during validation, editing, or navigation

**Scope of Reset:**
- Step 3: Schema Rules (convertToJson, fanout, childfanouts, etc.)
- Step 4: Filter Rules
- Step 5: Field Mappings  
- Step 6: SubTransforms
- All step statuses are also reset
