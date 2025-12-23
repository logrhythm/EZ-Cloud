# Quick Reference: Multiline JSON Auto-Detection

## What It Does
Automatically detects when you paste or upload multiple JSON objects (one per line) and switches to the correct input mode.

## How It Works

### Manual Input Tab
```
Paste:
{"event": "log1"}
{"event": "log2"}
{"event": "log3"}

Result: ✅ Auto-switches to "Multiple Logs" tab
```

### File Upload Tab
```
Upload file with:
{"event": "log1"}
{"event": "log2"}
{"event": "log3"}

Result: ✅ Auto-switches to "Multiple Logs" tab
```

### Single JSON
```
Paste:
{
  "event": "log entry",
  "data": {...}
}

Result: ✅ Stays in "Manual Input" tab
```

## Detection Rules

**Switches to Multiple Logs when:**
- ≥2 lines contain valid JSON objects
- Valid JSON lines > Invalid lines

**Stays in Manual Input when:**
- Single JSON object or array
- Unable to parse as valid JSON

## Visual Feedback

**When auto-switch happens:**
- 🔵 Tab automatically changes to "Multiple Logs"
- 💬 Notification: "Multiple JSON objects detected - switched to Multiple Logs mode"
- 📊 Shows line count and valid object count

## Examples

### ✅ Will Auto-Switch (Multiline Detected)
```json
{"id":1,"name":"Alice"}
{"id":2,"name":"Bob"}
{"id":3,"name":"Charlie"}
```

### ❌ Won't Auto-Switch (Single JSON)
```json
{
  "users": [
    {"id":1,"name":"Alice"},
    {"id":2,"name":"Bob"}
  ]
}
```

### ❌ Won't Auto-Switch (JSON Array)
```json
[
  {"id":1,"name":"Alice"},
  {"id":2,"name":"Bob"}
]
```

## Console Messages
When debugging, look for:
```
[detectInputMethod] Detected multiline: 5 valid JSON objects
=== Step 2: Switching to multiple input method (multiline detected) ===
```

## Manual Override
You can still manually select any tab:
- **Manual Input**: For single JSON object/array
- **File Upload**: For uploading files
- **Multiple Logs**: For newline-delimited JSON

The auto-detection just helps you get to the right mode faster!

## Testing Quick Check
1. Paste 3 JSON objects (one per line) into Manual Input
2. Should see: Tab switches + Notification appears + Valid count shown
3. Result: ✅ Working correctly
