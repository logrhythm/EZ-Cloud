/**
 * Operations and Formatters Constants
 * Defines all operation types, patterns, and presets for the LogRhythm JSON Policy Builder
 *
 * @module constants/operations
 */

/**
 * Supported operation types
 * @enum {string}
 */
export const OPERATION_TYPES = {
  NONE: null,
  REGEX: 'REGEX',
  LOOKUP: 'LookUp',
  LOOKUP_STARTS_WITH: 'LookUpStartsWith',
  PREFIX: 'PREFIX',
  // New operations
  ISIP: 'IsIP',
  SPLIT: 'SPLIT',
  CONCAT: 'Concat',
  CONCATARRAY: 'ConcatArray',
  TOSTRING: 'ToString',
  EPOCHSECS_TO_DATETIME: 'EpochSectoDateTime',
  EPOCHMILLIS_TO_DATETIME: 'EpochMilliSectoDateTime',
  EPOCHMICROS_TO_DATETIME: 'EpochMicroSectoDateTime',
  CONVERT_DATETIME: 'convertdatetime',
  ADD: 'Add',
  SUBTRACT: 'Subtract',
  MULTIPLY: 'Multiply',
  DIVIDE: 'Divide'
}

/**
 * Common regex patterns for extraction
 * @type {Array<Object>}
 */
export const COMMON_REGEX_PATTERNS = [
  {
    name: 'IP Address (IPv4)',
    pattern: '/(?<ipAddress>\\d+\\.\\d+\\.\\d+\\.\\d+)/',
    captureGroup: 'ipAddress',
    example: 'Extracts "192.168.1.1" from "Connection from 192.168.1.1"',
    description: 'IPv4 address in dotted-decimal notation',
    sampleValue: 'Connection from 192.168.1.1 port 54321'
  },
  {
    name: 'IPv6 Address',
    pattern: '/(?<ipv6Address>[0-9a-fA-F:]+)/',
    captureGroup: 'ipv6Address',
    example: 'Extracts "2001:0db8:85a3::8a2e:0370:7334"',
    description: 'IPv6 address in colon-hexadecimal notation',
    sampleValue: 'IPv6 address: 2001:0db8:85a3::8a2e:0370:7334'
  },
  {
    name: 'Email Address',
    pattern: '/(?<email>[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2}[a-zA-Z]*)/',
    captureGroup: 'email',
    example: 'Extracts "user@example.com" from text',
    description: 'Standard email address format',
    sampleValue: 'Contact support at user.name@example.com for help'
  },
  {
    name: 'URL',
    pattern: '/(?<url>https?:\\/\\/[^\\s]+)/',
    captureGroup: 'url',
    example: 'Extracts URLs starting with http:// or https://',
    description: 'HTTP/HTTPS URL',
    sampleValue: 'Visit our API at https://api.example.com/v1/users for more info'
  },
  {
    name: 'MAC Address',
    pattern: '/(?<macAddress>[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2})/',
    captureGroup: 'macAddress',
    example: 'Extracts MAC address like "00:1A:2B:3C:4D:5E"',
    description: 'MAC address in colon notation',
    sampleValue: 'Device MAC address is 00:1A:2B:3C:4D:5E on network'
  },
  {
    name: 'Hostname/Domain',
    pattern: '/(?<hostname>[a-zA-Z0-9\\-]+\\.[a-zA-Z0-9.\\-]+)/',
    captureGroup: 'hostname',
    example: 'Extracts "server.example.com"',
    description: 'Fully qualified domain name',
    sampleValue: 'Connecting to server.example.com on port 443'
  },
  {
    name: 'Port Number',
    pattern: '/(?<port>\\b[0-9]{1}[0-9]{0}[0-9]{0}[0-9]{0}[0-9]{0}\\b)/',
    captureGroup: 'port',
    example: 'Extracts "8080" from text or "192.168.1.1:8080"',
    description: 'Port number (1-65535)',
    sampleValue: 'Server listening on port 8080'
  },
  {
    name: 'Windows File Path',
    pattern: '/(?<windowsPath>[A-Za-z]:\\\\[^\\s]+)/',
    captureGroup: 'windowsPath',
    example: 'Extracts "C:\\\\Users\\\\Admin\\\\file.txt"',
    description: 'Windows absolute file path',
    sampleValue: 'File saved to C:\\Users\\Admin\\Documents\\report.pdf successfully'
  },
  {
    name: 'Linux File Path',
    pattern: '/(?<linuxPath>\\/[^\\s]+)/',
    captureGroup: 'linuxPath',
    example: 'Extracts "/var/log/syslog"',
    description: 'Linux absolute file path',
    sampleValue: 'Reading logs from /var/log/application/app.log'
  },
  {
    name: 'Username',
    pattern: '/user[:\\s]+(?<username>\\w+)/',
    captureGroup: 'username',
    example: 'Extracts username from "user: admin" or "user admin"',
    description: 'Username after "user:" or "user "',
    sampleValue: 'Login attempt from user: admin_user at 10:30 AM'
  },
  {
    name: 'UUID',
    pattern: '/(?<uuid>[0-9a-f]{8}\\-[0-9a-f]{4}\\-[0-9a-f]{4}\\-[0-9a-f]{4}\\-[0-9a-f]{12})/',
    captureGroup: 'uuid',
    example: 'Extracts "550e8400-e29b-41d4-a716-446655440000"',
    description: 'UUID/GUID in standard format',
    sampleValue: 'Transaction ID: 550e8400-e29b-41d4-a716-446655440000'
  },
  {
    name: 'Error/Exception',
    pattern: '/(?<errorType>Error|Exception|Fault):\\s*(?<errorMessage>.+)/',
    captureGroup: 'errorMessage',
    example: 'Extracts error message after "Error:" "Exception:" or "Fault:"',
    description: 'Error message extraction',
    sampleValue: 'Error: File not found at specified path'
  }
]

