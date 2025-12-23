<template>
  <div class="step-export">
    <!-- Header -->
    <div class="step-header">
      <div class="step-icon">
        <q-icon name="check_circle" size="48px" class="text-positive" />
      </div>
      <div class="step-title-section">
        <h2 class="step-title">Review & Export Policy</h2>
        <p class="step-subtitle">
          Your JSON policy has been generated successfully. Review and export below.
        </p>
      </div>
    </div>

    <!-- Loading Overlay -->
    <q-inner-loading :showing="isGenerating" class="loading-overlay">
      <div class="loading-content">
        <q-spinner-dots size="50px" color="primary" />
        <p class="text-body2 q-mt-md">{{ loadingMessage }}</p>
      </div>
    </q-inner-loading>

    <!-- Main Content -->
    <div v-if="!isGenerating" class="step-content">

      <!-- Success Banner -->
      <q-banner v-if="generatedPolicy" rounded class="success-banner q-mb-md">
        <template v-slot:avatar>
          <q-icon name="check_circle" color="positive" size="32px" />
        </template>
        <div class="banner-content">
          <h6 class="q-mb-sm">Policy Generated Successfully</h6>
          <p class="q-mb-none text-body2">
            Your LogRhythm JSON policy is ready for export and implementation.
          </p>
        </div>
      </q-banner>

      <!-- Error Banner -->
      <q-banner v-else rounded class="error-banner q-mb-md" dense>
        <template v-slot:avatar>
          <q-icon name="error" color="negative" />
        </template>
        <div class="banner-content">
          <strong>Policy Generation Failed</strong>
          <p class="q-mb-none text-caption">Please review your configuration and try again.</p>
        </div>
        <template v-slot:action>
          <q-btn flat label="Regenerate" color="negative" @click="regeneratePolicy" />
        </template>
      </q-banner>

      <!-- Policy Summary Card -->
      <q-card flat bordered class="summary-card q-mb-md">
        <q-card-section class="card-header">
          <div class="row items-center">
            <q-icon name="summarize" size="24px" class="q-mr-sm" />
            <span class="text-h6">Policy Summary</span>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">
                <q-icon name="label" size="18px" class="q-mr-xs" />
                Policy Name
              </div>
              <div class="summary-value">{{ projectConfig.name || 'Untitled Policy' }}</div>
            </div>

            <div class="summary-item">
              <div class="summary-label">
                <q-icon name="calendar_today" size="18px" class="q-mr-xs" />
                Created
              </div>
              <div class="summary-value">{{ formatDate(projectConfig.createdAt) }}</div>
            </div>

            <div class="summary-item">
              <div class="summary-label">
                <q-icon name="data_object" size="18px" class="q-mr-xs" />
                Sample Records
              </div>
              <div class="summary-value">{{ sampleData.dataStats.recordCount }}</div>
            </div>

            <div class="summary-item">
              <div class="summary-label">
                <q-icon name="account_tree" size="18px" class="q-mr-xs" />
                Fields Mapped
              </div>
              <div class="summary-value">{{ fieldMappings.mappings.length }}</div>
            </div>

            <div v-if="schemaRules.convertToJson.length > 0" class="summary-item">
              <div class="summary-label">
                <q-icon name="transform" size="18px" class="q-mr-xs" />
                JSON Conversions
              </div>
              <div class="summary-value">{{ schemaRules.convertToJson.length }}</div>
            </div>

            <div v-if="schemaRules.fanout.length > 0" class="summary-item">
              <div class="summary-label">
                <q-icon name="account_tree" size="18px" class="q-mr-xs" />
                Array Fanouts
              </div>
              <div class="summary-value">{{ schemaRules.fanout.length }}</div>
            </div>

            <div v-if="filterRules.expression" class="summary-item">
              <div class="summary-label">
                <q-icon name="filter_alt" size="18px" class="q-mr-xs" />
                Filter Applied
              </div>
              <div class="summary-value">
                <q-icon name="check" color="positive" />
              </div>
            </div>

            <div v-if="!subTransforms.skipSubTransforms && subTransforms.subTransformsList.length > 0" class="summary-item">
              <div class="summary-label">
                <q-icon name="rule" size="18px" class="q-mr-xs" />
                SubTransforms
              </div>
              <div class="summary-value">{{ subTransforms.subTransformsList.length }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Policy Preview Card -->
      <q-card flat bordered class="policy-preview-card q-mb-md">
        <q-card-section class="card-header">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-icon name="code" size="24px" class="q-mr-sm" />
              <span class="text-h6">Policy Preview</span>
            </div>
            <div class="policy-actions">
              <q-btn
                flat
                dense
                icon="unfold_less"
                @click="collapsePreview"
                class="q-mr-xs"
              >
                <q-tooltip>Collapse All</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                icon="unfold_more"
                @click="expandPreview"
                class="q-mr-xs"
              >
                <q-tooltip>Expand All</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                icon="content_copy"
                @click="copyPolicyToClipboard"
              >
                <q-tooltip>Copy to Clipboard</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="policy-preview-content">
          <div class="policy-size-info q-mb-sm">
            <q-chip dense size="sm" icon="info">
              Policy Size: {{ formatBytes(policySize) }}
            </q-chip>
            <q-chip dense size="sm" icon="dns" v-if="policyStats.totalTransforms">
              Total Transforms: {{ policyStats.totalTransforms }}
            </q-chip>
          </div>

          <pre class="policy-json-preview"><code>{{ formattedPolicyJson }}</code></pre>
        </q-card-section>
      </q-card>

      <!-- Export Options Card -->
      <q-card flat bordered class="export-card q-mb-md">
        <q-card-section class="card-header">
          <div class="row items-center">
            <q-icon name="file_download" size="24px" class="q-mr-sm" />
            <span class="text-h6">Export Options</span>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="export-options">
            <q-btn
              unelevated
              color="positive"
              icon="file_download"
              label="Download Policy JSON"
              @click="downloadPolicy"
              class="export-btn primary-btn"
              :disable="!generatedPolicy"
            />

            <q-btn
              unelevated
              color="primary"
              icon="content_copy"
              label="Copy to Clipboard"
              @click="copyPolicyToClipboard"
              class="export-btn"
              :disable="!generatedPolicy"
            />

            <q-btn
              outline
              color="primary"
              icon="edit"
              label="Edit Policy JSON"
              @click="showEditDialog = true"
              class="export-btn"
              :disable="!generatedPolicy"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Next Steps Card -->
      <q-card flat bordered class="next-steps-card">
        <q-card-section class="card-header">
          <div class="row items-center">
            <q-icon name="lightbulb" size="24px" class="q-mr-sm" />
            <span class="text-h6">Next Steps</span>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="32px">1</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Download or copy your generated policy</q-item-label>
                <q-item-label caption>Export the policy JSON file for implementation</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="32px">2</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Import the policy into your LogRhythm environment</q-item-label>
                <q-item-label caption>Upload and configure the policy in LogRhythm SIEM</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="32px">3</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Test with live data to validate parsing</q-item-label>
                <q-item-label caption>Verify that logs are parsed correctly with real data</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="32px">4</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Monitor and adjust field mappings as needed</q-item-label>
                <q-item-label caption>Fine-tune the policy based on production data</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Footer Actions -->
    <div class="step-actions">
      <q-btn
        flat
        icon="arrow_back"
        label="Previous"
        @click="$emit('prev-step')"
        class="wizard-btn"
      />

      <div class="final-actions">
        <q-btn
          flat
          icon="refresh"
          label="Start New Policy"
          @click="confirmStartNew"
          class="wizard-btn"
        />
        <q-btn
          unelevated
          color="positive"
          icon="check"
          label="Complete Wizard"
          @click="completeWizard"
          class="wizard-btn"
          :disable="!generatedPolicy"
        />
      </div>
    </div>

    <!-- Edit Policy Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card class="edit-policy-dialog">
        <q-card-section class="dialog-header">
          <div class="row items-center no-wrap">
            <q-icon name="edit" size="24px" class="q-mr-sm text-primary" />
            <div>
              <div class="text-h6">Edit Policy JSON</div>
              <div class="text-caption text-grey-6">
                Make changes to your policy JSON. Ensure valid JSON format before saving.
              </div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense @click="cancelEdit" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="edit-dialog-content">
          <!-- Validation Status Banner -->
          <q-banner
            v-if="hasJsonError"
            rounded
            class="error-validation-banner q-mb-md"
            dense
          >
            <template v-slot:avatar>
              <q-icon name="error" color="negative" size="24px" />
            </template>
            <div class="validation-error-content">
              <strong>Invalid JSON Format</strong>
              <div class="text-caption">{{ jsonErrorMessage }}</div>
            </div>
          </q-banner>

          <q-banner
            v-else
            rounded
            class="success-validation-banner q-mb-md"
            dense
          >
            <template v-slot:avatar>
              <q-icon name="check_circle" color="positive" size="24px" />
            </template>
            <div class="validation-success-content">
              <strong>Valid JSON Format</strong>
              <div class="text-caption">Your JSON is properly formatted and ready to save.</div>
            </div>
          </q-banner>

          <!-- JSON Editor -->
          <div class="json-editor-wrapper">
            <q-input
              v-model="editablePolicyJson"
              type="textarea"
              filled
              class="policy-editor"
              :error="hasJsonError"
              placeholder="Enter your policy JSON here..."
              @update:model-value="validateJson"
            >
              <template v-slot:prepend>
                <q-icon name="code" />
              </template>
              <template v-slot:append>
                <q-btn
                  flat
                  dense
                  round
                  icon="format_indent_increase"
                  @click="formatJson"
                  :disable="hasJsonError"
                >
                  <q-tooltip>Format JSON</q-tooltip>
                </q-btn>
              </template>
            </q-input>

            <!-- Editor Stats -->
            <div class="editor-stats q-mt-sm">
              <q-chip dense size="sm" icon="text_fields">
                Lines: {{ jsonLineCount }}
              </q-chip>
              <q-chip dense size="sm" icon="data_object">
                Size: {{ formatBytes(editablePolicyJson.length) }}
              </q-chip>
              <q-chip
                dense
                size="sm"
                :icon="hasJsonError ? 'error' : 'check_circle'"
                :color="hasJsonError ? 'negative' : 'positive'"
                text-color="white"
              >
                {{ hasJsonError ? 'Invalid' : 'Valid' }}
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            flat
            label="Cancel"
            icon="close"
            @click="cancelEdit"
            class="action-btn"
          />
          <q-btn
            unelevated
            color="primary"
            label="Save Changes"
            icon="save"
            @click="applyPolicyEdits"
            :disable="hasJsonError || !hasChanges"
            class="action-btn"
          >
            <q-tooltip v-if="hasJsonError">
              Fix JSON errors before saving
            </q-tooltip>
            <q-tooltip v-else-if="!hasChanges">
              No changes to save
            </q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirm Start New Dialog -->
    <q-dialog v-model="showStartNewDialog">
      <q-card class="confirm-dialog">
        <q-card-section>
          <div class="text-h6">Start New Policy?</div>
        </q-card-section>

        <q-card-section>
          <p>Are you sure you want to start a new policy?</p>
          <p class="text-caption text-grey-6">
            This will clear all wizard data and start from the beginning.
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            unelevated
            color="negative"
            label="Start New"
            @click="startNewPolicy"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { copyToClipboard } from 'quasar'

export default {
  name: 'Step7_Export',

  data () {
    return {
      isGenerating: false,
      loadingMessage: 'Generating policy...',
      showEditDialog: false,
      showStartNewDialog: false,
      editablePolicyJson: '',
      originalPolicyJson: '',
      hasJsonError: false,
      jsonErrorMessage: '',
      previewExpanded: true
    }
  },

  computed: {
    ...mapState('wizard', [
      'projectConfig',
      'sampleData',
      'schemaRules',
      'filterRules',
      'fieldMappings',
      'subTransforms',
      'generatedPolicy',
      'policyUpload'
    ]),

    completePolicy () {
      // ALWAYS generate a clean policy object to ensure all UI-only metadata is removed
      // This ensures _isMissingField and other flags are never included in exports
      return this.generatePolicyObject()
    },

    formattedPolicyJson () {
      try {
        return JSON.stringify(this.completePolicy, null, 2)
      } catch (error) {
        console.error('Error formatting policy JSON:', error)
        return '{}'
      }
    },

    policySize () {
      return new Blob([this.formattedPolicyJson]).size
    },

    policyStats () {
      const policy = this.completePolicy
      let totalTransforms = 0

      if (policy && policy.transforms && Array.isArray(policy.transforms)) {
        totalTransforms += policy.transforms.length
      }

      if (policy && policy.subtransforms && Array.isArray(policy.subtransforms)) {
        policy.subtransforms.forEach(st => {
          if (st.transforms && Array.isArray(st.transforms)) {
            totalTransforms += st.transforms.length
          }
        })
      }

      return {
        totalTransforms
      }
    },

    hasChanges () {
      return this.editablePolicyJson !== this.originalPolicyJson
    },

    jsonLineCount () {
      return this.editablePolicyJson ? this.editablePolicyJson.split('\n').length : 0
    }
  },

  mounted () {
    console.log('[Step 7] Component mounted - subTransforms state:', {
      skipSubTransforms: this.subTransforms.skipSubTransforms,
      subTransformsCount: this.subTransforms.subTransformsList?.length || 0
    })

    // ALWAYS regenerate policy when entering Step 7
    // This ensures any changes made in previous steps are reflected
    this.regeneratePolicy()

    // Notify parent that step is valid
    this.$emit('step-valid')
  },

  methods: {
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
    },

    generatePolicyObject () {
      try {
        console.log('[Step 7] generatePolicyObject called - subTransforms:', {
          skipSubTransforms: this.subTransforms.skipSubTransforms,
          subTransformsCount: this.subTransforms.subTransformsList?.length || 0
        })

        // DEBUG: Log policyUpload state
        console.log('[Step 7] policyUpload state:', {
          exists: !!this.policyUpload,
          hasUploadedPolicyData: !!this.policyUpload?.uploadedPolicyData,
          uploadedPolicyDataKeys: this.policyUpload?.uploadedPolicyData ? Object.keys(this.policyUpload.uploadedPolicyData) : null
        })

        const policy = {
          name: this.projectConfig.name || 'Untitled Policy',
          description: this.projectConfig.description || ''
        }

        // Preserve group, grouporder, and lookup/Lookup from uploaded policy (if in update mode)
        // These attributes should be copied as-is without any UI editing
        if (this.policyUpload?.uploadedPolicyData) {
          const uploadedPolicy = this.policyUpload.uploadedPolicyData

          console.log('[Step 7] Uploaded policy has keys:', Object.keys(uploadedPolicy))

          if (uploadedPolicy.group !== undefined) {
            policy.group = uploadedPolicy.group
            console.log('[Step 7] Preserving group attribute:', uploadedPolicy.group)
          }

          if (uploadedPolicy.grouporder !== undefined) {
            policy.grouporder = uploadedPolicy.grouporder
            console.log('[Step 7] Preserving grouporder attribute:', uploadedPolicy.grouporder)
          }

          // Handle both 'lookup' and 'Lookup' (case-insensitive)
          const lookupValue = uploadedPolicy.lookup || uploadedPolicy.Lookup
          console.log('[Step 7] Lookup check:', {
            hasLookup: uploadedPolicy.lookup !== undefined,
            hasCapitalLookup: uploadedPolicy.Lookup !== undefined,
            lookupValue: lookupValue
          })

          if (lookupValue !== undefined) {
            // Preserve with original casing (check which one exists)
            if (uploadedPolicy.Lookup !== undefined) {
              policy.Lookup = uploadedPolicy.Lookup
              console.log('[Step 7] Preserving Lookup attribute (capital L) with', Object.keys(uploadedPolicy.Lookup).length, 'keys')
            } else if (uploadedPolicy.lookup !== undefined) {
              policy.lookup = uploadedPolicy.lookup
              console.log('[Step 7] Preserving lookup attribute (lowercase l) with', Object.keys(uploadedPolicy.lookup).length, 'keys')
            }
          } else {
            console.log('[Step 7] WARNING: No Lookup/lookup attribute found in uploaded policy!')
          }
        } else {
          console.log('[Step 7] No uploaded policy data available - running in create mode or policy not uploaded')
        }

        // Add filter if present
        if (this.filterRules.expression) {
          policy.filter = this.filterRules.expression
        }

        // Add schema rules if present
        const hasSchemaRules = this.schemaRules.convertToJson.length > 0 ||
                              (this.schemaRules.childfanouts && this.schemaRules.childfanouts.length > 0)

        if (hasSchemaRules) {
          policy.schemarule = {}

          // Add ConvertoJson if present
          if (this.schemaRules.convertToJson.length > 0) {
            policy.schemarule.ConvertoJson = this.schemaRules.convertToJson
          }

          // Add childfanouts if present (new hierarchical structure)
          if (this.schemaRules.childfanouts && this.schemaRules.childfanouts.length > 0) {
            // Clean childfanouts to remove UI-only metadata
            const cleanChildFanouts = (fanouts) => {
              if (!Array.isArray(fanouts)) return fanouts

              return fanouts.map(fanout => {
                // If it's a simple string, return as-is
                if (typeof fanout === 'string') {
                  return fanout
                }

                // If it's an object, clean UI-only properties
                const cleanFanout = {}

                // Copy only valid policy fields (field and parentpath)
                if (fanout.field !== undefined) {
                  cleanFanout.field = fanout.field
                }
                if (fanout.parentpath !== undefined) {
                  cleanFanout.parentpath = fanout.parentpath
                }

                // Recursively clean nested childfanouts
                if (fanout.childfanouts && Array.isArray(fanout.childfanouts)) {
                  cleanFanout.childfanouts = cleanChildFanouts(fanout.childfanouts)
                }

                return cleanFanout
              })
            }
            policy.schemarule.childfanouts = cleanChildFanouts(this.schemaRules.childfanouts)
          }
        }

        // Add field mappings (transforms) - clean up any UI-only attributes
        if (this.fieldMappings.mappings && this.fieldMappings.mappings.length > 0) {
          // Remove sampleValue and other UI-only attributes from transforms
          policy.transforms = this.fieldMappings.mappings.map(mapping => {
            const cleanMapping = { ...mapping }
            delete cleanMapping.sampleValue
            delete cleanMapping.id // Remove any internal IDs if present
            delete cleanMapping.originalInputRule // Remove UI tracking field
            delete cleanMapping._isMissingField // Remove missing field flag
            delete cleanMapping._originalInputRule // Remove UI tracking field
            delete cleanMapping.subtransforms // Remove subtransforms from individual transforms (invalid structure)
            delete cleanMapping.subTransforms // Remove alternative casing variant
            return cleanMapping
          })
        }

        // Add subtransforms if they exist - clean up any UI-only attributes
        // Note: We include subtransforms if they exist, regardless of skipSubTransforms flag
        // This handles the case where user initially skips, then goes back to add them
        if (this.subTransforms.subTransformsList &&
            this.subTransforms.subTransformsList.length > 0) {
          console.log('[Step 7] Adding subtransforms to policy:', this.subTransforms.subTransformsList.length)
          // Recursively clean subtransforms and their nested transforms
          const cleanSubTransforms = (subtransformsList) => {
            return subtransformsList.map(subtransform => {
              const cleanSubtransform = { ...subtransform }

              // Remove UI-only properties from subtransform
              delete cleanSubtransform.id
              delete cleanSubtransform.name
              delete cleanSubtransform._missingConditionFields // Remove missing condition fields tracking
              delete cleanSubtransform._missingMappingFields // Remove missing mapping fields tracking

              // Clean nested transforms within subtransform
              if (cleanSubtransform.transforms && Array.isArray(cleanSubtransform.transforms)) {
                cleanSubtransform.transforms = cleanSubtransform.transforms.map(transform => {
                  const cleanTransform = { ...transform }
                  delete cleanTransform.sampleValue
                  delete cleanTransform.id
                  delete cleanTransform.originalInputRule // Remove UI tracking field
                  delete cleanTransform._originalInputRule // Remove UI tracking field (subtransform variant)
                  delete cleanTransform._isMissingField // Remove missing field flag
                  delete cleanTransform.subtransforms // Remove subtransforms from individual transforms (invalid structure)
                  delete cleanTransform.subTransforms // Remove alternative casing variant
                  return cleanTransform
                })
              }

              // Recursively clean nested subtransforms
              if (cleanSubtransform.subTransforms && Array.isArray(cleanSubtransform.subTransforms) && cleanSubtransform.subTransforms.length > 0) {
                cleanSubtransform.subTransforms = cleanSubTransforms(cleanSubtransform.subTransforms)
              }

              return cleanSubtransform
            })
          }

          policy.subtransforms = cleanSubTransforms(this.subTransforms.subTransformsList)
        }

        return policy
      } catch (error) {
        console.error('Error generating policy object:', error)
        return {}
      }
    },

    async regeneratePolicy () {
      this.isGenerating = true
      this.loadingMessage = 'Generating policy from configuration...'

      try {
        // Generate policy using store action
        await this.$store.dispatch('wizard/generatePolicy')

        this.$q.notify({
          type: 'positive',
          message: 'Policy generated successfully',
          position: 'top'
        })
      } catch (error) {
        console.error('Error generating policy:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to generate policy. Please check your configuration.',
          position: 'top'
        })
      } finally {
        this.isGenerating = false
      }
    },

    async downloadPolicy () {
      try {
        const policyJson = this.formattedPolicyJson
        const fileName = `${this.projectConfig.name || 'policy'}.json`

        const blob = new Blob([policyJson], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        this.$q.notify({
          type: 'positive',
          message: `Policy downloaded as ${fileName}`,
          position: 'top'
        })
      } catch (error) {
        console.error('Error downloading policy:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to download policy',
          position: 'top'
        })
      }
    },

    async copyPolicyToClipboard () {
      try {
        await copyToClipboard(this.formattedPolicyJson)

        this.$q.notify({
          type: 'positive',
          message: 'Policy copied to clipboard',
          position: 'top',
          icon: 'content_copy'
        })
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to copy to clipboard',
          position: 'top'
        })
      }
    },

    validateJson () {
      try {
        if (!this.editablePolicyJson || this.editablePolicyJson.trim() === '') {
          this.hasJsonError = true
          this.jsonErrorMessage = 'JSON content cannot be empty'
          return
        }

        JSON.parse(this.editablePolicyJson)
        this.hasJsonError = false
        this.jsonErrorMessage = ''
      } catch (error) {
        this.hasJsonError = true
        // Provide more detailed error messages
        if (error.message.includes('Unexpected token')) {
          const match = error.message.match(/position (\d+)/)
          if (match) {
            const position = parseInt(match[1])
            const lines = this.editablePolicyJson.substring(0, position).split('\n')
            const lineNumber = lines.length
            const columnNumber = lines[lines.length - 1].length + 1
            this.jsonErrorMessage = `Syntax error at line ${lineNumber}, column ${columnNumber}: ${error.message}`
          } else {
            this.jsonErrorMessage = `Syntax error: ${error.message}`
          }
        } else if (error.message.includes('Unexpected end of JSON')) {
          this.jsonErrorMessage = 'Incomplete JSON: Missing closing brackets or braces'
        } else {
          this.jsonErrorMessage = error.message
        }
      }
    },

    formatJson () {
      try {
        const parsed = JSON.parse(this.editablePolicyJson)
        this.editablePolicyJson = JSON.stringify(parsed, null, 2)
        this.validateJson()

        this.$q.notify({
          type: 'positive',
          message: 'JSON formatted successfully',
          position: 'top',
          timeout: 1000
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Cannot format invalid JSON',
          position: 'top'
        })
      }
    },

    cancelEdit () {
      if (this.hasChanges) {
        this.$q.dialog({
          title: 'Discard Changes?',
          message: 'You have unsaved changes. Are you sure you want to discard them?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          this.showEditDialog = false
          this.editablePolicyJson = ''
          this.originalPolicyJson = ''
          this.hasJsonError = false
          this.jsonErrorMessage = ''
        })
      } else {
        this.showEditDialog = false
        this.editablePolicyJson = ''
        this.originalPolicyJson = ''
        this.hasJsonError = false
        this.jsonErrorMessage = ''
      }
    },

    applyPolicyEdits () {
      try {
        // Validate one more time before applying
        const editedPolicy = JSON.parse(this.editablePolicyJson)

        // Validate that it's an object
        if (typeof editedPolicy !== 'object' || editedPolicy === null) {
          throw new Error('Policy must be a valid JSON object')
        }

        // Update the store with the edited policy
        this.$store.commit('wizard/SET_GENERATED_POLICY', {
          policy: editedPolicy,
          policyJson: this.editablePolicyJson
        })

        // Close the dialog
        this.showEditDialog = false

        // Reset edit state
        this.editablePolicyJson = ''
        this.originalPolicyJson = ''
        this.hasJsonError = false
        this.jsonErrorMessage = ''

        // Show success notification
        this.$q.notify({
          type: 'positive',
          message: 'Policy updated successfully',
          caption: 'All changes have been saved and will be reflected in downloads and clipboard copies',
          position: 'top',
          icon: 'check_circle',
          timeout: 3000
        })
      } catch (error) {
        console.error('Error applying policy edits:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save policy changes',
          caption: error.message || 'Please check your JSON format and try again',
          position: 'top',
          icon: 'error',
          timeout: 3000
        })
      }
    },

    expandPreview () {
      this.previewExpanded = true
      // This would expand the JSON preview if we implement collapsible sections
    },

    collapsePreview () {
      this.previewExpanded = false
      // This would collapse the JSON preview if we implement collapsible sections
    },

    confirmStartNew () {
      this.showStartNewDialog = true
    },

    startNewPolicy () {
      this.showStartNewDialog = false
      this.$store.dispatch('wizard/clearState')
      this.$store.commit('wizard/SET_CURRENT_STEP', 0)

      this.$q.notify({
        type: 'info',
        message: 'Starting new policy wizard...',
        position: 'top'
      })
    },

    completeWizard () {
      this.$q.notify({
        type: 'positive',
        message: 'Wizard completed successfully!',
        timeout: 2000,
        position: 'top'
      })

      setTimeout(() => {
        this.$router.push('/')
      }, 1000)
    },

    formatDate (dateString) {
      if (!dateString) return 'Not set'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    formatBytes (bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }
  },

  watch: {
    // Watch for changes in subTransforms to ensure policy is updated
    subTransforms: {
      handler (newVal) {
        console.log('[Step 7] subTransforms changed:', {
          skipSubTransforms: newVal.skipSubTransforms,
          subTransformsCount: newVal.subTransformsList?.length || 0
        })
        // Computed property 'completePolicy' should auto-update, but we can
        // log this to verify reactivity is working
      },
      deep: true
    },

    showEditDialog (newVal) {
      if (newVal) {
        // Initialize the editor with the current policy JSON
        this.editablePolicyJson = this.formattedPolicyJson
        this.originalPolicyJson = this.formattedPolicyJson
        this.hasJsonError = false
        this.jsonErrorMessage = ''

        // Validate the initial content
        this.validateJson()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.step-export {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.step-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--q-color-grey-3);

  .step-icon {
    margin-right: 1.5rem;
    padding: 1rem;
    background: rgba(76, 175, 80, 0.1);
    border-radius: 12px;
  }

  .step-title {
    font-size: 2rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: var(--q-color-grey-9);
  }

  .step-subtitle {
    font-size: 1.125rem;
    color: var(--q-color-grey-7);
    margin: 0;
  }
}

.loading-overlay {
  background: rgba(255, 255, 255, 0.95);

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

.success-banner {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%);
  border-left: 4px solid var(--q-positive);

  .banner-content {
    h6 {
      margin: 0 0 0.5rem 0;
      color: var(--q-positive);
      font-size: 1.125rem;
      font-weight: 600;
    }

    p {
      color: var(--q-color-grey-7);
    }
  }
}

.error-banner {
  background: rgba(244, 67, 54, 0.1);
  border-left: 4px solid var(--q-negative);
}

.summary-card,
.policy-preview-card,
.export-card,
.next-steps-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}

.card-header {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.1) 100%);
  padding: 1.25rem;

  .text-h6 {
    font-weight: 600;
    color: var(--q-color-grey-9);
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-item {
  padding: 1rem;
  background: var(--q-color-grey-1);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--q-color-grey-2);
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .summary-label {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--q-color-grey-7);
    margin-bottom: 0.5rem;
  }

  .summary-value {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--q-color-grey-9);
  }
}

