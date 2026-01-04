/**
 * PathNormalizer Utility
 * Centralizes all JSON path normalization and matching logic for fanout arrays
 *
 * This utility provides a single source of truth for:
 * - Path normalization (removing prefixes, wildcards, indices)
 * - Path variation generation (all possible formats)
 * - Case-insensitive path matching
 * - Absolute path construction from relative paths
 *
 * DEFAULT BEHAVIOR (NEW):
 * By default, normalize() PRESERVES array hierarchy using [*] wildcards:
 * - Input:  "$.arr1[0].childarr[1].childarr2[*]"
 * - Output: "arr1[*].childarr[*].childarr2[*]"
 *
 * This shows parent-child array relationships:
 * - arr1[*] is the parent array
 * - childarr[*] is a child array of arr1
 * - childarr2[*] is a child array of childarr
 *
 * IMPORTANT: Different use cases require different normalization strategies:
 *
 * 1. FANOUT ARRAY PATHS (DEFAULT - for displaying hierarchy):
 *    Use: { removePrefix: true, removeWildcards: false, removeIndices: true }
 *    Example: "$.arr1[0].childarr[1]" → "arr1[*].childarr[*]"
 *    Why: Shows parent-child array relationships clearly
 *
 * 2. FANOUT ARRAY MATCHING (for matching against flat candidates):
 *    Use: { removePrefix: true, removeWildcards: true, removeIndices: true }
 *    Example: "$.arr1[*].childarr[*]" → "arr1.childarr"
 *    Why: Some candidates are stored without [*] wildcards
 *
 * 3. FIELD EXISTENCE CHECKING (for traversing objects):
 *    Use: { removePrefix: true, removeWildcards: false, removeIndices: false }
 *    Example: "$.arr1[0].childarr[1]" → "arr1[0].childarr[1]"
 *    Why: Need to preserve exact array indices to traverse correctly
 *
 * 4. CASE-INSENSITIVE MATCHING (flexible):
 *    Use: PathNormalizer.match(path1, path2, false)
 *    Why: Automatically tries all variations for maximum compatibility
 */

export class PathNormalizer {
  /**
   * Normalize a JSON path by removing common prefixes and patterns
   * This is the single source of truth for path normalization
   *
   * @param {string} path - The path to normalize
   * @param {Object} options - Normalization options
   * @param {boolean} options.removePrefix - Remove $. prefix (default: true)
   * @param {boolean} options.removeWildcards - Remove [*] wildcards (default: false - KEEP wildcards to show array hierarchy)
   * @param {boolean} options.removeIndices - Remove [0], [1], etc. (default: true - replace with [*])
   * @returns {string} - The normalized path
   *
   * @example
   * PathNormalizer.normalize('$.arr1[0].childarr[1].childarr2[*]')
   * // Returns: 'arr1[*].childarr[*].childarr2[*]'
   */
  static normalize (path, options = {}) {
    if (!path || typeof path !== 'string') {
      return ''
    }

    const {
      removePrefix = true,
      removeWildcards = false, // CHANGED: Keep wildcards by default to preserve array hierarchy
      removeIndices = true // CHANGED: Remove numeric indices by default, replace with [*]
    } = options

    let normalized = path.trim()

    // Remove $. prefix
    if (removePrefix) {
      normalized = normalized.replace(/^\$\./, '')
    }

    // Remove [0], [1], etc. indices and replace with [*] to show array structure
    if (removeIndices) {
      normalized = normalized.replace(/\[\d+\]/g, '[*]')
    }

    // Remove [*] wildcards (only if explicitly requested)
    if (removeWildcards) {
      normalized = normalized.replace(/\[\*\]/g, '')
    }

    return normalized
  }

  /**
   * Get all possible variations of a path for matching
   * This generates all common formats a path might appear in
   *
   * @param {string} path - The original path
   * @returns {Array<string>} - Array of path variations
   *
   * @example
   * PathNormalizer.getAllVariations('$.requestParameters[0].changes')
   * // Returns: [
   * //   '$.requestParameters[0].changes',
   * //   'requestParameters[0].changes',
   * //   '$.requestParameters.changes',
   * //   'requestParameters.changes',
   * //   '$.requestParameters.changes',
   * //   'requestParameters.changes'
   * // ]
   */
  static getAllVariations (path) {
    if (!path || typeof path !== 'string') {
      return []
    }

    const variations = [
      path, // Original
      this.normalize(path, { removePrefix: true, removeWildcards: false, removeIndices: false }), // Without $. prefix
      this.normalize(path, { removePrefix: false, removeWildcards: true, removeIndices: false }), // Without [*] wildcards
      this.normalize(path, { removePrefix: true, removeWildcards: true, removeIndices: false }), // Without both $. and [*]
      this.normalize(path, { removePrefix: false, removeWildcards: false, removeIndices: true }), // Without [0] indices
      this.normalize(path, { removePrefix: true, removeWildcards: false, removeIndices: true }) // Without $. and [0]
    ]

    // Remove duplicates and empty strings
    return [...new Set(variations)].filter(v => v && v.trim())
  }

