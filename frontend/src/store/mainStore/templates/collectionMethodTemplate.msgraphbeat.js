//     ##     ##  ######   ######   ########     ###    ########  ##     ## ########  ########    ###    ########               ##     ##  ######
//     ###   ### ##    ## ##    ##  ##     ##   ## ##   ##     ## ##     ## ##     ## ##         ## ##      ##                  ##     ## ##    ##
//     #### #### ##       ##        ##     ##  ##   ##  ##     ## ##     ## ##     ## ##        ##   ##     ##                  ##     ## ##
//     ## ### ##  ######  ##   #### ########  ##     ## ########  ######### ########  ######   ##     ##    ##       #######    ##     ## ##
//     ##     ##       ## ##    ##  ##   ##   ######### ##        ##     ## ##     ## ##       #########    ##                  ##     ## ##
//     ##     ## ##    ## ##    ##  ##    ##  ##     ## ##        ##     ## ##     ## ##       ##     ##    ##                  ##     ## ##    ##
//     ##     ##  ######   ######   ##     ## ##     ## ##        ##     ## ########  ######## ##     ##    ##                   #######   ######

export default {
  shipper: 'msgraphbeat',
  collectionMethod: 'msgraphbeat',
  initialDefaultValues: {
    msgraphURL: '',
    client_id: '',
    client_secret: '',
    tenant_id: '',
    top: 1,
    throttlingIntervalSecs: 60,
    limit: 1000,
    numbackdaysData: 7,
    period: '2s',
    heartbeatdisabled: false,
    heartbeatinterval: 60
  },
  identificationStyle: ['logrhythmBeat'],
  options: {
    extractPayloadFieldOnly: false,
    payloadField: 'response'
  },
  definition: [
    // Required
    {
      name: 'msgraphURL',
      label: 'Microsoft Graph API URL',
      type: {
        name: 'string'
      },
      description: `Enter one of the following Microsoft Graph API URLs, depending on the endpoint being configured:
- \`graph.microsoft.com/v1.0/auditLogs/directoryAudits\`
- \`graph.microsoft.com/v1.0/auditLogs/signIns\`
- \`graph.microsoft.com/v1.0/security/alerts\``,
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'client_id',
      label: 'Client ID',
      type: {
        name: 'string'
      },
      description: 'Microsoft Graph API Client ID, which wcan be obtained as the **Value** in [Configure Microsoft Graph API](https://docs.logrhythm.com/docs/OCbeats/microsoft-graph-api-beat/configure-microsoft-graph-api).',
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'client_secret',
      label: 'Password',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'Microsoft Graph API Secret ID, which wcan be obtained as the **Secret ID** in [Configure Microsoft Graph API](https://docs.logrhythm.com/docs/OCbeats/microsoft-graph-api-beat/configure-microsoft-graph-api).',
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'tenant_id',
      label: 'Tenant ID',
      type: {
        name: 'string'
      },
      description: 'Microsoft Graph API Tenant ID',
      default: '',
      required: true,
      group: 'Required'
    },

    // Throttling

    {
      name: 'limit',
      label: 'Data Limit',
      type: {
        name: 'number'
      },
      description: `Maximum number of logs to be fetched from server per each cycle.
> NOTE
> It should be between 1 and 1000.`,
      default: '1000',
      min: 1,
      max: 1000,
      required: true,
      group: 'Throttling'
    },
    {
      name: 'throttlingIntervalSecs',
      label: 'Anti-Throttling Interval',
      type: {
        name: 'number'
      },
      description: 'Time period, in seconds, to wait before making another API call if the previous request failed, to avoid throttling.',
      default: '60',
      min: 0,
      max: 3600,
      required: false,
      group: 'Throttling'
    },
    {
      name: 'numbackdaysData',
      label: 'Number of Back Days',
      type: {
        name: 'number'
      },
      description: `Number of past days data need to be fetched when fetching data for very first time.
> NOTE
> The Microsoft Graph API Beat supports up to 180 days of backlog data.`,
      default: '7',
      min: 1,
      max: 180,
      required: true,
      group: 'Throttling'
    },

    // Polling Interval

    {
      name: 'period',
      label: 'Period',
      type: {
        name: 'number'
      },
      suffix: {
        options: [
          { value: 's', label: 'Seconds' }
        ],
        default: 's'
      },
      min: 1,
      max: 3600,
      default: '2s',
      description: 'The period value defines the polling interval to fetch records, in seconds.',
      required: true,
      group: 'Polling Interval'
    },

    // EZ Internal

    {
      name: 'beatIdentifier',
      label: 'Beat Identifier',
      type: {
        name: 'string'
      },
      default: '',
      description: `This is the identifier used by Microsoft Graph API Beat to name its separate instances.
> NOTE
> - It is limited to 12 characters in length.
> - It's concatenated with \`msgraphbeat_\` to produce the Fully Qualified Beat Name (\`fullyqualifiedbeatname\` aka \`fqbn\`) in the form of \`msgraphbeat_xxxxxxxxxxxx\`
`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    },
    {
      name: 'logsource_name',
      label: 'LogSource Name',
      type: {
        name: 'string'
      },
      default: '',
      description: `This is the identifier transformed internally to \`device_type\`, and is usually provided by Microsoft Graph API Beat to the SIEM.
It's used for the Log Source Virtualisation.`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    }
  ] // definition
}
