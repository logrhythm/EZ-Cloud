//      ######  ####  ######   ######   #######     ###    ##     ## ########  ########  ########    ###    ########                #######   ######
//     ##    ##  ##  ##    ## ##    ## ##     ##   ## ##   ###   ### ##     ## ##     ## ##         ## ##      ##                  ##     ## ##    ##
//     ##        ##  ##       ##       ##     ##  ##   ##  #### #### ##     ## ##     ## ##        ##   ##     ##                  ##     ## ##
//     ##        ##   ######  ##       ##     ## ##     ## ## ### ## ########  ########  ######   ##     ##    ##       #######    ##     ## ##
//     ##        ##        ## ##       ##     ## ######### ##     ## ##        ##     ## ##       #########    ##                  ##     ## ##
//     ##    ##  ##  ##    ## ##    ## ##     ## ##     ## ##     ## ##        ##     ## ##       ##     ##    ##                  ##     ## ##    ##
//      ######  ####  ######   ######   #######  ##     ## ##     ## ##        ########  ######## ##     ##    ##                   #######   ######

export default {
  shipper: 'ciscoampbeat',
  collectionMethod: 'ciscoampbeat',
  initialDefaultValues: {
    clientID: '',
    apiKey: '',
    uriAddress: '',
    eventTypes: 'All',

    version: 'v1',
    debugInputFileName: '',
    debugInputFolder: '',

    limit: 1000,
    numbackdaysData: 7,
    numbackdaysDataAuditLogs: 7,
    startupDelayInSeconds: 10,
    period: '4s',
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
      name: 'clientID',
      label: 'ClientID',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: `This is provided in the **API Key Details** page once a new **API Credentials** is created in the Cisco Console.
::: tip Preparation steps
To set up an **API credential**, do follow the instructions at: [Configure the Cisco AMP Beat](https://docs.logrhythm.com/docs/OCbeats/cisco-amp-beat/configure-the-cisco-amp-beat).
:::    
`,
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'apiKey',
      label: 'API Key',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'This is provided in the **API Key Details** page once a new **API Credentials** is created in the Cisco Console.',
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'uriAddress',
      label: 'Regional URI Address',
      type: {
        name: 'string'
      },
      description: `This is the Cisco AMP EndPoint URI address for the preferred region.
> NOTE
> API is location based and varies depending on where your AMP instance resides.

::: tip Examples
Currently, three regions exist:
| Region | Address |
| ------ | ------- |
| U.S. | \`api.amp.cisco.com\` |
| Asia, Pacific, Japan, and China | \`api.apjc.amp.cisco.com\` |
| Europe | \`api.eu.amp.cisco.com\` |
:::    
`,
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'eventTypes',
      label: 'Event Types',
      type: {
        name: 'string'
      },
      description: `List the Event log file types that the Open Collector should collect.

::: tip Examples
To collect from all Event Log Types, use the value \`ALL\`.
Otherwise, specify each value separated by a comma (,) without spaces. For example: \`554696715,1091567628,553648130\`.
:::

> NOTE
> For more information on specific Event type IDs, see https://api-docs.amp.cisco.com/api_actions/details?`,
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
      name: 'numbackdaysData',
      label: 'Number of Back Days',
      type: {
        name: 'number'
      },
      description: `Number of past days data need to be fetched when fetching data for very first time.
> NOTE
> The Cisco AMP Beat supports up to 180 days of backlog data.`,
      default: '7',
      min: 1,
      max: 180,
      required: true,
      group: 'Throttling'
    },
    {
      name: 'numbackdaysDataAuditLogs',
      label: 'Number of Days from Audit Log',
      type: {
        name: 'number'
      },
      description: 'Number of past days of Audit data to collect.',
      default: '7',
      min: 1,
      max: 90,
      required: true,
      group: 'Throttling'
    },
    {
      name: 'startupDelayInSeconds',
      label: 'Startup Delay',
      type: {
        name: 'number'
      },
      suffix: {
        options: [
          { value: 's', label: 'Seconds' }
        ],
        default: 's'
      },
      description: 'Number of seconds to wait before starting collection.',
      default: '10s',
      min: 1,
      max: 60,
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
      default: '4s',
      description: `The period value defines the polling interval to fetch records, in seconds.
> NOTE
> To avoid throttling issues (429 error for too many requests), do not set the Period parameter below 4 seconds.`,
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
      description: `This is the identifier used by Cisco AMP Beat to name its separate instances.
> NOTE
> - It is limited to 12 characters in length.
> - It's concatenated with \`ciscoampbeat_\` to produce the Fully Qualified Beat Name (\`fullyqualifiedbeatname\` aka \`fqbn\`) in the form of \`ciscoampbeat_xxxxxxxxxxxx\`
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
      description: `This is the identifier transformed internally to \`device_type\`, and is usually provided by Cisco AMP Beat to the SIEM.
It's used for the Log Source Virtualisation.`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    }
  ] // definition
}
