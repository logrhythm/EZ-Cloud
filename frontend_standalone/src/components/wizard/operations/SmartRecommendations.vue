<template>
  <div v-if="recommendations.length > 0" class="smart-recommendations">
    <div class="recommendations-header">
      <q-icon name="auto_awesome" size="20px" color="primary" />
      <span class="header-title">Recommended for you</span>
      <q-tooltip>Based on your sample data analysis</q-tooltip>
    </div>

    <div class="recommendations-list">
      <div
        v-for="(rec, index) in recommendations"
        :key="index"
        class="recommendation-card"
        @click="selectRecommendation(rec)"
      >
        <div class="card-header">
          <q-icon
            :name="getOperationIcon(rec.operation)"
            size="32px"
            :color="getOperationColor(rec.operation)"
          />
          <div class="card-info">
            <div class="card-title">{{ getOperationLabel(rec.operation) }}</div>
            <div class="confidence-indicator">
              <q-linear-progress
                :value="rec.confidence"
                color="primary"
                size="4px"
              />
              <span class="confidence-text">{{ Math.round(rec.confidence * 100) }}% match</span>
            </div>
          </div>
        </div>
        <div class="card-reason">
          <q-icon name="info" size="14px" class="q-mr-xs" />
          {{ rec.reason }}
        </div>
        <q-btn
          flat
          dense
          color="primary"
          label="Use This"
          size="sm"
          class="use-btn"
          @click.stop="selectRecommendation(rec)"
        />
      </div>
    </div>

    <div class="recommendations-footer">
      <q-btn
        flat
        dense
        color="grey-7"
        label="View All Operations"
        size="sm"
        @click="$emit('view-all')"
      />
    </div>
  </div>
</template>

<script>
import { getOperationTypeIcon, getOperationTypeLabel, getOperationTypeColor } from '../../../utils/operationParser'

export default {
  name: 'SmartRecommendations',
  props: {
    recommendations: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  emits: ['select-recommendation', 'view-all'],
  methods: {
    selectRecommendation (rec) {
      this.$emit('select-recommendation', rec)
    },
    getOperationIcon (type) {
      return getOperationTypeIcon(type)
    },
    getOperationLabel (type) {
      return getOperationTypeLabel(type)
    },
    getOperationColor (type) {
      return getOperationTypeColor(type)
    }
  }
}
</script>

<style lang="scss" scoped>
.smart-recommendations {
  background: rgba(33, 150, 243, 0.05);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.recommendations-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;

  .header-title {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: #2196F3;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(33, 150, 243, 0.08);
    border-color: rgba(33, 150, 243, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    .use-btn {
      opacity: 1;
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #E3F2FD;
  margin-bottom: 4px;
}

.confidence-indicator {
  display: flex;
  align-items: center;
  gap: 8px;

  .confidence-text {
    font-size: 11px;
    color: rgba(227, 242, 253, 0.6);
  }
}

.card-reason {
  font-size: 13px;
  color: rgba(227, 242, 253, 0.7);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.use-btn {
  opacity: 0;
  transition: opacity 150ms;
}

.recommendations-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .smart-recommendations {
    padding: 12px;
  }

  .recommendation-card {
    padding: 10px;
  }

  .card-header {
    gap: 10px;
  }

  .card-title {
    font-size: 14px;
  }

  .use-btn {
    opacity: 1;
  }
}
</style>
