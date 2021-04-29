<template>
  <q-page class="q-pa-sm">
    <div class="">
      <div class="text-h2" style="opacity:.4">
        Pipelines Builder
      </div>
      <div class="q-mt-md">
        <q-btn class="q-mr-lg" dense label="Reset Sample mapping" flat color="primary" @click="resetData()" />
        <q-btn class="q-mr-lg" dense label="Init Tail" flat color="primary" @click="tailEnabled = true" :disable="tailEnabled" />
        <q-btn class="q-mr-lg" dense label="Kill Tail" flat color="negative" @click="tailEnabled = false" :disable="!tailEnabled" />
        <q-btn class="q-mr-lg" dense label="List Tails" flat color="secondary" @click="listTails()" />
        <q-toggle v-model="tailEnabled" label="Tail Log Source Stream" />
        <q-toggle v-model="showExtraDetails" label="Show extra details" />
        <q-toggle v-model="showTypesInMainList" label="Show types (main list)" />
        <q-toggle v-model="showTypesInPopup" label="Show types (popups)" />
        <q-toggle v-model="processInBackground" label="Process in Background" />
        <q-toggle v-model="showQueues" label="Show Queues" />
        <q-toggle v-model="wrapSingleStringLog" label="Wrap Single String Logs" />
        <q-item  style="width: 15rem;">
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
        <q-item  style="width: 25rem;">
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
        <q-item  style="width: 25rem;">
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
      <div class="q-mt-md">
        <span class="text-bold">tailId: </span>{{ tailId }}
      </div>
      <div class="q-mt-md">
        <span class="text-bold">Queues / Stacks sizes: </span>{{ queueIn.length }} / {{ maxSeenInLog }} / {{ processedLogsCount }} / {{ processedLogs.length }}
      </div>
      <div class="q-mt-md" v-show="showQueues">
        <div class="text-h4" style="opacity:.4">
          Queues
        </div>
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
      </div>

      <div class="q-mt-md fit column">
        <q-virtual-scroll
          style="max-height: 80vh;"
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
              :options="['Parse JSON', 'Stringify JSON', 'Fan out']"
              style="width: 20rem;"
              class="q-mx-sm q-my-xs"
              label="Modifiers"
              stack-label
              multiple
            />
            </div>
          </template>
        </q-virtual-scroll>
      </div>
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

import { uid } from 'quasar'
import Vue2Filters from 'vue2-filters'

export default {
  name: 'PagePipelineBuilder',
  data () {
    return {
      socket: this.$socket,
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
      queueIn: [], // To feed from the Server Tail, or the queueInDataEntry field
      queueInDataEntry: '{"timestamp":"20210422T16:40:00","id":"abcdef-1234","code":15,"destination":{"ip":"172.16.1.2","port":443},"source":{"ip":"192.168.0.1","port":44444},"bam":"boop","values":[{"type":"Object","count":4},{"type":"Plane","count":25,"value":"A320"}]}', // To enter log data by hand
      queueProcess: {}, // The one record we are working on (coming from the queueIn, one at a time)
      processedLogs: [], // The logs, once processed
      processedLogsCount: 0, // The count of processed logs
      jsonPathes: [], // The extracted keys and values from the processedLogSample. Used for display and mapping. Saved.
      tailEnabled: false, // Are we running a tail against the sample/capture file?
      tailId: '', // UUID of the tail. Needed to be able to kill it on the server
      processInBackground: false,
      processInBackgroundMaxRate: 1, // once per second by default
      queueInMaxSize: 200, // Maximum number of log messages in queueIn
      processedLogsMaxSize: 200 // Maximum number of log messages in processedLogs
    }
  },
  mixins: [Vue2Filters.mixin],
  computed: {
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
        this.jsonPathes = []
        this.maxSeenInLog = 0
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
        payload.tailId === this.tailId
      ) {
        if (typeof payload.payload === 'string') {
          const newPayload = []
          // eslint-disable-next-line quotes
          payload.payload.split("\n").forEach(lr => {
            if (this.wrapSingleStringLog && typeof lr === 'string') {
              newPayload.push({ singleStringLog: lr })
            } else {
              newPayload.push(lr)
            }
          })
          this.queueInAdd({ values: newPayload })
        } else {
          this.queueInAdd({ values: payload.payload })
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
        payload.tailId === this.tailId
      ) {
        this.tailEnabled = false
      }
    },

    queueInAdd ({ values }) {
      if (typeof values === 'string') {
        // deal with it as Strings
        try {
          this.queueIn.push(JSON.parse(values))
        } catch {
          // Not proper JSON
          console.log('queueInAdd // String is not a proper JSON')
          console.log(values)
        }
      } else if (Array.isArray(values)) {
        // deal with it as Array of strings or JSON objects
        values.forEach(value => {
          if (typeof value === 'string') {
            try {
              this.queueIn.push(JSON.parse(value))
            } catch {
              // Not proper JSON
              console.log('String is not a proper JSON')
            }
          } else {
            this.queueIn.push(value)
          }
        })
      } else if (typeof values === 'object') {
        // deal with it as a single JSON object
        this.queueIn.push(values)
      }
    }, // queueInAdd

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

    processLogSample ({ logSample, options }) {
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

      // Check if we got provided a logSample, if not falls back onto this.queueProcess
      const logSampleProvidedAsVariable = (logSample && Object.keys(logSample).length > 0)
      const logSampleToProcess = (logSampleProvidedAsVariable ? logSample : this.queueProcess)

      if (Object.keys(logSampleToProcess).length > 0) {
        this.processLogKey({ leaf: logSampleToProcess, parentPath: '', depth: 0, maxDepth: 5 })

        this.processedLogsCount++
        // Add the processed sample to processedLogs, except if we have enough of them already
        if (this.processedLogsCount < this.processedLogsMaxSize) {
          this.processedLogs.push(logSampleToProcess)
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
            Object.keys(leaf).forEach(key => {
              thisKeyPath = parentPath + '.' + key

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

    initTail () {
      if (this.socket.connected) {
        this.socket.emit('tail.init', { tailId: this.tailId, path: '/tmp/mistnet.log' })
      }
    },

    killTail () {
      if (this.socket.connected) {
        this.socket.emit('tail.kill', { tailId: this.tailId })
      }
    },

    listTails () {
      if (this.socket.connected) {
        this.socket.emit('tail.showtaillist')
      }
    }
  },

  mounted () {
    this.tailId = uid()
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
