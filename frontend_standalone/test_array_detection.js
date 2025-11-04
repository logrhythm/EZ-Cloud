// Test what arrayPaths would be detected from the filtered fanoutArrayTreeData

const fanoutArrayTreeData = {
  "data": {
    "users": [
      {
        "orders": [
          {
            "items": [
              {
                "tags": [
                  "electronics",
                  "accessories"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

// Simulate the arrayPaths detection logic from JsonTreeViewer
const paths = [];
const processedPaths = new Set();

const traverse = (obj, path = '') => {
  if (obj === null || obj === undefined) return;

  if (Array.isArray(obj)) {
    // Only add the path if it exists and isn't empty
    if (path && path.trim() !== '' && !processedPaths.has(path)) {
      console.log('Adding array path:', path);
      paths.push(path);
      processedPaths.add(path);
    }

    if (obj.length > 0) {
      // Process just the first item
      const firstItem = obj[0];
      const itemPath = path ? `${path}[0]` : '[0]';
      traverse(firstItem, itemPath);
    }
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      const nextPath = path ? `${path}.${key}` : key;
      traverse(obj[key], nextPath);
    }
  }
};

console.log('=== Detecting array paths from fanoutArrayTreeData ===\n');
traverse(fanoutArrayTreeData);

console.log('\n=== Detected Array Paths ===');
paths.forEach((p, i) => console.log(`${i + 1}. ${p}`));

console.log('\n=== Expected Paths ===');
console.log('1. data.users');
console.log('2. data.users[0].orders');
console.log('3. data.users[0].orders[0].items');
console.log('4. data.users[0].orders[0].items[0].tags');

console.log('\n=== Checking if tags path exists ===');
const tagsPath = 'data.users[0].orders[0].items[0].tags';
const tagsPathExists = paths.includes(tagsPath);
console.log(`Path '${tagsPath}' found?`, tagsPathExists);
