<template>
  <q-page class="q-pa-sm">
    <div class="">
      <div class="text-h2" style="opacity:.4">
        Pipelines Builder
      </div>
      <div class="q-mt-md">
        <q-btn class="q-mr-lg" dense label="Reload data" flat color="primary" @click="loadData()" />
        <label><input type="checkbox" v-model="showAllTypes"> Show all types</label>
        <label><input type="checkbox" v-model="showExtraDetails"> Show extra details</label>
      </div>

      <div class="q-mt-md fit column">
        <div v-for="jsonPath in jsonPathes"
          :key="jsonPath.id"
          class="row items-stretch q-my-none q-py-none json-path-line"
          style="min-height: 1.5rem;"
        >
          <div class="row content-center q-mr-sm q-gutter-y-none" style="width: 3rem;">
            <q-tooltip content-style="font-size: 1em;">
              <q-icon name="stop" color="blue-10" />Relative frequency <span style="font-weight: bold;">{{ Math.round(jsonPath.seenInLogCount / maxSeenInLog * 100) }}%</span> ({{ jsonPath.seenInLogCount }}&nbsp;/&nbsp;{{ maxSeenInLog }}).<br>
              <q-icon name="stop" color="indigo-10" />Seen in <span style="font-weight: bold;">{{ Math.round(jsonPath.seenInLogCount / processedLogsCount * 100) }}%</span> of the logs ({{ jsonPath.seenInLogCount }}&nbsp;/&nbsp;{{ processedLogsCount }}).
            </q-tooltip>
            <q-linear-progress :value="jsonPath.seenInLogCount / maxSeenInLog" color="blue-10" />
            <q-linear-progress :value="jsonPath.seenInLogCount / processedLogsCount" color="indigo-10" />
          </div>
          <div
            v-for="d in jsonPath.depth" :key="d"
            class="row q-ml-xs q-pl-sm"
            style="border-left: 1px solid #05b5d4;"
          />
          <div
            class="fixed-font content-center col row q-mr-md"
          >
            <div
              style="font-weight: bold;"
              :class="{ selected: !!selected[jsonPath.id], selecting: !!selecting[jsonPath.id] }"
              class="json-style-leaf">{{ jsonPath.leaf }}</div
            ><div
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].value !== undefined"
            >: {{ jsonPath.values[0].value }}</div
            ><!-- <span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].type && jsonPath.values[0].type === 'Object'"
              class="json-style-object"
            > {}</span
            ><span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].type && jsonPath.values[0].type === 'Array'"
              class="json-style-array"
            > []</span
            ><span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].type && jsonPath.values[0].type === 'String' && showAllTypes"
              class="json-style-string"
            > ""</span
            ><span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].type && jsonPath.values[0].type === 'Number' && showAllTypes"
              class="json-style-number"
            > 00</span
            ><span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].type && jsonPath.values[0].type === 'Boolean' && showAllTypes"
              class="json-style-boolean"
            > &&</span
            > --><span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].type && showExtraDetails"
              style="font-style: italic; opacity: 50%;"
            > ({{ jsonPath.values[0].type }}:{{ jsonPath.values[0].count }}/{{ jsonPath.seenInLogCount }})</span
            >
            <q-chip v-if="showAllTypes" dense size="sm" class="q-ml-sm" :class="(jsonPath.values && jsonPath.values.length && jsonPath.values[0].type ? 'json-bg-type-' + jsonPath.values[0].type.toLowerCase() : '')">{{ (jsonPath.values && jsonPath.values.length && jsonPath.values[0].type ? jsonPath.values[0].type : '') }}</q-chip>
          </div>
          <!-- <q-select
            dense
            outlined
            v-model="jsonPath.mappedField"
            emit-value
            map-options
            :options="mdiTags"
            label="Mapping"
            style="min-width: 18rem;"
          >
          </q-select> -->
          <q-select
            dense
            standout="bg-grey-8 text-white"
            bg-color="dark"
            v-model="jsonPath.mappedField"
            emit-value
            map-options
            :options="mdiTagsOptions"
            label="Mapping"
            stack-label
            style="width: 18rem;"
            class="q-mx-sm q-my-xs"

            use-input
            input-debounce="0"
            @filter="filterFn"
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
            v-model="jsonPath.modifiers"
            :options="['Parse JSON', 'Stringify JSON', 'Fan out']"
            style="width: 20rem;"
            class="q-mx-sm q-my-xs"
            label="Modifiers"
            stack-label
            multiple
          />
        </div>
      </div>

      <div class="q-mt-md">
        Selected JSON pathes ({{ selectedCount }}): {{ selectedPathes }}
      </div>
      <div>
        {{ maxSeenInLog }} / {{ processedLogsCount }} / {{ logSample.length }}
      </div>
      <div>
        <pre>{{ jsonPathes }}</pre>
      </div>

    </div>
  </q-page>
</template>

