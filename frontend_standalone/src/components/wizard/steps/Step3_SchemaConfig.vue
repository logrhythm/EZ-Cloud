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
          <p class="card-description">
            Select JSON attributes that contain stringified JSON to convert them to proper JSON objects.
          </p>
        </q-card-section>

        <q-card-section>
          <div class="json-fields-selection">
            <div class="selection-header">
              <h6>Available Fields</h6>
              <q-chip color="primary" text-color="white" icon="info">
                Select fields to convert
              </q-chip>
            </div>

            <q-list bordered separator class="json-field-list">
              <q-item tag="label" v-ripple>
                <q-item-section side>
                  <q-checkbox v-model="selectedJsonFields" val="$.message" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>$.message</q-item-label>
                  <q-item-label caption>Contains stringified JSON</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="primary">string</q-badge>
                </q-item-section>
              </q-item>

              <q-item tag="label" v-ripple>
                <q-item-section side>
                  <q-checkbox v-model="selectedJsonFields" val="$.data.attributes" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>$.data.attributes</q-item-label>
                  <q-item-label caption>Contains stringified JSON object</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="primary">string</q-badge>
                </q-item-section>
              </q-item>

              <q-item tag="label" v-ripple>
                <q-item-section side>
                  <q-checkbox v-model="selectedJsonFields" val="$.payload" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>$.payload</q-item-label>
                  <q-item-label caption>Contains stringified JSON data</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="primary">string</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="selected-fields" v-if="selectedJsonFields.length > 0">
            <div class="selection-header q-mt-md">
              <h6>Selected Fields ({{ selectedJsonFields.length }})</h6>
            </div>

            <q-list bordered separator>
              <q-item v-for="field in selectedJsonFields" :key="field">
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
                    @click="removeField(field)"
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
            Select JSON array elements that should be processed individually.
          </p>
        </q-card-section>

        <q-card-section>
          <div class="json-structure-view">
            <div class="structure-header">
              <h6>JSON Structure</h6>
              <q-chip color="secondary" text-color="white" icon="info">
                Check arrays to include
              </q-chip>
            </div>

            <div class="json-tree-container">
              <div class="json-tree">
                <!-- Always show the static structure instead of the dynamic JsonTreeNode component -->
                <div>
                  <div class="tree-node">
                    <span class="node-key">$</span>
                    <span class="node-bracket">{</span>
                  </div>

                  <!-- First level -->
                  <div class="tree-node indented">
                    <span class="node-key">departments</span>
                    <q-checkbox v-model="selectedArrays" val="$.departments" class="inline-checkbox" />
                    <span class="node-bracket">[</span> <span class="node-type">array</span>
                  </div>

                  <!-- Second level -->
                  <div class="tree-node double-indented">
                    <span class="node-key">teams</span>
                    <q-checkbox v-model="selectedArrays" val="$.teams" class="inline-checkbox" />
                    <span class="node-bracket">[</span> <span class="node-type">array</span>
                  </div>

                  <!-- Third level -->
                  <div class="tree-node triple-indented">
                    <span class="node-key">members</span>
                    <q-checkbox v-model="selectedArrays" val="$.members" class="inline-checkbox" />
                    <span class="node-bracket">[</span> <span class="node-type">array</span>
                  </div>

                  <!-- Fourth level -->
                  <div class="tree-node quadruple-indented">
                    <span class="node-key">skills</span>
                    <q-checkbox v-model="selectedArrays" val="$.skills" class="inline-checkbox" />
                    <span class="node-bracket">[</span> <span class="node-type">array</span>
                  </div>

                  <!-- Close brackets -->
                  <div class="tree-node quadruple-indented">
                    <span class="node-bracket">]</span>
                  </div>
                  <div class="tree-node triple-indented">
                    <span class="node-bracket">]</span>
                  </div>
                  <div class="tree-node double-indented">
                    <span class="node-bracket">]</span>
                  </div>
                  <div class="tree-node indented">
                    <span class="node-bracket">]</span>
                  </div>

                  <!-- Another array at root level -->
                  <div class="tree-node indented">
                    <span class="node-key">projects</span>
                    <q-checkbox v-model="selectedArrays" val="$.projects" class="inline-checkbox" />
                    <span class="node-bracket">[</span> <span class="node-type">array</span>
                  </div>

                  <!-- Second level for projects -->
                  <div class="tree-node double-indented">
                    <span class="node-key">phases</span>
                    <q-checkbox v-model="selectedArrays" val="$.phases" class="inline-checkbox" />
                    <span class="node-bracket">[</span> <span class="node-type">array</span>
                  </div>

                  <!-- Close brackets -->
                  <div class="tree-node double-indented">
                    <span class="node-bracket">]</span>
                  </div>
                  <div class="tree-node indented">
                    <span class="node-bracket">]</span>
                  </div>

                  <!-- Root closing -->
                  <div class="tree-node">
                    <span class="node-bracket">}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="selected-arrays" v-if="selectedArrays.length > 0">
            <div class="selection-header q-mt-md">
              <h6>Selected Arrays for Fanout ({{ selectedArrays.length }})</h6>
            </div>

            <q-list bordered separator>
              <q-item v-for="array in selectedArrays" :key="array">
                <q-item-section>
                  <q-item-label>{{ array }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="removeArray(array)"
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
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'Step3_SchemaConfig',

  components: {}, // Removed JsonTreeNode component

  data () {
    return {
      selectedJsonFields: [],
      selectedArrays: []
    }
  },

  computed: {
    ...mapState('wizard', ['sampleData']),
    ...mapGetters('wizard', ['getParsedDataStructure'])
    // Removed jsonData computed property as we're using static structure
  },

  methods: {
    proceedToNext () {
      // Update Vuex store with schema configuration
      this.$store.commit('wizard/UPDATE_SCHEMA_RULES', {
        convertToJson: this.selectedJsonFields,
        fanout: this.selectedArrays
      })

      this.$emit('step-valid')
      this.$emit('next-step')
    },

    removeField (field) {
      const index = this.selectedJsonFields.indexOf(field)
      if (index !== -1) {
        this.selectedJsonFields.splice(index, 1)
      }
    },

    removeArray (array) {
      const index = this.selectedArrays.indexOf(array)
      if (index !== -1) {
        this.selectedArrays.splice(index, 1)
      }
    }

    // No longer need toggleArraySelection method as we're directly using v-model with q-checkbox
  },

  created () {
    // Initialize from store state if available
    const storeSchemaRules = this.$store.state.wizard?.schemaRules
    if (storeSchemaRules) {
      this.selectedJsonFields = [...storeSchemaRules.convertToJson]
      this.selectedArrays = [...storeSchemaRules.fanout]
    }
  }
}
</script>

<style lang="scss" scoped>
.step-schema-config {
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
  border: 1px solid var(--q-color-grey-3);
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
}

.json-tree-container {
  background-color: white;
  border: 1px solid var(--q-color-grey-3);
  border-radius: 6px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
  font-family: monospace;
}

.json-tree {
  line-height: 1.6;
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
