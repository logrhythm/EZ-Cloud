# JSON Policy Builder Wizard - UI Design System

## 1. Visual Design Elements

### Color Palette

#### Primary Colors (Based on LogRhythm Brand)
```scss
// Primary Colors
$primary-light-mode: #007bc2;     // LogRhythm Blue (Light)
$primary-dark-mode: #02b7fe;      // LogRhythm Blue (Dark)

// Secondary Colors
$secondary: #26A69A;              // Teal
$accent: #9C27B0;                 // Purple

// Semantic Colors
$positive: #21BA45;               // Success Green
$negative: #C10015;               // Error Red
$info: #31CCEC;                   // Information Blue
$warning: #F2C037;                // Warning Amber

// Neutral Colors (Light Mode)
$grey-1: #fafafa;                 // Background Light
$grey-2: #f5f5f5;                 // Surface Light
$grey-3: #eeeeee;                 // Border Light
$grey-4: #e0e0e0;                 // Divider Light
$grey-5: #bdbdbd;                 // Text Secondary Light
$grey-6: #9e9e9e;                 // Text Disabled Light
$grey-7: #757575;                 // Text Primary Light
$grey-8: #424242;                 // Text High Contrast Light
$grey-9: #212121;                 // Text Highest Contrast Light

// Neutral Colors (Dark Mode)
$dark-1: #1D1D1D;                 // Background Dark
$dark-2: #2d2d2d;                 // Surface Dark
$dark-3: #3e4249;                 // Border Dark
$dark-4: #4a5056;                 // Divider Dark
$dark-5: #6b7280;                 // Text Secondary Dark
$dark-6: #9ca3af;                 // Text Disabled Dark
$dark-7: #d1d5db;                 // Text Primary Dark
$dark-8: #e5e7eb;                 // Text High Contrast Dark
$dark-9: #f9fafb;                 // Text Highest Contrast Dark
```

#### Wizard-Specific Colors
```scss
// Step Status Colors
$step-completed: #21BA45;         // Green for completed steps
$step-current: #007bc2;           // Primary blue for current step
$step-upcoming: #9e9e9e;          // Grey for upcoming steps
$step-error: #C10015;             // Red for steps with errors

// Progress Colors
$progress-track: #e0e0e0;         // Progress bar track
$progress-fill: linear-gradient(90deg, #50B7F8 0%, #B74F92 100%);

// JSON Syntax Colors (Light Mode)
$json-object: #8B2BE2;            // BlueViolet
$json-array: #940E29;             // Dark Red
$json-string: #5070FF;            // Blue
$json-number: #139E3D;            // Green
$json-boolean: #00AEC8;           // Cyan
$json-key: #0284C7;               // Sky Blue

// JSON Syntax Colors (Dark Mode)
$json-object-dark: #A855F7;       // Purple
$json-array-dark: #EF4444;        // Red
$json-string-dark: #60A5FA;       // Light Blue
$json-number-dark: #34D399;       // Light Green
$json-boolean-dark: #06B6D4;      // Cyan
$json-key-dark: #38BDF8;          // Light Sky Blue
```

### Typography System

```scss
// Primary Font Family
$font-family-sans-serif: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
$font-family-monospace: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;

// Font Sizes (16px base)
$text-xs: 0.75rem;      // 12px - Caption, labels
$text-sm: 0.875rem;     // 14px - Small text, secondary info
$text-base: 1rem;       // 16px - Body text, default
$text-lg: 1.125rem;     // 18px - Large body text
$text-xl: 1.25rem;      // 20px - Small headings
$text-2xl: 1.5rem;      // 24px - Card titles, step titles
$text-3xl: 1.875rem;    // 30px - Page headers
$text-4xl: 2.25rem;     // 36px - Main wizard title

// Font Weights
$font-thin: 100;
$font-light: 300;
$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;
$font-extrabold: 800;
$font-black: 900;

// Line Heights
$leading-tight: 1.25;    // Headings
$leading-normal: 1.5;    // Body text
$leading-relaxed: 1.625; // Readable text
$leading-loose: 2;       // Spaced text

// Letter Spacing
$tracking-tighter: -0.05em;
$tracking-tight: -0.025em;
$tracking-normal: 0em;
$tracking-wide: 0.025em;
$tracking-wider: 0.05em;
$tracking-widest: 0.1em;
```

