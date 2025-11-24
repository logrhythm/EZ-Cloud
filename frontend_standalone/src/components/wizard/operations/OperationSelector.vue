<template>
  <div class="operation-selector">
    <!-- Toggle Button -->
    <q-btn
      :class="['add-operation-btn', { 'has-operation': currentOperationType }]"
      flat
      no-caps
      @click="openOperationDialog"
      style="background-color: #2196f3; color: #000000; border: 2px solid #2196f3;"
    >
      <q-icon
        name="add"
        size="18px"
        class="q-mr-sm"
      />
      <span>Add Operations</span>
      <q-badge
        v-if="currentOperationType"
        color="primary"
        floating
        class="operation-badge"
      >
        {{ getOperationTypeLabel(currentOperationType) }}
      </q-badge>
    </q-btn>

    <!-- Operations Dialog -->
    <q-dialog v-model="showOperationDialog" persistent>
      <q-card class="operation-dialog-card" style="min-width: 1200px; max-width: 1800px; width: 95vw; height: 90vh;">
        <q-card-section class="row items-center dialog-header">
          <div class="text-h6">Add Operations</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="cancelOperation" />
        </q-card-section>

        <q-separator />

        <q-card-section class="operations-dialog-content">
        <!-- 2x2 Table Layout -->
        <div class="table-layout">
          <!-- Row 1, Column 1: Search + Smart Recommendations -->
          <div class="table-cell search-recommendations-cell">
            <!-- Filter input for searching operations -->
            <q-input
              v-model="operationFilter"
              dense
              outlined
              placeholder="Search operations..."
              class="search-input"
              clearable
              bg-color="whitesmoke"
              color="black"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="xs" color="black" />
              </template>
            </q-input>

            <!-- Smart Recommendations -->
            <smart-recommendations
              v-if="viewMode === 'recommendations' && recommendations.length > 0"
              :recommendations="recommendations"
              @select-recommendation="handleRecommendationSelection"
              @view-all="handleViewAll"
            />

            <!-- Show empty state if no recommendations -->
            <div v-else-if="viewMode === 'recommendations'" class="no-recommendations">
              <q-icon name="info_outline" size="32px" color="grey-6" />
              <p>No recommendations available</p>
              <q-btn flat dense color="primary" label="View All Operations" size="sm" @click="handleViewAll" />
            </div>
          </div>

          <!-- Row 1, Column 2: Configuration Section -->
          <div class="table-cell config-cell">
            <div v-if="tempOperationType" class="config-section">
              <div class="section-header">
                <q-icon name="settings" size="20px" color="primary" />
                <span class="section-title">Configuration</span>
              </div>
              <div class="config-forms-wrapper">
                <!-- REGEX Configuration -->
                <regex-operation-config
                  v-if="tempOperationType === OPERATION_TYPES.REGEX"
                  v-model="tempOperationParameters"
                  :field-path="fieldPath"
                  :sample-value="sampleValue"
                  @update:model-value="handleParametersChange"
                />

                <!-- LookUp Configuration -->
                <lookup-operation-config
                  v-if="tempOperationType === OPERATION_TYPES.LOOKUP || tempOperationType === OPERATION_TYPES.LOOKUP_STARTS_WITH"
                  v-model="tempOperationParameters"
                  :field-path="fieldPath"
                  :sample-value="sampleValue"
                  :operation-type="tempOperationType"
                  @update:model-value="handleParametersChange"
                />

                <!-- PREFIX Configuration -->
                <prefix-operation-config
                  v-if="tempOperationType === OPERATION_TYPES.PREFIX"
                  v-model="tempOperationParameters"
                  :sample-value="sampleValue"
                  @update:model-value="handleParametersChange"
                />

                <!-- IsIP Configuration -->
                <is-ip-operation-config
                  v-if="tempOperationType === OPERATION_TYPES.ISIP"
                  v-model="tempOperationParameters"
                  :field-path="fieldPath"
                  :sample-value="sampleValue"
                  @update:model-value="handleParametersChange"
                />

                <!-- SPLIT Configuration -->
                <split-operation-config
                  v-if="tempOperationType === OPERATION_TYPES.SPLIT"
                  v-model="tempOperationParameters"
                  :field-path="fieldPath"
                  :sample-value="sampleValue"
                  @update:model-value="handleParametersChange"
                />

                <!-- Concat/ConcatArray Configuration -->
                <concat-operation-config
                  v-if="tempOperationType === OPERATION_TYPES.CONCAT || tempOperationType === OPERATION_TYPES.CONCATARRAY"
                  v-model="tempOperationParameters"
                  :field-path="fieldPath"
                  :sample-value="sampleValue"
                  :operation-type="tempOperationType"
                  @update:model-value="handleParametersChange"
                />

                <!-- ToString Configuration -->
                <to-string-operation-config
                  v-if="tempOperationType === OPERATION_TYPES.TOSTRING"
                  v-model="tempOperationParameters"
                  :field-path="fieldPath"
                  :sample-value="sampleValue"
                  @update:model-value="handleParametersChange"
                />

                <!-- DateTime Operations Configuration -->
                <epoch-date-time-config
                  v-if="tempOperationType === OPERATION_TYPES.EPOCHSECS_TO_DATETIME ||
                        tempOperationType === OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME ||
                        tempOperationType === OPERATION_TYPES.EPOCHMICROS_TO_DATETIME ||
                        tempOperationType === OPERATION_TYPES.LOCAL_DATETIME"
                  v-model="tempOperationParameters"
                  :field-path="fieldPath"
                  :sample-value="sampleValue"
                  :operation-type="tempOperationType"
                  @update:model-value="handleParametersChange"
                />

                <!-- Math Operations Configuration -->
                <math-operation-config
                  v-if="tempOperationType === OPERATION_TYPES.ADD ||
                        tempOperationType === OPERATION_TYPES.SUBTRACT ||
                        tempOperationType === OPERATION_TYPES.MULTIPLY ||
                        tempOperationType === OPERATION_TYPES.DIVIDE"
                  v-model="tempOperationParameters"
                  :field-path="fieldPath"
                  :sample-value="sampleValue"
                  :operation-type="tempOperationType"
                  @update:model-value="handleParametersChange"
                />
              </div>
            </div>
            <div v-else class="config-placeholder">
              <q-icon name="tune" size="48px" color="grey-6" />
              <p>Select an operation to configure</p>
            </div>
          </div>

          <!-- Row 2, Column 1: Operations Selection List -->
          <div class="table-cell operations-cell">
            <div class="operations-section">
              <!-- Tabs for operation categories -->
              <q-tabs
                v-model="operationCategory"
                dense
                class="operation-category-tabs"
                align="justify"
                active-color="primary"
                indicator-color="primary"
              >
                <q-tab name="all" label="All" />
                <q-tab name="String" label="String" />
                <q-tab name="Array" label="Array" />
                <q-tab name="Date/Time" label="Date/Time" />
                <q-tab name="Number/Decimal" label="Number" />
              </q-tabs>

              <!-- Operations List Container with Scrollbar -->
              <div class="operations-list-container">
              <!-- None Option -->
              <q-radio
              v-if="showOperation(null)"
              v-model="tempOperationType"
              :val="null"
              class="operation-radio"
              color="primary"
              @update:model-value="handleOperationTypeChange"
            >
              <template #default>
                <div class="operation-option">
                  <div class="option-header">
                    <q-icon name="remove_circle_outline" size="24px" color="grey-6" />
                    <div class="option-text">
                      <div class="option-label">None - Use field as-is</div>
                      <div class="option-description">
                        No transformation applied. Maps the field value directly.
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </q-radio>

            <!-- String Operations Section -->
            <template v-if="operationCategory === 'all' || operationCategory === 'String'">
              <!-- REGEX Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.REGEX)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.REGEX"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="code" size="24px" :color="getOperationColor(OPERATION_TYPES.REGEX)" />
                      <div class="option-text">
                        <div class="option-label">REGEX - Extract using regular expression</div>
                        <div class="option-description">
                          Extract data using pattern matching with regular expressions
                        </div>
                        <div class="option-example">
                          Example: Extract IP from "Connection from 192.168.1.1"
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>

              <!-- IsIP Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.ISIP)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.ISIP"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="lan" size="24px" :color="getOperationColor(OPERATION_TYPES.ISIP)" />
                      <div class="option-text">
                        <div class="option-label">IsIP - Validate IP address</div>
                        <div class="option-description">
                          Validates if a value is an IP address
                        </div>
                        <div class="option-example">
                          Example: Check if "192.168.1.1" is a valid IP
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>

              <!-- SPLIT Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.SPLIT)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.SPLIT"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="call_split" size="24px" :color="getOperationColor(OPERATION_TYPES.SPLIT)" />
                      <div class="option-text">
                        <div class="option-label">SPLIT - Split string by delimiter</div>
                        <div class="option-description">
                          Splits a string by a delimiter and returns a specific index
                        </div>
                        <div class="option-example">
                          Example: Split "key=value" by "=" and get index 1 → "value"
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>

              <!-- PREFIX Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.PREFIX)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.PREFIX"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="text_fields" size="24px" :color="getOperationColor(OPERATION_TYPES.PREFIX)" />
                      <div class="option-text">
                        <div class="option-label">PREFIX - Add prefix to value</div>
                        <div class="option-description">
                          Add a static prefix to field values
                        </div>
                        <div class="option-example">
                          Example: Add "SERVER-" to ID → "SERVER-12345"
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>

              <!-- LookUp Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.LOOKUP)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.LOOKUP"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="table_chart" size="24px" :color="getOperationColor(OPERATION_TYPES.LOOKUP)" />
                      <div class="option-text">
                        <div class="option-label">LookUp - Lookup value from table</div>
                        <div class="option-description">
                          Look up and transform values using predefined tables
                        </div>
                        <div class="option-example">
                          Example: Convert status code 200 to "OK"
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>

              <!-- LookUpStartsWith Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.LOOKUP_STARTS_WITH)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.LOOKUP_STARTS_WITH"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="search" size="24px" :color="getOperationColor(OPERATION_TYPES.LOOKUP_STARTS_WITH)" />
                      <div class="option-text">
                        <div class="option-label">LookUpStartsWith - Prefix-based lookup</div>
                        <div class="option-description">
                          Look up values using prefix matching
                        </div>
                        <div class="option-example">
                          Example: Find entries starting with "ERR"
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>
            </template>

            <!-- Array Operations Section -->
            <template v-if="operationCategory === 'all' || operationCategory === 'Array'">
              <!-- Concat Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.CONCAT)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.CONCAT"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="add_link" size="24px" :color="getOperationColor(OPERATION_TYPES.CONCAT)" />
                      <div class="option-text">
                        <div class="option-label">Concat - Join string values</div>
                        <div class="option-description">
                          Concatenates two or more string values
                        </div>
                        <div class="option-example">
                          Example: Join "Hello" + " " + "World" → "Hello World"
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>

              <!-- ConcatArray Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.CONCATARRAY)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.CONCATARRAY"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="merge_type" size="24px" :color="getOperationColor(OPERATION_TYPES.CONCATARRAY)" />
                      <div class="option-text">
                        <div class="option-label">ConcatArray - Join array elements</div>
                        <div class="option-description">
                          Joins array elements with a delimiter
                        </div>
                        <div class="option-example">
                          Example: Join ["a", "b", "c"] with "," → "a,b,c"
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>
            </template>

            <!-- Type Conversion Section -->
            <template v-if="operationCategory === 'all'">
              <!-- ToString Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.TOSTRING)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.TOSTRING"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="text_fields" size="24px" :color="getOperationColor(OPERATION_TYPES.TOSTRING)" />
                      <div class="option-text">
                        <div class="option-label">ToString - Convert to String</div>
                        <div class="option-description">
                          Converts a value to a String
                        </div>
                        <div class="option-example">
                          Example: Convert 123 to "123"
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>
            </template>

            <!-- Date/Time Operations Section -->
            <template v-if="operationCategory === 'all' || operationCategory === 'Date/Time'">
              <!-- EpochSectoDateTime Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.EPOCHSECS_TO_DATETIME)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.EPOCHSECS_TO_DATETIME"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="schedule" size="24px" :color="getOperationColor(OPERATION_TYPES.EPOCHSECS_TO_DATETIME)" />
                      <div class="option-text">
                        <div class="option-label">EpochSectoDateTime - Convert Unix seconds</div>
                        <div class="option-description">
                          Converts Unix timestamp (seconds) to DateTime
                        </div>
                        <div class="option-example">
                          Example: Convert 1634567890 to "2021-10-18 15:04:50"
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>

              <!-- EpochMilliSectoDateTime Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="schedule" size="24px" :color="getOperationColor(OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME)" />
                      <div class="option-text">
                        <div class="option-label">EpochMilliSectoDateTime - Convert Unix milliseconds</div>
                        <div class="option-description">
                          Converts Unix timestamp (milliseconds) to DateTime
                        </div>
                        <div class="option-example">
                          Example: Convert 1634567890000 to "2021-10-18 15:04:50"
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>

              <!-- EpochMicroSectoDateTime Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.EPOCHMICROS_TO_DATETIME)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.EPOCHMICROS_TO_DATETIME"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="schedule" size="24px" :color="getOperationColor(OPERATION_TYPES.EPOCHMICROS_TO_DATETIME)" />
                      <div class="option-text">
                        <div class="option-label">EpochMicroSectoDateTime - Convert Unix microseconds</div>
                        <div class="option-description">
                          Converts Unix timestamp (microseconds) to DateTime
                        </div>
                        <div class="option-example">
                          Example: Convert 1634567890000000 to "2021-10-18 15:04:50"
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>

              <!-- LocalDateTime Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.LOCAL_DATETIME)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.LOCAL_DATETIME"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="today" size="24px" :color="getOperationColor(OPERATION_TYPES.LOCAL_DATETIME)" />
                      <div class="option-text">
                        <div class="option-label">LocalDateTime - Get local date-time</div>
                        <div class="option-description">
                          Gets the local date-time
                        </div>
                        <div class="option-example">
                          Example: Current time → "2023-11-20 10:30:45"
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>
            </template>

            <!-- Number Operations Section -->
            <template v-if="operationCategory === 'all' || operationCategory === 'Number/Decimal'">
              <!-- Add Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.ADD)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.ADD"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="add" size="24px" :color="getOperationColor(OPERATION_TYPES.ADD)" />
                      <div class="option-text">
                        <div class="option-label">Add - Add a number</div>
                        <div class="option-description">
                          Adds a number to a JSON value
                        </div>
                        <div class="option-example">
                          Example: 100 + 50 → 150
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>

              <!-- Subtract Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.SUBTRACT)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.SUBTRACT"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="remove" size="24px" :color="getOperationColor(OPERATION_TYPES.SUBTRACT)" />
                      <div class="option-text">
                        <div class="option-label">Subtract - Subtract a number</div>
                        <div class="option-description">
                          Subtracts a number from a JSON value
                        </div>
                        <div class="option-example">
                          Example: 100 - 50 → 50
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>

              <!-- Multiply Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.MULTIPLY)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.MULTIPLY"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="close" size="24px" :color="getOperationColor(OPERATION_TYPES.MULTIPLY)" />
                      <div class="option-text">
                        <div class="option-label">Multiply - Multiply by a number</div>
                        <div class="option-description">
                          Multiplies a JSON value by a number
                        </div>
                        <div class="option-example">
                          Example: 100 * 2 → 200
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>

              <!-- Divide Option -->
              <q-radio
                v-if="showOperation(OPERATION_TYPES.DIVIDE)"
                v-model="tempOperationType"
                :val="OPERATION_TYPES.DIVIDE"
                class="operation-radio"
                color="primary"
                @update:model-value="handleOperationTypeChange"
              >
                <template #default>
                  <div class="operation-option">
                    <div class="option-header">
                      <q-icon name="unfold_less" size="24px" :color="getOperationColor(OPERATION_TYPES.DIVIDE)" />
                      <div class="option-text">
                        <div class="option-label">Divide - Divide by a number</div>
                        <div class="option-description">
                          Divides a JSON value by a number
                        </div>
                        <div class="option-example">
                          Example: 100 / 2 → 50
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-radio>
            </template>
              </div>
              <!-- End Operations List Container -->
            </div>
          </div>

          <!-- Row 2, Column 2: Live Preview -->
          <div class="table-cell preview-cell">
            <div class="preview-section">
              <live-preview
                :operation-type="tempOperationType"
                :parameters="tempOperationParameters"
                :sample-value="sampleValue"
                :field-path="fieldPath"
              />
            </div>
          </div>
        </div>
        <!-- End 2x2 Table Layout -->
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="dialog-footer">
          <q-btn
            v-if="tempOperationType"
            flat
            color="negative"
            icon="clear"
            label="Clear Operation"
            @click="clearOperation"
            no-caps
          />
          <q-space />
          <q-btn
            flat
            label="Cancel"
            color="grey"
            @click="cancelOperation"
            no-caps
          />
          <q-btn
            unelevated
            label="Apply Operation"
            color="primary"
            icon="check"
            @click="applyOperation"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { OPERATION_TYPES, OPERATION_METADATA } from '../../../constants/operations'
