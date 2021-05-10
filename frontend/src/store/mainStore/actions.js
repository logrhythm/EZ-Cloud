export function upsertOpenCollector ({ state, commit }, payload) {
  if (payload) {
    if (state.openCollectors.filter(oc => oc.uid === payload.uid).length > 0) {
      commit('updateOpenCollector', payload)
    } else {
      commit('addOpenCollector', payload)
    }
  }
}

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

  if (payload.pushToApi && payload.pushToApi === true) {
    postDataToSite({})
  }
}

export function deletePipeline ({ state, commit }, payload) {
  if (payload) {
    if (state.pipelines.filter(p => p.uid === payload.uid).length > 0) {
      commit('deletePipeline', payload)
    }
  }
}

export function getPipelines ({ commit }, payload) {
  getDataFromSite({
    apiUrl: '/config/GetPipelines',
    dataLabel: 'Pipelines',
    countDataLabel: true,
    commit: commit,
    targetCommitName: 'getOpenPipelines',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: false,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    debug: true
  })
}

//           ###    ########  ####       ##     ## ######## #### ##       #### ######## #### ########  ######
//          ## ##   ##     ##  ##        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//         ##   ##  ##     ##  ##        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##
//        ##     ## ########   ##        ##     ##    ##     ##  ##        ##     ##     ##  ######    ######
//        ######### ##         ##        ##     ##    ##     ##  ##        ##     ##     ##  ##             ##
//        ##     ## ##         ##        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//        ##     ## ##        ####        #######     ##    #### ######## ####    ##    #### ########  ######

import { i18n } from 'boot/i18n'

function getDataFromSite (params = { apiUrl: '', dataLabel: '', countDataLabel: false, targetObjectName: '', commit: null, targetCommitName: '', loadingVariableName: '', apiCallParams: {}, silent: false, logToConsole: true, caller: this, debug: false, onSuccessLoadCallBack: null, onErrorCallBack: null }) {
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
    // params: {
    //   journeyProjectUid: params.projectUid
    // }
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
          if (params.countDataLabel) {
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
  loadingVariableName: '',
  projectUid: '',
  apiCallParams: {},
  silent: false,
  checkResponseTree: true,
  elasticQuery: false,
  elasticOnlyReturnSource: false,
  logToConsole: true,
  caller: this,
  debug: false,
  onSuccessCallBack: null,
  onErrorCallBack: null
}) {
  let messageForLogAndPopup = ''
  let captionForLogAndPopup = ''
  let queryResultedInError = false
  let labelCount = ''

  if (typeof params.apiUrl === 'undefined') { params.apiUrl = '' }
  if (typeof params.dataLabel === 'undefined') { params.dataLabel = '' }
  if (typeof params.countDataLabel === 'undefined') { params.countDataLabel = false }
  if (typeof params.targetObjectName === 'undefined') { params.targetObjectName = '' }
  if (typeof params.loadingVariableName === 'undefined') { params.loadingVariableName = '' }
  if (typeof params.projectUid === 'undefined') { params.projectUid = '' }
  if (typeof params.apiCallParams === 'undefined') { params.apiCallParams = {} }
  if (typeof params.silent === 'undefined') { params.silent = false }
  if (typeof params.checkResponseTree === 'undefined') { params.checkResponseTree = true }
  if (typeof params.elasticQuery === 'undefined') { params.elasticQuery = false }
  if (typeof params.elasticOnlyReturnSource === 'undefined') { params.elasticOnlyReturnSource = false }
  if (typeof params.logToConsole === 'undefined') { params.logToConsole = true }
  if (typeof params.caller === 'undefined') { params.caller = this }
  if (typeof params.debug === 'undefined') { params.debug = false }
  if (typeof params.onSuccessCallBack === 'undefined') { params.onSuccessCallBack = null }
  if (typeof params.onErrorCallBack === 'undefined') { params.onErrorCallBack = null }

  if (params.elasticQuery) {
    params.checkResponseTree = false
  }

  if (params.debug) {
    console.log('postDataToSite -- BEGIN')
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

      if (!params.elasticQuery) {
        // It's Tony's API output
        if (typeof response.data.response === 'object') {
          if (params.targetObjectName.length) {
            if (typeof response.data.payload === 'object') {
              // Assign to targetObject
              params.caller[params.targetObjectName] = response.data.payload

              if (!response.data.response.error) {
                queryResultedInError = false
                if (params.countDataLabel) {
                  captionForLogAndPopup = i18n.t('Succesfully loaded') + ' ' + response.data.payload.length + ' ' + params.dataLabel + '.'
                } else {
                  captionForLogAndPopup = i18n.t('Succesfully loaded') + ' ' + params.dataLabel + '.'
                }
              } else {
                queryResultedInError = true
                messageForLogAndPopup = response.data.response.result
                if (process.env.DEV) {
                  messageForLogAndPopup += ':'
                  captionForLogAndPopup = response.data.response.sqlError
                }
              }
            } else {
              captionForLogAndPopup = i18n.t('Invalid response') + '. ' + i18n.t('No "data" object in AJAX response')
              queryResultedInError = true
            }
          }
          messageForLogAndPopup = i18n.t('Succesfully updated') + ' ' + params.dataLabel + '.'
        } else {
          messageForLogAndPopup = i18n.t('Invalid response') + '. ' + i18n.t('No "response" object in AJAX response')
          queryResultedInError = true
        }
      } else { // It's Elastic output
        // Assign to targetObject
        let responseHits = []
        if (typeof response.data.hits === 'object') {
          if (typeof response.data.hits.hits !== 'undefined') {
            responseHits = response.data.hits.hits
            if (params.elasticOnlyReturnSource) {
              const responseHitsSources = []
              responseHits.forEach((hit, i) => {
                if (typeof hit._source !== 'undefined') {
                  responseHitsSources.push(hit._source)
                }
              })
              responseHits = responseHitsSources
            }
          }
        }
        params.caller[params.targetObjectName] = responseHits
        if (!response.data.error) {
          queryResultedInError = false
          if (params.countDataLabel) {
            if (typeof response.data.hits === 'object') {
              if (typeof response.data.hits.total !== 'undefined') {
                labelCount = ' ' + response.data.hits.total
              }
            }
          }
          messageForLogAndPopup = i18n.t('Succesfully loaded') + labelCount + ' ' + params.dataLabel + '.'
          messageForLogAndPopup = i18n.t('Succesfully updated') + ' ' + params.dataLabel + '.'
        } else {
          queryResultedInError = true
          messageForLogAndPopup = response.data.reason
          if (process.env.DEV) {
            messageForLogAndPopup += ':'
            captionForLogAndPopup = response.data.type
          }
        }
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
          params.caller.$q.notify({
            color: 'negative',
            icon: 'report_problem',
            message: messageForLogAndPopup,
            caption: captionForLogAndPopup
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
          params.caller.$q.notify({
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
