# Step 5 - Update Mode Implementation

## Overview
Implement update mode functionality for Step 5 (Field Mapping) to load and display existing field mappings from an uploaded policy file.

**⚠️ IMPORTANT:** The existing **create mode** is fully functional and working correctly. This implementation adds update mode functionality **without breaking or regressing any existing create mode behavior**. All new code must be additive and conditional based on update mode detection.

## Requirements

### 1. Initial Page Load Behavior
- When Step 5 opens, render all data controls normally (as currently implemented)
- Check if the application is in **update mode** (determine from Vuex store state)
- **Create Mode (existing behavior):** If NOT in update mode, continue with normal flow - empty mappings grid, user creates mappings from scratch
- **Update Mode (new behavior):** If in update mode, fetch the `transforms` attribute from the uploaded policy file state object and load existing mappings

### 2. Transform Schema
The `transforms` attribute is an **array** where each JSON object represents one field mapping with the following structure:

```json
{
  "inputRule": "$.eventName",
  "LRSchemaField": "vmid",
  "type": "string",
  "default": null,
  "FanoutParentElement": "$.log.Records[*]",
  "alternativeFields": null,
  "format": null
}
```

**Field Mappings:**
- `inputRule` → `mappingForm.inputRule` (JSON path from sample data)
- `LRSchemaField` → `mappingForm.lrSchemaField` (LogRhythm schema field)
- `type` → `mappingForm.type` (data type: String, Integer, DateTime, etc.)
- `default` → `mappingForm.default` (default value if field is missing)
- `FanoutParentElement` → `mappingForm.fanoutParentElement` (parent array path for fanout)
- `alternativeFields` → `mappingForm.alternativeFields` (alternative JSON paths array)
- `format` → `mappingForm.format` (format specification, e.g., for dates)

### 3. Loading Transforms into Local State

**On component creation (`created` hook):**
1. Check if application is in update mode
2. **If NOT in update mode (create mode):** Skip transform loading, proceed with normal initialization (existing behavior)
3. **If in update mode:** Retrieve `transforms` array from policy file state (likely from `$store.state.wizard.policyFile.transforms` or similar)
4. Iterate through the transforms array
5. For each transform object:
   - Parse any operation syntax from `inputRule` (e.g., `toUpperCase()`, date formatting)
   - Create a mapping object compatible with `localMappings` structure
   - Add a unique `id` (use index or generate UUID)
   - Populate all fields from the transform schema
6. Set `localMappings` with the parsed transforms array
7. Trigger UI refresh to display loaded mappings in the grid

### 4. Pre-filling Edit Dialog

**When user clicks "Edit" on a mapping row:**
1. The `editMapping(mapping)` method is called
2. Populate `mappingForm` with all values from the selected mapping
3. Parse `inputRule` for any operation syntax (already implemented via `parseOperationFromInputRule`)
4. Set `originalFieldPath` and `operationConfig` appropriately
5. If the mapping has `alternativeFields`, display them as chips in the form
6. Load the sample value from JSON tree if available
7. Open the mapping dialog with all fields pre-filled

**Visual feedback:**
- All form controls should show the loaded values
- Operation selector should reflect any operation in `inputRule`
- Alternative fields should appear as chips (if present)
- Sample value banner should display the current value from JSON tree

### 5. Highlighting in JSON Tree

**When a mapping is loaded or edited:**
1. Call `highlightInTree(jsonPath)` for the mapping's `inputRule`
2. If the field has a `FanoutParentElement`, reconstruct the full tree path (already implemented)
3. Expand all parent nodes leading to the highlighted path
4. Scroll the tree view to make the highlighted node visible
5. Apply visual highlight (yellow/blue glow) for 3 seconds

**Auto-highlight on load:**
- Optionally, when mappings are first loaded in update mode, briefly highlight each mapped field in sequence
- Or provide a "Show in Tree" button for each mapping row

### 6. Handling Missing Fields

**Problem:** A mapping exists in the policy file, but the corresponding field is missing from the current sample data.

