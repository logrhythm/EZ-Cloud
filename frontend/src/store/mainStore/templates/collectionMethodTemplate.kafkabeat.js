// KAFKA BEAT

export default {
  shipper: 'kafkabeat',
  collectionMethod: 'kafkabeat',
  initialDefaultValues: {
    tls_enabled: false,
    tls_enabled_skip_hostverify: false,
    sasl_enabled: false,
    sasl_mechanism: 'SCRAM_512',
    sentinel1ParsingEnable: false,
    consumerWaitTime: 500,
    maxProcessingTime: 5000,
    heartbeatdisabled: false,
    heartbeatinterval: 60
  },
  identificationStyle: ['logrhythmBeat'],
  definition: [
    // Required
    {
      name: 'broker',
      label: 'Kafka Broker Host and Port',
      type: {
        name: 'string'
      },
      description: `Enter the Kafka broker as: \`KAFKA_SERVER_HOST:KAFKA_SERVER_PORT\`, replacing \`KAFKA_SERVER_HOST\` with the IP of the Kafka server, and \`KAKFA_SERVER_PORT\` with the server port Kafka is listening to.
::: tip Examples
- \`10.3.1.56:9092\`
- \`192.168.2.56:9092\`
- \`ec2-124-45-67-89.ap-south-1.compute.amazonaws.com:9093\`
- \`broker.public-kafka.net:8000\`
:::`,
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'topic',
      label: 'Topic Name',
      type: {
        name: 'string'
      },
      description: `Enter the Kafka topic name from which you want to collect data.
      
      It should be the same topic on which your producer is sending data.`,
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'subscription.name',
      label: 'Consumer ID',
      type: {
        name: 'string'
      },
      description: `Enter the consumer ID for this beat instance.
> NOTE
> This must be unique for each beat instance.
>
> Valid characters for the consumer ID are \`a-z\`, \`A-Z\`, \`0-9\`, and \`._-\`.

::: danger
Using any other characters will result in a error.
:::

::: tip
You can always change the consumer ID whenever the logs needed to be fetched from the beginning.
:::`,
      default: '',
      required: true,
      group: 'Required'
    },

    // Encryption

    {
      name: 'tls_enabled',
      label: 'Enable TLS Encryption',
      type: {
        name: 'boolean'
      },
      description: `Enables or disables SSL support on the Kafka Beat.
::: danger
When **TLS Encryption** is **Enabled**, it is necessary to provide the certificates and keys below.
:::`,
      default: false,
      required: false,
      group: 'Encryption'
    },
    {
      name: 'tls_enabled_skip_hostverify',
      label: 'Skip Host Verification',
      type: {
        name: 'boolean'
      },
      description: `Enables or disables host verification in SSL Mode.
::: tip
It is recommended for self-signed certificates.
:::`,
      default: false,
      required: false,
      group: 'Encryption'
    },
    {
      name: 'serverCertFilePath',
      label: 'Server SSL Certificate',
      type: {
        name: 'file'
      },
      fileOptions: { // For file type.
        dropIn: true, // Do we drop the file content into a specific location on the disk. If False, the content is left as is in the field, just like a multiline string.
        dropInPath: '/server.cer.pem', // Where on the disk to drop the file to
        valueInConfig: '/beats/kafkabeat/config/server.cer.pem', // Path or file name to use as the value for the field
        maxFileSize: null // Maximum file size, in bytes. Ignored if not set (or set to null)
      },
      description: `Provide your server SSL certificate.

Typically a \`.pem\` file.

Starting with \`-----------BEGIN CERTIFICATE------------------\` and finishing with \`-----------------------END CERTIFICATE------------------\`. `,
      default: '',
      required: true,
      group: 'Encryption'
    },
    {
      name: 'clientCertFilePath',
      label: 'Client SSL Certificate',
      type: {
        name: 'file'
      },
      fileOptions: { // For file type.
        dropIn: true, // Do we drop the file content into a specific location on the disk. If False, the content is left as is in the field, just like a multiline string.
        dropInPath: '/client.cer.pem', // Where on the disk to drop the file to
        valueInConfig: '/beats/kafkabeat/config/client.cer.pem', // Path or file name to use as the value for the field
        maxFileSize: null // Maximum file size, in bytes. Ignored if not set (or set to null)
      },
      description: `Provide your client SSL certificate.

Typically a \`.pem\` file.

Starting with \`-----------BEGIN CERTIFICATE------------------\` and finishing with \`-----------------------END CERTIFICATE------------------\`. `,
      default: '',
      required: true,
      group: 'Encryption'
    },
    {
      name: 'keyFilePath',
      label: 'Private Key',
      type: {
        name: 'file'
      },
      fileOptions: { // For file type.
        dropIn: true, // Do we drop the file content into a specific location on the disk. If False, the content is left as is in the field, just like a multiline string.
        dropInPath: '/client.key.pem', // Where on the disk to drop the file to
        valueInConfig: '/beats/kafkabeat/config/client.key.pem', // Path or file name to use as the value for the field
        maxFileSize: null // Maximum file size, in bytes. Ignored if not set (or set to null)
      },
      description: `Provide your private key.

Typically a \`.pem\` file.

Starting with \`-----------BEGIN PRIVATE KEY------------------\` and finishing with \`-----------------------END PRIVATE KEY------------------\`. `,
      default: '',
      required: true,
      group: 'Encryption'
    },

    // Authentication

    {
      name: 'sasl_enabled',
      label: 'Enable SASL Authentication',
      type: {
        name: 'boolean'
      },
      description: 'Enables or disables SASL support in the Kafka Beat.',
      default: false,
      required: false,
      group: 'Authentication'
    },
    {
      name: 'sasl_mechanism',
      label: 'Authentication Mechanism',
      type: {
        name: 'option'
      },
      options: [
        { value: 'PLAIN', label: 'No encryption' },
        { value: 'SCRAM_256', label: 'SHA256 encryption' },
        { value: 'SCRAM_512', label: 'SHA512 encryption' }
      ],
      description: `The SASL mechanism to be used by the Kafka Beat.
      
::: danger
This should always be same as the Kafka server SASL mechanism.
:::

::: tip
The following are the SASL mechanisms currently supported by the Kafka Beat:

| SASL Mechanism | Level of Encryption |
| --- | ----- |
| PLAIN | None |
| SCRAM_256 | SHA256 encryption |
| SCRAM_512 | SHA512 encryption |
:::`,
      default: 'SCRAM_512',
      required: true,
      group: 'Authentication'
    },
    {
      name: 'username',
      label: 'SASL Username',
      type: {
        name: 'string'
      },
      description: 'Enter the the user name to use for SASL authentication.',
      default: '',
      required: false,
      group: 'Authentication'
    },
    {
      name: 'password',
      label: 'SASL Password',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'Enter the password for SASL authentication.',
      default: '',
      required: false,
      group: 'Authentication'
    },

    // SentinelOne

    {
      name: 'sentinel1ParsingEnable',
      label: 'Enable SentinelOne Parsing',
      type: {
        name: 'boolean'
      },
      description: 'Enables or disables **SentinelOne** message parsing, allowing **SentinelOne** to send compressed protocol buffer (protobuf) messages.',
      default: false,
      required: false,
      group: 'SentinelOne'
    },

    // Advanced
    {
      name: 'consumerWaitTime',
      label: 'Consumer Wait Time',
      type: {
        name: 'number'
      },
      description: 'The maximum amount of time, **in milliseconds**, the broker waits for consumer acknowledgment before declaring it to be disconnected.',
      default: '500',
      min: 10,
      max: 30000,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'maxProcessingTime',
      label: 'Max Processing Time',
      type: {
        name: 'number'
      },
      description: 'The maximum amount of time, **in milliseconds**, the consumer expects a message to take to process for the user.',
      default: '5000',
      min: 100,
      max: 30000,
      required: false,
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
      description: `This is the identifier used by Kafka Beat to name its separate instances.
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
      description: `This is the identifier transformed internally to \`device_type\`, and is usually provided by Kafka Beat to the SIEM.
It's used for the Log Source Virtualisation.`,
      required: true,
      readonly: true,
      group: 'EZ Internal'
    }
  ] // definition
}
