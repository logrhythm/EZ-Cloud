<template>
  <q-page class="q-pa-sm">
    <q-header elevated style="background: var(--q-color-dark);">
      <q-toolbar class="q-gutter-x-sm">
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
        <q-btn no-caps flat dense icon="save" label="Save" color="primary" />
        <q-btn no-caps flat dense icon="restore" label="Reverse to last saved" @click="reverseToLastSaved()" />
        <q-separator vertical />
        <q-btn no-caps flat dense icon="play_circle_outline" label="Start Live Tail" color="secondary" @click="tailEnabled = true" v-if="!tailEnabled" />
        <q-btn no-caps flat dense icon="stop" label="Stop Live Tail" @click="tailEnabled = false" v-else />
        <q-separator vertical />
        <q-btn no-caps flat dense icon="search" label="Start background processing" color="secondary" @click="processInBackground = true" v-if="!processInBackground" />
        <q-btn no-caps flat dense icon="search_off" label="Stop background processing" @click="processInBackground = false" v-else />
        <q-separator vertical />
        <q-btn no-caps flat dense icon="file_download" label="Export JQ" />
        <q-btn no-caps flat dense icon="visibility" label="Show JQ" v-if="!showJqOutput" @click="buildJqFilter(); buildJqTransform(); showJqOutput = true" />
        <q-btn no-caps flat dense icon="visibility_off" label="Hide JQ output" v-else @click="showJqOutput = false" />

        <q-toolbar-title style="opacity:.4" class="text-center">Pipeline Builder</q-toolbar-title>

        <q-btn no-caps flat dense icon="pending" label="Advanced">
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">Advanced</div>
                <q-toggle v-model="showExtraDetails" label="Show extra details" />
                <q-toggle v-model="showQueues" label="Show Queues" />
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
                  <q-toggle v-model="extractMessageFieldOnly" label="Extract Filebeat '.message' only" />
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
        <span class="text-bold">tailId: </span>{{ pipelineUid }}
      </div> -->
      <div class="">
          <q-tooltip content-style="font-size: 1rem;">
            <!-- <span class="text-bold">Queues / Stacks sizes: </span>{{ incomingLogCount }} / {{ queueIn.length }} / {{ maxSeenInLog }} / {{ processedLogsCount }} / {{ processedLogs.length }} -->
            <div class="row content-center items-center q-gutter-x-sm">
              <q-linear-progress :value=".75" color="indigo" size="lg" stripe style="width: 5rem;" track-color="grey-10"/>
              <div>
                Inbound Queue: <span style="font-weight: bold;">{{ Math.round(queueIn.length / queueInMaxSize * 100) }}%</span> ({{ queueIn.length }}&nbsp;/&nbsp;{{ queueInMaxSize }}).
              </div>
            </div>
            <div class="row content-center items-center q-gutter-x-sm">
              <q-linear-progress :value=".75" color="teal" size="lg" style="width: 5rem;" track-color="grey-10" />
              <div>
                Processed Messages: <span style="font-weight: bold;">{{ Math.round(processedLogsCount / processedLogsMaxSize * 100) }}%</span> ({{ processedLogsCount }}&nbsp;/&nbsp;{{ processedLogsMaxSize }}).
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
      <q-card class="q-mt-md" v-show="showQueues">
        <q-card-section class="text-h4" style="opacity:.4">
          Queues
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-caption">
            Manual input (one log at a time)
          </div>
          <q-input
            v-model="queueInDataEntry"
            filled
            autogrow
            label="queueInDataEntry"
            @keypress.shift.enter.prevent="queueInAdd({values: queueInDataEntry});"
          >
            <template v-slot:after>
              <q-btn round dense flat icon="add" @click="queueInAdd({ values: queueInDataEntry })" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-section>
          <div class="text-caption">
            Input Q
          </div>
          <q-input
            v-model="queueInWindow"
            filled
            autogrow
            readonly
            label="queueIn"
          >
            <template v-slot:after>
              <div class="column">
                <q-btn round dense flat icon="input" @click="queueProcessAdd({ fromArray: queueIn })" :disable="Object.keys(queueProcess).length > 0" />
                <q-btn round dense flat icon="close" @click="queueIn=[]" :disable="queueIn.length == 0" color="red" />
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
            readonly
            label="queueProcess"
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
        >
          <template v-slot="{ item, index }">
            <div
              :key="index"
              class="row items-stretch q-my-none q-py-none json-path-line"
              style="min-height: 1.5rem;"
            >
              <div class="row content-center q-mr-sm q-gutter-y-none" style="width: 3rem;">
                <q-tooltip content-style="font-size: 1em;">
                  <q-icon name="stop" color="blue-10" />Relative frequency <span style="font-weight: bold;">{{ Math.round(item.seenInLogCount / maxSeenInLog * 100) }}%</span> ({{ item.seenInLogCount }}&nbsp;/&nbsp;{{ maxSeenInLog }}).<br>
                  <q-icon name="stop" color="indigo-10" />Seen in <span style="font-weight: bold;">{{ Math.round(item.seenInLogCount / processedLogsCount * 100) }}%</span> of the logs ({{ item.seenInLogCount }}&nbsp;/&nbsp;{{ processedLogsCount }}).
                </q-tooltip>
                <q-linear-progress :value="item.seenInLogCount / maxSeenInLog" color="blue-10" />
                <q-linear-progress :value="item.seenInLogCount / processedLogsCount" color="indigo-10" />
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
                  class="json-style-leaf text-bold text-light-blue-3"
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
                standout="bg-grey-8 text-white"
                bg-color="dark"
                v-model="item.mappedField"
                emit-value
                map-options
                :options="mdiTagsOptions"
                label="Mapping"
                stack-label
                style="width: 18rem;"
                class="q-mx-sm q-my-xs"

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
                standout="bg-grey-8 text-white"
                bg-color="dark"
                v-model="item.modifiers"
                :options="['Parse JSON', 'Stringify JSON', 'Fan out', 'Sub Rule selector']"
                style="width: 20rem;"
                class="q-mx-sm q-my-xs"
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
            :label="'is_' + beatName + '.jq'"
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
import { mapState } from 'vuex'
import Vue2Filters from 'vue2-filters'

