<template>
  <div class="regex-builder">
    <div class="builder-header">
      <q-icon name="code" size="20px" color="primary" />
      <span class="builder-title">Regex Pattern Builder</span>
    </div>

    <div class="builder-content">
      <!-- Common Pattern Templates -->
      <div class="template-section">
        <div class="section-label">Quick Templates:</div>
        <div class="template-chips">
          <q-chip
            v-for="template in templates"
            :key="template.name"
            clickable
            :outline="selectedTemplate !== template.name"
            color="primary"
            text-color="white"
            @click="applyTemplate(template)"
          >
            <q-icon :name="template.icon" size="18px" class="q-mr-xs" />
            {{ template.label }}
          </q-chip>
        </div>
      </div>

      <!-- Pattern Input -->
      <div class="pattern-input-section">
        <q-input
          v-model="pattern"
          outlined
          dense
          label="Regex Pattern"
          placeholder="/pattern/"
          bg-color="white"
          color="black"
          class="pattern-input"
          @update:model-value="handlePatternChange"
        >
          <template v-slot:prepend>
            <q-icon name="pattern" color="primary" />
          </template>
          <template v-slot:append>
            <q-btn
              flat
              dense
              round
              icon="help_outline"
              size="sm"
            >
              <q-tooltip>
                Enter regex pattern with forward slashes<br/>
                Example: /pattern/ or /IP: (\\d+\\.\\d+\\.\\d+\\.\\d+)/
              </q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <div v-if="patternError" class="pattern-error">
          <q-icon name="error_outline" size="16px" />
          {{ patternError }}
        </div>
        <div v-else-if="pattern" class="pattern-info">
          <q-icon name="check_circle" size="16px" color="positive" />
          Valid regex pattern
        </div>
      </div>

      <!-- Capture Group Selector -->
      <div class="capture-group-section">
        <q-input
          v-model.number="captureGroup"
          outlined
          dense
          type="number"
          label="Capture Group"
          min="0"
          :max="maxCaptureGroups"
          bg-color="white"
          color="black"
          @update:model-value="handleCaptureGroupChange"
        >
          <template v-slot:prepend>
            <q-icon name="filter_1" color="primary" />
          </template>
          <template v-slot:hint>
            Group 0 = entire match, 1+ = capture groups
          </template>
        </q-input>

        <div v-if="maxCaptureGroups > 0" class="capture-info">
          <q-icon name="info" size="16px" />
          Pattern has {{ maxCaptureGroups }} capture group(s)
        </div>
      </div>

      <!-- Test Area -->
      <div class="test-section">
        <div class="section-label">Test Your Pattern:</div>
        <q-input
          v-model="testString"
          outlined
          dense
          label="Test String"
          placeholder="Enter text to test the pattern"
          bg-color="white"
          color="black"
        />

        <div v-if="testResult !== null" class="test-result">
          <div class="result-label">
            <q-icon :name="testResult.success ? 'check_circle' : 'cancel'"
                    :color="testResult.success ? 'positive' : 'warning'"
                    size="20px" />
            {{ testResult.success ? 'Match Found!' : 'No Match' }}
          </div>
          <div v-if="testResult.success && testResult.captured" class="captured-value">
            <strong>Captured Value:</strong> <code>{{ testResult.captured }}</code>
          </div>
        </div>
      </div>

      <!-- Pattern Guide -->
      <div class="pattern-guide">
        <div class="guide-toggle" @click="showGuide = !showGuide">
          <q-icon :name="showGuide ? 'expand_less' : 'expand_more'" />
          Regex Quick Reference
        </div>
        <q-slide-transition>
          <div v-show="showGuide" class="guide-content">
            <div class="guide-row">
              <code>\\d</code> = digit (0-9)
              <code>\\w</code> = word character
              <code>\\s</code> = whitespace
            </div>
            <div class="guide-row">
              <code>+</code> = one or more
              <code>*</code> = zero or more
              <code>?</code> = zero or one
            </div>
            <div class="guide-row">
              <code>()</code> = capture group
              <code>[]</code> = character class
              <code>|</code> = OR
            </div>
          </div>
        </q-slide-transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { validateRegexPattern } from '../../../../utils/operationParser'

