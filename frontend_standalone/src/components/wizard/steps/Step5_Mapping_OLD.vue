<template>
  <div class="step-mapping">
    <div class="step-header">
      <div class="step-icon">
        <q-icon name="account_tree" size="48px" class="text-primary" />
      </div>
      <div class="step-title-section">
        <h2 class="step-title">Field Mapping</h2>
        <p class="step-subtitle">
          Map JSON fields to LogRhythm schema fields for log normalization.
        </p>
      </div>
    </div>

    <div class="step-content">
      <q-card class="wizard-card">
        <q-card-section class="card-header">
          <div class="card-title">
            <q-icon name="account_tree" class="q-mr-sm" />
            Field Mapping Configuration
          </div>
          <p class="card-description">
            Create mappings between your JSON data fields and LogRhythm's normalized schema fields.
          </p>
        </q-card-section>

        <q-card-section>
          <!-- Loading State -->
          <div v-if="isExtractingFields" class="loading-state">
            <q-spinner color="primary" size="48px" />
            <p class="loading-message">Extracting fields from sample data...</p>
          </div>

          <!-- No Sample Data Warning -->
          <div v-else-if="availableJsonPaths.length === 0" class="no-fields-warning">
            <q-icon name="warning" size="48px" color="warning" />
            <p class="no-fields-message">
              No JSON fields available for mapping.
              Please complete Step 2 (Sample Data) first.
            </p>
            <q-btn
              flat
              color="primary"
              label="Go to Sample Data"
              icon="arrow_back"
              @click="goToSampleDataStep"
              no-caps
              class="q-mt-md"
            />
          </div>

          <!-- Mapping Builder -->
          <div v-else>
            <!-- Toolbar -->
            <div class="mapping-tools">
              <div class="mapping-stats">
                <q-chip color="primary" text-color="white" icon="info">
                  {{ localMappings.length }} mappings defined
                </q-chip>

                <q-chip color="accent" text-color="white" icon="info">
                  {{ availableJsonPaths.length }} fields available
                </q-chip>
              </div>

              <div class="mapping-actions">
                <q-btn
                  flat
                  color="grey-7"
                  label="Clear All"
                  icon="delete_sweep"
                  :disable="localMappings.length === 0 || isSaving"
                  @click="clearAllMappings"
                  no-caps
                  class="q-mr-sm"
                >
                  <q-tooltip>Clear all mappings</q-tooltip>
                </q-btn>

                <q-btn
                  unelevated
                  color="primary"
                  label="Add Mapping"
                  icon="add"
                  :disable="isSaving"
                  @click="openAddMapping"
                  no-caps
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Mappings Table -->
            <div class="mapping-table-container">
              <q-table
                :data="localMappings"
                :columns="mappingColumns"
                row-key="id"
                bordered
                flat
                :pagination="{ rowsPerPage: 10 }"
                class="mapping-table"
                :loading="isSaving"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="inputRule" :props="props">
                      <div class="json-path-cell">
                        {{ props.row.inputRule }}
                        <q-tooltip>{{ props.row.inputRule }}</q-tooltip>
                      </div>
                    </q-td>

                    <q-td key="lrSchemaField" :props="props">
                      <div class="schema-field-cell">
                        {{ props.row.lrSchemaField }}
                      </div>
                    </q-td>

                    <q-td key="type" :props="props">
                      <q-badge :color="getTypeColor(props.row.type)">
                        {{ props.row.type }}
                      </q-badge>
                    </q-td>

                    <q-td key="operations" :props="props">
                      <div class="operations-cell">
                        <q-chip v-if="props.row.format" size="sm" outline color="secondary">
                          Format: {{ props.row.format }}
                        </q-chip>
                        <q-chip v-if="props.row.default" size="sm" outline color="accent">
                          Default: {{ props.row.default }}
                        </q-chip>
                        <q-chip
                          v-if="props.row.alternativeFields && props.row.alternativeFields.length > 0"
                          size="sm"
                          outline
                          color="info"
                        >
                          {{ props.row.alternativeFields.length }} alt fields
                          <q-tooltip>{{ props.row.alternativeFields.join(', ') }}</q-tooltip>
                        </q-chip>
                      </div>
                    </q-td>

                    <q-td key="actions" :props="props">
                      <div class="action-buttons">
                        <q-btn
                          flat
                          round
                          size="sm"
                          color="info"
                          icon="edit"
                          :disable="isSaving"
                          @click="editMapping(props.row)"
                        >
                          <q-tooltip>Edit mapping</q-tooltip>
                        </q-btn>

                        <q-btn
                          flat
                          round
                          size="sm"
                          color="negative"
                          icon="delete"
                          :disable="isSaving"
                          @click="deleteMapping(props.row.id)"
                        >
                          <q-tooltip>Remove mapping</q-tooltip>
                        </q-btn>
                      </div>
                    </q-td>
                  </q-tr>
                </template>

                <template v-slot:no-data>
                  <div class="no-mappings">
                    <q-icon name="info" size="2rem" color="grey-7" />
                    <p class="q-mt-sm">No field mappings defined yet</p>
                    <q-btn
                      color="primary"
                      label="Add Your First Mapping"
                      no-caps
                      unelevated
                      icon="add"
                      @click="openAddMapping"
                      class="q-mt-sm"
                    />
                  </div>
                </template>
              </q-table>
            </div>
          </div>

          <!-- Add/Edit Mapping Dialog -->
          <q-dialog v-model="mappingDialog" persistent>
            <q-card style="min-width: 600px; max-width: 90vw;">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ editingMapping ? 'Edit' : 'Add' }} Field Mapping</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>

              <q-separator />

              <q-card-section class="mapping-form-section">
                <div class="mapping-form">
                  <div class="row q-col-gutter-md">
                    <!-- Input Rule (JSON Path) -->
                    <div class="col-12">
                      <q-select
                        v-model="mappingForm.inputRule"
                        :options="availableJsonPaths"
                        label="JSON Path *"
                        hint="Source field from your JSON data"
                        outlined
                        dense
                        use-input
                        emit-value
                        map-options
                        option-value="value"
                        option-label="label"
                        popup-content-class="dropdown-dark"
                        :error="!!validationErrors.inputRule"
                        :error-message="validationErrors.inputRule"
                        class="full-width"
                        @input="onInputRuleChange"
                      >
                        <template v-slot:option="scope">
                          <q-item
                            v-bind="scope.itemProps"
                            v-on="scope.itemEvents"
                            clickable
                          >
                            <q-item-section>
                              <q-item-label>{{ scope.opt.label }}</q-item-label>
                              <q-item-label caption>
                                Type: {{ scope.opt.type }}
                                <span v-if="scope.opt.sampleValue"> | Sample: {{ scope.opt.sampleValue }}</span>
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>

                    <!-- LR Schema Field -->
                    <div class="col-12">
                      <q-select
                        v-model="mappingForm.lrSchemaField"
                        :options="lrSchemaFields"
                        label="LogRhythm Schema Field *"
                        hint="Target normalized field in LogRhythm"
                        outlined
                        dense
                        use-input
                        emit-value
                        map-options
                        option-value="value"
                        option-label="label"
                        popup-content-class="dropdown-dark"
                        :error="!!validationErrors.lrSchemaField"
                        :error-message="validationErrors.lrSchemaField"
                        class="full-width"
                      >
                        <template v-slot:option="scope">
                          <q-item
                            v-bind="scope.itemProps"
                            v-on="scope.itemEvents"
                            clickable
                          >
                            <q-item-section>
                              <q-item-label>{{ scope.opt.label }}</q-item-label>
                              <q-item-label caption>
                                Category: {{ scope.opt.category }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>

                    <!-- Data Type -->
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="mappingForm.type"
                        :options="dataTypeOptions"
                        label="Data Type *"
                        hint="Type of the field value"
                        outlined
                        dense
                        emit-value
                        map-options
                        option-value="value"
                        option-label="label"
                        popup-content-class="dropdown-dark"
                        :error="!!validationErrors.type"
                        :error-message="validationErrors.type"
                        class="full-width"
                      />
                    </div>

                    <!-- Format -->
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="mappingForm.format"
                        label="Format (optional)"
                        hint="e.g., yyyy-MM-dd HH:mm:ss for DateTime"
                        outlined
                        dense
                        class="full-width"
                      >
                        <template v-slot:append>
                          <q-icon name="help_outline" color="grey-6">
                            <q-tooltip max-width="300px">
                              Format string for data transformation:<br>
                              - DateTime: yyyy-MM-dd HH:mm:ss.SSS<br>
                              - Use standard format patterns
                            </q-tooltip>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>

                    <!-- Default Value -->
                    <div class="col-12">
                      <q-input
                        v-model="mappingForm.default"
                        label="Default Value (optional)"
                        hint="Value to use if field is missing"
                        outlined
                        dense
                        class="full-width"
                      />
                    </div>

                    <!-- Alternative Fields -->
                    <div class="col-12">
                      <q-select
                        v-model="mappingForm.alternativeFields"
                        :options="alternativeFieldOptions"
                        label="Alternative Fields (optional)"
                        hint="Fallback fields if primary field is missing"
                        outlined
                        dense
                        use-chips
                        multiple
                        use-input
                        emit-value
                        map-options
                        option-value="value"
                        option-label="label"
                        popup-content-class="dropdown-dark"
                        class="full-width"
                      />
                    </div>

                    <!-- Fanout Parent Element -->
                    <div class="col-12">
                      <q-input
                        v-model="mappingForm.fanoutParentElement"
                        label="Fanout Parent Element (optional)"
                        hint="e.g., $.events[*] - for array iteration"
                        outlined
                        dense
                        class="full-width"
                      >
                        <template v-slot:append>
                          <q-icon name="help_outline" color="grey-6">
                            <q-tooltip max-width="300px">
                              JSON path to parent array element for fanout processing.<br>
                              Use [*] to indicate array iteration.<br>
                              Example: $.events[*]
                            </q-tooltip>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions align="right">
                <q-btn flat label="Cancel" color="grey" v-close-popup no-caps />
                <q-btn
                  unelevated
                  label="Save"
                  color="primary"
                  :loading="isValidatingMapping"
                  @click="saveMapping"
                  no-caps
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </q-card-section>
      </q-card>
    </div>

    <div class="step-actions">
      <q-btn
        flat
        icon="arrow_back"
        label="Previous"
        :disable="isSaving"
        @click="$emit('prev-step')"
        class="wizard-btn wizard-btn--secondary"
      />

      <q-btn
        unelevated
        color="primary"
        icon-right="arrow_forward"
        label="Continue to Review"
        :loading="isSaving"
        @click="proceedToNext"
        class="wizard-btn wizard-btn--primary"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { MappingService } from '../../../services/wizard/mappingService'

/**
 * Step 5: Field Mapping Component
 * Production-ready implementation with comprehensive error handling,
 * loading states, accessibility, and state management
 *
 * @component
 * @production-ready
 */
export default {
  name: 'Step5_Mapping',

  data () {
    return {
      // Local state (deep cloned to prevent mutations)
      localMappings: [],
      availableJsonPaths: [],

      // Loading states
      isExtractingFields: false,
      isSaving: false,
      isValidatingMapping: false,

      // Dialog state
      mappingDialog: false,
      editingMapping: null,

      // Form data
      mappingForm: {
        id: null,
        inputRule: '',
        lrSchemaField: '',
        type: 'String',
        format: null,
        default: null,
        alternativeFields: [],
        fanoutParentElement: null
      },

      // Validation errors for form
      validationErrors: {},

      // Options for selects
      lrSchemaFields: [],
      dataTypeOptions: [],

      // Component lifecycle flag
      isDestroyed: false,

      // Table columns
      mappingColumns: [
        {
          name: 'inputRule',
          label: 'JSON Path',
          field: 'inputRule',
          align: 'left',
          sortable: true,
          style: 'max-width: 200px; overflow: hidden; text-overflow: ellipsis;'
        },
        {
          name: 'lrSchemaField',
          label: 'LR Schema Field',
          field: 'lrSchemaField',
          align: 'left',
          sortable: true
        },
        {
          name: 'type',
          label: 'Type',
          field: 'type',
          align: 'center',
          sortable: true
        },
        {
          name: 'operations',
          label: 'Operations',
          field: 'operations',
          align: 'left'
        },
        {
          name: 'actions',
          label: 'Actions',
          field: 'actions',
          align: 'center'
        }
      ]
    }
  },

  computed: {
    ...mapState('wizard', ['sampleData', 'fieldMappings']),

    /**
     * Alternative field options (exclude currently selected input rule)
     */
    alternativeFieldOptions () {
      return this.availableJsonPaths.filter(path =>
        path.value !== this.mappingForm.inputRule
      )
    }
  },

  methods: {
    ...mapMutations('wizard', [
      'ADD_FIELD_MAPPING',
      'UPDATE_FIELD_MAPPING',
      'REMOVE_FIELD_MAPPING',
      'UPDATE_FIELD_MAPPINGS'
    ]),

    /**
     * Extract JSON paths from sample data
     * @async
     */
    async extractJsonPathsFromSampleData () {
      // Prevent execution if component is destroyed
      if (this.isDestroyed) {
        return
      }

      // Validate required data
      if (!this.sampleData || !this.sampleData.parsedData || !this.sampleData.dataStructure) {
        this.availableJsonPaths = []
        return
      }

      // Set loading state
      this.isExtractingFields = true

      try {
        // Use MappingService to extract JSON paths with error handling
        const paths = MappingService.extractJsonPaths(
          this.sampleData.parsedData,
          this.sampleData.dataStructure
        )

        // Validate extracted paths
        if (!Array.isArray(paths)) {
          throw new Error('Invalid paths array returned from service')
        }

        // Update local state
        this.availableJsonPaths = paths

        // Show notification if no fields found
        if (paths.length === 0) {
          this.$q.notify({
            type: 'warning',
            message: 'No JSON fields found in sample data',
            caption: 'Your data may not contain mappable fields',
            position: 'top',
            timeout: 3000
          })
        }
      } catch (error) {
        console.error('[Step 5] Error extracting JSON paths:', error)
        this.availableJsonPaths = []

        this.$q.notify({
          type: 'negative',
          message: 'Failed to extract JSON paths from sample data',
          caption: error.message || 'An unexpected error occurred',
          position: 'top',
          timeout: 5000
        })
      } finally {
        // Clear loading state
        this.isExtractingFields = false
      }
    },

    /**
     * Load LogRhythm schema fields from service
     */
    loadLRSchemaFields () {
      try {
        this.lrSchemaFields = MappingService.getLRSchemaFields()
      } catch (error) {
        console.error('[Step 5] Error loading LR schema fields:', error)
        this.lrSchemaFields = []
      }
    },

    /**
     * Load data type options from service
     */
    loadDataTypeOptions () {
      try {
        this.dataTypeOptions = MappingService.getDataTypeOptions()
      } catch (error) {
        console.error('[Step 5] Error loading data type options:', error)
        this.dataTypeOptions = []
      }
    },

    /**
     * Get color for data type badge
     * @param {string} type - Data type
     * @returns {string} Color name
     */
    getTypeColor (type) {
      const colorMap = {
        String: 'primary',
        DateTime: 'secondary',
        Number: 'accent',
        Decimal: 'positive',
        Boolean: 'warning'
      }
      return colorMap[type] || 'grey'
    },

    /**
     * Open add mapping dialog
     */
    openAddMapping () {
      try {
        this.editingMapping = null
        this.validationErrors = {}

        // Create empty mapping using service
        const emptyMapping = MappingService.createEmptyMapping(this.availableJsonPaths)
        this.mappingForm = { ...emptyMapping }

        this.mappingDialog = true
      } catch (error) {
        console.error('[Step 5] Error opening add mapping dialog:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to open mapping dialog',
          caption: error.message || 'An unexpected error occurred',
          position: 'top'
        })
      }
    },

    /**
     * Edit an existing mapping
     * @param {Object} mapping - Mapping to edit
     */
    editMapping (mapping) {
      try {
        this.editingMapping = mapping
        this.validationErrors = {}

        // Deep clone to prevent mutations
        this.mappingForm = JSON.parse(JSON.stringify(mapping))

        this.mappingDialog = true
      } catch (error) {
        console.error('[Step 5] Error editing mapping:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to edit mapping',
          caption: error.message || 'An unexpected error occurred',
          position: 'top'
        })
      }
    },

    /**
     * Handle input rule change to suggest LR field
     * @param {string} value - Selected JSON path
     */
    onInputRuleChange (value) {
      try {
        if (!value) return

        // Find the selected path option
        const selectedPath = this.availableJsonPaths.find(p => p.value === value)

        if (selectedPath && !this.mappingForm.lrSchemaField) {
          // Get recommendation from service
          const recommendation = MappingService.getRecommendedLRField(
            value,
            selectedPath.type,
            selectedPath.sampleValue
          )

          if (recommendation) {
            this.mappingForm.lrSchemaField = recommendation
            this.$q.notify({
              type: 'info',
              message: `Suggested field: ${recommendation}`,
              caption: 'You can change this if needed',
              position: 'top',
              timeout: 2000
            })
          }
        }
      } catch (error) {
        console.error('[Step 5] Error handling input rule change:', error)
      }
    },

    /**
     * Validate and save mapping
     * @async
     */
    async saveMapping () {
      try {
        this.isValidatingMapping = true
        this.validationErrors = {}

        // Validate mapping using service
        const validation = MappingService.validateMapping(this.mappingForm)

        if (!validation.isValid) {
          // Map errors to form fields
          validation.errors.forEach(error => {
            if (error.includes('Input Rule')) {
              this.validationErrors.inputRule = error
            } else if (error.includes('Schema Field')) {
              this.validationErrors.lrSchemaField = error
            } else if (error.includes('Type')) {
              this.validationErrors.type = error
            }
          })

          this.$q.notify({
            type: 'warning',
            message: 'Please fix validation errors',
            caption: validation.errors[0],
            position: 'top',
            timeout: 3000
          })

          return
        }

        // Check for duplicates
        const duplicateCheck = MappingService.checkDuplicateMapping(
          this.mappingForm,
          this.localMappings
        )

        if (duplicateCheck.isDuplicate) {
          this.$q.notify({
            type: 'warning',
            message: 'Duplicate mapping detected',
            caption: duplicateCheck.message,
            position: 'top',
            timeout: 4000
          })
          return
        }

        if (this.editingMapping) {
          // Update existing mapping
          const index = this.localMappings.findIndex(m => m.id === this.editingMapping.id)
          if (index !== -1) {
            this.$set(this.localMappings, index, { ...this.mappingForm })
          }
        } else {
          // Add new mapping
          this.localMappings.push({ ...this.mappingForm })
        }

        // Show warnings if any
        if (validation.warnings && validation.warnings.length > 0) {
          validation.warnings.forEach(warning => {
            this.$q.notify({
              type: 'info',
              message: warning,
              position: 'top',
              timeout: 3000
            })
          })
        }

        // Close dialog
        this.mappingDialog = false

        // Provide feedback
        this.$q.notify({
          type: 'positive',
          message: this.editingMapping ? 'Mapping updated' : 'Mapping added',
          icon: 'check',
          position: 'top',
          timeout: 2000
        })
      } catch (error) {
        console.error('[Step 5] Error saving mapping:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save mapping',
          caption: error.message || 'An unexpected error occurred',
          position: 'top'
        })
      } finally {
        this.isValidatingMapping = false
      }
    },

    /**
     * Delete a mapping
     * @param {string} id - Mapping ID
     */
    deleteMapping (id) {
      try {
        this.$q.dialog({
          title: 'Confirm Delete',
          message: 'Are you sure you want to delete this mapping?',
          cancel: true,
          persistent: false
        }).onOk(() => {
          const index = this.localMappings.findIndex(m => m.id === id)
          if (index !== -1) {
            this.localMappings.splice(index, 1)

            this.$q.notify({
              type: 'info',
              message: 'Mapping deleted',
              icon: 'delete',
              position: 'top',
              timeout: 2000
            })
          }
        })
      } catch (error) {
        console.error('[Step 5] Error deleting mapping:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to delete mapping',
          caption: error.message || 'An unexpected error occurred',
          position: 'top'
        })
      }
    },

    /**
     * Clear all mappings
     */
    clearAllMappings () {
      try {
        this.$q.dialog({
          title: 'Confirm Clear All',
          message: 'Are you sure you want to clear all mappings? This action cannot be undone.',
          cancel: true,
          persistent: false
        }).onOk(() => {
          this.localMappings = []

          this.$q.notify({
            type: 'info',
            message: 'All mappings cleared',
            icon: 'delete_sweep',
            position: 'top',
            timeout: 2000
          })
        })
      } catch (error) {
        console.error('[Step 5] Error clearing mappings:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to clear mappings',
          caption: error.message || 'An unexpected error occurred',
          position: 'top'
        })
      }
    },

    /**
     * Navigate to sample data step
     */
    goToSampleDataStep () {
      this.$emit('go-to-step', 1)
    },

    /**
     * Validate and proceed to next step
     * @async
     */
    async proceedToNext () {
      this.isSaving = true

      try {
        // Check if at least one mapping is defined
        if (!this.localMappings || this.localMappings.length === 0) {
          this.$q.notify({
            type: 'warning',
            message: 'At least one field mapping is required',
            caption: 'Please add at least one mapping before proceeding',
            position: 'top',
            timeout: 4000,
            icon: 'warning'
          })

          this.isSaving = false
          return
        }

        // Validate all mappings using service
        const validation = MappingService.validateAllMappings(this.localMappings)

        if (!validation.isValid) {
          this.$q.notify({
            type: 'warning',
            message: 'Please fix mapping errors before proceeding',
            caption: validation.errors[0] || 'Validation failed',
            position: 'top',
            timeout: 5000
          })

          this.isSaving = false
          return
        }

        // Show warnings if any
        if (validation.warnings && validation.warnings.length > 0) {
          console.warn('[Step 5] Validation warnings:', validation.warnings)
          validation.warnings.forEach(warning => {
            this.$q.notify({
              type: 'info',
              message: warning,
              position: 'top',
              timeout: 3000
            })
          })
        }

        // Save to store
        this.saveStateToStore()

        // Emit events
        this.$emit('step-valid')
        this.$emit('next-step')
      } catch (error) {
        console.error('[Step 5] Error proceeding to next step:', error)

        this.$q.notify({
          type: 'negative',
          message: 'Failed to proceed',
          caption: error.message || 'An unexpected error occurred',
          position: 'top',
          timeout: 5000
        })
      } finally {
        this.isSaving = false
      }
    },

    /**
     * Restore state from store
     */
    restoreStateFromStore () {
      try {
        if (!this.fieldMappings || typeof this.fieldMappings !== 'object') {
          return
        }

        // Restore mappings (deep clone to prevent mutations)
        if (this.fieldMappings.mappings && Array.isArray(this.fieldMappings.mappings) && this.fieldMappings.mappings.length > 0) {
          this.localMappings = JSON.parse(JSON.stringify(this.fieldMappings.mappings))

          // Ensure each mapping has an ID
          this.localMappings.forEach((mapping, index) => {
            if (!mapping.id) {
              mapping.id = `mapping-${Date.now()}-${index}`
            }
          })

          console.log('[Step 5] Restored mappings:', this.localMappings.length)
        }
      } catch (error) {
        console.error('[Step 5] Error restoring state:', error)
        // Don't notify user - this is not critical
      }
    },

    /**
     * Save state to store before leaving
     */
    saveStateToStore () {
      try {
        // Deep clone mappings
        const mappings = JSON.parse(JSON.stringify(this.localMappings))

        // Update store
        this.UPDATE_FIELD_MAPPINGS({ mappings })

        console.log('[Step 5] Saved mappings to store:', mappings.length)
      } catch (error) {
        console.error('[Step 5] Error saving state to store:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save mappings',
          caption: error.message || 'An unexpected error occurred',
          position: 'top'
        })
      }
    }
  },

  created () {
    try {
      // Load options
      this.loadLRSchemaFields()
      this.loadDataTypeOptions()

      // Extract JSON paths from sample data
      this.extractJsonPathsFromSampleData()

      // Restore previous state from store
      this.restoreStateFromStore()
    } catch (error) {
      console.error('[Step 5] Error during initialization:', error)
    }
  },

  beforeDestroy () {
    // Set destroyed flag
    this.isDestroyed = true

    try {
      // Save current state before component is destroyed
      this.saveStateToStore()
    } catch (error) {
      console.error('[Step 5] Error saving state on destroy:', error)
    }
  }
}
</script>

