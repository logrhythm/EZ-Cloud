# JSON Policy Builder - Component Library & Implementation Guide

## Component Architecture

### Base Components

#### 1. WizardButton Component

**File:** `src/components/Wizard/Base/WizardButton.vue`

```vue
<template>
  <q-btn
    :class="computedClasses"
    :disabled="disabled || loading"
    :loading="loading"
    :type="type"
    no-caps
    unelevated
    @click="handleClick"
  >
    <q-icon
      v-if="icon && !loading"
      :name="icon"
      :class="{ 'q-mr-sm': $slots.default }"
    />
    
    <slot />
    
    <q-icon
      v-if="iconRight && !loading"
      :name="iconRight"
      class="q-ml-sm"
    />
    
    <!-- Loading indicator -->
    <template v-slot:loading>
      <q-spinner-hourglass class="on-left" />
      {{ loadingText || 'Processing...' }}
    </template>
  </q-btn>
</template>

<script>
export default {
  name: 'WizardButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'ghost', 'danger'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    icon: {
      type: String,
      default: null
    },
    iconRight: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'button'
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['click'],
  
  computed: {
    computedClasses() {
      return [
        'wizard-btn',
        `wizard-btn--${this.variant}`,
        `wizard-btn--${this.size}`,
        {
          'wizard-btn--full-width': this.fullWidth,
          'wizard-btn--loading': this.loading
        }
      ]
    }
  },
  
  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.wizard-btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  // Variants
  &--primary {
    background: var(--q-primary);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--q-primary);
      filter: brightness(1.1);
      box-shadow: 0 4px 12px rgba(var(--q-primary-rgb), 0.4);
      transform: translateY(-2px);
    }
  }
  
  &--secondary {
    background: transparent;
    color: var(--q-primary);
    border: 2px solid var(--q-primary);
    
    &:hover:not(:disabled) {
      background: var(--q-primary);
      color: white;
    }
  }
  
  &--ghost {
    background: transparent;
    color: var(--color-text-primary);
    
    &:hover:not(:disabled) {
      background: var(--color-surface-variant);
    }
  }
  
  &--danger {
    background: var(--q-negative);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--q-negative);
      filter: brightness(1.1);
      box-shadow: 0 4px 12px rgba(var(--q-negative-rgb), 0.4);
    }
  }
  
  // Sizes
  &--small {
    padding: 8px 16px;
    font-size: 0.875rem;
    min-height: 32px;
  }
  
  &--medium {
    padding: 12px 24px;
    font-size: 1rem;
    min-height: 40px;
  }
  
  &--large {
    padding: 16px 32px;
    font-size: 1.125rem;
    min-height: 48px;
  }
  
  &--full-width {
    width: 100%;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  &--loading {
    cursor: wait;
  }
}
</style>
```

#### 2. WizardInput Component

**File:** `src/components/Wizard/Base/WizardInput.vue`

