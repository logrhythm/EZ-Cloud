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
                  <q-item-label>
                    {{ field }}
                    <!-- Warning indicator for missing or invalid format fields -->
                    <q-icon
                      v-if="isFieldMissing(field)"
                      name="warning"
                      :color="getFieldWarningBadgeColor(field) === 'red' ? 'negative' : 'warning'"
                      size="sm"
                      class="q-ml-xs"
                    >
                      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
                        {{ getFieldWarningMessage(field) }}
                      </q-tooltip>
                    </q-icon>
                  </q-item-label>
                  <q-item-label caption>
                    <span v-if="!isFieldMissing(field)">Contains stringified JSON</span>
                    <span v-else-if="isFieldMissing(field) && isFieldMissing(field).reason === 'missing'" class="text-warning">
                      <q-icon name="info" size="xs" class="q-mr-xs" />
                      Not found in current sample data
                    </span>
                    <span v-else-if="isFieldMissing(field) && isFieldMissing(field).reason === 'invalid-format'" class="text-negative">
                      <q-icon name="error" size="xs" class="q-mr-xs" />
                      {{ isFieldMissing(field).message }}
                    </span>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge v-if="!isFieldMissing(field)" color="primary">string</q-badge>
                  <q-badge v-else :color="getFieldWarningBadgeColor(field)">
                    {{ getFieldWarningBadgeText(field) }}
                  </q-badge>
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
                  <q-item-label>
                    {{ field }}
                    <!-- Warning indicator for missing or invalid format fields -->
                    <q-icon
                      v-if="isFieldMissing(field)"
                      name="warning"
                      :color="getFieldWarningBadgeColor(field) === 'red' ? 'negative' : 'warning'"
                      size="sm"
                      class="q-ml-xs"
                    >
                      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
                        {{ getFieldWarningMessage(field) }}
                      </q-tooltip>
                    </q-icon>
                    <!-- Badge showing the issue type -->
                    <q-badge
                      v-if="isFieldMissing(field)"
                      :color="getFieldWarningBadgeColor(field)"
                      class="q-ml-xs"
                    >
                      {{ getFieldWarningBadgeText(field) }}
                    </q-badge>
                  </q-item-label>
                  <q-item-label caption v-if="isFieldMissing(field)">
                    <span v-if="isFieldMissing(field).reason === 'missing'" class="text-warning">
                      Not found in current sample data
                    </span>
                    <span v-else-if="isFieldMissing(field).reason === 'invalid-format'" class="text-negative">
                      {{ isFieldMissing(field).message }}
                    </span>
                  </q-item-label>
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
                  :key="`tree-${selectedFanoutFields.join(',')}`"
                  :data="fanoutArrayTreeData"
                  :selection-mode="'array'"
                  :array-only-mode="true"
                  :initial-selected-paths="selectedFanoutFields.length > 0 ? selectedFanoutFields : []"
                  :missing-array-paths="missingFanoutArrayPaths"
                  @update:selected="handleSelectedUpdate"
                />
                <!-- Debug Info - Remove after fixing -->
                <div class="debug-info q-mt-md" v-if="false">
                  <p>Selected Fanout Fields: {{ selectedFanoutFields.length }}</p>
                  <pre>{{ JSON.stringify(selectedFanoutFields, null, 2) }}</pre>
                </div>
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
                    <!-- Badge for missing arrays -->
                    <q-badge
                      v-if="isFanoutArrayMissing(array)"
                      color="orange"
                      text-color="white"
                      class="q-ml-sm"
                    >
                      <q-icon name="warning" size="xs" class="q-mr-xs" />
                      Missing
                      <q-tooltip>
                        This array is defined in the policy but not found in the current sample data
                      </q-tooltip>
                    </q-badge>
                    <q-badge
                      v-if="isParsedJsonArray(array)"
                      color="purple"
                      text-color="white"
                      class="q-ml-sm"
                    >
                      <q-icon name="code" size="xs" class="q-mr-xs" />
                      Parsed JSON
                    </q-badge>
                    <!-- Badge for nested fanout arrays -->
                    <q-badge
                      v-if="fanoutCandidates.find(f => f.path === array && f.isNestedFanout)"
                      color="orange"
                      text-color="white"
                      class="q-ml-sm"
                    >
                      <q-icon name="call_split" size="xs" class="q-mr-xs" />
                      Nested Fanout
                      <q-tooltip>
                        This array is nested within a parent fanout array. Each element of the parent array will be fanned out, and then this nested array will be processed.
                      </q-tooltip>
                    </q-badge>
                  </q-item-label>
                  <q-item-label caption>
                    <span v-if="isFanoutArrayMissing(array)" class="text-warning">
                      <q-icon name="info" size="xs" class="q-mr-xs" />
                      Not found in current sample data
                    </span>
                    <span v-else>
                      {{ getArrayFieldInfo(array) }}
                    </span>
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
      parsedJsonArrays: [], // Track arrays discovered from parsed JSON fields
      missingPolicyFields: [] // Track fields from policy not in sample data (Scenario 1)
    }
  },

  computed: {
    ...mapState('wizard', ['sampleData', 'schemaRules']),
    ...mapGetters('wizard', ['getParsedDataStructure']),

    /**
     * Get the fanout selections from the Vuex store
     * This ensures reactivity when the store is updated
     */
    storeFanoutSelections () {
      const storedSelections = this.schemaRules?.fanout || []
      console.log('[DEBUG] Step3 computed storeFanoutSelections:', JSON.stringify(storedSelections))
      return storedSelections
    },

    /**
     * Determine if we're in multi-line log mode
     */
    isMultiLineLog () {
      return this.sampleData?.logType === 'multiline'
    },

    /**
     * Get array of missing fanout array paths for tree visualization
     */
    missingFanoutArrayPaths () {
      return this.fanoutCandidates
        .filter(c => c.isMissing)
        .map(c => c.path)
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

      // Inject synthetic nodes for missing fanout arrays
      // This ensures missing arrays appear in the tree with visual indicators
      const missingArrays = this.fanoutCandidates.filter(c => c.isMissing)
      if (missingArrays.length > 0) {
        console.log('[Step3] Injecting missing arrays into tree data:', missingArrays.map(a => a.path))

        // Clone data to avoid mutations
        data = JSON.parse(JSON.stringify(data))

        // Inject each missing array into the tree structure
        for (const missingArray of missingArrays) {
          const path = missingArray.path
          console.log('[Step3] Injecting path:', path)

          // Split path into parts (e.g., "requestParameters.changeBatch.changes" -> ["requestParameters", "changeBatch", "changes"])
          const parts = path.split('.')

          // Navigate/create the path in the data structure
          let current = data
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i]
            if (!current[part]) {
              // Create intermediate object if it doesn't exist
              current[part] = {}
              console.log(`[Step3] Created intermediate node: ${parts.slice(0, i + 1).join('.')}`)
            }
            current = current[part]
          }

          // Set the final array node with a special marker
          const lastPart = parts[parts.length - 1]
          if (!current[lastPart]) {
            // Create a synthetic empty array with a marker
            current[lastPart] = []
            // Add metadata to mark this as synthetic (we'll use a Symbol or special property)
            // Since we're working with JSON, we'll add a special first element
            current[lastPart].__isMissing = true
            console.log(`[Step3] Created synthetic array node: ${path}`)
          }
        }
      }

      const build = (node, currentPath = '') => {
        if (node === null || node === undefined) return {}

        // Check if this is a marked missing array
        const isMissingArray = Array.isArray(node) && node.__isMissing === true

        if (Array.isArray(node)) {
          if (node.length === 0 || isMissingArray) {
            // For empty arrays or missing arrays, return empty array with marker
            const arr = []
            if (isMissingArray) {
              arr.__isMissing = true
            }
            return arr
          }
          // For arrays of objects, keep first element reduced
          const first = node[0]
          if (typeof first === 'object' && first !== null) {
            return [build(first, currentPath)]
          }
          // Primitive arrays: keep entire array
          return node
        }
        if (typeof node === 'object') {
          const out = {}
          for (const k of Object.keys(node)) {
            if (k === '__isMissing') continue // Skip metadata property

            const v = node[k]
            const childPath = currentPath ? `${currentPath}.${k}` : k

            if (Array.isArray(v)) {
              out[k] = build(v, childPath)
            } else if (v && typeof v === 'object') {
              const child = build(v, childPath)
              // include ancestor only if descendant has arrays
              if (child && ((Array.isArray(child) && child.length >= 0) || (typeof child === 'object' && Object.keys(child).length > 0))) {
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
    // Watch for changes in the computed store fanout selections
    // This ensures we have the latest values from the store
    storeFanoutSelections: {
      handler (newVal) {
        console.log('[DEBUG] Step3 Watch: storeFanoutSelections changed:', JSON.stringify(newVal))
        console.log('[DEBUG] Current selectedFanoutFields before update:', JSON.stringify(this.selectedFanoutFields))

        // Check if this is an actual change
        const currentSelections = JSON.stringify(this.selectedFanoutFields)
        const newSelections = JSON.stringify(newVal)

        if (currentSelections !== newSelections) {
          console.log('[DEBUG] Updating selectedFanoutFields from store')
          this.selectedFanoutFields = [...newVal]
          console.log('[DEBUG] Updated selectedFanoutFields:', JSON.stringify(this.selectedFanoutFields))
        } else {
          console.log('[DEBUG] No change needed for selectedFanoutFields')
        }
      },
      immediate: true
    },

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

    // Watch for schema rules changes from store (e.g., when Step 2 resets them)
    schemaRules: {
      handler (newRules, oldRules) {
        console.log('=== Step3 Watch: schemaRules changed in store ===')
        console.log('Old convertToJson:', oldRules?.convertToJson)
        console.log('New convertToJson:', newRules?.convertToJson)
        console.log('Old fanout:', oldRules?.fanout)
        console.log('New fanout:', newRules?.fanout)

        // Check if schema rules were cleared (reset by Step 2)
        const wasCleared = (
          oldRules &&
          (oldRules.convertToJson?.length > 0 || oldRules.fanout?.length > 0) &&
          (!newRules.convertToJson || newRules.convertToJson.length === 0) &&
          (!newRules.fanout || newRules.fanout.length === 0)
        )

        if (wasCleared) {
          console.log('=== Step3: Schema rules were cleared - resetting local selections ===')
          // Clear local component state when store was reset
          this.selectedConvertToJsonFields = []
          this.selectedFanoutFields = []
          this.parsedJsonArrays = []
        }
      },
      deep: true
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

    /**
     * Check if a field path exists in the sample data
     * @param {string} fieldPath - JSONPath expression (e.g., "$.log" or "log")
     * @returns {boolean} - True if field exists in sample data, false otherwise
     */
    checkFieldExistsInSampleData (fieldPath) {
      try {
        const sampleData = this.sampleData?.parsedData
        if (!sampleData) {
          console.warn('[Step3] checkFieldExistsInSampleData: No sample data available')
          return false
        }

        // Normalize the path (remove leading $.)
        const normalizedPath = fieldPath.replace(/^\$\./, '')

        console.log('[Step3] Checking field existence:', {
          originalPath: fieldPath,
          normalizedPath,
          sampleDataKeys: Object.keys(sampleData)
        })

        // Split path by dots and brackets, filtering out empty strings
        const pathParts = normalizedPath.split(/[.[\]]+/).filter(Boolean)

        // Traverse the object
        let current = sampleData
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i]

          // Check if current is an object/array and has the property
          if (current && typeof current === 'object') {
            // Handle array notation (e.g., "0", "1", "*")
            if (Array.isArray(current)) {
              // For arrays, check if the part is a number or "*" (wildcard)
              if (part === '*') {
                // Wildcard - check if array has at least one element
                if (current.length === 0) {
                  console.log(`[Step3] Array is empty at path segment: ${part}`)
                  return false
                }
                // Continue with first element for subsequent checks
                current = current[0]
                continue
              } else if (!isNaN(part)) {
                // Numeric index
                const index = parseInt(part, 10)
                if (index >= current.length) {
                  console.log(`[Step3] Array index ${index} out of bounds at path segment: ${part}`)
                  return false
                }
                current = current[index]
                continue
              }
            }

            // Check if property exists
            if (part in current) {
              current = current[part]
            } else {
              console.log(`[Step3] Property "${part}" not found in current object at path segment ${i}/${pathParts.length}`)
              return false
            }
          } else {
            console.log(`[Step3] Current value is not an object/array at path segment: ${part}`)
            return false
          }
        }

        console.log(`[Step3] Field "${fieldPath}" EXISTS in sample data`)
        return true
      } catch (error) {
        console.error('[Step3] Error checking field existence:', error)
        return false
      }
    },

    /**
     * Check if a field contains stringified JSON (valid for String to JSON conversion)
     * @param {string} fieldPath - JSONPath expression (e.g., "$.log" or "log")
     * @returns {Object} - { valid: boolean, reason: string|null, actualType: string|null }
     */
    checkFieldContainsStringifiedJson (fieldPath) {
      try {
        const sampleData = this.sampleData?.parsedData
        if (!sampleData) {
          console.warn('[Step3] checkFieldContainsStringifiedJson: No sample data available')
          return { valid: true, reason: null }
        }

        // Get the field value using the same logic as checkFieldExistsInSampleData
        const normalizedPath = fieldPath.replace(/^\$\./, '')
        const pathParts = normalizedPath.split(/[.[\]]+/).filter(Boolean)

        let current = sampleData
        for (const part of pathParts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part]
          } else {
            // Field doesn't exist - handled by other check
            return { valid: true, reason: null }
          }
        }

        console.log(`[Step3] Field "${fieldPath}" value type:`, typeof current, '| isArray:', Array.isArray(current))

        // Field exists, now check if it's a string
        if (typeof current !== 'string') {
          // Field is not a string (it's already JSON object/array)
          const actualType = Array.isArray(current) ? 'array' : typeof current
          console.warn(`[Step3] Field "${fieldPath}" contains ${actualType} instead of stringified JSON`)
          return {
            valid: false,
            reason: `Field contains ${actualType} instead of stringified JSON`,
            actualType: actualType
          }
        }

        // Field is a string, check if it contains valid JSON
        try {
          JSON.parse(current)
          console.log(`[Step3] Field "${fieldPath}" contains VALID stringified JSON`)
          return { valid: true, reason: null } // Valid stringified JSON
        } catch (parseError) {
          // String but not valid JSON
          console.warn(`[Step3] Field "${fieldPath}" is a string but does not contain valid JSON`)
          return {
            valid: false,
            reason: 'Field is a string but does not contain valid JSON',
            actualType: 'string (not parseable as JSON)'
          }
        }
      } catch (error) {
        console.error('[Step3] Error checking field JSON format:', error)
        return { valid: true, reason: null } // Don't block on errors
      }
    },

    /**
     * Check if a fanout array is marked as missing from sample data
     * @param {string} arrayPath - The array path to check
     * @returns {boolean} - True if array is missing, false otherwise
     */
    isFanoutArrayMissing (arrayPath) {
      const candidate = this.fanoutCandidates.find(f => f.path === arrayPath)
      return candidate?.isMissing || false
    },

    /**
     * Check if a field is marked as missing from sample data
     * @param {string} fieldPath - The field path to check
     * @returns {Object|null} - The missing field object or null
     */
    isFieldMissing (fieldPath) {
      const missing = this.missingPolicyFields.find(
        field => field.type === 'convertoJson' && field.path === fieldPath
      )
      return missing || null
    },

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

        // Validate previous selections against new candidates
        if (this.selectedConvertToJsonFields.length > 0) {
          console.log('=== Validating previous Convert to JSON selections against new candidates ===')
          console.log('Previous selections:', this.selectedConvertToJsonFields)
          console.log('New candidates:', this.convertToJsonCandidates)

          // Filter to only keep valid selections that still exist in new candidates
          const validSelections = this.selectedConvertToJsonFields.filter(field =>
            this.convertToJsonCandidates.includes(field)
          )

          if (validSelections.length !== this.selectedConvertToJsonFields.length) {
            console.log('Some Convert to JSON selections are no longer valid')
            console.log('Valid selections:', validSelections)
            console.log('Removed:', this.selectedConvertToJsonFields.filter(f => !validSelections.includes(f)))
            this.selectedConvertToJsonFields = validSelections
          } else {
            console.log('All Convert to JSON selections are still valid')
          }
        }

        if (this.selectedFanoutFields.length > 0) {
          console.log('=== Validating previous Fanout selections against new candidates ===')
          console.log('Previous selections:', this.selectedFanoutFields)

          // Create a set of valid fanout paths
          const validFanoutPaths = new Set(this.baseFanoutCandidates.map(c => c.path))
          console.log('Valid fanout paths:', Array.from(validFanoutPaths))

          // Separate base array selections from parsed array selections
          // Parsed arrays start with '$.' and will be validated later after parsing
          const baseArraySelections = this.selectedFanoutFields.filter(field => !field.startsWith('$.'))
          const parsedArraySelections = this.selectedFanoutFields.filter(field => field.startsWith('$.'))

          console.log('Base array selections:', baseArraySelections)
          console.log('Parsed array selections (deferred validation):', parsedArraySelections)

          // Only validate base arrays against baseFanoutCandidates
          // Parsed arrays will be validated after updateFanoutCandidatesFromParsedJson() runs
          const validBaseSelections = baseArraySelections.filter(field =>
            validFanoutPaths.has(field)
          )

          if (validBaseSelections.length !== baseArraySelections.length) {
            console.log('Some base Fanout selections are no longer valid')
            console.log('Valid base selections:', validBaseSelections)
            console.log('Removed base selections:', baseArraySelections.filter(f => !validBaseSelections.includes(f)))
          } else {
            console.log('All base Fanout selections are still valid')
          }

          // Preserve parsed array selections - they will be validated after parsed JSON processing
          this.selectedFanoutFields = [...validBaseSelections, ...parsedArraySelections]
          console.log('Combined selections after validation:', this.selectedFanoutFields)
        }

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

      // Add badge for nested fanout arrays
      if (field.isNestedFanout) {
        info.push(`Nested fanout (parent: ${field.parentPath})`)
      }

      if (field.isHomogeneous) {
        info.push(`Homogeneous (${field.elementType})`)
      } else {
        info.push('Heterogeneous')
      }

      if (field.parentPath && !field.isParsedField && !field.isNestedFanout) {
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
     * Get the warning message for a field
     * @param {string} fieldPath - The field path to check
     * @returns {string} - The warning message
     */
    getFieldWarningMessage (fieldPath) {
      const missing = this.missingPolicyFields.find(
        field => field.type === 'convertoJson' && field.path === fieldPath
      )

      if (!missing) return ''

      if (missing.reason === 'missing') {
        return 'This field is defined in the policy but not found in the current sample data'
      } else if (missing.reason === 'invalid-format') {
        return `This field contains ${missing.actualType} instead of stringified JSON`
      }

      return missing.message
    },

    /**
     * Get the badge color for a field warning
     * @param {string} fieldPath - The field path to check
     * @returns {string} - The badge color
     */
    getFieldWarningBadgeColor (fieldPath) {
      const missing = this.missingPolicyFields.find(
        field => field.type === 'convertoJson' && field.path === fieldPath
      )

      if (!missing) return 'grey'

      if (missing.reason === 'missing') return 'orange'
      if (missing.reason === 'invalid-format') return 'red'

      return 'warning'
    },

    /**
     * Get the badge text for a field warning
     * @param {string} fieldPath - The field path to check
     * @returns {string} - The badge text
     */
    getFieldWarningBadgeText (fieldPath) {
      const missing = this.missingPolicyFields.find(
        field => field.type === 'convertoJson' && field.path === fieldPath
      )

      if (!missing) return ''

      if (missing.reason === 'missing') return 'missing'
      if (missing.reason === 'invalid-format') return 'wrong type'

      return 'warning'
    },

    /**
     * Update fanout candidates based on selected Convert to JSON fields
     * This method parses selected JSON string fields and adds their nested arrays to fanout candidates
     */
    /**
     * Pre-fill Step 3 from uploaded policy data (Update mode - Phase 2)
     * Extracts schema configuration from policy and populates UI
     * @param {Object} schemaRule - The schemaRule object from uploaded policy
     */
    async prefillFromPolicy (schemaRule) {
      try {
        console.log('╔══════════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 3] prefillFromPolicy: Starting pre-fill process')
        console.log('╠══════════════════════════════════════════════════════════════════════════════')
        console.log('║ schemaRule:', JSON.stringify(schemaRule, null, 2))
        console.log('╚══════════════════════════════════════════════════════════════════════════════')

        // Wait for sample data analysis to complete
        // This ensures fanoutCandidates and convertToJsonCandidates are populated
        await this.$nextTick()

        // Step 1: Extract and pre-fill convertToJson fields
        const convertToJsonFields = schemaRule.convertoJson || schemaRule.ConvertoJson || []
        console.log('[Step 3] Extracted convertToJson fields:', convertToJsonFields)

        // Track missing fields for warning display (Scenario 1)
        const missingFields = []

        if (convertToJsonFields.length > 0) {
          // Check each field for existence in sample data
          const fieldsToSelect = []

          console.log('╔══════════════════════════════════════════════════════════════════════════════')
          console.log('║ [Step 3] Processing convertToJson fields from policy')
          console.log('╠══════════════════════════════════════════════════════════════════════════════')
          console.log('║ Current convertToJsonCandidates:', JSON.stringify(this.convertToJsonCandidates))
          console.log('║ Fields to process:', JSON.stringify(convertToJsonFields))
          console.log('╚══════════════════════════════════════════════════════════════════════════════')

          for (const fieldPath of convertToJsonFields) {
            console.log('╔══════════════════════════════════════════════════════════════════════════════')
            console.log('║ [Step 3] Processing field:', fieldPath)
            console.log('╚══════════════════════════════════════════════════════════════════════════════')

            // Check if field exists in sample data
            const fieldExists = this.checkFieldExistsInSampleData(fieldPath)

            if (!fieldExists) {
              console.warn('║ ❌ Field from policy NOT FOUND in sample data:', fieldPath)
              missingFields.push({
                type: 'convertoJson',
                path: fieldPath,
                message: 'Field defined in policy but not found in current sample data',
                reason: 'missing'
              })
            } else {
              console.log('║ ✅ Field from policy FOUND in sample data:', fieldPath)

              // Field exists, now check if it contains stringified JSON
              const formatCheck = this.checkFieldContainsStringifiedJson(fieldPath)

              if (!formatCheck.valid) {
                console.warn('║ ⚠️  Field exists but has WRONG FORMAT:', {
                  path: fieldPath,
                  reason: formatCheck.reason,
                  actualType: formatCheck.actualType
                })

                missingFields.push({
                  type: 'convertoJson',
                  path: fieldPath,
                  message: formatCheck.reason,
                  reason: 'invalid-format',
                  actualType: formatCheck.actualType
                })
              } else {
                console.log('║ ✅ Field has VALID stringified JSON format')
              }
            }

            // Always add to selection (even if missing or invalid format) to reflect policy configuration
            // Three scenarios:
            // 1. Field exists in convertToJsonCandidates (normal case) → add to selection
            // 2. Field is missing from sample data → add to candidates and selection
            // 3. Field exists but has wrong format → add to candidates and selection
            console.log('║')
            console.log('║ Checking if field is in convertToJsonCandidates...')
            console.log('║   convertToJsonCandidates.includes("' + fieldPath + '"):', this.convertToJsonCandidates.includes(fieldPath))

            if (this.convertToJsonCandidates.includes(fieldPath)) {
              // Field already in candidates (normal case)
              fieldsToSelect.push(fieldPath)
              console.log('║ ✓ Field already in convertToJsonCandidates, adding to selection:', fieldPath)
            } else {
              // Field NOT in candidates - either missing or has wrong format
              // Add it to convertToJsonCandidates so it can be displayed with warning
              console.log('║ ✓ Field NOT in candidates - adding it now')
              this.convertToJsonCandidates.push(fieldPath)
              fieldsToSelect.push(fieldPath)

              if (!fieldExists) {
                console.log('║ ✓ Added MISSING field to convertToJsonCandidates:', fieldPath)
              } else {
                console.log('║ ✓ Added INVALID FORMAT field to convertToJsonCandidates:', fieldPath)
              }
            }

            console.log('║')
            console.log('║ Updated state after processing field:')
            console.log('║   convertToJsonCandidates.length:', this.convertToJsonCandidates.length)
            console.log('║   fieldsToSelect.length:', fieldsToSelect.length)
            console.log('╚══════════════════════════════════════════════════════════════════════════════')
          }

          // Store missing fields for warning display
          this.missingPolicyFields = missingFields

          console.log('╔══════════════════════════════════════════════════════════════════════════════')
          console.log('║ [Step 3] SUMMARY: All convertToJson fields processed')
          console.log('╠══════════════════════════════════════════════════════════════════════════════')
          console.log('║ Final convertToJsonCandidates:', JSON.stringify(this.convertToJsonCandidates))
          console.log('║ Fields to select:', JSON.stringify(fieldsToSelect))
          console.log('║ Missing/Invalid fields:', JSON.stringify(missingFields))
          console.log('║')
          console.log('║ Breakdown:')
          console.log('║   - Total candidates:', this.convertToJsonCandidates.length)
          console.log('║   - Total to select:', fieldsToSelect.length)
          console.log('║   - Missing from sample:', missingFields.filter(f => f.reason === 'missing').length)
          console.log('║   - Invalid format:', missingFields.filter(f => f.reason === 'invalid-format').length)
          console.log('╚══════════════════════════════════════════════════════════════════════════════')

          if (fieldsToSelect.length > 0) {
            this.selectedConvertToJsonFields = [...fieldsToSelect]
            console.log('╔══════════════════════════════════════════════════════════════════════════════')
            console.log('║ [Step 3] Setting selectedConvertToJsonFields')
            console.log('╠══════════════════════════════════════════════════════════════════════════════')
            console.log('║ selectedConvertToJsonFields:', JSON.stringify(this.selectedConvertToJsonFields))
            console.log('╚══════════════════════════════════════════════════════════════════════════════')

            // Trigger parsing of JSON fields to discover nested arrays
            // Only parse fields that actually exist in sample data
            const existingFields = fieldsToSelect.filter(field =>
              !missingFields.some(mf => mf.path === field)
            )

            if (existingFields.length > 0) {
              await this.$nextTick()
              console.log('[Step 3] Calling updateFanoutCandidatesFromParsedJson with existingFields:', existingFields)
              this.updateFanoutCandidatesFromParsedJson(existingFields, [])

              // Wait for the fanout candidates to be fully updated
              await this.$nextTick()
              await this.$nextTick()

              console.log('[Step 3] After updateFanoutCandidatesFromParsedJson, fanoutCandidates.length:', this.fanoutCandidates.length)
              console.log('[Step 3] fanoutCandidates paths:', JSON.stringify(this.fanoutCandidates.map(c => c.path)))
            } else {
              console.log('[Step 3] No existing fields to parse for nested arrays')
            }
          } else {
            console.warn('[Step 3] No valid convertToJson fields found')
          }
        } else {
          // No convertToJson fields in policy, clear missing fields
          this.missingPolicyFields = []
        }

        // Step 2: Wait for fanout candidates to be updated after JSON parsing
        // This is critical because fanout arrays from parsed JSON fields won't be in candidates yet
        console.log('[Step 3] === STEP 2: PROCESSING FANOUT PATHS ===')
        console.log('[Step 3] Waiting for all updates to propagate before processing fanout paths...')
        await this.$nextTick()
        await this.$nextTick()

        console.log('[Step 3] fanoutCandidates ready. Total candidates:', this.fanoutCandidates.length)
        console.log('[Step 3] All fanout candidate paths:', JSON.stringify(this.fanoutCandidates.map(c => c.path)))

        // Determine if this is old or new implementation
        const hasOldImplementation = schemaRule.fanout?.inputField && Array.isArray(schemaRule.fanout.inputField)
        const hasNewImplementation = schemaRule.childfanouts && Array.isArray(schemaRule.childfanouts)

        console.log('[Step 3] Implementation type detection:')
        console.log('  - Has old implementation (fanout.inputField):', hasOldImplementation)
        console.log('  - Has new implementation (childfanouts):', hasNewImplementation)

        // Process based on implementation type
        if (hasNewImplementation) {
          // NEW IMPLEMENTATION: Process childfanouts with relative path resolution
          console.log('[Step 3] === USING NEW IMPLEMENTATION (childfanouts) ===')
          await this.processChildFanoutsNew(schemaRule.childfanouts, missingFields)
        } else if (hasOldImplementation) {
          // OLD IMPLEMENTATION: Process fanout.inputField
          console.log('[Step 3] === USING OLD IMPLEMENTATION (fanout.inputField) ===')
          await this.processChildFanoutsOld(schemaRule.fanout.inputField, missingFields)
        } else {
          console.log('[Step 3] No fanout configuration found in policy')
        }

        // Store child fanouts in Vuex if present
        if (hasNewImplementation) {
          this.$store.commit('wizard/SET_CHILD_FANOUTS', schemaRule.childfanouts)
          console.log('[Step 3] Stored child fanouts in Vuex')
        }

        // Update missing policy fields
        this.missingPolicyFields = [...this.missingPolicyFields, ...missingFields]

        // Step 4: Update Vuex store with pre-filled data
        const childFanouts = schemaRule.childfanouts || []
        this.UPDATE_SCHEMA_RULES({
          convertToJson: [...this.selectedConvertToJsonFields],
          fanout: [...this.selectedFanoutFields],
          childfanouts: childFanouts
        })

        console.log('╔══════════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 3] Pre-fill completed successfully')
        console.log('╠══════════════════════════════════════════════════════════════════════════════')
        console.log('║ Final selectedConvertToJsonFields:', this.selectedConvertToJsonFields)
        console.log('║ Final selectedFanoutFields:', this.selectedFanoutFields)
        console.log('║ Stored child fanouts:', childFanouts.length)
        console.log('╚══════════════════════════════════════════════════════════════════════════════')

        // Force UI update
        await this.$nextTick()
        this.$forceUpdate()

        // Show success notification with warning about missing fields if any
        if (this.selectedConvertToJsonFields.length > 0 || this.selectedFanoutFields.length > 0) {
          const missingCount = this.missingPolicyFields.length
          const notificationType = missingCount > 0 ? 'warning' : 'positive'
          const baseMessage = 'Schema configuration loaded from policy'
          const caption = `${this.selectedConvertToJsonFields.length} string-to-JSON fields, ${this.selectedFanoutFields.length} fanout arrays`
          const missingCaption = missingCount > 0
            ? ` (${missingCount} field${missingCount > 1 ? 's' : ''} not found in sample data)`
            : ''

          this.$q?.notify({
            type: notificationType,
            message: baseMessage,
            caption: caption + missingCaption,
            timeout: missingCount > 0 ? 5000 : 3000,
            position: 'top',
            icon: missingCount > 0 ? 'warning' : undefined
          })
        }
      } catch (error) {
        console.error('╔══════════════════════════════════════════════════════════════════════════════')
        console.error('║ [Step 3] Error in prefillFromPolicy:', error)
        console.error('╚══════════════════════════════════════════════════════════════════════════════')

        this.$q?.notify({
          type: 'negative',
          message: 'Failed to load schema configuration from policy',
          caption: error.message,
          timeout: 5000,
          position: 'top'
        })
      }
    },

    /**
     * Process child fanouts using OLD implementation format (fanout.inputField array)
     * This handles absolute paths in a flat array structure
     */
    async processChildFanoutsOld (fanoutPaths, missingFields) {
      console.log('╔══════════════════════════════════════════════════════════════════════════════')
      console.log('║ [Step 3] Processing fanout paths (OLD FORMAT)')
      console.log('╠══════════════════════════════════════════════════════════════════════════════')
      console.log('║ Number of fanout paths:', fanoutPaths.length)
      console.log('║ Paths:', JSON.stringify(fanoutPaths))
      console.log('║ Current fanoutCandidates.length:', this.fanoutCandidates.length)
      console.log('╚══════════════════════════════════════════════════════════════════════════════')

      // Process each fanout path from the policy
      for (let i = 0; i < fanoutPaths.length; i++) {
        const fanoutPath = fanoutPaths[i]

        console.log('╔══════════════════════════════════════════════════════════════════════════════')
        console.log(`║ [Step 3] Processing fanout path [${i + 1}/${fanoutPaths.length}]`)
        console.log('╠══════════════════════════════════════════════════════════════════════════════')
        console.log('║ Original path:', fanoutPath)
        console.log('╚══════════════════════════════════════════════════════════════════════════════')

        // Try multiple path format variations to find a match
        const pathVariations = [
          fanoutPath, // Original with $. prefix
          fanoutPath.replace(/^\$\./, ''), // Without $. prefix
          fanoutPath.replace(/\[\*\]/g, ''), // Without [*] wildcards
          fanoutPath.replace(/^\$\./, '').replace(/\[\*\]/g, ''), // Without both
          fanoutPath.replace(/\[0\]/g, ''), // Without [0] indices
          fanoutPath.replace(/^\$\./, '').replace(/\[0\]/g, '') // Without $. and [0]
        ]

        console.log('[Step 3] Trying path variations:', pathVariations)

        // Find matching candidate
        let matchedPath = null
        for (const variation of pathVariations) {
          const candidate = this.fanoutCandidates.find(c =>
            c.path === variation ||
            c.path === variation.replace(/\[\*\]/g, '') ||
            c.path === variation.replace(/\[0\]/g, '')
          )

          if (candidate) {
            matchedPath = candidate.path
            console.log('[Step 3] ✅ FOUND matching candidate for variation:', variation, '→', matchedPath)
            break
          }
        }

        if (matchedPath) {
          // Add to selectedFanoutFields if not already present
          if (!this.selectedFanoutFields.includes(matchedPath)) {
            this.selectedFanoutFields.push(matchedPath)
            console.log('[Step 3] ✅ Added fanout path to selections:', matchedPath)
          } else {
            console.log('[Step 3] Fanout path already in selections:', matchedPath)
          }
        } else {
          console.warn('[Step 3] ⚠️ Fanout path not found in candidates')
          this.injectMissingFanoutArray(fanoutPath, null, missingFields)
        }
      }

      console.log('╔══════════════════════════════════════════════════════════════════════════════')
      console.log('║ [Step 3] Completed processing fanout paths (OLD FORMAT)')
      console.log('║ Total selectedFanoutFields:', this.selectedFanoutFields.length)
      console.log('║ selectedFanoutFields:', JSON.stringify(this.selectedFanoutFields))
      console.log('╚══════════════════════════════════════════════════════════════════════════════')
    },

    /**
     * Process child fanouts using NEW implementation format (childfanouts array)
     * This handles relative paths with parent-child relationships
     */
    async processChildFanoutsNew (childFanouts, missingFields) {
      console.log('╔══════════════════════════════════════════════════════════════════════════════')
      console.log('║ [Step 3] Processing child fanouts (NEW FORMAT)')
      console.log('╠══════════════════════════════════════════════════════════════════════════════')
      console.log('║ Number of child fanouts:', childFanouts.length)
      console.log('║ Child fanouts:', JSON.stringify(childFanouts, null, 2))
      console.log('╚══════════════════════════════════════════════════════════════════════════════')

      // Build a map of parent paths for absolute path resolution
      // Key: field path, Value: absolute path
      const pathResolutionMap = new Map()

      // First pass: Process root-level arrays (parentpath === null)
      const rootFanouts = childFanouts.filter(cf => cf.parentpath === null)
      const nestedFanouts = childFanouts.filter(cf => cf.parentpath !== null)

      console.log('[Step 3] Root-level fanouts:', rootFanouts.length)
      console.log('[Step 3] Nested fanouts:', nestedFanouts.length)

      // Process root-level arrays first
      for (const cf of rootFanouts) {
        console.log('╔══════════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 3] Processing ROOT-LEVEL fanout')
        console.log('╠══════════════════════════════════════════════════════════════════════════════')
        console.log('║ Field:', cf.field)
        console.log('║ Parent path:', cf.parentpath)
        console.log('╚══════════════════════════════════════════════════════════════════════════════')

        // For root arrays, field is already absolute
        const absolutePath = cf.field
        const normalizedPath = this.normalizeFanoutPath(absolutePath)

        // Store in resolution map
        pathResolutionMap.set(cf.field, normalizedPath)

        // Try to find in candidates
        const matched = this.findFanoutCandidate(absolutePath)

        if (matched) {
          if (!this.selectedFanoutFields.includes(matched)) {
            this.selectedFanoutFields.push(matched)
            console.log('[Step 3] ✅ Added root fanout to selections:', matched)
          }
        } else {
          console.warn('[Step 3] ⚠️ Root fanout not found in candidates')
          this.injectMissingFanoutArray(absolutePath, null, missingFields)
          pathResolutionMap.set(cf.field, normalizedPath)
        }
      }

      // Second pass: Process nested arrays using resolution map
      // Keep trying until all are resolved or no progress is made
      let unprocessed = [...nestedFanouts]
      const maxIterations = 10 // Prevent infinite loops
      let iteration = 0

      while (unprocessed.length > 0 && iteration < maxIterations) {
        iteration++
        console.log(`[Step 3] === Nested fanout resolution pass ${iteration} ===`)
        console.log(`[Step 3] Unprocessed fanouts remaining: ${unprocessed.length}`)

        const stillUnprocessed = []

        for (const cf of unprocessed) {
          console.log('╔══════════════════════════════════════════════════════════════════════════════')
          console.log('║ [Step 3] Processing NESTED fanout')
          console.log('╠══════════════════════════════════════════════════════════════════════════════')
          console.log('║ Field (relative):', cf.field)
          console.log('║ Parent path:', cf.parentpath)
          console.log('╚══════════════════════════════════════════════════════════════════════════════')

          // Check if parent has been resolved
          const parentAbsolutePath = pathResolutionMap.get(cf.parentpath)

          if (!parentAbsolutePath) {
            console.warn('[Step 3] ⚠️ Parent path not yet resolved, deferring:', cf.parentpath)
            stillUnprocessed.push(cf)
            continue
          }

          console.log('[Step 3] Parent resolved to:', parentAbsolutePath)

          // Build absolute path by combining parent + relative field
          // field is relative to parent, so we need to strip $. and append
          const relativeField = cf.field.replace(/^\$\./, '')
          const absolutePath = `${parentAbsolutePath}.${relativeField}`

          console.log('[Step 3] Constructed absolute path:', absolutePath)

          const normalizedPath = this.normalizeFanoutPath(absolutePath)

          // Store in resolution map
          pathResolutionMap.set(cf.field, normalizedPath)

          // Try to find in candidates
          const matched = this.findFanoutCandidate(absolutePath)

          if (matched) {
            if (!this.selectedFanoutFields.includes(matched)) {
              this.selectedFanoutFields.push(matched)
              console.log('[Step 3] ✅ Added nested fanout to selections:', matched)
            }
          } else {
            console.warn('[Step 3] ⚠️ Nested fanout not found in candidates')
            this.injectMissingFanoutArray(absolutePath, parentAbsolutePath, missingFields)
            pathResolutionMap.set(cf.field, normalizedPath)
          }
        }

        unprocessed = stillUnprocessed
      }

      if (unprocessed.length > 0) {
        console.error('[Step 3] ⚠️ Failed to resolve all nested fanouts after', iteration, 'iterations')
        console.error('[Step 3] Unresolved fanouts:', unprocessed.map(cf => cf.field))
      }

      console.log('╔══════════════════════════════════════════════════════════════════════════════')
      console.log('║ [Step 3] Completed processing child fanouts (NEW FORMAT)')
      console.log('║ Total selectedFanoutFields:', this.selectedFanoutFields.length)
      console.log('║ selectedFanoutFields:', JSON.stringify(this.selectedFanoutFields))
      console.log('║ Path resolution map:', Array.from(pathResolutionMap.entries()))
      console.log('╚══════════════════════════════════════════════════════════════════════════════')
    },

    /**
     * Normalize fanout path by removing $. prefix and [*] wildcards
     */
    normalizeFanoutPath (path) {
      return path.replace(/^\$\./, '').replace(/\[\*\]/g, '')
    },

    /**
     * Find a fanout candidate using various path format variations
     */
    findFanoutCandidate (fanoutPath) {
      const pathVariations = [
        fanoutPath, // Original
        fanoutPath.replace(/^\$\./, ''), // Without $. prefix
        fanoutPath.replace(/\[\*\]/g, ''), // Without [*] wildcards
        fanoutPath.replace(/^\$\./, '').replace(/\[\*\]/g, ''), // Without both
        fanoutPath.replace(/\[0\]/g, ''), // Without [0] indices
        fanoutPath.replace(/^\$\./, '').replace(/\[0\]/g, '') // Without $. and [0]
      ]

      for (const variation of pathVariations) {
        const candidate = this.fanoutCandidates.find(c =>
          c.path === variation ||
          c.path === variation.replace(/\[\*\]/g, '') ||
          c.path === variation.replace(/\[0\]/g, '')
        )

        if (candidate) {
          console.log('[Step 3] Found candidate match:', variation, '→', candidate.path)
          return candidate.path
        }
      }

      return null
    },

    /**
     * Inject a missing fanout array as a synthetic candidate
     */
    injectMissingFanoutArray (fanoutPath, parentPath, missingFields) {
      console.log('[Step 3] 📌 Injecting missing fanout array as synthetic candidate')

      // Normalize the path
      const normalizedPath = this.normalizeFanoutPath(fanoutPath)
      const normalizedParentPath = parentPath ? this.normalizeFanoutPath(parentPath) : null

      // Create synthetic candidate object
      const syntheticCandidate = {
        path: normalizedPath,
        parentPath: normalizedParentPath,
        isHomogeneous: true,
        elementType: 'unknown',
        isParsedField: false,
        isNestedFanout: !!normalizedParentPath,
        isMissing: true,
        originalPolicyPath: fanoutPath
      }

      console.log('[Step 3] Created synthetic candidate:', JSON.stringify(syntheticCandidate))

      // Add to fanoutCandidates
      this.fanoutCandidates.push(syntheticCandidate)

      // Add to selectedFanoutFields
      if (!this.selectedFanoutFields.includes(normalizedPath)) {
        this.selectedFanoutFields.push(normalizedPath)
      }

      // Track in missing fields for warning display
      missingFields.push({
        type: 'fanout',
        path: normalizedPath,
        message: normalizedParentPath
          ? 'Nested array field defined in policy but not found in current sample data'
          : 'Array field defined in policy but not found in current sample data',
        reason: 'missing',
        originalPath: fanoutPath,
        parentPath: normalizedParentPath
      })

      console.log('[Step 3] ✅ Injected and selected missing fanout array:', normalizedPath)
    },

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

      // Store the current selection state before making any changes
      // This will be used to restore selections after updating fanout candidates
      const selectedFanoutFieldsBackup = [...this.selectedFanoutFields]
      console.log('[DEBUG] Backed up current selections:', selectedFanoutFieldsBackup)

      // Create a path normalization mapping to handle paths with or without $. prefix
      // This is crucial for maintaining selections across navigation
      const selectedPathsMap = new Map()
      selectedFanoutFieldsBackup.forEach(path => {
        // Store each path by its normalized version (without $. prefix)
        const normalizedPath = path.startsWith('$.') ? path.substring(2) : path
        selectedPathsMap.set(normalizedPath, path)
      })

      console.log('╔═══════════════════════════════════════════════════════════════════════')
      console.log('║ [DEBUG] Initial selected paths mapping:')
      selectedPathsMap.forEach((originalPath, normalizedPath) => {
        console.log(`║   "${normalizedPath}" → "${originalPath}" (original)`)
      })
      console.log('╚═══════════════════════════════════════════════════════════════════════')

      // Start with base fanout candidates
      let updatedCandidates = [...this.baseFanoutCandidates]
      console.log('[DEBUG] Starting with baseFanoutCandidates:', updatedCandidates.length, 'candidates')

      // Remove arrays from deselected JSON fields
      for (const removedField of removedFields) {
        console.log('╔═══════════════════════════════════════════════════════════════════════')
        console.log('║ [DEBUG] Processing Removed Field:', removedField)
        console.log('╠═══════════════════════════════════════════════════════════════════════')

        // Remove parsed JSON data from Vuex when field is deselected
        this.$store.commit('wizard/REMOVE_PARSED_STRINGIFIED_JSON', removedField)

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

        // Normalize paths for comparison with selectedFanoutFields
        // We need to handle both formats: with and without $. prefix
        // Create a set of normalized paths for efficient lookup
        const normalizedPathsToRemove = new Set()
        arraysToRemove.forEach(path => {
          // Add both full path and without prefix versions to cover all bases
          normalizedPathsToRemove.add(path) // Full path
          if (path.startsWith('$.')) {
            normalizedPathsToRemove.add(path.substring(2)) // Without prefix
          } else {
            normalizedPathsToRemove.add(`$.${path}`) // With prefix added
          }
        })

        console.log('║   Normalized paths to remove set:',
          Array.from(normalizedPathsToRemove).map(p => `"${p}"`).join(', '))

        // Step 2: Remove from selectedFanoutFields
        if (normalizedPathsToRemove.size > 0) {
          console.log('╠═══════════════════════════════════════════════════════════════════════')
          console.log('║ [DEBUG] Step 2: Remove from selectedFanoutFields')
          console.log('║   selectedFanoutFields BEFORE filter:', JSON.stringify(this.selectedFanoutFields))
          const originalLength = this.selectedFanoutFields.length

          // Remove items from the selectedPathsMap also
          normalizedPathsToRemove.forEach(path => {
            const normalized = path.startsWith('$.') ? path.substring(2) : path
            if (selectedPathsMap.has(normalized)) {
              console.log(`║   [REMOVING] from selectedPathsMap: "${normalized}"`)
              selectedPathsMap.delete(normalized)
            }
          })

          // Filter selectedFanoutFields using the same normalized path check
          this.selectedFanoutFields = this.selectedFanoutFields.filter(path => {
            // Convert to normalized form for checking
            const normalized = path.startsWith('$.') ? path.substring(2) : path

            // Check if this path is in the remove set (with or without prefix)
            const shouldRemove = normalizedPathsToRemove.has(path) ||
                               normalizedPathsToRemove.has(normalized) ||
                               normalizedPathsToRemove.has(`$.${normalized}`)

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

            // Step 3: Update Vuex store
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

            // Store parsed JSON data in Vuex for Step 5 to use
            console.log('╔════════════════════════════════════════════════════════════════════════')
            console.log('║ [Step  3] Storing parsed JSON in Vuex')
            console.log('╠════════════════════════════════════════════════════════════════════════')
            console.log('║ fieldPath:', addedField)
            console.log('║ parsedData type:', typeof parseResult.parsedData)
            console.log('║ parsedData:', JSON.stringify(parseResult.parsedData, null, 2))
            console.log('╚════════════════════════════════════════════════════════════════════════')

            this.$store.commit('wizard/SET_PARSED_STRINGIFIED_JSON', {
              fieldPath: addedField,
              parsedData: parseResult.parsedData
            })

            // Verify it was stored correctly
            const storedData = this.$store.state.wizard.schemaRules.parsedStringifiedJsonFields
            console.log('╔════════════════════════════════════════════════════════════════════════')
            console.log('║ [Step 3] Verifying stored data in Vuex')
            console.log('╠════════════════════════════════════════════════════════════════════════')
            console.log('║ storedData keys:', Object.keys(storedData || {}))
            console.log('║ storedData[', addedField, ']:', storedData ? storedData[addedField] : 'NOT FOUND')
            console.log('╚════════════════════════════════════════════════════════════════════════')
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

              // Store parsed JSON data in Vuex for Step 5 to use
              this.$store.commit('wizard/SET_PARSED_STRINGIFIED_JSON', {
                fieldPath: field,
                parsedData: parseResult.parsedData
              })
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

      // Create a comprehensive path mapping between all possible formats
      // This ensures robust selection restoration regardless of path format
      const pathMapping = new Map()

      // For each fanout candidate, create mappings for all possible path formats
      this.fanoutCandidates.forEach(candidate => {
        const fullPath = candidate.path
        const withoutPrefix = fullPath.startsWith('$.') ? fullPath.substring(2) : fullPath
        const withPrefix = fullPath.startsWith('$.') ? fullPath : `$.${fullPath}`

        // Map all variants to the path format used by the component
        pathMapping.set(fullPath, fullPath)
        pathMapping.set(withoutPrefix, fullPath)
        pathMapping.set(withPrefix, fullPath)
      })

      console.log('╔═══════════════════════════════════════════════════════════════════════')
      console.log('║ [DEBUG] Comprehensive path mapping:')
      pathMapping.forEach((mappedPath, key) => {
        console.log(`║   "${key}" → "${mappedPath}"`)
      })
      console.log('╚═══════════════════════════════════════════════════════════════════════')

      // Restore selections using the comprehensive path mapping
      const restoredSelections = []

      // Process each path from the selectedPathsMap backup
      selectedPathsMap.forEach((originalPath, normalizedPath) => {
        // Check if this path exists in any format in the new candidates
        const mappedPath = pathMapping.get(originalPath) || pathMapping.get(normalizedPath) ||
                         pathMapping.get(`$.${normalizedPath}`)

        if (mappedPath) {
          console.log(`[DEBUG] Restoring selection: "${originalPath}" → "${mappedPath}"`)
          restoredSelections.push(mappedPath)
        } else {
          console.log(`[DEBUG] Path no longer exists, dropping: "${originalPath}"`)
        }
      })

      // Update selections with the restored paths
      this.selectedFanoutFields = restoredSelections

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
      console.log('║ [DEBUG] Restored selections:')
      console.log('║   Original backup selections:', selectedFanoutFieldsBackup.length)
      console.log('║   Final restored selections:', this.selectedFanoutFields.length)
      console.log('╚═══════════════════════════════════════════════════════════════════════')

      // Force reactivity update
      this.$forceUpdate()
    },

    proceedToNext () {
      console.log('=== Step 3 proceedToNext: Processing ===')

      try {
        // Make defensive copies of arrays
        const fieldsToConvertToJson = [...this.selectedConvertToJsonFields]
        const fieldsForFanout = [...this.selectedFanoutFields]

        // Use available fanout candidates or empty array as fallback
        const availableFanoutCandidates = Array.isArray(this.fanoutCandidates)
          ? this.fanoutCandidates
          : []

        // Build childfanouts structure with error handling
        let childfanouts = []
        try {
          childfanouts = SchemaRuleService.buildChildFanouts(
            fieldsForFanout,
            availableFanoutCandidates
          )
          console.log('=== Step 3 proceedToNext: Successfully built childfanouts ===', childfanouts.length)
        } catch (error) {
          console.error('=== Step 3 proceedToNext: Error building childfanouts ===', error)
          // Create empty childfanouts in case of error
          childfanouts = []
        }

        // Update Vuex store with schema configuration
        this.UPDATE_SCHEMA_RULES({
          convertToJson: fieldsToConvertToJson,
          fanout: fieldsForFanout,
          childfanouts // Store the built childfanouts for policy generation
        })

        console.log('=== Step 3 proceedToNext: Schema rules updated in store ===')
      } catch (error) {
        console.error('=== Step 3 proceedToNext: Error updating schema rules ===', error)
      }

      // Validate (optional step, so always valid)
      this.$emit('step-valid')
      this.$emit('next-step')
    }
  },

  async created () {
    console.log('=== Step 3 Created: Initializing component ===')

    // Initialize from store state if available
    const storeSchemaRules = this.$store.state.wizard?.schemaRules
    console.log('Store schemaRules:', storeSchemaRules)

    if (storeSchemaRules) {
      const storedConvertToJson = storeSchemaRules.convertToJson || []
      const storedFanout = storeSchemaRules.fanout || []

      if (storedConvertToJson.length > 0 || storedFanout.length > 0) {
        console.log('=== Step 3: Restoring previous selections from Vuex store ===')
        console.log('Restoring Convert to JSON fields:', storedConvertToJson)
        console.log('Restoring Fanout fields:', storedFanout)

        this.selectedConvertToJsonFields = [...storedConvertToJson]

        // Handle different path formats for fanout fields
        // Some paths may have '$.' prefix, others may not
        const normalizedFanout = storedFanout.map(path => {
          // Preserve the path format as-is, we'll handle both formats in updateFanoutCandidatesFromParsedJson
          // and in JsonTreeViewer's handling of selected paths
          return path
        })

        // Explicitly set the selectedFanoutFields and force an update
        this.$nextTick(() => {
          console.log('[DEBUG] Setting selectedFanoutFields in nextTick:', normalizedFanout)
          this.selectedFanoutFields = [...normalizedFanout]

          // Add a small delay to ensure the value is available when JsonTreeViewer is created
          setTimeout(() => {
            console.log('[DEBUG] Verifying selectedFanoutFields after delay:', this.selectedFanoutFields)
            this.$forceUpdate()
          }, 100)
        })
      } else {
        console.log('=== Step 3: No previous selections found in store ===')
      }
    } else {
      console.log('=== Step 3: Store schemaRules not available ===')
    }

    // Analyze sample data if available
    this.analyzeSampleData()
  },

  async mounted () {
    console.log('╔══════════════════════════════════════════════════════════════════════════════')
    console.log('║ [Step 3] Mounted: Checking for Update mode pre-fill')
    console.log('╚══════════════════════════════════════════════════════════════════════════════')

    // Check if Step 3 already has data (user navigating back)
    const hasExistingStep3Data = (
      (this.selectedConvertToJsonFields && this.selectedConvertToJsonFields.length > 0) ||
      (this.selectedFanoutFields && this.selectedFanoutFields.length > 0)
    )

    if (hasExistingStep3Data) {
      console.log('[Step 3] Step 3 already has data, skipping pre-fill')
      console.log('[Step 3] Existing convertToJson:', this.selectedConvertToJsonFields)
      console.log('[Step 3] Existing fanout:', this.selectedFanoutFields)
      return
    }

    // Check wizard mode
    const mode = this.$store.state.wizard?.projectConfig?.mode
    console.log('[Step 3] Wizard mode:', mode)

    if (mode === 'update') {
      const policyData = this.$store.state.wizard?.policyUpload?.uploadedPolicyData

      if (policyData && policyData.schemaRule) {
        console.log('[Step 3] Update mode detected with policy data - initiating pre-fill')
        await this.prefillFromPolicy(policyData.schemaRule)
      } else {
        console.log('[Step 3] Update mode but no policy schemaRule found')
      }
    } else {
      console.log('[Step 3] Create mode - no pre-fill needed')
    }
  },

  beforeDestroy () {
    console.log('=== Step 3 beforeDestroy: Saving selections to store ===')
    console.log('Current selectedConvertToJsonFields:', this.selectedConvertToJsonFields)
    console.log('Current selectedFanoutFields:', this.selectedFanoutFields)
    console.log('Current fanoutCandidates count:', this.fanoutCandidates ? this.fanoutCandidates.length : 0)

    try {
      // Always save current selections before component is destroyed
      // This ensures selections are preserved regardless of navigation direction
      if (this.selectedConvertToJsonFields.length > 0 || this.selectedFanoutFields.length > 0) {
        // Make a defensive copy of the arrays to avoid any mutation issues
        const fieldsToConvertToJson = [...this.selectedConvertToJsonFields]
        const fieldsForFanout = [...this.selectedFanoutFields]

        // Use available fanout candidates or an empty array as fallback
        const availableFanoutCandidates = Array.isArray(this.fanoutCandidates)
          ? this.fanoutCandidates
          : []

        // Build childfanouts structure with error handling
        let childfanouts = []
        try {
          childfanouts = SchemaRuleService.buildChildFanouts(
            fieldsForFanout,
            availableFanoutCandidates
          )
          console.log('=== Step 3 beforeDestroy: Successfully built childfanouts ===', childfanouts.length)
        } catch (error) {
          console.error('=== Step 3 beforeDestroy: Error building childfanouts ===', error)
          // Create empty childfanouts in case of error
          childfanouts = []
        }

        // Update Vuex store with current selections
        this.UPDATE_SCHEMA_RULES({
          convertToJson: fieldsToConvertToJson,
          fanout: fieldsForFanout,
          childfanouts // Store the built childfanouts for policy generation
        })

        console.log('=== Step 3 beforeDestroy: Selections saved to store ===')
      } else {
        console.log('=== Step 3 beforeDestroy: No selections to save (both arrays empty) ===')
      }
    } catch (error) {
      console.error('=== Step 3 beforeDestroy: Error saving selections ===', error)
    }
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

/* Warning styling for missing fields (Scenario 1) */
.text-warning {
  color: #f2c037 !important;
}

/* Error styling for invalid format fields (Scenario 2) */
.text-negative {
  color: #c10015 !important;
}

.json-field-list .q-item {
  transition: background-color 0.2s ease;
}

.json-field-list .q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