<style lang="scss" scoped>
.step-mapping {
  max-width: 1100px;
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

/* Card styles */
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

/* Loading state */
.loading-state {
  text-align: center;
  padding: 3rem 2rem;
}

.loading-message {
  color: var(--q-color-grey-7);
  font-size: 1.125rem;
  margin-top: 1rem;
}

/* No fields warning */
.no-fields-warning {
  text-align: center;
  padding: 3rem 2rem;
}

.no-fields-message {
  color: var(--q-color-grey-7);
  font-size: 1.125rem;
  margin-top: 1rem;
}

/* Mapping tools */
.mapping-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.mapping-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mapping-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Table styles */
.mapping-table-container {
  overflow-x: auto;
}

.mapping-table {
  width: 100%;

  ::v-deep .q-table__card {
    box-shadow: none;
  }

  ::v-deep .q-table thead tr,
  ::v-deep .q-table tbody td {
    height: auto;
    min-height: 48px;
  }

  ::v-deep .q-table tbody td {
    padding: 12px 8px;
    font-size: 0.875rem;
    color: var(--q-color-grey-9);
  }

  ::v-deep .q-table thead th {
    padding: 12px 8px;
    font-weight: 600;
    font-size: 0.875rem;
    color: #2196F3;
    background-color: var(--q-color-grey-2);
  }
}

.json-path-cell {
  font-family: monospace;
  color: var(--q-primary);
  font-weight: 500;
  font-size: 0.875rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schema-field-cell {
  font-weight: 500;
  color: var(--q-secondary);
  font-size: 0.875rem;
}

.operations-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  min-height: 24px;
}

.action-buttons {
  white-space: nowrap;
  display: flex;
  gap: 4px;
  justify-content: center;
}

.no-mappings {
  padding: 2rem 0;
  text-align: center;
  color: var(--q-color-grey-7);
}

/* Dialog styles */
.mapping-form-section {
  max-height: 500px;
  overflow-y: auto;
}

.mapping-form {
  .full-width {
    width: 100%;
  }
}

/* Action buttons */
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

/* Responsive */
@media (max-width: 768px) {
  .mapping-tools {
    flex-direction: column;
    align-items: stretch;
  }

  .mapping-stats,
  .mapping-actions {
    width: 100%;
    justify-content: center;
  }

  .mapping-table {
    font-size: 0.8125rem;
  }

  .json-path-cell {
    max-width: 150px;
  }
}

/* Dark dropdown styles for dialog */
::v-deep .dropdown-dark {
  background-color: #000000 !important;
}

::v-deep .dropdown-dark .q-menu {
  background-color: #000000 !important;
}

::v-deep .dropdown-dark .q-virtual-scroll__content {
  background-color: #000000 !important;
}

::v-deep .dropdown-dark .q-list {
  background-color: #000000 !important;
}

::v-deep .dropdown-dark .q-item {
  color: #ffffff !important;
  background-color: #000000 !important;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover,
  &.q-item--active,
  &.q-manual-focusable--focused {
    background-color: #2196f3 !important;
    color: #ffffff !important;
  }
}

::v-deep .dropdown-dark .q-item__label {
  color: #ffffff !important;
}

::v-deep .dropdown-dark .q-item:hover .q-item__label,
::v-deep .dropdown-dark .q-item--active .q-item__label,
::v-deep .dropdown-dark .q-manual-focusable--focused .q-item__label {
  color: #ffffff !important;
}

::v-deep .dropdown-dark .q-item__label--caption {
  color: #b0b0b0 !important;
}

::v-deep .dropdown-dark .q-item:hover .q-item__label--caption,
::v-deep .dropdown-dark .q-item--active .q-item__label--caption,
::v-deep .dropdown-dark .q-manual-focusable--focused .q-item__label--caption {
  color: #e3f2fd !important;
}

/* Ensure the dropdown item has proper styling */
::v-deep .dropdown-item {
  color: #ffffff !important;
  background-color: transparent !important;
}

::v-deep .dropdown-item:hover {
  background-color: #2196f3 !important;
}

/* Style input fields in dialog to have proper contrast */
::v-deep .mapping-form {
  .q-field__control {
    background-color: rgba(255, 255, 255, 0.05) !important;
    color: #ffffff !important;
  }

  .q-field__native,
  .q-field__input {
    color: #ffffff !important;
    background-color: transparent !important;
  }

  .q-field__label {
    color: rgba(255, 255, 255, 0.7) !important;
  }

  .q-field__control:before {
    border-color: rgba(255, 255, 255, 0.3) !important;
  }

  .q-field--focused .q-field__label {
    color: var(--q-color-primary) !important;
  }

  .q-field--focused .q-field__control:before {
    border-color: var(--q-color-primary) !important;
  }

  // Error state styling with better visibility
  .q-field--error .q-field__label {
    color: #ff5252 !important;
    font-weight: 500;
  }

  .q-field--error .q-field__control:before {
    border-color: #ff5252 !important;
    border-width: 2px !important;
  }

  .q-field--error .q-field__control:after {
    border-color: #ff5252 !important;
  }

  // Ensure the selected value is visible
  .q-field__marginal {
    color: #ffffff !important;
  }

  // Dropdown icon
  .q-select__dropdown-icon {
    color: rgba(255, 255, 255, 0.7) !important;
  }

  // Error icon visibility
  .q-field--error .q-field__append {
    .q-icon {
      color: #ff5252 !important;
    }
  }

  // Style the actual text display area
  input {
    color: #ffffff !important;
    background-color: transparent !important;
  }

  // For use-input mode in q-select
  .q-field__control-container {
    input {
      color: #ffffff !important;
      background-color: transparent !important;
    }
  }

  // Selected item text in q-select (but not chips)
  .q-field__native > span:not(.q-chip) {
    color: #ffffff !important;
  }

  // Chips styling for multiple select - highly specific to override Quasar defaults
  // Using [dir] to match Quasar's specificity
  [dir] .mapping-form .q-chip {
    background: #03a9f4 !important; // Using 'background' not 'background-color' to match Quasar
    background-color: #03a9f4 !important; // Bright cyan blue
    background-image: none !important;
    color: #000000 !important; // Black text
    border: 2px solid #29b6f6 !important; // Lighter blue border
    font-weight: 700 !important; // Bold text
    font-size: 14px !important;
    padding: 8px 14px !important;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4) !important;

    span {
      color: #000000 !important; // Black text for all spans inside chip
    }
  }

  .mapping-form .q-chip {
    background: #03a9f4 !important;
    background-color: #03a9f4 !important;
    background-image: none !important;
    color: #000000 !important;
    border: 2px solid #29b6f6 !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    padding: 8px 14px !important;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4) !important;

    span {
      color: #000000 !important;
    }
  }

  .mapping-form .q-chip .q-chip__content {
    color: #000000 !important; // Black text

    span {
      color: #000000 !important; // Black text for spans inside content
    }
  }

  .mapping-form .q-chip .q-icon {
    color: #000000 !important; // Black icon
    opacity: 1 !important;
    font-weight: bold !important;
  }

  .mapping-form .q-chip .q-icon:hover {
    opacity: 1 !important;
    background-color: rgba(0, 0, 0, 0.2) !important;
    border-radius: 50%;
  }

  // Chip remove button
  .mapping-form .q-chip .q-chip__icon--remove {
    color: #000000 !important; // Black remove icon
    opacity: 1 !important;
    font-weight: bold !important;
  }

  .mapping-form .q-chip .q-chip__icon--remove:hover {
    opacity: 1 !important;
    background-color: rgba(0, 0, 0, 0.25) !important;
    border-radius: 50%;
  }

  // Override the generic span selector for chips
  .q-field__native .q-chip span {
    color: #000000 !important; // Black text for all spans in chips
  }

  // Also target with full field hierarchy for maximum specificity
  // Using [dir] to match Quasar's specificity
  [dir] .q-field__control .q-field__native .q-chip {
    background: #03a9f4 !important; // Using 'background' not 'background-color' to match Quasar
    background-color: #03a9f4 !important; // Bright cyan blue
    background-image: none !important;
    color: #000000 !important; // Black text
    border: 2px solid #29b6f6 !important; // Lighter blue border
    font-weight: 700 !important; // Bold text
    font-size: 14px !important;
    padding: 8px 14px !important;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4) !important;

    span {
      color: #000000 !important; // Black text for all spans inside chip
    }
  }

  .q-field__control .q-field__native .q-chip {
    background: #03a9f4 !important;
    background-color: #03a9f4 !important;
    background-image: none !important;
    color: #000000 !important;
    border: 2px solid #29b6f6 !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    padding: 8px 14px !important;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4) !important;

    span {
      color: #000000 !important;
    }
  }

  .q-field__control .q-field__native .q-chip .q-chip__content {
    color: #000000 !important; // Black text

    span {
      color: #000000 !important; // Black text for spans inside content
    }
  }

  .q-field__control .q-field__native .q-chip .q-icon {
    color: #000000 !important; // Black icon
    opacity: 1 !important;
    font-weight: bold !important;
  }

  .q-field__control .q-field__native .q-chip .q-icon:hover {
    opacity: 1 !important;
    background-color: rgba(0, 0, 0, 0.2) !important;
    border-radius: 50%;
  }

  .q-field__control .q-field__native .q-chip .q-chip__icon--remove {
    color: #000000 !important; // Black remove icon
    opacity: 1 !important;
    font-weight: bold !important;
  }

  .q-field__control .q-field__native .q-chip .q-chip__icon--remove:hover {
    opacity: 1 !important;
    background-color: rgba(0, 0, 0, 0.25) !important;
    border-radius: 50%;
  }

  // Help icon in append slot
  .q-field__append .q-icon {
    color: rgba(255, 255, 255, 0.6) !important;
  }
}