### Spacing System

```scss
// Spacing Scale (0.25rem = 4px base unit)
$space-0: 0;          // 0px
$space-1: 0.25rem;    // 4px
$space-2: 0.5rem;     // 8px
$space-3: 0.75rem;    // 12px
$space-4: 1rem;       // 16px
$space-5: 1.25rem;    // 20px
$space-6: 1.5rem;     // 24px
$space-8: 2rem;       // 32px
$space-10: 2.5rem;    // 40px
$space-12: 3rem;      // 48px
$space-16: 4rem;      // 64px
$space-20: 5rem;      // 80px
$space-24: 6rem;      // 96px
$space-32: 8rem;      // 128px

// Component-Specific Spacing
$wizard-step-spacing: $space-8;
$card-padding: $space-6;
$button-padding-x: $space-4;
$button-padding-y: $space-3;
$form-field-spacing: $space-4;
```

## 2. Component Styling

### Buttons

```scss
// Base Button Styles
.wizard-btn {
  border-radius: 6px;
  font-weight: $font-medium;
  font-size: $text-base;
  padding: $button-padding-y $button-padding-x;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  
  &:focus {
    outline: 2px solid $primary-light-mode;
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// Button Variants
.wizard-btn--primary {
  background: $primary-light-mode;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 123, 194, 0.2);
  
  &:hover:not(:disabled) {
    background: darken($primary-light-mode, 10%);
    box-shadow: 0 4px 8px rgba(0, 123, 194, 0.3);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 123, 194, 0.2);
  }
}

.wizard-btn--secondary {
  background: transparent;
  color: $primary-light-mode;
  border-color: $primary-light-mode;
  
  &:hover:not(:disabled) {
    background: rgba(0, 123, 194, 0.1);
    border-color: darken($primary-light-mode, 10%);
  }
}

.wizard-btn--ghost {
  background: transparent;
  color: $grey-7;
  
  &:hover:not(:disabled) {
    background: $grey-2;
    color: $grey-9;
  }
}

// Dark Mode Overrides
.body--dark {
  .wizard-btn--primary {
    background: $primary-dark-mode;
    box-shadow: 0 2px 4px rgba(2, 183, 254, 0.2);
    
    &:hover:not(:disabled) {
      background: lighten($primary-dark-mode, 10%);
      box-shadow: 0 4px 8px rgba(2, 183, 254, 0.3);
    }
  }
  
  .wizard-btn--secondary {
    color: $primary-dark-mode;
    border-color: $primary-dark-mode;
    
    &:hover:not(:disabled) {
      background: rgba(2, 183, 254, 0.1);
    }
  }
  
  .wizard-btn--ghost {
    color: $dark-7;
    
    &:hover:not(:disabled) {
      background: $dark-3;
      color: $dark-9;
    }
  }
}
```

### Input Fields

```scss
// Base Input Styles
.wizard-input {
  width: 100%;
  border: 1px solid $grey-3;
  border-radius: 6px;
  padding: $space-3 $space-4;
  font-size: $text-base;
  font-family: $font-family-sans-serif;
  background: white;
  transition: all 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: $primary-light-mode;
    box-shadow: 0 0 0 3px rgba(0, 123, 194, 0.1);
  }
  
  &:invalid {
    border-color: $negative;
    box-shadow: 0 0 0 3px rgba(193, 0, 21, 0.1);
  }
  
  &::placeholder {
    color: $grey-6;
    font-style: italic;
  }
}

// Textarea Specific
.wizard-textarea {
  @extend .wizard-input;
  min-height: 120px;
  resize: vertical;
  font-family: $font-family-monospace;
  line-height: $leading-relaxed;
}

// JSON Input Special Styling
.wizard-json-input {
  @extend .wizard-textarea;
  font-family: $font-family-monospace;
  background: $grey-1;
  border: 2px dashed $grey-3;
  
  &.has-valid-json {
    border-color: $positive;
    background: rgba(33, 186, 69, 0.05);
  }
  
  &.has-invalid-json {
    border-color: $negative;
    background: rgba(193, 0, 21, 0.05);
  }
}

// Dark Mode Overrides
.body--dark {
  .wizard-input {
    background: $dark-2;
    border-color: $dark-3;
    color: $dark-8;
    
    &:focus {
      border-color: $primary-dark-mode;
      box-shadow: 0 0 0 3px rgba(2, 183, 254, 0.1);
    }
    
    &::placeholder {
      color: $dark-5;
    }
  }
  
  .wizard-json-input {
    background: $dark-1;
    border-color: $dark-3;
    
    &.has-valid-json {
      background: rgba(33, 186, 69, 0.1);
    }
    
    &.has-invalid-json {
      background: rgba(193, 0, 21, 0.1);
    }
  }
}
```

