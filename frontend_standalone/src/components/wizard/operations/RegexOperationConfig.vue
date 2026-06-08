<template>
  <div class="regex-operation-config">
    <div class="config-header">
      <q-icon name="code" size="20px" color="primary" class="q-mr-sm" />
      <span class="header-title">Regular Expression Configuration</span>
    </div>

    <div class="config-content q-gutter-md">
      <!-- Regex Pattern Input -->
      <div class="form-group">
        <label class="field-label">
          Regex Pattern *
          <q-tooltip>Use capturing groups () to extract specific parts</q-tooltip>
        </label>
        <q-input
          v-model="localPattern"
          outlined
          dense
          placeholder="/pattern/"
          class="regex-input"
          :class="{ 'input-valid': isPatternValid && localPattern, 'input-invalid': !isPatternValid && localPattern }"
          :error="!isPatternValid && localPattern !== ''"
          :error-message="patternError"
          @update:model-value="debouncedValidate"
          @blur="validatePattern"
        >
          <template #prepend>
            <q-icon name="code" size="xs" />
          </template>
          <template #append>
            <q-icon
              v-if="isPatternValid && localPattern"
              name="check_circle"
              color="positive"
              size="sm"
            />
            <q-icon
              v-else-if="!isPatternValid && localPattern"
              name="error"
              color="negative"
              size="sm"
            />
          </template>
        </q-input>
        <div class="field-hint">
          Use forward slashes to enclose the pattern (e.g., /IP: (\d+\.\d+\.\d+\.\d+)/)
        </div>
      </div>

      <!-- Capture Group Input -->
      <div class="form-group">
        <label class="field-label">
          Capture Group Name *
          <q-tooltip>Enter the name of the capture group to extract</q-tooltip>
        </label>
        <q-input
          v-model="localCaptureGroup"
          outlined
          dense
          type="text"
          placeholder="Enter group name (e.g., username, ipAddress)"
          class="capture-input"
          :error="captureGroupError !== null"
          :error-message="captureGroupError"
          @update:model-value="onCaptureGroupChange"
          @blur="validatePattern"
        >
          <template #prepend>
            <q-icon name="label" size="xs" />
          </template>
        </q-input>
        <div class="field-hint">
          Enter named capture group (e.g., 'username', 'ipAddress', 'errorMessage')
        </div>
      </div>

      <!-- Common Patterns Dropdown -->
      <div class="form-group">
        <label class="field-label">Common Patterns (Quick Insert)</label>
        <q-select
          ref="selectRef"
          v-model="selectedPreset"
          :options="patternOptions"
          outlined
          dense
          option-label="name"
          placeholder="Select a preset pattern..."
          class="preset-select"
          clearable
          @input="onDropdownInput"
          @change="onDropdownChange"
        >
          <template #prepend>
            <q-icon name="auto_awesome" size="xs" />
          </template>
          <template #option="scope">
            <q-item
              clickable
              @click="onOptionClick(scope.opt)"
            >
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
                <q-item-label caption class="preset-example">
                  {{ scope.opt.example }}
                </q-item-label>
                <q-item-label v-if="scope.opt.sampleValue" caption class="preset-sample">
                  Sample: "{{ scope.opt.sampleValue }}"
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <!-- Operation Preview -->
      <operation-preview
        v-if="localPattern && !isArrayInput"
        :original-value="sampleValue"
        :transformed-value="previewResult"
        :error="previewError"
        :loading="isTestingOperation"
        :operation="operationSyntax"
      />

      <!-- Array Validation Results -->
      <div v-if="localPattern && isPatternValid && isArrayInput" class="validation-results q-mt-md">
        <div class="validation-header">
          <q-icon name="fact_check" class="q-mr-xs" />
          <span>Validation Results ({{ sampleValuesArray.length }} value{{ sampleValuesArray.length !== 1 ? 's' : '' }})</span>
        </div>

        <q-list bordered separator class="validation-list">
          <q-item
            v-for="(result, index) in validationResults"
            :key="index"
            :class="result.isValid ? 'valid-item' : 'invalid-item'"
          >
            <q-item-section avatar>
              <q-icon
                :name="result.isValid ? 'check_circle' : 'error'"
                :color="result.isValid ? 'positive' : 'negative'"
                size="sm"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label>
                <code class="input-value">{{ result.input }}</code>
                <q-icon name="arrow_forward" size="xs" class="q-mx-xs" />
                <code :class="result.isValid ? 'output-value-valid' : 'output-value-invalid'">
                  {{ result.output }}
                </code>
              </q-item-label>
              <q-item-label caption v-if="!result.isValid" class="error-caption">
                {{ result.error }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-badge :color="result.isValid ? 'positive' : 'negative'">
                {{ result.isValid ? 'Match' : 'No Match' }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Summary -->
        <div class="validation-summary q-mt-sm">
          <q-chip color="positive" text-color="white" icon="check_circle">
            {{ validCount }} Matched
          </q-chip>
          <q-chip color="negative" text-color="white" icon="error">
            {{ invalidCount }} No Match
          </q-chip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { debounce } from 'quasar'
import { COMMON_REGEX_PATTERNS } from '../../../constants/operations'
import { validateRegexPattern, validateCaptureGroup, buildOperationSyntax } from '../../../utils/operationParser'
import OperationPreview from './OperationPreview.vue'

export default {
  name: 'RegexOperationConfig',
  components: {
    OperationPreview
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        pattern: '',
        captureGroup: ''
      })
    },
    fieldPath: {
      type: String,
      required: true
    },
    sampleValue: {
      type: [String, Number, Array],
      default: ''
    }
  },
  emits: ['input'],
  setup (props, { emit }) {
    const localPattern = ref(props.modelValue?.pattern || '')
    // Support both numeric and alphanumeric capture groups
    const localCaptureGroup = ref(props.modelValue?.captureGroup !== undefined ? String(props.modelValue.captureGroup) : '')
    const selectedPreset = ref(null)
    const selectRef = ref(null) // Reference to the q-select component
    const isPatternValid = ref(false)
    const patternError = ref(null)
    const captureGroupError = ref(null)
    const previewResult = ref(null)
    const previewError = ref(null)
    const isTestingOperation = ref(false)

    // Check if sample value is an array
    const isArrayInput = computed(() => {
      return Array.isArray(props.sampleValue) && props.sampleValue.length > 0
    })

    // Get array of sample values
    const sampleValuesArray = computed(() => {
      if (Array.isArray(props.sampleValue)) {
        return props.sampleValue
      }
      return props.sampleValue !== null && props.sampleValue !== undefined ? [props.sampleValue] : []
    })

    // Apply regex to a single value
    const applyRegex = (input, pattern, captureGroup) => {
      if (!pattern || typeof input !== 'string') {
        return {
          isValid: false,
          output: 'N/A',
          error: typeof input !== 'string' ? 'Input is not a string' : 'No pattern'
        }
      }

      try {
        // Remove leading/trailing slashes if present
        let regexPattern = pattern
        if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
          const lastSlash = pattern.lastIndexOf('/')
          regexPattern = pattern.substring(1, lastSlash)
        }

        const regex = new RegExp(regexPattern)
        const match = input.match(regex)

        if (!match) {
          return {
            isValid: false,
            output: 'No match',
            error: 'Pattern did not match'
          }
        }

        // Handle named capture groups only
        let output
        if (typeof captureGroup === 'string' && captureGroup !== '') {
          // Named capture group
          if (match.groups && match.groups[captureGroup]) {
            output = match.groups[captureGroup]
          } else {
            return {
              isValid: false,
              output: 'No match',
              error: `Named capture group '${captureGroup}' not found in match result`
            }
          }
        } else {
          return {
            isValid: false,
            output: 'N/A',
            error: 'Capture group name is required'
          }
        }

        return {
          isValid: true,
          output: output || '(empty string)',
          error: null
        }
      } catch (error) {
        console.error('[RegexOperationConfig] Error applying regex pattern:', { input, pattern, captureGroup, error: error.message })
        return {
          isValid: false,
          output: 'Error',
          error: error.message
        }
      }
    }

    // Validate all values in the array
    const validationResults = computed(() => {
      if (!isArrayInput.value || !isPatternValid.value) {
        return []
      }

      // Use capture group as-is (named group string)
      const captureGroupValue = localCaptureGroup.value

      return sampleValuesArray.value.map((value, idx) => {
        const result = applyRegex(String(value), localPattern.value, captureGroupValue)
        return {
          index: idx,
          input: String(value),
          isValid: result.isValid,
          output: result.output,
          error: result.error
        }
      })
    })

    // Count valid and invalid results
    const validCount = computed(() => {
      return validationResults.value.filter(r => r.isValid).length
    })

    const invalidCount = computed(() => {
      return validationResults.value.filter(r => !r.isValid).length
    })

    // Computed
    const patternOptions = computed(() => COMMON_REGEX_PATTERNS)

    const operationSyntax = computed(() => {
      console.log('[RegexOperationConfig] Computing operation syntax:', {
        localPattern: localPattern.value,
        isPatternValid: isPatternValid.value,
        localCaptureGroup: localCaptureGroup.value,
        fieldPath: props.fieldPath
      })

      if (!localPattern.value) {
        console.log('[RegexOperationConfig] No pattern - returning empty')
        return ''
      }

      if (!isPatternValid.value) {
        console.log('[RegexOperationConfig] Pattern invalid - returning empty')
        return ''
      }

      // Ensure captureGroup is a valid number before building syntax
      if (localCaptureGroup.value === undefined || localCaptureGroup.value === null) {
        console.log('[RegexOperationConfig] CaptureGroup is undefined/null - returning empty')
        return ''
      }

      const syntax = buildOperationSyntax('REGEX', props.fieldPath, {
        pattern: localPattern.value,
        captureGroup: localCaptureGroup.value
      })

      console.log('[RegexOperationConfig] Built syntax:', syntax)
      return syntax || ''
    })

    // Methods
    const validatePattern = () => {
      console.log('[RegexOperationConfig] validatePattern called:', {
        localPattern: localPattern.value,
        localCaptureGroup: localCaptureGroup.value
      })

      if (!localPattern.value) {
        isPatternValid.value = false
        patternError.value = null
        console.log('[RegexOperationConfig] Pattern is empty')
        return
      }

      const validation = validateRegexPattern(localPattern.value)
      isPatternValid.value = validation.isValid
      patternError.value = validation.error

      console.log('[RegexOperationConfig] Pattern validation result:', {
        isValid: validation.isValid,
        error: validation.error
      })

      // Also validate capture group if pattern is valid
      if (isPatternValid.value) {
        const captureValidation = validateCaptureGroup(localPattern.value, localCaptureGroup.value)
        console.log('[RegexOperationConfig] Capture group validation:', {
          isValid: captureValidation.isValid,
          error: captureValidation.error
        })

        if (!captureValidation.isValid) {
          captureGroupError.value = captureValidation.error
        } else {
          captureGroupError.value = null
        }
      }

      emitChange()
    }

    const debouncedValidate = debounce(validatePattern, 300)

    // Debug handlers to see which events fire
    const onDropdownInput = (value) => {
      // No-op - kept for compatibility
    }

    const onDropdownChange = (value) => {
      // No-op - kept for compatibility
    }

    // Direct click handler on option items
    const onOptionClick = (option) => {
      // Directly call insertPreset
      insertPreset(option)

      // Close the dropdown manually
      if (selectRef.value) {
        selectRef.value.hidePopup()
      }
    }

    const insertPreset = (patternObj) => {
      try {
        if (patternObj && patternObj.pattern) {
          // Update local refs with pattern data
          localPattern.value = patternObj.pattern
          localCaptureGroup.value = String(patternObj.captureGroup) // Convert to string for consistency

          // Validate the new pattern
          validatePattern()

          // Emit changes to parent component
          emitChange()

          // If pattern has a sample value, test it immediately to show preview
          if (patternObj.sampleValue) {
            // Test with the hardcoded sample value
            const testResult = applyRegex(patternObj.sampleValue, patternObj.pattern, patternObj.captureGroup)

            if (testResult.isValid) {
              previewResult.value = testResult.output
              previewError.value = null
            } else {
              previewError.value = testResult.error
              previewResult.value = null
            }
          }

          // Reset the dropdown selection so user can select the same pattern again
          // Using nextTick to ensure the value updates have been processed
          setTimeout(() => {
            selectedPreset.value = null
          }, 100)
        } else {
          console.error('[RegexOperationConfig] Invalid pattern object provided to insertPreset:', patternObj)
        }
      } catch (error) {
        console.error('[RegexOperationConfig] Error inserting preset pattern:', error)
      }
    }

    const emitChange = () => {
      try {
        console.log('[RegexOperationConfig] emitChange called - current state:', {
          localPattern: localPattern.value,
          localCaptureGroup: localCaptureGroup.value,
          isPatternValid: isPatternValid.value
        })

        // Always keep capture group as string (named group only)
        const payload = {
          pattern: localPattern.value,
          captureGroup: localCaptureGroup.value
        }

        console.log('[RegexOperationConfig] Emitting change payload:', {
          pattern: payload.pattern,
          captureGroup: payload.captureGroup,
          patternLength: payload.pattern ? payload.pattern.length : 0
        })
        emit('input', payload)
      } catch (error) {
        console.error('[RegexOperationConfig] Error emitting change:', error)
      }
    }

    // Handle capture group changes - only allow alphanumeric named groups
    const onCaptureGroupChange = (value) => {
      if (value !== null && value !== undefined) {
        // Trim whitespace and keep as string (named group)
        localCaptureGroup.value = String(value).trim()
      }
      debouncedValidate()
    }

    // Watch for external changes
    watch(() => props.modelValue, (newVal) => {
      console.log('[RegexOperationConfig] modelValue changed:', newVal)
      if (newVal) {
        localPattern.value = newVal.pattern || ''
        localCaptureGroup.value = newVal.captureGroup !== undefined ? String(newVal.captureGroup) : ''
        validatePattern()
      }
    }, { deep: true })

    // Watch for preset selection changes
    watch(selectedPreset, (newPreset) => {
      if (newPreset) {
        insertPreset(newPreset)
      }
    })

    // Watch localPattern changes
    watch(localPattern, (newVal, oldVal) => {
      console.log('[RegexOperationConfig] localPattern changed:', {
        old: oldVal,
        new: newVal
      })
    })

    // Watch localCaptureGroup changes
    watch(localCaptureGroup, (newVal, oldVal) => {
      console.log('[RegexOperationConfig] localCaptureGroup changed:', {
        old: oldVal,
        new: newVal
      })
    })

    // Watch isPatternValid changes
    watch(isPatternValid, (newVal, oldVal) => {
      console.log('[RegexOperationConfig] isPatternValid changed:', {
        old: oldVal,
        new: newVal
      })
    })

    // Initial validation
    if (localPattern.value) {
      validatePattern()
    }

    return {
      localPattern,
      localCaptureGroup,
      selectedPreset,
      selectRef,
      isPatternValid,
      patternError,
      captureGroupError,
      previewResult,
      previewError,
      isTestingOperation,
      patternOptions,
      operationSyntax,
      validatePattern,
      debouncedValidate,
      insertPreset,
      onCaptureGroupChange,
      onDropdownInput,
      onDropdownChange,
      onOptionClick,
      // Array validation
      isArrayInput,
      sampleValuesArray,
      validationResults,
      validCount,
      invalidCount
    }
  }
}
</script>

