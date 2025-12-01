# SubTransform Configuration (Step 6) - Complete Design Specification

**Project:** LogRhythm EZ-Cloud Policy Builder
**Component:** Installation Wizard - Step 6
**Date:** 2025-11-24
**Status:** Ready for Implementation

---

## Executive Summary

This document provides the complete design specification for Step 6 (SubTransform Configuration) of the policy builder installation wizard. It consolidates UX design, visual/UI design, and interaction design into a single comprehensive reference for the frontend development team.

### What is SubTransform?

SubTransform is an advanced conditional mapping feature that allows different field mappings to be applied based on runtime conditions. Each SubTransform contains:
- **Condition:** A filter expression (e.g., `@.type == 'access'`)
- **Transforms:** An array of field mappings (same structure as Step 5)
- **ExitOnMatch:** Boolean flag controlling execution flow
- **SubTransForms:** Optional nested SubTransforms (recursive)

### Design Philosophy

The design prioritizes:
1. **Clarity:** Conditions and execution order are immediately visible
2. **Progressive Disclosure:** Collapsed by default, expand on demand
3. **Component Reuse:** Leverages existing Step 3 (Filter) and Step 5 (Mapping) components
4. **Accessibility:** Full keyboard navigation, screen reader support, WCAG AAA compliance
5. **Visual Hierarchy:** Color-coded depth, numbered execution order, clear nesting indicators

---

## Table of Contents

