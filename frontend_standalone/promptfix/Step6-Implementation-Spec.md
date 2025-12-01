# Step 6 SubTransform Configuration - Implementation Specification for Front-End Developer

## Context
You are implementing Step 6 (SubTransform Configuration) for the LogRhythm EZ-Cloud Policy Builder wizard. This is a complex, production-ready feature that allows users to configure conditional field mappings.

## What Has Been Done (Phase 1)
1. Step6_Export.vue renamed to Step7_Export.vue
2. WizardContainer.vue updated with new step registration
3. wizardModule.js updated with:
   - New step definition (order: 5, id: 'subtransform')
   - SubTransform state structure added

## Your Task
Create the following components in phases:

---

## PHASE 2: Main Component and Empty State

### File: `/src/components/wizard/steps/Step6_SubTransformConfig.vue`

**Requirements:**
1. Follow the exact same structure as Step5_Mapping.vue
2. Import necessary Quasar components
3. Use Vuex mapState and mapActions for state management
4. Implement the following sections:

#### Step Header
```vue
<div class="step-header">
  <div class="step-icon">
    <q-icon name="account_tree_outline" size="48px" class="text-primary" />
  </div>
  <div class="step-title-section">
    <h2 class="step-title">SubTransform Configuration</h2>
    <p class="step-subtitle">
      Define conditional field mappings that apply based on runtime data conditions.
      SubTransforms are optional but powerful for handling dynamic log structures.
    </p>
  </div>
</div>
```

#### Instructions Banner
```vue
<div class="instructions-banner">
  <q-icon name="info" size="24px" class="q-mr-sm" />
  <div class="instructions-content">
    <strong>What are SubTransforms?</strong>
    <span class="q-ml-sm">
      SubTransforms apply different field mappings based on conditions. For example,
      "login" events might need different fields than "access" events.
    </span>
  </div>
  <q-space />
  <div class="subtransform-progress">
    <q-chip color="secondary" text-color="white" icon="account_tree">
      {{ subTransformsList.length }} configured
    </q-chip>
  </div>
</div>
```

#### Empty State
Show when `subTransformsList.length === 0`:
```vue
<div class="empty-state-subtransform">
  <q-icon name="account_tree_outline" size="96px" color="grey-5" />
  <h3 class="empty-state-title">No SubTransforms Configured</h3>
  <p class="empty-state-description">
    SubTransforms apply conditional logic to transform fields based on parsed data.
    Add your first SubTransform to create dynamic field mappings.
  </p>

  <div class="use-cases">
    <h6>Common Use Cases:</h6>
    <ul>
      <li>Route different event types to different field structures</li>
      <li>Add extra fields only when severity is high</li>
      <li>Handle vendor-specific data variations</li>
    </ul>
  </div>

  <q-checkbox
    v-model="skipSubTransforms"
    label="Skip SubTransforms (use only base transforms from Step 5)"
    @update:model-value="updateSkipSubTransforms"
  />

  <div class="empty-state-actions">
    <q-btn
      unelevated
      color="primary"
      icon="add"
      label="Add First SubTransform"
      @click="addSubTransform"
      no-caps
      class="q-mt-md"
    />
    <q-btn
      flat
      color="primary"
      icon="folder_open"
      label="Browse Templates"
      @click="showTemplates"
      no-caps
      class="q-mt-md q-ml-sm"
    />
  </div>
</div>
```

#### SubTransform List (when data exists)
```vue
<div v-else class="subtransform-workspace">
  <div class="subtransform-toolbar">
    <div class="toolbar-left">
      <q-btn
        unelevated
        color="primary"
        icon="add"
        label="Add SubTransform"
        @click="addSubTransform"
        no-caps
      />
      <q-btn
        flat
        dense
        icon="folder_open"
        label="Templates"
        @click="showTemplates"
        no-caps
        class="q-ml-sm"
      />
    </div>

    <div class="toolbar-right">
      <q-btn
        flat
        dense
        icon="expand_more"
        label="Expand All"
        @click="expandAll"
        no-caps
      />
      <q-btn
        flat
        dense
        icon="expand_less"
        label="Collapse All"
        @click="collapseAll"
        no-caps
        class="q-ml-sm"
      />
      <q-btn
        unelevated
        color="secondary"
        icon="play_arrow"
        label="Test SubTransforms"
        @click="showTestPanel"
        no-caps
        class="q-ml-md"
      />
    </div>
  </div>

  <div class="subtransform-list">
    <subtransform-card
      v-for="(subtransform, index) in subTransformsList"
      :key="subtransform.id"
      :subtransform="subtransform"
      :index="index"
      :depth="0"
      :max-depth="3"
      @update="updateSubTransform"
      @delete="deleteSubTransform"
      @reorder="reorderSubTransform"
      @add-nested="addNestedSubTransform"
    />
  </div>
</div>
```

