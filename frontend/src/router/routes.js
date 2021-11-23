import { Store } from '../store/index.js'
import { productName } from '../../package.json'

// Check if we have a JWT token, and redirect to /Login if not
function isLoggedIn (to, from, next) {
  const token = (Store && Store.state && Store.state.mainStore && Store.state.mainStore.jwtToken ? Store.state.mainStore.jwtToken : '')
  if (token && token.length) {
    next()
  } else {
    next('/Login')
  }
}

// Check if we have a JWT token, and redirect to /Login if not
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

const routes = [
  {
    path: '/',
    meta: { title: 'Login' },
    component: () => import('layouts/PlainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login/Login.vue') }
    ]
  },

  {
    path: '/Welcome',
    meta: { title: 'Welcome' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') }
    ],
    beforeEnter: isLoggedIn
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
    meta: { title: 'Admin' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Admin/Users.vue') },
      { path: 'Users', component: () => import('pages/Admin/Users.vue') }
    ]
  },

  {
    path: '/Settings',
    meta: { title: 'Settings' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Settings/Settings.vue') }
    ]
  },

  {
    path: '/OpenCollectors',
    meta: { title: 'OpenCollectors' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/OpenCollectors/List.vue') },
      { path: ':openCollectorUid/View', meta: { title: 'OpenCollector - View' }, component: () => import('pages/OpenCollectors/View.vue') }
    ],
    beforeEnter: isLoggedIn
  },

  {
    path: '/Pipelines',
    meta: { title: 'Pipelines' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Pipelines/List.vue') },
      { path: ':pipelineUid/Properties', meta: { title: 'Pipeline - Properties' }, component: () => import('src/pages/Pipelines/Properties.vue') },
      { path: ':pipelineUid/Collection/Edit', meta: { title: 'Pipeline - Collection' }, component: () => import('src/pages/Pipelines/CollectionEdit.vue') },
      { path: ':pipelineUid/Mapping/Edit', meta: { title: 'Pipeline - Field Mapping' }, component: () => import('src/pages/Pipelines/MappingEdit.vue') },
      { path: ':pipelineUid/Deployments/:openCollectorUid/Edit', meta: { title: 'Pipeline - Deployments' }, component: () => import('src/pages/Pipelines/DeploymentEdit.vue') },
      { path: ':pipelineUid/Deployments/Edit', meta: { title: 'Pipeline - Deployments' }, component: () => import('src/pages/Pipelines/DeploymentEdit.vue') }
    ],
    beforeEnter: isLoggedIn
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    meta: { title: 'Oops...' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Error404.vue') }
    ],
    beforeEnter: isLoggedIn
  }
]

export {
  routes,
  updateTitle
}
