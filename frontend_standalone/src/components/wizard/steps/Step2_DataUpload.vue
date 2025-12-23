<template>
  <div class="step-data-upload">
    <!-- Step Header -->
    <div class="step-header">
      <div class="step-icon">
        <q-icon name="cloud_upload" size="48px" class="text-primary" />
      </div>
      <div class="step-title-section">
        <h2 class="step-title">Sample Data Input</h2>
        <p class="step-subtitle">
          Provide representative JSON samples that your policy will process.
          This data will be analyzed to identify structure patterns and suggest optimal parsing rules.
        </p>
      </div>
    </div>

    <div class="step-content">
      <!-- Input Method Selection -->
      <q-card class="method-selection-card wizard-card">
        <q-card-section class="card-header">
          <div class="card-title">
            <q-icon name="input" class="q-mr-sm text-primary" />
            <span>Data Input Method</span>
          </div>
          <p class="card-description">
            Choose how you want to provide your sample JSON data.
          </p>
        </q-card-section>

        <q-card-section class="card-content">
          <q-tabs
            v-model="localInputMethod"
            dense
            class="input-method-tabs"
            active-color="primary"
            indicator-color="primary"
            @update:model-value="onInputMethodChange"
          >
            <q-tab name="manual" icon="edit" label="Manual Input" />
            <q-tab name="file" icon="upload_file" label="File Upload" />
            <q-tab name="multiple" icon="format_list_bulleted" label="Multiple Logs" />
          </q-tabs>

          <q-tab-panels
            v-model="localInputMethod"
            animated
            transition-prev="jump-up"
            transition-next="jump-down"
            class="input-panels"
            @update:model-value="onInputMethodChange"
          >
            <!-- Manual Input Tab -->
            <q-tab-panel name="manual" class="input-panel">
              <div class="panel-header">
                <q-icon name="edit" class="q-mr-sm text-primary" />
                <span class="text-h6">Paste JSON Data</span>
              </div>
              <p class="panel-description">
                Paste a single JSON object or array that represents your log data.
              </p>

              <div class="json-input-container">
                <q-input
                  v-model="localRawData"
                  type="textarea"
                  outlined
                  dense
                  placeholder="Paste your JSON data here..."
                  rows="12"
                  :error="hasValidationError"
                  :error-message="validationErrorMessage"
                  @input="onDataInput"
                  @blur="validateJsonData"
                  class="json-textarea"
                  :class="{ 'has-valid-json': isValidJson, 'has-invalid-json': hasValidationError }"
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      dense
                      icon="content_paste"
                      @click="pasteFromClipboard"
                      class="paste-btn text-primary"
                    >
                      <q-tooltip>Paste from clipboard</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>

                <!-- Format Helper -->
                <div class="format-actions">
                  <q-btn
                    flat
                    dense
                    icon="auto_fix_high"
                    label="Format JSON"
                    :disable="!isValidJson"
                    @click="formatJson"
                    class="format-btn text-primary"
                  />
                  <q-btn
                    flat
                    dense
                    icon="clear"
                    label="Clear"
                    @click="clearData"
                    class="clear-btn text-grey-7"
                  />
                </div>
              </div>
            </q-tab-panel>

            <!-- File Upload Tab -->
            <q-tab-panel name="file" class="input-panel">
              <div class="panel-header">
                <q-icon name="upload_file" class="q-mr-sm text-primary" />
                <span class="text-h6">Upload JSON File</span>
              </div>
              <p class="panel-description">
                Upload a .json file containing your sample data.
              </p>

              <div class="file-upload-area">
                <q-file
                  v-model="uploadedFile"
                  accept=".json"
                  outlined
                  dense
                  label="Choose JSON file"
                  hint="Maximum file size: 10MB"
                  :error="hasFileError"
                  :error-message="fileErrorMessage"
                  @input="onFileUpload"
                  class="file-input wizard-file-input q-mt-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" class="text-primary" />
                  </template>
                </q-file>

                <!-- Drag & Drop Zone -->
                <div
                  class="drop-zone"
                  :class="{ 'drag-over': isDragOver, 'has-file': uploadedFile }"
                  @drop="onFileDrop"
                  @dragover.prevent="isDragOver = true"
                  @dragleave="isDragOver = false"
                  @dragenter.prevent
                >
                  <div class="drop-zone-content">
                    <q-icon
                      :name="uploadedFile ? 'check_circle' : 'cloud_upload'"
                      size="48px"
                      :class="uploadedFile ? 'text-positive' : 'text-primary'"
                    />
                    <div class="drop-text">
                      <span v-if="!uploadedFile">
                        Drop your JSON file here or click to browse
                      </span>
                      <span v-else class="text-positive">
                        {{ uploadedFile.name }} uploaded successfully
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- Multiple Logs Tab -->
            <q-tab-panel name="multiple" class="input-panel">
              <div class="panel-header">
                <q-icon name="format_list_bulleted" class="q-mr-sm text-primary" />
                <span class="text-h6">Multiple JSON Objects</span>
              </div>
              <p class="panel-description">
                Paste multiple JSON objects, one per line. Each line should be a complete JSON object.
              </p>

              <div class="multiple-input-container">
                <q-input
                  v-model="localRawData"
                  type="textarea"
                  outlined
                  dense
                  placeholder='{"event": "log1"}\n{"event": "log2"}\n{"event": "log3"}'
                  rows="12"
                  :error="hasValidationError"
                  :error-message="validationErrorMessage"
                  @input="onDataInput"
                  @blur="validateJsonData"
                  class="json-textarea multiple-logs"
                  :class="{ 'has-valid-json': isValidJson, 'has-invalid-json': hasValidationError }"
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      dense
                      icon="content_paste"
                      @click="pasteFromClipboard"
                      class="paste-btn text-primary"
                    >
                      <q-tooltip>Paste from clipboard</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>

                <div class="line-count-info">
                  <q-chip
                    dense
                    color="primary"
                    text-color="white"
                    icon="format_list_numbered"
                  >
                    {{ lineCount }} lines
                  </q-chip>
                  <q-chip
                    v-if="validLogCount > 0"
                    dense
                    color="positive"
                    text-color="white"
                    icon="check"
                  >
                    {{ validLogCount }} valid JSON objects
                  </q-chip>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>

      <!-- Data Preview -->
      <transition name="slide-fade">
        <q-card v-if="sampleData.parsedData" class="data-preview-card wizard-card">
          <q-card-section class="card-header">
            <div class="card-title">
              <q-icon name="preview" class="q-mr-sm text-primary" />
              <span>Data Preview & Analysis</span>
            </div>
            <p class="card-description">
              Preview of your parsed JSON data with structural analysis.
            </p>
          </q-card-section>

          <q-card-section class="card-content">
            <!-- Data Statistics -->
            <div class="data-stats">
              <div class="stats-grid">
                <q-card flat bordered class="stat-card">
                  <q-card-section class="stat-content">
                    <div class="stat-value text-primary">{{ sampleData.dataStats.recordCount }}</div>
                    <div class="stat-label">Records</div>
                  </q-card-section>
                </q-card>

                <q-card flat bordered class="stat-card">
                  <q-card-section class="stat-content">
                    <div class="stat-value text-primary">{{ sampleData.dataStats.fieldCount }}</div>
                    <div class="stat-label">Unique Fields</div>
                  </q-card-section>
                </q-card>

                <q-card flat bordered class="stat-card">
                  <q-card-section class="stat-content">
                    <div class="stat-value text-primary">{{ sampleData.dataStats.nestedLevels }}</div>
                    <div class="stat-label">Nesting Levels</div>
                  </q-card-section>
                </q-card>

                <q-card flat bordered class="stat-card">
                  <q-card-section class="stat-content">
                    <div class="stat-value text-primary">{{ detectedArrays.length }}</div>
                    <div class="stat-label">Arrays Found</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Log Type Detection Banner -->
              <q-banner
                v-if="sampleData.logType"
                class="q-mt-md log-type-banner"
                :class="logTypeBannerClass"
                :text-color="logTypeBannerTextColor"
                rounded
              >
                <template v-slot:avatar>
                  <q-icon :name="logTypeIcon" :color="logTypeBannerIconColor" />
                </template>
                <div>
                  <div class="log-type-title">{{ logTypeTitle }}</div>
                  <div class="log-type-description">{{ logTypeDescription }}</div>
                </div>
              </q-banner>
            </div>

            <!-- Raw Data Preview -->
            <div class="raw-preview-section">
              <q-expansion-item
                icon="code"
                label="Raw Data Preview"
                header-class="text-h6"
                class="raw-expansion"
                expand-icon-class="text-primary"
              >
                <div class="raw-data-container">
                  <pre class="raw-json">{{ formattedPreviewData }}</pre>
                </div>
              </q-expansion-item>
            </div>

            <!-- Auto-detected Insights -->
            <div v-if="dataInsights.length" class="insights-section">
              <div class="section-header">
                <q-icon name="lightbulb" class="q-mr-sm text-amber" />
                <span class="text-h6">Detected Insights</span>
              </div>

              <div class="insights-list">
                <q-banner
                  v-for="(insight, index) in dataInsights"
                  :key="index"
                  :class="['insight-banner', 'q-mb-sm', `bg-${insight.color}-1`, `text-${insight.color}-9`]"
                  :icon="insight.icon"
                  dense
                  rounded
                >
                  <template v-slot:avatar>
                    <q-icon :name="insight.icon" :class="`text-${insight.color}`" />
                  </template>
                  {{ insight.message }}
                  <template v-if="insight.action" v-slot:action>
                    <q-btn
                      flat
                      dense
                      :label="insight.action.label"
                      @click="handleInsightAction(insight.action)"
                      :color="insight.color"
                    />
                  </template>
                </q-banner>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </transition>

      <!-- Validation Results -->
      <transition name="slide-fade">
        <q-card
          v-if="sampleData.validationResult.errors.length || sampleData.validationResult.warnings.length"
          class="validation-card wizard-card"
          :class="{'border-negative': sampleData.validationResult.errors.length}"
        >
          <q-card-section class="card-header" :class="{'bg-negative-1': sampleData.validationResult.errors.length}">
            <div class="card-title">
              <q-icon :name="sampleData.validationResult.errors.length ? 'error' : 'warning'" class="q-mr-sm"
                :class="sampleData.validationResult.errors.length ? 'text-negative' : 'text-warning'" />
              <span>Validation Results</span>
            </div>
          </q-card-section>

          <q-card-section class="card-content">
            <!-- Errors -->
            <div v-if="sampleData.validationResult.errors.length" class="validation-errors">
              <h6 class="text-negative q-mb-md">Errors</h6>
              <q-list dense>
                <q-item
                  v-for="(error, index) in sampleData.validationResult.errors"
                  :key="`error-${index}`"
                  class="error-item rounded-borders q-mb-xs"
                >
                  <q-item-section avatar>
                    <q-icon name="error" color="negative" />
                  </q-item-section>
                  <q-item-section>{{ error }}</q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Warnings -->
            <div v-if="sampleData.validationResult.warnings.length" class="validation-warnings q-mt-md">
              <h6 class="text-warning q-mb-md">Warnings</h6>
              <q-list dense>
                <q-item
                  v-for="(warning, index) in sampleData.validationResult.warnings"
                  :key="`warning-${index}`"
                  class="warning-item rounded-borders q-mb-xs"
                >
                  <q-item-section avatar>
                    <q-icon name="warning" color="warning" />
                  </q-item-section>
                  <q-item-section>{{ warning }}</q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </transition>
    </div>

    <!-- Step Actions -->
    <div class="step-actions">
      <q-btn
        flat
        icon="arrow_back"
        label="Previous"
        @click="$emit('prev-step')"
        class="wizard-btn wizard-btn--secondary"
        aria-label="Go to previous step"
      />

      <q-btn
        unelevated
        color="primary"
        icon-right="arrow_forward"
        label="Continue to Schema Rules"
        :disable="!isStepValid"
        @click="proceedToNext"
        class="wizard-btn wizard-btn--primary"
        aria-label="Continue to schema rules step"
      >
        <q-tooltip v-if="!isStepValid" anchor="top middle" self="bottom middle">
          Please provide valid JSON data before proceeding
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { DataProcessor } from '../../../services/wizard/dataProcessingService'

