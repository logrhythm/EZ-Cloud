<template>
  <div class="step-mapping">
    <div class="step-header">
      <div class="step-icon">
        <q-icon name="account_tree" size="48px" class="text-primary" />
      </div>
      <div class="step-title-section">
        <h2 class="step-title">Field Mapping</h2>
        <p class="step-subtitle">
          Map JSON fields to LogRhythm schema fields.
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
            Map JSON fields to LogRhythm schema fields and configure transformations.
          </p>
        </q-card-section>

        <q-card-section>
          <div class="mapping-tools">
            <div class="mapping-actions">
              <q-select
                v-model="selectedLrField"
                :options="lrSchemaFields"
                label="LogRhythm Schema Field"
                outlined
                dense
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                class="schema-field-selector"
                @filter="filterLrFields"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-btn
                color="primary"
                label="Add Mapping"
                icon-right="add"
                no-caps
                unelevated
                :disable="!selectedLrField"
                @click="openAddMapping"
                class="add-mapping-btn"
              />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="mapping-table-container">
            <q-table
              :data="mappings"
              :columns="mappingColumns"
              row-key="id"
              bordered
              flat
              :pagination="{ rowsPerPage: 10 }"
              class="mapping-table"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="inputRule" :props="props">
                    <div class="json-path-cell">{{ props.row.inputRule }}</div>
                  </q-td>

                  <q-td key="lrSchemaField" :props="props">
                    <div class="schema-field-cell">{{ props.row.lrSchemaField }}</div>
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
                    icon-right="add"
                    @click="openAddMapping"
                    class="q-mt-sm"
                  />
                </div>
              </template>
            </q-table>
          </div>

          <div class="mapping-stats q-mt-md">
            <q-chip color="primary" text-color="white" icon="info">
              {{ mappings.length }} mappings defined
            </q-chip>

            <q-chip color="accent" text-color="white" icon="info">
              {{ unmappedFieldsCount }} fields unmapped
            </q-chip>
          </div>

          <!-- Add/Edit Mapping Dialog -->
          <q-dialog v-model="mappingDialog" persistent>
            <q-card style="min-width: 500px; max-width: 80vw;">
              <q-card-section class="row items-center">
                <div class="text-h6">{{ editingMapping ? 'Edit' : 'Add' }} Field Mapping</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="mapping-form">
                  <div class="row q-col-gutter-md">
                    <!-- Input Rule (JSON Path) -->
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="mappingForm.inputRule"
                        :options="jsonPathOptions"
                        label="JSON Path *"
                        outlined
                        dense
                        use-input
                        hide-selected
                        fill-input
                        class="full-width"
                      />
                    </div>

                    <!-- LR Schema Field -->
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="mappingForm.lrSchemaField"
                        :options="lrSchemaFields"
                        label="LogRhythm Schema Field *"
                        outlined
                        dense
                        class="full-width"
                      />
                    </div>

                    <!-- Data Type -->
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="mappingForm.type"
                        :options="dataTypeOptions"
                        label="Data Type *"
                        outlined
                        dense
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
                      />
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
                        :options="jsonPathOptions"
                        label="Alternative Fields (optional)"
                        hint="Backup fields if primary is missing"
                        outlined
                        dense
                        use-chips
                        multiple
                        class="full-width"
                      />
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions align="right">
                <q-btn flat label="Cancel" color="grey" v-close-popup no-caps />
                <q-btn unelevated label="Save" color="primary" @click="saveMapping" no-caps />
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
        @click="$emit('prev-step')"
        class="wizard-btn wizard-btn--secondary"
      />

      <q-btn
        unelevated
        color="primary"
        icon-right="arrow_forward"
        label="Continue to Review"
        @click="proceedToNext"
        class="wizard-btn wizard-btn--primary"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Step5_Mapping',

  data () {
    return {
      // Mapping table data
      mappings: [
        {
          id: 1,
          inputRule: '$.timestamp',
          lrSchemaField: 'normal_msg_date',
          type: 'DateTime',
          format: 'yyyy-MM-dd HH:mm:ss.SSS',
          default: null,
          alternativeFields: ['$.event_time', '$.created_at'],
          fanoutParentElement: null
        },
        {
          id: 2,
          inputRule: '$.user.name',
          lrSchemaField: 'login',
          type: 'String',
          format: null,
          default: 'unknown',
          alternativeFields: ['$.username'],
          fanoutParentElement: null
        },
        {
          id: 3,
          inputRule: '$.source.ip',
          lrSchemaField: 'srcip',
          type: 'String',
          format: null,
          default: null,
          alternativeFields: ['$.client_ip', '$.origin'],
          fanoutParentElement: null
        }
      ],

      // Table columns
      mappingColumns: [
        { name: 'inputRule', label: 'JSON Path', field: 'inputRule', align: 'left', sortable: true },
        { name: 'lrSchemaField', label: 'LR Schema Field', field: 'lrSchemaField', align: 'left', sortable: true },
        { name: 'type', label: 'Type', field: 'type', align: 'center', sortable: true },
        { name: 'operations', label: 'Operations', field: 'operations', align: 'left' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
      ],

      // Form data
      selectedLrField: null,
      mappingDialog: false,
      editingMapping: null,
      mappingForm: {
        inputRule: '',
        lrSchemaField: '',
        type: 'String',
        format: null,
        default: null,
        alternativeFields: [],
        fanoutParentElement: null
      },

      // Options
      lrSchemaFields: [
        'normal_msg_date', 'login', 'srcip', 'srcport', 'dstip', 'dstport',
        'session_id', 'domain', 'subject', 'object', 'action', 'status',
        'process_id', 'process_name', 'hash', 'url', 'user_agent', 'command',
        'result_code', 'parent_process_id', 'parent_process_name', 'vendor_msg_id'
      ],
      jsonPathOptions: [
        '$.timestamp', '$.user.name', '$.source.ip', '$.destination.ip',
        '$.event.id', '$.event.type', '$.event.action', '$.message',
        '$.level', '$.metadata.source', '$.tags', '$.host.name',
        '$.agent.type', '$.agent.version', '$.log.level'
      ],
      dataTypeOptions: [
        'String', 'DateTime', 'Number', 'Decimal', 'Boolean'
      ],

      // Stats
      unmappedFieldsCount: 12
    }
  },

  methods: {
    proceedToNext () {
      this.$emit('step-valid')
      this.$emit('next-step')
    },

    filterLrFields (val, update) {
      if (val === '') {
        update(() => {
          this.lrSchemaFields = [
            'normal_msg_date', 'login', 'srcip', 'srcport', 'dstip', 'dstport',
            'session_id', 'domain', 'subject', 'object', 'action', 'status',
            'process_id', 'process_name', 'hash', 'url', 'user_agent', 'command',
            'result_code', 'parent_process_id', 'parent_process_name', 'vendor_msg_id'
          ]
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.lrSchemaFields = [
          'normal_msg_date', 'login', 'srcip', 'srcport', 'dstip', 'dstport',
          'session_id', 'domain', 'subject', 'object', 'action', 'status',
          'process_id', 'process_name', 'hash', 'url', 'user_agent', 'command',
          'result_code', 'parent_process_id', 'parent_process_name', 'vendor_msg_id'
        ].filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
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

    openAddMapping () {
      this.editingMapping = null
      this.mappingForm = {
        inputRule: '',
        lrSchemaField: this.selectedLrField,
        type: 'String',
        format: null,
        default: null,
        alternativeFields: [],
        fanoutParentElement: null
      }
      this.mappingDialog = true
    },

    editMapping (mapping) {
      this.editingMapping = mapping
      this.mappingForm = { ...mapping }
      this.mappingDialog = true
    },

    saveMapping () {
      if (!this.mappingForm.inputRule || !this.mappingForm.lrSchemaField) {
        this.$q.notify({
          message: 'JSON Path and Schema Field are required',
          color: 'negative',
          icon: 'warning',
          position: 'top',
          timeout: 2000
        })
        return
      }

      if (this.editingMapping) {
        // Update existing mapping
        const index = this.mappings.findIndex(m => m.id === this.editingMapping.id)
        if (index !== -1) {
          this.mappings[index] = { ...this.mappingForm, id: this.editingMapping.id }
        }
      } else {
        // Add new mapping
        const newId = this.mappings.length > 0
          ? Math.max(...this.mappings.map(m => m.id)) + 1
          : 1

        this.mappings.push({ ...this.mappingForm, id: newId })
      }

      this.selectedLrField = null
      this.mappingDialog = false
    },

    deleteMapping (id) {
      const index = this.mappings.findIndex(m => m.id === id)
      if (index !== -1) {
        this.mappings.splice(index, 1)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.step-mapping {
  max-width: 900px;
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

/* New Styles for Mapping */
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

.mapping-tools {
  margin-bottom: 1.5rem;
}

.mapping-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.schema-field-selector {
  flex: 1;
  min-width: 200px;
}

.add-mapping-btn {
  min-width: 150px;
}

.mapping-table-container {
  overflow-x: auto;
}

.mapping-table {
  width: 100%;
}

.json-path-cell {
  font-family: monospace;
  color: var(--q-primary);
  font-weight: 500;
}

.schema-field-cell {
  font-weight: 500;
  color: var(--q-secondary);
}

.operations-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.action-buttons {
  white-space: nowrap;
}

.mapping-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.no-mappings {
  padding: 2rem 0;
  text-align: center;
  color: var(--q-color-grey-7);
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

@media (max-width: 768px) {
  .mapping-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .schema-field-selector,
  .add-mapping-btn {
    width: 100%;
  }

  .mapping-table .q-table__grid-content {
    min-height: 2em;
  }
}
</style>