**Detection:**
- After loading transforms, validate each `inputRule` against `availableJsonPaths`
- If `inputRule` path is not found in the JSON tree, mark the mapping as having a **missing field**

**UI Indicators:**
1. **In Mappings Grid:**
   - Add a warning icon (⚠️) next to the `inputRule` path
   - Display a warning chip/badge (e.g., "Field Not Found in Sample")
   - Use warning color (amber/orange) for the row background or border

2. **In JSON Tree:**
   - Show a special "Missing Fields" section at the top or bottom of the tree
   - List all missing field paths with warning icons
   - Add a notification banner: "X field(s) from policy not found in current sample data"

3. **In Edit Dialog:**
   - Display a prominent warning banner at the top
   - Message: "⚠️ Warning: This field path does not exist in the current sample data. Verify the path or update the sample data."
   - Allow user to still edit and save (policy may be correct, sample might be incomplete)

4. **Validation:**
   - Do not block saving/proceeding if fields are missing
   - Show a confirmation dialog when proceeding: "Some mappings reference fields not in sample data. Continue anyway?"

### 7. Implementation Checklist

- [ ] Add `isUpdateMode` computed property (from Vuex store)
- [ ] Add `loadTransformsFromPolicy()` method in `created` hook
- [ ] Wrap transform loading in `if (isUpdateMode)` condition to preserve create mode
- [ ] Map transform schema fields to `localMappings` format
- [ ] Validate loaded paths against `availableJsonPaths`
- [ ] Add `isMissingField(mapping)` helper method
- [ ] Update mappings grid to show warning icons for missing fields
- [ ] Add warning banner in edit dialog for missing fields
- [ ] Add "Missing Fields" section in JSON tree viewer component
- [ ] Implement auto-highlight or "Show in Tree" for loaded mappings
- [ ] Add confirmation dialog before proceeding if missing fields exist
- [ ] Ensure `saveMapping()` handles both new and updated mappings
- [ ] Test with policy files that have matching and non-matching field paths
- [ ] **Regression test create mode:** Verify all create mode functionality still works without policy file
- [ ] **Test mode switching:** Ensure no conflicts when switching between create and update modes

### 8. Edge Cases to Handle

- **Empty transforms array:** Show empty state, allow creating new mappings (same as create mode)
- **No policy file (create mode):** Application behaves exactly as it does currently - no regression
- **Malformed transform objects:** Skip invalid entries, log warnings, continue loading valid ones
- **Duplicate inputRule paths:** Merge or flag as duplicate
- **Operations in inputRule:** Properly parse and display in operation selector
- **Alternative fields that don't exist:** Validate and mark as missing
- **FanoutParentElement mismatch:** Warn if fanout parent doesn't match Step 3 configuration
- **Sample data changed after policy load:** Re-validate all mappings
- **Switching from update to create mode:** Ensure clean state reset if user starts over

### 9. User Experience Flow

**Create Mode (Existing - Must Not Regress):**
1. User starts new wizard
2. User navigates to Step 5
3. Empty mappings grid displayed
4. User creates mappings by clicking JSON tree nodes
5. User proceeds to Step 6 (Review)

**Update Mode (New Functionality):**
1. User uploads policy file in earlier step
2. User navigates to Step 5
3. **Update Mode Detected:**
   - Show loading spinner: "Loading existing field mappings..."
   - Parse transforms from policy file
   - Populate mappings grid with existing mappings
   - Highlight any missing fields with warnings
4. User can:
   - Edit existing mappings (dialog pre-filled)
   - Add new mappings (normal flow)
   - Delete mappings
   - See which paths are mapped vs unmapped in tree
   - Navigate to sample data step if fields are missing
5. User proceeds to Step 6 (Review)

---

**Note:** Ensure backward compatibility - if no policy file exists or transforms array is empty, Step 5 should behave normally (create mode). **All conditional logic must check for update mode before executing update-specific code to prevent any regression in create mode.**