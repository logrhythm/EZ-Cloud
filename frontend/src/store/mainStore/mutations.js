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
      'collectionConfig'
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
      const decodedToken = jwt_decode(payload.token)
      console.log('decodedToken: ', decodedToken)
      state.loggedInUser = (decodedToken && decodedToken.username ? decodedToken.username : '')
      state.loggedInUserRoles = (decodedToken && decodedToken.roles && Array.isArray(decodedToken.roles) ? decodedToken.roles : [])
      state.loggedInUserIsPriviledged = !!(decodedToken && decodedToken.isPriviledged === true)
    } catch (err) {
      console.log('Authentication - Failed to decode received JWT Token. Reason:', err)
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
