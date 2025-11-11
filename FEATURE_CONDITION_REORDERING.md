# Filter Condition Reordering Feature

## Overview
Added drag-and-drop functionality and up/down buttons to allow users to reorder filter conditions in Step 4 (Filter Configuration) of the wizard.

## Feature Implementation Date
November 11, 2025

## Use Case
Users can now change the order of filter conditions to modify the evaluation logic. For example, if they have:
- Condition 1: `field1 == "a"` (AND)
- Condition 2: `field2 == "b"` (OR)
- Condition 3: `field3 == "c"`

Which generates: `field1 == "a" && field2 == "b" || field3 == "c"`

They can drag Condition 3 to the top to reorder and change the logic.

## Features

### 1. Drag and Drop
- **Draggable Conditions**: Each condition card can be dragged using the drag handle icon
- **Visual Feedback**: 
  - Dragged item becomes semi-transparent and slightly smaller
  - Drop target shows a blue line indicator at the top
  - Pulsing animation on drop target for better visibility
- **Cursor Changes**: 
  - Hand cursor when hovering over drag handle
  - Grabbing cursor while dragging

### 2. Up/Down Buttons
- **Move Up Button**: Moves condition one position up (disabled when at top)
- **Move Down Button**: Moves condition one position down (disabled when at bottom)
- **Accessibility**: Full keyboard navigation support
- **Tooltips**: Helpful tooltips on hover

### 3. Condition Number Display
- Shows the current position of each condition (e.g., "Condition 1", "Condition 2")
- Updates automatically when conditions are reordered
- Helps users track condition positions

## User Interface Components

### Reorder Controls Row
Located at the top of each condition card:
```
[Drag Handle] [Up Button] [Down Button]          [Condition #]
```

Components:
1. **Drag Handle**: `drag_indicator` icon - grab to drag
2. **Up Arrow Button**: Moves condition up one position
3. **Down Arrow Button**: Moves condition down one position
4. **Condition Number**: Badge showing position (e.g., "Condition 1")

## Technical Implementation

### Data Properties
```javascript
// Drag and drop state
draggedIndex: null,     // Index of item being dragged
dragOverIndex: null     // Index of item being hovered over
```

### Key Methods

#### Drag and Drop Methods
1. **onDragStart(event, index)**: Initiates drag operation
2. **onDragOver(event, index)**: Handles drag over event (shows drop target)
3. **onDragEnter(event, index)**: Updates drop target indicator
4. **onDragLeave(event, index)**: Clears drop target indicator
5. **onDrop(event, dropIndex)**: Completes the drop operation
6. **onDragEnd(event)**: Cleans up drag state

#### Reorder Methods
1. **reorderCondition(fromIndex, toIndex)**: Core reordering logic
   - Moves condition from one position to another
   - Updates validation states accordingly
   - Regenerates filter expression
   - Shows notification
2. **moveConditionUp(index)**: Moves condition up one position
3. **moveConditionDown(index)**: Moves condition down one position

### Validation State Management
When conditions are reordered, the validation states are also reordered to match:
- Maintains validation errors with the correct condition
- Prevents validation state loss during reordering
- Ensures UI consistency

### Expression Regeneration
After reordering:
- Filter expression is automatically regenerated
- Logical operators (AND/OR) are preserved with each condition
- Expression preview updates in real-time

## Styling

### Drag and Drop Visual Effects
```scss
.filter-condition-wrapper {
  cursor: move;
  
  &.dragging {
    opacity: 0.5;
    transform: scale(0.95);
  }
  
  &.drag-over::before {
    // Blue indicator line at top
    background: var(--q-color-primary);
    animation: pulse 0.5s ease-in-out infinite alternate;
  }
}
```

### Reorder Controls Styling
- Drag handle: Hover effect with blue color
- Up/Down buttons: Gray icons, disabled state handled automatically
- Condition number: Subtle badge with rounded corners
- Responsive layout for mobile devices

## Accessibility

### Keyboard Navigation
- Up/Down buttons fully keyboard accessible
- ARIA labels on all interactive elements
- Focus indicators on buttons

### Screen Reader Support
- Descriptive labels: "Move condition X up", "Move condition X down"
- Drag handle title attribute
- Condition number announced

### Visual Indicators
- Clear drag handle icon
- Button states (enabled/disabled)
- Drop target visual feedback
- Position numbering

## Responsive Design

### Mobile Adaptations
- Reorder controls wrap on smaller screens
- Condition number moves to top on mobile
- Drag handle and buttons resize appropriately
- Touch-friendly button sizes

### Breakpoint
```scss
@media (max-width: 768px) {
  .reorder-controls {
    flex-wrap: wrap;
  }
  
  .condition-number {
    flex: 1 1 100%;
    order: -1;
  }
}
```

## User Notifications

### Feedback Messages
1. **Successful Reorder**: 
   - Type: Info
   - Message: "Condition moved from position X to Y"
   - Icon: swap_vert
   - Duration: 1.5 seconds

2. **Reorder Error**:
   - Type: Negative
   - Message: "Failed to reorder condition"
   - Caption: Error details

## Usage Examples

### Example 1: Reorder via Drag and Drop
1. Hover over the drag handle (≡ icon) of a condition
2. Click and hold to start dragging
3. Drag the condition to the desired position
4. Drop it between other conditions (blue line indicator)
5. Expression updates automatically

### Example 2: Reorder via Up/Down Buttons
1. Click the up arrow (↑) to move condition up
2. Click the down arrow (↓) to move condition down
3. Buttons are disabled when at the first/last position
4. Expression updates automatically

## Benefits

1. **Improved UX**: Intuitive drag-and-drop interface
2. **Flexibility**: Multiple ways to reorder (drag or buttons)
3. **Visual Feedback**: Clear indicators during drag operations
4. **Accessibility**: Full keyboard and screen reader support
5. **Expression Control**: Easy way to modify filter logic order
6. **Error Prevention**: Disabled states prevent invalid operations

## Testing Recommendations

### Manual Testing
1. Drag a condition from top to bottom
2. Drag a condition from bottom to top
3. Drag a condition to middle position
4. Use up/down buttons for single-step moves
5. Test with validation errors present
6. Test on mobile/tablet devices
7. Test keyboard navigation
8. Verify expression updates correctly

### Edge Cases
1. Single condition (drag should work, buttons disabled)
2. Two conditions (test all combinations)
3. Many conditions (10+)
4. Conditions with validation errors
5. Reordering while dropdowns are open

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Touch events supported

## Future Enhancements
1. Multi-select and bulk reorder
2. Keyboard shortcuts (Ctrl+Up/Down)
3. Undo/Redo functionality
4. Animation improvements
5. Drag handle on touch devices optimization

## Related Files
- `frontend_standalone/src/components/wizard/steps/Step4_FilterConfig.vue` - Main component
- `FEATURE_VALUE_VALIDATION.md` - Related validation feature

## Notes
- Reordering preserves all condition properties (field, operator, value, fieldType, logicalOperator)
- Validation states move with their conditions
- Expression is regenerated after each reorder
- Drag and drop uses native HTML5 API (no external dependencies)