  /**
   * Case-insensitive path matching
   * Checks if two paths are equivalent (ignoring case and common variations)
   *
   * @param {string} path1 - First path to compare
   * @param {string} path2 - Second path to compare
   * @param {boolean} strictMode - If true, only compares normalized versions. If false, tries all variations
   * @returns {boolean} - True if paths match
   *
   * @example
   * PathNormalizer.match('$.RequestParameters', 'requestparameters')
   * // Returns: true
   */
  static match (path1, path2, strictMode = false) {
    if (!path1 || !path2) {
      return false
    }

    const p1Lower = String(path1).toLowerCase().trim()
    const p2Lower = String(path2).toLowerCase().trim()

    // Quick exact match (case-insensitive)
    if (p1Lower === p2Lower) {
      return true
    }

    if (strictMode) {
      // Strict mode: only compare normalized versions
      const normalized1 = this.normalize(path1).toLowerCase()
      const normalized2 = this.normalize(path2).toLowerCase()
      return normalized1 === normalized2
    }

    // Flexible mode: try all variations
    const variations1 = this.getAllVariations(path1).map(v => v.toLowerCase())
    const variations2 = this.getAllVariations(path2).map(v => v.toLowerCase())

    // Check if any variation of path1 matches any variation of path2
    return variations1.some(v1 => variations2.includes(v1))
  }

  /**
   * Find a matching path in a list of candidates
   * Uses case-insensitive matching with all path variations
   * Also supports SUFFIX MATCHING for nested fanout paths:
   * - Target: $.requestParameters.changeBatch.changes[*]
   * - Candidate: $.Log.Records[*].requestParameters.changeBatch.changes
   * - Match: YES (target is a suffix of candidate)
   *
   * @param {string} targetPath - The path to find
   * @param {Array<string|Object>} candidates - Array of candidate paths or objects with path property
   * @param {string} pathProperty - Property name if candidates are objects (default: 'path')
   * @param {boolean} debug - Enable debug logging (default: false)
   * @returns {string|Object|null} - The matching candidate or null
   *
   * @example
   * const candidates = ['requestParameters', 'responseElements']
   * PathNormalizer.findMatch('$.RequestParameters[*]', candidates)
   * // Returns: 'requestParameters'
   */
  static findMatch (targetPath, candidates, pathProperty = 'path', debug = false) {
    if (!targetPath || !candidates || !Array.isArray(candidates)) {
      return null
    }

    if (debug) {
      console.group('🔍 [PathNormalizer.findMatch] Searching for:', targetPath)
      console.log('📋 Candidates:', candidates.length)
    }

    const targetVariations = this.getAllVariations(targetPath)

    if (debug) {
      console.log('🔄 Target variations:', targetVariations)
    }

    // Try each variation of the target path
    for (let varIdx = 0; varIdx < targetVariations.length; varIdx++) {
      const variation = targetVariations[varIdx]
      const variationLower = variation.toLowerCase().trim()

      if (debug) {
        console.log(`\n  🔸 Trying variation [${varIdx}]: "${variation}"`)
      }

      // Search through candidates
      for (let candIdx = 0; candIdx < candidates.length; candIdx++) {
        const candidate = candidates[candIdx]

        // Extract path from candidate (support both strings and objects)
        const candidatePath = typeof candidate === 'string'
          ? candidate
          : (candidate?.[pathProperty] || '')

        const candidatePathLower = String(candidatePath).toLowerCase().trim()

        // Try exact match
        if (candidatePathLower === variationLower) {
          if (debug) {
            console.log(`      ✅ EXACT MATCH found at candidate [${candIdx}]: "${candidatePath}"`)
            console.groupEnd()
          }
          return candidate
        }

        // Try without wildcards
        const withoutWildcards = variation.replace(/\[\*\]/g, '').toLowerCase().trim()
        if (candidatePathLower === withoutWildcards) {
          if (debug) {
            console.log(`      ✅ MATCH without wildcards at candidate [${candIdx}]: "${candidatePath}"`)
            console.groupEnd()
          }
          return candidate
        }

        // Try without indices
        const withoutIndices = variation.replace(/\[\d+\]/g, '').toLowerCase().trim()
        if (candidatePathLower === withoutIndices) {
          if (debug) {
            console.log(`      ✅ MATCH without indices at candidate [${candIdx}]: "${candidatePath}"`)
            console.groupEnd()
          }
          return candidate
        }

        // NEW: Try SUFFIX MATCHING for nested fanout paths
        // This handles cases where the target path is a suffix of the candidate path
        // Example:
        //   Target:    $.requestParameters.changeBatch.changes[*]
        //   Candidate: $.Log.Records[*].requestParameters.changeBatch.changes
        //   Match: YES (target suffix matches candidate suffix)

        // Normalize both paths for suffix comparison
        const targetNormalized = this.normalize(variation, { removePrefix: true, removeWildcards: true, removeIndices: true })
        const candidateNormalized = this.normalize(candidatePath, { removePrefix: true, removeWildcards: true, removeIndices: true })

        if (debug) {
          console.log(`      🔄 Suffix check: target="${targetNormalized}" vs candidate="${candidateNormalized}"`)
        }

        // Check if candidate ends with the target (suffix match)
        if (candidateNormalized.toLowerCase().endsWith('.' + targetNormalized.toLowerCase())) {
          if (debug) {
            console.log(`      ✅ SUFFIX MATCH found at candidate [${candIdx}]: "${candidatePath}"`)
            console.log(`         Target suffix: "${targetNormalized}"`)
            console.log(`         Candidate:     "${candidateNormalized}"`)
            console.groupEnd()
          }
          return candidate
        }

        // Also check exact suffix match (without leading dot)
        if (candidateNormalized.toLowerCase() === targetNormalized.toLowerCase()) {
          if (debug) {
            console.log(`      ✅ EXACT NORMALIZED MATCH found at candidate [${candIdx}]: "${candidatePath}"`)
            console.groupEnd()
          }
          return candidate
        }
      }
    }

    if (debug) {
      console.log('\n❌ No matching candidate found')
      console.groupEnd()
    }

    return null
  }

