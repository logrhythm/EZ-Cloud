export default function () {
  return {
    loggedInUser: localStorage.getItem('ezMarketAdminLoggedInUser') || '', // Fetch loggedInUser from LocalStorage if present,
    jwtToken: localStorage.getItem('ezMarketAdminJwtToken') || '', // Fetch jwtToken from LocalStorage if present
    openCollectors: [],
    pipelines: [],
    logSamples: [
      {
        pipelineUid: '',
        logs: []
      }
    ],
    collectionShippersOptions: [
      {
        value: 'jsBeat',
        label: 'jsBeat',
        icon: 'jsBeat',
        outputFormat: 'json'
      },
      {
        value: 'eventhubbeat',
        label: 'LogRhythm Azure Event Hub Beat (🚧 - Stub)',
        icon: 'logrhythm-eventhubbeat',
        outputFormat: 'yaml'
      },
      {
        value: 'genericbeat',
        label: 'LogRhythm Generic HTTP Rest Beat',
        icon: 'logrhythm-genericbeat',
        outputFormat: 'yaml'
      },
      {
        value: 'kafkabeat',
        label: 'LogRhythm Kafka Beat (🚧 - Stub)',
        icon: 'logrhythm-kafkabeat',
        outputFormat: 'yaml'
      },
      {
        value: 'pubsubbeat',
        label: 'LogRhythm PubSub Beat (🚧 - Stub)',
        icon: 'logrhythm-pubsubbeat',
        outputFormat: 'yaml'
      },
      {
        value: 's3beat',
        label: 'LogRhythm S3 Beat (🚧 - Stub)',
        icon: 'logrhythm-s3beat',
        outputFormat: 'yaml'
      },
      {
        value: 'webhookbeat',
        label: 'LogRhythm Webhook Beat (🚧 - Stub)',
        icon: 'logrhythm-webhookbeat',
        outputFormat: 'yaml'
      },
      {
        value: 'filebeat',
        label: 'Filebeat',
        icon: 'filebeat',
        outputFormat: 'yaml'
      },
      {
        value: 'webhookbeat',
        label: 'LogRhythm Webhook Beat',
        icon: 'logrhythm-webhookbeat',
        outputFormat: 'yaml'
      }
    ], // collectionShippersOptions
    openCollectorBeats: [
      {
        value: 'carbonblackcloudbeat',
        label: 'carbonblackcloudbeat',
        icon: 'logrhythm-carbonblackcloudbeat'
        // icon: 'logrhythm'
      },
      {
        value: 'ciscoampbeat',
        label: 'ciscoampbeat',
        icon: 'logrhythm-ciscoampbeat'
        // icon: 'logrhythm'
      },
      {
        value: 'duobeat',
        label: 'duobeat',
        icon: 'logrhythm-duobeat'
        // icon: 'logrhythm'
      },
      {
        value: 'eventhubbeat',
        label: 'eventhubbeat',
        icon: 'logrhythm-eventhubbeat'
        // icon: 'logrhythm'
      },
      {
        value: 'gmtbeat',
        label: 'gmtbeat',
        icon: 'logrhythm-gmtbeat'
        // icon: 'logrhythm'
      },
      {
        value: 'genericbeat',
        label: 'genericbeat',
        icon: 'logrhythm-genericbeat'
        // icon: 'logrhythm'
      },
      {
        value: 'gsbeat',
        label: 'gsbeat',
        icon: 'logrhythm-gsbeat'
        // icon: 'logrhythm'
      },
      {
        value: 'kafkabeat',
        label: 'kafkabeat',
        icon: 'logrhythm-kafkabeat'
        // icon: 'logrhythm'
      },
      {
        value: 'oktabeat',
        label: 'oktabeat',
        icon: 'logrhythm-oktabeat'
        // icon: 'logrhythm'
      },
      {
        value: 'pubsubbeat',
        label: 'pubsubbeat',
        icon: 'logrhythm-pubsubbeat'
        // icon: 'logrhythm'
      },
      {
        value: 'qualysfimbeat',
        label: 'qualysfimbeat',
        icon: 'logrhythm-qualysfimbeat'
        // icon: 'logrhythm'
      },
      {
        value: 's3beat',
        label: 's3beat',
        icon: 'logrhythm-s3beat'
        // icon: 'logrhythm'
      },
      {
        value: 'sophoscentralbeat',
        label: 'sophoscentralbeat',
        icon: 'logrhythm-sophoscentralbeat'
        // icon: 'logrhythm'
      },
      {
        value: 'webhookbeat',
        label: 'webhookbeat',
        icon: 'logrhythm-webhookbeat'
        // icon: 'logrhythm'
      }
    ], // openCollectorBeats
    collectionMethodsOptions: [
      {
        shipper: 'jsBeat',
        value: 'flatFile',
        label: 'Flat File',
        icon: 'description'
      },
      {
        shipper: 'jsBeat',
        value: 'syslog',
        label: 'Syslog',
        icon: 'input'
      },
      {
        shipper: 'genericbeat',
        value: 'genericbeat',
        label: 'HTTP / REST API',
        icon: 'language'
      },
      {
        shipper: 'eventhubbeat',
        value: 'eventhubbeat',
        label: 'Azure Event Hub',
        icon: 'language'
      },
      {
        shipper: 'kafkabeat',
        value: 'kafkabeat',
        label: 'Kafka',
        icon: 'language'
      },
      {
        shipper: 'pubsubbeat',
        value: 'pubsubbeat',
        label: 'PubSub',
        icon: 'language'
      },
      {
        shipper: 's3beat',
        value: 's3beat',
        label: 'S3',
        icon: 'language'
      },
      {
        shipper: 'webhookbeat',
        value: 'webhookbeat',
        label: 'Webhook over HTTP',
        icon: 'input'
      },
      {
        shipper: 'filebeat',
        value: 'log',
        label: 'Flat File',
        icon: 'description'
      },
      {
        shipper: 'filebeat',
        value: 'httpjson',
        label: 'HTTP / REST API',
        icon: 'language'
      },
      {
        shipper: 'filebeat',
        value: 'http_endpoint',
        label: 'HTTP / Web Hook Endpoint',
        icon: 'cloud_upload'
      },
      {
        shipper: 'filebeat',
        value: 'syslog_tcp',
        label: 'Syslog over TCP',
        icon: 'input'
      },
      {
        shipper: 'filebeat',
        value: 'syslog_udp',
        label: 'Syslog over UDP',
        icon: 'input'
      }
    ], // collectionMethodsOptions
    openCollectorLogSources: [],
    userAccounts: [], // EZ Users on EZ Server
    userRoles: [], // Roles for EZ Users on EZ Server
    errorWikiUrlBase: 'https://github.com/logrhythm/EZ-Cloud/wiki/Error-Messages#',
    helpWikiUrlBase: 'https://github.com/logrhythm/EZ-Cloud/wiki/Help#',
    deployment: {
      uid: null, // UID of the EZ Server
      version: null // EZ Server's version
    },
    ezMarket: { // Details necessary to connect to the EZ Market Place
      server: {
        baseUrl: null,
        baseApiPath: null
      },
      publisherUid: null,
      ezMarketUid: null
    },
    ezMarketPipelineTemplates: [], // Pipeline Templates from EZ Market Place
    ezMarketNotifications: [], // Notifications from EZ Market Place for all the users
    ezMarketStatuses: [], // Statuses for Notifications/Pipeline Templates/etc... from EZ Market Place
    ezMarketPublishers: [] // Publishers from EZ Market Place
  }
}
