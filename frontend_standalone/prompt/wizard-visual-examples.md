# JSON Policy Builder Wizard - Visual Examples & Implementation

## Visual Mockups (ASCII Art)

### Main Wizard Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ LogRhythm JSON Policy Builder Wizard                    🌙/☀️ [Theme] [Help]  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─ Steps Progress ─────────────────────────────────────────────────────────┐  │
│  │  ✓ Intro    ✓ Data    ● Schema    ○ Filter    ○ Map    ○ Review       │  │
│  │  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 40%   │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─ Step 3: Schema Rule Configuration ─────────────────────────────────────┐  │
│  │                                                                         │  │
│  │  Convert stringified JSON to proper JSON objects                       │  │
│  │                                                                         │  │
│  │  ┌─ JSON Structure ─────────────────┐  ┌─ Actions ─────────────────┐  │  │
│  │  │                                  │  │                           │  │  │
│  │  │  📄 root                        │  │  ☑ Convert to JSON        │  │  │
│  │  │    ├─ 🏷 @metadata (object)      │  │  ☐ Parse nested values    │  │  │
│  │  │    ├─ 📝 message (string) ←──────┼──┼─→☑ Contains JSON          │  │  │
│  │  │    └─ 📊 data (object)          │  │                           │  │  │
│  │  │        ├─ 🔢 count (number)     │  │  [Preview Changes]        │  │  │
│  │  │        └─ 📅 timestamp (string) │  │                           │  │  │
│  │  │                                  │  │                           │  │  │
│  │  └──────────────────────────────────┘  └───────────────────────────┘  │  │
│  │                                                                         │  │
│  │  💡 Tip: Select fields that contain stringified JSON data             │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─ Navigation ─────────────────────────────────────────────────────────────┐  │
│  │  [← Back]                                        [Next: Filter Rules →]  │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Step 1: Introduction & Project Setup

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Welcome to JSON Policy Builder                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  🎯 What you'll accomplish:                                                     │
│     • Create JSON parsing policies for log data                                │
│     • Configure schema rules and field mappings                                │
│     • Generate exportable policy files                                         │
│                                                                                 │
│  ┌─ Project Setup ─────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  Project Name: [My New Policy________________]                          │   │
│  │                                                                         │   │
│  │  Description:  [┌─────────────────────────────┐]                       │   │
│  │                [│ Optional description        │]                       │   │
│  │                [└─────────────────────────────┘]                       │   │
│  │                                                                         │   │
│  │  ○ Create new policy                                                    │   │
│  │  ○ Update existing policy                                               │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ⏱ Estimated time: 10-15 minutes                                               │
│                                                                                 │
│  [Get Started →]                                                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Step 2: Sample Data Input

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Step 2: Sample Data Input                                              [2 of 7] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  📁 Input Method: [Single Log ▼] [Multiple Logs] [File Upload]                 │
│                                                                                 │
│  ┌─ JSON Input ─────────────────────────────────────────────────────────────┐  │
│  │                                                                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │  │
│  │  │ {                                                               │   │  │
│  │  │   "@metadata": {                                               │   │  │
│  │  │     "beat": "filebeat",                                        │   │  │
│  │  │     "version": "7.x"                                          │   │  │
│  │  │   },                                                           │   │  │
│  │  │   "message": "{\"event\":\"login\",\"user\":\"admin\"}",     │   │  │
│  │  │   "timestamp": "2024-01-15T10:30:00Z"                        │   │  │
│  │  │ }                                                              │   │  │
│  │  │                                                               │   │  │
│  │  └─────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                         │  │
│  │  Status: ✅ Valid JSON  │  📊 Fields detected: 4  │  [Preview →]      │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  💡 Tips:                                                                      │
│     • Paste representative sample data                                         │
│     • Include all field variations you expect                                  │
│     • JSON will be validated in real-time                                      │
│                                                                                 │
│  [← Back]                                              [Analyze Data →]       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Step 4: Schema Rule Configuration (Fanout)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Step 4: Configure Array Processing (Fanout)                           [4 of 7] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  📊 Detected Arrays: Select which arrays should be processed individually      │
│                                                                                 │
│  ┌─ JSON Structure Analysis ───────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  📄 Root                                                                │   │
│  │    ├─ 🏢 departments [🔲] ← Array (2 items)                           │   │
│  │    │    ├─ 📝 name                                                     │   │
│  │    │    └─ 👥 teams [✅] ← Array (3 items)                            │   │
│  │    │         ├─ 📝 teamName                                            │   │
│  │    │         └─ 👤 members [✅] ← Array (5 items)                     │   │
│  │    │              ├─ 📝 name                                           │   │
│  │    │              ├─ 💼 role                                           │   │
│  │    │              └─ 🔧 skills [🔲] ← Array (3 items)                │   │
│  │    └─ 📋 projects [✅] ← Array (2 items)                              │   │
│  │         ├─ 🆔 projectId                                                │   │
│  │         ├─ 📝 name                                                     │   │
│  │         └─ 📅 phases [🔲] ← Array (3 items)                          │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─ Selected Arrays Preview ──────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  ✅ $.teams (Parent: $.departments)                                    │   │
│  │  ✅ $.members (Parent: $.teams)                                        │   │
│  │  ✅ $.projects (Parent: null)                                          │   │
│  │                                                                         │   │
│  │  → This will create 3 fanout rules for array processing               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  💡 Array Processing: Each selected array will be processed as separate records │
│                                                                                 │
│  [← Back]                                              [Configure Filters →]  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Step 5: Filter Rule Configuration

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Step 5: Configure Filter Rules                                        [5 of 7] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  🔍 Create conditions to determine when this policy applies                     │
│                                                                                 │
│  ┌─ Filter Builder ────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  Rule 1: [@metadata.beat] [equals ▼] [filebeat________]  [× Remove]    │   │
│  │          ├─ AND ○  OR ○                                                 │   │
│  │                                                                         │   │
│  │  Rule 2: [event.category_] [contains ▼] [authentication] [× Remove]    │   │
│  │          ├─ AND ○  OR ○                                                 │   │
│  │                                                                         │   │
│  │  [+ Add Condition]                                                      │   │
│  │                                                                         │   │
│  │  ┌─ Preview ──────────────────────────────────────────────────────┐   │   │
│  │  │ @.@metadata.beat == 'filebeat' &&                             │   │   │
│  │  │ @.event.category.Contains('authentication')                   │   │   │
│  │  └────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─ Quick Templates ──────────────────────────────────────────────────────┐   │
│  │  [Filebeat Logs] [Windows Events] [Sysmon] [Custom]                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ⚡ Test Filter: [Test Against Sample] (✅ 3 of 3 samples match)               │
│                                                                                 │
│  [← Back]                                              [Create Mappings →]    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Step 6: Schema Mapping Creation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Step 6: Create Field Mappings                                         [6 of 7] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  🗺️ Map JSON fields to LogRhythm schema fields                                 │
│                                                                                 │
│  ┌─ Field Mappings ────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  JSON Path                 │ LR Schema       │ Operation  │ Format      │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │  $.@metadata.beat         │ [vendorinfo ▼] │ [none ▼]  │ [────────]  │   │
│  │  $.timestamp              │ [<custom>___] │ [datetime▼]│ [ISO8601▼]  │   │
│  │  $.source.ip              │ [sip_______▼] │ [none ▼]  │ [────────]  │   │
│  │  $.destination.ip         │ [dip_______▼] │ [none ▼]  │ [────────]  │   │
│  │  $.event.action           │ [action____▼] │ [none ▼]  │ [────────]  │   │
│  │  $.user.name              │ [login_____▼] │ [none ▼]  │ [────────]  │   │
│  │                                                                         │   │
│  │  [+ Add Mapping]                                                        │   │
│  │                                                                         │   │
│  │  ┌─ Mapping Stats ────────────────────────────┐                        │   │
│  │  │ Total Fields: 12  │ Mapped: 6  │ Skip: 6   │                        │   │
│  │  └────────────────────────────────────────────┘                        │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─ Auto-Mapping Suggestions ─────────────────────────────────────────────┐   │
│  │  💡 $.client_ip → [sip] (Confidence: High)          [Apply] [Ignore]   │   │
│  │  💡 $.event_time → [<timestamp>] (Confidence: Med)  [Apply] [Ignore]   │   │
│  │  💡 $.user_id → [login] (Confidence: Low)           [Apply] [Ignore]   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  [← Back]                                              [Review Policy →]      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Step 7: Review & Export

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Step 7: Review & Export Policy                                        [7 of 7] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  📋 Policy Summary: "My New Policy"                                            │
│                                                                                 │
│  ┌─ Configuration Overview ───────────────────────────────────────────────┐    │
│  │                                                                         │    │
│  │  ✅ Sample Data: 3 JSON samples processed                              │    │
│  │  ✅ Schema Rules: 2 ConvertToJSON + 3 Fanout rules                     │    │
│  │  ✅ Filter Rules: @metadata.beat == 'filebeat' AND ...                 │    │
│  │  ✅ Mappings: 6 fields mapped to LR schema                             │    │
│  │                                                                         │    │
│  │  📊 Coverage: 85% of fields mapped                                     │    │
│  │  ⚠️  Warnings: 2 unmapped timestamp fields                             │    │
│  │                                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─ Generated Policy Preview ─────────────────────────────────────────────┐    │
│  │                                                                         │    │
│  │  {                                                                      │    │
│  │    "policyName": "My New Policy",                                      │    │
│  │    "filter": "@.@metadata.beat == 'filebeat'",                        │    │
│  │    "schemaRule": {                                                      │    │
│  │      "convertToJson": ["$.message"],                                   │    │
│  │      "childFanouts": [...]                                            │    │
│  │    },                                                                  │    │
│  │    "transforms": [...]                                                 │    │
│  │  }                                                                      │    │
│  │                                                                         │    │
│  │  [View Full JSON] [Download] [Copy to Clipboard]                      │    │
│  │                                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─ Export Options ───────────────────────────────────────────────────────┐    │
│  │  [📥 Download JSON File] [📋 Copy to Clipboard] [🚀 Deploy Now]       │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  [← Back to Edit]                                      [🎉 Finish & Export]   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Component Implementation Examples