### Cards and Panels

```scss
// Base Card Styles
.wizard-card {
  background: white;
  border-radius: 12px;
  border: 1px solid $grey-3;
  padding: $card-padding;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease-in-out;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}

// Card Variants
.wizard-card--elevated {
  @extend .wizard-card;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
    transform: translateY(-2px);
  }
}

.wizard-card--flat {
  @extend .wizard-card;
  box-shadow: none;
  border: 2px solid $grey-2;
}

.wizard-card--outline {
  @extend .wizard-card;
  background: transparent;
  border: 2px solid $grey-3;
  box-shadow: none;
}

// Step Card (for wizard steps)
.wizard-step-card {
  @extend .wizard-card--elevated;
  margin-bottom: $wizard-step-spacing;
  
  &.active {
    border-color: $primary-light-mode;
    box-shadow: 0 4px 16px rgba(0, 123, 194, 0.2);
  }
  
  &.completed {
    border-color: $step-completed;
    background: rgba(33, 186, 69, 0.02);
  }
  
  &.error {
    border-color: $step-error;
    background: rgba(193, 0, 21, 0.02);
  }
}

// Dark Mode Overrides
.body--dark {
  .wizard-card {
    background: $dark-2;
    border-color: $dark-3;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  .wizard-step-card {
    &.active {
      border-color: $primary-dark-mode;
      box-shadow: 0 4px 16px rgba(2, 183, 254, 0.3);
    }
  }
}
```

### Modals and Dialogs

```scss
// Modal Backdrop
.wizard-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Modal Container
.wizard-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  margin: $space-4;
  
  &.size-sm { width: 400px; }
  &.size-md { width: 600px; }
  &.size-lg { width: 800px; }
  &.size-xl { width: 1000px; }
  &.size-full { width: calc(100vw - 2rem); }
}

// Modal Header
.wizard-modal-header {
  padding: $space-6;
  border-bottom: 1px solid $grey-2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .title {
    font-size: $text-2xl;
    font-weight: $font-semibold;
    color: $grey-9;
    margin: 0;
  }
}

// Modal Body
.wizard-modal-body {
  padding: $space-6;
  max-height: 60vh;
  overflow-y: auto;
}

// Modal Footer
.wizard-modal-footer {
  padding: $space-4 $space-6;
  border-top: 1px solid $grey-2;
  display: flex;
  gap: $space-3;
  justify-content: flex-end;
  background: $grey-1;
  border-radius: 0 0 16px 16px;
}

// Dark Mode Overrides
.body--dark {
  .wizard-modal {
    background: $dark-2;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  }
  
  .wizard-modal-header {
    border-color: $dark-3;
    
    .title {
      color: $dark-8;
    }
  }
  
  .wizard-modal-footer {
    background: $dark-1;
    border-color: $dark-3;
  }
}
```

## 3. Iconography and Visual Indicators

### Icon System

```scss
// Icon Sizes
.icon-xs { font-size: 12px; }
.icon-sm { font-size: 16px; }
.icon-md { font-size: 20px; }
.icon-lg { font-size: 24px; }
.icon-xl { font-size: 32px; }
.icon-2xl { font-size: 48px; }

// Icon Colors
.icon-primary { color: $primary-light-mode; }
.icon-secondary { color: $secondary; }
.icon-positive { color: $positive; }
.icon-negative { color: $negative; }
.icon-warning { color: $warning; }
.icon-info { color: $info; }
.icon-muted { color: $grey-6; }

// Dark Mode Icon Colors
.body--dark {
  .icon-primary { color: $primary-dark-mode; }
  .icon-muted { color: $dark-5; }
}
```

### Step Status Icons

