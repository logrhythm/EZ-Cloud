/**
 * Smart Recommendations Engine
 * Analyzes sample data to suggest relevant operations
 *
 * @module utils/operationRecommendations
 */

import { OPERATION_TYPES } from '../constants/operations'

/**
 * Analyze field and sample value to recommend operations
 *
 * @param {string} fieldPath - JSON path to the field
 * @param {any} sampleValue - Sample value from the field
 * @param {string} fieldType - Type of the field (string, number, object, array)
 * @returns {Array} Array of recommendations with confidence scores
 */
export function analyzeFieldAndRecommend (fieldPath, sampleValue, fieldType = 'string') {
  const recommendations = []

  // Convert sample value to string for analysis
  const valueStr = String(sampleValue || '')
  const lowerFieldPath = (fieldPath || '').toLowerCase()

  // IP Address Detection
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(valueStr)) {
    recommendations.push({
      operation: OPERATION_TYPES.ISIP,
      confidence: 0.95,
      reason: 'Value matches IPv4 address pattern',
      suggestedParams: {}
    })
    recommendations.push({
      operation: OPERATION_TYPES.REGEX,
      confidence: 0.85,
      reason: 'Can extract IP from complex strings',
      suggestedParams: {
        pattern: '/(\\d+\\.\\d+\\.\\d+\\.\\d+)/',
        captureGroup: 1
      }
    })
  }

  // Unix Timestamp Detection (10 digits = seconds, 13 = milliseconds, 16 = microseconds)
  if (/^\d{10}$/.test(valueStr)) {
    recommendations.push({
      operation: OPERATION_TYPES.EPOCHSECS_TO_DATETIME,
      confidence: 0.90,
      reason: 'Value looks like Unix timestamp (seconds)',
      suggestedParams: {
        format: 'yyyy-MM-dd HH:mm:ss'
      }
    })
  }

  if (/^\d{13}$/.test(valueStr)) {
    recommendations.push({
      operation: OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME,
      confidence: 0.90,
      reason: 'Value looks like Unix timestamp (milliseconds)',
      suggestedParams: {
        format: 'yyyy-MM-dd HH:mm:ss.SSS'
      }
    })
  }

  if (/^\d{16}$/.test(valueStr)) {
    recommendations.push({
      operation: OPERATION_TYPES.EPOCHMICROS_TO_DATETIME,
      confidence: 0.90,
      reason: 'Value looks like Unix timestamp (microseconds)',
      suggestedParams: {
        format: 'yyyy-MM-dd HH:mm:ss.SSSSSS'
      }
    })
  }

  // Email Detection
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(valueStr)) {
    recommendations.push({
      operation: OPERATION_TYPES.REGEX,
      confidence: 0.92,
      reason: 'Value looks like an email address',
      suggestedParams: {
        pattern: '/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/',
        captureGroup: 1
      }
    })
  }

  // Delimiter Detection for SPLIT
  const delimiters = [
    { char: '=', name: 'equals sign', pattern: 'key=value' },
    { char: ':', name: 'colon', pattern: 'key:value' },
    { char: ',', name: 'comma', pattern: 'CSV format' },
    { char: '|', name: 'pipe', pattern: 'pipe-delimited' },
    { char: ';', name: 'semicolon', pattern: 'semicolon-delimited' },
    { char: '\t', name: 'tab', pattern: 'tab-delimited' },
    { char: ' ', name: 'space', pattern: 'space-separated' }
  ]

  for (const delimiter of delimiters) {
    if (valueStr.includes(delimiter.char)) {
      const parts = valueStr.split(delimiter.char)
      if (parts.length > 1) {
        recommendations.push({
          operation: OPERATION_TYPES.SPLIT,
          confidence: 0.75,
          reason: `Value contains "${delimiter.name}" delimiter (${delimiter.pattern})`,
          suggestedParams: {
            delimiter: delimiter.char,
            index: 1
          }
        })
        break // Only suggest first found delimiter
      }
    }
  }

  // URL Detection
  if (/^https?:\/\//.test(valueStr)) {
    recommendations.push({
      operation: OPERATION_TYPES.REGEX,
      confidence: 0.88,
      reason: 'Value looks like a URL',
      suggestedParams: {
        pattern: '/(https?:\\/\\/[^\\s]+)/',
        captureGroup: 1
      }
    })
  }

  // JSON String Detection
  if ((valueStr.startsWith('{') && valueStr.endsWith('}')) ||
      (valueStr.startsWith('[') && valueStr.endsWith(']'))) {
    try {
      JSON.parse(valueStr)
      recommendations.push({
        operation: OPERATION_TYPES.REGEX,
        confidence: 0.70,
        reason: 'Value appears to be JSON string',
        suggestedParams: {
          pattern: '/(.+)/',
          captureGroup: 1
        }
      })
    } catch (e) {
      // Not valid JSON
    }
  }

  // Field Name Hints
  if (lowerFieldPath.includes('date') || lowerFieldPath.includes('time') ||
      lowerFieldPath.includes('timestamp') || lowerFieldPath.includes('created') ||
      lowerFieldPath.includes('updated') || lowerFieldPath.includes('modified')) {
    recommendations.push({
      operation: OPERATION_TYPES.EPOCHSECS_TO_DATETIME,
      confidence: 0.65,
      reason: 'Field name suggests date/time value',
      suggestedParams: {
        format: 'yyyy-MM-dd HH:mm:ss'
      }
    })
  }

  if (lowerFieldPath.includes('ip') || lowerFieldPath.includes('address')) {
    recommendations.push({
      operation: OPERATION_TYPES.ISIP,
      confidence: 0.70,
      reason: 'Field name suggests IP address',
      suggestedParams: {}
    })
  }

  if (lowerFieldPath.includes('email') || lowerFieldPath.includes('mail')) {
    recommendations.push({
      operation: OPERATION_TYPES.REGEX,
      confidence: 0.70,
      reason: 'Field name suggests email address',
      suggestedParams: {
        pattern: '/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/',
        captureGroup: 1
      }
    })
  }

  // Numeric Operations for number types
  if (fieldType === 'number' || !isNaN(Number(valueStr))) {
    recommendations.push({
      operation: OPERATION_TYPES.ADD,
      confidence: 0.60,
      reason: 'Can perform mathematical operations on numeric values',
      suggestedParams: {
        value: 0
      }
    })
  }

  // Array Operations for array types
  if (fieldType === 'array' || Array.isArray(sampleValue)) {
    recommendations.push({
      operation: OPERATION_TYPES.CONCATARRAY,
      confidence: 0.80,
      reason: 'Can join array elements with delimiter',
      suggestedParams: {
        delimiter: ', '
      }
    })
  }

  // Remove duplicates and sort by confidence
  const uniqueOps = new Map()
  for (const rec of recommendations) {
    if (!uniqueOps.has(rec.operation) || uniqueOps.get(rec.operation).confidence < rec.confidence) {
      uniqueOps.set(rec.operation, rec)
    }
  }

  return Array.from(uniqueOps.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5) // Return top 5 recommendations
}