<script>
const externalData = [
  { id: 0, name: '.', leaf: '', depth: 0, mappedField: '', seenInLogCount: 4, values: [{ type: 'Object', count: 4 }] },
  { id: 1, name: '.timestamp', leaf: 'timestamp', depth: 1, mappedField: '', seenInLogCount: 4, values: [{ value: '20210416T01:02:03', type: 'String', count: 1 }, { value: '20210416T02:02:03', type: 'String', count: 1 }, { value: '20210416T03:02:03', type: 'String', count: 1 }, { value: '20210416T04:02:03', type: 'String', count: 1 }] },
  { id: 2, name: '.id', leaf: 'id', depth: 1, mappedField: 'session', seenInLogCount: 4, values: [{ value: 'abc-def-123456-fedcba', type: 'String', count: 1 }, { value: 'def-def-123456-fedcba', type: 'String', count: 1 }, { value: 'xyz-def-123456-fedcba', type: 'String', count: 1 }, { value: 'cab-def-123456-fedcba', type: 'String', count: 1 }] },
  { id: 3, name: '.code', leaf: 'code', depth: 1, mappedField: 'vmid', seenInLogCount: 4, values: [{ value: 15, type: 'Number', count: 1 }, { value: 452, type: 'Number', count: 2 }, { value: 28, type: 'Number', count: 1 }] },
  { id: 4, name: '.destination', leaf: 'destination', depth: 1, mappedField: '', seenInLogCount: 3, values: [{ type: 'Object', count: 3 }] },
  { id: 5, name: '.destination.ip', leaf: 'ip', depth: 2, mappedField: 'dip', seenInLogCount: 3, values: [{ value: '192.168.0.5', type: 'String', count: 2 }, { value: '192.168.0.1', type: 'String', count: 1 }] },
  { id: 6, name: '.destination.port', leaf: 'port', depth: 2, mappedField: 'dport', seenInLogCount: 3, values: [{ value: 80, type: 'Number', count: 2 }, { value: 1234, type: 'Number', count: 1 }] },
  { id: 7, name: '.source.', leaf: 'source', depth: 1, mappedField: '', seenInLogCount: 4, values: [{ type: 'Object', count: 4 }] },
  { id: 8, name: '.source.ip', leaf: 'ip', depth: 2, mappedField: 'sip', seenInLogCount: 4, values: [{ value: '10.1.2.3', type: 'String', count: 2 }, { value: '10.1.2.4', type: 'String', count: 1 }, { value: '10.5.4.3', type: 'String', count: 1 }] },
  { id: 9, name: '.source.port', leaf: 'port', depth: 2, mappedField: 'sport', seenInLogCount: 4, values: [{ value: 4567, type: 'Number', count: 1 }, { value: 13456, type: 'Number', count: 1 }, { value: 12321, type: 'Number', count: 1 }, { value: 11234, type: 'Number', count: 1 }] },
  { id: 10, name: '.boop', leaf: 'boop', depth: 1, mappedField: '', seenInLogCount: 1, values: [{ value: 'bam', type: 'String', count: 1 }] },
  { id: 11, name: '.options', leaf: 'options', depth: 1, mappedField: '', seenInLogCount: 2, values: [{ type: 'Array', count: 2 }] },
  { id: 12, name: '.options.0', leaf: '0', depth: 2, mappedField: '', seenInLogCount: 2, values: [{ type: 'Object', count: 2 }] },
  { id: 13, name: '.options.0.enable', leaf: 'enable', depth: 3, mappedField: '', seenInLogCount: 2, values: [{ value: 'always', type: 'String', count: 1 }, { value: 'first', type: 'String', count: 1 }] },
  { id: 14, name: '.options.0.suppress', leaf: 'suppress', depth: 3, mappedField: '', seenInLogCount: 2, values: [{ value: false, type: 'Boolean', count: 2 }] },
  { id: 15, name: '.activities', leaf: 'activities', depth: 1, mappedField: '', seenInLogCount: 3, values: [{ type: 'Array', count: 3 }] },
  { id: 16, name: '.activities.0', leaf: '0', depth: 2, mappedField: '', seenInLogCount: 3, values: [{ value: 'Add', type: 'String', count: 3 }] },
  { id: 17, name: '.activities.1.', leaf: '1', depth: 2, mappedField: '', seenInLogCount: 3, values: [{ value: 'Validate', type: 'String', count: 3 }] }
]

export default {
  name: 'PagePipelineBuilder',
  data () {
    return {
      jsonPathes: [],
      selected: [],
      selecting: [],
      showHidden: false,
      search: '',
      addMode: false,
      logSample: [{}, {}, {}, {}],
      processedLogsCount: 4,
      showAllTypes: true,
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
      mdiTagsOptions: []
    }
  },
  computed: {
    selectedCount () {
      return this.selected.reduce((counter, value) => counter + (value ? 1 : 0), 0)
    },

    selectedPathes () {
      return this.selectedCount > 0
        ? this.jsonPathes.filter((p, i) => !!this.selected[i])
          .map(p => p.name + ' (' + p.value + ')')
          .join(', ')
        : 'none'
    },

    maxSeenInLog () {
      let max = 0
      this.jsonPathes.forEach(jp => {
        if (jp.seenInLogCount > max) {
          max = jp.seenInLogCount
        }
      })
      return max
    }
  },

  methods: {
    loadData () {
      setTimeout(() => { this.jsonPathes = [].concat(externalData) }, 300)
    },

    filterFn (val, update, abort) {
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
    }, // filterFn

    processLogSample ({ logSample, options }) {
      // Steps:
      // - get FileBeat to write to disk in specific file for LS
      // - Backend tails disk file
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

    } // processLogSample
  },

  mounted () {
    this.mdiTagsOptions = this.mdiTags
    this.loadData()
  },

  watch: {
    // jsonPathes: {
    //   handler () {
    //     this.$nextTick(() => vueSelectable.setSelectableItems(this.$refs.vsel));
    //   },
    //   deep: true
    // }
  }
}
</script>

<style scoped>
.fixed-font {
    font-family: monospace;
}
/* .span-json {
    margin-left: .2rem;
    padding-left: .8rem;
    border-left: 1px solid #05b5d4;
} */
.json-style-leaf {
    font-style: bold;
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
</style>
