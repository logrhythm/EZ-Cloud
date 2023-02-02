# Collection Method Templates

### Definition:
- name
- label
- type
  - array
    - of
  - object
    - of
  - boolean
  - string
  - number
  - regex
  - file
- options
- prefix
- suffix // s, m, KiB, MiB
- quotes // ' or " on nothing
- default
- min
- max
- obfuscation
- description
- required
- readonly
- group


```
[
  {
    name: '', // Internal name, usually the YAML dotted path
    label: '', // English label for UI
    type: {
      name: '', // array, object, boolean, string, password, number, regex, option
      of: { // for array and object
        type: {
          name: '', // array, object, boolean, string, password, number, regex, option, file
          multilines: false // for string and regex
          of: ...
        },
        options: [
          {
            value: '', // Value to go into the field
            label: '' // English text to be displayed for that value
          },
          { value: '', label: '' }
        ],
        prefix: { // Drop down list preceeding the field
          required: false,
          options: [{ value: '', label: '' }, { value: '', label: '' }],
          default: ''
        },
        suffix: { // Drop down list following the field
          required: false,
          options: [{ value: '', label: '' }, { value: '', label: '' }], // s, m, KiB, MiB
          default: ''
        },
        quotes: { // Defines if the data must be enclosed in Quotes. And if any, which one.
          required: false,
          options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
          default: ''
        },
        default: '', // Default value
        min: null, // For number type. Minimum numerical value.
        max: null, // For number type. Maximum numerical value.
        obfuscation: { // For String or Password types
          compulsory: false, // Set to True to display the option to obfuscate in the UI
          method: 'oc_encrypt', // Method of obfuscation
          obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Regex to validate the field is correctly obfuscated. Example of properly obfuscated field using the "oc_encrypt" method: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
        },
        fileOptions: { // For file type.
          dropIn: false, // Do we drop the file content into a specific location on the disk. If False, the content is left as is in the field, just like a multiline string.
          dropInPath: '', // Where on the disk to drop the file to
          valueInConfig: '', // Path or file name to use as the value for the field
          maxFileSize: null // Maximum file size, in bytes. Ignored if not set (or set to null)
        },
        description: '', // Markdown formatted documentation
        required: false, // Toggles the "Required" flag in the UI
        readonly: true // Toggles the "Read Only" flag in the UI
      }
    },
    options: [
      {
        value: '', // Value to go into the field
        label: '' // English text to be displayed for that value
      },
      { value: '', label: '' }
    ],
    prefix: { // Drop down list preceeding the field
      required: false,
      options: [{ value: '', label: '' }, { value: '', label: '' }],
      default: ''
    },
    suffix: { // Drop down list following the field
      required: false,
      options: [{ value: '', label: '' }, { value: '', label: '' }], // s, m, KiB, MiB
      default: ''
    },
    quotes: { // Defines if the data must be enclosed in Quotes. And if any, which one.
      required: false,
      options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
      default: ''
    },
    default: '', // Default value
    min: null, // For number type. Minimum numerical value.
    max: null, // For number type. Maximum numerical value.
    obfuscation: { // For String or Password types
      compulsory: false, // Set to True to display the option to obfuscate in the UI
      method: 'oc_encrypt', // Method of obfuscation
      obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Regex to validate the field is correctly obfuscated. Example of properly obfuscated field using the "oc_encrypt" method: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
    },
    fileOptions: { // For file type.
      dropIn: false, // Do we drop the file content into a specific location on the disk. If False, the content is left as is in the field, just like a multiline string.
      dropInPath: '', // Where on the disk to drop the file to
      valueInConfig: '', // Path or file name to use as the value for the field
      maxFileSize: null // Maximum file size, in bytes. Ignored if not set (or set to null)
    },
    description: '', // Markdown formatted documentation for the field
    required: false, // Toggles the "Required" flag in the UI
    readonly: true, // Toggles the "Read Only" flag in the UI
    group: '' // Name of the colapsable group the field belongs to
  }
]
```

### Examples:

#### Numerical field
```
{
  name: 'portnumber',
  label: 'Port Number',
  type: {
    name: 'number'
  },
  description: 'HTTP listening service TCP Port.',
  default: '8080',
  min: 0,
  max: 65535,
  required: true,
  group: 'Required'
}
```

#### Numerical field with unit suffix (drop down list)
```
{
  name: 'retry.wait_min',
  label: 'Request Minimum Wait Before Retry',
  type: {
    name: 'number'
  },
  suffix: {
    options: [
      { value: 's', label: 'Seconds' },
      { value: 'm', label: 'Minutes' },
      { value: 'h', label: 'Hours' }
    ],
    default: 's'
  },
  min: 1,
  max: 60,
  default: '1s',
  description: 'The minimum time to wait before a retry is attempted. The default is 1 second.',
  required: false,
  group: 'Advanced - Retries'
}
```

