import { uid } from 'quasar'

// ######################################################################
// COLLECTORS
// ######################################################################

export function getOpenCollectors ({ commit }, payload) {
  getDataFromSite({
    apiUrl: '/config/GetCollectors',
    dataLabel: 'Collectors',
    countDataLabel: true,
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
        loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
        silent: false,
        caller: (payload && payload.caller ? payload.caller : this._vm),
        debug: false
      })
    }
  }
}

// ######################################################################
// PIPELINES
// ######################################################################

export function getPipelines ({ commit }, payload) {
  getDataFromSite({
    apiUrl: '/config/GetPipelines',
    dataLabel: 'Pipelines',
    countDataLabel: true,
    commit: commit,
    targetCommitName: 'getPipelines',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: false,
    caller: (payload && payload.caller ? payload.caller : this._vm),
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
          loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
          silent: false,
          caller: (payload && payload.caller ? payload.caller : this._vm),
          debug: false
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
        loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
        silent: false,
        caller: (payload && payload.caller ? payload.caller : this._vm),
        debug: false
      })
    }
  }
}

//           ###    ########  ####       ##     ## ######## #### ##       #### ######## #### ########  ######
//          ## ##   ##     ##  ##        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//         ##   ##  ##     ##  ##        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##
//        ##     ## ########   ##        ##     ##    ##     ##  ##        ##     ##     ##  ######    ######
//        ######### ##         ##        ##     ##    ##     ##  ##        ##     ##     ##  ##             ##
//        ##     ## ##         ##        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//        ##     ## ##        ####        #######     ##    #### ######## ####    ##    #### ########  ######

import { i18n } from 'boot/i18n'

