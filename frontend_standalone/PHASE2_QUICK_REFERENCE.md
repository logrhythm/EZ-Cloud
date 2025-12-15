# Phase 2 Quick Reference Card

## 🚀 Quick Start

### What is Phase 2?
Auto-fills Step 3 (Schema Configuration) from uploaded policy when in "Update" mode.

### When Does It Run?
- User selects "Update" mode in Step 1
- Uploads a valid policy file
- Navigates to Step 3
- Step 3 has no existing data

---

## 📁 Files Changed

| File | Lines | What Changed |
|------|-------|--------------|
| `wizardModule.js` | 460-475 | Added 3 new mutations |
| `Step3_SchemaConfig.vue` | 1103-1185, 709-852 | Added mounted hook + prefillFromPolicy method |

---

## 🔧 New Mutations

```javascript
// Store child fanout configurations
this.$store.commit('wizard/SET_CHILD_FANOUTS', childFanouts)

// Store convert-to-JSON fields
this.$store.commit('wizard/SET_CONVERT_TO_JSON_FIELDS', fields)

// Store schema type (future use)
this.$store.commit('wizard/SET_SCHEMA_TYPE', 'multiline')
```

---

## 🎯 Key Method

```javascript
async prefillFromPolicy(schemaRule) {
  // 1. Extract convertToJson fields
  // 2. Extract fanout paths
  // 3. Extract child fanouts
  // 4. Update component state
  // 5. Update Vuex store
  // 6. Show notification
}
```

**Call from:** `mounted()` lifecycle hook
**Parameters:** `schemaRule` object from policy
**Returns:** Nothing (updates state)

---

## 📊 Policy Structure

```json
{
  "schemaRule": {
    "fanout": {
      "inputField": ["$.path[*]"]
    },
    "convertoJson": ["$.field1", "$.field2"],
    "childfanouts": [
      {
        "field": "$.parent[*]",
        "parentpath": null
      },
      {
        "field": "$.child[*]",
        "parentpath": "$.parent[*]"
      }
    ]
  }
}
```

---

## 🔍 Console Commands

### Check Mode
```javascript
vm.$store.state.wizard.projectConfig.mode
// Returns: "create" or "update"
```

### Check Policy Data
```javascript
vm.$store.state.wizard.policyUpload.uploadedPolicyData
// Returns: Policy object or null
```

### Check Schema Rules
```javascript
vm.$store.state.wizard.schemaRules
// Returns: { convertToJson: [...], fanout: [...], childfanouts: [...] }
```

### Check Component State
```javascript
vm.selectedConvertToJsonFields  // Array of paths
vm.selectedFanoutFields         // Array of paths
vm.fanoutCandidates            // Array of candidates
vm.convertToJsonCandidates     // Array of candidates
```

### Manually Trigger Pre-fill
```javascript
const schemaRule = vm.$store.state.wizard.policyUpload.uploadedPolicyData.schemaRule
await vm.prefillFromPolicy(schemaRule)
```

---

## 📝 Console Logs

### Look for These Patterns

**Pre-fill Start:**
```
[Step 3] Update mode detected with policy data - initiating pre-fill
```

**Field Extraction:**
```
[Step 3] Extracted convertToJson fields: [...]
[Step 3] Extracted fanout path: $.events[*]
```

**Pre-fill Complete:**
```
[Step 3] Pre-fill completed successfully
```

**Skip Pre-fill:**
```
[Step 3] Step 3 already has data, skipping pre-fill
```

---

## ✅ Testing Checklist

- [ ] Upload policy with fanout only
- [ ] Upload policy with convertToJson only
- [ ] Upload policy with both
- [ ] Upload policy with child fanouts
- [ ] Navigate back (data preserved?)
- [ ] Switch to Create mode (data cleared?)
- [ ] Check console logs
- [ ] Verify Vuex state

---

## 🐛 Common Issues

### Pre-fill Not Running
**Check:**
1. Mode is "update"
2. Policy has schemaRule
3. Sample data uploaded
4. No existing Step 3 data

### Fields Not Pre-filled
**Check:**
1. Fields exist in sample data
2. Path formats match
3. Console for warnings
4. Candidates populated

### Selections Lost
**Check:**
1. Vuex state updated
2. beforeDestroy saves data
3. created() restores data

---

## 🎨 UI Indicators

### Convert-to-JSON Section
```
[✓] $.metadata     ← Pre-checked
[✓] $.payload      ← Pre-checked
[ ] $.other        ← Not in policy
```

### Fanout Section
```
● events[*]        ← Pre-selected
○ logs[*]          ← Not in policy
```

### Notifications
```
✓ Schema configuration loaded from policy
  2 string-to-JSON fields, 3 fanout arrays
```

---

## 🔄 Data Flow

```
Policy Upload → Vuex Store → Navigate to Step 3 → mounted() →
Check Mode → prefillFromPolicy() → Extract Data →
Validate → Update State → Update Vuex → Refresh UI → Notify
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `PHASE2_IMPLEMENTATION_SUMMARY.md` | Executive overview |
| `PHASE2_STEP3_PREFILL_IMPLEMENTATION.md` | Detailed technical guide |
| `PHASE2_TESTING_GUIDE.md` | Step-by-step testing |
| `PHASE2_QUICK_REFERENCE.md` | This document |

---

## 🚦 Decision Tree

```
Navigate to Step 3
    │
    ├─ Has existing data? ─ YES ─→ Skip pre-fill
    │
    └─ NO
        │
        ├─ Mode = "create"? ─ YES ─→ Skip pre-fill
        │
        └─ NO (mode = "update")
            │
            ├─ Policy schemaRule exists? ─ NO ─→ Skip pre-fill
            │
            └─ YES ─→ Run prefillFromPolicy()
```

---

## 💡 Quick Tips

1. **Always check console** - Logging is comprehensive
2. **Vuex DevTools** - Shows state changes in real-time
3. **Test with real policies** - Use actual policy files
4. **Check candidates first** - Fields must exist in sample data
5. **Path normalization** - Multiple formats handled automatically

---

## 📞 Support

- **Detailed Docs:** See implementation guide
- **Testing:** See testing guide
- **Issues:** Check console logs first
- **Contact:** Frontend Tech Lead

---

## 🎯 Success Criteria

| Feature | Status |
|---------|--------|
| Detects Update mode | ✅ |
| Auto-selects fanout | ✅ |
| Pre-checks convertToJson | ✅ |
| Scans nested arrays | ✅ |
| Updates Vuex | ✅ |
| Preserves modifications | ✅ |
| Handles errors | ✅ |
| No Create regression | ✅ |

---

## 🔗 Related Phases

- **Phase 1:** Policy upload and validation ✅
- **Phase 2:** Step 3 pre-fill ✅ (Current)
- **Phase 3:** Step 4 filter rules pre-fill 🔜
- **Phase 4:** Step 5 field mappings pre-fill 🔜
- **Phase 5:** Step 6 subtransforms pre-fill 🔜

---

**Last Updated:** December 12, 2025
**Version:** 1.0.0
**Branch:** installWizard-fresh
