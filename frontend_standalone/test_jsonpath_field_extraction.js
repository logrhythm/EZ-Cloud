/**
 * Test script to verify JSON-to-String field extraction in FilterRuleService
 * This tests the fix for the field dropdown population issue
 */

const { FilterRuleService } = require('./src/services/wizard/filterRuleService')

// Sample test data with stringified JSON
const testData = [
  {
    id: 1,
    name: 'Record 1',
    payload: JSON.stringify({
      user: {
        username: 'john_doe',
        email: 'john@example.com',
        age: 30
      },
      metadata: {
        timestamp: '2024-01-01T00:00:00Z',
        source: 'api'
      }
    })
  },
  {
    id: 2,
    name: 'Record 2',
    payload: JSON.stringify({
      user: {
        username: 'jane_smith',
        email: 'jane@example.com',
        age: 25
      },
      metadata: {
        timestamp: '2024-01-02T00:00:00Z',
        source: 'web'
      }
    })
  },
  {
    id: 3,
    name: 'Record 3',
    payload: JSON.stringify({
      user: {
        username: 'bob_jones',
        email: 'bob@example.com',
        age: 35
      },
      metadata: {
        timestamp: '2024-01-03T00:00:00Z',
        source: 'mobile'
      }
    })
  }
]

// Mock data structure (simplified)
const mockDataStructure = {
  path: '$',
  type: 'array',
  children: [
    {
      path: '$[0]',
      type: 'object',
      children: [
        { path: '$[0].id', type: 'number', key: 'id' },
        { path: '$[0].name', type: 'string', key: 'name' },
        { path: '$[0].payload', type: 'string', key: 'payload' }
      ]
    }
  ]
}

// Parsed stringified JSON fields
const parsedStringifiedFields = {
  payload: JSON.parse(testData[0].payload)
}

console.log('╔════════════════════════════════════════════════════════════════════════')
console.log('║ Testing JSON-to-String Field Extraction')
console.log('╠════════════════════════════════════════════════════════════════════════')
console.log('║ Test Data Records:', testData.length)
console.log('║ JSON-to-String Fields:', ['payload'])
console.log('╚════════════════════════════════════════════════════════════════════════')

// Test field extraction with JSON-to-String fields
const options = {
  jsonToStringFields: ['payload'],
  parsedStringifiedFields: parsedStringifiedFields
}

console.log('\n▶ Calling FilterRuleService.extractFieldCandidates()...\n')

const fields = FilterRuleService.extractFieldCandidates(
  testData,
  mockDataStructure,
  options
)

console.log('\n╔════════════════════════════════════════════════════════════════════════')
console.log('║ RESULTS')
console.log('╠════════════════════════════════════════════════════════════════════════')
console.log('║ Total fields extracted:', fields.length)
console.log('╠════════════════════════════════════════════════════════════════════════')

// Filter to show only fields from JSON strings
const jsonStringFields = fields.filter(f => f.isFromJsonString)

console.log('║ Fields from JSON strings:', jsonStringFields.length)
console.log('╠════════════════════════════════════════════════════════════════════════')
console.log('║ Field Details:')
console.log('╠════════════════════════════════════════════════════════════════════════')

jsonStringFields.forEach((field, index) => {
  console.log(`║ [${index + 1}] ${field.path}`)
  console.log(`║     Type: ${field.type}`)
  console.log(`║     Label: ${field.label}`)
  console.log(`║     Sample Values (${field.sampleValues.length}):`, field.sampleValues)
  console.log('║')
})

console.log('╚════════════════════════════════════════════════════════════════════════')

// Verify expected fields are present
console.log('\n╔════════════════════════════════════════════════════════════════════════')
console.log('║ VALIDATION')
console.log('╠════════════════════════════════════════════════════════════════════════')

const expectedFields = [
  'payload.user.username',
  'payload.user.email',
  'payload.user.age',
  'payload.metadata.timestamp',
  'payload.metadata.source'
]

let allFound = true
expectedFields.forEach(expectedPath => {
  const found = fields.some(f => f.path === expectedPath)
  console.log(`║ ${found ? '✓' : '✗'} ${expectedPath}`)
  if (!found) allFound = false
})

console.log('╠════════════════════════════════════════════════════════════════════════')

// Verify sample values are correct
const usernameField = fields.find(f => f.path === 'payload.user.username')
if (usernameField) {
  const expectedUsernames = ['john_doe', 'jane_smith', 'bob_jones']
  const hasAllUsernames = expectedUsernames.every(u => usernameField.sampleValues.includes(u))

  console.log(`║ Sample values for payload.user.username: ${hasAllUsernames ? '✓ CORRECT' : '✗ INCORRECT'}`)
  console.log(`║   Expected: ${expectedUsernames.join(', ')}`)
  console.log(`║   Got: ${usernameField.sampleValues.join(', ')}`)
} else {
  console.log('║ ✗ payload.user.username field not found')
  allFound = false
}

console.log('╠════════════════════════════════════════════════════════════════════════')
console.log(`║ OVERALL RESULT: ${allFound ? '✓ PASS' : '✗ FAIL'}`)
console.log('╚════════════════════════════════════════════════════════════════════════')

process.exit(allFound ? 0 : 1)