export default {
  name: 'Step2_DataUpload',

  data () {
    return {
      // Local copy of input method for v-model binding
      localInputMethod: 'manual',
      // Local copy of rawData to avoid direct Vuex state mutation
      localRawData: '',
      uploadedFile: null,
      isDragOver: false,
      fileErrorMessage: '',
      validationErrorMessage: '',
      processingData: false,
      validationTimer: null,
      lastProcessedRawData: null, // Track last processed JSON to detect changes
      lastProceededRawData: null, // Track the data when user last clicked "Next"
      clipboardPermissionState: null // Track clipboard permission state
    }
  },

  computed: {
    ...mapState('wizard', ['sampleData']),

    isValidJson () {
      return this.sampleData.validationResult.isValid && this.sampleData.parsedData
    },

    hasValidationError () {
      return this.sampleData.validationResult.errors.length > 0
    },

    hasFileError () {
      return Boolean(this.fileErrorMessage)
    },

    isStepValid () {
      return this.isValidJson && this.sampleData.rawData?.trim()
    },

    lineCount () {
      if (!this.localRawData) return 0
      return this.localRawData.trim().split('\n').filter(line => line.trim()).length
    },

    validLogCount () {
      if (this.sampleData.inputMethod !== 'multiple' || !this.localRawData) return 0

      const lines = this.localRawData.trim().split('\n').filter(line => line.trim())
      let validCount = 0

      lines.forEach(line => {
        try {
          JSON.parse(line)
          validCount++
        } catch (e) {
          // Invalid JSON line
        }
      })

      return validCount
    },

    formattedPreviewData () {
      if (!this.sampleData.parsedData) return ''

      const data = Array.isArray(this.sampleData.parsedData)
        ? this.sampleData.parsedData.slice(0, 3) // Show first 3 items
        : this.sampleData.parsedData

      return JSON.stringify(data, null, 2)
    },

    detectedArrays () {
      if (!this.sampleData.dataStructure) return []
      return DataProcessor.findArrayFields(this.sampleData.dataStructure)
    },

    dataInsights () {
      const insights = []

      // Show log type detection information
      if (this.sampleData.logType) {
        insights.push({
          icon: this.logTypeIcon,
          color: this.logType === 'single' ? 'info' : 'amber',
          message: `Log type detected: ${this.logTypeTitle}. ${this.logTypeDescription}`
        })
      }

      if (this.detectedArrays.length > 0) {
        insights.push({
          icon: 'data_array',
          color: 'info',
          message: `Found ${this.detectedArrays.length} array field(s) that may benefit from fanout processing.`,
          action: {
            label: 'Auto-select',
            type: 'select-arrays'
          }
        })
      }

      if (this.sampleData.dataStats.nestedLevels > 3) {
        insights.push({
          icon: 'warning',
          color: 'amber',
          message: 'Deep nesting detected. Consider flattening some structures for better performance.'
        })
      }

      // Use the service to find stringified JSON fields
      const stringifiedJsonFields = this.sampleData.parsedData
        ? DataProcessor.findStringifiedJsonFields(this.sampleData.parsedData)
        : []

      if (stringifiedJsonFields.length > 0) {
        insights.push({
          icon: 'auto_fix_high',
          color: 'green',
          message: `Found ${stringifiedJsonFields.length} field(s) containing stringified JSON that can be parsed.`,
          action: {
            label: 'Auto-select',
            type: 'select-json-strings'
          }
        })
      }

      return insights
    },

    // Log type display properties
    logType () {
      return this.sampleData.logType || 'unknown'
    },

    logTypeTitle () {
      switch (this.logType) {
        case 'single':
          return 'Single Log Entry'
        case 'multiline':
          return 'Multiple Log Entries'
        default:
          return 'Unknown Log Type'
      }
    },

    logTypeDescription () {
      switch (this.logType) {
        case 'single':
          return 'This appears to be a single JSON log entry or document.'
        case 'multiline':
          return 'This appears to be a file with multiple JSON log entries.'
        default:
          return 'Unable to determine the log format.'
      }
    },

    logTypeIcon () {
      switch (this.logType) {
        case 'single':
          return 'description'
        case 'multiline':
          return 'format_list_bulleted'
        default:
          return 'help_outline'
      }
    },

    logTypeBannerClass () {
      switch (this.logType) {
        case 'single':
          return 'bg-blue-2'
        case 'multiline':
          return 'bg-amber-2'
        default:
          return 'bg-grey-4'
      }
    },

    logTypeBannerTextColor () {
      switch (this.logType) {
        case 'single':
          return 'blue-10'
        case 'multiline':
          return 'amber-10'
        default:
          return 'grey-9'
      }
    },

    logTypeBannerIconColor () {
      switch (this.logType) {
        case 'single':
          return 'blue-7'
        case 'multiline':
          return 'amber-8'
        default:
          return 'grey-7'
      }
    }
  },

  watch: {
    // Sync localRawData with Vuex state when navigating back to this step
    'sampleData.rawData': {
      handler (newValue) {
        // Only update local if it's different and not empty (avoid overwriting user input)
        if (newValue !== this.localRawData) {
          this.localRawData = newValue || ''
        }
      },
      immediate: true
    },

    // Watch Vuex state change and sync to local state
    'sampleData.inputMethod': {
      handler (newValue, oldValue) {
        // Only clear data and update local state if the value has actually changed
        if (newValue !== oldValue) {
          // Update local state to match Vuex state
          this.localInputMethod = newValue

          // Use the value we received in the handler, not from sampleData
          // This avoids a circular reactivity issue
          this.$nextTick(() => {
            // Only clear data if switching away from the current method
            // Don't clear if we're just initializing or switching back to a method with existing data
            if (oldValue) {
              this.clearDataPreserveInputMethod()
            }
          })
        }
      }
    },

    // Watch local input method changes and sync to Vuex
    localInputMethod: {
      handler (newValue, oldValue) {
        if (newValue !== oldValue && newValue !== this.sampleData.inputMethod) {
          // Update Vuex state through mutation
          this.onInputMethodChange(newValue)
        }
      }
    },

    // Watch for uploaded file name changes to restore file display
    'sampleData.uploadedFileName': {
      handler (newValue) {
        if (newValue && this.sampleData.inputMethod === 'file' && !this.uploadedFile) {
          // Create a mock File object to display the file name in the UI
          this.uploadedFile = new File([], newValue, { type: 'application/json' })
        } else if (!newValue) {
          // Clear the uploaded file if the name was cleared
          this.uploadedFile = null
        }
      },
      immediate: true
    }
  },

  mounted () {
    // Initialize local input method from Vuex state
    this.localInputMethod = this.sampleData.inputMethod

    // Initialize localRawData from Vuex state
    this.localRawData = this.sampleData.rawData || ''

    // Restore uploaded file if user is returning to this step with file input method
    if (this.sampleData.inputMethod === 'file' && this.sampleData.uploadedFileName) {
      console.log('=== Step 2 Mounted: Restoring uploaded file ===')
      console.log('File name:', this.sampleData.uploadedFileName)

      // Create a mock File object to display in the UI
      // We can't recreate the actual File object, but we can create a representation
      this.uploadedFile = new File([], this.sampleData.uploadedFileName, { type: 'application/json' })
    }

    // Initialize lastProcessedRawData with current data if it exists
    if (this.sampleData.rawData && this.sampleData.parsedData) {
      this.lastProcessedRawData = this.sampleData.rawData
      // Also initialize lastProceededRawData when returning to this step
      // This assumes if user is coming back, they've already proceeded before
      this.lastProceededRawData = this.sampleData.rawData
      console.log('=== Step 2 Mounted: Initialized lastProcessedRawData and lastProceededRawData ===')

      // Only validate on mount if we have data (user is returning to this step)
      // Don't validate empty state to allow navigation back without errors
      this.$nextTick(() => {
        this.validateJsonData()
      })
    } else {
      console.log('=== Step 2 Mounted: No data present, skipping validation ===')
      // Clear any existing validation errors when mounted with no data
      this.validationErrorMessage = ''
    }

    // Check clipboard permissions
    this.checkClipboardPermission()

    // Auto-focus on input area
    this.$nextTick(() => {
      const textarea = this.$el.querySelector('textarea')
      if (textarea) {
        textarea.focus()

        // Add keyboard shortcut listeners to the textarea
        textarea.addEventListener('keydown', this.handleTextareaKeydown)
      }
    })
  },

  methods: {
    ...mapActions('wizard', ['processSampleData']),
    ...mapMutations('wizard', ['SET_SAMPLE_DATA', 'UPDATE_SCHEMA_RULES']),

    async onDataInput () {
      this.validationErrorMessage = ''
      // Update Vuex state with new value
      this.SET_SAMPLE_DATA({
        rawData: this.localRawData,
        inputMethod: this.sampleData.inputMethod
      })
      this.debounceValidation()
    },

    debounceValidation () {
      // Debounce validation to avoid excessive processing
      if (this.validationTimer) {
        clearTimeout(this.validationTimer)
      }
      this.validationTimer = setTimeout(() => {
        this.validateJsonData()
      }, 800)
    },

    async validateJsonData () {
      if (!this.localRawData?.trim()) {
        this.SET_SAMPLE_DATA({
          validationResult: {
            isValid: false,
            errors: [],
            warnings: []
          },
          parsedData: null,
          dataStructure: null
        })
        this.validationErrorMessage = ''
        // Don't emit step-invalid for empty data - allow navigation backwards
        // Only show error when user tries to proceed forward
        return
      }

      this.processingData = true

      try {
        // Check if raw data has actually changed
        const currentRawData = this.localRawData
        const hasDataChanged = this.lastProcessedRawData !== currentRawData

        console.log('=== Step 2: Validating JSON data ===')
        console.log('Current raw data length:', currentRawData?.length)
        console.log('Last processed data length:', this.lastProcessedRawData?.length)
        console.log('Has data changed?', hasDataChanged)

        // Use the DataProcessor service directly
        const result = await DataProcessor.processSampleData(this.localRawData, this.sampleData.inputMethod)

        console.log('=== Step 2: Data processing result ===')
        console.log('Detected logType:', result.logType)
        console.log('Input method:', this.sampleData.inputMethod)
        console.log('Record count:', result.dataStats.recordCount)

        // Update the store with results
        this.SET_SAMPLE_DATA({
          rawData: this.localRawData,
          inputMethod: this.sampleData.inputMethod,
          parsedData: result.parsedData,
          dataStructure: result.dataStructure,
          dataStats: result.dataStats,
          logType: result.logType, // Store the detected log type
          validationResult: result.validationResult
        })

        if (result.validationResult.errors.length > 0) {
          this.validationErrorMessage = result.validationResult.errors[0]
        }

        // Handle schema rules based on data change
        if (hasDataChanged && result.validationResult.isValid) {
          console.log('=== Step 2: Raw data has changed ===')
          console.log('Data will be checked against step configurations when user proceeds to next step')

          // Update last processed data (for validation tracking)
          this.lastProcessedRawData = currentRawData

          // NOTE: We do NOT reset steps here anymore.
          // Steps will be reset in proceedToNext() when user clicks "Next" button
          // This allows users to edit data without losing their Step 3+ configurations
          // until they actually proceed forward
        } else if (!hasDataChanged) {
          console.log('=== Step 2: Raw data unchanged - preserving all steps ===')
        }

        // Emit step validation status
        this.$emit(result.validationResult.isValid ? 'step-valid' : 'step-invalid')
      } catch (error) {
        console.error('Error validating JSON data:', error)
        this.validationErrorMessage = 'Failed to process JSON data'
        this.$emit('step-invalid')
      } finally {
        this.processingData = false
      }
    },

    async pasteFromClipboard () {
      try {
        // First, try using the Clipboard API based on permission state
        if (navigator.clipboard && navigator.clipboard.readText) {
          // If we have or might have permission, try the Clipboard API
          if (this.clipboardPermissionState === 'granted' ||
              this.clipboardPermissionState === 'prompt' ||
              this.clipboardPermissionState === 'unknown') {
            try {
              console.log('Attempting to read from clipboard with Clipboard API...')
              const text = await navigator.clipboard.readText()
              console.log('Successfully read from clipboard with Clipboard API')

              this.localRawData = text
              this.SET_SAMPLE_DATA({
                rawData: text,
                inputMethod: this.sampleData.inputMethod
              })
              this.validateJsonData()
              return
            } catch (clipboardError) {
              console.warn('Clipboard API access failed, falling back to execCommand:', clipboardError)
              // If permission was previously unknown, update it
              if (this.clipboardPermissionState === 'unknown') {
                this.clipboardPermissionState = 'denied'
              }
              // Fall through to the document.execCommand fallback
            }
          } else {
            console.log('Clipboard permission is denied, using fallback method')
          }
        } else {
          console.log('Clipboard API not available, using fallback method')
        }

        // Fallback to document.execCommand (deprecated but still works in most browsers)
        console.log('Attempting fallback paste method with execCommand...')
        const textArea = document.createElement('textarea')
        textArea.setAttribute('style', 'position: absolute; top: -9999px; left: -9999px')
        document.body.appendChild(textArea)
        textArea.focus()

        // Execute the paste command
        const successful = document.execCommand('paste')

        if (successful) {
          const text = textArea.value
          document.body.removeChild(textArea)
          console.log('Successfully pasted using execCommand fallback')

          this.localRawData = text
          this.SET_SAMPLE_DATA({
            rawData: text,
            inputMethod: this.sampleData.inputMethod
          })
          this.validateJsonData()
        } else {
          document.body.removeChild(textArea)
          throw new Error('execCommand paste failed')
        }
      } catch (error) {
        console.error('Paste operation failed:', error)

        // Show a more helpful message based on the error
        let message = 'Failed to paste from clipboard. '

        if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
          message += 'The application does not have permission to access the clipboard. '
        }

        message += 'Please use keyboard shortcut (Ctrl+V or Cmd+V) instead.'

        this.$q.notify({
          type: 'negative',
          message: message,
          timeout: 4000
        })
      }
    },

    formatJson () {
      if (!this.isValidJson) return

      try {
        const formatted = DataProcessor.formatJson(this.localRawData)
        this.localRawData = formatted
        this.SET_SAMPLE_DATA({
          rawData: formatted,
          inputMethod: this.sampleData.inputMethod
        })
      } catch (error) {
        console.error('Failed to format JSON:', error)
      }
    },

    clearData () {
      console.log('=== Step 2: Clearing data - resetting Step 3, 4, 5, and 6 ===')

      this.localRawData = ''

      this.SET_SAMPLE_DATA({
        rawData: '',
        parsedData: null,
        dataStructure: null,
        logType: null,
        uploadedFileName: null, // Clear stored file name
        validationResult: { isValid: false, errors: [], warnings: [] },
        dataStats: { recordCount: 0, fieldCount: 0, nestedLevels: 0 }
      })

      // Reset Step 3 selections when data is cleared
      this.UPDATE_SCHEMA_RULES({
        convertToJson: [],
        fanout: [],
        childfanouts: [],
        detectedStringifiedJson: [],
        manualSelections: []
      })

      // Reset Step 4, 5, and 6 when data is cleared
      this.$store.commit('wizard/RESET_FILTER_RULES')
      this.$store.commit('wizard/RESET_FIELD_MAPPINGS')
      this.$store.commit('wizard/RESET_SUBTRANSFORMS')

      // Also reset step status for steps 3, 4, 5, and 6
      this.$store.commit('wizard/RESET_STEP_STATUS', 2) // Step 3
      this.$store.commit('wizard/RESET_STEP_STATUS', 3) // Step 4
      this.$store.commit('wizard/RESET_STEP_STATUS', 4) // Step 5
      this.$store.commit('wizard/RESET_STEP_STATUS', 5) // Step 6

      // Reset last processed data
      this.lastProcessedRawData = null
      this.lastProceededRawData = null

      this.uploadedFile = null
      this.validationErrorMessage = ''
      this.fileErrorMessage = ''
      this.$emit('step-invalid')
    },

    clearDataPreserveInputMethod () {
      console.log('=== Step 2: Clearing data but preserving input method ===')

      // Store current input method so we don't overwrite it
      const currentInputMethod = this.sampleData.inputMethod

      this.localRawData = ''

      this.SET_SAMPLE_DATA({
        rawData: '',
        parsedData: null,
        dataStructure: null,
        logType: null,
        inputMethod: currentInputMethod, // Preserve the input method
        uploadedFileName: null, // Clear stored file name
        validationResult: { isValid: false, errors: [], warnings: [] },
        dataStats: { recordCount: 0, fieldCount: 0, nestedLevels: 0 }
      })

      // Reset Step 3 selections when data is cleared
      this.UPDATE_SCHEMA_RULES({
        convertToJson: [],
        fanout: [],
        childfanouts: [],
        detectedStringifiedJson: [],
        manualSelections: []
      })

      // Reset Step 4, 5, and 6 when data is cleared
      this.$store.commit('wizard/RESET_FILTER_RULES')
      this.$store.commit('wizard/RESET_FIELD_MAPPINGS')
      this.$store.commit('wizard/RESET_SUBTRANSFORMS')

      // Also reset step status for steps 3, 4, 5, and 6
      this.$store.commit('wizard/RESET_STEP_STATUS', 2) // Step 3
      this.$store.commit('wizard/RESET_STEP_STATUS', 3) // Step 4
      this.$store.commit('wizard/RESET_STEP_STATUS', 4) // Step 5
      this.$store.commit('wizard/RESET_STEP_STATUS', 5) // Step 6

      // Reset last processed data
      this.lastProcessedRawData = null
      this.lastProceededRawData = null

      this.uploadedFile = null
      this.validationErrorMessage = ''
      this.fileErrorMessage = ''
      this.$emit('step-invalid')
    },

    onInputMethodChange (newValue) {
      // Use the passed event value to ensure we're getting fresh data, not reading from sampleData
      // This ensures we're not reading from Vuex state and modifying it outside of a mutation
      if (newValue) {
        // Always update using Vuex mutation, even if the value appears the same
        // This ensures that if we got here from an event, we properly update the store
        this.SET_SAMPLE_DATA({
          inputMethod: newValue
        })
      }
    },

    async onFileUpload (file) {
      this.fileErrorMessage = ''

      if (!file) return

      try {
        // Validate file
        if (!file.name.toLowerCase().endsWith('.json')) {
          throw new Error('Please select a JSON file')
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error('File size must be less than 10MB')
        }

        // Read file content
        const fileContent = await this.readFileAsText(file)

        // Check if file content is empty or contains only whitespace
        if (!fileContent || fileContent.trim() === '') {
          // Instead of throwing an error immediately, let's set the file content and let
          // the validation system handle it to display in the validation results section
          this.localRawData = fileContent
          this.SET_SAMPLE_DATA({
            rawData: fileContent,
            inputMethod: 'file',
            uploadedFileName: file.name, // Store file name
            validationResult: {
              isValid: false,
              errors: ['The file is empty or contains only whitespace'],
              warnings: []
            }
          })

          // Also show an immediate error on the file upload field
          this.fileErrorMessage = 'The uploaded file is empty or contains only whitespace'
          this.$emit('step-invalid')
          return
        }

        this.localRawData = fileContent
        this.SET_SAMPLE_DATA({
          rawData: fileContent,
          inputMethod: 'file',
          uploadedFileName: file.name // Store file name for persistence
        })

        await this.validateJsonData()
      } catch (error) {
        this.fileErrorMessage = error.message
        this.uploadedFile = null
      }
    },

    onFileDrop (event) {
      event.preventDefault()
      this.isDragOver = false

      const files = event.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        this.uploadedFile = file
        this.onFileUpload(file)
      }
    },

    readFileAsText (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (event) => {
          resolve(event.target.result)
        }

        reader.onerror = () => {
          reject(new Error('Failed to read file'))
        }

        reader.readAsText(file)
      })
    },

    handleInsightAction (action) {
      switch (action.type) {
        case 'select-arrays': {
          // Auto-select array fields for fanout
          const arrayFields = DataProcessor.findArrayFields(this.sampleData.dataStructure)
          this.UPDATE_SCHEMA_RULES({ fanout: arrayFields })
          break
        }
        case 'select-json-strings': {
          // Auto-select stringified JSON fields
          if (this.sampleData.parsedData) {
            const jsonFields = DataProcessor.findStringifiedJsonFields(this.sampleData.parsedData)
            this.UPDATE_SCHEMA_RULES({ convertToJson: jsonFields })
          }
          break
        }
      }
    },

    async proceedToNext () {
      if (!this.isStepValid) {
        this.$emit('step-invalid', 'Please provide valid JSON data')
        return
      }

      // Check if data has changed since the last time user proceeded to next step
      const currentRawData = this.sampleData.rawData
      const hasDataChangedSinceLastProceed = this.lastProceededRawData !== currentRawData

      if (hasDataChangedSinceLastProceed) {
        console.log('=== Step 2: Data changed since last proceed - Resetting Steps 3, 4, 5, and 6 ===')
        console.log('Last proceeded data length:', this.lastProceededRawData?.length)
        console.log('Current data length:', currentRawData?.length)

        // Reset Step 3 (Schema Rules)
        this.UPDATE_SCHEMA_RULES({
          convertToJson: [],
          fanout: [],
          childfanouts: [],
          detectedStringifiedJson: [],
          manualSelections: [],
          parsedStringifiedJsonFields: {}
        })

        // Reset Step 4 (Filter Rules)
        this.$store.commit('wizard/RESET_FILTER_RULES')

        // Reset Step 5 (Field Mappings)
        this.$store.commit('wizard/RESET_FIELD_MAPPINGS')

        // Reset Step 6 (SubTransforms)
        this.$store.commit('wizard/RESET_SUBTRANSFORMS')

        // Reset step status for steps 3, 4, 5, and 6
        this.$store.commit('wizard/RESET_STEP_STATUS', 2) // Step 3
        this.$store.commit('wizard/RESET_STEP_STATUS', 3) // Step 4
        this.$store.commit('wizard/RESET_STEP_STATUS', 4) // Step 5
        this.$store.commit('wizard/RESET_STEP_STATUS', 5) // Step 6

        // Update the last proceeded data to current data
        this.lastProceededRawData = currentRawData

        console.log('=== Step 2: All subsequent steps have been reset ===')
      } else {
        console.log('=== Step 2: Data unchanged since last proceed - Preserving all steps ===')
      }

      // Mark step as valid and proceed
      this.$emit('step-valid')
      this.$emit('next-step')
    },

    handleTextareaKeydown (e) {
      // Handle Ctrl+V or Cmd+V (for macOS) manually if needed
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // Let the default paste behavior work, but log for debugging
        console.log('Paste keyboard shortcut detected')
      }
    },

    async checkClipboardPermission () {
      // Check if Clipboard API is available
      if (!navigator.clipboard) {
        this.clipboardPermissionState = 'unavailable'
        console.log('Clipboard API not available, will use fallback methods')
        return
      }

      try {
        // Check if we have permission to read from clipboard
        if (navigator.permissions && navigator.permissions.query) {
          const permission = await navigator.permissions.query({ name: 'clipboard-read' })
          this.clipboardPermissionState = permission.state

          // Add listener for permission changes
          permission.addEventListener('change', this.onPermissionChange)

          console.log('Clipboard permission state:', permission.state)
        } else {
          // If permissions API isn't available, we'll just try using the clipboard
          this.clipboardPermissionState = 'unknown'
          console.log('Permissions API not available, clipboard permission unknown')
        }
      } catch (error) {
        console.warn('Error checking clipboard permission:', error)
        this.clipboardPermissionState = 'error'
      }
    },

    onPermissionChange (event) {
      // Update permission state when it changes
      this.clipboardPermissionState = event.target.state
      console.log('Clipboard permission state changed to:', event.target.state)
    }
  },

  beforeDestroy () {
    if (this.validationTimer) {
      clearTimeout(this.validationTimer)
    }

    // Remove event listeners to prevent memory leaks
    const textarea = this.$el.querySelector('textarea')
    if (textarea) {
      textarea.removeEventListener('keydown', this.handleTextareaKeydown)
    }

    // Clean up clipboard permission listener if it exists
    if (navigator.permissions && this.clipboardPermissionState) {
      navigator.permissions.query({ name: 'clipboard-read' })
        .then(permission => {
          permission.removeEventListener('change', this.onPermissionChange)
        })
        .catch(error => console.warn('Failed to clean up permission listener:', error))
    }
  }
}
</script>

