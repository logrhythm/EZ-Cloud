// Test script to trace array path detection issue

const testData = {
  "timestamp": "2025-10-24T12:00:00Z",
  "event": "user_data_sync",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Manish Bhatnagar",
        "orders": [
          {
            "orderId": "ORD1001",
            "items": [
              {
                "productId": "P101",
                "tags": ["electronics", "accessories"]
              }
            ]
          }
        ]
      }
    ]
  }
};

// Simulate the array paths that would be detected
const arrayPaths = [
  'data.users',
  'data.users[0].orders',
  'data.users[0].orders[0].items',
  'data.users[0].orders[0].items[0].tags'
];

console.log('Test Data:', JSON.stringify(testData, null, 2));
console.log('\nDetected Array Paths:');
arrayPaths.forEach(path => console.log('  -', path));

// Now test the filtering logic from filteredArrayChildren
console.log('\n=== Testing filteredArrayChildren logic ===');

// When we're at the "items" array level:
const itemsArrayPath = 'data.users[0].orders[0].items';
console.log('\nAt items array:', itemsArrayPath);

// The first item in the items array
const firstItem = testData.data.users[0].orders[0].items[0];
console.log('First item keys:', Object.keys(firstItem));

// Check each property to see if it leads to an array
Object.keys(firstItem).forEach(key => {
  console.log(`\nChecking property: ${key}`);
  
  const pathPattern = itemsArrayPath;
  const keyToCheck = key;
  
  console.log(`  pathPattern: ${pathPattern}`);
  console.log(`  keyToCheck: ${keyToCheck}`);
  
  // This is the logic from the code - checking if any arrayPath matches
  const matches = arrayPaths.some(arrayPath => {
    // Pattern 1: Direct child array
    const directChildPattern = new RegExp(`^${pathPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\[\\d+\\]\\.${keyToCheck}$`);
    const p1Match = directChildPattern.test(arrayPath);
    if (p1Match) {
      console.log(`    ✓ Pattern 1 match: ${arrayPath}`);
      return true;
    }
    
    // Pattern 2: Nested array
    const nestedPattern = new RegExp(`^${pathPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\[\\d+\\]\\.${keyToCheck}\\[`);
    const p2Match = nestedPattern.test(arrayPath);
    if (p2Match) {
      console.log(`    ✓ Pattern 2 match: ${arrayPath}`);
      return true;
    }
    
    // Pattern 3: Deep nesting
    const deepNestedRegex = new RegExp(`${pathPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\[\\d+\\]\\.${keyToCheck}\\[\\d+\\]\\.`);
    const p3Match = deepNestedRegex.test(arrayPath);
    if (p3Match) {
      console.log(`    ✓ Pattern 3 match: ${arrayPath}`);
      return true;
    }
    
    return false;
  });
  
  console.log(`  → Result: ${matches ? 'LEADS TO ARRAY' : 'DOES NOT LEAD TO ARRAY'}`);
});

console.log('\n=== Expected Behavior ===');
console.log('The "tags" property should be detected as leading to an array.');
console.log('Expected regex pattern to match: data\\.users\\[\\d+\\]\\.orders\\[\\d+\\]\\.items\\[\\d+\\]\\.tags');
console.log('Actual path in arrayPaths: data.users[0].orders[0].items[0].tags');
console.log('\nPattern 1 regex should be: ^data\\.users\\[\\d+\\]\\.orders\\[\\d+\\]\\.items\\[\\d+\\]\\.tags$');
console.log('This SHOULD match!');
