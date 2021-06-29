import { uid } from 'quasar'

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

    if (payload.pipelines) {
      openCollectorToUpdate.pipelines = [].concat(payload.pipelines)
    }
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

    // And add this Pipeline to its Primary OC, if any is specified
    if (payload.primaryOpenCollector && payload.primaryOpenCollector.length > 0) {
      state.openCollectors.find(oc => oc.uid === payload.primaryOpenCollector).pipelines.push(
        {
          uid: newPipelines.uid,
          enabled: false
        }
      )
    }
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