/**
 * Get field type from sample value
 *
 * @param {any} sampleValue - Sample value to analyze
 * @returns {string} Field type (string, number, object, array, boolean, null)
 */
export function getFieldType (sampleValue) {
  if (sampleValue === null || sampleValue === undefined) return 'null'
  if (Array.isArray(sampleValue)) return 'array'
  if (typeof sampleValue === 'object') return 'object'
  if (typeof sampleValue === 'number') return 'number'
  if (typeof sampleValue === 'boolean') return 'boolean'
  return 'string'
}

/**
 * Explain why an operation is recommended
 *
 * @param {string} operationType - Operation type
 * @param {any} sampleValue - Sample value
 * @returns {string} Explanation text
 */
export function explainRecommendation (operationType, sampleValue) {
  switch (operationType) {
    case OPERATION_TYPES.ISIP:
      return 'This validates whether the value is a valid IP address.'
    case OPERATION_TYPES.REGEX:
      return 'This extracts specific patterns from text using regular expressions.'
    case OPERATION_TYPES.SPLIT:
      return 'This splits the text by a delimiter and extracts a specific part.'
    case OPERATION_TYPES.EPOCHSECS_TO_DATETIME:
    case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME:
    case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME:
      return 'This converts Unix timestamps to human-readable date/time format.'
    case OPERATION_TYPES.CONCATARRAY:
      return 'This joins array elements into a single string.'
    case OPERATION_TYPES.ADD:
    case OPERATION_TYPES.SUBTRACT:
    case OPERATION_TYPES.MULTIPLY:
    case OPERATION_TYPES.DIVIDE:
      return 'This performs mathematical operations on numeric values.'
    default:
      return 'This operation can transform your data.'
  }
}

export default {
  analyzeFieldAndRecommend,
  getFieldType,
  explainRecommendation
}