import { getOperationTypeLabel, getOperationTypeColor } from '../../../utils/operationParser'
import { analyzeFieldAndRecommend, getFieldType } from '../../../utils/operationRecommendations'
import SmartRecommendations from './SmartRecommendations.vue'
import LivePreview from './LivePreview.vue'
import RegexOperationConfig from './RegexOperationConfig.vue'
import LookupOperationConfig from './LookupOperationConfig.vue'
import PrefixOperationConfig from './PrefixOperationConfig.vue'
import IsIPOperationConfig from './IsIPOperationConfig.vue'
import SplitOperationConfig from './SplitOperationConfig.vue'
import ConcatOperationConfig from './ConcatOperationConfig.vue'
import ToStringOperationConfig from './ToStringOperationConfig.vue'
import EpochDateTimeConfig from './EpochDateTimeConfig.vue'
import MathOperationConfig from './MathOperationConfig.vue'

export default {
  name: 'OperationSelector',
  components: {
    SmartRecommendations,
    LivePreview,
    'regex-operation-config': RegexOperationConfig,
    'lookup-operation-config': LookupOperationConfig,
    'prefix-operation-config': PrefixOperationConfig,
    // eslint-disable-next-line vue/no-unused-components
    'is-ip-operation-config': IsIPOperationConfig,
    'split-operation-config': SplitOperationConfig,
    'concat-operation-config': ConcatOperationConfig,
    'to-string-operation-config': ToStringOperationConfig,
    'epoch-date-time-config': EpochDateTimeConfig,
    'math-operation-config': MathOperationConfig
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        type: null,
        parameters: {}
      })
    },
    fieldPath: {
      type: String,
      required: true
    },
    sampleValue: {
      type: [String, Number, Object],
      default: null
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const showOperationDialog = ref(false)
    const selectedOperationType = ref(props.modelValue?.type || null)
    const operationParameters = ref(props.modelValue?.parameters || {})

    // Store temporary state while dialog is open
    const tempOperationType = ref(null)
    const tempOperationParameters = ref({})

    // Operation filtering and categorization
    const operationFilter = ref('')
    const operationCategory = ref('all')

    // Smart Recommendations
    const recommendations = ref([])
    const viewMode = ref('recommendations') // 'recommendations' or 'all'

    // Computed
    const currentOperationType = computed(() => selectedOperationType.value)

    // Methods
    const openOperationDialog = () => {
      // Copy current values to temporary state
      tempOperationType.value = selectedOperationType.value
      tempOperationParameters.value = JSON.parse(JSON.stringify(operationParameters.value))

      // Generate smart recommendations
      generateRecommendations()

      showOperationDialog.value = true
    }

    const generateRecommendations = () => {
      try {
        const fieldType = getFieldType(props.sampleValue)
        recommendations.value = analyzeFieldAndRecommend(
          props.fieldPath,
          props.sampleValue,
          fieldType
        )
        // Show recommendations view if we have recommendations
        viewMode.value = recommendations.value.length > 0 ? 'recommendations' : 'all'
      } catch (error) {
        console.error('[OperationSelector] Error generating recommendations:', error)
        recommendations.value = []
        viewMode.value = 'all'
      }
    }

    const handleRecommendationSelection = (recommendation) => {
      // Set the operation type
      tempOperationType.value = recommendation.operation

      // Set suggested parameters
      tempOperationParameters.value = recommendation.suggestedParams || {}

      // Switch to all operations view to show the configuration panel
      viewMode.value = 'all'
    }

    const handleViewAll = () => {
      viewMode.value = 'all'
    }

    const cancelOperation = () => {
      // Discard temporary changes
      showOperationDialog.value = false
    }

    const applyOperation = () => {
      // Apply temporary changes to actual state
      selectedOperationType.value = tempOperationType.value
      operationParameters.value = tempOperationParameters.value
      emitChange()
      showOperationDialog.value = false
    }

    const getOperationColor = (type) => {
      return getOperationTypeColor(type)
    }

    const handleOperationTypeChange = (newType) => {
      // Update temporary state (dialog is open)
      tempOperationType.value = newType

      // Reset parameters when operation type changes
      tempOperationParameters.value = {}

      // Set default parameters based on operation type
      if (newType === OPERATION_TYPES.REGEX) {
        tempOperationParameters.value = {
          pattern: '',
          captureGroup: 1
        }
      } else if (newType === OPERATION_TYPES.LOOKUP || newType === OPERATION_TYPES.LOOKUP_STARTS_WITH) {
        tempOperationParameters.value = {
          tableName: ''
        }
      } else if (newType === OPERATION_TYPES.PREFIX) {
        tempOperationParameters.value = {
          prefix: ''
        }
      } else if (newType === OPERATION_TYPES.ISIP) {
        // IsIP has no parameters
        tempOperationParameters.value = {}
      } else if (newType === OPERATION_TYPES.SPLIT) {
        tempOperationParameters.value = {
          delimiter: '',
          index: 0
        }
      } else if (newType === OPERATION_TYPES.CONCAT) {
        tempOperationParameters.value = {
          values: ['', '']
        }
      } else if (newType === OPERATION_TYPES.CONCATARRAY) {
        tempOperationParameters.value = {
          delimiter: ','
        }
      } else if (newType === OPERATION_TYPES.TOSTRING) {
        // ToString has no parameters
        tempOperationParameters.value = {}
      } else if (newType === OPERATION_TYPES.EPOCHSECS_TO_DATETIME ||
                 newType === OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME ||
                 newType === OPERATION_TYPES.EPOCHMICROS_TO_DATETIME ||
                 newType === OPERATION_TYPES.LOCAL_DATETIME) {
        tempOperationParameters.value = {
          format: 'yyyy-MM-dd HH:mm:ss.SSS'
        }
      } else if (newType === OPERATION_TYPES.ADD ||
                 newType === OPERATION_TYPES.SUBTRACT ||
                 newType === OPERATION_TYPES.MULTIPLY ||
                 newType === OPERATION_TYPES.DIVIDE) {
        tempOperationParameters.value = {
          value: 0
        }
      }
    }

    const handleParametersChange = (newParams) => {
      // Update temporary parameters (dialog is open)
      tempOperationParameters.value = newParams
    }

    const emitChange = () => {
      emit('update:modelValue', {
        type: selectedOperationType.value,
        parameters: operationParameters.value
      })
    }

    const clearOperation = () => {
      // Clear temporary state in dialog
      tempOperationType.value = null
      tempOperationParameters.value = {}
    }

    /**
     * Filter operations based on search query and category
     * @param {string} type - Operation type to check
     * @returns {boolean} - Whether to show the operation
     */
    const showOperation = (type) => {
      // If no type (the "None" option), always show except when filtering
      if (type === null) {
        return operationFilter.value === ''
      }

      // Get metadata for the operation type
      const metadata = OPERATION_METADATA[type]
      if (!metadata) return false

      // Check if operation matches current category
      const categoryMatch =
        operationCategory.value === 'all' ||
        metadata.category === operationCategory.value

      // Check if operation matches search query (when provided)
      const filterMatch = !operationFilter.value ||
        metadata.label.toLowerCase().includes(operationFilter.value.toLowerCase()) ||
        metadata.description.toLowerCase().includes(operationFilter.value.toLowerCase())

      return categoryMatch && filterMatch
    }

    // Watch for external changes to modelValue
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        selectedOperationType.value = newVal.type || null
        operationParameters.value = newVal.parameters || {}
      }
    }, { deep: true })

    return {
      OPERATION_TYPES,
      showOperationDialog,
      selectedOperationType,
      operationParameters,
      tempOperationType,
      tempOperationParameters,
      operationFilter,
      operationCategory,
      recommendations,
      viewMode,
      currentOperationType,
      openOperationDialog,
      cancelOperation,
      applyOperation,
      getOperationTypeLabel,
      getOperationColor,
      handleOperationTypeChange,
      handleParametersChange,
      clearOperation,
      showOperation,
      handleRecommendationSelection,
      handleViewAll
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-selector {
  margin-top: 16px;
}

.add-operation-btn {
  width: 100%;
  height: 44px;
  padding: 12px 16px;
  border: 2px dashed #2196f3;
  border-radius: 6px;
  background: transparent;
  color: #2196f3;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.25px;
  transition: all 150ms ease-in-out;

  &:hover {
    background: rgba(33, 150, 243, 0.08);
    border: 2px solid #2196f3;
    transform: translateY(-1px);
  }

  &.has-operation {
    background: rgba(33, 150, 243, 0.15);
    border: 2px solid #2196f3;
    color: #2196f3;
  }

  .operation-badge {
    font-size: 10px;
    padding: 2px 6px;
  }
}

/* Dialog Styles */
.operation-dialog-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  background: var(--q-color-grey-10);
  color: #E3F2FD;
  padding: 16px 20px;
  flex-shrink: 0;
}

