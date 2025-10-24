/**
 * Tests for DataProcessingService
 */

import { DataProcessor } from './dataProcessingService'

// Sample test data
const sampleJsonObject = {
  name: 'LogRhythm Event',
  timestamp: '2025-10-24T12:34:56Z',
  severity: 5,
  metadata: {
    source: {
      ip: '192.168.1.1',
      hostname: 'server01.example.com'
    },
    destination: {
      ip: '10.0.0.1',
      hostname: 'db.internal'
    }
  },
  tags: ['security', 'network', 'alert'],
  details: {
    message: 'Failed login attempt',
    attempts: 3,
    user: 'admin',
    stringifiedDetails: '{"location": "us-east", "device": "mobile", "browser": "chrome"}'
  }
}

const sampleJsonArray = [
  {
    id: '001',
    name: 'Event 1',
    value: 100
  },
  {
    id: '002',
    name: 'Event 2',
    value: 200
  },
  {
    id: '003',
    name: 'Event 3',
    value: 300
  }
]

const sampleMultipleJson = `{"id": "001", "name": "Event 1", "value": 100}
{"id": "002", "name": "Event 2", "value": 200}
{"id": "003", "name": "Event 3", "value": 300}`

const invalidJson = '{ This is not valid JSON }'

// Helper function to run tests
async function runTests () {
  console.log('Running DataProcessingService tests...')
  let passedTests = 0
  let failedTests = 0

  // Test function
  async function testCase (name, testFn) {
    try {
      await testFn()
      console.log(`✓ PASS: ${name}`)
      passedTests++
    } catch (error) {
      console.error(`✗ FAIL: ${name}`)
      console.error(`    ${error.message}`)
      failedTests++
    }
  }

  // Test processSampleData with single object
  await testCase('processSampleData handles single JSON object', async () => {
    const result = await DataProcessor.processSampleData(JSON.stringify(sampleJsonObject), 'manual')

    if (!result.validationResult.isValid) {
      throw new Error('JSON should be valid')
    }

    if (!result.parsedData || typeof result.parsedData !== 'object') {
      throw new Error('parsedData should be an object')
    }

    if (!result.dataStructure || result.dataStructure.type !== 'object') {
      throw new Error('dataStructure should be an object type')
    }

    if (result.dataStats.recordCount !== 1) {
      throw new Error(`Expected recordCount to be 1, got ${result.dataStats.recordCount}`)
    }

    // Structure should include the original fields
    if (!result.dataStructure.children.some(child => child.key === 'metadata')) {
      throw new Error('Structure should contain "metadata" field')
    }
  })

  // Test processSampleData with array
  await testCase('processSampleData handles JSON array', async () => {
    const result = await DataProcessor.processSampleData(JSON.stringify(sampleJsonArray), 'manual')

    if (!result.validationResult.isValid) {
      throw new Error('JSON should be valid')
    }

    if (!Array.isArray(result.parsedData)) {
      throw new Error('parsedData should be an array')
    }

    if (result.dataStats.recordCount !== 3) {
      throw new Error(`Expected recordCount to be 3, got ${result.dataStats.recordCount}`)
    }
  })

  // Test processSampleData with multiple JSON objects
  await testCase('processSampleData handles multiple JSON objects', async () => {
    const result = await DataProcessor.processSampleData(sampleMultipleJson, 'multiple')

    if (!result.validationResult.isValid) {
      throw new Error('JSON should be valid')
    }

    if (!Array.isArray(result.parsedData)) {
      throw new Error('parsedData should be an array')
    }

    if (result.parsedData.length !== 3) {
      throw new Error(`Expected 3 JSON objects, got ${result.parsedData.length}`)
    }
  })

  // Test invalid JSON handling
  await testCase('processSampleData handles invalid JSON', async () => {
    const result = await DataProcessor.processSampleData(invalidJson, 'manual')

    if (result.validationResult.isValid) {
      throw new Error('Invalid JSON should not validate as valid')
    }

    if (result.validationResult.errors.length === 0) {
      throw new Error('Should report validation errors')
    }
  })

  // Test stringified JSON detection
  await testCase('findStringifiedJsonFields detects stringified JSON', () => {
    const jsonFields = DataProcessor.findStringifiedJsonFields(sampleJsonObject)

    // Should detect the stringifiedDetails field
    if (!jsonFields.includes('$.details.stringifiedDetails')) {
      throw new Error('Should detect stringified JSON in details.stringifiedDetails')
    }
  })

  // Test array field detection
  await testCase('findArrayFields detects arrays in structure', () => {
    // First analyze the structure
    const dataStructure = DataProcessor.analyzeDataStructure(sampleJsonObject)

    // Then find arrays
    const arrayFields = DataProcessor.findArrayFields(dataStructure)

    // Should detect the tags array
    if (!arrayFields.includes('$.tags')) {
      throw new Error('Should detect tags array field')
    }
  })

  // Test formatting
  await testCase('formatJson properly formats JSON string', () => {
    const unformatted = '{"name":"test","value":123}'
    const formatted = DataProcessor.formatJson(unformatted)

    // Check proper formatting with indentation
    if (!formatted.includes('  "name"')) {
      throw new Error('JSON should be properly indented')
    }
  })

  // Test results
  console.log('\nTest Results:')
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${failedTests}`)

  return {
    passedTests,
    failedTests
  }
}

// Run the tests when this file is executed directly
if (typeof window === 'undefined' && typeof require === 'function') {
  runTests().catch(console.error)
}

export { runTests }
