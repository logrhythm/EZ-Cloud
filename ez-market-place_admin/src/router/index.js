import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'

import { routes, updateTitle, updateUser } from './routes'

export default function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.config.js instead!
    // quasar.config.js -> build -> vueRouterMode
    // quasar.config.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Update the Tab title on page change
  Router.beforeEach(updateTitle)
  Router.afterEach(updateUser)

  return Router
}