export default {
  name: 'PagePipelineBuilder',
  data () {
    return {
      socket: this.$socket,
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
      queueIn: [], // To feed from the Server Tail, or the queueInDataEntry field
      queueInDataEntry: '{"timestamp":"20210422T16:40:00","id":"abcdef-1234","code":15,"destination":{"ip":"172.16.1.2","port":443},"source":{"ip":"192.168.0.1","port":44444},"bam":"boop","values":[{"type":"Object","count":4},{"type":"Plane","count":25,"value":"A320"}]}', // To enter log data by hand
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
      extractMessageFieldOnly: true,
      showJqOutput: false,
      jqFilterOutput: '',
      jqTransformOutput: ''
    }
  },
  mixins: [Vue2Filters.mixin],
  computed: {
    ...mapState('mainStore', ['loggedInUser', 'pipelines', 'jqFilterTemplate', 'jqTransformTemplate']),
    pipelineName () {
      const pipeline = this.pipelines.find(p => p.uid === this.pipelineUid)
      return (pipeline && pipeline.name && pipeline.name.length ? pipeline.name : '')
    },
    beatName () {
      // Beat Name will be PipleineName in lower case and without space no double quote
      return this.pipelineName
        .replace(/[ "]/g, '_')
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

    //        ##     ##    ###    ##    ## ########  ##       ########  ######   #######   ######  ##    ## ######## ########  #######  ##    ## ########    ###    #### ##       ##        #######   ######
    //        ##     ##   ## ##   ###   ## ##     ## ##       ##       ##    ## ##     ## ##    ## ##   ##  ##          ##    ##     ## ###   ##    ##      ## ##    ##  ##       ##       ##     ## ##    ##
    //        ##     ##  ##   ##  ####  ## ##     ## ##       ##       ##       ##     ## ##       ##  ##   ##          ##    ##     ## ####  ##    ##     ##   ##   ##  ##       ##       ##     ## ##
    //        ######### ##     ## ## ## ## ##     ## ##       ######    ######  ##     ## ##       #####    ######      ##    ##     ## ## ## ##    ##    ##     ##  ##  ##       ##       ##     ## ##   ####
    //        ##     ## ######### ##  #### ##     ## ##       ##             ## ##     ## ##       ##  ##   ##          ##    ##     ## ##  ####    ##    #########  ##  ##       ##       ##     ## ##    ##
    //        ##     ## ##     ## ##   ### ##     ## ##       ##       ##    ## ##     ## ##    ## ##   ##  ##          ##    ##     ## ##   ###    ##    ##     ##  ##  ##       ##       ##     ## ##    ##
    //        ##     ## ##     ## ##    ## ########  ######## ########  ######   #######   ######  ##    ## ########    ##     #######  ##    ##    ##    ##     ## #### ######## ########  #######   ######

    handleSocketOnTailLog (payload) {
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
        if (typeof payload.payload === 'string') {
          console.log(payload.payload)
          // const newPayload = []
          // // eslint-disable-next-line quotes
          // payload.payload.split("\n").forEach(lr => {
          //   console.log(lr)
          // })
          // this.queueInAdd({ values: newPayload })
        } else {
          console.log(payload.payload)
          // this.queueInAdd({ values: payload.payload })
        }
      }

      // If the remote job died, turn the Tail off here too
      if (
        payload.code &&
        (
          payload.code === 'END' ||
          payload.code === 'EXIT'
        ) &&
        payload.tailId &&
        payload.tailId === this.pipelineUid
      ) {
        this.tailEnabled = false
      }
    },

    //         #######  ##     ## ######## ##     ## ########
    //        ##     ## ##     ## ##       ##     ## ##
    //        ##     ## ##     ## ##       ##     ## ##
    //        ##     ## ##     ## ######   ##     ## ######
    //        ##  ## ## ##     ## ##       ##     ## ##
    //        ##    ##  ##     ## ##       ##     ## ##
    //        ##### ##  #######  ########  #######  ########

    queueInAdd ({ values }) {
      if (typeof values === 'string') {
        // deal with it as Strings

        // Increase counter
        this.incomingLogCount++

        // if (this.tailEnabled && (this.queueIn.length < this.queueInMaxSize)) {
        if (values.length > 0) {
          try {
            // this.queueIn.push(JSON.parse(values))
            this.queueInPush(JSON.parse(values))
          } catch {
            // Not proper JSON
            console.log('String is not a proper JSON')
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
                this.queueInPush(JSON.parse(value))
              } catch {
                // Not proper JSON
                console.log('String is not a proper JSON')
              }
            }
          } else {
            this.queueInPush(value)
          }
        })
      } else if (typeof values === 'object') {
        // deal with it as a single JSON object

        // Increase counter
        this.incomingLogCount++

        this.queueInPush(values)
      }
    }, // queueInAdd

    queueInPush (value) {
      if (this.tailEnabled && (this.queueIn.length < this.queueInMaxSize)) {
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
      if (this.socket.connected) {
        this.socket.emit('tail.init', { tailId: this.pipelineUid, path: '/tmp/mistnet.log' })
      }
    },

    killTail () {
      if (this.socket.connected) {
        this.socket.emit('tail.kill', { tailId: this.pipelineUid })
      }
    },

    listTails () {
      if (this.socket.connected) {
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
      let jqFilter = ''

      // First pass to change the headers and static fields
      jqFilter = this.jqFilterTemplate
        .replace(/{{EZ_generation_timestamp}}/g, (new Date()).toISOString())
        .replace(/{{EZ_generation_user}}/g, this.loggedInUser)
        .replace(/{{EZ_stream_name_placeholder}}/g, this.pipelineName)
        .replace(/{{EZ_stream_id_placeholder}}/g, this.pipelineUid)
        .replace(/{{EZ_beatname_placeholder}}/g, this.beatName)

      // And ship it back
      this.jqFilterOutput = jqFilter
    },

    buildJqTransform () {
      let jqTransform = ''

      // First pass to change the headers and static fields
      jqTransform = this.jqTransformTemplate
        .replace(/{{EZ_generation_timestamp}}/g, (new Date()).toISOString())
        .replace(/{{EZ_generation_user}}/g, this.loggedInUser)
        .replace(/{{EZ_stream_name_placeholder}}/g, this.pipelineName)
        .replace(/{{EZ_stream_id_placeholder}}/g, this.pipelineUid)
        .replace(/{{EZ_beatname_placeholder}}/g, this.beatName)

      // What do we use for original_message?
      let originalMessagePlaceholder = '. | tojson'
      let messagePlaceholder = '.input'
      if (this.extractMessageFieldOnly) {
        originalMessagePlaceholder = '.message'
        messagePlaceholder = '.message'
      }

      // Fanning out the log
      const flattenArrays = [] // array of the IDs
      const flattenArrayPlaceholder = []
      const flattenArrayPlaceholderTemplate = '        "{{EZ_flatten_array_id}}": flatten_array({{EZ_message_root}}{{EZ_flatten_array_field_path}}),'
      const flattenArrayAddFieldPlaceholderTemplate = '    add_field({{EZ_flatten_array_name_placeholder}}{{EZ_flatten_array_field_doted_path_placeholder}}; .output.{{EZ_mdi_field_placeholder}}) |'
      const flattenArrayAddFieldPlaceholder = [] // multiple strings

      // Mapping of the fields
      const addFieldPlaceholderTemplate = '    add_field({{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}}; .output.{{EZ_mdi_field_placeholder}}) |'
      const addFieldPlaceholder = [] // multiple strings

      // MDI Sub-rules
      const subRulesAddFieldPlaceholderTemplate = '    add_field({{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}}; .output.{{EZ_mdi_tag_placeholder}}) |'
      const subRulesAddFieldPlaceholder = []

      let messageRoot = ''
      if (this.extractMessageFieldOnly) {
        messageRoot = '.message | fromjson | '
      }

      // Fanning out the log
      this.jsonPathes.forEach(path => {
        if (path.modifiers && path.modifiers.length) {
          path.modifiers.forEach(pm => {
            if (pm === 'Fan out') {
              const flattenArrayId = 'flatten_array_' + path.name.replace(/[^a-zA-Z0-9]/g, '_')
              flattenArrays.push(path.name)

              flattenArrayPlaceholder.push(
                flattenArrayPlaceholderTemplate
                  .replace(/{{EZ_flatten_array_id}}/g, flattenArrayId)
                  .replace(/{{EZ_message_root}}/g, messageRoot)
                  .replace(/{{EZ_flatten_array_field_path}}/g, path.name)
              )
            } else if (pm === 'Sub Rule selector') {
              subRulesAddFieldPlaceholder.push(
                subRulesAddFieldPlaceholderTemplate
                  .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
                  .replace(/{{EZ_field_doted_path_placeholder}}/g, path.name)
                  .replace(/{{EZ_mdi_tag_placeholder}}/g, 'tag1')
              )
            }
          })
        }
      })

      this.jsonPathes.forEach(path => {
        // Mapping of the fields
        if (path.mappedField && path.mappedField.length) {
          // First check if the field is part (sub branch) of a Fanned out branch
          let isSubFannedOutBranch = false
          let flattenArrayPathName = ''
          flattenArrays.forEach(fa => {
            if (
              path.name &&
              path.name.indexOf(fa) === 0 &&
              fa.length > flattenArrayPathName.length
            ) {
              flattenArrayPathName = fa
              isSubFannedOutBranch = true
            }
          })

          if (isSubFannedOutBranch) {
            // Field is a Sub of a Fanned out branch
            flattenArrayAddFieldPlaceholder.push(
              flattenArrayAddFieldPlaceholderTemplate
                .replace(
                  /{{EZ_flatten_array_name_placeholder}}/g,
                  'flatten_array_' + flattenArrayPathName.replace(/[^a-zA-Z0-9]/g, '_') // rebuild the flatten array ID
                )
                .replace(
                  /{{EZ_flatten_array_field_doted_path_placeholder}}/g,
                  path.name
                    .replace(flattenArrayPathName, '') // Remove the part of the path that is the flatten array's own path
                    .replace(/\[\d+\]/, '') // remove any array numerical ID (like [0], [1], etc...)
                )
                .replace(/{{EZ_mdi_field_placeholder}}/g, path.mappedField)
            )
          } else {
            // Standard field
            addFieldPlaceholder.push(
              addFieldPlaceholderTemplate
                .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
                .replace(/{{EZ_field_doted_path_placeholder}}/g, path.name)
                .replace(/{{EZ_mdi_field_placeholder}}/g, path.mappedField)
            )
          }
        }

        // // MDI Sub-rules
        // if (path.mappedField && path.mappedField.length && path.mappedField.indexOf('tag') === 0) {
        //   subRulesAddFieldPlaceholder.push(
        //     subRulesAddFieldPlaceholderTemplate
        //       .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
        //       .replace(/{{EZ_field_doted_path_placeholder}}/g, path.name)
        //       .replace(/{{EZ_mdi_tag_placeholder}}/g, path.mappedField)
        //   )
        // }
      })

      // // const addFieldPlaceholderTemplate = '    add_field({{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}}; .output.{{EZ_mdi_field_placeholder}}) |'
      // // const addFieldPlaceholder = [] // multiple strings
      // this.jsonPathes.forEach(path => {
      //   // // Mapping of the fields
      //   // if (path.mappedField && path.mappedField.length) {
      //   //   addFieldPlaceholder.push(
      //   //     addFieldPlaceholderTemplate
      //   //       .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
      //   //       .replace(/{{EZ_field_doted_path_placeholder}}/g, path.name)
      //   //       .replace(/{{EZ_mdi_field_placeholder}}/g, path.mappedField)
      //   //   )
      //   // }
      // })

      // // MDI Sub-rules
      // // const subRulesAddFieldPlaceholderTemplate = '    add_field({{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}}; .output.{{EZ_mdi_tag_placeholder}}) |'
      // // const subRulesAddFieldPlaceholder = []
      // this.jsonPathes.forEach(path => {
      //   // // MDI Sub-rules
      //   // if (path.mappedField && path.mappedField.length && path.mappedField.indexOf('tag') === 0) {
      //   //   subRulesAddFieldPlaceholder.push(
      //   //     subRulesAddFieldPlaceholderTemplate
      //   //       .replace(/{{EZ_message_placeholder}}/g, messagePlaceholder)
      //   //       .replace(/{{EZ_field_doted_path_placeholder}}/g, path.name)
      //   //       .replace(/{{EZ_mdi_tag_placeholder}}/g, path.mappedField)
      //   //   )
      //   // }
      // })

      // Put this all together
      jqTransform = jqTransform
        .replace(/{{EZ_flatten_array_placeholder}}/g, flattenArrayPlaceholder.join('\r'))
        .replace(/{{EZ_original_message_placeholder}}/g, originalMessagePlaceholder)
        .replace(/{{EZ_flatten_array__add_field_placeholder}}/g, flattenArrayAddFieldPlaceholder.join('\r'))
        .replace(/{{EZ_add_field_placeholder}}/g, addFieldPlaceholder.join('\r'))
        .replace(/{{EZ_sub_rules__add_field_placeholder}}/g, subRulesAddFieldPlaceholder.join('\r'))

      // And ship it back
      this.jqTransformOutput = jqTransform
    },

    reverseToLastSaved () {
      try {
        this.jsonPathes =
          JSON.parse('[{"name":".","leaf":"","depth":0,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".admin_state","leaf":"admin_state","depth":1,"seenInLogCount":1,"values":[{"value":"CaseOpen","type":"string","count":1}],"mappedField":"vmid"},{"name":".active","leaf":"active","depth":1,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".case_detail","leaf":"case_detail","depth":1,"seenInLogCount":1,"values":[{"value":"We have detected an unexpected user activity. We recommend investigating this activity as it might lead to an unauthorized access to sensitive resources.","type":"string","count":1}]},{"name":".case_id","leaf":"case_id","depth":1,"seenInLogCount":1,"values":[{"value":5807,"type":"number","count":1}],"mappedField":"session"},{"name":".case_summary","leaf":"case_summary","depth":1,"seenInLogCount":1,"values":[{"value":"Anomalous activity Unusual JA3 fingerprint, when compared to similar hosts has been detected by 10.128.64.54","type":"string","count":1}]},{"name":".category","leaf":"category","depth":1,"seenInLogCount":1,"values":[{"value":"Anomalous Activity","type":"string","count":1}]},{"name":".certainty","leaf":"certainty","depth":1,"seenInLogCount":1,"values":[{"value":99,"type":"number","count":1}]},{"name":".created_at","leaf":"created_at","depth":1,"seenInLogCount":1,"values":[{"value":1607579970635,"type":"number","count":1}]},{"name":".entity_type","leaf":"entity_type","depth":1,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".entity_uuid","leaf":"entity_uuid","depth":1,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".entry_origin","leaf":"entry_origin","depth":1,"seenInLogCount":1,"values":[{"value":"Distributed Analytics Engine","type":"string","count":1}]},{"name":".entry_source","leaf":"entry_source","depth":1,"seenInLogCount":1,"values":[{"value":"logrhythm-boulder-0-0","type":"string","count":1}]},{"name":".entry_type","leaf":"entry_type","depth":1,"seenInLogCount":1,"values":[{"value":"SslAnomalyEvent","type":"string","count":1}]},{"name":".entry_uuid","leaf":"entry_uuid","depth":1,"seenInLogCount":1,"values":[{"value":"4a5b26e4-981b-4cc3-a2cd-202131812d9f","type":"string","count":1}]},{"name":".event_count","leaf":"event_count","depth":1,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".ioa","leaf":"ioa","depth":1,"seenInLogCount":1,"values":[{"type":"array","count":1}],"modifiers":["Fan out"]},{"name":".ioa[0]","leaf":"0","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].created_at","leaf":"created_at","depth":3,"seenInLogCount":1,"values":[{"value":1607575294000,"type":"number","count":1}]},{"name":".ioa[0].columns","leaf":"columns","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].community_id","leaf":"community_id","depth":3,"seenInLogCount":1,"values":[{"value":"1:TfsKeaK8YkFz2q0zzwCXuSqZxl4=","type":"string","count":1}]},{"name":".ioa[0].date","leaf":"date","depth":3,"seenInLogCount":1,"values":[{"value":"2020-12-10","type":"string","count":1}]},{"name":".ioa[0].dest","leaf":"dest","depth":3,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}]},{"name":".ioa[0].dest_port","leaf":"dest_port","depth":3,"seenInLogCount":1,"values":[{"value":443,"type":"number","count":1}]},{"name":".ioa[0].destination","leaf":"destination","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].destination.ip","leaf":"ip","depth":4,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}],"mappedField":"dip"},{"name":".ioa[0].destination.port","leaf":"port","depth":4,"seenInLogCount":1,"values":[{"value":443,"type":"number","count":1}],"mappedField":"dport"},{"name":".ioa[0].destination.is_local","leaf":"is_local","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].end_time","leaf":"end_time","depth":3,"seenInLogCount":1,"values":[{"value":1607571942935,"type":"number","count":1}]},{"name":".ioa[0].entity_type","leaf":"entity_type","depth":3,"seenInLogCount":1,"values":[{"value":"Ip","type":"string","count":1}]},{"name":".ioa[0].entity_uuid","leaf":"entity_uuid","depth":3,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}]},{"name":".ioa[0].entry_origin","leaf":"entry_origin","depth":3,"seenInLogCount":1,"values":[{"value":"Distributed Analytics Engine","type":"string","count":1}]},{"name":".ioa[0].entry_source","leaf":"entry_source","depth":3,"seenInLogCount":1,"values":[{"value":"logrhythm-boulder-0-0","type":"string","count":1}]},{"name":".ioa[0].entry_type","leaf":"entry_type","depth":3,"seenInLogCount":1,"values":[{"value":"SslAnomalyEvent","type":"string","count":1}]},{"name":".ioa[0].entry_uuid","leaf":"entry_uuid","depth":3,"seenInLogCount":1,"values":[{"value":"4a5b26e4-981b-4cc3-a2cd-202131812d9f","type":"string","count":1}]},{"name":".ioa[0].event_attribute","leaf":"event_attribute","depth":3,"seenInLogCount":1,"values":[{"value":"Behavior Anomaly","type":"string","count":1}]},{"name":".ioa[0].event_category","leaf":"event_category","depth":3,"seenInLogCount":1,"values":[{"value":"Anomalous Activity","type":"string","count":1}]},{"name":".ioa[0].event_certainty","leaf":"event_certainty","depth":3,"seenInLogCount":1,"values":[{"value":99,"type":"number","count":1}]},{"name":".ioa[0].event_extra_attributes","leaf":"event_extra_attributes","depth":3,"seenInLogCount":1,"values":[{"type":"array","count":1}]},{"name":".ioa[0].event_extra_attributes[0]","leaf":"0","depth":4,"seenInLogCount":1,"values":[{"value":"model:cluster","type":"string","count":1}]},{"name":".ioa[0].event_extra_attributes[1]","leaf":"1","depth":4,"seenInLogCount":1,"values":[{"value":"cluster_id:0","type":"string","count":1}]},{"name":".ioa[0].event_extra_attributes[2]","leaf":"2","depth":4,"seenInLogCount":1,"values":[{"value":"trend:none","type":"string","count":1}]},{"name":".ioa[0].event_score","leaf":"event_score","depth":3,"seenInLogCount":1,"values":[{"value":5,"type":"number","count":1}]},{"name":".ioa[0].event_severity","leaf":"event_severity","depth":3,"seenInLogCount":1,"values":[{"value":50,"type":"number","count":1}]},{"name":".ioa[0].event_trigger","leaf":"event_trigger","depth":3,"seenInLogCount":1,"values":[{"value":"Unusual JA3 fingerprint, when compared to similar hosts","type":"string","count":1}]},{"name":".ioa[0].event_trigger_id","leaf":"event_trigger_id","depth":3,"seenInLogCount":1,"values":[{"value":"Analytics:Anomaly:1302","type":"string","count":1}]},{"name":".ioa[0].event_tags","leaf":"event_tags","depth":3,"seenInLogCount":1,"values":[{"type":"array","count":1}]},{"name":".ioa[0].event_tags[0]","leaf":"0","depth":4,"seenInLogCount":1,"values":[{"value":"entry_type:Ssl AND entry_uuid:4fa30d3a-cc5d-4d5f-9cff-5b8c233e19f7","type":"string","count":1}]},{"name":".ioa[0].event_uuid","leaf":"event_uuid","depth":3,"seenInLogCount":1,"values":[{"value":"de42f388-d8e8-45d2-a385-bcd3070b883d","type":"string","count":1}]},{"name":".ioa[0].hour","leaf":"hour","depth":3,"seenInLogCount":1,"values":[{"value":3,"type":"number","count":1}]},{"name":".ioa[0].domain_report","leaf":"domain_report","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].ip_investigation_report","leaf":"ip_investigation_report","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].kubernetes","leaf":"kubernetes","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].kubernetes.container","leaf":"container","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].kubernetes.labels","leaf":"labels","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].kubernetes.node","leaf":"node","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].kubernetes.pod","leaf":"pod","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].kubernetes.replicaset","leaf":"replicaset","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].attack_framework","leaf":"attack_framework","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].mitre_tactic","leaf":"mitre_tactic","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].mitre_technique","leaf":"mitre_technique","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].session_id","leaf":"session_id","depth":3,"seenInLogCount":1,"values":[{"value":"C0xzyIr30S77pHPXl","type":"string","count":1}]},{"name":".ioa[0].source","leaf":"source","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].source.ip","leaf":"ip","depth":4,"seenInLogCount":1,"values":[{"value":"10.128.64.54","type":"string","count":1}]},{"name":".ioa[0].source.port","leaf":"port","depth":4,"seenInLogCount":1,"values":[{"value":61440,"type":"number","count":1}]},{"name":".ioa[0].source.is_local","leaf":"is_local","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].src","leaf":"src","depth":3,"seenInLogCount":1,"values":[{"value":"10.128.64.54","type":"string","count":1}]},{"name":".ioa[0].src_port","leaf":"src_port","depth":3,"seenInLogCount":1,"values":[{"value":61440,"type":"number","count":1}]},{"name":".ioa[0].start_time","leaf":"start_time","depth":3,"seenInLogCount":1,"values":[{"value":1607571942935,"type":"number","count":1}]},{"name":".ioa[0].summary_dests","leaf":"summary_dests","depth":3,"seenInLogCount":1,"values":[{"type":"array","count":1}]},{"name":".ioa[0].summary_dests[0]","leaf":"0","depth":4,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}]},{"name":".ioa[0].timestamp","leaf":"timestamp","depth":3,"seenInLogCount":1,"values":[{"value":1607571942935,"type":"number","count":1}]},{"name":".ioa[0].weekday","leaf":"weekday","depth":3,"seenInLogCount":1,"values":[{"value":4,"type":"number","count":1}]},{"name":".ioa[0].whitelisted","leaf":"whitelisted","depth":3,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".ioa[0].app_info","leaf":"app_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].app_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575279219,"type":"number","count":1}]},{"name":".ioa[0].app_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575279219,"type":"number","count":1}]},{"name":".ioa[0].app_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].app_info.response_code","leaf":"response_code","depth":4,"seenInLogCount":1,"values":[{"value":204,"type":"number","count":1}]},{"name":".ioa[0].case_info","leaf":"case_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].case_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607579970627,"type":"number","count":1}]},{"name":".ioa[0].case_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607579971198,"type":"number","count":1}]},{"name":".ioa[0].case_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].classifier_info","leaf":"classifier_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].classifier_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575261989,"type":"number","count":1}]},{"name":".ioa[0].classifier_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575261990,"type":"number","count":1}]},{"name":".ioa[0].classifier_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].cve_info","leaf":"cve_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].cve_info.cve_dest_status","leaf":"cve_dest_status","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].deduper_info","leaf":"deduper_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].deduper_info.bypass","leaf":"bypass","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].deduper_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575260998,"type":"number","count":1}]},{"name":".ioa[0].deduper_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575260998,"type":"number","count":1}]},{"name":".ioa[0].deduper_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].domain_info","leaf":"domain_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].eventscorer_info","leaf":"eventscorer_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].eventscorer_info.bypass","leaf":"bypass","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].eventscorer_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575300766,"type":"number","count":1}]},{"name":".ioa[0].eventscorer_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575300767,"type":"number","count":1}]},{"name":".ioa[0].eventscorer_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].ext_info","leaf":"ext_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].ext_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575300748,"type":"number","count":1}]},{"name":".ioa[0].ext_info.response_code","leaf":"response_code","depth":4,"seenInLogCount":1,"values":[{"value":404,"type":"number","count":1}]},{"name":".ioa[0].ext_info.threat_level","leaf":"threat_level","depth":4,"seenInLogCount":1,"values":[{"value":"Not Applicable","type":"string","count":1}]},{"name":".ioa[0].ext_info.domain_info","leaf":"domain_info","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].ext_info.dest_ip_info","leaf":"dest_ip_info","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].ext_info.src_ip_info","leaf":"src_ip_info","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].ext_info.uri_info","leaf":"uri_info","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].file_info","leaf":"file_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].ip_info","leaf":"ip_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logfinder_info","leaf":"logfinder_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logfinder_info.bypass","leaf":"bypass","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].logfinder_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575278712,"type":"number","count":1}]},{"name":".ioa[0].logfinder_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575278713,"type":"number","count":1}]},{"name":".ioa[0].logfinder_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].mistwatcher_info","leaf":"mistwatcher_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].network_info","leaf":"network_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].network_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575279478,"type":"number","count":1}]},{"name":".ioa[0].network_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575279485,"type":"number","count":1}]},{"name":".ioa[0].network_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].network_info.response_code","leaf":"response_code","depth":4,"seenInLogCount":1,"values":[{"value":200,"type":"number","count":1}]},{"name":".ioa[0].network_info.int_dest","leaf":"int_dest","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].network_info.int_dest.ip_addr","leaf":"ip_addr","depth":5,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}]},{"name":".ioa[0].network_info.int_dest.network_description","leaf":"network_description","depth":5,"seenInLogCount":1,"values":[{"value":"z-SSD-Security","type":"string","count":1}]},{"name":".ioa[0].network_info.int_dest.network_prefix","leaf":"network_prefix","depth":5,"seenInLogCount":1,"values":[{"value":"192.168.178.1/24","type":"string","count":1}]},{"name":".ioa[0].network_info.int_dest.network_type","leaf":"network_type","depth":5,"seenInLogCount":1,"values":[{"value":"internal","type":"string","count":1}]},{"name":".ioa[0].network_info.int_src","leaf":"int_src","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].network_info.int_src.ip_addr","leaf":"ip_addr","depth":5,"seenInLogCount":1,"values":[{"value":"10.128.64.54","type":"string","count":1}]},{"name":".ioa[0].network_info.int_src.network_description","leaf":"network_description","depth":5,"seenInLogCount":1,"values":[{"value":"Unknown","type":"string","count":1}]},{"name":".ioa[0].network_info.int_src.network_prefix","leaf":"network_prefix","depth":5,"seenInLogCount":1,"values":[{"value":"Unknown","type":"string","count":1}]},{"name":".ioa[0].network_info.int_src.network_type","leaf":"network_type","depth":5,"seenInLogCount":1,"values":[{"value":"internal","type":"string","count":1}]},{"name":".ioa[0].pcap_info","leaf":"pcap_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].rapid7_info","leaf":"rapid7_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].rare_info","leaf":"rare_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].rare_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575261990,"type":"number","count":1}]},{"name":".ioa[0].rare_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575261990,"type":"number","count":1}]},{"name":".ioa[0].rare_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].rare_info.response_code","leaf":"response_code","depth":4,"seenInLogCount":1,"values":[{"value":200,"type":"number","count":1}]},{"name":".ioa[0].rare_info.rare","leaf":"rare","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].rare_info.rule_id","leaf":"rule_id","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].url_info","leaf":"url_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].session_info","leaf":"session_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].session_info.local_orig","leaf":"local_orig","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].session_info.local_resp","leaf":"local_resp","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].session_info.logs_count_ssl","leaf":"logs_count_ssl","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].session_info.logs_count_total","leaf":"logs_count_total","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].vulnerability_info","leaf":"vulnerability_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].event_actor","leaf":"event_actor","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs","leaf":"logs","depth":3,"seenInLogCount":1,"values":[{"type":"array","count":1}]},{"name":".ioa[0].logs[0]","leaf":"0","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].app","leaf":"app","depth":5,"seenInLogCount":1,"values":[{"value":"ssl","type":"string","count":1}]},{"name":".ioa[0].logs[0].community_id","leaf":"community_id","depth":5,"seenInLogCount":1,"values":[{"value":"1:TfsKeaK8YkFz2q0zzwCXuSqZxl4=","type":"string","count":1}]},{"name":".ioa[0].logs[0].created_at","leaf":"created_at","depth":5,"seenInLogCount":1,"values":[{"value":1607571943970,"type":"number","count":1}]},{"name":".ioa[0].logs[0].date","leaf":"date","depth":5,"seenInLogCount":1,"values":[{"value":"2020-12-10","type":"string","count":1}]},{"name":".ioa[0].logs[0].dest","leaf":"dest","depth":5,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}]},{"name":".ioa[0].logs[0].destination","leaf":"destination","depth":5,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].destination.ip","leaf":"ip","depth":6,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}]},{"name":".ioa[0].logs[0].destination.port","leaf":"port","depth":6,"seenInLogCount":1,"values":[{"value":443,"type":"number","count":1}]},{"name":".ioa[0].logs[0].destination.is_local","leaf":"is_local","depth":6,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].logs[0].entry_origin","leaf":"entry_origin","depth":5,"seenInLogCount":1,"values":[{"value":"Network Analysis Engine","type":"string","count":1}]},{"name":".ioa[0].logs[0].entry_source","leaf":"entry_source","depth":5,"seenInLogCount":1,"values":[{"value":"logrhythm-boulder-0-0","type":"string","count":1}]},{"name":".ioa[0].logs[0].entry_type","leaf":"entry_type","depth":5,"seenInLogCount":1,"values":[{"value":"Ssl","type":"string","count":1}]},{"name":".ioa[0].logs[0].entry_uuid","leaf":"entry_uuid","depth":5,"seenInLogCount":1,"values":[{"value":"4fa30d3a-cc5d-4d5f-9cff-5b8c233e19f7","type":"string","count":1}]},{"name":".ioa[0].logs[0].hour","leaf":"hour","depth":5,"seenInLogCount":1,"values":[{"value":3,"type":"number","count":1}]},{"name":".ioa[0].logs[0].source","leaf":"source","depth":5,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].source.ip","leaf":"ip","depth":6,"seenInLogCount":1,"values":[{"value":"10.128.64.54","type":"string","count":1}]},{"name":".ioa[0].logs[0].source.port","leaf":"port","depth":6,"seenInLogCount":1,"values":[{"value":61440,"type":"number","count":1}]},{"name":".ioa[0].logs[0].source.is_local","leaf":"is_local","depth":6,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].logs[0].src","leaf":"src","depth":5,"seenInLogCount":1,"values":[{"value":"10.128.64.54","type":"string","count":1}]},{"name":".ioa[0].logs[0].timestamp","leaf":"timestamp","depth":5,"seenInLogCount":1,"values":[{"value":1607571942934,"type":"number","count":1}]},{"name":".ioa[0].logs[0].pcap_info","leaf":"pcap_info","depth":5,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].mistwatcher_info","leaf":"mistwatcher_info","depth":5,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].weekday","leaf":"weekday","depth":5,"seenInLogCount":1,"values":[{"value":4,"type":"number","count":1}]},{"name":".ioa[0].logs[0].conn_state","leaf":"conn_state","depth":5,"seenInLogCount":1,"values":[{"value":"S1","type":"string","count":1}]},{"name":".ioa[0].logs[0].dest_port","leaf":"dest_port","depth":5,"seenInLogCount":1,"values":[{"value":443,"type":"number","count":1}]},{"name":".ioa[0].logs[0].duration","leaf":"duration","depth":5,"seenInLogCount":1,"values":[{"value":0.683528,"type":"number","count":1}]},{"name":".ioa[0].logs[0].history","leaf":"history","depth":5,"seenInLogCount":1,"values":[{"value":"ShADad","type":"string","count":1}]},{"name":".ioa[0].logs[0].local_orig","leaf":"local_orig","depth":5,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].logs[0].local_resp","leaf":"local_resp","depth":5,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].logs[0].orig_pkts","leaf":"orig_pkts","depth":5,"seenInLogCount":1,"values":[{"value":4,"type":"number","count":1}]},{"name":".ioa[0].logs[0].proto","leaf":"proto","depth":5,"seenInLogCount":1,"values":[{"value":"tcp","type":"string","count":1}]},{"name":".ioa[0].logs[0].resp_pkts","leaf":"resp_pkts","depth":5,"seenInLogCount":1,"values":[{"value":4,"type":"number","count":1}]},{"name":".ioa[0].logs[0].session_id","leaf":"session_id","depth":5,"seenInLogCount":1,"values":[{"value":"C0xzyIr30S77pHPXl","type":"string","count":1}]},{"name":".ioa[0].logs[0].src_port","leaf":"src_port","depth":5,"seenInLogCount":1,"values":[{"value":61440,"type":"number","count":1}]},{"name":".ioa[0].logs[0].dhcp_server","leaf":"dhcp_server","depth":5,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".ioa[0].logs[0].columns","leaf":"columns","depth":5,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].decorations","leaf":"decorations","depth":5,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].cipher","leaf":"cipher","depth":5,"seenInLogCount":1,"values":[{"value":"TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384","type":"string","count":1}]},{"name":".ioa[0].logs[0].request_type","leaf":"request_type","depth":5,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".ioa[0].logs[0].version","leaf":"version","depth":5,"seenInLogCount":1,"values":[{"value":"TLSv12","type":"string","count":1}]},{"name":".ioa[0].logs[0].cert_chain_fuids","leaf":"cert_chain_fuids","depth":5,"seenInLogCount":1,"values":[{"type":"array","count":1}]},{"name":".ioa[0].logs[0].cert_chain_fuids[0]","leaf":"0","depth":6,"seenInLogCount":1,"values":[{"value":"FLJtXo28F6FbDUQxP4","type":"string","count":1}]},{"name":".ioa[0].logs[0].curve","leaf":"curve","depth":5,"seenInLogCount":1,"values":[{"value":"secp256r1","type":"string","count":1}]},{"name":".ioa[0].logs[0].established","leaf":"established","depth":5,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].logs[0].issuer","leaf":"issuer","depth":5,"seenInLogCount":1,"values":[{"value":"CN=illustracamera.com,O=Tyco Security Products,ST=MA,C=US","type":"string","count":1}]},{"name":".ioa[0].logs[0].subject","leaf":"subject","depth":5,"seenInLogCount":1,"values":[{"value":"CN=illustracamera.com,O=Tyco Security Products,ST=MA,C=US","type":"string","count":1}]},{"name":".ioa[0].logs[0].validation_status","leaf":"validation_status","depth":5,"seenInLogCount":1,"values":[{"value":"self signed certificate","type":"string","count":1}]},{"name":".ioa[0].logs[0].ja3","leaf":"ja3","depth":5,"seenInLogCount":1,"values":[{"value":"d722d9cbef7538d27eec79e401ea7546","type":"string","count":1}]},{"name":".ioa[0].logs[0].ja3s","leaf":"ja3s","depth":5,"seenInLogCount":1,"values":[{"value":"f6e234011390444c303f74d09d87322d","type":"string","count":1}]},{"name":".ioa[0].IncidentCaseEvents","leaf":"IncidentCaseEvents","depth":3,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".ioa[0].decorations","leaf":"decorations","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa_count","leaf":"ioa_count","depth":1,"seenInLogCount":1,"values":[{"value":13,"type":"number","count":1}]},{"name":".ioa_summary_count","leaf":"ioa_summary_count","depth":1,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".last_modified","leaf":"last_modified","depth":1,"seenInLogCount":1,"values":[{"value":1607603187913,"type":"number","count":1}]},{"name":".main_event","leaf":"main_event","depth":1,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.created_at","leaf":"created_at","depth":2,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".main_event.columns","leaf":"columns","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.date","leaf":"date","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.entry_origin","leaf":"entry_origin","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.entry_source","leaf":"entry_source","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.entry_type","leaf":"entry_type","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.entry_uuid","leaf":"entry_uuid","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.event_attribute","leaf":"event_attribute","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.event_category","leaf":"event_category","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.event_extra_attributes","leaf":"event_extra_attributes","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.event_score","leaf":"event_score","depth":2,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".main_event.event_uuid","leaf":"event_uuid","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.hour","leaf":"hour","depth":2,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".main_event.domain_report","leaf":"domain_report","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ip_investigation_report","leaf":"ip_investigation_report","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.kubernetes","leaf":"kubernetes","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.kubernetes.container","leaf":"container","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.kubernetes.labels","leaf":"labels","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.kubernetes.node","leaf":"node","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.kubernetes.pod","leaf":"pod","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.kubernetes.replicaset","leaf":"replicaset","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.attack_framework","leaf":"attack_framework","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.mitre_tactic","leaf":"mitre_tactic","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.mitre_technique","leaf":"mitre_technique","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.timestamp","leaf":"timestamp","depth":2,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".main_event.whitelisted","leaf":"whitelisted","depth":2,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".main_event.app_info","leaf":"app_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.case_info","leaf":"case_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.classifier_info","leaf":"classifier_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.cve_info","leaf":"cve_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.cve_info.cve_dest_status","leaf":"cve_dest_status","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.deduper_info","leaf":"deduper_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.domain_info","leaf":"domain_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.eventscorer_info","leaf":"eventscorer_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ext_info","leaf":"ext_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ext_info.domain_info","leaf":"domain_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ext_info.dest_ip_info","leaf":"dest_ip_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ext_info.src_ip_info","leaf":"src_ip_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ext_info.uri_info","leaf":"uri_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.file_info","leaf":"file_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ip_info","leaf":"ip_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.logfinder_info","leaf":"logfinder_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.mistwatcher_info","leaf":"mistwatcher_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.network_info","leaf":"network_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.network_info.int_dest","leaf":"int_dest","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.network_info.int_src","leaf":"int_src","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.pcap_info","leaf":"pcap_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.rapid7_info","leaf":"rapid7_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.rare_info","leaf":"rare_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.url_info","leaf":"url_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.session_info","leaf":"session_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.session_info.local_orig","leaf":"local_orig","depth":3,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".main_event.session_info.local_resp","leaf":"local_resp","depth":3,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".main_event.vulnerability_info","leaf":"vulnerability_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.event_actor","leaf":"event_actor","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.IncidentCaseEvents","leaf":"IncidentCaseEvents","depth":2,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".main_event.decorations","leaf":"decorations","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".positive","leaf":"positive","depth":1,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".servicenow_info","leaf":"servicenow_info","depth":1,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".severity","leaf":"severity","depth":1,"seenInLogCount":1,"values":[{"value":50,"type":"number","count":1}]},{"name":".score","leaf":"score","depth":1,"seenInLogCount":1,"values":[{"value":3,"type":"number","count":1}]},{"name":".timestamp","leaf":"timestamp","depth":1,"seenInLogCount":1,"values":[{"value":1607571942935,"type":"number","count":1}]},{"name":".wildcard_ioa_count","leaf":"wildcard_ioa_count","depth":1,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".actor","leaf":"actor","depth":1,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".summary_events_count","leaf":"summary_events_count","depth":1,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".policy_violation_info","leaf":"policy_violation_info","depth":1,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".incident_info","leaf":"incident_info","depth":1,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".casescore","leaf":"casescore","depth":1,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".determination","leaf":"determination","depth":1,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".note","leaf":"note","depth":1,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]}]')
          // JSON.parse('')
      } catch {
        console.log('Can\'t parse JSON')
      }
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
    this.resetData()
    // Event when Server sends a new log via Tail
    this.socket.on('tail.log', this.handleSocketOnTailLog)
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
        if (this.tailEnabled) {
          this.initTail()
        } else {
          this.killTail()
        }
      },
      deep: false
    } // tailEnabled
  },

  created () {
    //
  },

  beforeDestroy () {
    clearInterval(this.backgroundProcessInterval)
  },

  destroyed () {
    this.killTail()
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
  color: rgb(21, 173, 66);
}
.json-type-boolean {
  color: rgb(32, 227, 253);
}
.json-type- { /* to catch empty types */
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
.json-path-line:hover {
  /* background-color: rgb(49, 18, 42); */
  background-image: linear-gradient(rgba(49, 18, 42, .75), rgba(49, 18, 42, 1), rgba(49, 18, 42, .75));
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
