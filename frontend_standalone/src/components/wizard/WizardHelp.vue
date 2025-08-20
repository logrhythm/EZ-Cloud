<template>
  <div class="wizard-help">
    <div class="help-content">
      <!-- Context-specific help content -->
      <component :is="helpComponent" />
    </div>
  </div>
</template>

<script>
// Help components for each step
const IntroductionHelp = () => ({
  template: `
    <div class="help-section">
      <h6>Project Configuration</h6>
      <p>Start by giving your policy a descriptive name and explaining its purpose.</p>
      <ul>
        <li>Choose clear, descriptive names</li>
        <li>Include data source information</li>
        <li>Mention key parsing objectives</li>
      </ul>
    </div>
  `
})

const DataUploadHelp = () => ({
  template: `
    <div class="help-section">
      <h6>Sample Data Input</h6>
      <p>Provide representative JSON samples for analysis:</p>
      <ul>
        <li>Include typical and edge cases</li>
        <li>Ensure data is complete and valid JSON</li>
        <li>Multiple samples improve detection accuracy</li>
      </ul>
    </div>
  `
})

const DefaultHelp = () => ({
  template: `
    <div class="help-section">
      <h6>General Help</h6>
      <p>Use the wizard to build LogRhythm JSON policies step by step.</p>
    </div>
  `
})

export default {
  name: 'WizardHelp',

  props: {
    currentStep: {
      type: String,
      default: 'default'
    }
  },

  computed: {
    helpComponent () {
      const components = {
        introduction: IntroductionHelp,
        dataupload: DataUploadHelp,
        default: DefaultHelp
      }

      return components[this.currentStep] || DefaultHelp
    }
  }
}
</script>

<style lang="scss" scoped>
.wizard-help {
  height: 100%;
  overflow-y: auto;
}

.help-content {
  padding: 1rem;
}

.help-section {
  h6 {
    color: var(--q-primary);
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--q-color-grey-7);
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  ul {
    color: var(--q-color-grey-6);
    font-size: 0.875rem;
    line-height: 1.4;

    li {
      margin-bottom: 0.5rem;
    }
  }
}
</style>