```html
<!-- Step Icons with meanings -->
<script>
const WIZARD_ICONS = {
  // Step Status
  'step-completed': 'check_circle',
  'step-current': 'radio_button_checked',
  'step-upcoming': 'radio_button_unchecked',
  'step-error': 'error',
  'step-warning': 'warning',
  
  // Navigation
  'next': 'arrow_forward',
  'prev': 'arrow_back',
  'close': 'close',
  'help': 'help_outline',
  'info': 'info_outline',
  
  // Actions
  'upload': 'cloud_upload',
  'download': 'cloud_download',
  'save': 'save',
  'edit': 'edit',
  'delete': 'delete',
  'copy': 'content_copy',
  'paste': 'content_paste',
  
  // Data Types
  'json-object': 'data_object',
  'json-array': 'data_array',
  'json-string': 'text_fields',
  'json-number': 'tag',
  'json-boolean': 'toggle_on',
  
  // Wizard Steps
  'introduction': 'play_circle_outline',
  'data-input': 'cloud_upload',
  'schema-config': 'schema',
  'filter-config': 'filter_alt',
  'mapping': 'account_tree',
  'review': 'preview',
  'export': 'file_download',
  
  // Status Indicators
  'success': 'check_circle',
  'error': 'error',
  'warning': 'warning',
  'loading': 'hourglass_empty'
};
</script>
```

### Visual Status Indicators

```scss
// Status Badges
.wizard-badge {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  padding: $space-1 $space-3;
  border-radius: 20px;
  font-size: $text-sm;
  font-weight: $font-medium;
  
  &.success {
    background: rgba(33, 186, 69, 0.1);
    color: darken($positive, 10%);
    border: 1px solid rgba(33, 186, 69, 0.3);
  }
  
  &.error {
    background: rgba(193, 0, 21, 0.1);
    color: darken($negative, 10%);
    border: 1px solid rgba(193, 0, 21, 0.3);
  }
  
  &.warning {
    background: rgba(242, 192, 55, 0.1);
    color: darken($warning, 20%);
    border: 1px solid rgba(242, 192, 55, 0.3);
  }
  
  &.info {
    background: rgba(49, 204, 236, 0.1);
    color: darken($info, 20%);
    border: 1px solid rgba(49, 204, 236, 0.3);
  }
}

// Progress Indicators
.wizard-progress {
  width: 100%;
  height: 8px;
  background: $grey-2;
  border-radius: 4px;
  overflow: hidden;
  
  .fill {
    height: 100%;
    background: $progress-fill;
    transition: width 0.3s ease-in-out;
    border-radius: 4px;
  }
}

// Loading Spinner
.wizard-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid $grey-3;
  border-top: 2px solid $primary-light-mode;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Dark Mode Overrides
.body--dark {
  .wizard-progress {
    background: $dark-3;
  }
  
  .wizard-spinner {
    border-color: $dark-4;
    border-top-color: $primary-dark-mode;
  }
}
```

## 4. Animation and Transition Effects

### Transition System

```scss
// Timing Functions
$ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
$ease-out: cubic-bezier(0, 0, 0.2, 1);
$ease-in: cubic-bezier(0.4, 0, 1, 1);
$bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

// Duration Scale
$duration-fast: 150ms;
$duration-normal: 250ms;
$duration-slow: 400ms;
$duration-slower: 600ms;

// Base Transition Classes
.transition-all { transition: all $duration-normal $ease-in-out; }
.transition-colors { transition: color $duration-normal $ease-in-out, background-color $duration-normal $ease-in-out, border-color $duration-normal $ease-in-out; }
.transition-opacity { transition: opacity $duration-normal $ease-in-out; }
.transition-transform { transition: transform $duration-normal $ease-in-out; }

// Hover Effects
.hover-lift {
  transition: transform $duration-normal $ease-out, box-shadow $duration-normal $ease-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  }
}

.hover-scale {
  transition: transform $duration-normal $ease-out;
  
  &:hover {
    transform: scale(1.02);
  }
}
```

### Step Transitions