.policy-preview-content {
  .policy-size-info {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .policy-json-preview {
    background: var(--q-color-grey-1);
    border: 1px solid var(--q-color-grey-3);
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
    max-height: 500px;
    overflow-y: auto;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--q-color-grey-9);
    white-space: pre;

    code {
      font-family: inherit;
    }

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: var(--q-color-grey-2);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--q-color-grey-5);
      border-radius: 4px;

      &:hover {
        background: var(--q-color-grey-6);
      }
    }
  }
}

.policy-actions {
  display: flex;
  gap: 0.25rem;
}

.export-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;

  .export-btn {
    padding: 0.75rem 1rem;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.2s ease;

    &.primary-btn {
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);

      &:hover:not(:disabled) {
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        transform: translateY(-2px);
      }
    }

    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--q-color-grey-3);
}

.final-actions {
  display: flex;
  gap: 1rem;
}

.wizard-btn {
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }
}

.edit-policy-dialog {
  width: 90vw;
  max-width: 1200px;
  max-height: 90vh;
}

.dialog-header {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.1) 100%);
  padding: 1.25rem;

  .text-h6 {
    font-weight: 600;
    color: var(--q-color-grey-9);
    margin-bottom: 0.25rem;
  }
}

.edit-dialog-content {
  padding: 1.5rem;
  min-height: 500px;
  max-height: calc(90vh - 250px);
  overflow-y: auto;

  .error-validation-banner {
    background: rgba(244, 67, 54, 0.1);
    border-left: 4px solid var(--q-negative);

    .validation-error-content {
      strong {
        color: var(--q-negative);
        display: block;
        margin-bottom: 0.25rem;
      }
    }
  }

  .success-validation-banner {
    background: rgba(76, 175, 80, 0.1);
    border-left: 4px solid var(--q-positive);

    .validation-success-content {
      strong {
        color: var(--q-positive);
        display: block;
        margin-bottom: 0.25rem;
      }
    }
  }

  .json-editor-wrapper {
    .policy-editor {
      width: 100%;

      :deep(.q-field__control) {
        font-family: 'Roboto Mono', monospace;
        font-size: 0.875rem;
        line-height: 1.6;
        min-height: 450px;
        background: var(--q-color-grey-1);
      }

      :deep(textarea) {
        min-height: 450px;
        max-height: 450px;
        resize: vertical;
        font-family: 'Roboto Mono', monospace;
        font-size: 0.875rem;
        line-height: 1.6;
        padding: 1rem;
        tab-size: 2;

        &::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        &::-webkit-scrollbar-track {
          background: var(--q-color-grey-2);
          border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--q-color-grey-5);
          border-radius: 4px;

          &:hover {
            background: var(--q-color-grey-6);
          }
        }
      }

      :deep(.q-field__prepend) {
        padding-top: 12px;
        align-self: flex-start;
      }

      :deep(.q-field__append) {
        padding-top: 12px;
        align-self: flex-start;
      }
    }

    .editor-stats {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      padding: 0.5rem 0;
    }
  }
}

