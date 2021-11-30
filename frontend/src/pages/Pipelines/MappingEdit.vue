<template>
  <q-page class="q-pa-sm">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
<!--
        - Pipeline Builder - move actions to menu / icon bar (including Settings icon/button)
        -- Return (to list / to Properties)
        -- ----
        -- Save
        -- Revert to last saved
        -- ----
        -- Tail
        -- Enter log sample manually
        -- ----
        -- Process in background
        -- ----
        -- Export JQ Pipeline
        -- Show JQ output
        -- ----
        -- Settings
        --- Show types (main list)
        --- Show types (popups)
        --- Accept and Wrap single string logs
        --- Extract/queue in Filebeat '.message' only
        --- Background Process: max MPS
        --- Max messages in Queue In
        --- Max messages in Processed Logs
 -->
        <q-btn no-caps flat dense icon="arrow_back" label="Return to Properties" :to="'/Pipelines/' + this.pipelineUid + '/Properties'" />
        <q-separator vertical />
        <q-btn no-caps flat dense icon="save" label="Save" color="primary" :disabled="!needsSaving" @click="save()" />
        <q-btn no-caps flat dense icon="restore" label="Reverse to last saved" @click="reverseToLastSaved()" />
        <q-separator vertical />
        <q-btn no-caps flat dense icon="play_circle_outline" label="Start Live Tail" color="secondary" @click="tailEnabled = true" v-if="!tailEnabled" />
        <q-btn no-caps flat dense icon="stop" label="Stop Live Tail" @click="tailEnabled = false" v-else />
        <q-btn no-caps flat dense icon="playlist_add" label="Manual Import" @click="showManualImport = true" v-if="!showManualImport" />
        <q-btn no-caps flat dense icon="visibility_off" label="Manual Import" @click="showManualImport = false" v-else />
        <q-separator vertical />
        <q-btn no-caps flat dense icon="search" label="Start background processing" color="secondary" @click="processInBackground = true" v-if="!processInBackground" />
        <q-btn no-caps flat dense icon="search_off" label="Stop background processing" @click="processInBackground = false" v-else />
        <q-separator vertical />
        <q-btn no-caps flat dense icon="file_download" label="Export JQ" disable />
        <q-btn no-caps flat dense icon="visibility" label="Show JQ" v-if="!showJqOutput" @click="buildJqFilter(); buildJqTransform(); showJqOutput = true" />
        <q-btn no-caps flat dense icon="visibility_off" label="Hide JQ output" v-else @click="showJqOutput = false" />

        <q-toolbar-title style="opacity:.4" class="text-center">Mapping Builder<span v-if="pipelineName && pipelineName.length">:  {{ pipelineName }}</span></q-toolbar-title>

        <q-btn no-caps flat dense icon="pending" label="Advanced">
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">Advanced</div>
                <q-toggle v-model="showExtraDetails" label="Show extra details" />
                <q-toggle v-model="showQueues" label="Show Queues" />
                <q-toggle v-model="showCommunicationLog" label="Show Communication &amp; Shipper's Logs" />
              </div>
            </div>
          </q-menu>
        </q-btn>
        <q-btn no-caps flat dense icon="settings" label="Settings">
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">Settings</div>
                <q-item class="q-pl-none" >
                <q-toggle v-model="showTypesInMainList" label="Show types in Fields list" />
                </q-item>
                <q-item class="q-pl-none" >
                <q-toggle v-model="showTypesInPopup" label="Show types in Value popups" />
                </q-item>
                <q-item class="q-pl-none" >
                <q-toggle v-model="wrapSingleStringLog" label="Accept and Wrap non-JSON logs" />
                </q-item>
                <q-item class="q-pl-none" >
                  <q-toggle v-model="extractMessageFieldOnly" label="Extract Beat's '.message' only" />
                </q-item>
                <q-item  style="width: 20rem;">
                  <q-item-section avatar>
                    <q-icon name="speed" />
                  </q-item-section>
                  <q-item-section>
                    <q-slider
                      v-model="processInBackgroundMaxRate"
                      :min="1"
                      :max="10"
                      label
                      :label-value="'Background Process max: ' + processInBackgroundMaxRate + ' / second'"
                    />
                  </q-item-section>
                </q-item>
                <q-item  style="width: 20rem;">
                  <q-item-section avatar>
                    <q-icon name="download" />
                  </q-item-section>
                  <q-item-section>
                    <q-slider
                      v-model="queueInMaxSize"
                      :min="1"
                      :max="2000"
                      label
                      :label-value="'Max messages in Queue In: ' + queueInMaxSize"
                    />
                  </q-item-section>
                </q-item>
                <q-item  style="width: 20rem;">
                  <q-item-section avatar>
                    <q-icon name="download_for_offline" />
                  </q-item-section>
                  <q-item-section>
                    <q-slider
                      v-model="processedLogsMaxSize"
                      :min="1"
                      :max="1000"
                      label
                      :label-value="'Max messages in Processed Logs: ' + processedLogsMaxSize"
                    />
                  </q-item-section>
                </q-item>
              </div>
            </div>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    <div class="">
      <!-- <div class="q-mt-md">
        <span class="text-bold">needsSaving: </span>{{ needsSaving }}
      </div> -->
      <!-- <div class="q-mt-md">
        <span class="text-bold">tailId: </span>{{ pipelineUid }}
      </div> -->
      <div class="">
          <q-tooltip content-style="font-size: 1rem;">
            <!-- <span class="text-bold">Queues / Stacks sizes: </span>{{ incomingLogCount }} / {{ queueIn.length }} / {{ maxSeenInLog }} / {{ processedLogsCount }} / {{ processedLogs.length }} -->
            <div class="row content-center items-center q-gutter-x-sm">
              <q-linear-progress :value=".75" color="indigo" size="lg" stripe style="width: 5rem;" track-color="grey-10"/>
              <div>
                Inbound Queue: <span style="font-weight: bold;" v-if="queueInMaxSize != 0">{{ Math.round(queueIn.length / queueInMaxSize * 100) }}%</span> ({{ queueIn.length }}&nbsp;/&nbsp;{{ queueInMaxSize }}).
              </div>
            </div>
            <div class="row content-center items-center q-gutter-x-sm">
              <q-linear-progress :value=".75" color="teal" size="lg" style="width: 5rem;" track-color="grey-10" />
              <div>
                Processed Messages: <span style="font-weight: bold;" v-if="processedLogsMaxSize != 0">{{ Math.round(processedLogsCount / processedLogsMaxSize * 100) }}%</span> ({{ processedLogsCount }}&nbsp;/&nbsp;{{ processedLogsMaxSize }}).
              </div>
            </div>
            <q-separator class="q-my-sm" />
            <q-icon name="info" color="blue-10" size="sm" class="q-mr-sm" /><span>Total Messages sent by the backend: </span><span style="font-weight: bold;">{{ incomingLogCount }}</span><br>
            <span>This includes the messages already in transit when the Live Tail got stopped.</span>
          </q-tooltip>
        <q-linear-progress :value="queueIn.length / queueInMaxSize" color="indigo" size="lg" stripe track-color="grey-10" />
        <q-linear-progress :value="processedLogsCount / processedLogsMaxSize" color="teal" size="lg" track-color="grey-10" />
      </div>
      <!-- <div class="q-mt-md">
        <span class="text-bold">Queues / Stacks sizes: </span>{{ incomingLogCount }} / {{ queueIn.length }} / {{ maxSeenInLog }} / {{ processedLogsCount }} / {{ processedLogs.length }}
      </div> -->
      <q-card class="q-mt-md" v-show="showManualImport">
      <!-- <q-card class="q-mt-md"> -->
        <q-card-section class="text-h4" style="opacity:.4">
          Manual import
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-tabs
            v-model="manualImportMethod"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="single_log" label="Single Log" />
            <q-tab name="multiple_logs" label="Multiple Logs" />
            <q-tab name="log_file" label="File Import" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="manualImportMethod" animated>
            <q-tab-panel name="single_log">
              <q-input
                v-model="queueInDataEntrySingleLog"
                filled
                autogrow
                input-style="min-height: 16em;"
                label="One single JSON log at a time"
                :rules="[ val => isProperJson(val) || 'JSON Syntax Error(s)' ]"
                @keypress.shift.enter.prevent="queueInAdd({values: queueInDataEntrySingleLog, manualEntry: true});"
              >
                <template v-slot:after>
                  <div class="full-height justify-around q-gutter-y-lg">
                    <q-btn dense icon="playlist_add" color="primary" :disable="!isProperJson(queueInDataEntrySingleLog)" @click="queueInAdd({ values: queueInDataEntrySingleLog, manualEntry: true })" >
                      <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                        Add to Queue
                      </q-tooltip>
                    </q-btn>
                    <q-btn class="row" dense icon="content_copy" flat :disable="!queueInDataEntrySingleLog.length" @click="copyToClipboard(queueInDataEntrySingleLog)" >
                      <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                        Copy to Clipboad
                      </q-tooltip>
                    </q-btn>
                    <q-btn class="row" dense icon="close" flat :disable="!queueInDataEntrySingleLog.length" @click="queueInDataEntrySingleLog = ''" >
                      <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                        Clear out
                      </q-tooltip>
                    </q-btn>
                  </div>
                </template>
              </q-input>
            </q-tab-panel>

            <q-tab-panel name="multiple_logs">
              <q-input
                v-model="queueInDataEntryMultiLog"
                filled
                autogrow
                input-style="min-height: 16em;"
                label="One JSON entry per line"
                :rules="[ val => val != null || 'Common, give me some JSON!' ]"
                @keypress.shift.enter.prevent="queueInAdd({values: queueInDataEntryMultiLog, manualEntry: true});"
              >
                <template v-slot:after>
                  <div class="full-height justify-around q-gutter-y-lg">
                    <q-btn class="row" dense icon="playlist_add" color="primary" :disable="!queueInDataEntryMultiLog.length" @click="queueInAdd({ values: queueInDataEntryMultiLog, manualEntry: true, multiLogs: true })" >
                      <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                        Add to Queue
                      </q-tooltip>
                    </q-btn>
                    <q-btn class="row" dense icon="content_copy" flat :disable="!queueInDataEntryMultiLog.length" @click="copyToClipboard(queueInDataEntryMultiLog)" >
                      <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                        Copy to Clipboad
                      </q-tooltip>
                    </q-btn>
                    <q-btn class="row" dense icon="close" flat :disable="!queueInDataEntryMultiLog.length" @click="queueInDataEntryMultiLog = ''" >
                      <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                        Clear out
                      </q-tooltip>
                    </q-btn>
                  </div>
                </template>
              </q-input>
            </q-tab-panel>

            <q-tab-panel name="log_file">
              <q-file
                filled
                bottom-slots
                v-model="manualImportFileInput"
                label="Click or Drop a file here"
                counter
                max-files="10"
                input-style="min-height: 15.75em;"
              >
                <template v-slot:append>
                  <q-icon v-if="manualImportFileInput !== null" name="close" @click.stop="manualImportFileInput = null" class="cursor-pointer" />
                  <q-icon name="note_add" @click.stop />
                </template>

                <template v-slot:after>
                  <div class="full-height justify-around q-gutter-y-lg">
                    <!-- <q-btn class="row" dense icon="upload_file" color="primary" :disable="manualImportFileInput == null" @click="processFileInput(manualImportFileInput)" > -->
                    <q-btn class="row" dense icon="upload_file" color="primary" >
                      <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                        Add File Content to Queue
                      </q-tooltip>
                      <q-menu>
                        <q-list style="min-width: 400px">
                          <q-item clickable v-close-popup>
                            <q-item-section avatar top>
                              <q-avatar icon="data_array" color="purple-10" text-color="white" />
                            </q-item-section>

                            <q-item-section>
                              <q-item-label lines="1">As an Array of Logs</q-item-label>
                              <q-item-label caption>One JSON array of Logs</q-item-label>
                            </q-item-section>
                          </q-item>
                          <q-item clickable v-close-popup>
                            <q-item-section avatar top>
                              <q-avatar icon="format_list_numbered" color="indigo-10" text-color="white" />
                            </q-item-section>

                            <q-item-section>
                              <q-item-label lines="1">As a Set of Logs</q-item-label>
                              <q-item-label caption>One JSON log per line</q-item-label>
                            </q-item-section>
                          </q-item>
                          <!-- format_list_numbered -->
                          <!-- format_align_left -->
                          <q-separator />
                          <q-item clickable v-close-popup tag="a" :href="wikiLink('whatTheDifferenceLogArrayLogSet')" target="_blank" >
                            <q-item-section avatar top>
                              <q-avatar icon="help_outline" color="info" text-color="black" />
                            </q-item-section>

                            <q-item-section>
                              <q-item-label lines="1">What's the difference?</q-item-label>
                              <q-item-label caption>A quick peek at the Wiki</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                    <q-btn class="row" dense icon="close" flat :disable="manualImportFileInput != null" @click="manualImportFileInput = null" >
                      <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                        Copy to Clipboad
                      </q-tooltip>
                    </q-btn>
                  </div>
                </template>
              </q-file>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
      <q-card class="q-mt-md" v-show="showQueues">
        <q-card-section class="text-h4" style="opacity:.4">
          Queues
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-caption">
            Input Queue
          </div>
          <q-input
            v-model="queueInWindow"
            filled
            autogrow
            input-style="min-height: 10em;"
            readonly
            label="Read Only"
          >
            <template v-slot:after>
              <div class="column">
                <q-btn round dense flat icon="input" @click="queueProcessAdd({ fromArray: queueIn })" :disable="Object.keys(queueProcess).length > 0" />
                <q-btn round dense flat icon="clear" @click="queueIn=[]" :disable="queueIn.length == 0" color="red" />
              </div>
            </template>
          </q-input>
        </q-card-section>
        <q-card-section>
          <div class="text-caption">
            Process Queue
          </div>
          <q-input
            v-model="queueProcessWindow"
            filled
            autogrow
            input-style="min-height: 10em;"
            readonly
            label="Read Only"
          >
            <template v-slot:after>
              <!-- <q-btn round dense flat icon="send" @click="processLogSample({ logSample: queueProcess, options: {} }).finally({ console.log('processLogSample IS DONE'); })" :disable="Object.keys(queueProcess).length === 0"/> -->
              <q-btn round dense flat icon="send" @click="processLogSample({ options: { cleanQueueProcessAfterProcess: true } })" :disable="Object.keys(queueProcess).length === 0"/>
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <q-card class="q-mt-md fit column">
        <div
          class="row items-stretch text-bold"
          style="min-height: 2.5rem;"
        >
          <div class="row content-center q-ml-sm" style="width: 3rem;">
            Freq.
          </div>
          <q-separator vertical class="q-ml-xs" />
          <div
            class="content-center col row q-mx-sm q-px-sm"
          >
            Fields
          </div>
          <q-separator vertical />
          <div
            style="width: 18rem;"
            class="row content-center q-mx-sm q-my-xs q-px-sm"
          >
            Mapping
          </div>
          <q-separator vertical />
          <div
            style="width: 20rem;"
            class="row content-center q-mx-sm q-my-xs q-px-sm"
          >
            Modifiers
          </div>
          <div
            style="width: 1rem;"
          >
          </div>
        </div>
        <q-separator />
        <!-- DATA -->
          <!-- style="height: calc(100vh - (50px + 10px + 10px + 30px));" -->
        <q-virtual-scroll
          style="height: calc(100vh - (150px)); min-height: 10rem;"
          :items="orderBy(jsonPathes, 'name')"
          virtual-scroll-item-size="48"
          :class="(darkMode ? 'dark' : '')"
        >
          <template v-slot="{ item, index }">
            <div
              :key="index"
              class="row items-stretch q-my-none q-py-none json-path-line"
              style="min-height: 1.5rem;"
            >
              <div class="row content-center q-mr-sm q-gutter-y-none" style="width: 3rem;">
                <q-tooltip content-style="font-size: 1em;">
                  <q-icon name="stop" :color="(darkMode ? 'blue-10' : 'blue-7')" />Relative frequency <span style="font-weight: bold;" v-if="maxSeenInLog != 0">{{ Math.round(item.seenInLogCount / maxSeenInLog * 100) }}%</span> ({{ item.seenInLogCount }}&nbsp;/&nbsp;{{ maxSeenInLog }}).<br>
                  <q-icon name="stop" :color="(darkMode ? 'indigo-10' : 'indigo-7')" />Seen in <span v-if="processedLogsCount != 0"><span style="font-weight: bold;" >{{ Math.round(item.seenInLogCount / processedLogsCount * 100) }}%</span> of the logs ({{ item.seenInLogCount }}&nbsp;/&nbsp;{{ processedLogsCount }})</span><span style="font-weight: bold;" v-else>N/A</span>.
                </q-tooltip>
                <q-linear-progress :value="item.seenInLogCount / maxSeenInLog" :color="(darkMode ? 'blue-10' : 'blue-7')" />
                <q-linear-progress :value="item.seenInLogCount / processedLogsCount" :color="(darkMode ? 'indigo-10' : 'indigo-7')" />
              </div>
              <div
                v-for="d in item.depth" :key="d"
                class="row q-ml-xs q-pl-sm json-indentation-bar"
              />
              <div
                class="fixed-font content-center col row q-mr-md"
              >
                <q-tooltip content-style="font-size: 1em;" anchor="center middle" self="center middle">
                  <div>
                    <div class="row items-center q-gutter-x-sm">
                      <q-icon name="account_tree" color="blue-3" />
                      <div class="fixed-font text-bold">{{ item.name }}</div>
                    </div>
                    <q-separator />
                    <q-item
                      v-for="(value, i) in orderBy(item.values, 'count', -1)" :key="i"
                      style="min-width: 25rem;"
                    >
                      <q-item-section>
                        <q-item-label>
                          <div class="row justify-between">
                            <div>
                              <div class="force-long-text-wrap ellipsis-3-lines">{{ value.value }}</div>
                            </div>
                            <q-chip v-if="showTypesInPopup" dense size="sm" class="q-ml-sm" :class="(value.type ? 'json-bg-type-' + value.type.toLowerCase() : '')">{{ (value.type ? value.type : '') }}</q-chip>
                          </div>
                        </q-item-label>
                          <q-linear-progress :value="value.count / item.seenInLogCount" color="blue-3" />
                      </q-item-section>
                    </q-item>
                  </div>
                </q-tooltip>
                <div
                  class="json-style-leaf text-bold"
                  :class="(darkMode ? 'text-light-blue-3' : 'text-light-blue-9')"
                >
                  {{ item.leaf }}
                </div>
                <div v-if="item.values && item.values.length && item.values[0].value !== undefined" class="force-long-text-wrap ellipsis-3-lines">
                  :&nbsp;
                </div>
                <div
                  v-if="item.values && item.values.length && item.values[0].value !== undefined"
                  class="force-long-text-wrap ellipsis-3-lines"
                  :class="(orderBy(item.values, 'count', -1)[0].type ? 'json-type-' + orderBy(item.values, 'count', -1)[0].type.toLowerCase() : '')"
                >
                  {{ orderBy(item.values, 'count', -1)[0].value }}
                </div>
                <span
                  v-if="item.values && item.values.length && item.values[0].type && showExtraDetails"
                  style="font-style: italic; opacity: 50%;"> ({{ item.values[0].type }}:{{ item.values[0].count }}/{{ item.seenInLogCount }})</span>
                <q-chip v-if="showTypesInMainList" dense size="sm" class="q-ml-sm" :class="(item.values && item.values.length && item.values[0].type ? 'json-bg-type-' + item.values[0].type.toLowerCase() : '')">{{ (item.values && item.values.length && item.values[0].type ? item.values[0].type : '') }}</q-chip>
              </div>
              <q-select
                dense
                standout="bg-blue-4 text-white"
                v-model="item.mappedField"
                emit-value
                map-options
                :options="mdiTagsOptions"
                label="Mapping"
                stack-label
                style="width: 18rem;"
                class="q-mx-sm q-my-xs"
                :popup-content-class="(darkMode ? 'bg-grey-9' : undefined)"

                use-input
                input-debounce="0"
                @filter="filterMdiTagsOptions"
              >
                <template v-slot:option="scope">
                  <q-item
                    v-bind="scope.itemProps"
                    v-on="scope.itemEvents"
                    v-if="scope.opt.label && scope.opt.label !== '<hr>'"
                    style="width: 25rem;"
                  >
                    <q-item-section>
                      <q-item-label v-if="scope.opt.value && scope.opt.value.length > 0"><div class="row justify-between"><div class="text-bold">{{ scope.opt.label }}</div><div class="fixed-font text-caption">&lt;{{ scope.opt.value }}&gt;</div></div></q-item-label>
                      <q-item-label v-else class="text-bold">{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator v-if="scope.opt.separator" inset :spaced="scope.opt.label && scope.opt.label === '<hr>'"  />
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-select
                dense
                standout="bg-blue-4 text-white"
                v-model="item.modifiers"
                :options="['Parse JSON', 'Stringify JSON', 'Fan out', 'Sub Rule selector', 'Sub Rule qualifier 1', 'Sub Rule qualifier 2', 'Sub Rule qualifier 3', 'Sub Rule qualifier 4', 'Timestamp selector - ISO8601 format', 'Timestamp selector - Unix Timestamp format']"
                style="width: 20rem;"
                class="q-mx-sm q-my-xs"
                :popup-content-class="(darkMode ? 'bg-grey-9' : undefined)"
                label="Modifiers"
                stack-label
                multiple
              />
            </div>
          </template>
        </q-virtual-scroll>
      </q-card>
      <q-card class="q-mt-md" v-show="showJqOutput">
        <q-card-section class="text-h4" style="opacity:.4">
          OpenCollector JQ
        </q-card-section>
        <q-separator />
        <q-card-section class="text-h6" style="opacity:.6">
          JQ Filter
        </q-card-section>
        <q-card-section>
            <!-- autogrow -->
          <q-input
            v-model="jqFilterOutput"
            type="textarea"
            filled
            readonly
            :label="'is_' + pipelineNameSafe + '.jq'"
            style="min-height: 10rem;"
            rows="21"
            class="fixed-font"
          >
            <template v-slot:after>
              <q-btn round dense flat icon="content_copy" @click="copyToClipboard(jqFilterOutput)" :disable="!jqFilterOutput || (jqFilterOutput && jqFilterOutput.length === 0)">
                <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                  Copy to Clipboad
                </q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </q-card-section>

        <q-separator />

        <q-card-section class="text-h6" style="opacity:.6">
          Transform JQ
        </q-card-section>
        <q-card-section>
            <!-- autogrow -->
          <q-input
            v-model="jqTransformOutput"
            type="textarea"
            filled
            readonly
            :label="beatName + '.jq'"
            style="min-height: 20rem;"
            rows="32"
            class="fixed-font"
          >
            <template v-slot:after>
              <q-btn round dense flat icon="content_copy" @click="copyToClipboard(jqTransformOutput)" :disable="!jqTransformOutput || (jqTransformOutput && jqTransformOutput.length === 0)">
                <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                  Copy to Clipboad
                </q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </q-card-section>

      </q-card>
      <q-card
        id="communicationLogsTextField"
        ref="communicationLogsTextField"
        class="q-mt-md"
        v-show="showCommunicationLog"
      >
        <q-card-section class="text-h6" style="opacity:.6">
          Communication &amp; Shipper Logs
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="communicationLogsOutput"
            type="textarea"
            filled
            readonly
            style="min-height: 10rem;"
            rows="21"
            class="fixed-font"
          >
            <template v-slot:after>
              <div class="column full-height">
                <div class="column q-gutter-y-lg">
                  <q-btn round dense flat icon="content_copy" @click="copyToClipboard(communicationLogsOutput)" :disable="!communicationLogsOutput || (communicationLogsOutput && communicationLogsOutput.length === 0)">
                    <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                      Copy to Clipboad
                    </q-tooltip>
                  </q-btn>
                  <q-separator />
                  <q-btn round dense flat icon="clear" @click="communicationLogsOutput=''" color="red" :disable="!communicationLogsOutput || (communicationLogsOutput && communicationLogsOutput.length === 0)">
                    <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                      Clear
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </template>
          </q-input>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
//        ######   ######  ########  #### ########  ########
//       ##    ## ##    ## ##     ##  ##  ##     ##    ##
//       ##       ##       ##     ##  ##  ##     ##    ##
//        ######  ##       ########   ##  ########     ##
//             ## ##       ##   ##    ##  ##           ##
//       ##    ## ##    ## ##    ##   ##  ##           ##
//        ######   ######  ##     ## #### ##           ##

import { copyToClipboard } from 'quasar'
import { mapState, mapGetters, mapActions } from 'vuex'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import mixinSharedSocket from 'src/mixins/mixin-Shared-Socket'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import mixinSharedBuildJq from 'src/mixins/mixin-Shared-BuildJq'
import Vue2Filters from 'vue2-filters'

export default {
  name: 'PagePipelineBuilder',
  mixins: [
    mixinSharedLoadCollectorsAndPipelines, // Shared functions to load the Collectors and Pipelines
    mixinSharedSocket, // Shared function and state to access the Socket.io
    mixinSharedDarkMode, // Shared computed to access and update the DarkMode
    mixinSharedBuildJq, // Shared JQ Building functions (Filter and Transform)
    Vue2Filters.mixin
  ],
  data () {
    return {
      pipelineUid: '', // UUID of the pipeline, used as the UUID of the tail too. Needed to be able to kill it on the server
      search: '',
      showTypesInMainList: false,
      showTypesInPopup: true,
      showExtraDetails: false,
      mdiTags: [ // Built using tooling/20210420.MDI Tags and fields.xlsx
        { label: 'Application Tab', disable: true, description: '', separator: true },
        { label: 'Object', value: 'object', description: 'The resource (i.e., file) referenced or impacted by activity reported in the log.' },
        { label: 'Object Name', value: 'objectname', description: 'The descriptive name of the object. Do not use unless Object is also used.' },
        { label: 'Object Type', value: 'objecttype', description: 'A category type for the object (e.g., file, image, pdf, etc.).' },
        { label: 'Hash', value: 'hash', description: 'The hash value reported in the log. Choose MD5  Sha1  Sha256.' },
        { label: 'Policy', value: 'policy', description: 'The specific policy referenced (i.e., Firewall, Proxy) in a log message.' },
        { label: 'Result', value: 'result', description: 'The outcome of a command operation or action. For example, the result of quarantine might be success.' },
        { label: 'URL', value: 'url', description: 'The URL referenced or impacted by activity reported in the log. You may need to override the default regex for URLs that are not HTTP/HTTPS.' },
        { label: 'User Agent', value: 'useragent', description: 'The User Agent string from web server logs.' },
        { label: 'Response Code', value: 'responsecode', description: 'The explicit and welldefined response code for an action or command captured in a log. Response Code differs from Result in that response code should be well- structured and easily identifiable as a code.' },
        { label: 'Subject', value: 'subject', description: 'The subject of an email or the general category of the log.' },
        { label: 'Version', value: 'version', description: 'The software or hardware device version described in either the process or object.' },
        { label: 'Command', value: 'command', description: 'The specific command executed that has been recorded in the log message.' },
        { label: 'Reason', value: 'reason', description: 'The justification for an action or result when not an explicit policy.' },
        { label: 'Action', value: 'action', description: 'Field for "what was done" as described in the log. Action is usually a secondary function of a command or process.' },
        { label: 'Status', value: 'status', description: 'The vendor\'s perspective on the state of a system, process, or entity. Status should NOT be used as the result of an action.' },
        { label: 'Session Type', value: 'sessiontype', description: 'The type of session described in the log (e.g., console, CLI, web). Unique from IANA Protocol.' },
        { label: 'Process Name', value: 'process', description: ' System or application process described by the log message.' },
        { label: 'Process ID', value: 'processid', description: 'Numeric ID value for a process.' },
        { label: 'Parent Process ID', value: 'parentprocessid', description: 'The parent process ID of a system or application process that is of interest.' },
        { label: 'Parent Process Name', value: 'parentprocessname', description: 'The parent process name of a system or application process.' },
        { label: 'Parent Process Path', value: 'parentprocesspath', description: 'The full path of a parent process of a system or application process.' },
        { label: 'Quantity', value: 'quantity', description: 'A numeric count of something. For example, there are 4 lights (quantity is 4).' },
        { label: 'Amount', value: 'amount', description: 'The qualitative description of quantity (percentage or relative numbers) For example, half the lights are on (amount is .5 or 50). Amount is also used for currency.' },
        { label: 'Size', value: 'size', description: 'Numeric description of capacity (e.g., disk size) without a specific unit of measurement. Size is generally used as a limit rather than a current measurement. Use Amount for non- specific measurements.' },
        { label: 'Rate', value: 'rate', description: 'Defines a number of something per unit of time without a specific unit of measurement. Always expressed as a fraction.' },
        { label: 'Session', value: 'session', description: 'Unique user or system session identifier.' },
        //
        { label: 'Duration', disable: true, description: 'The elapsed time reported in a log message, derived from multiple fields. Timestart and Timeend need custom parsing patterns. If log has start/end use Time Start and Time End. If log has elapsed time use Days, Hours, Minutes, Seconds, Milliseconds, Microseconds or Nanoseconds.', separator: true },
        { label: 'Duration - Time Start', value: 'timestart', description: 'MUST be used with Time End' },
        { label: 'Duration - Time End', value: 'timeend', description: 'MUST be used with Time Start' },
        { label: 'Duration - Days', value: 'days', description: 'Elapsed time in days' },
        { label: 'Duration - Hours', value: 'hours', description: 'Elapsed time in hours' },
        { label: 'Duration - Minutes', value: 'minutes', description: 'Elapsed time in minutes' },
        { label: 'Duration - Seconds', value: 'seconds', description: 'Elapsed time in seconds' },
        { label: 'Duration - Milliseconds', value: 'milliseconds', description: 'Elapsed time in milliseconds' },
        { label: 'Duration - Microseconds', value: 'microseconds', description: 'Elapsed time in microseconds' },
        { label: 'Duration - Nanoseconds', value: 'nanoseconds', description: 'Elapsed time in nanoseconds' },
        //
        { label: 'Kbytes/Packets Tab', disable: true, description: 'The number of bytes sent or received in the context of the Impacted Host.', separator: true },
        { label: 'Bits in', value: 'bitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Bits out', value: 'bitsout', description: 'In the context of the Impacted Host.' },
        { label: 'Bytes in', value: 'bytesin', description: 'In the context of the Impacted Host.' },
        { label: 'Bytes out', value: 'bytesin', description: 'In the context of the Impacted Host.' },
        { label: 'Kilobits in', value: 'kilobitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Kilobits out', value: 'kilobitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Kilobytes in', value: 'kilobytesin', description: 'In the context of the Impacted Host.' },
        { label: 'Kilobytes out', value: 'kilobytesin', description: 'In the context of the Impacted Host.' },
        { label: 'Megabits in', value: 'megabitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Megabits out', value: 'megabitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Megabyte in', value: 'megabytein', description: 'In the context of the Impacted Host.' },
        { label: 'Megabyte out', value: 'megabytein', description: 'In the context of the Impacted Host.' },
        { label: 'Gigabits in', value: 'gigabitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Gigabits out', value: 'gigabitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Gigabyte in', value: 'gigabytein', description: 'In the context of the Impacted Host.' },
        { label: 'Gigabyte out', value: 'gigabytein', description: 'In the context of the Impacted Host.' },
        { label: 'Terabits in', value: 'terabitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Terabits out', value: 'terabitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Terabytes in', value: 'terabytesin', description: 'In the context of the Impacted Host.' },
        { label: 'Terabytes out', value: 'terabytesin', description: 'In the context of the Impacted Host.' },
        { label: 'Petabits in', value: 'petabitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Petabits out', value: 'petabitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Petabytes in', value: 'petabytesin', description: 'In the context of the Impacted Host.' },
        { label: 'Petabytes out', value: 'petabytesin', description: 'In the context of the Impacted Host.' },
        { label: 'Bits', value: 'bits', description: 'In the context of the Impacted Host.' },
        { label: 'Bytes', value: 'bytes', description: 'In the context of the Impacted Host.' },
        { label: 'Kilobits', value: 'kilobits', description: 'In the context of the Impacted Host.' },
        { label: 'Kilobytes', value: 'kilobytes', description: 'In the context of the Impacted Host.' },
        { label: 'Megabits', value: 'megabits', description: 'In the context of the Impacted Host.' },
        { label: 'Megabytes', value: 'megabytes', description: 'In the context of the Impacted Host.' },
        { label: 'Gigabits', value: 'gigabits', description: 'In the context of the Impacted Host.' },
        { label: 'Gigabytes', value: 'gigabytes', description: 'In the context of the Impacted Host.' },
        { label: 'Terabits', value: 'terabits', description: 'In the context of the Impacted Host.' },
        { label: 'Trabytes', value: 'terabytes', description: 'In the context of the Impacted Host.' },
        { label: 'Petabits', value: 'petabits', description: 'In the context of the Impacted Host.' },
        { label: 'Petabytes', value: 'petabytes', description: 'In the context of the Impacted Host.' },
        { label: 'Packets in', value: 'packetsin', description: 'In the context of the Impacted Host.' },
        { label: 'Packets out', value: 'packetsout', description: 'In the context of the Impacted Host.' },
        { label: 'Packets', value: 'packets', description: 'In the context of the Impacted Host.' },
        //
        { label: 'Classification Tab', disable: true, description: '', separator: true },
        { label: 'Severity', value: 'severity', description: 'The vendor\'s view of the severity of the log.' },
        { label: 'Vendor Message ID', value: 'vmid', description: 'Specific vendor for the log used to describe a type of event.' },
        { label: 'Vendor Info', value: 'vendorinfo', description: 'Description of a specific vendor log or event identifier for the log. Human readable elaboration that directly correlates to the VMID.' },
        { label: 'Threat Name', value: 'threatname', description: 'The name of a threat described in the log message (e.g., malware, exploit name, signature name). Do not overload with Policy.' },
        { label: 'Threat ID', value: 'threatid', description: 'ID number or unique identifier of a threat. Note that CVE is stored separately.' },
        { label: 'CVE', value: 'cve', description: 'CVE ID (i.e., CVE-1999-0003) from vulnerability scan data.' },
        //
        { label: 'Host Tab', disable: true, description: '', separator: true },
        { label: 'MAC Address (Origin)', value: 'smac', description: 'The MAC address from which activity originated (i.e., attacker, client).' },
        { label: 'MAC Address (Impacted)', value: 'dmac', description: 'The MAC address that was affected by the activity (i.e., target, server).' },
        { label: 'Interface (Origin)', value: 'sinterface', description: 'The network port/interface from which the activity originated (i.e., attacker, client).' },
        { label: 'Interface (Impacted)', value: 'dinterface', description: 'The network port/interface that was affected by the activity (i.e., target, server).' },
        { label: 'IP Address (Origin)', value: 'sip', description: 'The IP address from which activity originated (i.e., attacker, client).' },
        { label: 'IP Address (Impacted)', value: 'dip', description: 'The IP address that was affected by the activity (i.e., target, server).' },
        { label: 'NAT IP Address (Origin)', value: 'snatip', description: 'The Network Address Translated (NAT) IP address from which activity originated (i.e., attacker, client).' },
        { label: 'NAT IP Address (Impacted)', value: 'dnatip', description: 'The Network Address Translated (NAT) IP address that was affected by the activity (i.e., target, server).' },
        { label: 'Hostname (Origin)', value: 'sname', description: 'The hostname from which activity originated (i.e., attacker, client).' },
        { label: 'Hostname (Impacted)', value: 'dname', description: 'The hostname that was affected by the activity (i.e., target, server).' },
        { label: 'Serial Number', value: 'serialnumber', description: 'The hardware or software serial number in a log message. This value should be a permanent unique identifier.' },
        //
        { label: 'Identity Tab', disable: true, description: '', separator: true },
        { label: 'User (Origin)', value: 'login', description: 'The originating user or system account of the activity reported in the log.' },
        { label: 'User (Impacted)', value: 'account', description: 'The user or system account impacted by activity reported in the log.' },
        { label: 'Sender', value: 'sender', description: 'The sender of an email or the "caller number" for a VOIP log. This value must relate to a specific user or unique address in the case of a phone call or email.' },
        { label: 'Recipient', value: 'recipient', description: 'The recipient of an email or the dialed number for a VOIP log.' },
        { label: 'Group', value: 'group', description: 'The user group or role impacted by activity reported in the log. Do not use for entity group (zone or domain).' },
        //
        { label: 'Network Tab', disable: true, description: '', separator: true },
        { label: 'Domain (Impacted)', value: 'domainimpacted', description: 'The Windows or DNS domain name referenced or impacted by activity reported in the log.' },
        { label: 'Domain (Origin)', value: 'domainorigin', description: 'The Windows or DNS domain where the logged activity originated.' },
        { label: 'Protocol', value: 'protnum', description: 'The IANA protocol by number.' },
        { label: 'Protocol', value: 'protname', description: 'The IANA protocol by name.' },
        { label: 'TCP/UDP Port (Origin)', value: 'sport', description: 'The port from which activity originated (i.e., client, attacker port).' },
        { label: 'TCP/UDP Port (Impacted)', value: 'dport', description: 'The port to which activity was targeted (i.e., server, target port).' },
        { label: 'NAT TCP/UDP Port (Origin)', value: 'snatport', description: 'The Network Address Translated (NAT) port from which activity originated (i.e., client, attacker port).' },
        { label: 'NAT TCP/UDP Port (Impacted)', value: 'dnatport', description: 'The Network Address Translated (NAT) port to which activity was targeted (i.e., server, target port).' }
      ],
      mdiTagsOptions: [], // Used in the Select field
      showQueues: false, // Collapse / Hide the Queues panel if false (default)
      wrapSingleStringLog: false,
      incomingLogCount: 0, // Number of lines of logs sent over the socket
      queueIn: [], // To feed from the Server Tail, or the queueInDataEntrySingleLog field
      queueProcess: {}, // The one record we are working on (coming from the queueIn, one at a time)
      processedLogs: [], // The logs, once processed
      processedLogsCount: 0, // The count of processed logs
      jsonPathes: [], // The extracted keys and values from the processedLogSample. Used for display and mapping. Saved.
      tailEnabled: false, // Are we running a tail against the sample/capture file?
      // tailId: '', // UUID of the tail. Needed to be able to kill it on the server
      processInBackground: false,
      processInBackgroundMaxRate: 1, // once per second by default
      queueInMaxSize: 200, // Maximum number of log messages in queueIn
      processedLogsMaxSize: 200, // Maximum number of log messages in processedLogs
      bufferStdOut: '', // Buffer to concatenate incoming STDOUT data until we find a carriage return
      extractMessageFieldOnly: false, // Only extract the content of the .message field
      showJqOutput: false, // Collapse / Hide the JQ panel
      jqFilterOutput: '', // The automacically built JQ Filter output
      jqTransformOutput: '', // The automacically built JQ Transform output
      needsSaving: false, // Are there any un-saved changes
      saving: false, // Saving is still ongoing
      showCommunicationLog: false, // Collapse / Hide the logs about the Socket communication with the server
      communicationLogsOutput: '', // The logs about the Socket communication, as text
      showManualImport: false, // Collapse / Hide Manual Import panel
      manualImportMethod: 'single_log', // How is the user going to manually import Logs
      queueInDataEntrySingleLog: `{
  "timestamp":"20210422T16:40:00",
  "destination":{
    "ip":"172.16.1.2",
    "port":443
  },
  "source":{
    "ip":"192.168.0.1",
    "port":44444
  }
}`, // To enter log data by hand
      queueInDataEntryMultiLog: '{"timestamp":"20210422T16:40:00","id":"abcdef-1234"}\r{"timestamp":"20210422T16:43:00","id":"xyzmno-8754"}', // To enter log data by hand, one per line
      manualImportFileInput: null // File
    }
  },
  computed: {
    ...mapState('mainStore', ['loggedInUser', 'jqFilterTemplate', 'jqTransformTemplate', 'helpWikiUrlBase']),
    ...mapGetters('mainStore', ['pipelines']),
    pipeline () {
      return this.pipelines.find(p => p.uid === this.pipelineUid)
    },
    pipelineName () {
      const pipeline = this.pipelines.find(p => p.uid === this.pipelineUid)
      return (pipeline && pipeline.name && pipeline.name.length ? pipeline.name : '')
    },
    beatName () {
      // // Beat Name will be PipleineName in lower case and without space no double quote
      // return this.pipelineName
      //   .replace(/[ "]/g, '_')
      //   .toLowerCase()
      return (this.pipeline && this.pipeline.collectionConfig && this.pipeline.collectionConfig.collectionShipper ? this.pipeline.collectionConfig.collectionShipper : '')
    },
    pipelineNameSafe () {
      return this.pipelineName
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .toLowerCase()
    },
    maxSeenInLog () {
      let max = 0
      this.jsonPathes.forEach(jp => {
        if (jp.seenInLogCount > max) {
          max = jp.seenInLogCount
        }
      })
      return max
    }, // maxSeenInLog
    queueInWindow () {
      return JSON.stringify(this.queueIn)
    }, // queueInWindow
    queueProcessWindow () {
      return JSON.stringify(this.queueProcess)
    } // queueProcessWindow
  },

  methods: {
    ...mapActions('mainStore', ['upsertPipeline']),
    resetData () {
      setTimeout(() => {
        this.incomingLogCount = 0
        this.jsonPathes = []
        this.processedLogsCount = 0
        this.processedLogs = []
      }, 300)
    },

    filterMdiTagsOptions (val, update, abort) {
      if (val === '') {
        update(() => {
          this.mdiTagsOptions = this.mdiTags
        })
      } else {
        update(() => {
          const needle = val.toLowerCase()
          this.mdiTagsOptions = this.mdiTags.filter(v => (v.label + v.value + v.description).toLowerCase().indexOf(needle) > -1)
        })
      }
    }, // filterMdiTagsOptions

    addLineToCommunicationLog (payload) {
      if (payload !== undefined) {
        // Dump the string or strings (if multiline) into new line(s) in the console
        if (typeof payload === 'string') {
          // eslint-disable-next-line quotes
          this.communicationLogsOutput += payload + (payload.endsWith("\n") ? '' : "\n")
          // // eslint-disable-next-line quotes
          // payload.split("\n").forEach(line => {
          //   this.communicationLogsOutput += `${line}\n`
          // })
        } else {
          this.communicationLogsOutput += `${JSON.stringify(payload, null, '  ')}\n`
        }
      }
    },

    showCommunicationLogAndScrollToIt () {
      // Display the logs area
      this.showCommunicationLog = true
      // And jump to it
      this.$nextTick(function () {
        this.scrollTo('communicationLogsTextField')
      })
    }, // showCommunicationLogAndScrollToIt

    scrollTo (elementName) {
      const communicationAndShipperLogsElement = this.$refs[elementName].$el
      setTimeout(() => {
        // window.scrollTo(0, offset)
        window.scrollTo({
          top: communicationAndShipperLogsElement.offsetTop,
          left: 0,
          behavior: 'smooth'
        })
      }, 250)
    }, // showCommunicationLogAndScrollToIt

    showNotificationWithActionToLogs (message, type = 'negative') {
      this.$q.notify({
        message: message,
        type,
        progress: true,
        timeout: (type === 'negative' ? 10000 : 2500),
        actions: [
          { label: 'See Logs', color: 'white', handler: this.showCommunicationLogAndScrollToIt }
        ]
      })
    },

    //        ##     ##    ###    ##    ## ########  ##       ########  ######   #######   ######  ##    ## ######## ########  #######  ##    ## ########    ###    #### ##       ##        #######   ######
    //        ##     ##   ## ##   ###   ## ##     ## ##       ##       ##    ## ##     ## ##    ## ##   ##  ##          ##    ##     ## ###   ##    ##      ## ##    ##  ##       ##       ##     ## ##    ##
    //        ##     ##  ##   ##  ####  ## ##     ## ##       ##       ##       ##     ## ##       ##  ##   ##          ##    ##     ## ####  ##    ##     ##   ##   ##  ##       ##       ##     ## ##
    //        ######### ##     ## ## ## ## ##     ## ##       ######    ######  ##     ## ##       #####    ######      ##    ##     ## ## ## ##    ##    ##     ##  ##  ##       ##       ##     ## ##   ####
    //        ##     ## ######### ##  #### ##     ## ##       ##             ## ##     ## ##       ##  ##   ##          ##    ##     ## ##  ####    ##    #########  ##  ##       ##       ##     ## ##    ##
    //        ##     ## ##     ## ##   ### ##     ## ##       ##       ##    ## ##     ## ##    ## ##   ##  ##          ##    ##     ## ##   ###    ##    ##     ##  ##  ##       ##       ##     ## ##    ##
    //        ##     ## ##     ## ##    ## ########  ######## ########  ######   #######   ######  ##    ## ########    ##     #######  ##    ##    ##    ##     ## #### ######## ########  #######   ######

    handleSocketOnTailLog (payload) {
      // this.addLineToCommunicationLog('handleSocketOnTailLog')
      // this.addLineToCommunicationLog(payload)
      // console.log(payload)
      // // {tailId: "de720065-d50e-499e-aa1f-ad4fd783ab8a", code: "STDOUT", payload: "Apr 26 14:44:21 oc-ez containerd: time="2021-04-26… systemd-logind: New session 44703 of user root.↵"}
      // // {tailId: "de720065-d50e-499e-aa1f-ad4fd783ab8a", code: "END"}
      // // {tailId: "de720065-d50e-499e-aa1f-ad4fd783ab8a", code: "EXIT", payload: null}

      // If we are getting data from the remote job, breack it in multiple lines (if \n is found in it) and push it in the queueIn
      if (
        payload.code &&
        payload.code === 'STDOUT' &&
        payload.payload &&
        payload.tailId &&
        payload.tailId === this.pipelineUid
      ) {
        if (typeof payload.payload === 'string') {
          // Add new data to end of buffer
          this.bufferStdOut += payload.payload

          // eslint-disable-next-line quotes
          if (this.bufferStdOut.indexOf("\n") > -1) {
            const newPayload = []
            // eslint-disable-next-line quotes
            this.bufferStdOut.split("\n").forEach(lr => {
              if (this.wrapSingleStringLog && typeof lr === 'string') {
                newPayload.push({ singleStringLog: lr })
              } else {
                newPayload.push(lr)
              }
            })

            // Empty the buffer
            this.bufferStdOut = ''

            // Check if the last element of the array is not empty (denoting a string not terminated with a carriage return)
            // If found, put it back in the bufferStdOut, as it's most likely the beginning of a truncated line
            if (newPayload.length > 0) {
              if (newPayload[newPayload.length - 1].length !== 0) {
                this.bufferStdOut = newPayload.pop()
              }
            }

            this.queueInAdd({ values: newPayload })
          }
        } else {
          this.queueInAdd({ values: payload.payload })
        }
      }

      // If we are getting STDERR data from the remote job, breack it in multiple lines (if \n is found in it) and log it to the console
      if (
        payload.code &&
        payload.code === 'STDERR' &&
        payload.payload &&
        payload.tailId &&
        payload.tailId === this.pipelineUid
      ) {
        // this.addLineToCommunicationLog(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
        this.addLineToCommunicationLog(payload.payload)
        // if (typeof payload.payload === 'string') {
        //   console.log(payload.payload)
        //   // const newPayload = []
        //   // // eslint-disable-next-line quotes
        //   // payload.payload.split("\n").forEach(lr => {
        //   //   console.log(lr)
        //   // })
        //   // this.queueInAdd({ values: newPayload })
        // } else {
        //   console.log(payload.payload)
        //   // this.queueInAdd({ values: payload.payload })
        // }
      }

      // If we are getting ERROR data from the remote job, log it to the console as error
      if (
        payload.code &&
        payload.code === 'ERROR' &&
        payload.payload &&
        payload.tailId &&
        payload.tailId === this.pipelineUid
      ) {
        console.error(payload.payload)
        this.addLineToCommunicationLog(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
        this.showNotificationWithActionToLogs(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
      }

      // // If the remote job died, turn the Tail off here too
      // if (
      //   payload.code &&
      //   (
      //     payload.code === 'END' ||
      //     payload.code === 'EXIT'
      //   ) &&
      //   payload.tailId &&
      //   payload.tailId === this.pipelineUid
      // ) {
      //   this.tailEnabled = false
      //   this.addLineToCommunicationLog(`${payload.code} | Closing this Tail. | ${(payload.payload !== undefined ? payload.payload : '')}`)
      //   this.showNotificationWithActionToLogs(`${payload.code} | Closing this Tail. (${(payload.payload !== undefined ? payload.payload : '')})`, 'info')
      // }
      // // If the remote job died, push it to the Comm Log
      if (
        payload.code === 'END' &&
        payload.tailId &&
        payload.tailId === this.pipelineUid
      ) {
        this.tailEnabled = false
        this.addLineToCommunicationLog(`${payload.code} | Closing this Tail. | ${(payload.payload !== undefined ? payload.payload : '🏁')}`)
        this.showNotificationWithActionToLogs(`${payload.code} | Closing this Tail. (${(payload.payload !== undefined ? payload.payload : '🏁')})`, 'info')
      }

      // If the remote job died, push it to the Comm Log
      if (
        payload.code === 'EXIT' &&
        payload.tailId &&
        payload.tailId === this.pipelineUid
      ) {
        this.tailEnabled = false
        this.addLineToCommunicationLog(`${payload.code} | Tailjob exited. | ${(payload.payload !== undefined ? payload.payload : '🏁')}`)
      }
    },

    handleSocketOnTailKill (payload) {
      // this.addLineToCommunicationLog('handleSocketOnTailKill')
      // this.addLineToCommunicationLog(payload)

      // If we are getting STDOUT or STDERR data from the remote job push it to the Comm Log
      if (
        payload.code &&
        (
          payload.code === 'STDOUT' ||
          payload.code === 'STDERR'
        ) &&
        payload.payload &&
        payload.tailId &&
        payload.tailId === this.pipelineUid
      ) {
        this.addLineToCommunicationLog(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
      }

      // If we are getting ERROR data from the remote job, push it to the Comm Log
      if (
        payload.code &&
        payload.code === 'ERROR' &&
        payload.payload &&
        payload.tailId &&
        payload.tailId === this.pipelineUid
      ) {
        this.addLineToCommunicationLog(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
        console.error(payload.payload)
        this.showNotificationWithActionToLogs(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`, 'info')
      }

      // If the remote job died, push it to the Comm Log
      if (
        payload.code === 'END' &&
        payload.tailId &&
        payload.tailId === this.pipelineUid
      ) {
        this.addLineToCommunicationLog(`${payload.code} | Post-Tail killing/cleaning job finished. | ${(payload.payload !== undefined ? payload.payload : '🏁')}`)
        this.showNotificationWithActionToLogs(`${payload.code} | Post-Tail killing/cleaning job finished. (${(payload.payload !== undefined ? payload.payload : '🏁')})`, 'info')
      }

      // If the remote job died, push it to the Comm Log
      if (
        payload.code === 'EXIT' &&
        payload.tailId &&
        payload.tailId === this.pipelineUid
      ) {
        this.addLineToCommunicationLog(`${payload.code} | Post-Tail killing/cleaning job exited. | ${(payload.payload !== undefined ? payload.payload : '🏁')}`)
      }
    },

    //     ##     ##    ###    ##    ## ##     ##    ###    ##             #### ##     ## ########   #######  ########  ########
    //     ###   ###   ## ##   ###   ## ##     ##   ## ##   ##              ##  ###   ### ##     ## ##     ## ##     ##    ##
    //     #### ####  ##   ##  ####  ## ##     ##  ##   ##  ##              ##  #### #### ##     ## ##     ## ##     ##    ##
    //     ## ### ## ##     ## ## ## ## ##     ## ##     ## ##              ##  ## ### ## ########  ##     ## ########     ##
    //     ##     ## ######### ##  #### ##     ## ######### ##              ##  ##     ## ##        ##     ## ##   ##      ##
    //     ##     ## ##     ## ##   ### ##     ## ##     ## ##              ##  ##     ## ##        ##     ## ##    ##     ##
    //     ##     ## ##     ## ##    ##  #######  ##     ## ########       #### ##     ## ##         #######  ##     ##    ##

    isProperJson (value) {
      let isValid = false
      try {
        JSON.parse(value)
        isValid = true
      } catch {
        // Not proper JSON
        console.log('String is not a proper JSON')
      }
      return isValid
    },

    async processFileInput (file) {
      console.log('processFileInput')
      console.log(file)
      if (file) {
        const fileContent = await file.text()
        console.log('[processFileInput] - 🟢 - File content', fileContent) // XXXX
      } else {
        console.log('[processFileInput] - 🟠 - No file selected.')
      }
    },

    //         #######  ##     ## ######## ##     ## ########
    //        ##     ## ##     ## ##       ##     ## ##
    //        ##     ## ##     ## ##       ##     ## ##
    //        ##     ## ##     ## ######   ##     ## ######
    //        ##  ## ## ##     ## ##       ##     ## ##
    //        ##    ##  ##     ## ##       ##     ## ##
    //        ##### ##  #######  ########  #######  ########

    queueInAdd ({ values, manualEntry, multiLogs }) {
      if (typeof values === 'string') {
        // deal with it as Strings

        if (multiLogs === true) {
          // Dealing with multiple Logs, one per line

          // Call itself while providing an Array of Strings
          this.queueInAdd({ values: values.split('\r'), manualEntry })
        } else {
          // Dealing with Single Log

          // Increase counter
          this.incomingLogCount++

          // if (this.tailEnabled && (this.queueIn.length < this.queueInMaxSize)) {
          if (values.length > 0) {
            try {
              // this.queueIn.push(JSON.parse(values))
              this.queueInPush(JSON.parse(values), manualEntry)
            } catch {
              // Not proper JSON
              console.log('String is not a proper JSON')
            }
          }
        }
      } else if (Array.isArray(values)) {
        // deal with it as Array of strings or JSON objects

        // Increase counter
        this.incomingLogCount = this.incomingLogCount + values.length

        values.forEach(value => {
          if (typeof value === 'string') {
            if (value.length > 0) {
              try {
                this.queueInPush(JSON.parse(value), manualEntry)
              } catch {
                // Not proper JSON
                console.log('String is not a proper JSON')
              }
            }
          } else {
            this.queueInPush(value, manualEntry)
          }
        })
      } else if (typeof values === 'object') {
        // deal with it as a single JSON object

        // Increase counter
        this.incomingLogCount++

        this.queueInPush(values, manualEntry)
      } else {
        console.log('[queueInAdd] - UNKNOWN TYPE') // XXXX
      }
    }, // queueInAdd

    queueInPush (value, manualEntry = false) {
      // `manualEntry` is designed to override standard flood protection
      // and allow for a user to enter logs manually, if set to TRUE
      if ((this.tailEnabled && (this.queueIn.length < this.queueInMaxSize)) | manualEntry) {
        if (this.extractMessageFieldOnly) {
          if (!value.message) {
            console.log('No .message found in log object')
          }
          try {
            this.queueIn.push(JSON.parse(value.message))
          } catch {
            // Not proper JSON
            console.log('Field .message does not contain proper JSON')
          }
        } else {
          this.queueIn.push(value)
        }
      } else {
        console.log('[queueInPush] Trying to push a value when Tail is disabled or queue is full')
      }
    },

    queueProcessAdd ({ fromArray }) {
      // Take the top of list item (oldest) from queueIn and push it to the Process
      if (Object.keys(this.queueProcess).length === 0) {
        if (fromArray && fromArray.length > 0) {
          this.queueProcess = fromArray.shift()
        }
      } else {
        console.log('queueProcessAdd - queueProcess is NOT empty. Try again later.')
      }
    }, // queueProcessAdd

    //        ########  ########   #######   ######  ########  ######   ######        ##        #######   ######    ######
    //        ##     ## ##     ## ##     ## ##    ## ##       ##    ## ##    ##       ##       ##     ## ##    ##  ##    ##
    //        ##     ## ##     ## ##     ## ##       ##       ##       ##             ##       ##     ## ##        ##
    //        ########  ########  ##     ## ##       ######    ######   ######        ##       ##     ## ##   ####  ######
    //        ##        ##   ##   ##     ## ##       ##             ##       ##       ##       ##     ## ##    ##        ##
    //        ##        ##    ##  ##     ## ##    ## ##       ##    ## ##    ##       ##       ##     ## ##    ##  ##    ##
    //        ##        ##     ##  #######   ######  ########  ######   ######        ########  #######   ######    ######

    // Steps:
    // - get FileBeat to write to disk in specific file for LS
    // - Backend tails disk file remotely (via SSH)
    // - bring logs to Front (UI) as they arrive (via Socket.io)
    // - limit to 10k log samples on disk (or to given size, whichever is the easiest to achieve)
    // - process logs in background on UI
    // - keep stats updated on UI
    // - for each log:
    //     - recursively go through each keys:
    //           - populate the jsonPathes object with:
    //               - full dotted path, leaf name, and depth, if not already in
    //               - increment seenInLogCount
    //               - add value to values.value (if not already in)
    //               - add type to values.type (if not already in)
    //               - increment values.count for value / type
    //     - increment processedLogsCount
    //     - add log to processedLogs

    processLogSample ({ logSample, options }) {
      // Check if we got provided a logSample, if not falls back onto this.queueProcess
      const logSampleProvidedAsVariable = (logSample && Object.keys(logSample).length > 0)
      const logSampleToProcess = (logSampleProvidedAsVariable ? logSample : this.queueProcess)

      if (Object.keys(logSampleToProcess).length > 0) {
        this.processLogKey({ leaf: logSampleToProcess, parentPath: '', depth: 0, maxDepth: 5 })

        this.processedLogsCount++
        // Add the processed sample to processedLogs, except if we have enough of them already
        if (this.processedLogsCount < this.processedLogsMaxSize) {
          this.processedLogs.push(logSampleToProcess)
        } else {
          // Turning off the background processing of the logs
          this.processInBackground = false
        }
      }

      if (!logSampleProvidedAsVariable && options && options.cleanQueueProcessAfterProcess) {
        this.queueProcess = {}
      }
    }, // processLogSample

    processLogKey ({ leaf, parentPath, depth, maxDepth }) {
      // recursively go through each keys
      const maxDepth_ = (maxDepth || 50) // Default max depth 50
      if (maxDepth_ > 0) { // fail safe
        let thisKeyPath = ''
        if ((!parentPath || parentPath === '') && (!depth || depth === 0)) {
          // This is the root of the object, so let's deal with it accordingly

          // Upsert it first
          this.upsertToJsonPaths({ thisKeyPath: '.', depth: 0, key: '', value: leaf })

          // And crawl through it
          if (typeof leaf === 'object') {
            this.processLogKey({ leaf: leaf, parentPath: thisKeyPath, depth: depth + 1, maxDepth: maxDepth_ - 1 })
          }
        } else {
          // This is NOT the root of the object
          if (typeof leaf === 'object') {
            const isParentAnArray = Array.isArray(leaf)
            Object.keys(leaf).forEach(key => {
              thisKeyPath = (isParentAnArray ? parentPath + '[' + key + ']' : parentPath + '.' + key)

              // Upsert it first
              this.upsertToJsonPaths({ thisKeyPath: thisKeyPath, depth: depth, key: key, value: leaf[key] })

              // Loop through its sub-elements, if any
              if (typeof leaf[key] === 'object' && leaf[key]) {
                this.processLogKey(
                  {
                    leaf: leaf[key],
                    parentPath: thisKeyPath,
                    depth: depth + 1,
                    maxDepth: maxDepth_ - 1
                  }
                )
              }
            })
          } else {
            console.log('Not type object')
          }
        }
      }
    }, // processLogKey

    upsertToJsonPaths ({ thisKeyPath, depth, key, value }) {
      const currentPositionInJsonPaths = this.jsonPathes.findIndex(path => path.name === thisKeyPath)

      let thisPath = {}
      if (currentPositionInJsonPaths >= 0) {
        // We already have this in our table, let's use it
        thisPath = this.jsonPathes[currentPositionInJsonPaths]
      } else {
        // New item, let's create it
        thisPath = {
          name: thisKeyPath,
          leaf: key,
          depth: depth,
          seenInLogCount: 0,
          values: []
        }
      }

      // Update thisPath
      thisPath.seenInLogCount++

      if (typeof value !== 'object') {
        const valueCurrentPositionInValues = thisPath.values.findIndex(v => v.value === value)
        if (valueCurrentPositionInValues >= 0) {
          // Already in
          thisPath.values[valueCurrentPositionInValues].count++
        } else {
          // Adding value to array
          thisPath.values.push({
            value: value,
            type: typeof value,
            count: 1
          })
        }
      } else {
        if (thisPath.values.length === 0) {
          thisPath.values.push({
            type: (Array.isArray(value) ? 'array' : typeof value),
            count: 1
          })
        } else {
          thisPath.values[0].count++
        }
      }

      if (currentPositionInJsonPaths < 0) {
        // Now let's add this new Path to the list
        this.jsonPathes.push(thisPath)
      }
    }, // upsertToJsonPaths

    processLogSampleInBackground ({ options }) {
      this.queueProcessAdd({ fromArray: this.queueIn })
      this.processLogSample({ options: { cleanQueueProcessAfterProcess: true } })
    }, // processLogSampleInBackground

    //        ########    ###    #### ##
    //           ##      ## ##    ##  ##
    //           ##     ##   ##   ##  ##
    //           ##    ##     ##  ##  ##
    //           ##    #########  ##  ##
    //           ##    ##     ##  ##  ##
    //           ##    ##     ## #### ########

    initTail () {
      if (this.socket && this.socket.connected) {
        this.socket.emit('tail.init', { pipelineUid: this.pipelineUid, tailId: this.pipelineUid, collectionConfig: this.pipeline.collectionConfig })
      }
    },

    killTail () {
      if (this.socket && this.socket.connected) {
        this.socket.emit('tail.kill', { pipelineUid: this.pipelineUid, tailId: this.pipelineUid })
      }
    },

    listTails () {
      if (this.socket && this.socket.connected) {
        this.socket.emit('tail.showtaillist')
      }
    },

    //              ##  #######
    //              ## ##     ##
    //              ## ##     ##
    //              ## ##     ##
    //        ##    ## ##  ## ##
    //        ##    ## ##    ##
    //         ######   ##### ##

    copyToClipboard (value) {
      copyToClipboard(value)
    },

    buildJqFilter () {
      // Use buildJqFilterFromParams() from mixin-Shared-BuildJq
      this.jqFilterOutput = this.buildJqFilterFromParams(
        this.pipelineUid,
        this.pipelineName,
        this.beatName,
        this.loggedInUser
      )
    },

    buildJqTransform () {
      // Use buildJqTransformFromParams() from mixin-Shared-BuildJq
      this.jqTransformOutput = this.buildJqTransformFromParams(
        this.pipelineUid,
        this.pipelineName,
        this.beatName,
        this.loggedInUser,
        this.extractMessageFieldOnly,
        this.jsonPathes
      )
    },

    save () {
      this.needsSaving = false
      this.upsertPipeline(
        {
          caller: this,
          pushToApi: true,
          pipeline:
          {
            uid: this.pipelineUid,
            status: (this.pipeline && this.pipeline.status && this.pipeline.status === 'Ready' ? this.pipeline.status : 'Dev'),
            fieldsMapping: this.jsonPathes
          }
        }
      )
    },

    reverseToLastSaved () {
      try {
        // Bring back mapping from the store
        const pipeline = this.pipelines.find(p => p.uid === this.pipelineUid)
        this.jsonPathes = (pipeline && pipeline.fieldsMapping && pipeline.fieldsMapping.length ? JSON.parse(JSON.stringify(pipeline.fieldsMapping)) : [])

        // Try to resurect the processedLogsCount (failing to 0 if no logSample)
        this.processedLogsCount = (this.logSample ? this.logSample.length : 0)

        // Flag down the need to Save as data is fresh from last save now
        this.needsSaving = false
      } catch {
        console.log('Can\'t parse JSON')
      }
    },

    wikiLink (reference) {
      // 'whatTheDifferenceLogArrayLogSet'
      return this.helpWikiUrlBase + reference
    }
  },

  mounted () {
    if (this.$route.params.pipelineUid && this.$route.params.pipelineUid.length) {
      if (this.pipelineUid !== this.$route.params.pipelineUid) {
        this.pipelineUid = this.$route.params.pipelineUid
      }
    }

    // this.tailId = uid()
    this.mdiTagsOptions = this.mdiTags

    // Load the Mapping, if any
    this.reverseToLastSaved()

    // Event when Server sends a new log via Tail
    this.socket.on('tail.log', this.handleSocketOnTailLog)
    // Event when Server sends a message while killing a Tail
    this.socket.on('tail.kill', this.handleSocketOnTailKill)
  },

  watch: {
    processInBackground: {
      handler () {
        if (this.processInBackground) {
          this.backgroundProcessInterval = setInterval(() => {
            if (this.processInBackground) {
              this.processLogSampleInBackground({})
            }
          }, 1000 / this.processInBackgroundMaxRate)
        } else {
          clearInterval(this.backgroundProcessInterval)
        }
      },
      deep: false
    }, // processInBackground
    queueIn: {
      handler () {
        // If we have received enough log messages, stop the capture
        if ((this.queueIn.length + this.processedLogsCount) >= this.queueInMaxSize) {
          this.tailEnabled = false
        }
      },
      deep: false
    }, // queueIn
    tailEnabled: {
      handler () {
        if (this.socket.connected) {
          if (this.tailEnabled) {
            // Kick off the Tail
            this.initTail()
            // Start processing at the same time
            if (!this.processInBackground) {
              this.processInBackground = true
            }
          } else {
            this.killTail()
          }
        } else { // No Socket. Tell the user.
          this.tailEnabled = false
          // Pop this to the screen (via MainLayout)
          this.$root.$emit('addAndShowErrorToErrorPanel', {
            data: {
              errors: [
                {
                  code: 'NoLiveSocket',
                  message: 'Live (Socket) connection with the EZ Server has been lost or is not currently established.'
                },
                {
                  code: 'TailFailedToStart',
                  message: 'Tail could not start due to no live socket available.'
                }
              ]
            }
          })
        }
      },
      deep: false
    }, // tailEnabled
    jsonPathes: {
      handler () {
        this.needsSaving = true
        if (this.showJqOutput) {
          this.buildJqTransform()
        }
      },
      deep: true
    }
  },

  created () {
    //
  },

  beforeDestroy () {
    clearInterval(this.backgroundProcessInterval)
  },

  destroyed () {
    // Close any ongoing Tail
    this.killTail()
    // Unsubscribe from Socket.io events about new log via Tail
    this.socket.off('tail.log')
    // Unsubscribe from Socket.io events about message while killing a Tail
    this.socket.off('tail.kill')
  }
}
</script>

<style scoped>
.fixed-font {
    font-family: monospace;
}
.json-indentation-bar {
    /* border-left: 1px solid #05b5d4; */
    border-left: 1px solid #525252;
}
.json-style-leaf {
    /* font-style: bold; */
    /* color: light-blue-3 */
}
/* .json-style-object {
    font-style: italic;
    color: blueviolet;
}
.json-style-array {
    font-style: italic;
    color: rgb(148, 14, 41);
}
.json-style-string {
    font-style: italic;
    color: rgb(80, 112, 255);
}
.json-style-number {
    font-style: italic;
    color: rgb(15, 129, 50);
}
.json-style-boolean {
    font-style: italic;
    color: rgb(32, 227, 253);
} */

/* JSON value foreground */
.json-type-object {
  color: rgb(138, 43, 226);
}
.json-type-array {
  color: rgb(148, 14, 41);
}
.json-type-string {
  color: rgb(80, 112, 255);
}
.json-type-number {
  color: rgb(19, 158, 61);
}
.json-type-boolean {
  color: rgb(0, 174, 200);
}
.json-type- { /* to catch empty types */
  color: rgb(117, 115, 1);
}

.dark .json-type-object {
  color: rgb(138, 43, 226);
}
.dark .json-type-array {
  color: rgb(148, 14, 41);
}
.dark .json-type-string {
  color: rgb(80, 112, 255);
}
.dark .json-type-number {
  color: rgb(21, 173, 66);
}
.dark .json-type-boolean {
  color: rgb(32, 227, 253);
}
.dark .json-type- { /* to catch empty types */
  color: rgb(117, 115, 1);
}

/* Chips backgrounds */
.json-bg-type-object {
  background-color: rgb(82, 26, 134);
  color: white;
}
.json-bg-type-array {
  background-color: rgb(99, 10, 28);
  color: white;
}
.json-bg-type-string {
  background-color: rgb(52, 72, 160);
  color: white;
}
.json-bg-type-number {
  background-color: rgb(11, 88, 34);
  color: white;
}
.json-bg-type-boolean {
  background-color: rgb(17, 116, 129);
  color: white;
}
.json-path-line.dark:hover {
  /* background-color: rgb(49, 18, 42); */
  background-image: linear-gradient(rgba(49, 18, 42, .75), rgba(49, 18, 42, 1), rgba(49, 18, 42, .75));
}
.json-path-line:hover {
  /* background-color: rgb(148, 45, 124); */
  background-image: linear-gradient(rgba(148, 45, 124, 0.05), rgba(148, 45, 124, 0.15), rgba(148, 45, 124, 0.05));
}
.force-long-text-wrap {

  /* These are technically the same, but use both */
  overflow-wrap: break-word;
  word-wrap: break-word;

  -ms-word-break: break-all;
  /* This is the dangerous one in WebKit, as it breaks things wherever */
  word-break: break-all;
  /* Instead use this non-standard one: */
  word-break: break-word;

  /* Adds a hyphen where the word breaks, if supported (No Blink) */
  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto;

}
</style>