<style lang="scss" scoped>
.step-data-upload {
  max-width: 1000px;
  margin: 0 auto;
}

.step-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--q-color-grey-3);

  .dark-theme & {
    border-color: var(--q-color-grey-8);
  }
}

.step-icon {
  margin-right: 1.5rem;
  padding: 1rem;
  background: rgba(var(--q-primary-rgb), 0.1);
  border-radius: 12px;
}

.step-title-section {
  flex: 1;
}

.step-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--q-color-grey-9);
  margin: 0 0 0.5rem 0;

  .dark-theme & {
    color: var(--q-color-grey-2);
  }
}

.step-subtitle {
  font-size: 1.125rem;
  color: var(--q-color-grey-7);
  margin: 0;
  line-height: 1.5;

  .dark-theme & {
    color: var(--q-color-grey-4);
  }
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
}

.wizard-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 300ms ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  &.border-negative {
    border-left: 4px solid var(--q-negative);
  }

  .dark-theme & {
    background: var(--q-dark);
  }
}

.card-header {
  background: var(--q-color-grey-1);
  border-bottom: 1px solid var(--q-color-grey-3);

  &.bg-negative-1 {
    background: rgba(var(--q-negative-rgb), 0.05);
  }

  .dark-theme & {
    background: var(--q-color-grey-9);
    border-color: var(--q-color-grey-8);

    &.bg-negative-1 {
      background: rgba(var(--q-negative-rgb), 0.15);
    }
  }
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--q-color-grey-9);
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;

  .dark-theme & {
    color: var(--q-color-grey-2);
  }
}

