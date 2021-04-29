export function upsertOpenCollector ({ state, commit }, payload) {
  if (payload) {
    if (state.openCollectors.filter(oc => oc.uid === payload.uid).length > 0) {
      commit('updateOpenCollector', payload)
    } else {
      commit('addOpenCollector', payload)
    }
  }
}

export function getOpenCollectors ({ commit }) {
  // Get it from the API
}

export function upsertPipeline ({ state, commit }, payload) {
  console.log('upsertPipeline')
  console.log(payload)
  if (payload) {
    if (state.pipelines.filter(p => p.uid === payload.uid).length > 0) {
      commit('updatePipeline', payload)
    } else {
      commit('addPipeline', payload)
    }
  }
}

export function deletePipeline ({ state, commit }, payload) {
  if (payload) {
    if (state.pipelines.filter(p => p.uid === payload.uid).length > 0) {
      commit('deletePipeline', payload)
    }
  }
}

export function getPipelines ({ commit }) {
  // Get it from the API
}
