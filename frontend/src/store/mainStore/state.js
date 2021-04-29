export default function () {
  return {
    openCollectors: [
      // {
      //   uid: ';,
      //   name: '',
      //   hostname: '',
      //   port: 22,
      //   authenticationMethod: 'password', // password, private_key
      //   username: '',
      //   password: '',
      //   privateKey: '',
      //   pipelines: [
      //     {
      //       uid: '', // UID of the Pipeline
      //       enabled: false // This Pipeline enabled on this OC
      //     }
      //   ],
      //   osVersion: '',
      //   ocInstalled: false,
      //   ocVersion: '',
      //   fbInstalled: false,
      //   fbVersion: ''
      // },
      {
        uid: 'd25e3226-a90d-11eb-bcbc-0242ac130002',
        name: 'OC-1',
        hostname: '192.168.0.223',
        port: 22,
        authenticationMethod: 'password', // password, private_key
        username: 'root',
        password: 'logrhythm!1',
        privateKey: null,
        pipelines: [
          {
            uid: 'b9f7c85a-a278-11eb-bcbc-0242ac130002', // UID of the Pipeline
            enabled: false // This Pipeline enabled on this OC
          }
        ],
        osVersion: '',
        ocInstalled: false,
        ocVersion: '',
        fbInstalled: false,
        fbVersion: ''
      },
      {
        uid: '4bfffe8e-a90e-11eb-bcbc-0242ac130002',
        name: 'OC-2',
        hostname: '192.168.0.101',
        port: 22,
        authenticationMethod: 'password', // password, private_key
        username: 'root',
        password: 'logrhythm!1',
        privateKey: null,
        pipelines: [],
        osVersion: '',
        ocInstalled: false,
        ocVersion: '',
        fbInstalled: false,
        fbVersion: ''
      },
      {
        uid: '5c23be18-a90e-11eb-bcbc-0242ac130002',
        name: 'OC-LAB',
        hostname: '192.168.4.28',
        port: 22,
        authenticationMethod: 'private_key', // password, private_key
        username: null,
        password: null,
        privateKey: 'logrhythm!logrhythm!logrhythm!logrhythm!logrhythm!',
        pipelines: [],
        osVersion: '',
        ocInstalled: false,
        ocVersion: '',
        fbInstalled: false,
        fbVersion: ''
      }
    ],
    pipelines: [
      // {
      //   uid: '',
      //   name: '',
      //   status: 'New', // New, Dev, Ready
      //   primaryOpenCollector: '', // UID of the main OC
      //   fieldsMapping: []
      // },
      {
        uid: 'b9f7c85a-a278-11eb-bcbc-0242ac130002',
        name: 'Mistnet',
        status: 'Dev', // New, Dev, Ready
        primaryOpenCollector: 'd25e3226-a90d-11eb-bcbc-0242ac130002', // UID of the main OC
        fieldsMapping: []
      },
      {
        uid: '7dc7d568-a90e-11eb-bcbc-0242ac130002',
        name: 'Magic Cloud 2000',
        status: 'New', // New, Dev, Ready
        primaryOpenCollector: '5c23be18-a90e-11eb-bcbc-0242ac130002', // UID of the main OC
        fieldsMapping: []
      },
      {
        uid: 'b9e1cf48-a910-11eb-bcbc-0242ac130002',
        name: 'Azure Event Hub',
        status: 'Ready', // New, Dev, Ready
        primaryOpenCollector: '5c23be18-a90e-11eb-bcbc-0242ac130002', // UID of the main OC
        fieldsMapping: []
      }
    ],
    logSamples: [
      {
        pipelinesUid: '',
        logs: []
      }
    ]
  }
}
