//     ##     ##  ######   ######   ########     ###    ########  ##     ## ########  ########    ###    ########               ##     ##  ######
//     ###   ### ##    ## ##    ##  ##     ##   ## ##   ##     ## ##     ## ##     ## ##         ## ##      ##                  ##     ## ##    ##
//     #### #### ##       ##        ##     ##  ##   ##  ##     ## ##     ## ##     ## ##        ##   ##     ##                  ##     ## ##
//     ## ### ##  ######  ##   #### ########  ##     ## ########  ######### ########  ######   ##     ##    ##       #######    ##     ## ##
//     ##     ##       ## ##    ##  ##   ##   ######### ##        ##     ## ##     ## ##       #########    ##                  ##     ## ##
//     ##     ## ##    ## ##    ##  ##    ##  ##     ## ##        ##     ## ##     ## ##       ##     ##    ##                  ##     ## ##    ##
//     ##     ##  ######   ######   ##     ## ##     ## ##        ##     ## ########  ######## ##     ##    ##                   #######   ######

export default {
  shipper: 'msgraphbeat',
  collectionMethod: 'msgraphbeat-default',
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
  mappingStyle: 'default', // `custom`: will offer the Field Mapping option, or `default`: will NOT offer to do Field Mappings. If not provided, falls back to 'custom'
  skipDeploymentSteps: [
    // 'e745e0e6-60f6-4857-8afa-f8ea0663b6c3', // Deploy: Create and drop Beat's configuration in right location
    'd004f165-a028-4183-8e6d-f64534357c5d', // Deploy: Import JQ Pipeline into OpenCollector
    'b632b998-cd67-4571-a384-31faf0053d1a', // Deploy: Create Log Source Type
    '7e739d98-d427-4fac-9f63-392e8ccb4c94', // Deploy: Create MPE Rule
    '04ff4e8c-de73-419a-a48b-944b01bca836', // Deploy: Create MPE Sub-Rule(s)
    '6fba3b49-580b-4ceb-b8be-374fc848fe63', // Deploy: Create Processing Policy
    'dd1fae83-10af-40ea-bfe9-20ff668d5141', // Deploy: Create Log Source (LS) Virtualisation
    '857787cd-4ec5-4c06-b044-7aaf37de326f', // Deploy: Create new LS Virtualisation Item and associate it to LS Virtualisation
    '1246443c-2f50-48af-bd7e-8072ed214e2e', // Deploy: Search related OpenCollector LS
    '5c0a3a9c-6d01-40e6-acb8-b0763a52bba3' // Deploy: Add LS Virtualisation to OpenCollector Log Source
    // '8276950b-c01b-423e-8ce0-1ed23af6efe4' // Un-deploy: Delete Beat configuration for Stream
  ],
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
