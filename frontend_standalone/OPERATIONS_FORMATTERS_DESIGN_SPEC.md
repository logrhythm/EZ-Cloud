# Operations & Formatters Design Specification
## LogRhythm JSON Policy Builder - Step 5 Field Mapping Enhancement

**Document Version:** 1.0
**Date:** 2025-11-19
**Status:** Design Phase - Complete Design-to-Implementation Workflow

---

## Executive Summary

This document provides a comprehensive design specification for adding operations and formatters to the Field Mapping step (Step 5) of the LogRhythm JSON Policy Builder wizard. The enhancement enables users to transform field values during mapping using REGEX extraction, lookup tables, prefixes, and DateTime formatting.

---

## Table of Contents

1. [UX Design (Phase 1.1)](#1-ux-design-phase-11)
2. [Interaction Design (Phase 1.2)](#2-interaction-design-phase-12)
3. [Visual Design (Phase 1.3)](#3-visual-design-phase-13)
4. [Implementation Specification (Phase 2)](#4-implementation-specification-phase-2)
5. [Development Tasks (Phase 3)](#5-development-tasks-phase-3)

---

## 1. UX Design (Phase 1.1)

### 1.1 User Research & Requirements

#### Target Users
- **Novice Users**: First-time policy builders who need guidance
- **Intermediate Users**: Familiar with JSON but new to operations
- **Expert Users**: Power users who want quick, efficient workflows

#### User Stories
1. **As a security analyst**, I want to extract IP addresses from log messages so I can map them to LogRhythm's srcip/dstip fields
2. **As a policy administrator**, I want to look up status codes from tables so I can enrich my data with descriptions
3. **As a data engineer**, I want to format DateTime fields so they match LogRhythm's expected format
4. **As a system integrator**, I want to add prefixes to identifiers so I can distinguish sources
5. **As a power user**, I want to test operations on sample data so I can verify correctness before saving

### 1.2 Information Architecture

#### Placement Decision: In-Dialog Enhancement Section

**Rationale:**
- Operations modify the `inputRule` field directly
- Keeping operations in the mapping dialog maintains context
- Avoids modal-on-modal complexity
- Allows users to see all mapping details in one place

#### Mapping Dialog Structure (Enhanced)

```
┌─────────────────────────────────────────────────────────────┐
│ [X] Edit Field Mapping                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ SECTION 1: Source Field                                     │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Source Field (JSON Path) *                              │ │
│ │ [$.message                                          ]   │ │
│ │                                                          │ │
│ │ [+] Add Operation / Formatter  [Expand/Collapse]        │ │
│ │                                                          │ │
│ │ [Operations Panel - Expandable]                         │ │
│ │ ┌────────────────────────────────────────────────────┐ │ │
│ │ │ Select Operation:                                   │ │ │
│ │ │ ( ) None - Use field as-is                         │ │ │
│ │ │ ( ) REGEX - Extract using regular expression       │ │ │
│ │ │ ( ) LookUp - Lookup value from table               │ │ │
│ │ │ ( ) LookUpStartsWith - Prefix-based lookup         │ │ │
│ │ │ ( ) PREFIX - Add prefix to value                   │ │ │
│ │ │                                                      │ │ │
│ │ │ [Operation Configuration Panel - Changes based on │ │ │
│ │ │  selected operation type]                           │ │ │
│ │ │                                                      │ │ │
│ │ │ Preview:                                            │ │ │
│ │ │ Original: "Error from IP: 192.168.1.1"             │ │ │
│ │ │ Result:   "192.168.1.1"                            │ │ │
│ │ │                                                      │ │ │
│ │ │ [Test Operation] [Clear Operation]                  │ │ │
│ │ └────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ SECTION 2: Target Field                                     │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ LogRhythm Schema Field *                                │ │
│ │ [srcip                                              ▼] │ │
│ │                                                          │ │
│ │ Data Type *                                             │ │
│ │ [String                                             ▼] │ │
│ │                                                          │ │
│ │ [DateTime Formatter Panel - Visible when type=DateTime] │ │
│ │ ┌────────────────────────────────────────────────────┐ │ │
│ │ │ Format Pattern (optional)                           │ │ │
│ │ │ [yyyy-MM-dd HH:mm:ss.SSS                       ]   │ │ │
│ │ │                                                      │ │ │
│ │ │ Common Patterns:                                    │ │ │
│ │ │ [ISO 8601] [RFC 3339] [Unix Timestamp] [Custom]    │ │ │
│ │ │                                                      │ │ │
│ │ │ Pattern Builder:                                    │ │ │
│ │ │ Year: [yyyy▼] Month: [MM▼] Day: [dd▼]             │ │ │
│ │ │ Hour: [HH▼] Min: [mm▼] Sec: [ss▼] MS: [SSS▼]     │ │ │
│ │ │ Separator: [:]  Timezone: [K▼]                     │ │ │
│ │ │                                                      │ │ │
│ │ │ Preview:                                            │ │ │
│ │ │ Sample: "2023-11-19T14:30:00.123Z"                 │ │ │
│ │ └────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ SECTION 3: Additional Options (existing)                    │
│ Default Value, Alternative Fields, Fanout Parent            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                    [Cancel] [Save Mapping]  │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 User Flow

#### Flow 1: Adding a REGEX Operation

1. **User clicks JSON field** → Mapping dialog opens
2. **User sees source field** ($.message) with sample value preview
3. **User clicks "[+] Add Operation"** → Operations panel expands
4. **User selects "REGEX"** → REGEX configuration panel appears
5. **User enters regex pattern** (e.g., `/IP: (\d+\.\d+\.\d+\.\d+)/`)
6. **User enters capture group** (e.g., `1`)
7. **System shows preview** → "Original: Error from IP: 192.168.1.1" → "Result: 192.168.1.1"
8. **User clicks "Test Operation"** → System validates regex and shows preview with sample data
9. **User clicks "Save Mapping"** → inputRule becomes `REGEX($.message, /IP: (\d+\.\d+\.\d+\.\d+)/, 1)`

#### Flow 2: Adding a DateTime Formatter

1. **User clicks JSON field** → Mapping dialog opens
2. **User selects Data Type = "DateTime"** → DateTime Formatter panel appears automatically
3. **User clicks "ISO 8601" preset** → Format field populates with `yyyy-MM-ddTHH:mm:ss.fffK`
4. **User sees preview** → Sample DateTime formatted according to pattern
5. **User clicks "Save Mapping"** → format field stores the pattern

#### Flow 3: Adding a Lookup Operation

1. **User clicks JSON field** → Mapping dialog opens
2. **User clicks "[+] Add Operation"** → Operations panel expands
3. **User selects "LookUp"** → Lookup configuration panel appears
4. **User selects table name** from dropdown (e.g., "HTTP_STATUS_CODES")
5. **User sees preview** → "Original: 200" → "Result: OK"
6. **User clicks "Test Operation"** → System validates table exists
7. **User clicks "Save Mapping"** → inputRule becomes `LookUp(HTTP_STATUS_CODES, $.status_code)`

### 1.4 Discovery Mechanism

#### Progressive Disclosure
- **Initially**: Operations section is collapsed to avoid overwhelming users
- **Trigger**: Clicking "[+] Add Operation" expands the section
- **Visual Cue**: Icon badge shows "5 operations available"
- **Help Link**: "What are operations?" → Opens help panel

#### Operation Selection UI
- **Radio buttons** for mutually exclusive operation types
- **None option** as default (no operation, use field as-is)
- **Icon + Label + Description** for each operation
- **Examples link** for each operation type

#### Example Display
```
( ) REGEX - Extract using regular expression
    Example: Extract IP from "Error from IP: 192.168.1.1"
    [See more examples]
```

### 1.5 Parameter Input Design

#### REGEX Configuration
```
┌──────────────────────────────────────────────────────────┐
│ Regex Pattern *                                           │
│ [/IP: (\d+\.\d+\.\d+\.\d+)/                          ]   │
│ ⓘ Use capturing groups () to extract specific parts      │
│                                                            │
│ Capture Group *                                           │
│ [1                                                    ]   │
│ ⓘ Which group to extract (1-based, 0 = entire match)     │
│                                                            │
│ [Common Patterns ▼]                                       │
│   • IP Address: /(\d+\.\d+\.\d+\.\d+)/                   │
│   • Email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/  │
│   • URL: /(https?:\/\/[^\s]+)/                           │
│   • MAC Address: /([0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:...)/   │
│   [Insert Pattern]                                        │
│                                                            │
│ Test Your Regex:                                          │
│ Sample Value: "Error from IP: 192.168.1.1"               │
│ Match Result: "192.168.1.1" ✓                            │
└──────────────────────────────────────────────────────────┘
```

#### LookUp Configuration
```
┌──────────────────────────────────────────────────────────┐
│ Lookup Table *                                            │
│ [HTTP_STATUS_CODES                                    ▼] │
│ ⓘ Select a predefined lookup table                       │
│                                                            │
│ Available Tables:                                         │
│   • HTTP_STATUS_CODES - HTTP status codes & descriptions │
│   • WINDOWS_EVENT_IDS - Windows event ID mappings        │
│   • SYSLOG_SEVERITY - Syslog severity levels             │
│   • USER_AGENTS - Common user agent strings              │
│   [View Table Contents]                                   │
│                                                            │
│ Test Your Lookup:                                         │
│ Sample Value: "200"                                       │
│ Lookup Result: "OK" ✓                                     │
└──────────────────────────────────────────────────────────┘
```

#### PREFIX Configuration
```
┌──────────────────────────────────────────────────────────┐
│ Prefix String *                                           │
│ [SERVER-                                              ]   │
│ ⓘ This text will be added to the beginning of the value  │
│                                                            │
│ Test Your Prefix:                                         │
│ Sample Value: "12345"                                     │
│ Result: "SERVER-12345" ✓                                  │
└──────────────────────────────────────────────────────────┘
```

#### DateTime Formatter Configuration
```
┌──────────────────────────────────────────────────────────┐
│ Format Pattern (optional)                                 │
│ [yyyy-MM-dd HH:mm:ss.SSS                              ]   │
│ ⓘ Leave blank for default LogRhythm format               │
│                                                            │
│ Quick Presets:                                            │
│ [ISO 8601: yyyy-MM-ddTHH:mm:ss.fffK]                     │
│ [RFC 3339: yyyy-MM-ddTHH:mm:ssZ]                         │
│ [US Format: MM/dd/yyyy HH:mm:ss]                         │
│ [EU Format: dd/MM/yyyy HH:mm:ss]                         │
│ [Unix Timestamp: <leave blank>]                          │
│                                                            │
│ Pattern Builder: [Toggle Visual Builder]                  │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Date Components:                                      │ │
│ │ Year: [yyyy (4-digit) ▼]  Month: [MM (01-12) ▼]     │ │
│ │ Day:  [dd (01-31) ▼]                                 │ │
│ │                                                        │ │
│ │ Time Components:                                      │ │
│ │ Hour: [HH (00-23) ▼]  Min: [mm (00-59) ▼]           │ │
│ │ Sec:  [ss (00-59) ▼]  MS:  [SSS (000-999) ▼]        │ │
│ │                                                        │ │
│ │ Separators:                                           │ │
│ │ Date: [-] Time: [:] DateTime: [T]                    │ │
│ │                                                        │ │
│ │ Timezone: [K (with timezone) ▼]                      │ │
│ │                                                        │ │
│ │ Generated Pattern: yyyy-MM-dd HH:mm:ss.SSS            │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                            │
│ Pattern Reference: [Show All Components]                  │
│ • yyyy = 4-digit year (2023)                              │
│ • yy   = 2-digit year (23)                                │
│ • MM   = Month (01-12)                                    │
│ • dd   = Day (01-31)                                      │
│ • HH   = Hour 24-hr (00-23)                               │
│ • hh   = Hour 12-hr (01-12)                               │
│ • mm   = Minute (00-59)                                   │
│ • ss   = Second (00-59)                                   │
│ • SSS  = Millisecond (000-999)                            │
│ • K    = Timezone offset (+00:00)                         │
│                                                            │
│ Test Your Format:                                         │
│ Sample Value: "2023-11-19T14:30:00.123Z"                 │
│ Formatted:    "2023-11-19 14:30:00.123" ✓                │
└──────────────────────────────────────────────────────────┘
```

### 1.6 Error Prevention

#### Validation Rules

1. **REGEX Validation**
   - Check for valid regex syntax
   - Validate capture group is numeric and within range
   - Test regex against sample data
   - Show error if regex fails to match

2. **LookUp Validation**
   - Verify table name exists
   - Check if table is accessible
   - Validate lookup returns results

3. **PREFIX Validation**
   - Ensure prefix is not empty
   - Check for special characters that might break syntax

4. **DateTime Format Validation**
   - Validate format pattern syntax
   - Check for invalid component combinations
   - Test format against sample DateTime

#### Error Messages

```
❌ Invalid regex pattern: Unclosed character class near index 5
   Suggestion: Check your regex syntax. Try using a preset pattern.
   [Use Preset] [View Regex Guide]

❌ Capture group 3 not found in pattern (pattern has 2 groups)
   Suggestion: Use group 1 or 2, or modify your pattern.

❌ Lookup table "CUSTOM_TABLE" not found
   Available tables: HTTP_STATUS_CODES, WINDOWS_EVENT_IDS
   [View All Tables]

❌ Format pattern "yyyy-MM-HH" is invalid
   Error: "HH" cannot be used without time context
   Suggestion: Use "yyyy-MM-dd HH:mm:ss"
   [Use Suggestion]
```

### 1.7 Help System

#### Contextual Help

1. **Inline Tooltips** (ⓘ icon)
   - Brief explanation (1-2 sentences)
   - Available on every field
   - Example: "Regex patterns use capturing groups () to extract parts of text"

2. **Help Links**
   - "What are operations?" → Opens help panel
   - "Regex guide" → Opens regex tutorial
   - "View examples" → Shows common use cases

3. **Examples Panel** (Expandable)
   ```
   [📖 Common Examples]

   Extracting IP Addresses:
   Pattern: /(\d+\.\d+\.\d+\.\d+)/
   Input:   "Connection from 192.168.1.100"
   Output:  "192.168.1.100"

   Extracting Email:
   Pattern: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
   Input:   "Contact: admin@example.com"
   Output:  "admin@example.com"

   [See More Examples]
   ```

4. **Preview/Testing** (Real-time feedback)
   - Show sample value from actual data
   - Display operation result immediately
   - Highlight matches (for REGEX)
   - Show before/after comparison

### 1.8 Testing & Preview

#### Preview Panel (Always Visible)

```
┌──────────────────────────────────────────────────────────┐
│ 🔍 Operation Preview                                      │
├──────────────────────────────────────────────────────────┤
│ Sample Input:                                             │
│ "Error: Connection from IP: 192.168.1.100 failed"        │
│                                                            │
│ ↓ REGEX($.message, /IP: (\d+\.\d+\.\d+\.\d+)/, 1)       │
│                                                            │
│ Result:                                                   │
│ "192.168.1.100" ✓                                         │
│                                                            │
│ [Test with Different Sample] [Copy Operation Syntax]     │
└──────────────────────────────────────────────────────────┘
```

#### Testing Features

1. **Auto-test on input** (debounced)
   - As user types, preview updates
   - 300ms debounce to avoid excessive updates

2. **Test with multiple samples**
   - Button to cycle through multiple sample values
   - Shows success/failure for each sample

3. **Regex Highlighter** (for REGEX operation)
   - Highlight matched portions in sample text
   - Show capture groups visually
   ```
   Input: "Error from IP: 192.168.1.1"
            └──────────┬─────────────┘
                   Captured Group 1
   ```

4. **Error feedback**
   - Red border on fields with errors
   - Inline error messages
   - Suggestions for fixes

### 1.9 Mobile Considerations

#### Responsive Behavior (< 1024px)

1. **Operations panel below source field**
   - Full width on mobile
   - Stacked layout instead of side-by-side

2. **Simplified operation selection**
   - Dropdown instead of radio buttons (saves space)
   - Operation config in collapsible sections

3. **Touch-friendly targets**
   - Larger buttons (min 44px)
   - More spacing between elements

4. **Scrollable sections**
   - Preview panel sticky at bottom
   - Operation config scrollable

### 1.10 Progressive Complexity

#### Beginner Mode
- Presets and templates prominently displayed
- "Common patterns" available for each operation
- Examples always visible
- Guided workflow with help text

#### Expert Mode (Optional Toggle)
- Direct syntax input
- Ability to type operation syntax directly into inputRule field
- Raw JSON editing
- Chaining multiple operations (advanced feature)

### 1.11 Accessibility

1. **Keyboard Navigation**
   - Tab through all fields
   - Enter to expand/collapse sections
   - Escape to close panels

2. **Screen Reader Support**
   - ARIA labels on all interactive elements
   - Announcements for preview updates
   - Error announcements

3. **Focus Management**
   - Focus trap in dialog
   - Clear focus indicators
   - Logical tab order

---

## 2. Interaction Design (Phase 1.2)

### 2.1 Micro-Interactions

#### Operation Selection Animation
```
State: Default
  → Operations panel collapsed
  → "[+] Add Operation" button visible
  → Badge shows "5 operations"

User Action: Click "[+] Add Operation"
  → Button icon changes to "[-]"
  → Panel slides down (200ms ease-out)
  → Operation options fade in (staggered 50ms delay)

User Action: Select operation type
  → Radio button scales slightly (1.1x for 100ms)
  → Selected option background color changes
  → Configuration panel slides in from right (250ms)
  → Preview panel highlights (subtle pulse)
```

#### Input Field Interactions

**Regex Pattern Input**
```
State: Empty
  → Border: gray
  → Placeholder: "/pattern/"

State: Typing
  → Border: blue (focus)
  → Debounced validation after 300ms
  → Loading spinner in preview during validation

State: Valid
  → Border: green
  → Checkmark icon appears
  → Preview updates with result

State: Invalid
  → Border: red
  → Error icon appears
  → Error message slides in below
  → Suggestion appears (if available)
```

#### Preview Update Animation
```
On Input Change:
  → Preview fades out (100ms)
  → Loading spinner appears (if validation > 200ms)
  → Preview fades in with new result (200ms)
  → Result text slides up slightly (subtle)
```

### 2.2 State Management

#### Operation State Machine

```
States:
  - None: No operation selected
  - Selecting: Operation selected, configuring parameters
  - Validating: Checking operation syntax/parameters
  - Valid: Operation configured correctly
  - Invalid: Operation has errors
  - Testing: User manually testing operation

Transitions:
  None → Selecting: User selects operation type
  Selecting → Validating: User enters parameters
  Validating → Valid: Validation passes
  Validating → Invalid: Validation fails
  Valid → Testing: User clicks "Test Operation"
  Testing → Valid: Test completes successfully
  Testing → Invalid: Test fails
  Any → None: User clicks "Clear Operation"
```

#### Visual States

**Button States**
```css
/* Add Operation Button */
.add-operation-btn {
  /* Default */
  background: transparent;
  border: 2px dashed #2196f3;
  color: #2196f3;

  /* Hover */
  &:hover {
    background: rgba(33, 150, 243, 0.1);
    border: 2px solid #2196f3;
    transform: translateY(-1px);
  }

  /* Active */
  &:active {
    transform: translateY(0);
  }

  /* Expanded */
  &.expanded {
    background: rgba(33, 150, 243, 0.15);
    border: 2px solid #2196f3;
  }
}

/* Test Operation Button */
.test-operation-btn {
  /* Default */
  background: #2196f3;
  color: white;

  /* Hover */
  &:hover {
    background: #1976d2;
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
  }

  /* Loading */
  &.loading {
    opacity: 0.7;
    cursor: wait;
    /* Spinner animation */
  }

  /* Success (brief) */
  &.success {
    background: #4caf50;
    animation: pulse 500ms;
  }

  /* Error (brief) */
  &.error {
    background: #f44336;
    animation: shake 300ms;
  }
}
```

**Input Field States**
```css
.operation-input {
  /* Default */
  border: 1px solid rgba(0, 0, 0, 0.24);

  /* Focus */
  &:focus {
    border: 2px solid #2196f3;
    outline: none;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  }

  /* Valid */
  &.valid {
    border: 2px solid #4caf50;
    background: rgba(76, 175, 80, 0.05);
  }

  /* Invalid */
  &.invalid {
    border: 2px solid #f44336;
    background: rgba(244, 67, 54, 0.05);
  }

  /* Disabled/Readonly */
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
}
```

### 2.3 Feedback Mechanisms

#### Success Feedback
```
✓ Operation configured successfully
  → Green border on preview panel
  → Checkmark icon in preview
  → Brief green flash animation
  → Toast notification (optional): "Operation ready to save"
```

#### Error Feedback
```
✗ Regex pattern is invalid
  → Red border on input field
  → Error icon next to field
  → Error message below field
  → Preview shows error state
  → Suggestion link (if available)
```

#### Progress Feedback
```
⏳ Testing operation...
  → Spinner in preview panel
  → "Test Operation" button shows loading state
  → Disabled save button during validation
```

### 2.4 Transitions & Animations

#### Panel Transitions
```
Expand/Collapse:
  - Duration: 250ms
  - Easing: cubic-bezier(0.4, 0.0, 0.2, 1)
  - Transform: translateY + opacity
```

#### Hover Effects
```
Interactive Elements:
  - Duration: 150ms
  - Easing: ease-in-out
  - Transform: translateY(-1px) for buttons
  - Box-shadow expansion
```

#### Loading States
```
Spinner Animation:
  - Duration: 1s
  - Easing: linear
  - Rotation: 0 to 360deg
  - Infinite loop
```

### 2.5 Keyboard Shortcuts

```
Global (in dialog):
  - Tab: Navigate fields
  - Shift+Tab: Navigate backwards
  - Escape: Close dialog (with confirm if changes)
  - Enter: Submit form (if valid)

Operations Panel:
  - Alt+O: Toggle operations panel
  - Alt+T: Test operation
  - Alt+C: Clear operation

Operation Selection (when focused):
  - Arrow Up/Down: Navigate operation types
  - Space/Enter: Select operation
```

---

## 3. Visual Design (Phase 1.3)

### 3.1 Component Specifications

#### Add Operation Button
```
Size:
  - Width: Full width of container
  - Height: 44px (touch-friendly)
  - Padding: 12px 16px

Typography:
  - Font: inherit (Roboto)
  - Size: 14px
  - Weight: 500
  - Letter spacing: 0.25px

Colors:
  - Default:
      Text: #2196f3
      Border: 2px dashed #2196f3
      Background: transparent
  - Hover:
      Text: #2196f3
      Border: 2px solid #2196f3
      Background: rgba(33, 150, 243, 0.08)
  - Expanded:
      Text: #ffffff
      Border: 2px solid #2196f3
      Background: #2196f3

Icon:
  - Size: 18px
  - Position: Left (8px margin-right)
  - Default: "add" icon
  - Expanded: "remove" icon
  - Transition: rotate 90deg + fade
```

#### Operations Panel
```
Layout:
  - Margin-top: 16px
  - Padding: 20px
  - Border-radius: 8px
  - Border: 1px solid rgba(33, 150, 243, 0.2)
  - Background: rgba(33, 150, 243, 0.05)

Animation:
  - Expand: 250ms ease-out
  - Max-height: 0 → auto (use max-height hack)
  - Opacity: 0 → 1
```

#### Operation Type Radio Buttons
```
Layout:
  - Vertical stack (block)
  - Spacing: 12px between options
  - Padding: 12px per option
  - Border-radius: 6px

Radio Button:
  - Size: 20px
  - Color: #2196f3
  - Position: Top-aligned with label

Label:
  - Font size: 15px
  - Font weight: 600
  - Color: #000000 (light) / #e3f2fd (dark)
  - Margin-left: 12px

Description:
  - Font size: 13px
  - Color: #666666 (light) / #b0b0b0 (dark)
  - Margin-left: 32px (align with label)
  - Margin-top: 4px

Icon:
  - Size: 24px
  - Position: Right side
  - Color: #2196f3
  - Icons:
      REGEX: "code"
      LookUp: "table_chart"
      LookUpStartsWith: "search"
      PREFIX: "text_fields"

Example Link:
  - Font size: 12px
  - Color: #2196f3
  - Position: Below description
  - Margin-left: 32px
  - Text: "See examples →"

States:
  - Default: background transparent
  - Hover: background rgba(33, 150, 243, 0.05)
  - Selected:
      background rgba(33, 150, 243, 0.12)
      border-left 4px solid #2196f3
```

#### Configuration Panel
```
Layout:
  - Margin-top: 16px
  - Padding: 16px
  - Border-radius: 6px
  - Border: 1px solid rgba(0, 0, 0, 0.12) (light)
  - Border: 1px solid rgba(255, 255, 255, 0.12) (dark)
  - Background: #ffffff (light) / #2c2c2c (dark)

Animation:
  - Slide in from right: translateX(20px) → translateX(0)
  - Duration: 200ms ease-out
  - Opacity: 0 → 1
```

#### Input Fields (Operation Parameters)
```
Size:
  - Height: 40px
  - Padding: 8px 12px
  - Border-radius: 4px
  - Full width

Typography:
  - Font size: 14px
  - Font family: 'Roboto Mono' (for code-like inputs like regex)
  - Line height: 1.5

Colors (Light):
  - Background: #ffffff
  - Border: 1px solid rgba(0, 0, 0, 0.24)
  - Text: #000000
  - Placeholder: rgba(0, 0, 0, 0.38)

Colors (Dark):
  - Background: #1e1e1e
  - Border: 1px solid rgba(255, 255, 255, 0.24)
  - Text: #e3f2fd
  - Placeholder: rgba(255, 255, 255, 0.38)

States:
  - Focus:
      Border: 2px solid #2196f3
      Box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1)
  - Valid:
      Border: 2px solid #4caf50
      Icon: checkmark (right)
  - Invalid:
      Border: 2px solid #f44336
      Icon: error (right)
      Background: rgba(244, 67, 54, 0.05)
```

#### Preview Panel
```
Layout:
  - Margin-top: 16px
  - Padding: 16px
  - Border-radius: 6px
  - Border: 1px solid #2196f3
  - Background:
      Light: rgba(33, 150, 243, 0.03)
      Dark: rgba(33, 150, 243, 0.1)

Header:
  - Font size: 13px
  - Font weight: 600
  - Color: #2196f3
  - Icon: "preview" (20px)
  - Margin-bottom: 12px

Sample Input Section:
  - Label: "Sample Input:" (12px, grey)
  - Value: 14px, monospace, word-wrap
  - Background: rgba(0, 0, 0, 0.05) (light)
  - Padding: 8px
  - Border-radius: 4px

Arrow Indicator:
  - Icon: "arrow_downward"
  - Size: 20px
  - Color: #2196f3
  - Margin: 8px 0

Operation Display:
  - Font: 12px monospace
  - Color: #666 (light) / #999 (dark)
  - Italic style
  - Background: transparent

Result Section:
  - Label: "Result:" (12px, grey)
  - Value: 14px, monospace, bold
  - Color: #4caf50 (success) / #f44336 (error)
  - Background:
      Success: rgba(76, 175, 80, 0.1)
      Error: rgba(244, 67, 54, 0.1)
  - Padding: 8px
  - Border-radius: 4px
  - Icon: checkmark or error icon
```

#### Preset Buttons (DateTime Format, Regex Patterns)
```
Size:
  - Height: 32px
  - Padding: 6px 12px
  - Border-radius: 4px

Typography:
  - Font size: 13px
  - Font weight: 500

Layout:
  - Display: inline-flex
  - Gap: 8px between buttons
  - Wrap on overflow

Colors:
  - Default:
      Background: transparent
      Border: 1px solid rgba(33, 150, 243, 0.5)
      Text: #2196f3
  - Hover:
      Background: rgba(33, 150, 243, 0.1)
      Border: 1px solid #2196f3
  - Active (selected):
      Background: #2196f3
      Text: #ffffff
```

#### Test Operation Button
```
Size:
  - Height: 36px
  - Padding: 8px 16px
  - Border-radius: 4px

Typography:
  - Font size: 14px
  - Font weight: 500
  - Letter spacing: 0.5px

Colors:
  - Default:
      Background: #2196f3
      Text: #ffffff
  - Hover:
      Background: #1976d2
      Box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3)
  - Loading:
      Background: #2196f3
      Opacity: 0.8
      Cursor: wait
  - Success (brief):
      Background: #4caf50
  - Error (brief):
      Background: #f44336

Icon:
  - Size: 18px
  - Position: Left (6px margin-right)
  - Default: "play_arrow"
  - Loading: spinner animation
  - Success: "check_circle"
  - Error: "error"
```

#### Error Message
```
Layout:
  - Margin-top: 8px
  - Padding: 8px 12px
  - Border-radius: 4px
  - Border-left: 4px solid #f44336

Typography:
  - Font size: 13px
  - Line height: 1.5

Colors:
  - Background: rgba(244, 67, 54, 0.1)
  - Text: #d32f2f (light) / #ff5252 (dark)
  - Icon: #f44336

Icon:
  - Size: 18px
  - Position: Left (8px margin-right)
  - Icon: "error_outline"

Suggestion Link (if present):
  - Font size: 13px
  - Color: #2196f3
  - Text decoration: underline
  - Margin-top: 4px
```

### 3.2 Icons

#### Operation Type Icons
```
REGEX:           "code"              (Material Icons)
LookUp:          "table_chart"       (Material Icons)
LookUpStartsWith: "search"           (Material Icons)
PREFIX:          "text_fields"       (Material Icons)
DateTime Format: "schedule"          (Material Icons)

State Icons:
Success:         "check_circle"      (Material Icons)
Error:           "error"             (Material Icons)
Warning:         "warning"           (Material Icons)
Info:            "info"              (Material Icons)
Help:            "help_outline"      (Material Icons)

Action Icons:
Add:             "add"               (Material Icons)
Remove:          "remove"            (Material Icons)
Expand:          "expand_more"       (Material Icons)
Collapse:        "expand_less"       (Material Icons)
Test:            "play_arrow"        (Material Icons)
Clear:           "clear"             (Material Icons)
Copy:            "content_copy"      (Material Icons)
Preview:         "visibility"        (Material Icons)
```

### 3.3 Color System

#### Primary Colors (Operations)
```
Primary Blue:     #2196f3
Primary Dark:     #1976d2
Primary Light:    #64b5f6

Accent (DateTime): #ff9800 (Orange)
```

#### State Colors
```
Success:          #4caf50
Error:            #f44336
Warning:          #ff9800
Info:             #2196f3
```

#### Background Colors (Light Theme)
```
Dialog:           #ffffff
Panel:            rgba(33, 150, 243, 0.05)
Config Panel:     #ffffff
Input:            #ffffff
Preview:          rgba(33, 150, 243, 0.03)
Error Bg:         rgba(244, 67, 54, 0.05)
Success Bg:       rgba(76, 175, 80, 0.05)
```

#### Background Colors (Dark Theme)
```
Dialog:           #263238
Panel:            rgba(33, 150, 243, 0.1)
Config Panel:     #2c2c2c
Input:            #1e1e1e
Preview:          rgba(33, 150, 243, 0.15)
Error Bg:         rgba(244, 67, 54, 0.1)
Success Bg:       rgba(76, 175, 80, 0.1)
```

#### Text Colors (Light Theme)
```
Primary:          #000000
Secondary:        #666666
Disabled:         rgba(0, 0, 0, 0.38)
Link:             #2196f3
Code:             #d32f2f
```

#### Text Colors (Dark Theme)
```
Primary:          #e3f2fd
Secondary:        #b0b0b0
Disabled:         rgba(255, 255, 255, 0.38)
Link:             #64b5f6
Code:             #ff5252
```

### 3.4 Typography

#### Font Families
```
Primary:          'Roboto', sans-serif
Monospace:        'Roboto Mono', monospace  (for code inputs)
```

#### Font Sizes & Weights
```
Dialog Title:     20px, weight 600
Section Header:   16px, weight 600
Label:            14px, weight 500
Input Text:       14px, weight 400
Body Text:        14px, weight 400
Caption:          12px, weight 400
Code:             13px, weight 400
Button:           14px, weight 500
```

### 3.5 Spacing System

```
XXS:  4px   (tight spacing)
XS:   8px   (compact spacing)
S:    12px  (small spacing)
M:    16px  (default spacing)
L:    20px  (comfortable spacing)
XL:   24px  (loose spacing)
XXL:  32px  (section spacing)
```

### 3.6 Shadows

```
Elevation 1 (Inputs):
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12),
              0 1px 2px rgba(0, 0, 0, 0.24);

Elevation 2 (Panels):
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16),
              0 3px 6px rgba(0, 0, 0, 0.23);

Elevation 3 (Dialogs):
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19),
              0 6px 6px rgba(0, 0, 0, 0.23);

Focus Shadow:
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
```

### 3.7 Responsive Breakpoints

```
Mobile:       < 768px
Tablet:       768px - 1024px
Desktop:      > 1024px

Adjustments:
  Mobile:
    - Full width panels
    - Stacked layout
    - Larger touch targets (44px min)
    - Simplified operation selection (dropdown)

  Tablet:
    - Slightly condensed spacing
    - Side-by-side where possible

  Desktop:
    - Full feature set
    - Side-by-side layouts
    - Hover effects
```

### 3.8 Dark Theme Specifics

#### Panel Backgrounds
```
Operations Panel:  rgba(33, 150, 243, 0.1)  (more prominent)
Config Panel:      #2c2c2c
Preview Panel:     rgba(33, 150, 243, 0.15)
```

#### Border Colors
```
Default:           rgba(255, 255, 255, 0.12)
Focused:           #2196f3
Valid:             #4caf50
Invalid:           #f44336
```

#### Input Fields
```
Background:        #1e1e1e
Text:              #e3f2fd
Placeholder:       rgba(255, 255, 255, 0.38)
Border:            rgba(255, 255, 255, 0.24)
```

---

## 4. Implementation Specification (Phase 2)

### 4.1 Data Models

#### Operation Configuration Structure
```javascript
// Operation configuration stored in mapping
{
  id: "mapping-12345",
  inputRule: "REGEX($.message, /IP: (\\d+\\.\\d+\\.\\d+\\.\\d+)/, 1)",
  // OR
  inputRule: "LookUp(HTTP_STATUS_CODES, $.status_code)",
  // OR
  inputRule: "PREFIX('SERVER-')",
  // OR just plain field path
  inputRule: "$.field.path",

  lrSchemaField: "srcip",
  type: "String",
  format: null, // For DateTime: "yyyy-MM-dd HH:mm:ss.SSS"
  default: null,
  alternativeFields: [],
  fanoutParentElement: null,

  // NEW: Operation metadata for UI (not sent to backend)
  _operationMeta: {
    type: "REGEX" | "LookUp" | "LookUpStartsWith" | "PREFIX" | null,
    parameters: {
      // For REGEX
      pattern: "/IP: (\\d+\\.\\d+\\.\\d+\\.\\d+)/",
      captureGroup: 1,

      // For LookUp/LookUpStartsWith
      tableName: "HTTP_STATUS_CODES",

      // For PREFIX
      prefix: "SERVER-"
    },
    validated: true,
    previewResult: "192.168.1.1"
  }
}
```

#### Operation Parser Utility
```javascript
/**
 * Parse operation syntax from inputRule
 * Extracts operation type and parameters
 */
export function parseOperationFromInputRule(inputRule) {
  if (!inputRule || typeof inputRule !== 'string') {
    return {
      type: null,
      fieldPath: inputRule,
      parameters: {}
    };
  }

  // Check for REGEX operation
  const regexMatch = inputRule.match(/^REGEX\((.*?),\s*(\/.*?\/),\s*(\d+)\)$/);
  if (regexMatch) {
    return {
      type: 'REGEX',
      fieldPath: regexMatch[1].trim(),
      parameters: {
        pattern: regexMatch[2].trim(),
        captureGroup: parseInt(regexMatch[3])
      }
    };
  }

  // Check for LookUp operation
  const lookupMatch = inputRule.match(/^LookUp\((.*?),\s*(.*?)\)$/);
  if (lookupMatch) {
    return {
      type: 'LookUp',
      fieldPath: lookupMatch[2].trim(),
      parameters: {
        tableName: lookupMatch[1].trim()
      }
    };
  }

  // Check for LookUpStartsWith operation
  const lookupStartsMatch = inputRule.match(/^LookUpStartsWith\((.*?),\s*(.*?)\)$/);
  if (lookupStartsMatch) {
    return {
      type: 'LookUpStartsWith',
      fieldPath: lookupStartsMatch[2].trim(),
      parameters: {
        tableName: lookupStartsMatch[1].trim()
      }
    };
  }

  // Check for PREFIX operation
  const prefixMatch = inputRule.match(/^PREFIX\('(.*?)'\)$/);
  if (prefixMatch) {
    return {
      type: 'PREFIX',
      fieldPath: null,
      parameters: {
        prefix: prefixMatch[1]
      }
    };
  }

  // No operation, just plain field path
  return {
    type: null,
    fieldPath: inputRule,
    parameters: {}
  };
}

/**
 * Build operation syntax from type and parameters
 */
export function buildOperationSyntax(type, fieldPath, parameters) {
  switch (type) {
    case 'REGEX':
      return `REGEX(${fieldPath}, ${parameters.pattern}, ${parameters.captureGroup})`;

    case 'LookUp':
      return `LookUp(${parameters.tableName}, ${fieldPath})`;

    case 'LookUpStartsWith':
      return `LookUpStartsWith(${parameters.tableName}, ${fieldPath})`;

    case 'PREFIX':
      return `PREFIX('${parameters.prefix}')`;

    default:
      return fieldPath;
  }
}
```

### 4.2 Component Structure

#### New Components
```
src/components/wizard/operations/
├── OperationSelector.vue         (Main operation panel)
├── RegexOperationConfig.vue      (REGEX configuration)
├── LookupOperationConfig.vue     (LookUp configuration)
├── PrefixOperationConfig.vue     (PREFIX configuration)
├── DateTimeFormatterConfig.vue   (DateTime formatter)
├── OperationPreview.vue          (Preview panel)
└── CommonPatterns.vue            (Preset patterns)
```

### 4.3 Updated Files

#### Step5_Mapping.vue
```vue
<template>
  <div class="mapping-dialog">
    <!-- Existing sections -->

    <!-- NEW: Operations Section (in mapping dialog) -->
    <div class="mapping-form-row">
      <q-input
        v-model="mappingForm.inputRule"
        label="Source Field (JSON Path) *"
        readonly
        outlined
        dense
      />
    </div>

    <!-- NEW: Operation Selector -->
    <operation-selector
      v-model="operationConfig"
      :field-path="originalFieldPath"
      :sample-value="mappingForm.sampleValue"
      @operation-changed="handleOperationChanged"
    />

    <!-- Existing: LR Schema Field, Type, etc. -->

    <!-- NEW: DateTime Formatter (conditionally shown) -->
    <date-time-formatter-config
      v-if="mappingForm.type === 'DateTime'"
      v-model="mappingForm.format"
      :sample-value="mappingForm.sampleValue"
    />

    <!-- Existing: Default, Alternative Fields, Fanout -->
  </div>
</template>

<script>
import OperationSelector from '../operations/OperationSelector.vue';
import DateTimeFormatterConfig from '../operations/DateTimeFormatterConfig.vue';
import { parseOperationFromInputRule, buildOperationSyntax } from '../../../utils/operationParser';

export default {
  components: {
    OperationSelector,
    DateTimeFormatterConfig
  },

  data() {
    return {
      originalFieldPath: '', // Store original path without operation
      operationConfig: {
        type: null,
        parameters: {}
      }
    };
  },

  methods: {
    createMappingFromNode(nodeData) {
      // ... existing code ...

      // Store original field path
      this.originalFieldPath = resolved.jsonPath;

      // Parse existing operation if present
      const parsed = parseOperationFromInputRule(resolved.jsonPath);
      this.operationConfig = {
        type: parsed.type,
        parameters: parsed.parameters
      };

      // Pre-fill form
      this.mappingForm = {
        // ... existing fields ...
        inputRule: resolved.jsonPath // May contain operation syntax
      };
    },

    handleOperationChanged(newConfig) {
      // Rebuild inputRule with new operation
      if (newConfig.type) {
        this.mappingForm.inputRule = buildOperationSyntax(
          newConfig.type,
          this.originalFieldPath,
          newConfig.parameters
        );
      } else {
        this.mappingForm.inputRule = this.originalFieldPath;
      }
    }
  }
};
</script>
```

#### MappingService.js Updates
```javascript
/**
 * Validate operation syntax
 *
 * @param {string} inputRule - The inputRule that may contain an operation
 * @returns {Object} Validation result
 */
static validateOperationSyntax(inputRule) {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    const parsed = parseOperationFromInputRule(inputRule);

    if (parsed.type === 'REGEX') {
      // Validate regex pattern
      try {
        const pattern = parsed.parameters.pattern.slice(1, -1); // Remove / /
        new RegExp(pattern);
      } catch (e) {
        result.isValid = false;
        result.errors.push(`Invalid regex pattern: ${e.message}`);
      }

      // Validate capture group
      if (!Number.isInteger(parsed.parameters.captureGroup)) {
        result.isValid = false;
        result.errors.push('Capture group must be an integer');
      }
    }

    if (parsed.type === 'LookUp' || parsed.type === 'LookUpStartsWith') {
      // Validate table name
      if (!parsed.parameters.tableName) {
        result.isValid = false;
        result.errors.push('Table name is required for lookup operations');
      }
      // TODO: Check if table exists (requires backend API)
    }

    if (parsed.type === 'PREFIX') {
      // Validate prefix
      if (!parsed.parameters.prefix) {
        result.isValid = false;
        result.errors.push('Prefix string is required');
      }
    }

    return result;
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Operation parsing failed: ${error.message}`);
    return result;
  }
}

/**
 * Test operation on sample data
 *
 * @param {string} inputRule - The inputRule with operation
 * @param {*} sampleValue - Sample value to test on
 * @returns {Object} Test result with output or error
 */
static testOperation(inputRule, sampleValue) {
  try {
    const parsed = parseOperationFromInputRule(inputRule);

    if (parsed.type === 'REGEX') {
      // Test regex extraction
      const pattern = parsed.parameters.pattern.slice(1, -1);
      const regex = new RegExp(pattern);
      const match = String(sampleValue).match(regex);

      if (!match) {
        return {
          success: false,
          error: 'Regex pattern did not match sample value',
          output: null
        };
      }

      const captureGroup = parsed.parameters.captureGroup;
      const output = match[captureGroup];

      if (output === undefined) {
        return {
          success: false,
          error: `Capture group ${captureGroup} not found (pattern has ${match.length - 1} groups)`,
          output: null
        };
      }

      return {
        success: true,
        error: null,
        output: output
      };
    }

    if (parsed.type === 'LookUp') {
      // Mock lookup (requires backend integration)
      return {
        success: true,
        error: null,
        output: `[Lookup result for "${sampleValue}" from ${parsed.parameters.tableName}]`
      };
    }

    if (parsed.type === 'LookUpStartsWith') {
      // Mock lookup starts with
      return {
        success: true,
        error: null,
        output: `[LookupStartsWith result for "${sampleValue}" from ${parsed.parameters.tableName}]`
      };
    }

    if (parsed.type === 'PREFIX') {
      // Test prefix
      return {
        success: true,
        error: null,
        output: `${parsed.parameters.prefix}${sampleValue}`
      };
    }

    // No operation
    return {
      success: true,
      error: null,
      output: sampleValue
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: null
    };
  }
}
```

### 4.4 Utility Files

#### src/utils/operationParser.js
```javascript
/**
 * Utility functions for parsing and building operation syntax
 * Used across operation components
 */

export function parseOperationFromInputRule(inputRule) {
  // Implementation from section 4.1
}

export function buildOperationSyntax(type, fieldPath, parameters) {
  // Implementation from section 4.1
}

export function getOperationTypeLabel(type) {
  const labels = {
    'REGEX': 'Extract with Regex',
    'LookUp': 'Lookup from Table',
    'LookUpStartsWith': 'Lookup with Prefix',
    'PREFIX': 'Add Prefix'
  };
  return labels[type] || 'Unknown Operation';
}

export function getOperationTypeIcon(type) {
  const icons = {
    'REGEX': 'code',
    'LookUp': 'table_chart',
    'LookUpStartsWith': 'search',
    'PREFIX': 'text_fields'
  };
  return icons[type] || 'help';
}
```

#### src/utils/regexPatterns.js
```javascript
/**
 * Common regex patterns for quick selection
 */
export const COMMON_PATTERNS = [
  {
    name: 'IP Address',
    pattern: '/(\\d+\\.\\d+\\.\\d+\\.\\d+)/',
    captureGroup: 1,
    example: 'Extract "192.168.1.1" from "Connection from 192.168.1.1"'
  },
  {
    name: 'IPv6 Address',
    pattern: '/([0-9a-fA-F:]+)/',
    captureGroup: 1,
    example: 'Extract IPv6 addresses'
  },
  {
    name: 'Email Address',
    pattern: '/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/',
    captureGroup: 1,
    example: 'Extract "user@example.com" from text'
  },
  {
    name: 'URL',
    pattern: '/(https?:\\/\\/[^\\s]+)/',
    captureGroup: 1,
    example: 'Extract URLs starting with http:// or https://'
  },
  {
    name: 'MAC Address',
    pattern: '/([0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2})/',
    captureGroup: 1,
    example: 'Extract MAC address like "00:1A:2B:3C:4D:5E"'
  },
  {
    name: 'Hostname',
    pattern: '/([a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+)/',
    captureGroup: 1,
    example: 'Extract "server.example.com"'
  },
  {
    name: 'Port Number',
    pattern: '/:([0-9]{1,5})/',
    captureGroup: 1,
    example: 'Extract port from "192.168.1.1:8080"'
  },
  {
    name: 'File Path (Windows)',
    pattern: '/([A-Za-z]:\\\\[^\\s]+)/',
    captureGroup: 1,
    example: 'Extract "C:\\Users\\Admin\\file.txt"'
  },
  {
    name: 'File Path (Linux)',
    pattern: '/(\/[^\\s]+)/',
    captureGroup: 1,
    example: 'Extract "/var/log/syslog"'
  },
  {
    name: 'Username',
    pattern: '/user[:\\s]+(\\w+)/',
    captureGroup: 1,
    example: 'Extract username from "user: admin" or "user admin"'
  }
];
```

#### src/utils/dateTimeFormats.js
```javascript
/**
 * Common DateTime format patterns
 */
export const DATETIME_PRESETS = [
  {
    name: 'ISO 8601',
    pattern: 'yyyy-MM-ddTHH:mm:ss.fffK',
    example: '2023-11-19T14:30:00.123+00:00'
  },
  {
    name: 'RFC 3339',
    pattern: 'yyyy-MM-ddTHH:mm:ssZ',
    example: '2023-11-19T14:30:00Z'
  },
  {
    name: 'US Format',
    pattern: 'MM/dd/yyyy HH:mm:ss',
    example: '11/19/2023 14:30:00'
  },
  {
    name: 'EU Format',
    pattern: 'dd/MM/yyyy HH:mm:ss',
    example: '19/11/2023 14:30:00'
  },
  {
    name: 'LogRhythm Default',
    pattern: 'yyyy-MM-dd HH:mm:ss.SSS',
    example: '2023-11-19 14:30:00.123'
  },
  {
    name: 'Date Only',
    pattern: 'yyyy-MM-dd',
    example: '2023-11-19'
  },
  {
    name: 'Time Only',
    pattern: 'HH:mm:ss',
    example: '14:30:00'
  }
];

export const FORMAT_COMPONENTS = {
  year: [
    { label: 'yyyy (4-digit)', value: 'yyyy', example: '2023' },
    { label: 'yy (2-digit)', value: 'yy', example: '23' }
  ],
  month: [
    { label: 'MM (01-12)', value: 'MM', example: '11' },
    { label: 'M (1-12)', value: 'M', example: '11' }
  ],
  day: [
    { label: 'dd (01-31)', value: 'dd', example: '19' },
    { label: 'd (1-31)', value: 'd', example: '19' }
  ],
  hour: [
    { label: 'HH (00-23)', value: 'HH', example: '14' },
    { label: 'hh (01-12)', value: 'hh', example: '02' }
  ],
  minute: [
    { label: 'mm (00-59)', value: 'mm', example: '30' }
  ],
  second: [
    { label: 'ss (00-59)', value: 'ss', example: '00' }
  ],
  millisecond: [
    { label: 'SSS (000-999)', value: 'SSS', example: '123' },
    { label: 'fff (fractional)', value: 'fff', example: '123' }
  ],
  timezone: [
    { label: 'K (offset)', value: 'K', example: '+00:00' },
    { label: 'Z (UTC)', value: 'Z', example: 'Z' },
    { label: 'None', value: '', example: '' }
  ]
};
```

---

## 5. Development Tasks (Phase 3)

### 5.1 Component Development

#### Task 1: Create OperationSelector Component
**File:** `src/components/wizard/operations/OperationSelector.vue`

**Responsibilities:**
- Render "[+] Add Operation" button
- Show/hide operations panel
- Display operation type radio buttons
- Emit operation changes to parent

**Props:**
```javascript
{
  value: { type: Object, required: true }, // operationConfig
  fieldPath: { type: String, required: true }, // original field path
  sampleValue: { type: [String, Number, Object], default: null }
}
```

**Events:**
```javascript
{
  'input': (operationConfig) => {}, // v-model update
  'operation-changed': (operationConfig) => {}
}
```

**Implementation Checklist:**
- [ ] Expandable panel with smooth animation
- [ ] Radio button group for operation types
- [ ] Icons and descriptions for each operation
- [ ] "See examples" links
- [ ] Clear operation button
- [ ] Dark theme styles
- [ ] Mobile responsive layout

---

#### Task 2: Create RegexOperationConfig Component
**File:** `src/components/wizard/operations/RegexOperationConfig.vue`

**Responsibilities:**
- Regex pattern input with validation
- Capture group input
- Common patterns dropdown
- Real-time preview with sample data
- Test operation button

**Props:**
```javascript
{
  value: { type: Object, required: true }, // { pattern, captureGroup }
  fieldPath: { type: String, required: true },
  sampleValue: { type: [String, Number], default: null }
}
```

**Implementation Checklist:**
- [ ] Pattern input with monospace font
- [ ] Capture group number input
- [ ] Common patterns dropdown (from regexPatterns.js)
- [ ] Insert pattern button
- [ ] Preview panel with highlighted matches
- [ ] Test operation button
- [ ] Validation and error messages
- [ ] Dark theme styles

---

#### Task 3: Create LookupOperationConfig Component
**File:** `src/components/wizard/operations/LookupOperationConfig.vue`

**Responsibilities:**
- Table name dropdown
- Display available lookup tables
- Preview lookup result
- Validate table exists

**Props:**
```javascript
{
  value: { type: Object, required: true }, // { tableName }
  fieldPath: { type: String, required: true },
  sampleValue: { type: [String, Number], default: null },
  operationType: { type: String, required: true } // 'LookUp' or 'LookUpStartsWith'
}
```

**Implementation Checklist:**
- [ ] Table name dropdown (populated from backend/constants)
- [ ] Table description tooltip
- [ ] "View table contents" link (future feature)
- [ ] Preview panel with lookup result
- [ ] Test operation button
- [ ] Validation and error messages
- [ ] Dark theme styles

---

#### Task 4: Create PrefixOperationConfig Component
**File:** `src/components/wizard/operations/PrefixOperationConfig.vue`

**Responsibilities:**
- Prefix string input
- Preview with prefixed sample value
- Validation

**Props:**
```javascript
{
  value: { type: Object, required: true }, // { prefix }
  sampleValue: { type: [String, Number], default: null }
}
```

**Implementation Checklist:**
- [ ] Prefix string input
- [ ] Preview panel with prefixed result
- [ ] Test operation button
- [ ] Validation (non-empty prefix)
- [ ] Dark theme styles

---

#### Task 5: Create DateTimeFormatterConfig Component
**File:** `src/components/wizard/operations/DateTimeFormatterConfig.vue`

**Responsibilities:**
- Format pattern input
- Preset buttons for common formats
- Pattern builder (optional)
- Format pattern reference
- Preview formatted DateTime

**Props:**
```javascript
{
  value: { type: String, default: null }, // format pattern string
  sampleValue: { type: String, default: null } // sample DateTime value
}
```

**Implementation Checklist:**
- [ ] Format pattern input
- [ ] Preset buttons (from dateTimeFormats.js)
- [ ] Pattern builder (toggle) with component dropdowns
- [ ] Pattern reference (expandable)
- [ ] Preview panel with formatted result
- [ ] Validation and error messages
- [ ] Dark theme styles

---

#### Task 6: Create OperationPreview Component
**File:** `src/components/wizard/operations/OperationPreview.vue`

**Responsibilities:**
- Display sample input value
- Show operation syntax
- Display operation result
- Indicate success/error state

**Props:**
```javascript
{
  sampleValue: { type: [String, Number, Object], default: null },
  operationSyntax: { type: String, default: null },
  result: { type: [String, Number, Object], default: null },
  error: { type: String, default: null },
  loading: { type: Boolean, default: false }
}
```

**Implementation Checklist:**
- [ ] Sample input display (formatted)
- [ ] Operation syntax display (monospace)
- [ ] Result display (highlighted)
- [ ] Error state display
- [ ] Loading state (spinner)
- [ ] Success/error icons
- [ ] Copy operation syntax button
- [ ] Dark theme styles

---

### 5.2 Service Updates

#### Task 7: Update MappingService
**File:** `src/services/wizard/mappingService.js`

**New Methods:**
- `validateOperationSyntax(inputRule)`
- `testOperation(inputRule, sampleValue)`
- `parseOperation(inputRule)` (delegate to operationParser)
- `buildOperation(type, fieldPath, parameters)` (delegate to operationParser)

**Implementation Checklist:**
- [ ] Implement `validateOperationSyntax` with comprehensive checks
- [ ] Implement `testOperation` with sample data testing
- [ ] Integrate operation validation into `validateMapping`
- [ ] Add operation testing to mapping preview
- [ ] Add JSDoc comments
- [ ] Unit tests for new methods

---

#### Task 8: Create Operation Parser Utility
**File:** `src/utils/operationParser.js`

**Functions:**
- `parseOperationFromInputRule(inputRule)`
- `buildOperationSyntax(type, fieldPath, parameters)`
- `getOperationTypeLabel(type)`
- `getOperationTypeIcon(type)`
- `validateRegexPattern(pattern)`
- `validateCaptureGroup(pattern, captureGroup)`

**Implementation Checklist:**
- [ ] Implement all parsing functions
- [ ] Add comprehensive regex matching for each operation type
- [ ] Handle edge cases (escaped characters, quotes, etc.)
- [ ] Add JSDoc comments
- [ ] Unit tests for all functions

---

#### Task 9: Create Constants Files
**Files:**
- `src/utils/regexPatterns.js`
- `src/utils/dateTimeFormats.js`
- `src/constants/lookupTables.js` (new)

**Implementation Checklist:**
- [ ] Define `COMMON_PATTERNS` array with 10+ patterns
- [ ] Define `DATETIME_PRESETS` array with 7+ formats
- [ ] Define `FORMAT_COMPONENTS` object with all components
- [ ] Define `LOOKUP_TABLES` array (mock or from backend)
- [ ] Add JSDoc comments
- [ ] Export all constants

---

### 5.3 Integration Tasks

#### Task 10: Update Step5_Mapping.vue
**File:** `src/components/wizard/steps/Step5_Mapping.vue`

**Changes:**
- Import operation components
- Add operation selector to mapping dialog
- Add DateTime formatter config (conditional)
- Handle operation state management
- Update save logic to include operations
- Update load logic to parse existing operations

**Implementation Checklist:**
- [ ] Import OperationSelector and DateTimeFormatterConfig
- [ ] Add operation selector after source field input
- [ ] Add DateTime formatter after type selector (if type === 'DateTime')
- [ ] Implement `handleOperationChanged` method
- [ ] Update `createMappingFromNode` to parse existing operations
- [ ] Update `saveMapping` to validate operations
- [ ] Update `editMapping` to load operation config
- [ ] Test with sample data

---

#### Task 11: Update Mapping Dialog Styles
**File:** `src/components/wizard/steps/Step5_Mapping.vue` (styles section)

**Changes:**
- Add styles for operation components
- Ensure dark theme compatibility
- Add responsive styles for mobile

**Implementation Checklist:**
- [ ] Add `.operation-section` styles
- [ ] Add `.operation-panel` styles
- [ ] Add responsive breakpoints
- [ ] Test dark theme
- [ ] Test mobile layout

---

### 5.4 Testing Tasks

#### Task 12: Unit Tests for Operation Components
**Files:**
- `tests/unit/components/operations/OperationSelector.spec.js`
- `tests/unit/components/operations/RegexOperationConfig.spec.js`
- `tests/unit/components/operations/LookupOperationConfig.spec.js`
- `tests/unit/components/operations/PrefixOperationConfig.spec.js`
- `tests/unit/components/operations/DateTimeFormatterConfig.spec.js`
- `tests/unit/components/operations/OperationPreview.spec.js`

**Test Cases:**
- Rendering tests
- User interaction tests
- Validation tests
- Preview update tests
- Dark theme tests

**Implementation Checklist:**
- [ ] Write tests for OperationSelector
- [ ] Write tests for RegexOperationConfig
- [ ] Write tests for LookupOperationConfig
- [ ] Write tests for PrefixOperationConfig
- [ ] Write tests for DateTimeFormatterConfig
- [ ] Write tests for OperationPreview
- [ ] All tests passing

---

#### Task 13: Unit Tests for Utilities
**Files:**
- `tests/unit/utils/operationParser.spec.js`
- `tests/unit/services/mappingService-operations.spec.js`

**Test Cases:**
- Operation parsing tests (all operation types)
- Operation building tests
- Validation tests
- Test operation execution
- Edge case handling

**Implementation Checklist:**
- [ ] Write tests for operationParser.js
- [ ] Write tests for MappingService operation methods
- [ ] Test edge cases (malformed syntax, invalid regex, etc.)
- [ ] All tests passing

---

#### Task 14: Integration Tests
**File:** `tests/integration/step5-operations.spec.js`

**Test Scenarios:**
1. Create mapping with REGEX operation
2. Create mapping with LookUp operation
3. Create mapping with PREFIX operation
4. Create mapping with DateTime formatter
5. Edit existing mapping with operation
6. Validate operation syntax errors
7. Test operation preview
8. Clear operation
9. Mobile responsive behavior
10. Dark theme compatibility

**Implementation Checklist:**
- [ ] Set up test environment
- [ ] Write all test scenarios
- [ ] Test on desktop
- [ ] Test on mobile viewport
- [ ] Test dark theme
- [ ] All tests passing

---

### 5.5 Documentation Tasks

#### Task 15: User Documentation
**File:** `docs/operations-guide.md`

**Sections:**
- Introduction to Operations & Formatters
- How to Add Operations
- REGEX Operation Guide
- LookUp Operation Guide
- PREFIX Operation Guide
- DateTime Formatter Guide
- Common Use Cases
- Troubleshooting

**Implementation Checklist:**
- [ ] Write introduction
- [ ] Document each operation type
- [ ] Add screenshots/diagrams
- [ ] Add examples for each use case
- [ ] Review and proofread

---

#### Task 16: Developer Documentation
**File:** `docs/operations-technical.md`

**Sections:**
- Architecture Overview
- Component Structure
- Data Models
- Operation Syntax Specification
- API Integration Points
- Testing Strategy
- Future Enhancements

**Implementation Checklist:**
- [ ] Write architecture overview
- [ ] Document component APIs
- [ ] Document data models
- [ ] Document operation syntax
- [ ] Add code examples
- [ ] Review and proofread

---

### 5.6 QA & Polish Tasks

#### Task 17: Accessibility Audit
**Checklist:**
- [ ] Keyboard navigation works for all interactive elements
- [ ] Tab order is logical
- [ ] ARIA labels on all form fields
- [ ] Error announcements for screen readers
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Test with screen reader (NVDA/JAWS)

---

#### Task 18: Cross-Browser Testing
**Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Test Cases:**
- [ ] All operations work correctly
- [ ] Animations smooth
- [ ] Dark theme displays correctly
- [ ] Mobile responsive layout
- [ ] No console errors

---

#### Task 19: Performance Optimization
**Checklist:**
- [ ] Debounce preview updates (300ms)
- [ ] Lazy load operation config components
- [ ] Optimize regex validation (avoid excessive re-validation)
- [ ] Test with 100+ mappings (ensure no lag)
- [ ] Profile component render times
- [ ] Optimize heavy computations

---

#### Task 20: Final Polish
**Checklist:**
- [ ] All animations smooth and consistent
- [ ] All icons display correctly
- [ ] All tooltips and help text proofread
- [ ] Dark theme styles consistent
- [ ] Mobile layout polished
- [ ] Loading states smooth
- [ ] Error messages clear and helpful
- [ ] Preview updates quickly
- [ ] No visual glitches or flickering

---

## Summary

This comprehensive design specification provides:

1. **UX Design** - Complete user flows, information architecture, discovery mechanisms, and help system
2. **Interaction Design** - Detailed micro-interactions, state management, feedback mechanisms, and animations
3. **Visual Design** - Complete component specs, color system, typography, icons, and dark theme support
4. **Implementation Specification** - Data models, component structure, file updates, and utility functions
5. **Development Tasks** - 20 detailed tasks covering components, services, integration, testing, documentation, and QA

The design prioritizes:
- **Progressive disclosure** - Operations section collapsed by default
- **Guided workflow** - Examples, presets, and templates for common use cases
- **Real-time feedback** - Preview panel with instant validation
- **Error prevention** - Comprehensive validation and helpful error messages
- **Accessibility** - Keyboard navigation and screen reader support
- **Dark theme** - Full compatibility with existing theme system
- **Mobile responsive** - Works on all device sizes

---

## Next Steps

**Phase 2: Synthesis**
The Frontend Tech Lead should review this comprehensive specification and prepare a consolidated implementation plan for the Front-End Developer.

**Phase 3: Implementation**
The Front-End Developer should follow the detailed tasks in Section 5, implementing components in the order specified and running tests after each component is complete.

**Phase 4: Testing & QA**
After implementation, the UI Tester, Functional Tester, and Wizard Tester should validate the implementation against the design specifications.

**Phase 5: Deployment**
The Deployment Manager should build and deploy the enhanced application for testing.

---

*End of Design Specification*
