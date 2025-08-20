# JSON Policy Builder Wizard - Comprehensive Interaction Design

## Executive Summary

This document defines the complete interaction design for the LogRhythm JSON Policy Builder wizard, focusing on creating an intuitive, guided experience that transforms complex policy creation into a step-by-step workflow. The design emphasizes progressive disclosure, immediate feedback, and contextual guidance to reduce cognitive load and improve user success rates.

## 1. Step Transitions and Animation Patterns

### 1.1 Wizard Navigation Structure

**Primary Navigation States:**
- **Active Step**: Current step with primary color indicator (blue-600)
- **Completed Step**: Green checkmark with fade-in animation (300ms ease-out)
- **Future Step**: Muted gray with subtle hover state
- **Error State**: Red indicator with gentle shake animation (200ms)

**Transition Animations:**
```css
/* Step transition timing */
.wizard-step-enter-active, .wizard-step-leave-active {
  transition: all 400ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.wizard-step-enter {
  opacity: 0;
  transform: translateX(30px);
}

.wizard-step-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
```

**Navigation Interaction Patterns:**

1. **Forward Navigation**
   - Slide-in from right animation (400ms)
   - Progressive disclosure of next step content
   - Validation gate prevents invalid progression
   - Loading spinner during data processing (minimum 500ms for perceived reliability)

2. **Backward Navigation** 
   - Slide-in from left animation (400ms)
   - Preserve form state with subtle highlight of changed fields
   - Confirmation dialog for unsaved changes (slide-down 250ms)

3. **Direct Step Navigation**
   - Only available for completed steps
   - Fade transition (300ms) with breadcrumb highlight
   - Smart scroll to changed content areas

### 1.2 Progress Indicator Interactions

**Visual Design:**
- Horizontal stepper with connecting lines
- Progress bar fills smoothly (800ms ease-in-out)
- Step numbers transform to checkmarks on completion
- Estimated time remaining updates in real-time

**Micro-interactions:**
- Hover state shows step name tooltip (150ms delay)
- Click animation: gentle scale (1.05x for 200ms)
- Completion celebration: subtle pulse effect (600ms)

## 2. Form Interactions and Validation Feedback

### 2.1 Real-time Validation Patterns

**Validation Timing Strategy:**
- **On Focus**: Show helper text and input requirements
- **On Input**: Debounced validation after 800ms of inactivity
- **On Blur**: Immediate validation with results
- **On Submit**: Comprehensive validation with focus management

**Visual Feedback System:**

