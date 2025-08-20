<template>
  <q-page class="q-pa-sm">
<q-header bordered style="background: var(--q-color-dark);">
  <q-toolbar class="q-gutter-x-sm">
    <img class="q-mr-md" src="logrhythm_logo_darkmode_wide.svg" alt="LogRhythm Open Collector">
        <!-- <q-btn no-caps flat dense icon="playlist_add" :label="$t('Manual Import')" @click="showManualImport = true" v-if="!showManualImport" >
          <q-tooltip content-style="font-size: 1rem;">
            {{ $t('Import log messages manually') }}
          </q-tooltip>
        </q-btn>
        <q-btn no-caps flat dense icon="visibility_off" :label="$t('Manual Import')" @click="showManualImport = false" v-else >
          <q-tooltip content-style="font-size: 1rem;">
            {{ $t('Hide Manual Import panel') }}
          </q-tooltip>
        </q-btn>
        <q-separator vertical /> -->

        <q-space />

        <q-btn
          no-caps
          dense
          class="q-px-sm"
          icon="file_download"
          color="primary"
          :label="$t('Export JSON Policy')"
          @click="exportSmaPolicy()"
        />
        <!-- <q-btn no-caps flat dense icon="file_download" :label="$t('Export JQ')" disable /> -->
        <!-- <q-btn no-caps flat dense icon="visibility" :label="$t('Show JQ')" v-if="!showJqOutput" @click="buildJqFilter(); buildJqTransform(); showJqOutput = true" />
        <q-btn no-caps flat dense icon="visibility_off" :label="$t('Hide JQ output')" v-else @click="showJqOutput = false" /> -->

        <q-space />

        <q-btn
          no-caps
          dense
          class="q-px-sm"
          icon="playlist_remove"
          :label="$t('Clear Processed Logs')"
          @click="clearProcessedLogs()"
        />

        <q-btn
          no-caps
          dense
          class="q-px-sm"
          icon="settings"
          :label="$t('Settings')"
          @click="showSettings = !showSettings"
        />

      </q-toolbar>
    </q-header>
    <div class="">
      <!-- <div class="q-mb-md">
          <q-tooltip content-style="font-size: 1rem;">
            <div class="row content-center items-center q-gutter-x-sm">
              <q-linear-progress :value=".75" color="indigo" size="lg" stripe style="width: 5rem;" track-color="grey-10"/>
                {{ $t('Inbound Queue: {queueInOverQueueInMaxSize}% ({queueIn} / {queueInMaxSize}).', { queueInOverQueueInMaxSize: (queueInMaxSize != 0 ? Math.round(queueIn.length / queueInMaxSize * 100) : '_'), queueIn: queueIn.length, queueInMaxSize}) }}
            </div>
            <div class="row content-center items-center q-gutter-x-sm">
              <q-linear-progress :value=".75" color="teal" size="lg" style="width: 5rem;" track-color="grey-10" />
              <div>
                {{ $t('Processed Messages: {processedLogsCountOverProcessedLogsMaxSize}% ({processedLogsCount} / {processedLogsMaxSize}).', { processedLogsCountOverProcessedLogsMaxSize: (processedLogsMaxSize != 0 ? Math.round(processedLogsCount / processedLogsMaxSize * 100) : '_'), processedLogsCount: processedLogsCount, processedLogsMaxSize}) }}
              </div>
            </div>
            <q-separator class="q-my-sm" />
            <q-icon name="o_info" color="blue-10" size="sm" class="q-mr-sm" /><span>{{ $t('Total Messages sent by the backend: {incomingLogCount}', { incomingLogCount }) }}</span><br>
            <span>{{ $t('This includes the messages already in transit when the Live Tail got stopped.') }}</span>
          </q-tooltip>
        <q-linear-progress :value="queueIn.length / queueInMaxSize" color="indigo" size="lg" stripe track-color="grey-10" />
        <q-linear-progress :value="processedLogsCount / processedLogsMaxSize" color="teal" size="lg" track-color="grey-10" />
      </div> -->
      <!-- <div class="text-h4 q-my-md" style="opacity:.6">
        {{ $t('Import JSON') }}
      </div> -->
<q-expansion-item
  group="group"
  default-opened
  class="shadow-1 overflow-hidden q-mb-md"
  style="border-radius: 7px"
  header-class="bg-grey-7 text-grey-4"
  expand-icon-class="text-grey-3"
>
        <template v-slot:header>
          <q-item-section>
            <span style="opacity:.8" class="text-bold">{{ $t('Sample Messages') }}</span>
          </q-item-section>
          <q-item-section>
            <div class="" v-if="processedLogsCount + queueIn.length">
              <q-tooltip content-style="font-size: 1rem;">
                <div class="row content-center items-center q-gutter-x-sm">
                  <q-linear-progress :value=".75" color="indigo" size="lg" stripe style="width: 5rem;" track-color="grey-10"/>
                  <div>
                    {{ $t('Inbound Queue: {queueInOverQueueInMaxSize}% ({queueIn} / {queueInMaxSize}).', { queueInOverQueueInMaxSize: (queueInMaxSize != 0 ? Math.round(queueIn.length / queueInMaxSize * 100) : '_'), queueIn: queueIn.length, queueInMaxSize}) }}
                  </div>
                </div>
                <div class="row content-center items-center q-gutter-x-sm">
                  <q-linear-progress :value=".75" color="teal" size="lg" style="width: 5rem;" track-color="grey-10" />
                  <div>
                    {{ $t('Processed Messages: {processedLogsCountOverProcessedLogsMaxSize}% ({processedLogsCount} / {processedLogsMaxSize}).', { processedLogsCountOverProcessedLogsMaxSize: (processedLogsMaxSize != 0 ? Math.round(processedLogsCount / processedLogsMaxSize * 100) : '_'), processedLogsCount: processedLogsCount, processedLogsMaxSize}) }}
                  </div>
                </div>
                <!-- <q-separator class="q-my-sm" />
                <q-icon name="o_info" color="blue-10" size="sm" class="q-mr-sm" /><span>{{ $t('Total Messages sent by the backend: {incomingLogCount}', { incomingLogCount }) }}</span><br>
                <span>{{ $t('This includes the messages already in transit when the Live Tail got stopped.') }}</span> -->
              </q-tooltip>
              <q-linear-progress :value="queueIn.length / queueInMaxSize" color="indigo" size="lg" stripe track-color="grey-9" />
              <q-linear-progress :value="processedLogsCount / processedLogsMaxSize" color="teal" size="lg" track-color="grey-9" />
            </div>
          </q-item-section>
        </template>