```scss
// Step Transition Animations
.wizard-step-enter-active,
.wizard-step-leave-active {
  transition: all $duration-slow $ease-in-out;
}

.wizard-step-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.wizard-step-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// Progress Bar Animation
@keyframes progress-fill {
  0% {
    width: 0%;
  }
  100% {
    width: var(--progress-width);
  }
}

.wizard-progress .fill {
  animation: progress-fill $duration-slow $ease-out;
}

// Success Animation
@keyframes success-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(33, 186, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(33, 186, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 186, 69, 0);
  }
}

.wizard-step-card.completed {
  animation: success-pulse 2s;
}

// Error Shake Animation
@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.wizard-input.error {
  animation: error-shake 0.5s;
}

// Loading Animations
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wizard-step-content {
  animation: fade-in-up $duration-slow $ease-out;
}

// Micro-interactions
.wizard-btn {
  position: relative;
  overflow: hidden;
  
  &:active {
    transform: scale(0.98);
  }
  
  // Ripple effect
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width $duration-fast $ease-out, height $duration-fast $ease-out;
  }
  
  &:active::after {
    width: 200px;
    height: 200px;
  }
}
```

### JSON Syntax Highlighting Animations

```scss
// JSON Token Animations
.json-token {
  transition: all $duration-normal $ease-in-out;
  border-radius: 2px;
  padding: 1px 2px;
  
  &:hover {
    background: rgba(0, 123, 194, 0.1);
    cursor: pointer;
  }
}

.json-object { color: $json-object; }
.json-array { color: $json-array; }
.json-string { color: $json-string; }
.json-number { color: $json-number; }
.json-boolean { color: $json-boolean; }
.json-key { color: $json-key; font-weight: $font-medium; }

// Dark Mode JSON Colors
.body--dark {
  .json-object { color: $json-object-dark; }
  .json-array { color: $json-array-dark; }
  .json-string { color: $json-string-dark; }
  .json-number { color: $json-number-dark; }
  .json-boolean { color: $json-boolean-dark; }
  .json-key { color: $json-key-dark; }
}

// JSON Folding Animation
.json-fold {
  transition: all $duration-normal $ease-in-out;
  overflow: hidden;
  
  &.collapsed {
    height: 0;
    opacity: 0;
  }
  
  &.expanded {
    opacity: 1;
  }
}
```

## 5. Responsive Layout Strategies

### Breakpoint System

```scss
// Breakpoints
$breakpoints: (
  'xs': 0px,      // Mobile portrait
  'sm': 600px,    // Mobile landscape / small tablet
  'md': 960px,    // Tablet
  'lg': 1280px,   // Desktop
  'xl': 1920px    // Large desktop
);

// Responsive Mixins
@mixin respond-to($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}

@mixin respond-between($min, $max) {
  @media (min-width: map-get($breakpoints, $min)) and (max-width: map-get($breakpoints, $max) - 1px) {
    @content;
  }
}
```

### Layout Grid System

```scss
// Container Sizes
.wizard-container {
  width: 100%;
  padding: 0 $space-4;
  margin: 0 auto;
  
  @include respond-to('sm') { max-width: 540px; padding: 0 $space-6; }
  @include respond-to('md') { max-width: 720px; padding: 0 $space-8; }
  @include respond-to('lg') { max-width: 960px; }
  @include respond-to('xl') { max-width: 1140px; }
}

// Responsive Grid
.wizard-grid {
  display: grid;
  gap: $space-4;
  
  // Mobile First
  grid-template-columns: 1fr;
  
  @include respond-to('sm') {
    grid-template-columns: repeat(2, 1fr);
    gap: $space-6;
  }
  
  @include respond-to('md') {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @include respond-to('lg') {
    grid-template-columns: repeat(4, 1fr);
    gap: $space-8;
  }
}

// Wizard Layout
.wizard-layout {
  display: grid;
  min-height: 100vh;
  
  // Mobile: Stack vertically
  grid-template-rows: auto 1fr auto;
  grid-template-areas: 
    "header"
    "main"
    "footer";
  
  @include respond-to('md') {
    // Desktop: Sidebar layout
    grid-template-columns: 280px 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas: 
      "sidebar header"
      "sidebar main";
  }
  
  @include respond-to('lg') {
    grid-template-columns: 320px 1fr;
  }
}

.wizard-header { grid-area: header; }
.wizard-sidebar { grid-area: sidebar; }
.wizard-main { grid-area: main; }
.wizard-footer { grid-area: footer; }
```

### Step Layout Responsiveness

