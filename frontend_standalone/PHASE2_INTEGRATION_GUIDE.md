# Phase 2 → Phase 3: Integration Quick Reference

## What Was Built

Six fully functional Vue components for operations and formatters:

1. **OperationSelector.vue** - Main operation selection panel
2. **RegexOperationConfig.vue** - REGEX configuration with 12 presets
3. **LookupOperationConfig.vue** - Lookup table configuration
4. **PrefixOperationConfig.vue** - Simple prefix configuration
5. **DateTimeFormatterConfig.vue** - DateTime format with pattern builder
6. **OperationPreview.vue** - Live operation testing and preview

All components are production-ready with dark theme, mobile responsiveness, validation, and accessibility.

---

## How to Integrate into Step5_Mapping.vue

### Step 1: Import Components

Add these imports at the top of Step5_Mapping.vue:

```javascript
// In <script> section
import OperationSelector from './operations/OperationSelector.vue'
import DateTimeFormatterConfig from './operations/DateTimeFormatterConfig.vue'
import { parseOperationFromInputRule, buildOperationSyntax } from '@/utils/operationParser'
```

### Step 2: Register Components

Add to the `components` object:

```javascript
export default {
  name: 'Step5Mapping',
  components: {
    // ... existing components
    OperationSelector,
    DateTimeFormatterConfig
  }
}
```

### Step 3: Add State Variables

Add these to the `data()` function:

```javascript
data() {
  return {
    // ... existing data
    originalFieldPath: '', // Store JSON path without operation
    operationConfig: {
      type: null,
      parameters: {}
    }
  }
}
```

### Step 4: Add to Template

Insert these components in the mapping dialog (look for the section with "Source Field (JSON Path)"):

```vue
<!-- After the Source Field input -->
<div class="mapping-form-row">
  <q-input
    v-model="mappingForm.inputRule"
    label="Source Field (JSON Path) *"
    readonly
    outlined
    dense
  />
</div>

<!-- ADD THIS: Operation Selector -->
<operation-selector
  v-model="operationConfig"
  :field-path="originalFieldPath"
  :sample-value="mappingForm.sampleValue"
  @update:model-value="handleOperationChanged"
/>

<!-- ... existing LR Schema Field, Type dropdown ... -->

<!-- ADD THIS: DateTime Formatter (conditional) -->
<date-time-formatter-config
  v-if="mappingForm.type === 'DateTime'"
  v-model="mappingForm.format"
  :sample-value="mappingForm.sampleValue"
/>
```

### Step 5: Add Event Handler

Add this method to handle operation changes:

```javascript
methods: {
  // ... existing methods

  handleOperationChanged(newConfig) {
    // Rebuild inputRule with new operation
    if (newConfig.type) {
      this.mappingForm.inputRule = buildOperationSyntax(
        newConfig.type,
        this.originalFieldPath,
        newConfig.parameters
      )
    } else {
      // No operation, use original path
      this.mappingForm.inputRule = this.originalFieldPath
    }
  }
}
```

### Step 6: Update createMappingFromNode()

Modify the existing `createMappingFromNode()` method to parse operations:

```javascript
createMappingFromNode(nodeData) {
  // ... existing code to get resolved.jsonPath ...

  // NEW: Parse operation if present
  const parsed = parseOperationFromInputRule(resolved.jsonPath)
  this.originalFieldPath = parsed.fieldPath || resolved.jsonPath
  this.operationConfig = {
    type: parsed.type,
    parameters: parsed.parameters
  }

  // Set form values
  this.mappingForm = {
    // ... existing form fields ...
    inputRule: resolved.jsonPath, // May contain operation syntax
    sampleValue: resolved.sampleValue || ''
  }
}
```

### Step 7: Update editMapping()

Modify the existing `editMapping()` method to load operations:

```javascript
editMapping(mapping) {
  // ... existing code ...

  // NEW: Parse operation if present
  const parsed = parseOperationFromInputRule(mapping.inputRule)
  this.originalFieldPath = parsed.fieldPath || mapping.inputRule
  this.operationConfig = {
    type: parsed.type,
    parameters: parsed.parameters
  }

  // Pre-fill form
  this.mappingForm = {
    // ... existing form fields ...
  }
}
```

---

## Testing Checklist

After integration, test these scenarios:

### Basic Functionality
- [ ] Open mapping dialog by clicking JSON field
- [ ] Click "[+] Add Operation" button to expand panel
- [ ] Select REGEX operation
- [ ] Enter pattern and capture group
- [ ] Click "Test Operation" to see preview
- [ ] Save mapping (operation syntax in inputRule)

