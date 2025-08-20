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
            <q-icon name="input" class="q-mr-sm" />
            Data Input Method
          </div>
          <p class="card-description">
            Choose how you want to provide your sample JSON data.
          </p>
        </q-card-section>

        <q-card-section class="card-content">
          <q-tabs
            v-model="sampleData.inputMethod"
            dense
            class="input-method-tabs"
            active-color="primary"
            indicator-color="primary"
            @input="onInputMethodChange"
          >
            <q-tab name="manual" icon="edit" label="Manual Input" />
            <q-tab name="file" icon="upload_file" label="File Upload" />
            <q-tab name="multiple" icon="format_list_bulleted" label="Multiple Logs" />
          </q-tabs>

          <q-tab-panels
            v-model="sampleData.inputMethod"
            animated
            transition-prev="jump-up"
            transition-next="jump-down"
            class="input-panels"
          >
            <!-- Manual Input Tab -->
            <q-tab-panel name="manual" class="input-panel">
              <div class="panel-header">
                <q-icon name="edit" class="q-mr-sm" />
                <span class="text-h6">Paste JSON Data</span>
              </div>
              <p class="panel-description">
                Paste a single JSON object or array that represents your log data.
              </p>

              <div class="json-input-container">
                <q-input
                  v-model="sampleData.rawData"
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
                      class="paste-btn"
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
                    class="format-btn"
                  />
                  <q-btn
                    flat
                    dense
                    icon="clear"
                    label="Clear"
                    @click="clearData"
                    class="clear-btn"
                  />
                </div>
              </div>
            </q-tab-panel>

            <!-- File Upload Tab -->
            <q-tab-panel name="file" class="input-panel">
              <div class="panel-header">
                <q-icon name="upload_file" class="q-mr-sm" />
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
                  class="file-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
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
                      :class="uploadedFile ? 'text-positive' : 'text-grey-5'"
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
                <q-icon name="format_list_bulleted" class="q-mr-sm" />
                <span class="text-h6">Multiple JSON Objects</span>
              </div>
              <p class="panel-description">
                Paste multiple JSON objects, one per line. Each line should be a complete JSON object.
              </p>

              <div class="multiple-input-container">
                <q-input
                  v-model="sampleData.rawData"
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
                />

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
              <q-icon name="preview" class="q-mr-sm" />
              Data Preview & Analysis
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
                    <div class="stat-value">{{ sampleData.dataStats.recordCount }}</div>
                    <div class="stat-label">Records</div>
                  </q-card-section>
                </q-card>

                <q-card flat bordered class="stat-card">
                  <q-card-section class="stat-content">
                    <div class="stat-value">{{ sampleData.dataStats.fieldCount }}</div>
                    <div class="stat-label">Unique Fields</div>
                  </q-card-section>
                </q-card>

                <q-card flat bordered class="stat-card">
                  <q-card-section class="stat-content">
                    <div class="stat-value">{{ sampleData.dataStats.nestedLevels }}</div>
                    <div class="stat-label">Nesting Levels</div>
                  </q-card-section>
                </q-card>

                <q-card flat bordered class="stat-card">
                  <q-card-section class="stat-content">
                    <div class="stat-value">{{ detectedArrays.length }}</div>
                    <div class="stat-label">Arrays Found</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- JSON Structure Tree -->
            <div class="structure-section">
              <div class="section-header">
                <q-icon name="account_tree" class="q-mr-sm" />
                <span class="text-h6">JSON Structure</span>
                <q-space />
                <q-btn-group flat dense>
                  <q-btn
                    flat
                    dense
                    icon="unfold_more"
                    label="Expand All"
                    @click="expandAllNodes"
                    size="sm"
                  />
                  <q-btn
                    flat
                    dense
                    icon="unfold_less"
                    label="Collapse All"
                    @click="collapseAllNodes"
                    size="sm"
                  />
                </q-btn-group>
              </div>

              <div class="json-tree-container">
                <JsonTreeViewer
                  :data="sampleData.dataStructure"
                  :expanded-nodes="expandedNodes"
                  @toggle-node="toggleNode"
                  @select-field="onFieldSelect"
                  class="json-tree"
                />
              </div>
            </div>

            <!-- Raw Data Preview -->
            <div class="raw-preview-section">
              <q-expansion-item
                icon="code"
                label="Raw Data Preview"
                header-class="text-h6"
                class="raw-expansion"
              >
                <div class="raw-data-container">
                  <pre class="raw-json">{{ formattedPreviewData }}</pre>
                </div>
              </q-expansion-item>
            </div>

            <!-- Auto-detected Insights -->
            <div v-if="dataInsights.length" class="insights-section">
              <div class="section-header">
                <q-icon name="lightbulb" class="q-mr-sm" />
                <span class="text-h6">Detected Insights</span>
              </div>

              <div class="insights-list">
                <q-banner
                  v-for="(insight, index) in dataInsights"
                  :key="index"
                  :icon="insight.icon"
                  :color="insight.color"
                  class="insight-banner q-mb-sm"
                >
                  <template v-slot:avatar>
                    <q-icon :name="insight.icon" />
                  </template>
                  {{ insight.message }}
                  <template v-if="insight.action" v-slot:action>
                    <q-btn
                      flat
                      dense
                      :label="insight.action.label"
                      @click="handleInsightAction(insight.action)"
                      class="text-white"
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
        >
          <q-card-section class="card-header">
            <div class="card-title">
              <q-icon name="rule" class="q-mr-sm" />
              Validation Results
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
                  class="error-item"
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
                  class="warning-item"
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
      />

      <q-btn
        unelevated
        color="primary"
        icon-right="arrow_forward"
        label="Continue to Schema Rules"
        :disable="!isStepValid"
        @click="proceedToNext"
        class="wizard-btn wizard-btn--primary"
      >
        <q-tooltip v-if="!isStepValid" anchor="top middle" self="bottom middle">
          Please provide valid JSON data to continue
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import JsonTreeViewer from '../components/JsonTreeViewer.vue'