#### Boolean option
```
{
  name: 'redirect.forward_headers',
  label: 'Redirect Forward Headers',
  type: {
    name: 'boolean'
  },
  default: false,
  description: 'When set to `True` request headers are forwarded in case of a redirect. Default: `False`.',
  required: false,
  group: 'Advanced - Redirects'
}
```
#### Simple String field
```
{
  name: 'url',
  label: 'API URL',
  type: {
    name: 'string'
  },
  description: 'Provide the API URL used to get data from the log source. The API URL consists of the API hostname and API endpoint only; do not include the query parameters string.',
  default: '',
  required: true,
  group: 'Required'
}
```

#### Multiline String field
```
{
  name: 'oauth20_auth.body',
  label: 'Request Body - For Content Type "JSON" Only',
  type: {
    name: 'string',
    multilines: true,
    textType: 'json'
  },
  obfuscation: {
    compulsory: true,
    method: 'oc_encrypt',
    obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
  },
  description: `Optionally provide the entire JSON body to receive the access token from the server.
> NOTE
> This is only necessary if the \`Content Type\` is \`JSON (application/json)\`

::: danger
- The configuration value must be a valid JSON object.
- As it might contain Secret(s), it must be obfuscated.
:::

::: tip Example
\`\`\`
{
  "user": "user_name",
  "password": "b4d_p4ssw0rd"
}
\`\`\`
:::
`,
  default: '',
  required: false,
  group: 'Authentication - oAuth 2.0'
}
```

#### Password field
The password field is a String field with the only difference that its value gets masked in the UI.
```
{
  name: 'basic_auth.unsafe_password',
  label: 'Password',
  type: {
    name: 'password'
  },
  description: 'An un-obfuscated password. Weird combo, but could potentially happen.',
  default: '',
  required: true,
  group: 'Authentication - Basic'
}
```

#### Password field that requires obfuscation
The password field is a String field with the only difference that its value gets masked in the UI.

Obfuscation is done by the Backend, on demand by the UI following the click on the Obfuscation button.

If the value of the field matches the `obfuscatedFormatCheckRegex` regular expression, then the value is considered properly obfuscated. Otherwise, a warning and the Obfuscation button will be displayed.

```
{
  name: 'basic_auth.password',
  label: 'Password',
  type: {
    name: 'password'
  },
  obfuscation: {
    compulsory: true,
    method: 'oc_encrypt',
    obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
  },
  description: 'The password required for basic authentication.',
  default: '',
  required: true,
  group: 'Authentication - Basic'
}
```

#### Array of Strings
```
{
  name: 'request.ssl.supported_protocols',
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
}
```

#### Object of Strings (named array)
```
{
  name: 'oauth20_auth.headers',
  label: 'Request Headers',
  type: {
    name: 'object',
    of: {
      type: {
        name: 'string'
      },
      // obfuscation: {
      //   compulsory: true,
      //   method: 'oc_encrypt',
      //   obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      // },
      default: '',
      required: true
    }
  },
  description: `Optionally provide the Request Headers supported by the API as Key:Value pairs.
::: tip Examples

| Key | Value |
| --- | ----- |
| Content-Type | application/json |
:::
`,
  default: '',
  required: false,
  group: 'Authentication - oAuth 2.0'
}
```

#### List of options
```
{
  name: 'oauth20_auth.content_type',
  label: 'Content Type',
  type: {
    name: 'option'
  },
  options: [
    { value: 'application/json', label: 'JSON (application/json)' },
    { value: 'application/x-www-form-urlencoded', label: 'Web Form URL Encoded (application/x-www-form-urlencoded)' }
  ],
  description: `The content type of the request body. Choose one of the following content types as supported by the API.
> NOTE
> This is only necessary if the \`Request Method\` is \`POST\`.`,
  default: 'application/json',
  required: true,
  group: 'Authentication - oAuth 2.0'
}
```

A slight variation, with an horizontal line separating the top value from the rest (note the `<hr>` in the `label` of the first value).
```
{
  name: 'request.encode_as',
  label: 'Encoding',
  type: {
    name: 'option'
  },
  options: [
    { value: null, label: '** Not set ** <hr>' },
    { value: 'application/json', label: 'JSON (application/json)' },
    { value: 'application/x-www-form-urlencoded', label: 'Web Form URL Encoded (application/x-www-form-urlencoded)' }
  ],
  description: `ContentType used for encoding the request body. If set it will force the encoding in the specified format regardless of the \`Content- Type\` header value, otherwise it will honor it if possible or fallback to \`application / json\`.
By default the requests are sent with \`Content - Type: application / json\`.
> NOTE
> \`Web Form URL Encoded\` will url encode the \`url.params\` and set them as the body.`,
  default: null,
  required: false,
  group: 'Advanced - Request Body'
}
```

### Documentation / Description
The `description` value represent the full documentation of the field.

It uses **Markdown** as the format. The component used to display them differs slightly from the GitHub one, and as such the visual representation in the UI will not be the same as what will show below in GitHub

#### Simple grey frame (Note / Information)
```
> NOTE
> \`Web Form URL Encoded\` will url encode the \`url.params\` and set them as the body.
```

#### Red frame (Important / Danger)
```
::: danger
The configuration value must be a valid JSON object.
:::
```

#### Green frame (Hint / Advice / Example)
```
::: tip Examples
- 1500
- \`[[.last_response.header.X-RateLimit-Limit]]\`
:::
```

