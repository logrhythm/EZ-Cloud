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
