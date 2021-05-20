<template>
  <div class="row q-gutter-x-sm">
    <!-- Object leaf name, if part of an Object -->
    <q-input
      v-if="isPartOfObject"
      style="width: 20rem;"
      standout
      v-model="leafName"
      :readonly="true"
      class="col-auto"
    />
    <q-separator vertical color="orange" size="3px" v-if="template.required && !isPartOfArray && !isPartOfObject" />
    <div class="col">
      <div class="row q-gutter-x-md">
        <!-- Prefix, if any -->
        <q-select
          v-if="template.prefix"
          standout="bg-blue-4 text-white"
          v-model="internalPrefix"
          emit-value
          map-options
          :options="(template.prefix.options ? template.prefix.options : [])"
          :readonly="(template.readonly ? template.readonly : false)"
          style="min-width: 10rem;"
        />
        <!-- Text input -->
        <q-input
          v-if="template.type && template.type.name && (template.type.name === 'string' || template.type.name === 'regex' || template.type.name === 'number' || template.type.name === 'password')"
          class="col"
          :class="(template.type && template.type.textType && template.type.textType === 'json' ? 'fixed-font' : '')"
          standout="bg-blue-4 text-white"
          v-model="internalValue"
          :readonly="(template.readonly ? template.readonly : false || (isPartOfObject && leafInObject && (leafInObject === 'stream_id' || leafInObject === 'stream_name')))"
          :type="template.type && template.type.name && template.type.name === 'password' ? 'password' : 'text'"
          :autogrow="template.type && template.type.multilines && template.type.multilines === true"
        />
        <div v-if="template.type && template.type.name && template.type.name === 'array'" class="q-gutter-y-sm col">
          <FieldEditor
            v-for="(subField, subFieldIndex) in (internalValue && Array.isArray(internalValue) ? internalValue : [])"
            :key="subFieldIndex"
            :template="(template && template.type && template.type.of ? template.type.of : {})"
            :isPartOfArray="true"
            :indexInArray="subFieldIndex"
            v-model="internalValue[subFieldIndex]"
            @deleteSubField="deleteSubFieldEvent"
          />
          <q-btn no-caps flat dense icon="add" label="Add Item" color="primary" @click="addValueToArray()" />
        </div>
        <div v-if="template.type && template.type.name && template.type.name === 'object'" class="q-gutter-y-sm col">
          <FieldEditor
            v-for="(subField, subFieldLeafName) in (internalValue && typeof internalValue === 'object' ? internalValue : {})"
            :key="subFieldLeafName"
            :template="(template && template.type && template.type.of ? template.type.of : {})"
            :isPartOfObject="true"
            :leafInObject="subFieldLeafName"
            v-model="internalValue[subFieldLeafName]"
            @deleteSubField="deleteSubFieldEvent"
          />
          <q-btn no-caps flat dense icon="add" label="Add Item" color="primary" @click="addValueToObject()" />
        </div>
        <q-select
          v-if="template.type && template.type.name && (template.type.name === 'boolean' || template.type.name === 'option')"
          standout="bg-blue-4 text-white"
          v-model="internalValue"
          class="col"
          emit-value
          map-options
          :options="(template.options ? template.options : (template.type.name === 'boolean' ? [{ value: true, label: 'True' }, { value: false, label: 'False' }] : []))"
          :readonly="(template.readonly ? template.readonly : false)"
        />
        <!-- Suffix, if any -->
        <q-select
          v-if="template.suffix"
          standout="bg-blue-4 text-white"
          v-model="internalSuffix"
          emit-value
          map-options
          :options="(template.suffix.options ? template.suffix.options : [])"
          :readonly="(template.readonly ? template.readonly : false)"
          style="min-width: 10rem;"
        />
      </div>
      <!-- Slider, for numbers with Min or Max -->
      <q-slider
        v-if="(template.min || template.max) && !(template.readonly ? template.readonly : false)"
        v-model="internalValue"
        :min="template.min || 0"
        :max="template.max || 100"
        label
        :label-value="(internalPrefixLong && internalPrefixLong.length ? internalPrefixLong + ' ' : '') + formatNumber(internalValue) + (internalSuffixLong && internalSuffixLong.length ? ' ' + internalSuffixLong : '')"
      />
      <!-- Description, if any -->
      <div v-if="template.description && template.description.length" class="q-mt-xs row" style="opacity: .7">
        <q-icon name="info" size="xs" color="blue" class="col-auto q-mr-sm" />
        <!-- {{ template.description }} -->
        <q-markdown
          class="col"
          :src="template.description"
          no-heading-anchor-links
        />
          <!-- class="full-width q-pa-sm bg-white" -->
          <!-- style="height: 600px;" -->
      </div>
    </div>

    <q-separator vertical v-if="isPartOfArray || isPartOfObject" />

    <!-- Delete button, if part of an Array or Object-->
    <div v-if="isPartOfArray || isPartOfObject" class="q-mx-sm items-center justify-center column">
      <q-btn
        icon="delete"
        class="full-height"
        text-color="negative"
        :disabled="false || (isPartOfObject && leafInObject && (leafInObject === 'stream_id' || leafInObject === 'stream_name'))"
        @click="deleteSubFieldPrompt()"
      >
        <q-tooltip content-style="font-size: 1rem;">
          Delete entry
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script>
import FieldEditor from 'components/Pipelines/Collection/FieldEditor.vue'
import { uid } from 'quasar'

