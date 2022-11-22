const { dump } = require('js-yaml')

/**
 * Extract Transforms
 * @param {Object} sourceTransformsObject Object to transform
 * @param {Array} transformOptions Array of options for the transformation
 * @param {Object} targetTransformsObject Destination object of the transformation
 */
function extractTransforms (sourceTransformsObject, transformOptions, targetTransformsObject) {
  if (
    sourceTransformsObject &&
    typeof sourceTransformsObject === 'object' &&
    transformOptions &&
    Array.isArray(transformOptions) &&
    targetTransformsObject &&
    typeof targetTransformsObject === 'object'
  ) {
    for (const [target, transformAndValueAndDefault] of Object.entries(sourceTransformsObject)) {
      // Extract the Transform, the Value and the Default from transformAndValueAndDefault
      let transform = ''
      let value = ''
      let defaultValue // Leaving it undefined as we want to differentiate later between not set and set to empty

      // First pass to extract the Transform
      const transformAndValueAndDefaultArray = String(transformAndValueAndDefault).split('👉')
      if (transformAndValueAndDefaultArray && transformAndValueAndDefaultArray.length >= 2) {
        transform = transformAndValueAndDefaultArray.shift()
        value = transformAndValueAndDefaultArray.join('👉')
      }

      // Second pass to extract the Value and Default
      const valueAndDefaultArray = String(value).split('👈___default___')
      if (valueAndDefaultArray && valueAndDefaultArray.length >= 2) {
        defaultValue = valueAndDefaultArray.pop()
        value = valueAndDefaultArray.join('👈___default___')
      }

      // Map the transform tag into a short transform value
      const transformOption = transformOptions.find(to => to.tag === transform)
      transform = (transformOption && transformOption.transform && transformOption.transform.length ? transformOption.transform : '')

      // Map the default tag into a proper default value if flagged to be none
      if (defaultValue === '🚫') {
        defaultValue = undefined
      }
      // And force the type if it's a number
      // eslint-disable-next-line no-self-compare
      if (defaultValue !== null && defaultValue !== '' && +defaultValue === +defaultValue) {
        defaultValue = Number(defaultValue)
      }

      // Now push it to jsonConfig.request.transforms
      if (target && target.length && transform && transform.length) {
        // Create a new object with the transform as its name
        const newTransformObject = {}
        Object.defineProperty(newTransformObject, transform, {
          enumerable: true,
          value: {
            target,
            value,
            default: defaultValue
          }
        })

        // No point keeping the value nor default fields if the Transform is to delete
        if (transform === 'delete') {
          delete newTransformObject[transform].value
          delete newTransformObject[transform].default
        }

        // And push it
        targetTransformsObject.push(newTransformObject)
      }
      // })
    }
  }
}

/**
 * Produce a YAML Beat configuration from a JSON configuration
 * @param {Object} collectionConfig Collection configuration as JSON object
 * @returns Beat configuraiton as YAML
 */