/* Hint/Help text styling for inputs and selects in dialog */
::v-deep .mapping-form {
  .q-field__messages,
  .q-field__bottom {
    color: #64b5f6 !important; // Light blue for better distinction
    min-height: 20px;
    font-style: italic;
  }

  .q-field__messages > div {
    color: #64b5f6 !important; // Light blue for better distinction
    font-style: italic;
  }

  // Error messages should be bright red and visible
  .q-field--error {
    .q-field__bottom {
      display: block !important;
      visibility: visible !important;
      padding-top: 6px;
      min-height: 24px;

      > div {
        color: #ff5252 !important;
        font-weight: 600;
        font-size: 13px;
        display: block !important;
        visibility: visible !important;
        font-style: normal !important;
      }
    }

    .q-field__messages {
      color: #ff5252 !important;
      font-weight: 600;
      font-size: 13px;
      margin-top: 6px;
      padding: 0 12px;
      min-height: 20px;
      display: block !important;
      visibility: visible !important;
      font-style: normal !important;
    }
  }
}
</style>

<style lang="scss">
/* Global unscoped styles for dropdown menus - matching Step 4 exactly */
.dropdown-dark.q-menu {
  background-color: #000000 !important;
}

.dropdown-dark {
  background-color: #000000 !important;

  .q-menu {
    background-color: #000000 !important;
  }

  .q-virtual-scroll__content {
    background-color: #000000 !important;
  }

  .q-list {
    background-color: #000000 !important;
  }

  .q-item {
    color: #ffffff !important;
    background-color: #000000 !important;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover,
    &.q-item--active,
    &.q-manual-focusable--focused {
      background-color: #2196f3 !important;
      color: #ffffff !important;
    }
  }

  .q-item__label {
    color: #ffffff !important;
  }

  .q-item:hover .q-item__label,
  .q-item--active .q-item__label,
  .q-manual-focusable--focused .q-item__label {
    color: #ffffff !important;
  }

  .q-item__label--caption {
    color: #b0b0b0 !important;
  }

  .q-item:hover .q-item__label--caption,
  .q-item--active .q-item__label--caption,
  .q-manual-focusable--focused .q-item__label--caption {
    color: #e3f2fd !important;
  }

  .q-item__section {
    color: #ffffff !important;
  }
}