### Operation Types
- [ ] Test REGEX with preset patterns
- [ ] Test LookUp with different tables
- [ ] Test LookUpStartsWith
- [ ] Test PREFIX with suggestions
- [ ] Test clearing operations (back to None)

### DateTime Formatter
- [ ] Select "DateTime" data type
- [ ] DateTime formatter panel appears
- [ ] Test preset format buttons
- [ ] Test pattern builder
- [ ] Test pattern reference guide
- [ ] Save with format pattern

### Edit Existing Mappings
- [ ] Create mapping with operation
- [ ] Close dialog
- [ ] Re-open mapping for editing
- [ ] Operation is loaded correctly
- [ ] Can modify operation parameters
- [ ] Can clear operation

### Validation
- [ ] Invalid regex shows error message
- [ ] Invalid capture group shows error
- [ ] Empty prefix shows validation error
- [ ] Invalid DateTime format shows error
- [ ] Helpful suggestions appear

### Preview & Testing
- [ ] Preview updates on parameter change
- [ ] Test button triggers operation test
- [ ] Loading spinner shows during test
- [ ] Success state shows result
- [ ] Error state shows helpful message
- [ ] Copy syntax button works

### Mobile Responsive
- [ ] Components stack vertically on mobile
- [ ] Touch-friendly buttons (44px+)
- [ ] Scrollable content areas
- [ ] Full-width action buttons

### Dark Theme
- [ ] All components match dark theme
- [ ] Proper contrast ratios
- [ ] Readable text colors
- [ ] Visible borders and separators

---

## Common Issues & Solutions

### Issue: Operation not persisting after save
**Solution:** Ensure `handleOperationChanged()` is updating `mappingForm.inputRule` correctly before saving.

### Issue: Operation panel not showing on edit
**Solution:** Make sure `createMappingFromNode()` and `editMapping()` are parsing the operation and setting `operationConfig`.

### Issue: Sample value not available
**Solution:** Ensure `mappingForm.sampleValue` is populated from the JSON tree node data.

### Issue: Test operation fails
**Solution:** Check that `MappingService.testOperation()` is implemented in Phase 1. Mock implementation returns `[Lookup result for ...]` for lookups.

### Issue: DateTime formatter not appearing
**Solution:** Verify the condition `v-if="mappingForm.type === 'DateTime'"` matches the exact data type value.

---

## File Locations Reference

### New Components (Phase 2)
```
/src/components/wizard/operations/
├── OperationSelector.vue
├── RegexOperationConfig.vue
├── LookupOperationConfig.vue
├── PrefixOperationConfig.vue
├── DateTimeFormatterConfig.vue
└── OperationPreview.vue
```

### Utilities (Phase 1)
```
/src/utils/operationParser.js
/src/constants/operations.js
```

### Service (Phase 1)
```
/src/services/wizard/mappingService.js
```

### Integration Target
```
/src/components/wizard/steps/Step5_Mapping.vue
```

---

## Operation Syntax Examples

After integration, these are the expected `inputRule` values:

```javascript
// No operation
"$.message"

// REGEX
"REGEX($.message, /IP: (\d+\.\d+\.\d+\.\d+)/, 1)"

// LookUp
"LookUp(HTTP_STATUS_CODES, $.status_code)"

// LookUpStartsWith
"LookUpStartsWith(ERROR_CODES, $.error_prefix)"

// PREFIX
"PREFIX('SERVER-')"
```

And for DateTime fields, the `format` field:

```javascript
// Format examples
"yyyy-MM-dd HH:mm:ss.SSS"
"yyyy-MM-ddTHH:mm:ss.fffK"
"MM/dd/yyyy HH:mm:ss"
"" // or null for default
```

---

## Next Steps After Integration

1. **Manual Testing:** Test all operation types with real sample data
2. **Edge Cases:** Test with missing sample data, empty fields, special characters
3. **Performance:** Ensure no lag with 100+ mappings
4. **Browser Testing:** Test in Chrome, Firefox, Safari, Edge
5. **Mobile Testing:** Test on actual mobile devices
6. **Accessibility:** Test with keyboard navigation and screen readers

---

## Support & Documentation

- **Design Spec:** See `/OPERATIONS_FORMATTERS_DESIGN_SPEC.md`
- **Phase 1 Summary:** See `/PHASE1_INFRASTRUCTURE_SUMMARY.md`
- **Phase 2 Summary:** See `/PHASE2_UI_COMPONENTS_SUMMARY.md`
- **Constants Reference:** See `/src/constants/operations.js`
- **Parser Reference:** See `/src/utils/operationParser.js`

---

**Status:** ✅ Ready for Integration
**Estimated Integration Time:** 2-3 hours
**Testing Time:** 1-2 hours
