import { uid } from 'quasar'
// eslint-disable-next-line camelcase
import jwt_decode from 'jwt-decode'

export function addOpenCollector (state, payload) {
  if (payload && payload.name && payload.name.length > 0) {
    const newOpenCollector = Object.assign({}, payload)
    if (!newOpenCollector.uid || (newOpenCollector.uid && newOpenCollector.uid.length === 0)) {
      newOpenCollector.uid = uid()
    }
    state.openCollectors.push(newOpenCollector)
  }
}

export function updateOpenCollector (state, payload) {
  if (payload && payload.uid && payload.uid.length) {
    const openCollectorToUpdate = state.openCollectors.find(oc => oc.uid === payload.uid)
    const branches = [
      'name',
      'hostname',
      'port',
      'authenticationMethod',
      'username',
      'password',
      'privateKey',
      'osVersion',
      'ocInstalled',
      'ocVersion',
      'fbInstalled',
      'fbVersion'
    ]
    branches.forEach((branch) => {
      if (payload[branch]) {
        openCollectorToUpdate[branch] = payload[branch]
      }
    })

    const arrayBranches = [
      'pipelines',
      'installedShippers'
    ]
    arrayBranches.forEach((branch) => {
      if (payload[branch]) {
        openCollectorToUpdate[branch] = [].concat(payload[branch])
      }
    })
  }
}

export function deleteOpenCollector (state, payload) {
  if (payload && payload.uid && payload.uid.length) {
    // Check if the Open Collector exists. If it does, then remove it
    const position = state.openCollectors.findIndex(oc => oc.uid === payload.uid)
    if (position >= 0) {
      state.openCollectors.splice(position, 1)
    }
  }
}

export function getOpenCollectors (state, payload) {
  if (payload && Array.isArray(payload)) {
    state.openCollectors = payload
  }
}

export function addPipeline (state, payload) {
  if (payload && payload.name && payload.name.length > 0) {
    const newPipelines = Object.assign({}, payload)
    if (!newPipelines.uid || (newPipelines.uid && newPipelines.uid.length === 0)) {
      newPipelines.uid = uid()
    }

    state.pipelines.push(newPipelines)
  }
}

export function updatePipeline (state, payload) {
  if (payload && payload.uid && payload.uid.length) {
    const pipelineToUpdate = state.pipelines.find(p => p.uid === payload.uid)

    const branches = [
      'status',
      'primaryOpenCollector',
      'collectionConfig',
      'options'
    ]
    branches.forEach((branch) => {
      if (payload[branch]) {
        pipelineToUpdate[branch] = payload[branch]
      }
    })

    // Mapping is a tad special, so we do it on its own
    if (payload.fieldsMapping) {
      pipelineToUpdate.fieldsMapping = [].concat(payload.fieldsMapping)
    }
  }
}

export function deletePipeline (state, payload) {
  if (payload && payload.uid && payload.uid.length) {
    // Check if the pipeline exists. If it does, then remove it
    const position = state.pipelines.findIndex(pipeline => pipeline.uid === payload.uid)
    if (position >= 0) {
      state.pipelines.splice(position, 1)
    }
  }
}

export function getPipelines (state, payload) {
  if (payload && Array.isArray(payload)) {
    state.pipelines = payload
  }
}

// Authentication

export function updateJwtToken (state, payload) {
  if (payload) {
    state.jwtToken = payload.token
    try {
      const decodedToken = (payload.token && payload.token.length ? jwt_decode(payload.token) : null)
      state.loggedInUser = (decodedToken && decodedToken.username ? decodedToken.username : '')
      state.loggedInUserRoles = (decodedToken && decodedToken.roles && Array.isArray(decodedToken.roles) ? decodedToken.roles : [])
      state.loggedInUserIsPrivileged = !!(decodedToken && decodedToken.isPrivileged === true)
    } catch (err) {
      console.log('Authentication - Failed to decode received JWT Token. Reason:', err.message)
    }
    try {
      // Quick trick to save time while developping.
      // Avoids from having to login all the time when modifying the code
      if (process.env.DEV) {
        localStorage.setItem('jwtToken', payload.token)
      }
    } catch (err) {
      //
    }

    // Gather EZ Market Place details
    updateEzMarketDetails(state, payload)
  }
}

export function loadShippersUrls (state, payload) {
  if (payload && Array.isArray(payload)) {
    state.shippersUrlsInternal = payload
  }
}

export function getOpenCollectorLogSources (state, payload) {
  if (payload && Array.isArray(payload)) {
    state.openCollectorLogSources = payload
  }
}

