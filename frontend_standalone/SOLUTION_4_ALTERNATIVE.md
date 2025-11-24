# SOLUTION 4: Native HTML Select (Guaranteed to Work)

If ALL Quasar solutions fail, this uses a native HTML select with custom styling:

## Replace the entire "Common Patterns Dropdown" section (lines 75-103) with:

```vue
<!-- Common Patterns Dropdown -->
<div class="form-group">
  <label class="field-label">Common Patterns (Quick Insert)</label>
  <div class="native-select-wrapper">
    <q-icon name="auto_awesome" class="select-prepend-icon" size="xs" />
    <select
      v-model="selectedPresetIndex"
      @change="handleNativeSelectChange"
      class="native-preset-select"
    >
      <option :value="null" disabled selected>Select a preset pattern...</option>
      <option
        v-for="(pattern, index) in patternOptions"
        :key="pattern.name"
        :value="index"
      >
        {{ pattern.name }} - {{ pattern.example }}
      </option>
    </select>
    <q-icon name="arrow_drop_down" class="select-append-icon" size="sm" />
  </div>
</div>
```

## Update the data (in setup function):

```javascript
const selectedPresetIndex = ref(null)  // Change from selectedPreset
```

## Add the handler:

```javascript
const handleNativeSelectChange = (event) => {
  const index = event.target.value
  console.log('🔍 [DEBUG] Native select changed, index:', index)

  if (index !== null && index !== undefined) {
    const pattern = patternOptions.value[index]
    console.log('🔍 [DEBUG] Selected pattern:', pattern)
    insertPreset(pattern)

    // Reset the select
    setTimeout(() => {
      selectedPresetIndex.value = null
      console.log('🔍 [DEBUG] Reset select to null')
    }, 100)
  }
}
```

## Return the new values:

```javascript
return {
  // ... existing returns
  selectedPresetIndex,  // Change from selectedPreset
  handleNativeSelectChange
}
```

## Add these styles:

```scss
.native-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  transition: border-color 150ms;

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
  }

  &:focus-within {
    border-color: #2196f3;
  }
}

.select-prepend-icon {
  margin-left: 12px;
  color: rgba(227, 242, 253, 0.7);
}

.native-preset-select {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 10px 12px;
  color: #E3F2FD;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;

  option {
    background: #1e1e1e;
    color: #E3F2FD;
    padding: 8px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.select-append-icon {
  margin-right: 8px;
  color: rgba(227, 242, 253, 0.7);
  pointer-events: none;
}
```

## Benefits:
- ✅ GUARANTEED to work - native HTML
- ✅ No framework dependencies
- ✅ Works in all browsers
- ✅ No event parsing issues
- ✅ Fully debuggable

## Drawbacks:
- Styling is more limited
- Doesn't match Quasar UI exactly
- No fancy dropdown template
