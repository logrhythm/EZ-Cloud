//      ######  ##    ##  ######  ##        #######   ######                 ######## ########
//     ##    ##  ##  ##  ##    ## ##       ##     ## ##    ##                ##       ##     ##
//     ##         ####   ##       ##       ##     ## ##                      ##       ##     ##
//      ######     ##     ######  ##       ##     ## ##   ####    #######    ######   ########
//           ##    ##          ## ##       ##     ## ##    ##                ##       ##     ##
//     ##    ##    ##    ##    ## ##       ##     ## ##    ##                ##       ##     ##
//      ######     ##     ######  ########  #######   ######                 ##       ########

export default {
  shipper: 'filebeat',
  collectionMethod: 'syslog_tcp',
  definition: [
    // Required
    {
      name: 'protocol.tcp.host',
      label: 'TCP - Binding address and port',
      type: {
        name: 'string'
      },
      description: 'Host name/IP and port onto which bind Syslog over TCP',
      default: '0.0.0.0:514',
      required: true,
      group: 'Required'
    },
    // SSL Configuration
    {
      name: 'protocol.tcp.ssl.enabled',
      label: 'Enabled',
      type: {
        name: 'boolean'
      },
      default: false,
      description: 'Is Syslog SSL enabled?',
      required: false,
      group: 'SSL Configuration'
    },
    {
      name: 'protocol.tcp.ssl.certificate_authorities',
      label: 'SSL Certificate Authorities',
      type: {
        name: 'string'
      },
      default: '',
      description: 'Path to the file with the list of root certificates for client verifications is only required if `Client Authentication` is configured. If `Certificate Authorities` is empty or not set, and `Client Authentication` is configured, the system keystore is used. If `Certificate Authorities` is self-signed, the host system needs to trust that CA cert as well.',
      required: false,
      group: 'SSL Configuration'
    },
    {
      name: 'protocol.tcp.ssl.certificate',
      label: 'SSL Certificate',
      type: {
        name: 'string'
      },
      default: '',
      description: 'For server authentication, the path to the SSL authentication certificate must be specified for TLS. If the certificate is not specified, startup will fail. When this option is configured, the key option is also required.',
      required: false,
      group: 'SSL Configuration'
    },
    {
      name: 'protocol.tcp.ssl.key',
      label: 'SSL Key',
      type: {
        name: 'string'
      },
      default: '',
      description: 'The server certificate key used for authentication is required.',
      required: false,
      group: 'SSL Configuration'
    },
    {
      name: 'protocol.tcp.ssl.key_passphrase',
      label: 'Pass phrase for SSL Key',
      type: {
        name: 'password'
      },
      default: '',
      description: 'The passphrase is used to decrypt an encrypted key stored in the configured key file.',
      required: false,
      group: 'SSL Configuration'
    },
    {
      name: 'protocol.tcp.ssl.verification_mode',
      label: 'Verification Mode',
      type: {
        name: 'option'
      },
      options: [{ value: 'full', label: 'Full: Verifies that the provided certificate is signed by a trusted authority (CA) and also verifies that the server’s hostname (or IP address) matches the names identified within the certificate.' }, { value: 'strict', label: 'Strict: Verifies that the provided certificate is signed by a trusted authority (CA) and also verifies that the server’s hostname (or IP address) matches the names identified within the certificate.If the Subject Alternative Name is empty, it returns an error.' }, { value: 'certificate', label: 'Certificate: Verifies that the provided certificate is signed by a trusted authority (CA), but does not perform any hostname verification.' }, { value: 'none', label: 'None: Performs no verification of the server’s certificate.This mode disables many of the security benefits of SSL/ TLS and should only be used after cautious consideration.It is primarily intended as a temporary diagnostic mechanism when attempting to resolve TLS errors; its use in production environments is strongly discouraged.' }],
      default: 'full',
      description: 'Controls the verification of client certificates. The default value is `Full`.',
      required: false,
      group: 'SSL Configuration'
    },
    {
      name: 'protocol.tcp.ssl.client_authentication',
      label: 'Client Authentication',
      type: {
        name: 'option'
      },
      options: [{ value: 'none', label: 'None: Disables client authentication.' }, { value: 'optional', label: 'Optional: When a client certificate is supplied, the server will verify it.' }, { value: 'required', label: 'Required: Will require clients to provide a valid certificate.' }],
      default: 'none',
      description: 'The type of client authentication mode. When `SSL Certificate Authorities` is set, it defaults to `Required`. Otherwise, it defaults to `None`.',
      required: false,
      group: 'SSL Configuration'
    },
    {
      name: 'protocol.tcp.ssl.renegotiation',
      label: 'Renegotiation',
      type: {
        name: 'option'
      },
      options: [{ value: 'never', label: 'Never: Disables renegotiation.' }, { value: 'once', label: 'Once: Allows a remote server to request renegotiation once per connection.' }, { value: 'freely', label: 'Freely: Allows a remote server to request renegotiation repeatedly.' }],
      default: 'never',
      description: 'This configures what types of TLS renegotiation are supported. The default value is `Never`.',
      required: false,
      group: 'SSL Configuration'
    },
    {
      name: 'protocol.tcp.ssl.supported_protocols',
      label: 'Supported Protocols',
      type: {
        name: 'array',
        of: {
          type: {
            name: 'string'
          },
          default: '',
          required: false
        }
      },
      description: 'List of allowed SSL/TLS versions. If SSL/TLS server decides for protocol versions not configured, the connection will be dropped during or after the handshake. The setting is a list of allowed protocol versions: SSLv3, TLSv1 for TLS version 1.0, TLSv1.0, TLSv1.1, TLSv1.2, and TLSv1.3. The default value is [TLSv1.1, TLSv1.2, TLSv1.3].',
      required: false,
      group: 'SSL Configuration'
    },
    // Advanced - Syslog over TCP
    {
      name: 'protocol.tcp.max_message_size',
      label: 'Syslog over TCP - Maximum Message Size',
      type: {
        name: 'number' // array, object, boolean, string, number, regex, option
      },
      suffix: {
        options: [{ value: 'KiB', label: 'Kilo Bytes' }, { value: 'MiB', label: 'Mega Bytes' }],
        default: 'MiB'
      },
      default: '20MiB',
      min: 1,
      max: 50,
      description: 'The maximum size of the message received over TCP. The default is 20 MegaBytes.',
      required: false,
      group: 'Advanced - Syslog over TCP'
    },
    {
      name: 'protocol.tcp.framing',
      label: 'Syslog over TCP - Framing',
      type: {
        name: 'option'
      },
      options: [{ value: 'delimiter', label: 'Delimiter: Uses the characters specified in Line Delimiter to split the incoming events.' }, { value: 'rfc6587', label: 'RFC6587: supports octet counting and non-transparent framing as described in RFC6587. Line Delimiter is used to split the events in non-transparent framing.' }],
      default: 'delimiter',
      description: 'Specify the framing used to split incoming events. The default is `Delimiter`.',
      required: false,
      group: 'Advanced - Syslog over TCP'
    },
    {
      name: 'protocol.tcp.line_delimiter',
      label: 'Syslog over TCP - Line Delimiter',
      type: {
        name: 'string'
      },
      default: '\\n',
      description: 'Specify the characters used to split the incoming events. The default is \\n.',
      required: false,
      group: 'Advanced - Syslog over TCP'
    },
    {
      name: 'protocol.tcp.max_connections',
      label: 'Syslog over TCP - Maximum Connections',
      type: {
        name: 'number'
      },
      min: 1,
      max: 250,
      default: 50,
      description: 'The at most number of connections to accept at any given point in time.',
      required: false,
      group: 'Advanced - Syslog over TCP'
    },
    {
      name: 'protocol.tcp.timeout',
      label: 'Syslog over TCP - Timeout',
      type: {
        name: 'number'
      },
      suffix: {
        options: [{ value: 's', label: 'Seconds' }, { value: 'm', label: 'Minutes' }, { value: 'h', label: 'Hours' }], // s, m, KiB, MiB
        default: 's'
      },
      min: 10,
      max: 3600,
      default: '300s',
      description: 'The number of seconds of inactivity before a remote connection is closed. The default is 300 seconds.',
      required: false,
      group: 'Advanced - Syslog over TCP'
    },
    // Advanced - Misc
    {
      name: 'protocol.tcp.ssl',
      label: 'SSL for Syslog over TCP - Extra parameters',
      type: {
        name: 'object',
        of: {
          type: {
            name: 'string'
          },
          default: ''
        }
      },
      description: 'Extra parameters you might want to add to the SSL Configuration',
      required: false,
      group: 'Advanced - Miscellaneous'
    },
    {
      name: 'protocol.tcp',
      label: 'SSL for Syslog over TCP - Extra parameters',
      type: {
        name: 'object',
        of: {
          type: {
            name: 'string'
          },
          default: ''
        }
      },
      description: '',
      required: false,
      group: 'Advanced - Miscellaneous'
    },
    {
      name: 'keep_null',
      label: 'Keep Null',
      type: {
        name: 'boolean'
      },
      description: 'If this option is set to true, fields with null values will be published in the output document. By default, `Keep Null` is set to false.',
      default: false,
      required: false,
      group: 'Advanced - Miscellaneous'
    },
    // EZ Internal
    {
      name: 'enabled',
      label: 'Enabled',
      type: {
        name: 'boolean'
      },
      default: true,
      description: 'Is this Collection Method enabled?',
      required: true,
      readonly: true,
      group: 'EZ Internal'
    },
    {
      name: 'fields',
      label: 'Identification Fields',
      type: {
        name: 'object',
        of: {
          type: {
            name: 'string'
          },
          default: '',
          description: '',
          required: true
        }
      },
      description: `In addition to \`stream_id\` and \`stream_name\` fields that are automatically added, and cannot be removed or changed, you can add optional fields that you can specify to add additional information to the output.
For example, you might add fields that you can use for filtering log data.
Fields can be scalar values, arrays, dictionaries, or any nested combination of these.
By default, the fields that you specify here will be grouped under a fields sub-dictionary in the output document.
To store the custom fields as top-level fields, set the \`fields_under_root option\` to true. If a duplicate field is declared in the general configuration, then its value will be overwritten by the value declared here.`,
      required: true,
      group: 'EZ Internal'
    }
  ] // definition
}