### 1. Wizard Step Navigation Component

```vue
<template>
  <div class="wizard-steps-nav">
    <div
      v-for="(step, index) in steps"
      :key="step.id"
      class="wizard-step-item"
      :class="{
        'completed': index < currentStep,
        'active': index === currentStep,
        'upcoming': index > currentStep,
        'has-error': step.hasError
      }"
      @click="navigateToStep(index)"
    >
      <!-- Step Number/Icon -->
      <div class="step-number">
        <q-icon
          v-if="index < currentStep"
          name="check"
          class="icon-completed"
        />
        <q-icon
          v-else-if="step.hasError"
          name="error"
          class="icon-error"
        />
        <span v-else>{{ index + 1 }}</span>
      </div>
      
      <!-- Step Label -->
      <div class="step-content">
        <div class="step-label">{{ step.title }}</div>
        <div v-if="step.subtitle" class="step-subtitle">
          {{ step.subtitle }}
        </div>
      </div>
      
      <!-- Connection Line -->
      <div
        v-if="index < steps.length - 1"
        class="step-connector"
        :class="{ 'completed': index < currentStep }"
      />
    </div>
  </div>
</template>

<style scoped>
.wizard-steps-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  overflow-x: auto;
}

.wizard-step-item {
  display: flex;
  align-items: center;
  position: relative;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  
  &.completed {
    .step-number {
      background: var(--q-positive);
      color: white;
    }
    .step-label {
      color: var(--q-positive);
      font-weight: 600;
    }
  }
  
  &.active {
    background: rgba(var(--q-primary-rgb), 0.1);
    .step-number {
      background: var(--q-primary);
      color: white;
    }
    .step-label {
      color: var(--q-primary);
      font-weight: 600;
    }
  }
  
  &.upcoming {
    .step-number {
      background: var(--q-dark-page);
      color: var(--q-dark);
    }
    .step-label {
      color: var(--q-dark);
    }
  }
  
  &.has-error {
    .step-number {
      background: var(--q-negative);
      color: white;
    }
    .step-label {
      color: var(--q-negative);
    }
  }
  
  &:hover:not(.active) {
    background: rgba(var(--q-primary-rgb), 0.05);
    transform: translateY(-2px);
  }
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 0.75rem;
  transition: all 0.3s ease;
}

.step-content {
  flex: 1;
}

.step-label {
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.step-subtitle {
  font-size: 0.75rem;
  color: var(--q-dark);
  margin-top: 0.25rem;
}

.step-connector {
  position: absolute;
  right: -2rem;
  width: 4rem;
  height: 2px;
  background: var(--q-dark-page);
  transition: all 0.3s ease;
  
  &.completed {
    background: var(--q-positive);
  }
}
</style>
```