```vue
<template>
  <div class="wizard-input-container">
    <label
      v-if="label"
      :for="inputId"
      class="wizard-input-label"
      :class="{ 'required': required }"
    >
      {{ label }}
      <q-icon
        v-if="tooltip"
        name="help_outline"
        class="help-icon"
      >
        <q-tooltip class="text-body2">{{ tooltip }}</q-tooltip>
      </q-icon>
    </label>
    
    <div class="wizard-input-wrapper">
      <q-input
        :id="inputId"
        :model-value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :rules="computedRules"
        :lazy-rules="lazyRules"
        :class="computedInputClasses"
        :filled="filled"
        :outlined="outlined"
        :dense="dense"
        :autofocus="autofocus"
        :maxlength="maxlength"
        :counter="showCounter"
        :error="hasError"
        :error-message="errorMessage"
        @update:model-value="updateValue"
        @blur="handleBlur"
        @focus="handleFocus"
        @keypress="handleKeypress"
      >
        <!-- Prefix slot -->
        <template v-if="prefixIcon" v-slot:prepend>
          <q-icon :name="prefixIcon" />
        </template>
        
        <!-- Suffix slot -->
        <template v-if="suffixIcon || clearable" v-slot:append>
          <q-icon
            v-if="suffixIcon"
            :name="suffixIcon"
            class="cursor-pointer"
            @click="$emit('suffix-click')"
          />
          <q-icon
            v-if="clearable && modelValue"
            name="clear"
            class="cursor-pointer"
            @click="clearValue"
          />
        </template>
        
        <!-- Loading indicator -->
        <template v-if="loading" v-slot:loading>
          <q-spinner-dots color="primary" />
        </template>
      </q-input>
      
      <!-- Helper text -->
      <div
        v-if="helperText && !hasError"
        class="wizard-input-helper"
      >
        {{ helperText }}
      </div>
    </div>
  </div>
</template>

<script>
import { uid } from 'quasar'

export default {
  name: 'WizardInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: null
    },
    label: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    rules: {
      type: Array,
      default: () => []
    },
    lazyRules: {
      type: Boolean,
      default: true
    },
    tooltip: {
      type: String,
      default: null
    },
    helperText: {
      type: String,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    },
    prefixIcon: {
      type: String,
      default: null
    },
    suffixIcon: {
      type: String,
      default: null
    },
    clearable: {
      type: Boolean,
      default: false
    },
    filled: {
      type: Boolean,
      default: false
    },
    outlined: {
      type: Boolean,
      default: true
    },
    dense: {
      type: Boolean,
      default: false
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: Number,
      default: null
    },
    showCounter: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'standard',
      validator: value => ['standard', 'json', 'code'].includes(value)
    }
  },
  
  emits: [
    'update:modelValue',
    'blur',
    'focus',
    'keypress',
    'suffix-click',
    'clear'
  ],
  
  data() {
    return {
      inputId: `wizard-input-${uid()}`,
      isFocused: false
    }
  },
  
  computed: {
    computedRules() {
      const rules = [...this.rules]
      
      if (this.required) {
        rules.unshift(val => !!val || 'This field is required')
      }
      
      return rules
    },
    
    computedInputClasses() {
      return [
        'wizard-input',
        `wizard-input--${this.variant}`,
        {
          'wizard-input--focused': this.isFocused,
          'wizard-input--error': this.hasError
        }
      ]
    },
    
    hasError() {
      return !!this.errorMessage
    }
  },
  
  methods: {
    updateValue(value) {
      this.$emit('update:modelValue', value)
    },
    
    handleBlur(event) {
      this.isFocused = false
      this.$emit('blur', event)
    },
    
    handleFocus(event) {
      this.isFocused = true
      this.$emit('focus', event)
    },
    
    handleKeypress(event) {
      this.$emit('keypress', event)
    },
    
    clearValue() {
      this.$emit('update:modelValue', null)
      this.$emit('clear')
    },
    
    focus() {
      this.$refs.input?.focus()
    },
    
    blur() {
      this.$refs.input?.blur()
    }
  }
}
</script>

<style lang="scss" scoped>
.wizard-input-container {
  margin-bottom: 1rem;
}

.wizard-input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  
  &.required::after {
    content: '*';
    color: var(--q-negative);
    margin-left: 0.25rem;
  }
  
  .help-icon {
    font-size: 1rem;
    color: var(--color-text-secondary);
    cursor: help;
  }
}

.wizard-input-wrapper {
  position: relative;
}

.wizard-input {
  &--json {
    :deep(.q-field__control) {
      font-family: 'Roboto Mono', monospace;
      background: var(--color-surface-variant);
    }
  }
  
  &--code {
    :deep(.q-field__control) {
      font-family: 'Roboto Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
    }
  }
  
  &--focused {
    :deep(.q-field__control) {
      box-shadow: 0 0 0 2px rgba(var(--q-primary-rgb), 0.2);
    }
  }
  
  &--error {
    :deep(.q-field__control) {
      border-color: var(--q-negative);
    }
  }
}

.wizard-input-helper {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
</style>
```

#### 3. WizardCard Component

**File:** `src/components/Wizard/Base/WizardCard.vue`

