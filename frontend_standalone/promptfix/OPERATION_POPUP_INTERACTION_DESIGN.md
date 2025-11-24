# "Add Operations" Popup - Comprehensive Interaction Design Specification

**Document Version:** 1.0
**Date:** 2025-11-20
**Design Phase:** Interaction Design
**For:** LogRhythm JSON Policy Builder - Step 5 Field Mapping Enhancement

---

## Executive Summary

This document provides a complete interaction design specification for the "Add Operations" popup dialog in Step 5 of the LogRhythm JSON Policy Builder. The specification defines all micro-interactions, animations, transitions, state behaviors, keyboard navigation, and feedback mechanisms that create a smooth, intuitive user experience.

### Design Goals

1. **Smooth & Responsive**: All interactions feel instantaneous with appropriate feedback
2. **Clear Feedback**: Users always know what's happening and what to do next
3. **Error Prevention**: Guide users away from mistakes before they happen
4. **Progressive Disclosure**: Show complexity only when needed
5. **Accessibility**: Full keyboard navigation and screen reader support

---

## Table of Contents

1. [Interaction Flow Diagrams](#1-interaction-flow-diagrams)
2. [State Machine Specification](#2-state-machine-specification)
3. [Micro-Interactions Catalog](#3-micro-interactions-catalog)
4. [Animation & Timing Specifications](#4-animation--timing-specifications)
5. [Keyboard Navigation Patterns](#5-keyboard-navigation-patterns)
6. [Feedback & Validation States](#6-feedback--validation-states)
7. [Loading & Processing States](#7-loading--processing-states)
8. [Transition Specifications](#8-transition-specifications)
9. [Touch & Mobile Interactions](#9-touch--mobile-interactions)
10. [Accessibility Interactions](#10-accessibility-interactions)

---

## 1. Interaction Flow Diagrams

### 1.1 Primary User Flow: Adding an Operation

```
[User State]                    [System State]                     [UI Feedback]
──────────────────────────────────────────────────────────────────────────────────

1. Click "Add Operations"
   │                            Dialog opens                        → Backdrop fade-in (150ms)
   │                            Initial state loaded                → Dialog slide-up (250ms)
   │                            Focus trap activated                → Category tabs visible
   │
2. View Operation Categories
   │                            Filter/Search ready                 → Search field pulse (subtle)
   │                            Categories displayed                → Tab indicators visible
   │
3. Select Category Tab
   │                            Filter operations list              → Tab slide animation (200ms)
   │                            Show filtered ops                   → List fade-in (150ms)
   │
4. Browse Operations
   │                            Hover states active                 → Hover background (100ms)
   │                            Preview hints shown                 → Tooltip appear (300ms delay)
   │
5. Click Operation Radio
   │                            Operation selected                  → Radio scale pulse (150ms)
   │                            Validate selection                  → Selection highlight
   │                            Load config panel                   → Config slide-in (250ms)
   │
6. Configure Parameters
   │                            Real-time validation                → Field borders update
   │                            Auto-save to temp state             → Success indicators
   │                            Generate preview                    → Preview update (200ms fade)
   │
7. Click "Apply Operation"
   │                            Validate all params                 → Button loading state
   │                            Apply to mapping                    → Success animation (300ms)
   │                            Close dialog                        → Dialog fade-out (200ms)
   │                            Update parent form                  → Badge update
   │
   [OPERATION APPLIED]          State persisted                     → Confirmation toast (2s)
```

### 1.2 Cancel/Discard Flow

```
[User State]                    [System State]                     [UI Feedback]
──────────────────────────────────────────────────────────────────────────────────

1. User Making Changes
   │                            Tracking dirty state               → Changes detected
   │
2. Click "Cancel" or "X"
   │                            Check for unsaved changes          → No feedback yet
   │
3. Has Changes?
   ├─ YES:
   │  │                         Show confirmation                  → Confirmation dialog (250ms)
   │  │                         User chooses:
   │  │                         ├─ Confirm: Discard changes        → Dialog close (200ms)
   │  │                         └─ Cancel: Return to editing       → Confirmation dismiss (150ms)
   │
   └─ NO:
      │                         Close immediately                  → Dialog fade-out (200ms)
      │
   [DIALOG CLOSED]              Temp state cleared                 → Parent unchanged
```

### 1.3 Clear Operation Flow

```
[User State]                    [System State]                     [UI Feedback]
──────────────────────────────────────────────────────────────────────────────────

1. User Has Operation Configured
   │                            Form filled with data              → Visible config
   │
2. Click "Clear Operation"
   │                            Confirm action intent              → Button hover state
   │
3. Confirmation Check
   ├─ If significant data:
   │  │                         Show confirmation                  → Inline confirm (150ms)
   │  │                         User confirms                      → Clear animation
   │
   └─ If minimal data:
      │                         Clear immediately                  → Fade-out (200ms)
      │
4. Clear All Fields
   │                            Reset to None selection            → Radio deselect animation
   │                            Clear all parameters               → Fields fade-out (150ms)
   │                            Hide config panel                  → Panel slide-out (200ms)
   │                            Update preview                     → Preview clear (150ms)
   │
   [OPERATION CLEARED]          Temp state reset                   → Success indicator (brief)
```

---

## 2. State Machine Specification

### 2.1 Dialog States

```
STATE MACHINE: OperationDialog
────────────────────────────────────────────────────────────────

STATES:
┌─────────────────────────────────────────────────────────────┐
│ CLOSED                                                       │
│   - Dialog not visible                                       │
│   - No focus trap                                           │
│   - No temp state                                           │
└─────────────────────────────────────────────────────────────┘
       │
       │ [OPEN TRIGGER]
       │ • Button click
       │ • Animation: Fade-in backdrop + Slide-up dialog (250ms)
       ↓
┌─────────────────────────────────────────────────────────────┐
│ OPENING                                                      │
│   - Backdrop fading in (150ms)                              │
│   - Dialog sliding up (250ms)                               │
│   - Loading initial state                                   │
│   - Disallow interactions                                   │
└─────────────────────────────────────────────────────────────┘
       │
       │ [ANIMATION COMPLETE]
       │ • Auto-transition after 250ms
       ↓
┌─────────────────────────────────────────────────────────────┐
│ IDLE_NO_SELECTION                                           │
│   - Dialog fully visible                                     │
│   - No operation selected (None radio checked)              │
│   - Config panel hidden                                     │
│   - Apply button disabled                                   │
│   - Allow: Browse, Search, Select                           │
└─────────────────────────────────────────────────────────────┘
       │
       │ [SELECT OPERATION]
       │ • Radio button click
       │ • Animation: Config panel slide-in (250ms)
       ↓
┌─────────────────────────────────────────────────────────────┐
│ CONFIGURING                                                  │
│   - Operation selected                                       │
│   - Config panel visible                                     │
│   - Fields editable                                         │
│   - Real-time validation active                             │
│   - Preview updating                                         │
│   - Allow: Edit, Validate, Clear, Apply, Cancel            │
└─────────────────────────────────────────────────────────────┘
       │
       │ [VALIDATION CHANGES]
       ├────────────→ [VALID PARAMS] → READY_TO_APPLY
       └────────────→ [INVALID PARAMS] → CONFIGURING_ERROR

┌─────────────────────────────────────────────────────────────┐
│ CONFIGURING_ERROR                                            │
│   - Operation selected                                       │
│   - Config panel visible with errors                        │
│   - Error messages shown                                    │
│   - Apply button disabled                                   │
│   - Allow: Edit, Clear, Cancel                             │
└─────────────────────────────────────────────────────────────┘
       │
       │ [FIX ERRORS]
       │ • Valid input provided
       ↓
     (back to CONFIGURING)

┌─────────────────────────────────────────────────────────────┐
│ READY_TO_APPLY                                               │
│   - Operation fully configured                               │
│   - All validation passed                                   │
│   - Preview showing result                                  │
│   - Apply button enabled & highlighted                      │
│   - Allow: Apply, Clear, Edit, Cancel                      │
└─────────────────────────────────────────────────────────────┘
       │
       │ [APPLY OPERATION]
       │ • Apply button click
       │ • Animation: Button loading (indefinite)
       ↓
┌─────────────────────────────────────────────────────────────┐
│ APPLYING                                                     │
│   - Processing operation                                     │
│   - Apply button in loading state                          │
│   - All inputs disabled                                     │
│   - Close button disabled                                   │
│   - Prevent all interactions                                │
└─────────────────────────────────────────────────────────────┘
       │
       │ [APPLY SUCCESS]
       │ • Operation applied to parent
       │ • Animation: Success flash (300ms) + Dialog fade-out (200ms)
       ↓
┌─────────────────────────────────────────────────────────────┐
│ CLOSING_SUCCESS                                              │
│   - Success animation playing                                │
│   - Dialog fading out                                       │
│   - Backdrop fading out                                     │
└─────────────────────────────────────────────────────────────┘
       │
       │ [ANIMATION COMPLETE]
       │ • Auto-transition after 500ms
       ↓
     (back to CLOSED)


ALTERNATIVE PATHS:
──────────────────

From any active state:
   [CANCEL/ESC] → CANCELING → CLOSED

From CONFIGURING/READY:
   [CLEAR OPERATION] → IDLE_NO_SELECTION

From APPLYING:
   [ERROR] → CONFIGURING_ERROR (show error message)
```

### 2.2 Operation Type Selection States

```
STATE: Operation Radio Button
────────────────────────────────────────────────────────────────

┌─────────────────┐
│ UNSELECTED      │ ← Default state
│   Background: transparent
│   Border: 1px solid rgba(255,255,255,0.1)
│   Text: #E3F2FD
│   Cursor: pointer
└─────────────────┘
       │
       │ [MOUSE ENTER]
       │ Timing: 100ms ease-in-out
       ↓
┌─────────────────┐
│ HOVER           │
│   Background: rgba(33, 150, 243, 0.08)
│   Border: 1px solid rgba(33, 150, 243, 0.3)
│   Text: #E3F2FD (brighter)
│   Transform: translateX(4px)
│   Box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15)
│   Cursor: pointer
└─────────────────┘
       │
       │ [CLICK/ENTER]
       │ Timing: 150ms ease-out
       ↓
┌─────────────────┐
│ ACTIVE (brief)  │
│   Background: rgba(33, 150, 243, 0.15)
│   Transform: translateX(0px) scale(0.98)
│   Duration: 150ms
└─────────────────┘
       │
       │ [RELEASE]
       │ Timing: 200ms ease-out
       ↓
┌─────────────────┐
│ SELECTED        │
│   Background: rgba(33, 150, 243, 0.12)
│   Border-left: 4px solid #2196F3
│   Text: #2196F3
│   Icon: #2196F3
│   Radio: checked (scale 1.1 → 1.0)
│   Persist until another selected
└─────────────────┘

KEYBOARD FOCUS:
───────────────
┌─────────────────┐
│ FOCUSED         │
│   Outline: 2px solid #2196F3
│   Outline-offset: 2px
│   Background: rgba(33, 150, 243, 0.05)
│   Apply on: Tab/Shift+Tab
└─────────────────┘
```

### 2.3 Input Field States

```
STATE: Parameter Input Field
────────────────────────────────────────────────────────────────

┌─────────────────┐
│ EMPTY           │ ← Initial state
│   Background: whitesmoke
│   Border: 1px solid rgba(0,0,0,0.24)
│   Placeholder: visible, opacity 0.5
│   Label: floating above, muted
└─────────────────┘
       │
       │ [FOCUS]
       │ Timing: 200ms ease-out
       ↓
┌─────────────────┐
│ FOCUSED_EMPTY   │
│   Background: white
│   Border: 2px solid #2196F3
│   Box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1)
│   Label: #2196F3, bold
│   Placeholder: visible
│   Cursor: text (blinking)
└─────────────────┘
       │
       │ [TYPE INPUT]
       │ Timing: immediate
       ↓
┌─────────────────┐
│ TYPING          │
│   Background: white
│   Border: 2px solid #2196F3
│   Box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1)
│   Text: #000000
│   Validation: debounced (300ms)
└─────────────────┘
       │
       │ [DEBOUNCE COMPLETE]
       ├────────→ [VALID INPUT]
       │         Timing: 200ms
       │         ↓
       │    ┌─────────────────┐
       │    │ VALID           │
       │    │   Border: 2px solid #4CAF50
       │    │   Background: rgba(76, 175, 80, 0.05)
       │    │   Icon: check_circle (green, right)
       │    │   Animation: check fade-in + scale
       │    └─────────────────┘
       │
       └────────→ [INVALID INPUT]
                 Timing: 200ms
                 ↓
            ┌─────────────────┐
            │ ERROR           │
            │   Border: 2px solid #2196F3 (not red!)
            │   Background: rgba(33, 150, 243, 0.05)
            │   Icon: error (blue, right)
            │   Error message: slide-in below (150ms)
            │   Suggestion: visible if available
            └─────────────────┘

BLUR TRANSITIONS:
─────────────────
From FOCUSED_EMPTY → EMPTY (200ms)
From TYPING → FILLED (200ms)
From VALID → VALID_BLUR (retain green border)
From ERROR → ERROR_BLUR (retain error state)

DISABLED STATE:
───────────────
┌─────────────────┐
│ DISABLED        │
│   Background: #F5F5F5
│   Border: 1px solid rgba(0,0,0,0.12)
│   Text: rgba(0,0,0,0.38)
│   Cursor: not-allowed
│   No interactions
└─────────────────┘
```

---

## 3. Micro-Interactions Catalog

### 3.1 Button Interactions

#### "Add Operations" Trigger Button

**Default State:**
```
Appearance:
  - Background: #2196F3 (solid blue)
  - Text: #000000 (black)
  - Border: 2px solid #2196F3
  - Icon: "add" (18px, black)
  - Padding: 8px 16px
  - Border-radius: 4px
  - Font-weight: 500
```

**Hover State:**
```
Trigger: Mouse enter
Timing: 150ms ease-in-out
Changes:
  - Background: #1976D2 (darker blue)
  - Transform: translateY(-1px)
  - Box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3)
  - Cursor: pointer
```

**Active (Click) State:**
```
Trigger: Mouse down
Timing: 100ms ease-out
Changes:
  - Transform: translateY(0px) scale(0.97)
  - Box-shadow: 0 2px 6px rgba(33, 150, 243, 0.2)
```

**Has Operation (Badge Visible):**
```
Additional Elements:
  - Badge: Floating top-right
  - Badge Background: #2196F3
  - Badge Text: Operation label (white)
  - Badge Animation: Pulse on appearance (300ms)
```

**Keyboard Focus:**
```
Trigger: Tab navigation
Appearance:
  - Outline: 2px solid #2196F3
  - Outline-offset: 2px
  - Box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.15)
```

#### "Apply Operation" Button

**Disabled State:**
```
Appearance:
  - Background: #E0E0E0
  - Text: rgba(0,0,0,0.38)
  - Cursor: not-allowed
  - No hover effects
```

**Enabled State:**
```
Appearance:
  - Background: #2196F3
  - Text: #FFFFFF
  - Icon: "check" (18px, white)
  - Padding: 10px 24px
  - Font-weight: 600
```

**Hover State:**
```
Timing: 150ms ease-in-out
Changes:
  - Background: #1976D2
  - Transform: translateY(-1px)
  - Box-shadow: 0 4px 16px rgba(33, 150, 243, 0.4)
```

**Loading State:**
```
Trigger: On click (processing)
Changes:
  - Background: #2196F3
  - Text: hidden
  - Icon: spinner (rotating animation)
  - Cursor: wait
  - Disabled: true
Animation:
  - Spinner: 360deg rotation, 1s linear, infinite
```

**Success State (Brief):**
```
Trigger: After successful apply
Duration: 300ms
Changes:
  - Background: #4CAF50 (green)
  - Icon: check_circle
  - Animation: scale(1.05) → scale(1.0)
Then: Close dialog
```

#### "Clear Operation" Button

**Default State:**
```
Appearance:
  - Background: transparent
  - Text: #F44336 (red)
  - Border: 1px solid #F44336
  - Icon: "clear" (18px, red)
```

**Hover State:**
```
Timing: 150ms ease-in-out
Changes:
  - Background: rgba(244, 67, 54, 0.1)
  - Border: 2px solid #F44336
```

**Click Confirmation (Inline):**
```
If significant data:
  - Button text changes: "Clear?" → "Confirm"
  - Background: rgba(244, 67, 54, 0.15)
  - Timeout: 3s (reverts if no action)
```

#### "Cancel" Button

**Default State:**
```
Appearance:
  - Background: transparent
  - Text: #757575 (grey)
  - Border: 1px solid rgba(0,0,0,0.24)
```

**Hover State:**
```
Timing: 150ms ease-in-out
Changes:
  - Background: rgba(0,0,0,0.05)
  - Border: 1px solid rgba(0,0,0,0.38)
```

### 3.2 Category Tab Interactions

**Tab States:**

**Unselected Tab:**
```
Appearance:
  - Background: transparent
  - Text: rgba(0,0,0,0.6)
  - Underline: none
  - Cursor: pointer
```

**Hover Tab:**
```
Timing: 100ms ease-in-out
Changes:
  - Background: rgba(33, 150, 243, 0.08)
  - Text: rgba(0,0,0,0.8)
```

**Active Tab:**
```
Appearance:
  - Background: transparent
  - Text: #2196F3
  - Underline: 3px solid #2196F3
  - Font-weight: 600
```

**Tab Switch Animation:**
```
On Click:
  1. Deselect previous tab:
     - Underline slides out (200ms ease-out)
     - Text color fades (200ms)

  2. Select new tab:
     - Underline slides in (200ms ease-out)
     - Text color changes (200ms)
     - Content fade-out → fade-in (150ms each)
```

### 3.3 Search/Filter Interactions

**Search Input Field:**

**Default:**
```
Appearance:
  - Background: white
  - Border: 1px solid rgba(0,0,0,0.24)
  - Placeholder: "Search operations..."
  - Icon: search (left, grey)
```

**Focus:**
```
Timing: 200ms ease-out
Changes:
  - Border: 2px solid #2196F3
  - Box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1)
  - Placeholder: fade to 0.3 opacity
```

**Typing:**
```
Debounce: 300ms
On Input:
  - Clear button appears (fade-in, 150ms)
  - Operation list filters in real-time
  - Show result count: "X operations found"

Animation:
  - Filtered items: fade-in (150ms, staggered 30ms)
  - Hidden items: fade-out (100ms)
```

**Clear Button (X):**
```
Trigger: Appears when input has text
Appearance:
  - Icon: "clear" (grey)
  - Position: right side
  - Size: 16px

Hover:
  - Color: #F44336 (red)
  - Scale: 1.1
  - Timing: 100ms

Click:
  - Clear input (immediate)
  - Clear button fades out (150ms)
  - Show all operations (fade-in, 150ms)
```

### 3.4 Radio Button Interactions

**Radio Icon Animation:**

**Unselected → Selected:**
```
Timing: 150ms ease-out
Animation Sequence:
  1. Outer circle scales: 1.0 → 1.1 → 1.0
  2. Inner dot appears: scale 0 → 1.2 → 1.0
  3. Color transitions: grey → blue
  4. Duration: 150ms total
```

**Selected → Another Selected:**
```
Timing: 200ms ease-out
Animation Sequence:
  1. Old selection:
     - Inner dot shrinks: 1.0 → 0
     - Color: blue → grey
     - Duration: 150ms

  2. New selection (overlaps at 50ms):
     - Inner dot grows: 0 → 1.2 → 1.0
     - Color: grey → blue
     - Duration: 150ms
```

### 3.5 Configuration Panel Transitions

**Panel Appear (Operation Selected):**
```
Trigger: Radio button selected
Animation: Slide-in from right with fade
Timing: 250ms ease-out
Sequence:
  1. Panel enters from right: translateX(20px) → translateX(0)
  2. Opacity: 0 → 1
  3. Height: 0 → auto (max-height trick)

Stagger Children:
  - Each form field fades in sequentially
  - Stagger delay: 30ms between fields
  - Field animation: translateY(10px) → translateY(0) + fade
```

**Panel Change (Switch Operation Type):**
```
Trigger: Different operation selected
Animation: Cross-fade
Timing: 200ms
Sequence:
  1. Old panel:
     - Fade out: opacity 1 → 0
     - Slide left: translateX(0) → translateX(-20px)
     - Duration: 200ms

  2. New panel (starts at 100ms):
     - Fade in: opacity 0 → 1
     - Slide in: translateX(20px) → translateX(0)
     - Duration: 200ms
```

**Panel Disappear (Clear/None Selected):**
```
Trigger: Clear operation or None selected
Animation: Slide-out with fade
Timing: 200ms ease-in
Sequence:
  1. Panel exits to right: translateX(0) → translateX(20px)
  2. Opacity: 1 → 0
  3. Height: auto → 0 (collapse)
```

### 3.6 Preview Panel Interactions

**Preview Update:**
```
Trigger: Parameter change (debounced 300ms)
Animation: Content swap with fade
Timing: 200ms
Sequence:
  1. If preview exists:
     - Old content fades out: opacity 1 → 0 (100ms)
     - Loading spinner appears (if > 200ms)
     - New content fades in: opacity 0 → 1 (150ms)
     - Success/error icon scales in (200ms)

  2. If no preview:
     - Spinner only
     - Duration: indefinite until result
```

**Preview Success State:**
```
Appearance:
  - Border: 2px solid #4CAF50
  - Background: rgba(76, 175, 80, 0.05)
  - Icon: check_circle (green, 20px)
  - Result text: #4CAF50, bold

Animation on Appear:
  - Border color transition: blue → green (200ms)
  - Icon: scale 0 → 1.2 → 1.0 (300ms)
  - Result text: slide up + fade (200ms)
```

**Preview Error State:**
```
Appearance:
  - Border: 2px solid #2196F3 (blue, not red!)
  - Background: rgba(33, 150, 243, 0.05)
  - Icon: error (blue, 20px)
  - Error text: #D32F2F, bold

Animation on Appear:
  - Border shake: translateX(0 → -5px → 5px → 0) (300ms)
  - Icon: rotate + scale (300ms)
  - Error message: slide down + fade (200ms)
```

### 3.7 Tooltip Interactions

**Operation Description Tooltip:**

**Trigger:**
```
Hover over "help" icon
Delay: 500ms (prevents accidental tooltips)
```

**Appearance Animation:**
```
Timing: 200ms ease-out
Sequence:
  - Opacity: 0 → 1
  - Transform: translateY(-5px) → translateY(0)
  - Scale: 0.95 → 1.0
```

**Style:**
```
Background: rgba(0,0,0,0.9)
Text: white, 13px
Padding: 8px 12px
Border-radius: 4px
Max-width: 300px
Box-shadow: 0 4px 12px rgba(0,0,0,0.3)
```

**Dismissal:**
```
Trigger: Mouse leave
Timing: 150ms ease-in
Animation: Reverse of appearance
```

---

## 4. Animation & Timing Specifications

### 4.1 Core Timing Values

```javascript
// Standard animation durations (milliseconds)
const ANIMATION_TIMINGS = {
  // Ultra-fast: Immediate feedback
  INSTANT: 50,

  // Fast: Button states, hovers
  FAST: 100,

  // Normal: Most interactions
  NORMAL: 150,

  // Moderate: Panel slides, fades
  MODERATE: 200,

  // Slow: Dialog open/close
  SLOW: 250,

  // Very slow: Complex transitions
  VERY_SLOW: 300,

  // Extra slow: Success confirmations
  EXTRA_SLOW: 500,

  // Debounce delays
  INPUT_DEBOUNCE: 300,
  SEARCH_DEBOUNCE: 300,
  VALIDATION_DEBOUNCE: 300,

  // Tooltip delays
  TOOLTIP_DELAY: 500,
  TOOLTIP_DISMISS: 150,

  // Loading states
  SPINNER_SHOW_DELAY: 200,  // Only show if > 200ms

  // Toast notifications
  TOAST_DURATION: 2000,
  TOAST_FADE: 200
}
```

### 4.2 Easing Functions

```javascript
// Easing curves for different interaction types
const EASING_CURVES = {
  // Standard ease: Most interactions
  EASE_OUT: 'cubic-bezier(0.4, 0.0, 0.2, 1)',  // Material Design standard

  // Emphasis: Important changes
  EASE_IN_OUT: 'cubic-bezier(0.4, 0.0, 0.6, 1)',

  // Entrance: Elements appearing
  EASE_OUT_BACK: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',

  // Exit: Elements disappearing
  EASE_IN: 'cubic-bezier(0.4, 0.0, 1, 1)',

  // Bounce: Success states
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Sharp: Quick snappy actions
  SHARP: 'cubic-bezier(0.4, 0.0, 0.6, 1)',

  // Linear: Spinners, continuous animations
  LINEAR: 'linear'
}
```

### 4.3 Dialog Open/Close Animations

**Dialog Open Sequence:**

```css
/* Backdrop */
.dialog-backdrop-enter-active {
  animation: backdrop-fade-in 150ms ease-out;
}

@keyframes backdrop-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.5;  /* Semi-transparent black */
  }
}

/* Dialog Card */
.dialog-enter-active {
  animation: dialog-slide-up 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

@keyframes dialog-slide-up {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1.0);
  }
}
```

**Dialog Close Sequence:**

```css
/* Backdrop */
.dialog-backdrop-leave-active {
  animation: backdrop-fade-out 200ms ease-in;
}

@keyframes backdrop-fade-out {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 0;
  }
}

/* Dialog Card */
.dialog-leave-active {
  animation: dialog-slide-down 200ms cubic-bezier(0.4, 0.0, 1, 1);
}

@keyframes dialog-slide-down {
  from {
    opacity: 1;
    transform: translateY(0) scale(1.0);
  }
  to {
    opacity: 0;
    transform: translateY(30px) scale(0.97);
  }
}
```

### 4.4 Component-Specific Animations

**Radio Button Selection:**

```css
/* Outer circle pulse */
.radio-select {
  animation: radio-pulse 150ms ease-out;
}

@keyframes radio-pulse {
  0% {
    transform: scale(1.0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.0);
  }
}

/* Inner dot appear */
.radio-dot {
  animation: radio-dot-appear 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes radio-dot-appear {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1.0);
    opacity: 1;
  }
}
```

**Panel Slide-In:**

```css
.panel-slide-in {
  animation: panel-slide 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

@keyframes panel-slide {
  from {
    opacity: 0;
    transform: translateX(20px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateX(0);
    max-height: 1000px;  /* Large enough value */
  }
}
```

**Success Flash:**

```css
.success-flash {
  animation: success-pulse 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes success-pulse {
  0% {
    background-color: #2196F3;
    transform: scale(1.0);
  }
  50% {
    background-color: #4CAF50;
    transform: scale(1.05);
  }
  100% {
    background-color: #4CAF50;
    transform: scale(1.0);
  }
}
```

**Error Shake:**

```css
.error-shake {
  animation: shake 300ms cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}
```

**Spinner Rotation:**

```css
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

### 4.5 Stagger Animations

**List Items Fade-In (Search Results):**

```css
/* Applied to each item with increasing delay */
.list-item-enter {
  animation: fade-slide-in 150ms ease-out;
  animation-fill-mode: backwards;
}

/* First item: 0ms delay */
.list-item-enter:nth-child(1) { animation-delay: 0ms; }
.list-item-enter:nth-child(2) { animation-delay: 30ms; }
.list-item-enter:nth-child(3) { animation-delay: 60ms; }
.list-item-enter:nth-child(4) { animation-delay: 90ms; }
.list-item-enter:nth-child(5) { animation-delay: 120ms; }
/* ... continue for more items */

@keyframes fade-slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Form Fields Sequential Reveal:**

```css
/* Configuration panel fields */
.config-field-enter {
  animation: field-reveal 200ms ease-out;
  animation-fill-mode: backwards;
}

.config-field-enter:nth-child(1) { animation-delay: 0ms; }
.config-field-enter:nth-child(2) { animation-delay: 50ms; }
.config-field-enter:nth-child(3) { animation-delay: 100ms; }
.config-field-enter:nth-child(4) { animation-delay: 150ms; }

@keyframes field-reveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 5. Keyboard Navigation Patterns

### 5.1 Global Keyboard Shortcuts

```
KEYBOARD SHORTCUTS
──────────────────────────────────────────────────────────────

Global (Dialog Open):
  Esc              → Close dialog (with confirmation if changes)
  Enter            → Apply operation (if valid)
  Ctrl/Cmd + S     → Apply operation (alternative)

Navigation:
  Tab              → Next focusable element
  Shift + Tab      → Previous focusable element

Category Tabs:
  Left Arrow       → Previous tab
  Right Arrow      → Next tab
  Home             → First tab
  End              → Last tab

Operation Selection:
  Up Arrow         → Previous operation (when radio focused)
  Down Arrow       → Next operation (when radio focused)
  Space            → Select focused operation
  Enter            → Select focused operation

Search:
  Ctrl/Cmd + F     → Focus search input
  Esc (in search)  → Clear search (if text) or blur (if empty)

Buttons:
  Space            → Activate focused button
  Enter            → Activate focused button

Form Fields:
  Tab              → Next field
  Shift + Tab      → Previous field
  Enter            → Submit form (if last field)
```

### 5.2 Tab Order Specification

```
TAB ORDER (sequential focus)
────────────────────────────────────────────────────────────

Dialog Opens:
  1. [Auto-focus] Search input field

Tab Sequence:
  1. Search input
  2. Category Tab: "All"
  3. Category Tab: "String"
  4. Category Tab: "Array"
  5. Category Tab: "Date/Time"
  6. Category Tab: "Number"
  7. Operation Radio: None
  8. Operation Radio: REGEX
  9. Operation Radio: IsIP
  10. ... (all visible operation radios)

If Operation Selected (Config Panel Visible):
  [Insert after operation radios]
  11. Config Field 1 (e.g., Pattern input)
  12. Config Field 2 (e.g., Capture group)
  13. ... (all config fields)
  14. Clear Operation button

Footer Buttons (always last):
  N-2. Preview expand/collapse (if present)
  N-1. Cancel button
  N. Apply Operation button

Close Button:
  [Special] Close button (X) accessible via Tab but positioned last visually
```

### 5.3 Focus Management

**Initial Focus:**
```javascript
// When dialog opens
onDialogOpen() {
  // Wait for animation to complete
  setTimeout(() => {
    // Focus search input for immediate filtering
    this.$refs.searchInput.focus();
  }, 250);  // After dialog slide-up animation
}
```

**Focus Trap:**
```javascript
// Prevent focus from leaving dialog
onTabFromLastElement(event) {
  if (event.shiftKey) {
    // Shift+Tab from first element → go to last
    return;
  } else {
    // Tab from last element → go to first
    event.preventDefault();
    this.$refs.firstFocusableElement.focus();
  }
}

onShiftTabFromFirstElement(event) {
  if (event.shiftKey) {
    // Shift+Tab from first → go to last
    event.preventDefault();
    this.$refs.lastFocusableElement.focus();
  }
}
```

**Focus Return:**
```javascript
// When dialog closes
onDialogClose() {
  // Return focus to trigger button
  setTimeout(() => {
    this.$refs.addOperationButton.focus();
  }, 200);  // After close animation
}
```

**Dynamic Focus Updates:**
```javascript
// When operation selected
onOperationSelect(operationType) {
  if (operationType !== null) {
    // Config panel appears
    // Focus first config field
    this.$nextTick(() => {
      setTimeout(() => {
        const firstField = this.$refs.configPanel
          .querySelector('input, select, textarea');
        if (firstField) {
          firstField.focus();
        }
      }, 250);  // After panel slide-in
    });
  }
}
```

### 5.4 Focus Indicators

**Visual Focus Styles:**

```css
/* Global focus indicator (all focusable elements) */
*:focus {
  outline: 2px solid #2196F3;
  outline-offset: 2px;
}

/* Buttons */
button:focus {
  outline: 2px solid #2196F3;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.15);
}

/* Input fields */
input:focus,
select:focus,
textarea:focus {
  border: 2px solid #2196F3 !important;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  outline: none;
}

/* Radio buttons */
input[type="radio"]:focus + .radio-label {
  outline: 2px solid #2196F3;
  outline-offset: 2px;
  background: rgba(33, 150, 243, 0.05);
}

/* Category tabs */
.q-tab:focus {
  outline: 2px solid #2196F3;
  outline-offset: -2px;
  background: rgba(33, 150, 243, 0.08);
}

/* Remove outline for mouse users (preserve for keyboard) */
.js-focus-visible *:focus:not(.focus-visible) {
  outline: none;
}
```

**Focus Visible Polyfill:**
```javascript
// Detect keyboard vs mouse focus
document.addEventListener('mousedown', () => {
  document.body.classList.add('using-mouse');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.remove('using-mouse');
  }
});
```

---

## 6. Feedback & Validation States

### 6.1 Validation Timing

**Real-Time Validation Strategy:**

```javascript
// Validation flow for input fields
const validationFlow = {
  // On initial input: No validation yet
  onFirstKeypress: 'none',

  // While typing: Debounced validation
  onTyping: {
    debounce: 300,  // Wait 300ms after last keystroke
    validate: true,
    showErrors: false  // Don't show errors while typing
  },

  // After blur (lose focus): Immediate validation
  onBlur: {
    delay: 0,
    validate: true,
    showErrors: true  // Show errors on blur
  },

  // Before submit: Full validation
  onSubmit: {
    delay: 0,
    validate: true,
    showErrors: true,
    blockSubmit: true  // Prevent submit if invalid
  }
}
```

**Validation State Transitions:**

```
INPUT VALIDATION FLOW
──────────────────────────────────────────────────────────────

Empty Field
  │
  │ [User starts typing]
  ↓
Typing (no validation)
  │ • Show no feedback yet
  │ • Wait for debounce
  │
  │ [300ms after last keystroke]
  ↓
Validating (background)
  │ • No visual indication to user
  │ • Validation runs silently
  │
  ├──→ [VALID INPUT]
  │    ↓
  │    Valid (subtle feedback)
  │    • Green checkmark (small, right side)
  │    • No border change while focused
  │
  └──→ [INVALID INPUT]
       ↓
       Invalid (waiting)
       • Error stored, but not shown
       • Wait for blur

       │ [User continues typing]
       ↓
       (back to Typing)

       │ [User leaves field (blur)]
       ↓
       Error (shown)
       • Blue border (not red!)
       • Error icon (right side)
       • Error message below
       • Suggestion (if available)
```

### 6.2 Error Message Specifications

**Error Message Anatomy:**

```html
<div class="error-message">
  <q-icon name="error" color="primary" size="18px" class="error-icon" />
  <div class="error-content">
    <div class="error-text">
      {{ errorMessage }}
    </div>
    <div class="error-suggestion" v-if="suggestion">
      <a @click="applySuggestion">
        {{ suggestion }}
      </a>
    </div>
  </div>
</div>
```

**Error Message Styles:**

```css
.error-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  margin-top: 8px;
  background: rgba(33, 150, 243, 0.05);  /* Blue tint, not red */
  border-left: 4px solid #2196F3;
  border-radius: 4px;

  animation: error-slide-in 150ms ease-out;
}

@keyframes error-slide-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon {
  flex-shrink: 0;
  color: #2196F3 !important;  /* Blue, not red */
}

.error-text {
  color: #1976D2;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

.error-suggestion {
  margin-top: 4px;
  font-size: 13px;

  a {
    color: #2196F3;
    text-decoration: underline;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      color: #1976D2;
      text-decoration: none;
    }
  }
}
```

**Error Examples:**

```javascript
// Regex pattern error
{
  message: "Invalid regex pattern: Unclosed character class near index 5",
  suggestion: "Try using a preset pattern",
  suggestAction: () => this.showPresetPatterns()
}

// Capture group error
{
  message: "Capture group 3 not found in pattern (pattern has 2 groups)",
  suggestion: "Use group 1 or 2",
  suggestAction: () => this.setCaptureGroup(1)
}

// Lookup table error
{
  message: "Lookup table 'CUSTOM_TABLE' not found",
  suggestion: "View available tables",
  suggestAction: () => this.showAvailableTables()
}

// Required field error
{
  message: "This field is required",
  suggestion: null,
  suggestAction: null
}
```

### 6.3 Success Feedback

**Success Indicators:**

```html
<!-- Inline success (field level) -->
<div class="success-indicator">
  <q-icon
    name="check_circle"
    color="positive"
    size="18px"
    class="success-icon"
  />
</div>
```

**Success Icon Animation:**

```css
.success-icon {
  animation: success-pop 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes success-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1.0);
    opacity: 1;
  }
}
```

**Operation Applied Success:**

```javascript
// After successful operation apply
showSuccessNotification() {
  // 1. Button success flash (300ms)
  this.$refs.applyButton.classList.add('success-flash');

  // 2. Dialog close (200ms)
  setTimeout(() => {
    this.closeDialog();
  }, 300);

  // 3. Toast notification (appears after dialog closes)
  setTimeout(() => {
    this.$q.notify({
      type: 'positive',
      message: 'Operation applied successfully',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    });
  }, 500);

  // 4. Update parent form (immediate)
  this.$emit('operation-changed', this.operationConfig);
}
```

### 6.4 Warning States

**Warning Messages (Non-Blocking):**

```html
<div class="warning-message">
  <q-icon name="warning" color="warning" size="18px" />
  <div class="warning-text">
    {{ warningMessage }}
  </div>
</div>
```

**Warning Examples:**

```javascript
// Pattern complexity warning
{
  type: 'warning',
  message: "Complex regex patterns may impact performance",
  dismissible: true
}

// Lookup table size warning
{
  type: 'warning',
  message: "Large lookup tables may slow down processing",
  dismissible: true
}

// DateTime format warning
{
  type: 'warning',
  message: "Custom format may not match LogRhythm expectations",
  dismissible: false
}
```

### 6.5 Info & Help States

**Inline Help Text:**

```html
<div class="field-help">
  <q-icon name="info" color="grey-6" size="16px" />
  <span class="help-text">
    {{ helpMessage }}
  </span>
</div>
```

**Interactive Tooltips:**

```html
<q-btn
  flat
  round
  dense
  size="xs"
  icon="help_outline"
  color="grey-6"
>
  <q-tooltip
    anchor="top middle"
    self="bottom middle"
    :offset="[0, 10]"
    max-width="300px"
  >
    {{ tooltipContent }}
  </q-tooltip>
</q-btn>
```

---

## 7. Loading & Processing States

### 7.1 Loading Indicators

**Button Loading State:**

```html
<q-btn
  :loading="isApplying"
  :disable="isApplying || !isValid"
  @click="applyOperation"
>
  <template v-slot:loading>
    <q-spinner-dots size="20px" />
  </template>
  Apply Operation
</q-btn>
```

**Preview Loading:**

```html
<div class="preview-panel" :class="{ loading: isValidating }">
  <div v-if="isValidating" class="preview-loading">
    <q-spinner color="primary" size="32px" />
    <span class="loading-text">Validating operation...</span>
  </div>

  <div v-else class="preview-content">
    <!-- Preview result -->
  </div>
</div>
```

**Loading State Thresholds:**

```javascript
// Only show spinner if operation takes > 200ms
const SPINNER_DELAY = 200;

let spinnerTimeout;
let startTime;

function startValidation() {
  startTime = Date.now();

  // Set timeout to show spinner after 200ms
  spinnerTimeout = setTimeout(() => {
    this.showSpinner = true;
  }, SPINNER_DELAY);

  // Perform validation
  validateOperation()
    .then((result) => {
      // Clear spinner timeout if still pending
      clearTimeout(spinnerTimeout);

      // If operation was fast (< 200ms), never showed spinner
      const duration = Date.now() - startTime;

      if (duration < SPINNER_DELAY) {
        // Fast path: immediate result
        this.showResult(result);
      } else {
        // Slow path: ensure spinner shows for minimum 400ms total
        const remainingTime = 400 - duration;
        setTimeout(() => {
          this.showSpinner = false;
          this.showResult(result);
        }, Math.max(0, remainingTime));
      }
    });
}
```

### 7.2 Skeleton Screens

**Config Panel Loading (Initial):**

```html
<div v-if="isLoadingConfig" class="config-skeleton">
  <div class="skeleton-field">
    <div class="skeleton-label"></div>
    <div class="skeleton-input"></div>
  </div>
  <div class="skeleton-field">
    <div class="skeleton-label"></div>
    <div class="skeleton-input"></div>
  </div>
  <!-- Repeat for expected number of fields -->
</div>
```

**Skeleton Styles:**

```css
.skeleton-label {
  width: 40%;
  height: 16px;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.1) 25%,
    rgba(255,255,255,0.2) 50%,
    rgba(255,255,255,0.1) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-input {
  width: 100%;
  height: 40px;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.1) 25%,
    rgba(255,255,255,0.2) 50%,
    rgba(255,255,255,0.1) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### 7.3 Progress Indicators

**Multi-Step Operation Progress:**

```html
<!-- If operation requires multiple steps -->
<div class="operation-progress">
  <q-linear-progress
    :value="progressValue"
    color="primary"
    size="4px"
    animation-speed="200"
  />
  <div class="progress-label">
    {{ progressLabel }}
  </div>
</div>
```

**Progress States:**

```javascript
const PROGRESS_STATES = {
  VALIDATING_PARAMS: {
    value: 0.33,
    label: 'Validating parameters...'
  },
  TESTING_OPERATION: {
    value: 0.66,
    label: 'Testing operation with sample data...'
  },
  APPLYING: {
    value: 1.0,
    label: 'Applying operation...'
  }
}
```

### 7.4 Optimistic Updates

**Strategy:**

```javascript
// Optimistic UI update pattern
async function applyOperation() {
  // 1. Immediately update UI (optimistic)
  this.updateUIWithOperation(this.tempOperationConfig);

  // 2. Show success feedback (optimistic)
  this.showSuccessAnimation();

  // 3. Close dialog (optimistic)
  this.closeDialog();

  // 4. Actually save in background
  try {
    await saveOperationToBackend(this.tempOperationConfig);
    // Success - already updated UI
  } catch (error) {
    // Failure - rollback
    this.rollbackUI();
    this.showErrorNotification(error);
    this.reopenDialog();
  }
}
```

---

## 8. Transition Specifications

### 8.1 Mode Transitions

**Selection Mode → Configuration Mode:**

```
Trigger: User selects an operation radio button
Duration: 250ms total
Sequence:

  Phase 1 (0-50ms):
    - Radio button animation
      - Scale pulse: 1.0 → 1.1 → 1.0
      - Check mark appears

  Phase 2 (50-250ms):
    - Config panel slides in
      - Transform: translateX(20px) → translateX(0)
      - Opacity: 0 → 1
      - Height: 0 → auto

  Phase 3 (100-250ms, overlapping):
    - Form fields stagger in
      - Each field: translateY(10px) → translateY(0)
      - Opacity: 0 → 1
      - Delay: 30ms between each field

  Phase 4 (250ms):
    - Auto-focus first field
      - Cursor blinks in first input
```

**Configuration Mode → Selection Mode:**

```
Trigger: User clears operation or selects "None"
Duration: 200ms total
Sequence:

  Phase 1 (0-150ms):
    - Form fields fade out
      - Reverse stagger (last to first)
      - Opacity: 1 → 0
      - Transform: translateY(0) → translateY(-10px)

  Phase 2 (50-200ms, overlapping):
    - Config panel slides out
      - Transform: translateX(0) → translateX(20px)
      - Opacity: 1 → 0
      - Height: auto → 0

  Phase 3 (200ms):
    - Focus returns to radio group
```

### 8.2 Category Switch Transitions

**Tab Change Animation:**

```
Trigger: User clicks different category tab
Duration: 300ms total
Sequence:

  Phase 1 (0-150ms):
    - Old tab indicator slides out
      - Underline: scaleX(1) → scaleX(0)
      - Origin: center
    - Old content fades out
      - Opacity: 1 → 0
      - Transform: translateX(0) → translateX(-20px)

  Phase 2 (150-300ms):
    - New tab indicator slides in
      - Underline: scaleX(0) → scaleX(1)
      - Origin: center
    - New content fades in
      - Opacity: 0 → 1
      - Transform: translateX(20px) → translateX(0)

  Phase 3 (200-300ms, overlapping):
    - Operation items stagger in
      - Each item: translateY(10px) → translateY(0)
      - Opacity: 0 → 1
      - Delay: 30ms between items
```

### 8.3 Operation Type Switch Transitions

**Switching Between Operations:**

```
Trigger: User selects different operation while one is configured
Duration: 400ms total
Sequence:

  Phase 1 (0-200ms):
    - Old config panel cross-fades out
      - Opacity: 1 → 0
      - Transform: translateX(0) → translateX(-20px)
    - Old radio deselects
      - Check mark shrinks

  Phase 2 (200-400ms):
    - New radio selects
      - Check mark grows with pulse
    - New config panel cross-fades in
      - Opacity: 0 → 1
      - Transform: translateX(20px) → translateX(0)
    - New form fields stagger in
      - Delay: 30ms between fields

  Phase 3 (300-400ms, overlapping):
    - Preview panel updates
      - Content fade-swap
      - New result appears
```

### 8.4 Dialog State Transitions

**State Transition Matrix:**

```
FROM          TO               ANIMATION                    DURATION
────────────────────────────────────────────────────────────────────
CLOSED    →   OPENING          Backdrop fade + Slide up    250ms
OPENING   →   IDLE_NO_SEL      Auto-transition             0ms
IDLE      →   CONFIGURING      Panel slide-in              250ms
CONFIGURING → READY_TO_APPLY   Border color change         200ms
CONFIGURING → CONFIG_ERROR     Border shake + error        300ms
READY     →   APPLYING         Button loading              0ms
APPLYING  →   CLOSING_SUCCESS  Success flash               300ms
CLOSING   →   CLOSED           Backdrop fade + Slide down  200ms
ANY       →   CANCELING        Fade out                    200ms
```

---

## 9. Touch & Mobile Interactions

### 9.1 Touch Target Sizes

**Minimum Touch Targets:**

```css
/* Ensure all interactive elements meet touch guidelines */
.touch-target {
  min-width: 44px;
  min-height: 44px;

  /* Add padding if visual size is smaller */
  padding: 12px;
}

/* Buttons */
button {
  min-height: 44px;
  padding: 12px 16px;
}

/* Radio buttons */
.operation-radio {
  min-height: 56px;  /* Larger for easier tapping */
  padding: 12px 16px;
}

/* Category tabs */
.q-tab {
  min-height: 48px;
  min-width: 80px;
}

/* Input fields */
input,
select,
textarea {
  min-height: 44px;
  padding: 12px;
}
```

### 9.2 Touch Gestures

**Swipe to Close (Mobile):**

```javascript
// Swipe down to close dialog
let touchStartY = 0;
let touchMoveY = 0;

function handleTouchStart(event) {
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  touchMoveY = event.touches[0].clientY;
  const deltaY = touchMoveY - touchStartY;

  // Only allow downward swipe
  if (deltaY > 0) {
    // Apply transform for visual feedback
    this.$refs.dialogCard.style.transform =
      `translateY(${deltaY}px) scale(${1 - deltaY / 1000})`;
  }
}

function handleTouchEnd(event) {
  const deltaY = touchMoveY - touchStartY;

  // Threshold: 100px downward swipe
  if (deltaY > 100) {
    // Close dialog
    this.closeDialog();
  } else {
    // Snap back to original position
    this.$refs.dialogCard.style.transition = 'transform 200ms ease-out';
    this.$refs.dialogCard.style.transform = 'translateY(0) scale(1)';
  }

  // Reset
  touchStartY = 0;
  touchMoveY = 0;
}
```

**Pull-to-Refresh (Operation List):**

```javascript
// Pull down operation list to refresh
// (Only if list is scrolled to top)
let pullStartY = 0;
let isPulling = false;

function handlePullStart(event) {
  const scrollTop = this.$refs.operationList.scrollTop;

  if (scrollTop === 0) {
    isPulling = true;
    pullStartY = event.touches[0].clientY;
  }
}

function handlePullMove(event) {
  if (!isPulling) return;

  const currentY = event.touches[0].clientY;
  const pullDistance = currentY - pullStartY;

  if (pullDistance > 0) {
    // Show pull indicator
    this.pullIndicatorOpacity = Math.min(pullDistance / 80, 1);
  }
}

function handlePullEnd(event) {
  if (!isPulling) return;

  const currentY = event.changedTouches[0].clientY;
  const pullDistance = currentY - pullStartY;

  if (pullDistance > 80) {
    // Trigger refresh
    this.refreshOperationList();
  }

  // Reset
  isPulling = false;
  this.pullIndicatorOpacity = 0;
}
```

### 9.3 Mobile-Specific Animations

**Touch Ripple Effect:**

```css
/* Material Design ripple on touch */
.touch-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple 600ms ease-out;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

**Touch Feedback (Visual Press):**

```css
/* Darken element on touch */
.touch-active {
  background: rgba(0, 0, 0, 0.1);
  transition: background 0ms;  /* Instant feedback */
}

/* Remove darkening on release */
.touch-inactive {
  transition: background 150ms ease-out;
}
```

### 9.4 Mobile Dialog Adjustments

**Full-Screen on Small Devices:**

```css
/* Mobile: Dialog takes full screen */
@media (max-width: 768px) {
  .operation-dialog-card {
    min-width: 100vw !important;
    max-width: 100vw !important;
    width: 100vw !important;
    min-height: 100vh;
    border-radius: 0;
    margin: 0;
  }

  /* Adjust content padding */
  .operations-dialog-content {
    padding: 16px;
    max-height: calc(100vh - 140px);
  }

  /* Stack footer buttons */
  .dialog-footer {
    flex-direction: column;
    gap: 12px;

    .q-btn {
      width: 100%;
      min-height: 48px;
    }
  }
}
```

---

## 10. Accessibility Interactions

### 10.1 Screen Reader Announcements

**ARIA Live Regions:**

```html
<!-- Announce validation changes -->
<div
  role="alert"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
>
  {{ validationAnnouncement }}
</div>

<!-- Announce operation changes -->
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
>
  {{ operationAnnouncement }}
</div>

<!-- Announce errors -->
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  class="sr-only"
>
  {{ errorAnnouncement }}
</div>
```

**Announcement Examples:**

```javascript
// When operation selected
announceOperationChange(operationType) {
  this.operationAnnouncement =
    `${operationType} operation selected. Configuration panel opened.`;
}

// When validation completes
announceValidation(isValid) {
  if (isValid) {
    this.validationAnnouncement =
      'Operation configured successfully. Ready to apply.';
  } else {
    this.validationAnnouncement =
      `Validation failed. ${this.errorCount} errors found. Please review and correct.`;
  }
}

// When operation applied
announceApplySuccess() {
  this.operationAnnouncement =
    'Operation applied successfully. Dialog closed.';
}
```

### 10.2 ARIA Labels & Descriptions

**Dialog:**

```html
<q-dialog
  v-model="showOperationDialog"
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  aria-modal="true"
>
  <q-card>
    <q-card-section>
      <div id="dialog-title" class="text-h6">
        Add Operations
      </div>
      <div id="dialog-description" class="sr-only">
        Select and configure an operation to transform your JSON field value.
        Use Tab to navigate, Escape to close.
      </div>
    </q-card-section>
  </q-card>
</q-dialog>
```

**Operation Radios:**

```html
<div
  role="radiogroup"
  aria-labelledby="operation-types-label"
>
  <div id="operation-types-label" class="section-label">
    Select Operation Type
  </div>

  <q-radio
    v-model="tempOperationType"
    :val="OPERATION_TYPES.REGEX"
    :aria-label="getOperationAriaLabel(OPERATION_TYPES.REGEX)"
    :aria-describedby="`${OPERATION_TYPES.REGEX}-description`"
  >
    <!-- Visual label -->
    <div class="option-label">REGEX</div>

    <!-- Screen reader description -->
    <div :id="`${OPERATION_TYPES.REGEX}-description`" class="sr-only">
      Extract data using regular expression pattern matching.
      Example: Extract IP address from log message.
    </div>
  </q-radio>
</div>
```

**Form Fields:**

```html
<q-input
  v-model="regexPattern"
  label="Regex Pattern"
  :aria-required="true"
  :aria-invalid="!!errors.pattern"
  :aria-describedby="errors.pattern ? 'pattern-error' : 'pattern-help'"
>
  <!-- Help text -->
  <template v-slot:hint>
    <span id="pattern-help">
      Use capturing groups () to extract specific parts
    </span>
  </template>

  <!-- Error message -->
  <div
    v-if="errors.pattern"
    id="pattern-error"
    role="alert"
    class="error-message"
  >
    {{ errors.pattern }}
  </div>
</q-input>
```

### 10.3 Keyboard Command Announcements

**Keyboard Shortcut Helper:**

```html
<!-- Show on Alt key press -->
<div
  v-if="showKeyboardHelp"
  class="keyboard-shortcuts-overlay"
  role="dialog"
  aria-labelledby="shortcuts-title"
>
  <div id="shortcuts-title" class="shortcuts-header">
    Keyboard Shortcuts
  </div>

  <dl class="shortcuts-list">
    <div class="shortcut-item">
      <dt>Esc</dt>
      <dd>Close dialog</dd>
    </div>
    <div class="shortcut-item">
      <dt>Enter</dt>
      <dd>Apply operation</dd>
    </div>
    <div class="shortcut-item">
      <dt>Tab</dt>
      <dd>Next element</dd>
    </div>
    <div class="shortcut-item">
      <dt>Shift + Tab</dt>
      <dd>Previous element</dd>
    </div>
    <div class="shortcut-item">
      <dt>Ctrl/Cmd + F</dt>
      <dd>Focus search</dd>
    </div>
    <div class="shortcut-item">
      <dt>Arrow Keys</dt>
      <dd>Navigate operations/tabs</dd>
    </div>
  </dl>

  <div class="shortcuts-footer">
    <button @click="closeKeyboardHelp">Close (Esc)</button>
  </div>
</div>
```

### 10.4 Focus Management for Screen Readers

**Announce Focus Changes:**

```javascript
// When focus moves to new element
function announceElementFocus(element) {
  const label = element.getAttribute('aria-label') ||
                element.getAttribute('label') ||
                element.textContent;

  const role = element.getAttribute('role') ||
               element.tagName.toLowerCase();

  this.focusAnnouncement = `${label}, ${role}`;

  // Example: "Regex Pattern, textbox"
  // Example: "REGEX operation, radio button"
}
```

---

## Summary: Interaction Design Principles

### Core Principles Applied

1. **Immediate Feedback**
   - Every user action receives visual feedback within 100ms
   - Hover states appear instantly
   - Click/tap feedback is immediate

2. **Smooth Transitions**
   - All state changes are animated
   - Animations use appropriate easing curves
   - Timing is consistent across similar interactions

3. **Progressive Enhancement**
   - Basic functionality works without animations
   - Enhanced experience for capable devices
   - Graceful degradation for older browsers

4. **Error Prevention**
   - Real-time validation guides users
   - Clear error messages explain what's wrong
   - Suggestions help users fix issues

5. **Accessibility First**
   - Full keyboard navigation support
   - Screen reader announcements for all changes
   - High contrast focus indicators
   - Semantic HTML structure

6. **Performance Optimized**
   - Debounced validation (300ms)
   - Lazy loading of heavy components
   - Optimistic updates where possible
   - Minimal reflows/repaints

---

## Implementation Checklist

### For Frontend-Tech-Lead

- [ ] Review all interaction flows with team
- [ ] Validate timing values against brand guidelines
- [ ] Confirm accessibility requirements met
- [ ] Approve animation specifications
- [ ] Review keyboard navigation patterns
- [ ] Confirm mobile interaction requirements

### For Front-End Developer

- [ ] Implement dialog state machine
- [ ] Create all micro-interactions
- [ ] Build animation library
- [ ] Implement keyboard navigation
- [ ] Add ARIA labels and announcements
- [ ] Create touch gesture handlers
- [ ] Build loading states
- [ ] Implement validation feedback
- [ ] Test with screen readers
- [ ] Test on mobile devices
- [ ] Performance profiling
- [ ] Cross-browser testing

---

## File References

**Current Implementation:**
- `/src/components/wizard/operations/OperationSelector.vue`
- `/src/components/wizard/steps/Step5_Mapping.vue`
- `/src/services/wizard/mappingService.js`

**Related Specifications:**
- `OPERATIONS_FORMATTERS_DESIGN_SPEC.md` (UX & Visual Design)
- `OPERATION_POPUP_IMPLEMENTATION.md` (Technical Implementation)

---

**End of Interaction Design Specification**

*This document should be reviewed by the Frontend Tech Lead and used by the Front-End Developer to implement all interactive behaviors in the "Add Operations" popup.*
