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
  // Blank any previous JWT token
  commit('updateJwtToken', { token: '' })

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
          console.log('⚠️ ' + i18n.t('[API ERROR]') + ' ' + messageForLogAndPopup)
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
          console.log('✔️ ' + i18n.t('[API SUCCESS]') + ' ' + messageForLogAndPopup)
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