#### Vuex Integration
```javascript
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Step6SubTransformConfig',

  computed: {
    ...mapState('wizard', {
      subTransformsList: state => state.subTransforms.subTransformsList,
      skipSubTransforms: state => state.subTransforms.skipSubTransforms,
      sampleData: state => state.sampleData.parsedData
    })
  },

  methods: {
    ...mapActions('wizard', [
      'addSubTransformAction',
      'updateSubTransformAction',
      'deleteSubTransformAction',
      'reorderSubTransformAction',
      'setSkipSubTransforms'
    ]),

    addSubTransform() {
      const newSubTransform = {
        id: this.generateUUID(),
        name: `SubTransform ${this.subTransformsList.length + 1}`,
        condition: '',
        exitOnMatch: false,
        transforms: [],
        subTransforms: []
      }
      this.addSubTransformAction(newSubTransform)
    },

    updateSkipSubTransforms(value) {
      this.setSkipSubTransforms(value)
    },

    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },

    expandAll() {
      // Emit event to all cards to expand
      this.$root.$emit('subtransform-expand-all')
    },

    collapseAll() {
      // Emit event to all cards to collapse
      this.$root.$emit('subtransform-collapse-all')
    },

    showTestPanel() {
      this.$refs.testPanel.show()
    },

    showTemplates() {
      this.$refs.templateDialog.show()
    }
  }
}
```

#### Styling (SCSS)
Follow the same patterns as Step5_Mapping.vue:
- Use `.step-subtransform-config` as root class
- Use Quasar spacing utilities (q-mt-md, q-mb-lg, etc.)
- Use color palette from design spec:
  - Primary: #1976D2
  - Success: #388E3C
  - Warning: #F57C00
  - Info: #FF6F00

---

## PHASE 3: SubTransform Card Component

### File: `/src/components/wizard/SubTransformCard.vue`

**Requirements:**
This is a RECURSIVE component that can render nested SubTransforms.

#### Props
```javascript
props: {
  subtransform: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  },
  maxDepth: {
    type: Number,
    default: 3
  }
}
```