<style lang="scss" scoped>
.regex-operation-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #E3F2FD;
}

.config-content {
  display: flex;
  flex-direction: column;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #E3F2FD;
  display: flex;
  align-items: center;
  gap: 4px;
}

.regex-input,
.capture-input {
  ::v-deep .q-field__control {
    font-family: 'Roboto Mono', monospace;
    font-size: 13px;
  }

  &.input-valid {
    ::v-deep .q-field__control {
      border-color: #4caf50;
      background: rgba(76, 175, 80, 0.05);
    }
  }

  &.input-invalid {
    ::v-deep .q-field__control {
      border-color: #f44336;
      background: rgba(244, 67, 54, 0.05);
    }
  }
}

.field-hint {
  font-size: 12px;
  color: rgba(227, 242, 253, 0.5);
  margin-top: 4px;
}

.preset-select {
  ::v-deep .q-field__control {
    background: rgba(255, 255, 255, 0.05);
  }
}

.preset-example {
  font-size: 11px;
  color: rgba(227, 242, 253, 0.5);
  font-style: italic;
}

.preset-sample {
  font-size: 10px;
  color: rgba(33, 150, 243, 0.7);
  font-family: 'Courier New', monospace;
  margin-top: 2px;
  background: rgba(33, 150, 243, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
  display: inline-block;
}

/* Validation Results */
.validation-results {
  margin-top: 16px;
}

.validation-header {
  font-weight: 500;
  color: #2196f3;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.validation-list {
  max-height: 300px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.valid-item {
  background: rgba(76, 175, 80, 0.05) !important;
  border-left: 3px solid #4caf50 !important;
}

.invalid-item {
  background: rgba(244, 67, 54, 0.05) !important;
  border-left: 3px solid #f44336 !important;
}

.input-value {
  font-family: 'Courier New', monospace;
  background-color: rgba(33, 150, 243, 0.2);
  padding: 2px 6px;
  border-radius: 3px;
  color: #64b5f6;
  font-weight: 500;
}

.output-value-valid {
  font-family: 'Courier New', monospace;
  background-color: rgba(76, 175, 80, 0.2);
  padding: 2px 6px;
  border-radius: 3px;
  color: #81c784;
  font-weight: 500;
}

.output-value-invalid {
  font-family: 'Courier New', monospace;
  background-color: rgba(244, 67, 54, 0.2);
  padding: 2px 6px;
  border-radius: 3px;
  color: #e57373;
  font-weight: 500;
}

.error-caption {
  color: #f44336 !important;
  font-size: 12px;
  margin-top: 4px;
}

.validation-summary {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-start;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .config-header {
    font-size: 14px;
  }
}
</style>
