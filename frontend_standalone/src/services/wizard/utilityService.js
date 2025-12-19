/**
 * Utility Service for Wizard
 * Provides utility functions for debouncing, throttling, and auto-save
 */

/**
 * Debounce function - delays execution until after wait period
 */
export function debounce (func, wait = 300, immediate = false) {
  let timeout, lastArgs, lastThis, result

  const later = function () {
    timeout = null
    if (!immediate && lastArgs) {
      result = func.apply(lastThis, lastArgs)
    }
    lastArgs = lastThis = null
  }

  function debounced (...args) {
    lastArgs = args
    lastThis = this

    const callNow = immediate && !timeout

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) {
      result = func.apply(lastThis, lastArgs)
      lastArgs = lastThis = null
    }

    return result
  }

  debounced.cancel = () => {
    clearTimeout(timeout)
    timeout = null
    lastArgs = lastThis = null
  }

  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout)
      later()
    }
  }

  return debounced
}

/**
 * Throttle function - limits execution rate
 */
export function throttle (func, wait = 300) {
  let timeout = null
  let lastRan = 0

  function throttled (...args) {
    const context = this
    const now = Date.now()

    if (!lastRan) {
      func.apply(context, args)
      lastRan = now
      return
    }

    const remaining = wait - (now - lastRan)

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        func.apply(context, args)
        lastRan = Date.now()
        timeout = null
      }, remaining)
    }
  }

  throttled.cancel = () => {
    clearTimeout(timeout)
    timeout = null
    lastRan = 0
  }

  return throttled
}

/**
 * Auto-save manager
 */
export class AutoSaveManager {
  constructor (options = {}) {
    this.enabled = options.enabled !== false
    this.interval = options.interval || 30000 // 30 seconds
    this.onSave = options.onSave || (() => {})
    this.onError = options.onError || ((error) => console.error('Auto-save error:', error))
    this.debug = options.debug || false

    this.timer = null
    this.isDirty = false
    this.isSaving = false
    this.lastSaveTime = null
  }

  /**
   * Start auto-save timer
   */
  start () {
    if (!this.enabled) return

    this.log('Auto-save started')

    this.timer = setInterval(async () => {
      if (this.isDirty && !this.isSaving) {
        await this.save()
      }
    }, this.interval)
  }

  /**
   * Stop auto-save timer
   */
  stop () {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
      this.log('Auto-save stopped')
    }
  }

  /**
   * Mark data as dirty (needs save)
   */
  markDirty () {
    this.isDirty = true
    this.log('Data marked as dirty')
  }

  /**
   * Perform save operation
   */
  async save () {
    if (this.isSaving) {
      this.log('Save already in progress, skipping')
      return { success: false, reason: 'already_saving' }
    }

    this.isSaving = true
    this.log('Saving...')

    try {
      await this.onSave()
      this.isDirty = false
      this.lastSaveTime = new Date()
      this.log('Save successful')
      return { success: true, timestamp: this.lastSaveTime }
    } catch (error) {
      this.log('Save failed:', error)
      this.onError(error)
      return { success: false, error }
    } finally {
      this.isSaving = false
    }
  }

  /**
   * Force immediate save
   */
  async forceSave () {
    this.markDirty()
    return await this.save()
  }

  /**
   * Get last save time
   */
  getLastSaveTime () {
    return this.lastSaveTime
  }

  /**
   * Check if data needs saving
   */
  needsSave () {
    return this.isDirty
  }

  /**
   * Log debug messages
   */
  log (...args) {
    if (this.debug) {
      console.log('[AutoSave]', ...args)
    }
  }

  /**
   * Cleanup
   */
  destroy () {
    this.stop()
    this.onSave = null
    this.onError = null
  }
}

/**
 * Deep clone utility
 */
