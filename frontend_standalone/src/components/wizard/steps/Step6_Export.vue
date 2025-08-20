<template>
  <div class="step-export">
    <div class="step-header">
      <div class="step-icon">
        <q-icon name="preview" size="48px" class="text-primary" />
      </div>
      <div class="step-title-section">
        <h2 class="step-title">Review & Export</h2>
        <p class="step-subtitle">
          Review your complete policy and export it for use.
        </p>
      </div>
    </div>

    <div class="step-content">
      <q-card class="wizard-card">
        <q-card-section class="card-header">
          <div class="card-title">
            <q-icon name="check_circle" class="q-mr-sm" />
            Policy Complete
          </div>
          <p class="card-description">
            Your JSON policy has been successfully generated and is ready for export.
          </p>
        </q-card-section>

        <q-card-section class="card-content">
          <div class="completion-message">
            <q-icon name="check_circle" size="64px" class="completion-icon text-positive" />
            <h3 class="completion-title">Policy Generated</h3>
            <p class="completion-text">
              Your JSON Policy Builder wizard is now complete. The policy has been generated
              based on your configuration and is ready to be exported and implemented.
            </p>
          </div>

          <!-- Policy Summary -->
          <div class="policy-summary">
            <h6>Policy Summary:</h6>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Project Name:</span>
                <span class="summary-value">{{ projectConfig.name || 'Untitled Project' }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Created:</span>
                <span class="summary-value">{{ formatDate(projectConfig.createdAt) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Records Processed:</span>
                <span class="summary-value">{{ sampleData.dataStats.recordCount }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Fields Mapped:</span>
                <span class="summary-value">{{ fieldMappings.mappings.length }}</span>
              </div>
            </div>
          </div>

          <!-- Export Options -->
          <div class="export-section">
            <h6>Export Options:</h6>
            <div class="export-actions">
              <q-btn
                unelevated
                color="primary"
                icon="file_download"
                label="Download Policy JSON"
                @click="downloadPolicy"
                class="export-btn"
              />
              <q-btn
                flat
                icon="content_copy"
                label="Copy to Clipboard"
                @click="copyToClipboard"
                class="export-btn"
              />
              <q-btn
                flat
                icon="open_in_new"
                label="Open in Main Editor"
                @click="openInEditor"
                class="export-btn"
              />
            </div>
          </div>

          <!-- Next Steps -->
          <div class="next-steps">
            <h6>Next Steps:</h6>
            <ol class="steps-list">
              <li>Download or copy your generated policy</li>
              <li>Import the policy into your LogRhythm environment</li>
              <li>Test with live data to validate parsing</li>
              <li>Adjust field mappings as needed</li>
            </ol>
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

      <div class="final-actions">
        <q-btn
          flat
          icon="refresh"
          label="Start New Policy"
          @click="startNewPolicy"
          class="wizard-btn wizard-btn--ghost"
        />
        <q-btn
          unelevated
          color="positive"
          icon="check"
          label="Complete Wizard"
          @click="completeWizard"
          class="wizard-btn wizard-btn--success"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Step6_Export',

  computed: {
    ...mapState('wizard', ['projectConfig', 'sampleData', 'fieldMappings'])
  },

  methods: {
    formatDate (dateString) {
      if (!dateString) return 'Not set'
      return new Date(dateString).toLocaleDateString()
    },

    async downloadPolicy () {
      try {
        // Generate a basic policy structure for download
        const policy = {
          name: this.projectConfig.name,
          description: this.projectConfig.description,
          created: this.projectConfig.createdAt,
          transforms: this.fieldMappings.mappings
        }

        const jsonString = JSON.stringify(policy, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = `${this.projectConfig.name || 'policy'}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        this.$q.notify({
          type: 'positive',
          message: 'Policy downloaded successfully'
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to download policy'
        })
      }
    },

    async copyToClipboard () {
      try {
        const policy = {
          name: this.projectConfig.name,
          description: this.projectConfig.description,
          created: this.projectConfig.createdAt,
          transforms: this.fieldMappings.mappings
        }

        const jsonString = JSON.stringify(policy, null, 2)
        await navigator.clipboard.writeText(jsonString)

        this.$q.notify({
          type: 'positive',
          message: 'Policy copied to clipboard'
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to copy to clipboard'
        })
      }
    },

    openInEditor () {
      // Navigate to the main mapping editor
      this.$router.push('/')
    },

    startNewPolicy () {
      // Reset wizard and start over
      this.$store.dispatch('wizard/clearState')
      this.$store.commit('wizard/SET_CURRENT_STEP', 0)
    },

    completeWizard () {
      // Complete wizard and navigate away
      this.$q.notify({
        type: 'positive',
        message: 'Wizard completed successfully!',
        timeout: 2000
      })

      setTimeout(() => {
        this.$router.push('/')
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.step-export {
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

.wizard-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  background: linear-gradient(135deg, rgba(33, 186, 69, 0.1) 0%, rgba(25, 118, 210, 0.1) 100%);
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
}

.card-content {
  padding: 2rem;
}

.completion-message {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(33, 186, 69, 0.05) 0%, rgba(25, 118, 210, 0.05) 100%);
  border-radius: 12px;
}

.completion-icon {
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

.completion-title {
  color: var(--q-positive);
  margin-bottom: 1rem;
}

.completion-text {
  color: var(--q-color-grey-7);
  font-size: 1.125rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.policy-summary,
.export-section,
.next-steps {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--q-color-grey-3);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  h6 {
    color: var(--q-color-grey-9);
    margin-bottom: 1rem;
    font-size: 1.125rem;
    font-weight: 600;
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--q-color-grey-1);
  border-radius: 6px;
}

.summary-label {
  font-weight: 500;
  color: var(--q-color-grey-7);
}

.summary-value {
  font-weight: 600;
  color: var(--q-color-grey-9);
}

.export-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.export-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
}

.steps-list {
  color: var(--q-color-grey-7);
  line-height: 1.6;
  padding-left: 1.5rem;

  li {
    margin-bottom: 0.5rem;
  }
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid var(--q-color-grey-3);
}

.final-actions {
  display: flex;
  gap: 1rem;
}

.wizard-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;

  &--success {
    box-shadow: 0 2px 4px rgba(33, 186, 69, 0.3);

    &:hover {
      box-shadow: 0 4px 8px rgba(33, 186, 69, 0.4);
      transform: translateY(-1px);
    }
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -10px, 0);
  }
  70% {
    transform: translate3d(0, -5px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

// Responsive design
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

  .export-actions {
    flex-direction: column;
  }

  .final-actions {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
