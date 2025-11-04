<template>
  <div class="step-schema-config">
    <div class="step-header">
      <div class="step-icon">
        <q-icon name="schema" size="48px" class="text-primary" />
      </div>
      <div class="step-title-section">
        <h2 class="step-title">Schema Rule Configuration</h2>
        <p class="step-subtitle">
          Configure rules for JSON parsing and array processing (fanout).
          These rules are optional but help optimize data processing.
        </p>
      </div>
    </div>

    <div class="step-content">
      <!-- Convert to JSON Card -->
      <q-card class="wizard-card convert-json-card">
        <q-card-section class="card-header">
          <div class="card-title">
            <q-icon name="code" class="q-mr-sm" />
            Convert to JSON
          </div>
        </q-card-section>

        <q-card-section>
          <div v-if="convertToJsonCandidates.length === 0" class="no-candidates">
            <q-icon name="info" size="48px" color="grey-6" />
            <p class="no-candidates-message">
              No stringified JSON fields detected in your sample data.
              This step can be skipped.
            </p>
          </div>

          <div v-else class="json-fields-selection">
            <div class="selection-header">
              <h6>Available Fields ({{ convertToJsonCandidates.length }})</h6>
              <q-chip color="primary" text-color="white" icon="info">
                Select fields to convert
              </q-chip>
            </div>

            <q-list bordered separator class="json-field-list">
              <q-item
                v-for="field in convertToJsonCandidates"
                :key="field"
                tag="label"
                v-ripple
              >
                <q-item-section side>
                  <!-- Checkbox uses array binding via v-model; label rendered in sibling section -->
                  <q-checkbox
                    v-model="selectedConvertToJsonFields"
                    :val="field"
                    color="primary"
                    keep-color
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ field }}</q-item-label>
                  <q-item-label caption>Contains stringified JSON</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="primary">string</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div v-if="selectedConvertToJsonFields.length > 0" class="selected-fields">
            <div class="selection-header q-mt-md">
              <h6>Selected Fields ({{ selectedConvertToJsonFields.length }})</h6>
              <q-btn
                flat
                dense
                color="negative"
                icon="clear_all"
                label="Clear All"
                @click="clearAllSelections('convertToJson')"
                size="sm"
              />
            </div>

            <q-list bordered separator>
              <q-item v-for="field in selectedConvertToJsonFields" :key="field">
                <q-item-section>
                  <q-item-label>{{ field }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="removeFieldSelection(field, 'convertToJson')"
                  >
                    <q-tooltip>Remove field</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
      </q-card>

      <!-- Fanout Configuration Card -->
      <q-card class="wizard-card fanout-card q-mt-lg">
        <q-card-section class="card-header">
          <div class="card-title">
            <q-icon name="account_tree" class="q-mr-sm" />
            Array Fanout Processing
          </div>
          <p class="card-description">
            Select JSON array elements that should be processed individually (fanout).
          </p>
        </q-card-section>

        <q-card-section>
          <div v-if="fanoutCandidates.length === 0" class="no-candidates">
            <q-icon name="info" size="48px" color="grey-6" />
            <p class="no-candidates-message">
              No array fields detected in your sample data.
              This step can be skipped.
            </p>
          </div>

          <div v-else class="json-structure-view">
            <div class="structure-header">
              <div class="structure-header-left">
                <h6>JSON Structure ({{ fanoutCandidates.length }} arrays found)</h6>
                <q-chip
                  v-if="isMultiLineLog"
                  color="amber"
                  text-color="white"
                  icon="format_list_bulleted"
                  size="sm"
                  class="q-ml-sm"
                >
                  <q-tooltip>Array & JSON candidates derived from multiple log lines</q-tooltip>
                  Aggregated (Multi-line Sample)
                </q-chip>
              </div>
              <q-chip color="secondary" text-color="white" icon="info">
                Check arrays to include
              </q-chip>
            </div>

            <div class="json-tree-container">
              <div class="json-tree">
                <JsonTreeViewer
                  v-if="sampleData && sampleData.parsedData"
                  :data="fanoutArrayTreeData"
                  :selection-mode="'array'"
                  :array-only-mode="true"
                  :initial-selected-paths="selectedFanoutFields"
                  @update:selected="handleSelectedUpdate"
                />
                <div v-else class="no-structure-message">
                  <p>No sample data available. Please complete Step 2 first.</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedFanoutFields.length > 0" class="selected-arrays">
            <div class="selection-header q-mt-md">
              <h6>Selected Arrays for Fanout ({{ selectedFanoutFields.length }})</h6>
              <q-btn
                flat
                dense
                color="negative"
                icon="clear_all"
                label="Clear All"
                @click="clearAllSelections('fanout')"
                size="sm"
              />
            </div>

            <q-list bordered separator>
              <q-item v-for="array in selectedFanoutFields" :key="array">
                <q-item-section>
                  <q-item-label>{{ array }}</q-item-label>
                  <q-item-label caption>
                    {{ getArrayFieldInfo(array) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="removeFieldSelection(array, 'fanout')"
                  >
                    <q-tooltip>Remove array</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
      </q-card>
    </div>

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
        label="Continue to Filter Rules"
        @click="proceedToNext"
        class="wizard-btn wizard-btn--primary"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations } from 'vuex'
import { SchemaRuleService } from '../../../services/wizard/schemaRuleService'
import JsonTreeViewer from '../JsonTreeViewer.vue'

export default {
  name: 'Step3_SchemaConfig',

  components: {
    JsonTreeViewer
  },

  data () {
    return {
      selectedConvertToJsonFields: [],
      selectedFanoutFields: [],
      convertToJsonCandidates: [],
      fanoutCandidates: [],
      representativeData: null // Holds the representative structure for multi-line mode
    }
  },

  computed: {
    ...mapState('wizard', ['sampleData', 'schemaRules']),
    ...mapGetters('wizard', ['getParsedDataStructure']),

    /**
     * Determine if we're in multi-line log mode
     */
    isMultiLineLog () {
      return this.sampleData?.logType === 'multiline'
    },

    /**
     * Get the data to use for tree visualization
     * In multi-line mode, this will be the representative structure
     */
    dataForTreeView () {
      if (this.isMultiLineLog && this.representativeData) {
        return this.representativeData
      }
      return this.sampleData?.parsedData
    },

    fanoutArrayTreeData () {
      // Build array-only hierarchical view from parsedData or representative data
      const data = this.dataForTreeView
      if (!data) return {}
      const build = (node) => {
        if (node === null || node === undefined) return {}
        if (Array.isArray(node)) {
          if (node.length === 0) return []
          // For arrays of objects, keep first element reduced
          const first = node[0]
          if (typeof first === 'object' && first !== null) {
            return [build(first)]
          }
          // Primitive arrays: keep entire array
          return node
        }
        if (typeof node === 'object') {
          const out = {}
          for (const k of Object.keys(node)) {
            const v = node[k]
            if (Array.isArray(v)) {
              out[k] = build(v)
            } else if (v && typeof v === 'object') {
              const child = build(v)
              // include ancestor only if descendant has arrays
              if (child && ((Array.isArray(child) && child.length > 0) || (typeof child === 'object' && Object.keys(child).length > 0))) {
                out[k] = child
              }
            }
          }
          return out
        }
        return {}
      }
      return build(data)
    }
  },

  watch: {
    'sampleData.parsedData': {
      handler (newVal) {
        console.log('=== Step3 Watch: sampleData.parsedData changed ===')
        console.log('Type:', Array.isArray(newVal) ? 'Array' : typeof newVal)
        console.log('Value:', newVal)
        console.log('Keys:', newVal && typeof newVal === 'object' ? Object.keys(newVal) : 'N/A')

        // Check if this looks like a metadata object
        if (newVal && typeof newVal === 'object' && !Array.isArray(newVal)) {
          const hasMetadataStructure = newVal.type && newVal.children && (newVal.path || newVal.key)
          console.log('Has metadata structure?', hasMetadataStructure)
        }

        this.analyzeSampleData()
      },
      immediate: true
    },

    sampleData: {
      handler (newVal) {
        console.log('=== Step3 Watch: Full sampleData changed ===')
        console.log('sampleData.parsedData:', newVal?.parsedData)
        console.log('sampleData.dataStructure:', newVal?.dataStructure)
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    ...mapMutations('wizard', ['UPDATE_SCHEMA_RULES']),

    analyzeSampleData () {
      console.log('=== analyzeSampleData called ===')
      console.log('sampleData.parsedData exists?', !!this.sampleData.parsedData)
      console.log('sampleData.dataStructure exists?', !!this.sampleData.dataStructure)
      console.log('isMultiLineLog?', this.isMultiLineLog)

      // Only analyze if we have parsed data
      if (!this.sampleData.parsedData || !this.sampleData.dataStructure) {
        console.log('Missing required data, skipping analysis')
        return
      }

      try {
        console.log('Analyzing parsedData:', this.sampleData.parsedData)

        // Use the new multi-line aware analysis method
        const analysisResult = SchemaRuleService.analyzeSampleDataWithMultiLineSupport(
          this.sampleData.parsedData,
          this.sampleData.dataStructure,
          this.isMultiLineLog
        )

        // Update candidates
        this.convertToJsonCandidates = analysisResult.convertToJsonCandidates
        this.fanoutCandidates = analysisResult.fanoutCandidates
        this.representativeData = analysisResult.representativeData

        console.log('Convert to JSON candidates found:', this.convertToJsonCandidates.length)
        console.log('Fanout candidates found:', this.fanoutCandidates.length, this.fanoutCandidates)
        console.log('Representative data:', this.representativeData)

        if (this.isMultiLineLog) {
          console.log('Multi-line mode active: aggregated candidates across multiple records')
        }
      } catch (error) {
        console.error('Error analyzing sample data for schema rules:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to analyze sample data for schema rules'
        })
      }
    },

    isFieldSelected (field, type) {
      if (type === 'convertToJson') {
        return this.selectedConvertToJsonFields.includes(field)
      } else if (type === 'fanout') {
        return this.selectedFanoutFields.includes(field)
      }
      return false
    },

    toggleFieldSelection (field, type) {
      console.log('Step3.toggleFieldSelection called:', field, type)
      if (type === 'convertToJson') {
        const index = this.selectedConvertToJsonFields.indexOf(field)
        if (index > -1) {
          console.log('Removing from selectedConvertToJsonFields:', field)
          this.selectedConvertToJsonFields.splice(index, 1)
        } else {
          console.log('Adding to selectedConvertToJsonFields:', field)
          this.selectedConvertToJsonFields.push(field)
        }
      } else if (type === 'fanout') {
        const index = this.selectedFanoutFields.indexOf(field)
        if (index > -1) {
          console.log('Removing from selectedFanoutFields:', field)
          this.selectedFanoutFields.splice(index, 1)
        } else {
          console.log('Adding to selectedFanoutFields:', field)
          this.selectedFanoutFields.push(field)
        }
        console.log('Updated selectedFanoutFields:', this.selectedFanoutFields)
      }
    },

    toggleArraySelection (arrayPath) {
      this.toggleFieldSelection(arrayPath, 'fanout')
    },

    handleArraySelection (fieldPath, nodeInfo) {
      // Handle array selection from JsonTreeViewer
      console.log('Step3 handleArraySelection called:', fieldPath, nodeInfo)
      console.log('Current selectedFanoutFields BEFORE toggle:', JSON.stringify(this.selectedFanoutFields))
      this.toggleFieldSelection(fieldPath, 'fanout')
      console.log('Current selectedFanoutFields AFTER toggle:', JSON.stringify(this.selectedFanoutFields))

      // Force update to ensure reactivity
      this.$nextTick(() => {
        console.log('After nextTick, selectedFanoutFields:', JSON.stringify(this.selectedFanoutFields))
      })
    },

    handleSelectedUpdate (selectedPaths) {
      // This is called by JsonTreeViewer when selectedPaths changes internally
      console.log('Step3 handleSelectedUpdate called with:', selectedPaths)
      this.selectedFanoutFields = [...selectedPaths]
      console.log('Updated selectedFanoutFields:', this.selectedFanoutFields)
    },

    removeFieldSelection (field, type) {
      if (type === 'convertToJson') {
        const index = this.selectedConvertToJsonFields.indexOf(field)
        if (index > -1) {
          this.selectedConvertToJsonFields.splice(index, 1)
        }
      } else if (type === 'fanout') {
        const index = this.selectedFanoutFields.indexOf(field)
        if (index > -1) {
          this.selectedFanoutFields.splice(index, 1)
        }
      }
    },

    clearAllSelections (type) {
      if (type === 'convertToJson') {
        this.selectedConvertToJsonFields = []
      } else if (type === 'fanout') {
        this.selectedFanoutFields = []
      }
    },

    getArrayFieldInfo (arrayPath) {
      const field = this.fanoutCandidates.find(f => f.path === arrayPath)
      if (!field) {
        return ''
      }

      const info = []
      if (field.isHomogeneous) {
        info.push(`Homogeneous (${field.elementType})`)
      } else {
        info.push('Heterogeneous')
      }

      if (field.parentPath) {
        info.push(`Parent: ${field.parentPath}`)
      }

      return info.join(' • ')
    },

    proceedToNext () {
      // Build childfanouts structure
      const childfanouts = SchemaRuleService.buildChildFanouts(
        this.selectedFanoutFields,
        this.fanoutCandidates
      )

      // Update Vuex store with schema configuration
      this.UPDATE_SCHEMA_RULES({
        convertToJson: this.selectedConvertToJsonFields,
        fanout: this.selectedFanoutFields,
        childfanouts // Store the built childfanouts for policy generation
      })

      // Validate (optional step, so always valid)
      this.$emit('step-valid')
      this.$emit('next-step')
    }
  },

  created () {
    // Initialize from store state if available
    const storeSchemaRules = this.$store.state.wizard?.schemaRules
    if (storeSchemaRules) {
      this.selectedConvertToJsonFields = [...(storeSchemaRules.convertToJson || [])]
      this.selectedFanoutFields = [...(storeSchemaRules.fanout || [])]
    }

    // Analyze sample data if available
    this.analyzeSampleData()
  }
}
</script>

<style lang="scss" scoped>
.step-schema-config {
  max-width: 1000px;
  margin: 0 auto;
}

.step-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--q-color-grey-3);
}

.step-icon {
  margin-right: 1.5rem;
  padding: 1rem;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 12px;
}

.step-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.step-subtitle {
  font-size: 1.125rem;
  color: var(--q-color-grey-7);
  margin: 0;
}

.step-content {
  margin-bottom: 3rem;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 2rem;
  border-top: 1px solid var(--q-color-grey-3);
}

.wizard-btn {
  padding: 8px 16px;
  border-radius: 6px;
}

/* New Styles for Schema Config */
.card-header {
  background: var(--q-color-grey-1);
  border-bottom: 1px solid var(--q-color-grey-3);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--q-color-grey-9);
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.card-description {
  color: var(--q-color-grey-6);
  margin: 0;
  line-height: 1.4;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h6 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--q-color-grey-8);
  }
}

