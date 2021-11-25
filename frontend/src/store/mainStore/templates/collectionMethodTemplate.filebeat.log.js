//     ######## ##          ###    ########    ######## #### ##       ########               ######## ########
//     ##       ##         ## ##      ##       ##        ##  ##       ##                     ##       ##     ##
//     ##       ##        ##   ##     ##       ##        ##  ##       ##                     ##       ##     ##
//     ######   ##       ##     ##    ##       ######    ##  ##       ######      #######    ######   ########
//     ##       ##       #########    ##       ##        ##  ##       ##                     ##       ##     ##
//     ##       ##       ##     ##    ##       ##        ##  ##       ##                     ##       ##     ##
//     ##       ######## ##     ##    ##       ##       #### ######## ########               ##       ########

export default {
  shipper: 'filebeat',
  collectionMethod: 'log',
  definition: [
    {
      name: 'paths',
      label: 'File Paths',
      type: {
        name: 'array', // array, object, boolean, string, number, regex, option
        of: { // for array and object
          type: {
            name: 'string'
          },
          quotes: {
            required: true,
            options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
            default: '"'
          },
          default: '',
          description: 'A single glob-based path that will be crawled and fetched. For example: `/path/to/file.log`',
          required: true
        }
      },
      // default: '',
      description: `A list of glob-based paths that will be crawled and fetched. All patterns supported by Go Glob are also supported here. 
For example, to fetch all files from a predefined level of subdirectories, the following pattern can be used: \`/var/log/*/*.log\`. This fetches all \`.log\` files from the subfolders of \`/var/log\`. It does not fetch log files from the \`/var/log\` folder itself.
> It is possible to recursively fetch all files in all subdirectories of a directory using the optional \`Recursive Glob\` settings under **Advanced**.`,
      required: true,
      group: 'Required'
    },
    // Advanced
    {
      name: 'encoding',
      label: 'Text encoding',
      type: {
        name: 'option' // array, object, boolean, string, number, regex, option
      },
      options: [
        { value: null, label: '** Not specified **<hr>' },
        { value: 'plain', label: 'Plain ASCII encoding' },
        { value: 'utf-8', label: 'UTF-8 encoding' },
        { value: 'gbk', label: 'simplified Chinese charaters' },
        { value: 'iso8859-6e', label: 'ISO8859-6E, Latin/Arabic' },
        { value: 'iso8859-6i', label: 'ISO8859-6I, Latin/Arabic' },
        { value: 'iso8859-8e', label: 'ISO8859-8E, Latin/Hebrew' },
        { value: 'iso8859-8i', label: 'ISO8859-8I, Latin/Hebrew' },
        { value: 'iso8859-1', label: 'ISO8859-1, Latin-1' },
        { value: 'iso8859-2', label: 'ISO8859-2, Latin-2' },
        { value: 'iso8859-3', label: 'ISO8859-3, Latin-3' },
        { value: 'iso8859-4', label: 'ISO8859-4, Latin-4' },
        { value: 'iso8859-5', label: 'ISO8859-5, Latin/Cyrillic' },
        { value: 'iso8859-6', label: 'ISO8859-6, Latin/Arabic' },
        { value: 'iso8859-7', label: 'ISO8859-7, Latin/Greek' },
        { value: 'iso8859-8', label: 'ISO8859-8, Latin/Hebrew' },
        { value: 'iso8859-9', label: 'ISO8859-9, Latin-5' },
        { value: 'iso8859-10', label: 'ISO8859-10, Latin-6' },
        { value: 'iso8859-13', label: 'ISO8859-13, Latin-7' },
        { value: 'iso8859-14', label: 'ISO8859-14, Latin-8' },
        { value: 'iso8859-15', label: 'ISO8859-15, Latin-9' },
        { value: 'iso8859-16', label: 'ISO8859-16, Latin-10' },
        { value: 'cp437', label: 'IBM CodePage 437' },
        { value: 'cp850', label: 'IBM CodePage 850' },
        { value: 'cp852', label: 'IBM CodePage 852' },
        { value: 'cp855', label: 'IBM CodePage 855' },
        { value: 'cp858', label: 'IBM CodePage 858' },
        { value: 'cp860', label: 'IBM CodePage 860' },
        { value: 'cp862', label: 'IBM CodePage 862' },
        { value: 'cp863', label: 'IBM CodePage 863' },
        { value: 'cp865', label: 'IBM CodePage 865' },
        { value: 'cp866', label: 'IBM CodePage 866' },
        { value: 'ebcdic-037', label: 'IBM CodePage 037' },
        { value: 'ebcdic-1040', label: 'IBM CodePage 1140' },
        { value: 'ebcdic-1047', label: 'IBM CodePage 1047' },
        { value: 'koi8r', label: 'KOI8-R, Russian (Cyrillic)' },
        { value: 'koi8u', label: 'KOI8-U, Ukranian (Cyrillic)' },
        { value: 'macintosh', label: 'Macintosh encoding' },
        { value: 'macintosh-cyrillic', label: 'Macintosh Cyrillic encoding' },
        { value: 'windows1250', label: 'Windows1250, Central and Eastern European' },
        { value: 'windows1251', label: 'Windows1251, Russian, Serbian (Cyrillic)' },
        { value: 'windows1252', label: 'Windows1252, Legacy' },
        { value: 'windows1253', label: 'Windows1253, Modern Greek' },
        { value: 'windows1254', label: 'Windows1254, Turkish' },
        { value: 'windows1255', label: 'Windows1255, Hebrew' },
        { value: 'windows1256', label: 'Windows1256, Arabic' },
        { value: 'windows1257', label: 'Windows1257, Estonian, Latvian, Lithuanian' },
        { value: 'windows1258', label: 'Windows1258, Vietnamese' },
        { value: 'windows874', label: 'Windows874, ISO/IEC 8859-11, Latin/Thai' },
        { value: 'utf-16-bom', label: 'UTF-16 with required BOM' },
        { value: 'utf-16be-bom', label: 'big endian UTF-16 with required BOM' },
        { value: 'utf-16le-bom', label: 'little endian UTF-16 with required BOM' }
      ],
      default: 'utf-8',
      description: `The file encoding to use for reading data that contains international characters. 
> NOTE
> The plain encoding is special, because it does not validate or transform any input.`,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'recursive_glob.enabled',
      label: 'Recursive Glob',
      type: {
        name: 'boolean'
      },
      default: true,
      description: `Is this Recursive Glob enabled?
Enable expanding \`** \` into recursive glob patterns. With this feature enabled,
the rightmost \`** \` in each path is expanded into a fixed number of glob
patterns. For example: \`/ foo/**\` expands to \`/foo\`, \`/foo/*\`, \`/foo/*/ * \`, and so
on. If enabled it expands a single \`** \` into a 8-level deep \` *\` pattern.`,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'include_lines',
      label: 'Include Lines',
      type: {
        name: 'array', // array, object, boolean, string, number, regex, option
        of: { // for array and object
          type: {
            name: 'regex' // array, object, boolean, string, number, regex, option
          },
          quotes: {
            required: true,
            options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
            default: '\''
          },
          default: '',
          required: false
        }
      },
      description: `A list of regular expressions to match the lines that you want Filebeat to include. Filebeat exports only the lines that match a regular expression in the list. By default, all lines are exported. Empty lines are ignored.
If multiline settings also specified, each multiline message is combined into a single line before the lines are filtered by \`Include Lines\`.
> NOTE
> If both \`Include Lines\` and \`Exclude Lines\` are defined, Filebeat executes \`Include Lines\` first and then executes \`Exclude Lines\`. The order in which the two options are defined doesn’t matter.`,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'exclude_lines',
      label: 'Exclude Lines',
      type: {
        name: 'array',
        of: {
          type: {
            name: 'regex'
          },
          quotes: {
            required: true,
            options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
            default: '\''
          },
          default: '',
          required: false
        }
      },
      description: `A list of regular expressions to match the lines that you want Filebeat to exclude. Filebeat drops any lines that match a regular expression in the list. By default, no lines are dropped. Empty lines are ignored.
If multiline settings are also specified, each multiline message is combined into a single line before the lines are filtered by \`Exclude Lines\`.
> NOTE
> If both \`Include Lines\` and \`Exclude Lines\` are defined, Filebeat executes \`Include Lines\` first and then executes \`Exclude Lines\`. The order in which the two options are defined doesn’t matter.`,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'exclude_files',
      label: 'Exclude Files',
      type: {
        name: 'array',
        of: {
          type: {
            name: 'regex'
          },
          quotes: {
            required: true,
            options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
            default: '\''
          },
          default: '',
          required: false
        }
      },
      description: 'A list of regular expressions to match the files that you want Filebeat to ignore. By default no files are excluded.',
      required: false,
      group: 'Advanced'
    },
    {
      name: 'ignore_older',
      label: 'Ignore Older',
      type: {
        name: 'number' // array, object, boolean, string, number, regex, option
      },
      suffix: {
        required: true,
        options: [{ value: 's', label: 'Seconds' }, { value: 'm', label: 'Minutes' }, { value: 'h', label: 'Hours' }], // s, m, KiB, MiB
        default: 'h'
      },
      default: '0',
      min: 0,
      max: 3600,
      description: `If this option is enabled, Filebeat ignores any files that were modified before the specified timespan. 
Configuring \`Ignore Older\` can be especially useful if you keep log files for a long time. For example, if you want to start Filebeat, but only want to send the newest files and files from last week, you can configure this option.
You can use time like 2 hours and 5 minutes. The default is 0, which disables the setting. Excluding out the config has the same effect as setting it to 0.
::: danger
You must set \`Ignore Older\` to be greater than \`Close Inactive\`.
:::`,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'close_inactive',
      label: 'Close Inactive',
      type: {
        name: 'number' // array, object, boolean, string, number, regex, option
      },
      suffix: {
        required: true,
        options: [{ value: 's', label: 'Seconds' }, { value: 'm', label: 'Minutes' }, { value: 'h', label: 'Hours' }], // s, m, KiB, MiB
        default: 'm'
      },
      default: '5m',
      min: 0,
      max: 3600,
      description: `When this option is enabled, Filebeat closes the file handle if a file has not been harvested for the specified duration.
> NOTE
> The counter for the defined period starts when the last log line was read by the harvester. It is not based on the modification time of the file. If the closed file changes again, a new harvester is started and the latest changes will be picked up after \`Scan Frequency\` has elapsed.

::: tip
We recommended that you set \`Close Inactive\` to a value that is larger than the least frequent updates to your log files. For example, if your log files get updated every few seconds, you can safely set \`Close Inactive\` to 1 Minute. If there are log files with very different update rates, you can use multiple configurations with different values. Setting \`Close Inactive\` to a lower value means that file handles are closed sooner. However this has the side effect that new log lines are not sent in near real time if the harvester is closed. The timestamp for closing a file does not depend on the modification time of the file. Instead, Filebeat uses an internal timestamp that reflects when the file was last harvested.
For example, if \`Close Inactive\` is set to 5 minutes, the countdown for the 5 minutes starts after the harvester reads the last line of the file.
:::

You can use time like 2 hours and 5 minutes. The default is 5 minutes.

::: warning
Only use this option if you understand that data loss is a potential side effect.
:::`,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'scan_frequency',
      label: 'Scan Frequency',
      type: {
        name: 'number' // array, object, boolean, string, number, regex, option
      },
      suffix: {
        required: true,
        options: [{ value: 's', label: 'Seconds' }, { value: 'm', label: 'Minutes' }, { value: 'h', label: 'Hours' }], // s, m, KiB, MiB
        default: 's'
      },
      default: 10,
      min: 1,
      max: 3600,
      description: `How often Filebeat checks for new files in the paths that are specified for harvesting. For example, if you specify a glob like \`/var/log/*\`, the directory is scanned for files using the frequency specified by \`Scan Frequency\`. Specify 1 second to scan the directory as frequently as possible without causing Filebeat to scan too frequently.
::: tip
We do not recommend to set this value < 1 second. If you require log lines to be sent in near real time do not use a very low \`Scan Frequency\` but adjust \`Close Inactive\` so the file handler stays open and constantly polls your files.
:::
The default setting is 10 Seconds.`,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'max_bytes',
      label: 'Max Bytes',
      type: {
        name: 'number' // array, object, boolean, string, number, regex, option
      },
      default: '10485760',
      min: 0,
      max: 52428800, // 50 MB
      description: 'The maximum number of bytes that a single log message can have. All bytes after `Max Bytes` are discarded and not sent. This setting is especially useful for multiline log messages, which can get large. The default is 10MB (10,485,760 Bytes).',
      required: false,
      group: 'Advanced'
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
      group: 'Advanced'
    },
    {
      name: 'enabled',
      label: 'Enabled',
      type: {
        name: 'boolean' // array, object, boolean, string, number, regex, option
      },
      // options: [{ value: true, label: 'True' }, { value: false, label: 'False' }],
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
        name: 'object', // array, object, boolean, string, number, regex, option
        of: { // for array and object
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