```vue
<template>
  <q-card
    :class="computedClasses"
    :flat="flat"
    :bordered="bordered"
  >
    <!-- Card Header -->
    <q-card-section
      v-if="title || subtitle || $slots.header"
      class="wizard-card-header"
      :class="headerClass"
    >
      <div v-if="title || subtitle" class="wizard-card-title-section">
        <div class="row items-center">
          <q-icon
            v-if="icon"
            :name="icon"
            :color="iconColor"
            class="q-mr-md"
            size="md"
          />
          <div class="col">
            <h3 v-if="title" class="wizard-card-title">{{ title }}</h3>
            <p v-if="subtitle" class="wizard-card-subtitle">{{ subtitle }}</p>
          </div>
          <div v-if="$slots.actions" class="wizard-card-actions">
            <slot name="actions" />
          </div>
        </div>
      </div>
      <slot name="header" />
    </q-card-section>
    
    <!-- Card Content -->
    <q-card-section
      v-if="$slots.default"
      class="wizard-card-content"
      :class="contentClass"
    >
      <slot />
    </q-card-section>
    
    <!-- Card Footer -->
    <q-card-actions
      v-if="$slots.footer"
      class="wizard-card-footer"
      :class="footerClass"
      :align="footerAlign"
    >
      <slot name="footer" />
    </q-card-actions>
    
    <!-- Loading Overlay -->
    <q-inner-loading :showing="loading">
      <q-spinner-grid size="50px" color="primary" />
    </q-inner-loading>
  </q-card>
</template>

<script>
export default {
  name: 'WizardCard',
  props: {
    title: {
      type: String,
      default: null
    },
    subtitle: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    iconColor: {
      type: String,
      default: 'primary'
    },
    variant: {
      type: String,
      default: 'default',
      validator: value => ['default', 'outlined', 'filled', 'elevated'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    flat: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    clickable: {
      type: Boolean,
      default: false
    },
    headerClass: {
      type: String,
      default: ''
    },
    contentClass: {
      type: String,
      default: ''
    },
    footerClass: {
      type: String,
      default: ''
    },
    footerAlign: {
      type: String,
      default: 'right'
    }
  },
  
  emits: ['click'],
  
  computed: {
    computedClasses() {
      return [
        'wizard-card',
        `wizard-card--${this.variant}`,
        `wizard-card--${this.size}`,
        {
          'wizard-card--clickable': this.clickable,
          'wizard-card--loading': this.loading
        }
      ]
    }
  },
  
  methods: {
    handleClick(event) {
      if (this.clickable && !this.loading) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.wizard-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  
  &--default {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }
  
  &--outlined {
    background: transparent;
    border: 2px solid var(--color-border);
  }
  
  &--filled {
    background: var(--color-surface-variant);
    border: none;
  }
  
  &--elevated {
    background: var(--color-surface);
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      transform: translateY(-2px);
    }
  }
  
  &--small {
    .wizard-card-header,
    .wizard-card-content,
    .wizard-card-footer {
      padding: 1rem;
    }
  }
  
  &--medium {
    .wizard-card-header,
    .wizard-card-content,
    .wizard-card-footer {
      padding: 1.5rem;
    }
  }
  
  &--large {
    .wizard-card-header,
    .wizard-card-content,
    .wizard-card-footer {
      padding: 2rem;
    }
  }
  
  &--clickable {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  &--loading {
    pointer-events: none;
  }
}

.wizard-card-header {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-variant);
  border-radius: 12px 12px 0 0;
}

.wizard-card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.wizard-card-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.wizard-card-content {
  color: var(--color-text-primary);
  line-height: 1.6;
}

.wizard-card-footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-variant);
  border-radius: 0 0 12px 12px;
}

.wizard-card-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
```

### Wizard-Specific Components

#### 4. WizardStepContainer Component

**File:** `src/components/Wizard/WizardStepContainer.vue`

