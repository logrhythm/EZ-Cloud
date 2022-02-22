import Vue from 'vue'
import { LoginCallback } from '@okta/okta-vue'

// import { Store } from '../store/index.js'
import { productName } from '../../package.json'

// // Check if we have a JWT token, and redirect to /Login if not
// function isLoggedIn (to, from, next) {
//   const token = (Store && Store.state && Store.state.mainStore && Store.state.mainStore.jwtToken ? Store.state.mainStore.jwtToken : '')
//   if (token && token.length) {
//     next()
//   } else {
//     next('/Login')
//     // next()
//   }
// }

// Update the tab/window's title
function updateTitle (to, from, next) {
  let pageTitle = ''

  // Get the page title from the last match with a meta.title, if any
  if (to.matched && Array.isArray(to.matched)) {
    to.matched.forEach(m => {
      if (m.meta && m.meta.title && m.meta.title.length) {
        pageTitle = m.meta.title
      }
    })
  }

  // Assign it
  if (pageTitle.length) {
    document.title = productName + ' - ' + pageTitle
  } else {
    document.title = productName
  }
  next()
}

// Update the tab/window's title
async function updateUser (to, from) {
  // if (this.authState.isAuthenticated) {
  //   this.activeUser = await this.$auth.getUser()
  // }
  try {
    const oktaToken = await Vue.prototype.$auth.getAccessToken()
    console.log('oktaToken:', oktaToken)
    if (oktaToken) {
      try {
        const u = await Vue.prototype.$auth.getUser()
        console.log('getUser:', u)
      } catch (error) {
        console.log(error)
      }
    }
  } catch (error) {
    console.log(error)
  }

  // try {
  //   const u = await Vue.prototype.$auth.getUser()
  //   console.log('getUser:', u)
  // } catch (error) {
  //   console.log(error)
  // }
  try {
    console.log('$auth', Vue.prototype.$auth)
  } catch (error) {
    console.log(error)
  }
  try {
    console.log('authState', Vue.prototype.authState)
  } catch (error) {
    console.log(error)
  }
  try {
    console.log('getAccessToken', await Vue.prototype.$auth.getAccessToken())
  } catch (error) {
    console.log(error)
  }
}

const routes = [

  {
    path: '/',
    meta: { title: 'Welcome' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') }
    ]
  },

  {
    // Okta Login Call Back path
    path: '/mfa',
    component: LoginCallback
  },

  {
    path: '/Stats',
    meta: { title: 'Statistics' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Stats/Index.vue') }
    ]
  },

  {
    path: '/Welcome',
    meta: { title: 'Welcome' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') }
    ]
  },

  {
    path: '/Login',
    meta: { title: 'Login' },
    component: () => import('layouts/PlainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login/Login.vue') }
    ]
  },

  {
    path: '/Logout',
    meta: { title: 'Logout' },
    component: () => import('layouts/PlainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login/Logout.vue') }
    ]
  },

  {
    path: '/Admin',
    meta: {
      title: 'Admin',
      requiresAuth: true
    },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Error404.vue') },

      // RBAC
      { path: 'RBAC', component: () => import('pages/Admin/RBAC/Index.vue') },
      { path: 'RBAC/Users', component: () => import('pages/Admin/RBAC/Users.vue') },
      { path: 'RBAC/Roles', component: () => import('pages/Admin/RBAC/Roles.vue') },

      // Pipelines Templates
      { path: 'Templates', component: () => import('pages/Admin/Templates/Index.vue') }
    ]
    // ,
    // beforeEnter: isLoggedIn
  },

  {
    path: '/Settings',
    meta: { title: 'Settings' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Settings/Settings.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    meta: { title: 'Oops...' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Error404.vue') }
    ]
  }
]

export {
  routes,
  updateTitle,
  updateUser
}