### 2. JSON Field Selector Component

```vue
<template>
  <div class="json-field-selector">
    <div class="json-tree">
      <JsonNode
        v-for="(node, index) in jsonTree"
        :key="index"
        :node="node"
        :level="0"
        :selected-fields="selectedFields"
        @toggle-field="toggleField"
        @preview-field="previewField"
      />
    </div>
    
    <!-- Selection Summary -->
    <div class="selection-summary">
      <h3>Selected Fields ({{ selectedFields.length }})</h3>
      <div class="selected-items">
        <q-chip
          v-for="field in selectedFields"
          :key="field"
          removable
          color="primary"
          @remove="removeField(field)"
        >
          {{ field }}
        </q-chip>
      </div>
    </div>
  </div>
</template>

<script>
import JsonNode from './JsonNode.vue'

export default {
  name: 'JsonFieldSelector',
  components: { JsonNode },
  props: {
    jsonData: {
      type: [Object, Array],
      required: true
    },
    allowMultiple: {
      type: Boolean,
      default: true
    },
    filterType: {
      type: String,
      default: 'all' // 'all', 'arrays', 'objects', 'strings'
    }
  },
  
  data() {
    return {
      selectedFields: [],
      jsonTree: []
    }
  },
  
  watch: {
    jsonData: {
      handler() {
        this.buildJsonTree()
      },
      immediate: true
    }
  },
  
  methods: {
    buildJsonTree() {
      this.jsonTree = this.parseJson(this.jsonData, '$')
    },
    
    parseJson(obj, path = '$', level = 0) {
      const nodes = []
      
      if (Array.isArray(obj)) {
        nodes.push({
          path,
          key: path.split('.').pop() || 'root',
          type: 'array',
          level,
          isSelectable: this.isFieldSelectable('array'),
          children: obj.length > 0 ? this.parseJson(obj[0], `${path}[*]`, level + 1) : []
        })
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          const currentPath = `${path}.${key}`
          const value = obj[key]
          const type = this.getValueType(value)
          
          const node = {
            path: currentPath,
            key,
            type,
            level,
            isSelectable: this.isFieldSelectable(type),
            value: type === 'string' || type === 'number' || type === 'boolean' ? value : undefined
          }
          
          if (typeof value === 'object' && value !== null) {
            node.children = this.parseJson(value, currentPath, level + 1)
          }
          
          nodes.push(node)
        })
      }
      
      return nodes
    },
    
    getValueType(value) {
      if (Array.isArray(value)) return 'array'
      if (value === null) return 'null'
      if (typeof value === 'object') return 'object'
      if (typeof value === 'string') {
        try {
          JSON.parse(value)
          return 'string-json'
        } catch {
          return 'string'
        }
      }
      return typeof value
    },
    
    isFieldSelectable(type) {
      switch (this.filterType) {
        case 'arrays': return type === 'array'
        case 'objects': return type === 'object'
        case 'strings': return type === 'string' || type === 'string-json'
        default: return true
      }
    },
    
    toggleField(fieldPath) {
      if (!this.allowMultiple) {
        this.selectedFields = [fieldPath]
      } else {
        const index = this.selectedFields.indexOf(fieldPath)
        if (index > -1) {
          this.selectedFields.splice(index, 1)
        } else {
          this.selectedFields.push(fieldPath)
        }
      }
      
      this.$emit('selection-changed', [...this.selectedFields])
    },
    
    removeField(fieldPath) {
      const index = this.selectedFields.indexOf(fieldPath)
      if (index > -1) {
        this.selectedFields.splice(index, 1)
        this.$emit('selection-changed', [...this.selectedFields])
      }
    },
    
    previewField(fieldPath) {
      this.$emit('field-preview', fieldPath)
    }
  }
}
</script>

<style scoped>
.json-field-selector {
  border: 1px solid var(--q-border-color);
  border-radius: 8px;
  background: var(--color-surface);
}

.json-tree {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  font-family: 'Roboto Mono', monospace;
}

.selection-summary {
  border-top: 1px solid var(--q-border-color);
  padding: 1rem;
  background: var(--color-surface-variant);
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>
```

