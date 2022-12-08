const payload = {
  collectionConfig: JSON.parse(`
    {
      "collectionShipper":"webhookbeat",
      "collectionMethod":"webhookbeat",
      "hostname":"",
      "portnumber":"8123",
      "sslflag":false,
      "heartbeatdisabled":false,
      "heartbeatinterval":60,
      "beatIdentifier":"419_Webhook_",
      "logsource_name":"Webhook HTTP",
      "certFilePath":{
        "dropIn":true,
        "valueInConfig":"/beats/webhookbeat/config/webhookbeat.crt",
        "dropInPath":"{{beat_config_volume}}/webhookbeat.crt",
        "fileContentBase64":"LS0tLSBCRUdJTiBTU0gyIF.....IFBVQkxJQyBLRVkgLS0tLQ==",
        "fileSizeBytes":442
      },
      "keyFilePath":{
        "dropIn":true,
        "valueInConfig":"/beats/webhookbeat/config/webhookbeat.key",
        "dropInPath":"{{beat_config_volume}}/webhookbeat.key",
        "fileContentBase64":"LS0tLSBCRUdJTiBTU0gyIF.....IFBVQkxJQyBLRVkgLS0tLQ==",
        "fileSizeBytes":442
      },
      "bogus.keyFilePath":{
        "dropIn":true,
        "valueInConfig":"/beats/webhookbeat/config/bogus_webhookbeat.key",
        "dropInPath":"{{beat_config_volume}}/bogus_webhookbeat.key",
        "fileContentBase64":"LS0tLSBCRUdJTiBTU0gyIF.....IFBVQkxJQyBLRVkgLS0tLQ==",
        "fileSizeBytes":442
      }
    }
  `)
};

const dropInFiles = []; // To store any found Drop In files in the config

if (payload && payload.collectionConfig) {
  console.log(payload);
  // A file object always has `dropIn`, `valueInConfig` and `fileContentBase64`
  // `dropIn` must be true
  Object.keys(payload.collectionConfig).forEach((configPath) => {
    if (
      payload.collectionConfig[configPath]
      && payload.collectionConfig[configPath].dropIn === true
      && payload.collectionConfig[configPath].valueInConfig
      && payload.collectionConfig[configPath].valueInConfig.length
      && payload.collectionConfig[configPath].fileContentBase64 != null
    ) {
      console.log('Found file in: ', configPath);
      dropInFiles.push(payload.collectionConfig[configPath]);
    }
  });
}

console.log('Found files:', dropInFiles.length);
console.log(dropInFiles);

dropInFiles.forEach((fileToDrop) => {
  console.log(fileToDrop.fileSizeBytes, fileToDrop.valueInConfig);
});

console.log(Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0'));