.operations-dialog-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 20px !important;
}

.dialog-footer {
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.02);
}

/* 2x2 Table Layout */
.table-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 16px;
  flex: 1;
  overflow: hidden;
  height: 100%;
  min-height: 600px;
}

.table-cell {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
}

/* Row 1, Column 1: Search + Recommendations */
.search-recommendations-cell {
  grid-column: 1;
  grid-row: 1;
}

.search-input {
  margin-bottom: 16px;

  /* Force whitesmoke background and black text - using :deep() with higher specificity */
  :deep(.q-field__control) {
    background: whitesmoke !important;
    background-color: whitesmoke !important;
  }

  :deep(.q-field__native),
  :deep(.q-field__input),
  :deep(input) {
    color: #000000 !important;
    background-color: transparent !important;
  }

  /* Placeholder styling */
  :deep(input::placeholder) {
    color: rgba(0, 0, 0, 0.5) !important;
  }

  /* Search icon in prepend slot */
  :deep(.q-field__prepend .q-icon) {
    color: #000000 !important;
  }

  /* Clear button in append slot */
  :deep(.q-field__append .q-icon) {
    color: rgba(0, 0, 0, 0.7) !important;
  }

  /* Ensure border color is visible */
  :deep(.q-field__control::before),
  :deep(.q-field__control::after) {
    border-color: rgba(0, 0, 0, 0.24) !important;
  }
}

