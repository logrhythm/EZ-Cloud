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
      <div v-if="isExtractingFields || isLoadingFromPolicy" class="loading-state">
        <q-spinner color="primary" size="48px" />
        <p class="loading-message">
          {{ isLoadingFromPolicy ? 'Loading existing field mappings...' : 'Building JSON tree structure...' }}
        </p>
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
                :mapped-paths-case-map="mappedPathsCaseInsensitiveMap"
                :highlighted-path="highlightedPath"
                :clickable-mode="true"
                :search-query="treeSearchQuery"
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
                <!-- Search textbox for filtering mappings -->
                <q-input
                  v-model="gridSearchQuery"
                  dense
                  outlined
                  placeholder="Filter mappings..."
                  class="grid-search"
                  debounce="300"
                  clearable
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
                </q-input>

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

              <!-- No Results After Filter -->
              <div v-else-if="filteredMappings.length === 0" class="empty-mappings">
                <q-icon name="search_off" size="64px" color="grey-5" />
                <p class="empty-message">No mappings match your search</p>
                <p class="empty-hint">Try a different search term or clear the filter</p>
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
                  <q-tr
                    :props="props"
                    :class="{ 'missing-field-row': isMissingField(props.row) }"
                    class="clickable-row"
                    @click="editMapping(props.row)"
                    style="cursor: pointer;"
                  >
                    <!-- JSON Path -->
                    <q-td key="inputRule" :props="props">
                      <div class="json-path-cell">
                        <q-icon :name="getTypeIcon(props.row.type)" :color="getTypeIconColor(props.row.type)" size="xs" class="q-mr-xs" />
                        <span class="path-text">{{ props.row.inputRule }}</span>
                        <!-- Missing Field Warning Badge -->
                        <q-badge
                          v-if="isMissingField(props.row)"
                          color="orange"
                          text-color="white"
                          class="missing-field-badge q-ml-sm"
                        >
                          <q-icon name="warning" size="12px" class="q-mr-xs" />
                          missing
                          <q-tooltip>
                            {{ getFieldWarningMessage(props.row) }}
                          </q-tooltip>
                        </q-badge>
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

                    <!-- Fanout Parent -->
                    <q-td key="fanoutParentElement" :props="props">
                      <div v-if="props.row.fanoutParentElement" class="fanout-parent-cell">
                        <q-chip
                          color="purple"
                          text-color="white"
                          size="sm"
                          dense
                          icon="account_tree"
                        >
                          {{ props.row.fanoutParentElement }}
                        </q-chip>
                      </div>
                      <span v-else class="no-fanout-text">—</span>
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
                          @click.stop="highlightInTree(props.row.inputRule)"
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
                          @click.stop="editMapping(props.row)"
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
                          @click.stop="deleteMapping(props.row.id)"
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
                :mapped-paths-case-map="mappedPathsCaseInsensitiveMap"
                :highlighted-path="highlightedPath"
                :clickable-mode="true"
                :search-query="treeSearchQuery"
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
                <q-item
                  v-for="mapping in localMappings"
                  :key="mapping.id"
                  clickable
                  @click="editMapping(mapping)"
                  class="mapping-item-mobile"
                  :class="{ 'missing-field-item': isMissingField(mapping) }"
                >
                  <q-item-section>
                    <q-item-label class="json-path-mobile">
                      <q-icon :name="getTypeIcon(mapping.type)" :color="getTypeIconColor(mapping.type)" size="xs" class="q-mr-xs" />
                      {{ mapping.inputRule }}
                      <!-- Missing Field Badge (Mobile) -->
                      <q-badge
                        v-if="isMissingField(mapping)"
                        color="orange"
                        text-color="white"
                        class="missing-field-badge q-ml-sm"
                      >
                        <q-icon name="warning" size="12px" class="q-mr-xs" />
                        missing
                      </q-badge>
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
                        @click.stop="editMapping(mapping)"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        size="sm"
                        icon="delete"
                        color="negative"
                        @click.stop="deleteMapping(mapping.id)"
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

          <!-- Missing Field Warning Banner (Update Mode) -->
          <q-banner
            v-if="editingMapping && isMissingField(editingMapping)"
            class="bg-orange text-white missing-field-warning-banner"
            dense
          >
            <template v-slot:avatar>
              <q-icon name="warning" color="white" />
            </template>
            <div>
              <strong>Warning:</strong> This field path does not exist in the current sample data.
              Verify the path or update the sample data.
            </div>
          </q-banner>

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

                <!-- Operation Syntax Preview -->
                <div v-if="operationConfig.type" class="col-12">
                  <q-banner class="operation-syntax-preview" dense>
                    <template v-slot:avatar>
                      <q-icon name="functions" color="primary" size="24px" />
                    </template>
                    <div>
                      <div class="syntax-label">Generated Operation Syntax:</div>
                      <div class="syntax-display">
                        <code>{{ mappingForm.inputRule }}</code>
                      </div>
                      <div class="syntax-hint">
                        This syntax will be saved to the policy file
                      </div>
                    </div>
                  </q-banner>
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
                <div v-if="mappingForm.sampleValueDisplay" class="col-12">
                  <q-banner dense class="sample-value-banner">
                    <template v-slot:avatar>
                      <q-icon name="preview" />
                    </template>
                    <div class="sample-value-content">
                      <strong>Sample Value:</strong>
                      <code class="q-ml-sm">{{ mappingForm.sampleValueDisplay }}</code>
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
        aria-label="Go to previous step"
      />

      <q-btn
        unelevated
        color="primary"
        icon-right="arrow_forward"
        label="Continue to Sub transform"
        :loading="isSaving"
        @click="proceedToNext"
        class="wizard-btn wizard-btn--primary"
        aria-label="Continue to sub transform step"
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
        sampleValue: null,
        sampleValueDisplay: null
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

      // Update mode state
      missingPolicyFields: [], // Track fields from policy that are missing in sample data
      isLoadingFromPolicy: false, // Loading state for policy prefill

      // Table columns
      mappingColumns: [
        {
          name: 'inputRule',
          label: 'JSON Path',
          field: 'inputRule',
          align: 'left',
          sortable: true,
          style: 'max-width: 400px; word-wrap: break-word; overflow-wrap: break-word;' // Better wrapping for long paths
        },
        {
          name: 'arrow',
          label: '',
          field: 'arrow',
          align: 'center',
          style: 'width: 40px; padding: 4px;'
        },
        {
          name: 'lrSchemaField',
          label: 'LR Field',
          field: 'lrSchemaField',
          align: 'left',
          sortable: true,
          style: 'width: 200px;'
        },
        {
          name: 'fanoutParentElement',
          label: 'Fanout Parent',
          field: 'fanoutParentElement',
          align: 'left',
          sortable: true,
          style: 'width: 220px;'
        },
        {
          name: 'type',
          label: 'Type',
          field: 'type',
          align: 'center',
          sortable: true,
          style: 'width: 100px;'
        },
        {
          name: 'actions',
          label: 'Actions',
          field: 'actions',
          align: 'center',
          style: 'width: 150px; min-width: 150px;' // Fixed width to ensure buttons are always visible
        }
      ]
    }
  },

  watch: {
    treeSearchQuery (newQuery) {
      if (newQuery && newQuery.trim().length > 0) {
        // When searching, expand all nodes to show results
        this.expandAll()
      }
    },

    // Watch for changes in field mappings from Vuex store
    // This ensures local state is updated when store is reset
    'fieldMappings.mappings': {
      handler (newMappings) {
        // Only update local mappings if they differ from store
        // This prevents circular updates
        const storeJson = JSON.stringify(newMappings || [])
        const localJson = JSON.stringify(this.localMappings || [])

        if (storeJson !== localJson) {
          console.log('[Step 5] Detected mappings change in store, updating local state')
          this.restoreStateFromStore()

          // If mappings were cleared (reset), also rebuild the tree
          if (!newMappings || newMappings.length === 0) {
            console.log('[Step 5] Mappings were reset, rebuilding tree')
            this.buildJsonTree()
          }
        }
      },
      deep: true
    }
  },

  computed: {
    ...mapState('wizard', ['sampleData', 'fieldMappings', 'schemaRules', 'projectConfig', 'policyUpload']),

    /**
     * Check if application is in update mode
     * @returns {boolean}
     */
    isUpdateMode () {
      return this.projectConfig?.mode === 'update' &&
             this.policyUpload?.uploadedPolicyData !== null
    },

    /**
     * Get fanout arrays from Step 3 for path resolution
     */
    fanoutArrays () {
      return this.$store.getters['wizard/getFanoutArrays']
    },

    /**
     * Build a case-insensitive map for mapped paths
     * Map structure: lowercase path -> [original paths with their actual casing]
     */
    mappedPathsCaseInsensitiveMap () {
      const caseInsensitiveMap = new Map()

      this.localMappings.forEach(m => {
        if (m.inputRule) {
          // Store case-insensitive version of inputRule for lookup
          const originalPath = m.inputRule
          const lowerPath = originalPath.toLowerCase()
          if (!caseInsensitiveMap.has(lowerPath)) {
            caseInsensitiveMap.set(lowerPath, [])
          }
          caseInsensitiveMap.get(lowerPath).push(originalPath)

          // If mapping has a fanout parent, also store the reconstructed tree path
          if (m.fanoutParentElement) {
            // Extract the base path without operation syntax
            let basePath = m.inputRule
            const parsed = parseOperationFromInputRule(m.inputRule)
            if (parsed.fieldPath) {
              basePath = parsed.fieldPath
            }

            // Strip leading $. from basePath if present (relative paths)
            if (basePath.startsWith('$.')) {
              basePath = basePath.substring(2)
            } else if (basePath.startsWith('$')) {
              basePath = basePath.substring(1)
            }

            // Strip leading . from basePath
            if (basePath.startsWith('.')) {
              basePath = basePath.substring(1)
            }

            let fanoutParent = m.fanoutParentElement

            // Strip trailing [*] from fanoutParent if present
            if (fanoutParent.endsWith('[*]')) {
              fanoutParent = fanoutParent.substring(0, fanoutParent.length - 3)
            }

            // Construct tree path: $.parent[*].field
            const treePath = `${fanoutParent}[*].${basePath}`

            // Store case-insensitive version for lookup
            const lowerTreePath = treePath.toLowerCase()
            if (!caseInsensitiveMap.has(lowerTreePath)) {
              caseInsensitiveMap.set(lowerTreePath, [])
            }
            caseInsensitiveMap.get(lowerTreePath).push(treePath)
          }
        }
      })

      return caseInsensitiveMap
    },

    mappedPathsSet () {
      const paths = new Set()

      this.localMappings.forEach(m => {
        if (m.inputRule) {
          // Add the original inputRule
          paths.add(m.inputRule)

          // If mapping has a fanout parent, reconstruct full paths for tree matching
          if (m.fanoutParentElement) {
            // Extract the base path without operation syntax
            let basePath = m.inputRule
            const parsed = parseOperationFromInputRule(m.inputRule)
            if (parsed.fieldPath) {
              basePath = parsed.fieldPath
            }

            // Strip leading $. from basePath if present (relative paths)
            // because we'll be concatenating with fanoutParent which already has $
            if (basePath.startsWith('$.')) {
              basePath = basePath.substring(2)
            } else if (basePath.startsWith('$')) {
              basePath = basePath.substring(1)
            }

            // Strip leading . from basePath
            if (basePath.startsWith('.')) {
              basePath = basePath.substring(1)
            }

            let fanoutParent = m.fanoutParentElement

            // Strip trailing [*] from fanoutParent if present
            if (fanoutParent.endsWith('[*]')) {
              fanoutParent = fanoutParent.substring(0, fanoutParent.length - 3)
            }

            // Construct tree paths: $.parent[*].field
            // The tree always uses [*] notation for array children
            const treePath = `${fanoutParent}[*].${basePath}`
            paths.add(treePath)

            console.log('[Step 5] Reconstructed tree path for fanout field:', {
              originalInputRule: m.inputRule,
              fanoutParent: m.fanoutParentElement,
              basePath,
              treePath
            })
          }
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
        // NDJSON/JSONL data is stored with logType: 'multiline'
        const isMultiLine = this.sampleData.logType === 'multiline'

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
      // Store ORIGINAL typed values for operations, and create display string for UI
      let sampleValue = null
      let sampleValueDisplay = null

      if (aggregatedValues && aggregatedValues.length > 0) {
        // ALWAYS keep as array for operation validation
        // Operations will validate each value and show matching/non-matching results
        sampleValue = aggregatedValues

        // Create display string for UI (show first 3 values)
        const firstValues = aggregatedValues.slice(0, 3).map(v => {
          if (typeof v === 'string') {
            return v.length > 50 ? v.substring(0, 50) + '...' : v
          }
          return JSON.stringify(v)
        })
        sampleValueDisplay = firstValues.join(', ')
        if (aggregatedValues.length > 3) {
          sampleValueDisplay += ` (+${aggregatedValues.length - 3} more)`
        }
      } else if (value !== null && value !== undefined) {
        // Store original typed value as single-element array for consistency
        sampleValue = [value]
        sampleValueDisplay = String(value)
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
        sampleValue: sampleValue, // Typed values for operations
        sampleValueDisplay: sampleValueDisplay // Display string for UI
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
      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [Step 5] editMapping - CALLED')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ mapping.inputRule:', mapping.inputRule)
      console.log('╚════════════════════════════════════════════════════════════════════════')

      this.editingMapping = mapping
      this.validationErrors = {}

      // Parse operation from inputRule if present
      const parsed = parseOperationFromInputRule(mapping.inputRule)

      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [Step 5] editMapping - Parsed operation from inputRule')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ Input rule:', mapping.inputRule)
      console.log('║ Parsed result:')
      console.log('║   type:', parsed.type)
      console.log('║   fieldPath:', parsed.fieldPath)
      console.log('║   parameters:', JSON.stringify(parsed.parameters, null, 2))
      console.log('╚════════════════════════════════════════════════════════════════════════')

      // Store original field path and operation config
      this.originalFieldPath = parsed.fieldPath || mapping.inputRule

      // Use $set to ensure Vue reactivity (Vue 2)
      this.$set(this, 'operationConfig', {
        type: parsed.type,
        parameters: parsed.parameters || {}
      })

      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [Step 5] editMapping - operationConfig SET')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ this.operationConfig:', JSON.stringify(this.operationConfig, null, 2))
      console.log('║ this.originalFieldPath:', this.originalFieldPath)
      console.log('╚════════════════════════════════════════════════════════════════════════')

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

          // Also create display value
          if (Array.isArray(pathOption.sampleValue)) {
            const firstValues = pathOption.sampleValue.slice(0, 3).map(v => {
              if (typeof v === 'string') {
                return v.length > 50 ? v.substring(0, 50) + '...' : v
              }
              return JSON.stringify(v)
            })
            this.mappingForm.sampleValueDisplay = firstValues.join(', ')
            if (pathOption.sampleValue.length > 3) {
              this.mappingForm.sampleValueDisplay += ` (+${pathOption.sampleValue.length - 3} more)`
            }
          } else {
            this.mappingForm.sampleValueDisplay = String(pathOption.sampleValue)
          }
        }
      }

      // If sampleValue exists but sampleValueDisplay doesn't, create it
      if (this.mappingForm.sampleValue && !this.mappingForm.sampleValueDisplay) {
        if (Array.isArray(this.mappingForm.sampleValue)) {
          const firstValues = this.mappingForm.sampleValue.slice(0, 3).map(v => {
            if (typeof v === 'string') {
              return v.length > 50 ? v.substring(0, 50) + '...' : v
            }
            return JSON.stringify(v)
          })
          this.mappingForm.sampleValueDisplay = firstValues.join(', ')
          if (this.mappingForm.sampleValue.length > 3) {
            this.mappingForm.sampleValueDisplay += ` (+${this.mappingForm.sampleValue.length - 3} more)`
          }
        } else {
          this.mappingForm.sampleValueDisplay = String(this.mappingForm.sampleValue)
        }
      }

      this.mappingDialog = true
    },

    /**
     * Handle operation configuration changes
     * Rebuild inputRule with operation syntax
     */
    handleOperationChanged (newOperationConfig) {
      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ 🔧 [OPERATION] handleOperationChanged - START')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ Step: Operation selector @input event fired')
      console.log('║ Received newOperationConfig:', JSON.stringify(newOperationConfig, null, 2))
      console.log('║ newOperationConfig.type:', newOperationConfig.type)
      console.log('║ newOperationConfig.parameters:', JSON.stringify(newOperationConfig.parameters, null, 2))
      console.log('║ originalFieldPath (base field):', this.originalFieldPath)
      console.log('║ Current mappingForm.inputRule BEFORE:', this.mappingForm.inputRule)
      console.log('╚════════════════════════════════════════════════════════════════════════')

      // Update local operation config
      this.operationConfig = { ...newOperationConfig }

      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ 🔧 [OPERATION] Updated this.operationConfig')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ this.operationConfig:', JSON.stringify(this.operationConfig, null, 2))
      console.log('╚════════════════════════════════════════════════════════════════════════')

      // Rebuild inputRule with operation syntax
      if (newOperationConfig.type) {
        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 5] Operation type detected - Building syntax')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ Calling buildOperationSyntax with:')
        console.log('║   type:', newOperationConfig.type)
        console.log('║   fieldPath:', this.originalFieldPath)
        console.log('║   parameters:', JSON.stringify(newOperationConfig.parameters, null, 2))
        console.log('╚════════════════════════════════════════════════════════════════════════')

        const operationSyntax = buildOperationSyntax(
          newOperationConfig.type,
          this.originalFieldPath,
          newOperationConfig.parameters
        )

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 5] buildOperationSyntax RETURNED:')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ operationSyntax:', operationSyntax)
        console.log('║ operationSyntax type:', typeof operationSyntax)
        console.log('║ operationSyntax === null:', operationSyntax === null)
        console.log('║ operationSyntax === undefined:', operationSyntax === undefined)
        console.log('╚════════════════════════════════════════════════════════════════════════')

        // If buildOperationSyntax returns null (incomplete params), fallback to original path
        const finalInputRule = operationSyntax || this.originalFieldPath

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 5] Setting inputRule')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ operationSyntax:', operationSyntax)
        console.log('║ originalFieldPath (fallback):', this.originalFieldPath)
        console.log('║ FINAL inputRule to set:', finalInputRule)
        console.log('╚════════════════════════════════════════════════════════════════════════')

        this.mappingForm.inputRule = finalInputRule

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 5] inputRule AFTER assignment:')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ mappingForm.inputRule:', this.mappingForm.inputRule)
        console.log('╚════════════════════════════════════════════════════════════════════════')
      } else {
        // No operation, use plain field path
        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 5] NO operation type - Using plain path')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ Setting inputRule to originalFieldPath:', this.originalFieldPath)
        console.log('╚════════════════════════════════════════════════════════════════════════')

        this.mappingForm.inputRule = this.originalFieldPath

        console.log('[Step 5] inputRule set to plain path:', this.mappingForm.inputRule)
      }

      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [Step 5] handleOperationChanged - END')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ FINAL STATE:')
      console.log('║   operationConfig.type:', this.operationConfig.type)
      console.log('║   mappingForm.inputRule:', this.mappingForm.inputRule)
      console.log('╚════════════════════════════════════════════════════════════════════════')
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
        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 5] saveMapping - Saving mapping')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ BEFORE cleaning - Full mappingForm:')
        console.log(JSON.stringify(this.mappingForm, null, 2))
        console.log('║')
        console.log('║ Key fields:')
        console.log('║   mappingForm.inputRule:', this.mappingForm.inputRule)
        console.log('║   mappingForm.lrSchemaField:', this.mappingForm.lrSchemaField)
        console.log('║   mappingForm.type:', this.mappingForm.type)
        console.log('║   operationConfig.type:', this.operationConfig.type)
        console.log('║   operationConfig.parameters:', JSON.stringify(this.operationConfig.parameters, null, 2))
        console.log('╚════════════════════════════════════════════════════════════════════════')

        const cleanMapping = { ...this.mappingForm }
        delete cleanMapping.sampleValue

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 5] saveMapping - After cleaning')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ cleanMapping:')
        console.log(JSON.stringify(cleanMapping, null, 2))
        console.log('║')
        console.log('║ cleanMapping.inputRule:', cleanMapping.inputRule)
        console.log('╚════════════════════════════════════════════════════════════════════════')

        if (this.editingMapping) {
          const index = this.localMappings.findIndex(m => m.id === this.editingMapping.id)
          if (index !== -1) {
            console.log('[Step 5] Updating existing mapping at index:', index)
            this.$set(this.localMappings, index, cleanMapping)
            console.log('[Step 5] Updated mapping:', JSON.stringify(this.localMappings[index], null, 2))
          }
        } else {
          console.log('[Step 5] Adding new mapping to localMappings')
          this.localMappings.push(cleanMapping)
          console.log('[Step 5] Added mapping:', JSON.stringify(cleanMapping, null, 2))
        }

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 5] saveMapping - Current localMappings array')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ Total mappings:', this.localMappings.length)
        this.localMappings.forEach((m, idx) => {
          console.log(`║ [${idx}] inputRule:`, m.inputRule)
          console.log(`║ [${idx}] lrSchemaField:`, m.lrSchemaField)
        })
        console.log('╚════════════════════════════════════════════════════════════════════════')

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
      // Find the mapping to check for fanout parent
      const mapping = this.localMappings.find(m => m.inputRule === jsonPath)

      let treePathToHighlight = jsonPath

      // If mapping has fanout parent, reconstruct the full tree path
      if (mapping && mapping.fanoutParentElement) {
        // Extract the base path without operation syntax
        let basePath = jsonPath
        const parsed = parseOperationFromInputRule(jsonPath)
        if (parsed.fieldPath) {
          basePath = parsed.fieldPath
        }

        // Strip leading $. from basePath if present (relative paths)
        if (basePath.startsWith('$.')) {
          basePath = basePath.substring(2)
        } else if (basePath.startsWith('$')) {
          basePath = basePath.substring(1)
        }

        // Strip leading . from basePath
        if (basePath.startsWith('.')) {
          basePath = basePath.substring(1)
        }

        let fanoutParent = mapping.fanoutParentElement

        // Strip trailing [*] from fanoutParent if present
        if (fanoutParent.endsWith('[*]')) {
          fanoutParent = fanoutParent.substring(0, fanoutParent.length - 3)
        }

        // Construct tree path: $.parent[*].field
        treePathToHighlight = `${fanoutParent}[*].${basePath}`

        console.log('[Step 5] highlightInTree - Reconstructed path for fanout field:', {
          originalJsonPath: jsonPath,
          fanoutParent: mapping.fanoutParentElement,
          basePath,
          treePathToHighlight
        })
      }

      // Set highlighted path (use reconstructed path for fanout fields)
      this.highlightedPath = treePathToHighlight

      // Expand all parent nodes
      const parentPaths = MappingService.getParentPaths(treePathToHighlight)
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

        // Check for missing fields (Update Mode) and confirm with user
        if (this.missingPolicyFields && this.missingPolicyFields.length > 0) {
          const missingCount = this.missingPolicyFields.length

          // Show confirmation dialog
          this.$q.dialog({
            title: 'Missing Fields Detected',
            message: `${missingCount} mapping${missingCount !== 1 ? 's' : ''} reference field${missingCount !== 1 ? 's' : ''} not found in the current sample data. Do you want to continue anyway?`,
            persistent: true,
            ok: {
              label: 'Continue',
              color: 'primary'
            },
            cancel: {
              label: 'Review Mappings',
              color: 'grey'
            }
          }).onOk(() => {
            // User confirmed, proceed
            this.saveStateToStore()
            this.$emit('step-valid')
            this.$emit('next-step')
          }).onCancel(() => {
            // User wants to review
            this.$q.notify({
              type: 'info',
              message: 'Review the mappings with "missing" badges',
              caption: 'You can edit or delete mappings with missing fields',
              position: 'top',
              timeout: 4000
            })
          }).finally(() => {
            this.isSaving = false
          })

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
        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 5] saveStateToStore - Saving to Vuex')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ localMappings count:', this.localMappings.length)
        console.log('║')
        console.log('║ All mappings being saved:')
        this.localMappings.forEach((m, idx) => {
          console.log(`║ [${idx}]:`)
          console.log(`║   id: ${m.id}`)
          console.log(`║   inputRule: ${m.inputRule}`)
          console.log(`║   lrSchemaField: ${m.lrSchemaField}`)
          console.log(`║   type: ${m.type}`)
          console.log(`║   format: ${m.format}`)
          console.log(`║   default: ${m.default}`)
          console.log(`║   fanoutParentElement: ${m.fanoutParentElement}`)
          console.log('║')
        })
        console.log('╚════════════════════════════════════════════════════════════════════════')

        const mappings = JSON.parse(JSON.stringify(this.localMappings))

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 5] After JSON.parse(JSON.stringify):')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        mappings.forEach((m, idx) => {
          console.log(`║ [${idx}] inputRule:`, m.inputRule)
        })
        console.log('╚════════════════════════════════════════════════════════════════════════')

        this.UPDATE_FIELD_MAPPINGS({ mappings })

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 5] saveStateToStore - COMPLETED')
        console.log('║ Called UPDATE_FIELD_MAPPINGS mutation')
        console.log('╚════════════════════════════════════════════════════════════════════════')
      } catch (error) {
        console.error('[Step 5] Error saving state:', error)
        throw error
      }
    },

    // ========================================
    // UPDATE MODE METHODS
    // ========================================

    /**
     * Check if a field path exists in the current sample data
     * @param {string} fieldPath - The field path to check (inputRule)
     * @returns {boolean}
     */
    checkFieldExistsInSampleData (fieldPath) {
      if (!fieldPath || !this.availableJsonPaths) {
        console.log('[Step 5] checkFieldExistsInSampleData - early return:', { fieldPath, hasAvailablePaths: !!this.availableJsonPaths })
        return false
      }

      // Normalize path: ensure it starts with $. and convert to lowercase
      const normalizePath = (path) => {
        if (!path) return ''
        let normalized = path.trim()

        // Convert @. to $.
        if (normalized.startsWith('@.')) {
          normalized = '$.' + normalized.substring(2)
        }

        // Ensure it starts with $.
        if (!normalized.startsWith('$.')) {
          normalized = '$.' + normalized
        }

        // Replace all @ symbols with _ (underscore)
        // This handles cases like $.@metadata.beat -> $._metadata.beat
        // because JavaScript uses underscore for properties that start with @
        normalized = normalized.replace(/@/g, '_')

        // Remove array indices [0], [1], etc. for comparison (but keep [*])
        // This handles cases like $.response.user.groups[0] matching $.response.user.groups
        normalized = normalized.replace(/\[\d+\]/g, '')

        return normalized.toLowerCase()
      }

      const normalizedFieldPath = normalizePath(fieldPath)

      // Check if field exists in available paths - CASE-INSENSITIVE
      // First, try direct match
      const directMatch = this.availableJsonPaths.some(pathObj => {
        const pathValue = pathObj.value || pathObj.label || ''
        const normalizedAvailablePath = normalizePath(pathValue)
        return normalizedAvailablePath === normalizedFieldPath
      })

      if (directMatch) {
        console.log(`✓ [Step 5] Field FOUND (direct match): ${fieldPath}`)
        return true
      }

      // If no direct match and fanout arrays exist, try matching with fanout parents
      // This handles cases where policy has $.eventName but tree has $.Log.Records[*].eventName
      if (this.fanoutArrays && this.fanoutArrays.length > 0) {
        console.log(`[Step 5] No direct match for ${fieldPath}, trying fanout-based matching...`)
        console.log('[Step 5] Available fanout arrays:', this.fanoutArrays)

        // For each fanout parent, try to reconstruct what the full path would be
        for (const fanoutParent of this.fanoutArrays) {
          // Build potential full path by combining fanout parent with the field path
          // Strip $. from fieldPath for concatenation
          let relativePath = fieldPath
          if (relativePath.startsWith('$.')) {
            relativePath = relativePath.substring(2)
          } else if (relativePath.startsWith('$')) {
            relativePath = relativePath.substring(1)
          }

          // Build full path: fanoutParent + [*] + relativePath
          let reconstructedPath = fanoutParent
          if (!reconstructedPath.endsWith('[*]')) {
            reconstructedPath += '[*]'
          }
          reconstructedPath += '.' + relativePath

          const normalizedReconstructedPath = normalizePath(reconstructedPath)

          console.log(`[Step 5] Trying reconstructed path: ${reconstructedPath} (normalized: ${normalizedReconstructedPath})`)

          // Check if this reconstructed path exists in availableJsonPaths
          const fanoutMatch = this.availableJsonPaths.some(pathObj => {
            const pathValue = pathObj.value || pathObj.label || ''
            const normalizedAvailablePath = normalizePath(pathValue)
            return normalizedAvailablePath === normalizedReconstructedPath
          })

          if (fanoutMatch) {
            console.log(`✓ [Step 5] Field FOUND (fanout match): ${fieldPath} -> ${reconstructedPath}`)
            return true
          }
        }

        console.log(`⚠️  [Step 5] Field NOT FOUND even with fanout matching: ${fieldPath}`)
      } else {
        console.log(`⚠️  [Step 5] Field NOT FOUND: ${fieldPath} (normalized: ${normalizedFieldPath})`)
      }

      return false
    },

    /**
     * Check if a mapping has a missing field
     * @param {Object} mapping - The mapping object to check
     * @returns {boolean}
     */
    isMissingField (mapping) {
      if (!mapping || !mapping.inputRule) {
        return false
      }

      return this.missingPolicyFields.some(m =>
        m.path === mapping.inputRule ||
        m.path === mapping.originalInputRule
      )
    },

    /**
     * Get warning message for a missing field
     * @param {Object} mapping - The mapping object
     * @returns {string}
     */
    getFieldWarningMessage (mapping) {
      if (!this.isMissingField(mapping)) {
        return ''
      }

      const missingField = this.missingPolicyFields.find(m =>
        m.path === mapping.inputRule ||
        m.path === mapping.originalInputRule
      )

      return missingField?.message || 'Field defined in policy but not found in current sample data'
    },

    /**
     * Pre-fill Step 5 from uploaded policy data (Update mode)
     * Extracts transforms from policy and populates the mappings grid
     * @param {Object} policyData - The uploaded policy data
     * @async
     */
    async prefillFromPolicy (policyData) {
      try {
        console.log('============================================================')
        console.log('[Step 5] prefillFromPolicy: Starting pre-fill process')
        console.log('============================================================')

        this.isLoadingFromPolicy = true

        // Wait for tree building to complete
        await this.$nextTick()
        await this.$nextTick()

        // Extract transforms from policy (case-insensitive)
        const transforms = this.getCaseInsensitiveProperty(policyData, 'transforms') || []

        if (!Array.isArray(transforms) || transforms.length === 0) {
          console.log('[Step 5] No transforms found in policy')
          this.isLoadingFromPolicy = false
          return
        }

        console.log('[Step 5] Found', transforms.length, 'transforms in policy')

        // Track missing fields
        const missingFields = []
        const mappingsToAdd = []

        // Process each transform
        for (let index = 0; index < transforms.length; index++) {
          const transform = transforms[index]

          console.log('------------------------------------------------------------')
          console.log('[Step 5] Processing transform', index + 1)
          console.log('  inputRule:', transform.inputRule)
          console.log('  LRSchemaField:', transform.LRSchemaField)
          console.log('  type:', transform.type)
          console.log('------------------------------------------------------------')

          // Extract properties with case-insensitive access
          const inputRule = this.getCaseInsensitiveProperty(transform, 'inputRule') || ''
          const lrSchemaField = this.getCaseInsensitiveProperty(transform, 'LRSchemaField') || ''
          const type = this.getCaseInsensitiveProperty(transform, 'type')
          const format = this.getCaseInsensitiveProperty(transform, 'format') || null
          const defaultValue = this.getCaseInsensitiveProperty(transform, 'default') || null
          const alternativeFields = this.getCaseInsensitiveProperty(transform, 'alternativeFields')
          const fanoutParentElement = this.getCaseInsensitiveProperty(transform, 'FanoutParentElement') || null

          // Skip invalid transforms
          if (!inputRule && !lrSchemaField) {
            console.warn('[Step 5] Skipping invalid transform at index', index)
            continue
          }

          // Parse operation from inputRule if present
          const parsed = parseOperationFromInputRule(inputRule)
          const originalFieldPath = parsed.fieldPath || inputRule

          console.log(`[Step 5] Processing transform #${index}:`, {
            inputRule,
            parsedFieldPath: parsed.fieldPath,
            parsedOperation: parsed.operation,
            originalFieldPath,
            lrSchemaField
          })

          // Check if field exists in sample data
          const fieldExists = this.checkFieldExistsInSampleData(originalFieldPath)

          if (!fieldExists) {
            console.warn('[Step 5] Field from policy NOT FOUND in sample data:', originalFieldPath)

            // Track as missing field
            missingFields.push({
              type: 'mapping',
              path: inputRule,
              originalPath: originalFieldPath,
              message: 'Field defined in policy but not found in current sample data',
              reason: 'missing'
            })
          } else {
            console.log('[Step 5] Field from policy FOUND in sample data:', originalFieldPath)
          }

          // Create mapping object with case-insensitive property values
          const mapping = {
            id: `mapping-policy-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            inputRule: inputRule,
            lrSchemaField: lrSchemaField,
            type: this.normalizeDataType(type),
            format: format,
            default: defaultValue,
            alternativeFields: alternativeFields ? [...alternativeFields] : [],
            fanoutParentElement: fanoutParentElement,
            sampleValue: null, // Will be populated if field exists
            sampleValueDisplay: null, // Display string for UI
            originalInputRule: inputRule // Keep original for reference
          }

          // Try to get sample value if field exists
          if (fieldExists) {
            const pathOption = this.availableJsonPaths.find(p =>
              p.value === originalFieldPath ||
              p.value === inputRule
            )
            if (pathOption && pathOption.sampleValue) {
              mapping.sampleValue = pathOption.sampleValue

              // Create display value
              if (Array.isArray(pathOption.sampleValue)) {
                const firstValues = pathOption.sampleValue.slice(0, 3).map(v => {
                  if (typeof v === 'string') {
                    return v.length > 50 ? v.substring(0, 50) + '...' : v
                  }
                  return JSON.stringify(v)
                })
                mapping.sampleValueDisplay = firstValues.join(', ')
                if (pathOption.sampleValue.length > 3) {
                  mapping.sampleValueDisplay += ` (+${pathOption.sampleValue.length - 3} more)`
                }
              } else {
                mapping.sampleValueDisplay = String(pathOption.sampleValue)
              }
            }
          }

          mappingsToAdd.push(mapping)
        }

        // Store missing fields
        this.missingPolicyFields = missingFields

        // Set local mappings
        this.localMappings = mappingsToAdd

        // Update Vuex store
        this.saveStateToStore()

        console.log('============================================================')
        console.log('[Step 5] Pre-fill completed successfully')
        console.log('  Total mappings loaded:', mappingsToAdd.length)
        console.log('  Missing fields:', missingFields.length)
        if (missingFields.length > 0) {
          console.log('  Missing field details:')
          missingFields.forEach((field, idx) => {
            console.log(`    [${idx}] ${field.originalPath} (from: ${field.path})`)
          })
        }
        console.log('============================================================')

        // Force UI update
        await this.$nextTick()
        this.$forceUpdate()

        // Show success notification
        const missingCount = missingFields.length
        const notificationType = missingCount > 0 ? 'warning' : 'positive'
        const baseMessage = 'Field mappings loaded from policy'
        const caption = `${mappingsToAdd.length} mapping${mappingsToAdd.length !== 1 ? 's' : ''} loaded`
        const missingCaption = missingCount > 0
          ? ` (${missingCount} field${missingCount !== 1 ? 's' : ''} not found in sample data)`
          : ''

        this.$q.notify({
          type: notificationType,
          message: baseMessage,
          caption: caption + missingCaption,
          timeout: missingCount > 0 ? 5000 : 3000,
          position: 'top',
          icon: missingCount > 0 ? 'warning' : 'check_circle'
        })
      } catch (error) {
        console.error('============================================================')
        console.error('[Step 5] Error in prefillFromPolicy:', error)
        console.error('============================================================')

        this.$q.notify({
          type: 'negative',
          message: 'Failed to load field mappings from policy',
          caption: error.message || 'An unexpected error occurred',
          timeout: 5000,
          position: 'top'
        })
      } finally {
        this.isLoadingFromPolicy = false
      }
    },

    /**
     * Normalize data type from policy format to UI format
     * @param {string} type - The type from policy
     * @returns {string}
     */
    normalizeDataType (type) {
      if (!type) return 'String'

      const typeMap = {
        string: 'String',
        String: 'String',
        number: 'Number',
        Number: 'Number',
        integer: 'Number',
        Integer: 'Number',
        decimal: 'Decimal',
        Decimal: 'Decimal',
        float: 'Decimal',
        Float: 'Decimal',
        boolean: 'Boolean',
        Boolean: 'Boolean',
        datetime: 'DateTime',
        DateTime: 'DateTime',
        date: 'DateTime',
        Date: 'DateTime'
      }

      return typeMap[type] || 'String'
    },

    /**
     * Helper function to get a property from an object in a case-insensitive manner
     * @param {Object} obj - The object to search
     * @param {string} key - The property name to find (case-insensitive)
     * @returns {*} - The value of the property, or undefined if not found
     */
    getCaseInsensitiveProperty (obj, key) {
      if (!obj || typeof obj !== 'object') {
        return undefined
      }

      // First try exact match
      if (key in obj) {
        return obj[key]
      }

      // Try case-insensitive match
      const lowerKey = key.toLowerCase()
      const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKey)
      return foundKey ? obj[foundKey] : undefined
    }
  },

  created () {
    try {
      this.loadLRSchemaFields()
      this.loadDataTypeOptions()
      this.buildJsonTree()
      this.restoreStateFromStore()

      // Check if in update mode and pre-fill from policy
      // Only prefill if we don't already have mappings from store (avoid duplicate load)
      if (this.isUpdateMode && this.policyUpload.uploadedPolicyData) {
        // Check if mappings were already loaded from store
        const hasExistingMappings = this.localMappings && this.localMappings.length > 0

        if (!hasExistingMappings) {
          console.log('[Step 5] Update mode detected - will pre-fill from policy')

          // Wait for tree building to complete before prefilling
          this.$nextTick(async () => {
            await this.prefillFromPolicy(this.policyUpload.uploadedPolicyData)
          })
        } else {
          console.log('[Step 5] Update mode detected but mappings already loaded from store - skipping prefill')
        }
      }
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
  max-width: 75%; /* Reduced from 95% to make panels narrower */
  margin: 0 auto;
  padding: 0 1rem;
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
  grid-template-columns: 1fr 1.5fr; /* More balanced layout: give more space to both panels */
  gap: 1.5rem;
  min-height: 800px; /* Restored to original height */
  max-height: none; /* Remove max height restriction */
  max-width: none; /* Remove max-width constraint */
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

  ::v-deep .q-field__control {
    background: rgba(255, 255, 255, 0.1);
    color: #E3F2FD;

    &:before {
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  ::v-deep .q-field__native,
  ::v-deep input {
    color: #E3F2FD !important;
  }

  ::v-deep .q-icon {
    color: #2196F3;
  }

  ::v-deep .q-field__control:hover:before {
    border-color: rgba(33, 150, 243, 0.5);
  }

  ::v-deep .q-field--focused .q-field__control:before {
    border-color: #2196F3;
  }

  ::v-deep ::placeholder {
    color: rgba(227, 242, 253, 0.5);
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto; /* Smooth scrolling with visible scrollbar */
  overflow-x: hidden;
  padding: 1rem;
  max-height: calc(100vh - 320px); /* Restored to original dynamic height */
  min-height: 350px; /* Keep minimum height for consistency */

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
  min-height: 400px; /* Restored to original height */
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
    white-space: nowrap; /* Prevent header text wrapping */
    padding: 12px 10px;
  }

  ::v-deep .q-table tbody td {
    color: #E3F2FD;
    font-size: 0.875rem;
    padding: 14px 10px;
    vertical-align: middle; /* Center align content for better button visibility */
  }

  /* Ensure table uses full width */
  ::v-deep .q-table__container {
    width: 100%;
  }

  /* Remove horizontal scroll */
  ::v-deep .q-table__middle {
    overflow-x: visible;
  }

  /* Column widths for better control visibility */
  ::v-deep .q-table th:nth-child(1),
  ::v-deep .q-table td:nth-child(1) {
    width: 25%; /* JSON Path */
    min-width: 180px;
  }

  ::v-deep .q-table th:nth-child(2),
  ::v-deep .q-table td:nth-child(2) {
    width: 3%; /* Arrow */
    min-width: 40px;
    text-align: center;
  }

  ::v-deep .q-table th:nth-child(3),
  ::v-deep .q-table td:nth-child(3) {
    width: 20%; /* LR Field */
    min-width: 150px;
  }

  ::v-deep .q-table th:nth-child(4),
  ::v-deep .q-table td:nth-child(4) {
    width: 12%; /* Type */
    min-width: 100px;
  }

  ::v-deep .q-table th:nth-child(5),
  ::v-deep .q-table td:nth-child(5) {
    width: 15%; /* Format */
    min-width: 120px;
  }

  ::v-deep .q-table th:nth-child(6),
  ::v-deep .q-table td:nth-child(6) {
    width: 15%; /* Fanout Parent */
    min-width: 120px;
  }

  ::v-deep .q-table th:nth-child(7),
  ::v-deep .q-table td:nth-child(7) {
    width: 10%; /* Actions */
    min-width: 150px;
    text-align: center;
  }
}

.json-path-cell {
  display: flex;
  align-items: flex-start; /* Align to top for better multi-line display */
  font-family: monospace;
  font-size: 0.875rem;
  flex-wrap: wrap; /* Allow wrapping to prevent horizontal scroll */
  gap: 4px; /* Space between icon and text when wrapped */
  max-width: 100%; /* Use full available width */
  min-width: 200px; /* Ensure minimum readability */
}

.path-text {
  color: #A5D6A7;
  font-weight: 500;
  word-break: break-all; /* Force break long paths without spaces */
  overflow-wrap: break-word; /* Ensure long words wrap */
  word-wrap: break-word; /* Legacy support */
  hyphens: none; /* No hyphens for JSON paths */
  flex: 1;
  min-width: 0; /* Allow text to shrink */
  line-height: 1.5; /* Better line height for wrapped text */
  white-space: normal; /* Allow text to wrap */
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: nowrap; /* Prevent buttons from wrapping */
  min-width: 140px; /* Ensure minimum width for all 3 buttons - increased for visibility */

  ::v-deep .q-btn {
    min-width: 36px;
    min-height: 36px;
  }
}

/* Clickable row styling */
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(33, 150, 243, 0.08) !important;
  }

  &:active {
    background-color: rgba(33, 150, 243, 0.15) !important;
  }
}

/* Missing Field Styles (Update Mode) */
.missing-field-row {
  background-color: rgba(255, 152, 0, 0.1) !important;
   border-left: 3px solid #FF9800 !important;

  &:hover {
    background-color: rgba(255, 152, 0, 0.2) !important;
  }
}

.missing-field-badge {
  font-size: 11px;
  padding: 2px 6px;
  animation: pulse-warning 2s ease-in-out infinite;
}

.missing-field-warning-banner {
  margin: 0;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes pulse-warning {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.fanout-parent-cell {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;

  .q-chip {
    margin: 2px 0;
  }
}

/* LR Field cell styling */
.q-table tbody td:nth-child(3) {
  .q-chip {
    max-width: 100%;
    white-space: normal;
    word-break: break-word;
    height: auto;
    min-height: 28px;
    padding: 6px 12px;
  }
}

/* Format cell styling */
.q-table tbody td:nth-child(5) {
  word-break: break-word;
  white-space: normal;
}

/* Type cell styling */
.q-table tbody td:nth-child(4) {
  .q-chip {
    white-space: nowrap;
  }
}

.no-fanout-text {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.875rem;
  text-align: center;
  display: block;
  width: 100%;
}

/* Operation Syntax Preview */
.operation-syntax-preview {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(33, 150, 243, 0.04) 100%);
  border-left: 4px solid #2196F3;
  border-radius: 8px;
  padding: 0.75rem 1rem;

  .syntax-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #2196F3;
    margin-bottom: 0.5rem;
  }

  .syntax-display {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(33, 150, 243, 0.2);
    border-radius: 6px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    overflow-x: auto;

    code {
      color: #1976D2;
      font-size: 0.95rem;
      font-weight: 500;
      white-space: nowrap;
      word-break: break-all;
    }
  }

  .syntax-hint {
    font-size: 0.8rem;
    color: rgba(0, 0, 0, 0.5);
    font-style: italic;
  }
}

/* Dark theme variant for operation syntax preview */
.body--dark .operation-syntax-preview {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.08) 100%);

  .syntax-display {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(33, 150, 243, 0.3);

    code {
      color: #64B5F6;
    }
  }

  .syntax-hint {
    color: rgba(255, 255, 255, 0.5);
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
