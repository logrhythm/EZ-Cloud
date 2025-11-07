<template>
  <div class="step-filter-config">
    <div class="step-header">
      <div class="step-icon">
        <q-icon name="filter_alt" size="48px" class="text-primary" />
      </div>
      <div class="step-title-section">
        <h2 class="step-title">Filter Rule Configuration</h2>
        <p class="step-subtitle">
          Define filtering conditions to select relevant data.
        </p>
      </div>
    </div>

    <div class="step-content">
      <q-card class="wizard-card filter-builder-card">
        <q-card-section class="card-header">
          <div class="card-title">
            <q-icon name="filter_list" class="q-mr-sm" />
            Filter Rule Builder
          </div>
          <p class="card-description">
            Create filter conditions to determine when parsing rules apply.
          </p>
        </q-card-section>

        <q-card-section>
          <div class="filter-operator-selector">
            <q-btn-toggle
              v-model="filterOperator"
              toggle-color="primary"
              :options="[
                { label: 'All conditions (AND)', value: 'AND' },
                { label: 'Any condition (OR)', value: 'OR' }
              ]"
              class="full-width q-mb-md"
              unelevated
              dense
            />
          </div>

          <div class="filter-conditions">
            <h6 class="conditions-title">Filter Conditions</h6>

            <div v-for="(condition, index) in filterConditions" :key="index" class="filter-condition q-mb-md">
              <q-card flat bordered>
                <q-card-section>
                  <div class="condition-row">
                    <q-select
                      v-model="condition.field"
                      :options="fieldOptions"
                      outlined
                      dense
                      label="Field"
                      class="condition-field"
                      emit-value
                      map-options
                      options-dense
                    />

                    <q-select
                      v-model="condition.operator"
                      :options="operatorOptions"
                      outlined
                      dense
                      label="Operator"
                      class="condition-operator"
                      emit-value
                      map-options
                      options-dense
                    />

                    <q-input
                      v-model="condition.value"
                      outlined
                      dense
                      label="Value"
                      class="condition-value"
                    />

                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="removeCondition(index)"
                    >
                      <q-tooltip>Remove condition</q-tooltip>
                    </q-btn>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="q-mt-md q-mb-lg">
              <q-btn
                unelevated
                color="primary"
                icon="add"
                label="Add Condition"
                @click="addCondition"
                no-caps
              />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="filter-preview">
            <h6 class="preview-title">Generated Filter Expression</h6>

            <q-card flat bordered class="expression-card">
              <q-card-section>
                <code class="filter-expression">{{ generatedFilterExpression }}</code>
              </q-card-section>
            </q-card>

            <div class="preview-actions q-mt-md">
              <q-btn
                outline
                color="primary"
                icon="play_arrow"
                label="Test Filter"
                @click="testFilter"
                no-caps
                :disabled="filterConditions.length === 0"
              />
              <q-btn
                outline
                color="secondary"
                icon="content_copy"
                label="Copy to Clipboard"
                @click="copyExpression"
                no-caps
                :disabled="filterConditions.length === 0"
                class="q-ml-sm"
              />
            </div>
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
        label="Continue to Field Mapping"
        @click="proceedToNext"
        class="wizard-btn wizard-btn--primary"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Step4_FilterConfig',

  data () {
    return {
      filterOperator: 'AND',
      filterConditions: [
        { field: '@.@metadata.beat', operator: '==', value: 'eventhubbeat' },
        { field: '@.response.category', operator: '==', value: 'FrontDoorAccessLog' }
      ],
      fieldOptions: [
        { label: '@.@metadata.beat', value: '@.@metadata.beat' },
        { label: '@.response.category', value: '@.response.category' },
        { label: '@.message', value: '@.message' },
        { label: '@.level', value: '@.level' },
        { label: '@.source', value: '@.source' },
        { label: '@.type', value: '@.type' }
      ],
      operatorOptions: [
        { label: 'Equals (==)', value: '==' },
        { label: 'Not Equals (!=)', value: '!=' },
        { label: 'Contains', value: 'contains' },
        { label: 'Starts With', value: 'startsWith' },
        { label: 'Ends With', value: 'endsWith' },
        { label: 'Greater Than (>)', value: '>' },
        { label: 'Less Than (<)', value: '<' },
        { label: 'Greater Than or Equal (>=)', value: '>=' },
        { label: 'Less Than or Equal (<=)', value: '<=' }
      ]
    }
  },

  computed: {
    generatedFilterExpression () {
      if (this.filterConditions.length === 0) {
        return 'No filter conditions defined'
      }

      return this.filterConditions
        .map(condition => `${condition.field} ${condition.operator} '${condition.value}'`)
        .join(` ${this.filterOperator} `)
    }
  },

  methods: {
    proceedToNext () {
      this.$emit('step-valid')
      this.$emit('next-step')
    },

    addCondition () {
      this.filterConditions.push({ field: '', operator: '==', value: '' })
    },

    removeCondition (index) {
      this.filterConditions.splice(index, 1)
    },

    testFilter () {
      // In a real implementation, this would test the filter against sample data
      this.$q.notify({
        message: 'Filter test successful',
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
        timeout: 2000
      })
    },

    copyExpression () {
      // In a real implementation, this would copy the expression to clipboard
      navigator.clipboard.writeText(this.generatedFilterExpression)
        .then(() => {
          this.$q.notify({
            message: 'Filter expression copied to clipboard',
            color: 'info',
            icon: 'content_copy',
            position: 'top',
            timeout: 2000
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.step-filter-config {
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

/* New styles for Filter Config */
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

.conditions-title,
.preview-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--q-color-grey-8);
}

.filter-condition {
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

.condition-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.condition-field {
  flex: 2;
  min-width: 150px;
}

.condition-operator {
  flex: 1;
  min-width: 120px;
}

.condition-value {
  flex: 2;
  min-width: 150px;
}

.expression-card {
  background-color: var(--q-color-grey-1);
  border-radius: 6px;
}

.filter-expression {
  font-family: monospace;
  font-size: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--q-color-primary);
}

/* Fix the input field text color */
.condition-field ::v-deep .q-field__native,
.condition-operator ::v-deep .q-field__native,
.condition-value ::v-deep .q-field__native {
  color: #ffffff !important;
}

.condition-field ::v-deep .q-field__label,
.condition-operator ::v-deep .q-field__label,
.condition-value ::v-deep .q-field__label {
  color: rgba(255, 255, 255, 0.7) !important;
}

@media (max-width: 768px) {
  .condition-row {
    flex-direction: column;
    align-items: stretch;
  }

  .condition-field,
  .condition-operator,
  .condition-value {
    width: 100%;
  }
}
</style>

<style lang="scss">
/* Global styles (not scoped) for dropdown menus - they render outside the component */
/* Fix dropdown menu visibility for Step 4 Filter Config dropdowns */
.q-menu .q-item {
  background-color: #000000 !important;
  color: #ffffff !important;
  margin: 2px 4px !important;
  border-radius: 4px !important;
}

.q-menu .q-item:hover {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
  box-shadow: 0 0 0 1px #02b7fe !important;
}

.q-menu .q-item__label {
  color: #ffffff !important;
}

.q-menu .q-item.q-manual-focusable--focused {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
  box-shadow: 0 0 0 1px #02b7fe !important;
}

.q-menu .q-item--active {
  background-color: #1a1a1a !important;
  color: #02b7fe !important;
  font-weight: 500 !important;
  box-shadow: 0 0 0 1px #02b7fe !important;
}

.q-menu .q-virtual-scroll__content {
  background-color: #000000 !important;
  padding: 4px !important;
}

/* Ensure the menu itself has black background */
.q-menu {
  background-color: #000000 !important;
  border-radius: 4px !important;
}

.q-menu .q-list {
  background-color: #000000 !important;
  padding: 4px !important;
}
</style>
