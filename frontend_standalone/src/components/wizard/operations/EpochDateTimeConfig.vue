<template>
  <div class="epoch-datetime-config">
    <q-banner class="operation-info-banner q-mb-md">
      <template v-slot:avatar>
        <q-icon name="schedule" color="primary" />
      </template>
      <div class="text-body1">
        <strong>{{ operationTitle }} Operation</strong> - {{ operationDescription }}
      </div>
      <div class="text-body2 q-mt-sm">
        {{ operationInstructions }}
      </div>
    </q-banner>

    <div class="row q-col-gutter-md">
      <!-- Format Input -->
      <div class="col-12 col-md-6">
        <q-input
          v-model="localParams.format"
          label="Date Format *"
          hint="Format for the output date/time"
          outlined
          dense
          bg-color="white"
          @update:model-value="updateParams"
        >
          <template v-slot:append>
            <q-icon name="help_outline" color="grey">
              <q-tooltip max-width="300px">
                <div>Common format patterns:</div>
                <ul style="margin-top: 4px; margin-bottom: 0; padding-left: 16px;">
                  <li>yyyy-MM-dd HH:mm:ss</li>
                  <li>yyyy-MM-dd'T'HH:mm:ss</li>
                  <li>MM/dd/yyyy HH:mm:ss</li>
                  <li>dd/MM/yyyy HH:mm:ss</li>
                </ul>
              </q-tooltip>
            </q-icon>
          </template>
        </q-input>
      </div>

      <!-- Time Zone Selection (Optional) -->
      <div class="col-12 col-md-6">
        <q-select
          v-model="localParams.timezone"
          :options="timezoneOptions"
          label="Time Zone (Optional)"
          hint="Time zone to use for the conversion"
          outlined
          dense
          bg-color="white"
          @update:model-value="updateParams"
          emit-value
          map-options
        >
          <template v-slot:append>
            <q-icon name="help_outline" color="grey">
              <q-tooltip>
                Defaults to UTC if not specified
              </q-tooltip>
            </q-icon>
          </template>
        </q-select>
      </div>
    </div>

    <!-- Format presets -->
    <div class="format-presets q-mt-md">
      <div class="section-label">Format Presets:</div>
      <div class="format-chips">
        <q-chip
          v-for="format in formatPresets"
          :key="format.pattern"
          clickable
          outline
          color="deep-orange"
          text-color="white"
          @click="selectFormat(format.pattern)"
        >
          {{ format.name }}
        </q-chip>
      </div>
    </div>

    <div class="preview-section">
      <div class="preview-header">
        <q-icon name="visibility" class="q-mr-xs" />
        <span>Preview</span>
      </div>

      <div class="preview-content">
        <div class="preview-row">
          <div class="preview-label">Sample Input:</div>
          <div class="preview-value code">{{ displayInput }}</div>
        </div>
        <div class="preview-row">
          <div class="preview-label">Format:</div>
          <div class="preview-value code">{{ localParams.format || 'yyyy-MM-dd HH:mm:ss' }}</div>
        </div>
        <div class="preview-row">
          <div class="preview-label">Output:</div>
          <div class="preview-value code">{{ previewOutput }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { OPERATION_TYPES, DATETIME_FORMAT_PRESETS } from '../../../constants/operations'

export default {
  name: 'EpochDateTimeConfig',

  props: {
    modelValue: {
      type: Object,
      default: () => ({
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: null
      })
    },
    operationType: {
      type: String,
      required: true,
      validator: (value) => [
        OPERATION_TYPES.EPOCHSECS_TO_DATETIME,
        OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME,
        OPERATION_TYPES.EPOCHMICROS_TO_DATETIME,
        OPERATION_TYPES.LOCAL_DATETIME
      ].includes(value)
    },
    fieldPath: {
      type: String,
      required: true
    },
    sampleValue: {
      type: [String, Number, Object],
      default: null
    }
  },

  emits: ['update:modelValue'],

  setup (props, { emit }) {
    const localParams = ref({
      format: props.modelValue?.format || 'yyyy-MM-dd HH:mm:ss',
      timezone: props.modelValue?.timezone || null
    })

    // Common timezone options
    const timezoneOptions = [
      { label: 'UTC', value: 'UTC' },
      { label: 'Local', value: null },
      { label: 'US Eastern (EST/EDT)', value: 'America/New_York' },
      { label: 'US Central (CST/CDT)', value: 'America/Chicago' },
      { label: 'US Mountain (MST/MDT)', value: 'America/Denver' },
      { label: 'US Pacific (PST/PDT)', value: 'America/Los_Angeles' },
      { label: 'London (GMT/BST)', value: 'Europe/London' },
      { label: 'Paris (CET/CEST)', value: 'Europe/Paris' },
      { label: 'Tokyo (JST)', value: 'Asia/Tokyo' }
    ]

    // Format presets from constants
    const formatPresets = DATETIME_FORMAT_PRESETS.slice(0, 6)

    // Operation-specific metadata
    const operationTitle = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.EPOCHSECS_TO_DATETIME: return 'EpochSectoDateTime'
        case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME: return 'EpochMilliSectoDateTime'
        case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME: return 'EpochMicroSectoDateTime'
        case OPERATION_TYPES.LOCAL_DATETIME: return 'LocalDateTime'
        default: return ''
      }
    })

    const operationDescription = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.EPOCHSECS_TO_DATETIME: return 'Converts Unix timestamp (seconds) to DateTime'
        case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME: return 'Converts Unix timestamp (milliseconds) to DateTime'
        case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME: return 'Converts Unix timestamp (microseconds) to DateTime'
        case OPERATION_TYPES.LOCAL_DATETIME: return 'Gets the local date-time'
        default: return ''
      }
    })

    const operationInstructions = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.EPOCHSECS_TO_DATETIME: return 'Specify the format for converting Unix time (in seconds) to a formatted date string.'
        case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME: return 'Specify the format for converting Unix time (in milliseconds) to a formatted date string.'
        case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME: return 'Specify the format for converting Unix time (in microseconds) to a formatted date string.'
        case OPERATION_TYPES.LOCAL_DATETIME: return 'Specify the format for the current local date and time.'
        default: return ''
      }
    })

    // Update params and emit change event
    const updateParams = () => {
      emit('update:modelValue', {
        format: localParams.value.format,
        timezone: localParams.value.timezone
      })
    }

    // Select a predefined format
    const selectFormat = (format) => {
      localParams.value.format = format
      updateParams()
    }

    // Display values for preview
    const displayInput = computed(() => {
      if (props.operationType === OPERATION_TYPES.LOCAL_DATETIME) {
        return 'Current time (now)'
      }

      // Default sample values based on operation type
      let defaultValue
      switch (props.operationType) {
        case OPERATION_TYPES.EPOCHSECS_TO_DATETIME:
          defaultValue = 1637077622
          break
        case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME:
          defaultValue = 1637077622000
          break
        case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME:
          defaultValue = 1637077622000000
          break
        default:
          defaultValue = 0
      }

      const input = props.sampleValue !== null ? props.sampleValue : defaultValue
      return typeof input === 'number' ? input : 'Not a number'
    })

    // Compute a preview of the operation result
    const previewOutput = computed(() => {
      try {
        if (props.operationType === OPERATION_TYPES.LOCAL_DATETIME) {
          return formatDate(new Date(), localParams.value.format)
        }

        const input = props.sampleValue !== null ? props.sampleValue : getDefaultEpochValue()

        if (typeof input !== 'number') {
          return 'Not a numeric timestamp'
        }

        let timestamp
        switch (props.operationType) {
          case OPERATION_TYPES.EPOCHSECS_TO_DATETIME:
            timestamp = input * 1000 // Convert seconds to milliseconds
            break
          case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME:
            timestamp = input // Already in milliseconds
            break
          case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME:
            timestamp = Math.floor(input / 1000) // Convert microseconds to milliseconds
            break
          default:
            timestamp = 0
        }

        return formatDate(new Date(timestamp), localParams.value.format)
      } catch (error) {
        return `Error: ${error.message}`
      }
    })

    // Helper function to format a date
    const formatDate = (date, format) => {
      try {
        if (!format) format = 'yyyy-MM-dd HH:mm:ss'

        // Simple formatter that handles common patterns
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const seconds = date.getSeconds()
        const milliseconds = date.getMilliseconds()

        // Pad with zeros
        const pad = (num, len = 2) => String(num).padStart(len, '0')

        return format
          .replace(/yyyy/g, year)
          .replace(/yy/g, String(year).slice(-2))
          .replace(/MM/g, pad(month))
          .replace(/M/g, month)
          .replace(/dd/g, pad(day))
          .replace(/d/g, day)
          .replace(/HH/g, pad(hours))
          .replace(/H/g, hours)
          .replace(/mm/g, pad(minutes))
          .replace(/m/g, minutes)
          .replace(/ss/g, pad(seconds))
          .replace(/s/g, seconds)
          .replace(/SSS/g, pad(milliseconds, 3))
          .replace(/S/g, milliseconds)
      } catch (e) {
        return 'Error formatting date'
      }
    }

    // Helper to get default epoch value based on operation
    const getDefaultEpochValue = () => {
      switch (props.operationType) {
        case OPERATION_TYPES.EPOCHSECS_TO_DATETIME:
          return 1637077622
        case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME:
          return 1637077622000
        case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME:
          return 1637077622000000
        default:
          return 0
      }
    }

    // Watch for external prop changes
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        localParams.value = {
          format: newVal.format || 'yyyy-MM-dd HH:mm:ss',
          timezone: newVal.timezone || null
        }
      }
    }, { deep: true })

    return {
      localParams,
      timezoneOptions,
      formatPresets,
      operationTitle,
      operationDescription,
      operationInstructions,
      selectFormat,
      updateParams,
      displayInput,
      previewOutput
    }
  }
}
</script>

