//     ##      ## ######## ########  ##     ##  #######   #######  ##    ##                #######   ######
//     ##  ##  ## ##       ##     ## ##     ## ##     ## ##     ## ##   ##                ##     ## ##    ##
//     ##  ##  ## ##       ##     ## ##     ## ##     ## ##     ## ##  ##                 ##     ## ##
//     ##  ##  ## ######   ########  ######### ##     ## ##     ## #####       #######    ##     ## ##
//     ##  ##  ## ##       ##     ## ##     ## ##     ## ##     ## ##  ##                 ##     ## ##
//     ##  ##  ## ##       ##     ## ##     ## ##     ## ##     ## ##   ##                ##     ## ##    ##
//      ###  ###  ######## ########  ##     ##  #######   #######  ##    ##                #######   ######

export default {
  shipper: 'webhookbeat',
  collectionMethod: 'webhookbeat',
  definition: [
    // Required

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
