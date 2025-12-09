/**
 * Comprehensive test for _normalizeArrayPathForPolicy
 * Tests all edge cases and potential bug scenarios
 */

import { SchemaRuleService } from './schemaRuleService.js'

console.log('═══════════════════════════════════════════════════════════════════════')
console.log('Testing _normalizeArrayPathForPolicy function')
console.log('═══════════════════════════════════════════════════════════════════════\n')

const testCases = [
  // Root level arrays
  { input: 'tags[0]', expected: '$.tags[*]', description: 'Root array with [0]' },
  { input: 'tags[5]', expected: '$.tags[*]', description: 'Root array with [5]' },
  { input: 'tags', expected: '$.tags[*]', description: 'Root array without index' },
  { input: '$.tags[0]', expected: '$.tags[*]', description: 'Root array with $ and [0]' },
  { input: '$.tags', expected: '$.tags[*]', description: 'Root array with $ but no index' },

  // Nested arrays (1 level)
  { input: 'parent[0].child[0]', expected: '$.parent[*].child[*]', description: 'Nested array 1 level' },
  { input: '$.parent[0].child[0]', expected: '$.parent[*].child[*]', description: 'Nested array 1 level with $' },

  // Deeply nested arrays (2+ levels)
  { input: 'a[0].b[0].c[0]', expected: '$.a[*].b[*].c[*]', description: 'Nested array 2 levels' },
  { input: '$.a[0].b[0].c[0]', expected: '$.a[*].b[*].c[*]', description: 'Nested array 2 levels with $' },
  { input: 'outer[0].inner[0].deepest[0]', expected: '$.outer[*].inner[*].deepest[*]', description: 'Deeply nested arrays' },

  // Edge cases that should NOT produce $[*]. patterns
  { input: '[0].field', expected: '$.field[*]', description: 'Leading array index (should be cleaned)' },
  { input: '$[0].field', expected: '$.field[*]', description: 'Leading $[0] (should be cleaned)' },

  // The user's exact case
  { input: 'outerArray[0].innerArrayLevel1[0]', expected: '$.outerArray[*].innerArrayLevel1[*]', description: 'User case: nested 1 level' },
  { input: 'outerArray[0].innerArrayLevel1[0].innerArrayLevel2[0]', expected: '$.outerArray[*].innerArrayLevel1[*].innerArrayLevel2[*]', description: 'User case: nested 2 levels' }
]

let passCount = 0
let failCount = 0

testCases.forEach((test, idx) => {
  const result = SchemaRuleService._normalizeArrayPathForPolicy(test.input)
  const passed = result === test.expected

  if (passed) {
    passCount++
    console.log(`✅ Test ${idx + 1}: ${test.description}`)
    console.log(`   Input:    "${test.input}"`)
    console.log(`   Output:   "${result}"`)
  } else {
    failCount++
    console.log(`❌ Test ${idx + 1}: ${test.description}`)
    console.log(`   Input:    "${test.input}"`)
    console.log(`   Expected: "${test.expected}"`)
    console.log(`   Got:      "${result}"`)

    // Additional debugging
    if (result.includes('$[*].')) {
      console.log('   ⚠️  CRITICAL: Contains invalid $[*]. pattern!')
    }
    if (!result.endsWith('[*]')) {
      console.log('   ⚠️  CRITICAL: Missing [*] suffix!')
    }
    if (!result.startsWith('$.')) {
      console.log('   ⚠️  CRITICAL: Missing $. prefix!')
    }
  }
  console.log()
})

console.log('═══════════════════════════════════════════════════════════════════════')
console.log(`RESULTS: ${passCount} passed, ${failCount} failed out of ${testCases.length} tests`)
console.log('═══════════════════════════════════════════════════════════════════════')

if (failCount === 0) {
  console.log('✅✅✅ ALL NORMALIZATION TESTS PASSED! ✅✅✅')
} else {
  console.log('❌❌❌ SOME TESTS FAILED! ❌❌❌')
}
