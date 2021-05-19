import { dump } from 'js-yaml'

function extractTransforms (sourceTransformsObject, transformOptions, targetTransformsObject) {
  if (
    sourceTransformsObject &&
    typeof sourceTransformsObject === 'object' &&
    transformOptions &&
    Array.isArray(transformOptions) &&
    targetTransformsObject &&
    typeof targetTransformsObject === 'object'
  ) {
    for (const [target, transformAndValue] of Object.entries(sourceTransformsObject)) {
      // Extract the Transforma and the Value from transformAndValue
      let transform = ''
      let value = ''

      const transformAndValueArray = String(transformAndValue).split('👉', 2)
      if (transformAndValueArray && transformAndValueArray.length >= 2) {
        transform = transformAndValueArray.shift()
        value = transformAndValueArray.join('👉')
      }

      // Map the transform tag into a short transform value
      const transformOption = transformOptions.find(to => to.tag === transform)
      transform = (transformOption && transformOption.transform && transformOption.transform.length ? transformOption.transform : '')

      // Now push it to jsonConfig.request.transforms
      if (target && target.length && transform && transform.length) {
        // Create a new object with the transform as its name
        const newTransformObject = {}
        Object.defineProperty(newTransformObject, transform, {
          enumerable: true,
          value: {
            target,
            value
          }
        })

        // No point keeping the value field if the Transform is to delete
        if (transform === 'delete') {
          delete newTransformObject[transform].value
        }

        // And push it
        targetTransformsObject.push(newTransformObject)
      }
      // })
    }
  }
}

function collectionConfigToYml (collectionConfig) {
  try {
    const jsonConfig = Object.assign({}, collectionConfig)
    const collectionMethod = jsonConfig.collectionMethod || ''

    // ***********
    // Deal with httpjson / EZ__Auth_Basic__enable & EZ__Auth_Basic__password

    // Goal:
    // request.transforms:
    //   - set:
    //       target: header.Authorization
    //       value: 'Basic aGVsbG86d29ybGQ='

    // Make sure we have a Request Transform array
    if (jsonConfig.request === undefined) {
      jsonConfig.request = {}
    }
    if (jsonConfig.request.transforms === undefined) {
      jsonConfig.request.transforms = []
    }

    // Make sure we have a Response Transform array
    if (jsonConfig.response === undefined) {
      jsonConfig.response = {}
    }
    if (jsonConfig.response.transforms === undefined) {
      jsonConfig.response.transforms = []
    }

    if (jsonConfig.EZ__Auth_Basic__enable && jsonConfig.EZ__Auth_Basic__enable === true) {
      // Encode the creds
      let encodedCredentials
      try {
        encodedCredentials = btoa((jsonConfig.EZ__Auth_Basic__username || '') + ':' + (jsonConfig.EZ__Auth_Basic__password || ''))
      } catch {
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
      } catch {
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
    // Trash our own stuff, as it has nothing to do in the file Yaml
    delete jsonConfig.collectionMethod
    delete jsonConfig.EZ__Auth_Basic__enable
    delete jsonConfig.EZ__Auth_Basic__username
    delete jsonConfig.EZ__Auth_Basic__password
    delete jsonConfig['request.transforms']
    delete jsonConfig['response.transforms']

    // And trash empty Transforms for Request and Response
    if (jsonConfig.request.transforms.length === 0) {
      delete jsonConfig.request.transforms
    }
    if (jsonConfig.response.transforms.length === 0) {
      delete jsonConfig.response.transforms
    }
    // and the Request / Response if now empty too
    if (Object.keys(jsonConfig.request).length === 0) {
      delete jsonConfig.request
    }
    if (Object.keys(jsonConfig.response).length === 0) {
      delete jsonConfig.response
    }

    // ***********
    // Remove any leafs set to null
    const jsonConfigClean = JSON.parse(JSON.stringify(jsonConfig, (key, value) => {
      return (value === null ? undefined : value)
    }))

    // ***********
    // and push it out as Yaml
    return dump([{ type: collectionMethod, ...jsonConfigClean }])
  } catch (error) {
    return error
  }
}

export {
  collectionConfigToYml
}
