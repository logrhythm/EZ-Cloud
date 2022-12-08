<template>
  <q-dialog ref="dialog" @hide="onDialogHide" :persistent="persistent">
    <q-card class="q-dialog-plugin">
      <q-card-section class="row justify-between">
        <div class="text-h6">{{ title }}</div>
        <q-btn dense flat icon="close" color="grey-5" @click="onCloseClick" />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-separator />
      </q-card-section>

      <q-card-section class="q-my-lg q-py-none">
        <div class="">{{ message }}</div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-separator />
      </q-card-section>

      <q-card-actions align="right">
        <div class="q-gutter-x-lg">
          <q-btn
            v-for="(button, index) in buttons"
            :key="index"
            color="primary"
            no-caps
            :outline="!button.default"
            :label="button.label"
            @click="onButtonClick (button.meaning, index)"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    // ...your custom props
    title: {
      type: String,
      default: 'Confirm'
    },
    message: {
      type: String,
      default: null
    },
    persistent: {
      type: Boolean,
      default: false
    },
    buttons: {
      type: Array,
      default () {
        return [
          {
            label: this.$t('Yes'),
            meaning: 'OK'
          },
          {
            label: this.$t('No'),
            meaning: 'Cancel',
            default: true
          }
        ]
      }
    }
  },

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show () {
      this.$refs.dialog.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide () {
      this.$refs.dialog.hide()
    },

    onDialogHide () {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onOKClick () {
      this.$emit('ok')
      this.hide()
    },

    onCancelClick () {
      this.hide()
    },

    onButtonClick (buttonMeaning, buttonIndex) {
      if (buttonMeaning && String(buttonMeaning).toLowerCase() === 'ok') {
        this.onOKClick()
      } else if (buttonMeaning && String(buttonMeaning).toLowerCase() === 'cancel') {
        this.onCancelClick()
      }
    },

    onCloseClick () {
      this.hide()
    }
  }
}
</script>
