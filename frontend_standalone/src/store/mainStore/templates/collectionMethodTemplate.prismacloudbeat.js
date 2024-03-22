//     ########  ########  ####  ######  ##     ##    ###        ######  ##        #######  ##     ## ########                 #######   ######
//     ##     ## ##     ##  ##  ##    ## ###   ###   ## ##      ##    ## ##       ##     ## ##     ## ##     ##               ##     ## ##    ##
//     ##     ## ##     ##  ##  ##       #### ####  ##   ##     ##       ##       ##     ## ##     ## ##     ##               ##     ## ##
//     ########  ########   ##   ######  ## ### ## ##     ##    ##       ##       ##     ## ##     ## ##     ##    #######    ##     ## ##
//     ##        ##   ##    ##        ## ##     ## #########    ##       ##       ##     ## ##     ## ##     ##               ##     ## ##
//     ##        ##    ##   ##  ##    ## ##     ## ##     ##    ##    ## ##       ##     ## ##     ## ##     ##               ##     ## ##    ##
//     ##        ##     ## ####  ######  ##     ## ##     ##     ######  ########  #######   #######  ########                 #######   ######

export default {
  shipper: 'prismacloudbeat',
  collectionMethod: 'prismacloudbeat',
  initialDefaultValues: {
    prismacloudURL: '',
    client_id: '',
    client_secret: '',
    limit: 1000,
    numbackdaysData: 1,
    throttlingIntervalSecs: 60,
    period: '10s',
    heartbeatdisabled: false,
    heartbeatinterval: 60
  },
  identificationStyle: ['logrhythmBeat'],
  definition: [
    // Required
    {
      name: 'prismacloudURL',
      label: 'Prisma Cloud API URL',
      type: {
        name: 'string'
      },
      description: `The URL for the API server.
::: tip Example
The URL typically looks something like:
\`\`\` text
api4.prismacloud.io/audit/redlock/?
\`\`\`
:::
`,
      default: '',
      required: false,
      group: 'Required'
    },
    {
      name: 'client_id',
      label: 'Prisma Cloud Access Key ID',
      type: {
        name: 'string'
      },
      description: `Prisma Cloud requires an API access key to enable programmatic access to the REST API.
> NOTE
> This is the **Access Key ID** part of your access key.

::: tip Hint
To generate an access key, see **Create and Manage Access Keys** at:
https://docs.paloaltonetworks.com/content/techdocs/en_US/prisma/prisma-cloud/prisma-cloud-admin/manage-prisma-cloud-administrators/create-access-keys.html#idb225a52a-85ea-4b0c-9d69-d2dfca250e16.
:::
`,
      default: '',
      required: false,
      group: 'Required'
    },
    {
      name: 'client_secret',
      label: 'Prisma Cloud Secret Key',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: `Prisma Cloud requires an API access key to enable programmatic access to the REST API.
> NOTE
> This is the **Secret Key** part of your access key.

::: tip Hint
To generate an access key, see **Create and Manage Access Keys** at:
https://docs.paloaltonetworks.com/content/techdocs/en_US/prisma/prisma-cloud/prisma-cloud-admin/manage-prisma-cloud-administrators/create-access-keys.html#idb225a52a-85ea-4b0c-9d69-d2dfca250e16.
:::
`,
      default: '',
      required: false,
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
      description: 'Number of past days data need to be fetched when fetching data for very first time.',
      default: '1',
      min: 1,
      max: 180,
      required: true,
      group: 'Throttling'
    },

    // Advanced

    {
      name: 'period',
      label: 'Output period',
      type: {
        name: 'number'
      },
      suffix: {
        options: [
          { value: 's', label: 'Seconds' }
        ],
        default: 's'
      },
      description: `Defines how often the fetched data is to be sent to OpenCollector.
::: danger
Only modify this value if asked by a member of LogRhythm staff.
:::
`,
      default: '10s',
      min: 2,
      max: 3600,
      required: true,
      group: 'Advanced'
    },

    // EZ Internal

    {
      name: 'beatIdentifier',
      label: 'Beat Identifier',
      type: {
        name: 'string'
      },
      default: '',
      description: `This is the identifier used by Prisma Cloud Beat to name its separate instances.
> NOTE
> - It is limited to 12 characters in length.
> - It's concatenated with \`prismacloudbeat_\` to produce the Fully Qualified Beat Name (\`fullyqualifiedbeatname\` aka \`fqbn\`) in the form of \`prismacloudbeat_xxxxxxxxxxxx\`
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
      description: `This is the identifier transformed internally to \`device_type\`, and is usually provided by Prisma Cloud Beat to the SIEM.
It's used for the Log Source Virtualisation.`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    }
  ] // definition
}