.card-description {
  color: var(--q-color-grey-6);
  margin: 0;
  line-height: 1.4;

  .dark-theme & {
    color: var(--q-color-grey-5);
  }
}

.card-content {
  padding: 2rem;
}

.input-method-tabs {
  margin-bottom: 1.5rem;
}

.input-panels {
  background: transparent;
}

.input-panel {
  padding: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--q-color-grey-9);

  .dark-theme & {
    color: var(--q-color-grey-2);
  }
}

.panel-description {
  color: var(--q-color-grey-6);
  margin-bottom: 1.5rem;
  line-height: 1.4;

  .dark-theme & {
    color: var(--q-color-grey-5);
  }
}

.json-input-container,
.multiple-input-container {
  position: relative;
}

.json-textarea {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;

  &.has-valid-json .q-field__control {
    border-color: var(--q-positive);
    background: rgba(var(--q-positive-rgb), 0.05);
  }

  &.has-invalid-json .q-field__control {
    border-color: var(--q-negative);
    background: rgba(var(--q-negative-rgb), 0.05);
  }

  &.multiple-logs {
    .q-field__control {
      border: 2px dashed var(--q-color-grey-4);

      .dark-theme & {
        border-color: var(--q-color-grey-7);
      }
    }
  }
}

.format-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.format-btn,
.clear-btn {
  font-size: 12px;
}

