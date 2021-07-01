exports.collectionConfigToJson = (collectionConfig) => {
  try {
    const jsonConfig = Object.assign({}, collectionConfig)
    const collectionMethod = jsonConfig.collectionMethod || ''

    // ***********
    // Trash our own stuff, as it has nothing to do in the file Yaml
    delete jsonConfig.collectionShipper
    delete jsonConfig.collectionMethod

    // ***********
    // Remove any leafs set to null
    const jsonConfigClean = JSON.parse(JSON.stringify(jsonConfig, (key, value) => {
      return (value === null ? undefined : value)
    }))

    // ***********
    // and push it out
    return JSON.stringify({ log_source_type: collectionMethod, ...jsonConfigClean }, null, '  ')
  } catch (error) {
    return error
  }
}

