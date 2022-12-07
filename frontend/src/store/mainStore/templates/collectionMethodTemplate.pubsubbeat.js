
//  ########  ##     ## ########   ######  ##     ## ########                 #######   ######
//  ##     ## ##     ## ##     ## ##    ## ##     ## ##     ##               ##     ## ##    ##
//  ##     ## ##     ## ##     ## ##       ##     ## ##     ##               ##     ## ##
//  ########  ##     ## ########   ######  ##     ## ########     #######    ##     ## ##
//  ##        ##     ## ##     ##       ## ##     ## ##     ##               ##     ## ##
//  ##        ##     ## ##     ## ##    ## ##     ## ##     ##               ##     ## ##    ##
//  ##         #######  ########   ######   #######  ########                 #######   ######

export default {
  shipper: 'pubsubbeat',
  collectionMethod: 'pubsubbeat',
  initialDefaultValues: {
    'subscription.create': true,
    'subscription.retain_acked_messages': false,
    'subscription.retention_duration': '168h',
    'json.enabled': true,
    'json.add_error_key': true,
    heartbeatdisabled: false,
    heartbeatinterval: 60
  },
  identificationStyle: ['logrhythmBeat'],
  definition: [
    // Required
    {
      name: 'project_id',
      label: 'GCP Project ID',
      type: {
        name: 'string'
      },
      description: 'The Project ID of your project from GCP.', // TODO:
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'topic',
      label: 'GCP Topic',
      type: {
        name: 'string'
      },
      description: `The Topic name from GCP.

::: tip
Enter only the portion that appears after \`topics/\`.

For example, if your GCP console listed the **Topic** name as \`projects/datacollector-0000/topics/sample-topic\`, you would enter: \`sample-topic\`.
:::`,
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'subscription.name',
      label: 'GCP Subscription Name',
      type: {
        name: 'string'
      },
      description: `The Subscription name from GCP.

::: tip
Enter only the portion that appears after \`subscriptions/\`.

For example, if your GCP console listed the **Subscription** name as \`projects/datacollector-0000/subscriptions/sample-subscription\`, you would enter \`sample-subscription\`.
:::`,
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'credentials_file',
      label: 'GCP Credentials File',
      type: {
        name: 'file'
      },
      fileOptions: { // For file type.
        dropIn: true, // Do we drop the file content into a specific location on the disk. If False, the content is left as is in the field, just like a multiline string.
        dropInPath: '/gcp_credentials.json', // Where on the disk to drop the file to
        valueInConfig: '/beats/pubsubbeat/config/gcp_credentials.json', // Path or file name to use as the value for the field
        maxFileSize: null // Maximum file size, in bytes. Ignored if not set (or set to null)
      },
      description: '', // TODO:
      default: '',
      required: true,
      group: 'Required'
    },

    // Advanced - Subscription

    {
      name: 'subscription.create',
      label: 'Create Subscription',
      type: {
        name: 'boolean'
      },
      description: '', // TODO:
      default: true,
      required: false,
      group: 'Advanced - Subscription'
    },
    {
      name: 'subscription.retain_acked_messages',
      label: 'Retain Acknowledged Messages',
      type: {
        name: 'boolean'
      },
      description: '', // TODO:
      default: false,
      required: false,
      group: 'Advanced - Subscription'
    },
    {
      name: 'subscription.retention_duration',
      label: 'Retention Duration',
      type: {
        name: 'number'
      },
      suffix: {
        required: true,
        options: [/* { value: 's', label: 'Seconds' }, { value: 'm', label: 'Minutes' }, */{ value: 'h', label: 'Hours' }],
        default: 'h'
      },
      description: '', // TODO:
      default: '168h',
      min: 0,
      max: 744,
      required: false,
      group: 'Advanced - Subscription'
    },

    // Advanced - JSON

    {
      name: 'json.enabled',
      label: 'Enabled',
      type: {
        name: 'boolean'
      },
      description: '', // TODO:
      default: true,
      required: false,
      group: 'Advanced - JSON'
    },
    {
      name: 'json.add_error_key',
      label: 'Add Error Key',
      type: {
        name: 'boolean'
      },
      description: '', // TODO:
      default: true,
      required: false,
      group: 'Advanced - JSON'
    },

    // EZ Internal

    {
      name: 'beatIdentifier',
      label: 'Beat Identifier',
      type: {
        name: 'string'
      },
      default: '',
      description: `This is the identifier used by PubSub Beat to name its separate instances.
> NOTE
> - It is limited to 12 characters in length.
> - It's concatenated with \`pubsubbeat_\` to produce the Fully Qualified Beat Name (\`fullyqualifiedbeatname\` aka \`fqbn\`) in the form of \`pubsubbeat_xxxxxxxxxxxx\`
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
      description: `This is the identifier transformed internally to \`device_type\`, and is usually provided by PubSub Beat to the SIEM.
It's used for the Log Source Virtualisation.`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    }
  ] // definition
}
