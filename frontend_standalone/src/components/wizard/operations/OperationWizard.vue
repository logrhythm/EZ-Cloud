<template>
  <div class="operation-wizard">
    <div class="wizard-header">
      <q-icon name="explore" size="24px" color="primary" />
      <div class="wizard-title">
        <div class="title-main">Help Me Choose</div>
        <div class="title-sub">Answer a few questions to find the right operation</div>
      </div>
    </div>

    <q-stepper
      v-model="currentStep"
      ref="stepper"
      color="primary"
      animated
      flat
      class="wizard-stepper"
    >
      <!-- Step 1: What do you want to do? -->
      <q-step
        :name="1"
        title="What do you want to do?"
        icon="help_outline"
        :done="currentStep > 1"
      >
        <div class="wizard-step-content">
          <div class="options-grid">
            <div
              v-for="goal in goals"
              :key="goal.value"
              class="option-card"
              :class="{ 'selected': selectedGoal === goal.value }"
              @click="selectGoal(goal.value)"
            >
              <q-icon :name="goal.icon" size="32px" :color="goal.color" />
              <div class="option-label">{{ goal.label }}</div>
              <div class="option-description">{{ goal.description }}</div>
            </div>
          </div>
        </div>

        <q-stepper-navigation>
          <q-btn
            @click="goToStep(2)"
            color="primary"
            label="Continue"
            :disable="!selectedGoal"
          />
          <q-btn
            flat
            @click="$emit('cancel')"
            label="Cancel"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 2: What type of data? -->
      <q-step
        :name="2"
        title="What type of data?"
        icon="category"
        :done="currentStep > 2"
      >
        <div class="wizard-step-content">
          <div class="options-grid">
            <div
              v-for="dataType in dataTypes"
              :key="dataType.value"
              class="option-card"
              :class="{ 'selected': selectedDataType === dataType.value }"
              @click="selectDataType(dataType.value)"
            >
              <q-icon :name="dataType.icon" size="32px" :color="dataType.color" />
              <div class="option-label">{{ dataType.label }}</div>
              <div class="option-description">{{ dataType.description }}</div>
            </div>
          </div>
        </div>

        <q-stepper-navigation>
          <q-btn
            @click="goToStep(3)"
            color="primary"
            label="Continue"
            :disable="!selectedDataType"
          />
          <q-btn
            flat
            @click="goToStep(1)"
            label="Back"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 3: Recommended Operations -->
      <q-step
        :name="3"
        title="Recommended Operations"
        icon="check_circle"
      >
        <div class="wizard-step-content">
          <div class="recommendation-message">
            <q-icon name="lightbulb" size="32px" color="amber" />
            <div>
              <div class="message-title">Based on your selections:</div>
              <div class="message-text">
                You want to <strong>{{ getGoalLabel() }}</strong> on <strong>{{ getDataTypeLabel() }}</strong> data.
              </div>
            </div>
          </div>

          <div class="recommended-operations">
            <div class="section-label">Recommended Operations:</div>
            <div
              v-for="operation in recommendedOperations"
              :key="operation.type"
              class="operation-suggestion"
              @click="selectOperation(operation)"
            >
              <q-icon
                :name="operation.icon"
                size="24px"
                :color="operation.color"
              />
              <div class="operation-info">
                <div class="operation-name">{{ operation.label }}</div>
                <div class="operation-desc">{{ operation.description }}</div>
                <div class="operation-example">
                  <q-icon name="tips_and_updates" size="14px" />
                  Example: {{ operation.example }}
                </div>
              </div>
              <q-btn
                flat
                round
                dense
                icon="arrow_forward"
                color="primary"
              />
            </div>
          </div>
        </div>

        <q-stepper-navigation>
          <q-btn
            flat
            @click="goToStep(2)"
            label="Back"
          />
          <q-btn
            flat
            @click="$emit('view-all')"
            label="View All Operations"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { OPERATION_TYPES } from '../../../constants/operations'
import { getOperationTypeIcon, getOperationTypeLabel, getOperationTypeColor } from '../../../utils/operationParser'