<style scoped>
.epoch-datetime-config {
  padding: 8px 0;
}

.operation-info-banner {
  background: rgba(33, 150, 243, 0.1) !important;
  border-left: 3px solid #2196F3 !important;
  color: rgba(227, 242, 253, 0.9) !important;

  ::v-deep .q-banner__avatar {
    color: #2196F3 !important;
  }

  ::v-deep .text-body1,
  ::v-deep .text-body2 {
    color: rgba(227, 242, 253, 0.9) !important;
  }

  ::v-deep strong {
    color: #2196F3;
  }
}

.section-label {
  font-size: 14px;
  color: #ff5722;
  font-weight: 500;
  margin-bottom: 8px;
}

.format-presets {
  margin: 16px 0;
}

.format-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-section {
  margin-top: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
}

.preview-header {
  font-weight: 500;
  color: #ff5722;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.preview-content {
  margin-top: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.preview-row {
  display: flex;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.preview-row:last-child {
  margin-bottom: 0;
}

.preview-label {
  width: 110px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.preview-value {
  flex: 1;
  color: #e3f2fd;
  word-break: break-all;
}

.code {
  font-family: 'Courier New', monospace;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .preview-row {
    flex-direction: column;
  }

  .preview-label {
    width: 100%;
    margin-bottom: 4px;
  }

  .preview-value {
    width: 100%;
  }
}
</style>
