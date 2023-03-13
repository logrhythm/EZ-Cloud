//     ##     ##  ######   ######   ########     ###    ########  ##     ## ########  ########    ###    ########               ##     ##  ######
//     ###   ### ##    ## ##    ##  ##     ##   ## ##   ##     ## ##     ## ##     ## ##         ## ##      ##                  ##     ## ##    ##
//     #### #### ##       ##        ##     ##  ##   ##  ##     ## ##     ## ##     ## ##        ##   ##     ##                  ##     ## ##
//     ## ### ##  ######  ##   #### ########  ##     ## ########  ######### ########  ######   ##     ##    ##       #######    ##     ## ##
//     ##     ##       ## ##    ##  ##   ##   ######### ##        ##     ## ##     ## ##       #########    ##                  ##     ## ##
//     ##     ## ##    ## ##    ##  ##    ##  ##     ## ##        ##     ## ##     ## ##       ##     ##    ##                  ##     ## ##    ##
//     ##     ##  ######   ######   ##     ## ##     ## ##        ##     ## ########  ######## ##     ##    ##                   #######   ######

export default {
  shipper: 'carbonblackcloudbeat',
  collectionMethod: 'carbonblackcloudbeat',
  initialDefaultValues: {
    apiID: '',
    hostname: '',
    orgKey: '',
    secretKey: '',

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
      name: 'hostname',
      label: 'Carbon Black Cloud Console Hostname',
      type: {
        name: 'string'
      },
      description: `You must have a valid hostname to access the Carbon Black Cloud console.
> NOTE
> On purchase of carbon black cloud platform product user should get the hostname and login credentials
> The full list of valid hostnames is provided at:
> https://developer.carbonblack.com/reference/carbon-black-cloud/authentication/#hostname.

::: tip Preparation steps
To go through the configuration steps to configure API Access on the Carbon Black Cloud console to get alert logs on Carbon Black Cloud Beat, do follow the instructions at: [Configure Carbon Black Cloud](https://docs.logrhythm.com/docs/OCbeats/carbon-black-cloud-beat/configure-carbon-black-cloud).
:::    
`,
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'apiID',
      label: 'API ID',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'This is provided in the **API Credentials** pop-up once a new API Key is created in the **API Keys** tab in the Carbon Black Cloud Console.',
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'secretKey',
      label: 'API Secret Key',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'This is provided in the **API Credentials** pop-up once a new API Key is created in the **API Keys** tab in the Carbon Black Cloud Console.',
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'orgKey',
      label: 'Carbon Black Cloud Platform\'s Organization Key',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'This is gathered from the **API Keys** tab in the Carbon Black Cloud Console.',
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
> The Carbon Black Cloud Beat supports up to 180 days of backlog data.`,
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
      description: `The period value defines the polling interval to fetch records, in seconds.
> NOTE
> There can be a slight delay (up to 1 min) in syncing alerts due to a network issue depending upon the sensor sync alert on Carbon Black Cloud.`,
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
      description: `This is the identifier used by Carbon Black Cloud Beat to name its separate instances.
> NOTE
> - It is limited to 12 characters in length.
> - It's concatenated with \`carbonblackcloudbeat_\` to produce the Fully Qualified Beat Name (\`fullyqualifiedbeatname\` aka \`fqbn\`) in the form of \`carbonblackcloudbeat_xxxxxxxxxxxx\`
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
      description: `This is the identifier transformed internally to \`device_type\`, and is usually provided by Carbon Black Cloud Beat to the SIEM.
It's used for the Log Source Virtualisation.`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    }
  ] // definition
}