<q-card class="bg-grey-8">
          <q-card-section class="text-bold">
            {{ $t('Import and process JSON messages to add to the JSON mapping area below.') }}
          </q-card-section>

          <q-card-section class="text-bold q-pt-none">
            <q-btn-toggle
              v-model="manualImportMethod"
              style="border-radius: 0%;"
              :color="darkMode ? 'grey-9' : 'grey-5'"
              :text-color="darkMode ? 'grey-5' : 'grey-8'"
              :toggle-color="darkMode ? 'grey-4' : 'grey-3'"
              :toggle-text-color="darkMode ? 'grey-10' : 'grey-10'"
              no-caps
              unelevated
              :ripple = "false"
              :options="[
                {label: $t('Single Log'), value: 'single_log'},
                {label: $t('Multiple Logs'), value: 'multiple_logs'},
                {label: $t('File Import'), value: 'log_file'}
              ]"
            />

            <q-tab-panels v-model="manualImportMethod" animated class="">
              <q-tab-panel
                name="single_log"
                class="q-pl-none q-py-none"
                :class="darkMode ? 'bg-grey-8' : 'bg-grey-2'"
                style="height: calc(100vh - (19rem)); min-height: 16rem;"
              >
                <q-input
                  v-model="queueInDataEntrySingleLog"
                  outlined
                  type="textarea"
                  style="height: calc(100vh - (19.5rem)); min-height: 15.5rem;"
                  input-style="height: calc(100vh - (22.5rem)); min-height: 12.5rem;"
                  :bg-color="darkMode ? 'grey-8' : 'grey-1'"
                  :label="$t('One single JSON log at a time')"
                  :rules="[ val => isProperJson(val) || 'JSON Syntax Error(s)' ]"
                  @keypress.shift.enter.prevent="queueInAdd({values: queueInDataEntrySingleLog, manualEntry: true});"
                >
                <!-- input-class="full-height" -->
                <!-- input-style="height: calc(100vh - (33rem)); min-height: 16rem; max-height: calc(100vh - (33rem));" -->
                <!-- autogrow -->
                <!-- input-style="min-height: 16em;" -->
                  <template v-slot:after>
                    <div class="full-height justify-around q-gutter-y-lg">
                      <q-btn dense icon="playlist_add" color="primary" :disable="!isProperJson(queueInDataEntrySingleLog)" @click="queueInAdd({ values: queueInDataEntrySingleLog, manualEntry: true })" >
                        <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                          {{ $t('Process and Add to JSON Mapping Area') }}
                        </q-tooltip>
                      </q-btn>
                      <q-btn class="row" dense icon="content_copy" flat :disable="!queueInDataEntrySingleLog.length" @click="copyToClipboard(queueInDataEntrySingleLog)" >
                        <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                          {{ $t('Copy to Clipboad') }}
                        </q-tooltip>
                      </q-btn>
                      <q-btn class="row" dense icon="close" flat :disable="!queueInDataEntrySingleLog.length" @click="queueInDataEntrySingleLog = ''" >
                        <q-tooltip content-style="font-size: 1rem; min-width: 10rem;" v-if="queueInDataEntrySingleLog.length">
                          {{ $t('Clear out') }}
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </template>
                </q-input>
              </q-tab-panel>

              <q-tab-panel
                name="multiple_logs"
                class="q-pl-none q-py-none"
                :class="darkMode ? 'bg-grey-8' : 'bg-grey-2'"
                style="height: calc(100vh - (19rem)); min-height: 16rem;"
              >
                <q-input
                  v-model="queueInDataEntryMultiLog"
                  outlined
                  type="textarea"
                  :bg-color="darkMode ? 'grey-8' : 'grey-1'"
                  style="height: calc(100vh - (19.5rem)); min-height: 15.5rem;"
                  input-style="height: calc(100vh - (22.5rem)); min-height: 12.5rem;"
                  :label="$t('One JSON entry per line')"
                  :rules="[ val => val != null || 'Common, give me some JSON!' ]"
                  @keypress.shift.enter.prevent="queueInAdd({values: queueInDataEntryMultiLog, manualEntry: true});"
                >
                <!-- input-style="height: calc(100vh - (33rem)); min-height: 16rem; max-height: calc(100vh - (33rem));" -->
                <!-- autogrow -->
                  <template v-slot:after>
                    <div class="full-height justify-around q-gutter-y-lg">
                      <q-btn class="row" dense icon="playlist_add" color="primary" :disable="!queueInDataEntryMultiLog.length" @click="queueInAdd({ values: queueInDataEntryMultiLog, manualEntry: true, multiLogs: true })" >
                        <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                          {{ $t('Process and Add to JSON Mapping Area') }}
                        </q-tooltip>
                      </q-btn>
                      <q-btn class="row" dense icon="content_copy" flat :disable="!queueInDataEntryMultiLog.length" @click="copyToClipboard(queueInDataEntryMultiLog)" >
                        <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                          {{ $t('Copy to Clipboad') }}
                        </q-tooltip>
                      </q-btn>
                      <q-btn class="row" dense icon="close" flat :disable="!queueInDataEntryMultiLog.length" @click="queueInDataEntryMultiLog = ''" >
                        <q-tooltip content-style="font-size: 1rem; min-width: 10rem;" v-if="queueInDataEntryMultiLog.length">
                          {{ $t('Clear out') }}
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </template>
                </q-input>
              </q-tab-panel>

              <q-tab-panel
                name="log_file"
                class="q-pl-none q-py-none"
                :class="darkMode ? 'bg-grey-8' : 'bg-grey-2'"
                style="height: calc(100vh - (19rem)); min-height: 16rem;"
              >
                <q-file
                  outlined
                  bottom-slots
                  v-model="manualImportFileInput"
                  :bg-color="darkMode ? 'grey-8' : 'grey-1'"
                  :label="$t('Click or Drop a file here')"
                  multiple
                  counter
                  max-files="10"
                  input-style="height: calc(100vh - (22.5rem)); min-height: 12.5rem;"
                >
                  <!-- input-style="height: calc(100vh - (33rem)); min-height: 15.75em; max-height: calc(100vh - (33rem));" -->
                  <!-- input-style="min-height: 15.75em;" -->
                  <template v-slot:append>
                    <q-icon v-if="manualImportFileInput !== null" name="o_close" @click.stop="manualImportFileInput = null" class="cursor-pointer" />
                    <q-icon name="o_note_add" @click.stop />
                  </template>

                  <template v-slot:after>
                    <div class="full-height justify-around q-gutter-y-lg">
                      <q-btn class="row" dense icon="upload_file" color="primary" :disable="manualImportFileInput == null" >
                        <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                        <span v-if="manualImportFileInput !== null && manualImportFileInput.length > 1" >{{ $t('Process Files Content and Add to JSON Mapping Area') }}</span>
                        <span v-else >{{ $t('Process File Content and Add to JSON Mapping Area') }}</span>
                        </q-tooltip>
                        <q-menu>
                          <q-list style="min-width: 400px">
                            <q-item clickable v-close-popup @click="processFilesInput({ filesInput: manualImportFileInput, importAs: 'single_log_per_file' })">
                              <q-item-section avatar top>
                                <q-avatar icon="short_text" color="green-10" text-color="white" />
                              </q-item-section>

                              <q-item-section>
                                <q-item-label lines="1">{{ $t('As a Single Log') }}</q-item-label>
                                <q-item-label caption>{{ $t('One JSON Log per file') }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="processFilesInput({ filesInput: manualImportFileInput, importAs: 'log_array_per_file' })">
                              <q-item-section avatar top>
                                <q-avatar icon="data_array" color="purple-10" text-color="white" />
                              </q-item-section>

                              <q-item-section>
                                <q-item-label lines="1">{{ $t('As an Array of Logs') }}</q-item-label>
                                <q-item-label caption>{{ $t('One JSON array of Logs per file') }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="processFilesInput({ filesInput: manualImportFileInput, importAs: 'log_set_per_file' })">
                              <q-item-section avatar top>
                                <q-avatar icon="format_list_numbered" color="indigo-10" text-color="white" />
                              </q-item-section>

                              <q-item-section>
                                <q-item-label lines="1">{{ $t('As a Set of Logs') }}</q-item-label>
                                <q-item-label caption>{{ $t('One JSON log per line') }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <!-- format_list_numbered -->
                            <!-- format_align_left -->
                            <q-separator />
                            <q-item clickable v-close-popup tag="a" :href="wikiLink('ref-whatsthedifferencefileimport')" target="_blank" >
                              <q-item-section avatar top>
                                <q-avatar icon="help_outline" color="info" text-color="black" />
                              </q-item-section>

                              <q-item-section>
                                <q-item-label lines="1">{{ $t('What\'s the difference?') }}</q-item-label>
                                <q-item-label caption>{{ $t('A quick peek at the Wiki') }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                      <q-btn class="row" dense icon="close" flat :disable="manualImportFileInput == null" @click="manualImportFileInput = null" >
                        <q-tooltip content-style="font-size: 1rem; min-width: 10rem;" v-if="manualImportFileInput != null">
                          {{ $t('Clear out file selection') }}
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </template>
                </q-file>
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item
        group="group"
        class="shadow-1 overflow-hidden"
        style="border-radius: 7px"
        :header-class="darkMode ? 'bg-grey-7 text-grey-4' : 'bg-grey-5 text-grey-9'"
        :expand-icon-class="darkMode ? 'text-grey-3' : 'text-grey-10'"
      >
      <template v-slot:header>
          <q-item-section>
            <span style="opacity:.8" class="text-bold">{{ $t('JSON Mapping') }}</span>
          </q-item-section>
        </template>
      <q-card class="q-mt-md fit column">
        <div
          class="row items-stretch text-bold"
          style="min-height: 2.5rem;"
        >
          <div class="row content-center q-ml-sm" style="width: 3rem;">
            {{ $t('Freq.') }}
          </div>
          <q-separator vertical class="q-ml-xs" />
          <div
            class="content-center col row q-mx-sm q-px-sm"
          >
            {{ $t('Fields') }}
          </div>
          <q-separator vertical />
          <div
            style="width: 18rem;"
            class="row content-center q-mx-sm q-my-xs q-px-sm"
          >
            {{ $t('Mapping') }}
          </div>
          <q-separator vertical />
          <div
            style="width: 20rem;"
            class="row content-center q-mx-sm q-my-xs q-px-sm"
          >
            {{ $t('Rule Flags') }}
          </div>
          <div
            style="width: 1rem;"
          >
          </div>
        </div>
        <q-separator />
        <!-- DATA -->
          <!-- style="height: calc(100vh - (50px + 7px + 10px + 30px));" -->
        <q-virtual-scroll
          style="height: calc(100vh - (16rem)); min-height: 10rem;"
          :items="orderBy(jsonPathes, 'name')"
          virtual-scroll-item-size="49"
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
                  <q-icon name="o_stop" :color="(darkMode ? 'blue-10' : 'blue-7')" />{{ $t('Relative frequency {seenInLogCountOverMaxSeenInLog}% ({seenInLogCount} / {maxSeenInLog}).', { seenInLogCountOverMaxSeenInLog: (maxSeenInLog != 0 ? Math.round(item.seenInLogCount / maxSeenInLog * 100) : '_'), seenInLogCount: item.seenInLogCount, maxSeenInLog }) }}<br>
                  <q-icon name="o_stop" :color="(darkMode ? 'indigo-10' : 'indigo-7')" />{{ $tc('N/A | Seen in {seenInLogCountOverProcessedLogsCount}% of the logs ({seenInLogCount} / {processedLogsCount}). | Seen in {seenInLogCountOverProcessedLogsCount}% of the logs ({seenInLogCount} / {processedLogsCount}).', processedLogsCount, { seenInLogCountOverProcessedLogsCount: (processedLogsCount != 0 ? Math.round(item.seenInLogCount / processedLogsCount * 100) : '_'), seenInLogCount: item.seenInLogCount, processedLogsCount}) }}
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
                      <q-icon name="o_account_tree" color="blue-3" />
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
                            <q-chip v-if="showTypesInPopup" dense size="sm" class="q-ml-sm" :class="(value.type ? 'json-bg-type-' + value.type.toLowerCase() : '')">{{ (value.type ? $t(value.type) : '') }}</q-chip>
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
                <q-chip v-if="showTypesInMainList" dense size="sm" class="q-ml-sm" :class="(item.values && item.values.length && item.values[0].type ? 'json-bg-type-' + item.values[0].type.toLowerCase() : '')">{{ (item.values && item.values.length && item.values[0].type ? item.values[0].type : '') }}</q-chip>
              </div>
              <q-select
                dense
                standout="bg-blue-4 text-white"
                v-model="item.mappedField"
                emit-value
                map-options
                :options="mdiTagsOptions"
                :label="$t('Mapping')"
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
              <!-- <q-select
                dense
                standout="bg-blue-4 text-white"
                v-model="item.modifiers"
                :options="modifiersOptions"
                style="width: 20rem;"
                class="q-mx-sm q-my-xs"
                :popup-content-class="(darkMode ? 'bg-grey-9' : undefined)"
                :label="$t('Modifiers')"
                stack-label
                multiple
              /> -->
              <q-select
                dense
                standout="bg-blue-4 text-white"
                v-model="item.modifiers"
                emit-value
                map-options
                :options="modifiersOptions"
                :label="$t('Rule Flags')"
                stack-label
                style="width: 20rem;"
                class="q-mx-sm q-my-xs"
                :popup-content-class="(darkMode ? 'bg-grey-9' : undefined)"
                multiple
                use-input
                input-debounce="0"
                @filter="filterModifiersOptions"
                @add="updateModifiersAdd($event, item)"
              >
                <template v-slot:option="scope">
                  <q-item
                    v-bind="scope.itemProps"
                    v-on="scope.itemEvents"
                    v-if="scope.opt.label && scope.opt.label !== '<hr>'"
                    style="width: 25rem;"
                  >
                    <q-item-section>
                      <q-item-label v-if="scope.opt.value && scope.opt.value.length > 0"><div class="row justify-between"><div class="text-bold">{{ scope.opt.label }}</div><!--<div class="fixed-font text-caption">&lt;{{ scope.opt.value }}&gt;</div>--></div></q-item-label>
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
            </div>
          </template>
        </q-virtual-scroll>
      </q-card>
    </q-expansion-item>

    <!-- <q-separator />
    <div>
      {{ jsonPathes }}
    </div>

    <q-separator />
    <div>
      {{ smaTransformOutput }}
    </div> -->
    </div>

    <q-dialog v-model="showSettings" persistent>
      <q-card style="min-width: 36rem">
        <q-card-section class="row justify-between">
          <div class="text-h6">{{ $t('Settings') }}</div>
          <q-btn dense flat icon="close" color="grey-5" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="row no-wrap q-pa-md">
          <div class="column flex q-gutter-sm" style="width: 35rem">
            <div class="text-bold">{{ $t('General') }}</div>
            <!-- <q-list dense class=""> -->
              <!-- <q-item class="q-pl-none" >
                <q-toggle v-model="showTypesInMainList" :label="$t('Show types in Fields list')" />
              </q-item> -->
              <!-- <q-item class="q-pl-none" >
                <q-toggle v-model="showTypesInPopup" :label="$t('Show types in Value popups')" />
              </q-item> -->
              <!-- <q-item class="q-pl-none" >
                <q-toggle v-model="wrapSingleStringLog" :label="$t('Accept and Wrap non-JSON logs')" />
              </q-item> -->
              <lrWebConsoleToggle
                v-model="detectAndStripLogrhythmHeader"
                :label="$t('Detect and strip non-JSON headers from LogRhythm exports')"
                :color="darkMode ? '#e0e0e0' : '#666666'"
              />
              <lrWebConsoleToggle
                v-model="wrapSingleStringLog"
                :label="$t('Accept and Wrap non-JSON logs')"
                :color="darkMode ? '#e0e0e0' : '#666666'"
              />
              <lrWebConsoleToggle
                v-model="extractMessageFieldOnly"
                :label="$t('Extract Beat\'s payload field only:')"
                :color="darkMode ? '#e0e0e0' : '#666666'"
              />
              <!-- <q-item class="q-px-none" >
              </q-item> -->
              <!-- <q-item class="q-pa-none q-ma-none" >
                <lrWebConsoleToggle v-model="wrapSingleStringLog" :label="$t('Accept and Wrap non-JSON logs')" />
              </q-item>
              <q-item class="q-pl-none" >
                <lrWebConsoleToggle v-model="extractMessageFieldOnly" :label="$t('Extract Beat\'s payload field only:')" />
              </q-item> -->
              <div class="q-ml-lg q-mr-sm">
                <label class="q-mt-md">{{ $t('Beat\'s payload field path') }}</label>
                <q-input
                  class="full-width"
                  outlined
                  v-model="messageFieldPath"
                  type="text"
                  :disable="!extractMessageFieldOnly"
                  dense
                  :rules="[ val => String(val).startsWith('.') || $t('Please use the dotted path notation')]"
                  @click.stop=""
                >
                  <template v-slot:after>
                    <q-icon
                      name="o_restart_alt"
                      class="cursor-pointer"
                      @click.stop="messageFieldPath = messageFieldPathFromTemplate || '.message'"
                    >
                      <q-tooltip style="font-size: 1rem">
                        {{ $t('Reset to field path from Beat\'s template') }}
                      </q-tooltip>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <!-- <q-item style="width: 35rem;" class="q-pl-none column" >
                <q-toggle
                  v-model="extractMessageFieldOnly"
                  class="col"
                >
                  {{ $t('Extract Beat\'s payload field only:') }}
                  <q-input
                    outlined
                    v-model="messageFieldPath"
                    type="text"
                    style="width: 30rem;"
                    :label="$t('Beat\'s payload field path')"
                    :rules="[ val => String(val).startsWith('.') || $t('Please use the dotted path notation')]"
                    @click.stop=""
                  >
                    <template v-slot:append>
                      <q-icon
                        name="o_restart_alt"
                        class="cursor-pointer"
                        @click.stop="messageFieldPath = messageFieldPathFromTemplate || '.message'"
                      >
                        <q-tooltip style="font-size: 1rem">
                          {{ $t('Reset to field path from Beat\'s template') }}
                        </q-tooltip>
                      </q-icon>
                    </template>
                  </q-input>
                </q-toggle>
              </q-item> -->
              <!-- <q-item  style="width: 35rem;">
                <q-item-section avatar>
                  <q-icon name="o_speed" />
                </q-item-section>
                <q-item-section>
                  <q-slider
                    v-model="processInBackgroundMaxRate"
                    :min="1"
                    :max="10"
                    label
                    :label-value="$t('Background Process max: {processInBackgroundMaxRate} / second', { processInBackgroundMaxRate })"
                  />
                </q-item-section>
              </q-item> -->
              <div class="q-mr-md">
                <label class="q-mt-md">{{ $t('Background Process Max (messages/second)') }}</label>
                <q-slider
                  class="full-width"
                  v-model="processInBackgroundMaxRate"
                  :min="1"
                  :max="10"
                  label
                  :label-value="$t('Background Process max: {processInBackgroundMaxRate} / second', { processInBackgroundMaxRate })"
                  marker-labels
                />
              </div>
              <div class="q-mr-md">
                <label class="q-mt-md">{{ $t('Max messages in Queue') }}</label>
                <q-slider
                  class="full-width"
                  v-model="queueInMaxSize"
                  :min="1"
                  :max="2000"
                  label
                  :label-value="$t('Max messages in Queue In: {queueInMaxSize}', { queueInMaxSize })"
                  :marker-labels="{1:'1', 500:'500', 1000:'1000', 1500:'1500', 2000:'2000'}"
                />
              </div>
              <div class="q-mr-md">
                <label class="q-mt-md">{{ $t('Max messages in Processed Logs') }}</label>
                <q-slider
                  class="full-width"
                  v-model="processedLogsMaxSize"
                  :min="1"
                  :max="1000"
                  label
                  :label-value="$t('Max messages in Processed Logs: {processedLogsMaxSize}', { processedLogsMaxSize })"
                  :marker-labels="{1:'1', 250:'250', 500:'500', 750:'750', 1000:'1000'}"
                />
              </div>
              <!-- <q-item  style="width: 35rem;">
                <q-item-section avatar>
                  <q-icon name="o_download" />
                </q-item-section>
                <q-item-section>
                  <q-slider
                    v-model="queueInMaxSize"
                    :min="1"
                    :max="2000"
                    label
                    :label-value="$t('Max messages in Queue In: {queueInMaxSize}', { queueInMaxSize })"
                  />
                </q-item-section>
              </q-item> -->
              <!-- <q-item  style="width: 35rem;">
                <q-item-section avatar>
                  <q-icon name="o_download_for_offline" />
                </q-item-section>
                <q-item-section>
                  <q-slider
                    v-model="processedLogsMaxSize"
                    :min="1"
                    :max="1000"
                    label
                    :label-value="$t('Max messages in Processed Logs: {processedLogsMaxSize}', { processedLogsMaxSize })"
                  />
                </q-item-section>
              </q-item> -->
            <!-- </q-list> -->
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="row no-wrap q-pa-md">
          <div class="column flex q-gutter-sm" style="width: 35rem">
            <div class="text-bold">{{ $t('User Preferences') }}</div>
            <div class="row">
              <div class="col-3 content-center">
                <label class="">{{ $t('Display') }}</label>
              </div>
              <div class="col">
                <q-btn-toggle
                  v-model="darkMode"
                  no-caps
                  toggle-color="primary"
                  :options="[
                    {label: $t('Day'), value: false},
                    {label: $t('Night'), value: true}
                  ]"
                >
                  <q-tooltip content-style="font-size: 1em">
                    {{ $t('Switch between Light and Dark mode') }}
                  </q-tooltip>
                </q-btn-toggle>
              </div>
            </div>
            <div class="q-mr-md">
              <!-- <q-toggle
                v-model="darkMode"
                checked-icon="dark_mode"
                unchecked-icon="light_mode"
                color="grey"
                size="3rem"
                keep-color
              >
                <q-tooltip content-style="font-size: 1em">
                  {{ $t('Switch between Light and Dark mode') }}
                </q-tooltip>
              </q-toggle> -->
            </div>
            <div class="q-mr-md row">
              <div class="col-3 content-center">
                <label class="">{{ $t('Language') }}</label>
              </div>
              <div class="col">
                <q-select
                  v-model="selectedLanguage"
                  :options="langOptions"
                  outlined
                  emit-value
                  map-options
                  dense
                  style="min-width: 150px"
                >
                  <template v-slot:after>
                    <q-btn color="primary" icon="save" @click="saveLanguageSettings()" :loading="savingAction" >
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Save settings to local web browser.') }}
                      </q-tooltip>
                    </q-btn>
                  </template>
                </q-select>
              </div>
            </div>
          </div>

        </q-card-section>
        <q-card-actions
          align="right"
          class="q-py-md q-pr-lg"
          :class="darkMode ? 'bg-grey-7' : 'bg-grey-5'"
        >
          <q-btn
            :color="darkMode ? 'grey-9' : 'grey-4'"
            :text-color="darkMode ? 'grey-4' : 'grey-9'"
            label="Close"
            no-caps
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
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

import { exportFile, copyToClipboard, uid } from 'quasar'
import { mapState } from 'vuex'
import mixinSharedRightToLeft from 'src/mixins/mixin-Shared-RightToLeft'
import mixinSharedBuildSmaPolicy from 'src/mixins/mixin-Shared-BuildSmaPolicy'
import Vue2Filters from 'vue2-filters'
import { languageOptions, switchLanguageTo } from 'src/i18n/shared'
import lrWebConsoleToggle from 'components/lrWebConsole/toggle.vue'
import ConfirmDialog from 'components/Dialogs/ConfirmDialog.vue'

export default {
  name: 'PagePipelineBuilder',
  mixins: [
    mixinSharedRightToLeft, // Shared functions to deal with LTR/RTL languages
    mixinSharedBuildSmaPolicy, // Shared JQ Building functions (Filter and Transform)
    Vue2Filters.mixin
  ],
  components: { lrWebConsoleToggle },
  data () {
    return {
      darkMode: true, // Always using dark mode
      pipelineUid: uid(), // UUID of the pipeline, used as the UUID of the tail too. Needed to be able to kill it on the server
      search: '',
      showTypesInMainList: false,
      showTypesInPopup: true,
      mdiTags: [ // Built using tooling/20210420.MDI Tags and fields.xlsx // Fixed manually as per Issue #11
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
        { label: 'Bytes out', value: 'bytesout', description: 'In the context of the Impacted Host.' },
        { label: 'Kilobits in', value: 'kilobitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Kilobits out', value: 'kilobitsout', description: 'In the context of the Impacted Host.' },
        { label: 'Kilobytes in', value: 'kilobytesin', description: 'In the context of the Impacted Host.' },
        { label: 'Kilobytes out', value: 'kilobytesout', description: 'In the context of the Impacted Host.' },
        { label: 'Megabits in', value: 'megabitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Megabits out', value: 'megabitsout', description: 'In the context of the Impacted Host.' },
        { label: 'Megabyte in', value: 'megabytein', description: 'In the context of the Impacted Host.' },
        { label: 'Megabyte out', value: 'megabyteout', description: 'In the context of the Impacted Host.' },
        { label: 'Gigabits in', value: 'gigabitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Gigabits out', value: 'gigabitsout', description: 'In the context of the Impacted Host.' },
        { label: 'Gigabyte in', value: 'gigabytein', description: 'In the context of the Impacted Host.' },
        { label: 'Gigabyte out', value: 'gigabyteout', description: 'In the context of the Impacted Host.' },
        { label: 'Terabits in', value: 'terabitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Terabits out', value: 'terabitsout', description: 'In the context of the Impacted Host.' },
        { label: 'Terabytes in', value: 'terabytesin', description: 'In the context of the Impacted Host.' },
        { label: 'Terabytes out', value: 'terabytesout', description: 'In the context of the Impacted Host.' },
        { label: 'Petabits in', value: 'petabitsin', description: 'In the context of the Impacted Host.' },
        { label: 'Petabits out', value: 'petabitsout', description: 'In the context of the Impacted Host.' },
        { label: 'Petabytes in', value: 'petabytesin', description: 'In the context of the Impacted Host.' },
        { label: 'Petabytes out', value: 'petabytesout', description: 'In the context of the Impacted Host.' },
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
      // modifiersOptions: [ // Used in the Select field
      //   // 'Parse JSON',
      //   // 'Stringify JSON',
      //   // 'Fan out',
      //   'Sub Rule selector',
      //   'Sub Rule qualifier 1',
      //   'Sub Rule qualifier 2',
      //   'Sub Rule qualifier 3',
      //   'Sub Rule qualifier 4',
      //   'Timestamp selector - ISO8601 format',
      //   'Timestamp selector - Unix Timestamp format'
      // ],
      modifiers: [ // Used by filterModifiersOptions to populate modifiersOptions
        { label: 'Rule Filter', disable: true, description: '', separator: true },
        { label: 'Filter selector', value: 'Rule Filter selector', description: 'This field and its most common value (in this sample) must be present for this parsing rule to activate' },
        { label: 'Log Data Transform', disable: true, description: '', separator: true },
        { label: 'Parse JSON', value: 'Parse JSON', description: 'This field contains stringified JSON and must be parsed into a native JSON object' },
        // { label: 'Stringify JSON', value: 'Stringify JSON' },
        { label: 'Fan out', value: 'Fan out', description: 'A new raw log should be produced for each item of this array' },
        { label: 'Sub Rule Identifiers', disable: true, description: '', separator: true },
        { label: 'Sub Rule selector', value: 'Sub Rule selector', description: 'This field should be mapped to `tag1`' },
        { label: 'Sub Rule qualifier 1', value: 'Sub Rule qualifier 1', description: 'This field should be mapped to `tag2`' },
        { label: 'Sub Rule qualifier 2', value: 'Sub Rule qualifier 2', description: 'This field should be mapped to `tag3`' },
        { label: 'Sub Rule qualifier 3', value: 'Sub Rule qualifier 3', description: 'This field should be mapped to `tag4`' },
        { label: 'Sub Rule qualifier 4', value: 'Sub Rule qualifier 4', description: 'This field should be mapped to `tag5`' },
        { label: 'Timestamp', disable: true, description: '', separator: true },
        { label: 'ISO8601 format', value: 'Timestamp selector - ISO8601 format', description: 'This field is a timestamp in one of the ISO8601 formats (ie. `2024-05-24T21:01:19Z`, `2024-05-25T04:01:19+07:00`, ...)' },
        { label: 'Unix Timestamp format', value: 'Timestamp selector - Unix Timestamp format', description: 'This field is a timestamp in Unix format (ie. `1716577594`)' }
      ],
      modifiersOptions: [], // Used in the Select field
      wrapSingleStringLog: false,
      incomingLogCount: 0, // Number of lines of logs sent over the socket
      queueIn: [], // To feed from the Server Tail, or the queueInDataEntrySingleLog field
      queueProcess: {}, // The one record we are working on (coming from the queueIn, one at a time)
      processedLogs: [], // The logs, once processed
      processedLogsCount: 0, // The count of processed logs
      jsonPathes: [], // The extracted keys and values from the processedLogSample. Used for display and mapping. Saved.
      // jsonPathes: JSON.parse('[ { "name": ".", "leaf": "", "depth": 0, "seenInLogCount": 3, "values": [ { "type": "object", "count": 3 } ] }, { "name": ".\\"@metadata\\"", "leaf": "@metadata", "depth": 1, "seenInLogCount": 3, "values": [ { "type": "object", "count": 3 } ] }, { "name": ".\\"@metadata\\".\\"beat\\"", "leaf": "beat", "depth": 2, "seenInLogCount": 3, "values": [ { "value": "samplebeat", "type": "string", "count": 3 } ] }, { "name": ".\\"@metadata\\".\\"type\\"", "leaf": "type", "depth": 2, "seenInLogCount": 3, "values": [ { "value": "_doc", "type": "string", "count": 3 } ] }, { "name": ".\\"@metadata\\".\\"version\\"", "leaf": "version", "depth": 2, "seenInLogCount": 3, "values": [ { "value": "1.4.2", "type": "string", "count": 3 } ] }, { "name": ".\\"timestamp\\"", "leaf": "timestamp", "depth": 1, "seenInLogCount": 3, "values": [ { "value": "20210422T16:40:00", "type": "string", "count": 1 }, { "value": "20210422T16:43:00", "type": "string", "count": 1 }, { "value": "20210422T16:45:12", "type": "string", "count": 1 } ] }, { "name": ".\\"id\\"", "leaf": "id", "depth": 1, "seenInLogCount": 2, "values": [ { "value": "abcdef-1234", "type": "string", "count": 1 }, { "value": "xyzmno-8754", "type": "string", "count": 1 } ], "mappedField": "session" }, { "name": ".\\"destination\\"", "leaf": "destination", "depth": 1, "seenInLogCount": 1, "values": [ { "type": "object", "count": 1 } ] }, { "name": ".\\"destination\\".\\"ip\\"", "leaf": "ip", "depth": 2, "seenInLogCount": 1, "values": [ { "value": "172.16.1.2", "type": "string", "count": 1 } ], "mappedField": "dip" }, { "name": ".\\"destination\\".\\"port\\"", "leaf": "port", "depth": 2, "seenInLogCount": 1, "values": [ { "value": 443, "type": "number", "count": 1 } ], "mappedField": "dport" }, { "name": ".\\"source\\"", "leaf": "source", "depth": 1, "seenInLogCount": 1, "values": [ { "type": "object", "count": 1 } ] }, { "name": ".\\"source\\".\\"ip\\"", "leaf": "ip", "depth": 2, "seenInLogCount": 1, "values": [ { "value": "192.168.0.1", "type": "string", "count": 1 } ], "mappedField": "sip" }, { "name": ".\\"source\\".\\"port\\"", "leaf": "port", "depth": 2, "seenInLogCount": 1, "values": [ { "value": 44444, "type": "number", "count": 1 } ], "mappedField": "sport" } ]'), // The extracted keys and values from the processedLogSample. Used for display and mapping. Saved.
      // jsonPathes: JSON.parse('[ { "name": ".", "leaf": "", "depth": 0, "seenInLogCount": 4, "values": [ { "type": "object", "count": 4 } ] }, { "name": ".\\"@metadata\\"", "leaf": "@metadata", "depth": 1, "seenInLogCount": 4, "values": [ { "type": "object", "count": 4 } ] }, { "name": ".\\"@metadata\\".\\"beat\\"", "leaf": "beat", "depth": 2, "seenInLogCount": 4, "values": [ { "value": "samplebeat", "type": "string", "count": 4 } ] }, { "name": ".\\"@metadata\\".\\"type\\"", "leaf": "type", "depth": 2, "seenInLogCount": 4, "values": [ { "value": "_doc", "type": "string", "count": 4 } ] }, { "name": ".\\"@metadata\\".\\"version\\"", "leaf": "version", "depth": 2, "seenInLogCount": 4, "values": [ { "value": "1.4.2", "type": "string", "count": 4 } ] }, { "name": ".\\"timestamp\\"", "leaf": "timestamp", "depth": 1, "seenInLogCount": 4, "values": [ { "value": "20210422T16:40:00", "type": "string", "count": 2 }, { "value": "20210422T16:43:00", "type": "string", "count": 1 }, { "value": "20210422T16:45:12", "type": "string", "count": 1 } ] }, { "name": ".\\"id\\"", "leaf": "id", "depth": 1, "seenInLogCount": 2, "values": [ { "value": "abcdef-1234", "type": "string", "count": 1 }, { "value": "xyzmno-8754", "type": "string", "count": 1 } ], "mappedField": "session" }, { "name": ".\\"destination\\"", "leaf": "destination", "depth": 1, "seenInLogCount": 2, "values": [ { "type": "object", "count": 2 } ] }, { "name": ".\\"destination\\".\\"ip\\"", "leaf": "ip", "depth": 2, "seenInLogCount": 2, "values": [ { "value": "172.16.1.2", "type": "string", "count": 2 } ], "mappedField": "dip" }, { "name": ".\\"destination\\".\\"port\\"", "leaf": "port", "depth": 2, "seenInLogCount": 2, "values": [ { "value": 443, "type": "number", "count": 2 } ], "mappedField": "dport" }, { "name": ".\\"source\\"", "leaf": "source", "depth": 1, "seenInLogCount": 2, "values": [ { "type": "object", "count": 2 } ] }, { "name": ".\\"source\\".\\"ip\\"", "leaf": "ip", "depth": 2, "seenInLogCount": 2, "values": [ { "value": "192.168.0.1", "type": "string", "count": 2 } ], "mappedField": "sip" }, { "name": ".\\"source\\".\\"port\\"", "leaf": "port", "depth": 2, "seenInLogCount": 2, "values": [ { "value": 44444, "type": "number", "count": 2 } ], "mappedField": "sport" }, { "name": ".\\"destination.ip\\"", "leaf": "destination.ip", "depth": 1, "seenInLogCount": 1, "values": [ { "value": "192.168.0.1", "type": "string", "count": 1 } ], "mappedField": "dname" }, { "name": ".\\"\\"", "leaf": "", "depth": 1, "seenInLogCount": 1, "values": [ { "value": "Yep, this one is valid too", "type": "string", "count": 1 } ], "mappedField": "subject" } ]'), // The extracted keys and values from the processedLogSample. Used for display and mapping. Saved.
      // eslint-disable-next-line quotes
      // jsonPathes: JSON.parse(`[ { "name": ".", "leaf": "", "depth": 0, "seenInLogCount": 7, "values": [ { "type": "object", "count": 7 } ] }, { "name": ".\\"@metadata\\"", "leaf": "@metadata", "depth": 1, "seenInLogCount": 7, "values": [ { "type": "object", "count": 7 } ] }, { "name": ".\\"@metadata\\".\\"beat\\"", "leaf": "beat", "depth": 2, "seenInLogCount": 7, "values": [ { "value": "samplebeat", "type": "string", "count": 7 } ] }, { "name": ".\\"@metadata\\".\\"type\\"", "leaf": "type", "depth": 2, "seenInLogCount": 7, "values": [ { "value": "_doc", "type": "string", "count": 7 } ] }, { "name": ".\\"@metadata\\".\\"version\\"", "leaf": "version", "depth": 2, "seenInLogCount": 7, "values": [ { "value": "1.4.2", "type": "string", "count": 7 } ] }, { "name": ".\\"timestamp\\"", "leaf": "timestamp", "depth": 1, "seenInLogCount": 7, "values": [ { "value": "20210422T16:40:00", "type": "string", "count": 3 }, { "value": "20210422T16:43:00", "type": "string", "count": 2 }, { "value": "20210422T16:45:12", "type": "string", "count": 2 } ] }, { "name": ".\\"id\\"", "leaf": "id", "depth": 1, "seenInLogCount": 4, "values": [ { "value": "abcdef-1234", "type": "string", "count": 2 }, { "value": "xyzmno-8754", "type": "string", "count": 2 } ] }, { "name": ".\\"destination\\"", "leaf": "destination", "depth": 1, "seenInLogCount": 3, "values": [ { "type": "object", "count": 3 } ] }, { "name": ".\\"destination\\".\\"ip\\"", "leaf": "ip", "depth": 2, "seenInLogCount": 3, "values": [ { "value": "172.16.1.2", "type": "string", "count": 3 } ] }, { "name": ".\\"destination\\".\\"port\\"", "leaf": "port", "depth": 2, "seenInLogCount": 3, "values": [ { "value": 443, "type": "number", "count": 3 } ] }, { "name": ".\\"source\\"", "leaf": "source", "depth": 1, "seenInLogCount": 3, "values": [ { "type": "object", "count": 3 } ] }, { "name": ".\\"source\\".\\"ip\\"", "leaf": "ip", "depth": 2, "seenInLogCount": 3, "values": [ { "value": "192.168.0.1", "type": "string", "count": 3 } ] }, { "name": ".\\"source\\".\\"port\\"", "leaf": "port", "depth": 2, "seenInLogCount": 3, "values": [ { "value": 44444, "type": "number", "count": 3 } ] } ]`), // The extracted keys and values from the processedLogSample. Used for display and mapping. Saved.
      processInBackground: false,
      processInBackgroundMaxRate: 3, // How many queue items to process per second
      queueInMaxSize: 200, // Maximum number of log messages in queueIn
      processedLogsMaxSize: 200, // Maximum number of log messages in processedLogs
      bufferStdOut: '', // Buffer to concatenate incoming STDOUT data until we find a carriage return
      detectAndStripLogrhythmHeader: true, // Detect the syslog and Open Collector/SMA headers and strip them
      extractMessageFieldOnly: false, // Only extract the content of the .message field
      messageFieldPath: '.message', // Path of the .message / payload field for the given Beat
      messageFieldPathFromTemplate: '.message', // Default path to the .message / payload field, as per the Beat's template
      showJqOutput: false, // Collapse / Hide the JQ panel
      jqFilterOutput: '', // The automacically built JQ Filter output
      jqTransformOutput: '', // The automacically built JQ Transform output
      needsSaving: false, // Are there any un-saved changes
      saving: false, // Saving is still ongoing
      communicationLogsOutput: '', // The logs about the Socket communication, as text
      // showManualImport: false, // Collapse / Hide Manual Import panel
      manualImportMethod: 'single_log', // How is the user going to manually import Logs
      queueInDataEntrySingleLog: `{
  "@metadata":{
    "beat":"samplebeat",
    "type":"_doc",
    "version":"1.4.2"
  },
  "timestamp":"20210422T16:40:00",
  "destination":{
    "ip":"172.16.1.2",
    "port":443
  },
  "source":{
    "ip":"192.168.0.1",
    "port":44444
  },
  "someArray":[
    {
      "source":{
        "ip":"192.168.0.1",
        "port":44444
      }
    },
    {
      "source":{
        "ip":"192.168.0.1",
        "port":44444
      }
    }
  ],
  "message":"{\\"destination\\":{\\"ip\\":\\"172.16.1.3\\"},\\"destination.ip\\":\\"172.16.1.4\\",\\"destination's ip\\":\\"172.16.1.5\\",\\"\\":\\"Yep, this one is valid too\\",\\"Space Invaders\\":\\"Taito\\",\\"Doom ]|[\\":\\"id\\",\\"Yar's Revenge\\":\\"Atari\\",\\"Government \\\\\\"Intelligence\\\\\\"\\":\\"Make-Believe\\"}"
}`, // To enter log data by hand
      queueInDataEntryMultiLog: '{"@metadata":{"beat":"samplebeat","type":"_doc","version":"1.4.2"},"timestamp":"20210422T16:40:00","id":"abcdef-1234"}\r{"timestamp":"20210422T16:43:00","@metadata":{"beat":"samplebeat","type":"_doc","version":"1.4.2"},"id":"xyzmno-8754"}\r{"@metadata":{"beat":"samplebeat","type":"_doc","version":"1.4.2"},"timestamp":"20210422T16:45:12","destination":{"ip":"172.16.1.2","port":443},"source":{"ip":"192.168.0.1","port":44444}}', // To enter log data by hand, one per line
      manualImportFileInput: null, // File
      showSettings: false, // Showing up the Settings modal
      savingAction: false, // Waiting for API to respond
      selectedLanguage: this.$i18n.locale, // The selected language
      smaTransformOutput: '', // The automacically built SMA Policy Transform output
      pipelineName: uid() // The name of the pipeline
    }
  },
  computed: {
    ...mapState('mainStore', ['helpWikiUrlBase']),
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
    }, // queueProcessWindow
    langOptions () {
      return (
        languageOptions && Array.isArray(languageOptions)
          ? languageOptions.reduce(
            (accumulatedLangages, language) => {
              accumulatedLangages.push(
                {
                  ...language,
                  label: (language.value !== this.$i18n.locale
                    ? `${this.$t(language.label)} - ${language.nativeLabel}`
                    : language.nativeLabel
                  )
                }
              )
              return accumulatedLangages
            }, []
          )
          : languageOptions
      )
    // },
    // queueInMaxSizeMarkerLabels () {
    //   return {
    //     1: '1',
    //     2000: '2000'
    //   }
    }
  },

  methods: {
    // ...mapActions('mainStore', ['upsertPipeline']),
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

    filterModifiersOptions (val, update, abort) {
      if (val === '') {
        update(() => {
          this.modifiersOptions = this.modifiers
        })
      } else {
        update(() => {
          const needle = val.toLowerCase()
          this.modifiersOptions = this.modifiers.filter(v => (v.label + v.value + v.description).toLowerCase().indexOf(needle) > -1)
        })
      }
    }, // filterModifiersOptions

    updateModifiersAdd (details, item) {
      if (
        details &&
        details.value === 'Parse JSON'
      ) {
        this.$q.dialog({
          component: ConfirmDialog,
          parent: this,
          title: this.$t('Confirm parsing'),
          message: this.$t('Do you want to try to parse the values for this field, so to be able to map them individually?'),
          persistent: true,
          buttons: [
            {
              label: this.$t('No'),
              meaning: 'Cancel'
            },
            {
              label: this.$t('Yes'),
              meaning: 'OK',
              default: true
            }
          ]
        }).onOk(async () => {
          // Reparse it
          this.doReparseItem(item)
        })
      }
    }, // updateModifiersAdd

    doReparseItem (item) {
      let thingsWentWell = false
      if (
        item &&
        item.name &&
        item.values &&
        Array.isArray(item.values) &&
        item.values.length > 0
      ) {
        const properJsonValues = item.values.filter(v => v.type === 'string' && this.isProperJson(v.value))
        if (properJsonValues && properJsonValues.length > 0) {
          // We have a proper JSON to parse
          // Reparse it
          let newJsonToParseTop = ''
          let newJsonToParseBottom = ''

          // Break down the full path into bits
          const pathMatches = String(item.name).match(/(\.?\[.*?\])/g)

          // Reconstruct the path
          pathMatches.forEach((match, index) => {
            newJsonToParseTop = newJsonToParseTop + ''
            newJsonToParseBottom = newJsonToParseBottom + ''

            if (match.startsWith('.')) {
              const fieldName = match.substring(3, match.length - 2)
              newJsonToParseTop = newJsonToParseTop + `{"${fieldName}":`
              newJsonToParseBottom = '}' + newJsonToParseBottom
            } else {
              // Array!
              const arrayPosition = Number(match.substring(1, match.length - 1) || '0')
              newJsonToParseTop = newJsonToParseTop + '['
              for (let i = 0; i < arrayPosition; i++) {
                newJsonToParseTop = newJsonToParseTop + '{},'
              }
              newJsonToParseBottom = ']' + newJsonToParseBottom
            }
          })
          // console.log('updateModifiersAdd - PARSE T', newJsonToParseTop)
          // console.log('updateModifiersAdd - PARSE V', item.values[0].value)
          // console.log('updateModifiersAdd - PARSE B', newJsonToParseBottom)

          // Build the full JSON sample set
          item.values.forEach((value, index) => {
            const queueInDataEntrySingleLog = `${newJsonToParseTop}${value.value}${newJsonToParseBottom}`
            // console.log('updateModifiersAdd - PARSE >', `(${index}) ${queueInDataEntrySingleLog}`)
            this.queueInAdd({ values: queueInDataEntrySingleLog, manualEntry: true })
          })

          // {
          //   "name":".['someArray'][1].['source'].['port']",
          //   "leaf":"port",
          //   "depth":4,
          //   "seenInLogCount":2,
          //   "values":[
          //     {
          //       "value":44444,
          //       "type":"number",
          //       "count":2
          //     }
          //   ]
          // }

          // Matches:
          // [
          //   ".['someArray']",
          //   "[1]",
          //   ".['source']",
          //   ".['message']"
          // ]

          // Target result:
          // {
          //   "someArray":[
          //     {
          //     },
          //     {
          //       "source":{
          //         "port":8888
          //       }
          //     }
          //   ]
          // }
          thingsWentWell = true
        }
      }

      if (!thingsWentWell) {
        this.$q.notify({
          icon: 'comments_disabled',
          message: this.$t('No proper JSON found to parse for field:'),
          caption: (item && item.name ? item.name : 'Unknown field'),
          color: 'negative'
        })
      }
    },
    clearProcessedLogs () {
      this.$q.dialog({
        component: ConfirmDialog,
        parent: this,
        title: this.$t('Confirm reset'),
        message: this.$t('This will clear all the processed logs as well as all the mapping done so far. Are you sure?'),
        persistent: true
      }).onOk(async () => {
        this.resetData()
      })
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
      }
      return isValid
    },

    processFilesInput ({ filesInput, importAs }) {
      // Import one or more files into the Queue

      // importAs:
      // - single_log_per_file
      // - log_array_per_file
      // - log_set_per_file

      if (filesInput == null) {
        console.log('[processFilesInput] - 🟠 - No file selected.')
      } else {
        // Deal with multiple or single file(s)
        if (Array.isArray(filesInput)) {
          filesInput.forEach(singleFileInput => {
            this.processFileInput({ singleFileInput: singleFileInput, importAs })
          })
        } else {
          this.processFileInput({ singleFileInput: filesInput, importAs })
        }
      }
    },

    async processFileInput ({ singleFileInput, importAs }) {
      // Import one file into the Queue

      // importAs:
      // - single_log_per_file
      // - log_array_per_file
      // - log_set_per_file

      if (singleFileInput) {
        const fileContent = await singleFileInput.text()
        if (importAs === 'single_log_per_file') {
          this.queueInAdd({ values: fileContent, manualEntry: true, multiLogs: false })
        } else if (importAs === 'log_array_per_file') {
          try {
            this.queueInAdd({ values: JSON.parse(fileContent), manualEntry: true, multiLogs: null })
          } catch {
            // Not proper JSON
            console.log('[processFileInput] - 🟠 - File contentis not a proper JSON Array')
          }
        } else if (importAs === 'log_set_per_file') {
          this.queueInAdd({ values: fileContent, manualEntry: true, multiLogs: true })
        } else {
          console.log(`[processFileInput] - 🟠 - Unknowm importAs "${importAs}".`)
        }
      } else {
        console.log('[processFileInput] - 🟠 - No file selected.')
      }
    },

    copyToClipboard (value) {
      copyToClipboard(value)
    },

    //         #######  ##     ## ######## ##     ## ########
    //        ##     ## ##     ## ##       ##     ## ##
    //        ##     ## ##     ## ##       ##     ## ##
    //        ##     ## ##     ## ######   ##     ## ######
    //        ##  ## ## ##     ## ##       ##     ## ##
    //        ##    ##  ##     ## ##       ##     ## ##
    //        ##### ##  #######  ########  #######  ########

    detectAndStripLogrhythmHeaderFromLog (log) {
      // Detect and strip the LogRhythm header from the log
      // The header is in the form of:
      // 06 11 2024 08:21:58 172.17.5.11 <USER:NOTE> 2024-06-11T14:21:58.114Z sysmon |beatname=filebeat|fullyqualifiedbeatname=filebeat|object=labxm|original_message={"@timestamp":"2024-06-11T14:21:58.114Z","@metadata":{"beat":"filebeat","type":"_doc","version":"8.14.0"},"agent":{"version":"8.14.0","ephemeral_id":"5fd33e0e-0e30-43c3-9bf9-4253b617e699","id":"5b233d53-dda1-4e1f-a124-1dff75a04afd","name":"LabXM","type":"filebeat"},"log":{"offset":4174963,"file":{"path":"C:\\Program Files\\LogRhythm\\LogRhythm Mediator Server\\logs\\scmedsvr.log","idxhi":"87556096","idxlo":"82806","vol":"2354678369"}},"message":"06/10/2024 18:22:53.170130 [LabXM] Updated Filter Proxies for 0 Lists","input":{"type":"filestream"},"ecs":{"version":"8.0.0"},"host":{"hostname":"labxm","architecture":"x86_64","os":{"platform":"windows","version":"10.0","family":"windows","name":"Windows Server 2022 Datacenter","kernel":"10.0.20348.2461 (WinBuild.160101.0800)","build":"20348.2461","type":"windows"},"id":"97371520-4c83-4288-b405-3efe0c346f59","ip":["fe80::27ff:37fc:e9b7:9cec","172.17.5.11"],"mac":["00-50-56-95-D9-B4"],"name":"labxm"}}|
      // Regex:
      // /^.*?\|original_message=(.*)\|$/s

      if (this.detectAndStripLogrhythmHeader) {
        // Run the RegEx against the log
        const logMatch = String(log || '').match(/^.*?\|original_message=(.*)\|$/s)

        // If we have a match, return it
        if (logMatch && logMatch.length > 1) {
          return logMatch[1]
        }
      }

      // otherwise return the raw log
      return log
    }, // detectAndStripLogrhythmHeaderFromLog

    queueInAdd ({ values, manualEntry, multiLogs }) {
      if (typeof values === 'string') {
        // deal with it as Strings

        if (multiLogs === true) {
          // Dealing with multiple Logs, one per line

          // Call itself while providing an Array of Strings
          this.queueInAdd({ values: values.split(/\r|\n/g), manualEntry })
        } else {
          // Dealing with Single Log

          // Increase counter
          this.incomingLogCount++

          // if (this.tailEnabled && (this.queueIn.length < this.queueInMaxSize)) {
          if (values.length > 0) {
            try {
              // this.queueIn.push(JSON.parse(values))
              this.queueInPush(JSON.parse(this.detectAndStripLogrhythmHeaderFromLog(values)), manualEntry)
            } catch (error) {
              // Not proper JSON
              console.log(`String is not a proper JSON. Reason: ${error.message}`)
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
                this.queueInPush(JSON.parse(this.detectAndStripLogrhythmHeaderFromLog(value)), manualEntry)
              } catch (error) {
                // Not proper JSON
                console.log(`String is not a proper JSON. Reason: ${error.message}`)
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
      // if ((this.tailEnabled && (this.queueIn.length < this.queueInMaxSize)) | manualEntry) {
      if (manualEntry) {
        if (this.extractMessageFieldOnly && this.messageFieldPath && this.messageFieldPath.length && this.messageFieldPath.startsWith('.')) {
          // Remove the starting dot
          const messageFieldPathLeaf = this.messageFieldPath.replace(/^\./, '')
          if (!value[messageFieldPathLeaf]) {
            console.log(`No ${this.messageFieldPath} found in log object`)
          }
          try {
            this.queueIn.push(JSON.parse(value[messageFieldPathLeaf]))
            // Kick off the Background processing
            if (this.processInBackground !== true) {
              this.processInBackground = true
            }
          } catch {
            // Not proper JSON
            console.log(`Field ${this.messageFieldPath} does not contain proper JSON`)
          }
        } else {
          this.queueIn.push(value)
          // Kick off the Background processing
          if (this.processInBackground !== true) {
            this.processInBackground = true
          }
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

        // Check the status of the QueueIn, and turn off the Background processing if it's empty
        if (this.processInBackground === true && this.queueIn.length === 0) {
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
              // Escape and quote the key, to deal with funny edge cases

              // Escape any single quotes, as we will need them later
              const escappedKey = String(key).replaceAll('\'', '\\\'')

              // Then quote stuff up
              thisKeyPath = (isParentAnArray ? parentPath + '[' + key + ']' : parentPath + '.' + `['${escappedKey}']`)

              // Upsert it first
              this.upsertToJsonPaths(
                {
                  thisKeyPath: thisKeyPath,
                  depth: depth,
                  key: key,
                  value: leaf[key]
                }
              )

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

      // If we find `.['@metadata'].['beat']`, we automatically flag it as a Rule Filter selector
      if (thisPath.name === '.[\'@metadata\'].[\'beat\']') {
        // Make sure we have a modifiers array
        if (!(thisPath.modifiers && Array.isArray(thisPath.modifiers))) {
          thisPath.modifiers = []
        }
        // Add it to the modifiers array (if not already in)
        if (thisPath.modifiers.indexOf('Rule Filter selector') < 0) {
          thisPath.modifiers.push('Rule Filter selector')
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

    processLogSampleInBackground () {
      this.queueProcessAdd({ fromArray: this.queueIn })
      this.processLogSample({ options: { cleanQueueProcessAfterProcess: true } })

      // Schedule the next tick
      if (this.processInBackground) {
        this.scheduleNextBackgroundProcess()
      }
    }, // processLogSampleInBackground

    //      ######  ##     ##    ###          ########   #######  ##       ####  ######  ##    ##
    //     ##    ## ###   ###   ## ##         ##     ## ##     ## ##        ##  ##    ##  ##  ##
    //     ##       #### ####  ##   ##        ##     ## ##     ## ##        ##  ##         ####
    //      ######  ## ### ## ##     ##       ########  ##     ## ##        ##  ##          ##
    //           ## ##     ## #########       ##        ##     ## ##        ##  ##          ##
    //     ##    ## ##     ## ##     ##       ##        ##     ## ##        ##  ##    ##    ##
    //      ######  ##     ## ##     ##       ##         #######  ######## ####  ######     ##

    exportSmaPolicy () {
      // Steps:
      // 1. Build SMA Policy
      // 2. Push the policy as file to download locally

      this.smaTransformOutput = this.buildSmaPolicyTransformFromParams({
        pipelineUid: this.pipelineUid,
        pipelineName: this.pipelineName,
        beatName: this.beatName || 'somebeat',
        extractMessageFieldOnly: this.extractMessageFieldOnly,
        messageFieldPath: this.messageFieldPath,
        jsonPathes: this.jsonPathes
      })

      // Fallback file extension and Mime type (if not possible to assign a better one based on Shipper)
      const fileExtension = '.json'
      const fileMimeType = 'application/json'

      // const fileName = `sma_policy.${this.beatName}_${this.pipelineName}_${this.pipelineUid}${fileExtension}`
      const fileName = `sma_policy.${this.beatName}${fileExtension}`

      const notificationPopupId = this.$q.notify({
        icon: 'cloud_download',
        message: this.$t('Downloading SMA Policy file...'),
        caption: fileName,
        type: 'ongoing'
      })

      // Push file out
      const status = exportFile(fileName, JSON.stringify(this.smaTransformOutput, null, 2), fileMimeType)

      if (status === true) {
        notificationPopupId({
          type: 'positive',
          color: 'positive',
          icon: 'check',
          message: this.$t('SMA Policy file downloaded'),
          caption: fileName
        })
      } else {
        notificationPopupId({
          type: 'negative',
          color: 'negative',
          icon: 'o_report_problem',
          message: this.$t('Problem while downloading SMA Policy file:'),
          caption: status
        })
        console.log('Error: ' + status)
      }
    },

    //     ##      ## #### ##    ## ####
    //     ##  ##  ##  ##  ##   ##   ##
    //     ##  ##  ##  ##  ##  ##    ##
    //     ##  ##  ##  ##  #####     ##
    //     ##  ##  ##  ##  ##  ##    ##
    //     ##  ##  ##  ##  ##   ##   ##
    //      ###  ###  #### ##    ## ####

    wikiLink (reference) {
      // 'whatTheDifferenceLogArrayLogSet'
      return this.helpWikiUrlBase + reference
    },

    //     ########     ###     ######  ##    ##  ######   ########   #######  ##     ## ##    ## ########      ######   ######  ##     ## ######## ########  ##     ## ##       ######## ########
    //     ##     ##   ## ##   ##    ## ##   ##  ##    ##  ##     ## ##     ## ##     ## ###   ## ##     ##    ##    ## ##    ## ##     ## ##       ##     ## ##     ## ##       ##       ##     ##
    //     ##     ##  ##   ##  ##       ##  ##   ##        ##     ## ##     ## ##     ## ####  ## ##     ##    ##       ##       ##     ## ##       ##     ## ##     ## ##       ##       ##     ##
    //     ########  ##     ## ##       #####    ##   #### ########  ##     ## ##     ## ## ## ## ##     ##     ######  ##       ######### ######   ##     ## ##     ## ##       ######   ########
    //     ##     ## ######### ##       ##  ##   ##    ##  ##   ##   ##     ## ##     ## ##  #### ##     ##          ## ##       ##     ## ##       ##     ## ##     ## ##       ##       ##   ##
    //     ##     ## ##     ## ##    ## ##   ##  ##    ##  ##    ##  ##     ## ##     ## ##   ### ##     ##    ##    ## ##    ## ##     ## ##       ##     ## ##     ## ##       ##       ##    ##
    //     ########  ##     ##  ######  ##    ##  ######   ##     ##  #######   #######  ##    ## ########      ######   ######  ##     ## ######## ########   #######  ######## ######## ##     ##

    scheduleNextBackgroundProcess () {
      this.backgroundProcessInterval = setTimeout(
        this.processLogSampleInBackground
        , 1000 / this.processInBackgroundMaxRate
      )
    },

    unscheduleNextBackgroundProcess () {
      clearTimeout(this.backgroundProcessInterval)
      this.backgroundProcessInterval = null
    },

    //     ##          ###    ##    ##  ######   ##     ##    ###     ######   ########
    //     ##         ## ##   ###   ## ##    ##  ##     ##   ## ##   ##    ##  ##
    //     ##        ##   ##  ####  ## ##        ##     ##  ##   ##  ##        ##
    //     ##       ##     ## ## ## ## ##   #### ##     ## ##     ## ##   #### ######
    //     ##       ######### ##  #### ##    ##  ##     ## ######### ##    ##  ##
    //     ##       ##     ## ##   ### ##    ##  ##     ## ##     ## ##    ##  ##
    //     ######## ##     ## ##    ##  ######    #######  ##     ##  ######   ########

    saveLanguageSettings () {
      switchLanguageTo(this, this.selectedLanguage)
    }
  },

  mounted () {
    this.mdiTagsOptions = this.mdiTags
  },

  watch: {
    processInBackground: {
      handler () {
        if (this.processInBackground) {
          this.scheduleNextBackgroundProcess()
        } else {
          this.unscheduleNextBackgroundProcess()
        }
      },
      deep: false
    }, // processInBackground
    jsonPathes: {
      handler () {
        this.needsSaving = true
        // if (this.showJqOutput) {
        //   this.buildJqTransform()
        // }
      },
      deep: true
    }
  },

  beforeDestroy () {
    clearInterval(this.backgroundProcessInterval)
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
