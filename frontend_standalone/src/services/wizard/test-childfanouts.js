/**
 * Test script for childfanouts implementation
 * Run with: node test-childfanouts.js
 */

import { SchemaRuleService } from './schemaRuleService.js'

// Test Case 1: Simple nested arrays
console.log('═══════════════════════════════════════════════════════════════════════')
console.log('Test Case 1: Simple nested arrays')
console.log('═══════════════════════════════════════════════════════════════════════')

const testCase1 = {
  selectedPaths: [
    'tags[0]',
    'dataItems[0]',
    'dataItems[0].subItems[0]'
  ],
  expected: [
    { field: '$.tags[*]', parentpath: null },
    { field: '$.dataItems[*]', parentpath: null },
    { field: '$.subItems[*]', parentpath: '$.dataItems[*]' }
  ]
}

const result1 = SchemaRuleService.buildChildFanouts(testCase1.selectedPaths, [])
console.log('Result:', JSON.stringify(result1, null, 2))
console.log('Expected:', JSON.stringify(testCase1.expected, null, 2))

// Test Case 2: Multiple root arrays
console.log('\n═══════════════════════════════════════════════════════════════════════')
console.log('Test Case 2: Multiple root arrays')
console.log('═══════════════════════════════════════════════════════════════════════')

const testCase2 = {
  selectedPaths: [
    'tags[0]',
    'numbersList[0]'
  ],
  expected: [
    { field: '$.tags[*]', parentpath: null },
    { field: '$.numbersList[*]', parentpath: null }
  ]
}

const result2 = SchemaRuleService.buildChildFanouts(testCase2.selectedPaths, [])
console.log('Result:', JSON.stringify(result2, null, 2))
console.log('Expected:', JSON.stringify(testCase2.expected, null, 2))

// Test Case 3: Deeply nested arrays (3 levels)
console.log('\n═══════════════════════════════════════════════════════════════════════')
console.log('Test Case 3: Deeply nested arrays (3 levels)')
console.log('═══════════════════════════════════════════════════════════════════════')

const testCase3 = {
  selectedPaths: [
    'outerArray[0]',
    'outerArray[0].innerArrayLevel1[0]',
    'outerArray[0].innerArrayLevel1[0].innerArrayLevel2[0]'
  ],
  expected: [
    { field: '$.outerArray[*]', parentpath: null },
    { field: '$.innerArrayLevel1[*]', parentpath: '$.outerArray[*]' },
    { field: '$.innerArrayLevel2[*]', parentpath: '$.innerArrayLevel1[*]' }
  ]
}

const result3 = SchemaRuleService.buildChildFanouts(testCase3.selectedPaths, [])
console.log('Result:', JSON.stringify(result3, null, 2))
console.log('Expected:', JSON.stringify(testCase3.expected, null, 2))

// Test Case 4: Complex example from requirements
console.log('\n═══════════════════════════════════════════════════════════════════════')
console.log('Test Case 4: Complex example from requirements')
console.log('═══════════════════════════════════════════════════════════════════════')

const testCase4 = {
  selectedPaths: [
    'tags[0]',
    'numbersList[0]',
    'outerArray[0]',
    'outerArray[0].innerArrayLevel1[0]',
    'outerArray[0].innerArrayLevel1[0].innerArrayLevel2[0]',
    'dataItems[0]',
    'dataItems[0].subItems[0]'
  ],
  expected: [
    { field: '$.tags[*]', parentpath: null },
    { field: '$.numbersList[*]', parentpath: null },
    { field: '$.outerArray[*]', parentpath: null },
    { field: '$.innerArrayLevel1[*]', parentpath: '$.outerArray[*]' },
    { field: '$.innerArrayLevel2[*]', parentpath: '$.innerArrayLevel1[*]' },
    { field: '$.dataItems[*]', parentpath: null },
    { field: '$.subItems[*]', parentpath: '$.dataItems[*]' }
  ]
}

const result4 = SchemaRuleService.buildChildFanouts(testCase4.selectedPaths, [])
console.log('Result:', JSON.stringify(result4, null, 2))
console.log('Expected:', JSON.stringify(testCase4.expected, null, 2))

// Validation Test
console.log('\n═══════════════════════════════════════════════════════════════════════')
console.log('Test Case 5: Validation - Valid childfanouts')
console.log('═══════════════════════════════════════════════════════════════════════')

const validChildfanouts = [
  { field: '$.tags[*]', parentpath: null },
  { field: '$.dataItems[*]', parentpath: null },
  { field: '$.subItems[*]', parentpath: '$.dataItems[*]' }
]

const validation1 = SchemaRuleService.validateChildFanouts(validChildfanouts)
console.log('Validation Result:', JSON.stringify(validation1, null, 2))
console.log('Expected: isValid = true')

// Validation Test - Invalid (missing parent)
console.log('\n═══════════════════════════════════════════════════════════════════════')
console.log('Test Case 6: Validation - Invalid (missing parent)')
console.log('═══════════════════════════════════════════════════════════════════════')

const invalidChildfanouts1 = [
  { field: '$.tags[*]', parentpath: null },
  { field: '$.subItems[*]', parentpath: '$.dataItems[*]' } // parent doesn't exist
]

const validation2 = SchemaRuleService.validateChildFanouts(invalidChildfanouts1)
console.log('Validation Result:', JSON.stringify(validation2, null, 2))
console.log('Expected: isValid = false, error about missing parent')

// Validation Test - Invalid (circular reference)
console.log('\n═══════════════════════════════════════════════════════════════════════')
console.log('Test Case 7: Validation - Invalid (circular reference)')
console.log('═══════════════════════════════════════════════════════════════════════')

const invalidChildfanouts2 = [
  { field: '$.array1[*]', parentpath: '$.array2[*]' },
  { field: '$.array2[*]', parentpath: '$.array1[*]' } // circular!
]

const validation3 = SchemaRuleService.validateChildFanouts(invalidChildfanouts2)
console.log('Validation Result:', JSON.stringify(validation3, null, 2))
console.log('Expected: isValid = false, error about circular reference')

// Validation Test - Invalid (duplicate field)
console.log('\n═══════════════════════════════════════════════════════════════════════')
console.log('Test Case 8: Validation - Invalid (duplicate field)')
console.log('═══════════════════════════════════════════════════════════════════════')

const invalidChildfanouts3 = [
  { field: '$.tags[*]', parentpath: null },
  { field: '$.tags[*]', parentpath: null } // duplicate!
]

const validation4 = SchemaRuleService.validateChildFanouts(invalidChildfanouts3)
console.log('Validation Result:', JSON.stringify(validation4, null, 2))
console.log('Expected: isValid = false, error about duplicate field')

console.log('\n═══════════════════════════════════════════════════════════════════════')
console.log('All tests completed!')
console.log('═══════════════════════════════════════════════════════════════════════')