.no-recommendations {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  color: rgba(227, 242, 253, 0.6);
  text-align: center;

  p {
    margin: 0;
    font-size: 14px;
  }
}

/* Row 1, Column 2: Configuration */
.config-cell {
  grid-column: 2;
  grid-row: 1;
}

.config-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.section-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #E3F2FD;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.config-forms-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(33, 150, 243, 0.5);
    border-radius: 4px;

    &:hover {
      background: rgba(33, 150, 243, 0.7);
    }
  }
}

.config-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;
  color: rgba(227, 242, 253, 0.4);

  p {
    margin: 0;
    font-size: 14px;
    font-style: italic;
  }
}

/* Row 2, Column 1: Operations List */
.operations-cell {
  grid-column: 1;
  grid-row: 2;
}

.operations-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.operation-category-tabs {
  background: rgba(0, 0, 0, 0.3) !important;
  border-radius: 4px;
  margin-bottom: 12px;
  flex-shrink: 0;

  ::v-deep .q-tab {
    color: rgba(227, 242, 253, 0.7);

    &--active {
      color: #2196F3;
    }
  }

  ::v-deep .q-tabs__content {
    background: transparent;
  }
}

.operations-list-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  /* Custom scrollbar styling */
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

/* Row 2, Column 2: Live Preview */
.preview-cell {
  grid-column: 2;
  grid-row: 2;
}