function getDataFromSite (params = {
  apiUrl: '',
  dataLabel: '',
  countDataLabel: false,
  targetObjectName: '',
  commit: null,
  targetCommitName: '',
  loadingVariableName: '',
  apiCallParams: {},
  silent: false,
  logToConsole: true,
  caller: this,
  debug: false,
  onSuccessLoadCallBack: null,
  onErrorCallBack: null
}) {
  let messageForLogAndPopup = ''
  let captionForLogAndPopup = ''
  let queryResultedInError = false
  let notificationPopupId = null

  if (typeof params.apiUrl === 'undefined') { params.apiUrl = '' }
  if (typeof params.dataLabel === 'undefined') { params.dataLabel = '' }
  if (typeof params.countDataLabel === 'undefined') { params.countDataLabel = false }
  if (typeof params.targetObjectName === 'undefined') { params.targetObjectName = '' }
  if (typeof params.commit === 'undefined') { params.commit = null }
  if (typeof params.targetCommitName === 'undefined') { params.targetCommitName = '' }
  if (typeof params.loadingVariableName === 'undefined') { params.loadingVariableName = '' }
  if (typeof params.apiCallParams === 'undefined') { params.apiCallParams = {} }
  if (typeof params.silent === 'undefined') { params.silent = false }
  if (typeof params.logToConsole === 'undefined') { params.logToConsole = true }
  if (typeof params.caller === 'undefined') { params.caller = this }
  if (typeof params.debug === 'undefined') { params.debug = false }
  if (typeof params.onSuccessLoadCallBack === 'undefined') { params.onSuccessLoadCallBack = null }
  if (typeof params.onErrorCallBack === 'undefined') { params.onErrorCallBack = null }

  if (params.debug) {
    console.log('getDataFromSite -- BEGIN')
  }

  if (!params.silent) {
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
  params.caller.$axios.get(params.caller.globalConstants.baseUrl.api + params.apiUrl, {
    params: params.apiCallParams
  })
    .then(function (response) {
      if (params.debug) {
        console.log('getDataFromSite -- Then')
      }
      if (params.debug) {
        console.log(response)
      }
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
      messageForLogAndPopup = i18n.t('Loading error') + ': ' + errorMessage
      queryResultedInError = true
    })
    .finally(() => {
      if (params.debug) {
        console.log('getDataFromSite -- Finally')
      }

      if (queryResultedInError) {
        if (params.logToConsole) {
          console.log('⚠️ ' + i18n.t('[API ERROR]') + ' ' + messageForLogAndPopup)
        }
        if (!params.silent) {
          notificationPopupId({
            type: 'negative',
            color: 'negative',
            icon: 'report_problem',
            message: messageForLogAndPopup,
            caption: captionForLogAndPopup,
            timeout: 4000
          })
        }
        if (typeof params.onErrorCallBack === 'function') {
          params.onErrorCallBack()
        }
      } else {
        if (params.logToConsole) {
          console.log('✔️ ' + i18n.t('[API SUCCESS]') + ' ' + messageForLogAndPopup)
        }
        if (!params.silent) {
          notificationPopupId({
            type: 'positive',
            color: 'positive',
            icon: 'check',
            message: messageForLogAndPopup,
            caption: captionForLogAndPopup
          })
        }
        if (typeof params.onSuccessLoadCallBack === 'function') {
          params.onSuccessLoadCallBack()
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
function postDataToSite (params = {
  apiUrl: '',
  dataLabel: '',
  countDataLabel: false,
  targetObjectName: '',
  commit: null,
  targetCommitName: '',
  loadingVariableName: '',
  apiCallParams: {},
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

  if (typeof params.apiUrl === 'undefined') { params.apiUrl = '' }
  if (typeof params.dataLabel === 'undefined') { params.dataLabel = '' }
  if (typeof params.countDataLabel === 'undefined') { params.countDataLabel = false }
  if (typeof params.targetObjectName === 'undefined') { params.targetObjectName = '' }
  if (typeof params.commit === 'undefined') { params.commit = null }
  if (typeof params.targetCommitName === 'undefined') { params.targetCommitName = '' }
  if (typeof params.loadingVariableName === 'undefined') { params.loadingVariableName = '' }
  if (typeof params.apiCallParams === 'undefined') { params.apiCallParams = {} }
  if (typeof params.silent === 'undefined') { params.silent = false }
  if (typeof params.logToConsole === 'undefined') { params.logToConsole = true }
  if (typeof params.caller === 'undefined') { params.caller = this }
  if (typeof params.debug === 'undefined') { params.debug = false }
  if (typeof params.onSuccessCallBack === 'undefined') { params.onSuccessCallBack = null }
  if (typeof params.onErrorCallBack === 'undefined') { params.onErrorCallBack = null }

  if (params.debug) {
    console.log('postDataToSite -- BEGIN')
  }

  if (!params.silent) {
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
  params.caller.$axios.post(params.caller.globalConstants.baseUrl.api + params.apiUrl, params.apiCallParams)
    .then(function (response) {
      if (params.debug) {
        console.log('postDataToSite -- Then')
      }
      if (params.debug) {
        console.log(response)
      }

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

        if (response.data.errors && Array.isArray(response.data.errors) && response.data.errors.length > 0) {
          queryResultedInError = true
          messageForLogAndPopup = i18n.t('Error updating persistance layer.')
          if (process.env.DEV) {
            captionForLogAndPopup = response.data.errors.join(' / ')
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
      messageForLogAndPopup = i18n.t('Update error') + ': ' + errorMessage
      queryResultedInError = true
    })
    .finally(() => {
      if (params.debug) {
        console.log('postDataToSite -- Finally')
      }
      if (queryResultedInError) {
        if (params.logToConsole) {
          console.log('⚠️ ' + i18n.t('[API ERROR]') + ' ' + messageForLogAndPopup + ' // ' + captionForLogAndPopup)
        }
        if (!params.silent) {
          notificationPopupId({
            type: 'negative',
            color: 'negative',
            icon: 'report_problem',
            message: messageForLogAndPopup,
            caption: captionForLogAndPopup,
            timeout: 4000
          })
        }
        if (typeof params.onErrorCallBack === 'function') {
          if (params.debug) {
            console.log('postDataToSite -- onErrorCallBack')
          }
          params.onErrorCallBack()
        }
      } else {
        if (params.logToConsole) {
          console.log('✔️ ' + i18n.t('[API SUCCESS]') + ' ' + messageForLogAndPopup + ' // ' + captionForLogAndPopup)
        }
        if (!params.silent) {
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
          params.onSuccessCallBack()
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
