/**
 * Test file to reproduce the nested array bug from user report
 */

import { SchemaRuleService } from './schemaRuleService.js'

console.log('═══════════════════════════════════════════════════════════════════════')
console.log('Testing NESTED ARRAY BUG - User Report Case')
console.log('═══════════════════════════════════════════════════════════════════════\n')

// Test with the EXACT paths that would come from the tree viewer
const testPaths = [
  'tags[0]',
  'numbersList[0]',
  'outerArray[0]',
  'dataItems[0]',
  'outerArray[0].innerArrayLevel1[0]',
  'dataItems[0].subItems[0]',
  'outerArray[0].innerArrayLevel1[0].innerArrayLevel2[0]'
]

console.log('Input paths (as they come from JsonTreeViewer):')
testPaths.forEach((path, idx) => {
  console.log(`  [${idx}] "${path}"`)
})
console.log()

const result = SchemaRuleService.buildChildFanouts(testPaths, [])

console.log('\n═══════════════════════════════════════════════════════════════════════')
console.log('RESULT childfanouts:')
console.log('═══════════════════════════════════════════════════════════════════════')
result.forEach((entry, idx) => {
  console.log(`[${idx}] field: "${entry.field}", parentpath: ${entry.parentpath ? '"' + entry.parentpath + '"' : 'null'}`)

  // Validation checks
  const issues = []
  if (!entry.field.endsWith('[*]')) issues.push('❌ field missing [*] suffix')
  if (!entry.field.startsWith('$.')) issues.push('❌ field missing $. prefix')
  if (entry.parentpath && !entry.parentpath.endsWith('[*]')) issues.push('❌ parentpath missing [*] suffix')
  if (entry.parentpath && !entry.parentpath.startsWith('$.')) issues.push('❌ parentpath missing $. prefix')
  if (entry.field.includes('$[*].')) issues.push('❌ field has invalid $[*]. pattern')
  if (entry.parentpath && entry.parentpath.includes('$[*].')) issues.push('❌ parentpath has invalid $[*]. pattern')

  if (issues.length > 0) {
    console.log(`     ${issues.join(', ')}`)
  } else {
    console.log('     ✅ All validations passed')
  }
})

console.log('\n═══════════════════════════════════════════════════════════════════════')
console.log('EXPECTED OUTPUT:')
console.log('═══════════════════════════════════════════════════════════════════════')
const expected = [
  { field: '$.tags[*]', parentpath: null },
  { field: '$.numbersList[*]', parentpath: null },
  { field: '$.outerArray[*]', parentpath: null },
  { field: '$.dataItems[*]', parentpath: null },
  { field: '$.innerArrayLevel1[*]', parentpath: '$.outerArray[*]' },
  { field: '$.subItems[*]', parentpath: '$.dataItems[*]' },
  { field: '$.innerArrayLevel2[*]', parentpath: '$.innerArrayLevel1[*]' }
]

expected.forEach((entry, idx) => {
  console.log(`[${idx}] field: "${entry.field}", parentpath: ${entry.parentpath ? '"' + entry.parentpath + '"' : 'null'}`)
})

console.log('\n═══════════════════════════════════════════════════════════════════════')
console.log('COMPARISON:')
console.log('═══════════════════════════════════════════════════════════════════════')

let allMatch = true
result.forEach((resultEntry, idx) => {
  const expectedEntry = expected[idx]
  if (!expectedEntry) {
    console.log(`[${idx}] ❌ EXTRA ENTRY in result`)
    allMatch = false
    return
  }

  const fieldMatch = resultEntry.field === expectedEntry.field
  const parentMatch = resultEntry.parentpath === expectedEntry.parentpath

  if (fieldMatch && parentMatch) {
    console.log(`[${idx}] ✅ MATCH`)
  } else {
    allMatch = false
    if (!fieldMatch) {
      console.log(`[${idx}] ❌ FIELD MISMATCH`)
      console.log(`       Got:      "${resultEntry.field}"`)
      console.log(`       Expected: "${expectedEntry.field}"`)
    }
    if (!parentMatch) {
      console.log(`[${idx}] ❌ PARENTPATH MISMATCH`)
      console.log(`       Got:      ${resultEntry.parentpath ? '"' + resultEntry.parentpath + '"' : 'null'}`)
      console.log(`       Expected: ${expectedEntry.parentpath ? '"' + expectedEntry.parentpath + '"' : 'null'}`)
    }
  }
})

if (expected.length > result.length) {
  for (let i = result.length; i < expected.length; i++) {
    console.log(`[${i}] ❌ MISSING ENTRY in result`)
    allMatch = false
  }
}

console.log('\n═══════════════════════════════════════════════════════════════════════')
if (allMatch) {
  console.log('✅✅✅ ALL TESTS PASSED! ✅✅✅')
} else {
  console.log('❌❌❌ TESTS FAILED! BUG CONFIRMED! ❌❌❌')
}
console.log('═══════════════════════════════════════════════════════════════════════')
