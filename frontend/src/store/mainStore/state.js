export default function () {
  return {
    loggedInUser: 'tmasse',
    authToken: '',
    openCollectors: [
      // // {
      // //   uid: ';,
      // //   name: '',
      // //   hostname: '',
      // //   port: 22,
      // //   authenticationMethod: 'password', // password, private_key
      // //   username: '',
      // //   password: '',
      // //   privateKey: '',
      // //   pipelines: [
      // //     {
      // //       uid: '', // UID of the Pipeline
      // //       enabled: false // This Pipeline enabled on this OC
      // //     }
      // //   ],
      // //   osVersion: '',
      // //   ocInstalled: false,
      // //   ocVersion: '',
      // //   fbInstalled: false,
      // //   fbVersion: ''
      // // },
      // {
      //   uid: 'd25e3226-a90d-11eb-bcbc-0242ac130002',
      //   name: 'OC-1',
      //   hostname: '192.168.0.223',
      //   port: 22,
      //   authenticationMethod: 'password', // password, private_key
      //   username: 'root',
      //   password: 'logrhythm!1',
      //   privateKey: null,
      //   pipelines: [
      //     {
      //       uid: 'b9f7c85a-a278-11eb-bcbc-0242ac130002', // UID of the Pipeline
      //       enabled: false // This Pipeline enabled on this OC
      //     }
      //   ],
      //   osVersion: '',
      //   ocInstalled: false,
      //   ocVersion: '',
      //   fbInstalled: false,
      //   fbVersion: ''
      // },
      // {
      //   uid: '4bfffe8e-a90e-11eb-bcbc-0242ac130002',
      //   name: 'OC-2',
      //   hostname: '192.168.0.101',
      //   port: 22,
      //   authenticationMethod: 'password', // password, private_key
      //   username: 'root',
      //   password: 'logrhythm!1',
      //   privateKey: null,
      //   pipelines: [],
      //   osVersion: '',
      //   ocInstalled: false,
      //   ocVersion: '',
      //   fbInstalled: false,
      //   fbVersion: ''
      // },
      // {
      //   uid: '5c23be18-a90e-11eb-bcbc-0242ac130002',
      //   name: 'OC-LAB',
      //   hostname: '192.168.4.28',
      //   port: 22,
      //   authenticationMethod: 'private_key', // password, private_key
      //   username: null,
      //   password: null,
      //   privateKey: 'logrhythm!logrhythm!logrhythm!logrhythm!logrhythm!',
      //   pipelines: [],
      //   osVersion: '',
      //   ocInstalled: false,
      //   ocVersion: '',
      //   fbInstalled: false,
      //   fbVersion: ''
      // }
    ],
    pipelines: [
      // {
      //   uid: '',
      //   name: '',
      //   status: 'New', // New, Dev, Ready
      //   primaryOpenCollector: '', // UID of the main OC
      //   fieldsMapping: [],
      //   collectionConfig: {}
      // },
      // {
      //   uid: 'b9f7c85a-a278-11eb-bcbc-0242ac130002',
      //   name: 'Mistnet',
      //   status: 'Dev', // New, Dev, Ready
      //   primaryOpenCollector: 'd25e3226-a90d-11eb-bcbc-0242ac130002', // UID of the main OC
      //   // fieldsMapping: [],
      //   fieldsMapping: JSON.parse('[{"name":".","leaf":"","depth":0,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".admin_state","leaf":"admin_state","depth":1,"seenInLogCount":1,"values":[{"value":"CaseOpen","type":"string","count":1}],"mappedField":"vmid"},{"name":".active","leaf":"active","depth":1,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".case_detail","leaf":"case_detail","depth":1,"seenInLogCount":1,"values":[{"value":"We have detected an unexpected user activity. We recommend investigating this activity as it might lead to an unauthorized access to sensitive resources.","type":"string","count":1}]},{"name":".case_id","leaf":"case_id","depth":1,"seenInLogCount":1,"values":[{"value":5807,"type":"number","count":1}],"mappedField":"session"},{"name":".case_summary","leaf":"case_summary","depth":1,"seenInLogCount":1,"values":[{"value":"Anomalous activity Unusual JA3 fingerprint, when compared to similar hosts has been detected by 10.128.64.54","type":"string","count":1}]},{"name":".category","leaf":"category","depth":1,"seenInLogCount":1,"values":[{"value":"Anomalous Activity","type":"string","count":1}]},{"name":".certainty","leaf":"certainty","depth":1,"seenInLogCount":1,"values":[{"value":99,"type":"number","count":1}]},{"name":".created_at","leaf":"created_at","depth":1,"seenInLogCount":1,"values":[{"value":1607579970635,"type":"number","count":1}]},{"name":".entity_type","leaf":"entity_type","depth":1,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".entity_uuid","leaf":"entity_uuid","depth":1,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".entry_origin","leaf":"entry_origin","depth":1,"seenInLogCount":1,"values":[{"value":"Distributed Analytics Engine","type":"string","count":1}]},{"name":".entry_source","leaf":"entry_source","depth":1,"seenInLogCount":1,"values":[{"value":"logrhythm-boulder-0-0","type":"string","count":1}]},{"name":".entry_type","leaf":"entry_type","depth":1,"seenInLogCount":1,"values":[{"value":"SslAnomalyEvent","type":"string","count":1}]},{"name":".entry_uuid","leaf":"entry_uuid","depth":1,"seenInLogCount":1,"values":[{"value":"4a5b26e4-981b-4cc3-a2cd-202131812d9f","type":"string","count":1}]},{"name":".event_count","leaf":"event_count","depth":1,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".ioa","leaf":"ioa","depth":1,"seenInLogCount":1,"values":[{"type":"array","count":1}],"modifiers":["Fan out"]},{"name":".ioa[0]","leaf":"0","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].created_at","leaf":"created_at","depth":3,"seenInLogCount":1,"values":[{"value":1607575294000,"type":"number","count":1}]},{"name":".ioa[0].columns","leaf":"columns","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].community_id","leaf":"community_id","depth":3,"seenInLogCount":1,"values":[{"value":"1:TfsKeaK8YkFz2q0zzwCXuSqZxl4=","type":"string","count":1}]},{"name":".ioa[0].date","leaf":"date","depth":3,"seenInLogCount":1,"values":[{"value":"2020-12-10","type":"string","count":1}]},{"name":".ioa[0].dest","leaf":"dest","depth":3,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}]},{"name":".ioa[0].dest_port","leaf":"dest_port","depth":3,"seenInLogCount":1,"values":[{"value":443,"type":"number","count":1}]},{"name":".ioa[0].destination","leaf":"destination","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].destination.ip","leaf":"ip","depth":4,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}],"mappedField":"dip"},{"name":".ioa[0].destination.port","leaf":"port","depth":4,"seenInLogCount":1,"values":[{"value":443,"type":"number","count":1}],"mappedField":"dport"},{"name":".ioa[0].destination.is_local","leaf":"is_local","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].end_time","leaf":"end_time","depth":3,"seenInLogCount":1,"values":[{"value":1607571942935,"type":"number","count":1}]},{"name":".ioa[0].entity_type","leaf":"entity_type","depth":3,"seenInLogCount":1,"values":[{"value":"Ip","type":"string","count":1}]},{"name":".ioa[0].entity_uuid","leaf":"entity_uuid","depth":3,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}]},{"name":".ioa[0].entry_origin","leaf":"entry_origin","depth":3,"seenInLogCount":1,"values":[{"value":"Distributed Analytics Engine","type":"string","count":1}]},{"name":".ioa[0].entry_source","leaf":"entry_source","depth":3,"seenInLogCount":1,"values":[{"value":"logrhythm-boulder-0-0","type":"string","count":1}]},{"name":".ioa[0].entry_type","leaf":"entry_type","depth":3,"seenInLogCount":1,"values":[{"value":"SslAnomalyEvent","type":"string","count":1}]},{"name":".ioa[0].entry_uuid","leaf":"entry_uuid","depth":3,"seenInLogCount":1,"values":[{"value":"4a5b26e4-981b-4cc3-a2cd-202131812d9f","type":"string","count":1}]},{"name":".ioa[0].event_attribute","leaf":"event_attribute","depth":3,"seenInLogCount":1,"values":[{"value":"Behavior Anomaly","type":"string","count":1}]},{"name":".ioa[0].event_category","leaf":"event_category","depth":3,"seenInLogCount":1,"values":[{"value":"Anomalous Activity","type":"string","count":1}]},{"name":".ioa[0].event_certainty","leaf":"event_certainty","depth":3,"seenInLogCount":1,"values":[{"value":99,"type":"number","count":1}]},{"name":".ioa[0].event_extra_attributes","leaf":"event_extra_attributes","depth":3,"seenInLogCount":1,"values":[{"type":"array","count":1}]},{"name":".ioa[0].event_extra_attributes[0]","leaf":"0","depth":4,"seenInLogCount":1,"values":[{"value":"model:cluster","type":"string","count":1}]},{"name":".ioa[0].event_extra_attributes[1]","leaf":"1","depth":4,"seenInLogCount":1,"values":[{"value":"cluster_id:0","type":"string","count":1}]},{"name":".ioa[0].event_extra_attributes[2]","leaf":"2","depth":4,"seenInLogCount":1,"values":[{"value":"trend:none","type":"string","count":1}]},{"name":".ioa[0].event_score","leaf":"event_score","depth":3,"seenInLogCount":1,"values":[{"value":5,"type":"number","count":1}]},{"name":".ioa[0].event_severity","leaf":"event_severity","depth":3,"seenInLogCount":1,"values":[{"value":50,"type":"number","count":1}]},{"name":".ioa[0].event_trigger","leaf":"event_trigger","depth":3,"seenInLogCount":1,"values":[{"value":"Unusual JA3 fingerprint, when compared to similar hosts","type":"string","count":1}]},{"name":".ioa[0].event_trigger_id","leaf":"event_trigger_id","depth":3,"seenInLogCount":1,"values":[{"value":"Analytics:Anomaly:1302","type":"string","count":1}]},{"name":".ioa[0].event_tags","leaf":"event_tags","depth":3,"seenInLogCount":1,"values":[{"type":"array","count":1}]},{"name":".ioa[0].event_tags[0]","leaf":"0","depth":4,"seenInLogCount":1,"values":[{"value":"entry_type:Ssl AND entry_uuid:4fa30d3a-cc5d-4d5f-9cff-5b8c233e19f7","type":"string","count":1}]},{"name":".ioa[0].event_uuid","leaf":"event_uuid","depth":3,"seenInLogCount":1,"values":[{"value":"de42f388-d8e8-45d2-a385-bcd3070b883d","type":"string","count":1}]},{"name":".ioa[0].hour","leaf":"hour","depth":3,"seenInLogCount":1,"values":[{"value":3,"type":"number","count":1}]},{"name":".ioa[0].domain_report","leaf":"domain_report","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].ip_investigation_report","leaf":"ip_investigation_report","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].kubernetes","leaf":"kubernetes","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].kubernetes.container","leaf":"container","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].kubernetes.labels","leaf":"labels","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].kubernetes.node","leaf":"node","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].kubernetes.pod","leaf":"pod","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].kubernetes.replicaset","leaf":"replicaset","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].attack_framework","leaf":"attack_framework","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].mitre_tactic","leaf":"mitre_tactic","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].mitre_technique","leaf":"mitre_technique","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].session_id","leaf":"session_id","depth":3,"seenInLogCount":1,"values":[{"value":"C0xzyIr30S77pHPXl","type":"string","count":1}]},{"name":".ioa[0].source","leaf":"source","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].source.ip","leaf":"ip","depth":4,"seenInLogCount":1,"values":[{"value":"10.128.64.54","type":"string","count":1}]},{"name":".ioa[0].source.port","leaf":"port","depth":4,"seenInLogCount":1,"values":[{"value":61440,"type":"number","count":1}]},{"name":".ioa[0].source.is_local","leaf":"is_local","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].src","leaf":"src","depth":3,"seenInLogCount":1,"values":[{"value":"10.128.64.54","type":"string","count":1}]},{"name":".ioa[0].src_port","leaf":"src_port","depth":3,"seenInLogCount":1,"values":[{"value":61440,"type":"number","count":1}]},{"name":".ioa[0].start_time","leaf":"start_time","depth":3,"seenInLogCount":1,"values":[{"value":1607571942935,"type":"number","count":1}]},{"name":".ioa[0].summary_dests","leaf":"summary_dests","depth":3,"seenInLogCount":1,"values":[{"type":"array","count":1}]},{"name":".ioa[0].summary_dests[0]","leaf":"0","depth":4,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}]},{"name":".ioa[0].timestamp","leaf":"timestamp","depth":3,"seenInLogCount":1,"values":[{"value":1607571942935,"type":"number","count":1}]},{"name":".ioa[0].weekday","leaf":"weekday","depth":3,"seenInLogCount":1,"values":[{"value":4,"type":"number","count":1}]},{"name":".ioa[0].whitelisted","leaf":"whitelisted","depth":3,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".ioa[0].app_info","leaf":"app_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].app_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575279219,"type":"number","count":1}]},{"name":".ioa[0].app_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575279219,"type":"number","count":1}]},{"name":".ioa[0].app_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].app_info.response_code","leaf":"response_code","depth":4,"seenInLogCount":1,"values":[{"value":204,"type":"number","count":1}]},{"name":".ioa[0].case_info","leaf":"case_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].case_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607579970627,"type":"number","count":1}]},{"name":".ioa[0].case_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607579971198,"type":"number","count":1}]},{"name":".ioa[0].case_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].classifier_info","leaf":"classifier_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].classifier_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575261989,"type":"number","count":1}]},{"name":".ioa[0].classifier_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575261990,"type":"number","count":1}]},{"name":".ioa[0].classifier_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].cve_info","leaf":"cve_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].cve_info.cve_dest_status","leaf":"cve_dest_status","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].deduper_info","leaf":"deduper_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].deduper_info.bypass","leaf":"bypass","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].deduper_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575260998,"type":"number","count":1}]},{"name":".ioa[0].deduper_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575260998,"type":"number","count":1}]},{"name":".ioa[0].deduper_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].domain_info","leaf":"domain_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].eventscorer_info","leaf":"eventscorer_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].eventscorer_info.bypass","leaf":"bypass","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].eventscorer_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575300766,"type":"number","count":1}]},{"name":".ioa[0].eventscorer_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575300767,"type":"number","count":1}]},{"name":".ioa[0].eventscorer_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].ext_info","leaf":"ext_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].ext_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575300748,"type":"number","count":1}]},{"name":".ioa[0].ext_info.response_code","leaf":"response_code","depth":4,"seenInLogCount":1,"values":[{"value":404,"type":"number","count":1}]},{"name":".ioa[0].ext_info.threat_level","leaf":"threat_level","depth":4,"seenInLogCount":1,"values":[{"value":"Not Applicable","type":"string","count":1}]},{"name":".ioa[0].ext_info.domain_info","leaf":"domain_info","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].ext_info.dest_ip_info","leaf":"dest_ip_info","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].ext_info.src_ip_info","leaf":"src_ip_info","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].ext_info.uri_info","leaf":"uri_info","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].file_info","leaf":"file_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].ip_info","leaf":"ip_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logfinder_info","leaf":"logfinder_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logfinder_info.bypass","leaf":"bypass","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].logfinder_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575278712,"type":"number","count":1}]},{"name":".ioa[0].logfinder_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575278713,"type":"number","count":1}]},{"name":".ioa[0].logfinder_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].mistwatcher_info","leaf":"mistwatcher_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].network_info","leaf":"network_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].network_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575279478,"type":"number","count":1}]},{"name":".ioa[0].network_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575279485,"type":"number","count":1}]},{"name":".ioa[0].network_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].network_info.response_code","leaf":"response_code","depth":4,"seenInLogCount":1,"values":[{"value":200,"type":"number","count":1}]},{"name":".ioa[0].network_info.int_dest","leaf":"int_dest","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].network_info.int_dest.ip_addr","leaf":"ip_addr","depth":5,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}]},{"name":".ioa[0].network_info.int_dest.network_description","leaf":"network_description","depth":5,"seenInLogCount":1,"values":[{"value":"z-SSD-Security","type":"string","count":1}]},{"name":".ioa[0].network_info.int_dest.network_prefix","leaf":"network_prefix","depth":5,"seenInLogCount":1,"values":[{"value":"192.168.178.1/24","type":"string","count":1}]},{"name":".ioa[0].network_info.int_dest.network_type","leaf":"network_type","depth":5,"seenInLogCount":1,"values":[{"value":"internal","type":"string","count":1}]},{"name":".ioa[0].network_info.int_src","leaf":"int_src","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].network_info.int_src.ip_addr","leaf":"ip_addr","depth":5,"seenInLogCount":1,"values":[{"value":"10.128.64.54","type":"string","count":1}]},{"name":".ioa[0].network_info.int_src.network_description","leaf":"network_description","depth":5,"seenInLogCount":1,"values":[{"value":"Unknown","type":"string","count":1}]},{"name":".ioa[0].network_info.int_src.network_prefix","leaf":"network_prefix","depth":5,"seenInLogCount":1,"values":[{"value":"Unknown","type":"string","count":1}]},{"name":".ioa[0].network_info.int_src.network_type","leaf":"network_type","depth":5,"seenInLogCount":1,"values":[{"value":"internal","type":"string","count":1}]},{"name":".ioa[0].pcap_info","leaf":"pcap_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].rapid7_info","leaf":"rapid7_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].rare_info","leaf":"rare_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].rare_info.created_at","leaf":"created_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575261990,"type":"number","count":1}]},{"name":".ioa[0].rare_info.completed_at","leaf":"completed_at","depth":4,"seenInLogCount":1,"values":[{"value":1607575261990,"type":"number","count":1}]},{"name":".ioa[0].rare_info.process_count","leaf":"process_count","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].rare_info.response_code","leaf":"response_code","depth":4,"seenInLogCount":1,"values":[{"value":200,"type":"number","count":1}]},{"name":".ioa[0].rare_info.rare","leaf":"rare","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].rare_info.rule_id","leaf":"rule_id","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].url_info","leaf":"url_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].session_info","leaf":"session_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].session_info.local_orig","leaf":"local_orig","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].session_info.local_resp","leaf":"local_resp","depth":4,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].session_info.logs_count_ssl","leaf":"logs_count_ssl","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].session_info.logs_count_total","leaf":"logs_count_total","depth":4,"seenInLogCount":1,"values":[{"value":1,"type":"number","count":1}]},{"name":".ioa[0].vulnerability_info","leaf":"vulnerability_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].event_actor","leaf":"event_actor","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs","leaf":"logs","depth":3,"seenInLogCount":1,"values":[{"type":"array","count":1}]},{"name":".ioa[0].logs[0]","leaf":"0","depth":4,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].app","leaf":"app","depth":5,"seenInLogCount":1,"values":[{"value":"ssl","type":"string","count":1}]},{"name":".ioa[0].logs[0].community_id","leaf":"community_id","depth":5,"seenInLogCount":1,"values":[{"value":"1:TfsKeaK8YkFz2q0zzwCXuSqZxl4=","type":"string","count":1}]},{"name":".ioa[0].logs[0].created_at","leaf":"created_at","depth":5,"seenInLogCount":1,"values":[{"value":1607571943970,"type":"number","count":1}]},{"name":".ioa[0].logs[0].date","leaf":"date","depth":5,"seenInLogCount":1,"values":[{"value":"2020-12-10","type":"string","count":1}]},{"name":".ioa[0].logs[0].dest","leaf":"dest","depth":5,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}]},{"name":".ioa[0].logs[0].destination","leaf":"destination","depth":5,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].destination.ip","leaf":"ip","depth":6,"seenInLogCount":1,"values":[{"value":"192.168.178.75","type":"string","count":1}]},{"name":".ioa[0].logs[0].destination.port","leaf":"port","depth":6,"seenInLogCount":1,"values":[{"value":443,"type":"number","count":1}]},{"name":".ioa[0].logs[0].destination.is_local","leaf":"is_local","depth":6,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].logs[0].entry_origin","leaf":"entry_origin","depth":5,"seenInLogCount":1,"values":[{"value":"Network Analysis Engine","type":"string","count":1}]},{"name":".ioa[0].logs[0].entry_source","leaf":"entry_source","depth":5,"seenInLogCount":1,"values":[{"value":"logrhythm-boulder-0-0","type":"string","count":1}]},{"name":".ioa[0].logs[0].entry_type","leaf":"entry_type","depth":5,"seenInLogCount":1,"values":[{"value":"Ssl","type":"string","count":1}]},{"name":".ioa[0].logs[0].entry_uuid","leaf":"entry_uuid","depth":5,"seenInLogCount":1,"values":[{"value":"4fa30d3a-cc5d-4d5f-9cff-5b8c233e19f7","type":"string","count":1}]},{"name":".ioa[0].logs[0].hour","leaf":"hour","depth":5,"seenInLogCount":1,"values":[{"value":3,"type":"number","count":1}]},{"name":".ioa[0].logs[0].source","leaf":"source","depth":5,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].source.ip","leaf":"ip","depth":6,"seenInLogCount":1,"values":[{"value":"10.128.64.54","type":"string","count":1}]},{"name":".ioa[0].logs[0].source.port","leaf":"port","depth":6,"seenInLogCount":1,"values":[{"value":61440,"type":"number","count":1}]},{"name":".ioa[0].logs[0].source.is_local","leaf":"is_local","depth":6,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].logs[0].src","leaf":"src","depth":5,"seenInLogCount":1,"values":[{"value":"10.128.64.54","type":"string","count":1}]},{"name":".ioa[0].logs[0].timestamp","leaf":"timestamp","depth":5,"seenInLogCount":1,"values":[{"value":1607571942934,"type":"number","count":1}]},{"name":".ioa[0].logs[0].pcap_info","leaf":"pcap_info","depth":5,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].mistwatcher_info","leaf":"mistwatcher_info","depth":5,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].weekday","leaf":"weekday","depth":5,"seenInLogCount":1,"values":[{"value":4,"type":"number","count":1}]},{"name":".ioa[0].logs[0].conn_state","leaf":"conn_state","depth":5,"seenInLogCount":1,"values":[{"value":"S1","type":"string","count":1}]},{"name":".ioa[0].logs[0].dest_port","leaf":"dest_port","depth":5,"seenInLogCount":1,"values":[{"value":443,"type":"number","count":1}]},{"name":".ioa[0].logs[0].duration","leaf":"duration","depth":5,"seenInLogCount":1,"values":[{"value":0.683528,"type":"number","count":1}]},{"name":".ioa[0].logs[0].history","leaf":"history","depth":5,"seenInLogCount":1,"values":[{"value":"ShADad","type":"string","count":1}]},{"name":".ioa[0].logs[0].local_orig","leaf":"local_orig","depth":5,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].logs[0].local_resp","leaf":"local_resp","depth":5,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].logs[0].orig_pkts","leaf":"orig_pkts","depth":5,"seenInLogCount":1,"values":[{"value":4,"type":"number","count":1}]},{"name":".ioa[0].logs[0].proto","leaf":"proto","depth":5,"seenInLogCount":1,"values":[{"value":"tcp","type":"string","count":1}]},{"name":".ioa[0].logs[0].resp_pkts","leaf":"resp_pkts","depth":5,"seenInLogCount":1,"values":[{"value":4,"type":"number","count":1}]},{"name":".ioa[0].logs[0].session_id","leaf":"session_id","depth":5,"seenInLogCount":1,"values":[{"value":"C0xzyIr30S77pHPXl","type":"string","count":1}]},{"name":".ioa[0].logs[0].src_port","leaf":"src_port","depth":5,"seenInLogCount":1,"values":[{"value":61440,"type":"number","count":1}]},{"name":".ioa[0].logs[0].dhcp_server","leaf":"dhcp_server","depth":5,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".ioa[0].logs[0].columns","leaf":"columns","depth":5,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].decorations","leaf":"decorations","depth":5,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa[0].logs[0].cipher","leaf":"cipher","depth":5,"seenInLogCount":1,"values":[{"value":"TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384","type":"string","count":1}]},{"name":".ioa[0].logs[0].request_type","leaf":"request_type","depth":5,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".ioa[0].logs[0].version","leaf":"version","depth":5,"seenInLogCount":1,"values":[{"value":"TLSv12","type":"string","count":1}]},{"name":".ioa[0].logs[0].cert_chain_fuids","leaf":"cert_chain_fuids","depth":5,"seenInLogCount":1,"values":[{"type":"array","count":1}]},{"name":".ioa[0].logs[0].cert_chain_fuids[0]","leaf":"0","depth":6,"seenInLogCount":1,"values":[{"value":"FLJtXo28F6FbDUQxP4","type":"string","count":1}]},{"name":".ioa[0].logs[0].curve","leaf":"curve","depth":5,"seenInLogCount":1,"values":[{"value":"secp256r1","type":"string","count":1}]},{"name":".ioa[0].logs[0].established","leaf":"established","depth":5,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".ioa[0].logs[0].issuer","leaf":"issuer","depth":5,"seenInLogCount":1,"values":[{"value":"CN=illustracamera.com,O=Tyco Security Products,ST=MA,C=US","type":"string","count":1}]},{"name":".ioa[0].logs[0].subject","leaf":"subject","depth":5,"seenInLogCount":1,"values":[{"value":"CN=illustracamera.com,O=Tyco Security Products,ST=MA,C=US","type":"string","count":1}]},{"name":".ioa[0].logs[0].validation_status","leaf":"validation_status","depth":5,"seenInLogCount":1,"values":[{"value":"self signed certificate","type":"string","count":1}]},{"name":".ioa[0].logs[0].ja3","leaf":"ja3","depth":5,"seenInLogCount":1,"values":[{"value":"d722d9cbef7538d27eec79e401ea7546","type":"string","count":1}]},{"name":".ioa[0].logs[0].ja3s","leaf":"ja3s","depth":5,"seenInLogCount":1,"values":[{"value":"f6e234011390444c303f74d09d87322d","type":"string","count":1}]},{"name":".ioa[0].IncidentCaseEvents","leaf":"IncidentCaseEvents","depth":3,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".ioa[0].decorations","leaf":"decorations","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".ioa_count","leaf":"ioa_count","depth":1,"seenInLogCount":1,"values":[{"value":13,"type":"number","count":1}]},{"name":".ioa_summary_count","leaf":"ioa_summary_count","depth":1,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".last_modified","leaf":"last_modified","depth":1,"seenInLogCount":1,"values":[{"value":1607603187913,"type":"number","count":1}]},{"name":".main_event","leaf":"main_event","depth":1,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.created_at","leaf":"created_at","depth":2,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".main_event.columns","leaf":"columns","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.date","leaf":"date","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.entry_origin","leaf":"entry_origin","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.entry_source","leaf":"entry_source","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.entry_type","leaf":"entry_type","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.entry_uuid","leaf":"entry_uuid","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.event_attribute","leaf":"event_attribute","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.event_category","leaf":"event_category","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.event_extra_attributes","leaf":"event_extra_attributes","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.event_score","leaf":"event_score","depth":2,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".main_event.event_uuid","leaf":"event_uuid","depth":2,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".main_event.hour","leaf":"hour","depth":2,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".main_event.domain_report","leaf":"domain_report","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ip_investigation_report","leaf":"ip_investigation_report","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.kubernetes","leaf":"kubernetes","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.kubernetes.container","leaf":"container","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.kubernetes.labels","leaf":"labels","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.kubernetes.node","leaf":"node","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.kubernetes.pod","leaf":"pod","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.kubernetes.replicaset","leaf":"replicaset","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.attack_framework","leaf":"attack_framework","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.mitre_tactic","leaf":"mitre_tactic","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.mitre_technique","leaf":"mitre_technique","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.timestamp","leaf":"timestamp","depth":2,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".main_event.whitelisted","leaf":"whitelisted","depth":2,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".main_event.app_info","leaf":"app_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.case_info","leaf":"case_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.classifier_info","leaf":"classifier_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.cve_info","leaf":"cve_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.cve_info.cve_dest_status","leaf":"cve_dest_status","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.deduper_info","leaf":"deduper_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.domain_info","leaf":"domain_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.eventscorer_info","leaf":"eventscorer_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ext_info","leaf":"ext_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ext_info.domain_info","leaf":"domain_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ext_info.dest_ip_info","leaf":"dest_ip_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ext_info.src_ip_info","leaf":"src_ip_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ext_info.uri_info","leaf":"uri_info","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.file_info","leaf":"file_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.ip_info","leaf":"ip_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.logfinder_info","leaf":"logfinder_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.mistwatcher_info","leaf":"mistwatcher_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.network_info","leaf":"network_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.network_info.int_dest","leaf":"int_dest","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.network_info.int_src","leaf":"int_src","depth":3,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.pcap_info","leaf":"pcap_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.rapid7_info","leaf":"rapid7_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.rare_info","leaf":"rare_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.url_info","leaf":"url_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.session_info","leaf":"session_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.session_info.local_orig","leaf":"local_orig","depth":3,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".main_event.session_info.local_resp","leaf":"local_resp","depth":3,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".main_event.vulnerability_info","leaf":"vulnerability_info","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.event_actor","leaf":"event_actor","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".main_event.IncidentCaseEvents","leaf":"IncidentCaseEvents","depth":2,"seenInLogCount":1,"values":[{"value":false,"type":"boolean","count":1}]},{"name":".main_event.decorations","leaf":"decorations","depth":2,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".positive","leaf":"positive","depth":1,"seenInLogCount":1,"values":[{"value":true,"type":"boolean","count":1}]},{"name":".servicenow_info","leaf":"servicenow_info","depth":1,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".severity","leaf":"severity","depth":1,"seenInLogCount":1,"values":[{"value":50,"type":"number","count":1}]},{"name":".score","leaf":"score","depth":1,"seenInLogCount":1,"values":[{"value":3,"type":"number","count":1}]},{"name":".timestamp","leaf":"timestamp","depth":1,"seenInLogCount":1,"values":[{"value":1607571942935,"type":"number","count":1}]},{"name":".wildcard_ioa_count","leaf":"wildcard_ioa_count","depth":1,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".actor","leaf":"actor","depth":1,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".summary_events_count","leaf":"summary_events_count","depth":1,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".policy_violation_info","leaf":"policy_violation_info","depth":1,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".incident_info","leaf":"incident_info","depth":1,"seenInLogCount":1,"values":[{"type":"object","count":1}]},{"name":".casescore","leaf":"casescore","depth":1,"seenInLogCount":1,"values":[{"value":0,"type":"number","count":1}]},{"name":".determination","leaf":"determination","depth":1,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]},{"name":".note","leaf":"note","depth":1,"seenInLogCount":1,"values":[{"value":"","type":"string","count":1}]}]'),
      //   collectionConfig: {}
      // },
      // {
      //   uid: '7dc7d568-a90e-11eb-bcbc-0242ac130002',
      //   name: 'Magic Cloud 2000',
      //   status: 'New', // New, Dev, Ready
      //   primaryOpenCollector: '5c23be18-a90e-11eb-bcbc-0242ac130002', // UID of the main OC
      //   fieldsMapping: [],
      //   collectionConfig: {}
      // },
      // {
      //   uid: 'b9e1cf48-a910-11eb-bcbc-0242ac130002',
      //   name: 'Azure Event Hub',
      //   status: 'Ready', // New, Dev, Ready
      //   primaryOpenCollector: '5c23be18-a90e-11eb-bcbc-0242ac130002', // UID of the main OC
      //   fieldsMapping: [],
      //   collectionConfig: {}
      // }
    ],
    logSamples: [
      {
        pipelineUid: '',
        logs: []
      }
    ],
    jqFilterTemplate: `# -------------------------------------------
# THIS TRANSFORM WAS AUTOMATICALLY GENERATED.
# ANY MANUAL MODIFICATION WILL BE LOST.
# -------------------------------------------
# Generated on: {{EZ_generation_timestamp}}
# By: {{EZ_generation_user}}
# For Stream: {{EZ_stream_name_placeholder}}
# UID: {{EZ_stream_id_placeholder}}
# -------------------------------------------

# is_{{EZ_beatname_placeholder}} checks if the data matches the {{EZ_stream_name_placeholder}} criteria
def is_{{EZ_beatname_placeholder}}:
    ."@metadata".beat == "filebeat"
    and
    (
      .fields.stream.id == "{{EZ_stream_id_placeholder}}"
      or
      .fields.stream.name == "{{EZ_stream_name_placeholder}}"
    )
;
   `,
    jqTransformTemplate: `# -------------------------------------------
# THIS TRANSFORM WAS AUTOMATICALLY GENERATED.
# ANY MANUAL MODIFICATION WILL BE LOST.
# -------------------------------------------
# Generated on: {{EZ_generation_timestamp}}
# By: {{EZ_generation_user}}
# For Stream: {{EZ_stream_name_placeholder}}
# UID: {{EZ_stream_id_placeholder}}
# -------------------------------------------

# -----------------
# UTILITY FUNCTIONS
# -----------------

# flatten_array will flatten or fan out the pipeline, returning n values
#  where n is the number of array records in the log message. If there are no records
#  the input is returned unchanged
def flatten_array($log_msg_field):
    if $log_msg_field then
        if ($log_msg_field | length) > 0 then
            # flatten our records into one message each
            $log_msg_field[]
        else
            .
        end
    else
        .
    end
;

# add_field adds a key-value pair to the metadata objects generated by get_io_format
# Takes an input and output filter as parameters
# Capable of adding data to any of the objects in the metadata JSON (input, output, subrule, transform_path, etc)
# This function should be used for adding all metadata to your output - It scrubs illegal characters like | and \n
# Example function call: add_field(.input.field1; .output.subject)
def add_field($input_field; output_field):

    #Check for pipe character
    ($input_field | tojson) as $input_field_string
    
    (($input_field_string | contains("|")) or ($input_field_string | contains("\\n")) | not ) as $nobadchars

    if
        $input_field and $nobadchars
    then
        output_field = $input_field
    elif 
        $input_field and ($nobadchars | not)
    then
        #remove pipes and newline characters from input_field
        ($input_field_string | split("|") | join("-")) as $input_field_nopipes |
        ($input_field_nopipes | split("\\n") | join(" ")) as $input_field_nobadchars |
        output_field = ($input_field_nobadchars | fromjson)
    else
        .
    end
;

# -----------------
# DATA TRANSFORM
# -----------------

# get_io_format converts incoming data to a standard IO format. The original
#   content is added to the output in the "original_message" field automatically.
def get_io_format:
    {
        "input": .,
        "message": .message | fromjson,
{{EZ_flatten_array_placeholder}}
        "output": {
            "original_message": {{EZ_original_message_placeholder}}
        }
    }
;

# transform will normalize the incoming log into the LogRhythm Schema
#   that can then be forwarded to the SIEM
def transform:
    # First, convert to IO format.
    get_io_format |

    # beatname is a required field for Open Collector Regex to work in the SIEM.
    # We add here more details to help the Log Source Virtualisation

    add_field("{{EZ_beatname_placeholder}}"; .output.beatname) |
    add_field("{{EZ_stream_id_placeholder}}"; .output.stream_id) |
    add_field("{{EZ_stream_name_placeholder}}"; .output.stream_name) |

    # If required, the Fanned out fields

{{EZ_flatten_array__add_field_placeholder}}

    # The rest of the Fields mapping

{{EZ_add_field_placeholder}}

    # For the Sub Rules

{{EZ_sub_rules__add_field_placeholder}}

    # this filter produces the output object, for sending to SYSLOG output
    # This filter should be left in place in most cases
    .output
;
`
  }
}
/*
# Generated on: {{EZ_generation_timestamp}}
# By: {{EZ_generation_user}}
# For Stream: {{EZ_stream_name_placeholder}}
# UID: {{EZ_stream_id_placeholder}}
{{EZ_flatten_array_placeholder}}
            "original_message": {{EZ_original_message_placeholder}}
    add_field("{{EZ_beatname_placeholder}}"; .output.beatname) |
    add_field("{{EZ_stream_name_placeholder}}"; .output.stream_name) |
{{EZ_flatten_array__add_field_placeholder}}
#    add_field({{EZ_flatten_array_name_placeholder}}{{EZ_flatten_array_field_doted_path_placeholder}}; .output.{{EZ_mdi_field_placeholder}}) |
{{EZ_add_field_placeholder}}
    add_field({{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}}; .output.{{EZ_mdi_field_placeholder}}) |
{{EZ_sub_rules__add_field_placeholder}}
    add_field({{EZ_message_placeholder}}{{EZ_field_doted_path_placeholder}}; .output.tag1) |
*/
