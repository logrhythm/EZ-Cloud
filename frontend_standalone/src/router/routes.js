import { productName } from '../../package.json'

// Update the tab/window title
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
    meta: { title: 'Field Mapping' },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Pipelines/MappingEdit.vue') }
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
  updateTitle
}