/**
 * Common DateTime format patterns
 * @type {Array<Object>}
 */
export const DATETIME_FORMAT_PRESETS = [
  {
    name: 'ISO 8601 with Timezone',
    pattern: 'yyyy-MM-ddTHH:mm:ss.fffK',
    example: '2023-11-19T14:30:00.123+00:00',
    description: 'ISO 8601 format with fractional seconds and timezone'
  },
  {
    name: 'ISO 8601 UTC',
    pattern: 'yyyy-MM-ddTHH:mm:ssZ',
    example: '2023-11-19T14:30:00Z',
    description: 'ISO 8601 format with UTC timezone indicator'
  },
  {
    name: 'RFC 3339',
    pattern: 'yyyy-MM-ddTHH:mm:ss.SSSZ',
    example: '2023-11-19T14:30:00.123Z',
    description: 'RFC 3339 timestamp format'
  },
  {
    name: 'LogRhythm Default',
    pattern: 'yyyy-MM-dd HH:mm:ss.SSS',
    example: '2023-11-19 14:30:00.123',
    description: 'LogRhythm standard format with milliseconds'
  },
  {
    name: 'US Format',
    pattern: 'MM/dd/yyyy HH:mm:ss',
    example: '11/19/2023 14:30:00',
    description: 'US date format with time'
  },
  {
    name: 'EU Format',
    pattern: 'dd/MM/yyyy HH:mm:ss',
    example: '19/11/2023 14:30:00',
    description: 'European date format with time'
  },
  {
    name: 'Date Only (ISO)',
    pattern: 'yyyy-MM-dd',
    example: '2023-11-19',
    description: 'ISO date format without time'
  },
  {
    name: 'Date Only (US)',
    pattern: 'MM/dd/yyyy',
    example: '11/19/2023',
    description: 'US date format without time'
  },
  {
    name: 'Time Only (24-hour)',
    pattern: 'HH:mm:ss',
    example: '14:30:00',
    description: '24-hour time format'
  },
  {
    name: 'Time Only (12-hour)',
    pattern: 'hh:mm:ss tt',
    example: '02:30:00 PM',
    description: '12-hour time format with AM/PM'
  },
  {
    name: 'Unix Timestamp',
    pattern: '',
    example: '1700405400',
    description: 'Unix epoch timestamp (leave format blank)'
  }
]

