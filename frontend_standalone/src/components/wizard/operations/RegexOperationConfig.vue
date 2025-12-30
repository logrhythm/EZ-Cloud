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
          Capture Group *
          <q-tooltip>Which group to extract (0 = entire match, 1+ = numeric groups, or named group)</q-tooltip>
        </label>
        <q-input
          v-model="localCaptureGroup"
          outlined
          dense
          type="text"
          placeholder="1"
          class="capture-input"
          :error="captureGroupError !== null"
          :error-message="captureGroupError"
          @update:model-value="onCaptureGroupChange"
        >
          <template #prepend>
            <q-icon name="filter_1" size="xs" />
          </template>
        </q-input>
        <div class="field-hint">
          Enter group number (e.g., 0, 1, 2) or named group (e.g., 'username', 'groupName')
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

      <!-- Test Button -->
      <div class="action-buttons">
        <q-btn
          :loading="isTestingOperation"
          :disable="!isPatternValid || !localPattern"
          color="primary"
          icon="play_arrow"
          label="Test Operation"
          @click="testOperation"
          no-caps
          unelevated
          class="test-btn"
        >
          <template #loading>
            <q-spinner-dots size="20px" />
          </template>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { debounce } from 'quasar'
import { COMMON_REGEX_PATTERNS } from '../../../constants/operations'
import { validateRegexPattern, validateCaptureGroup, buildOperationSyntax } from '../../../utils/operationParser'
import { MappingService } from '../../../services/wizard/mappingService'
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
        captureGroup: 1
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
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const localPattern = ref(props.modelValue?.pattern || '')
    // Support both numeric and alphanumeric capture groups
    const localCaptureGroup = ref(props.modelValue?.captureGroup !== undefined ? String(props.modelValue.captureGroup) : '1')
    const selectedPreset = ref(null)
    const selectRef = ref(null) // Reference to the q-select component
    const isPatternValid = ref(false)
    const patternError = ref(null)
    const captureGroupError = ref(null)
    const isTestingOperation = ref(false)
    const previewResult = ref(null)
    const previewError = ref(null)

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

        // Handle capture groups
        let output
        if (typeof captureGroup === 'number') {
          output = match[captureGroup] !== undefined ? match[captureGroup] : match[0]
        } else if (typeof captureGroup === 'string') {
          // Named capture group
          output = match.groups && match.groups[captureGroup]
            ? match.groups[captureGroup]
            : match[0]
        } else {
          output = match[0]
        }

        return {
          isValid: true,
          output: output || '(empty string)',
          error: null
        }
      } catch (error) {
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

      // Convert captureGroup to number if it's a numeric string
      let captureGroupValue = localCaptureGroup.value
      if (typeof captureGroupValue === 'string' && /^\d+$/.test(captureGroupValue)) {
        captureGroupValue = parseInt(captureGroupValue, 10)
      }

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
      if (!localPattern.value || !isPatternValid.value) return ''
      // Ensure captureGroup is a valid number before building syntax
      if (localCaptureGroup.value === undefined || localCaptureGroup.value === null) return ''
      return buildOperationSyntax('REGEX', props.fieldPath, {
        pattern: localPattern.value,
        captureGroup: localCaptureGroup.value
      })
    })

    // Methods
    const validatePattern = () => {
      if (!localPattern.value) {
        isPatternValid.value = false
        patternError.value = null
        return
      }

      const validation = validateRegexPattern(localPattern.value)
      isPatternValid.value = validation.isValid
      patternError.value = validation.error

      // Also validate capture group if pattern is valid
      if (isPatternValid.value) {
        const captureValidation = validateCaptureGroup(localPattern.value, localCaptureGroup.value)
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
      console.log('🎯 [@input event] FIRED! Value:', value)
      console.log('  Type:', typeof value)
      console.log('  Value:', JSON.stringify(value, null, 2))
    }

    const onDropdownChange = (value) => {
      console.log('🎯 [@change event] FIRED! Value:', value)
      console.log('  Type:', typeof value)
      console.log('  Value:', JSON.stringify(value, null, 2))
    }

    // Direct click handler on option items
    const onOptionClick = (option) => {
      console.log('🎯🎯🎯 [DIRECT @click] Option clicked!')
      console.log('  Option:', option)
      console.log('  Option.name:', option.name)
      console.log('  Option.pattern:', option.pattern)

      // Directly call insertPreset
      insertPreset(option)

      // Close the dropdown manually
      if (selectRef.value) {
        console.log('📦 Closing dropdown via hidePopup()')
        selectRef.value.hidePopup()
      }

      console.log('✅ [CLICK] Option handling completed')
    }

    const insertPreset = (patternObj) => {
      console.log('='.repeat(60))
      console.log('🔍 [DEBUG] insertPreset TRIGGERED')
      console.log('🔍 [DEBUG] Type of patternObj:', typeof patternObj)
      console.log('🔍 [DEBUG] patternObj value:', JSON.stringify(patternObj, null, 2))
      console.log('🔍 [DEBUG] patternObj is null?', patternObj === null)
      console.log('🔍 [DEBUG] patternObj is undefined?', patternObj === undefined)
      console.log('🔍 [DEBUG] patternObj has .pattern?', patternObj?.pattern)
      console.log('🔍 [DEBUG] patternObj has .captureGroup?', patternObj?.captureGroup)

      console.log('🔍 [DEBUG] BEFORE UPDATE:')
      console.log('  - localPattern.value:', localPattern.value)
      console.log('  - localCaptureGroup.value:', localCaptureGroup.value)

      if (patternObj && patternObj.pattern) {
        console.log('✅ [DEBUG] Condition passed, updating values...')

        // Update local refs with pattern data
        localPattern.value = patternObj.pattern
        localCaptureGroup.value = String(patternObj.captureGroup) // Convert to string for consistency

        console.log('🔍 [DEBUG] AFTER UPDATE:')
        console.log('  - localPattern.value:', localPattern.value)
        console.log('  - localCaptureGroup.value:', localCaptureGroup.value)

        console.log('🔍 [DEBUG] Calling validatePattern()...')
        // Validate the new pattern
        validatePattern()

        console.log('🔍 [DEBUG] Calling emitChange()...')
        // Emit changes to parent component
        emitChange()

        console.log('🔍 [DEBUG] Calling testOperation()...')
        // Test the operation with sample data
        testOperation()

        console.log('🔍 [DEBUG] Setting up setTimeout to reset selectedPreset...')
        // Reset the dropdown selection so user can select the same pattern again
        // Using nextTick to ensure the value updates have been processed
        setTimeout(() => {
          console.log('🔍 [DEBUG] Timeout fired, resetting selectedPreset to null')
          selectedPreset.value = null
          console.log('🔍 [DEBUG] selectedPreset.value is now:', selectedPreset.value)
        }, 100)

        console.log('✅ [DEBUG] Preset insertion completed successfully')
      } else {
        console.error('❌ [DEBUG] Condition FAILED!')
        console.error('  - patternObj:', patternObj)
        console.error('  - patternObj?.pattern:', patternObj?.pattern)
        console.error('  - patternObj?.captureGroup:', patternObj?.captureGroup)
      }
      console.log('='.repeat(60))
    }

    const testOperation = async () => {
      if (!isPatternValid.value || !localPattern.value) return

      isTestingOperation.value = true
      previewError.value = null

      try {
        const result = await MappingService.testOperation(operationSyntax.value, props.sampleValue)

        if (result.success) {
          previewResult.value = result.output
          previewError.value = null
        } else {
          previewResult.value = null
          previewError.value = result.error
        }
      } catch (error) {
        previewError.value = error.message || 'Operation test failed'
        previewResult.value = null
      } finally {
        isTestingOperation.value = false
      }
    }

    const emitChange = () => {
      // Convert to number if it's a numeric string, otherwise keep as string
      let captureGroupValue = localCaptureGroup.value
      if (typeof captureGroupValue === 'string' && /^\d+$/.test(captureGroupValue)) {
        captureGroupValue = parseInt(captureGroupValue, 10)
      }

      emit('update:modelValue', {
        pattern: localPattern.value,
        captureGroup: captureGroupValue
      })
    }

    // Handle capture group changes - allow alphanumeric values
    const onCaptureGroupChange = (value) => {
      if (value !== null && value !== undefined) {
        // Trim whitespace but allow alphanumeric values
        localCaptureGroup.value = String(value).trim()
      }
      debouncedValidate()
    }

    // Watch for external changes
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        localPattern.value = newVal.pattern || ''
        localCaptureGroup.value = newVal.captureGroup !== undefined ? String(newVal.captureGroup) : '1'
        validatePattern()
      }
    }, { deep: true })

    // Watch for preset selection changes
    watch(selectedPreset, (newPreset, oldPreset) => {
      console.log('='.repeat(80))
      console.log('👀 [WATCH] selectedPreset WATCHER TRIGGERED!')
      console.log('  - OLD value:', oldPreset)
      console.log('  - NEW value:', newPreset)
      console.log('  - Type of NEW:', typeof newPreset)
      console.log('  - Is null?', newPreset === null)
      console.log('  - Is undefined?', newPreset === undefined)
      console.log('  - Truthy?', !!newPreset)
      console.log('='.repeat(80))

      if (newPreset) {
        console.log('✅ Calling insertPreset with:', newPreset)
        insertPreset(newPreset)
      } else {
        console.log('⚠️ newPreset is falsy, NOT calling insertPreset')
      }
    })

    // Additional debugging: Log whenever selectedPreset ref is accessed
    console.log('🔧 [SETUP] RegexOperationConfig component setup() called')
    console.log('🔧 [SETUP] selectedPreset initial value:', selectedPreset.value)
    console.log('🔧 [SETUP] patternOptions:', patternOptions.value?.length, 'patterns')

    // Auto-test when sample value changes
    watch(() => props.sampleValue, () => {
      if (isPatternValid.value && localPattern.value) {
        testOperation()
      }
    })

    // Initial validation
    if (localPattern.value) {
      validatePattern()
      testOperation()
    }

    return {
      localPattern,
      localCaptureGroup,
      selectedPreset,
      selectRef,
      isPatternValid,
      patternError,
      captureGroupError,
      isTestingOperation,
      previewResult,
      previewError,
      patternOptions,
      operationSyntax,
      debouncedValidate,
      insertPreset,
      testOperation,
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

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.test-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.test-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
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

  .action-buttons {
    justify-content: stretch;

    .test-btn {
      flex: 1;
    }
  }
}
</style>
