# Step 3 State Management Requirements

## Overview
This document defines the state management and user selection persistence behavior for **Step 3 (Schema Configuration)** of the JSON Policy Builder Wizard. The goal is to provide an intuitive user experience where selections are preserved when navigating between steps, but automatically reset when new JSON data is uploaded.

---

## Core Principles

1. **Preserve User Work**: When users navigate away from Step 3 and return WITHOUT changing the underlying JSON data, all their selections should be preserved.

2. **Smart Reset on Data Change**: When users upload or paste NEW JSON data in Step 2, Step 3 should automatically reset to analyze the new data structure, clearing all previous selections.

3. **Consistency**: The behavior should be consistent whether the user navigates backward (Step 3 → Step 2 → Step 3) or forward and backward (Step 3 → Step 4 → Step 3).

---

## Detailed Requirements

### Requirement 1: Navigation Without Data Changes (Step 3 → Step 2 → Step 3)

**Scenario**: User makes selections in Step 3, navigates back to Step 2, does NOT change the JSON data, then returns to Step 3.

**Expected Behavior**:
- ✅ All previously selected "Convert to JSON" fields remain selected
- ✅ All previously selected "Fanout Arrays" remain selected and checked in the tree viewer
- ✅ Derived fanout arrays from parsed JSON strings remain selected if they were previously selected
- ✅ The UI state (checkboxes, tree selections) matches the stored selections exactly

**Implementation Details**:
- Step 3 selections are stored in Vuex store (`schemaRules.convertToJson` and `schemaRules.fanout`)
- Step 3's `created()` hook loads selections from the store on mount
- Step 2 does NOT clear the store when users simply navigate back without changing data
- Selection restoration happens automatically when Step 3 component is recreated

**User Experience**:
```
Step 2 (existing JSON data) 
  ↓ Click "Continue"
Step 3 (user selects: field1, field2, array1)
  ↓ Click "Previous"
Step 2 (JSON data unchanged)
  ↓ Click "Continue"
Step 3 (displays: field1✓, field2✓, array1✓) ← All preserved
```

---

### Requirement 2: Navigation WITH Data Changes (Step 3 → Step 2 → Upload New JSON → Step 3)

**Scenario**: User makes selections in Step 3, navigates back to Step 2, uploads or pastes NEW JSON data, then proceeds to Step 3.

**Expected Behavior**:
- ✅ All previous "Convert to JSON" field selections are CLEARED
- ✅ All previous "Fanout Array" selections are CLEARED
- ✅ New candidates are computed from the new JSON structure
- ✅ The UI shows fresh, unselected candidates based on the new data
- ✅ Previous derived fanout arrays from old JSON strings are removed
- ✅ Users start with a clean slate for the new JSON structure

**Implementation Details**:
- Step 2's `validateJsonData()` detects when `rawData` has actually changed
- When data changes, Step 2 calls `UPDATE_SCHEMA_RULES()` to reset all Step 3 selections to empty arrays
- Step 3's watcher on `schemaRules` detects the reset and clears local component state
- Step 3's `analyzeSampleData()` generates new candidates from the new JSON structure
- No previous selections are restored

**User Experience**:
```
Step 2 (JSON data A) 
  ↓ Click "Continue"
Step 3 (user selects: fieldA, arrayA)
  ↓ Click "Previous"
Step 2 (uploads JSON data B - DIFFERENT from A)
  ↓ Click "Continue"
Step 3 (displays: fieldB, arrayB - all unselected) ← Fresh start
```

**Detection Mechanism**:
- Step 2 maintains `lastProcessedRawData` to track the last processed JSON
- Before processing, compares `currentRawData` with `lastProcessedRawData`
- If different → Reset Step 3 selections
- If same → Preserve Step 3 selections

---

### Requirement 3: Forward Navigation and Return (Step 3 → Step 4 → Step 3)

**Scenario**: User makes selections in Step 3, proceeds to Step 4 (or any later step), then navigates back to Step 3.

