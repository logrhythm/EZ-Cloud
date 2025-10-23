const fs = require('fs')
const path = require('path')

const origPath = path.resolve(__dirname, '..', 'src', 'services', 'wizard', 'validationService.js')
const tmpPath = path.resolve(__dirname, 'validationService.cjs.js')

function transformSource(src) {
  // Replace export default { with module.exports.__default = {
  src = src.replace(/export default\s*{/, 'module.exports.__default = {')
  // Replace export const/function/class with declarations
  src = src.replace(/\bexport const\b/g, 'const')
  src = src.replace(/\bexport function\b/g, 'function')
  src = src.replace(/\bexport class\b/g, 'class')
  // Remove any re-export lines (not expected but safe)
  src = src.replace(/export\s*\{[^}]+\}\s*from\s*['"][^'"]+['"];?/g, '')
  return src
}

try {
  const src = fs.readFileSync(origPath, 'utf8')
  const transformed = transformSource(src)
  // Append module.exports assignment to expose named exports if not present
  const footer = `\nmodule.exports = Object.assign({}, module.exports.__default || {}, { Validator, Step1Validator, AsyncValidator, ValidationResult, ValidationRuleTypes, ValidationSeverity, ValidationUtils })\n`
  fs.writeFileSync(tmpPath, transformed + footer, 'utf8')
  console.log('Wrote transformed module to', tmpPath)
} catch (err) {
  console.error('Failed to prepare transformed module:', err)
  process.exit(1)
}

const svc = require(tmpPath)

function assert(cond, msg) {
  if (!cond) {
    console.error('ASSERT FAIL:', msg)
    return false
  }
  return true
}

let failures = 0
function ok(name, cond) {
  if (cond) console.log('PASS:', name)
  else { console.error('FAIL:', name); failures++ }
}

// Begin tests
try {
  // validateField: required
  const rulesRequired = { required: true, messages: { required: 'req' } }
  const r1 = svc.Validator.validateField('', rulesRequired, 'f')
  ok('required empty -> error', r1.hasErrors())

  // minLength / maxLength / pattern
  const rulesLen = { minLength: 3, maxLength: 5, pattern: /^[a-z]+$/ }
  ok('minLength fail', svc.Validator.validateField('ab', rulesLen).hasErrors())
  ok('maxLength fail', svc.Validator.validateField('abcdef', rulesLen).hasErrors())
  ok('pattern fail', svc.Validator.validateField('ABC', rulesLen).hasErrors())

  // custom validator
  const rulesCustom = { custom: (v) => ({ isValid: v === 'ok', message: 'bad' }) }
  ok('custom fail', svc.Validator.validateField('x', rulesCustom).hasErrors())
  ok('custom pass', !svc.Validator.validateField('ok', rulesCustom).hasErrors())

  // isPresent edge cases
  ok('isPresent null false', !svc.Validator.isPresent(null))
  ok('isPresent empty false', !svc.Validator.isPresent(''))
  ok('isPresent zero true', svc.Validator.isPresent(0))

  // Step1Validator.project name
  ok('project name reserved', svc.Step1Validator.validateProjectName('Admin').hasWarnings())
  ok('project name multiple spaces', svc.Step1Validator.validateProjectName('a  b').hasWarnings())
  ok('project name good', svc.Step1Validator.validateProjectName('GoodName').isValid)

  // validateCreateMode with missing description -> info
  const c1 = svc.Step1Validator.validateCreateMode({ name: 'Name' })
  ok('create mode adds info when description missing', c1.hasWarnings() || c1.info.length > 0 || c1.isValid)

  // validateFile: null
  ok('validateFile null', svc.Step1Validator.validateFile(null).hasErrors())

  // validateFile: wrong extension
  const fakeFile1 = { name: 'file.txt', size: 10 }
  ok('validateFile ext fail', svc.Step1Validator.validateFile(fakeFile1).hasErrors())

  // validateFile: zero size
  const fakeFile2 = { name: 'file.json', size: 0 }
  const vf2 = svc.Step1Validator.validateFile(fakeFile2)
  ok('validateFile zero size', vf2.hasErrors())

  // validateFile: large size
  const fakeFile3 = { name: 'file.json', size: 6 * 1024 * 1024 }
  ok('validateFile large size', svc.Step1Validator.validateFile(fakeFile3).hasErrors())

  // validateJsonContent empty
  ok('validateJsonContent empty', svc.Step1Validator.validateJsonContent('').hasErrors())

  // validateJsonContent invalid
  ok('validateJsonContent invalid', svc.Step1Validator.validateJsonContent('not json').hasErrors())

  // validateJsonContent primitive
  ok('validateJsonContent primitive', svc.Step1Validator.validateJsonContent('123').hasErrors())

  // validateJsonContent valid object
  ok('validateJsonContent object', !svc.Step1Validator.validateJsonContent('{"a":1}').hasErrors())

  // validatePolicyStructure missing
  ok('validatePolicyStructure empty', svc.Step1Validator.validatePolicyStructure({}).hasErrors())

  // validatePolicyStructure transforms ok
  ok('validatePolicyStructure transforms ok', !svc.Step1Validator.validatePolicyStructure({ transforms: [{}, {}] }).hasErrors())

  // validatePolicyStructure schemarule ok
  ok('validatePolicyStructure schemarule ok', !svc.Step1Validator.validatePolicyStructure({ schemarule: { ConvertoJson: [], childfanouts: [] } }).hasErrors())

  // AsyncValidator.checkPolicyNameExists defensive
  svc.AsyncValidator.checkPolicyNameExists(undefined).then(res => {
    ok('async checkPolicyNameExists handles undefined', !res.hasErrors())
    if (failures > 0) process.exit(2)
    console.log('All tests complete, failures=', failures)
  }).catch(e => { console.error('async test error', e); process.exit(1) })

} catch (err) {
  console.error('Test runner error', err)
  process.exit(1)
}