exports.collectionConfigToYml = (collectionConfig) => {
  try {
    const jsonConfig = Object.assign({}, collectionConfig)
    let collectionMethod = jsonConfig.collectionMethod || ''
    if (collectionMethod === 'syslog_udp') {
      collectionMethod = 'syslog'
    }
    if (collectionMethod === 'syslog_tcp') {
      collectionMethod = 'syslog'
    }

    // Make sure we have a Request Transform array
    if (jsonConfig.request === undefined) {
      jsonConfig.request = {}
    }
    if (jsonConfig.request.transforms === undefined) {
      jsonConfig.request.transforms = []
    }

    // Make sure we have a Response Transform and Pagination arrays
    if (jsonConfig.response === undefined) {
      jsonConfig.response = {}
    }
    if (jsonConfig.response.transforms === undefined) {
      jsonConfig.response.transforms = []
    }
    if (jsonConfig.response.pagination === undefined) {
      jsonConfig.response.pagination = []
    }

    // ***********
    // Deal with httpjson / EZ__Auth_Basic__enable & EZ__Auth_Basic__password

    // Goal:
    // request.transforms:
    //   - set:
    //       target: header.Authorization
    //       value: 'Basic aGVsbG86d29ybGQ='

    if (jsonConfig.EZ__Auth_Basic__enable && jsonConfig.EZ__Auth_Basic__enable === true) {
      // Encode the creds
      let encodedCredentials
      try {
        encodedCredentials = btoa((jsonConfig.EZ__Auth_Basic__username || '') + ':' + (jsonConfig.EZ__Auth_Basic__password || ''))
      } catch (error) {
        // No login no pass.
        encodedCredentials = btoa(':')
      }

      // Add them to the Request Transforms
      jsonConfig.request.transforms.push({
        set: {
          target: 'header.Authorization',
          value: encodedCredentials
        }
      })
    }

    // ***********
    // Deal with httpjson / request.body
    // Check for proper JSON and if yes, transform into YML
    if (jsonConfig['request.body'] && jsonConfig['request.body'].length) {
      try {
        jsonConfig['request.body'] = JSON.parse(jsonConfig['request.body'])
      } catch (error) {
        delete jsonConfig['request.body']
      }
    }

    // ***********
    // Deal with request.transforms

    // What we get as JSON/Object:
    // "request.transforms": {
    //   "body.from": "___set___👉[[now (parseDuration \"-1h\")]]",
    //   "body.variable_abc": "___set___👉AUTO",
    //   "header.variable_xyz": "___set___👉[[.last_response.header.X-Var-XYZ]]",
    //   "body.useless_token": "___delete___👉"
    // }

    // Goal:
    // request.transforms:
    //   - set:
    //       target: body.from
    //       value: '[[now (parseDuration "-1h")]]'
    //   - set:
    //       target: body.variable_abc
    //       value: 'AUTO'
    //   - set:
    //       target: header.variable_xyz
    //       value: '[[.last_response.header.X-Var-XYZ]]'
    //   - delete:
    //       target: body.useless_token

    // List of possible Transforms, and mapping to the Transform for the configuration file:
    const transformOptions = [
      { tag: '___set___', transform: 'set' },
      { tag: '___append___', transform: 'append' },
      { tag: '___delete___', transform: 'delete' }
    ]

    extractTransforms(
      jsonConfig['request.transforms'], // sourceTransformsObject
      transformOptions, // transformOptions
      jsonConfig.request.transforms // targetTransformsObject
    )

    // ***********
    // Deal with response.transforms

    extractTransforms(
      jsonConfig['response.transforms'], // sourceTransformsObject
      transformOptions, // transformOptions
      jsonConfig.response.transforms // targetTransformsObject
    )

    // ***********
    // Deal with pagination.transforms

    extractTransforms(
      jsonConfig['response.pagination'], // sourceTransformsObject
      transformOptions, // transformOptions
      jsonConfig.response.pagination // targetTransformsObject
    )

    // ***********
    // Deal with cursor's default

    if (jsonConfig.cursor) {
      const cursors = {}
      for (const [cursor, valueAndDefault] of Object.entries(jsonConfig.cursor)) {
        let value = valueAndDefault
        let defaultValue // Leaving it undefined as we want to differentiate later between not set and set to empty

        // Separate the value and the default
        const valueAndDefaultArray = String(value).split('👈___default___')
        if (valueAndDefaultArray && valueAndDefaultArray.length >= 2) {
          defaultValue = valueAndDefaultArray.pop()
          value = valueAndDefaultArray.join('👈___default___')
        }

        // Map the default tag into a proper default value if flagged to be none
        if (defaultValue === '🚫') {
          defaultValue = undefined
        }
        // And force the type if it's a number
        // eslint-disable-next-line no-self-compare
        if (defaultValue !== null && defaultValue !== '' && +defaultValue === +defaultValue) {
          defaultValue = Number(defaultValue)
        }

        // Prep a fresh new cursor, including its value and default
        const newCursorObject = {}
        Object.defineProperty(newCursorObject, cursor, {
          enumerable: true,
          value: {
            value,
            default: defaultValue
          }
        })

        // Add newCursorObject to the cursor object
        Object.assign(cursors, newCursorObject)
      }

      // And now replace our original with its properly formatted self
      jsonConfig.cursor = cursors
    }

    // ***********
    // Trash our own stuff, as it has nothing to do in the file Yaml
    delete jsonConfig.collectionMethod
    delete jsonConfig.EZ__Auth_Basic__enable
    delete jsonConfig.EZ__Auth_Basic__username
    delete jsonConfig.EZ__Auth_Basic__password
    delete jsonConfig['request.transforms']
    delete jsonConfig['response.transforms']
    delete jsonConfig['response.pagination']

    // And trash empty Transforms for Request and Response
    if (jsonConfig.request.transforms.length === 0) {
      delete jsonConfig.request.transforms
    }
    if (jsonConfig.response.transforms.length === 0) {
      delete jsonConfig.response.transforms
    }
    if (jsonConfig.response.pagination.length === 0) {
      delete jsonConfig.response.pagination
    }
    // and the Request / Response if now empty too
    if (Object.keys(jsonConfig.request).length === 0) {
      delete jsonConfig.request
    }
    if (Object.keys(jsonConfig.response).length === 0) {
      delete jsonConfig.response
    }

    //  ##       ########        ########  ########    ###    ########  ######
    //  ##       ##     ##       ##     ## ##         ## ##      ##    ##    ##
    //  ##       ##     ##       ##     ## ##        ##   ##     ##    ##
    //  ##       ########        ########  ######   ##     ##    ##     ######
    //  ##       ##   ##         ##     ## ##       #########    ##          ##
    //  ##       ##    ##        ##     ## ##       ##     ##    ##    ##    ##
    //  ######## ##     ##       ########  ######## ##     ##    ##     ######

    // ***********
    // Deal with File fields

    // File fields are recorded as an Object:
    // { // For file type.
    //   dropIn: true, // Do we drop the file content into a specific location on the disk. If False, the content is left as is in the field, just like a multiline string.
    //   dropInPath: '{{beat_config_volume}}/webhookbeat.crt', // Where on the disk to drop the file to
    //   valueInConfig: '/beats/webhookbeat/config/webhookbeat.crt', // Path or file name to use as the value for the field
    //   maxFileSize: null // Maximum file size, in bytes. Ignored if not set (or set to null)
    // }
    Object.keys(jsonConfig).forEach((configPath) => {
      if (
        jsonConfig[configPath] &&
        typeof jsonConfig[configPath] === 'object' &&
        !Array.isArray(jsonConfig[configPath])
      ) {
        jsonConfig[configPath] = jsonConfig[configPath].valueInConfig
      }
    })

    //   ######  ##       ########    ###    ##    ##       ##     ## ########
    //  ##    ## ##       ##         ## ##   ###   ##       ##     ## ##     ##
    //  ##       ##       ##        ##   ##  ####  ##       ##     ## ##     ##
    //  ##       ##       ######   ##     ## ## ## ##       ##     ## ########
    //  ##       ##       ##       ######### ##  ####       ##     ## ##
    //  ##    ## ##       ##       ##     ## ##   ###       ##     ## ##
    //   ######  ######## ######## ##     ## ##    ##        #######  ##

    // ***********
    // Remove any leafs set to null
    const jsonConfigClean = JSON.parse(JSON.stringify(jsonConfig, (key, value) => {
      return (value === null ? undefined : value)
    }))

    // ***********
    // Decide if we are facing a Filebeat style config file
    const sendCollectionMethodAsType = (
      collectionMethod === 'log' ||
      collectionMethod === 'syslog' ||
      collectionMethod === 'httpjson'
    )

    // ***********
    // and push it out as Yaml
    return dump(
      (
        sendCollectionMethodAsType
          ? [{ type: collectionMethod, ...jsonConfigClean }] // Filebeat style config file
          : { [collectionMethod]: jsonConfigClean } // LogRhythm style config file
      )
    )
  } catch (error) {
    return error
  }
}

// module.export = collectionConfigToYml();