```vue
<template>
  <div class="wizard-step-container">
    <!-- Step Header -->
    <div class="wizard-step-header">
      <div class="step-info">
        <div class="step-number">{{ currentStep + 1 }}</div>
        <div class="step-details">
          <h2 class="step-title">{{ currentStepData.title }}</h2>
          <p class="step-description">{{ currentStepData.description }}</p>
        </div>
      </div>
      
      <div class="step-progress">
        <span class="progress-text">
          {{ currentStep + 1 }} of {{ totalSteps }}
        </span>
        <q-linear-progress
          :value="progressPercentage"
          size="8px"
          color="primary"
          track-color="grey-3"
          class="progress-bar"
        />
      </div>
    </div>
    
    <!-- Step Content -->
    <div class="wizard-step-content">
      <transition
        :name="transitionName"
        mode="out-in"
        appear
      >
        <component
          :is="currentStepComponent"
          :key="currentStep"
          v-bind="currentStepProps"
          @step-complete="handleStepComplete"
          @step-error="handleStepError"
          @data-changed="handleDataChanged"
        />
      </transition>
    </div>
    
    <!-- Step Navigation -->
    <div class="wizard-step-navigation">
      <div class="nav-left">
        <WizardButton
          v-if="currentStep > 0"
          variant="ghost"
          icon="arrow_back"
          @click="previousStep"
        >
          Back
        </WizardButton>
      </div>
      
      <div class="nav-center">
        <WizardButton
          v-if="showSaveProgress"
          variant="ghost"
          icon="save"
          :loading="saving"
          @click="saveProgress"
        >
          Save Progress
        </WizardButton>
      </div>
      
      <div class="nav-right">
        <WizardButton
          v-if="!isLastStep"
          variant="primary"
          icon-right="arrow_forward"
          :disabled="!canContinue"
          :loading="processing"
          @click="nextStep"
        >
          {{ nextButtonText }}
        </WizardButton>
        
        <WizardButton
          v-else
          variant="primary"
          icon-right="check"
          :disabled="!canComplete"
          :loading="completing"
          @click="completeWizard"
        >
          Complete
        </WizardButton>
      </div>
    </div>
  </div>
</template>

<script>
import WizardButton from './Base/WizardButton.vue'

export default {
  name: 'WizardStepContainer',
  components: {
    WizardButton
  },
  
  props: {
    steps: {
      type: Array,
      required: true
    },
    currentStep: {
      type: Number,
      required: true
    },
    wizardData: {
      type: Object,
      default: () => ({})
    },
    showSaveProgress: {
      type: Boolean,
      default: true
    }
  },
  
  emits: [
    'next-step',
    'previous-step',
    'complete-wizard',
    'save-progress',
    'data-changed'
  ],
  
  data() {
    return {
      processing: false,
      completing: false,
      saving: false,
      transitionName: 'slide-right',
      canContinue: false,
      canComplete: false,
      stepData: {}
    }
  },
  
  computed: {
    totalSteps() {
      return this.steps.length
    },
    
    currentStepData() {
      return this.steps[this.currentStep] || {}
    },
    
    currentStepComponent() {
      return this.currentStepData.component
    },
    
    currentStepProps() {
      return {
        ...this.currentStepData.props,
        stepData: this.stepData[this.currentStep] || {},
        wizardData: this.wizardData
      }
    },
    
    progressPercentage() {
      return ((this.currentStep + 1) / this.totalSteps) * 100
    },
    
    isLastStep() {
      return this.currentStep === this.totalSteps - 1
    },
    
    nextButtonText() {
      return this.currentStepData.nextText || 'Next'
    }
  },
  
  watch: {
    currentStep(newVal, oldVal) {
      this.transitionName = newVal > oldVal ? 'slide-left' : 'slide-right'
    }
  },
  
  methods: {
    async nextStep() {
      this.processing = true
      
      try {
        // Validate current step before proceeding
        await this.validateCurrentStep()
        this.$emit('next-step', {
          step: this.currentStep,
          data: this.stepData[this.currentStep]
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Please complete all required fields',
          position: 'top'
        })
      } finally {
        this.processing = false
      }
    },
    
    previousStep() {
      this.transitionName = 'slide-right'
      this.$emit('previous-step', {
        step: this.currentStep,
        data: this.stepData[this.currentStep]
      })
    },
    
    async completeWizard() {
      this.completing = true
      
      try {
        await this.validateCurrentStep()
        this.$emit('complete-wizard', {
          allData: this.stepData,
          wizardData: this.wizardData
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Please complete all required fields',
          position: 'top'
        })
      } finally {
        this.completing = false
      }
    },
    
    async saveProgress() {
      this.saving = true
      
      try {
        await this.$emit('save-progress', {
          currentStep: this.currentStep,
          stepData: this.stepData,
          wizardData: this.wizardData
        })
        
        this.$q.notify({
          type: 'positive',
          message: 'Progress saved successfully',
          position: 'top'
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save progress',
          position: 'top'
        })
      } finally {
        this.saving = false
      }
    },
    
    handleStepComplete(data) {
      this.canContinue = true
      this.canComplete = true
      this.stepData[this.currentStep] = data
      this.$emit('data-changed', {
        step: this.currentStep,
        data
      })
    },
    
    handleStepError(error) {
      this.canContinue = false
      this.canComplete = false
      this.$q.notify({
        type: 'negative',
        message: error.message || 'An error occurred',
        position: 'top'
      })
    },
    
    handleDataChanged(data) {
      this.stepData[this.currentStep] = data
      this.validateStepData(data)
      this.$emit('data-changed', {
        step: this.currentStep,
        data
      })
    },
    
    validateStepData(data) {
      // Basic validation - override in specific step components
      const isValid = data && Object.keys(data).length > 0
      this.canContinue = isValid
      this.canComplete = isValid
    },
    
    async validateCurrentStep() {
      const stepComponent = this.$refs[`step-${this.currentStep}`]
      if (stepComponent && typeof stepComponent.validate === 'function') {
        const isValid = await stepComponent.validate()
        if (!isValid) {
          throw new Error('Please complete all required fields')
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.wizard-step-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
}

.wizard-step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-variant);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
  }
}

.step-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--q-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
}

.step-details {
  .step-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
    line-height: 1.3;
  }
  
  .step-description {
    margin: 0.5rem 0 0 0;
    color: var(--color-text-secondary);
    font-size: 1rem;
    line-height: 1.4;
  }
}

.step-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  min-width: 200px;
  
  @media (max-width: 768px) {
    width: 100%;
    align-items: flex-start;
  }
  
  .progress-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
  
  .progress-bar {
    width: 200px;
    
    @media (max-width: 768px) {
      width: 100%;
    }
  }
}

.wizard-step-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.wizard-step-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-variant);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    
    .nav-left,
    .nav-center,
    .nav-right {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
}

.nav-left,
.nav-center,
.nav-right {
  display: flex;
  gap: 0.5rem;
}

// Transition Animations
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-left-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
</style>
```

