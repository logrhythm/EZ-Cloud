//     ######## ##          ###    ########    ######## #### ##       ########                     ##  ######  ########  ########    ###    ########
//     ##       ##         ## ##      ##       ##        ##  ##       ##                           ## ##    ## ##     ## ##         ## ##      ##
//     ##       ##        ##   ##     ##       ##        ##  ##       ##                           ## ##       ##     ## ##        ##   ##     ##
//     ######   ##       ##     ##    ##       ######    ##  ##       ######      #######          ##  ######  ########  ######   ##     ##    ##
//     ##       ##       #########    ##       ##        ##  ##       ##                     ##    ##       ## ##     ## ##       #########    ##
//     ##       ##       ##     ##    ##       ##        ##  ##       ##                     ##    ## ##    ## ##     ## ##       ##     ##    ##
//     ##       ######## ##     ##    ##       ##       #### ######## ########                ######   ######  ########  ######## ##     ##    ##

export default {
  shipper: 'jsBeat', // https://github.com/TonyMasse/jsBeat
  collectionMethod: 'flatFile',
  options: {
    extractPayloadFieldOnly: true,
    payloadField: 'message'
  },
  definition: [
    {
      name: 'baseDirectoryPath',
      label: 'Full Base directory path',
      type: {
        name: 'string' // array, object, boolean, string, number, regex, option
      },
      default: '',
      description: `Full Base directory path to crawl to find the files matching \`Inclusion Filter\`.
::: danger
Must be non-empty.
:::

::: tip Examples
To collect files under the directory \`/var/log/myApp/\`, one can use either of the following notations with the same effect:
- \`/var/log/myApp\`
- \`/var/log/myApp/\`

More specific examples:

| I want to collect | \`Full Base directory path\` | \`Inclusion Filter\` | \`Recursion Depth\` |
|-------------------|------------------------------|----------------------|:-------------------:|
| \`/var/log/messages\` | \`/var/log\` | \`messages\` | \`0\` |
| \`/var/log/myApp.log\` | \`/var/log\` | \`myApp.log\` | \`0\` |
| \`/var/log/myApp/*log\` | \`/var/log/myApp\` | \`*.log\` | \`0\` |
| - \`/var/log/myApp/January/*.log\`<br>- \`/var/log/myApp/February/*.log\`<br>- \`/var/log/myApp/March/*.log\`<br>- *etc...*<br>In other words:<br>\`/var/log/myApp/*/*.log\` | \`/var/log/myApp\` | \`*.log\` | \`1\` |
| - \`/var/log/Snap!/1992/01/01/Log.RhythmIsADancer.log\`<br>- \`/var/log/snap/1992/05/24/Log.RhythmIsADancer.log\`<br>- *etc...*<br>In other words:<br>\`/var/log/snap/*/*/*/Log.RhythmIsADancer.log\` | \`/var/log/snap\` | \`Log.RhythmIsADancer.log\` | \`3\` |
:::`,
      required: true,
      group: 'Required'
    },
    {
      name: 'inclusionFilter',
      label: 'Inclusion Filter',
      type: {
        name: 'string' // array, object, boolean, string, number, regex, option
      },
      default: '',
      description: `If prefixed with \`Regex::\` then regex filter, otherwise file system type filter.
::: danger
Must be non-empty.
:::

::: tip Examples
- \`myLogFile\`
- \`myLogFile.log\`
- \`myLogFile-Audit.log\`
- \`myLogFile-Audit-*.log\`
- \`Regex::myLogFile-Audit-\\d+\\.log\`
:::`,
      required: true,
      group: 'Required'
    },
    // Advanced
    {
      name: 'exclusionFilter',
      label: 'Exclusion Filter',
      type: {
        name: 'string' // array, object, boolean, string, number, regex, option
      },
      default: '',
      description: 'If prefixed with `Regex::` then regex filter, otherwise file system type filter.',
      required: false,
      group: 'Advanced'
    },
    {
      name: 'recursionDepth',
      label: 'Recursion Depth',
      type: {
        name: 'number' // array, object, boolean, string, number, regex, option
      },
      default: '0',
      min: 0,
      max: 100,
      description: `Maximum number of sub-directory to crawl into.
0 means means that the crawler will not visit any of the sub-directory, if any, of \`Full Base directory path\``,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'daysToWatchModifiedFiles',
      label: 'Days to Watch Modified Files',
      type: {
        name: 'number' // array, object, boolean, string, number, regex, option
      },
      default: '0',
      min: 0,
      max: 1096, // 3 years, including one possibly leap
      description: `Stop checking for update/growth files older than X days old.
0 means \`Days to Watch Modified Files\` is disabled (all files will be checked)`,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'multiLines',
      label: 'Multi Lines',
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
      description: `Multi lines message identification.
- \`msgStartRegex\`: Inclusive Regex to match the beginning of a new message.
- \`msgStopRegex\`: Inclusive Regex to match the end of a message.
- \`msgDelimiterRegex\`: Excluding Regex to separate two messages.
::: tip
For single line log messages (messages where the whole log including the timestamp are on the same line), there is no need to specify anything. If nothing is provided, the \`End Of Line\` sequence will be used to split the log messages.

For multi-lines log messages (messages which spill on several consecutive lines, sharing one timestamp), you can specify one or many of these filters but are not required to specify all of them.
:::
`,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'collectFromBeginning',
      label: 'Collect from the beginning',
      type: {
        name: 'boolean'
      },
      description: `If set to true, the first collection cycle will collect from the beginning. Otherwise, the first cycle only collect file size and update the State.
This setting only affect the very first Collection Cycle. Any subsequent Collection Cycle will collet any new file from the beginning.`,
      default: false,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'compressionType',
      label: 'Compression Type',
      type: {
        name: 'option' // array, object, boolean, string, number, regex, option
      },
      options: [
        { value: 'none', label: 'No compression' },
        { value: 'gzip', label: 'gzip' },
        { value: 'tar', label: 'tar' },
        { value: 'targzip', label: 'targzip' },
        { value: 'zip', label: 'zip' }
      ],
      default: 'none',
      description: `The compression method used to decompress the files. 
::: danger
__NOT IMPLEMENTED__
:::

::: tip
Note: This does __not__ affect the \`includeFilter\`. Only the way to handle the content of the file.
:::`,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'frequency_in_seconds',
      label: 'Cycle Frequency (seconds)',
      type: {
        name: 'number' // array, object, boolean, string, number, regex, option
      },
      default: 30,
      min: 1,
      max: 3600,
      description: `Collect cycle frequency.
Default to 30 seconds if not provided or below 1.
::: tip
We recommend to set this value to 10 seconds or more.
:::
The default setting is 30 Seconds.`,
      required: false,
      group: 'Advanced'
    },
    {
      name: 'active',
      label: 'Active',
      type: {
        name: 'boolean' // array, object, boolean, string, number, regex, option
      },
      // options: [{ value: true, label: 'True' }, { value: false, label: 'False' }],
      default: true,
      description: 'Is this Collection Method active?',
      required: true,
      readonly: true,
      group: 'EZ Internal'
    },
    {
      name: 'deviceType',
      label: 'Device Type',
      type: {
        name: 'string' // array, object, boolean, string, number, regex, option
      },
      default: '',
      description: `The name of the Device Type, to pass onto the OpenCollector Pipeline for the Log Source Virtualisation to work.
::: tip
The Log Source Virtualisation will expect it to be the same as the Pipeline name, but with all the non alphanumerical characters replaced by an underscore.
For example:
- \`my log source\` :arrow_right: \`my_log_source\`
- \`my - log source\` :arrow_right: \`my___log_source\`
- \`my-log/185\\source\` :arrow_right: \`my_log_185_source\`

FYI: This is how the JQ Pipeline Transform would normaly create it too.
:::

::: danger
Modifying the value provided by default here is very likely to break the Log Source Virtualisation later, as both __MUST__ match.
:::

::: tip
Long story short, don't touch this *(unless you really know what you are doing)*.
:::`,
      required: true,
      group: 'EZ Internal'
    },
    {
      name: 'filterHelpers',
      label: 'Identification Filters',
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
      description: `In addition to \`stream_id\` and \`stream_name\` Identification Filters that are automatically added, and cannot be removed or changed, you can add optional Identification Filters that can then be used to filter in the JQ Filter.
Users should not need to modify these`,
      required: true,
      group: 'EZ Internal'
    }
  ] // definition
}