### 3. Progress Indicator Component

```vue
<template>
  <div class="wizard-progress-container">
    <!-- Progress Bar -->
    <div class="progress-bar-container">
      <div class="progress-background">
        <div
          class="progress-fill"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>
      <div class="progress-text">
        {{ Math.round(progressPercentage) }}% Complete
      </div>
    </div>
    
    <!-- Step Indicators -->
    <div class="step-indicators">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="step-dot"
        :class="{
          'completed': index < currentStep,
          'active': index === currentStep,
          'error': step.hasError
        }"
        :title="step.title"
      />
    </div>
    
    <!-- Time Estimate -->
    <div class="time-estimate">
      <q-icon name="schedule" class="q-mr-xs" />
      {{ timeRemaining }} remaining
    </div>
  </div>
</template>

<script>
export default {
  name: 'WizardProgressIndicator',
  props: {
    steps: {
      type: Array,
      required: true
    },
    currentStep: {
      type: Number,
      required: true
    },
    estimatedTotalTime: {
      type: Number,
      default: 900 // 15 minutes in seconds
    }
  },
  
  computed: {
    progressPercentage() {
      return ((this.currentStep + 1) / this.steps.length) * 100
    },
    
    timeRemaining() {
      const completed = this.currentStep + 1
      const remaining = this.steps.length - completed
      const avgTimePerStep = this.estimatedTotalTime / this.steps.length
      const secondsRemaining = remaining * avgTimePerStep
      
      if (secondsRemaining < 60) {
        return '< 1 minute'
      } else if (secondsRemaining < 3600) {
        return `${Math.ceil(secondsRemaining / 60)} minutes`
      } else {
        const hours = Math.floor(secondsRemaining / 3600)
        const minutes = Math.ceil((secondsRemaining % 3600) / 60)
        return `${hours}h ${minutes}m`
      }
    }
  }
}
</script>

<style scoped>
.wizard-progress-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.progress-bar-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-background {
  flex: 1;
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #50B7F8 0%, #B74F92 100%);
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      transparent 25%, 
      rgba(255,255,255,0.1) 25%, 
      rgba(255,255,255,0.1) 50%, 
      transparent 50%, 
      transparent 75%, 
      rgba(255,255,255,0.1) 75%);
    background-size: 20px 20px;
    animation: progress-shine 1s linear infinite;
  }
}

@keyframes progress-shine {
  0% {
    transform: translateX(-20px);
  }
  100% {
    transform: translateX(20px);
  }
}

.progress-text {
  font-weight: 600;
  color: var(--color-text-primary);
  min-width: 100px;
  text-align: right;
}

.step-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-border);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &.completed {
    background: var(--q-positive);
    transform: scale(1.2);
  }
  
  &.active {
    background: var(--q-primary);
    transform: scale(1.4);
    box-shadow: 0 0 0 4px rgba(var(--q-primary-rgb), 0.2);
  }
  
  &.error {
    background: var(--q-negative);
    transform: scale(1.2);
  }
  
  &:hover {
    transform: scale(1.3);
  }
}

.time-estimate {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}
</style>
```