**Expected Behavior**:
- ✅ All previously selected "Convert to JSON" fields remain selected
- ✅ All previously selected "Fanout Arrays" remain selected and checked in the tree viewer
- ✅ Derived fanout arrays from parsed JSON strings remain selected
- ✅ The component state is fully restored as if the user never left

**Implementation Details**:
- Selections are stored in Vuex before proceeding to Step 4 (via `proceedToNext()`)
- When returning to Step 3, the component's `created()` hook restores from store
- No data changes occur in Steps 4+, so the restore is straightforward
- The tree viewer's `initial-selected-paths` prop receives the restored selections

**User Experience**:
```
Step 2 (JSON data) 
  ↓ Click "Continue"
Step 3 (user selects: field1, field2, array1)
  ↓ Click "Continue to Filter Rules"
Step 4 (Filter Rules configuration)
  ↓ Click "Previous"
Step 3 (displays: field1✓, field2✓, array1✓) ← All preserved
```

---

## Component State Management

### Step 2 (DataUpload) Responsibilities:

1. **Track Data Changes**:
   - Maintain `lastProcessedRawData` in component data
   - Compare on every validation to detect actual data changes

2. **Conditionally Reset Step 3**:
   - On new data: Call `UPDATE_SCHEMA_RULES()` with empty arrays
   - On same data: Do NOT touch schema rules in store

3. **Clear on Manual Clear**:
   - When user clicks "Clear" button, reset both data and schema rules

### Step 3 (SchemaConfig) Responsibilities:

1. **Load Previous Selections on Mount**:
   - In `created()` hook, read `schemaRules` from Vuex
   - Restore `selectedConvertToJsonFields` and `selectedFanoutFields`

2. **Watch for Store Changes**:
   - Watch `schemaRules` from store
   - If reset detected (arrays become empty), clear local selections

3. **Validate Selections Against Candidates**:
   - In `analyzeSampleData()`, filter selections to only include valid candidates
   - Remove selections for fields that no longer exist in new structure

4. **Save Selections on Proceed**:
   - In `proceedToNext()`, call `UPDATE_SCHEMA_RULES()` with current selections
   - Build and store `childfanouts` structure for policy generation

---

## Dynamic Fanout Arrays from Parsed JSON

### Special Behavior:

When users select a "Convert to JSON" field that contains stringified JSON with arrays:

1. **Auto-Discovery**:
   - Step 3 parses the stringified JSON field
   - Discovers any arrays within the parsed structure
   - Adds them to `fanoutCandidates` with `isParsedField: true`

2. **Display in UI**:
   - These derived arrays appear in the fanout tree viewer
   - Marked with a purple badge "Parsed JSON"
   - Can be selected/deselected independently

3. **Selection Preservation**:
   - If user selects these derived arrays and navigates away (without data change), they remain selected
   - If user deselects the parent "Convert to JSON" field, derived arrays are automatically removed

4. **Reset on Data Change**:
   - When new JSON is uploaded, ALL derived arrays are cleared
   - New analysis runs on the new data structure

### Implementation:

- `updateFanoutCandidatesFromParsedJson()` handles the logic
- Watcher on `selectedConvertToJsonFields` triggers updates
- `SchemaRuleService.parseJsonFieldForArrays()` extracts arrays from parsed JSON

---

## Edge Cases and Validation

### Edge Case 1: Partial Structure Change
**Scenario**: New JSON has similar but slightly different structure

**Handling**:
- `analyzeSampleData()` validates each selection against new candidates
- Keeps valid selections that still exist
- Removes invalid selections that no longer exist
- User sees partially preserved selections (only the valid ones)

### Edge Case 2: User Clears Data in Step 2
**Scenario**: User clicks "Clear" button in Step 2

**Handling**:
- `clearData()` resets both sample data AND schema rules
- Step 3 receives empty state
- Next visit to Step 3 shows no selections

### Edge Case 3: Format JSON (Prettify)
**Scenario**: User clicks "Format" button in Step 2 to prettify JSON

