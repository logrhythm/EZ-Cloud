import { uid } from 'quasar'
import { i18n } from 'boot/i18n'
import { version } from '../../../package.json'

// ######################################################################
// AUTHENTICATION
// ######################################################################

export function signIn ({ commit }, payload) {
  postDataToSite({
    apiUrl: '/auth/Login',
    commit: commit,
    targetCommitName: 'updateJwtToken',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: true,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

export function signOut ({ commit }, payload) {
  // Blank any previous JWT token
  commit('updateJwtToken', { token: '' })

  // Empty the list of Collectors and Pipelines
  commit('getOpenCollectors', [])
  commit('getPipelines', [])

  // Empty the list of User Accounts and Roles
  commit('getUserAccounts', [])
  commit('getUserRoles', [])

  // Empty Publisher details
  commit('updateEzMarketPublisherDetails', {})

  // Empty the MS SQL Connection Configuration
  commit('getMsSqlConfig', {})

  // Empty the Extra Information
  commit('updateExtraInformation', { extraInformation: {} })
}

export function updateExtraInformation ({ commit }, payload) {
  commit('updateExtraInformation', payload)
}

// ######################################################################
// SIEM MS SQL CONFIGURATION
// ######################################################################

export function forgetMsSqlConfig ({ commit }) {
  commit('getMsSqlConfig', {})
}

export function getMsSqlConfig ({ state, commit }, payload) {
  getDataFromSite({
    apiUrl: '/admin/GetMsSqlConfig',
    dataLabel: 'Configuration',
    countDataLabel: true,
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    commit: commit,
    targetCommitName: 'getMsSqlConfig',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: true,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: false
  })
}

export function updateMsSqlConfig ({ state }, payload) {
  if (
    payload &&
    payload.host &&
    payload.host.length &&
    payload.username &&
    payload.username.length &&
    payload.port >= 1 &&
    payload.port <= 65535
  ) {
    postDataToSite({
      apiUrl: '/admin/UpdateMsSqlConfig',
      dataLabel: 'Configuration',
      apiCallParams: {
        host: payload.host,
        port: payload.port,
        username: payload.username,
        password: payload.password,
        encrypt: !!payload.encrypt
      },
      apiHeaders: {
        authorization: 'Bearer ' + state.jwtToken
      },
      loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
      silent: false,
      caller: (payload && payload.caller ? payload.caller : this._vm),
      onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
      onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
      debug: false
    })
  }
}

export function updateEmdb ({ state }, payload) {
  if (
    payload &&
    payload.username &&
    payload.username.length
  ) {
    postDataToSite({
      apiUrl: '/admin/UpdateEmdb',
      dataLabel: 'Database',
      apiCallParams: {
        username: payload.username,
        password: payload.password
      },
      apiHeaders: {
        authorization: 'Bearer ' + state.jwtToken
      },
      loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
      silent: (payload ? !!payload.silent : false),
      caller: (payload && payload.caller ? payload.caller : this._vm),
      onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
      onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
      debug: false
    })
  }
}

// ######################################################################
// EMDB STATUS/AVAILABILITY/VERSIONS
// ######################################################################

export function getEmdbVersions ({ state, commit }, payload) {
  getDataFromSite({
    apiUrl: '/logrhythmCore/GetSiemDatabaseStatusAndVersions',
    dataLabel: 'EMDB Versions and statuses',
    countDataLabel: false,
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    commit: commit,
    targetCommitName: 'getEmdbVersions',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: (payload ? !!payload.silent : true),
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: false
  })
}

// ######################################################################
// DATABASE STATUS/AVAILABILITY
// ######################################################################

export function getPersistenceLayerAvailability ({ state, commit }, payload) {
  getDataFromSite({
    apiUrl: '/status/GetPersistenceLayerAvailability',
    dataLabel: 'Persistence layer availability status',
    countDataLabel: false,
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    commit: commit,
    targetCommitName: 'getPersistenceLayerAvailability',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: true,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: false
  })
}

// ######################################################################
// COLLECTORS
// ######################################################################

export function forgetOpenCollectors ({ state, commit }) {
  // Usefull when login out, for example
  // Update the Store with an empty array
  commit('getOpenCollectors', [])
}

export function getOpenCollectors ({ state, commit }, payload) {
  getDataFromSite({
    apiUrl: '/config/GetCollectors',
    dataLabel: 'Collectors',
    countDataLabel: true,
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    commit: commit,
    targetCommitName: 'getOpenCollectors',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: false,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    debug: false
  })
}

export function upsertOpenCollector ({ state, commit }, payload) {
  if (payload && payload.openCollector) {
    const openCollectorPayload = Object.assign({}, payload.openCollector)

    // Update the Store
    if (state.openCollectors.filter(oc => oc.uid === openCollectorPayload.uid).length > 0) {
      commit('updateOpenCollector', openCollectorPayload)
    } else {
      if (!openCollectorPayload.uid || (openCollectorPayload.uid && openCollectorPayload.uid.length === 0)) {
        openCollectorPayload.uid = uid()
      }
      commit('addOpenCollector', openCollectorPayload)
    }

    // Persist
    if (
      payload.pushToApi &&
      payload.pushToApi === true &&
      state.openCollectors.filter(oc => oc.uid === openCollectorPayload.uid).length > 0
    ) {
      postDataToSite({
        apiUrl: '/config/UpdateCollector',
        dataLabel: 'Collector',
        apiCallParams: state.openCollectors.find(oc => oc.uid === openCollectorPayload.uid),
        apiHeaders: {
          authorization: 'Bearer ' + state.jwtToken
        },
        loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
        silent: false,
        caller: (payload && payload.caller ? payload.caller : this._vm),
        debug: false
      })
    }
  }
}

export function deleteOpenCollector ({ state, commit }, payload) {
  if (payload && payload.openCollector) {
    const openCollectorPayload = Object.assign({}, payload.openCollector)

    // Update the Store
    if (state.openCollectors.filter(oc => oc.uid === openCollectorPayload.uid).length > 0) {
      commit('deleteOpenCollector', openCollectorPayload)
    }

    // Persist
    if (
      payload.pushToApi &&
      payload.pushToApi === true &&
      openCollectorPayload.uid &&
      openCollectorPayload.uid.length
    ) {
      postDataToSite({
        apiUrl: '/config/DeleteCollector',
        dataLabel: 'Collector',
        apiCallParams: { uid: openCollectorPayload.uid },
        apiHeaders: {
          authorization: 'Bearer ' + state.jwtToken
        },
        loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
        silent: false,
        caller: (payload && payload.caller ? payload.caller : this._vm),
        debug: false
      })
    }
  }
}

export function getOpenCollectorsOcVersion ({ state }, payload) {
  getDataFromSite({
    apiUrl: '/oc/CheckOCVersion',
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    targetObjectName: (payload && payload.targetObjectName ? payload.targetObjectName : ''),
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
    silent: true,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

export function getOpenCollectorsOsVersion ({ state }, payload) {
  getDataFromSite({
    apiUrl: '/oc/CheckOSVersion',
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    targetObjectName: (payload && payload.targetObjectName ? payload.targetObjectName : ''),
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
    silent: true,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

export function getOpenCollectorsDockerVersion ({ state }, payload) {
  getDataFromSite({
    apiUrl: '/oc/CheckDockerVersion',
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    targetObjectName: (payload && payload.targetObjectName ? payload.targetObjectName : ''),
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
    silent: true,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

export function getOpenCollectorsFilebeatVersion ({ state }, payload) {
  getDataFromSite({
    apiUrl: '/oc/CheckFilebeatVersion',
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    targetObjectName: (payload && payload.targetObjectName ? payload.targetObjectName : ''),
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
    silent: true,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

export function getOpenCollectorsjsBeatVersion ({ state }, payload) {
  getDataFromSite({
    apiUrl: '/oc/CheckJsBeatVersion',
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    targetObjectName: (payload && payload.targetObjectName ? payload.targetObjectName : ''),
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
    silent: true,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

export function getOpenCollectorsOcAndActiveBeatsVersion ({ state }, payload) {
  getDataFromSite({
    apiUrl: '/oc/CheckOpenCollectorAndBeatsVersions',
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    targetObjectName: (payload && payload.targetObjectName ? payload.targetObjectName : ''),
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
    silent: true,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

export function startContainerOnOpenCollector ({ state }, payload) {
  postDataToSite({
    apiUrl: '/oc/StartContainer',
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    targetObjectName: (payload && payload.targetObjectName ? payload.targetObjectName : ''),
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
    silent: (payload && payload.silent ? payload.silent : false),
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

export function stopContainerOnOpenCollector ({ state }, payload) {
  postDataToSite({
    apiUrl: '/oc/StopContainer',
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    targetObjectName: (payload && payload.targetObjectName ? payload.targetObjectName : ''),
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
    silent: (payload && payload.silent ? payload.silent : false),
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

export function getContainerLogs ({ state }, payload) {
  getDataFromSite({
    apiUrl: '/oc/GetContainerLogs',
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    targetObjectName: (payload && payload.targetObjectName ? payload.targetObjectName : ''),
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
    silent: (payload && payload.silent ? payload.silent : false),
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

// ######################################################################
// PIPELINES
// ######################################################################

export function forgetPipelines ({ state, commit }) {
  // Usefull when login out, for example
  // Update the Store with an empty array
  commit('getPipelines', [])
}

export function getPipelines ({ state, commit }, payload) {
  getDataFromSite({
    apiUrl: '/config/GetPipelines',
    dataLabel: 'Pipelines',
    countDataLabel: true,
    commit: commit,
    targetCommitName: 'getPipelines',
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: false,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: false
  })
}

export function upsertPipeline ({ state, commit }, payload) {
  if (payload && payload.pipeline) {
    const pipelinePayload = Object.assign({}, payload.pipeline)

    // Update the Store
    if (state.pipelines.filter(p => p.uid === pipelinePayload.uid).length > 0) {
      commit('updatePipeline', pipelinePayload)
    } else {
      if (!pipelinePayload.uid || (pipelinePayload.uid && pipelinePayload.uid.length === 0)) {
        pipelinePayload.uid = uid()
      }
      commit('addPipeline', pipelinePayload)
    }

    // Persist
    if (!(payload.pushToApi == null || (payload.pushToApi && payload.pushToApi === false))) {
      if (
        // payload.pushToApi &&
        // payload.pushToApi === true &&
        state.pipelines.filter(p => p.uid === pipelinePayload.uid).length > 0
      ) {
        postDataToSite({
          apiUrl: '/config/UpdatePipeline',
          dataLabel: 'Pipeline',
          apiCallParams: state.pipelines.find(p => p.uid === pipelinePayload.uid),
          apiHeaders: {
            authorization: 'Bearer ' + state.jwtToken
          },
          loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
          silent: false,
          caller: (payload && payload.caller ? payload.caller : this._vm),
          onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
          onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
          debug: (payload && payload.debug ? payload.debug : false)
        })
      }
    }
  }
}

export function deletePipeline ({ state, commit }, payload) {
  if (payload && payload.pipeline) {
    const pipelinePayload = Object.assign({}, payload.pipeline)

    // Update the Store
    if (state.pipelines.filter(oc => oc.uid === pipelinePayload.uid).length > 0) {
      commit('deletePipeline', pipelinePayload)
    }

    // Persist
    if (
      payload.pushToApi &&
      payload.pushToApi === true &&
      pipelinePayload.uid &&
      pipelinePayload.uid.length
    ) {
      postDataToSite({
        apiUrl: '/config/DeletePipeline',
        dataLabel: 'Pipeline',
        apiCallParams: { uid: pipelinePayload.uid },
        apiHeaders: {
          authorization: 'Bearer ' + state.jwtToken
        },
        loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
        silent: false,
        caller: (payload && payload.caller ? payload.caller : this._vm),
        debug: false
      })
    }
  }
}

// ######################################################################
// SHIPPERS URLS
// ######################################################################

export function loadShippersUrls ({ state, commit }, payload) {
  if (state.shippersUrlsInternal.length === 0) {
    console.log('☁️ Downloading Shippers\' details and URLs...')

    // Using Fetch here, instead of getDataFromSite to avoid CORS problems
    fetch(this._vm.globalConstants.baseUrl.shippersUrls, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.')
        }
        return response.json()
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          commit('loadShippersUrls', data)
          console.log('✔️ [API SUCCESS] Succesfully loaded ' + data.length + ' Shippers\' details and URLs.')
        } else {
          throw new Error('Returned data wasn\'t a proper JSON array.')
        }
      })
      .catch(error => {
        console.log('⚠️ [API ERROR] Loading error: ' + error.message)
      })
  }
}

// ######################################################################
// COLLECTOR LOG SOURCES
// ######################################################################

export function forgetOpenCollectorLogSources ({ state, commit }) {
  // Usefull when login out, for example
  // Update the Store with an empty array
  commit('getOpenCollectorLogSources', [])
}

export function getOpenCollectorLogSources ({ state, commit }, payload) {
  getDataFromSite({
    apiUrl: '/logrhythmCore/GetOpenCollectorLogSourcesList',
    dataLabel: 'OpenCollector Log Sources',
    countDataLabel: true,
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    commit: commit,
    targetCommitName: 'getOpenCollectorLogSources',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: false,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    debug: false
  })
}

// ######################################################################
// DEPLOYMENTS
// ######################################################################

export function deleteDeployment ({ state, dispatch }, payload) {
  if (payload && payload.openCollector && payload.openCollector.pipelines && Array.isArray(payload.openCollector.pipelines) && payload.pipelineUid && payload.pipelineUid.length) {
    const newOpenCollector = Object.assign(
      {},
      payload.openCollector,
      { pipelines: payload.openCollector.pipelines.filter(p => p.uid !== payload.pipelineUid) }
    )

    const newPayload = {
      pushToApi: payload.pushToApi,
      caller: payload.caller,
      openCollector: newOpenCollector
    }

    // And push it out for Update
    return dispatch('upsertOpenCollector', newPayload)
  }
}

export function callDeploymentStepApi ({ state }, payload) {
  if (
    payload &&
    payload.apiUrl &&
    payload.apiUrl.length
  ) {
    postDataToSite({
      apiUrl: payload.apiUrl,
      apiHeaders: {
        authorization: 'Bearer ' + state.jwtToken
      },
      dataLabel: (payload && payload.dataLabel ? payload.dataLabel : undefined),
      countDataLabel: false,
      silent: (payload && payload.silent ? payload.silent : true),
      caller: (payload && payload.caller ? payload.caller : this._vm),
      apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
      onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
      onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
      debug: (payload && payload.debug ? payload.debug : false)
    })
  }
}

// ######################################################################
// SECRET OBFUSCATION
// ######################################################################

export function obfuscateSecretForOpenCollector ({ state }, payload) {
  postDataToSite({
    apiUrl: '/oc/ObfuscateSecret',
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    targetObjectName: (payload && payload.targetObjectName ? payload.targetObjectName : ''),
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: true,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

// ######################################################################
// Base64 Encoding of Files
// ######################################################################

export function base64EncodeFile ({ state }, payload) {
  postDataToSite({
    apiUrl: '/oc/Base64EncodeFile',
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    targetObjectName: (payload && payload.targetObjectName ? payload.targetObjectName : ''),
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: true,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    apiCallParams: (payload && payload.apiCallParams ? payload.apiCallParams : undefined),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

// ######################################################################
// USER ACCOUNTS MANAGEMENT
// ######################################################################

export function getUserAccounts ({ state, commit }, payload) {
  getDataFromSite({
    apiUrl: '/admin/GetUsersList',
    dataLabel: 'Accounts',
    countDataLabel: true,
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    commit: commit,
    targetCommitName: 'getUserAccounts',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: false,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: false
  })
}

export function updateUserAccount ({ state }, payload) {
  if (payload && payload.roleUid) {
    postDataToSite({
      apiUrl: '/admin/UpdateUser',
      dataLabel: 'Account',
      apiCallParams: {
        userId: payload.userId,
        userLogin: (payload.userId == null ? payload.userLogin : null), // Not sending Login nor Pass for new Users
        userPassword: (payload.userId == null ? payload.userPassword : null), // Not sending Login nor Pass for new Users
        roleUid: payload.roleUid
      },
      apiHeaders: {
        authorization: 'Bearer ' + state.jwtToken
      },
      loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
      silent: false,
      caller: (payload && payload.caller ? payload.caller : this._vm),
      onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
      onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
      debug: false
    })
  }
}

export function deleteUserAccount ({ state }, payload) {
  if (payload && payload.userId != null) {
    postDataToSite({
      apiUrl: '/admin/DeleteUser',
      dataLabel: 'Account',
      apiCallParams: { userId: payload.userId },
      apiHeaders: {
        authorization: 'Bearer ' + state.jwtToken
      },
      loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
      silent: false,
      caller: (payload && payload.caller ? payload.caller : this._vm),
      onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
      onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
      debug: false
    })
  }
}

export function getUserRoles ({ state, commit }, payload) {
  getDataFromSite({
    apiUrl: '/admin/GetRolesList',
    dataLabel: 'Roles',
    countDataLabel: true,
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    commit: commit,
    targetCommitName: 'getUserRoles',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: false,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: false
  })
}

export function updateUserRole ({ state }, payload) {
  if (payload && payload.roleUid && payload.roleUid.length && payload.roleName && payload.roleName.length) {
    postDataToSite({
      apiUrl: '/admin/UpdateRole',
      dataLabel: 'Role',
      apiCallParams: {
        uid: payload.roleUid,
        name: payload.roleName,
        isPrivileged: payload.roleIsPrivileged
      },
      apiHeaders: {
        authorization: 'Bearer ' + state.jwtToken
      },
      loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
      silent: false,
      caller: (payload && payload.caller ? payload.caller : this._vm),
      onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
      onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
      debug: false
    })
  }
}

export function deleteUserRole ({ state }, payload) {
  if (payload && payload.roleUid && payload.roleUid.length) {
    postDataToSite({
      apiUrl: '/admin/DeleteRole',
      dataLabel: 'Role',
      apiCallParams: { uid: payload.roleUid },
      apiHeaders: {
        authorization: 'Bearer ' + state.jwtToken
      },
      loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
      silent: false,
      caller: (payload && payload.caller ? payload.caller : this._vm),
      onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
      onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
      debug: false
    })
  }
}

// ######################################################################
// EZ MARKET PLACE
// ######################################################################

export function updateEzMarketNotificationNumber ({ commit }, payload) {
  commit('updateEzMarketNotificationNumber', payload)
}

export function reloadEzMarketNotifications ({ state, commit }, payload) {
  console.log('☁️ Downloading Notifications from EZ Cloud Market Place...')

  // Building the full URL of the API root
  const ezMarketApiBaseUrl = state.ezMarket.server.baseUrl + state.ezMarket.server.baseApiPath

  // Using Fetch here, instead of getDataFromSite to avoid CORS problems
  fetch(ezMarketApiBaseUrl + '/notifications', {
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    headers: {
      'ez-publisher': (state.ezMarket && state.ezMarket.ezMarketUid ? state.ezMarket.ezMarketUid : ''),
      'ez-server-version': (state.deployment && state.deployment.version ? state.deployment.version : ''),
      'ez-client-version': (version || '')
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }
      return response.json()
    })
    .then(data => {
      if (data && data.records && Array.isArray(data.records)) {
        // Only flag the ones that are Unread
        const unReadMessages = data.records.filter((notification) => notification && notification.statusName && notification.statusName === 'Unread').length
        // Push the whole lot to the State
        commit('updateEzMarketNotifications', data.records)
        console.log(`✔️ [API SUCCESS] Succesfully loaded ${data.records.length} Notifications. Of which ${unReadMessages} are marked as Unread.`)
      } else {
        throw new Error('Returned data wasn\'t a proper JSON array.')
      }
    })
    .catch(error => {
      console.log('⚠️ [API ERROR] Loading error: ' + error.message)
    })
}

export function loadEzMarketNotificationById ({ state, commit }, messageUid) {
  // Building the full URL of the API root
  const ezMarketApiBaseUrl = state.ezMarket.server.baseUrl + state.ezMarket.server.baseApiPath

  if (messageUid && messageUid.length && state.ezMarketNotifications.find((notif) => notif && notif.messageUid === messageUid)) {
    console.log('☁️ Downloading Notification from EZ Cloud Market Place...')

    // Using Fetch here, instead of getDataFromSite to avoid CORS problems
    fetch(ezMarketApiBaseUrl + '/notifications/' + messageUid, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: {
        'ez-publisher': (state.ezMarket && state.ezMarket.ezMarketUid ? state.ezMarket.ezMarketUid : ''),
        'ez-server-version': (state.deployment && state.deployment.version ? state.deployment.version : ''),
        'ez-client-version': (version || '')
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.')
        }
        return response.json()
      })
      .then(data => {
        if (data && data.records && Array.isArray(data.records)) {
          // Only flag the ones that are Unread
          const unReadMessages = data.records.filter((notification) => notification && notification.statusName && notification.statusName === 'Unread').length
          // Push the whole lot to the State
          commit('updateEzMarketNotificationsSubset', data.records)
          console.log(`✔️ [API SUCCESS] Succesfully loaded ${data.records.length} Notifications. Of which ${unReadMessages} are marked as Unread.`)
        } else {
          throw new Error('Returned data wasn\'t a proper JSON array.')
        }
      })
      .catch(error => {
        console.log('⚠️ [API ERROR] Loading error: ' + error.message)
      })
  }
}

export function updateEzMarketNotificationStatusTo ({ state, commit }, payload) {
  const { messageUid, toStatus } = payload
  if (messageUid && messageUid.length && toStatus && toStatus.length) {
    const notification = state.ezMarketNotifications.find((notif) => notif && notif.messageUid === messageUid)
    if (notification) {
      // Building the full URL of the API root
      const ezMarketApiBaseUrl = state.ezMarket.server.baseUrl + state.ezMarket.server.baseApiPath

      // Using Fetch here, instead of getDataFromSite to avoid CORS problems
      fetch(ezMarketApiBaseUrl + '/notifications/' + messageUid, {
        method: 'PUT',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        headers: {
          'ez-publisher': (state.ezMarket && state.ezMarket.ezMarketUid ? state.ezMarket.ezMarketUid : ''),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notification: {
            messageUid: messageUid,
            status: toStatus
          }
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok.')
          }
          return response.json()
        })
        .then(data => {
          if (data && data.result) {
            console.log(`✔️ [API SUCCESS] Succesfully updated ${data.result.affectedRows || 0} Notification(s).`)
            // Reload the item in question
            loadEzMarketNotificationById({ state, commit }, messageUid)
          } else {
            throw new Error('Returned data wasn\'t a proper JSON array.')
          }
        })
        .catch(error => {
          console.log('⚠️ [API ERROR] Loading error: ' + error.message)
        })
    }
  }
}

export function deleteEzMarketNotificationById ({ state, commit }, messageUid) {
  console.log('deleteEzMarketNotificationById', messageUid)
  if (messageUid && messageUid.length && state.ezMarketNotifications.find((notif) => notif && notif.messageUid === messageUid)) {
    console.log('☁️ Deleting Notification from EZ Cloud Market Place...')

    // Building the full URL of the API root
    const ezMarketApiBaseUrl = state.ezMarket.server.baseUrl + state.ezMarket.server.baseApiPath

    // Using Fetch here, instead of getDataFromSite to avoid CORS problems
    fetch(ezMarketApiBaseUrl + '/notifications/' + messageUid, {
      method: 'DELETE',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: {
        'ez-publisher': (state.ezMarket && state.ezMarket.ezMarketUid ? state.ezMarket.ezMarketUid : ''),
        'ez-server-version': (state.deployment && state.deployment.version ? state.deployment.version : ''),
        'ez-client-version': (version || '')
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.')
        }
        return response.json()
      })
      .then(data => {
        if (data && data.result) {
          const affectedRows = data.result.affectedRows || 0
          console.log(`✔️ [API SUCCESS] Succesfully deleted ${affectedRows} Notification(s).`)
          if (affectedRows === 1) {
            // Delete the item in question from the State
            commit('deleteEzMarketNotificationById', messageUid)
          }
        } else {
          throw new Error('Returned data wasn\'t a proper JSON array.')
        }
      })
      .catch(error => {
        console.log('⚠️ [API ERROR] Loading error: ' + error.message)
      })
  }
}

export function reloadEzMarketPipelineTemplates ({ state, commit }, payload) {
  console.log('☁️ Downloading Pipeline Templates from EZ Cloud Market Place...')

  // Building the full URL of the API root
  const ezMarketApiBaseUrl = state.ezMarket.server.baseUrl + state.ezMarket.server.baseApiPath

  // Using Fetch here, instead of getDataFromSite to avoid CORS problems
  fetch(ezMarketApiBaseUrl + '/pipelineTemplates', {
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    headers: {
      'ez-publisher': (state.ezMarket && state.ezMarket.ezMarketUid ? state.ezMarket.ezMarketUid : ''),
      'ez-server-version': (state.deployment && state.deployment.version ? state.deployment.version : ''),
      'ez-client-version': (version || '')
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }
      return response.json()
    })
    .then(data => {
      if (data && data.records && Array.isArray(data.records)) {
        // Push the whole lot to the State
        commit('updateEzMarketPipelineTemplates', data.records)
        console.log(`✔️ [API SUCCESS] Succesfully loaded ${data.records.length} Pipeline Templates.`)
      } else {
        throw new Error('Returned data wasn\'t a proper JSON array.')
      }
    })
    .catch(error => {
      console.log('⚠️ [API ERROR] Loading error: ' + error.message)
    })
}

export function loadEzMarketPipelineTemplateById ({ state, commit }, { pipelineTemplateUid, onSuccessCallBack, onErrorCallBack, params }) {
  // Building the full URL of the API root
  const ezMarketApiBaseUrl = state.ezMarket.server.baseUrl + state.ezMarket.server.baseApiPath

  if (pipelineTemplateUid && pipelineTemplateUid.length && state.ezMarketPipelineTemplates.find((pipelineTemplate) => pipelineTemplate && pipelineTemplate.uid === pipelineTemplateUid)) {
    // Clear the currently loaded item, if different from the one we are about to load
    if (!(state.ezMarketPipelineTemplate && state.ezMarketPipelineTemplate.uid && state.ezMarketPipelineTemplate.uid === pipelineTemplateUid)) {
      console.log('🧹 Clear the currently loaded Market Pipeline Template')
      commit('updateEzMarketPipelineTemplateById', [{}])
    }

    console.log('☁️ Downloading Pipeline Template from EZ Cloud Market Place...')

    // Using Fetch here, instead of getDataFromSite to avoid CORS problems
    fetch(ezMarketApiBaseUrl + '/pipelineTemplates/' + pipelineTemplateUid, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: {
        'ez-publisher': (state.ezMarket && state.ezMarket.ezMarketUid ? state.ezMarket.ezMarketUid : ''),
        'ez-server-version': (state.deployment && state.deployment.version ? state.deployment.version : ''),
        'ez-client-version': (version || '')
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.')
        }
        return response.json()
      })
      .then(data => {
        if (data && data.records && Array.isArray(data.records)) {
          // Clean up to data
          let pipelineTemplate
          try {
            pipelineTemplate = JSON.parse(JSON.stringify(data.records[0] || {}))
            // Parse the stats (as they are stored as stringified JSON in the database)
            try {
              pipelineTemplate.stats = JSON.parse(pipelineTemplate.stats) || {}
            } catch (error) {
              pipelineTemplate.stats = {}
            }

            // Parse the Collection Configuration (as it's are stored as stringified JSON in the database)
            try {
              pipelineTemplate.collection_configuration = JSON.parse(pipelineTemplate.collection_configuration) || {}
            } catch (error) {
              pipelineTemplate.collection_configuration = {}
            }

            // Parse the Fields Mapping (as it's are stored as stringified JSON in the database)
            try {
              pipelineTemplate.mapping_configuration = JSON.parse(pipelineTemplate.mapping_configuration) || {}
            } catch (error) {
              pipelineTemplate.mapping_configuration = {}
            }
          } catch (error) {
            // Fall back on the raw data
            pipelineTemplate = data.records[0] || {}
          }

          // Push the whole lot to the State
          commit('updateEzMarketPipelineTemplateById', pipelineTemplate)

          console.log(`✔️ [API SUCCESS] Succesfully loaded ${data.records.length} Pipeline Template.`)
          if (typeof onSuccessCallBack === 'function') {
            onSuccessCallBack({
              data: pipelineTemplate,
              success: true,
              params,
              messageForLogAndPopup: null
            })
          }
        } else {
          if (typeof onErrorCallBack === 'function') {
            onErrorCallBack({
              data: (data && data.records ? data.records : undefined),
              success: false,
              params,
              messageForLogAndPopup: 'Returned data wasn\'t a proper JSON array.'
            })
          }
          throw new Error('Returned data wasn\'t a proper JSON array.')
        }
      })
      .catch(error => {
        console.log('⚠️ [API ERROR] Loading error: ' + error.message)
      })
  }
}

export function createEzMarketPipelineTemplate ({ state, commit }, { pipelineTemplateToPublish, onSuccessCallBack, onErrorCallBack, params }) {
  if (
    pipelineTemplateToPublish &&
    pipelineTemplateToPublish.pipelineTemplateUid &&
    pipelineTemplateToPublish.pipelineTemplateUid.length &&
    pipelineTemplateToPublish.name &&
    pipelineTemplateToPublish.name.length
  ) {
    // Building the full URL of the API root
    const ezMarketApiBaseUrl = state.ezMarket.server.baseUrl + state.ezMarket.server.baseApiPath

    // Using Fetch here, instead of getDataFromSite to avoid CORS problems
    fetch(ezMarketApiBaseUrl + '/pipelineTemplates', {
      method: 'POST',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: {
        'ez-publisher': (state.ezMarket.ezMarketUid ? state.ezMarket.ezMarketUid : ''),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pipelineTemplate: {
          pipelineTemplateUid: pipelineTemplateToPublish.pipelineTemplateUid,
          // publisherUid: null,
          // statusId: null,
          name: pipelineTemplateToPublish.name,
          readmeMarkdown: pipelineTemplateToPublish.readmeMarkdown || undefined,
          iconPicture: pipelineTemplateToPublish.iconPicture || undefined,
          collectionConfiguration: pipelineTemplateToPublish.collectionConfiguration || undefined,
          fieldsMapping: pipelineTemplateToPublish.fieldsMapping || undefined,
          stats: pipelineTemplateToPublish.stats || undefined
        }
      })
    })
      .then(response => {
        if (!response.ok) {
          if (typeof onErrorCallBack === 'function') {
            onErrorCallBack({
              data: undefined,
              success: false,
              params: null,
              messageForLogAndPopup: 'Network response was not ok.'
            })
          }
          throw new Error('Network response was not ok.')
        }
        return response.json()
      })
      .then(data => {
        if (data && data.result) {
          console.log(`✔️ [API SUCCESS] Succesfully created ${data.result.affectedRows || 0} Pipeline Template(s).`)
          if (typeof onSuccessCallBack === 'function') {
            onSuccessCallBack({
              data: (data && data.records ? data.records : undefined),
              success: true,
              params: params,
              messageForLogAndPopup: null
            })
          }
        } else {
          if (typeof onErrorCallBack === 'function') {
            onErrorCallBack({
              data: data || undefined,
              success: false,
              params: params,
              messageForLogAndPopup: 'Returned data wasn\'t a proper JSON array.'
            })
          }
          throw new Error('Returned data wasn\'t a proper JSON array.')
        }
      })
      .catch(error => {
        console.log('⚠️ [API ERROR] Loading error: ' + error.message)
      })
  } else {
    if (typeof onErrorCallBack === 'function') {
      onErrorCallBack({
        data: undefined,
        success: false,
        params: null,
        messageForLogAndPopup: 'Missing or incomplete parameter to function (need both Pipeline Template\'s UID and Name).'
      })
    }
  }
}

export function loadEzMarketPublisherDetails ({ state, commit }, { onSuccessCallBack, onErrorCallBack }) {
  console.log('☁️ Downloading Publisher\'s details from EZ Cloud Market Place...')

  // Building the full URL of the API root
  const ezMarketApiBaseUrl = state.ezMarket.server.baseUrl + state.ezMarket.server.baseApiPath

  // Using Fetch here, instead of getDataFromSite to avoid CORS problems
  fetch(ezMarketApiBaseUrl + '/publishers/' + state.ezMarket.publisherUid, {
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    headers: {
      'ez-publisher': (state.ezMarket && state.ezMarket.ezMarketUid ? state.ezMarket.ezMarketUid : ''),
      'ez-server-version': (state.deployment && state.deployment.version ? state.deployment.version : ''),
      'ez-client-version': (version || '')
    }
  })
    .then(response => {
      if (!response.ok) {
        if (typeof onErrorCallBack === 'function') {
          onErrorCallBack({
            data: undefined,
            success: false,
            params: null,
            messageForLogAndPopup: 'Network response was not ok.'
          })
        }
        throw new Error('Network response was not ok.')
      }
      return response.json()
    })
    .then(data => {
      if (data && data.records && Array.isArray(data.records)) {
        // Extract up to data
        let publisherDetails
        try {
          publisherDetails = JSON.parse(JSON.stringify(data.records[0] || {}))
        } catch (error) {
          // Fall back on the raw data
          publisherDetails = data.records[0] || {}
        }

        // Push the whole lot to the State
        commit('updateEzMarketPublisherDetails', publisherDetails)
        console.log(`✔️ [API SUCCESS] Succesfully loaded ${data.records.length} Publishers details.`)
        if (typeof onSuccessCallBack === 'function') {
          onSuccessCallBack({
            data: publisherDetails,
            success: true,
            params: null,
            messageForLogAndPopup: null
          })
        }
      } else {
        if (typeof onErrorCallBack === 'function') {
          onErrorCallBack({
            data: (data && data.records ? data.records : undefined),
            success: false,
            params: null,
            messageForLogAndPopup: 'Returned data wasn\'t a proper JSON array.'
          })
        }
        throw new Error('Returned data wasn\'t a proper JSON array.')
      }
    })
    .catch(error => {
      console.log('⚠️ [API ERROR] Loading error: ' + error.message)
    })
}

export function createEzMarketPublisher ({ state, commit }, { toName, onSuccessCallBack, onErrorCallBack }) {
  if (state.ezMarket && state.ezMarket.publisherUid && state.ezMarket.publisherUid.length && toName && toName.length) {
    // Building the full URL of the API root
    const ezMarketApiBaseUrl = state.ezMarket.server.baseUrl + state.ezMarket.server.baseApiPath

    // Using Fetch here, instead of getDataFromSite to avoid CORS problems
    fetch(ezMarketApiBaseUrl + '/publishers', {
      method: 'POST',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: {
        'ez-publisher': (state.ezMarket.ezMarketUid ? state.ezMarket.ezMarketUid : ''),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        publisher: {
          publisherUid: state.ezMarket.publisherUid,
          displayName: toName
        }
      })
    })
      .then(response => {
        if (!response.ok) {
          if (typeof onErrorCallBack === 'function') {
            onErrorCallBack({
              data: undefined,
              success: false,
              params: null,
              messageForLogAndPopup: 'Network response was not ok.'
            })
          }
          throw new Error('Network response was not ok.')
        }
        return response.json()
      })
      .then(data => {
        if (data && data.result) {
          console.log(`✔️ [API SUCCESS] Succesfully created ${data.result.affectedRows || 0} Publisher(s) details.`)
          if (typeof onSuccessCallBack === 'function') {
            onSuccessCallBack({
              data: (data && data.records ? data.records : undefined),
              success: true,
              params: null,
              messageForLogAndPopup: null
            })
          }
        } else {
          if (typeof onErrorCallBack === 'function') {
            onErrorCallBack({
              data: (data && data.records ? data.records : undefined),
              success: false,
              params: null,
              messageForLogAndPopup: 'Returned data wasn\'t a proper JSON array.'
            })
          }
          throw new Error('Returned data wasn\'t a proper JSON array.')
        }
      })
      .catch(error => {
        console.log('⚠️ [API ERROR] Loading error: ' + error.message)
      })
  }
}

export function updateEzMarketPublisherDetails ({ state, commit }, { toName, onSuccessCallBack, onErrorCallBack }) {
  if (state.ezMarket && state.ezMarket.publisherUid && state.ezMarket.publisherUid.length && toName && toName.length) {
    // Building the full URL of the API root
    const ezMarketApiBaseUrl = state.ezMarket.server.baseUrl + state.ezMarket.server.baseApiPath

    // Using Fetch here, instead of getDataFromSite to avoid CORS problems
    fetch(ezMarketApiBaseUrl + '/publishers/' + state.ezMarket.publisherUid, {
      method: 'PUT',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: {
        'ez-publisher': (state.ezMarket.ezMarketUid ? state.ezMarket.ezMarketUid : ''),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        publisher: {
          publisherUid: state.ezMarket.publisherUid,
          displayName: toName
        }
      })
    })
      .then(response => {
        if (!response.ok) {
          if (typeof onErrorCallBack === 'function') {
            onErrorCallBack({
              data: undefined,
              success: false,
              params: null,
              messageForLogAndPopup: 'Network response was not ok.'
            })
          }
          throw new Error('Network response was not ok.')
        }
        return response.json()
      })
      .then(data => {
        if (data && data.result) {
          console.log(`✔️ [API SUCCESS] Succesfully updated ${data.result.affectedRows || 0} Publisher(s) details.`)
          if (typeof onSuccessCallBack === 'function') {
            onSuccessCallBack({
              data: (data && data.records ? data.records : undefined),
              success: true,
              params: null,
              messageForLogAndPopup: null
            })
          }
        } else {
          if (typeof onErrorCallBack === 'function') {
            onErrorCallBack({
              data: (data && data.records ? data.records : undefined),
              success: false,
              params: null,
              messageForLogAndPopup: 'Returned data wasn\'t a proper JSON array.'
            })
          }
          throw new Error('Returned data wasn\'t a proper JSON array.')
        }
      })
      .catch(error => {
        console.log('⚠️ [API ERROR] Loading error: ' + error.message)
      })
  }
}

// ######################################################################
// Landing Page News Feed
// ######################################################################

export function loadLatestNews ({ state, commit }) {
  // Building the full URL of the API root
  const ezMarketApiBaseUrl = state.ezMarket.server.baseUrl + state.ezMarket.server.baseApiPath
  const messageUid = 'latestNews'

  if (messageUid && messageUid.length) {
    console.log('☁️ Downloading Latest News from EZ Cloud Market Place...')

    // Using Fetch here, instead of getDataFromSite to avoid CORS problems
    fetch(ezMarketApiBaseUrl + '/notifications/' + messageUid, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: {
        'ez-publisher': (state.ezMarket && state.ezMarket.ezMarketUid ? state.ezMarket.ezMarketUid : ''),
        'ez-server-version': (state.deployment && state.deployment.version ? state.deployment.version : ''),
        'ez-client-version': (version || '')
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.')
        }
        return response.json()
      })
      .then(data => {
        if (data && data.records && Array.isArray(data.records)) {
          // Push the whole lot to the State
          commit('updateLatestNews', data.records)
          console.log('✔️ [API SUCCESS] Succesfully loaded the Latest News.')
        } else {
          throw new Error('Returned data wasn\'t a proper JSON array.')
        }
      })
      .catch(error => {
        console.log('⚠️ [API ERROR] Loading error: ' + error.message)
      })
  }
}

// ######################################################################
// HELPERS
// ######################################################################

export function adaptPipelineCollectionConfiguration (dummy, payload) {
  const importedCollectionConfiguration = payload.importedCollectionConfiguration || {}
  const targetDetails = payload.targetDetails || {}
  // Target Details should include:
  // - uid
  // - name

  try {
    // Parse
    const parsedImportedCollectionConfiguration = (importedCollectionConfiguration ? JSON.parse(JSON.stringify(importedCollectionConfiguration)) : null)

    // Extract UID and Name
    const targetPipelineUid = targetDetails.uid
    const targetPipelineName = targetDetails.name

    // Extract Shipper and Method
    const collectionShipper = (
      parsedImportedCollectionConfiguration &&
      parsedImportedCollectionConfiguration.collectionShipper &&
      parsedImportedCollectionConfiguration.collectionShipper.length
        ? parsedImportedCollectionConfiguration.collectionShipper
        : null
    )

    // Replace Pipeline identifiers

    // Beat: filebeat
    if (collectionShipper === 'filebeat') {
      // Ensure we have the .fields branch
      parsedImportedCollectionConfiguration.fields = parsedImportedCollectionConfiguration.fields || {}

      parsedImportedCollectionConfiguration.fields.stream_id = targetPipelineUid
      parsedImportedCollectionConfiguration.fields.stream_name = targetPipelineName
    }
    // Beat: jsBeat
    if (collectionShipper === 'jsBeat') {
      // Ensure we have the .fields branch
      parsedImportedCollectionConfiguration.filterHelpers = parsedImportedCollectionConfiguration.filterHelpers || {}

      parsedImportedCollectionConfiguration.filterHelpers.stream_id = targetPipelineUid
      parsedImportedCollectionConfiguration.filterHelpers.stream_name = targetPipelineName
      parsedImportedCollectionConfiguration.uid = targetPipelineUid
      parsedImportedCollectionConfiguration.name = targetPipelineName
    }

    // LogRhythm Beats
    if (
      [
        'genericbeat',
        'webhookbeat'
      ].includes(collectionShipper)
    ) {
      parsedImportedCollectionConfiguration.beatIdentifier = String(targetPipelineUid.substring(0, 3) + '_' + targetPipelineName.replace(/[^a-zA-Z0-9]/g, '_') + '_' + targetPipelineUid).substring(0, 12)
      parsedImportedCollectionConfiguration.logsource_name = targetPipelineName
    }

    // Pat on the back everyone! Job done.
    return parsedImportedCollectionConfiguration
  } catch (error) {
    console.log('⚠️ [IMPORT] Parsing error: Could not parse or adapt Configuration Collection.', error.message)
  }
  return null
}

//           ###    ########  ####       ##     ## ######## #### ##       #### ######## #### ########  ######
//          ## ##   ##     ##  ##        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//         ##   ##  ##     ##  ##        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##
//        ##     ## ########   ##        ##     ##    ##     ##  ##        ##     ##     ##  ######    ######
//        ######### ##         ##        ##     ##    ##     ##  ##        ##     ##     ##  ##             ##
//        ##     ## ##         ##        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//        ##     ## ##        ####        #######     ##    #### ######## ####    ##    #### ########  ######

export function getDataFromSite (params = {
  apiUrl: '',
  isUrlExternal: false,
  dataLabel: '',
  countDataLabel: false,
  targetObjectName: '',
  commit: null,
  targetCommitName: '',
  loadingVariableName: '',
  apiCallParams: {},
  apiHeaders: {},
  silent: false,
  logToConsole: true,
  caller: this,
  debug: false,
  onSuccessCallBack: null,
  onErrorCallBack: null
}) {
  let messageForLogAndPopup = ''
  let captionForLogAndPopup = ''
  let queryResultedInError = false
  let notificationPopupId = null
  let apiResponse = {}

  if (typeof params.apiUrl === 'undefined') { params.apiUrl = '' }
  if (typeof params.isUrlExternal === 'undefined') { params.isUrlExternal = false }
  if (typeof params.dataLabel === 'undefined') { params.dataLabel = '' }
  if (typeof params.countDataLabel === 'undefined') { params.countDataLabel = false }
  if (typeof params.targetObjectName === 'undefined') { params.targetObjectName = '' }
  if (typeof params.commit === 'undefined') { params.commit = null }
  if (typeof params.targetCommitName === 'undefined') { params.targetCommitName = '' }
  if (typeof params.loadingVariableName === 'undefined') { params.loadingVariableName = '' }
  if (typeof params.apiCallParams === 'undefined') { params.apiCallParams = {} }
  if (typeof params.apiHeaders === 'undefined') { params.apiHeaders = {} }
  if (typeof params.silent === 'undefined') { params.silent = false }
  if (typeof params.logToConsole === 'undefined') { params.logToConsole = true }
  if (typeof params.caller === 'undefined') { params.caller = this }
  if (typeof params.debug === 'undefined') { params.debug = false }
  if (typeof params.onSuccessCallBack === 'undefined') { params.onSuccessCallBack = null }
  if (typeof params.onErrorCallBack === 'undefined') { params.onErrorCallBack = null }

  if (params.debug) {
    console.log('getDataFromSite -- BEGIN')
  }

  if (!params.silent && params.caller && params.caller.$q) {
    notificationPopupId = params.caller.$q.notify({
      icon: 'cloud_download',
      message: i18n.t('Downloading') + ' ' + params.dataLabel + '...',
      type: 'ongoing'
    })
  }
  if (params.logToConsole) {
    console.log('☁️ ' + i18n.t('Downloading') + ' ' + params.dataLabel + '...')
  }

  // If a loadingVariable is provided, set it to true
  if (params.loadingVariableName.length) {
    params.caller[params.loadingVariableName] = true
  }

  if (params.debug) {
    console.log('getDataFromSite -- GET')
  }
  params.caller.$axios.get((params.isUrlExternal ? params.apiUrl : params.caller.globalConstants.baseUrl.api + params.apiUrl), {
    params: params.apiCallParams,
    headers: params.apiHeaders
  })
    .then(function (response) {
      if (params.debug) {
        console.log('getDataFromSite -- Then')
      }
      if (params.debug) {
        console.log(response)
      }
      apiResponse = response
      if (response.data && response.data.payload) {
        // Assign to targetObject
        if (params.targetObjectName.length) {
          params.caller[params.targetObjectName] = response.data.payload
        }
        // Commit to targetCommitName
        if (typeof params.commit === 'function' && params.targetCommitName.length) {
          params.commit(params.targetCommitName, response.data.payload)
        }
        if (response.data.errors && Array.isArray(response.data.errors) && response.data.errors.length > 0) {
          queryResultedInError = true
          messageForLogAndPopup = i18n.t('Error querying persistance layer.')
          if (process.env.DEV) {
            captionForLogAndPopup = response.data.errors.join(' / ')
          }
        } else {
          queryResultedInError = false
          if (params.countDataLabel && Array.isArray(response.data.payload)) {
            messageForLogAndPopup = i18n.t('Succesfully loaded') + ' ' + response.data.payload.length + ' ' + params.dataLabel + '.'
          } else {
            messageForLogAndPopup = i18n.t('Succesfully loaded') + ' ' + params.dataLabel + '.'
          }
        }
      } else {
        messageForLogAndPopup = i18n.t('Invalid response') + '.'
        captionForLogAndPopup = i18n.t('No "response" object in AJAX response')
        queryResultedInError = true
      }
    })
    .catch(function (errorMessage) {
      if (params.debug) {
        console.log('getDataFromSite -- Catch')
      }
      messageForLogAndPopup = i18n.t('Loading error') + ': ' + (typeof errorMessage !== 'object' ? errorMessage : JSON.stringify(errorMessage))
      queryResultedInError = true
    })
    .finally(() => {
      if (params.debug) {
        console.log('getDataFromSite -- Finally')
      }

      if (queryResultedInError) {
        if (params.logToConsole) {
          console.log('⚠️ ' + i18n.t('[API ERROR]') + ' ' + messageForLogAndPopup + (captionForLogAndPopup && captionForLogAndPopup.length ? ' // ' + captionForLogAndPopup : ''))
        }
        if (!params.silent && notificationPopupId) {
          notificationPopupId({
            type: 'negative',
            color: 'negative',
            icon: 'o_report_problem',
            message: messageForLogAndPopup,
            caption: captionForLogAndPopup,
            timeout: 4000
          })
        }
        if (typeof params.onErrorCallBack === 'function') {
          if (params.debug) {
            console.log('getDataFromSite -- onErrorCallBack')
          }
          params.onErrorCallBack({
            data: (apiResponse && apiResponse.data ? apiResponse.data : undefined),
            success: false,
            params,
            messageForLogAndPopup
          })
        }
      } else {
        if (params.logToConsole) {
          console.log('✔️ ' + i18n.t('[API SUCCESS]') + ' ' + messageForLogAndPopup + (captionForLogAndPopup && captionForLogAndPopup.length ? ' // ' + captionForLogAndPopup : ''))
        }
        if (!params.silent && notificationPopupId) {
          notificationPopupId({
            type: 'positive',
            color: 'positive',
            icon: 'check',
            message: messageForLogAndPopup,
            caption: captionForLogAndPopup
          })
        }
        if (typeof params.onSuccessCallBack === 'function') {
          if (params.debug) {
            console.log('getDataFromSite -- onSuccessCallBack')
          }
          params.onSuccessCallBack({
            data: (apiResponse && apiResponse.data ? apiResponse.data : undefined),
            success: true,
            params,
            messageForLogAndPopup
          })
        }
      }
      // If a loadingVariableName is provided, set it to false
      if (params.loadingVariableName.length) {
        params.caller[params.loadingVariableName] = false
      }

      if (params.debug) {
        console.log('getDataFromSite -- END')
      }
    })
} // getDataFromSite

// postDataToSite: Call API endpoint to post data to it, and optionally get data from it
export function postDataToSite (params = {
  apiUrl: '',
  isUrlExternal: false,
  dataLabel: '',
  countDataLabel: false,
  targetObjectName: '',
  commit: null,
  targetCommitName: '',
  loadingVariableName: '',
  apiCallParams: {},
  apiHeaders: {},
  silent: false,
  logToConsole: true,
  caller: this,
  debug: false,
  onSuccessCallBack: null,
  onErrorCallBack: null
}) {
  let messageForLogAndPopup = ''
  let captionForLogAndPopup = ''
  let queryResultedInError = false
  let notificationPopupId = null
  let apiResponse = {}

  if (typeof params.apiUrl === 'undefined') { params.apiUrl = '' }
  if (typeof params.isUrlExternal === 'undefined') { params.isUrlExternal = false }
  if (typeof params.dataLabel === 'undefined') { params.dataLabel = '' }
  if (typeof params.countDataLabel === 'undefined') { params.countDataLabel = false }
  if (typeof params.targetObjectName === 'undefined') { params.targetObjectName = '' }
  if (typeof params.commit === 'undefined') { params.commit = null }
  if (typeof params.targetCommitName === 'undefined') { params.targetCommitName = '' }
  if (typeof params.loadingVariableName === 'undefined') { params.loadingVariableName = '' }
  if (typeof params.apiCallParams === 'undefined') { params.apiCallParams = {} }
  if (typeof params.apiHeaders === 'undefined') { params.apiHeaders = {} }
  if (typeof params.silent === 'undefined') { params.silent = false }
  if (typeof params.logToConsole === 'undefined') { params.logToConsole = true }
  if (typeof params.caller === 'undefined') { params.caller = this }
  if (typeof params.debug === 'undefined') { params.debug = false }
  if (typeof params.onSuccessCallBack === 'undefined') { params.onSuccessCallBack = null }
  if (typeof params.onErrorCallBack === 'undefined') { params.onErrorCallBack = null }

  if (params.debug) {
    console.log('postDataToSite -- BEGIN')
  }

  if (!params.silent && params.caller && params.caller.$q) {
    notificationPopupId = params.caller.$q.notify({
      icon: 'cloud_upload',
      message: i18n.t('Uploading') + ' ' + params.dataLabel + '...',
      type: 'ongoing'
    })
  }
  if (params.logToConsole) {
    console.log('☁️ ' + i18n.t('Uploading') + ' ' + params.dataLabel + '...')
  }

  // If a loadingVariable is provided, set it to true
  if (params.loadingVariableName.length) {
    params.caller[params.loadingVariableName] = true
  }

  if (params.debug) {
    console.log('postDataToSite -- POST')
  }
  params.caller.$axios.post(
    (params.isUrlExternal ? params.apiUrl : params.caller.globalConstants.baseUrl.api + params.apiUrl),
    params.apiCallParams,
    {
      headers: params.apiHeaders
    }
  )
    .then(function (response) {
      if (params.debug) {
        console.log('postDataToSite -- Then')
      }
      if (params.debug) {
        console.log(response)
      }

      apiResponse = response
      if (response.data && response.data.payload) {
        if (params.targetObjectName.length) {
          // Assign to targetObject
          params.caller[params.targetObjectName] = response.data.payload

          if (params.countDataLabel && Array.isArray(response.data.payload)) {
            captionForLogAndPopup = i18n.t('Succesfully loaded') + ' ' + response.data.payload.length + ' ' + params.dataLabel + '.'
          } else {
            captionForLogAndPopup = i18n.t('Succesfully loaded') + ' ' + params.dataLabel + '.'
          }
        }

        // Commit to targetCommitName
        if (typeof params.commit === 'function' && params.targetCommitName.length) {
          params.commit(params.targetCommitName, response.data.payload)
        }

        if (response.data.errors && Array.isArray(response.data.errors) && response.data.errors.length > 0) {
          queryResultedInError = true
          messageForLogAndPopup = i18n.t('EZ Server API returned an error.')
          if (process.env.DEV) {
            captionForLogAndPopup = response.data.errors.reduce((errorsAccumulatorArray, errorMessage) => {
              errorsAccumulatorArray.push(typeof errorMessage !== 'object' ? errorMessage : JSON.stringify(errorMessage))
              return errorsAccumulatorArray
            }, []).join(' / ')
          }
        } else {
          queryResultedInError = false
          messageForLogAndPopup = i18n.t('Succesfully updated') + ' ' + params.dataLabel + '.'
        }
      } else {
        queryResultedInError = true
        messageForLogAndPopup = i18n.t('Invalid response') + '. ' + i18n.t('No "response" object in AJAX response')
      }
    })
    .catch(function (errorMessage) {
      if (params.debug) {
        console.log('postDataToSite -- Catch')
      }
      messageForLogAndPopup = i18n.t('Update error') + ': ' + (typeof errorMessage !== 'object' ? errorMessage : JSON.stringify(errorMessage))
      queryResultedInError = true
    })
    .finally(() => {
      if (params.debug) {
        console.log('postDataToSite -- Finally')
      }
      if (queryResultedInError) {
        if (params.logToConsole) {
          console.log('⚠️ ' + i18n.t('[API ERROR]') + ' ' + messageForLogAndPopup + (captionForLogAndPopup && captionForLogAndPopup.length ? ' // ' + captionForLogAndPopup : ''))
        }
        if (!params.silent && notificationPopupId) {
          notificationPopupId({
            type: 'negative',
            color: 'negative',
            icon: 'o_report_problem',
            message: messageForLogAndPopup,
            caption: captionForLogAndPopup,
            timeout: 4000
          })
        }
        if (typeof params.onErrorCallBack === 'function') {
          if (params.debug) {
            console.log('postDataToSite -- onErrorCallBack')
          }
          params.onErrorCallBack({
            data: (apiResponse && apiResponse.data ? apiResponse.data : undefined),
            success: false,
            params,
            messageForLogAndPopup,
            captionForLogAndPopup
          })
        }
      } else {
        if (params.logToConsole) {
          console.log('✔️ ' + i18n.t('[API SUCCESS]') + ' ' + messageForLogAndPopup + (captionForLogAndPopup && captionForLogAndPopup.length ? ' // ' + captionForLogAndPopup : ''))
        }
        if (!params.silent && notificationPopupId) {
          notificationPopupId({
            type: 'positive',
            color: 'positive',
            icon: 'check',
            message: messageForLogAndPopup,
            caption: captionForLogAndPopup
          })
        }
        if (typeof params.onSuccessCallBack === 'function') {
          if (params.debug) {
            console.log('postDataToSite -- onSuccessCallBack')
          }
          params.onSuccessCallBack({
            data: (apiResponse && apiResponse.data ? apiResponse.data : undefined),
            success: true,
            params,
            messageForLogAndPopup,
            captionForLogAndPopup
          })
        }
      }
      // If a loadingVariableName is provided, set it to false
      if (params.loadingVariableName.length) {
        params.caller[params.loadingVariableName] = false
      }
      if (params.debug) {
        console.log('postDataToSite -- END')
      }
    })
} // postDataToSite