1. [User Experience Design](#1-user-experience-design)
2. [Visual/UI Design](#2-visualui-design)
3. [Interaction Design](#3-interaction-design)
4. [Implementation Guide](#4-implementation-guide)
5. [Testing & Validation](#5-testing--validation)
6. [Appendices](#6-appendices)

---

## 1. USER EXPERIENCE DESIGN

### 1.1 User Workflow

**Entry to Step 6:**
```
User completes Step 5 (Field Mapping)
    ↓
Arrives at Step 6
    ↓
Sees Empty State OR Existing SubTransforms
    ↓
Decision: Skip SubTransforms or Configure?
```

**Creating a SubTransform:**
```
1. Click "Add SubTransform" button
2. New card appears (expanded state)
3. Define Condition using Filter Builder (reused from Step 3)
4. Configure ExitOnMatch toggle (default: OFF)
5. Add Field Mappings using Mapping UI (reused from Step 5)
6. Optionally add Nested SubTransforms
7. Collapse card to see summary
8. Repeat for additional SubTransforms
```

**Testing SubTransforms:**
```
1. Click "Test" button (top-right)
2. Load sample data (from Step 2 or custom)
3. Run test
4. View execution trace showing which SubTransforms matched
5. Verify final output
6. Adjust SubTransforms if needed
```

### 1.2 Empty State Design

When user first enters Step 6:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [Icon: sitemap, 96x96]                   │
│                                                             │
│              No SubTransforms Configured                    │
│                                                             │
│  SubTransforms apply conditional logic to transform fields  │
│  based on parsed data. Add your first SubTransform to       │
│  create dynamic field mappings.                             │
│                                                             │
│  Common Use Cases:                                          │
│  • Route different event types to different field structures│
│  • Add extra fields only when severity is high              │
│  • Handle vendor-specific data variations                   │
│                                                             │
│  [ ] Skip SubTransforms (use only base transforms)         │
│                                                             │
│  [+ Add First SubTransform]  [Browse Templates]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Design Rationale:**
- Educational first: explains what SubTransforms do
- Provides escape hatch: "Skip SubTransforms" option
- Reduces blank canvas syndrome: offers templates
- Sets context: shows common use cases

### 1.3 SubTransform Card Structure

**Collapsed State:**
```
┌────────────────────────────────────────────────────────────┐
│ ⠿ #1 SubTransform: Login Events         [↑][↓][×][⋮] [▼] │
├────────────────────────────────────────────────────────────┤
│ Condition: @.type == "login"                               │
│ Transforms: 3 | ExitOnMatch: ✓ | Nested: 2                │
└────────────────────────────────────────────────────────────┘
```

**Expanded State:**
```
┌────────────────────────────────────────────────────────────┐
│ ⠿ #1 SubTransform: Login Events         [↑][↓][×][⋮] [▲] │
├────────────────────────────────────────────────────────────┤
│ CONDITION                                         [Edit]   │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ @.type == "login" AND @.status == "active"          │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ EXIT ON MATCH                                     [i]      │
│ [●─────○] Stop processing after this SubTransform matches │
│  ON                                                        │
│                                                            │
│ FIELD MAPPINGS (3)                        [+ Add] [▼]     │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ source_ip → destination.ip                      [×]  │  │
│ │ event_time → @timestamp                         [×]  │  │
│ │ severity → alert.severity                       [×]  │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ NESTED SUBTRANSFORMS (2)                  [+ Add] [▼]     │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│ │  ⠿ #1.1 SubTransform: Failed Logins    [↑][↓][×]   │  │
│ │  [Content...]                                        │  │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 1.4 Execution Flow Visualization

Optional modal/panel showing how SubTransforms execute:

```
                      ┌──────────────────┐
                      │ Base Transforms  │
                      │   (from Step 5)  │
                      └──────────────────┘
                               ↓
                      ┌──────────────────┐
                 ┌───→│ SubTransform #1  │
                 │    │ "Login Events"   │
                 │    └──────────────────┘
                 │             ↓
                 │      MATCHED? [YES]
                 │             ↓
                 │     Apply Transforms
                 │             ↓
                 │      Exit:YES → [DONE]
                 │         NO ↓
                 │    ┌──────────────────┐
                 └────│ SubTransform #2  │
                      │ "High Severity"  │
                      └──────────────────┘
```

### 1.5 Validation Rules

**Field-Level Validation:**
| Field | Rule | Error Message | When |
|-------|------|---------------|------|
| Condition | Must be valid JSONPath | "Invalid condition syntax" | On blur |
| Condition | Must reference existing fields | "Field not found in sample data" | On save |
| Transforms | At least one required | "Add at least one transform" | On collapse/save |
| ExitOnMatch | Must be explicitly set | "Specify if processing should exit" | On save |

**Warning System:**
- No SubTransform has ExitOnMatch: true → Warning: "All SubTransforms will execute"
- 8+ SubTransforms → Performance warning
- Circular references in nested → Critical error

### 1.6 Testing Panel Design

**Layout:** Side panel (desktop) or bottom sheet (mobile)

```
┌─────────────────────────────────────────┐
│ Test SubTransforms              [×]     │
├─────────────────────────────────────────┤
│ Sample Input Data                       │
│ ┌─────────────────────────────────────┐ │
│ │ {                                   │ │
│ │   "type": "login",                  │ │
│ │   "status": "active",               │ │
│ │   "severity": 5                     │ │
│ │ }                                   │ │
│ └─────────────────────────────────────┘ │
│ [Load from Step 2] [Run Test]           │
├─────────────────────────────────────────┤
│ Execution Results:                      │
│                                         │
│ ✓ Base Transforms                       │
│   Applied 5 mappings                    │
│                                         │
│ ✓ SubTransform #1                       │
│   Condition: MATCHED                    │
│   Applied 3 mappings                    │
│   Exit: YES → Stopped                   │
│                                         │
│ ○ SubTransform #2                       │
│   Condition: NOT MATCHED                │
│   Skipped                               │
│                                         │
│ [View Final Output JSON]                │
└─────────────────────────────────────────┘
```

---

## 2. VISUAL/UI DESIGN

### 2.1 Color Palette

**Light Mode:**
- Primary: `#1976D2` (Blue 700)
- Success: `#388E3C` (Green 700)
- Warning: `#F57C00` (Orange 700)
- Error: `#D32F2F` (Red 700)
- Info (ExitOnMatch): `#FF6F00` (Amber 900)
- Background: `#FAFAFA` (Grey 50)
- Surface: `#FFFFFF` (White)
- Border: `#E0E0E0` (Grey 300)
- Text Primary: `#212121` (Grey 900)
- Text Secondary: `#616161` (Grey 700)

**Dark Mode:**
- Background: `#1E1E1E`
- Surface: `#2C2C2C`
- Border: `#424242`
- Text Primary: `#E0E0E0`
- Primary: `#42A5F5` (lighter blue)
- Success: `#66BB6A` (lighter green)

**Nesting Depth Colors:**
- Level 0: No accent (root)
- Level 1: `#42A5F5` (Blue 400) - Left border 3px
- Level 2: `#66BB6A` (Green 400) - Left border 3px
- Level 3: `#FFA726` (Orange 400) - Left border 3px
- Level 4+: `#AB47BC` (Purple 400) - Left border 3px

### 2.2 Typography

**Font Families:**
- UI Text: `'Roboto', 'Helvetica Neue', Arial, sans-serif`
- Code/Conditions: `'Roboto Mono', 'Courier New', monospace`

**Type Scale:**
- Page Title (H1): 32px, weight 500
- Card Title (H2): 16px, weight 600
- Section Headers (H3): 12px, weight 700, uppercase, letter-spacing 0.5px
- Body 1: 14px, weight 400, line-height 1.6
- Body 2: 13px, weight 400, line-height 1.5
- Caption: 12px, weight 400, line-height 1.4
- Code: 13px, weight 400, font-family Roboto Mono

### 2.3 Spacing Scale (8px base)

```
XXS:  4px   (0.5 × base)
XS:   8px   (1 × base)
SM:  12px   (1.5 × base)
MD:  16px   (2 × base)
LG:  24px   (3 × base)
XL:  32px   (4 × base)
XXL: 48px   (6 × base)
```

**Component Spacing:**
- Card margin-bottom: 16px (MD)
- Card padding: 20px horizontal, 16px vertical
- Nested indentation per level: 24px (LG)
- Section internal spacing: 12px 20px

### 2.4 Card Visual Specs

**Root Level Card:**
- Border: `1px solid #E0E0E0`
- Border-radius: `8px`
- Background: `#FFFFFF`
- Box-shadow: `0 2px 4px rgba(0,0,0,0.08)`
- Hover: Background shifts to `#F5F5F5`

**Card Header:**
- Height: `56px`
- Background: `#F5F5F5`
- Border-bottom: `1px solid #E0E0E0`

**Nested Cards:**
- Level 1: Margin-left `24px`, border `1px dashed #BDBDBD`, background `#FAFAFA`
- Level 2: Margin-left `48px`, border `1px dashed #BDBDBD`, background `#F5F5F5`
- Level 3: Margin-left `72px`, border `1px dashed #BDBDBD`, background `#EEEEEE`

### 2.5 ExitOnMatch Toggle Design

**Visual Styling:**
```
OFF state:  [   ○     ] Exit on Match
ON state:   [     ●   ] Exit on Match (green-6)
```

**Section Background:**
- Background: `#FFF3E0` (amber tint) in light mode
- Background: `#3E2723` (dark brown) in dark mode
- Border-top/bottom: `1px solid #FFE0B2`
- Left border accent: `3px solid #FF6F00` when ON

**Toggle Specs:**
- Track width: `48px`, height: `24px`
- Thumb size: `20px`
- Color ON: `#FF6F00` (amber-orange)
- Color OFF: `#BDBDBD` (grey)

### 2.6 Condition Display

**Syntax Highlighting:**
- Fields: `#1976D2` (blue)
- Operators (==, !=, AND, OR): `#F57C00` (orange)
- Values (strings, numbers): `#388E3C` (green)
- Parentheses: `#616161` (grey)

**Container:**
- Border: `1px solid #E0E0E0`
- Border-radius: `4px`
- Background: `#FAFAFA`
- Padding: `12px 16px`
- Font-family: `Roboto Mono`
- Font-size: `13px`
- Min-height: `48px`

### 2.7 Icons (Material Design Icons)

**Navigation & Structure:**
- Drag handle: `mdi-drag-vertical`
- Expand: `mdi-chevron-down`
- Collapse: `mdi-chevron-up`

**Actions:**
- Add: `mdi-plus` or `mdi-plus-circle`
- Edit: `mdi-pencil-outline`
- Delete: `mdi-delete-outline`
- Reorder Up: `mdi-arrow-up`
- Reorder Down: `mdi-arrow-down`
- More: `mdi-dots-vertical`

**States:**
- Info: `mdi-information-outline`
- Warning: `mdi-alert-outline`
- Error: `mdi-alert-circle-outline`
- Success: `mdi-check-circle-outline`

### 2.8 Responsive Breakpoints

**Desktop (≥1024px):**
- Max content width: 1200px
- Card padding: 20px
- Full table views
- Max nesting: 5 levels

**Tablet (768px - 1023px):**
- Max content width: 100% - 32px margin
- Card padding: 16px
- Max nesting: 3 levels

**Mobile (<768px):**
- Max content width: 100% - 16px margin
- Card padding: 12px
- List views instead of tables
- Max nesting: 2 levels
- FAB for "Add SubTransform"

---

## 3. INTERACTION DESIGN

### 3.1 Animation Timing Standards

**Duration Guidelines:**
- Instant feedback: 100-150ms (button press, hover)
- Small transitions: 200-250ms (expand/collapse, fade)
- Medium transitions: 300-400ms (modal, panel, reorder)
- Large transitions: 400-600ms (page-level changes)

**Easing Functions:**
```javascript
const easings = {
  easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)'
};
```

### 3.2 Add SubTransform Animation

**Sequence:**
```
Duration: 400ms
Easing: cubic-bezier(0.4, 0.0, 0.2, 1)

0ms:   opacity: 0, transform: translateY(-20px) scale(0.95)
100ms: opacity: 0.3, transform: translateY(-15px) scale(0.97)
400ms: opacity: 1, transform: translateY(0) scale(1)

Simultaneous: height expansion (max-height transition)
Auto-scroll: 300ms ease-in-out if card not visible
Focus: moves to condition input field
```

### 3.3 Delete SubTransform Animation

**Simple Delete:**
```
Duration: 350ms
Easing: cubic-bezier(0.6, 0.0, 0.8, 0.2)

0ms:   opacity: 1, transform: scale(1)
150ms: opacity: 0.6, transform: scale(0.98)
350ms: opacity: 0, transform: scale(0.92) translateX(40px)

Height collapses: 300ms ease-in
Cards below: move up with 50ms stagger per card
```

**Confirmation Required:**
- Modal appears: 200ms fade-in with backdrop blur
- Cancel: ESC key or Cancel button
- Confirm: Delete button triggers exit animation

### 3.4 Expand/Collapse Animation

**Expand:**
```
Duration: 300ms
Easing: cubic-bezier(0.4, 0.0, 0.2, 1)

Chevron: rotate(0deg) → rotate(180deg)
Content area:
  0ms:   max-height: 0, opacity: 0
  50ms:  max-height: [calculated], opacity: 0
  300ms: max-height: [calculated], opacity: 1

Child elements: staggered fade (50ms delay per section)
```

**Collapse:**
```
Duration: 250ms
Easing: cubic-bezier(0.6, 0.0, 0.8, 0.2)

Chevron: rotate(180deg) → rotate(0deg)
Content area:
  0ms:   max-height: [current], opacity: 1
  100ms: max-height: [current], opacity: 0
  250ms: max-height: 0, opacity: 0
```

### 3.5 Drag-and-Drop Interaction

**Drag Start:**
```
Duration: 150ms ease-out

Card:
  scale: 1.0 → 1.03
  box-shadow: elevation-2 → elevation-8
  z-index: 10
  opacity: 1.0 → 0.9
  cursor: grabbing

Placeholder: dashed border, grey-3 background, fade-in 100ms
```

**During Drag:**
- Card follows cursor with no lag (transform: translate3d for GPU)
- Valid drop zones: grey-4 horizontal line (4px height)
- Invalid zones: cursor changes to "not-allowed"
- Auto-scroll: triggers within 100px of viewport edge

**Drop:**
```
Duration: 250ms
Easing: cubic-bezier(0.4, 0.0, 0.2, 1)

Dragged card:
  transform: translate to new position
  scale: 1.03 → 1.0
  box-shadow: elevation-8 → elevation-2
  opacity: 0.9 → 1.0

Other cards: smooth reorder (40ms stagger)
Placeholder: fade-out 150ms, height collapse 200ms
```

### 3.6 ExitOnMatch Toggle Animation

```
Duration: 200ms ease-out

Switch knob:
  transform: translateX(0) → translateX(24px)
  background: grey-5 → green-6

Track background:
  background: grey-3 → green-2

Simultaneous: haptic feedback (light)
State change feedback: scale pulse 1.0 → 1.05 → 1.0 (300ms)
If turning ON: checkmark icon briefly appears (500ms fade)
```

### 3.7 Test Execution Animation

**Step-through visualization:**
```
For each SubTransform:
Duration per step: 600ms

1. Card highlight (on main view):
   border: 2px solid orange-5
   box-shadow: 0 0 0 4px rgba(orange-5, 0.3)

2. Match indicator:
   ✓ icon: green-6, scale 0 → 1.2 → 1.0 (300ms)
   ⊗ icon: grey-5, fade-in (200ms)

3. Transforms applied:
   Each line appears: slide-left + fade-in (200ms)
   Stagger: 100ms per transform

4. ExitOnMatch indicator:
   If true and matched: "STOPPED" badge
   Animation: scale + bounce (400ms)
```

### 3.8 Error States

**Invalid Condition - Shake:**
```
Duration: 400ms ease-in-out

0ms:   translateX(0)
100ms: translateX(-8px)
200ms: translateX(8px)
300ms: translateX(-4px)
400ms: translateX(0)

Visual:
  Border: 2px solid red-5
  Background: red-1 tint
  Error icon: fade-in 150ms
```

**Missing Fields - Pulse:**
```
Animation: infinite pulse
Duration: 2000ms ease-in-out

scale: 1.0 → 1.05 → 1.0
opacity: 1.0 → 0.8 → 1.0
border-color: red-5 → red-3 → red-5
```

### 3.9 Keyboard Navigation

**Tab Order:**
1. Add SubTransform button
2. Collapse/Expand All buttons
3. SubTransform cards (top to bottom)
   - Within card: expand button → edit → condition → transforms → toggle → nested → delete
4. Test panel button

**Shortcuts:**
- `Ctrl/Cmd + N`: Add SubTransform
- `Ctrl/Cmd + S`: Save changes
- `Enter`: Expand/collapse card (when focused)
- `E`: Edit condition
- `D`: Delete (requires confirmation)
- `N`: Add nested
- `T`: Toggle ExitOnMatch
- `Ctrl + ↑/↓`: Reorder cards
- `Escape`: Cancel operation

**Focus Indicator:**
- Style: 2px solid blue-5 outline, offset 2px
- Animation: fade-in 150ms

### 3.10 Mobile Touch Interactions

**Touch Targets:**
- Minimum: 44x44px (iOS standard)
- Buttons: 44x44px
- Toggle switches: 48x28px
- Drag handles: 48x48px

**Gestures:**
- Long-press (500ms): Activate drag mode
- Swipe-to-delete: Swipe card left to reveal delete button
- Tap-and-hold (300ms): Show tooltip on mobile

**Mobile Adaptations:**
- FAB for "Add SubTransform" (56x56px, bottom-right)
- Test panel: full-screen bottom sheet
- Modals: bottom sheets instead of centered modals

### 3.11 Accessibility Features

**Screen Reader Support:**
```html
<div role="article" aria-labelledby="subtransform-1">
  <h3 id="subtransform-1">SubTransform 1</h3>
  <button aria-label="Expand SubTransform 1" aria-expanded="false">
  <button aria-label="Delete SubTransform 1">
  <q-toggle aria-label="Exit on match" aria-checked="false">
</div>
```

**ARIA Live Regions:**
```html
<div aria-live="polite" class="sr-only">
  <!-- Status messages -->
</div>
<div aria-live="assertive" class="sr-only">
  <!-- Error messages -->
</div>
```

**Announcements:**
- "SubTransform added. Edit condition to configure."
- "SubTransform deleted. 3 remaining."
- "SubTransform moved to position 2 of 5."
- "Test completed. 2 matched, 1 skipped."

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 4. IMPLEMENTATION GUIDE

### 4.1 Component Structure

**Recommended File Structure:**
```
/src/components/wizard/
  Step6_SubTransformConfiguration.vue  (Main component)
  SubTransformCard.vue                 (Recursive card)
  SubTransformList.vue                 (List container)
  SubTransformHeader.vue               (Card header)
  SubTransformCondition.vue            (Condition display)
  SubTransformTransforms.vue           (Transforms list)
  SubTransformTestPanel.vue            (Test panel)
  EmptyStateSubTransform.vue           (Empty state)
  ExecutionFlowVisualizer.vue          (Flow diagram)

/src/components/shared/
  ConditionEditor.vue                  (from Step 3 - reused)
  TransformList.vue                    (from Step 5 - reused)

/src/composables/
  useSubTransformAnimation.js          (Animation logic)
  useDragAndDrop.js                    (Drag-drop logic)
  useKeyboardNavigation.js             (Keyboard shortcuts)

/src/store/modules/
  wizard.js                            (Add Step 6 state)

/src/assets/styles/
  subtransform.scss                    (Step 6 styles)
```

### 4.2 Vuex Store Structure

```javascript
// store/modules/wizard.js
state: {
  currentStep: 6,
  step6: {
    skipSubTransforms: false,
    subTransforms: [
      {
        id: 'uuid-1',
        order: 0,
        condition: '@.eventType == "login"',
        exitOnMatch: false,
        transforms: [
          { source: 'user', target: 'common.user.name' },
          { source: 'srcIP', target: 'common.source.ip' }
        ],
        subTransforms: [] // Nested SubTransforms
      }
    ],
    testResults: {
      lastRun: null,
      executionTrace: [],
      finalOutput: {}
    }
  }
}

mutations: {
  ADD_SUBTRANSFORM(state, { parentId, subTransform }) { },
  UPDATE_SUBTRANSFORM(state, { id, updates }) { },
  DELETE_SUBTRANSFORM(state, { id }) { },
  REORDER_SUBTRANSFORMS(state, { newOrder }) { },
  SET_TEST_RESULTS(state, { results }) { },
  TOGGLE_SKIP_SUBTRANSFORMS(state) { }
}

actions: {
  async validateSubTransforms({ state }) { },
  async testSubTransforms({ state }, { sampleData }) { },
  async saveStep6Progress({ state }) { }
}
```

### 4.3 SubTransform Card Component (Example)

```vue
<template>
  <q-expansion-item
    :label="`[${index + 1}] SubTransform: ${subTransform.name}`"
    :caption="subTransform.condition"
    :header-class="cardHeaderClass"
    default-opened
  >
    <!-- Drag Handle -->
    <template v-slot:header>
      <q-item-section avatar>
        <q-icon name="drag_indicator" class="cursor-move" />
      </q-item-section>
      <q-item-section>
        <q-item-label>[{{ index + 1 }}] {{ subTransform.name }}</q-item-label>
        <q-item-label caption>{{ subTransform.condition }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <div class="row q-gutter-xs">
          <q-btn flat dense icon="arrow_upward" @click.stop="moveUp" />
          <q-btn flat dense icon="arrow_downward" @click.stop="moveDown" />
          <q-btn flat dense icon="delete" color="negative" @click.stop="confirmDelete" />
        </div>
      </q-item-section>
    </template>

    <!-- Card Content -->
    <q-card flat bordered>
      <q-card-section>

        <!-- Condition Editor -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-xs">Condition</div>
          <q-input
            :model-value="subTransform.condition"
            readonly
            outlined
            dense
          >
            <template v-slot:append>
              <q-btn flat dense icon="edit" @click="editCondition" />
            </template>
          </q-input>
        </div>

        <!-- ExitOnMatch Toggle -->
        <div class="q-mb-md exit-on-match-section">
          <q-toggle
            :model-value="subTransform.exitOnMatch"
            label="Exit on match (stop processing after this)"
            @update:model-value="updateExitOnMatch"
          >
            <q-tooltip>
              If enabled, no further SubTransforms will be evaluated
            </q-tooltip>
          </q-toggle>
        </div>

        <!-- Transforms List -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-xs">
            Transforms ({{ subTransform.transforms.length }})
          </div>
          <transform-list
            :transforms="subTransform.transforms"
            @update="updateTransforms"
          />
          <q-btn
            flat
            dense
            color="primary"
            icon="add"
            label="Add Transform"
            @click="addTransform"
          />
        </div>

        <!-- Nested SubTransforms (Recursive) -->
        <div v-if="canAddNested">
          <q-separator class="q-my-md" />
          <div class="text-subtitle2 q-mb-xs">
            Nested SubTransforms ({{ subTransform.subTransforms.length }})
          </div>

          <subtransform-card
            v-for="(nestedST, nestedIndex) in subTransform.subTransforms"
            :key="nestedST.id"
            :subTransform="nestedST"
            :index="nestedIndex"
            :depth="depth + 1"
            :maxDepth="maxDepth"
            class="nested-card"
          />

          <q-btn
            v-if="depth < maxDepth"
            flat
            dense
            color="secondary"
            icon="add"
            label="Add Nested SubTransform"
            @click="addNestedSubTransform"
          />
        </div>

      </q-card-section>
    </q-card>

  </q-expansion-item>
</template>

<script>
export default {
  name: 'SubTransformCard',
  props: {
    subTransform: Object,
    index: Number,
    depth: { type: Number, default: 0 },
    maxDepth: { type: Number, default: 3 }
  },
  computed: {
    canAddNested() {
      return this.depth < this.maxDepth;
    },
    cardHeaderClass() {
      return this.depth === 0 ? 'bg-blue-1' : 'bg-grey-2';
    }
  },
  methods: {
    moveUp() {
      this.$emit('reorder', this.index, -1);
    },
    moveDown() {
      this.$emit('reorder', this.index, 1);
    },
    confirmDelete() {
      this.$q.dialog({
        title: 'Delete SubTransform?',
        message: 'This action cannot be undone.',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.$emit('delete', this.subTransform.id);
      });
    },
    editCondition() {
      // Open condition editor modal
    },
    updateExitOnMatch(value) {
      this.$emit('update', { id: this.subTransform.id, exitOnMatch: value });
    },
    updateTransforms(transforms) {
      this.$emit('update', { id: this.subTransform.id, transforms });
    },
    addTransform() {
      // Add new transform
    },
    addNestedSubTransform() {
      this.$emit('add-nested', this.subTransform.id);
    }
  }
}
</script>

<style scoped lang="scss">
.nested-card {
  margin-left: 24px;
  border-left: 3px solid var(--q-primary);
  margin-bottom: 16px;
}

.exit-on-match-section {
  background: #FFF3E0;
  padding: 12px 20px;
  border-top: 1px solid #FFE0B2;
  border-bottom: 1px solid #FFE0B2;
  border-left: 3px solid #FF6F00;
}

.cursor-move {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}
</style>
```

### 4.4 CSS Variables

```css
/* subtransform.scss */
:root {
  /* Colors */
  --st-primary: #1976D2;
  --st-error: #D32F2F;
  --st-warning: #F57C00;
  --st-success: #388E3C;
  --st-info: #FF6F00;

  /* Spacing */
  --st-space-xs: 8px;
  --st-space-sm: 12px;
  --st-space-md: 16px;
  --st-space-lg: 24px;
  --st-space-xl: 32px;

  /* Nesting */
  --st-nest-indent: 24px;
  --st-nest-level-1: #42A5F5;
  --st-nest-level-2: #66BB6A;
  --st-nest-level-3: #FFA726;

  /* Animation */
  --st-transition-fast: 150ms;
  --st-transition-base: 250ms;
  --st-transition-slow: 400ms;
  --st-easing: cubic-bezier(0.4, 0.0, 0.2, 1);
}
```

### 4.5 Quasar Components Used

**Core Components:**
- `q-card`: SubTransform card container
- `q-btn`: All buttons
- `q-toggle`: ExitOnMatch switch
- `q-icon`: All icons (MDI)
- `q-expansion-item`: Expandable sections
- `q-table`: Field mapping table
- `q-menu`: More options dropdown
- `q-dialog`: Confirmation dialogs
- `q-banner`: Warning/info messages
- `q-tooltip`: Hover help
- `q-badge`: Count indicators
- `q-drawer`: Test panel (side/bottom)

### 4.6 Integration Points

**With Existing Code:**

1. **Step 3 Filter Builder:**
   - Import: `import ConditionEditor from '@/components/shared/ConditionEditor.vue'`
   - Props: `mode="subtransform"`, `currentCondition`
   - Events: `@condition-updated="handleConditionUpdate"`

2. **Step 5 Field Mapper:**
   - Import: `import TransformList from '@/components/shared/TransformList.vue'`
   - Props: `transforms`, `context="subtransform"`
   - Events: `@transform-added`, `@transform-updated`

3. **mixin-Shared-BuildSmaPolicy.js:**
   - Add: `buildSubTransforms()` method
   - Add: `validateSubTransforms()` method
   - Add: `executeSubTransformTest()` method

---

## 5. TESTING & VALIDATION

### 5.1 Functional Testing Checklist

**Core Functionality:**
- [ ] Add new SubTransform
- [ ] Edit condition
- [ ] Add field mappings
- [ ] Toggle ExitOnMatch
- [ ] Delete SubTransform (with confirmation)
- [ ] Reorder SubTransforms (drag-and-drop)
- [ ] Reorder SubTransforms (arrow buttons)
- [ ] Add nested SubTransform
- [ ] Delete nested SubTransform
- [ ] Collapse/expand cards
- [ ] Test with sample data
- [ ] View execution trace
- [ ] View final output

**Validation:**
- [ ] Invalid condition shows error
- [ ] Missing transforms shows error
- [ ] ExitOnMatch not set shows warning
- [ ] Cannot nest beyond max depth
- [ ] Cannot save with validation errors
- [ ] Circular references detected

**Edge Cases:**
- [ ] 50+ SubTransforms (performance)
- [ ] Deep nesting (3+ levels)
- [ ] Network failure during save
- [ ] Offline mode
- [ ] Simultaneous edits (multi-user)

### 5.2 Interaction Testing

**Animations:**
- [ ] Add animation smooth (400ms)
- [ ] Delete animation smooth (350ms)
- [ ] Expand/collapse smooth (300ms/250ms)
- [ ] Drag preview lifts card
- [ ] Drop animates to position
- [ ] Test execution step-through visible

**Keyboard Navigation:**
- [ ] Tab order logical
- [ ] All shortcuts work (Ctrl+N, Ctrl+S, etc.)
- [ ] Enter expands/collapses
- [ ] Arrow keys reorder
- [ ] Escape cancels operations

**Touch Interactions (Mobile):**
- [ ] All buttons 44x44px minimum
- [ ] Long-press activates drag
- [ ] Swipe-to-delete works
- [ ] Pinch to collapse (optional)

### 5.3 Accessibility Testing

**Screen Reader:**
- [ ] All cards announced correctly
- [ ] ARIA labels present
- [ ] Live regions announce changes
- [ ] Focus management correct

**Keyboard Only:**
- [ ] Can complete all tasks
- [ ] Focus indicators visible
- [ ] No keyboard traps
- [ ] Skip links work

**Visual:**
- [ ] Color contrast WCAG AA (4.5:1 minimum)
- [ ] Focus indicators high contrast
- [ ] Error states not color-only

**Reduced Motion:**
- [ ] Animations disabled when preferred
- [ ] Essential animations minimal

### 5.4 Browser/Device Testing

**Desktop Browsers:**
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

**Mobile Devices:**
- [ ] iOS Safari 14+
- [ ] Android Chrome 90+

**Screen Sizes:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### 5.5 Performance Testing

**Metrics:**
- [ ] First interaction < 100ms
- [ ] Animation framerate 60fps
- [ ] Test panel load < 500ms
- [ ] Bundle size < 50kb (animations)

**Load Testing:**
- [ ] 50 SubTransforms render < 2s
- [ ] 100 SubTransforms (virtual scroll)
- [ ] Drag-and-drop smooth with 50+ items

---

## 6. APPENDICES

### 6.1 Glossary

**SubTransform:** Conditional field mapping rule evaluated after base transforms
**ExitOnMatch:** Flag that stops processing remaining SubTransforms when true
**Execution Order:** Sequential evaluation from top to bottom
**Nesting Depth:** Level of nested SubTransforms (0 = root, 1 = first nested, etc.)
**Condition:** JSONPath-style filter expression (e.g., `@.type == 'login'`)
**Transform:** Field mapping from source to target field
**Fanout:** Parent element that arrays are expanded from

### 6.2 Example Policy with SubTransforms

```json
{
  "name": "gsuite",
  "filter": "@.@metadata.beat == 'gsbeat'",
  "transforms": [
    {
      "inputRule": "$.response.id.time",
      "LRSchemaField": "normal_msg_date",
      "type": "Datetime"
    }
  ],
  "subtransforms": [
    {
      "condition": "@.type=='access'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'owner')].value",
          "LRSchemaField": "account",
          "type": "String"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    },
    {
      "condition": "@.type=='login'",
      "Transforms": [
        {
          "inputrule": "$.parameters[?(@.name == 'login_type')].value",
          "LRSchemaField": "objecttype",
          "type": "String"
        }
      ],
      "ExitOnMatch": true,
      "SubTransForms": null
    }
  ]
}
```

### 6.3 Common Condition Syntax

**Basic Comparisons:**
```
@.type == "login"
@.severity >= 8
@.status != "success"
```

**Logical Operators:**
```
@.type == "login" AND @.status == "failed"
@.severity >= 8 OR @.priority == "high"
```

**Complex Expressions:**
```
@.type == "access" AND (@.owner != null OR @.doc_id != null)
```

### 6.4 Open Questions for Resolution

1. **Nesting Depth Limit:** Recommend 3 levels. Confirm acceptable?
2. **Template Library:** Hardcoded or backend-configurable?
3. **Test Data Source:** Only Step 2 sample, or allow file upload?
4. **Auto-save Frequency:** 30 seconds acceptable?
5. **Drag Library:** Quasar built-in or external (SortableJS)?
6. **Mobile Feature Parity:** Full features or simplified view?
7. **Browser Support:** IE11 required?
8. **Undo/Redo:** Implement beyond 5-second toast?

### 6.5 References

**Material Design:**
- [Material Design Motion](https://material.io/design/motion/)
- [Material Design Color System](https://material.io/design/color/)

**Quasar Framework:**
- [Quasar Components](https://quasar.dev/vue-components)
- [Quasar Transitions](https://quasar.dev/options/transitions)

**WCAG Guidelines:**
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/)

**Icon Library:**
- [Material Design Icons](https://pictogrammers.com/library/mdi/)

---

## 7. IMPLEMENTATION TIMELINE

### Phase 1: Core Functionality (Sprint 1-2, ~2 weeks)
- Basic SubTransform CRUD operations
- ConditionEditor and TransformList integration
- Vuex state management
- Simple validation
- Empty state

### Phase 2: User Guidance (Sprint 3, ~1 week)
- Templates
- Help text and tooltips
- Warning system
- Error messaging

### Phase 3: Testing Features (Sprint 4, ~1 week)
- Test panel implementation
- Execution trace visualization
- Sample data management

### Phase 4: Advanced Features (Sprint 5-6, ~2 weeks)
- Nested SubTransforms (recursive)
- Drag-and-drop reordering
- Keyboard navigation

### Phase 5: Polish (Sprint 7, ~1 week)
- ARIA labels and screen reader testing
- Dark mode
- Reduced motion support
- Session recovery
- Performance optimization

### Phase 6: Testing & QA (Sprint 8, ~1 week)
- Usability testing
- Bug fixes
- Cross-browser testing
- Accessibility audit

**Total Estimated Timeline:** 8 sprints (~8 weeks)

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-24 | UX/UI/Interaction Design Agents | Initial complete specification |

---

**END OF DOCUMENT**

This specification is ready for frontend implementation. All design decisions are documented, all components specified, and all interactions defined. The development team has everything needed to build Step 6 of the SubTransform Configuration wizard.

For questions or clarifications, contact the frontend-tech-lead.