export default {
  name: 'OperationWizard',
  props: {
    sampleValue: {
      type: [String, Number, Object, Array],
      default: null
    },
    fieldPath: {
      type: String,
      default: ''
    }
  },
  emits: ['select-operation', 'cancel', 'view-all'],
  setup (props, { emit }) {
    const currentStep = ref(1)
    const selectedGoal = ref(null)
    const selectedDataType = ref(null)

    const goals = [
      {
        value: 'extract',
        label: 'Extract Data',
        description: 'Pull specific information from text',
        icon: 'content_cut',
        color: 'blue'
      },
      {
        value: 'validate',
        label: 'Validate Data',
        description: 'Check if data meets criteria',
        icon: 'verified',
        color: 'green'
      },
      {
        value: 'transform',
        label: 'Transform Data',
        description: 'Convert data to different format',
        icon: 'transform',
        color: 'purple'
      },
      {
        value: 'combine',
        label: 'Combine Data',
        description: 'Join multiple values together',
        icon: 'merge',
        color: 'orange'
      },
      {
        value: 'calculate',
        label: 'Calculate',
        description: 'Perform math operations',
        icon: 'calculate',
        color: 'red'
      }
    ]

    const dataTypes = [
      {
        value: 'text',
        label: 'Text / String',
        description: 'Words, sentences, or any text',
        icon: 'text_fields',
        color: 'blue'
      },
      {
        value: 'number',
        label: 'Number',
        description: 'Numeric values or calculations',
        icon: 'pin',
        color: 'red'
      },
      {
        value: 'datetime',
        label: 'Date / Time',
        description: 'Timestamps or date values',
        icon: 'schedule',
        color: 'green'
      },
      {
        value: 'ip',
        label: 'IP Address',
        description: 'Network addresses',
        icon: 'lan',
        color: 'purple'
      },
      {
        value: 'array',
        label: 'Array / List',
        description: 'Multiple values',
        icon: 'list',
        color: 'orange'
      }
    ]

    const operationMatrix = {
      'extract-text': [
        {
          type: OPERATION_TYPES.REGEX,
          example: 'Extract email from "Contact: john@example.com"'
        },
        {
          type: OPERATION_TYPES.SPLIT,
          example: 'Extract "value" from "key=value"'
        }
      ],
      'extract-datetime': [
        {
          type: OPERATION_TYPES.EPOCHSECS_TO_DATETIME,
          example: 'Extract datetime from Unix timestamp'
        }
      ],
      'validate-ip': [
        {
          type: OPERATION_TYPES.ISIP,
          example: 'Check if "192.168.1.1" is valid IP'
        }
      ],
      'transform-text': [
        {
          type: OPERATION_TYPES.TOSTRING,
          example: 'Convert 123 to "123"'
        }
      ],
      'transform-datetime': [
        {
          type: OPERATION_TYPES.EPOCHSECS_TO_DATETIME,
          example: 'Convert 1634567890 to "2021-10-18 15:04:50"'
        },
        {
          type: OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME,
          example: 'Convert milliseconds to datetime'
        }
      ],
      'combine-text': [
        {
          type: OPERATION_TYPES.CONCAT,
          example: 'Join "Hello" + " " + "World" → "Hello World"'
        }
      ],
      'combine-array': [
        {
          type: OPERATION_TYPES.CONCATARRAY,
          example: 'Join ["a", "b", "c"] with "," → "a,b,c"'
        }
      ],
      'calculate-number': [
        {
          type: OPERATION_TYPES.ADD,
          example: '100 + 50 → 150'
        },
        {
          type: OPERATION_TYPES.SUBTRACT,
          example: '100 - 50 → 50'
        },
        {
          type: OPERATION_TYPES.MULTIPLY,
          example: '100 * 2 → 200'
        },
        {
          type: OPERATION_TYPES.DIVIDE,
          example: '100 / 2 → 50'
        }
      ]
    }

    const recommendedOperations = computed(() => {
      if (!selectedGoal.value || !selectedDataType.value) return []

      const key = `${selectedGoal.value}-${selectedDataType.value}`
      const operations = operationMatrix[key] || []

      return operations.map(op => ({
        type: op.type,
        label: getOperationTypeLabel(op.type),
        icon: getOperationTypeIcon(op.type),
        color: getOperationTypeColor(op.type),
        description: getOperationDescription(op.type),
        example: op.example
      }))
    })

    const goToStep = (step) => {
      currentStep.value = step
    }

    const selectGoal = (goal) => {
      selectedGoal.value = goal
    }

    const selectDataType = (dataType) => {
      selectedDataType.value = dataType
    }

    const selectOperation = (operation) => {
      emit('select-operation', {
        operation: operation.type,
        confidence: 0.85,
        reason: `Recommended for ${getGoalLabel()} on ${getDataTypeLabel()} data`,
        suggestedParams: getDefaultParams(operation.type)
      })
    }

    const getGoalLabel = () => {
      const goal = goals.find(g => g.value === selectedGoal.value)
      return goal ? goal.label.toLowerCase() : ''
    }

    const getDataTypeLabel = () => {
      const dataType = dataTypes.find(d => d.value === selectedDataType.value)
      return dataType ? dataType.label.toLowerCase() : ''
    }

    const getOperationDescription = (type) => {
      const descriptions = {
        [OPERATION_TYPES.REGEX]: 'Extract data using pattern matching',
        [OPERATION_TYPES.SPLIT]: 'Split text by delimiter',
        [OPERATION_TYPES.ISIP]: 'Validate IP address format',
        [OPERATION_TYPES.TOSTRING]: 'Convert value to string',
        [OPERATION_TYPES.EPOCHSECS_TO_DATETIME]: 'Convert Unix seconds to datetime',
        [OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME]: 'Convert Unix milliseconds to datetime',
        [OPERATION_TYPES.CONCAT]: 'Join multiple strings',
        [OPERATION_TYPES.CONCATARRAY]: 'Join array elements',
        [OPERATION_TYPES.ADD]: 'Add numbers',
        [OPERATION_TYPES.SUBTRACT]: 'Subtract numbers',
        [OPERATION_TYPES.MULTIPLY]: 'Multiply numbers',
        [OPERATION_TYPES.DIVIDE]: 'Divide numbers'
      }
      return descriptions[type] || ''
    }

    const getDefaultParams = (type) => {
      const defaults = {
        [OPERATION_TYPES.REGEX]: { pattern: '/(.+)/', captureGroup: 1 },
        [OPERATION_TYPES.SPLIT]: { delimiter: ',', index: 0 },
        [OPERATION_TYPES.EPOCHSECS_TO_DATETIME]: { format: 'yyyy-MM-dd HH:mm:ss' },
        [OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME]: { format: 'yyyy-MM-dd HH:mm:ss.SSS' },
        [OPERATION_TYPES.CONCAT]: { values: ['', ''] },
        [OPERATION_TYPES.CONCATARRAY]: { delimiter: ', ' },
        [OPERATION_TYPES.ADD]: { value: 0 },
        [OPERATION_TYPES.SUBTRACT]: { value: 0 },
        [OPERATION_TYPES.MULTIPLY]: { value: 1 },
        [OPERATION_TYPES.DIVIDE]: { value: 1 }
      }
      return defaults[type] || {}
    }

    return {
      currentStep,
      selectedGoal,
      selectedDataType,
      goals,
      dataTypes,
      recommendedOperations,
      goToStep,
      selectGoal,
      selectDataType,
      selectOperation,
      getGoalLabel,
      getDataTypeLabel
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-wizard {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 20px;
}

.wizard-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.wizard-title {
  flex: 1;

  .title-main {
    font-size: 18px;
    font-weight: 600;
    color: #E3F2FD;
    margin-bottom: 4px;
  }

  .title-sub {
    font-size: 13px;
    color: rgba(227, 242, 253, 0.7);
  }
}

.wizard-stepper {
  background: transparent;

  ::v-deep .q-stepper__header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }

  ::v-deep .q-stepper__step-inner {
    padding: 20px 0;
  }
}

.wizard-step-content {
  min-height: 300px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.option-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(33, 150, 243, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.selected {
    background: rgba(33, 150, 243, 0.15);
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
  }
}

.option-label {
  font-size: 15px;
  font-weight: 600;
  color: #E3F2FD;
  margin: 12px 0 8px;
}

.option-description {
  font-size: 12px;
  color: rgba(227, 242, 253, 0.6);
  line-height: 1.4;
}

.recommendation-message {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;

  .message-title {
    font-size: 14px;
    font-weight: 600;
    color: #FFD54F;
    margin-bottom: 4px;
  }

  .message-text {
    font-size: 13px;
    color: rgba(227, 242, 253, 0.8);

    strong {
      color: #2196F3;
    }
  }
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #2196F3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.recommended-operations {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.operation-suggestion {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 200ms;

  &:hover {
    background: rgba(33, 150, 243, 0.08);
    border-color: rgba(33, 150, 243, 0.5);
    transform: translateX(4px);
  }
}

.operation-info {
  flex: 1;
}

.operation-name {
  font-size: 15px;
  font-weight: 600;
  color: #E3F2FD;
  margin-bottom: 4px;
}

.operation-desc {
  font-size: 13px;
  color: rgba(227, 242, 253, 0.7);
  margin-bottom: 6px;
}

.operation-example {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #2196F3;
  font-style: italic;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .wizard-header {
    flex-direction: column;
    text-align: center;
  }

  .operation-suggestion {
    flex-direction: column;
    text-align: center;
  }
}
</style>
