import { Step1Validator, ValidationUtils } from '../src/services/wizard/validationService.js'

const rawPolicy = `{
  //done
  "name": "duoadmin",
  "filter": "@.@metadata.beat == 'duobeat'",
  "schemaRule": {
    "fanout": {
      "inputField": null
    }
  },
  "transforms": [
    {
      "inputRule": "$.@metadata.beat",
      "LRSchemaField": "beatname",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null
    },
    {
      "inputRule": "$.@metadata.beat",
      "LRSchemaField": "device_type",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null
    },
    {

      "inputRule": "$.fullyqualifiedbeatname",
      "LRSchemaField": "fullyqualifiedbeatname",
      "type": "String",
      "default": null,
      "alternativeFields": [ "$.@metadata.beat" ],
      "format": null
    },
    {
      "inputRule": "$.response.action",
      "LRSchemaField": "tag1",
      "type": "string",
      "default": null,
      "alternativeFields": [ "$.response.result", "$.response.type" ],
      "format": null
    },
    {
      "inputRule": "$.response.action",
      "LRSchemaField": "action",
      "type": "string",
      "default": null,
      "alternativeFields": [ "$.response.event_type", "$.response.context" ],
      "format": null
    },
    {
      "inputRule": "$.response.description",
      "LRSchemaField": "subject",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null
    },
    {
      "inputRule": "$.response.object",
      "LRSchemaField": "account",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null
    },
    {
      "inputRule": "$.response.username",
      "LRSchemaField": "login",
      "type": "string",
      "default": null,
      "alternativeFields": [ "$.response.user.name" ],
      "format": null
    },
    {
      "inputRule": "$.response.result",
      "LRSchemaField": "result",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null
    },
    {
      "inputRule": "$.response.access_device.hostname",
      "LRSchemaField": "sname",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null,
      "condition": null
    },
    {
      "inputRule": "$.response.access_device.ip",
      "LRSchemaField": "sip",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null,
      "condition": null
    },
    {
      "inputRule": "$.response.auth_device.ip",
      "LRSchemaField": "dip",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null,
      "condition": null
    },
    {
      "inputRule": "$.response.auth_device.name",
      "LRSchemaField": "dname",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null,
      "condition": null
    },
    {
      "inputRule": "$.response.reason",
      "LRSchemaField": "reason",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null,
      "condition": null
    },
    {
      "inputRule": "$.response.application.name",
      "LRSchemaField": "object",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null,
      "condition": null
    },
    {
      "inputRule": "$.response.phone",
      "LRSchemaField": "sender",
      "type": "string",
      "default": null,
      "alternativeFields": ["$.response.email"],
      "format": null,
      "condition": null
    },
    {
      "inputRule": "$.response.user.groups[0]",
      "LRSchemaField": "group",
      "type": "string",
      "default": null,
      "alternativeFields": null,
      "format": null,
      "condition": null
    },
    {
      "inputRule": "$.response.isotimestamp",
      "LRSchemaField": "normal_msg_date",
      "type": "datetime",
      "default": null,
      "alternativeFields": [ "$.@timestamp" ],
      "format": "yyyy-MM-ddTHH:mm:ss.fffK",
      "condition": null
    }

  ]
}`

async function runTest () {
  try {
    const cleaned = Step1Validator.stripCommentsPreserveStrings ? Step1Validator.stripCommentsPreserveStrings(rawPolicy) : rawPolicy
    const jsonText = Step1Validator.extractJsonFromText(cleaned)
    if (!jsonText) {
      console.error('ERROR: Could not extract JSON from policy text')
      process.exitCode = 2
      return
    }

    const parsed = JSON.parse(jsonText)
    console.log('Parsed JSON object keys:', Object.keys(parsed))

    const structureResult = Step1Validator.validatePolicyStructure(parsed)

    const all = structureResult.getAllMessages()
    if (all.length === 0) {
      console.log('No validation messages. Structure appears valid.')
    } else {
      console.log('Validation messages:')
      all.forEach(m => console.log(` - [${m.severity}] ${m.field}: ${m.message}`))
    }

    if (!structureResult.isValid) {
      console.error('Policy structure is INVALID')
      process.exitCode = 1
    } else {
      console.log('Policy structure is valid (no errors).')
    }
  } catch (err) {
    console.error('Test failed with error:', err)
    process.exitCode = 3
  }
}

runTest()