.dialog-actions {
  padding: 1rem 1.5rem;
  background: var(--q-color-grey-1);

  .action-btn {
    padding: 0.625rem 1.5rem;
    font-weight: 500;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }
  }
}

.confirm-dialog {
  min-width: 400px;
}

// Responsive Design
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

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .export-options {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column;
    gap: 1rem;

    .final-actions {
      width: 100%;
      flex-direction: column;
    }
  }

  .wizard-btn {
    width: 100%;
  }
}

// Dark Mode Support
.body--dark {
  .step-header {
    border-bottom-color: var(--q-color-grey-8);

    .step-title {
      color: var(--q-dark-page);
    }
  }

  .summary-item {
    background: var(--q-dark);

    &:hover {
      background: var(--q-color-grey-9);
    }
  }

  .policy-json-preview {
    background: var(--q-dark);
    border-color: var(--q-color-grey-8);
    color: var(--q-dark-page);
  }

  .edit-policy-dialog {
    .dialog-header {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.15) 100%);

      .text-h6 {
        color: var(--q-dark-page);
      }
    }

    .edit-dialog-content {
      .policy-editor {
        :deep(.q-field__control) {
          background: var(--q-dark);
        }

        :deep(textarea) {
          color: var(--q-dark-page);
        }
      }
    }

    .dialog-actions {
      background: var(--q-dark);
    }
  }
}
</style>