export default {
  name: 'Step2_DataUpload',

  components: {
    JsonTreeViewer
  },

  data () {
    return {
      uploadedFile: null,
      isDragOver: false,
      expandedNodes: new Set(),
      selectedFields: new Set(),
      fileErrorMessage: '',
      validationErrorMessage: '',
      processingData: false
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
      if (!this.sampleData.rawData) return 0
      return this.sampleData.rawData.trim().split('\n').filter(line => line.trim()).length
    },

    validLogCount () {
      if (this.sampleData.inputMethod !== 'multiple' || !this.sampleData.rawData) return 0

      const lines = this.sampleData.rawData.trim().split('\n').filter(line => line.trim())
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
      return this.findArrayFields(this.sampleData.dataStructure)
    },

    dataInsights () {
      const insights = []

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
          color: 'warning',
          message: 'Deep nesting detected. Consider flattening some structures for better performance.'
        })
      }

      const stringifiedJsonFields = this.findStringifiedJsonFields(this.sampleData.parsedData)
      if (stringifiedJsonFields.length > 0) {
        insights.push({
          icon: 'auto_fix_high',
          color: 'positive',
          message: `Found ${stringifiedJsonFields.length} field(s) containing stringified JSON that can be parsed.`,
          action: {
            label: 'Auto-select',
            type: 'select-json-strings'
          }
        })
      }

      return insights
    }
  },

  watch: {
    'sampleData.inputMethod' () {
      // Clear data when switching methods
      this.clearData()
    }
  },

  mounted () {
    // Auto-focus on input area
    this.$nextTick(() => {
      const textarea = this.$el.querySelector('textarea')
      if (textarea) textarea.focus()
    })
  },

  methods: {
    ...mapActions('wizard', ['processSampleData']),
    ...mapMutations('wizard', ['SET_SAMPLE_DATA', 'UPDATE_SCHEMA_RULES']),

    async onDataInput () {
      this.validationErrorMessage = ''
      this.debounceValidation()
    },

    debounceValidation () {
      // Debounce validation to avoid excessive processing
      clearTimeout(this.validationTimer)
      this.validationTimer = setTimeout(() => {
        this.validateJsonData()
      }, 800)
    },

    async validateJsonData () {
      if (!this.sampleData.rawData?.trim()) {
        this.SET_SAMPLE_DATA({
          validationResult: { isValid: false, errors: [], warnings: [] },
          parsedData: null,
          dataStructure: null
        })
        return
      }

      this.processingData = true

      try {
        const result = await this.processSampleData({
          rawData: this.sampleData.rawData,
          inputMethod: this.sampleData.inputMethod
        })

        if (result.errors.length > 0) {
          this.validationErrorMessage = result.errors[0]
        }

        // Emit step validation status
        this.$emit('step-valid', result.isValid)
      } catch (error) {
        console.error('Error validating JSON data:', error)
        this.validationErrorMessage = 'Failed to process JSON data'
      } finally {
        this.processingData = false
      }
    },

    async pasteFromClipboard () {
      try {
        const text = await navigator.clipboard.readText()
        this.SET_SAMPLE_DATA({
          rawData: text,
          inputMethod: this.sampleData.inputMethod
        })
        this.validateJsonData()
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to paste from clipboard'
        })
      }
    },

    formatJson () {
      if (!this.isValidJson) return

      try {
        const formatted = JSON.stringify(this.sampleData.parsedData, null, 2)
        this.SET_SAMPLE_DATA({
          rawData: formatted,
          inputMethod: this.sampleData.inputMethod
        })
      } catch (error) {
        console.error('Failed to format JSON:', error)
      }
    },

    clearData () {
      this.SET_SAMPLE_DATA({
        rawData: '',
        parsedData: null,
        dataStructure: null,
        validationResult: { isValid: false, errors: [], warnings: [] },
        dataStats: { recordCount: 0, fieldCount: 0, nestedLevels: 0 }
      })
      this.uploadedFile = null
      this.validationErrorMessage = ''
      this.fileErrorMessage = ''
      this.$emit('step-invalid')
    },

    onInputMethodChange () {
      this.SET_SAMPLE_DATA({
        inputMethod: this.sampleData.inputMethod
      })
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

        this.SET_SAMPLE_DATA({
          rawData: fileContent,
          inputMethod: 'file'
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

    // Tree navigation methods
    expandAllNodes () {
      this.expandedNodes = new Set(this.getAllNodePaths())
    },

    collapseAllNodes () {
      this.expandedNodes.clear()
    },

    toggleNode (path) {
      if (this.expandedNodes.has(path)) {
        this.expandedNodes.delete(path)
      } else {
        this.expandedNodes.add(path)
      }
    },

    onFieldSelect (path) {
      if (this.selectedFields.has(path)) {
        this.selectedFields.delete(path)
      } else {
        this.selectedFields.add(path)
      }
    },

    getAllNodePaths () {
      // Implementation would traverse the data structure and return all paths
      return []
    },

    findArrayFields (structure, parentPath = '') {
      // Find fields that contain arrays
      const arrays = []
      // Implementation would recursively search for array fields
      return arrays
    },

    findStringifiedJsonFields (data) {
      // Find fields that contain stringified JSON
      const jsonFields = []
      // Implementation would search for string fields containing valid JSON
      return jsonFields
    },

    handleInsightAction (action) {
      switch (action.type) {
        case 'select-arrays': {
          // Auto-select array fields for fanout
          const arrayFields = this.detectedArrays
          this.UPDATE_SCHEMA_RULES({ fanout: arrayFields })
          break
        }
        case 'select-json-strings': {
          // Auto-select stringified JSON fields
          const jsonFields = this.findStringifiedJsonFields(this.sampleData.parsedData)
          this.UPDATE_SCHEMA_RULES({ convertToJson: jsonFields })
          break
        }
      }
    },

    async proceedToNext () {
      if (!this.isStepValid) {
        this.$emit('step-invalid', 'Please provide valid JSON data')
        return
      }

      // Mark step as valid and proceed
      this.$emit('step-valid')
      this.$emit('next-step')
    }
  },

  beforeDestroy () {
    if (this.validationTimer) {
      clearTimeout(this.validationTimer)
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
  background: rgba(25, 118, 210, 0.1);
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
    transform: translateY(-2px);
  }

  .dark-theme & {
    background: var(--q-dark);
  }
}

.card-header {
  background: var(--q-color-grey-1);
  border-bottom: 1px solid var(--q-color-grey-3);

  .dark-theme & {
    background: var(--q-color-grey-9);
    border-color: var(--q-color-grey-8);
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
    background: rgba(33, 186, 69, 0.02);
  }

  &.has-invalid-json .q-field__control {
    border-color: var(--q-negative);
    background: rgba(244, 67, 54, 0.02);
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
    background: rgba(25, 118, 210, 0.04);
    transform: scale(1.02);
  }

  &.has-file {
    border-color: var(--q-positive);
    background: rgba(33, 186, 69, 0.04);
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
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%);
  border-radius: 8px;
}

.stat-content {
  padding: 1.5rem 1rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--q-primary);
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

.structure-section {
  margin-bottom: 2rem;
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

.json-tree-container {
  border: 1px solid var(--q-color-grey-3);
  border-radius: 8px;
  background: white;
  max-height: 400px;
  overflow-y: auto;

  .dark-theme & {
    background: var(--q-dark);
    border-color: var(--q-color-grey-8);
  }
}

.json-tree {
  padding: 1rem;
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

.insights-section {
  margin-top: 2rem;
}

.insights-list {
  margin-top: 1rem;
}

.insight-banner {
  border-radius: 8px;
}

.validation-card {
  border-left: 4px solid var(--q-negative);
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid var(--q-color-grey-3);

  .dark-theme & {
    border-color: var(--q-color-grey-8);
  }
}

.wizard-btn {
  border-radius: 6px;
  font-weight: 500;
  padding: 8px 16px;
  transition: all 200ms ease;

  &--primary {
    box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);

    &:hover:not(:disabled) {
      box-shadow: 0 4px 8px rgba(25, 118, 210, 0.4);
      transform: translateY(-1px);
    }
  }

  &--secondary {
    &:hover:not(:disabled) {
      background: rgba(25, 118, 210, 0.04);
    }
  }
}

// Transition animations
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 400ms ease;
}

.slide-fade-enter {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

// Responsive design
@media (max-width: 768px) {
  .step-header {
    flex-direction: column;
    text-align: center;

    .step-icon {
      align-self: center;
      margin-right: 0;
      margin-bottom: 1rem;
    }
  }

  .step-title {
    font-size: 1.5rem;
  }

  .step-subtitle {
    font-size: 1rem;
  }

  .card-content {
    padding: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .json-textarea {
    font-size: 12px;
  }
}
</style>
