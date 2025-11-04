// Test path matching logic

// When we're at the items[0] object
const currentPath = 'data.users[0].orders[0].items[0]';
const childKey = 'tags';

// This is how the path would be constructed in containsArrays
const childPath = currentPath === 'root' ? childKey : `${currentPath}.${childKey}`;

console.log('Current path:', currentPath);
console.log('Child key:', childKey);
console.log('Constructed child path:', childPath);

// This is what would be in arrayPaths (from the detection logic)
const arrayPaths = [
  'data.users',
  'data.users[0].orders',
  'data.users[0].orders[0].items',
  'data.users[0].orders[0].items[0].tags'
];

console.log('\nArray paths:', arrayPaths);

// Check if there's a direct match
const directMatch = arrayPaths.includes(childPath);
console.log('\nDirect match?', directMatch);
console.log('Expected:', childPath);
console.log('Actual in arrayPaths:', arrayPaths.find(p => p === childPath));

// The tags value is an array
const tagsValue = ['electronics', 'accessories'];
console.log('\nIs tags value an array?', Array.isArray(tagsValue));

// Check if any nested path starts with this childPath
const nestedMatch = arrayPaths.some(arrayPath =>
  arrayPath === childPath || arrayPath.startsWith(childPath + '.')
);
console.log('Nested match?', nestedMatch);