/**
 * DateTime format pattern components
 * @type {Object}
 */
export const FORMAT_COMPONENTS = {
  year: [
    { label: 'yyyy (4-digit)', value: 'yyyy', example: '2023', description: 'Four-digit year' },
    { label: 'yy (2-digit)', value: 'yy', example: '23', description: 'Two-digit year' }
  ],
  month: [
    { label: 'MM (01-12)', value: 'MM', example: '11', description: 'Month with leading zero' },
    { label: 'M (1-12)', value: 'M', example: '11', description: 'Month without leading zero' },
    { label: 'MMM (short)', value: 'MMM', example: 'Nov', description: 'Abbreviated month name' },
    { label: 'MMMM (full)', value: 'MMMM', example: 'November', description: 'Full month name' }
  ],
  day: [
    { label: 'dd (01-31)', value: 'dd', example: '19', description: 'Day with leading zero' },
    { label: 'd (1-31)', value: 'd', example: '19', description: 'Day without leading zero' }
  ],
  hour: [
    { label: 'HH (00-23)', value: 'HH', example: '14', description: '24-hour format with leading zero' },
    { label: 'H (0-23)', value: 'H', example: '14', description: '24-hour format without leading zero' },
    { label: 'hh (01-12)', value: 'hh', example: '02', description: '12-hour format with leading zero' },
    { label: 'h (1-12)', value: 'h', example: '2', description: '12-hour format without leading zero' }
  ],
  minute: [
    { label: 'mm (00-59)', value: 'mm', example: '30', description: 'Minute with leading zero' },
    { label: 'm (0-59)', value: 'm', example: '30', description: 'Minute without leading zero' }
  ],
  second: [
    { label: 'ss (00-59)', value: 'ss', example: '00', description: 'Second with leading zero' },
    { label: 's (0-59)', value: 's', example: '0', description: 'Second without leading zero' }
  ],
  millisecond: [
    { label: 'SSS (000-999)', value: 'SSS', example: '123', description: 'Milliseconds (3 digits)' },
    { label: 'fff (fractional)', value: 'fff', example: '123', description: 'Fractional seconds' },
    { label: 'S (0-9)', value: 'S', example: '1', description: 'Tenths of a second' }
  ],
  timezone: [
    { label: 'K (+00:00)', value: 'K', example: '+00:00', description: 'Timezone offset' },
    { label: 'Z (UTC)', value: 'Z', example: 'Z', description: 'UTC timezone indicator' },
    { label: 'zzz (name)', value: 'zzz', example: 'PST', description: 'Timezone abbreviation' },
    { label: 'None', value: '', example: '', description: 'No timezone' }
  ],
  ampm: [
    { label: 'tt (AM/PM)', value: 'tt', example: 'PM', description: 'AM/PM designator' },
    { label: 't (A/P)', value: 't', example: 'P', description: 'Single character AM/PM' }
  ]
}

/**
 * Available lookup tables (can be extended with backend data)
 * @type {Array<Object>}
 */
export const LOOKUP_TABLES = [
  {
    name: 'HTTP_STATUS_CODES',
    label: 'HTTP Status Codes',
    description: 'HTTP status codes and their descriptions',
    example: '200 → OK, 404 → Not Found'
  },
  {
    name: 'WINDOWS_EVENT_IDS',
    label: 'Windows Event IDs',
    description: 'Windows event ID mappings',
    example: '4624 → Successful Logon'
  },
  {
    name: 'SYSLOG_SEVERITY',
    label: 'Syslog Severity Levels',
    description: 'Syslog severity level mappings',
    example: '0 → Emergency, 7 → Debug'
  },
  {
    name: 'USER_AGENTS',
    label: 'User Agent Strings',
    description: 'Common user agent string patterns',
    example: 'Mozilla/5.0 → Browser identification'
  },
  {
    name: 'TCP_PORTS',
    label: 'TCP Port Numbers',
    description: 'Common TCP port number to service mappings',
    example: '80 → HTTP, 443 → HTTPS'
  },
  {
    name: 'ERROR_CODES',
    label: 'Error Codes',
    description: 'Application error code mappings',
    example: 'E001 → Connection Error'
  }
]