.preview-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  /* Remove the extra margin from LivePreview component */
  ::v-deep .live-preview-panel {
    margin-top: 0;
    height: 100%;
  }
}

.operation-radio {
  padding: 12px;
  border-radius: 6px;
  transition: all 150ms ease-in-out;
  cursor: pointer;

  &:hover {
    background: rgba(33, 150, 243, 0.08);
  }

  ::v-deep .q-radio__inner {
    color: #2196f3;
  }

  ::v-deep .q-radio__label {
    width: 100%;
  }
}

.operation-option {
  width: 100%;
  margin-left: 8px;
}

.option-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.option-text {
  flex: 1;
}

.option-label {
  font-size: 15px;
  font-weight: 600;
  color: #E3F2FD;
  margin-bottom: 4px;
}

.option-description {
  font-size: 13px;
  color: rgba(227, 242, 253, 0.7);
  margin-bottom: 4px;
}

.option-example {
  font-size: 12px;
  color: #2196f3;
  font-style: italic;
  margin-top: 4px;
}

/* Force whitesmoke background on ALL input controls inside operation dialog - Match mapping popup style */
.operation-dialog-card {
  /* Target all q-field controls (q-input, q-select, etc.) */
  :deep(.q-field__control) {
    background: whitesmoke !important;
    background-color: whitesmoke !important;
    border: 1px solid rgba(0, 0, 0, 0.24) !important;
  }

  /* Target all native inputs, textareas, and input elements */
  :deep(.q-field__native),
  :deep(.q-field__input),
  :deep(input),
  :deep(textarea),
  :deep(input[type="text"]),
  :deep(input[type="number"]) {
    color: #000000 !important;
    background-color: transparent !important;
  }

  /* Labels (floating labels) */
  :deep(.q-field__label) {
    color: rgba(0, 0, 0, 0.6) !important;
  }

  /* Labels when field is focused */
  :deep(.q-field--focused .q-field__label) {
    color: var(--q-color-primary) !important;
  }

  /* Dropdown icon for q-select */
  :deep(.q-select__dropdown-icon) {
    color: var(--q-color-primary) !important;
  }

  /* Selected value display area in q-select */
  :deep(.q-field__native > span:not(.q-chip)) {
    color: #000000 !important;
  }

  /* Placeholder text for all input types */
  :deep(input::placeholder),
  :deep(textarea::placeholder),
  :deep(.q-field__input::placeholder) {
    color: rgba(0, 0, 0, 0.5) !important;
    opacity: 1 !important;
  }

  /* Icons in prepend and append slots */
  :deep(.q-field__prepend .q-icon),
  :deep(.q-field__append .q-icon) {
    color: rgba(0, 0, 0, 0.7) !important;
  }

  /* Border colors for outlined fields */
  :deep(.q-field__control::before),
  :deep(.q-field__control::after) {
    border-color: rgba(0, 0, 0, 0.24) !important;
  }

  /* Focused state border */
  :deep(.q-field--focused .q-field__control::after) {
    border-color: var(--q-color-primary) !important;
  }

  /* Error state border */
  :deep(.q-field--error .q-field__control::before),
  :deep(.q-field--error .q-field__control::after) {
    border-color: var(--q-color-negative) !important;
  }

  /* Number input spin buttons */
  :deep(input[type="number"]::-webkit-inner-spin-button),
  :deep(input[type="number"]::-webkit-outer-spin-button) {
    opacity: 1 !important;
  }

  /* Hints and error messages */
  :deep(.q-field__messages) {
    color: rgba(227, 242, 253, 0.7) !important;
  }

  :deep(.q-field__messages--error) {
    color: var(--q-color-negative) !important;
  }

  /* Specific targeting for config components that use bg-color="white" prop */
  :deep(.split-operation-config .q-field__control),
  :deep(.math-operation-config .q-field__control),
  :deep(.concat-operation-config .q-field__control),
  :deep(.epoch-datetime-config .q-field__control) {
    background: whitesmoke !important;
    background-color: whitesmoke !important;
  }
}

