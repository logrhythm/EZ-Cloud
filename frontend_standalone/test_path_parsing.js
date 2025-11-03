/**
 * Test script to verify the path parsing fix
 * This simulates the logic from JsonTreeViewer.vue autoExpandArrayContainers function
 */

function testPathParsing(arrayPath) {
  console.log(`\n=== Testing: "${arrayPath}" ===`)

  let currentPath = ''
  const parts = []

  // Split by dots and brackets, keeping all tokens including dots
  const tokens = arrayPath.split(/(\[\d+\]|\.)/g).filter(t => t && t.trim())

  console.log('Tokens:', tokens)

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token === '.') {
      // Skip dot token, it will be added when we encounter the next property
      continue
    } else if (token.startsWith('[')) {
      // Array index - append to current path
      currentPath += token
      parts.push(currentPath)
    } else {
      // Property name
      if (currentPath) {
        currentPath += '.'
      }
      currentPath += token
      parts.push(currentPath)
    }
  }

  console.log('Generated paths:')
  parts.forEach((part, idx) => {
    console.log(`  ${idx + 1}. ${part}`)
  })

  return parts
}

// Test cases
console.log('╔═══════════════════════════════════════════════════════════╗')
console.log('║           PATH PARSING FIX VERIFICATION TEST              ║')
console.log('╚═══════════════════════════════════════════════════════════╝')

const testCases = [
  'projects[0].teams[0].members',
  'projects[0].teams[0].members[0].skills',
  'data.users[0].posts',
  'simple',
  'array[0]',
  'deep.nested[0].structure[1].with[2].many[3].levels'
]

testCases.forEach(testCase => {
  const result = testPathParsing(testCase)
})

console.log('\n╔═══════════════════════════════════════════════════════════╗')
console.log('║                    EXPECTED RESULTS                       ║')
console.log('╚═══════════════════════════════════════════════════════════╝')
console.log('\nFor "projects[0].teams[0].members":')
console.log('✓ projects')
console.log('✓ projects[0]')
console.log('✓ projects[0].teams          <- MUST HAVE DOT')
console.log('✓ projects[0].teams[0]       <- MUST HAVE DOT')
console.log('✓ projects[0].teams[0].members  <- MUST HAVE DOT')
console.log('\n❌ WRONG (old bug): projects[0]teams (missing dot)')
console.log('❌ WRONG (old bug): projects[0]teams[0] (missing dot)')
