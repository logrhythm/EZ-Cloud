<template>
  <div class="step-mapping">
    <div class="step-header">
      <div class="step-icon">
        <q-icon name="account_tree" size="48px" class="text-primary" />
      </div>
      <div class="step-title-section">
        <h2 class="step-title">Field Mapping</h2>
        <p class="step-subtitle">
          Click on any JSON field to create a mapping to LogRhythm schema fields.
        </p>
      </div>
    </div>

    <!-- Instructions Banner -->
    <div class="instructions-banner">
      <q-icon name="info" size="24px" class="q-mr-sm" />
      <div class="instructions-content">
        <strong>How to map fields:</strong>
        <span class="q-ml-sm">
          Click on any field in the JSON tree to create or edit a mapping.
          Mapped fields show a green checkmark (✓).
        </span>
      </div>
      <q-space />
      <div class="mapping-progress">
        <q-chip color="primary" text-color="white" icon="check_circle">
          {{ localMappings.length }} mapped
        </q-chip>
      </div>
    </div>

    <div class="step-content">
      <!-- Loading State -->
      <div v-if="isExtractingFields" class="loading-state">
        <q-spinner color="primary" size="48px" />
        <p class="loading-message">Building JSON tree structure...</p>
      </div>

      <!-- No Sample Data Warning -->
      <div v-else-if="!jsonTreeData" class="no-fields-warning">
        <q-icon name="warning" size="48px" color="warning" />
        <p class="no-fields-message">
          No JSON data available for mapping.
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

      <!-- Split Panel Layout (Desktop) / Tabs (Mobile) -->
      <div v-else class="mapping-workspace">
        <!-- Desktop: Split Panel Layout -->
        <div class="split-panel-layout desktop-only">
          <!-- Left Panel: JSON Tree -->
          <div class="panel json-tree-panel">
            <div class="panel-header">
              <div class="panel-title">
                <q-icon name="account_tree" class="q-mr-sm" />
                JSON Structure
              </div>
              <div class="panel-actions">
                <q-input
                  v-model="treeSearchQuery"
                  dense
                  outlined
                  placeholder="Search fields..."
                  class="tree-search"
                  debounce="300"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" size="xs" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      v-if="treeSearchQuery"
                      name="clear"
                      class="cursor-pointer"
                      @click="treeSearchQuery = ''"
                    />
                  </template>
                </q-input>

                <q-btn
                  flat
                  dense
                  icon="unfold_more"
                  @click="expandAll"
                  size="sm"
                >
                  <q-tooltip>Expand All</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  dense
                  icon="unfold_less"
                  @click="collapseAll"
                  size="sm"
                >
                  <q-tooltip>Collapse All</q-tooltip>
                </q-btn>
              </div>
            </div>

            <div class="panel-content">
              <json-tree-viewer
                v-if="jsonTreeData"
                :data="jsonTreeData"
                :expanded-nodes="expandedNodes"
                :mapped-paths="mappedPathsSet"
                :highlighted-path="highlightedPath"
                :clickable-mode="true"
                @toggle-node="toggleNode"
                @node-click="handleTreeNodeClick"
              />
            </div>
          </div>

          <!-- Right Panel: Mappings Grid -->
          <div class="panel mappings-panel">
            <div class="panel-header">
              <div class="panel-title">
                <q-icon name="list" class="q-mr-sm" />
                Configured Mappings
              </div>
              <div class="panel-actions">
                <!-- Unified dropdown styling -->
                <q-select
                  v-model="gridSearchQuery"
                  dense
                  outlined
                  use-input
                  input-debounce="300"
                  fill-input
                  hide-selected
                  :options="mappingFilterOptions"
                  @filter="onMappingFilterFilter"
                  placeholder="Filter mappings..."
                  class="grid-search uniform-select"
                  popup-content-class="dropdown-dark"
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="search" size="xs" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      v-if="gridSearchQuery"
                      name="clear"
                      class="cursor-pointer"
                      @click="gridSearchQuery = ''"
                    />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        Type to filter by JSON Path or LR Field
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <q-btn
                  flat
                  dense
                  icon="refresh"
                  @click="refreshMappings"
                  size="sm"
                >
                  <q-tooltip>Refresh</q-tooltip>
                </q-btn>
              </div>
            </div>

            <div class="panel-content">
              <!-- Empty State -->
              <div v-if="localMappings.length === 0" class="empty-mappings">
                <q-icon name="touch_app" size="64px" color="grey-5" />
                <p class="empty-message">No mappings defined yet</p>
                <p class="empty-hint">Click on any field in the JSON tree to create a mapping</p>
              </div>

              <!-- Mappings Table -->
              <q-table
                v-else
                :data="filteredMappings"
                :columns="mappingColumns"
                row-key="id"
                flat
                bordered
                :pagination="{ rowsPerPage: 0 }"
                class="mappings-table"
                hide-pagination
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <!-- JSON Path -->
                    <q-td key="inputRule" :props="props">
                      <div class="json-path-cell">
                        <q-icon :name="getTypeIcon(props.row.type)" :color="getTypeIconColor(props.row.type)" size="xs" class="q-mr-xs" />
                        <span class="path-text">{{ props.row.inputRule }}</span>
                      </div>
                    </q-td>

                    <!-- Arrow -->
                    <q-td key="arrow" :props="props">
                      <q-icon name="arrow_forward" size="sm" color="grey-6" />
                    </q-td>

                    <!-- LR Field -->
                    <q-td key="lrSchemaField" :props="props">
                      <q-chip
                        :color="getLRFieldColor(props.row.lrSchemaField)"
                        text-color="white"
                        size="sm"
                        dense
                      >
                        {{ props.row.lrSchemaField }}
                      </q-chip>
                    </q-td>

                    <!-- Type -->
                    <q-td key="type" :props="props">
                      <q-badge :color="getTypeColor(props.row.type)">
                        {{ props.row.type }}
                      </q-badge>
                    </q-td>

                    <!-- Actions -->
                    <q-td key="actions" :props="props">
                      <div class="action-buttons">
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="my_location"
                          color="info"
                          @click="highlightInTree(props.row.inputRule)"
                        >
                          <q-tooltip>Show in Tree</q-tooltip>
                        </q-btn>

                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="edit"
                          color="primary"
                          @click="editMapping(props.row)"
                        >
                          <q-tooltip>Edit Mapping</q-tooltip>
                        </q-btn>

                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="delete"
                          color="negative"
                          @click="deleteMapping(props.row.id)"
                        >
                          <q-tooltip>Delete Mapping</q-tooltip>
                        </q-btn>
                      </div>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </div>
        </div>

        <!-- Mobile: Tabbed Layout -->
        <div class="tabbed-layout mobile-only">
          <q-tabs
            v-model="activeTab"
            dense
            class="mapping-tabs"
            active-color="primary"
            indicator-color="primary"
          >
            <q-tab name="tree" label="JSON Tree" icon="account_tree" />
            <q-tab name="mappings" :label="`Mappings (${localMappings.length})`" icon="list" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated class="tab-panels">
            <!-- JSON Tree Tab -->
            <q-tab-panel name="tree" class="tree-tab-panel">
              <div class="mobile-search">
                <q-input
                  v-model="treeSearchQuery"
                  dense
                  outlined
                  placeholder="Search fields..."
                  class="full-width"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>

              <json-tree-viewer
                v-if="jsonTreeData"
                :data="jsonTreeData"
                :expanded-nodes="expandedNodes"
                :mapped-paths="mappedPathsSet"
                :highlighted-path="highlightedPath"
                :clickable-mode="true"
                @toggle-node="toggleNode"
                @node-click="handleTreeNodeClick"
              />
            </q-tab-panel>

            <!-- Mappings Tab -->
            <q-tab-panel name="mappings" class="mappings-tab-panel">
              <!-- Empty State -->
              <div v-if="localMappings.length === 0" class="empty-mappings-mobile">
                <q-icon name="touch_app" size="48px" color="grey-5" />
                <p class="empty-message">No mappings defined yet</p>
                <p class="empty-hint">Switch to JSON Tree tab and click on fields to map</p>
              </div>

              <!-- Mappings List (Mobile) -->
              <q-list v-else bordered separator class="mappings-list-mobile">
                <q-item v-for="mapping in localMappings" :key="mapping.id" class="mapping-item-mobile">
                  <q-item-section>
                    <q-item-label class="json-path-mobile">
                      <q-icon :name="getTypeIcon(mapping.type)" :color="getTypeIconColor(mapping.type)" size="xs" class="q-mr-xs" />
                      {{ mapping.inputRule }}
                    </q-item-label>
                    <q-item-label caption>
                      <q-icon name="arrow_forward" size="xs" class="q-mr-xs" />
                      <q-chip
                        :color="getLRFieldColor(mapping.lrSchemaField)"
                        text-color="white"
                        size="sm"
                        dense
                      >
                        {{ mapping.lrSchemaField }}
                      </q-chip>
                      <q-badge :color="getTypeColor(mapping.type)" class="q-ml-xs">
                        {{ mapping.type }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="mobile-actions">
                      <q-btn
                        flat
                        round
                        dense
                        size="sm"
                        icon="edit"
                        color="primary"
                        @click="editMapping(mapping)"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        size="sm"
                        icon="delete"
                        color="negative"
                        @click="deleteMapping(mapping.id)"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>

      <!-- Mapping Dialog -->
      <q-dialog v-model="mappingDialog" persistent>
        <q-card class="mapping-popup" style="min-width: 600px; max-width: 1800px; width: 85vw;">
          <q-card-section class="row items-center dialog-header">
            <div class="text-h6">{{ editingMapping ? 'Edit' : 'Create' }} Field Mapping</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-separator />

          <q-card-section class="mapping-form-section">
            <div class="mapping-form">
              <div class="row q-col-gutter-md">
                <!-- Source Field (Read-only, Pre-filled) -->
                <div class="col-12">
                  <q-input
                    v-model="mappingForm.inputRule"
                    label="Source Field (JSON Path) *"
                    hint="Auto-filled from the field you clicked"
                    outlined
                    dense
                    readonly
                    class="full-width"
                  >
                    <template v-slot:prepend>
                      <q-icon name="code" />
                    </template>
                  </q-input>
                </div>

                <!-- Operations & Transformations -->
                <div class="col-12">
                  <operation-selector
                    v-model="operationConfig"
                    :field-path="originalFieldPath"
                    :sample-value="mappingForm.sampleValue"
                    @input="handleOperationChanged"
                  />
                </div>

                <!-- LogRhythm Schema Field (with smart suggestions) -->
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="mappingForm.lrSchemaField"
                    :options="lrSchemaFieldsFiltered"
                    label="LogRhythm Schema Field *"
                    hint="Target field in LogRhythm"
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
                    class="full-width uniform-select"
                  >
                    <template v-slot:prepend>
                      <q-icon name="label" />
                    </template>

                    <template v-slot:before-options v-if="smartSuggestions.length > 0">
                      <q-item-label header class="suggestions-header">
                        <q-icon name="lightbulb" color="amber" size="xs" class="q-mr-xs" />
                        Smart Suggestions
                      </q-item-label>
                    </template>

                    <template v-slot:option="scope">
                      <q-item
                        v-bind="scope.itemProps"
                        v-on="scope.itemEvents"
                        clickable
                      >
                        <q-item-section>
                          <q-item-label>
                            {{ scope.opt.label }}
                            <q-chip
                              v-if="isSuggestedField(scope.opt.value)"
                              size="xs"
                              color="amber"
                              text-color="black"
                              icon="stars"
                              class="q-ml-xs"
                            >
                              Suggested
                            </q-chip>
                          </q-item-label>
                          <q-item-label caption>
                            Category: {{ scope.opt.category }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <!-- Sample Value Display -->
                <div v-if="mappingForm.sampleValue" class="col-12">
                  <q-banner dense class="sample-value-banner">
                    <template v-slot:avatar>
                      <q-icon name="preview" />
                    </template>
                    <div class="sample-value-content">
                      <strong>Sample Value:</strong>
                      <code class="q-ml-sm">{{ mappingForm.sampleValue }}</code>
                    </div>
                  </q-banner>
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
                    class="full-width uniform-select"
                  />
                </div>

                <!-- DateTime Formatter (Conditional) -->
                <div v-if="mappingForm.type === 'DateTime'" class="col-12">
                  <date-time-formatter-config
                    v-model="mappingForm.format"
                    :sample-value="mappingForm.sampleValue"
                  />
                </div>

                <!-- Format (Optional) - Hidden when DateTime formatter is shown -->
                <div v-if="mappingForm.type !== 'DateTime'" class="col-12 col-md-6">
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
                    class="full-width uniform-select"
                  />
                </div>

                <!-- Fanout Parent Element -->
                <div class="col-12">
                  <q-input
                    v-model="mappingForm.fanoutParentElement"
                    label="Fanout Parent Element (optional)"
                    :hint="getFanoutParentHint()"
                    outlined
                    dense
                    readonly
                    class="full-width"
                    :bg-color="mappingForm.fanoutParentElement ? 'blue-1' : 'white'"
                  >
                    <template v-slot:append>
                      <q-icon name="help_outline" color="grey-6">
                        <q-tooltip max-width="400px">
                          <strong>Fanout Parent Element</strong><br><br>
                          This field is auto-populated based on your fanout selections in Step 3.<br><br>
                          <span v-if="fanoutArrays.length > 0">
                            <strong>Available fanout arrays:</strong><br>
                            <span v-for="(fanout, idx) in fanoutArrays" :key="idx">
                              • {{ fanout }}<br>
                            </span>
                          </span>
                          <span v-else>
                            No fanout arrays configured in Step 3.
                          </span>
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
              label="Save Mapping"
              color="primary"
              icon="check"
              :loading="isValidatingMapping"
              @click="saveMapping"
              no-caps
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
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
import JsonTreeViewer from '../components/JsonTreeViewer.vue'
import OperationSelector from '../operations/OperationSelector.vue'
import DateTimeFormatterConfig from '../operations/DateTimeFormatterConfig.vue'
import { parseOperationFromInputRule, buildOperationSyntax } from '../../../utils/operationParser'

export default {
  name: 'Step5_Mapping',

  components: {
    JsonTreeViewer,
    OperationSelector,
    DateTimeFormatterConfig
  },

  data () {
    return {
      // Local state
      localMappings: [],
      jsonTreeData: null,
      availableJsonPaths: [],

      // Tree state
      expandedNodes: new Set(),
      highlightedPath: null,
      treeSearchQuery: '',

      // UI state
      activeTab: 'tree', // for mobile tabs
      gridSearchQuery: '',

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
        fanoutParentElement: null,
        sampleValue: null
      },

      // Operation state
      originalFieldPath: '', // Store field path without operation
      operationConfig: {
        type: null,
        parameters: {}
      },

      // Smart suggestions
      smartSuggestions: [],

      // Validation errors
      validationErrors: {},

      // Options
      lrSchemaFields: [],
      dataTypeOptions: [],

      // Component lifecycle
      isDestroyed: false,

      // Table columns
      mappingColumns: [
        {
          name: 'inputRule',
          label: 'JSON Path',
          field: 'inputRule',
          align: 'left',
          sortable: true
        },
        {
          name: 'arrow',
          label: '',
          field: 'arrow',
          align: 'center',
          style: 'width: 40px;'
        },
        {
          name: 'lrSchemaField',
          label: 'LR Field',
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
          name: 'actions',
          label: 'Actions',
          field: 'actions',
          align: 'center'
        }
      ]
    }
  },

  computed: {
    ...mapState('wizard', ['sampleData', 'fieldMappings', 'schemaRules']),

    /**
     * Get fanout arrays from Step 3 for path resolution
     */
    fanoutArrays () {
      return this.$store.getters['wizard/getFanoutArrays']
    },

    mappedPathsSet () {
      const paths = new Set()
      this.localMappings.forEach(m => {
        if (m.inputRule) {
          paths.add(m.inputRule)
        }
      })
      return paths
    },

    filteredMappings () {
      if (!this.gridSearchQuery) {
        return this.localMappings
      }

      const query = this.gridSearchQuery.toLowerCase()
      return this.localMappings.filter(m =>
        m.inputRule.toLowerCase().includes(query) ||
        m.lrSchemaField.toLowerCase().includes(query)
      )
    },

    alternativeFieldOptions () {
      return this.availableJsonPaths.filter(path =>
        path.value !== this.mappingForm.inputRule
      )
    },

    lrSchemaFieldsFiltered () {
      // Put smart suggestions at the top
      const suggested = this.lrSchemaFields.filter(f =>
        this.smartSuggestions.includes(f.value)
      )

      const others = this.lrSchemaFields.filter(f =>
        !this.smartSuggestions.includes(f.value)
      )

      return [...suggested, ...others]
    },

    mappingFilterOptions () {
      // Build unique list of JSON paths & LR fields for suggestion dropdown
      const opts = []
      const seen = new Set()
      this.localMappings.forEach(m => {
        if (m.inputRule && !seen.has(m.inputRule)) {
          seen.add(m.inputRule)
          opts.push({ label: m.inputRule, value: m.inputRule })
        }
        if (m.lrSchemaField && !seen.has(m.lrSchemaField)) {
          seen.add(m.lrSchemaField)
          opts.push({ label: m.lrSchemaField, value: m.lrSchemaField })
        }
      })
      return opts
    }
  },

  methods: {
    ...mapMutations('wizard', [
      'UPDATE_FIELD_MAPPINGS'
    ]),

    async buildJsonTree () {
      if (this.isDestroyed) return

      this.isExtractingFields = true

      try {
        if (!this.sampleData || !this.sampleData.parsedData) {
          this.jsonTreeData = null
          return
        }

        // Determine if multi-line processing is needed
        const isMultiLine = this.sampleData.dataStructure === 'multi-line'

        // Parse data for tree building
        let dataForTree = this.sampleData.parsedData

        // If multi-line, parse all log lines and merge schemas
        if (isMultiLine) {
          dataForTree = this.parseMultiLineLogsForTree(this.sampleData.parsedData)
        }

        // Build schema-only tree structure with value aggregation
        this.jsonTreeData = MappingService.buildTreeStructure(
          dataForTree,
          null, // Don't use pre-analyzed structure, build fresh
          {
            schemaOnly: true,
            aggregateValues: true,
            multiLine: isMultiLine
          }
        )

        // Merge parsed stringified JSON fields into the tree
        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 5] Checking for parsed stringified JSON fields')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ $store.state.wizard exists:', !!this.$store.state.wizard)
        console.log('║ schemaRules exists:', !!this.$store.state.wizard?.schemaRules)
        console.log('║ parsedStringifiedJsonFields exists:', !!this.$store.state.wizard?.schemaRules?.parsedStringifiedJsonFields)
        console.log('╚════════════════════════════════════════════════════════════════════════')

        const schemaRules = this.$store.state.wizard?.schemaRules
        if (schemaRules && schemaRules.parsedStringifiedJsonFields) {
          console.log('╔════════════════════════════════════════════════════════════════════════')
          console.log('║ [Step 5] Merging parsed stringified JSON fields into tree')
          console.log('╠════════════════════════════════════════════════════════════════════════')
          console.log('║ Parsed field keys:', Object.keys(schemaRules.parsedStringifiedJsonFields))
          console.log('║ Parsed field count:', Object.keys(schemaRules.parsedStringifiedJsonFields).length)
          console.log('║ Full parsedStringifiedJsonFields:', JSON.stringify(schemaRules.parsedStringifiedJsonFields, null, 2))
          console.log('╚════════════════════════════════════════════════════════════════════════')

          this.jsonTreeData = MappingService.mergeStringifiedJsonIntoTree(
            this.jsonTreeData,
            schemaRules.parsedStringifiedJsonFields,
            dataForTree
          )
        } else {
          console.log('╔════════════════════════════════════════════════════════════════════════')
          console.log('║ [Step 5] WARNING: No parsed stringified JSON fields found!')
          console.log('║ This is why the parsed attributes are not appearing!')
          console.log('╚════════════════════════════════════════════════════════════════════════')
        }

        // Extract JSON paths for alternative fields (using the new normalized paths)
        this.availableJsonPaths = MappingService.extractJsonPaths(
          dataForTree,
          this.jsonTreeData
        )

        // Expand all nodes by default for better visibility
        this.expandAll()

        console.log('[Step 5] JSON tree built successfully with', this.availableJsonPaths.length, 'paths')
      } catch (error) {
        console.error('[Step 5] Error building JSON tree:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to build JSON tree',
          caption: error.message,
          position: 'top'
        })
      } finally {
        this.isExtractingFields = false
      }
    },

    parseMultiLineLogsForTree (rawData) {
      try {
        // If rawData is already an array of parsed objects, use it directly
        if (Array.isArray(rawData) && rawData.length > 0 && typeof rawData[0] === 'object') {
          return rawData
        }

        // If it's a string, split by lines and parse each
        if (typeof rawData === 'string') {
          const lines = rawData.split('\n').filter(line => line.trim())
          const parsedLogs = []

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line.trim())
              parsedLogs.push(parsed)
            } catch (e) {
              console.warn('[Step 5] Failed to parse log line:', line)
            }
          }

          return parsedLogs
        }

        // Single object - wrap in array
        if (typeof rawData === 'object' && rawData !== null) {
          return [rawData]
        }

        return rawData
      } catch (error) {
        console.error('[Step 5] Error parsing multi-line logs:', error)
        return rawData
      }
    },

    toggleNode (path) {
      if (this.expandedNodes.has(path)) {
        this.expandedNodes.delete(path)
      } else {
        this.expandedNodes.add(path)
      }
      // Trigger reactivity
      this.expandedNodes = new Set(this.expandedNodes)
    },

    expandAll () {
      const expandRecursive = (node) => {
        if (!node) return
        this.expandedNodes.add(node.path)
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(child => expandRecursive(child))
        }
      }

      if (this.jsonTreeData) {
        expandRecursive(this.jsonTreeData)
        this.expandedNodes = new Set(this.expandedNodes)
      }
    },

    collapseAll () {
      this.expandedNodes.clear()
      // Keep root expanded
      if (this.jsonTreeData && this.jsonTreeData.path) {
        this.expandedNodes.add(this.jsonTreeData.path)
      }
      this.expandedNodes = new Set(this.expandedNodes)
    },

    handleTreeNodeClick (nodeData) {
      const { path } = nodeData

      // Check if already mapped
      const existing = this.localMappings.find(m => m.inputRule === path)

      if (existing) {
        // Edit existing mapping
        this.editMapping(existing)
      } else {
        // Create new mapping
        this.createMappingFromNode(nodeData)
      }
    },

    createMappingFromNode (nodeData) {
      const { path, type, value, aggregatedValues } = nodeData

      // Reset form
      this.editingMapping = null
      this.validationErrors = {}

      // Resolve path based on fanout selections
      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [Step 5] createMappingFromNode - Resolving path for fanout')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ Original path:', path)
      console.log('║ Fanout arrays:', JSON.stringify(this.fanoutArrays))
      console.log('╚════════════════════════════════════════════════════════════════════════')

      const resolved = MappingService.resolvePathForFanout(path, this.fanoutArrays)

      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [Step 5] Path resolution result:')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ jsonPath:', resolved.jsonPath)
      console.log('║ fanoutParent:', resolved.fanoutParent)
      console.log('╚════════════════════════════════════════════════════════════════════════')

      // Store original field path (without operation)
      this.originalFieldPath = resolved.jsonPath

      // Reset operation config
      this.operationConfig = {
        type: null,
        parameters: {}
      }

      // Extract field name for suggestions
      const fieldName = MappingService.extractFieldName(path)

      // Generate smart suggestions
      this.smartSuggestions = MappingService.generateSmartSuggestions(
        fieldName,
        path,
        type
      )

      // Format sample value from aggregated values
      let sampleValue = null
      if (aggregatedValues && aggregatedValues.length > 0) {
        // Show first 3 values as sample
        const firstValues = aggregatedValues.slice(0, 3).map(v => {
          if (typeof v === 'string') {
            return v.length > 50 ? v.substring(0, 50) + '...' : v
          }
          return JSON.stringify(v)
        })
        sampleValue = firstValues.join(', ')
        if (aggregatedValues.length > 3) {
          sampleValue += ` (+${aggregatedValues.length - 3} more)`
        }
      } else if (value) {
        sampleValue = String(value)
      }

      // Pre-fill form with resolved path and fanout parent
      this.mappingForm = {
        id: `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        inputRule: resolved.jsonPath, // Use resolved relative/absolute path
        lrSchemaField: this.smartSuggestions.length > 0 ? this.smartSuggestions[0] : '',
        type: this.mapJsonTypeToLRType(type),
        format: null,
        default: null,
        alternativeFields: [],
        fanoutParentElement: resolved.fanoutParent || null, // Auto-populated fanout parent
        sampleValue: sampleValue
      }

      // Open dialog
      this.mappingDialog = true

      // Show notification about fanout resolution
      if (resolved.fanoutParent) {
        this.$q.notify({
          type: 'info',
          message: 'Field is within fanout array',
          caption: `Using relative path with fanout parent: ${resolved.fanoutParent}`,
          position: 'top',
          timeout: 4000,
          icon: 'account_tree'
        })
      }

      // Show suggestion notification
      if (this.smartSuggestions.length > 0) {
        this.$q.notify({
          type: 'info',
          message: `Smart suggestion: ${this.smartSuggestions[0]}`,
          caption: 'You can change this if needed',
          position: 'top',
          timeout: 3000,
          icon: 'lightbulb'
        })
      }
    },

    editMapping (mapping) {
      this.editingMapping = mapping
      this.validationErrors = {}

      // Parse operation from inputRule if present
      const parsed = parseOperationFromInputRule(mapping.inputRule)

      // Store original field path and operation config
      this.originalFieldPath = parsed.fieldPath || mapping.inputRule
      this.operationConfig = {
        type: parsed.type,
        parameters: parsed.parameters || {}
      }

      console.log('[Step 5] editMapping - Parsed operation:', {
        type: parsed.type,
        fieldPath: parsed.fieldPath,
        parameters: parsed.parameters
      })

      // Generate suggestions for editing
      const fieldName = MappingService.extractFieldName(this.originalFieldPath)
      this.smartSuggestions = MappingService.generateSmartSuggestions(
        fieldName,
        this.originalFieldPath,
        mapping.type
      )

      // Deep clone mapping
      this.mappingForm = JSON.parse(JSON.stringify(mapping))

      // Get sample value if not present
      if (!this.mappingForm.sampleValue && this.sampleData && this.sampleData.parsedData) {
        const pathOption = this.availableJsonPaths.find(p => p.value === this.originalFieldPath)
        if (pathOption && pathOption.sampleValue) {
          this.mappingForm.sampleValue = pathOption.sampleValue
        }
      }

      this.mappingDialog = true
    },

    /**
     * Handle operation configuration changes
     * Rebuild inputRule with operation syntax
     */
    handleOperationChanged (newOperationConfig) {
      console.log('[Step 5] handleOperationChanged:', newOperationConfig)

      // Update local operation config
      this.operationConfig = { ...newOperationConfig }

      // Rebuild inputRule with operation syntax
      if (newOperationConfig.type) {
        const operationSyntax = buildOperationSyntax({
          type: newOperationConfig.type,
          fieldPath: this.originalFieldPath,
          params: newOperationConfig.parameters
        })

        this.mappingForm.inputRule = operationSyntax
        console.log('[Step 5] Built operation syntax:', operationSyntax)
      } else {
        // No operation, use plain field path
        this.mappingForm.inputRule = this.originalFieldPath
        console.log('[Step 5] No operation, using plain path:', this.originalFieldPath)
      }
    },

    async saveMapping () {
      try {
        this.isValidatingMapping = true
        this.validationErrors = {}

        // Validate operation syntax if operation is present
        if (this.operationConfig.type) {
          const operationValidation = MappingService.validateOperationSyntax(this.mappingForm.inputRule)

          if (!operationValidation.isValid) {
            this.$q.notify({
              type: 'negative',
              message: 'Invalid operation configuration',
              caption: operationValidation.errors[0],
              position: 'top',
              timeout: 5000
            })
            return
          }
        }

        // Validate mapping
        const validation = MappingService.validateMapping(this.mappingForm)

        if (!validation.isValid) {
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
            position: 'top'
          })
          return
        }

        // Validate fanout parent if present
        if (this.mappingForm.fanoutParentElement) {
          const isValidFanout = MappingService.validateFanoutParentElement(
            this.mappingForm.fanoutParentElement,
            this.fanoutArrays
          )

          if (!isValidFanout) {
            this.validationErrors.fanoutParentElement = 'Invalid fanout parent element. Must match a fanout array from Step 3.'
            this.$q.notify({
              type: 'negative',
              message: 'Invalid fanout parent element',
              caption: 'The fanout parent must be one of the arrays selected in Step 3 (Schema Rules)',
              position: 'top',
              timeout: 5000
            })
            return
          }
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
            position: 'top'
          })
          return
        }

        // Save mapping (exclude sampleValue - it's only for UI display)
        const cleanMapping = { ...this.mappingForm }
        delete cleanMapping.sampleValue

        if (this.editingMapping) {
          const index = this.localMappings.findIndex(m => m.id === this.editingMapping.id)
          if (index !== -1) {
            this.$set(this.localMappings, index, cleanMapping)
          }
        } else {
          this.localMappings.push(cleanMapping)
        }

        // Close dialog
        this.mappingDialog = false

        // Show success
        this.$q.notify({
          type: 'positive',
          message: this.editingMapping ? 'Mapping updated' : 'Mapping created',
          icon: 'check',
          position: 'top',
          timeout: 2000
        })

        // Switch to mappings tab on mobile
        if (this.$q.platform.is.mobile) {
          this.activeTab = 'mappings'
        }
      } catch (error) {
        console.error('[Step 5] Error saving mapping:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save mapping',
          caption: error.message,
          position: 'top'
        })
      } finally {
        this.isValidatingMapping = false
      }
    },

    deleteMapping (id) {
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
    },

    highlightInTree (jsonPath) {
      // Set highlighted path
      this.highlightedPath = jsonPath

      // Expand all parent nodes
      const parentPaths = MappingService.getParentPaths(jsonPath)
      parentPaths.forEach(path => this.expandedNodes.add(path))
      this.expandedNodes = new Set(this.expandedNodes)

      // Switch to tree tab on mobile
      if (this.$q.platform.is.mobile) {
        this.activeTab = 'tree'
      }

      // Scroll to element (with delay for rendering)
      setTimeout(() => {
        const element = document.querySelector('.is-highlighted')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)

      // Clear highlight after 3 seconds
      setTimeout(() => {
        this.highlightedPath = null
      }, 3000)

      this.$q.notify({
        type: 'info',
        message: 'Field highlighted in tree',
        position: 'top',
        timeout: 2000
      })
    },

    refreshMappings () {
      // Just trigger reactivity
      this.localMappings = [...this.localMappings]
      this.$q.notify({
        type: 'info',
        message: 'Mappings refreshed',
        position: 'top',
        timeout: 1000
      })
    },

    mapJsonTypeToLRType (jsonType) {
      const typeMap = {
        string: 'String',
        number: 'Number',
        boolean: 'Boolean',
        object: 'String',
        array: 'String'
      }
      return typeMap[jsonType] || 'String'
    },

    isSuggestedField (fieldValue) {
      return this.smartSuggestions.includes(fieldValue)
    },

    getTypeIcon (type) {
      const iconMap = {
        String: 'description',
        Number: 'tag',
        Decimal: 'tag',
        Boolean: 'check_box',
        DateTime: 'schedule'
      }
      return iconMap[type] || 'help'
    },

    getTypeIconColor (type) {
      const colorMap = {
        String: 'green',
        Number: 'blue',
        Decimal: 'blue',
        Boolean: 'purple',
        DateTime: 'orange'
      }
      return colorMap[type] || 'grey'
    },

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

    getLRFieldColor (fieldName) {
      // Categorize by field name
      if (fieldName.includes('ip') || fieldName.includes('port') || fieldName.includes('mac')) {
        return 'blue'
      }
      if (fieldName.includes('user') || fieldName.includes('login') || fieldName.includes('domain')) {
        return 'purple'
      }
      if (fieldName.includes('process') || fieldName.includes('command')) {
        return 'orange'
      }
      if (fieldName.includes('date') || fieldName.includes('time')) {
        return 'teal'
      }
      return 'primary'
    },

    getFanoutParentHint () {
      if (this.mappingForm.fanoutParentElement) {
        return 'Auto-populated based on fanout selection from Step 3'
      }
      if (this.fanoutArrays.length > 0) {
        return 'Field is not within any fanout array'
      }
      return 'No fanout arrays configured in Step 3'
    },

    loadLRSchemaFields () {
      try {
        this.lrSchemaFields = MappingService.getLRSchemaFields()
      } catch (error) {
        console.error('[Step 5] Error loading LR schema fields:', error)
        this.lrSchemaFields = []
      }
    },

    loadDataTypeOptions () {
      try {
        this.dataTypeOptions = MappingService.getDataTypeOptions()
      } catch (error) {
        console.error('[Step 5] Error loading data type options:', error)
        this.dataTypeOptions = []
      }
    },

    goToSampleDataStep () {
      this.$emit('go-to-step', 1)
    },

    async proceedToNext () {
      this.isSaving = true

      try {
        if (!this.localMappings || this.localMappings.length === 0) {
          this.$q.notify({
            type: 'warning',
            message: 'At least one field mapping is required',
            caption: 'Please create at least one mapping before proceeding',
            position: 'top',
            icon: 'warning'
          })
          this.isSaving = false
          return
        }

        // Validate all mappings
        const validation = MappingService.validateAllMappings(this.localMappings)

        if (!validation.isValid) {
          this.$q.notify({
            type: 'warning',
            message: 'Please fix mapping errors before proceeding',
            caption: validation.errors[0],
            position: 'top'
          })
          this.isSaving = false
          return
        }

        // Save to store
        this.saveStateToStore()

        // Emit events
        this.$emit('step-valid')
        this.$emit('next-step')
      } catch (error) {
        console.error('[Step 5] Error proceeding:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to proceed',
          caption: error.message,
          position: 'top'
        })
      } finally {
        this.isSaving = false
      }
    },

    restoreStateFromStore () {
      try {
        if (this.fieldMappings && this.fieldMappings.mappings && Array.isArray(this.fieldMappings.mappings)) {
          this.localMappings = JSON.parse(JSON.stringify(this.fieldMappings.mappings))

          // Ensure IDs
          this.localMappings.forEach((mapping, index) => {
            if (!mapping.id) {
              mapping.id = `mapping-${Date.now()}-${index}`
            }
          })
        }
      } catch (error) {
        console.error('[Step 5] Error restoring state:', error)
      }
    },

    saveStateToStore () {
      try {
        const mappings = JSON.parse(JSON.stringify(this.localMappings))
        this.UPDATE_FIELD_MAPPINGS({ mappings })
      } catch (error) {
        console.error('[Step 5] Error saving state:', error)
        throw error
      }
    },

    onMappingFilterFilter (val, update) {
      const needle = (val || '').toLowerCase()
      update(() => {
        if (!needle) return this.mappingFilterOptions
        return this.mappingFilterOptions.filter(o => o.label.toLowerCase().includes(needle))
      })
    }
  },

  created () {
    try {
      this.loadLRSchemaFields()
      this.loadDataTypeOptions()
      this.buildJsonTree()
      this.restoreStateFromStore()
    } catch (error) {
      console.error('[Step 5] Error during initialization:', error)
    }
  },

  beforeDestroy () {
    this.isDestroyed = true
    try {
      this.saveStateToStore()
    } catch (error) {
      console.error('[Step 5] Error saving state on destroy:', error)
    }
  }
}
</script>

<style lang="scss" scoped>
.step-mapping {
  max-width: 1400px;
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

.instructions-banner {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
  border-left: 4px solid #2196F3;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.instructions-content {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mapping-progress {
  display: flex;
  gap: 0.5rem;
}

.step-content {
  margin-bottom: 3rem;
}

/* Loading & Warning States */
.loading-state,
.no-fields-warning {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-message,
.no-fields-message {
  color: var(--q-color-grey-7);
  font-size: 1.125rem;
  margin-top: 1rem;
}

/* Split Panel Layout (Desktop) */
.split-panel-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  min-height: 800px; /* Increased from 600px for better visibility */
}

.panel {
  display: flex;
  flex-direction: column;
  background: #263238;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #E3F2FD;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tree-search,
.grid-search {
  width: 200px;
}

.panel-content {
  flex: 1;
  overflow-y: auto; /* Smooth scrolling with visible scrollbar */
  overflow-x: hidden;
  padding: 1rem;
  max-height: calc(100vh - 400px); /* Ensure scrolling when content exceeds viewport */

  /* Custom scrollbar styling for dark theme */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(33, 150, 243, 0.5);
    border-radius: 5px;

    &:hover {
      background: rgba(33, 150, 243, 0.7);
    }
  }
}

/* Empty States */
.empty-mappings {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  text-align: center;
  color: var(--q-color-grey-6);
}

.empty-message {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 1rem 0 0.5rem 0;
}

.empty-hint {
  font-size: 0.95rem;
  color: var(--q-color-grey-7);
  margin: 0;
}

/* Mappings Table */
.mappings-table {
  ::v-deep .q-table__card {
    box-shadow: none;
    background: transparent;
  }

  ::v-deep .q-table thead tr,
  ::v-deep .q-table tbody td {
    background: transparent;
  }

  ::v-deep .q-table thead th {
    background: rgba(255, 255, 255, 0.05);
    color: #2196F3;
    font-weight: 600;
    font-size: 0.875rem;
  }

  ::v-deep .q-table tbody td {
    color: #E3F2FD;
    font-size: 0.875rem;
    padding: 12px 8px;
  }
}

.json-path-cell {
  display: flex;
  align-items: center;
  font-family: monospace;
  font-size: 0.875rem;
}

.path-text {
  color: #A5D6A7;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

/* Mobile: Tabbed Layout */
.tabbed-layout {
  display: none;
}

.mobile-only {
  display: none;
}

.desktop-only {
  display: grid;
}

@media (max-width: 1024px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .tabbed-layout {
    display: block;
    background: #263238;
    border-radius: 8px;
    overflow: hidden;
  }

  .mapping-tabs {
    background: rgba(255, 255, 255, 0.05);
  }

  .tab-panels {
    min-height: 500px;
  }

  .tree-tab-panel,
  .mappings-tab-panel {
    padding: 1rem;
  }

  .mobile-search {
    margin-bottom: 1rem;
  }
}

/* Mapping Dialog */
.dialog-header {
  background: var(--q-color-grey-10);
  color: #E3F2FD;
}

.mapping-form-section {
  /* Removed max-height and overflow-y to allow full content display */
}

.sample-value-banner {
  background: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196F3;
}

.sample-value-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  code {
    background: rgba(0, 0, 0, 0.2);
    padding: 2px 8px;
    border-radius: 4px;
    color: #A5D6A7;
    font-size: 0.9rem;
  }
}

.suggestions-header {
  background: rgba(255, 193, 7, 0.1);
  padding: 8px 16px;
  font-weight: 600;
  color: #FFC107;
}

/* Step Actions */
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

/* Mobile Mappings List */
.mappings-list-mobile {
  background: transparent;
}

.mapping-item-mobile {
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 0.5rem;
  border-radius: 8px;
}

.json-path-mobile {
  font-family: monospace;
  font-size: 0.875rem;
  color: #A5D6A7;
  font-weight: 500;
}

.mobile-actions {
  display: flex;
  gap: 4px;
}

.empty-mappings-mobile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  color: var(--q-color-grey-6);
}

/* Dark Theme Input Styles - Matching Step 4 exactly */
::v-deep .mapping-form-section {
  .q-field {
    .q-field__control {
      background-color: whitesmoke !important;
      color: #000000 !important;
      border-radius: 4px;
    }

    .q-field__native,
    .q-field__input {
      color: #000000 !important;
      background-color: transparent !important;
    }

    .q-field__label {
      color: rgba(0, 0, 0, 0.6) !important;
    }

    .q-field__control:before {
      border-color: rgba(0, 0, 0, 0.24) !important;
    }

    .q-field--focused .q-field__label {
      color: var(--q-color-primary) !important;
    }

    .q-field--focused .q-field__control:before {
      border-color: var(--q-color-primary) !important;
    }
  }

  // Error state styling with better visibility - Blue instead of red
  .q-field--error {
    .q-field__label {
      color: #2196f3 !important;
      font-weight: 500;
    }

    .q-field__control:before {
      border-color: #2196f3 !important;
      border-width: 2px !important;
    }

    .q-field__control:after {
      border-color: #2196f3 !important;
    }

    .q-field__append .q-icon {
      color: #2196f3 !important;
    }
  }

  // Ensure the selected value is visible
  .q-field__marginal {
    color: #000000 !important;
  }

  // Dropdown icon
  .q-select__dropdown-icon {
    color: var(--q-color-primary) !important;
  }

  // Style the actual text display area
  input {
    color: #000000 !important;
    background-color: transparent !important;
  }

  // For use-input mode in q-select
  .q-field__control-container {
    input {
      color: #000000 !important;
      background-color: transparent !important;
    }
  }

  // Selected item text in q-select (but not chips)
  .q-field__native > span:not(.q-chip) {
    color: #000000 !important;
  }

  // Error message styling - Blue color instead of red
  .q-field__messages {
    color: #2196f3 !important;
    font-weight: 600;
    font-size: 13px;
    margin-top: 6px;
    padding: 0 12px;
    min-height: 20px;
    display: block !important;
    visibility: visible !important;
  }

  .q-field__bottom {
    padding-top: 6px;
    min-height: 24px;

    > div {
      color: #2196f3 !important;
      font-weight: 600;
      font-size: 13px;
      display: block !important;
      visibility: visible !important;
    }
  }

  // Ensure error messages are always shown when field has error
  .q-field--error {
    .q-field__bottom {
      display: block !important;
      visibility: visible !important;
    }

    .q-field__messages {
      display: block !important;
      visibility: visible !important;
    }
  }

  // Chips styling for multiple select
  .q-chip {
    background: #03a9f4 !important;
    background-color: #03a9f4 !important;
    background-image: none !important;
    color: #000000 !important;
    border: 2px solid #29b6f6 !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    padding: 8px 14px !important;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4) !important;

    span,
    .q-chip__content,
    .q-chip__content span {
      color: #000000 !important;
    }

    .q-icon,
    .q-chip__icon--remove {
      color: #000000 !important;
      opacity: 1 !important;
      font-weight: bold !important;

      &:hover {
        opacity: 1 !important;
        background-color: rgba(0, 0, 0, 0.2) !important;
        border-radius: 50%;
      }
    }
  }

  // Help icon in append slot
  .q-field__append .q-icon {
    color: rgba(0, 0, 0, 0.6) !important;
  }

  // For read-only fields
  .q-field--readonly {
    .q-field__control {
      background-color: #f5f5f5 !important;
    }

    .q-field__native,
    .q-field__input {
      color: rgba(0, 0, 0, 0.6) !important;
    }
  }
}

/* Responsive */
@media (max-width: 768px) {
  .instructions-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .mapping-progress {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>

<style lang="scss">
/* Global unscoped styles for dropdown menu - Must be unscoped for q-menu portals */
/* Ultra-specific selectors to override body--dark theme styles */

/* Target the q-menu element directly - Override body--dark input styles */
[dir] body.body--dark .q-menu.dropdown-dark,
[dir] .body--dark .q-menu.dropdown-dark,
body .q-menu.dropdown-dark,
body.body--dark .q-menu.dropdown-dark,
.body--dark .q-menu.dropdown-dark,
.dropdown-dark.q-menu {
  background: #000000 !important;
  background-color: #000000 !important;
}

/* Target all elements within dropdown-dark */
[dir] body.body--dark .dropdown-dark,
[dir] .body--dark .dropdown-dark,
body .dropdown-dark,
body.body--dark .dropdown-dark,
.body--dark .dropdown-dark,
.dropdown-dark {
  background: #000000 !important;
  background-color: #000000 !important;

  .q-menu {
    background: #000000 !important;
    background-color: #000000 !important;
  }

  .q-virtual-scroll__content {
    background: #000000 !important;
    background-color: #000000 !important;
  }

  .q-list {
    background: #000000 !important;
    background-color: #000000 !important;
  }

  /* Override body--dark input styles */
  input,
  textarea,
  select {
    background: #000000 !important;
    background-color: #000000 !important;
  }

  /* Force items to have black background and white text */
  .q-item {
    color: #ffffff !important;
    background: #000000 !important;
    background-color: #000000 !important;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover,
    &.q-item--active,
    &.q-manual-focusable--focused {
      background: #2196f3 !important;
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

  /* Ensure header items (like "Smart Suggestions") are visible */
  .q-item-label--header {
    color: #ffffff !important;
    background: rgba(255, 255, 255, 0.1) !important;
    background-color: rgba(255, 255, 255, 0.1) !important;
  }

  /* Icon colors */
  .q-icon {
    color: #ffffff !important;
  }

  /* Override body--dark styles for chips in dropdown */
  .q-chip {
    background: #FFC107 !important;
    background-color: #FFC107 !important;
    color: #000000 !important;
  }
}

/* Extra specific overrides for body--dark with [dir] attribute */
[dir] body.body--dark .dropdown-dark .q-item,
[dir] .body--dark .dropdown-dark .q-item,
body.body--dark .dropdown-dark .q-item,
.body--dark .dropdown-dark .q-item {
  color: #ffffff !important;
  background: #000000 !important;
  background-color: #000000 !important;
}

[dir] body.body--dark .dropdown-dark .q-item__label,
[dir] .body--dark .dropdown-dark .q-item__label,
body.body--dark .dropdown-dark .q-item__label,
.body--dark .dropdown-dark .q-item__label {
  color: #ffffff !important;
}

[dir] body.body--dark .dropdown-dark .q-item__section,
[dir] .body--dark .dropdown-dark .q-item__section,
body.body--dark .dropdown-dark .q-item__section,
.body--dark .dropdown-dark .q-item__section {
  color: #ffffff !important;
}

[dir] body.body--dark .dropdown-dark .q-list,
[dir] .body--dark .dropdown-dark .q-list,
body.body--dark .dropdown-dark .q-list,
.body--dark .dropdown-dark .q-list {
  background: #000000 !important;
  background-color: #000000 !important;
}

/* Ensure menu container has black background - Override input styles */
[dir] body.body--dark .q-menu.dropdown-dark .q-virtual-scroll__content,
[dir] .body--dark .q-menu.dropdown-dark .q-virtual-scroll__content,
body.body--dark .q-menu.dropdown-dark .q-virtual-scroll__content,
.body--dark .q-menu.dropdown-dark .q-virtual-scroll__content {
  background: #000000 !important;
  background-color: #000000 !important;
}

/* Override any input/textarea/select styles within dropdown */
[dir] body.body--dark .dropdown-dark input,
[dir] body.body--dark .dropdown-dark textarea,
[dir] body.body--dark .dropdown-dark select,
[dir] .body--dark .dropdown-dark input,
[dir] .body--dark .dropdown-dark textarea,
[dir] .body--dark .dropdown-dark select {
  background: transparent !important;
  background-color: transparent !important;
  color: #ffffff !important;
}

/* Strong unified hover/active/focus styling for all Step 5 dropdown menus
   Ensures solid blue (#2196f3) background instead of lighter translucent variant */
.q-dialog .q-menu.dropdown-dark .q-item:hover,
.q-dialog .q-menu.dropdown-dark .q-item--active,
.q-dialog .q-menu.dropdown-dark .q-item.q-manual-focusable--focused,
.q-menu.dropdown-dark .q-item:hover,
.q-menu.dropdown-dark .q-item--active,
.q-menu.dropdown-dark .q-item.q-manual-focusable--focused {
  background: #2196f3 !important;
  background-color: #2196f3 !important;
  color: #ffffff !important;
}

/* Remove any overlay/ripple lightening effect on focused item initial render */
.q-menu.dropdown-dark .q-item.q-focusable:after {
  background: transparent !important;
}

/* Ensure caption text also white on hover/active */
.q-menu.dropdown-dark .q-item:hover .q-item__label--caption,
.q-menu.dropdown-dark .q-item--active .q-item__label--caption,
.q-menu.dropdown-dark .q-item.q-manual-focusable--focused .q-item__label--caption {
  color: #e3f2fd !important;
}

/* Force white background on input control area inside mapping dialog - Override body--dark */
.mapping-popup .q-field__control,
body.body--dark .mapping-popup .q-field__control,
.body--dark .mapping-popup .q-field__control,
[dir] body.body--dark .mapping-popup .q-field__control,
[dir] .body--dark .mapping-popup .q-field__control {
  background: whitesmoke !important;
  background-color: whitesmoke !important;
}

.mapping-popup .q-field__native,
.mapping-popup .q-field__input,
.mapping-popup input,
body.body--dark .mapping-popup .q-field__native,
body.body--dark .mapping-popup .q-field__input,
body.body--dark .mapping-popup input,
.body--dark .mapping-popup .q-field__native,
.body--dark .mapping-popup .q-field__input,
.body--dark .mapping-popup input {
  color: #000000 !important;
  background-color: transparent !important;
}

.mapping-popup .q-field__label,
body.body--dark .mapping-popup .q-field__label,
.body--dark .mapping-popup .q-field__label {
  color: rgba(0, 0, 0, 0.6) !important;
}

.mapping-popup .q-field--focused .q-field__label,
body.body--dark .mapping-popup .q-field--focused .q-field__label,
.body--dark .mapping-popup .q-field--focused .q-field__label {
  color: var(--q-color-primary) !important;
}

/* Ensure dropdown icon is visible */
.mapping-popup .q-select__dropdown-icon,
body.body--dark .mapping-popup .q-select__dropdown-icon,
.body--dark .mapping-popup .q-select__dropdown-icon {
  color: var(--q-color-primary) !important;
}

/* Selected value display area */
.mapping-popup .q-field__native > span:not(.q-chip),
body.body--dark .mapping-popup .q-field__native > span:not(.q-chip),
.body--dark .mapping-popup .q-field__native > span:not(.q-chip) {
  color: #000000 !important;
}
</style>
