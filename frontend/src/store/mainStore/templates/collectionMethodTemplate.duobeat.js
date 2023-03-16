//     ########  ##     ##  #######  ########  ########    ###    ########                #######   ######
//     ##     ## ##     ## ##     ## ##     ## ##         ## ##      ##                  ##     ## ##    ##
//     ##     ## ##     ## ##     ## ##     ## ##        ##   ##     ##                  ##     ## ##
//     ##     ## ##     ## ##     ## ########  ######   ##     ##    ##       #######    ##     ## ##
//     ##     ## ##     ## ##     ## ##     ## ##       #########    ##                  ##     ## ##
//     ##     ## ##     ## ##     ## ##     ## ##       ##     ##    ##                  ##     ## ##    ##
//     ########   #######   #######  ########  ######## ##     ##    ##                   #######   ######

export default {
  shipper: 'duobeat',
  collectionMethod: 'duobeat',
  initialDefaultValues: {
    hostname: '',
    integrationKey: '',
    secretKey: '',
    logtypeList: 'AuthLog,AdminLog,TelephonyLog',

    limit: 1000,
    numbackdaysData: 0,
    period: '40s',
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
      name: 'hostname',
      label: 'API Hostname',
      type: {
        name: 'string'
      },
      description: `This is provided in the **Details** section page once a new **Admin API** is configured to be **Protected** in the Duo Admin Panel.
::: tip Preparation steps
To set up an **Integration key**, **Secret key**, and **API hostname**, do follow the instructions at: [Configure the Duo Admin API for Duo Beat](https://docs.logrhythm.com/docs/OCbeats/duo-authentication-security-beat/configure-duo-admin-api-for-duo-beat).
:::

::: tip Example
Valid **API Hostnames** look like:
- \`api-abcd1234.duosecurity.com\`
- \`api-9876def.duosecurity.com\`
:::
`,
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'integrationKey',
      label: 'Integration key',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'This is provided in the **Details** section page once a new **Admin API** is configured to be **Protected** in the Duo Admin Panel.',
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'secretKey',
      label: 'Secret key',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'This is provided in the **Details** section page once a new **Admin API** is configured to be **Protected** in the Duo Admin Panel.',
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'logtypeList',
      label: 'Log Types',
      type: {
        name: 'string'
      },
      description: `List the **Log Types** that the Open Collector should collect.
> NOTE
> The list is comma (,) separated set of Log Type names.

::: tip Examples
To collect from all Log Types, use the value \`AuthLog,AdminLog,TelephonyLog\`.
:::
`,
      default: 'AuthLog,AdminLog,TelephonyLog',
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
> It should be between 1 and 1000.

::: danger
\`Admin\` and \`Telephony\` logs don't support this limit, default limit for these logs is 1000 and it cannot be changed.
:::`,
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
> The Duo Beat supports up to 180 days of backlog data.`,
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
      min: 40,
      max: 3600,
      default: '40s',
      description: `The period value defines the polling interval to fetch records, in seconds.
> NOTE
> The recommended request interval is 40s to avoid the too many requests error.

Duo recommends requesting logs no more than once per minute.

::: danger
If the period time is below 40 sec it will default set to 40 sec.
:::`,
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
      description: `This is the identifier used by Duo Beat to name its separate instances.
> NOTE
> - It is limited to 12 characters in length.
> - It's concatenated with \`duobeat_\` to produce the Fully Qualified Beat Name (\`fullyqualifiedbeatname\` aka \`fqbn\`) in the form of \`duobeat_xxxxxxxxxxxx\`
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
      description: `This is the identifier transformed internally to \`device_type\`, and is usually provided by Duo Beat to the SIEM.
It's used for the Log Source Virtualisation.`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    }
  ] // definition
}
