# Quick Reference: Policy Attribute Handling in Update Mode

## Policy Attributes: Edit vs. Preserve

| Attribute | Editable by User? | How It's Handled | Notes |
|-----------|-------------------|------------------|-------|
| **name** | ✅ Yes | Pre-filled from upload, user can edit | Shows in Step 1, required field |
| **description** | ❌ No (currently) | Preserved from upload | Could be made editable if needed |
| **group** | ❌ No | Auto-preserved from upload | No UI, transparent to user |
| **grouporder** | ❌ No | Auto-preserved from upload | No UI, transparent to user |
| **lookup** | ❌ No | Auto-preserved from upload | JSON object, preserved as-is |
| **filter** | ✅ Yes | User configures in Step 4 | Can modify uploaded value |
| **schemarule** | ✅ Yes | User configures in Step 3 | Can modify uploaded value |
| **transforms** | ✅ Yes | User configures in Step 5 | Can modify uploaded value |
| **subtransforms** | ✅ Yes | User configures in Step 6 | Can modify uploaded value |

## Code Locations

### Policy Name Editing
- **Component**: `Step1_Introduction.vue`
- **Input Field**: Line ~40 (v-if shows in update mode)
- **Validation**: Line ~560 (validateAllFields method)
- **Info Banner**: Line ~152 (shows when name changed)

### Group/GroupOrder/Lookup Preservation
- **Component**: `Step7_Export.vue`
- **Vuex Mapping**: Line ~503 (added policyUpload)
- **Preservation Logic**: Line ~612-630 (generatePolicyObject method)
- **Console Logs**: Lines 619, 624, 629

## Console Messages

When working with update mode, you'll see these console messages:

```
[Step 7] generatePolicyObject called - subTransforms: {...}
[Step 7] Preserving group attribute: Security Policies
[Step 7] Preserving grouporder attribute: 10
[Step 7] Preserving lookup attribute: { type: 'csv', path: '/path/to/lookup.csv', ... }
```

## User Workflow

1. **Select Update Mode** → Step 1
2. **Upload Policy File** → Step 1
3. **Edit Name (Optional)** → Step 1 (textbox appears after upload)
4. **See Info Banner** → Step 1 (if name was changed)
5. **Work Through Steps** → Steps 2-6 (configure as needed)
6. **Export Policy** → Step 7 (group/grouporder auto-included)

## Testing Commands

```javascript
// Check if group is preserved
console.log('Group:', policy.group)

// Check if grouporder is preserved  
console.log('GroupOrder:', policy.grouporder)

// Check if lookup is preserved
console.log('Lookup:', policy.lookup)

// Check if name was updated
console.log('Name changed:', policy.name !== uploadedPolicy.name)
```

## Files to Review

1. **POLICY_NAME_EDIT_IN_UPDATE_MODE.md** - Name editing details
2. **POLICY_GROUP_ATTRIBUTES_PRESERVATION.md** - Group preservation details
3. **UPDATE_MODE_ENHANCEMENTS_SUMMARY.md** - Complete overview
4. **This file** - Quick reference

## Common Questions

**Q: Can users edit group, grouporder, or lookup?**  
A: No, these are automatically preserved. No UI is provided for editing.

**Q: What happens if uploaded policy has no group/lookup?**  
A: Nothing - these attributes are only added if they exist in the uploaded policy.

**Q: What if the lookup object is very complex?**  
A: The entire `lookup` object is copied as-is, preserving all nested properties and structure.

**Q: Can I add more auto-preserved attributes?**  
A: Yes, follow the same pattern in `generatePolicyObject()` method.

**Q: Does this work in create mode?**  
A: Group/grouporder/lookup preservation only works in update mode. Create mode doesn't add these.

**Q: Is the policy name required in update mode?**  
A: Yes, validation ensures a name is provided before proceeding.