  /**
   * Build an absolute path from a relative path and parent path
   * Handles proper joining and normalization
   *
   * @param {string} relativePath - The relative path (may have $. prefix)
   * @param {string} parentPath - The parent path
   * @returns {string} - The constructed absolute path
   *
   * @example
   * PathNormalizer.toAbsolute('$.changeBatch', 'requestParameters')
   * // Returns: 'requestParameters.changeBatch'
   */
  static toAbsolute (relativePath, parentPath) {
    if (!relativePath) {
      return parentPath || ''
    }

    if (!parentPath) {
      // No parent, just normalize the relative path
      return this.normalize(relativePath, { removePrefix: true, removeWildcards: false, removeIndices: false })
    }

    // Remove $. prefix from relative path
    const cleanRelative = relativePath.replace(/^\$\./, '')

    // Join parent and relative paths
    return `${parentPath}.${cleanRelative}`
  }

  /**
   * Split a path into its component parts
   * Handles dots and brackets properly
   *
   * @param {string} path - The path to split
   * @returns {Array<string>} - Array of path segments
   *
   * @example
   * PathNormalizer.splitPath('requestParameters.changeBatch[0].changes')
   * // Returns: ['requestParameters', 'changeBatch', '0', 'changes']
   */
  static splitPath (path) {
    if (!path || typeof path !== 'string') {
      return []
    }

    // Normalize first
    const normalized = path.replace(/^\$\./, '')

    // Split by dots and brackets, filter out empty strings
    return normalized.split(/[.[\]]+/).filter(Boolean)
  }

  /**
   * Check if a path starts with another path (prefix check)
   * Useful for finding child/descendant relationships
   *
   * @param {string} path - The full path
   * @param {string} prefix - The prefix path to check
   * @param {boolean} caseInsensitive - Use case-insensitive comparison (default: true)
   * @returns {boolean} - True if path starts with prefix
   *
   * @example
   * PathNormalizer.startsWith('requestParameters.changeBatch.changes', 'requestParameters')
   * // Returns: true
   */
  static startsWith (path, prefix, caseInsensitive = true) {
    if (!path || !prefix) {
      return false
    }

    const pathNorm = this.normalize(path)
    const prefixNorm = this.normalize(prefix)

    if (caseInsensitive) {
      return pathNorm.toLowerCase().startsWith(prefixNorm.toLowerCase() + '.') ||
             pathNorm.toLowerCase().startsWith(prefixNorm.toLowerCase() + '[')
    }

    return pathNorm.startsWith(prefixNorm + '.') ||
           pathNorm.startsWith(prefixNorm + '[')
  }

  /**
   * Get the parent path from a full path
   *
   * @param {string} path - The full path
   * @returns {string|null} - The parent path or null if no parent
   *
   * @example
   * PathNormalizer.getParent('requestParameters.changeBatch.changes')
   * // Returns: 'requestParameters.changeBatch'
   */
  static getParent (path) {
    if (!path || typeof path !== 'string') {
      return null
    }

    const normalized = this.normalize(path)
    const parts = normalized.split('.')

    if (parts.length <= 1) {
      return null
    }

    return parts.slice(0, -1).join('.')
  }

  /**
   * Get all parent paths in hierarchy
   *
   * @param {string} path - The full path
   * @returns {Array<string>} - Array of parent paths from immediate to root
   *
   * @example
   * PathNormalizer.getAllParents('requestParameters.changeBatch.changes')
   * // Returns: ['requestParameters.changeBatch', 'requestParameters']
   */
  static getAllParents (path) {
    const parents = []
    let current = this.getParent(path)

    while (current) {
      parents.push(current)
      current = this.getParent(current)
    }

    return parents
  }
}

export default PathNormalizer