export function deepClone (obj) {
  // Use structuredClone when available (handles many built-ins and circulars in modern browsers)
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(obj)
    } catch (e) {
      // fallback to manual clone below
    }
  }

  const seen = new WeakMap()

  function _clone (value) {
    if (value === null || typeof value !== 'object') return value
    if (value instanceof Date) return new Date(value.getTime())
    if (value instanceof RegExp) return new RegExp(value)
    if (value instanceof Map) {
      const m = new Map()
      seen.set(value, m)
      value.forEach((v, k) => m.set(k, _clone(v)))
      return m
    }
    if (value instanceof Set) {
      const s = new Set()
      seen.set(value, s)
      value.forEach(v => s.add(_clone(v)))
      return s
    }

    if (seen.has(value)) return seen.get(value)

    if (Array.isArray(value)) {
      const arr = []
      seen.set(value, arr)
      value.forEach((v, i) => { arr[i] = _clone(v) })
      return arr
    }

    const clonedObj = {}
    seen.set(value, clonedObj)

    Reflect.ownKeys(value).forEach((key) => {
      clonedObj[key] = _clone(value[key])
    })

    return clonedObj
  }

  return _clone(obj)
}

/**
 * Deep comparison utility
 */
export function deepEqual (obj1, obj2) {
  if (obj1 === obj2) return true

  if (obj1 === null || obj2 === null) return false

  if (obj1 instanceof Date && obj2 instanceof Date) return obj1.getTime() === obj2.getTime()

  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    if (!Array.isArray(obj1) || !Array.isArray(obj2)) return false
    if (obj1.length !== obj2.length) return false
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false
    }
    return true
  }

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false

  if (obj1.constructor !== obj2.constructor) return false

  const keys1 = Reflect.ownKeys(obj1)
  const keys2 = Reflect.ownKeys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

/**
 * Generate unique ID
 */
export function generateId (prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes (bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Format timestamp to readable string
 */
export function formatTimestamp (timestamp, format = 'datetime') {
  const date = new Date(timestamp)

  const options = {
    datetime: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    date: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    },
    relative: null // Special case
  }

  if (format === 'relative') {
    return formatRelativeTime(timestamp)
  }

  return date.toLocaleString('en-US', options[format] || options.datetime)
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime (timestamp) {
  const now = Date.now()
  const date = new Date(timestamp)
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin === 1) return '1 minute ago'
  if (diffMin < 60) return `${diffMin} minutes ago`
  if (diffHour === 1) return '1 hour ago'
  if (diffHour < 24) return `${diffHour} hours ago`
  if (diffDay === 1) return 'yesterday'
  if (diffDay < 7) return `${diffDay} days ago`

  return formatTimestamp(timestamp, 'date')
}

/**
 * Retry utility with exponential backoff
 */
export async function retry (fn, options = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    onRetry = () => {}
  } = options

  let lastError

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(backoff, attempt - 1)
        onRetry(attempt, waitTime, error)
        await sleep(waitTime)
      }
    }
  }

  throw lastError
}

/**
 * Sleep utility
 */
export function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Truncate string with ellipsis
 */