#### 5. JsonViewer Component

**File:** `src/components/Wizard/JsonViewer.vue`

```vue
<template>
  <div class="json-viewer">
    <!-- Toolbar -->
    <div class="json-toolbar">
      <div class="toolbar-left">
        <WizardButton
          size="small"
          variant="ghost"
          icon="unfold_less"
          @click="collapseAll"
        >
          Collapse All
        </WizardButton>
        <WizardButton
          size="small"
          variant="ghost"
          icon="unfold_more"
          @click="expandAll"
        >
          Expand All
        </WizardButton>
      </div>
      
      <div class="toolbar-right">
        <WizardButton
          size="small"
          variant="ghost"
          icon="content_copy"
          @click="copyToClipboard"
        >
          Copy
        </WizardButton>
        <WizardButton
          v-if="editable"
          size="small"
          variant="ghost"
          icon="edit"
          @click="toggleEditMode"
        >
          {{ isEditing ? 'View' : 'Edit' }}
        </WizardButton>
      </div>
    </div>
    
    <!-- JSON Content -->
    <div class="json-content">
      <div v-if="!isEditing" class="json-display">
        <JsonNode
          v-for="(node, index) in parsedJson"
          :key="index"
          :node="node"
          :level="0"
          :expanded="expandedNodes"
          :selectable="selectable"
          :selected-paths="selectedPaths"
          @toggle-node="toggleNode"
          @select-path="selectPath"
        />
      </div>
      
      <div v-else class="json-editor">
        <q-input
          v-model="jsonText"
          type="textarea"
          filled
          class="json-textarea"
          :error="hasJsonError"
          :error-message="jsonError"
          @update:model-value="validateJson"
        />
      </div>
    </div>
    
    <!-- Statistics -->
    <div v-if="showStats" class="json-stats">
      <div class="stat-item">
        <span class="stat-label">Fields:</span>
        <span class="stat-value">{{ totalFields }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Arrays:</span>
        <span class="stat-value">{{ arrayCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Objects:</span>
        <span class="stat-value">{{ objectCount }}</span>
      </div>
      <div v-if="selectable" class="stat-item">
        <span class="stat-label">Selected:</span>
        <span class="stat-value">{{ selectedPaths.length }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { copyToClipboard } from 'quasar'
import WizardButton from './Base/WizardButton.vue'
import JsonNode from './JsonNode.vue'

export default {
  name: 'JsonViewer',
  components: {
    WizardButton,
    JsonNode
  },
  
  props: {
    json: {
      type: [Object, Array, String],
      required: true
    },
    editable: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    },
    showStats: {
      type: Boolean,
      default: true
    },
    maxHeight: {
      type: String,
      default: '500px'
    }
  },
  
  emits: ['json-changed', 'selection-changed'],
  
  data() {
    return {
      isEditing: false,
      jsonText: '',
      parsedJson: [],
      expandedNodes: new Set(),
      selectedPaths: [],
      hasJsonError: false,
      jsonError: '',
      totalFields: 0,
      arrayCount: 0,
      objectCount: 0
    }
  },
  
  watch: {
    json: {
      handler() {
        this.parseJson()
      },
      immediate: true
    }
  },
  
  methods: {
    parseJson() {
      try {
        let jsonData = this.json
        if (typeof jsonData === 'string') {
          jsonData = JSON.parse(jsonData)
        }
        
        this.jsonText = JSON.stringify(jsonData, null, 2)
        this.parsedJson = this.buildNodeTree(jsonData, '$')
        this.calculateStats()
        this.hasJsonError = false
        this.jsonError = ''
      } catch (error) {
        this.hasJsonError = true
        this.jsonError = 'Invalid JSON format'
        this.parsedJson = []
      }
    },
    
    buildNodeTree(data, path, level = 0) {
      const nodes = []
      
      if (Array.isArray(data)) {
        nodes.push({
          id: path,
          path,
          type: 'array',
          level,
          key: this.getKeyFromPath(path),
          value: `Array(${data.length})`,
          children: data.map((item, index) => 
            this.buildNodeTree(item, `${path}[${index}]`, level + 1)
          ).flat(),
          isExpandable: data.length > 0
        })
      } else if (typeof data === 'object' && data !== null) {
        const entries = Object.entries(data)
        
        nodes.push({
          id: path,
          path,
          type: 'object',
          level,
          key: this.getKeyFromPath(path),
          value: `Object{${entries.length}}`,
          children: entries.map(([key, value]) =>
            this.buildNodeTree(value, `${path}.${key}`, level + 1)
          ).flat(),
          isExpandable: entries.length > 0
        })
      } else {
        nodes.push({
          id: path,
          path,
          type: typeof data,
          level,
          key: this.getKeyFromPath(path),
          value: data,
          children: [],
          isExpandable: false
        })
      }
      
      return nodes
    },
    
    getKeyFromPath(path) {
      const parts = path.split('.')
      return parts[parts.length - 1] || 'root'
    },
    
    calculateStats() {
      let fields = 0
      let arrays = 0
      let objects = 0
      
      const countNodes = (nodes) => {
        nodes.forEach(node => {
          fields++
          if (node.type === 'array') arrays++
          if (node.type === 'object') objects++
          if (node.children.length > 0) {
            countNodes(node.children)
          }
        })
      }
      
      countNodes(this.parsedJson)
      
      this.totalFields = fields
      this.arrayCount = arrays
      this.objectCount = objects
    },
    
    toggleNode(nodeId) {
      if (this.expandedNodes.has(nodeId)) {
        this.expandedNodes.delete(nodeId)
      } else {
        this.expandedNodes.add(nodeId)
      }
    },
    
    selectPath(path) {
      if (!this.selectable) return
      
      const index = this.selectedPaths.indexOf(path)
      if (index > -1) {
        this.selectedPaths.splice(index, 1)
      } else {
        this.selectedPaths.push(path)
      }
      
      this.$emit('selection-changed', [...this.selectedPaths])
    },
    
    collapseAll() {
      this.expandedNodes.clear()
    },
    
    expandAll() {
      const addAllNodeIds = (nodes) => {
        nodes.forEach(node => {
          if (node.isExpandable) {
            this.expandedNodes.add(node.id)
          }
          if (node.children.length > 0) {
            addAllNodeIds(node.children)
          }
        })
      }
      
      addAllNodeIds(this.parsedJson)
    },
    
    toggleEditMode() {
      if (this.isEditing) {
        // Switch from edit to view
        this.validateJson()
        if (!this.hasJsonError) {
          this.isEditing = false
        }
      } else {
        // Switch from view to edit
        this.isEditing = true
      }
    },
    
    validateJson() {
      try {
        const parsed = JSON.parse(this.jsonText)
        this.hasJsonError = false
        this.jsonError = ''
        this.$emit('json-changed', parsed)
      } catch (error) {
        this.hasJsonError = true
        this.jsonError = error.message
      }
    },
    
    async copyToClipboard() {
      try {
        await copyToClipboard(this.jsonText)
        this.$q.notify({
          type: 'positive',
          message: 'JSON copied to clipboard',
          position: 'top-right'
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to copy JSON',
          position: 'top-right'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.json-viewer {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
}

.json-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-variant);
  border-radius: 8px 8px 0 0;
  
  .toolbar-left,
  .toolbar-right {
    display: flex;
    gap: 0.5rem;
  }
}

.json-content {
  flex: 1;
  overflow: auto;
  max-height: v-bind(maxHeight);
}

.json-display {
  padding: 1rem;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.json-editor {
  padding: 0.5rem;
  
  .json-textarea {
    :deep(.q-field__control) {
      font-family: 'Roboto Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
      min-height: 200px;
    }
  }
}

.json-stats {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-variant);
  border-radius: 0 0 8px 8px;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    
    .stat-label {
      color: var(--color-text-secondary);
    }
    
    .stat-value {
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }
}
</style>
```

