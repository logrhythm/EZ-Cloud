/**
 * Test script to verify the filterToArraysOnly logic with users data
 */

// Sample data from test_nested_arrays.html
const sampleData = {
  timestamp: '2025-10-24T12:00:00Z',
  event: 'user_data_sync',
  data: {
    users: [
      {
        id: 1,
        name: 'Manish Bhatnagar',
        email: 'manish@example.com',
        orders: [
          {
            orderId: 'ORD1001',
            date: '2025-10-20',
            items: [
              {
                productId: 'P101',
                name: 'Laptop',
                quantity: 1,
                tags: ['electronics', 'computers']
              }
            ]
          },
          {
            orderId: 'ORD1002',
            date: '2025-10-22',
            items: [
              {
                productId: 'P202',
                name: 'Mouse',
                quantity: 2,
                tags: ['electronics', 'accessories']
              }
            ]
          }
        ]
      }
    ],
    metadata: {
      totalUsers: 2,
      syncTime: '2025-10-24T12:00:00Z'
    }
  }
}

// Array paths that would be detected - using [0] prefix since root is array in actual data
const arrayPaths = [
  '[0].data.users',
  '[0].data.users[0].orders',
  '[0].data.users[0].orders[0].items',
  '[0].data.users[0].orders[0].items[0].tags'
]

// Normalized paths (what we'd pass to filterToArraysOnly)
const normalizedPaths = arrayPaths.map(path => path.replace(/^\[\d+\]\.?/, ''))

console.log('=== Testing Filter Logic with Users Data ===\n')
console.log('Normalized array paths:', normalizedPaths)

/**
 * Get a field value from an object by path
 */
const getFieldValueByPath = (obj, path) => {
  if (!obj || !path || path === 'root' || path === '') return obj

  try {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
    let current = obj

    for (const part of parts) {
      if (current === undefined || current === null) return undefined
      if (typeof current !== 'object') return undefined

      const index = /^\d+$/.test(part) ? parseInt(part) : part
      current = current[index]
    }

    return current
  } catch (e) {
    console.error(`Error getting value at path '${path}':`, e)
    return undefined
  }
}

/**
 * Helper function to recursively copy only the parts of source that lead to arrays
 */
const copyArrayPathsStructure = (source, targetPath, allArrayPaths) => {
  const value = getFieldValueByPath(source, targetPath)

  if (!value) return null

  if (Array.isArray(value)) {
    const pathPrefix = targetPath ? `${targetPath}[` : '['

    const hasNestedArrays = allArrayPaths.some(path => {
      if (path.startsWith(pathPrefix)) return true
      if (targetPath && path.startsWith(targetPath + '.')) return true
      return false
    })

    if (hasNestedArrays && value.length > 0) {
      const arrayCopy = []
      const firstElement = value[0]

      if (typeof firstElement === 'object' && firstElement !== null && !Array.isArray(firstElement)) {
        const processedElement = {}

        for (const key in firstElement) {
          const childPath = targetPath ? `${targetPath}[0].${key}` : `[0].${key}`

          const leadsToArray = allArrayPaths.some(arrayPath => {
            if (arrayPath === childPath) return true
            if (arrayPath.startsWith(childPath + '[')) return true
            if (arrayPath.startsWith(childPath + '.')) return true
            return false
          })

          if (leadsToArray) {
            const childValue = copyArrayPathsStructure(source, childPath, allArrayPaths)
            if (childValue !== null) {
              processedElement[key] = childValue
            }
          }
        }

        if (Object.keys(processedElement).length > 0) {
          arrayCopy.push(processedElement)
        }
      }

      return arrayCopy.length > 0 ? arrayCopy : value
    }

    return value
  } else if (typeof value === 'object' && value !== null) {
    const result = {}

    for (const key in value) {
      const childPath = targetPath ? `${targetPath}.${key}` : key

      const leadsToArray = allArrayPaths.some(arrayPath => {
        if (arrayPath === childPath) return true
        if (arrayPath.startsWith(childPath + '[')) return true
        if (arrayPath.startsWith(childPath + '.')) return true
        return false
      })

      if (leadsToArray) {
        const childValue = copyArrayPathsStructure(source, childPath, allArrayPaths)
        if (childValue !== null) {
          result[key] = childValue
        }
      }
    }

    return Object.keys(result).length > 0 ? result : null
  }

  return null
}

// Run the test
console.log('\n=== Running copyArrayPathsStructure ===\n')
const result = copyArrayPathsStructure(sampleData, '', normalizedPaths)

console.log('=== Result ===\n')
console.log(JSON.stringify(result, null, 2))

console.log('\n=== Verification ===\n')
console.log('✓ Has data:', result && 'data' in result)
console.log('✓ Has data.users:', result && result.data && 'users' in result.data)
console.log('✓ Has orders:', result && result.data && result.data.users && result.data.users[0] && 'orders' in result.data.users[0])
console.log('✓ Has items:', result && result.data && result.data.users && result.data.users[0] && result.data.users[0].orders && result.data.users[0].orders[0] && 'items' in result.data.users[0].orders[0])
console.log('✓ Has tags:', result && result.data && result.data.users && result.data.users[0] && result.data.users[0].orders && result.data.users[0].orders[0] && result.data.users[0].orders[0].items && result.data.users[0].orders[0].items[0] && 'tags' in result.data.users[0].orders[0].items[0])

console.log('\n=== Expected Tree Structure ===')
console.log('data → users (array) → orders (array) → items (array) → tags (array)')
console.log('All 4 nested array levels should be visible and selectable in the UI.')