export function truncate (str, maxLength = 50, ellipsis = '...') {
  if (!str || str.length <= maxLength) return str
  return str.substring(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * Sanitize filename
 */
export function sanitizeFilename (filename) {
  return filename
    .replace(/[^a-z0-9_\-.]/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Get file extension
 */
export function getFileExtension (filename) {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Validate JSON path
 */
export function isValidJsonPath (path) {
  // Basic JSONPath validation
  if (!path || typeof path !== 'string') return false

  // Should start with $ or @
  if (!path.startsWith('$') && !path.startsWith('@')) return false

  // Check for invalid characters (basic check)
  const invalidChars = /[^\w$.@[\]*-]/
  if (invalidChars.test(path)) return false

  return true
}

/**
 * Parse JSON safely
 */
export function safeJsonParse (str, defaultValue = null) {
  try {
    return JSON.parse(str)
  } catch (error) {
    return defaultValue
  }
}

/**
 * Stringify JSON safely
 */
export function safeJsonStringify (obj, pretty = false) {
  try {
    return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj)
  } catch (error) {
    return null
  }
}

/**
 * Get a property from an object in a case-insensitive manner
 * @param {Object} obj - The object to search
 * @param {String} propertyName - The property name to find (case-insensitive)
 * @returns {*} The property value, or undefined if not found
 */
export function getCaseInsensitiveProperty (obj, propertyName) {
  if (!obj || typeof obj !== 'object') {
    return undefined
  }

  // First try exact match (performance optimization)
  if (propertyName in obj) {
    return obj[propertyName]
  }

  // Try case-insensitive match
  const lowerPropName = propertyName.toLowerCase()
  const keys = Object.keys(obj)

  for (const key of keys) {
    if (key.toLowerCase() === lowerPropName) {
      return obj[key]
    }
  }

  return undefined
}

/**
 * Resolve a JSONPath expression against sample data with case-insensitive field matching
 * Handles array notation like [0], [*], and nested paths like $.events[0].name
 *
 * @param {Object|Array} sampleData - The sample data to traverse
 * @param {String} jsonPath - JSONPath expression (e.g., "$.log", "$.events[*].name")
 * @returns {*} The value at the path, or undefined if not found
 */
export function resolveJsonPathCaseInsensitive (sampleData, jsonPath) {
  try {
    if (!sampleData || !jsonPath) {
      return undefined
    }

    // Normalize path: remove leading $. or @.
    const normalizedPath = jsonPath.replace(/^[$@]\./, '')

    if (normalizedPath === '') {
      // Root path
      return sampleData
    }

    // Split path by dots, but preserve array notation
    const parts = normalizedPath.split('.')
    let current = sampleData

    for (let i = 0; i < parts.length; i++) {
      if (current === null || current === undefined) {
        return undefined
      }

      const part = parts[i]

      // Security: Prevent prototype pollution
      if (part === '__proto__' || part === 'constructor' || part === 'prototype') {
        return undefined
      }

      // Handle array notation: "fieldName[0]" or "fieldName[*]"
      const arrayMatch = part.match(/^(.+?)\[(\d+|\*)\]$/)

      if (arrayMatch) {
        // Extract field name and array index
        const fieldName = arrayMatch[1]
        const arrayIndex = arrayMatch[2]

        // Get the field value using case-insensitive lookup
        current = getCaseInsensitiveProperty(current, fieldName)

        if (!Array.isArray(current)) {
          return undefined
        }

        // Handle array access
        if (arrayIndex === '*') {
          // Wildcard - use first element for further traversal
          if (current.length === 0) {
            return undefined
          }
          current = current[0]
        } else {
          // Specific index
          const index = parseInt(arrayIndex, 10)
          if (index < 0 || index >= current.length) {
            return undefined
          }
          current = current[index]
        }
      } else if (/^\d+$/.test(part)) {
        // Standalone numeric index (for already accessed arrays)
        const index = parseInt(part, 10)
        if (!Array.isArray(current) || index < 0 || index >= current.length) {
          return undefined
        }
        current = current[index]
      } else {
        // Regular property access - case-insensitive
        current = getCaseInsensitiveProperty(current, part)
      }
    }

    return current
  } catch (error) {
    console.error('[UtilityService] Error resolving JSONPath:', error)
    return undefined
  }
}

/**
 * Check if a JSONPath expression exists in sample data (case-insensitive)
 *
 * @param {Object|Array} sampleData - The sample data to check
 * @param {String} jsonPath - JSONPath expression (e.g., "$.log", "$.events[0].name")
 * @returns {Boolean} True if the path exists and resolves to a non-null/undefined value
 */
export function checkJsonPathExists (sampleData, jsonPath) {
  try {
    const value = resolveJsonPathCaseInsensitive(sampleData, jsonPath)
    return value !== undefined && value !== null
  } catch (error) {
    console.error('[UtilityService] Error checking JSONPath existence:', error)
    return false
  }
}

/**
 * Extract multiple values from sample data using JSONPath with wildcard support
 * For paths like $.events[*].name, returns an array of all matching values
 *
 * @param {Object|Array} sampleData - The sample data to traverse
 * @param {String} jsonPath - JSONPath expression
 * @returns {Array} Array of matched values (empty array if none found)
 */
export function extractJsonPathValues (sampleData, jsonPath) {
  try {
    if (!sampleData || !jsonPath) {
      return []
    }

    // Check if path contains wildcard
    if (!jsonPath.includes('[*]')) {
      // Simple path - return single value as array
      const value = resolveJsonPathCaseInsensitive(sampleData, jsonPath)
      return value !== undefined ? [value] : []
    }

    // Handle wildcard paths
    const normalizedPath = jsonPath.replace(/^[$@]\./, '')
    const parts = normalizedPath.split('.')
    let results = [sampleData]

    for (const part of parts) {
      const newResults = []

      for (const current of results) {
        if (current === null || current === undefined) {
          continue
        }

        // Security check
        if (part === '__proto__' || part === 'constructor' || part === 'prototype') {
          continue
        }

        const arrayMatch = part.match(/^(.+?)\[(\d+|\*)\]$/)

        if (arrayMatch) {
          const fieldName = arrayMatch[1]
          const arrayIndex = arrayMatch[2]

          const fieldValue = getCaseInsensitiveProperty(current, fieldName)

          if (Array.isArray(fieldValue)) {
            if (arrayIndex === '*') {
              // Wildcard - add all array elements
              newResults.push(...fieldValue)
            } else {
              const index = parseInt(arrayIndex, 10)
              if (index >= 0 && index < fieldValue.length) {
                newResults.push(fieldValue[index])
              }
            }
          }
        } else if (/^\d+$/.test(part)) {
          const index = parseInt(part, 10)
          if (Array.isArray(current) && index >= 0 && index < current.length) {
            newResults.push(current[index])
          }
        } else {
          const value = getCaseInsensitiveProperty(current, part)
          if (value !== undefined) {
            newResults.push(value)
          }
        }
      }

      results = newResults
    }

    return results.filter(r => r !== undefined && r !== null)
  } catch (error) {
    console.error('[UtilityService] Error extracting JSONPath values:', error)
    return []
  }
}

/**
 * Local storage wrapper with error handling
 */
export const storage = {
  _hasLocalStorage () {
    try {
      return typeof window !== 'undefined' && !!window.localStorage
    } catch (e) {
      return false
    }
  },

  get (key, defaultValue = null) {
    if (!this._hasLocalStorage()) return defaultValue
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue
    }
  },

  set (key, value) {
    if (!this._hasLocalStorage()) return false
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Storage set error:', error)
      return false
    }
  },

  remove (key) {
    if (!this._hasLocalStorage()) return false
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Storage remove error:', error)
      return false
    }
  },

  clear () {
    if (!this._hasLocalStorage()) return false
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  },

  has (key) {
    if (!this._hasLocalStorage()) return false
    try {
      return localStorage.getItem(key) !== null
    } catch (error) {
      console.error('Storage has error:', error)
      return false
    }
  }
}

export default {
  debounce,
  throttle,
  AutoSaveManager,
  deepClone,
  deepEqual,
  generateId,
  formatBytes,
  formatTimestamp,
  formatRelativeTime,
  retry,
  sleep,
  truncate,
  sanitizeFilename,
  getFileExtension,
  isValidJsonPath,
  safeJsonParse,
  safeJsonStringify,
  storage,
  getCaseInsensitiveProperty,
  resolveJsonPathCaseInsensitive,
  checkJsonPathExists,
  extractJsonPathValues
}
