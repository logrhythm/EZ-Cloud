/**
 * Produce a JSON Beat configuration from a JSON internal EZ configuration
 * @param {Object} collectionConfig Collection configuration as JSON object
 * @returns Beat configuraiton as YAML
 */
exports.collectionConfigToJson = (collectionConfig) => {
  try {
    const jsonConfig = { ...collectionConfig };
    const collectionMethod = jsonConfig.collectionMethod || '';

    // ***********
    // Trash our own stuff, as it has nothing to do in the file Yaml
    delete jsonConfig.collectionShipper;
    delete jsonConfig.collectionMethod;

    // ***********
    // Remove any leafs set to null
    const jsonConfigClean = JSON.parse(
      JSON.stringify(
        jsonConfig, (key, value) => (value === null ? undefined : value)
      )
    );

    // ***********
    // and push it out
    return JSON.stringify({ log_source_type: collectionMethod, ...jsonConfigClean }, null, '  ');
  } catch (error) {
    return error;
  }
};