/* Global chip styles - MUST be unscoped to override Quasar's [dir] selector */
[dir] .mapping-form .q-field__control .q-field__native .q-chip {
  background: #03a9f4 !important;
  background-color: #03a9f4 !important;
  background-image: none !important;
  color: #000000 !important;
  border: 2px solid #29b6f6 !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  padding: 8px 14px !important;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4) !important;

  span {
    color: #000000 !important;
  }

  .q-chip__content {
    color: #000000 !important;

    span {
      color: #000000 !important;
    }
  }

  .q-icon {
    color: #000000 !important;
    opacity: 1 !important;
    font-weight: bold !important;

    &:hover {
      opacity: 1 !important;
      background-color: rgba(0, 0, 0, 0.2) !important;
      border-radius: 50%;
    }
  }

  .q-chip__icon--remove {
    color: #000000 !important;
    opacity: 1 !important;
    font-weight: bold !important;

    &:hover {
      opacity: 1 !important;
      background-color: rgba(0, 0, 0, 0.25) !important;
      border-radius: 50%;
    }
  }
}

/* Additional specificity for chip styles */
[dir] .mapping-form .q-chip {
  background: #03a9f4 !important;
  background-color: #03a9f4 !important;
  background-image: none !important;
  color: #000000 !important;
  border: 2px solid #29b6f6 !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  padding: 8px 14px !important;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4) !important;

  span {
    color: #000000 !important;
  }
}
</style>