export default {
  name: 'RegexBuilder',
  props: {
    modelValue: {
      type: Object,
      default: () => ({ pattern: '', captureGroup: 1 })
    },
    sampleValue: {
      type: [String, Number],
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const pattern = ref(props.modelValue?.pattern || '')
    const captureGroup = ref(props.modelValue?.captureGroup || 1)
    const patternError = ref(null)
    const selectedTemplate = ref(null)
    const testString = ref(String(props.sampleValue || ''))
    const testResult = ref(null)
    const showGuide = ref(false)

    const templates = [
      {
        name: 'ip',
        label: 'IP Address',
        icon: 'lan',
        pattern: '/(\\d+\\.\\d+\\.\\d+\\.\\d+)/',
        captureGroup: 1,
        description: 'Matches IPv4 addresses like 192.168.1.1'
      },
      {
        name: 'email',
        label: 'Email',
        icon: 'email',
        pattern: '/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/',
        captureGroup: 1,
        description: 'Matches email addresses'
      },
      {
        name: 'url',
        label: 'URL',
        icon: 'link',
        pattern: '/(https?:\\/\\/[^\\s]+)/',
        captureGroup: 1,
        description: 'Matches HTTP/HTTPS URLs'
      },
      {
        name: 'number',
        label: 'Number',
        icon: 'pin',
        pattern: '/(\\d+)/',
        captureGroup: 1,
        description: 'Matches numbers'
      },
      {
        name: 'word',
        label: 'Word',
        icon: 'text_fields',
        pattern: '/(\\w+)/',
        captureGroup: 1,
        description: 'Matches words (letters, digits, underscore)'
      }
    ]

    const maxCaptureGroups = computed(() => {
      if (!pattern.value) return 0
      try {
        const patternContent = pattern.value.replace(/^\/|\/$/g, '')
        const matches = patternContent.match(/\(/g)
        return matches ? matches.length : 0
      } catch (e) {
        return 0
      }
    })

    const applyTemplate = (template) => {
      selectedTemplate.value = template.name
      pattern.value = template.pattern
      captureGroup.value = template.captureGroup
      validatePattern()
      emitValue()
      runTest()
    }

    const validatePattern = () => {
      if (!pattern.value) {
        patternError.value = 'Pattern is required'
        return false
      }

      const validation = validateRegexPattern(pattern.value)
      if (!validation.isValid) {
        patternError.value = validation.error
        return false
      }

      patternError.value = null
      return true
    }

    const handlePatternChange = () => {
      selectedTemplate.value = null
      validatePattern()
      emitValue()
      runTest()
    }

    const handleCaptureGroupChange = () => {
      emitValue()
      runTest()
    }

    const emitValue = () => {
      emit('update:modelValue', {
        pattern: pattern.value,
        captureGroup: captureGroup.value
      })
    }

    const runTest = () => {
      if (!pattern.value || !testString.value) {
        testResult.value = null
        return
      }

      try {
        const patternContent = pattern.value.replace(/^\/|\/$/g, '')
        const regex = new RegExp(patternContent)
        const match = testString.value.match(regex)

        if (match) {
          testResult.value = {
            success: true,
            captured: match[captureGroup.value] || match[0]
          }
        } else {
          testResult.value = {
            success: false,
            captured: null
          }
        }
      } catch (e) {
        testResult.value = {
          success: false,
          captured: null,
          error: e.message
        }
      }
    }

    // Watch for sample value changes
    watch(() => props.sampleValue, (newVal) => {
      if (newVal && !testString.value) {
        testString.value = String(newVal)
        runTest()
      }
    })

    // Watch test string changes
    watch(testString, () => {
      runTest()
    })

    // Initialize with sample value
    if (props.sampleValue && !testString.value) {
      testString.value = String(props.sampleValue)
    }

    return {
      pattern,
      captureGroup,
      patternError,
      selectedTemplate,
      testString,
      testResult,
      showGuide,
      templates,
      maxCaptureGroups,
      applyTemplate,
      handlePatternChange,
      handleCaptureGroupChange
    }
  }
}
</script>

<style lang="scss" scoped>
.regex-builder {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 16px;
}

.builder-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.builder-title {
  font-size: 14px;
  font-weight: 600;
  color: #E3F2FD;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.builder-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(227, 242, 253, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.template-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pattern-input {
  ::v-deep .q-field__control {
    font-family: 'Roboto Mono', monospace;
  }
}

.pattern-error,
.pattern-info,
.capture-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-top: 8px;
}

.pattern-error {
  color: #FF9800;
}

.pattern-info {
  color: #4CAF50;
}

.capture-info {
  color: rgba(227, 242, 253, 0.7);
}

.test-result {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.result-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 8px;
}

.captured-value {
  font-size: 13px;
  color: rgba(227, 242, 253, 0.8);

  code {
    background: rgba(33, 150, 243, 0.2);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Roboto Mono', monospace;
    color: #64b5f6;
  }
}

.pattern-guide {
  margin-top: 8px;
  background: rgba(33, 150, 243, 0.08);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 6px;
  overflow: hidden;
}

.guide-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #2196F3;
  transition: background 150ms;

  &:hover {
    background: rgba(33, 150, 243, 0.12);
  }
}

.guide-content {
  padding: 12px;
  border-top: 1px solid rgba(33, 150, 243, 0.2);
}

.guide-row {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 12px;
  color: rgba(227, 242, 253, 0.7);

  &:last-child {
    margin-bottom: 0;
  }

  code {
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Roboto Mono', monospace;
    color: #64b5f6;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .template-chips {
    flex-direction: column;
  }

  .guide-row {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
