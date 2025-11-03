# Quick Testing Guide - Nested Arrays Fix

## Quick Start

### 1. Start Development Server
```bash
npm run dev
```

### 2. Navigate to Wizard
Open browser and go to the wizard interface.

### 3. Step 1 - CloudTrail Configuration
Fill in required fields (can use dummy data for testing).

### 4. Step 2 - Sample Data Upload
Paste the following newline-delimited JSON:

```json
{"timestamp": "2025-10-24T12:00:00Z", "event": "user_data_sync", "data": {"users": [{"id": 1, "name": "Manish Bhatnagar", "email": "manish@example.com", "orders": [{"orderId": "ORD1001", "date": "2025-10-20", "items": [{"productId": "P101", "name": "Laptop", "quantity": 1, "tags": ["electronics", "computers"]}]}, {"orderId": "ORD1002", "date": "2025-10-22", "items": [{"productId": "P202", "name": "Mouse", "quantity": 2, "tags": ["electronics", "accessories"]}, {"productId": "P303", "name": "Keyboard", "quantity": 1, "tags": ["electronics", "accessories"]}]}]}, {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "orders": [{"orderId": "ORD2001", "date": "2025-10-21", "items": [{"productId": "P404", "name": "Monitor", "quantity": 1, "tags": ["electronics", "displays"]}]}]}], "metadata": {"totalUsers": 2, "syncTime": "2025-10-24T12:00:00Z"}}}
{"timestamp": "2025-10-24T13:00:00Z", "event": "user_data_sync", "data": {"users": [{"id": 3, "name": "Bob Johnson", "email": "bob@example.com", "orders": []}], "metadata": {"totalUsers": 1, "syncTime": "2025-10-24T13:00:00Z"}}}
{"timestamp": "2025-10-24T14:00:00Z", "event": "user_data_sync", "data": {"users": [], "metadata": {"totalUsers": 0, "syncTime": "2025-10-24T14:00:00Z"}}}
```

Click "Continue" to proceed to Step 3.

### 5. Step 3 - Schema Configuration
This is where the fix should be visible!

## What to Verify

### ✅ Visual Checks

1. **Tree Structure Appears**
   - Should see expandable tree view
   - Not just a flat list

2. **Nested Arrays Visible**
   - [ ] `data.users` array shows with checkbox
   - [ ] Expand `data.users[0]` to see nested content
   - [ ] `data.users[0].orders` array shows with checkbox
   - [ ] Expand `data.users[0].orders[0]` to see nested content
   - [ ] `data.users[0].orders[0].items` array shows with checkbox
   - [ ] Expand `data.users[0].orders[0].items[0]` to see nested content
   - [ ] `data.users[0].orders[0].items[0].tags` array shows with checkbox

3. **Array Badges**
   - Each array should show metadata badge: "Array (X items)"
   - Example: "users Array (2 items)"

4. **Checkboxes**
   - Each array should have a checkbox for fanout selection
   - Checkboxes should be clickable
   - Selected arrays should appear in "Selected Arrays for Fanout" section below

5. **Indentation/Hierarchy**
   - Nested arrays should be indented more than parent arrays
   - Clear visual hierarchy showing parent-child relationships

### ✅ Console Checks

Open browser DevTools Console (F12) and look for:

```
✅ Expected Logs:

filterToArraysOnly - Input data: Array(3)
filterToArraysOnly - Array paths: ["[0].data.users", "[0].data.users[0].orders", ...]
filterToArraysOnly - Source data (from first item): {timestamp: "...", event: "...", data: {...}}
  Normalized path: [0].data.users -> data.users
  Normalized path: [0].data.users[0].orders -> data.users[0].orders
  Normalized path: [0].data.users[0].orders[0].items -> data.users[0].orders[0].items
  Normalized path: [0].data.users[0].orders[0].items[0].tags -> data.users[0].orders[0].items[0].tags
filterToArraysOnly - Normalized paths: ["data.users", "data.users[0].orders", ...]
Processing normalized path: data.users
  Found array at data.users, length: 2
  Added array and its parent structure at data.users
Processing normalized path: data.users[0].orders
  Found array at data.users[0].orders, length: 2
  Added array and its parent structure at data.users[0].orders
...
filterToArraysOnly - Output: {data: {users: Array(2)}}
Normalized array paths: ["data.users", "data.users[0].orders", ...]
```