/* Override dark theme globally for this dialog - ensure whitesmoke styling persists */
body.body--dark .operation-dialog-card,
.body--dark .operation-dialog-card {
  /* Target all q-field controls */
  :deep(.q-field__control) {
    background: whitesmoke !important;
    background-color: whitesmoke !important;
    border: 1px solid rgba(0, 0, 0, 0.24) !important;
  }

  /* Target all inputs */
  :deep(.q-field__native),
  :deep(.q-field__input),
  :deep(input),
  :deep(textarea),
  :deep(input[type="text"]),
  :deep(input[type="number"]) {
    color: #000000 !important;
    background-color: transparent !important;
  }

  /* Labels */
  :deep(.q-field__label) {
    color: rgba(0, 0, 0, 0.6) !important;
  }

  /* Placeholder text */
  :deep(input::placeholder),
  :deep(textarea::placeholder),
  :deep(.q-field__input::placeholder) {
    color: rgba(0, 0, 0, 0.5) !important;
    opacity: 1 !important;
  }

  /* Icons */
  :deep(.q-field__prepend .q-icon),
  :deep(.q-field__append .q-icon) {
    color: rgba(0, 0, 0, 0.7) !important;
  }

  /* Dropdown icon */
  :deep(.q-select__dropdown-icon) {
    color: var(--q-color-primary) !important;
  }

  /* Border colors */
  :deep(.q-field__control::before),
  :deep(.q-field__control::after) {
    border-color: rgba(0, 0, 0, 0.24) !important;
  }

  /* Focused state */
  :deep(.q-field--focused .q-field__label) {
    color: var(--q-color-primary) !important;
  }

  :deep(.q-field--focused .q-field__control::after) {
    border-color: var(--q-color-primary) !important;
  }
}

