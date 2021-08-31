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
  let pageName = ''

  // Get the name from the last match with a name, if any
  if (to.matched && Array.isArray(to.matched)) {
    to.matched.forEach(m => {
      if (m.name && m.name.length) {
        pageName = m.name
      }
    })
  }

  // Assign it
  if (pageName.length) {
    document.title = productName + ' - ' + pageName
  } else {
    document.title = productName
  }
  next()
}

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('layouts/PlainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login/Login.vue') }
    ]
  },

  {
    path: '/Welcome',
    name: 'Welcome',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') }
    ],
    beforeEnter: isLoggedIn
  },

  {
    path: '/Login',
    name: 'Login',
    component: () => import('layouts/PlainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login/Login.vue') }
    ]
  },

  {
    path: '/Logout',
    name: 'Logout',
    component: () => import('layouts/PlainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login/Logout.vue') }
    ]
  },

  {
    path: '/Settings',
    name: 'Settings',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Settings/Settings.vue') }
    ]
  },

  {
    path: '/OpenCollectors',
    name: 'OpenCollectors',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/OpenCollectors/List.vue') },
      { path: ':openCollectorUid/View', name: 'OpenCollector - View', component: () => import('pages/OpenCollectors/View.vue') }
    ],
    beforeEnter: isLoggedIn
  },

  {
    path: '/Pipelines',
    name: 'Pipelines',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Pipelines/List.vue') },
      { path: ':pipelineUid/Properties', name: 'Pipeline - Properties', component: () => import('src/pages/Pipelines/Properties.vue') },
      { path: ':pipelineUid/Collection/Edit', name: 'Pipeline - Collection', component: () => import('src/pages/Pipelines/CollectionEdit.vue') },
      { path: ':pipelineUid/Mapping/Edit', name: 'Pipeline - Field Mapping', component: () => import('src/pages/Pipelines/MappingEdit.vue') },
      { path: ':pipelineUid/Deployments/:openCollectorUid/Edit', name: 'Pipeline - Deployments', component: () => import('src/pages/Pipelines/DeploymentEdit.vue') },
      { path: ':pipelineUid/Deployments/Edit', name: 'Pipeline - Deployments', component: () => import('src/pages/Pipelines/DeploymentEdit.vue') }
    ],
    beforeEnter: isLoggedIn
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    name: 'Oops...',
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