### ✅ Interaction Checks

1. **Array Selection**
   - [ ] Click checkbox next to `data.users`
   - [ ] "Selected Arrays for Fanout" section updates
   - [ ] Shows "data.users" in the list

2. **Multiple Selections**
   - [ ] Select multiple nested arrays
   - [ ] Each selection adds to the list
   - [ ] Can deselect by clicking checkbox again

3. **Schema Rule Preview**
   - [ ] Expand "Preview Generated Schema Rule"
   - [ ] Should see JSON with `childfanouts` array
   - [ ] Selected arrays should appear with proper JSONPath format

## Expected Tree Display

```
root Object
└─▼ data Object
    ├─☐ users Array (2 items)               ← CHECKBOX HERE
    │   └─▼ [0] Object
    │       ├── id: 1
    │       ├── name: "Manish Bhatnagar"
    │       ├── email: "manish@example.com"
    │       └─☐ orders Array (2 items)      ← CHECKBOX HERE
    │           └─▼ [0] Object
    │               ├── orderId: "ORD1001"
    │               ├── date: "2025-10-20"
    │               └─☐ items Array (1 item) ← CHECKBOX HERE
    │                   └─▼ [0] Object
    │                       ├── productId: "P101"
    │                       ├── name: "Laptop"
    │                       ├── quantity: 1
    │                       └─☐ tags Array (2 items) ← CHECKBOX HERE
    │                           ├─ [0] "electronics"
    │                           └─ [1] "computers"
    └── metadata Object
        ├── totalUsers: 2
        └── syncTime: "2025-10-24T12:00:00Z"
```

## Common Issues

### Issue: No Arrays Shown
**Check:**
- Is Step 2 data properly loaded?
- Check console for errors
- Verify `sampleData.parsedData` exists in Vue DevTools

### Issue: Only Root Array Shown
**Check:**
- This was the original bug - make sure the fix is applied
- Check `filterToArraysOnly` function has the new code
- Look for normalization logs in console

### Issue: Checkboxes Not Working
**Check:**
- Are `normalizedArrayPaths` being passed correctly?
- Check for JavaScript errors in console
- Verify event handlers are connected

### Issue: Paths Look Wrong (e.g., "[0].data.users")
**Check:**
- Should be normalized to "data.users"
- Check `normalizedArrayPaths` computed property
- Verify template uses normalized paths in array mode

## Success Criteria

All of the following must be true:

- [x] Tree view displays hierarchical structure
- [x] At least 4 levels of nested arrays visible:
  1. `data.users`
  2. `data.users[0].orders`
  3. `data.users[0].orders[0].items`
  4. `data.users[0].orders[0].items[0].tags`
- [x] Each array has a checkbox
- [x] Checkboxes are clickable and functional
- [x] Selected arrays appear in the "Selected Arrays" list
- [x] Paths are normalized (no "[0]." prefix in display)
- [x] Console logs show proper normalization
- [x] No JavaScript errors in console
- [x] Schema rule preview shows correct paths

## Minimal Test Case

If you want a simpler test:

```json
{"data": {"users": [{"orders": [{"items": [{"tags": ["a", "b"]}]}]}]}}
```

Should show:
- ☐ data.users
  - ☐ data.users[0].orders
    - ☐ data.users[0].orders[0].items
      - ☐ data.users[0].orders[0].items[0].tags

## Debugging Commands

### View Vuex State
```javascript
// In browser console
$store.state.wizard.sampleData.parsedData
```

### View Component Data
```javascript
// Using Vue DevTools
// 1. Open Vue DevTools
// 2. Navigate to Components
// 3. Find JsonTreeViewer component
// 4. Check computed properties:
//    - arrayPaths
//    - normalizedArrayPaths
//    - processedData
```

### Manual Console Test
```javascript
// In browser console
// Copy and test the filterToArraysOnly logic
const testData = [
  {
    data: {
      users: [
        { orders: [{ items: [{ tags: ["a"] }] }] }
      ]
    }
  }
];

// Check what arrays are detected
console.log('Test data:', testData);
```

## Notes

- The root array (containing the 3 JSON objects) itself should NOT have a checkbox
- Only arrays INSIDE the data structure should be selectable
- Paths in the "Selected Arrays" list should NOT have "[0]." prefix
- The generated schema rule should use proper JSONPath format