.file-upload-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.drop-zone {
  border: 2px dashed var(--q-color-grey-4);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 300ms ease;
  cursor: pointer;
  background: var(--q-color-grey-1);

  &.drag-over {
    border-color: var(--q-primary);
    background: rgba(var(--q-primary-rgb), 0.04);
    transform: scale(1.02);
  }

  &.has-file {
    border-color: var(--q-positive);
    background: rgba(var(--q-positive-rgb), 0.04);
  }

  .dark-theme & {
    background: var(--q-color-grey-9);
    border-color: var(--q-color-grey-7);
  }
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.drop-text {
  font-size: 1rem;
  color: var(--q-color-grey-7);

  .dark-theme & {
    color: var(--q-color-grey-4);
  }
}

.line-count-info {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.data-stats {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-card {
  text-align: center;
  background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.05) 0%, rgba(var(--q-primary-rgb), 0.02) 100%);
  border-radius: 8px;
}

.stat-content {
  padding: 1.5rem 1rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--q-color-grey-6);
  margin-top: 0.25rem;

  .dark-theme & {
    color: var(--q-color-grey-5);
  }
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--q-color-grey-3);

  .dark-theme & {
    border-color: var(--q-color-grey-8);
  }
}

.raw-preview-section {
  margin-top: 2rem;
}

