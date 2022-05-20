//     ########  ########  ######  ########       ###    ########  ####                #######   ######
//     ##     ## ##       ##    ##    ##         ## ##   ##     ##  ##                ##     ## ##    ##
//     ##     ## ##       ##          ##        ##   ##  ##     ##  ##                ##     ## ##
//     ########  ######    ######     ##       ##     ## ########   ##     #######    ##     ## ##
//     ##   ##   ##             ##    ##       ######### ##         ##                ##     ## ##
//     ##    ##  ##       ##    ##    ##       ##     ## ##         ##                ##     ## ##    ##
//     ##     ## ########  ######     ##       ##     ## ##        ####                #######   ######

export default {
  shipper: 'genericbeat',
  collectionMethod: 'genericbeat',
  definition: [
    // Required
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
    },
    {
      name: 'request_method',
      label: 'Request Method',
      type: {
        name: 'option'
      },
      options: [{ value: 'GET', label: 'HTTP GET' }, { value: 'POST', label: 'HTTP POST' }],
      description: 'HTTP method to use when making requests. Default: `GET`.',
      default: 'GET',
      required: true,
      group: 'Required'
    },
    {
      name: 'auth_type',
      label: 'Authentication Type',
      type: {
        name: 'option'
      },
      options: [
        { value: 'noauth', label: 'No Authentication' },
        { value: 'basic', label: 'Basic Authentication' },
        { value: 'token', label: 'Header Based Authentication' },
        { value: 'oauth20', label: 'oAuth 2.0 Authentication' }
      ],
      description: `The Generic beat supports three types of authentication mechanisms. Select one of the authentication types that is supported by the API in order to configure the Generic beat.

#### **Basic authentication**

This is the most straightforward method and the easiest. With this method, the sender places a username:password into the request header. The username and password are encoded with Base64, which is an encoding technique that converts the username and password into a set of 64 characters to ensure safe transmission.
A basic authentication in a request header will look similar to the following:
\`\`\` text
Authorization: Basic bG9sOnNlY3VyZQ==
\`\`\`

#### **Header-based authentication**

Header-based authentication (also called token authentication) is an HTTP authentication scheme that involves security tokens called bearer tokens.
The client must send this token in the authorization header when making requests to protected resources.
\`\`\` text
Authorization: Bearer <token>
\`\`\`

#### **OAuth (2.0) access token**

Sent like an API key, this token allows the application to access a user’s data. Optionally, access tokens can be configured to expire.

As of the 2021.10 version of the Generic beat, only the access token method is supported.

::: tip Hint
Once the right Authentication Type has been selected, do configure its related section below:
- Authentication - Basic
- Authentication - Header Based
- Authentication - oAuth 2.0
:::`,
      default: 'noauth',
      required: true,
      group: 'Authentication'
    },

    // Basic Auth

    {
      name: 'basic_auth.username',
      label: 'Username',
      type: {
        name: 'string'
      },
      description: 'The username required for basic authentication.',
      default: '',
      required: true,
      group: 'Authentication - Basic'
    },
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
    },

    // Header Based Auth

    {
      name: 'token_auth.auth_header',
      label: 'Auth Header Field',
      type: {
        name: 'string'
      },
      description: 'The authentication header field needed to be sent in the request. For example, `Authorization`',
      default: '',
      required: true,
      group: 'Authentication - Header Based'
    },
    {
      name: 'token_auth.auth_token',
      label: 'Auth Token Value',
      type: {
        name: 'password'
      },
      obfuscation: {
        compulsory: true,
        method: 'oc_encrypt',
        obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
      },
      description: 'The token value sent in the request, including the append field, like Bearer or SSWS. For example, `SSWS 00uH4WDqFWdAlVNDzXQOLQBEA-JtlNzgCV4TwB`.',
      default: '',
      required: true,
      group: 'Authentication - Header Based'
    },

    // OAuth2 Auth

    {
      name: 'oauth20_auth.url',
      label: 'Provider URL',
      type: {
        name: 'string'
      },
      description: `The URL of the authentication server.
For example, \`https://gateway.qg1.apps.qualys.in/auth\`.`,
      default: '',
      required: true,
      group: 'Authentication - oAuth 2.0'
    },
    {
      name: 'oauth20_auth.method',
      label: 'Request Method',
      type: {
        name: 'option'
      },
      options: [{ value: 'GET', label: 'HTTP GET' }, { value: 'POST', label: 'HTTP POST' }],
      description: 'The request method to get the `access_token` from the authentication server. This could be `GET` or `POST`.',
      default: 'POST',
      required: false,
      group: 'Authentication - oAuth 2.0'
    },
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
    },
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
    },
    {
      name: 'oauth20_auth.body_param',
      label: 'Request Body Parameters - For Content Type "Web Form URL Encoded" Only',
      type: {
        name: 'object',
        of: {
          type: {
            name: 'password'
          },
          obfuscation: {
            compulsory: true,
            method: 'oc_encrypt',
            obfuscatedFormatCheckRegex: '[0-9]\\|\\|.{23,}' // Example: 2||64isxHMCDZfsEWhchnl+RTGW6RCjcOtxTjTBotLmtAzXTxMSc1jCPv7xPrtXO8nr4796WpAzSduLAENtAjs=
          },
          default: '',
          required: true
        }
      },
      description: `Optionally provide the body parameters as Key:Value pairs to receive the access token from the server.
> NOTE
> This is only necessary if the \`Content Type\` is \`Web Form URL Encoded (application/x-www-form-urlencoded)\`

::: danger
As it might contain Secret(s), each entry must be obfuscated.
:::

::: tip Examples

| Key | Value |
| --- | ----- |
| username | user_name |
| password | b4d_p4ssw0rd |
:::
`,
      default: '',
      required: false,
      group: 'Authentication - oAuth 2.0'
    },
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
    },
    {
      name: 'oauth20_auth.params',
      label: 'Request Parameters',
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
      description: `Optionally provide the Query Parameters supported by the API as Key:Value pairs.
::: tip Examples

| Key | Value |
| --- | ----- |
| limit | 100 |
:::
`,
      default: '',
      required: false,
      group: 'Authentication - oAuth 2.0'
    },
    {
      name: 'oauth20_auth.access_token_format',
      label: 'Access Token Format',
      type: {
        name: 'option'
      },
      options: [{ value: 'jsonkey', label: 'JSON Key' }, { value: 'normaltext', label: 'Normal Text' }],
      description: `The Generic beat supports two types of access token format. Choose the option supported by the API.
This could be:
- \`Normal text\` format: Contains the access token in the text/plain;charset=UTF-8 form, as shown in the example below:
\`\`\` text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaXNTb2NpYWwiOnRydWV9.4pcPyMD09olPSyXnrXCjTwXyr4BsezdI1AVTmud2fU4
\`\`\`
- \`JSON Key\` format: Contains the access token in JSON body, as shown in the example below:
\`\`\`
{
  "access_token": "4484e52dc4744374aced826a4543cd28988816ff",
  "token_type": "Bearer",
  "expires_in": 129599
}
\`\`\`
`,
      default: 'normaltext',
      required: false,
      group: 'Authentication - oAuth 2.0'
    },
    {
      name: 'oauth20_auth.access_token_field',
      label: 'Access Token Field',
      type: {
        name: 'string'
      },
      description: `The field name in which the access token is coming in the response.
> NOTE
> This is only necessary if the \`Access Token Format\` is \`JSON Key\`

For example, in the JSON format below, the access token field is \`access_token\`:
\`\`\`
{
  "access_token": "4484e52dc4744374aced826a4543cd28988816ff",
  "token_type": "Bearer",
  "expires_in": 129599
}
\`\`\`
`,
      default: '',
      required: true,
      group: 'Authentication - oAuth 2.0'
    },
    {
      name: 'oauth20_auth.auth_header_field',
      label: 'Authorization Header Field',
      type: {
        name: 'string'
      },
      description: `The authorization header used to send the access token from auth server, in order to get the data records from the log source server.
For example, in the header below, the authorization header field is \`authorization\`:
\`\`\` text
authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaXNTb2NpYWwiOnRydWV9.4pcPyMD09olPSyXnrXCjTwXyr4BsezdI1AVTmud2fU4
\`\`\`
`,
      default: '',
      required: true,
      group: 'Authentication - oAuth 2.0'
    },
    {
      name: 'oauth20_auth.auth_append_field',
      label: 'Auth Token Append Field',
      type: {
        name: 'string'
      },
      description: `The field to append in the retrieved access token when requesting data from the log source server.
For example, in the header below, the auth token field is \`Bearer\`:
\`\`\` text
authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaXNTb2NpYWwiOnRydWV9.4pcPyMD09olPSyXnrXCjTwXyr4BsezdI1AVTmud2fU4
\`\`\`
`,
      default: '',
      required: true,
      group: 'Authentication - oAuth 2.0'
    },

    // Pagination

    {
      name: 'pagination_type',
      label: 'Pagination Style',
      type: {
        name: 'option'
      },
      options: [
        { value: 'cursor', label: 'Cursor Pagination' },
        { value: 'pagebased', label: 'Page Number Pagination' },
        { value: 'limitoffset', label: 'Limit Offset Pagination' },
        { value: 'nopagination', label: 'No Pagination' }
      ],
      default: 'nopagination',
      description: `The Generic beat supports four types of pagination styles.

Most endpoints that return a list of entities will need to have some sort of pagination. Without pagination, a simple search could return millions or even billions of hits, causing extraneous network traffic. Pagination requires an implied ordering. By default, this may be the item's unique identifier, but can be other ordered fields such as a created date.

Before configuring the Generic beat for log sources, it is recommended to learn the types of pagination styles that your API supports using the following methods.

#### **Cursor-based pagination**

In cursor-based pagination, when a request is made, the server returns the first page of data and the cursor points to the next page. A cursor can be a URL to the next page or it could be a token after which the next records should be fetched.
A cursor-based pagination in a response header could look similar to the following:
\`\`\` text
Link: "<https://{shop}.myshopify.com/admin/api/{version}/products.json?page_info={page_info}&limit={limit}>; rel={next}, ...
\`\`\`

#### **Page number-based pagination**

This is the simplest and most common form of pagination, particularly for apps that use SQL databases. Using this method, the set is divided into pages. The endpoint accepts a page parameter that is an integer indicating the page within the list to be returned.
For example:
\`\`\` text
https://lrtestapi.azurewebsites.net/countries/?starttime=2021-08-03+17%3A26%3A44.223638&endtime=2021-08-03+17%3A35%3A30.692350&page=2&pagesize=15
\`\`\`

#### **Offset pagination**

Limit/Offset pagination can be retrieved using the following:
\`\`\` text
GET /items?limit=20&offset=100
\`\`\`
This query would return 20 rows, starting with the 100th row.

> NOTE
> For more information about how each work, please refer to:
> - https://docs.logrhythm.com/docs/OCbeats/generic-beat/configure-the-generic-beat#ConfiguretheGenericBeat-Pagination
> - https://docs.logrhythm.com/docs/OCbeats/generic-beat/configure-the-generic-beat#ConfiguretheGenericBeat-PaginationStyles

::: tip Hint
Once the right Pagination Style has been selected, do configure its related section below:
- Pagination - Cursor
- Pagination - Page-Based
- Pagination - Limit and Offset
:::`,
      required: true,
      group: 'Pagination'
    },

    // Pagination - Cursor

    {
      name: 'pagination.cursor_based.cursor_type',
      label: 'Cursor Type',
      type: {
        name: 'option'
      },
      options: [
        { value: 'url', label: 'URL' },
        { value: 'query_param', label: 'Query Parameter' }
      ],
      default: 'url',
      description: `The cursor type can be a URL to the next set of data records or it can be a token to fetch the next set of records as a query parameter.

::: tip Examples
- In the sample below, the cursor type is \`URL\` (as per line 3):
\`\`\`
{
  "count": 87,
  "next": "https://swapi.co./api/people/?page=2",
  "previous": null,
  "result": [ ... ]
}
\`\`\`

- In the sample below, the cursor type is \`Query Parameter\` (as per line 4):
\`\`\`
"data": [ ... ],
"pageing": {
  "cursors": {
    "next": "MTAxNTExOTQ1MjAwNzI5NDE=",
    "before": "NDMyNzQyODI3OTQw"
  }
}
\`\`\`

And would be typically used like this in the URL Parameters:
\`\`\` text
https://graph.facebook.com/me/albums?limit=25&after=MTAxNTExOTQ1MjAwNzI5NDE=
\`\`\`

:::
`,
      required: true,
      group: 'Pagination - Cursor'
    },
    {
      name: 'pagination.cursor_based.cursor_location',
      label: 'Cursor Location',
      type: {
        name: 'option'
      },
      options: [
        { value: 'body', label: 'Response Body' },
        { value: 'header', label: 'Response Header' }
      ],
      default: 'body',
      description: `The cursor can be located in response headers or the response body.

::: tip Examples
- In the sample below, the cursor location is \`Response Body\` (as per line 7):
\`\`\`
{
  "version": "v1.2.0",
  "metadata": {
    "links": {
      "self": "https://api.amp.cisco.com/v1/events?limit=500&start_date=2021-09-21T00:00:00Z&offset=53000",
      "prev": "https://api.amp.cisco.com/v1/events?limit=500&start_date=2021-09-21T00:00:00Z&offset=52500",
      "next": "https://api.amp.cisco.com/v1/events?limit=500&start_date=2021-09-21T00:00:00Z&offset=53500"
    },
    "results": { ... }
  },
}
\`\`\`

- In the sample below, the cursor location is \`Response Header\`:
\`\`\` text
Link: "<https://{shop}.myshopify.com/admin/api/{version}/products.json?page_info={page_info}&limit={limit}>; rel={next}, ...
\`\`\`
:::
`,
      required: true,
      group: 'Pagination - Cursor'
    },
    {
      name: 'pagination.cursor_based.cursor_field',
      label: 'Cursor Field - For Location "Response Body" Only',
      type: {
        name: 'string'
      },
      default: '',
      description: `The cursor field refers to the field name in which the cursor appears inside the response body.
> NOTE
> This is only necessary if the \`Cursor Location\` is \`Response Body\`

::: tip Example
- In the sample below, the cursor field is \`next\` (as per line 7):
\`\`\`
{
  "version": "v1.2.0",
  "metadata": {
    "links": {
      "self": "https://api.amp.cisco.com/v1/events?limit=500&start_date=2021-09-21T00:00:00Z&offset=53000",
      "prev": "https://api.amp.cisco.com/v1/events?limit=500&start_date=2021-09-21T00:00:00Z&offset=52500",
      "next": "https://api.amp.cisco.com/v1/events?limit=500&start_date=2021-09-21T00:00:00Z&offset=53500"
    },
    "results": { ... }
  },
}
\`\`\`
:::
`,
      required: false,
      group: 'Pagination - Cursor'
    },
    {
      name: 'pagination.cursor_based.cursor_query_param',
      label: 'Cursor Query Param - For Type "Query Parameter" Only',
      type: {
        name: 'string'
      },
      default: '',
      description: `Cursor query param is the field name in the request query param in which the next token will be sent.
> NOTE
> This is only necessary if the \`Cursor Type\` is \`Query Parameter\`

::: tip Example
To produce the the sample below, the cursor query param is set to \`after\`:
\`\`\` text
https://graph.facebook.com/me/albums?limit=25&after=MTAxNTExOTQ1MjAwNzI5NDE=
\`\`\`
:::
`,
      required: false,
      group: 'Pagination - Cursor'
    },
    {
      name: 'pagination.cursor_based.cursor_header_type',
      label: 'Cursor Header Type - For Location "Response Header" Only',
      type: {
        name: 'option'
      },
      options: [
        { value: 'custom_header', label: 'Custom Header' },
        { value: 'link', label: 'Link-defined HTTP Header' }
      ],
      default: 'custom_header',
      description: `The cursor header type can be either a link-defined HTTP header, or a custom header that can be any named field.
> NOTE
> This is only necessary if the \`Cursor Location\` is \`Response Header\`
`,
      required: false,
      group: 'Pagination - Cursor'
    },
    {
      name: 'pagination.cursor_based.cursor_header_field',
      label: 'Cursor Header Field - For Location "Response Header" Only',
      type: {
        name: 'string'
      },
      default: '',
      description: `The cursor header field is the field name from which the token is pulled.
> NOTE
> This is only necessary if the \`Cursor Location\` is \`Response Header\`

::: tip
If it is a \`Link-defined HTTP Header\`, it is recommended to provide the \`rel\` value here.
:::

::: tip Example
In the sample below, the cursor header field is \`next\`.
\`\`\` text
Link: "<https://{shop}.myshopify.com/admin/api/{version}/products.json?page_info={page_info}&limit={limit}>; rel={next}, ...
\`\`\`
:::
`,
      required: false,
      group: 'Pagination - Cursor'
    },

    // Pagination - Page-Based

    {
      name: 'pagination.page_based.pagesize_field',
      label: 'Page Size Field',
      type: {
        name: 'string'
      },
      default: '',
      description: `The field name for page size.
::: tip Example
In the URL sample below, the page size field is \`pagesize\`:
\`\`\` text
https://lrtestapi.azurewebsites.net/countries/?starttime=2021-08-03+17%3A26%3A44.223638&endtime=2021-08-03+17%3A35%3A30.692350&page=2&pagesize=15
\`\`\`
:::
`,
      required: true,
      group: 'Pagination - Page-Based'
    },
    {
      name: 'pagination.page_based.pagesize_value',
      label: 'Page Size Value',
      type: {
        name: 'number'
      },
      min: 1,
      max: 5000,
      default: '1000',
      description: `The value for page size to limit the number of records returned by the server in a single request.
::: tip Example
In the URL sample below, the page size value is \`15\`:
\`\`\` text
https://lrtestapi.azurewebsites.net/countries/?starttime=2021-08-03+17%3A26%3A44.223638&endtime=2021-08-03+17%3A35%3A30.692350&page=2&pagesize=15
\`\`\`
:::
`,
      required: true,
      group: 'Pagination - Page-Based'
    },
    {
      name: 'pagination.page_based.pagenumber_field',
      label: 'Page Number Field',
      type: {
        name: 'string'
      },
      default: '',
      description: `The field name for the page number.
::: tip Example
In the URL sample below, the page size field is \`page\`:
\`\`\` text
https://lrtestapi.azurewebsites.net/countries/?starttime=2021-08-03+17%3A26%3A44.223638&endtime=2021-08-03+17%3A35%3A30.692350&page=2&pagesize=15
\`\`\`
:::
`,
      required: true,
      group: 'Pagination - Page-Based'
    },

    // Pagination - Limit and Offset

    {
      name: 'pagination.limit_offset.limit_field',
      label: 'Limit Field',
      type: {
        name: 'string'
      },
      default: '',
      description: `The field name to be used as the limit.
::: tip Example
In the command sample below, the limit field is \`limit\`:
\`\`\` text
$ curl https://api.box.com/2.0/folders/0/items?offset=0&limit=100 \\
 -H "authorization: Bearer ACCESS_TOKEN"
\`\`\`
:::
`,
      required: true,
      group: 'Pagination - Limit and Offset'
    },
    {
      name: 'pagination.limit_offset.limit_value',
      label: 'Limit Value',
      type: {
        name: 'number'
      },
      min: 1,
      max: 5000,
      default: '1000',
      description: `The total number of records to be returned in a single request.
::: tip Example
In the command sample below, the limit value is \`100\`:
\`\`\` text
$ curl https://api.box.com/2.0/folders/0/items?offset=0&limit=100 \\
 -H "authorization: Bearer ACCESS_TOKEN"
\`\`\`
:::
`,
      required: true,
      group: 'Pagination - Limit and Offset'
    },
    {
      name: 'pagination.limit_offset.offset_field',
      label: 'Offset Field',
      type: {
        name: 'string'
      },
      default: '',
      description: `The field name to be used as the offset.
::: tip Example
In the command sample below, the offset field is \`offset\`:
\`\`\` text
$ curl https://api.box.com/2.0/folders/0/items?offset=0&limit=100 \\
 -H "authorization: Bearer ACCESS_TOKEN"
\`\`\`
:::
`,
      required: true,
      group: 'Pagination - Limit and Offset'
    },

    // Date Range Filter

    {
      name: 'filter_type',
      label: 'Filter Type',
      type: {
        name: 'option'
      },
      options: [
        { value: 'afterstart', label: 'Date Range - After any specific date' },
        { value: 'startend', label: 'Date Range - Between start and end date' },
        { value: 'interval', label: 'Date Range - Within an interval' },
        { value: 'nofilter', label: 'No Filter' }
      ],
      default: 'nofilter',
      description: `If the API does support date / period / interval filters, then pick the right one from the list, otherwise choose \`No Filter\`.

#### **After any specific start date**

The \`after any specific start date\` filter takes a start value provided by the user and requests records from the server, fetching logs from after the specified start date.
The following is an example of the \`after any specific start date\` filter.
\`\`\` text
$ curl -v -X GET \\
 -H "Accept: application/json" \\
 -H "Content-Type: application/json" \\
 -H "Authorization: SSWS \${api_token}" \\
 "https://\${yourOktaDomain}/api/v1/logs?since=2017-10-01T00:00:00.000Z"
\`\`\`

#### **Between start and end date**

The \`between start and end date\` filter fetches the logs within the given range of start date and end date. Ensure the API supports this filter on the server end.
The following is an example request using the \`between start and end date\` filter.
\`\`\` text
https://api.amp.cisco.com/v1/audit?start_time=2021-09-15T09:28:58Z&limit=250&offset=0&end_time=2021-09-28T08:29:28Z
\`\`\`

#### **Within an interval**

Similar to the \`between start and end date\` filter, the \`within an interval\` filter fetches the logs between any specific start time and end time, with the only difference being the format in which the start and end date are sent. In this filter, the start and end dates are sent in a single string separated by a delimiter.
The following is an example of the \`within an interval\` filter.
\`\`\` text
https://tap-api-v2.proofpoint.com/v2/siem/messages/blocked?interval=2021-10-08T00:00:00.000Z/2021-10-08T01:00:00.000Z
\`\`\`

::: tip Hint
Once the right Date Range Filter has been selected, do configure its related section below:
- Date Range Filter - After any specific start date
- Date Range Filter - Between start and end date
- Date Range Filter - Within an interval
:::`,
      required: true,
      group: 'Date Range Filter'
    },
    {
      name: 'time_format',
      label: 'Time Format',
      type: {
        name: 'option'
      },
      options: [
        { value: '02 Jan 06 15:04 -0700', label: '02 Jan 06 15:04 -0700' },
        { value: '02 Jan 06 15:04 MST', label: '02 Jan 06 15:04 MST' },
        { value: '2006-01-02T15:04:05.999999999Z07:00', label: '2006-01-02T15:04:05.999999999Z07:00' },
        { value: '2006-01-02T15:04:05Z07:00', label: '2006-01-02T15:04:05Z07:00' },
        { value: 'Mon Jan 02 15:04:05 -0700 2006', label: 'Mon Jan 02 15:04:05 -0700 2006' },
        { value: 'Mon Jan _2 15:04:05 2006', label: 'Mon Jan _2 15:04:05 2006' },
        { value: 'Mon Jan _2 15:04:05 MST 2006', label: 'Mon Jan _2 15:04:05 MST 2006' },
        { value: 'Mon, 02 Jan 2006 15:04:05 -0700', label: 'Mon, 02 Jan 2006 15:04:05 -0700' },
        { value: 'Mon, 02 Jan 2006 15:04:05 MST', label: 'Mon, 02 Jan 2006 15:04:05 MST' },
        { value: 'Monday, 02-Jan-06 15:04:05 MST', label: 'Monday, 02-Jan-06 15:04:05 MST' },
        { value: 'UNIX_MILLISECONDS_TIMESTAMP', label: 'UNIX_MILLISECONDS_TIMESTAMP' },
        { value: 'UNIX_SECONDS_TIMESTAMP', label: 'UNIX_SECONDS_TIMESTAMP' }
      ],
      default: '2006-01-02T15:04:05Z07:00',
      description: `This refers to the date-time format that the API supports, i.e. RFC3339 or ISO8601.
Select the appropriate time format from the drop-down menu.`,
      required: true,
      group: 'Date Range Filter'
    },
    {
      name: 'filter.delay_time',
      label: 'Delay Time',
      type: {
        name: 'number'
      },
      suffix: {
        options: [
          { value: 's', label: 'Seconds' }
        ],
        default: 's'
      },
      min: 0,
      max: 3600,
      default: '0s',
      description: `Some APIs don't support exact real-time log fetching. In this case, add the delay in seconds that the API supports.
::: tip Example
For example, if the API supports a five seconds delay, enter \`5 Seconds\`.
:::`,
      required: true,
      group: 'Date Range Filter'
    },

    // Date Range Filter - After any specific start date

    {
      name: 'filter.after_start_filter.start_field',
      label: 'Start Field',
      type: {
        name: 'string'
      },
      default: '',
      description: `The field name used to send the start time in the request.
::: tip Example
In the command sample below, the start field is \`since\` (as per line 5):
\`\`\` text
$ curl -v -X GET \\
 -H "Accept: application/json" \\
 -H "Content-Type: application/json" \\
 -H "Authorization: SSWS \${api_token}" \\
 "https://\${yourOktaDomain}/api/v1/logs?since=2017-10-01T00:00:00.000Z"
\`\`\`
:::
`,
      required: true,
      group: 'Date Range Filter - After any specific start date'
    },
    {
      name: 'filter.after_start_filter.start_value',
      label: 'Start Value',
      type: {
        name: 'string'
      },
      default: '',
      description: `The start date value from which logs should be fetched from the server. 
::: danger
When giving the start date as back days, ensure the API supports that number of back days to fetch logs.
For example, if the start value is 7 days before the current date, then the API must support 7 day backlogs; otherwise, the beat will return an error.
:::

::: tip Example
In the command sample below, the start value is \`2017-10-01T00:00:00.000Z\` (as per line 5):
\`\`\` text
$ curl -v -X GET \\
 -H "Accept: application/json" \\
 -H "Content-Type: application/json" \\
 -H "Authorization: SSWS \${api_token}" \\
 "https://\${yourOktaDomain}/api/v1/logs?since=2017-10-01T00:00:00.000Z"
\`\`\`
:::
`,
      required: true,
      group: 'Date Range Filter - After any specific start date'
    },
    {
      name: 'filter.after_start_filter.response_date_field',
      label: 'Next Start Date Response Field',
      type: {
        name: 'string'
      },
      default: '',
      description: `This is the date field to parse from the response to fetch the next set of records.
::: danger
This is JSON path within the record, using the dotted notation.
See example below.
:::

::: tip Example
In the sample below, the next start date is \`data.date\` (branch \`data\` as per line 11 and leaf \`date\` as per line 15):
\`\`\`
{
  "version": "v1.2.0",
  "metadata": {
    "links": {
      "self": "https://api.amp.cisco.com/v1/events?limit=500&start_date=2021-09-21T00:00:00Z&offset=53000",
      "prev": "https://api.amp.cisco.com/v1/events?limit=500&start_date=2021-09-21T00:00:00Z&offset=52500",
      "next": "https://api.amp.cisco.com/v1/events?limit=500&start_date=2021-09-21T00:00:00Z&offset=53500"
    },
    "results": { ... }
  },
  "data" : [
    {
      "id": 163336102013548932156345045,
      "timestamp": 1633361020,
      "date": "2021-10-04T15:23:40+00:00",
      "event_type": "DFC Threat Detected",
      ...
    }
  ]
}
\`\`\`
:::
`,
      required: true,
      group: 'Date Range Filter - After any specific start date'
    },

    // Date Range Filter - Between start and end date

    {
      name: 'filter.start_and_end_filter.start_field',
      label: 'Start Field',
      type: {
        name: 'string'
      },
      default: '',
      description: `The field name used to send the start time in the request.
::: tip Example
In the URL sample below, the start field is \`start_time\`:
\`\`\` text
https://api.amp.cisco.com/v1/audit?start_time=2021-09-15T09:28:58Z&limit=250&offset=0&end_time=2021-09-28T08:29:28Z
\`\`\`
:::
`,
      required: true,
      group: 'Date Range Filter - Between start and end date'
    },
    {
      name: 'filter.start_and_end_filter.start_value',
      label: 'Start Value',
      type: {
        name: 'string'
      },
      default: '',
      description: `The start date value from which logs should be fetched from the server. 
::: danger
When giving the start date as back days, ensure the API supports that number of back days to fetch logs.
For example, if the start value is 7 days before the current date, then the API must support 7 day backlogs; otherwise, the beat will return an error.
:::

::: tip Example
In the URL sample below, the start value is \`2021-09-15T09:28:58Z\`:
\`\`\` text
https://api.amp.cisco.com/v1/audit?start_time=2021-09-15T09:28:58Z&limit=250&offset=0&end_time=2021-09-28T08:29:28Z
\`\`\`
:::
`,
      required: true,
      group: 'Date Range Filter - Between start and end date'
    },
    {
      name: 'filter.start_and_end_filter.end_field',
      label: 'End Field',
      type: {
        name: 'string'
      },
      default: '',
      description: `The field name to be used to send the end date in the request.
::: tip Example
In the URL sample below, the end field is \`end_time\`:
\`\`\` text
https://api.amp.cisco.com/v1/audit?start_time=2021-09-15T09:28:58Z&limit=250&offset=0&end_time=2021-09-28T08:29:28Z
\`\`\`
:::
`,
      required: true,
      group: 'Date Range Filter - Between start and end date'
    },
    {
      name: 'filter.start_and_end_filter.end_value',
      label: 'End Value',
      type: {
        name: 'string'
      },
      default: '',
      description: `The end date value until which logs should be fetched from the server.
::: danger
The end date value must be set according to the maximum interval that the API supports.
For example, if the API supports a maximum of one hour logs in a single API request and the start value is 2021-10-02T08:00:00Z, then the end value must be 2021-10-02T09:00:00Z, for a difference of one hour.
:::

::: tip Example
In the URL sample below, the end value is \`2021-09-28T08:29:28Z\`:
\`\`\` text
https://api.amp.cisco.com/v1/audit?start_time=2021-09-15T09:28:58Z&limit=250&offset=0&end_time=2021-09-28T08:29:28Z
\`\`\`
:::
`,
      required: true,
      group: 'Date Range Filter - Between start and end date'
    },

    // Date Range Filter - Within an interval

    {
      name: 'filter.interval_filter.interval_field',
      label: 'Interval field',
      type: {
        name: 'string'
      },
      default: '',
      description: `The field name in which the date and time are sent.
::: tip Example
In the URL sample below, the interval field is \`interval\`:
\`\`\` text
https://tap-api-v2.proofpoint.com/v2/siem/messages/blocked?interval=2021-10-08T00:00:00.000Z/2021-10-08T01:00:00.000Z
\`\`\`
:::
`,
      required: true,
      group: 'Date Range Filter - Within an interval'
    },
    {
      name: 'filter.interval_filter.interval_value',
      label: 'Interval Value',
      type: {
        name: 'string'
      },
      default: '',
      description: `Interval values contain the start time and end time values separated by delimiter, as supported by the API.
::: danger
When giving the start date as back days, ensure the API supports that number of back days to fetch logs.
For example, if the start value is 7 days before the current date, then the API must support 7 day backlogs; otherwise, the beat will return an error.

The end date value must be set according to the maximum interval that the API supports.
For example, if the API supports a maximum of one hour logs in a single API request and the start value is 2021-10-02T08:00:00Z, then the end value must be 2021-10-02T09:00:00Z, for a difference of one hour.
:::

::: tip Example
In the URL sample below, the interval value is \`2021-10-08T00:00:00.000Z/2021-10-08T01:00:00.000Z\`:
\`\`\` text
https://tap-api-v2.proofpoint.com/v2/siem/messages/blocked?interval=2021-10-08T00:00:00.000Z/2021-10-08T01:00:00.000Z
\`\`\`
:::
`,
      required: true,
      group: 'Date Range Filter - Within an interval'
    },
    {
      name: 'filter.interval_filter.split_char',
      label: 'Split Character',
      type: {
        name: 'string'
      },
      default: '',
      description: `The delimiter between the start and end time in the interval value.
::: tip Example
In the URL sample below, the split character is \`/\`:
\`\`\` text
https://tap-api-v2.proofpoint.com/v2/siem/messages/blocked?interval=2021-10-08T00:00:00.000Z/2021-10-08T01:00:00.000Z
\`\`\`
:::
`,
      required: true,
      group: 'Date Range Filter - Within an interval'
    },

    // Sorting

    {
      name: 'sorting_enabled',
      label: 'Enabled',
      type: {
        name: 'boolean'
      },
      default: false,
      description: `Does this API support sorting?
Sorting is an important feature for any API endpoint that returns a lot of data. When returning a list of users, your API users may want to sort by last modified date or by email.
To enable sorting, many APIs add a sort or sort_by URL parameter that can take a field name as the value. However, good API designs give the flexibility to specify ascending or descending order. Specifying the order requires encoding three components into a key/value pair.

The following are example formats for using the sorting feature:
\`\`\` text
GET /users?sort_by=asc(email)
  and
GET /users?sort_by=desc(email)
\`\`\`

\`\`\` text
GET /users?sort_by=+email
  and
GET /users?sort_by=-email
\`\`\`

\`\`\` text
GET /users?sort_by=email.asc
  and
GET /users?sort_by=email.desc
\`\`\`
`,
      required: true,
      group: 'Sorting Field'
    },
    {
      name: 'sorting.sorting_field',
      label: 'Sorting Field',
      type: {
        name: 'string'
      },
      description: `The field name that the API supports for sorting.
For example, in the URL below, the sorting field is \`sortOrder\`:
\`\`\` text
https://dev-7887806.okta.com/api/v1/logs?since=2021-09-01T18:29:00Z&until=2021-10-05T18:29:00Z&limit=1000&sortOrder=ASCENDING
\`\`\`
`,
      default: '',
      required: false,
      group: 'Sorting Field'
    },
    {
      name: 'sorting.sorting_value',
      label: 'Sorting Value',
      type: {
        name: 'string'
      },
      description: `The value used to determine sorting order.
For example, in the URL below, the sorting value is \`ASCENDING\`:
\`\`\` text
https://dev-7887806.okta.com/api/v1/logs?since=2021-09-01T18:29:00Z&until=2021-10-05T18:29:00Z&limit=1000&sortOrder=ASCENDING
\`\`\`
`,
      default: '',
      required: false,
      group: 'Sorting Field'
    },

    // Request Headers and Parameters

    {
      name: 'headers',
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
      group: 'Request Headers and Parameters'
    },
    {
      name: 'params',
      label: 'Request Parameters',
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
      description: `Optionally provide the Query Parameters supported by the API as Key:Value pairs.
::: tip Examples

| Key | Value |
| --- | ----- |
| limit | 100 |
:::
`,
      default: '',
      required: false,
      group: 'Request Headers and Parameters'
    },

    // Response Data Field

    {
      name: 'response_field_flag',
      label: 'Enabled',
      type: {
        name: 'option'
      },
      options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }],
      default: false,
      description: `Some servers send data records in a specific field in JSON response.
If this is the case with this API, select \`Yes\` and specify the field name below.`,
      required: true,
      group: 'Response Data Field'
    },
    {
      name: 'response_field',
      label: 'Response Data Field',
      type: {
        name: 'string'
      },
      description: `Refers to the field name that contains the data records.
> NOTE
> This is only necessary if the \`Enabled\` is \`Yes\`

For example, in the JSON below, the data field is \`logs\`:
\`\`\`
{
  "journal": "ABYR-USER",
  "version": "v1.0.3",
  "logs": [
    {
      "timestamp": 1632924862,
      "message": "User Logon",
      "host": "laptop01",
      "user": "Billy"
    },
    {
      "timestamp": 1632925741,
      "message": "User Logoff",
      "host": "laptop01",
      "user": "Billy"
    }
  ]
}
\`\`\`
`,
      default: '',
      required: false,
      group: 'Response Data Field'
    },

    // Polling Interval

    {
      name: 'period',
      label: 'Period',
      type: {
        name: 'number'
      },
      suffix: {
        options: [
          { value: 's', label: 'Seconds' }
        ],
        default: 's'
      },
      min: 1,
      max: 3600,
      default: '60s',
      description: `The period value defines the polling interval to fetch records from the server, in seconds.
If the API server has a request limit, set the period value accordingly to avoid the \`request limit error\` with error code \`429\`.

::: tip Examples
- If the API supports 1800 requests per 24 hours, then set the \`Period\` value to be \`60 Seconds\`
- If the API supports 5 requests per hour, then set the \`Period\` value to be \`720 Seconds\`
- If the API supports 1 request per day, then set the \`Period\` value to be \`86400 Seconds\`
:::`,
      required: true,
      group: 'Polling Interval'
    },

    // EZ Internal

    {
      name: 'beatIdentifier',
      label: 'Beat Identifier',
      type: {
        name: 'string'
      },
      default: '',
      description: `This is the identifier used by Generic Beat to name its separate instances.
> NOTE
> - It is limited to 12 characters in length.
> - It's concatenated with \`genericbeat_\` to produce the Fully Qualified Beat Name (\`fullyqualifiedbeatname\` aka \`fqbn\`) in the form of \`genericbeat_xxxxxxxxxxxx\`
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
