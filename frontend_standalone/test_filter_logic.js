/**
 * Test script to verify the filterToArraysOnly logic
 */

// Sample data matching the test case
const sampleData = {
  company: "TechNova Solutions",
  projects: [
    {
      projectId: "PRJ1001",
      teams: [
        {
          teamId: "T01",
          members: [
            {
              id: 1,
              name: "Manish",
              skills: ["Python", "JavaScript", "Go"]
            }
          ]
        }
      ]
    }
  ]
};

// Array paths that would be detected
const arrayPaths = [
  'projects',
  'projects[0].teams',
  'projects[0].teams[0].members',
  'projects[0].teams[0].members[0].skills'
];

console.log('=== Testing Filter Logic ===\n');
console.log('Input data:', JSON.stringify(sampleData, null, 2));
console.log('\nArray paths:', arrayPaths);

/**
 * Get a field value from an object by path
 */
const getFieldValueByPath = (obj, path) => {
  if (!obj || !path || path === 'root' || path === '') return obj;

  try {
    // Handle array indices in path
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = obj;

    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      if (typeof current !== 'object') return undefined;

      // Handle numeric indices properly
      const index = /^\d+$/.test(part) ? parseInt(part) : part;
      current = current[index];
    }

    return current;
  } catch (e) {
    console.error(`Error getting value at path '${path}':`, e);
    return undefined;
  }
};

/**
 * Helper function to recursively copy only the parts of source that lead to arrays
 * This preserves the complete structure of array elements that contain nested arrays
 */
const copyArrayPathsStructure = (source, targetPath, allArrayPaths) => {
  console.log(`\n--- copyArrayPathsStructure called ---`);
  console.log(`  targetPath: "${targetPath}"`);

  // Get the value at the target path
  const value = getFieldValueByPath(source, targetPath);

  console.log(`  value type: ${Array.isArray(value) ? 'array' : typeof value}`);
  if (Array.isArray(value)) {
    console.log(`  array length: ${value.length}`);
  }

  if (!value) {
    console.log(`  returning null (no value)`);
    return null;
  }

  // If this is an array, we need to copy it and check if its elements contain nested arrays
  if (Array.isArray(value)) {
    // Build the prefix to check for nested arrays
    // If targetPath is empty (root level), don't add a separator
    const pathPrefix = targetPath ? `${targetPath}[` : '[';

    // Check if there are any nested arrays within this array's elements
    const hasNestedArrays = allArrayPaths.some(path => {
      // Check if path starts with targetPath[ (for nested arrays in this array)
      if (path.startsWith(pathPrefix)) return true;

      // Also check for paths like targetPath. (for objects containing arrays)
      if (targetPath && path.startsWith(targetPath + '.')) return true;

      return false;
    });

    console.log(`  hasNestedArrays: ${hasNestedArrays}`);

    if (hasNestedArrays && value.length > 0) {
      // Copy the array and recursively process its first element if it's an object
      const arrayCopy = [];

      // Process first element if it contains nested arrays
      const firstElement = value[0];
      console.log(`  firstElement type: ${Array.isArray(firstElement) ? 'array' : typeof firstElement}`);

      if (typeof firstElement === 'object' && firstElement !== null && !Array.isArray(firstElement)) {
        const processedElement = {};

        // For each property in the first element, check if it leads to an array
        for (const key in firstElement) {
          // Build the child path correctly
          const childPath = targetPath ? `${targetPath}[0].${key}` : `[0].${key}`;
          console.log(`    checking property "${key}" at path: ${childPath}`);

          // Check if this property or its descendants contain arrays
          const leadsToArray = allArrayPaths.some(arrayPath => {
            // Direct match
            if (arrayPath === childPath) return true;

            // Check if array path starts with this child path
            if (arrayPath.startsWith(childPath + '[')) return true;
            if (arrayPath.startsWith(childPath + '.')) return true;

            return false;
          });

          console.log(`      leadsToArray: ${leadsToArray}`);

          if (leadsToArray) {
            // Recursively copy this branch
            const childValue = copyArrayPathsStructure(source, childPath, allArrayPaths);
            if (childValue !== null) {
              processedElement[key] = childValue;
              console.log(`      added to processedElement`);
            }
          }
        }

        // Only add the processed element if it has properties
        if (Object.keys(processedElement).length > 0) {
          arrayCopy.push(processedElement);
          console.log(`  arrayCopy has ${Object.keys(processedElement).length} properties`);
        }
      }

      return arrayCopy.length > 0 ? arrayCopy : value;
    }

    // Return the array as-is if it has no nested arrays
    console.log(`  returning array as-is`);
    return value;
  } else if (typeof value === 'object' && value !== null) {
    // For objects, recursively process properties that lead to arrays
    const result = {};

    for (const key in value) {
      const childPath = targetPath ? `${targetPath}.${key}` : key;
      console.log(`  checking property "${key}" at path: ${childPath}`);

      // Check if this property or its descendants contain arrays
      const leadsToArray = allArrayPaths.some(arrayPath => {
        // Direct match
        if (arrayPath === childPath) return true;

        // Check if array path starts with this child path
        if (arrayPath.startsWith(childPath + '[')) return true;
        if (arrayPath.startsWith(childPath + '.')) return true;

        return false;
      });

      console.log(`    leadsToArray: ${leadsToArray}`);

      if (leadsToArray) {
        const childValue = copyArrayPathsStructure(source, childPath, allArrayPaths);
        if (childValue !== null) {
          result[key] = childValue;
          console.log(`    added to result`);
        }
      }
    }

    const hasResults = Object.keys(result).length > 0;
    console.log(`  object result has ${Object.keys(result).length} properties`);
    return hasResults ? result : null;
  }

  console.log(`  returning null (not array or object)`);
  return null;
};

// Run the test
console.log('\n=== Running copyArrayPathsStructure ===\n');
const result = copyArrayPathsStructure(sampleData, '', arrayPaths);

console.log('\n=== Result ===\n');
console.log(JSON.stringify(result, null, 2));

console.log('\n=== Verification ===\n');
console.log('✓ Has projects:', result && 'projects' in result);
console.log('✓ Has teams:', result && result.projects && result.projects[0] && 'teams' in result.projects[0]);
console.log('✓ Has members:', result && result.projects && result.projects[0] && result.projects[0].teams && result.projects[0].teams[0] && 'members' in result.projects[0].teams[0]);
console.log('✓ Has skills:', result && result.projects && result.projects[0] && result.projects[0].teams && result.projects[0].teams[0] && result.projects[0].teams[0].members && result.projects[0].teams[0].members[0] && 'skills' in result.projects[0].teams[0].members[0]);