// User Accounts Management

export function getUserAccounts (state, payload) {
  if (payload && Array.isArray(payload)) {
    state.userAccounts = payload
  }
}

export function getUserRoles (state, payload) {
  if (payload && Array.isArray(payload)) {
    state.userRoles = payload
  }
}

// EZ Market Place

export function updateEzMarketDetails (state, payload) {
  if (payload) {
    if (payload.ezMarketServer) {
      state.ezMarket.server.baseUrl = payload.ezMarketServer.baseUrl
      state.ezMarket.server.baseApiPath = payload.ezMarketServer.baseApiPath
    }
    if (payload.publisher) {
      state.ezMarket.publisherUid = payload.publisher.publisherUid
      state.ezMarket.ezMarketUid = payload.publisher.ezMarketUid
    }
    if (payload.deployment) {
      state.deployment.uid = payload.deployment.uid
      state.deployment.version = payload.deployment.version
    }
  }
}

export function updateEzMarketNotificationNumber (state, payload) {
  state.ezMarketNotification = payload
}

function calculateNotificationNumber (state) {
  const count = state.ezMarketNotifications.filter(
    (notification) =>
      notification &&
      notification.statusName &&
      notification.statusName === 'Unread' &&
      // Ignore the broadcasted ones, as the user has no way to mark these as Read
      notification.recipient !== null
  ).length
  return (count > 0 ? count : null)
}

export function updateEzMarketNotifications (state, payload) {
  if (payload && Array.isArray(payload)) {
    state.ezMarketNotifications = payload
  }
  // Only flag the ones that are Unread
  // state.ezMarketNotification = state.ezMarketNotifications.filter((notification) => notification && notification.statusName && notification.statusName === 'Unread').length
  state.ezMarketNotification = calculateNotificationNumber(state)
}

export function updateEzMarketNotificationsSubset (state, payload) {
  if (payload && Array.isArray(payload)) {
    try {
      payload.forEach((updatedNotification) => {
        if (updatedNotification && updatedNotification.messageUid && updatedNotification.messageUid.length) {
          const notificationIndex = state.ezMarketNotifications.findIndex((notif) => notif && notif.messageUid === updatedNotification.messageUid)
          state.ezMarketNotifications[notificationIndex] = updatedNotification
        }
      })
    } finally {
      // For Vue to pick the change
      state.ezMarketNotifications = JSON.parse(JSON.stringify(state.ezMarketNotifications))
    }
  }
  // Only flag the ones that are Unread
  // state.ezMarketNotification = state.ezMarketNotifications.filter((notification) => notification && notification.statusName && notification.statusName === 'Unread').length
  state.ezMarketNotification = calculateNotificationNumber(state)
}

export function deleteEzMarketNotificationById (state, messageUid) {
  if (messageUid && messageUid.length) {
    try {
      const notificationIndex = state.ezMarketNotifications.findIndex((notif) => notif && notif.messageUid === messageUid)
      state.ezMarketNotifications.splice(notificationIndex, 1)
    } finally {
      // For Vue to pick the change
      state.ezMarketNotifications = JSON.parse(JSON.stringify(state.ezMarketNotifications))
    }
  }

  // Only flag the ones that are Unread
  state.ezMarketNotification = calculateNotificationNumber(state)
}

export function updateEzMarketPipelineTemplates (state, payload) {
  if (payload && Array.isArray(payload)) {
    try {
      const pipelineTemplates = JSON.parse(JSON.stringify(payload))
      // Parse the stats (as they are stored as stringified JSON in the database)
      if (pipelineTemplates && Array.isArray(pipelineTemplates)) {
        pipelineTemplates.forEach((pipelineTemplate) => {
          try {
            pipelineTemplate.stats = JSON.parse(pipelineTemplate.stats) || {}
          } catch (error) {
            pipelineTemplate.stats = {}
          }
        })
      }
      // And assign
      state.ezMarketPipelineTemplates = pipelineTemplates
    } catch (error) {
      // Fall back on the raw data
      state.ezMarketPipelineTemplates = payload
    }
  }
}

export function updateEzMarketPipelineTemplateById (state, payload) {
  // Clear any existing one
  state.ezMarketPipelineTemplate = {}

  if (payload) {
    state.ezMarketPipelineTemplate = payload
  }
}

export function updateEzMarketPublisherDetails (state, payload) {
  // Clear any existing one
  state.ezMarketPublisherDetails = {}

  if (payload) {
    state.ezMarketPublisherDetails = payload
  }
}
