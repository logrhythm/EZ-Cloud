//     ##     ## ######## ######## ########           ##  ######   #######  ##    ##               ######## ########
//     ##     ##    ##       ##    ##     ##          ## ##    ## ##     ## ###   ##               ##       ##     ##
//     ##     ##    ##       ##    ##     ##          ## ##       ##     ## ####  ##               ##       ##     ##
//     #########    ##       ##    ########           ##  ######  ##     ## ## ## ##    #######    ######   ########
//     ##     ##    ##       ##    ##           ##    ##       ## ##     ## ##  ####               ##       ##     ##
//     ##     ##    ##       ##    ##           ##    ## ##    ## ##     ## ##   ###               ##       ##     ##
//     ##     ##    ##       ##    ##            ######   ######   #######  ##    ##               ##       ########

export default {
  shipper: 'filebeat',
  collectionMethod: 'httpjson',
  definition: [
    // Required
    {
      name: 'request.url',
      label: 'Request URL',
      type: {
        name: 'string'
      },
      description: 'The URL of the HTTP API.',
      default: '',
      required: true,
      group: 'Required'
    },
    {
      name: 'request.method',
      label: 'Request Method',
      type: {
        name: 'option'
      },
      options: [{ value: 'GET', label: 'HTTP GET' }, { value: 'POST', label: 'HTTP POST' }],
      description: 'HTTP method to use when making requests. Default: `GET`.',
      default: 'GET',
      required: false,
      group: 'Required'
    },
    {
      name: 'EZ__Auth_Basic__enable',
      label: 'Enable',
      type: {
        name: 'boolean'
      },
      description: 'Using Basic authentication?',
      default: false,
      required: true,
      group: 'Authentication - Basic'
    },
    {
      name: 'EZ__Auth_Basic__username',
      label: 'Username',
      type: {
        name: 'string'
      },
      description: 'Username for Basic authentication. It will be URL-encoded automatically with its password.',
      default: '',
      required: true,
      group: 'Authentication - Basic'
    },
    {
      name: 'EZ__Auth_Basic__password',
      label: 'Password',
      type: {
        name: 'password'
      },
      description: 'Password for Basic authentication. It will be URL-encoded automatically with its username.',
      default: '',
      required: true,
      group: 'Authentication - Basic'
    },

    // OAuth2

    {
      name: 'auth.oauth2.enabled',
      label: 'Enabled',
      type: {
        name: 'boolean'
      },
      description: 'When set to false, disables the OAuth2 configuration.',
      default: false,
      required: true,
      group: 'Authentication - OAuth2'
    },
    {
      name: 'auth.oauth2.provider',
      label: 'OAuth2 Provider',
      type: {
        name: 'option'
      },
      options: [{ value: 'default', label: 'Default' }, { value: 'azure', label: 'Azure' }, { value: 'google', label: 'Google' }],
      description: `Used to configure supported OAuth2 providers.
Each supported provider will require specific settings. It is not set by default. Supported providers are: \`Default\`, \`Azure\` and \`Google\`.`,
      default: 'default',
      required: false,
      group: 'Authentication - OAuth2'
    },
    {
      name: 'auth.oauth2.client.id',
      label: 'Client ID',
      type: {
        name: 'string'
      },
      description: 'The Client ID used as part of the authentication flow. It is always required except if using `Google` as provider. Required for providers: `Default`, `Azure`.',
      default: '',
      required: false,
      group: 'Authentication - OAuth2'
    },
    {
      name: 'auth.oauth2.client.secret',
      label: 'Client Secret',
      type: {
        name: 'password'
      },
      description: 'The client secret used as part of the authentication flow. It is always required except if using `Google` as provider. Required for providers: `Default`, `Azure`.',
      default: '',
      required: false,
      group: 'Authentication - OAuth2'
    },
    {
      name: 'auth.oauth2.scopes',
      label: 'Scopes',
      type: {
        name: 'array',
        of: {
          type: {
            name: 'string'
          },
          default: '',
          required: true
        }
      },
      description: `A list of scopes that will be requested during the OAuth2 flow.
It is optional for all providers.`,
      required: false,
      group: 'Authentication - OAuth2'
    },
    {
      name: 'auth.oauth2.endpoint_params',
      label: 'Endpoint Parameters',
      type: {
        name: 'object',
        of: {
          type: {
            name: 'array',
            of: {
              type: {
                name: 'string'
              },
              default: '',
              required: true
            }
          },
          required: true
        }
      },
      description: 'Set of values that will be sent on each request to the `Token URL`. Each param key can have multiple values. Can be set for all providers except `Google`.',
      required: false,
      group: 'Authentication - OAuth2'
    },
    {
      name: 'auth.oauth2.token_url',
      label: 'Token URL',
      type: {
        name: 'string'
      },
      description: `The endpoint that will be used to generate the tokens during the OAuth2 flow. It is required if no provider is specified.
> NOTE
> For \`Azure\` provider either \`Token URL\` or Azure \`Tenant ID\` is required.`,
      default: '',
      required: false,
      group: 'Authentication - OAuth2'
    },
    {
      name: 'auth.oauth2.azure.tenant_id',
      label: 'Azure - Tenant ID',
      type: {
        name: 'string'
      },
      description: `Used for authentication when using \`Azure\` provider.
> NOTE
> Since it is used in the process to generate the \`Token URL\`, it can't be used in combination with it.

It is not required.

For information about where to find it, you can refer to
https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal.`,
      default: '',
      required: false,
      group: 'Authentication - OAuth2'
    },
    {
      name: 'auth.oauth2.azure.resource',
      label: 'Azure - WebAPI Resource',
      type: {
        name: 'string'
      },
      description: `The accessed WebAPI resource when using \`Azure\` provider.
It is not required.`,
      default: '',
      required: false,
      group: 'Authentication - OAuth2'
    },
    {
      name: 'auth.oauth2.google.credentials_file',
      label: 'Google - Credentials File',
      type: {
        name: 'string'
      },
      description: `The credentials file for \`Google\`.

> NOTE
> Only one of the credentials settings can be set at once. If none is provided, loading default credentials from the environment will be attempted via ADC. 

For more information about how to provide Google credentials, please refer to https://cloud.google.com/docs/authentication.`,
      default: '',
      required: false,
      group: 'Authentication - OAuth2'
    },
    {
      name: 'auth.oauth2.google.credentials_json',
      label: 'Google - JSON Credentials File',
      type: {
        name: 'string'
      },
      description: `Your credentials information as raw JSON.

> NOTE
> Only one of the credentials settings can be set at once. If none is provided, loading default credentials from the environment will be attempted via ADC.

For more information about how to provide Google credentials, please refer to https://cloud.google.com/docs/authentication.`,
      default: '',
      required: false,
      group: 'Authentication - OAuth2'
    },
    {
      name: 'auth.oauth2.google.jwt_file',
      label: 'Google - JWT Account Key File',
      type: {
        name: 'string'
      },
      description: `The JWT Account Key file for Google.

> NOTE
> Only one of the credentials settings can be set at once. If none is provided, loading default credentials from the environment will be attempted via ADC.

For more information about how to provide Google credentials, please refer to https://cloud.google.com/docs/authentication.`,
      default: '',
      required: false,
      group: 'Authentication - OAuth2'
    },

    // SSL Configuration

    {
      name: 'request.ssl.enabled',
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
      name: 'request.ssl.certificate_authorities',
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
      name: 'request.ssl.certificate',
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
      name: 'request.ssl.key',
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
      name: 'request.ssl.key_passphrase',
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
      name: 'request.ssl.verification_mode',
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
      name: 'request.ssl.client_authentication',
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
      name: 'request.ssl.renegotiation',
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
    },

    // Advanced - Request Body

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
    },
    {
      name: 'request.body',
      label: 'Body Content',
      type: {
        name: 'string',
        multilines: true,
        textType: 'json'
      },
      description: `An optional HTTP POST body.
This is only valid when \`Request Method\` is \`POST\`. Defaults to \`null\` (no HTTP body).
::: danger
The configuration value must be a valid JSON object.
:::`,
      default: '',
      required: false,
      group: 'Advanced - Request Body'
    },

    // Advanced - Retries

    {
      name: 'request.retry.max_attempts',
      label: 'Request Maximum Retry Attempts',
      type: {
        name: 'number'
      },
      min: 1,
      max: 100,
      default: 5,
      description: 'The maximum number of retries for the HTTP client. The default is 5.',
      required: false,
      group: 'Advanced - Retries'
    },
    {
      name: 'request.retry.wait_min',
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
    },
    {
      name: 'request.retry.wait_max',
      label: 'Request Maximum Wait Before Retry',
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
      default: '60s',
      description: 'The maximum time to wait before a retry is attempted. The default is 60 seconds.',
      required: false,
      group: 'Advanced - Retries'
    },
    {
      name: 'request.redirect.forward_headers',
      label: 'Redirect Forward Headers',
      type: {
        name: 'boolean'
      },
      default: false,
      description: 'When set to `True` request headers are forwarded in case of a redirect. Default: `False`.',
      required: false,
      group: 'Advanced - Redirects'
    },
    {
      name: 'request.redirect.headers_ban_list',
      label: 'Redirect Forward Headers - Ban List',
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
      description: 'When `Redirect Forward Headers` is set to `True`, all headers __except__ the ones defined in this list will be forwarded.',
      required: false,
      group: 'Advanced - Redirects'
    },
    {
      name: 'request.redirect.max_redirects',
      label: 'Maximum Redirects',
      type: {
        name: 'number'
      },
      min: 0,
      max: 50,
      default: 10,
      description: 'The maximum number of redirects to follow for a request. The default is 10.',
      required: false,
      group: 'Advanced - Redirects'
    },

    // Advanced - Rate Limit

    {
      name: 'request.rate_limit.limit',
      label: 'Total Requests Limit',
      type: {
        name: 'string'
      },
      default: '',
      description: `The value of the response that specifies the total limit. It is defined with a Go template value.
> NOTE
> Can read state from: [.last_response.header]

::: tip Examples
- 1500
- \`[[.last_response.header.X-RateLimit-Limit]]\`
:::
`,
      required: false,
      group: 'Advanced - Rate Limit'
    },
    {
      name: 'request.rate_limit.remaining',
      label: 'Remaining Requests',
      type: {
        name: 'string'
      },
      default: '',
      description: `The value of the response that specifies the remaining quota of the rate limit. It is defined with a Go template value.
> NOTE
> Can read state from: [.last_response.header]

::: tip Example
\`[[.last_response.header.X-RateLimit-Remaining]]\`
:::
`,
      required: false,
      group: 'Advanced - Rate Limit'
    },
    {
      name: 'request.rate_limit.reset',
      label: 'Reset Time',
      type: {
        name: 'string'
      },
      default: '',
      description: `The value of the response that specifies the epoch time when the rate limit will reset. It is defined with a Go template value.
> NOTE
> Can read state from: [.last_response.header]

::: tip Example
\`[[.last_response.header.X-RateLimit-Reset]]\`
:::
`,
      required: false,
      group: 'Advanced - Rate Limit'
    },

    // Advanced - Request Transforms

    {
      name: 'request.transforms',
      label: 'Transforms List',
      type: {
        name: 'object',
        of: {
          type: {
            name: 'string'
          },
          prefix: {
            options: [
              { value: '___set___👉', label: 'Set to' },
              { value: '___append___👉', label: 'Append' },
              { value: '___delete___👉', label: 'Delete' }
            ],
            default: '___set___👉'
          },
          suffix: {
            options: [
              { value: '👈___default___🚫', label: 'No Default' },
              { value: '👈___default___', label: 'Empty string' },
              { value: '👈___default___0', label: '0' },
              { value: '👈___default___[[now]]', label: '[[now]]' },
              { value: '👈___default___[[now (parseDuration "-1m")]]', label: '[[now (parseDuration "-1m")]]' },
              { value: '👈___default___[[now (parseDuration "-5m")]]', label: '[[now (parseDuration "-5m")]]' },
              { value: '👈___default___[[now (parseDuration "-10m")]]', label: '[[now (parseDuration "-10m")]]' },
              { value: '👈___default___[[now (parseDuration "-15m")]]', label: '[[now (parseDuration "-15m")]]' },
              { value: '👈___default___[[now (parseDuration "-30m")]]', label: '[[now (parseDuration "-30m")]]' },
              { value: '👈___default___[[now (parseDuration "-45m")]]', label: '[[now (parseDuration "-45m")]]' },
              { value: '👈___default___[[now (parseDuration "-1h")]]', label: '[[now (parseDuration "-1h")]]' },
              { value: '👈___default___[[now (parseDuration "-2h")]]', label: '[[now (parseDuration "-2h")]]' },
              { value: '👈___default___[[now (parseDuration "-3h")]]', label: '[[now (parseDuration "-3h")]]' },
              { value: '👈___default___[[now (parseDuration "-5h")]]', label: '[[now (parseDuration "-5h")]]' },
              { value: '👈___default___[[now (parseDuration "-6h")]]', label: '[[now (parseDuration "-6h")]]' },
              { value: '👈___default___[[now (parseDuration "-12h")]]', label: '[[now (parseDuration "-12h")]]' },
              { value: '👈___default___[[now (parseDuration "-24h")]]', label: '[[now (parseDuration "-24h")]]' },
              { value: '👈___default___[[now (parseDuration "-36h")]]', label: '[[now (parseDuration "-36h")]]' },
              { value: '👈___default___[[now (parseDuration "-48h")]]', label: '[[now (parseDuration "-48h")]]' },
              { value: '👈___default___[[now (parseDuration "-72h")]]', label: '[[now (parseDuration "-72h")]]' }
            ],
            default: '👈___default___🚫'
          },
          default: '',
          required: true
        },
        required: true
      },
      description: `List of transforms to apply to the __request__ before each execution.

Available transforms for request: \`Append\`, \`Delete\` and \`Set\`.

> NOTE
> Can __read__ state from:
> - \`.last_response.* \`
> - \`.last_event.* \`
> - \`.cursor.* \`]
>
> Can __write__ state to:
> - \`header.* \`
> - \`url.params.* \`
> - \`body.*\`

::: tip Examples

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
|  body.from  | __Set to__ | \`[[now (parseDuration "-1h")]]\` | __[[now]]__ |
|  body.variable_abc  | __Set to__ | \`AUTO\` |  |
|  header.variable_xyz  | __Set to__ | \`[[.last_response.header.X-Var-XYZ]]\` | __0__ |
|  body.my_array_of_names  | __Append__ | \`Bill\` |  |
|  body.my_array_of_names  | __Append__ | \`Bob\` |  |
|  body.useless_token  | __Delete__ |  |  |
:::

::: tip Creating an array of values

Use __Append__, and use it several times with the same Target name.
For example, to create and \`event_types\` array in the \`body\` with the following 4 values:
- \`Auth Failure\`
- \`Auth Success\`
- \`Remote Connection\`
- \`User Created\`

Add these entries:

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
|  body.event_types  | __Append__ | \`Auth Failure\` |  |
|  body.event_types  | __Append__ | \`Auth Success\` |  |
|  body.event_types  | __Append__ | \`Remote Connection\` |  |
|  body.event_types  | __Append__ | \`User Created\` |  |
:::
`,
      required: false,
      group: 'Advanced - Request Transforms'
    },

    // Advanced - Response Transforms

    {
      name: 'response.transforms',
      label: 'Transforms List',
      type: {
        name: 'object',
        of: {
          type: {
            name: 'string'
          },
          prefix: {
            options: [
              { value: '___set___👉', label: 'Set to' },
              { value: '___append___👉', label: 'Append' },
              { value: '___delete___👉', label: 'Delete' }
            ],
            default: '___set___👉'
          },
          suffix: {
            options: [
              { value: '👈___default___🚫', label: 'No Default' },
              { value: '👈___default___', label: 'Empty string' },
              { value: '👈___default___0', label: '0' },
              { value: '👈___default___[[now]]', label: '[[now]]' },
              { value: '👈___default___[[now (parseDuration "-1m")]]', label: '[[now (parseDuration "-1m")]]' },
              { value: '👈___default___[[now (parseDuration "-5m")]]', label: '[[now (parseDuration "-5m")]]' },
              { value: '👈___default___[[now (parseDuration "-10m")]]', label: '[[now (parseDuration "-10m")]]' },
              { value: '👈___default___[[now (parseDuration "-15m")]]', label: '[[now (parseDuration "-15m")]]' },
              { value: '👈___default___[[now (parseDuration "-30m")]]', label: '[[now (parseDuration "-30m")]]' },
              { value: '👈___default___[[now (parseDuration "-45m")]]', label: '[[now (parseDuration "-45m")]]' },
              { value: '👈___default___[[now (parseDuration "-1h")]]', label: '[[now (parseDuration "-1h")]]' },
              { value: '👈___default___[[now (parseDuration "-2h")]]', label: '[[now (parseDuration "-2h")]]' },
              { value: '👈___default___[[now (parseDuration "-3h")]]', label: '[[now (parseDuration "-3h")]]' },
              { value: '👈___default___[[now (parseDuration "-5h")]]', label: '[[now (parseDuration "-5h")]]' },
              { value: '👈___default___[[now (parseDuration "-6h")]]', label: '[[now (parseDuration "-6h")]]' },
              { value: '👈___default___[[now (parseDuration "-12h")]]', label: '[[now (parseDuration "-12h")]]' },
              { value: '👈___default___[[now (parseDuration "-24h")]]', label: '[[now (parseDuration "-24h")]]' },
              { value: '👈___default___[[now (parseDuration "-36h")]]', label: '[[now (parseDuration "-36h")]]' },
              { value: '👈___default___[[now (parseDuration "-48h")]]', label: '[[now (parseDuration "-48h")]]' },
              { value: '👈___default___[[now (parseDuration "-72h")]]', label: '[[now (parseDuration "-72h")]]' }
            ],
            default: '👈___default___🚫'
          },
          default: '',
          required: true
        },
        required: true
      },
      description: `List of transforms to apply to the __response__ once it is received.

Available transforms for response: \`Append\`, \`Delete\` and \`Set\`.

> NOTE
> Can __read__ state from:
> - \`.last_response.* \`
> - \`.last_event.* \`
> - \`.cursor.* \`]
> - \`.header.* \`]
> - \`.url.* \`]
>
> Can __write__ state to:
> - \`body.*\`

::: tip Examples

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
|  body.very_confidential  | __Delete__ |  |  |
|  body.from_url  | __Set to__ | \`[[.url.value]]\` | __Empty string__ |
|  body.variable_abc  | __Set to__ | \`Static ABC value\` |  |
|  body.variable_xyz  | __Set to__ | \`[[.last_response.header.X-Var-XYZ]]\` |
|  body.my_array_of_name  | __Append__ | \`Bill\` |  |
|  body.my_array_of_name  | __Append__ | \`Bob\` |  |
:::

::: tip Creating an array of values
Use __Append__, and use it several times with the same Target name.
For example, to create and \`event_types\` array with the following 4 values:
- \`Auth Failure\`
- \`Auth Success\`
- \`Remote Connection\`
- \`User Created\`

Add these entries:

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
 __[[now]]__ |  |
|  body.event_types  | __Append__ | \`Auth Failure\` |  |
|  body.event_types  | __Append__ | \`Auth Success\` |  |
|  body.event_types  | __Append__ | \`Remote Connection\` |  |
|  body.event_types  | __Append__ | \`User Created\` |  |

If the array or entry might already exist in the response, some use case might require for it to be deleted first.
Like so:

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
 __[[now]]__ |  |
|  body.event_types  | __Delete__ |  |  |
|  body.event_types  | __Append__ | \`Auth Failure\` |  |
|  body.event_types  | __Append__ | \`Auth Success\` |  |
|  body.event_types  | __Append__ | \`Remote Connection\` |  |
|  body.event_types  | __Append__ | \`User Created\` |  |
:::

`,
      required: false,
      group: 'Advanced - Response Transforms'
    },

    // Advanced - Response Splits

    // I decided NOT to implement this one, as it was too complicated
    // (it would have required to develop new widgets / logic to deal with it)
    // and a duplicate of the Fan Out option of the OpenCollector

    // {
    //   name: 'response.split',
    //   label: 'Splits List',
    //   type: {
    //     name: 'object',
    //     of: {
    //       type: {
    //         name: 'object',
    //         of: {
    //           type: {
    //             name: 'string'
    //           },
    //           prefix: {
    //             options: [
    //               { value: '___set___👉', label: 'Set to' },
    //               { value: '___append___👉', label: 'Append' },
    //               { value: '___delete___👉', label: 'Delete' }
    //             ],
    //             default: '___set___👉'
    //           },
    //           default: '',
    //           required: true
    //         },
    //         required: true
    //       },
    //       prefix: {
    //         options: [
    //           { value: '___array___👉', label: 'Array' },
    //           { value: '___map___👉', label: 'Map' },
    //           { value: '___string___👉', label: 'String' }
    //         ],
    //         default: '___array___👉'
    //       }
    //     }
    //   },
    //   description: '',
    //   required: true,
    //   group: 'Advanced - Splits'
    // },

    {
      name: 'response.split',
      label: 'Splits List',
      type: {
        name: 'not implemented'
      },
      default: '** NOT IMPLEMENTED **',
      description: `::: danger
__NOT IMPLEMENTED__
:::

The __split__ feature of Filebeat is a duplicate of the __Fan Out__ feature of the OpenCollector.
As such, it is not necessary to implement it here.

::: tip
While building the __Field Mapping__, under __Modifier__ select: __Fan Out__.
:::`,
      required: false,
      readonly: true,
      group: 'Advanced - Splits'
    },

    // Advanced - Response Pagination Transforms

    {
      name: 'response.pagination',
      label: 'Transforms List',
      type: {
        name: 'object',
        of: {
          type: {
            name: 'string'
          },
          prefix: {
            options: [
              { value: '___set___👉', label: 'Set to' },
              { value: '___append___👉', label: 'Append' },
              { value: '___delete___👉', label: 'Delete' }
            ],
            default: '___set___👉'
          },
          suffix: {
            options: [
              { value: '👈___default___🚫', label: 'No Default' },
              { value: '👈___default___', label: 'Empty string' },
              { value: '👈___default___0', label: '0' },
              { value: '👈___default___[[now]]', label: '[[now]]' },
              { value: '👈___default___[[now (parseDuration "-1m")]]', label: '[[now (parseDuration "-1m")]]' },
              { value: '👈___default___[[now (parseDuration "-5m")]]', label: '[[now (parseDuration "-5m")]]' },
              { value: '👈___default___[[now (parseDuration "-10m")]]', label: '[[now (parseDuration "-10m")]]' },
              { value: '👈___default___[[now (parseDuration "-15m")]]', label: '[[now (parseDuration "-15m")]]' },
              { value: '👈___default___[[now (parseDuration "-30m")]]', label: '[[now (parseDuration "-30m")]]' },
              { value: '👈___default___[[now (parseDuration "-45m")]]', label: '[[now (parseDuration "-45m")]]' },
              { value: '👈___default___[[now (parseDuration "-1h")]]', label: '[[now (parseDuration "-1h")]]' },
              { value: '👈___default___[[now (parseDuration "-2h")]]', label: '[[now (parseDuration "-2h")]]' },
              { value: '👈___default___[[now (parseDuration "-3h")]]', label: '[[now (parseDuration "-3h")]]' },
              { value: '👈___default___[[now (parseDuration "-5h")]]', label: '[[now (parseDuration "-5h")]]' },
              { value: '👈___default___[[now (parseDuration "-6h")]]', label: '[[now (parseDuration "-6h")]]' },
              { value: '👈___default___[[now (parseDuration "-12h")]]', label: '[[now (parseDuration "-12h")]]' },
              { value: '👈___default___[[now (parseDuration "-24h")]]', label: '[[now (parseDuration "-24h")]]' },
              { value: '👈___default___[[now (parseDuration "-36h")]]', label: '[[now (parseDuration "-36h")]]' },
              { value: '👈___default___[[now (parseDuration "-48h")]]', label: '[[now (parseDuration "-48h")]]' },
              { value: '👈___default___[[now (parseDuration "-72h")]]', label: '[[now (parseDuration "-72h")]]' }
            ],
            default: '👈___default___🚫'
          },
          default: '',
          required: true
        },
        required: true
      },
      description: `List of transforms that will be applied to the __response__ to every new page request. All the transforms from \`Request Transforms\` will be executed and then \`Response Pagination Transforms\` will be added to modify the next request as needed. For subsequent responses, the usual \`Response Transforms\` and \`Response Split\` will be executed normally.

Available transforms for response: \`Append\`, \`Delete\` and \`Set\`.

> NOTE
> Can __read__ state from:
> - \`.last_response.* \`
> - \`.first_event.* \`
> - \`.last_event.* \`
> - \`.cursor.* \`]
>
> Can __write__ state to:
> - \`body.*\`
> - \`.header.* \`]
> - \`.url.* \`]

::: tip Examples

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
|  url.value  | __Set to__ | \`http://localhost:9200/_search/scroll\` |  |
|  url.params.scroll_id  | __Set to__ | \`[[.last_response.body._scroll_id]]\` | __0__ |
|  body.scroll  | __Set to__ | \`5m\` |  |
:::

::: tip Creating an array of values
Use __Append__, and use it several times with the same Target name.
For example, to create and \`event_types\` array with the following 4 values:
- \`Auth Failure\`
- \`Auth Success\`
- \`Remote Connection\`
- \`User Created\`

Add these entries:

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
|  body.event_types  | __Append__ | \`Auth Failure\` | |
|  body.event_types  | __Append__ | \`Auth Success\` | |
|  body.event_types  | __Append__ | \`Remote Connection\` | |
|  body.event_types  | __Append__ | \`User Created\` | |

If the array or entry might already exist in the response, some use case might require for it to be deleted first.
Like so:

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
|  body.event_types  | __Delete__ |  | |
|  body.event_types  | __Append__ | \`Auth Failure\` | |
|  body.event_types  | __Append__ | \`Auth Success\` | |
|  body.event_types  | __Append__ | \`Remote Connection\` | |
|  body.event_types  | __Append__ | \`User Created\` | |
:::

`,
      required: false,
      group: 'Advanced - Response Pagination Transforms'
    },

    {
      name: 'cursor',
      label: 'Cursors List',
      type: {
        name: 'object',
        of: {
          type: {
            name: 'string'
          },
          default: '',
          required: true,
          suffix: {
            options: [
              { value: '👈___default___🚫', label: 'No Default' },
              { value: '👈___default___', label: 'Empty string' },
              { value: '👈___default___0', label: '0' },
              { value: '👈___default___[[now]]', label: '[[now]]' },
              { value: '👈___default___[[now (parseDuration "-1m")]]', label: '[[now (parseDuration "-1m")]]' },
              { value: '👈___default___[[now (parseDuration "-5m")]]', label: '[[now (parseDuration "-5m")]]' },
              { value: '👈___default___[[now (parseDuration "-10m")]]', label: '[[now (parseDuration "-10m")]]' },
              { value: '👈___default___[[now (parseDuration "-15m")]]', label: '[[now (parseDuration "-15m")]]' },
              { value: '👈___default___[[now (parseDuration "-30m")]]', label: '[[now (parseDuration "-30m")]]' },
              { value: '👈___default___[[now (parseDuration "-45m")]]', label: '[[now (parseDuration "-45m")]]' },
              { value: '👈___default___[[now (parseDuration "-1h")]]', label: '[[now (parseDuration "-1h")]]' },
              { value: '👈___default___[[now (parseDuration "-2h")]]', label: '[[now (parseDuration "-2h")]]' },
              { value: '👈___default___[[now (parseDuration "-3h")]]', label: '[[now (parseDuration "-3h")]]' },
              { value: '👈___default___[[now (parseDuration "-5h")]]', label: '[[now (parseDuration "-5h")]]' },
              { value: '👈___default___[[now (parseDuration "-6h")]]', label: '[[now (parseDuration "-6h")]]' },
              { value: '👈___default___[[now (parseDuration "-12h")]]', label: '[[now (parseDuration "-12h")]]' },
              { value: '👈___default___[[now (parseDuration "-24h")]]', label: '[[now (parseDuration "-24h")]]' },
              { value: '👈___default___[[now (parseDuration "-36h")]]', label: '[[now (parseDuration "-36h")]]' },
              { value: '👈___default___[[now (parseDuration "-48h")]]', label: '[[now (parseDuration "-48h")]]' },
              { value: '👈___default___[[now (parseDuration "-72h")]]', label: '[[now (parseDuration "-72h")]]' }
            ],
            default: '👈___default___🚫'
          }
        }
      },
      description: `Cursor is a list of key value objects where arbitrary values are defined. 
The values are interpreted as [value templates](https://github.com/elastic/beats/blob/7.12/x-pack/filebeat/docs/inputs/input-httpjson.asciidoc#value-templates) and a default template can be set.
Cursor state is kept between input restarts and updated once all the events for a request are published.

> NOTE
> Default templates do not have access to any state, only to functions.
>
> Can __read__ state from:
> - \`.last_response.* \`
> - \`.first_event.* \`
> - \`.last_event.* \`
>
::: tip Examples

| Key | Value | Default to |
| --- | ----- | ---------- |
| last_requested_at | \`[[now]]\` | __Empty String__ |
| last_log_id | \`[[.last_event._id]]\` | __0__ |
:::
`,
      required: true,
      group: 'Advanced - Cursors'
    },

    // Advanced - Miscellaneous

    {
      name: 'request.timeout',
      label: 'Request Timeout',
      type: {
        name: 'number'
      },
      suffix: {
        options: [
          { value: 'ns', label: 'NanoSeconds' },
          { value: 'us', label: 'MicroSeconds' },
          { value: 'ms', label: 'MilliSeconds' },
          { value: 's', label: 'Seconds' },
          { value: 'm', label: 'Minutes' },
          { value: 'h', label: 'Hours' }
        ],
        default: 's'
      },
      min: 1,
      max: 1000,
      default: '30s',
      description: 'Duration before declaring that the HTTP client connection has timed out. The default is 30 seconds.',
      required: false,
      group: 'Advanced - Miscellaneous'
    },
    {
      name: 'config_version',
      label: 'Configuration version',
      type: {
        name: 'number'
      },
      min: 1,
      max: 2,
      description: `Defines the configuration version.
V1 configuration is deprecated and will be unsupported in future releases.
> Any new configuration should use \`Configuration version\` \`2\`.`,
      default: 2,
      required: true,
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
