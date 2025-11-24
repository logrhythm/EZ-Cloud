## Step 5: Add Mapping Popup

### UI Changes Required:
1. Change the button label to "Add Operations"
2. Update button styling: blue background with black text

## Add Operation Popup

### Implementation Requirements:
Implement **only** the operations listed in the table below. Remove any operations not specified in this list.


### Operations Table

| Operation | Data Type | Description | Syntax Example | Arguments Description |
|-----------|-----------|-------------|----------------|----------------------|
| IsIP | String | Validates if a value is an IP address (IPv4/IPv6). | `"inputRule": "IsIP($.sourceIPAddress,true)"` | **Arg 1:** JSON path of selected field<br>**Arg 2:** Always `true` |
| Regex | String | Extracts a value using a regex pattern. | `"inputRule": "Regex($.text,pattern=(?<groupname>.*),groupname)"` | **Arg 1:** JSON path<br>**Arg 2:** User input - regular expression with group<br>**Arg 3:** User input - group name |
| SPLIT | String | Splits a string by a delimiter and returns a specific index. | `"inputRule": "SPLIT($.userIdentity.principalId,':',1)"` | **Arg 1:** JSON path of selected field<br>**Arg 2:** User input - delimiter character<br>**Arg 3:** User input - index of element to fetch |
| Concat | Array | Concatenates two or more string values. | `"inputRule": "Concat($.firstName,' ',$.lastName)"` | **Arg 1:** JSON path<br>**Arg 2:** User input - separator character<br>**Arg 3:** User input - JSON path |
| ConcatArray | Array | Joins array elements with a delimiter. | `"inputRule": "ConcatArray($.recipients[*],',')"` | **Arg 1:** JSON path of array attribute<br>**Arg 2:** User input - delimiter character |
| ToString | All Types | Converts a value to a String. | `"inputRule": "ToString($.numericField)"` | **Arg 1:** JSON path |
| EpochSectoDateTime | Date/Time | Converts Unix timestamp (seconds) to DateTime. | `"inputRule": "EpochSectoDateTime($.timestamp)"` | **Arg 1:** JSON path |
| EpochMilliSectoDateTime | Date/Time | Converts Unix timestamp (milliseconds) to DateTime. | `"inputRule": "EpochMilliSectoDateTime($.timestamp)"` | **Arg 1:** JSON path |
| EpochMicroSectoDateTime | Date/Time | Converts Unix timestamp (microseconds) to DateTime. | `"inputRule": "EpochMicroSectoDateTime($.timestamp)"` | **Arg 1:** JSON path |
| LocalDateTime | Date/Time | Gets the local date-time. | `"inputRule": "LocalDateTime()"` | **No arguments** |
| Add | Number/Decimal | Adds a number to a JSON value. | `"inputRule": "Add($.num,1000)"` | **Arg 1:** JSON path<br>**Arg 2:** User input - number to add |
| Subtract | Number/Decimal | Subtracts a number from a JSON value. | `"inputRule": "Subtract($.num,10)"` | **Arg 1:** JSON path<br>**Arg 2:** User input - number to subtract |
| Multiply | Number/Decimal | Multiplies a JSON value by a number. | `"inputRule": "Multiply($.num,25)"` | **Arg 1:** JSON path<br>**Arg 2:** User input - number to multiply |
| Divide | Number/Decimal | Divides a JSON value by a number. | `"inputRule": "Divide($.bytes,1024)"` | **Arg 1:** JSON path<br>**Arg 2:** User input - number to divide |

### Styling Requirements:
- All dropdowns must match the styling used in Step 4
- Maintain consistent UI/UX patterns throughout the operation selection and configuration  

