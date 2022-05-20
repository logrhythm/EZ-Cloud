import Vue from 'vue'
import Vuex from 'vuex'

import mainStore from './mainStore'

Vue.use(Vuex)

const Store = new Vuex.Store({
  modules: {
    mainStore
  },

  // enable strict mode (adds overhead!)
  // for dev mode only
  strict: process.env.DEBUGGING
})

export default function (/* { ssrContext } */) {
  return Store
}

export { Store }