```scss
// Step Navigation
.wizard-steps-nav {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  
  @include respond-to('sm') {
    flex-direction: row;
    justify-content: space-between;
    overflow-x: auto;
  }
  
  @include respond-to('md') {
    justify-content: center;
  }
}

.wizard-step-item {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-3;
  border-radius: 8px;
  transition: all $duration-normal $ease-in-out;
  
  // Mobile: Full width
  width: 100%;
  
  @include respond-to('sm') {
    // Tablet: Min width
    min-width: 140px;
    width: auto;
  }
  
  @include respond-to('md') {
    // Desktop: Fixed width
    width: 160px;
  }
  
  .step-number {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $text-sm;
    font-weight: $font-semibold;
    
    @include respond-to('md') {
      width: 32px;
      height: 32px;
      font-size: $text-base;
    }
  }
  
  .step-label {
    font-size: $text-sm;
    font-weight: $font-medium;
    
    // Hide on mobile
    display: none;
    
    @include respond-to('sm') {
      display: block;
    }
    
    @include respond-to('md') {
      font-size: $text-base;
    }
  }
}

// Step Content
.wizard-step-content {
  padding: $space-4;
  
  @include respond-to('sm') {
    padding: $space-6;
  }
  
  @include respond-to('md') {
    padding: $space-8;
  }
  
  @include respond-to('lg') {
    padding: $space-10;
  }
}

// Form Layout
.wizard-form-row {
  display: grid;
  gap: $space-4;
  margin-bottom: $space-4;
  
  // Mobile: Single column
  grid-template-columns: 1fr;
  
  @include respond-to('sm') {
    // Tablet: Two columns
    grid-template-columns: repeat(2, 1fr);
    gap: $space-6;
  }
  
  @include respond-to('lg') {
    // Desktop: Three columns
    grid-template-columns: repeat(3, 1fr);
  }
  
  &.full-width {
    grid-template-columns: 1fr;
  }
}

// JSON Display
.wizard-json-display {
  font-family: $font-family-monospace;
  background: $grey-1;
  border: 1px solid $grey-3;
  border-radius: 8px;
  padding: $space-4;
  overflow-x: auto;
  font-size: $text-sm;
  line-height: $leading-relaxed;
  
  @include respond-to('sm') {
    font-size: $text-base;
    padding: $space-6;
  }
  
  @include respond-to('lg') {
    padding: $space-8;
  }
}

// Mobile-Specific Adjustments
@include respond-between('xs', 'sm') {
  .wizard-btn {
    min-height: 48px; // Larger touch targets
    font-size: $text-base;
  }
  
  .wizard-input {
    min-height: 48px;
    font-size: 16px; // Prevent zoom on iOS
  }
  
  .wizard-modal {
    margin: $space-2;
    border-radius: 12px;
    max-height: calc(100vh - 1rem);
    
    .wizard-modal-header {
      padding: $space-4;
    }
    
    .wizard-modal-body {
      padding: $space-4;
    }
  }
}
```

## 6. Light and Dark Mode Theming

### Theme Toggle Implementation

```scss
// CSS Custom Properties for Theming
:root {
  // Light Mode (Default)
  --color-primary: #{$primary-light-mode};
  --color-background: #{white};
  --color-surface: #{$grey-1};
  --color-surface-variant: #{$grey-2};
  --color-border: #{$grey-3};
  --color-divider: #{$grey-2};
  --color-text-primary: #{$grey-9};
  --color-text-secondary: #{$grey-7};
  --color-text-disabled: #{$grey-6};
  --color-shadow: rgba(0, 0, 0, 0.12);
  
  // JSON Colors
  --json-object: #{$json-object};
  --json-array: #{$json-array};
  --json-string: #{$json-string};
  --json-number: #{$json-number};
  --json-boolean: #{$json-boolean};
  --json-key: #{$json-key};
}

// Dark Mode Override
.body--dark {
  --color-primary: #{$primary-dark-mode};
  --color-background: #{$dark-1};
  --color-surface: #{$dark-2};
  --color-surface-variant: #{$dark-3};
  --color-border: #{$dark-3};
  --color-divider: #{$dark-3};
  --color-text-primary: #{$dark-8};
  --color-text-secondary: #{$dark-7};
  --color-text-disabled: #{$dark-5};
  --color-shadow: rgba(0, 0, 0, 0.4);
  
  // JSON Colors Dark
  --json-object: #{$json-object-dark};
  --json-array: #{$json-array-dark};
  --json-string: #{$json-string-dark};
  --json-number: #{$json-number-dark};
  --json-boolean: #{$json-boolean-dark};
  --json-key: #{$json-key-dark};
}

// Theme-Aware Components
.wizard-themed {
  background: var(--color-background);
  color: var(--color-text-primary);
  border-color: var(--color-border);
  box-shadow: 0 2px 8px var(--color-shadow);
}

.wizard-surface {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.wizard-surface-variant {
  background: var(--color-surface-variant);
  color: var(--color-text-primary);
}
```

