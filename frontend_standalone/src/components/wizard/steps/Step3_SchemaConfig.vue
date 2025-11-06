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
                    @update:model-value="() => { console.log('[DEBUG CHECKBOX] Convert to JSON checkbox toggled for field:', field, '| New selectedConvertToJsonFields:', JSON.stringify(selectedConvertToJsonFields)) }"
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
                  <q-item-label>
                    {{ array }}
                    <q-badge
                      v-if="isParsedJsonArray(array)"
                      color="purple"
                      text-color="white"
                      class="q-ml-sm"
                    >
                      <q-icon name="code" size="xs" class="q-mr-xs" />
                      Parsed JSON
                    </q-badge>
                  </q-item-label>
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
      representativeData: null, // Holds the representative structure for multi-line mode
      baseFanoutCandidates: [], // Store the original fanout candidates before adding parsed arrays
      parsedJsonArrays: [] // Track arrays discovered from parsed JSON fields
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
      // If we have selected Convert to JSON fields, update the representative data with parsed fields
      let data = this.dataForTreeView

      if (!data) return {}

      // Apply parsed JSON fields to the data for tree view
      if (this.selectedConvertToJsonFields.length > 0) {
        data = SchemaRuleService.updateRepresentativeDataWithParsedFields(
          data,
          this.selectedConvertToJsonFields
        )
      }

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
    },

    // Watch for changes in Convert to JSON field selections
    selectedConvertToJsonFields: {
      handler (newFields, oldFields) {
        console.log('╔══════════════════════════════════════════════════════════════════════════════')
        console.log('║ [DEBUG WATCHER] selectedConvertToJsonFields changed')
        console.log('╠══════════════════════════════════════════════════════════════════════════════')
        console.log('║ Old fields:', JSON.stringify(oldFields))
        console.log('║ New fields:', JSON.stringify(newFields))
        console.log('║ Change type:')

        if (!oldFields || oldFields.length === 0) {
          console.log('║   → Initial load or first selection')
        } else if (newFields.length > oldFields.length) {
          console.log('║   → Field(s) ADDED')
          const added = newFields.filter(f => !oldFields.includes(f))
          console.log('║   → Added fields:', JSON.stringify(added))
        } else if (newFields.length < oldFields.length) {
          console.log('║   → Field(s) REMOVED (unchecked)')
          const removed = oldFields.filter(f => !newFields.includes(f))
          console.log('║   → Removed fields:', JSON.stringify(removed))
        } else {
          console.log('║   → Same length but different content')
        }

        console.log('║ Current selectedFanoutFields before calling update:', JSON.stringify(this.selectedFanoutFields))
        console.log('╚══════════════════════════════════════════════════════════════════════════════')

        // Update fanout candidates based on parsed JSON fields
        this.updateFanoutCandidatesFromParsedJson(newFields, oldFields || [])

        console.log('╔══════════════════════════════════════════════════════════════════════════════')
        console.log('║ [DEBUG WATCHER] After updateFanoutCandidatesFromParsedJson returned')
        console.log('║ Current selectedFanoutFields after calling update:', JSON.stringify(this.selectedFanoutFields))
        console.log('╚══════════════════════════════════════════════════════════════════════════════')
      },
      deep: true
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
        // Store the base fanout candidates (before adding parsed arrays)
        this.baseFanoutCandidates = [...analysisResult.fanoutCandidates]
        this.fanoutCandidates = [...analysisResult.fanoutCandidates]
        this.representativeData = analysisResult.representativeData

        console.log('Convert to JSON candidates found:', this.convertToJsonCandidates.length)
        console.log('Base fanout candidates found:', this.baseFanoutCandidates.length, this.baseFanoutCandidates)
        console.log('Representative data:', this.representativeData)

        // Re-apply parsed JSON arrays if any fields are already selected
        if (this.selectedConvertToJsonFields.length > 0) {
          this.updateFanoutCandidatesFromParsedJson(this.selectedConvertToJsonFields, [])
        }

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
      console.log('╔══════════════════════════════════════════════════════════════════════════════')
      console.log('║ [DEBUG] handleSelectedUpdate called from JsonTreeViewer')
      console.log('╠══════════════════════════════════════════════════════════════════════════════')
      console.log('║ selectedPaths (from JsonTreeViewer):', JSON.stringify(selectedPaths))
      console.log('║ Current selectedFanoutFields BEFORE update:', JSON.stringify(this.selectedFanoutFields))
      console.log('╚══════════════════════════════════════════════════════════════════════════════')

      this.selectedFanoutFields = [...selectedPaths]

      console.log('╔══════════════════════════════════════════════════════════════════════════════')
      console.log('║ [DEBUG] handleSelectedUpdate - selectedFanoutFields AFTER update')
      console.log('║ selectedFanoutFields:', JSON.stringify(this.selectedFanoutFields))
      console.log('╚══════════════════════════════════════════════════════════════════════════════')
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

      // Add badge for parsed JSON arrays
      if (field.isParsedField) {
        info.push('From parsed JSON')
      }

      if (field.isHomogeneous) {
        info.push(`Homogeneous (${field.elementType})`)
      } else {
        info.push('Heterogeneous')
      }

      if (field.parentPath && !field.isParsedField) {
        info.push(`Parent: ${field.parentPath}`)
      }

      return info.join(' • ')
    },

    /**
     * Check if an array is from a parsed JSON field
     */
    isParsedJsonArray (arrayPath) {
      const field = this.fanoutCandidates.find(f => f.path === arrayPath)
      return field?.isParsedField || false
    },

    /**
     * Update fanout candidates based on selected Convert to JSON fields
     * This method parses selected JSON string fields and adds their nested arrays to fanout candidates
     */
    updateFanoutCandidatesFromParsedJson (newFields, oldFields) {
      console.log('╔═══════════════════════════════════════════════════════════════════════')
      console.log('║ [DEBUG] updateFanoutCandidatesFromParsedJson - START')
      console.log('╠═══════════════════════════════════════════════════════════════════════')
      console.log('║ Input Parameters:')
      console.log('║   newFields:', JSON.stringify(newFields))
      console.log('║   oldFields:', JSON.stringify(oldFields))
      console.log('╠═══════════════════════════════════════════════════════════════════════')
      console.log('║ Current State BEFORE Processing:')
      console.log('║   selectedFanoutFields:', JSON.stringify(this.selectedFanoutFields))
      console.log('║   selectedFanoutFields.length:', this.selectedFanoutFields.length)
      console.log('║   fanoutCandidates.length:', this.fanoutCandidates.length)
      console.log('║   baseFanoutCandidates.length:', this.baseFanoutCandidates.length)
      console.log('║   parsedJsonArrays.length:', this.parsedJsonArrays.length)
      console.log('║   parsedJsonArrays:', JSON.stringify(this.parsedJsonArrays))
      console.log('╚═══════════════════════════════════════════════════════════════════════')

      if (!this.sampleData?.parsedData || !this.representativeData) {
        console.log('[DEBUG] No sample data available - EXITING')
        return
      }

      // Determine which fields were added and which were removed
      const addedFields = newFields.filter(f => !oldFields.includes(f))
      const removedFields = oldFields.filter(f => !newFields.includes(f))

      console.log('╔═══════════════════════════════════════════════════════════════════════')
      console.log('║ [DEBUG] Field Changes Analysis:')
      console.log('║   addedFields:', JSON.stringify(addedFields))
      console.log('║   removedFields:', JSON.stringify(removedFields))
      console.log('╚═══════════════════════════════════════════════════════════════════════')

      // Start with base fanout candidates
      let updatedCandidates = [...this.baseFanoutCandidates]
      console.log('[DEBUG] Starting with baseFanoutCandidates:', updatedCandidates.length, 'candidates')

      // Remove arrays from deselected JSON fields
      // Process in the correct order:
      // 1. Identify which arrays need to be removed
      // 2. Remove from selectedFanoutFields (deselect)
      // 3. Remove from Vuex store's schemaRules.fanout
      // 4. Remove from fanoutCandidates
      for (const removedField of removedFields) {
        console.log('╔═══════════════════════════════════════════════════════════════════════')
        console.log('║ [DEBUG] Processing Removed Field:', removedField)
        console.log('╠═══════════════════════════════════════════════════════════════════════')

        // Inspect current fanoutCandidates to see what's tagged as parsed
        console.log('║ Current fanoutCandidates (ALL):')
        this.fanoutCandidates.forEach((c, idx) => {
          console.log(`║   [${idx}] path: "${c.path}", isParsedField: ${c.isParsedField}, parentPath: "${c.parentPath || 'N/A'}"`)
        })

        // Step 1: Identify arrays that came from this parsed JSON field
        // Use the current fanoutCandidates (before update) to find them
        const arraysToRemove = this.fanoutCandidates
          .filter(c => c.isParsedField && c.parentPath === removedField)
          .map(c => c.path)

        console.log('╠═══════════════════════════════════════════════════════════════════════')
        console.log('║ [DEBUG] Step 1: Identify Arrays to Remove')
        console.log('║   Looking for arrays where:')
        console.log('║     - isParsedField === true')
        console.log('║     - parentPath === "' + removedField + '"')
        console.log('║   Arrays to remove:', JSON.stringify(arraysToRemove))
        console.log('║   Count:', arraysToRemove.length)

        // Normalize paths by removing $.  prefix for comparison with selectedFanoutFields
        // arraysToRemove has paths like "$.configString.featureList"
        // selectedFanoutFields has paths like "configString.featureList"
        const normalizedArraysToRemove = arraysToRemove.map(path =>
          path.startsWith('$.') ? path.substring(2) : path
        )
        console.log('║   Normalized arrays to remove:', JSON.stringify(normalizedArraysToRemove))

        // Step 2: Remove from selectedFanoutFields (deselect any selected fanouts from this field)
        if (normalizedArraysToRemove.length > 0) {
          console.log('╠═══════════════════════════════════════════════════════════════════════')
          console.log('║ [DEBUG] Step 2: Remove from selectedFanoutFields')
          console.log('║   selectedFanoutFields BEFORE filter:', JSON.stringify(this.selectedFanoutFields))
          const originalLength = this.selectedFanoutFields.length

          // Detailed logging for each array
          console.log('║   Checking each selected fanout field:')
          this.selectedFanoutFields.forEach(path => {
            const shouldRemove = normalizedArraysToRemove.includes(path)
            console.log(`║     - "${path}" → ${shouldRemove ? 'REMOVE' : 'KEEP'}`)
          })

          this.selectedFanoutFields = this.selectedFanoutFields.filter(path => {
            const shouldRemove = normalizedArraysToRemove.includes(path)
            if (shouldRemove) {
              console.log(`║   [REMOVING] Deselecting fanout: "${path}"`)
            }
            return !shouldRemove
          })

          console.log('║   selectedFanoutFields AFTER filter:', JSON.stringify(this.selectedFanoutFields))
          const removedCount = originalLength - this.selectedFanoutFields.length
          console.log('║   Removed count:', removedCount)
          console.log('║   Original length:', originalLength, '→ New length:', this.selectedFanoutFields.length)

          if (removedCount > 0) {
            console.log('╠═══════════════════════════════════════════════════════════════════════')
            console.log('║ [DEBUG] Step 3: Update Vuex Store')
            console.log('║   Updating Vuex store with new fanout array:', JSON.stringify(this.selectedFanoutFields))

            // Step 3: Update Vuex store to remove these fanout arrays
            // This ensures the store stays in sync with the local component state
            this.UPDATE_SCHEMA_RULES({
              fanout: [...this.selectedFanoutFields]
            })
            console.log('║   Vuex store updated successfully')
          }
        } else {
          console.log('╠═══════════════════════════════════════════════════════════════════════')
          console.log('║ [DEBUG] No arrays found to remove for this field')
        }

        // Step 4: Remove from fanout candidates
        console.log('╠═══════════════════════════════════════════════════════════════════════')
        console.log('║ [DEBUG] Step 4: Remove from fanoutCandidates')
        console.log('║   updatedCandidates BEFORE removeParsedArraysFromField:', updatedCandidates.length)
        updatedCandidates.forEach((c, idx) => {
          console.log(`║     [${idx}] path: "${c.path}", isParsedField: ${c.isParsedField}, parentPath: "${c.parentPath || 'N/A'}"`)
        })

        const beforeRemoveCount = updatedCandidates.length
        updatedCandidates = SchemaRuleService.removeParsedArraysFromField(updatedCandidates, removedField)
        const afterRemoveCount = updatedCandidates.length

        console.log('║   updatedCandidates AFTER removeParsedArraysFromField:', afterRemoveCount)
        console.log('║   Candidates removed from list:', beforeRemoveCount - afterRemoveCount)
        updatedCandidates.forEach((c, idx) => {
          console.log(`║     [${idx}] path: "${c.path}", isParsedField: ${c.isParsedField}, parentPath: "${c.parentPath || 'N/A'}"`)
        })
        console.log('╚═══════════════════════════════════════════════════════════════════════')
      }

      // Add arrays from newly selected JSON fields
      const allParsedArrays = []
      console.log('╔═══════════════════════════════════════════════════════════════════════')
      console.log('║ [DEBUG] Processing Added Fields')
      console.log('╚═══════════════════════════════════════════════════════════════════════')

      for (const addedField of addedFields) {
        console.log(`[DEBUG] Parsing added field: "${addedField}"`)

        try {
          // Parse the JSON field and extract arrays
          const parseResult = SchemaRuleService.parseJsonFieldForArrays(
            this.representativeData,
            addedField
          )

          if (parseResult.success) {
            console.log(`[DEBUG] Found ${parseResult.arrayPaths.length} arrays in "${addedField}":`, JSON.stringify(parseResult.arrayPaths))
            allParsedArrays.push(...parseResult.arrayPaths)
          } else {
            console.warn(`[DEBUG] Failed to parse "${addedField}":`, parseResult.error)

            // Show warning notification to user
            this.$q.notify({
              type: 'warning',
              message: `Could not parse JSON field "${addedField}"`,
              caption: parseResult.error,
              timeout: 3000
            })
          }
        } catch (error) {
          console.error(`[DEBUG] Error parsing "${addedField}":`, error)

          this.$q.notify({
            type: 'negative',
            message: `Error parsing JSON field "${addedField}"`,
            caption: error.message,
            timeout: 3000
          })
        }
      }

      // For all currently selected fields (not just newly added), parse and collect arrays
      // This ensures we have a complete set when re-analyzing
      if (addedFields.length === 0 && newFields.length > 0) {
        console.log('[DEBUG] No new fields added, but re-parsing all selected fields:', JSON.stringify(newFields))
        for (const field of newFields) {
          try {
            const parseResult = SchemaRuleService.parseJsonFieldForArrays(
              this.representativeData,
              field
            )

            if (parseResult.success) {
              console.log(`[DEBUG] Re-parsed "${field}": found ${parseResult.arrayPaths.length} arrays`)
              allParsedArrays.push(...parseResult.arrayPaths)
            }
          } catch (error) {
            console.error(`[DEBUG] Error re-parsing "${field}":`, error)
          }
        }
      }

      // Merge parsed arrays into candidates
      if (allParsedArrays.length > 0) {
        console.log('╔═══════════════════════════════════════════════════════════════════════')
        console.log('║ [DEBUG] Merging Parsed Arrays')
        console.log('║   allParsedArrays:', JSON.stringify(allParsedArrays))
        console.log('║   allParsedArrays.length:', allParsedArrays.length)
        console.log('║   updatedCandidates BEFORE merge:', updatedCandidates.length)
        console.log('╚═══════════════════════════════════════════════════════════════════════')

        updatedCandidates = SchemaRuleService.mergeParsedArraysIntoFanoutCandidates(
          updatedCandidates,
          allParsedArrays
        )

        console.log('[DEBUG] updatedCandidates AFTER merge:', updatedCandidates.length)
      }

      // Update fanout candidates
      this.fanoutCandidates = updatedCandidates
      this.parsedJsonArrays = allParsedArrays

      console.log('╔═══════════════════════════════════════════════════════════════════════')
      console.log('║ [DEBUG] Final State AFTER Processing:')
      console.log('║   this.fanoutCandidates.length:', this.fanoutCandidates.length)
      console.log('║   this.parsedJsonArrays.length:', this.parsedJsonArrays.length)
      console.log('║   this.parsedJsonArrays:', JSON.stringify(this.parsedJsonArrays))
      console.log('║   this.selectedFanoutFields:', JSON.stringify(this.selectedFanoutFields))
      console.log('║   this.selectedFanoutFields.length:', this.selectedFanoutFields.length)
      console.log('╠═══════════════════════════════════════════════════════════════════════')
      console.log('║ Final fanoutCandidates details:')
      this.fanoutCandidates.forEach((c, idx) => {
        console.log(`║   [${idx}] path: "${c.path}", isParsedField: ${c.isParsedField}, parentPath: "${c.parentPath || 'N/A'}"`)
      })
      console.log('╠═══════════════════════════════════════════════════════════════════════')
      console.log('║ [DEBUG] updateFanoutCandidatesFromParsedJson - END')
      console.log('╚═══════════════════════════════════════════════════════════════════════')

      // Force reactivity update
      this.$forceUpdate()
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