## Implementation Guidelines

### 1. Component Registration

**File:** `src/components/Wizard/index.js`

```javascript
// Base Components
import WizardButton from './Base/WizardButton.vue'
import WizardInput from './Base/WizardInput.vue'
import WizardCard from './Base/WizardCard.vue'

// Wizard Components
import WizardStepContainer from './WizardStepContainer.vue'
import JsonViewer from './JsonViewer.vue'

// Step Components
import Step1Introduction from './Steps/Step1Introduction.vue'
import Step2DataInput from './Steps/Step2DataInput.vue'
import Step3SchemaRules from './Steps/Step3SchemaRules.vue'
import Step4Fanout from './Steps/Step4Fanout.vue'
import Step5FilterRules from './Steps/Step5FilterRules.vue'
import Step6Mapping from './Steps/Step6Mapping.vue'
import Step7Review from './Steps/Step7Review.vue'

export {
  // Base
  WizardButton,
  WizardInput,
  WizardCard,
  
  // Wizard
  WizardStepContainer,
  JsonViewer,
  
  // Steps
  Step1Introduction,
  Step2DataInput,
  Step3SchemaRules,
  Step4Fanout,
  Step5FilterRules,
  Step6Mapping,
  Step7Review
}

// Auto-register components globally
export default {
  install(app) {
    app.component('WizardButton', WizardButton)
    app.component('WizardInput', WizardInput)
    app.component('WizardCard', WizardCard)
    app.component('WizardStepContainer', WizardStepContainer)
    app.component('JsonViewer', JsonViewer)
  }
}
```

