import { Notify } from 'quasar'

Notify.setDefaults({
  position: 'bottom-right',
  timeout: 2500,
  textColor: 'white',
  actions: [{ icon: 'close', color: 'white' }]
})
