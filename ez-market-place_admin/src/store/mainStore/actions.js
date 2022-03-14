import Vue from 'vue'
// import { uid } from 'quasar'
import { i18n } from 'boot/i18n'
// import { version } from '../../../package.json'

// ######################################################################
// AUTHENTICATION
// ######################################################################

export function signIn ({ commit }, payload) {
  if (payload) {
    commit('updateJwtToken', { token: payload.token || '' })
    commit('updateUserDetails', { userDetails: payload.userDetails })
  }
}

export async function signOut ({ commit }, payload) {
  // Blank any previous JWT token and User details
  commit('updateJwtToken', { token: '' })
  commit('updateUserDetails', { userDetails: {} })

  // Empty the list of User Accounts and Roles
  commit('getUserAccounts', [])
  commit('getUserRoles', [])

  // Logout from Okta
  if (payload && payload.signOutOkta === true) {
    await Vue.prototype.$auth.signOut()
  }
}

// ######################################################################
// USER ACCOUNTS MANAGEMENT
// ######################################################################

export function getUserAccounts ({ state, commit }, payload) {
  apiCall({
    httpVerb: 'GET',
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
    apiCall({
      httpVerb: 'POST',
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
    apiCall({
      httpVerb: 'POST',
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
  apiCall({
    httpVerb: 'GET',
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
    apiCall({
      httpVerb: 'POST',
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
    apiCall({
      httpVerb: 'POST',
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

// ********************************
// Statuses
// ********************************

export function getStatuses ({ state, commit }, payload) {
  apiCall({
    httpVerb: 'GET',
    apiUrl: '/admin/statuses',
    dataLabel: 'Statuses',
    countDataLabel: true,
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    commit: commit,
    targetCommitName: 'getStatuses',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: false,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

// ********************************
// Publishers
// ********************************

export function getPublishers ({ state, commit }, payload) {
  apiCall({
    httpVerb: 'GET',
    apiUrl: '/admin/publishers',
    dataLabel: 'Publishers',
    countDataLabel: true,
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    commit: commit,
    targetCommitName: 'getPublishers',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: false,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

export function updatePublisher ({ state }, payload) {
  if (payload) {
    const newPublisher = !(payload.publisherUid && payload.publisherUid.length)
    apiCall({
      httpVerb: (newPublisher ? 'POST' : 'PUT'),
      apiUrl: '/admin/publishers' + (newPublisher ? '' : `/${payload.publisherUid}`), // Append Publisher UID if updating
      dataLabel: 'Publisher',
      apiCallParams: {
        publisher: {
          publisherUid: payload.publisherUid || undefined,
          displayName: payload.displayName || undefined
        }
      },
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

export function deletePublisher ({ state }, payload) {
  if (payload && payload.publisherUid && payload.publisherUid.length) {
    apiCall({
      httpVerb: 'DELETE',
      apiUrl: `/admin/publishers/${payload.publisherUid}`,
      dataLabel: 'Publisher',
      // apiCallParams: { uid: payload.publisherUid },
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

// ********************************
// Notifications
// ********************************

export function getNotifications ({ state, commit }, payload) {
  apiCall({
    httpVerb: 'GET',
    apiUrl: '/admin/notifications',
    dataLabel: 'Notifications',
    countDataLabel: true,
    apiHeaders: {
      authorization: 'Bearer ' + state.jwtToken
    },
    commit: commit,
    targetCommitName: 'getNotifications',
    loadingVariableName: (payload && payload.loadingVariableName ? payload.loadingVariableName : ''),
    silent: false,
    caller: (payload && payload.caller ? payload.caller : this._vm),
    onSuccessCallBack: (payload && payload.onSuccessCallBack ? payload.onSuccessCallBack : null),
    onErrorCallBack: (payload && payload.onErrorCallBack ? payload.onErrorCallBack : null),
    debug: (payload && payload.debug ? payload.debug : false)
  })
}

export function updateNotification ({ state }, payload) {
  if (payload) {
    const newNotification = !(payload.messageUid && payload.messageUid.length)
    apiCall({
      httpVerb: (newNotification ? 'POST' : 'PUT'),
      apiUrl: '/admin/notifications' + (newNotification ? '' : `/${payload.messageUid}`), // Append Message UID if updating
      dataLabel: 'Notification',
      apiCallParams: {
        notification: {
          messageUid: payload.messageUid || undefined,
          senderUid: payload.senderUid,
          recipientUid: payload.recipientUid,
          statusId: (payload.statusId !== null ? payload.statusId : undefined),
          messageContent: payload.messageContent || undefined,
          relatedPipelineTemplate: payload.relatedPipelineTemplate || undefined,
          flags: payload.messageFlags || undefined
        }
      },
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

export function deleteNotification ({ state }, payload) {
  if (payload && payload.messageUid && payload.messageUid.length) {
    apiCall({
      httpVerb: 'DELETE',
      apiUrl: `/admin/notifications/${payload.messageUid}`,
      dataLabel: 'Notification',
      // apiCallParams: { uid: payload.messageUid },
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

//           ###    ########  ####       ##     ## ######## #### ##       #### ######## #### ########  ######
//          ## ##   ##     ##  ##        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//         ##   ##  ##     ##  ##        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##
//        ##     ## ########   ##        ##     ##    ##     ##  ##        ##     ##     ##  ######    ######
//        ######### ##         ##        ##     ##    ##     ##  ##        ##     ##     ##  ##             ##
//        ##     ## ##         ##        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//        ##     ## ##        ####        #######     ##    #### ######## ####    ##    #### ########  ######

/**
 * Select the right Axios function and parameters and call it
 * @param {*} params Parameter object
 * @returns A Promise
 */
async function axiosFunction (params) {
  if (params) {
    let axiosFunctionToCall = null
    let axiosSendData = false

    if (params.httpVerb === 'GET') {
      axiosFunctionToCall = params.caller.$axios.get
      axiosSendData = false
    }
    if (params.httpVerb === 'HEAD') {
      axiosFunctionToCall = params.caller.$axios.head
      axiosSendData = false
    }
    if (params.httpVerb === 'POST') {
      axiosFunctionToCall = params.caller.$axios.post
      axiosSendData = true
    }
    if (params.httpVerb === 'PUT') {
      axiosFunctionToCall = params.caller.$axios.put
      axiosSendData = true
    }
    if (params.httpVerb === 'DELETE') {
      axiosFunctionToCall = params.caller.$axios.delete
      axiosSendData = false
    }
    if (params.httpVerb === 'OPTIONS') {
      axiosFunctionToCall = params.caller.$axios.options
      axiosSendData = false
    }
    if (params.httpVerb === 'PATCH') {
      axiosFunctionToCall = params.caller.$axios.patch
      axiosSendData = true
    }

    if (axiosSendData) {
      return axiosFunctionToCall(
        (params.isUrlExternal ? params.apiUrl : params.caller.globalConstants.baseUrl.api + params.apiUrl),
        params.apiCallParams,
        {
          headers: params.apiHeaders
        }
      )
    } else {
      return axiosFunctionToCall(
        (params.isUrlExternal ? params.apiUrl : params.caller.globalConstants.baseUrl.api + params.apiUrl),
        {
          params: params.apiCallParams,
          headers: params.apiHeaders
        }
      )
    }
  }
}

/**
 * Call API endpoint to get/post/put/delete data from/to it
 * @param {object} params Parameter object
 */
export function apiCall (params = {
  httpVerb: '',
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

  if (typeof params.httpVerb === 'undefined') { params.httpVerb = '' }
  params.httpVerb = String(params.httpVerb).toUpperCase()
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
    console.log('apiCall -- BEGIN')
  }

  const messageAction = (
    params.httpVerb === 'POST' ||
    params.httpVerb === 'PUT' ||
    params.httpVerb === 'DELETE' ||
    params.httpVerb === 'PATCH'
      ? i18n.t('Uploading')
      : i18n.t('Downloading')
  )

  const messageResult = (
    params.httpVerb === 'POST' ||
    params.httpVerb === 'PUT' ||
    params.httpVerb === 'DELETE' ||
    params.httpVerb === 'PATCH'
      ? i18n.t('uploaded')
      : i18n.t('loaded')
  )

  if (!params.silent && params.caller && params.caller.$q) {
    notificationPopupId = params.caller.$q.notify({
      icon: (
        params.httpVerb === 'POST' ||
        params.httpVerb === 'PUT' ||
        params.httpVerb === 'DELETE' ||
        params.httpVerb === 'PATCH'
          ? 'cloud_upload'
          : 'cloud_download'
      ),
      message: messageAction + ' ' + params.dataLabel + '...',
      type: 'ongoing'
    })
  }
  if (params.logToConsole) {
    console.log('☁️ ' + messageAction + ' ' + params.dataLabel + '...')
  }

  // If a loadingVariable is provided, set it to true
  if (params.loadingVariableName.length) {
    params.caller[params.loadingVariableName] = true
  }

  if (params.debug) {
    console.log(`apiCall -- ${params.httpVerb}`)
  }

  axiosFunction(params)
    .then(function (response) {
      if (params.debug) {
        console.log('apiCall -- Then')
      }
      if (params.debug) {
        console.log(response)
      }

      apiResponse = response
      if (response.data && response.data.records) {
        // Check if we were meant to load data in a target
        if (params.targetObjectName.length) {
          // Assign to targetObject
          params.caller[params.targetObjectName] = response.data.records

          // Update caption message
          if (params.countDataLabel && Array.isArray(response.data.records)) {
            captionForLogAndPopup = i18n.t('Succesfully loaded') + ' ' + response.data.records.length + ' ' + params.dataLabel + '.'
          } else {
            captionForLogAndPopup = i18n.t('Succesfully loaded') + ' ' + params.dataLabel + '.'
          }
        }

        // Commit to targetCommitName
        if (typeof params.commit === 'function' && params.targetCommitName.length) {
          params.commit(params.targetCommitName, response.data.records)
        }

        if (response.data.errors && Array.isArray(response.data.errors) && response.data.errors.length > 0) {
          queryResultedInError = true
          messageForLogAndPopup = i18n.t('EZ Market API returned an error.')
          if (process.env.DEV) {
            captionForLogAndPopup = response.data.errors.reduce((errorsAccumulatorArray, errorMessage) => {
              errorsAccumulatorArray.push(typeof errorMessage !== 'object' ? errorMessage : JSON.stringify(errorMessage))
              return errorsAccumulatorArray
            }, []).join(' / ')
          }
        } else {
          queryResultedInError = false
          messageForLogAndPopup = messageForLogAndPopup + ' / ' + i18n.t(`Succesfully ${messageResult}`) + ' ' + params.dataLabel + '.'
        }
      } else {
        queryResultedInError = true
        messageForLogAndPopup = i18n.t('Invalid response') + '.'
        captionForLogAndPopup = i18n.t('No "response" object in AJAX response')
      }
    })
    .catch(function (errorMessage) {
      if (params.debug) {
        console.log('apiCall -- Catch')
      }
      messageForLogAndPopup = i18n.t('EZ Market API returned an error.')
      captionForLogAndPopup = (typeof errorMessage !== 'object' ? errorMessage : JSON.stringify(errorMessage))
      queryResultedInError = true
    })
    .finally(() => {
      if (params.debug) {
        console.log('apiCall -- Finally')
      }
      if (queryResultedInError) {
        if (params.logToConsole) {
          console.log('⚠️ ' + i18n.t('[API ERROR]') + ' ' + messageForLogAndPopup + ' // ' + captionForLogAndPopup)
        }
        if (!params.silent && notificationPopupId) {
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
            console.log('apiCall -- onErrorCallBack')
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
          console.log('✔️ ' + i18n.t('[API SUCCESS]') + ' ' + messageForLogAndPopup + ' // ' + captionForLogAndPopup)
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
            console.log('apiCall -- onSuccessCallBack')
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
        console.log('apiCall -- END')
      }
    })
} // apiCall
