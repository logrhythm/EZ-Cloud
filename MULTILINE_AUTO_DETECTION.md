# Multiline JSON Auto-Detection Feature

## Overview
Step 2 now automatically detects when users paste or upload multiline JSON data and switches to the appropriate input method with correct validation logic.

## Feature Description

### Problem Solved
Previously, if users pasted multiline JSON (newline-delimited JSON objects) into the "Manual Input" tab, the data would fail validation because it expected a single JSON object/array. Users had to manually switch to the "Multiple Logs" tab.

### Solution
The system now automatically:
1. Detects when data contains multiple JSON objects (one per line)
2. Switches the input method from "manual" or "file" to "multiple"
3. Applies the correct multiline validation logic
4. Notifies the user of the automatic switch

## Implementation Details

### Auto-Detection Logic

**File**: `Step2_DataUpload.vue`

#### 1. New Helper Method: `detectInputMethod()`

```javascript
detectInputMethod(rawData) {
  // Splits data by newlines
  // Checks if multiple lines contain valid JSON objects
  // Returns 'multiple' if ≥2 valid JSON objects found
  // Returns 'manual' if single valid JSON
  // Returns current method if inconclusive
}
```

**Detection Criteria for Multiline**:
- Data contains 2+ lines
- At least 2 lines parse as valid JSON objects
- Valid JSON lines outnumber invalid lines

#### 2. Enhanced `validateJsonData()` Method

```javascript
async validateJsonData() {
  // Auto-detect when in manual or file mode
  if (this.sampleData.inputMethod === 'manual' || 
      this.sampleData.inputMethod === 'file') {
    const detectedInputMethod = this.detectInputMethod(this.localRawData)
    
    // Switch to multiple if multiline detected
    if (detectedInputMethod === 'multiple' && 
        this.sampleData.inputMethod !== 'multiple') {
      this.localInputMethod = 'multiple'
      this.SET_SAMPLE_DATA({ inputMethod: 'multiple' })
      
      // Notify user
      this.$q.notify({
        type: 'info',
        message: 'Multiple JSON objects detected - switched to Multiple Logs mode'
      })
    }
  }
  
  // Continue with validation using correct input method
  const result = await DataProcessor.processSampleData(
    this.localRawData, 
    this.sampleData.inputMethod
  )
}
```

#### 3. Enhanced `onFileUpload()` Method

```javascript
async onFileUpload(file) {
  const fileContent = await this.readFileAsText(file)
  
  // Auto-detect multiline in uploaded files
  const detectedInputMethod = this.detectInputMethod(fileContent)
  
  if (detectedInputMethod === 'multiple') {
    // Switch to multiple mode
    this.localInputMethod = 'multiple'
    this.SET_SAMPLE_DATA({
      rawData: fileContent,
      inputMethod: 'multiple',
      uploadedFileName: file.name
    })
    
    // Notify user
    this.$q.notify({
      type: 'info',
      message: 'Multiple JSON objects detected in file - switched to Multiple Logs mode'
    })
  }
  
  await this.validateJsonData()
}
```

## User Experience

### Scenario 1: Manual Input - Multiline Paste

**Before**:
1. User pastes multiline JSON into "Manual Input" tab
2. Validation fails with JSON parse error
3. User manually switches to "Multiple Logs" tab
4. User re-pastes the data

**After**:
1. User pastes multiline JSON into "Manual Input" tab
2. System detects multiple JSON objects
3. **Automatically switches to "Multiple Logs" tab** ✨
4. Shows notification: "Multiple JSON objects detected - switched to Multiple Logs mode"
5. Applies correct multiline validation
6. Data is properly validated and processed

### Scenario 2: File Upload - Multiline File

**Before**:
1. User uploads file with multiline JSON via "File Upload" tab
2. Validation might fail or process incorrectly
3. User manually switches to "Multiple Logs" tab
4. User re-uploads the file

**After**:
1. User uploads file with multiline JSON via "File Upload" tab
2. System detects multiple JSON objects in file
3. **Automatically switches to "Multiple Logs" tab** ✨
4. Shows notification: "Multiple JSON objects detected in file - switched to Multiple Logs mode"
5. Applies correct multiline validation
6. Data is properly validated and processed

### Scenario 3: Single JSON Remains in Manual Input

**Behavior**:
1. User pastes single JSON object/array into "Manual Input" tab
2. System detects single JSON format
3. **Stays in "Manual Input" mode** ✅
4. Validates as single JSON

## Example Data Formats

