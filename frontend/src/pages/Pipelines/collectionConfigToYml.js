import { dump } from 'js-yaml'

function collectionConfigToYml (collectionConfig) {
  try {
    const jsonConfig = Object.assign({}, collectionConfig)
    const collectionMethod = jsonConfig.collectionMethod || ''

    // Deal with httpjson / EZ__Auth_Basic__enable & EZ__Auth_Basic__password
    // request.transforms:
    //   - set:
    //       target: header.Authorization
    //       value: 'Basic aGVsbG86d29ybGQ='
    if (jsonConfig.EZ__Auth_Basic__enable && jsonConfig.EZ__Auth_Basic__enable === true) {
      // Make sure we have a Request Transform array
      if (jsonConfig.request === undefined) {
        jsonConfig.request = {}
      }
      if (jsonConfig.request.transforms === undefined) {
        jsonConfig.request.transforms = []
      }

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

    // Deal with httpjson / request.body
    // Check for proper JSON and if yes, transform into YML
    // XXXXXX

    // trash our own stuff, as it has nothing to do in the file Yaml
    delete jsonConfig.collectionMethod
    delete jsonConfig.EZ__Auth_Basic__enable
    delete jsonConfig.EZ__Auth_Basic__username
    delete jsonConfig.EZ__Auth_Basic__password

    // Remove any leafs set to null
    // XXXXXX

    // and push it out as Yaml
    return dump([{ type: collectionMethod, ...jsonConfig }])
  } catch (error) {
    return error
  }
}

export {
  collectionConfigToYml
}
