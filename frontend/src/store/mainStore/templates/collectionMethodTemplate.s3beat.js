//   ######   #######  ########  ########    ###    ########                #######   ######
//  ##    ## ##     ## ##     ## ##         ## ##      ##                  ##     ## ##    ##
//  ##              ## ##     ## ##        ##   ##     ##                  ##     ## ##
//   ######   #######  ########  ######   ##     ##    ##       #######    ##     ## ##
//        ##        ## ##     ## ##       #########    ##                  ##     ## ##
//  ##    ## ##     ## ##     ## ##       ##     ##    ##                  ##     ## ##    ##
//   ######   #######  ########  ######## ##     ##    ##                   #######   ######

export default {
  shipper: 's3beat',
  collectionMethod: 's3beat',
  initialDefaultValues: {
    awsFlag: false,
    period: '10s',
    assumeRoleFlag: false,
    stsCredsExpirationTime: '1h',
    'multiline.negate': 'true',
    'traits.inclusion': '',
    'traits.exclusion': '',
    heartbeatdisabled: false,
    heartbeatinterval: 60
  },
  identificationStyle: ['logrhythmBeat'],
  definition: [
    // Required
    {
      name: 'sqsQueues',
      label: 'SQS Queues and Regions',
      type: {
        name: 'array',
        of: {
          type: {
            name: 'string'
          },
          default: '',
          required: true
        }
      },
      description: `Enter your s3beat sqs queue and region in the format \`queuename:region\`. You can configure multiple queuename and region combinations.

> NOTE
> For region codes, see https://docs.aws.amazon.com/general/latest/gr/rande.html#sqs_region.`,
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'awsFlag',
      label: 'Running S3Beat in AWS?',
      type: {
        name: 'option'
      },
      options: [
        { value: 'true', label: 'Running in AWS' },
        { value: 'false', label: 'Running on-premise (not in AWS)' }
      ],
      description: `Flag if the Beat is running inside of AWS, or if it is running on-premise or in a different Cloud provider.

::: danger
If set to "**Running on-premise (not in AWS)**", all fields of the **Authentication for non-AWS deployment** section below must be filled in.
:::
`,
      default: 'false',
      required: true,
      group: 'Required'
    },

    // Authentication for non-AWS deployment

    {
      name: 'accessKeyID',
      label: 'AWS application Access key ID',
      type: {
        name: 'string'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: `Enter the access key of your s3beat AWS application, which you should have saved from the [Configure AWS S3 section](https://docs.logrhythm.com/docs/OCbeats/aws-s3-beat/configure-aws-s3).

> NOTE
> The secret access key and access keys are saved in encrypted format.`,
      default: '',
      required: true,
      group: 'Authentication for non-AWS deployment'
    },
    {
      name: 'secretAccessKey',
      label: 'AWS application Secret access key',
      type: {
        name: 'string'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: `Enter the s3beat secret access key of your s3beat AWS application, which you should have saved from the [Configure AWS S3 section](https://docs.logrhythm.com/docs/OCbeats/aws-s3-beat/configure-aws-s3).

> NOTE
> The secret access key and access keys are saved in encrypted format.`,
      default: '',
      required: true,
      group: 'Authentication for non-AWS deployment'
    },

    // Cross-account Access

    {
      name: 'assumeRoleFlag',
      label: 'Enable Cross-Account Access',
      type: {
        name: 'option'
      },
      options: [
        { value: 'true', label: 'Enable' },
        { value: 'false', label: 'Disable' }
      ],
      description: 'Enable cross-account access of some objects.',
      default: 'false',
      required: true,
      group: 'Cross-account Access'
    },
    {
      name: 'assumeRoleArn',
      label: 'Cross-Account Access ARN',
      type: {
        name: 'array',
        of: {
          type: {
            name: 'string'
          },
          default: '',
          required: true
        }
      },
      description: 'Enter your s3beat ARN for the Assume role cross account access in the format `arn:aws:iam::{Account-A-ID}:role/{Assume_role_name}` .',
      default: '',
      required: true,
      group: 'Cross-account Access'
    },

    // Multilines

    {
      name: 'multiline.negate',
      label: 'Enable multiline pattern Regex',
      type: {
        name: 'boolean'
      },
      description: 'Enable multiline pattern Regex.',
      default: false,
      required: true,
      group: 'Multilines'
    },
    {
      name: 'multiline.pattern',
      label: 'Multiline pattern Regex',
      type: {
        name: 'string'
      },
      description: 'Enter the Regex used to separate multiline messages.',
      default: '',
      required: true,
      group: 'Multilines'
    },
    {
      name: 'multiline.match',
      label: 'Multiline match location',
      type: {
        name: 'option'
      },
      options: [
        { value: 'before', label: 'Before' },
        { value: 'after', label: 'After' }
      ],
      description: '',
      default: 'after',
      required: true,
      group: 'Multilines'
    },

    // Advanced

    {
      name: 'stsCredsExpirationTime ',
      label: 'STS Credential Expiration',
      type: {
        name: 'number'
      },
      suffix: {
        options: [
          { value: 'h', label: 'Hours' }
        ],
        default: 'h'
      },
      description: 'This sets the maximum session duration of IAM role assigned to ARN used for Assume role.',
      default: '1h',
      min: 0,
      max: 240,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'traits.inclusion',
      label: 'S3 Traits - Inclusion',
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
    {
      name: 'traits.exclusion',
      label: 'S3 Traits - Exclusion',
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
      default: '10s',
      description: 'The period value defines the polling interval to fetch records from the bucket, in seconds.',
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
      description: `This is the identifier used by Webhook Beat to name its separate instances.
> NOTE
> - It is limited to 12 characters in length.
> - It's concatenated with \`webhookbeat_\` to produce the Fully Qualified Beat Name (\`fullyqualifiedbeatname\` aka \`fqbn\`) in the form of \`webhookbeat_xxxxxxxxxxxx\`
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
      description: `This is the identifier transformed internally to \`device_type\`, and is usually provided by Webhook Beat to the SIEM.
It's used for the Log Source Virtualisation.`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    }
  ] // definition
}