/**
 * Operation type metadata
 * @type {Object}
 */
export const OPERATION_METADATA = {
  [OPERATION_TYPES.REGEX]: {
    label: 'REGEX - Extract using regular expression',
    icon: 'code',
    description: 'Extract data using pattern matching with regular expressions',
    example: 'Extract IP from "Connection from 192.168.1.1"',
    color: '#2196f3',
    requiresParameters: ['pattern', 'captureGroup'],
    category: 'String'
  },
  [OPERATION_TYPES.LOOKUP]: {
    label: 'LookUp - Lookup value from table',
    icon: 'table_chart',
    description: 'Look up and transform values using predefined tables',
    example: 'Convert status code 200 to "OK"',
    color: '#4caf50',
    requiresParameters: ['tableName'],
    category: 'String'
  },
  [OPERATION_TYPES.LOOKUP_STARTS_WITH]: {
    label: 'LookUpStartsWith - Prefix-based lookup',
    icon: 'search',
    description: 'Look up values using prefix matching',
    example: 'Find entries starting with "ERR"',
    color: '#ff9800',
    requiresParameters: ['tableName'],
    category: 'String'
  },
  [OPERATION_TYPES.PREFIX]: {
    label: 'PREFIX - Add prefix to value',
    icon: 'text_fields',
    description: 'Add a static prefix to field values',
    example: 'Add "SERVER-" to ID → "SERVER-12345"',
    color: '#9c27b0',
    requiresParameters: ['prefix'],
    category: 'String'
  },
  // String Operations
  [OPERATION_TYPES.ISIP]: {
    label: 'IsIP - Validate IP address',
    icon: 'lan',
    description: 'Validates if a value is an IP address',
    example: 'Check if "192.168.1.1" is a valid IP address',
    color: '#2196f3',
    requiresParameters: [],
    category: 'String'
  },
  [OPERATION_TYPES.SPLIT]: {
    label: 'SPLIT - Split string by delimiter',
    icon: 'call_split',
    description: 'Splits a string by a delimiter and returns a specific index',
    example: 'Split "key=value" by "=" and get index 1 → "value"',
    color: '#2196f3',
    requiresParameters: ['delimiter', 'index'],
    category: 'String'
  },
  [OPERATION_TYPES.CONCAT]: {
    label: 'Concat - Join string values',
    icon: 'add_link',
    description: 'Concatenates two or more string values',
    example: 'Join "Hello" + " " + "World" → "Hello World"',
    color: '#ff9800',
    requiresParameters: ['values'],
    category: 'String'
  },
  // Array Operations
  [OPERATION_TYPES.CONCATARRAY]: {
    label: 'ConcatArray - Join array elements',
    icon: 'merge_type',
    description: 'Joins array elements with a delimiter',
    example: 'Join ["a", "b", "c"] with "," → "a,b,c"',
    color: '#ff9800',
    requiresParameters: ['delimiter'],
    category: 'Array'
  },
  // Type Conversion
  [OPERATION_TYPES.TOSTRING]: {
    label: 'ToString - Convert to String',
    icon: 'text_format',
    description: 'Converts a value to a String',
    example: 'Convert 123 to "123"',
    color: '#9c27b0',
    requiresParameters: [],
    category: 'String'
  },
  // Date/Time Operations
  [OPERATION_TYPES.EPOCHSECS_TO_DATETIME]: {
    label: 'Epoch Seconds to DateTime - Convert Unix seconds',
    icon: 'schedule',
    description: 'Converts Unix timestamp (seconds) to DateTime',
    example: 'Convert 1634567890 to "2021-10-18 15:04:50"',
    color: '#ff5722',
    requiresParameters: ['format'],
    category: 'Date/Time'
  },
  [OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME]: {
    label: 'Epoch MilliSeconds to DateTime - Convert Unix milliseconds',
    icon: 'schedule',
    description: 'Converts Unix timestamp (milliseconds) to DateTime',
    example: 'Convert 1634567890000 to "2021-10-18 15:04:50"',
    color: '#ff5722',
    requiresParameters: ['format'],
    category: 'Date/Time'
  },
  [OPERATION_TYPES.EPOCHMICROS_TO_DATETIME]: {
    label: 'Epoch MicroSeconds to DateTime - Convert Unix microseconds',
    icon: 'schedule',
    description: 'Converts Unix timestamp (microseconds) to DateTime',
    example: 'Convert 1634567890000000 to "2021-10-18 15:04:50"',
    color: '#ff5722',
    requiresParameters: ['format'],
    category: 'Date/Time'
  },
  [OPERATION_TYPES.CONVERT_DATETIME]: {
    label: 'Convert To DateTime Format - Convert to date-time from string',
    icon: 'today',
    description: 'Converts to date-time from string',
    example: '"2023-11-20T10:30:45Z" → 2023-11-20 10:30:45',
    color: '#ff5722',
    requiresParameters: [],
    category: 'Date/Time'
  },
  // Number Operations
  [OPERATION_TYPES.ADD]: {
    label: 'Add - Add a number',
    icon: 'add',
    description: 'Adds a number to a JSON value',
    example: '100 + 50 → 150',
    color: '#4caf50',
    requiresParameters: ['value'],
    category: 'Number/Decimal'
  },
  [OPERATION_TYPES.SUBTRACT]: {
    label: 'Subtract - Subtract a number',
    icon: 'remove',
    description: 'Subtracts a number from a JSON value',
    example: '100 - 50 → 50',
    color: '#4caf50',
    requiresParameters: ['value'],
    category: 'Number/Decimal'
  },
  [OPERATION_TYPES.MULTIPLY]: {
    label: 'Multiply - Multiply by a number',
    icon: 'close',
    description: 'Multiplies a JSON value by a number',
    example: '100 * 2 → 200',
    color: '#4caf50',
    requiresParameters: ['value'],
    category: 'Number/Decimal'
  },
  [OPERATION_TYPES.DIVIDE]: {
    label: 'Divide - Divide by a number',
    icon: 'unfold_less',
    description: 'Divides a JSON value by a number',
    example: '100 / 2 → 50',
    color: '#4caf50',
    requiresParameters: ['value'],
    category: 'Number/Decimal'
  }
}

/**
 * Sample values for operation testing
 * @type {Object}
 */
export const SAMPLE_TEST_VALUES = {
  ip_address: '192.168.1.100',
  log_message: 'Error: Connection from IP: 192.168.1.100 failed',
  email: 'user@example.com',
  url: 'https://example.com/api/v1/users',
  mac_address: '00:1A:2B:3C:4D:5E',
  hostname: 'server.example.com',
  file_path_windows: 'C:\\Users\\Admin\\Documents\\file.txt',
  file_path_linux: '/var/log/syslog',
  status_code: '200',
  error_code: 'E001',
  username: 'admin',
  timestamp: '2023-11-19T14:30:00.123Z',
  port: '8080',
  uuid: '550e8400-e29b-41d4-a716-446655440000'
}

export default {
  OPERATION_TYPES,
  COMMON_REGEX_PATTERNS,
  DATETIME_FORMAT_PRESETS,
  FORMAT_COMPONENTS,
  LOOKUP_TABLES,
  OPERATION_METADATA,
  SAMPLE_TEST_VALUES
}