### Theme Toggle Component

```vue
<template>
  <div class="theme-toggle">
    <q-btn-toggle
      v-model="darkMode"
      no-caps
      toggle-color="primary"
      :options="themeOptions"
      @update:model-value="toggleTheme"
    >
      <template v-slot:day>
        <q-icon name="light_mode" class="q-mr-xs" />
        {{ $t('Light') }}
      </template>
      <template v-slot:night>
        <q-icon name="dark_mode" class="q-mr-xs" />
        {{ $t('Dark') }}
      </template>
    </q-btn-toggle>
  </div>
</template>

<script>
export default {
  name: 'ThemeToggle',
  data() {
    return {
      darkMode: false,
      themeOptions: [
        { label: this.$t('Light'), value: false, slot: 'day' },
        { label: this.$t('Dark'), value: true, slot: 'night' }
      ]
    }
  },
  methods: {
    toggleTheme(isDark) {
      this.$q.dark.set(isDark);
      // Save preference
      localStorage.setItem('wizard-theme', isDark ? 'dark' : 'light');
      // Update CSS custom properties if needed
      this.updateThemeProperties(isDark);
    },
    
    updateThemeProperties(isDark) {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark-theme');
      } else {
        root.classList.remove('dark-theme');
      }
    }
  },
  
  mounted() {
    // Restore saved theme
    const saved = localStorage.getItem('wizard-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = saved === 'dark' || (!saved && prefersDark);
    
    this.darkMode = shouldUseDark;
    this.toggleTheme(shouldUseDark);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('wizard-theme')) {
        this.darkMode = e.matches;
        this.toggleTheme(e.matches);
      }
    });
  }
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-toggle .q-btn-toggle {
  border-radius: 24px;
  background: var(--color-surface-variant);
  border: 1px solid var(--color-border);
}
</style>
```

### Accessibility for Theme Switching

```scss
// High Contrast Mode Support
@media (prefers-contrast: high) {
  :root {
    --color-border: #{$grey-9};
    --json-object: #{darken($json-object, 20%)};
    --json-array: #{darken($json-array, 20%)};
    --json-string: #{darken($json-string, 20%)};
    --json-number: #{darken($json-number, 20%)};
    --json-boolean: #{darken($json-boolean, 20%)};
  }
  
  .body--dark {
    --color-border: #{$dark-9};
    --json-object: #{lighten($json-object-dark, 20%)};
    --json-array: #{lighten($json-array-dark, 20%)};
    --json-string: #{lighten($json-string-dark, 20%)};
    --json-number: #{lighten($json-number-dark, 20%)};
    --json-boolean: #{lighten($json-boolean-dark, 20%)};
  }
}

// Reduced Motion Support
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .wizard-step-enter-active,
  .wizard-step-leave-active {
    transition: none;
  }
  
  .hover-lift:hover,
  .hover-scale:hover {
    transform: none;
  }
}
```

This comprehensive UI design system provides:

1. **Consistent Visual Language**: A cohesive color palette, typography, and spacing system based on LogRhythm's existing brand
2. **Component Library**: Reusable, themed components for buttons, inputs, cards, and modals
3. **Accessibility First**: High contrast support, reduced motion preferences, and keyboard navigation
4. **Responsive Design**: Mobile-first approach with breakpoints for different screen sizes
5. **Theme Support**: Seamless light/dark mode switching with CSS custom properties
6. **Animation System**: Smooth transitions and micro-interactions that enhance usability
7. **Icon System**: Comprehensive iconography with semantic meanings for different states and actions

The design system emphasizes progressive disclosure, clear visual hierarchy, and reduced cognitive load while maintaining the technical sophistication required for the JSON Policy Builder wizard.

/mnt/g/GO_Workspace/src/github.com/logrhythm/EZ-Cloud-Fresh/frontend_standalone/ui-design-system.md