**Handling**:
- Formatting doesn't change the actual data structure
- `lastProcessedRawData` should use normalized/parsed comparison (if needed)
- Currently: Raw string comparison may detect change (minor issue)
- Recommendation: Compare parsed data structures instead of raw strings

---

## Vuex Store Integration

### State Shape:
```javascript
{
  schemaRules: {
    convertToJson: [],        // Array of field paths to parse as JSON
    fanout: [],               // Array of array paths for fanout
    childfanouts: [],         // Built structure for policy
    detectedStringifiedJson: [], // Auto-detected candidates
    manualSelections: []      // User manual selections tracking
  }
}
```

### Mutations Used:
- `UPDATE_SCHEMA_RULES(state, rules)` - Updates schema rules (partial update)
- `SET_SAMPLE_DATA(state, data)` - Updates sample data

### Flow:
```
User makes selection in Step 3
  ↓
Local component state updated (selectedConvertToJsonFields, selectedFanoutFields)
  ↓
User clicks "Continue"
  ↓
proceedToNext() calls UPDATE_SCHEMA_RULES() with selections
  ↓
Vuex store updated
  ↓
User navigates back to Step 3
  ↓
created() hook reads from Vuex store
  ↓
Local component state restored
  ↓
UI reflects selections
```

---

## Testing Checklist

- [ ] **Test 1**: Select fields in Step 3 → Go to Step 2 → Return to Step 3 (selections preserved)
- [ ] **Test 2**: Select fields in Step 3 → Go to Step 2 → Upload new JSON → Go to Step 3 (selections reset)
- [ ] **Test 3**: Select fields in Step 3 → Go to Step 4 → Return to Step 3 (selections preserved)
- [ ] **Test 4**: Select "Convert to JSON" field with nested arrays → Check derived arrays appear in fanout → Navigate away and back (both parent and derived selections preserved)
- [ ] **Test 5**: Select "Convert to JSON" field → Navigate away → Return → Deselect the field (derived fanout arrays disappear)
- [ ] **Test 6**: Select fields → Clear data in Step 2 → Go to Step 3 (everything reset)
- [ ] **Test 7**: Upload JSON → Go to Step 3 → Select fields → Go to Step 2 → Format JSON (prettify) → Return to Step 3 (selections should ideally be preserved - edge case)
- [ ] **Test 8**: Multi-line JSON mode → Select fields → Navigate back/forth (selections preserved correctly)
- [ ] **Test 9**: Upload JSON A → Select fields → Upload JSON B with some similar fields → Check Step 3 (only valid matching fields preserved, invalid ones removed)

---

## Console Logging for Debugging

The implementation includes comprehensive console logging:

**Step 2**:
- `=== Step 2: Data processing result ===`
- `=== Step 2: Raw data has changed - resetting Step 3 selections ===`
- `=== Step 2: Raw data unchanged - preserving Step 3 selections ===`

**Step 3**:
- `=== Step 3 Created: Initializing component ===`
- `=== Step 3: Restoring previous selections from Vuex store ===`
- `=== Step3 Watch: schemaRules changed in store ===`
- `=== Step3: Schema rules were cleared - resetting local selections ===`
- `=== Validating previous selections against new candidates ===`

These logs help trace the state management flow during development and debugging.

---

## Future Improvements

1. **Smarter Data Comparison**: 
   - Compare parsed JSON structures instead of raw strings
   - Handle formatting changes (prettify/minify) gracefully

2. **Partial Selection Preservation**:
   - When structure changes slightly, preserve selections with user confirmation
   - Show a diff of what changed and ask user to review

3. **Selection History**:
   - Maintain history of selections for undo/redo
   - Allow users to restore previous configurations

4. **Auto-Save**:
   - Periodically save selections to localStorage
   - Recover selections on page refresh

5. **Visual Feedback**:
   - Show a notification when selections are reset due to data change
   - Highlight which selections were preserved vs. newly detected