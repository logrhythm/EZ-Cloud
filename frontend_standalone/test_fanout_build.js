// Debug script to test the fanoutArrayTreeData build logic

const testData = {
  data: {
    users: [
      {
        id: 1,
        name: 'Manish',
        orders: [
          {
            orderId: 'ORD1001',
            items: [
              {
                productId: 'P101',
                tags: ['electronics', 'accessories']
              }
            ]
          }
        ]
      }
    ]
  }
}

// Simulate the fanoutArrayTreeData build function
const build = (node) => {
  if (node === null || node === undefined) return {}

  if (Array.isArray(node)) {
    if (node.length === 0) return []
    // For arrays of objects, keep first element reduced
    const first = node[0]
    if (typeof first === 'object' && first !== null) {
      return [build(first)]
    }
    // Primitive arrays: keep entire array
    return node
  }

  if (typeof node === 'object') {
    const out = {}
    for (const k of Object.keys(node)) {
      const v = node[k]
      console.log(`Processing key '${k}', value type: ${Array.isArray(v) ? 'Array' : typeof v}`)

      if (Array.isArray(v)) {
        console.log(`  → '${k}' is an array, calling build recursively`)
        out[k] = build(v)
        console.log(`  → Result for '${k}':`, out[k])
      } else if (v && typeof v === 'object') {
        console.log(`  → '${k}' is an object, calling build recursively`)
        const child = build(v)
        console.log('  → child result:', child)
        console.log('  → child is array?', Array.isArray(child))
        console.log('  → child length:', Array.isArray(child) ? child.length : 'N/A')
        console.log('  → child is object?', typeof child === 'object')
        console.log('  → child keys:', typeof child === 'object' && !Array.isArray(child) ? Object.keys(child) : 'N/A')

        // include ancestor only if descendant has arrays
        if (child && ((Array.isArray(child) && child.length > 0) || (typeof child === 'object' && Object.keys(child).length > 0))) {
          console.log(`  → Adding '${k}' to out`)
          out[k] = child
        } else {
          console.log(`  → NOT adding '${k}' to out (empty or no arrays)`)
        }
      }
    }
    return out
  }

  return {}
}

console.log('=== Testing fanoutArrayTreeData build logic ===\n')
const result = build(testData)
console.log('\n=== Final Result ===')
console.log(JSON.stringify(result, null, 2))

// Check if tags are in the result
const hasUsers = result.data && result.data.users
const hasOrders = hasUsers && result.data.users[0] && result.data.users[0].orders
const hasItems = hasOrders && result.data.users[0].orders[0] && result.data.users[0].orders[0].items
const hasTags = hasItems && result.data.users[0].orders[0].items[0] && result.data.users[0].orders[0].items[0].tags

console.log('\n=== Path Check ===')
console.log('Has users?', !!hasUsers)
console.log('Has orders?', !!hasOrders)
console.log('Has items?', !!hasItems)
console.log('Has tags?', !!hasTags)
if (hasTags) {
  console.log('Tags value:', result.data.users[0].orders[0].items[0].tags)
}
