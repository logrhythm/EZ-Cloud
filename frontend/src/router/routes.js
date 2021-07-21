import { Store } from '../store/index.js'

// Check if we have a JWT token, and redirect to /Login if not
function isLoggedIn (to, from, next) {
  const token = (Store && Store.state && Store.state.mainStore && Store.state.mainStore.jwtToken ? Store.state.mainStore.jwtToken : '')
  if (token && token.length) {
    next()
  } else {
    next('/Login')
  }
}

const routes = [
  {
    path: '/',
    component: () => import('layouts/PlainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login/Login.vue') }
    ]
  },

  {
    path: '/Welcome',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') }
    ],
    beforeEnter: isLoggedIn
  },

  {
    path: '/Login',
    component: () => import('layouts/PlainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login/Login.vue') }
    ]
  },

  {
    path: '/Logout',
    component: () => import('layouts/PlainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login/Logout.vue') }
    ]
  },

  {
    path: '/Settings',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Settings/Settings.vue') }
    ]
  },

  {
    path: '/OpenCollectors',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/OpenCollectors/List.vue') },
      { path: ':openCollectorUid/View', component: () => import('pages/OpenCollectors/View.vue') }
    ],
    beforeEnter: isLoggedIn
  },

  {
    path: '/Pipelines',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Pipelines/List.vue') },
      { path: ':pipelineUid/Properties', component: () => import('src/pages/Pipelines/Properties.vue') },
      { path: ':pipelineUid/Collection/Edit', component: () => import('src/pages/Pipelines/CollectionEdit.vue') },
      { path: ':pipelineUid/Mapping/Edit', component: () => import('src/pages/Pipelines/MappingEdit.vue') },
      // { path: ':pipelineUid/Deployments', component: () => import('src/pages/Pipelines/DeploymentsList.vue') },
      { path: ':pipelineUid/Deployments/:openCollectorUid/Edit', component: () => import('src/pages/Pipelines/DeploymentEdit.vue') },
      { path: ':pipelineUid/Deployments/Edit', component: () => import('src/pages/Pipelines/DeploymentEdit.vue') },
      { path: ':pipelineUid/Deployments/New', component: () => import('src/pages/Pipelines/DeploymentEdit.vue') }
    ],
    beforeEnter: isLoggedIn
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Error404.vue') }
    ],
    beforeEnter: isLoggedIn
  }
]

export default routes
