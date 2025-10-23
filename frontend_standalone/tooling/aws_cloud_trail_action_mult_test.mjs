import fs from 'fs/promises'
import path from 'path'
import { Step1Validator } from '../src/services/wizard/validationService.js'

// Adjust this path if your backup file lives elsewhere
const policyPath = path.resolve('g:/backup/src/github/Logrhythm/LRSIEM/Source/LogRhythm/scsmw/Policies/aws_cloud_trail_action_mult_Policy.json')

async function run () {
  try {
    const raw = await fs.readFile(policyPath, 'utf8')
    console.log('Read policy file:', policyPath)

    // Strip comments (Step1Validator provides a helper)
    const withoutComments = Step1Validator.stripCommentsPreserveStrings ? Step1Validator.stripCommentsPreserveStrings(raw) : raw

    // Remove trailing commas before } or ]
    const cleaned = withoutComments.replace(/,\s*(\}|\])/g, '$1')

    // Extract JSON substring
    const jsonText = Step1Validator.extractJsonFromText(cleaned)
    if (!jsonText) {
      console.error('ERROR: Could not extract JSON from file (start or matching end brace missing)')
      process.exitCode = 2
      return
    }

    // Parse
    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch (e) {
      console.error('ERROR: JSON.parse failed:', e.message)
      process.exitCode = 3
      return
    }

    console.log('Parsed JSON keys:', Object.keys(parsed))

    // Validate structure
    const structureResult = Step1Validator.validatePolicyStructure(parsed)
    const all = structureResult.getAllMessages()

    if (all.length === 0) {
      console.log('No validation messages. Structure appears valid.')
    } else {
      console.log('Validation messages:')
      all.forEach(m => console.log(` - [${m.severity}] ${m.field}: ${m.message}`))
    }

    if (!structureResult.isValid) {
      console.error('Policy structure is INVALID')
      process.exitCode = 1
    } else {
      console.log('Policy structure is valid (no errors).')
    }
  } catch (err) {
    console.error('Test execution failed:', err.message || err)
    process.exitCode = 4
  }
}

run()