#### Structure
```vue
<template>
  <q-card
    class="subtransform-card"
    :class="[
      `depth-${depth}`,
      { 'dragging': isDragging, 'drag-over': isDragOver }
    ]"
    :style="cardStyle"
  >
    <!-- Card Header -->
    <q-card-section class="card-header" @click="toggleExpanded">
      <div class="header-content">
        <q-icon
          name="drag_indicator"
          class="drag-handle"
          @mousedown.stop="startDrag"
        />
        <q-icon
          :name="depthIcon"
          :color="depthColor"
          class="q-mr-sm"
        />
        <div class="header-info">
          <div class="header-title">
            <span class="subtransform-number">#{{ displayIndex }}</span>
            <q-input
              v-model="localSubTransform.name"
              dense
              borderless
              @blur="updateName"
              @click.stop
              class="name-input"
            />
          </div>
          <div class="header-summary" v-if="!expanded">
            <span class="summary-item">
              <q-icon name="filter_alt" size="xs" class="q-mr-xs" />
              {{ conditionSummary }}
            </span>
            <span class="summary-item">
              <q-icon name="swap_horiz" size="xs" class="q-mr-xs" />
              {{ transformCount }} transforms
            </span>
            <span v-if="subtransform.exitOnMatch" class="summary-item exit-on-match">
              <q-icon name="stop_circle" size="xs" class="q-mr-xs" />
              Exit on Match
            </span>
          </div>
        </div>
        <q-space />
        <div class="header-actions" @click.stop>
          <q-btn
            flat
            dense
            round
            icon="arrow_upward"
            @click.stop="moveUp"
            :disable="index === 0"
            size="sm"
          >
            <q-tooltip>Move Up</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="arrow_downward"
            @click.stop="moveDown"
            :disable="isLast"
            size="sm"
          >
            <q-tooltip>Move Down</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click.stop="confirmDelete"
            size="sm"
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            :icon="expanded ? 'expand_less' : 'expand_more'"
            size="sm"
          >
            <q-tooltip>{{ expanded ? 'Collapse' : 'Expand' }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>

    <!-- Expandable Content -->
    <q-slide-transition>
      <div v-show="expanded">
        <!-- Condition Section -->
        <q-card-section class="condition-section">
          <div class="section-header">
            <h6 class="section-title">CONDITION</h6>
            <q-btn
              flat
              dense
              icon="edit"
              label="Edit Condition"
              @click="editCondition"
              size="sm"
              no-caps
            />
          </div>
          <div class="condition-display">
            <code v-if="subtransform.condition">{{ subtransform.condition }}</code>
            <span v-else class="text-grey-6">No condition defined yet</span>
          </div>
        </q-card-section>

        <q-separator />

        <!-- ExitOnMatch Section -->
        <q-card-section class="exit-on-match-section" :class="{ 'active': subtransform.exitOnMatch }">
          <div class="section-header">
            <h6 class="section-title">EXIT ON MATCH</h6>
            <q-icon name="info" size="xs" class="q-ml-xs">
              <q-tooltip max-width="300px">
                When enabled, if this SubTransform's condition matches,
                no further SubTransforms will be evaluated.
              </q-tooltip>
            </q-icon>
          </div>
          <q-toggle
            v-model="localSubTransform.exitOnMatch"
            label="Stop processing after this SubTransform matches"
            @update:model-value="updateExitOnMatch"
            color="amber-9"
          />
        </q-card-section>

        <q-separator />

        <!-- Transforms Section -->
        <q-card-section class="transforms-section">
          <div class="section-header">
            <h6 class="section-title">FIELD MAPPINGS ({{ transformCount }})</h6>
            <q-btn
              flat
              dense
              icon="add"
              label="Add Transform"
              @click="addTransform"
              size="sm"
              color="primary"
              no-caps
            />
          </div>
          <div v-if="transformCount === 0" class="empty-transforms">
            <q-icon name="info" color="grey-6" />
            <span class="text-grey-6">No transforms configured yet</span>
          </div>
          <div v-else class="transforms-list">
            <div
              v-for="(transform, tIndex) in subtransform.transforms"
              :key="tIndex"
              class="transform-item"
            >
              <q-icon name="swap_horiz" size="xs" class="q-mr-xs" />
              <span class="transform-source">{{ transform.inputRule || transform.inputrule }}</span>
              <q-icon name="arrow_forward" size="xs" class="q-mx-xs" />
              <span class="transform-target">{{ transform.LRSchemaField }}</span>
              <q-space />
              <q-btn
                flat
                dense
                round
                icon="edit"
                size="xs"
                @click="editTransform(tIndex)"
              />
              <q-btn
                flat
                dense
                round
                icon="delete"
                size="xs"
                color="negative"
                @click="deleteTransform(tIndex)"
              />
            </div>
          </div>
        </q-card-section>

        <!-- Nested SubTransforms Section -->
        <div v-if="canAddNested">
          <q-separator />
          <q-card-section class="nested-section">
            <div class="section-header">
              <h6 class="section-title">NESTED SUBTRANSFORMS ({{ nestedCount }})</h6>
              <q-btn
                flat
                dense
                icon="add"
                label="Add Nested"
                @click="addNested"
                size="sm"
                color="secondary"
                no-caps
              />
            </div>
            <div v-if="nestedCount === 0" class="empty-nested">
              <q-icon name="info" color="grey-6" />
              <span class="text-grey-6">No nested SubTransforms</span>
            </div>
            <div v-else class="nested-list">
              <subtransform-card
                v-for="(nested, nIndex) in subtransform.subTransforms"
                :key="nested.id"
                :subtransform="nested"
                :index="nIndex"
                :depth="depth + 1"
                :max-depth="maxDepth"
                class="nested-card"
                @update="updateNested"
                @delete="deleteNested"
              />
            </div>
          </q-card-section>
        </div>
      </div>
    </q-slide-transition>
  </q-card>
</template>
```

