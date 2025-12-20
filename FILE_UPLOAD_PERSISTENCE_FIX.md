# File Upload Persistence Fix - Step 2

## Problem
When a user uploads a file in Step 2, navigates to the next step, and then comes back to Step 2, the uploaded file information was not retained. The file control would be empty, even though the data was still present in the Vuex store.

## Root Cause
The component was storing the uploaded `File` object in local component state (`uploadedFile`), which is lost when the component is unmounted. When the user navigated back to Step 2, the component would remount with a fresh state, and the file information would be gone.

## Solution

### 1. Store File Name in Vuex State
Added a new field `uploadedFileName` to the `sampleData` state in the Vuex store (`wizardModule.js`):

```javascript
sampleData: {
  inputMethod: 'manual',
  rawData: '',
  parsedData: null,
  logType: null,
  uploadedFileName: null, // NEW: Store file name for file upload method
  // ... other fields
}
```

### 2. Persist File Name on Upload
Updated the `onFileUpload` method in `Step2_DataUpload.vue` to store the file name in Vuex:

```javascript
this.SET_SAMPLE_DATA({
  rawData: fileContent,
  inputMethod: 'file',
  uploadedFileName: file.name // Store file name for persistence
})
```

### 3. Restore File on Component Mount
Added logic in the `mounted()` lifecycle hook to restore the file display when returning to Step 2:

```javascript
// Restore uploaded file if user is returning to this step with file input method
if (this.sampleData.inputMethod === 'file' && this.sampleData.uploadedFileName) {
  console.log('=== Step 2 Mounted: Restoring uploaded file ===')
  console.log('File name:', this.sampleData.uploadedFileName)
  
  // Create a mock File object to display in the UI
  this.uploadedFile = new File([], this.sampleData.uploadedFileName, { type: 'application/json' })
}
```

### 4. Add Watcher for File Name Changes
Added a watcher to automatically restore the file display when the `uploadedFileName` changes:

```javascript
'sampleData.uploadedFileName': {
  handler (newValue) {
    if (newValue && this.sampleData.inputMethod === 'file' && !this.uploadedFile) {
      // Create a mock File object to display the file name in the UI
      this.uploadedFile = new File([], newValue, { type: 'application/json' })
    } else if (!newValue) {
      // Clear the uploaded file if the name was cleared
      this.uploadedFile = null
    }
  },
  immediate: true
}
```

### 5. Clear File Name on Data Clear
Updated `clearData()` and `clearDataPreserveInputMethod()` methods to clear the `uploadedFileName`:

```javascript
this.SET_SAMPLE_DATA({
  rawData: '',
  parsedData: null,
  dataStructure: null,
  logType: null,
  uploadedFileName: null, // Clear stored file name
  validationResult: { isValid: false, errors: [], warnings: [] },
  dataStats: { recordCount: 0, fieldCount: 0, nestedLevels: 0 }
})
```

### 6. Improved Input Method Change Handling
Modified the input method watcher to only clear data when actually switching methods (not on initialization):

```javascript
'sampleData.inputMethod': {
  handler (newValue, oldValue) {
    if (newValue !== oldValue) {
      this.localInputMethod = newValue
      this.$nextTick(() => {
        // Only clear data if switching away from the current method
        if (oldValue) {
          this.clearDataPreserveInputMethod()
        }
      })
    }
  }
}
```

## How It Works

1. **On File Upload**: When a user selects a file, the file name is stored in both local state (`uploadedFile`) and Vuex state (`uploadedFileName`).

2. **On Navigation Away**: The local component state is lost, but the Vuex state (including `uploadedFileName` and `rawData`) persists.

3. **On Return to Step 2**: 
   - The component remounts
   - The `mounted()` hook checks if there's a stored file name
   - If found, it creates a mock `File` object with the stored name
   - The file control displays the file name
   - All validation and data preview remain intact

4. **On Clear**: Both the local `uploadedFile` and Vuex `uploadedFileName` are cleared.

## Benefits

✅ **Persistent UI**: Users can navigate back and forth without losing file upload information  
✅ **Data Integrity**: Raw data and parsed data remain synchronized with file display  
✅ **Better UX**: Users can see which file they uploaded even after navigation  
✅ **Validation Preserved**: All validation results and data previews are retained  
✅ **Clean State Management**: File name is stored in the single source of truth (Vuex)

## Testing Checklist

- [x] Upload a file in Step 2
- [x] Navigate to Step 3
- [x] Navigate back to Step 2
- [x] Verify file name is displayed in the file control
- [x] Verify data preview is still visible
- [x] Verify validation results are preserved
- [x] Clear the data and verify file is removed
- [x] Switch between input methods and verify appropriate clearing
- [x] Upload empty file and verify error handling
