# SOLUTION 2: Use emit-value and map-options (Quasar v1 specific)

If Solution 1 doesn't work, try this approach which uses Quasar v1 specific props:

## Replace the q-select (lines 78-102) with:

```vue
<q-select
  v-model="selectedPreset"
  :options="patternOptions"
  outlined
  dense
  option-value="pattern"
  option-label="name"
  emit-value
  map-options
  placeholder="Select a preset pattern..."
  class="preset-select"
  clearable
  @input="handlePresetSelection"
>
  <template #prepend>
    <q-icon name="auto_awesome" size="xs" />
  </template>
  <template #option="scope">
    <q-item v-bind="scope.itemProps">
      <q-item-section>
        <q-item-label>{{ scope.opt.name }}</q-item-label>
        <q-item-label caption class="preset-example">
          {{ scope.opt.example }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </template>
</q-select>
```

## Add new handler method (after insertPreset):

```javascript
const handlePresetSelection = (patternString) => {
  console.log('🔍 [DEBUG] handlePresetSelection called with:', patternString)

  // Find the full object from patternOptions
  const fullPattern = patternOptions.value.find(p => p.pattern === patternString)

  console.log('🔍 [DEBUG] Found full pattern object:', fullPattern)

  if (fullPattern) {
    insertPreset(fullPattern)
  } else {
    console.error('❌ [DEBUG] Could not find pattern in options for:', patternString)
  }
}
```

## Don't forget to return it in the setup:

```javascript
return {
  // ... existing returns
  handlePresetSelection  // ADD THIS LINE
}
```

## Why this works:
- `emit-value` tells q-select to emit the value (pattern string) instead of the object
- `map-options` enables internal mapping of values
- We manually look up the full object when the pattern string is emitted
- This is the "proper" Quasar v1 way but requires more code
