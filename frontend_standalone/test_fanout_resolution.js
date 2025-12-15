/**
 * Test script for fanout path resolution
 * Tests all 5 rules from the specification
 *
 * Run with: node test_fanout_resolution.js
 */

// Mock MappingService.resolvePathForFanout implementation
function resolvePathForFanout (absolutePath, fanoutArrays) {
  try {
    console.log('╔═══════════════════════════════════════════════════════════════════════')
    console.log('║ resolvePathForFanout - START')
    console.log('╠═══════════════════════════════════════════════════════════════════════')
    console.log('║ absolutePath:', absolutePath)
    console.log('║ fanoutArrays:', JSON.stringify(fanoutArrays))
    console.log('╚═══════════════════════════════════════════════════════════════════════')

    // If no fanout arrays, return absolute path
    if (!fanoutArrays || fanoutArrays.length === 0) {
      return {
        jsonPath: absolutePath,
        fanoutParent: null
      }
    }

    // Normalize path for comparison
    const normalizePath = (path) => {
      if (!path) return ''
      let normalized = path
        .replace(/\[(\d+)\]/g, '[*]')
        .replace(/\[\*\]/g, '[*]')

      if (!normalized.startsWith('$')) {
        normalized = '$.' + normalized
      }
      return normalized
    }

    const normalizedPath = normalizePath(absolutePath)

    // Sort fanout arrays by depth (deepest first)
    const sortedFanouts = [...fanoutArrays]
      .map(f => normalizePath(f))
      .filter(f => f)
      .sort((a, b) => {
        const depthA = (a.match(/\./g) || []).length + (a.match(/\[/g) || []).length
        const depthB = (b.match(/\./g) || []).length + (b.match(/\[/g) || []).length
        return depthB - depthA // Deepest first
      })

    // Find the nearest fanout parent
    let nearestFanout = null
    for (const normalizedFanout of sortedFanouts) {
      let fanoutPrefix = normalizedFanout
      if (fanoutPrefix.endsWith('[*]')) {
        fanoutPrefix = fanoutPrefix.substring(0, fanoutPrefix.length - 3)
      }

      if (normalizedPath === fanoutPrefix ||
          normalizedPath === normalizedFanout ||
          normalizedPath.startsWith(fanoutPrefix + '.') ||
          normalizedPath.startsWith(fanoutPrefix + '[')) {
        nearestFanout = normalizedFanout
        break
      }
    }

    // If no fanout parent found, return absolute path
    if (!nearestFanout) {
      return {
        jsonPath: absolutePath,
        fanoutParent: null
      }
    }

    // Make path relative to fanout parent
    let relativePath = normalizedPath
    let fanoutPrefix = nearestFanout

    if (fanoutPrefix.endsWith('[*]')) {
      fanoutPrefix = fanoutPrefix.substring(0, fanoutPrefix.length - 3)
    }

    if (normalizedPath.startsWith(fanoutPrefix + '.')) {
      relativePath = '$' + normalizedPath.substring(fanoutPrefix.length)
    } else if (normalizedPath.startsWith(fanoutPrefix + '[')) {
      const afterPrefix = normalizedPath.substring(fanoutPrefix.length)
      if (afterPrefix.startsWith('[*].')) {
        relativePath = '$.' + afterPrefix.substring(4)
      } else if (afterPrefix === '[*]') {
        relativePath = '$'
      } else {
        relativePath = '$' + afterPrefix
      }
    } else if (normalizedPath === fanoutPrefix || normalizedPath === fanoutPrefix + '[*]') {
      relativePath = '$'
    }

    // Clean up path
    relativePath = relativePath.replace(/^\$\.\./, '$.')
    relativePath = relativePath.replace(/\.\[/g, '[')

    // Ensure fanout parent has [*] notation
    let fanoutParentResult = nearestFanout
    if (!fanoutParentResult.endsWith('[*]') && !fanoutParentResult.endsWith(']')) {
      fanoutParentResult = fanoutParentResult + '[*]'
    }

    console.log('║ Result - jsonPath:', relativePath)
    console.log('║ Result - fanoutParent:', fanoutParentResult)
    console.log('╚═══════════════════════════════════════════════════════════════════════')

    return {
      jsonPath: relativePath,
      fanoutParent: fanoutParentResult
    }
  } catch (error) {
    console.error('Error in resolvePathForFanout:', error)
    return {
      jsonPath: absolutePath,
      fanoutParent: null
    }
  }
}

// Test cases
const testCases = [
  {
    name: 'Rule 1: No Fanout Selected',
    input: '$.teamMembers[*].contact.tasks[*].title',
    fanoutArrays: [],
    expected: {
      jsonPath: '$.teamMembers[*].contact.tasks[*].title',
      fanoutParent: null
    }
  },
  {
    name: 'Rule 2a: Single Fanout - Direct Child',
    input: '$.teamMembers[*].name',
    fanoutArrays: ['$.teamMembers'],
    expected: {
      jsonPath: '$.name',
      fanoutParent: '$.teamMembers[*]'
    }
  },
  {
    name: 'Rule 2b: Single Fanout - Nested Object',
    input: '$.teamMembers[*].contact.email',
    fanoutArrays: ['$.teamMembers'],
    expected: {
      jsonPath: '$.contact.email',
      fanoutParent: '$.teamMembers[*]'
    }
  },
  {
    name: 'Rule 2c: Single Fanout - Nested Non-Fanout Array',
    input: '$.teamMembers[*].contact.tasks[*].title',
    fanoutArrays: ['$.teamMembers'],
    expected: {
      jsonPath: '$.contact.tasks[*].title',
      fanoutParent: '$.teamMembers[*]'
    }
  },
  {
    name: 'Rule 3a: Multiple Fanout - Inner Fanout Field',
    input: '$.teamMembers[*].contact.tasks[*].title',
    fanoutArrays: ['$.teamMembers', '$.teamMembers[*].contact.tasks'],
    expected: {
      jsonPath: '$.title',
      fanoutParent: '$.teamMembers[*].contact.tasks[*]'
    }
  },
  {
    name: 'Rule 3b: Multiple Fanout - Nested in Inner Fanout',
    input: '$.teamMembers[*].contact.tasks[*].details.assignedTo',
    fanoutArrays: ['$.teamMembers', '$.teamMembers[*].contact.tasks'],
    expected: {
      jsonPath: '$.details.assignedTo',
      fanoutParent: '$.teamMembers[*].contact.tasks[*]'
    }
  },
  {
    name: 'Rule 3c: Multiple Fanout - Outer Fanout Field',
    input: '$.teamMembers[*].contact.email',
    fanoutArrays: ['$.teamMembers', '$.teamMembers[*].contact.tasks'],
    expected: {
      jsonPath: '$.contact.email',
      fanoutParent: '$.teamMembers[*]'
    }
  },
  {
    name: 'Rule 4: Partial Fanout - Parent Selected Only',
    input: '$.teamMembers[*].contact.tasks[*].title',
    fanoutArrays: ['$.teamMembers'],
    expected: {
      jsonPath: '$.contact.tasks[*].title',
      fanoutParent: '$.teamMembers[*]'
    }
  },
  {
    name: 'Rule 5: Partial Fanout - Child Selected Only',
    input: '$.teamMembers[*].contact.tasks[*].title',
    fanoutArrays: ['$.teamMembers[*].contact.tasks'],
    expected: {
      jsonPath: '$.title',
      fanoutParent: '$.teamMembers[*].contact.tasks[*]'
    }
  },
  {
    name: 'Edge Case: Fanout without [*] notation',
    input: '$.teamMembers[*].name',
    fanoutArrays: ['$.teamMembers'], // No [*] in fanout array
    expected: {
      jsonPath: '$.name',
      fanoutParent: '$.teamMembers[*]'
    }
  },
  {
    name: 'Edge Case: Path without $ prefix',
    input: 'teamMembers[*].name',
    fanoutArrays: ['$.teamMembers'],
    expected: {
      jsonPath: '$.name',
      fanoutParent: '$.teamMembers[*]'
    }
  },
  {
    name: 'Edge Case: Fanout array is exact path',
    input: '$.teamMembers[*]',
    fanoutArrays: ['$.teamMembers'],
    expected: {
      jsonPath: '$',
      fanoutParent: '$.teamMembers[*]'
    }
  }
]

// Run tests
console.log('\n\n')
console.log('╔═══════════════════════════════════════════════════════════════════════════════════════')
console.log('║ FANOUT PATH RESOLUTION TEST SUITE')
console.log('╠═══════════════════════════════════════════════════════════════════════════════════════')
console.log('║ Testing all 5 rules from specification')
console.log('╚═══════════════════════════════════════════════════════════════════════════════════════')
console.log('\n')

let passCount = 0
let failCount = 0

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(100)}`)
  console.log(`TEST ${index + 1}: ${testCase.name}`)
  console.log('='.repeat(100))

  const result = resolvePathForFanout(testCase.input, testCase.fanoutArrays)

  const jsonPathMatch = result.jsonPath === testCase.expected.jsonPath
  const fanoutParentMatch = result.fanoutParent === testCase.expected.fanoutParent
  const passed = jsonPathMatch && fanoutParentMatch

  if (passed) {
    passCount++
    console.log('✓ PASS')
  } else {
    failCount++
    console.log('✗ FAIL')
    console.log('  Expected jsonPath:', testCase.expected.jsonPath)
    console.log('  Got jsonPath:', result.jsonPath)
    console.log('  Match:', jsonPathMatch ? '✓' : '✗')
    console.log('  Expected fanoutParent:', testCase.expected.fanoutParent)
    console.log('  Got fanoutParent:', result.fanoutParent)
    console.log('  Match:', fanoutParentMatch ? '✓' : '✗')
  }
})

console.log('\n\n')
console.log('╔═══════════════════════════════════════════════════════════════════════════════════════')
console.log('║ TEST SUMMARY')
console.log('╠═══════════════════════════════════════════════════════════════════════════════════════')
console.log(`║ Total Tests: ${testCases.length}`)
console.log(`║ Passed: ${passCount}`)
console.log(`║ Failed: ${failCount}`)
console.log(`║ Success Rate: ${((passCount / testCases.length) * 100).toFixed(2)}%`)
console.log('╚═══════════════════════════════════════════════════════════════════════════════════════')
console.log('\n')

process.exit(failCount > 0 ? 1 : 0)
