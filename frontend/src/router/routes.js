
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
    ]
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
      { path: '', component: () => import('pages/Login/Login.vue') }
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
    ]
  },

  {
    path: '/Pipelines',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Pipelines/List.vue') },
      { path: ':pipelineUid/Properties', component: () => import('src/pages/Pipelines/Properties.vue') },
      { path: ':pipelineUid/Collection/Edit', component: () => import('src/pages/Pipelines/CollectionEdit.vue') },
      { path: ':pipelineUid/Mapping/Edit', component: () => import('src/pages/Pipelines/MappingEdit.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Error404.vue') }
    ]
  }
]

export default routes