#### Computed Properties
```javascript
computed: {
  displayIndex() {
    if (this.depth === 0) return this.index + 1
    return `${this.parentIndex}.${this.index + 1}`
  },

  depthIcon() {
    const icons = ['account_tree_outline', 'subdirectory_arrow_right', 'chevron_right', 'more_horiz']
    return icons[Math.min(this.depth, icons.length - 1)]
  },

  depthColor() {
    const colors = ['primary', 'green-6', 'orange-6', 'purple-6']
    return colors[Math.min(this.depth, colors.length - 1)]
  },

  cardStyle() {
    const indent = this.depth * 24
    return {
      marginLeft: `${indent}px`,
      borderLeft: this.depth > 0 ? `3px solid var(--q-${this.depthColor})` : 'none'
    }
  },

  conditionSummary() {
    if (!this.subtransform.condition) return 'No condition'
    return this.subtransform.condition.length > 50
      ? this.subtransform.condition.substring(0, 50) + '...'
      : this.subtransform.condition
  },

  transformCount() {
    return this.subtransform.transforms?.length || 0
  },

  nestedCount() {
    return this.subtransform.subTransforms?.length || 0
  },

  canAddNested() {
    return this.depth < this.maxDepth
  }
}
```

---

## Additional Requirements

### Vuex Actions to Implement
Add these to wizardModule.js:

```javascript
// mutations
ADD_SUBTRANSFORM(state, subtransform) {
  state.subTransforms.subTransformsList.push(subtransform)
},

UPDATE_SUBTRANSFORM(state, { id, updates }) {
  const index = state.subTransforms.subTransformsList.findIndex(st => st.id === id)
  if (index !== -1) {
    state.subTransforms.subTransformsList[index] = {
      ...state.subTransforms.subTransformsList[index],
      ...updates
    }
  }
},

DELETE_SUBTRANSFORM(state, id) {
  state.subTransforms.subTransformsList = state.subTransforms.subTransformsList.filter(st => st.id !== id)
},

REORDER_SUBTRANSFORMS(state, { oldIndex, newIndex }) {
  const item = state.subTransforms.subTransformsList.splice(oldIndex, 1)[0]
  state.subTransforms.subTransformsList.splice(newIndex, 0, item)
},

SET_SKIP_SUBTRANSFORMS(state, value) {
  state.subTransforms.skipSubTransforms = value
}

// actions
addSubTransformAction({ commit }, subtransform) {
  commit('ADD_SUBTRANSFORM', subtransform)
},

updateSubTransformAction({ commit }, payload) {
  commit('UPDATE_SUBTRANSFORM', payload)
},

deleteSubTransformAction({ commit }, id) {
  commit('DELETE_SUBTRANSFORM', id)
},

reorderSubTransformAction({ commit }, payload) {
  commit('REORDER_SUBTRANSFORMS', payload)
},

setSkipSubTransforms({ commit }, value) {
  commit('SET_SKIP_SUBTRANSFORMS', value)
}
```

### Component Dependencies
- Step3 Filter Builder: Will integrate in Phase 4
- Step5 Field Mapping: Will integrate in Phase 4
- Drag-and-drop: Will implement in Phase 5

### Styling Notes
- Follow existing wizard step styling patterns
- Use Quasar's utility classes
- Responsive: mobile-first approach
- Dark mode: already handled by theme service

---

## Testing Checklist

After implementation:
1. Can add SubTransforms
2. Can delete SubTransforms (with confirmation)
3. Empty state displays correctly
4. SubTransform cards expand/collapse
5. Name can be edited inline
6. ExitOnMatch toggle works
7. Vuex state updates correctly
8. No console errors

---

## Next Phases Preview

**Phase 4:** Will integrate existing Filter Builder and Field Mapping components
**Phase 5:** Will add drag-and-drop reordering
**Phase 6:** Will add test panel and animations

---

## Questions?
Refer to:
- `/promptfix/SubTransform-UI-Design-Specification.md` (full design spec)
- `/promptfix/subtranform.md` (functional requirements)
- Existing Step5_Mapping.vue for patterns
- Existing Step4_FilterConfig.vue for filter patterns

Begin implementation now. Create Step6_SubTransformConfig.vue and SubTransformCard.vue following the specifications above.