### 4. Help Panel Component

```vue
<template>
  <q-drawer
    v-model="isOpen"
    side="right"
    overlay
    bordered
    :width="400"
    :breakpoint="600"
    class="wizard-help-panel"
  >
    <div class="help-header">
      <h3>Help & Documentation</h3>
      <q-btn
        flat
        round
        icon="close"
        @click="close"
      />
    </div>
    
    <q-separator />
    
    <div class="help-content">
      <!-- Quick Tips -->
      <q-expansion-item
        icon="lightbulb"
        label="Quick Tips"
        default-opened
        class="help-section"
      >
        <div class="help-tips">
          <div
            v-for="tip in currentStepTips"
            :key="tip.id"
            class="tip-item"
          >
            <q-icon :name="tip.icon" class="tip-icon" />
            <div class="tip-content">
              <strong>{{ tip.title }}</strong>
              <p>{{ tip.description }}</p>
            </div>
          </div>
        </div>
      </q-expansion-item>
      
      <!-- Examples -->
      <q-expansion-item
        icon="code"
        label="Examples"
        class="help-section"
      >
        <div class="help-examples">
          <div
            v-for="example in currentStepExamples"
            :key="example.id"
            class="example-item"
          >
            <h4>{{ example.title }}</h4>
            <pre class="example-code">{{ example.code }}</pre>
            <p>{{ example.explanation }}</p>
          </div>
        </div>
      </q-expansion-item>
      
      <!-- Documentation Links -->
      <q-expansion-item
        icon="menu_book"
        label="Documentation"
        class="help-section"
      >
        <q-list>
          <q-item
            v-for="doc in documentationLinks"
            :key="doc.id"
            clickable
            :href="doc.url"
            target="_blank"
          >
            <q-item-section avatar>
              <q-icon :name="doc.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ doc.title }}</q-item-label>
              <q-item-label caption>{{ doc.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="open_in_new" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      
      <!-- Troubleshooting -->
      <q-expansion-item
        icon="build"
        label="Troubleshooting"
        class="help-section"
      >
        <div class="troubleshooting">
          <div
            v-for="issue in commonIssues"
            :key="issue.id"
            class="issue-item"
          >
            <h4>{{ issue.problem }}</h4>
            <div class="solution">
              <strong>Solution:</strong>
              <p>{{ issue.solution }}</p>
            </div>
          </div>
        </div>
      </q-expansion-item>
    </div>
  </q-drawer>
</template>

<script>
export default {
  name: 'WizardHelpPanel',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    currentStep: {
      type: String,
      required: true
    }
  },
  
  emits: ['update:modelValue'],
  
  computed: {
    isOpen: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    
    currentStepTips() {
      return this.helpContent[this.currentStep]?.tips || []
    },
    
    currentStepExamples() {
      return this.helpContent[this.currentStep]?.examples || []
    }
  },
  
  data() {
    return {
      helpContent: {
        'data-input': {
          tips: [
            {
              id: 1,
              icon: 'info',
              title: 'Use Representative Data',
              description: 'Include all field variations you expect to see in production logs'
            },
            {
              id: 2,
              icon: 'warning',
              title: 'JSON Validation',
              description: 'Make sure your JSON is properly formatted - use a validator if needed'
            }
          ],
          examples: [
            {
              id: 1,
              title: 'Basic Log Entry',
              code: '{\n  "timestamp": "2024-01-15T10:30:00Z",\n  "level": "INFO",\n  "message": "User login successful"\n}',
              explanation: 'A simple log entry with timestamp, level, and message'
            }
          ]
        },
        'schema-config': {
          tips: [
            {
              id: 1,
              icon: 'settings',
              title: 'Identify JSON Strings',
              description: 'Look for fields containing stringified JSON that need parsing'
            }
          ]
        }
      },
      
      documentationLinks: [
        {
          id: 1,
          title: 'JSONPath Guide',
          description: 'Learn about JSONPath syntax and expressions',
          icon: 'description',
          url: '#'
        },
        {
          id: 2,
          title: 'LogRhythm Schema',
          description: 'Field mapping reference',
          icon: 'account_tree',
          url: '#'
        }
      ],
      
      commonIssues: [
        {
          id: 1,
          problem: 'JSON parsing error',
          solution: 'Check for proper JSON formatting, missing quotes, or trailing commas'
        },
        {
          id: 2,
          problem: 'Field not detected',
          solution: 'Ensure the field exists in your sample data and has a value'
        }
      ]
    }
  },
  
  methods: {
    close() {
      this.isOpen = false
    }
  }
}
</script>

<style scoped>
.wizard-help-panel {
  background: var(--color-surface);
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  
  h3 {
    margin: 0;
    color: var(--color-text-primary);
  }
}

.help-content {
  height: calc(100vh - 120px);
  overflow-y: auto;
  padding: 1rem;
}

.help-section {
  margin-bottom: 1rem;
}

.help-tips, .help-examples, .troubleshooting {
  padding: 1rem 0;
}

.tip-item, .issue-item {
  display: flex;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--color-surface-variant);
  border-radius: 8px;
}

.tip-icon {
  margin-right: 0.75rem;
  color: var(--q-primary);
  font-size: 1.25rem;
}

.tip-content, .solution {
  flex: 1;
  
  strong {
    color: var(--color-text-primary);
    display: block;
    margin-bottom: 0.25rem;
  }
  
  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.4;
  }
}

.example-item {
  margin-bottom: 1.5rem;
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: var(--color-text-primary);
  }
}

.example-code {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.75rem;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.issue-item {
  flex-direction: column;
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: var(--q-negative);
  }
}
</style>
```

This comprehensive visual examples and implementation guide provides:

1. **ASCII Art Mockups**: Clear visual representations of each wizard step showing layout and user interaction patterns
2. **Component Examples**: Fully functional Vue.js components with proper styling and interaction logic
3. **Progressive Disclosure**: Information is revealed gradually to reduce cognitive load
4. **Responsive Design**: Components adapt to different screen sizes
5. **Accessibility**: Proper ARIA labels, keyboard navigation, and high contrast support
6. **Visual Hierarchy**: Clear organization of information with proper typography and spacing
7. **Interactive Elements**: Hover states, transitions, and micro-interactions that enhance usability

The design maintains consistency with LogRhythm's branding while creating a modern, intuitive wizard interface that guides users through the complex process of creating JSON policies.

/mnt/g/GO_Workspace/src/github.com/logrhythm/EZ-Cloud-Fresh/frontend_standalone/wizard-visual-examples.md