1. **Success State**
   - Green border (2px solid #10B981)
   - Checkmark icon with fade-in (200ms)
   - Success message with slide-down animation (250ms)

2. **Error State**
   - Red border (2px solid #EF4444) 
   - Error icon with gentle shake (300ms)
   - Error message with bounce-in animation (200ms)
   - Focus management to first error field

3. **Warning State**
   - Amber border (2px solid #F59E0B)
   - Warning icon with subtle pulse
   - Advisory message with slide-in (200ms)

**Validation Error Recovery:**
```javascript
// Error state management
const showValidationError = (field, message) => {
  // Immediate visual feedback
  field.classList.add('error-state');
  
  // Animate error message
  const errorElement = field.nextElementSibling;
  errorElement.textContent = message;
  errorElement.style.transform = 'translateY(-10px)';
  errorElement.style.opacity = '0';
  
  requestAnimationFrame(() => {
    errorElement.style.transition = 'all 200ms ease-out';
    errorElement.style.transform = 'translateY(0)';
    errorElement.style.opacity = '1';
  });
};
```

### 2.2 Smart Form Behaviors

**Auto-completion and Suggestions:**
- Dropdown appears 300ms after typing stops
- Fuzzy search with highlighted matches
- Keyboard navigation (Up/Down arrows, Enter to select)
- Recent selections appear at top with subtle badge

**Form State Management:**
- Auto-save every 30 seconds with subtle flash notification
- Unsaved changes indicator (orange dot) in step navigation
- Smart defaults based on previous selections
- Progressive enhancement of form fields based on context

## 3. JSON Data Visualization and Interaction Patterns

### 3.1 JSON Tree Visualization

**Interactive JSON Tree Structure:**

1. **Expandable/Collapsible Nodes**
   - Smooth rotate animation for arrows (200ms)
   - Indent guides with subtle hover highlights
   - Lazy loading for large datasets with skeleton placeholders

2. **Selection Mechanisms**
   - Multi-select with Ctrl/Cmd + click
   - Drag selection for range selection
   - Visual feedback: selected nodes highlighted in blue-100 background
   - Selection counter with smooth number transitions

3. **Visual Hierarchy**
   - Array elements: Subtle blue border-left indicator
   - Object properties: Standard text presentation
   - Primitive values: Muted color with type badges
   - Null/undefined: Italic styling with distinct icon

**JSON Field Interaction Patterns:**

```css
.json-field {
  transition: all 200ms ease-out;
  border-radius: 4px;
  padding: 4px 8px;
}

.json-field:hover {
  background-color: rgba(59, 130, 246, 0.1);
  transform: translateX(2px);
}

.json-field.selected {
  background-color: rgba(59, 130, 246, 0.2);
  border-left: 3px solid #3B82F6;
}

.json-field.suggested {
  animation: suggestPulse 2s ease-in-out infinite;
}

@keyframes suggestPulse {
  0%, 100% { box-shadow: 0 0 0 rgba(34, 197, 94, 0); }
  50% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2); }
}
```

### 3.2 JSON Data Processing Visualizations

**Real-time Preview System:**
- Split-pane layout with before/after comparison
- Diff highlighting for transformed values
- Loading states with skeleton UI during processing
- Error highlighting for invalid JSON paths

**Data Transformation Feedback:**
1. **Processing States**
   - Loading spinner with progress indication
   - Success animation: gentle fade-in of results
   - Error states: shake animation with error message overlay

2. **Schema Rule Visualization**
   - Visual connections between source and target fields
   - Animated lines showing data flow (SVG paths)
   - Hover states revealing transformation details

## 4. Micro-interactions for Enhanced Understanding

### 4.1 Contextual Guidance Micro-interactions

**Smart Hints and Tips:**
- Contextual tooltips appear on 500ms hover delay
- Progressive disclosure of advanced options
- Animated callout boxes for important information
- Smart detection of user hesitation (pause tracking)

**Learning Scaffolding:**
```javascript
// Progressive difficulty adaptation
const adaptInterface = (userExperience) => {
  if (userExperience === 'beginner') {
    showDetailedExplanations();
    enableGentleAnimations();
    highlightNextActions();
  } else {
    showCompactInterface();
    enableRapidInteractions();
    showAdvancedOptions();
  }
};
```

### 4.2 Feedback and Confirmation Patterns

**Success Celebrations:**
- Subtle confetti animation on step completion (1000ms)
- Progress bar fill with satisfying easing curve
- Achievement badges for complex completions
- Sound feedback (optional, user-controlled)

**Immediate Response Patterns:**
- Button press: Scale down (0.95x) for 100ms, then return
- Card selection: Lift effect with shadow increase
- Field focus: Subtle glow animation (300ms)
- Data loading: Skeleton UI with shimmer effect

### 4.3 Attention Direction

**Smart Focus Management:**
- Automatic focus on primary action buttons
- Sequential revelation of form fields
- Gentle animation to draw attention to required fields
- Progressive color intensity for increasing urgency

## 5. Help System and Contextual Guidance Interactions

### 5.1 Layered Help Architecture

**Help System Hierarchy:**
1. **Inline Hints**: Immediately visible helper text
2. **Contextual Tooltips**: Detailed explanations on hover/focus
3. **Modal Help**: In-depth guidance without leaving context
4. **External Links**: Documentation and video tutorials

**Interactive Help Panel:**
```javascript
// Help panel behavior
const helpPanelStates = {
  COLLAPSED: 'collapsed',      // Icon only, right edge
  PEEK: 'peek',                // Partial expansion on hover
  EXPANDED: 'expanded',        // Full panel visibility
  MODAL: 'modal'               // Overlay mode for complex help
};

// Animation timing for help panel
const HELP_ANIMATIONS = {
  expand: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  collapse: '300ms ease-in',
  peek: '200ms ease-out'
};
```

### 5.2 Contextual Assistance Patterns

**Smart Help Triggering:**
- Hesitation detection (no action for 10+ seconds)
- Error pattern recognition (repeated failed attempts)
- Context-aware suggestions based on current step
- Progressive help escalation (hint → tooltip → modal)

**Interactive Examples:**
- Live code examples with syntax highlighting
- Interactive demos with guided walkthroughs
- Before/after comparisons with animated transitions
- Copy-to-clipboard with confirmation feedback

### 5.3 Documentation Integration

**Seamless Reference Access:**
- Quick reference cards with slide-out animation
- Searchable help with instant results highlighting
- Video tutorials embedded in contextual overlays
- Progressive disclosure of technical details

## 6. Error Handling and Recovery Patterns

### 6.1 Error Prevention Strategies

**Proactive Error Prevention:**
- Input validation with immediate feedback
- Smart defaults to prevent common mistakes
- Constraint-based UI (disable invalid options)
- Predictive validation with suggestion alternatives

**Error State Hierarchy:**
1. **Field-level Errors**: Red highlighting with specific messages
2. **Section-level Warnings**: Amber alerts with context
3. **System-level Issues**: Modal overlays with action plans
4. **Critical Failures**: Full-screen error with recovery options

### 6.2 Recovery Interaction Patterns

**Error Recovery Flows:**
```javascript
// Error recovery state machine
const errorRecoveryStates = {
  DETECT: {
    actions: ['highlight', 'showMessage', 'suggestFix'],
    transitions: ['GUIDE', 'IGNORE', 'ESCALATE']
  },
  GUIDE: {
    actions: ['showSteps', 'highlightPath', 'provideExample'],
    transitions: ['SUCCESS', 'ESCALATE', 'RETRY']
  },
  ESCALATE: {
    actions: ['showModal', 'contactSupport', 'exportState'],
    transitions: ['RESOLVED', 'REPORTED']
  }
};
```

**User-Friendly Error Messages:**
- Plain language explanations (avoid technical jargon)
- Specific, actionable guidance
- Visual examples of correct formats
- One-click fix options where possible

### 6.3 Graceful Degradation Patterns

**Progressive Enhancement Strategy:**
- Core functionality works without JavaScript
- Graceful fallbacks for failed API calls
- Offline mode with local storage persistence
- Reduced functionality modes for slow connections

**Error State Animations:**
```css
.error-shake {
  animation: errorShake 0.4s ease-in-out;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-fade-in {
  animation: errorFadeIn 0.3s ease-out;
}

@keyframes errorFadeIn {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

## 7. Implementation Examples and Code Specifications

### 7.1 Step Navigation Component

```vue
<template>
  <div class="wizard-navigation">
    <div class="progress-container">
      <div 
        class="progress-bar" 
        :style="{ width: `${progressPercentage}%` }"
      ></div>
    </div>
    
    <div class="steps-container">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id"
        class="step-item"
        :class="getStepClasses(step, index)"
        @click="navigateToStep(step, index)"
      >
        <div class="step-indicator">
          <template v-if="step.status === 'completed'">
            <q-icon name="check" class="step-icon completed-icon" />
          </template>
          <template v-else>
            <span class="step-number">{{ index + 1 }}</span>
          </template>
        </div>
        <span class="step-label">{{ step.title }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WizardNavigation',
  props: {
    steps: Array,
    currentStep: Number
  },
  computed: {
    progressPercentage() {
      const completedSteps = this.steps.filter(s => s.status === 'completed').length;
      return (completedSteps / this.steps.length) * 100;
    }
  },
  methods: {
    getStepClasses(step, index) {
      return {
        'step-current': index === this.currentStep,
        'step-completed': step.status === 'completed',
        'step-error': step.status === 'error',
        'step-disabled': !this.canNavigateToStep(index)
      };
    },
    
    navigateToStep(step, index) {
      if (this.canNavigateToStep(index)) {
        this.$emit('navigate', index);
      }
    },
    
    canNavigateToStep(targetIndex) {
      // Only allow navigation to completed steps or next incomplete step
      return targetIndex <= this.currentStep + 1 && 
             this.steps[targetIndex - 1]?.status === 'completed';
    }
  }
};
</script>
```

### 7.2 Form Validation with Animations

```vue
<template>
  <div class="form-field-container">
    <q-input
      v-model="fieldValue"
      :label="label"
      :error="hasError"
      :error-message="errorMessage"
      @blur="validateField"
      @input="onInput"
      class="animated-input"
      :class="{ 'success': isValid && isDirty }"
    >
      <template v-slot:append v-if="isValid && isDirty">
        <q-icon name="check_circle" color="positive" class="success-icon" />
      </template>
    </q-input>
    
    <transition name="error-message">
      <div v-if="hasError" class="error-message-container">
        <q-icon name="error" color="negative" size="sm" />
        <span class="error-text">{{ errorMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'AnimatedFormField',
  props: {
    value: String,
    label: String,
    validator: Function,
    debounceMs: { type: Number, default: 800 }
  },
  data() {
    return {
      fieldValue: this.value,
      hasError: false,
      errorMessage: '',
      isValid: false,
      isDirty: false,
      debounceTimeout: null
    };
  },
  methods: {
    onInput() {
      this.isDirty = true;
      this.clearValidation();
      
      // Debounced validation
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.validateField();
      }, this.debounceMs);
    },
    
    validateField() {
      if (this.validator) {
        const result = this.validator(this.fieldValue);
        
        if (result.isValid) {
          this.showSuccess();
        } else {
          this.showError(result.message);
        }
      }
    },
    
    showError(message) {
      this.hasError = true;
      this.isValid = false;
      this.errorMessage = message;
      
      // Trigger shake animation
      this.$el.classList.add('error-shake');
      setTimeout(() => {
        this.$el.classList.remove('error-shake');
      }, 400);
    },
    
    showSuccess() {
      this.hasError = false;
      this.isValid = true;
      this.errorMessage = '';
    },
    
    clearValidation() {
      this.hasError = false;
      this.isValid = false;
      this.errorMessage = '';
    }
  }
};
</script>

<style scoped>
.animated-input {
  transition: all 200ms ease-out;
}

.success-icon {
  animation: successPop 300ms ease-out;
}

@keyframes successPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.error-message-enter-active {
  transition: all 200ms ease-out;
}

.error-message-leave-active {
  transition: all 150ms ease-in;
}

.error-message-enter {
  opacity: 0;
  transform: translateY(-10px);
}

.error-message-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

### 7.3 JSON Tree Interactive Component

```vue
<template>
  <div class="json-tree-container">
    <div class="tree-controls">
      <q-btn 
        flat 
        dense 
        icon="unfold_more" 
        label="Expand All"
        @click="expandAll"
        class="control-btn"
      />
      <q-btn 
        flat 
        dense 
        icon="unfold_less" 
        label="Collapse All"
        @click="collapseAll"
        class="control-btn"
      />
      <q-separator vertical />
      <q-chip 
        v-if="selectedFields.length" 
        :label="`${selectedFields.length} selected`"
        color="primary"
        text-color="white"
        removable
        @remove="clearSelection"
      />
    </div>
    
    <div class="json-tree" @click="handleTreeClick">
      <json-node
        v-for="(value, key) in jsonData"
        :key="key"
        :name="key"
        :value="value"
        :path="key"
        :depth="0"
        :expanded="expandedNodes"
        :selected="selectedFields"
        @toggle-expand="toggleExpand"
        @select="handleSelection"
        @hover="handleHover"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'InteractiveJsonTree',
  props: {
    jsonData: Object,
    multiSelect: { type: Boolean, default: true },
    selectableTypes: { type: Array, default: () => ['all'] }
  },
  data() {
    return {
      selectedFields: [],
      expandedNodes: new Set(),
      hoveredPath: null
    };
  },
  methods: {
    handleSelection(path, event) {
      if (this.multiSelect && (event.ctrlKey || event.metaKey)) {
        this.toggleSelection(path);
      } else {
        this.selectedFields = [path];
      }
      
      this.$emit('selection-change', this.selectedFields);
      
      // Add selection animation
      this.animateSelection(path);
    },
    
    toggleSelection(path) {
      const index = this.selectedFields.indexOf(path);
      if (index > -1) {
        this.selectedFields.splice(index, 1);
      } else {
        this.selectedFields.push(path);
      }
    },
    
    animateSelection(path) {
      const element = this.$el.querySelector(`[data-path="${path}"]`);
      if (element) {
        element.classList.add('selection-flash');
        setTimeout(() => {
          element.classList.remove('selection-flash');
        }, 300);
      }
    },
    
    expandAll() {
      this.expandedNodes = new Set(this.getAllPaths());
    },
    
    collapseAll() {
      this.expandedNodes.clear();
    },
    
    getAllPaths() {
      // Implementation to get all possible paths
      const paths = [];
      const traverse = (obj, currentPath = '') => {
        Object.keys(obj).forEach(key => {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          paths.push(newPath);
          
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            traverse(obj[key], newPath);
          }
        });
      };
      
      traverse(this.jsonData);
      return paths;
    }
  }
};
</script>

<style scoped>
.json-tree-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.tree-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.json-tree {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.selection-flash {
  animation: selectionFlash 300ms ease-out;
}

@keyframes selectionFlash {
  0% { background-color: rgba(59, 130, 246, 0.3); }
  100% { background-color: transparent; }
}
</style>
```

## 8. Accessibility and Inclusive Design

### 8.1 Keyboard Navigation

**Navigation Patterns:**
- Tab sequence follows logical flow
- Arrow keys for tree navigation
- Enter/Space for selection actions
- Escape for modal dismissal
- Focus indicators clearly visible (3px blue outline)

### 8.2 Screen Reader Support

**ARIA Implementation:**
- Step navigation with `role="tablist"`
- Form fields with descriptive labels
- Error messages with `aria-live="polite"`
- Progress indicators with `aria-valuenow`
- JSON tree with `role="tree"` structure

### 8.3 Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .wizard-step-enter-active,
  .wizard-step-leave-active {
    transition: opacity 150ms ease;
  }
  
  .error-shake {
    animation: none;
    border-left: 3px solid #ef4444;
  }
  
  .success-icon {
    animation: none;
  }
}
```

## 9. Performance Considerations

### 9.1 Optimization Strategies

**Lazy Loading:**
- Components load as user progresses
- JSON tree renders visible nodes only
- Help content loads on demand
- Heavy animations disabled on slow devices

**Memory Management:**
- Clean up event listeners on component destruction
- Debounce expensive operations
- Virtual scrolling for large datasets
- Smart caching with size limits

### 9.2 Progressive Enhancement

**Core Functionality First:**
- Basic form submission without JavaScript
- Graceful degradation for animations
- Fallback UI for unsupported features
- Offline capability with service workers

## 10. Testing and Quality Assurance

### 10.1 Interaction Testing Checklist

**Usability Testing:**
- [ ] Step navigation flow intuitive
- [ ] Error messages clear and actionable
- [ ] Form validation responsive and helpful
- [ ] JSON visualization understandable
- [ ] Help system accessible and useful

**Technical Testing:**
- [ ] Animations perform smoothly (60fps)
- [ ] No memory leaks in transitions
- [ ] Keyboard navigation complete
- [ ] Screen reader compatibility
- [ ] Mobile responsiveness

**Performance Benchmarks:**
- Step transition: < 400ms
- Form validation: < 200ms after input
- JSON parsing: < 1s for typical datasets
- Help panel expansion: < 300ms
- Error recovery: < 500ms

## Conclusion

This interaction design specification provides a comprehensive framework for creating an intuitive, accessible, and performant JSON Policy Builder wizard. The design emphasizes user guidance, immediate feedback, and graceful error handling to transform a complex technical process into a manageable, step-by-step workflow.

The implementation combines modern web standards with thoughtful micro-interactions to create an experience that reduces cognitive load while maintaining the flexibility required for advanced users. Success will be measured through user completion rates, error reduction, and overall satisfaction with the policy creation process.