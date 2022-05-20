# Collection Method Templates

> NOTE:
>
> :warning: :warning: :warning: This is not up to date anymore :warning: :warning: :warning:

Definition:
- name
- type
  - array
    - of
  - object
    - of
  - boolean
  - string
  - number
  - regex
  - options
  - prefix
  - suffix // s, m, KiB, MiB
  - quotes // ' or " on nothing
  - default
  - min
  - max
- description
- required


```
[
  {
    name: '',
    type: {
      name: '', // array, object, boolean, string, number, regex, option
      of: { // for array and object
        type: {
          name: '', // array, object, boolean, string, number, regex, option
          multilines: false // for string and regex
          of: ...
        },
        options: [{ value: '', label: '' }, { value: '', label: '' }],
        prefix: {
          required: false,
          options: [{ value: '', label: '' }, { value: '', label: '' }],
          default: ''
        },
        suffix: {
          required: false,
          options: [{ value: '', label: '' }, { value: '', label: '' }], // s, m, KiB, MiB
          default: ''
        },
        quotes: {
          required: false,
          options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
          default: ''
        },
        default: '',
        min: null,
        max: null,
        description: '',
        required: false,
        readonly: true
      }
    },
    options: [{ value: '', label: '' }, { value: '', label: '' }],
    prefix: {
      required: false,
      options: [{ value: '', label: '' }, { value: '', label: '' }],
      default: ''
    },
    suffix: {
      required: false,
      options: [{ value: '', label: '' }, { value: '', label: '' }], // s, m, KiB, MiB
      default: ''
    },
    quotes: {
      required: false,
      options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
      default: ''
    },
    default: '',
    min: null,
    max: null,
    description: '',
    required: false,
    readonly: true
  }
]
```