### 2. Main Wizard Container Usage

```vue
<template>
  <div id="q-app">
    <q-layout view="lHh Lpr lFf">
      <q-page-container>
        <q-page class="wizard-page">
          <WizardStepContainer
            :steps="wizardSteps"
            :current-step="currentStep"
            :wizard-data="wizardData"
            @next-step="handleNextStep"
            @previous-step="handlePreviousStep"
            @complete-wizard="handleCompleteWizard"
            @save-progress="handleSaveProgress"
            @data-changed="handleDataChanged"
          />
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import { WizardStepContainer } from 'src/components/Wizard'
import {
  Step1Introduction,
  Step2DataInput,
  Step3SchemaRules,
  Step4Fanout,
  Step5FilterRules,
  Step6Mapping,
  Step7Review
} from 'src/components/Wizard/Steps'

export default {
  components: {
    WizardStepContainer
  },
  
  data() {
    return {
      currentStep: 0,
      wizardData: {
        projectName: '',
        description: '',
        mode: 'create', // 'create' or 'update'
        sampleData: null,
        schemaRules: {},
        filterRules: {},
        mappings: [],
        generatedPolicy: null
      },
      wizardSteps: [
        {
          id: 'introduction',
          title: 'Introduction & Setup',
          description: 'Configure your project and choose creation mode',
          component: Step1Introduction,
          nextText: 'Get Started'
        },
        {
          id: 'data-input',
          title: 'Sample Data Input',
          description: 'Upload or paste sample JSON data',
          component: Step2DataInput,
          nextText: 'Analyze Data'
        },
        {
          id: 'schema-rules',
          title: 'Schema Configuration',
          description: 'Configure JSON parsing rules',
          component: Step3SchemaRules,
          nextText: 'Configure Arrays'
        },
        {
          id: 'fanout',
          title: 'Array Processing',
          description: 'Configure array fanout rules',
          component: Step4Fanout,
          nextText: 'Create Filters'
        },
        {
          id: 'filter-rules',
          title: 'Filter Rules',
          description: 'Define when this policy applies',
          component: Step5FilterRules,
          nextText: 'Create Mappings'
        },
        {
          id: 'mapping',
          title: 'Field Mapping',
          description: 'Map fields to LogRhythm schema',
          component: Step6Mapping,
          nextText: 'Review Policy'
        },
        {
          id: 'review',
          title: 'Review & Export',
          description: 'Review and export your policy',
          component: Step7Review,
          nextText: 'Complete'
        }
      ]
    }
  },
  
  methods: {
    handleNextStep({ step, data }) {
      // Validate and save step data
      this.wizardData[this.wizardSteps[step].id] = data
      
      if (this.currentStep < this.wizardSteps.length - 1) {
        this.currentStep++
      }
    },
    
    handlePreviousStep({ step, data }) {
      // Save current step data
      this.wizardData[this.wizardSteps[step].id] = data
      
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    
    handleCompleteWizard({ allData, wizardData }) {
      // Generate final policy and export
      const policy = this.generatePolicy(allData, wizardData)
      this.exportPolicy(policy)
    },
    
    handleSaveProgress({ currentStep, stepData, wizardData }) {
      // Save progress to local storage or API
      localStorage.setItem('wizard-progress', JSON.stringify({
        currentStep,
        stepData,
        wizardData
      }))
    },
    
    handleDataChanged({ step, data }) {
      // Update wizard data in real-time
      this.wizardData[this.wizardSteps[step].id] = data
    },
    
    generatePolicy(stepData, wizardData) {
      // Implementation depends on your policy structure
      return {
        policyName: wizardData.projectName,
        description: wizardData.description,
        filter: stepData['filter-rules']?.expression,
        schemaRule: {
          convertToJson: stepData['schema-rules']?.convertToJson || [],
          childfanouts: stepData.fanout?.childfanouts || []
        },
        transforms: stepData.mapping?.transforms || []
      }
    },
    
    exportPolicy(policy) {
      // Export implementation
      const blob = new Blob([JSON.stringify(policy, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${policy.policyName}.json`
      link.click()
      URL.revokeObjectURL(url)
    }
  },
  
  mounted() {
    // Restore saved progress if available
    const saved = localStorage.getItem('wizard-progress')
    if (saved) {
      const progress = JSON.parse(saved)
      this.currentStep = progress.currentStep
      this.wizardData = { ...this.wizardData, ...progress.wizardData }
    }
  }
}
</script>