@media (max-width: 1200px) {
  .table-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    min-height: auto;
  }

  .search-recommendations-cell {
    grid-column: 1;
    grid-row: 1;
  }

  .operations-cell {
    grid-column: 1;
    grid-row: 2;
    max-height: 400px;
  }

  .config-cell {
    grid-column: 1;
    grid-row: 3;
  }

  .preview-cell {
    grid-column: 1;
    grid-row: 4;
  }
}

@media (max-width: 768px) {
  .operation-dialog-card {
    min-width: 95vw !important;
    width: 95vw !important;
    max-width: 95vw !important;
    height: 95vh !important;
  }

  .operations-dialog-content {
    padding: 12px !important;
  }

  .table-layout {
    gap: 12px;
  }

  .table-cell {
    padding: 12px;
  }

  .operation-option {
    margin-left: 0;
  }

  .option-header {
    flex-direction: column;
    gap: 8px;
  }

  .option-label {
    font-size: 14px;
  }

  .option-description,
  .option-example {
    font-size: 12px;
  }

  .dialog-footer {
    flex-wrap: wrap;
    gap: 8px;

    .q-btn {
      flex: 1 1 auto;
      min-width: 100px;
    }
  }
}
</style>

<style lang="scss">
/* Global styles for dropdown menus from operation dialog (non-scoped to affect q-menu) */

