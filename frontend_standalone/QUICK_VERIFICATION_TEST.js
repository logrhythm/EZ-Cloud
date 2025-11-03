/**
 * QUICK VERIFICATION TEST
 *
 * Paste this entire script into your browser console after loading the wizard
 * It will verify that all 4 nested arrays are now visible
 */

(function() {
  console.clear();
  console.log('%c╔══════════════════════════════════════════════════════════╗', 'color: #2196F3; font-weight: bold');
  console.log('%c║   NESTED ARRAYS FIX - VERIFICATION TEST                 ║', 'color: #2196F3; font-weight: bold');
  console.log('%c╚══════════════════════════════════════════════════════════╝', 'color: #2196F3; font-weight: bold');
  console.log('\n');

  // Test 1: Count checkboxes
  const checkboxes = document.querySelectorAll('.q-checkbox');
  const checkboxCount = checkboxes.length;
  const checkboxPass = checkboxCount === 4;

  console.log(`%c[TEST 1] Checkbox Count`, 'font-weight: bold; font-size: 14px');
  console.log(`  Found: ${checkboxCount}`);
  console.log(`  Expected: 4`);
  console.log(`  Status: ${checkboxPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  // Test 2: Get array names
  const arrayNames = Array.from(checkboxes).map(cb => {
    const parent = cb.closest('.node-content');
    const keyEl = parent?.querySelector('.node-key, .node-array-index');
    return keyEl ? keyEl.textContent.trim().replace(':', '') : 'UNKNOWN';
  });

  const expectedArrays = ['projects', 'teams', 'members', 'skills'];
  const arrayNamesPass = expectedArrays.every(name => arrayNames.includes(name));

  console.log(`%c[TEST 2] Array Names`, 'font-weight: bold; font-size: 14px');
  console.log(`  Found:`, arrayNames);
  console.log(`  Expected:`, expectedArrays);
  console.log(`  Status: ${arrayNamesPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  // Test 3: Check expanded nodes
  const expandedNodes = document.querySelectorAll('.node-expanded');
  const expandedPass = expandedNodes.length >= 4; // At least 4 nodes should be expanded

  console.log(`%c[TEST 3] Auto-Expansion`, 'font-weight: bold; font-size: 14px');
  console.log(`  Expanded nodes: ${expandedNodes.length}`);
  console.log(`  Expected: ≥ 4`);
  console.log(`  Status: ${expandedPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  // Test 4: Check for specific array paths in DOM
  const arrayPathsInDom = [];
  checkboxes.forEach(cb => {
    const node = cb.closest('.json-tree-node');
    if (node) {
      const keyEl = node.querySelector('.node-key, .node-array-index');
      if (keyEl) {
        arrayPathsInDom.push(keyEl.textContent.trim().replace(':', ''));
      }
    }
  });

  const allArraysPresent = ['projects', 'teams', 'members', 'skills']
    .every(arr => arrayPathsInDom.includes(arr));

  console.log(`%c[TEST 4] DOM Structure`, 'font-weight: bold; font-size: 14px');
  console.log(`  Arrays in DOM:`, arrayPathsInDom);
  console.log(`  Status: ${allArraysPresent ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  // Test 5: Check console logs for autoExpandArrayContainers
  console.log(`%c[TEST 5] Console Logs`, 'font-weight: bold; font-size: 14px');
  console.log(`  Look for logs above matching:`);
  console.log(`    - [autoExpandArrayContainers] Starting auto-expansion...`);
  console.log(`    - [autoExpandArrayContainers] Expanding X paths...`);
  console.log(`    - [autoExpandArrayContainers] Auto-expansion complete`);
  console.log('');

  // Final verdict
  const allTestsPass = checkboxPass && arrayNamesPass && expandedPass && allArraysPresent;

  console.log('═══════════════════════════════════════════════════════════');
  console.log('%c FINAL VERDICT', 'font-weight: bold; font-size: 16px');
  console.log('═══════════════════════════════════════════════════════════');

  if (allTestsPass) {
    console.log('%c ✅✅✅ ALL TESTS PASSED! ✅✅✅', 'color: #4CAF50; font-weight: bold; font-size: 18px; padding: 10px');
    console.log('%c The nested arrays fix is working correctly!', 'color: #4CAF50; font-size: 14px');
  } else {
    console.log('%c ❌ SOME TESTS FAILED', 'color: #F44336; font-weight: bold; font-size: 18px; padding: 10px');
    console.log('%c Failed tests:', 'color: #F44336; font-size: 14px');
    if (!checkboxPass) console.log('   - Checkbox count incorrect');
    if (!arrayNamesPass) console.log('   - Array names missing');
    if (!expandedPass) console.log('   - Not enough nodes expanded');
    if (!allArraysPresent) console.log('   - Arrays not present in DOM');
    console.log('');
    console.log('%c Debug steps:', 'color: #FF9800; font-weight: bold');
    console.log('1. Check if autoExpandArrayContainers logs appear above');
    console.log('2. Verify arrayPaths are detected (run: window.__vue__?.$children[0]?.arrayPaths)');
    console.log('3. Try manual expansion test (see RENDERING_DEBUG_STEPS.md)');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Return result for programmatic access
  return {
    passed: allTestsPass,
    results: {
      checkboxCount: { actual: checkboxCount, expected: 4, pass: checkboxPass },
      arrayNames: { actual: arrayNames, expected: expectedArrays, pass: arrayNamesPass },
      expandedNodes: { actual: expandedNodes.length, expected: '≥4', pass: expandedPass },
      domStructure: { pass: allArraysPresent }
    }
  };
})();