### Single JSON (Manual Input)
```json
{
  "event": "log entry",
  "timestamp": "2025-12-23T10:00:00Z",
  "data": {
    "field1": "value1"
  }
}
```
**Result**: Stays in "Manual Input" mode

### Single JSON Array (Manual Input)
```json
[
  {"event": "log1"},
  {"event": "log2"}
]
```
**Result**: Stays in "Manual Input" mode

### Multiline JSON (Auto-switches to Multiple Logs)
```json
{"event": "log1", "timestamp": "2025-12-23T10:00:00Z"}
{"event": "log2", "timestamp": "2025-12-23T10:01:00Z"}
{"event": "log3", "timestamp": "2025-12-23T10:02:00Z"}
```
**Result**: Automatically switches to "Multiple Logs" mode

## Validation Behavior

### Multiple Logs Mode Validation

When in "Multiple Logs" mode (auto-detected or manually selected):

1. **Line Count**: Shows total number of lines
2. **Valid Object Count**: Shows count of valid JSON objects
3. **Per-Line Validation**: Each line validated independently
4. **Error Reporting**: Shows which lines have errors
5. **Data Stats**: Aggregates stats from all valid objects

### Visual Feedback

- **Chip Indicators**:
  - Blue chip: Total line count
  - Green chip: Valid JSON object count
  
- **Notification**:
  - Info toast when auto-switching modes
  - Clear indication of detected format

## Console Logging

Enhanced logging for debugging:

```
[detectInputMethod] Detected multiline: 5 valid JSON objects
=== Step 2: Auto-detection ===
Current input method: manual
Detected input method: multiple
=== Step 2: Switching to multiple input method (multiline detected) ===
```

## Edge Cases Handled

### 1. Mixed Valid/Invalid Lines
- Counts valid vs invalid JSON objects
- Only switches if majority are valid
- Reports individual line errors

### 2. Single Line with Newline
- Does not switch to multiline mode
- Treats as single JSON input

### 3. Empty Lines
- Ignores empty/whitespace-only lines
- Only counts lines with content

### 4. Whitespace Formatting
- Trims lines before validation
- Handles various line ending styles (LF, CRLF)

### 5. File Upload Detection
- Same detection logic as manual paste
- Preserves filename for UI display
- Correct mode for validation

## Benefits

✅ **Better UX**: Users don't need to understand different input modes  
✅ **Error Prevention**: Automatic mode selection prevents validation errors  
✅ **Time Saving**: No manual tab switching required  
✅ **Intelligent**: Works for both paste and file upload  
✅ **Transparent**: Notifies user when auto-switching occurs  
✅ **Flexible**: Users can still manually select a different mode if needed  

## Testing

### Test Case 1: Paste Multiline in Manual Input
1. Go to Step 2
2. Stay on "Manual Input" tab
3. Paste 3+ JSON objects (one per line)
4. **Verify**: Auto-switches to "Multiple Logs" tab
5. **Verify**: Shows notification
6. **Verify**: All objects validated correctly

### Test Case 2: Upload Multiline File
1. Go to Step 2
2. Go to "File Upload" tab
3. Upload file with 5+ JSON objects (one per line)
4. **Verify**: Auto-switches to "Multiple Logs" tab
5. **Verify**: Shows notification
6. **Verify**: All objects validated correctly

### Test Case 3: Paste Single JSON
1. Go to Step 2
2. Stay on "Manual Input" tab
3. Paste single JSON object
4. **Verify**: Stays in "Manual Input" tab
5. **Verify**: No notification
6. **Verify**: Validates as single JSON

### Test Case 4: Mixed Valid/Invalid Lines
1. Paste data with 3 valid JSON lines and 2 invalid
2. **Verify**: Switches to "Multiple Logs" (majority valid)
3. **Verify**: Shows 3 valid objects
4. **Verify**: Reports errors for 2 invalid lines

## Files Modified

- `frontend_standalone/src/components/wizard/steps/Step2_DataUpload.vue`
  - Added `detectInputMethod()` helper
  - Enhanced `validateJsonData()` with auto-detection
  - Enhanced `onFileUpload()` with auto-detection
  - Added user notifications for mode switching

## Related Documentation

- Original multiline support: Step 2 already had "Multiple Logs" tab
- Data processing: `dataProcessingService.js` handles different input methods
- Validation: Different validation rules per input method

## Future Enhancements

Possible future improvements:
- [ ] Detect and handle NDJSON (newline-delimited JSON) format markers
- [ ] Support for other multiline formats (e.g., JSON Lines)
- [ ] Remember user's preferred mode per session
- [ ] Allow users to disable auto-detection in settings