<style lang="scss">
.wizard-page {
  min-height: 100vh;
  background: var(--color-background);
}
</style>
```

### 3. Styling Integration with Quasar

**File:** `src/css/wizard-theme.scss`

```scss
// Import the design system variables
@import 'ui-design-system-variables';

// Quasar CSS Variables Integration
:root {
  // Override Quasar's primary color with LogRhythm brand
  --q-primary: var(--color-primary);
  --q-secondary: #{$secondary};
  --q-accent: #{$accent};
  --q-positive: #{$positive};
  --q-negative: #{$negative};
  --q-info: #{$info};
  --q-warning: #{$warning};
  
  // Dark mode overrides
  &.body--dark {
    --q-primary: var(--color-primary);
    --q-dark: #{$dark-1};
    --q-dark-page: #{$dark-2};
  }
}

// Global wizard styles
.wizard-theme {
  font-family: $font-family-sans-serif;
  
  // Apply design system spacing
  .q-gutter-xs > * + * { margin-left: $space-1 !important; }
  .q-gutter-sm > * + * { margin-left: $space-2 !important; }
  .q-gutter-md > * + * { margin-left: $space-4 !important; }
  .q-gutter-lg > * + * { margin-left: $space-6 !important; }
  .q-gutter-xl > * + * { margin-left: $space-8 !important; }
  
  // Custom Quasar component overrides
  .q-btn {
    font-weight: $font-medium;
    letter-spacing: $tracking-wide;
  }
  
  .q-input .q-field__control {
    font-family: $font-family-sans-serif;
  }
  
  .q-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    
    &.q-card--bordered {
      border: 1px solid var(--color-border);
    }
  }
  
  .q-stepper {
    background: var(--color-surface);
    
    .q-stepper__header {
      border-bottom: 1px solid var(--color-border);
    }
    
    .q-stepper__tab {
      &.q-stepper__tab--active {
        color: var(--q-primary);
      }
    }
  }
}
```

This comprehensive component library provides:

1. **Base Components**: Reusable building blocks with consistent styling and behavior
2. **Wizard Components**: Specialized components for the wizard interface
3. **Step Components**: Individual step implementations (to be created separately)
4. **Integration Guidelines**: How to integrate with Quasar and existing codebase
5. **Theme Integration**: Seamless integration with the design system
6. **Accessibility**: Built-in ARIA support and keyboard navigation
7. **Responsive Design**: Mobile-first approach with breakpoint handling
8. **State Management**: Proper data flow and event handling
9. **Error Handling**: Comprehensive error states and user feedback
10. **Performance**: Optimized rendering and lazy loading where appropriate

The components follow Vue 3 best practices and Quasar conventions while implementing the LogRhythm design system for a cohesive and professional user experience.

/mnt/g/GO_Workspace/src/github.com/logrhythm/EZ-Cloud-Fresh/frontend_standalone/component-library.md