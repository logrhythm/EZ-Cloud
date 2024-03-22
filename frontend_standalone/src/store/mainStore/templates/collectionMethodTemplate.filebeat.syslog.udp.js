//      ######  ##    ##  ######  ##        #######   ######                 ######## ########
//     ##    ##  ##  ##  ##    ## ##       ##     ## ##    ##                ##       ##     ##
//     ##         ####   ##       ##       ##     ## ##                      ##       ##     ##
//      ######     ##     ######  ##       ##     ## ##   ####    #######    ######   ########
//           ##    ##          ## ##       ##     ## ##    ##                ##       ##     ##
//     ##    ##    ##    ##    ## ##       ##     ## ##    ##                ##       ##     ##
//      ######     ##     ######  ########  #######   ######                 ##       ########

export default {
  shipper: 'filebeat',
  collectionMethod: 'syslog_udp',
  definition: [
    // Required
    {
      name: 'protocol.udp.host',
      label: 'UDP - Binding address and port',
      type: {
        name: 'string'
      },
      description: 'Host name/IP and port onto which bind Syslog over UDP',
      default: '0.0.0.0:514',
      required: true,
      group: 'Required'
    },
    // Advanced - Syslog over UDP
    {
      name: 'protocol.udp.max_message_size',
      label: 'Syslog over UDP - Maximum Message Size',
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
      description: 'The maximum size of the message received over UDP. The default is 20 MegaBytes.',
      required: false,
      group: 'Advanced - Syslog over UDP'
    },
    {
      name: 'protocol.udp.read_buffer',
      label: 'Syslog over UDP - Read Buffer',
      type: {
        name: 'number'
      },
      suffix: {
        options: [{ value: 'KiB', label: 'Kilo Bytes' }, { value: 'MiB', label: 'Mega Bytes' }],
        default: 'MiB'
      },
      min: 1,
      max: 250,
      default: 50,
      description: 'The size of the read buffer on the UDP socket.',
      required: false,
      group: 'Advanced - Syslog over UDP'
    },
    {
      name: 'protocol.udp.timeout',
      label: 'Syslog over UDP - Timeout',
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
      group: 'Advanced - Syslog over UDP'
    },
    // Advanced - Misc
    {
      name: 'protocol.udp',
      label: 'SSL for Syslog over UDP - Extra parameters',
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