/*
  CRITICAL FIX: Universal dropdown menu styling for all q-select components
  This ensures dropdown text is ALWAYS visible regardless of theme
*/
.q-menu {
  /* High-contrast styling for ALL dropdown menus */
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;

  /* Ensure all items are visible and clickable */
  .q-item {
    color: #212121 !important; /* Dark text on white background */
    background: transparent !important;
    cursor: pointer !important;
    pointer-events: auto !important;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(33, 150, 243, 0.08) !important; /* Light blue hover */
    }

    &.q-item--active,
    &--active {
      background: rgba(33, 150, 243, 0.12) !important; /* Slightly darker blue for active */
    }
  }

  /* Item label text styling */
  .q-item__label {
    color: #212121 !important; /* Ensure label is always dark */
  }

  /* Caption/description text styling */
  .q-item__label--caption {
    color: rgba(0, 0, 0, 0.6) !important; /* Gray caption text */
  }

  /* Scrollbar styling for long dropdowns */
  .q-virtual-scroll__content,
  .q-list {
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(33, 150, 243, 0.4);
      border-radius: 4px;

      &:hover {
        background: rgba(33, 150, 243, 0.6);
      }
    }
  }
}

/* Dark theme support - different styling for dark mode if needed in future */
body.body--dark .q-menu,
.body--dark .q-menu {
  /* Keep same high-contrast approach for dark mode */
  background: #2d2d2d !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;

  .q-item {
    color: #e3f2fd !important;
    background: transparent !important;

    &:hover {
      background: rgba(33, 150, 243, 0.15) !important;
    }

    &.q-item--active,
    &--active {
      background: rgba(33, 150, 243, 0.2) !important;
    }
  }

  .q-item__label {
    color: #e3f2fd !important;
  }

  .q-item__label--caption {
    color: rgba(227, 242, 253, 0.6) !important;
  }
}
</style>