.raw-data-container {
  background: var(--q-color-grey-1);
  border-radius: 8px;
  padding: 1rem;

  .dark-theme & {
    background: var(--q-color-grey-9);
  }
}

.raw-json {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--q-color-grey-8);
  margin: 0;
  max-height: 300px;
  overflow-y: auto;

  .dark-theme & {
    color: var(--q-color-grey-3);
  }
}

.log-type-banner {
  border-radius: 8px;
  border: 1px solid;
  transition: all 0.2s ease-in-out;

  &.bg-blue-2 {
    background-color: #e3f2fd !important;
    border-color: rgba(33, 150, 243, 0.3) !important;
    color: #0d47a1 !important;
  }

  &.bg-amber-2 {
    background-color: #fff3e0 !important;
    border-color: rgba(255, 152, 0, 0.3) !important;
    color: #e65100 !important;
  }

  &.bg-grey-4 {
    border-color: rgba(0, 0, 0, 0.1);
  }

  .dark-theme & {
    &.bg-blue-2 {
      background-color: rgba(33, 150, 243, 0.15) !important;
      border-color: rgba(33, 150, 243, 0.4) !important;
      color: #90caf9 !important;
    }

    &.bg-amber-2 {
      background-color: rgba(255, 152, 0, 0.15) !important;
      border-color: rgba(255, 152, 0, 0.4) !important;
      color: #ffcc80 !important;
    }

    &.bg-grey-4 {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
}

/* Force text color on log type banner content */
.log-type-banner ::v-deep .q-banner__content,
.log-type-banner ::v-deep .q-banner__avatar,
.log-type-banner.bg-blue-2,
.log-type-banner.bg-amber-2 {
  color: inherit !important;
}

.log-type-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: inherit !important;
}

.log-type-description {
  font-size: 0.875rem;
  opacity: 0.9;
  color: inherit !important;
}

.insights-section {
  margin-top: 2rem;
}

.insights-list {
  margin-top: 1rem;
}

.insight-banner {
  border-radius: 8px;
}

/* Force insight banners to render dark background and white text in this component.
   Use deep selectors to override Quasar's default .q-banner background. */
.insights-list ::v-deep .insight-banner.q-banner,
.insights-list ::v-deep .insight-banner.q-banner.q-banner--dense {
  background: var(--card-bg-dark, #0f0f10) !important;
  color: var(--text-color-dark, #ffffff) !important;
  border: 1px solid rgba(255,255,255,0.04) !important;
  box-shadow: none !important;
  min-height: 40px !important;
  padding: 8px 12px !important;
}

/* Ensure banner content and avatar inherit the new text color */
.insights-list ::v-deep .insight-banner.q-banner .q-banner__content,
.insights-list ::v-deep .insight-banner.q-banner .q-banner__avatar,
.insights-list ::v-deep .insight-banner.q-banner .q-banner__text {
  color: inherit !important;
}

/* Make banner icons and action buttons visible on dark background */
.insights-list ::v-deep .insight-banner.q-banner .q-icon,
.insights-list ::v-deep .insight-banner.q-banner .q-btn {
  color: var(--text-color-dark, #ffffff) !important;
}

/* When Quasar color utility classes (bg-*-1 / text-*-9) are present, prefer our dark card look
   but keep the accent color for the small icon (make icon use the insight color while text stays white) */
.insights-list ::v-deep .insight-banner.q-banner[ class*="bg-"] .q-icon {
  /* keep icon accent but ensure visibility */
  filter: brightness(1.1) !important;
}

/* Tighter spacing for dense banners */
.insights-list ::v-deep .insight-banner.q-banner.q-banner--dense {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  min-height: 36px !important;
}

/* Validation errors/warnings styling */
.error-item {
  background-color: rgba(var(--q-negative-rgb), 0.05);
}

.warning-item {
  background-color: rgba(var(--q-warning-rgb), 0.05);
}

/* Ensure file input control uses blue border and white text (stronger overrides) */
.file-input ::v-deep .q-file__control,
.wizard-file-input ::v-deep .q-file__control,
.file-input ::v-deep .q-file__control .q-field__control,
.wizard-file-input ::v-deep .q-file__control .q-field__control,
.file-input ::v-deep .q-file__control .q-field__native,
.wizard-file-input ::v-deep .q-file__control .q-field__native,
.file-input ::v-deep .q-file__control .q-field__label,
.wizard-file-input ::v-deep .q-file__control .q-field__label,
.file-input ::v-deep .q-file__control .q-field__bottom,
.wizard-file-input ::v-deep .q-file__control .q-field__bottom,
.file-input ::v-deep .q-file__control .q-field__hint,
.wizard-file-input ::v-deep .q-file__control .q-field__hint,
.file-input ::v-deep .q-file__control .q-field__message,
.wizard-file-input ::v-deep .q-file__control .q-field__message {
  border: 1px solid var(--q-color-primary, var(--q-primary)) !important;
  border-color: var(--q-color-primary, var(--q-primary)) !important;
  color: #ffffff !important;
  background: transparent !important;
}

/* Ensure blue border remains when the file control is NOT focused */
.file-input:not(.q-file--focused) ::v-deep .q-file__control,
.wizard-file-input:not(.q-file--focused) ::v-deep .q-file__control,
.file-input:not(.q-file--focused) ::v-deep .q-field__control,
.wizard-file-input:not(.q-file--focused) ::v-deep .q-field__control {
  border: 1px solid var(--q-color-primary, #02b7fe) !important;
  border-color: var(--q-color-primary, #02b7fe) !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* Also ensure the outlined pseudo-elements keep the blue border when unfocused */
.file-input:not(.q-file--focused) ::v-deep .q-field__control::before,
.wizard-file-input:not(.q-file--focused) ::v-deep .q-field__control::before,
.file-input:not(.q-file--focused) ::v-deep .q-field__control::after,
.wizard-file-input:not(.q-file--focused) ::v-deep .q-field__control::after,
.file-input:not(.q-file--focused) ::v-deep .q-file__control::before,
.wizard-file-input:not(.q-file--focused) ::v-deep .q-file__control::before,
.file-input:not(.q-file--focused) ::v-deep .q-file__control::after,
.wizard-file-input:not(.q-file--focused) ::v-deep .q-file__control::after {
  border-color: var(--q-color-primary, #02b7fe) !important;
  border: 1px solid var(--q-color-primary, #02b7fe) !important;
  box-shadow: none !important;
}

/* Make sure label and native text remain white and visible */
.file-input:not(.q-file--focused) ::v-deep .q-field__label,
.wizard-file-input:not(.q-file--focused) ::v-deep .q-field__label,
.file-input:not(.q-file--focused) ::v-deep .q-field__native,
.wizard-file-input:not(.q-file--focused) ::v-deep .q-field__native {
  color: #ffffff !important;
}

/* Focused state: stronger blue glow */
.file-input ::v-deep .q-file--focused .q-file__control,
.wizard-file-input ::v-deep .q-file--focused .q-file__control,
.file-input ::v-deep .q-file--focused .q-field__control,
.wizard-file-input ::v-deep .q-file--focused .q-field__control {
  box-shadow: 0 0 0 6px rgba(2,183,254,0.12) !important; /* use primary color */
  outline: none !important;
}

/* Ensure the bottom/hint/message area of the file field renders white (overrides Quasar computed styles) */
.file-input ::v-deep .q-field__bottom,
.wizard-file-input ::v-deep .q-field__bottom,
.file-input ::v-deep .q-file__bottom,
.wizard-file-input ::v-deep .q-file__bottom {
  color: #ffffff !important;
  opacity: 1 !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
}
</style>
