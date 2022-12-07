//  ######## ##     ## ######## ##    ## ######## ##     ## ##     ## ########                 #######   ######
//  ##       ##     ## ##       ###   ##    ##    ##     ## ##     ## ##     ##               ##     ## ##    ##
//  ##       ##     ## ##       ####  ##    ##    ##     ## ##     ## ##     ##               ##     ## ##
//  ######   ##     ## ######   ## ## ##    ##    ######### ##     ## ########     #######    ##     ## ##
//  ##        ##   ##  ##       ##  ####    ##    ##     ## ##     ## ##     ##               ##     ## ##
//  ##         ## ##   ##       ##   ###    ##    ##     ## ##     ## ##     ##               ##     ## ##    ##
//  ########    ###    ######## ##    ##    ##    ##     ##  #######  ########                 #######   ######

export default {
  shipper: 'eventhubbeat',
  collectionMethod: 'eventhubbeat-custom',
  initialDefaultValues: {
    azureFlag: false, // Defaults to OnPrem
    cloudInstanceType: 'Public Cloud', // For OnPrem deployment
    azureeventHubFileeventPositionfile: '', // Unused?
    clientId: '', // Unused?
    clientSecret: '', // Unused?
    consumergroup: '', // Unused?
    ehdetails: [], // For in Azure deployment
    environmentFlag: null, // Unused?
    resourceGroupName: '', // For in Azure deployment
    sampleLogFile: '', // Unused?
    storageAccountName: '', // For in Azure deployment
    subscriptionID: '', // For in Azure deployment
    tenantId: '', // Unused?
    throttlingIntervalSecs: 5,
    heartbeatdisabled: false,
    heartbeatinterval: 60
  },
  identificationStyle: ['logrhythmBeat'],
  mappingStyle: 'custom', // `custom`: will offer the Field Mapping option, or `default`: will NOT offer to do Field Mappings
  definition: [
    // Required
    {
      name: 'azureFlag',
      label: 'Running Event Hub Beat in Azure?',
      type: {
        name: 'option'
      },
      options: [
        { value: 'true', label: 'Running in Azure' },
        { value: 'false', label: 'Running on-premise (not in Azure)' }
      ],
      description: `Flag if the Beat is running inside of Azure, or if it is running on-premise or in a different Cloud provider.

::: danger
- If set to "**Running in Azure**", all fields of the **Running in Azure** section below must be filled in.
- If set to "**Running on-premise (not in Azure)**", all fields of the **Running on-premise (not in Azure)** section below must be filled in.
:::
`,
      default: 'false',
      required: true,
      group: 'Required'
    },

    // Running in Azure

    {
      name: 'subscriptionID',
      label: 'Azure Subscription ID',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: '', // TODO:
      default: '',
      required: true,
      group: 'Running in Azure'
    },
    {
      name: 'resourceGroupName',
      label: 'Azure Resource Group Name',
      type: {
        name: 'string'
      },
      description: '', // TODO:
      default: '',
      required: true,
      group: 'Running in Azure'
    },
    {
      name: 'storageAccountName',
      label: 'Azure Storage Account Name',
      type: {
        name: 'string'
      },
      description: 'This Azure Storage is used by the Event Hub Beat to store the references of the last messages collected, so each collection cycle can start where the previous one left off.',
      default: '',
      required: true,
      group: 'Running in Azure'
    },
    {
      name: 'storageconnectionstring',
      label: 'Azure Storage Connection String',
      type: {
        name: 'array',
        of: { // for array and object
          type: {
            name: 'string'
          },
          default: '',
          description: '',
          required: true
        }
      },
      description: `Provide the names of all the Azure EventHub Storages you want to collect from, and for each, their respective Named Space and Instance Name.
> NOTE
> The format is: \`<EventHub Namespace Name>,<EventHub Instance Name>,<Storagecontainername>\`. Using a coma and no space to separate the three values`,
      default: '',
      required: true,
      group: 'Running in Azure'
    },

    // Running on-premise (not in Azure)

    {
      name: 'cloudInstanceType',
      label: 'Cloud Instance Type',
      type: {
        name: 'option'
      },
      options: [
        { value: 'Public Cloud', label: 'Public Cloud' },
        { value: 'China Cloud', label: 'China Cloud' },
        { value: 'US Gov Cloud', label: 'US Gov Cloud' }
      ],
      description: 'Select the cloud service instance type',
      default: 'Public Cloud',
      required: true,
      group: 'Running on-premise (not in Azure)'
    },
    {
      name: 'storageconnectionstring',
      label: 'Azure Storage Connection String',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'This Azure Storage is used by the Event Hub Beat to store the references of the last messages collected, so each collection cycle can start where the previous one left off.',
      default: '',
      required: true,
      group: 'Running on-premise (not in Azure)'
    },
    {
      name: 'connectionstring',
      label: 'Azure EventHub Storages to Collect',
      type: {
        name: 'object',
        of: { // for array and object
          type: {
            name: 'password'
          },
          obfuscation: {
            compulsory: true,
            method: 'oc_encrypt',
            obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
          },
          default: '',
          description: '',
          required: true
        }
      },
      description: 'Provide the names of all the Azure EventHub Storages you want to collect from, and for each, their respective Connection String',
      required: true,
      group: 'Running on-premise (not in Azure)'
    },

    // EZ Internal

    {
      name: 'beatIdentifier',
      label: 'Beat Identifier',
      type: {
        name: 'string'
      },
      default: '',
      description: `This is the identifier used by Event Hub Beat to name its separate instances.
> NOTE
> - It is limited to 12 characters in length.
> - It's concatenated with \`kafkabeat_\` to produce the Fully Qualified Beat Name (\`fullyqualifiedbeatname\` aka \`fqbn\`) in the form of \`kafkabeat_xxxxxxxxxxxx\`
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
      description: `This is the identifier transformed internally to \`device_type\`, and is usually provided by Event Hub Beat to the SIEM.
It's used for the Log Source Virtualisation.`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    }
  ] // definition
}
