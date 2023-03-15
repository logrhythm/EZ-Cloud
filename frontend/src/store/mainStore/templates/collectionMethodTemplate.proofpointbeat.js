//     ########  ########   #######   #######  ######## ########   #######  #### ##    ## ######## ########  ########    ###    ########                #######   ######
//     ##     ## ##     ## ##     ## ##     ## ##       ##     ## ##     ##  ##  ###   ##    ##    ##     ## ##         ## ##      ##                  ##     ## ##    ##
//     ##     ## ##     ## ##     ## ##     ## ##       ##     ## ##     ##  ##  ####  ##    ##    ##     ## ##        ##   ##     ##                  ##     ## ##
//     ########  ########  ##     ## ##     ## ######   ########  ##     ##  ##  ## ## ##    ##    ########  ######   ##     ##    ##       #######    ##     ## ##
//     ##        ##   ##   ##     ## ##     ## ##       ##        ##     ##  ##  ##  ####    ##    ##     ## ##       #########    ##                  ##     ## ##
//     ##        ##    ##  ##     ## ##     ## ##       ##        ##     ##  ##  ##   ###    ##    ##     ## ##       ##     ##    ##                  ##     ## ##    ##
//     ##        ##     ##  #######   #######  ##       ##         #######  #### ##    ##    ##    ########  ######## ##     ##    ##                   #######   ######

export default {
  shipper: 'proofpointbeat',
  collectionMethod: 'proofpointbeat',
  initialDefaultValues: {
    event_type: 'Clicks_Blocked',
    username: '',
    password: '',
    http_timeout: '120s',
    throttling_interval: '3600',

    number_of_back_days: 7,
    period: '180s',
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
      name: 'event_type',
      label: 'Event Types',
      type: {
        name: 'option'
      },
      options: [
        { value: 'Clicks_Blocked', label: 'Clicks_Blocked' },
        { value: 'Clicks_Permitted', label: 'Clicks_Permitted' },
        { value: 'Messages_Blocked', label: 'Messages_Blocked' },
        { value: 'Messages_Delivered', label: 'Messages_Delivered' }
      ],
      description: `Select the type of events to be collected.
::: danger Important
Tag parsing (except \`beatname\` and \`device_type\`) is not supported for the \`clicks_permitted\` endpoint.
However, if you are initializing this instance for **clicks permitted** events, the logs generated will be classified under the MPE subrule as **Proofpoint : Click Threat Allowed**.
:::    
`,
      default: 'Clicks_Blocked',
      required: true,
      group: 'Required'
    },
    {
      name: 'username',
      label: 'Proofpoint Service Principal (Username)',
      type: {
        name: 'string'
      },
      description: 'This is the Proofpoint service **Principal**, obtained from the **Proofpoint portal**.',
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'password',
      label: 'Proofpoint Service Secret (Password)',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'This is the Proofpoint service **Secret**, obtained from the **Proofpoint portal**.',
      default: '',
      required: true,
      group: 'Required'
    },

    // Throttling

    {
      name: 'http_timeout',
      label: 'HTTP Timeout',
      type: {
        name: 'number'
      },
      suffix: {
        options: [
          { value: 's', label: 'Seconds' }
        ],
        default: 's'
      },
      description: 'Number of seconds to wait before declaring a timeout.',
      default: '120s',
      min: 15,
      max: 3600,
      required: true,
      group: 'Throttling'
    },
    {
      name: 'number_of_back_days',
      label: 'Number of Back Days',
      type: {
        name: 'number'
      },
      description: `Number of past days data need to be fetched when fetching data for very first time.
> NOTE
> The Proofpoint Beat supports up to 180 days of backlog data.`,
      default: '7',
      min: 1,
      max: 180,
      required: true,
      group: 'Throttling'
    },
    {
      name: 'throttling_interval',
      label: 'Throttling Interval',
      type: {
        name: 'number'
      },
      description: 'Number of seconds to wait before making another API call in case for failed request, to avoid Throttling.',
      default: '3600',
      min: 60,
      max: 86400,
      required: false,
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
      default: '180s',
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
      description: `This is the identifier used by Proofpoint Beat to name its separate instances.
> NOTE
> - It is limited to 12 characters in length.
> - It's concatenated with \`proofpointbeat_\` to produce the Fully Qualified Beat Name (\`fullyqualifiedbeatname\` aka \`fqbn\`) in the form of \`proofpointbeat_xxxxxxxxxxxx\`
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
      description: `This is the identifier transformed internally to \`device_type\`, and is usually provided by Proofpoint Beat to the SIEM.
It's used for the Log Source Virtualisation.`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    }
  ] // definition
}