export default {
  name: 'FieldEditor',
  components: { FieldEditor },
  props: {
    template: {
      type: Object,
      required: true
    },

    value: {
      required: true
    },

    isPartOfArray: {
      type: Boolean,
      required: false,
      default: false
    },

    indexInArray: {
      type: Number,
      required: false,
      default: 0
    },

    isPartOfObject: {
      type: Boolean,
      required: false,
      default: false
    },

    leafInObject: {
      type: String,
      required: false
    }

  },
  data () {
    return {
      internalPrefixVar: '',
      internalSuffixVar: ''
    }
  }, // data
  computed: {
    defaultValue () {
      let value = ''
      if (this.template.type && this.template.type.name && this.template.type.name.length) {
        if (this.template.type.name === 'array') { value = [] }
        if (this.template.type.name === 'object') { value = {} }
        if (this.template.type.name === 'boolean') { value = false }
        if (this.template.type.name === 'string') { value = '' }
        if (this.template.type.name === 'number') { value = 0 }
        if (this.template.type.name === 'regex') { value = '' }
        if (this.template.type.name === 'option') { value = '' }
      }
      return value
    },
    internalValueRaw: {
      get () {
        // Get the value from:
        // - the Prop,
        // - if not by the Template's default,
        // - if not fall back to this.defaultValue (based on Template's type)
        return (
          this.template.type &&
          this.template.type.name // &&
          // this.template.type.name !== 'array' &&
          // this.template.type.name !== 'object'
            ? (
                this.value
                  ? this.value
                  : (
                      this.template.default
                        ? this.template.default
                        : this.defaultValue
                    )
              )
            : this.value
        )
      },
      set (newValue) {
        if (this.template.type &&
          this.template.type.name &&
          this.template.type.name !== 'array' &&
          this.template.type.name !== 'object' &&
          this.template.type.name !== 'boolean'
        ) {
          let value = newValue

          // Add Prefix
          if (this.template.prefix) {
            value = this.internalPrefix + String(value)
          }
          // and Suffix
          if (this.template.suffix) {
            value = String(value) + this.internalSuffix
          }

          this.$emit('input', value)
        } else {
          this.$emit('input', newValue)
        }
      }
    },
    internalValue: {
      get () {
        let value = this.internalValueRaw

        if (this.template.type &&
          this.template.type.name) {
          // Remove any potential Prefix and Suffix from value of non-object and non-array
          if (
            this.template.type.name !== 'object' &&
            this.template.type.name !== 'array'
          ) {
            // Prep for Regex escaping, as we will be using it a few times in the 2 loops below
            // eslint-disable-next-line no-useless-escape
            const regexCharsToEscape = /[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g

            if (this.template.prefix && this.template.prefix.options && Array.isArray(this.template.prefix.options)) {
              this.template.prefix.options.forEach(option => {
                if (option.value && option.value.length) {
                  value = String(value).replace(RegExp('^' + String(option.value).replace(regexCharsToEscape, '\\$&')), '')
                }
              })
            }
            if (this.template.suffix && this.template.suffix.options && Array.isArray(this.template.suffix.options)) {
              this.template.suffix.options.forEach(option => {
                if (option.value && option.value.length) {
                  value = String(value).replace(RegExp(String(option.value).replace(regexCharsToEscape, '\\$&') + '$'), '')
                }
              })
            }
          }

          // Force the type of some values to based on their Template type
          if (this.template.type.name === 'number') {
            value = Number(value)
          }
          if (this.template.type.name === 'boolean') {
            value = Boolean(value)
          }
        }

        // Boom!
        return value
      },
      set (newValue) {
        this.internalValueRaw = newValue
      }
    }, // internalValue
    internalPrefix: {
      get () {
        // First get it from the internal variable
        let prefix = this.internalPrefixVar
        // Try then to extract it from internalValueRaw (based on all the possible options)
        if (prefix === '' && this.template.prefix && this.template.prefix.options && Array.isArray(this.template.prefix.options)) {
          this.template.prefix.options.forEach(option => {
            if (option.value && option.value.length && prefix === '' && String(this.internalValueRaw).match(RegExp('^' + option.value))) {
              prefix = option.value
            }
          })
        }

        // And return it, falling back to the Template default if we found none in internalValueRaw
        return (
          prefix.length
            ? prefix
            : (
                this.template.prefix && this.template.prefix.default
                  ? this.template.prefix.default
                  : ''
              )
        )
      },
      set (newValue) {
        // Update our variable
        this.internalPrefixVar = newValue
        // And refresh the internalValueRaw value
        this.internalValueRaw = this.internalValue
      }
    }, // internalPrefix
    internalPrefixLong () {
      let prefixLong = this.internalPrefix
      // Try to find the long name of the Prefix based on the Template options
      if (this.internalPrefix.length && this.template.prefix && this.template.prefix.options && Array.isArray(this.template.prefix.options)) {
        const option = this.template.prefix.options.find(o => o.value && o.value === this.internalPrefix)
        prefixLong = (option && option.label ? option.label : prefixLong)
      }

      return prefixLong
    },
    internalSuffix: {
      get () {
        // First get it from the internal variable
        let suffix = this.internalSuffixVar
        // Try then to extract it from internalValueRaw (based on all the possible options)
        if (suffix === '' && this.template.suffix && this.template.suffix.options && Array.isArray(this.template.suffix.options)) {
          this.template.suffix.options.forEach(option => {
            if (option.value && option.value.length && suffix === '' && String(this.internalValueRaw).match(RegExp(option.value + '$'))) {
              suffix = option.value
            }
          })
        }

        // And return it, falling back to the Template default if we found none in internalValueRaw
        return (
          suffix.length
            ? suffix
            : (
                this.template.suffix && this.template.suffix.default
                  ? this.template.suffix.default
                  : ''
              )
        )
      },
      set (newValue) {
        // Update our variable
        this.internalSuffixVar = newValue
        // And refresh the internalValueRaw value
        this.internalValueRaw = this.internalValue
      }
    }, // internalSuffix
    internalSuffixLong () {
      let suffixLong = this.internalSuffix
      // Try to find the long name of the Suffix based on the Template options
      if (this.internalSuffix.length && this.template.suffix && this.template.suffix.options && Array.isArray(this.template.suffix.options)) {
        const option = this.template.suffix.options.find(o => o.value && o.value === this.internalSuffix)
        suffixLong = (option && option.label ? option.label : suffixLong)
      }

      return suffixLong
    },
    leafName () {
      return this.leafInObject
    }
  }, // computed
  methods: {
    formatNumber (value) {
      // One day we will implement a number formatter
      return value
    },
    addValueToArray () {
      // Prep the new value based on the type of the sub-type. Defaulting to ''
      let newItem = ''
      if (this.template && this.template.type && this.template.type.name && this.template.type.of && this.template.type.of.type && this.template.type.of.type.name) {
        if (this.template.type.of.type.name === 'array') {
          newItem = []
        }
        if (this.template.type.of.type.name === 'object') {
          newItem = {}
        }
      }

      if (Array.isArray(this.internalValue)) {
        this.internalValue.push(newItem)
        this.internalValue = JSON.parse(JSON.stringify(this.internalValue))
      } else {
        this.internalValue = JSON.parse(JSON.stringify([newItem]))
      }
    },
    addValueToObject () {
      // Ask for new Leaf name
      this.$q.dialog({
        title: 'Prompt',
        message: '<span class="text-bold">Please enter the name of the new entry.</span><br><br><span style="opacity: .7" class="text-italic"><span class="text-bold">Note: </span>This cannot be changed later.</span>',
        html: true,
        prompt: {
          model: '',
          isValid: val => val.length > 0,
          type: 'text'
        },
        ok: {
          push: true,
          color: 'primary'
        },
        cancel: {
          push: true,
          color: 'grey-9'
        },
        persistent: true
      }).onOk((newItemName) => {
        const newItem = {}
        const newItemNameOrUid = (newItemName && newItemName.length ? newItemName : uid())

        // Prep the new value based on the type of the sub-type. Defaulting to ''
        newItem[newItemNameOrUid] = ''
        if (this.template && this.template.type && this.template.type.name && this.template.type.of && this.template.type.of.type && this.template.type.of.type.name) {
          if (this.template.type.of.type.name === 'array') {
            newItem[newItemNameOrUid] = []
          }
          if (this.template.type.of.type.name === 'object') {
            newItem[newItemNameOrUid] = {}
          }
        }

        // And add it to the pile
        if (typeof this.internalValue === 'object' && !Array.isArray(this.internalValue)) {
          this.internalValue = Object.assign(this.internalValue, newItem)
          this.internalValue = JSON.parse(JSON.stringify(this.internalValue))
        } else {
          this.internalValue = JSON.parse(JSON.stringify(newItem))
        }
      }) // }).onOk((newItemName) => {
    },
    deleteSubFieldPrompt () {
      // Check if it's worth checking for confirmation (like, if there anything to lose)
      if (!(this.value == null || this.value === '')) {
        // Ask to confirm
        this.$q.dialog({
          title: 'Confirm',
          message: 'Do you REALLY want to delete this entry?',
          ok: {
            push: true,
            color: 'negative'
          },
          cancel: {
            push: true,
            color: 'positive'
          },
          persistent: true
        }).onOk(() => {
          this.deleteSubField()
        }) // }).onOk(() => {
      } else {
        // Delete right away
        this.deleteSubField()
      }
    }, // deleteSubFieldPrompt
    deleteSubField () {
      if (this.isPartOfArray) {
        this.$emit('deleteSubField', { indexInArray: this.indexInArray, value: this.value })
      } else if (this.isPartOfObject) {
        this.$emit('deleteSubField', { leafInObject: this.leafInObject, value: this.value })
      }
    },
    deleteSubFieldEvent (payload) {
      console.log(payload)
      if (
        typeof payload.indexInArray !== 'undefined' &&
        typeof payload.indexInArray === 'number' &&
        Array.isArray(this.internalValue) &&
        (this.internalValue.length > payload.indexInArray)
      ) {
        this.internalValue.splice(payload.indexInArray, 1)
        this.internalValue = JSON.parse(JSON.stringify(this.internalValue))
      } else if (
        typeof payload.leafInObject !== 'undefined' &&
        typeof payload.leafInObject === 'string' &&
        payload.leafInObject.length &&
        typeof this.internalValue === 'object' &&
        !Array.isArray(this.internalValue)
      ) {
        delete this.internalValue[payload.leafInObject]
        this.internalValue = JSON.parse(JSON.stringify(this.internalValue))
      }
    }
  } // methods
}
</script>

<style>
/* To force the colour of the links inside of Mardown widgets (for the Description of the field we are displaying) */
.q-markdown a {
  color: aqua;
}
.fixed-font {
    font-family: monospace;
}
</style>
