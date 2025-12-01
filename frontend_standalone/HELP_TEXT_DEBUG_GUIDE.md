# Help Text Debugging Guide

## If Help Text is STILL Not Visible

If after implementing the fix, help text is still not visible, follow these debugging steps:

---

## Step 1: Browser DevTools Inspection

### Open Modal and Inspect Element

1. Open browser DevTools (F12)
2. Navigate to Step 6 → Click "Add Mapping"
3. Right-click on an input field → Inspect

### Check DOM Structure

Look for this structure:
```html
<div class="q-field">
  <div class="q-field__control">
    <!-- Input field here -->
  </div>
  <div class="q-field__bottom">
    <div class="q-field__messages">
      <div>
        <span class="custom-hint-text">Help text here</span>
      </div>
    </div>
  </div>
</div>
```

### Verify Elements Exist

- ✅ `.q-field__bottom` div exists
- ✅ `.q-field__messages` div exists
- ✅ `<span class="custom-hint-text">` exists
- ✅ Text content is present inside span

---

## Step 2: Check CSS Computed Styles

### Inspect `.custom-hint-text` Element

In DevTools, select the `<span class="custom-hint-text">` element and check computed styles:

**Expected Values**:
```css
display: block !important;
visibility: visible !important;
opacity: 1 !important;
color: rgba(0, 0, 0, 0.8);
font-size: 12px;
line-height: 1.4;
padding-top: 2px;
```

**Check for Override Issues**:
- Look for strikethrough styles (overridden)
- Check if any rule has higher specificity
- Look for `display: none` anywhere in the chain

---

## Step 3: Check Parent Container Styles

### Inspect `.q-field__bottom` Element

**Expected Values**:
```css
display: block !important;
visibility: visible !important;
opacity: 1 !important;
min-height: 20px;
overflow: visible !important;
```

**Potential Issues**:
- `display: none` ❌
- `visibility: hidden` ❌
- `opacity: 0` ❌
- `height: 0` ❌
- `max-height: 0` ❌
- `overflow: hidden` ❌ (would clip content)

---

## Step 4: Check for Z-Index Issues

### In DevTools Computed Styles

Check if help text is being rendered behind other elements:

1. Select `.custom-hint-text` element
2. Check computed `z-index` value
3. Check parent elements' `z-index`
4. Look for `position: absolute` or `position: fixed` issues

**Fix if needed**:
```css
.custom-hint-text {
  position: relative;
  z-index: 10;
}
```

---

## Step 5: Check for Color Contrast Issues

### Verify Text is Not Matching Background

**In DevTools**:
1. Select `.custom-hint-text` element
2. Check computed `color` value: should be `rgba(0, 0, 0, 0.8)`
3. Check parent `background-color`: should be whitesmoke or transparent

**If text color matches background**:
```css
.custom-hint-text {
  color: #000000 !important; /* Pure black */
  background-color: rgba(255, 255, 0, 0.2) !important; /* Temporary yellow highlight */
}
```

---

## Step 6: Check Console for Errors

### Look for Vue/Quasar Errors

In DevTools Console, check for:
- Vue component errors
- Quasar plugin errors
- Template compilation errors
- JavaScript errors preventing render

**Common Issues**:
```
[Vue warn]: Error in render...
[Quasar] ...
Uncaught TypeError...
```

---

## Step 7: Verify Vue Slots are Working

### Add Debug Slot Content

Temporarily modify a hint slot:
```vue
<template v-slot:hint>
  <div style="background: red; color: white; padding: 10px;">
    DEBUG: Can you see this red box?
  </div>
</template>
```

**If you CAN'T see the red box**:
- Problem is with Vue slot rendering
- Check Quasar version compatibility
- Check if `v-slot` syntax is supported

**If you CAN see the red box**:
- Problem is with CSS styling
- Go back to Step 2 and fix CSS

---

## Step 8: Check for Global CSS Conflicts

### Search for Conflicting Rules

In DevTools, search for CSS rules affecting:
- `.q-field__bottom`
- `.q-field__messages`
- `.custom-hint-text`

**Common Conflicts**:
```css
/* BAD: Too broad */
.q-dialog * {
  display: none; /* Would hide everything */
}

/* BAD: Hiding hint text */
.q-field__bottom {
  display: none;
  visibility: hidden;
}

/* BAD: Making text invisible */
* {
  opacity: 0;
}
```

---

## Step 9: Nuclear Option - Inline Styles

If all else fails, use inline styles directly in template:

```vue
<template v-slot:hint>
  <span
    style="
      color: rgba(0, 0, 0, 0.8) !important;
      font-size: 12px !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      background: yellow !important;
      padding: 5px !important;
      margin-top: 5px !important;
    "
  >
    Help text here
  </span>
</template>
```

**If this works**: Problem is CSS specificity
**If this doesn't work**: Problem is with Vue/Quasar slot rendering

---

## Step 10: Alternative Solution - Custom Div

If Quasar slots are completely broken, use a custom div outside the field:

```vue
<div class="col-12">
  <q-input
    v-model="transformForm.inputRule"
    label="Source Field (JSON Path) *"
    outlined
    dense
  />
  <!-- Custom help text div -->
  <div class="manual-hint-text">
    JSON path to the source field
  </div>
</div>
```

**CSS**:
```scss
.manual-hint-text {
  color: rgba(0, 0, 0, 0.8);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
  padding-left: 12px; /* Align with input content */
}
```

---

## Debugging Checklist

Use this checklist to systematically debug:

- [ ] Help text elements exist in DOM
- [ ] `.custom-hint-text` element is rendered
- [ ] `display` is not `none`
- [ ] `visibility` is not `hidden`
- [ ] `opacity` is not `0`
- [ ] `color` has contrast with background
- [ ] No `overflow: hidden` clipping content
- [ ] No z-index issues hiding text
- [ ] No console errors
- [ ] Vue slots are working (red box test)
- [ ] No global CSS conflicts
- [ ] Inline styles work (nuclear test)

---

## Report Back to Tech Lead

If issue persists after all debugging steps, provide:

1. **Screenshots** of:
   - Modal with missing help text
   - DevTools Elements panel showing DOM structure
   - DevTools Computed styles for `.custom-hint-text`
   - DevTools Console showing any errors

2. **Information**:
   - Which debugging steps were performed
   - What was found at each step
   - Any errors or warnings in console
   - Browser and version being used

3. **DOM Structure**:
   - Copy the HTML structure of one field from DevTools
   - Include all parent elements up to `.q-dialog`

---

## Quick CSS Override for Testing

If you need help text IMMEDIATELY and debugging can wait, use this override in `quasar.variables.scss` or global CSS:

```scss
// TEMPORARY: Force all hint text visible
.transform-editor-modal {
  .q-field__bottom,
  .q-field__messages,
  .q-field__messages div,
  .custom-hint-text {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    color: #000000 !important;
    background-color: yellow !important; // Temporary highlight
    font-size: 12px !important;
    min-height: 20px !important;
    padding: 5px !important;
    margin-top: 5px !important;
  }
}
```

This will make help text VERY visible (yellow background) for immediate verification.
