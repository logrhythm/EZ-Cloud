//      ######  ##    ## ##     ##    ###    ##    ## ######## ########  ######  ##      ##  ######   ######  ########  ########    ###    ########                #######   ######
//     ##    ##  ##  ##  ###   ###   ## ##   ###   ##    ##    ##       ##    ## ##  ##  ## ##    ## ##    ## ##     ## ##         ## ##      ##                  ##     ## ##    ##
//     ##         ####   #### ####  ##   ##  ####  ##    ##    ##       ##       ##  ##  ## ##       ##       ##     ## ##        ##   ##     ##                  ##     ## ##
//      ######     ##    ## ### ## ##     ## ## ## ##    ##    ######   ##       ##  ##  ##  ######   ######  ########  ######   ##     ##    ##       #######    ##     ## ##
//           ##    ##    ##     ## ######### ##  ####    ##    ##       ##       ##  ##  ##       ##       ## ##     ## ##       #########    ##                  ##     ## ##
//     ##    ##    ##    ##     ## ##     ## ##   ###    ##    ##       ##    ## ##  ##  ## ##    ## ##    ## ##     ## ##       ##     ##    ##                  ##     ## ##    ##
//      ######     ##    ##     ## ##     ## ##    ##    ##    ########  ######   ###  ###   ######   ######  ########  ######## ##     ##    ##                   #######   ######

export default {
  shipper: 'symantecwssbeat',
  collectionMethod: 'symantecwssbeat',
  initialDefaultValues: {
    period: '30s',
    limit: 1000,
    next_call_duration_in_min: 30,
    numbackhoursData: 2,
    password: '',
    symantecwss_url: 'portal.threatpulse.com/reportpod/logs/sync',
    throttlingIntervalSecs: 60,
    username: '',
    heartbeatdisabled: false,
    heartbeatinterval: 60
  },
  identificationStyle: ['logrhythmBeat'],
  options: {
    extractPayloadFieldOnly: false,
    payloadField: 'message' // FIXME:
  },
  definition: [
    // Required
    {
      name: 'username',
      label: 'Username',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'The username required for authentication.',
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'password',
      label: 'Password',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'The password required for authentication.',
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
      description: 'Time period, in seconds, to wait before making another API call if the previous request failed, to avoid throtlling.',
      default: '60',
      min: 0,
      max: 3600,
      required: false,
      group: 'Throttling'
    },
    {
      name: 'numbackhoursData',
      label: 'Number of Back Hours',
      type: {
        name: 'number'
      },
      description: `Number of past hours data need to be fetched when fetching data for very first time.
> NOTE
> The Symantec WSS Beat supports up to 180 hours of backlog data.`,
      default: '2',
      min: 1,
      max: 180,
      required: true,
      group: 'Throttling'
    },
    {
      name: 'next_call_duration_in_min',
      label: 'Next Call Duration',
      type: {
        name: 'number'
      },
      description: 'Defines the gap between two request calls. Must be between 2 and 120 minutes.',
      default: '30',
      min: 2,
      max: 120,
      required: true,
      group: 'Throttling'
    },

    // Advanced

    {
      name: 'symantecwss_url',
      label: 'Symantec WSS API URL',
      type: {
        name: 'string'
      },
      description: `
::: danger
Only set if directed by a LogRhythm Customer Success or Engineering team member.
:::`,
      default: '',
      required: false,
      group: 'Advanced'
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
      default: '30s',
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
      description: `This is the identifier used by Symantec WSS Beat to name its separate instances.
> NOTE
> - It is limited to 12 characters in length.
> - It's concatenated with \`symantecwssbeat_\` to produce the Fully Qualified Beat Name (\`fullyqualifiedbeatname\` aka \`fqbn\`) in the form of \`symantecwssbeat_xxxxxxxxxxxx\`
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
      description: `This is the identifier transformed internally to \`device_type\`, and is usually provided by Symantec WSS Beat to the SIEM.
It's used for the Log Source Virtualisation.`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    }
  ] // definition
}
