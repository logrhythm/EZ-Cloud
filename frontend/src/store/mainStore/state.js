// Load JQ Templates
import { filterTemplate, transformTemplate } from './templates/jqTemplates'

// Load Collection Templates
// jsBeat
import collectionMethodTemplatesJsBeat from './templates/collectionMethodTemplate.jsBeat'
// Filebeat
import collectionMethodTemplatesFilebeatLog from './templates/collectionMethodTemplate.filebeat.log'
import collectionMethodTemplatesFilebeatSyslogUdp from './templates/collectionMethodTemplate.filebeat.syslog.udp'
import collectionMethodTemplatesFilebeatSyslogTcp from './templates/collectionMethodTemplate.filebeat.syslog.tcp'
import collectionMethodTemplatesFilebeatHttpJson from './templates/collectionMethodTemplate.filebeat.httpjson'
// Genericbeat
import collectionMethodTemplatesGenericbeat from './templates/collectionMethodTemplate.genericbeat'
// Genericbeat
import collectionMethodTemplatesWebhookbeat from './templates/collectionMethodTemplate.webhookbeat'

export default function () {
  return {
    loggedInUser: '',
    loggedInUserRoles: [], // Array of all the Roles of the logged in user (typically array of one value: "User" or "Admin")
    loggedInUserIsPrivileged: false,
    jwtToken: (process.env.DEV ? localStorage.getItem('jwtToken') || '' : ''), // Fetch jwtToken from LocalStorage if present and if we are in DEV mode. Saving from logging back in every 2 minutes...
    openCollectors: [],
    pipelines: [],
    logSamples: [
      {
        pipelineUid: '',
        logs: []
      }
    ],
    jqFilterTemplate: filterTemplate, // Imported from jqTemplates
    jqTransformTemplate: transformTemplate, // Imported from jqTemplates
    shippersUrlsInternal: [], // Array of URLs and details for the different Shippers we can install on remote Open Collector hosts
    collectionMethodTemplates: [
      collectionMethodTemplatesJsBeat, // jsBeat - flatfile
      collectionMethodTemplatesFilebeatLog, // Filebeat - log (flat files)
      collectionMethodTemplatesFilebeatSyslogUdp, // Filebeat - syslog_udp
      collectionMethodTemplatesFilebeatSyslogTcp, // Filebeat - syslog_tcp
      collectionMethodTemplatesFilebeatHttpJson, // Filebeat - httpjson
      collectionMethodTemplatesGenericbeat, // genericbeat
      collectionMethodTemplatesWebhookbeat // Webhookbeat
    ], // collectionMethodTemplates
    collectionShippersOptions: [
      {
        value: 'jsBeat',
        label: 'jsBeat',
        icon: 'jsBeat',
        outputFormat: 'json'
      },
      {
        value: 'genericbeat',
        label: 'LogRhythm Generic HTTP Rest Beat',
        icon: 'logrhythm-genericbeat',
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
      },
      {
        shipper: 'webhookbeat',
        value: 'webhookbeat',
        label: 'Webhook over HTTP',
        icon: 'input'
      }
    ], // collectionMethodsOptions
    openCollectorLogSources: [],
    userAccounts: [], // EZ Users on EZ Server
    userRoles: [], // Roles for EZ Users on EZ Server
    errorWikiUrlBase: 'https://github.com/TonyMasse/EZ-Cloud/wiki/Error-Messages#',
    helpWikiUrlBase: 'https://github.com/TonyMasse/EZ-Cloud/wiki/Help#'
  }
}
