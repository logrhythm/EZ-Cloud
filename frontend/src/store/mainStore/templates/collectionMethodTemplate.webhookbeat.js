//                     #######   ######
//                     ##     ## ##    ##
//                     ##     ## ##
//          #######    ##     ## ##
//                     ##     ## ##
//                     ##     ## ##    ##
//                     #######   ######

export default {
  shipper: 'webhookbeat',
  collectionMethod: 'webhookbeat',
  definition: [
    // Required
    {
      name: 'hostname',
      label: 'Webhook Listener Hostname/IP',
      type: {
        name: 'string'
      },
      description: 'Provide the hostname or IP address for the Webhook endpoint only; do not include the query parameters string.',
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'portnumber',
      label: 'Port Number',
      type: {
        name: 'string'
      },
      description: 'HTTP listening service TCP Port.',
      default: '8080',
      required: true,
      group: 'Required'
    },
    {
      name: 'sslflag',
      label: 'SSL Flag',
      type: {
        name: 'option'
      },
      options: [
        { value: 'true', label: 'Enable HTTPS' },
        { value: 'false', label: 'Disable HTTPS' }
      ],
      description: `Enforce HTTPS or operate the Webhook Beat without any transport encryption.`,
      default: 'false',
      required: true,
      group: 'Required'
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
> - It's concatenated with \`genericbeat_\` to produce the Fully Qualified Beat Name (\`fullyqualifiedbeatname\` aka \`fqbn\`) in the form of \`webhookbeat_xxxxxxxxxxxx\`
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
      description: `This is the identifier transformed internally to \`device_type\`, and is usually provided by Generic Beat to the SIEM.
It's used for the Log Source Virtualisation.`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    }
  ] // definition
}
