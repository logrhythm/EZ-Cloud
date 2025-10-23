import fs from 'fs/promises'
import path from 'path'
import { Step1Validator } from '../src/services/wizard/validationService.js'
import PolicyFileService from '../src/services/wizard/policyFileService.js'

const policyPath = path.resolve('./frontend_standalone/aws_cloud_trail_action_mult_Policy.json')

async function run () {
  try {
    const raw = await fs.readFile(policyPath, 'utf8')
    console.log('Read policy file:', policyPath)

    // UI validation path: Step1Validator.validateJsonContent
    const validateResult = Step1Validator.validateJsonContent(raw)
    console.log('Step1Validator.validateJsonContent => isValid:', validateResult.isValid)
    console.log('Messages:', validateResult.getAllMessages().map(m => `[${m.severity}] ${m.field}: ${m.message}`))

    // PolicyFileService.parseJsonContent path
    const parseResult = await PolicyFileService.parseJsonContent(raw)
    console.log('PolicyFileService.parseJsonContent => success:', parseResult.success)
    if (!parseResult.success) console.log('parse error:', parseResult.error)
    else console.log('Parsed keys:', Object.keys(parseResult.data))
  } catch (err) {
    console.error('Test execution failed:', err.message || err)
    process.exitCode = 1
  }
}

run()