.json-field-list {
  border-radius: 8px;
  margin-bottom: 1rem;
}

.json-structure-view {
  border: none;
  border-radius: 8px;
  background-color: var(--q-color-grey-1);
  padding: 1rem;
}

.structure-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h6 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--q-color-grey-8);
  }

  .structure-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
}

.structure-header-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.json-tree-container {
  background-color: white;
  border: none;
  border-radius: 6px;
  padding: 1rem;
  max-height: 800px;
  overflow-y: auto;
  font-family: monospace;
}

.json-tree-header {
  background-color: rgba(25, 118, 210, 0.05);
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.json-tree {
  line-height: 1.6;
}

.json-tree-empty {
  padding: 20px;
  text-align: center;
  color: var(--q-color-grey-7);
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tree-node {
  white-space: nowrap;
}

.indented {
  padding-left: 20px;
}

.double-indented {
  padding-left: 40px;
}

.triple-indented {
  padding-left: 60px;
}

.quadruple-indented {
  padding-left: 80px;
}

.node-key {
  color: #0b7285;
  font-weight: bold;
  margin-right: 5px;
}

.node-bracket {
  color: #868e96;
  font-weight: normal;
}

.node-type {
  color: #868e96;
  font-style: italic;
  margin-left: 5px;
}

.inline-checkbox {
  display: inline-block;
  margin: 0 8px;
}
</style>
