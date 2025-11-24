- **Delete** the pop-up code in step 5 for creating mapping in `frontend_standalone/src/components/wizard/steps/Step5_Mapping.vue`.
- **Take** the create mapping pop code in `frontend_standalone/src/components/wizard/steps/Step5_Mapping_OLD.vue` and put it in `frontend_standalone/src/components/wizard/steps/Step5_Mapping.vue`. i.e. replace the new pop-up with the old one.
- In the **OLD** pop-up, the **JSON filter id dropdown should be made a label** after copying it. When the user clicks on an attribute in json tree on the main page, that JSON path will be shown in the label.
- **Make changes** to ensure the pop-up is working.
- **Ask questions if clarification is required.**

# Step 5 Mapping Popup Replacement Task

## Objective
Replace the current "Create / Edit Field Mapping" popup (dialog) in `frontend_standalone/src/components/wizard/steps/Step5_Mapping.vue` with the legacy dialog markup from `frontend_standalone/src/components/wizard/steps/Step5_Mapping_OLD.vue`, while preserving the existing Step 5 tree-driven workflow and unified dropdown styling.

## Required Changes
1. **Remove** the existing mapping creation/edit dialog block from `Step5_Mapping.vue`.
2. **Copy** only the legacy popup (q-dialog + q-card + form fields) from `Step5_Mapping_OLD.vue` and **insert** it into `Step5_Mapping.vue`.
3. **Do not copy** the old table, toolbar, or stats chips—only the popup dialog/form.
4. **Replace** the legacy popup's JSON Path q-select with a read-only q-input:
   - Label: `Source Field (JSON Path) *`
   - Populate from user clicking a node in the JSON tree (keep `createMappingFromNode` + `editMapping`).
5. Ensure sample value banner still appears when `mappingForm.sampleValue` is available.
6. Retain and apply the unified dropdown styling (`popup-content-class="dropdown-dark"`, `.uniform-select` class, solid #2196f3 hover background).
7. Preserve validation, duplicate detection, smart suggestions, notifications, and mobile tab switching.
8. Remove or refactor any unused methods (e.g. `openAddMapping` if no direct Add button remains).
9. Keep existing methods for tree expansion, highlighting, saving state, and proceeding to the next step.
10. Ensure the form fields still include:
    - LogRhythm Schema Field (select)
    - Data Type (select)
    - Format (input, optional)
    - Default Value (input, optional)
    - Alternative Fields (multi-select chips)
    - Fanout Parent Element (input, optional)

## Implementation Notes
- Read-only JSON path field should prevent manual alteration but display the selected path clearly.
- `createMappingFromNode(nodeData)` should set `mappingForm.inputRule` and open the dialog.
- `editMapping(mapping)` should deep-clone mapping and open the dialog.
- If the old popup’s methods conflict with the current file, merge logic rather than overwrite (especially `saveMapping`).
- Ensure `mappingForm.id` is generated for new mappings if missing.

## Validation Checklist
- Clicking a JSON tree field opens the legacy-styled popup.
- Source field shows as read-only with correct JSON path.
- Dropdowns: black background, white text, solid blue (#2196f3) hover/active.
- Validation errors show under affected fields.
- Duplicate mapping is prevented with warning notification.
- Sample value banner appears when available.
- Mapping saves and updates correctly (new vs edit) and persists in Vuex.
- Mobile: after save, switches to mappings tab if on mobile.
- No console errors or Vue warnings.

## Deliverables
- Updated `Step5_Mapping.vue` with replaced dialog and adjusted methods.
- Brief summary of changes (for PR description).

## Questions (ask before proceeding if unclear)
- Is there any remaining dependency on the old `openAddMapping` button workflow?
- Should smart suggestions still appear as header section above LR field options? (If yes, retain related code.)
- Any additional fields from the old popup intentionally omitted?

Proceed after clarifying outstanding questions if any.