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
      .fields.stream_id == "{{EZ_stream_id_placeholder}}"
      or
      .fields.stream_name == "{{EZ_stream_name_placeholder}}"
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
`,
    collectionMethodTemplates: [

      //     ######## ##          ###    ########       ######## #### ##       ########
      //     ##       ##         ## ##      ##          ##        ##  ##       ##
      //     ##       ##        ##   ##     ##          ##        ##  ##       ##
      //     ######   ##       ##     ##    ##          ######    ##  ##       ######
      //     ##       ##       #########    ##          ##        ##  ##       ##
      //     ##       ##       ##     ##    ##          ##        ##  ##       ##
      //     ##       ######## ##     ##    ##          ##       #### ######## ########

      {
        collectionMethod: 'log',
        definition: [
          {
            name: 'paths',
            label: 'File Paths',
            type: {
              name: 'array', // array, object, boolean, string, number, regex, option
              of: { // for array and object
                type: {
                  name: 'string'
                },
                quotes: {
                  required: true,
                  options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
                  default: '"'
                },
                default: '',
                description: 'A single glob-based path that will be crawled and fetched. For example: `/path/to/file.log`',
                required: true
              }
            },
            // default: '',
            description: `A list of glob-based paths that will be crawled and fetched. All patterns supported by Go Glob are also supported here. 
For example, to fetch all files from a predefined level of subdirectories, the following pattern can be used: \`/var/log/*/*.log\`. This fetches all \`.log\` files from the subfolders of \`/var/log\`. It does not fetch log files from the \`/var/log\` folder itself.
> It is possible to recursively fetch all files in all subdirectories of a directory using the optional \`Recursive Glob\` settings under **Advanced**.`,
            required: true,
            group: 'Required'
          },
          // Advanced
          {
            name: 'encoding',
            label: 'Text encoding',
            type: {
              name: 'option' // array, object, boolean, string, number, regex, option
            },
            options: [
              { value: null, label: '** Not specified **<hr>' },
              { value: 'plain', label: 'Plain ASCII encoding' },
              { value: 'utf-8', label: 'UTF-8 encoding' },
              { value: 'gbk', label: 'simplified Chinese charaters' },
              { value: 'iso8859-6e', label: 'ISO8859-6E, Latin/Arabic' },
              { value: 'iso8859-6i', label: 'ISO8859-6I, Latin/Arabic' },
              { value: 'iso8859-8e', label: 'ISO8859-8E, Latin/Hebrew' },
              { value: 'iso8859-8i', label: 'ISO8859-8I, Latin/Hebrew' },
              { value: 'iso8859-1', label: 'ISO8859-1, Latin-1' },
              { value: 'iso8859-2', label: 'ISO8859-2, Latin-2' },
              { value: 'iso8859-3', label: 'ISO8859-3, Latin-3' },
              { value: 'iso8859-4', label: 'ISO8859-4, Latin-4' },
              { value: 'iso8859-5', label: 'ISO8859-5, Latin/Cyrillic' },
              { value: 'iso8859-6', label: 'ISO8859-6, Latin/Arabic' },
              { value: 'iso8859-7', label: 'ISO8859-7, Latin/Greek' },
              { value: 'iso8859-8', label: 'ISO8859-8, Latin/Hebrew' },
              { value: 'iso8859-9', label: 'ISO8859-9, Latin-5' },
              { value: 'iso8859-10', label: 'ISO8859-10, Latin-6' },
              { value: 'iso8859-13', label: 'ISO8859-13, Latin-7' },
              { value: 'iso8859-14', label: 'ISO8859-14, Latin-8' },
              { value: 'iso8859-15', label: 'ISO8859-15, Latin-9' },
              { value: 'iso8859-16', label: 'ISO8859-16, Latin-10' },
              { value: 'cp437', label: 'IBM CodePage 437' },
              { value: 'cp850', label: 'IBM CodePage 850' },
              { value: 'cp852', label: 'IBM CodePage 852' },
              { value: 'cp855', label: 'IBM CodePage 855' },
              { value: 'cp858', label: 'IBM CodePage 858' },
              { value: 'cp860', label: 'IBM CodePage 860' },
              { value: 'cp862', label: 'IBM CodePage 862' },
              { value: 'cp863', label: 'IBM CodePage 863' },
              { value: 'cp865', label: 'IBM CodePage 865' },
              { value: 'cp866', label: 'IBM CodePage 866' },
              { value: 'ebcdic-037', label: 'IBM CodePage 037' },
              { value: 'ebcdic-1040', label: 'IBM CodePage 1140' },
              { value: 'ebcdic-1047', label: 'IBM CodePage 1047' },
              { value: 'koi8r', label: 'KOI8-R, Russian (Cyrillic)' },
              { value: 'koi8u', label: 'KOI8-U, Ukranian (Cyrillic)' },
              { value: 'macintosh', label: 'Macintosh encoding' },
              { value: 'macintosh-cyrillic', label: 'Macintosh Cyrillic encoding' },
              { value: 'windows1250', label: 'Windows1250, Central and Eastern European' },
              { value: 'windows1251', label: 'Windows1251, Russian, Serbian (Cyrillic)' },
              { value: 'windows1252', label: 'Windows1252, Legacy' },
              { value: 'windows1253', label: 'Windows1253, Modern Greek' },
              { value: 'windows1254', label: 'Windows1254, Turkish' },
              { value: 'windows1255', label: 'Windows1255, Hebrew' },
              { value: 'windows1256', label: 'Windows1256, Arabic' },
              { value: 'windows1257', label: 'Windows1257, Estonian, Latvian, Lithuanian' },
              { value: 'windows1258', label: 'Windows1258, Vietnamese' },
              { value: 'windows874', label: 'Windows874, ISO/IEC 8859-11, Latin/Thai' },
              { value: 'utf-16-bom', label: 'UTF-16 with required BOM' },
              { value: 'utf-16be-bom', label: 'big endian UTF-16 with required BOM' },
              { value: 'utf-16le-bom', label: 'little endian UTF-16 with required BOM' }
            ],
            default: 'utf-8',
            description: `The file encoding to use for reading data that contains international characters. 
> NOTE
> The plain encoding is special, because it does not validate or transform any input.`,
            required: false,
            group: 'Advanced'
          },
          {
            name: 'recursive_glob.enabled',
            label: 'Recursive Glob',
            type: {
              name: 'boolean'
            },
            default: true,
            description: `Is this Recursive Glob enabled?
Enable expanding \`** \` into recursive glob patterns. With this feature enabled,
the rightmost \`** \` in each path is expanded into a fixed number of glob
patterns. For example: \`/ foo/**\` expands to \`/foo\`, \`/foo/*\`, \`/foo/*/ * \`, and so
on. If enabled it expands a single \`** \` into a 8-level deep \` *\` pattern.`,
            required: false,
            group: 'Advanced'
          },
          {
            name: 'include_lines',
            label: 'Include Lines',
            type: {
              name: 'array', // array, object, boolean, string, number, regex, option
              of: { // for array and object
                type: {
                  name: 'regex' // array, object, boolean, string, number, regex, option
                },
                quotes: {
                  required: true,
                  options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
                  default: '\''
                },
                default: '',
                required: false
              }
            },
            description: `A list of regular expressions to match the lines that you want Filebeat to include. Filebeat exports only the lines that match a regular expression in the list. By default, all lines are exported. Empty lines are ignored.
If multiline settings also specified, each multiline message is combined into a single line before the lines are filtered by \`Include Lines\`.
> NOTE
> If both \`Include Lines\` and \`Exclude Lines\` are defined, Filebeat executes \`Include Lines\` first and then executes \`Exclude Lines\`. The order in which the two options are defined doesn’t matter.`,
            required: false,
            group: 'Advanced'
          },
          {
            name: 'exclude_lines',
            label: 'Exclude Lines',
            type: {
              name: 'array',
              of: {
                type: {
                  name: 'regex'
                },
                quotes: {
                  required: true,
                  options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
                  default: '\''
                },
                default: '',
                required: false
              }
            },
            description: `A list of regular expressions to match the lines that you want Filebeat to exclude. Filebeat drops any lines that match a regular expression in the list. By default, no lines are dropped. Empty lines are ignored.
If multiline settings are also specified, each multiline message is combined into a single line before the lines are filtered by \`Exclude Lines\`.
> NOTE
> If both \`Include Lines\` and \`Exclude Lines\` are defined, Filebeat executes \`Include Lines\` first and then executes \`Exclude Lines\`. The order in which the two options are defined doesn’t matter.`,
            required: false,
            group: 'Advanced'
          },
          {
            name: 'exclude_files',
            label: 'Exclude Files',
            type: {
              name: 'array',
              of: {
                type: {
                  name: 'regex'
                },
                quotes: {
                  required: true,
                  options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
                  default: '\''
                },
                default: '',
                required: false
              }
            },
            description: 'A list of regular expressions to match the files that you want Filebeat to ignore. By default no files are excluded.',
            required: false,
            group: 'Advanced'
          },
          {
            name: 'ignore_older',
            label: 'Ignore Older',
            type: {
              name: 'number' // array, object, boolean, string, number, regex, option
            },
            suffix: {
              required: true,
              options: [{ value: 's', label: 'Seconds' }, { value: 'm', label: 'Minutes' }, { value: 'h', label: 'Hours' }], // s, m, KiB, MiB
              default: 'h'
            },
            default: '0',
            min: 0,
            max: 3600,
            description: `If this option is enabled, Filebeat ignores any files that were modified before the specified timespan. 
Configuring \`Ignore Older\` can be especially useful if you keep log files for a long time. For example, if you want to start Filebeat, but only want to send the newest files and files from last week, you can configure this option.
You can use time like 2 hours and 5 minutes. The default is 0, which disables the setting. Excluding out the config has the same effect as setting it to 0.
::: danger
You must set \`Ignore Older\` to be greater than \`Close Inactive\`.
:::`,
            required: false,
            group: 'Advanced'
          },
          {
            name: 'close_inactive',
            label: 'Close Inactive',
            type: {
              name: 'number' // array, object, boolean, string, number, regex, option
            },
            suffix: {
              required: true,
              options: [{ value: 's', label: 'Seconds' }, { value: 'm', label: 'Minutes' }, { value: 'h', label: 'Hours' }], // s, m, KiB, MiB
              default: 'm'
            },
            default: '5m',
            min: 0,
            max: 3600,
            description: `When this option is enabled, Filebeat closes the file handle if a file has not been harvested for the specified duration.
> NOTE
> The counter for the defined period starts when the last log line was read by the harvester. It is not based on the modification time of the file. If the closed file changes again, a new harvester is started and the latest changes will be picked up after \`Scan Frequency\` has elapsed.

::: tip
We recommended that you set \`Close Inactive\` to a value that is larger than the least frequent updates to your log files. For example, if your log files get updated every few seconds, you can safely set \`Close Inactive\` to 1 Minute. If there are log files with very different update rates, you can use multiple configurations with different values. Setting \`Close Inactive\` to a lower value means that file handles are closed sooner. However this has the side effect that new log lines are not sent in near real time if the harvester is closed. The timestamp for closing a file does not depend on the modification time of the file. Instead, Filebeat uses an internal timestamp that reflects when the file was last harvested.
For example, if \`Close Inactive\` is set to 5 minutes, the countdown for the 5 minutes starts after the harvester reads the last line of the file.
:::

You can use time like 2 hours and 5 minutes. The default is 5 minutes.

::: warning
Only use this option if you understand that data loss is a potential side effect.
:::`,
            required: false,
            group: 'Advanced'
          },
          {
            name: 'scan_frequency',
            label: 'Scan Frequency',
            type: {
              name: 'number' // array, object, boolean, string, number, regex, option
            },
            suffix: {
              required: true,
              options: [{ value: 's', label: 'Seconds' }, { value: 'm', label: 'Minutes' }, { value: 'h', label: 'Hours' }], // s, m, KiB, MiB
              default: 's'
            },
            default: 10,
            min: 1,
            max: 3600,
            description: `How often Filebeat checks for new files in the paths that are specified for harvesting. For example, if you specify a glob like \`/var/log/*\`, the directory is scanned for files using the frequency specified by \`Scan Frequency\`. Specify 1 second to scan the directory as frequently as possible without causing Filebeat to scan too frequently.
::: tip
We do not recommend to set this value < 1 second. If you require log lines to be sent in near real time do not use a very low \`Scan Frequency\` but adjust \`Close Inactive\` so the file handler stays open and constantly polls your files.
:::
The default setting is 10 Seconds.`,
            required: false,
            group: 'Advanced'
          },
          {
            name: 'max_bytes',
            label: 'Max Bytes',
            type: {
              name: 'number' // array, object, boolean, string, number, regex, option
            },
            default: '10485760',
            min: 0,
            max: 52428800, // 50 MB
            description: 'The maximum number of bytes that a single log message can have. All bytes after `Max Bytes` are discarded and not sent. This setting is especially useful for multiline log messages, which can get large. The default is 10MB (10,485,760 Bytes).',
            required: false,
            group: 'Advanced'
          },
          {
            name: 'keep_null',
            label: 'Keep Null',
            type: {
              name: 'boolean'
            },
            description: 'If this option is set to true, fields with null values will be published in the output document. By default, `Keep Null` is set to false.',
            default: false,
            required: false,
            group: 'Advanced'
          },
          {
            name: 'enabled',
            label: 'Enabled',
            type: {
              name: 'boolean' // array, object, boolean, string, number, regex, option
            },
            // options: [{ value: true, label: 'True' }, { value: false, label: 'False' }],
            default: true,
            description: 'Is this Collection Method enabled?',
            required: true,
            readonly: true,
            group: 'EZ Internal'
          },
          {
            name: 'fields',
            label: 'Identification Fields',
            type: {
              name: 'object', // array, object, boolean, string, number, regex, option
              of: { // for array and object
                type: {
                  name: 'string'
                },
                default: '',
                description: '',
                required: true
              }
            },
            description: `In addition to \`stream_id\` and \`stream_name\` fields that are automatically added, and cannot be removed or changed, you can add optional fields that you can specify to add additional information to the output.
For example, you might add fields that you can use for filtering log data.
Fields can be scalar values, arrays, dictionaries, or any nested combination of these.
By default, the fields that you specify here will be grouped under a fields sub-dictionary in the output document.
To store the custom fields as top-level fields, set the \`fields_under_root option\` to true. If a duplicate field is declared in the general configuration, then its value will be overwritten by the value declared here.`,
            required: true,
            group: 'EZ Internal'
          }
        ] // definition
      }, // log

      //      ######  ##    ##  ######  ##        #######   ######
      //     ##    ##  ##  ##  ##    ## ##       ##     ## ##    ##
      //     ##         ####   ##       ##       ##     ## ##
      //      ######     ##     ######  ##       ##     ## ##   ####
      //           ##    ##          ## ##       ##     ## ##    ##
      //     ##    ##    ##    ##    ## ##       ##     ## ##    ##
      //      ######     ##     ######  ########  #######   ######

      {
        collectionMethod: 'syslog',
        definition: [
          // Required
          {
            name: 'protocol.tcp.host',
            label: 'TCP - Binding address and port',
            type: {
              name: 'string'
            },
            description: 'Host name/IP and port onto which bind Syslog over TCP',
            default: '0.0.0.0:514',
            required: true,
            group: 'Required'
          },
          {
            name: 'protocol.udp.host',
            label: 'UDP - Binding address and port',
            type: {
              name: 'string'
            },
            description: 'Host name/IP and port onto which bind Syslog over UDP',
            default: '0.0.0.0:514',
            required: true,
            group: 'Required'
          },
          // SSL Configuration
          {
            name: 'protocol.tcp.ssl.enabled',
            label: 'Enabled',
            type: {
              name: 'boolean'
            },
            default: false,
            description: 'Is Syslog SSL enabled?',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'protocol.tcp.ssl.certificate_authorities',
            label: 'SSL Certificate Authorities',
            type: {
              name: 'string'
            },
            default: '',
            description: 'Path to the file with the list of root certificates for client verifications is only required if `Client Authentication` is configured. If `Certificate Authorities` is empty or not set, and `Client Authentication` is configured, the system keystore is used. If `Certificate Authorities` is self-signed, the host system needs to trust that CA cert as well.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'protocol.tcp.ssl.certificate',
            label: 'SSL Certificate',
            type: {
              name: 'string'
            },
            default: '',
            description: 'For server authentication, the path to the SSL authentication certificate must be specified for TLS. If the certificate is not specified, startup will fail. When this option is configured, the key option is also required.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'protocol.tcp.ssl.key',
            label: 'SSL Key',
            type: {
              name: 'string'
            },
            default: '',
            description: 'The server certificate key used for authentication is required.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'protocol.tcp.ssl.key_passphrase',
            label: 'Pass phrase for SSL Key',
            type: {
              name: 'password'
            },
            default: '',
            description: 'The passphrase is used to decrypt an encrypted key stored in the configured key file.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'protocol.tcp.ssl.verification_mode',
            label: 'Verification Mode',
            type: {
              name: 'option'
            },
            options: [{ value: 'full', label: 'Full: Verifies that the provided certificate is signed by a trusted authority (CA) and also verifies that the server’s hostname (or IP address) matches the names identified within the certificate.' }, { value: 'strict', label: 'Strict: Verifies that the provided certificate is signed by a trusted authority (CA) and also verifies that the server’s hostname (or IP address) matches the names identified within the certificate.If the Subject Alternative Name is empty, it returns an error.' }, { value: 'certificate', label: 'Certificate: Verifies that the provided certificate is signed by a trusted authority (CA), but does not perform any hostname verification.' }, { value: 'none', label: 'None: Performs no verification of the server’s certificate.This mode disables many of the security benefits of SSL/ TLS and should only be used after cautious consideration.It is primarily intended as a temporary diagnostic mechanism when attempting to resolve TLS errors; its use in production environments is strongly discouraged.' }],
            default: 'full',
            description: 'Controls the verification of client certificates. The default value is `Full`.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'protocol.tcp.ssl.client_authentication',
            label: 'Client Authentication',
            type: {
              name: 'option'
            },
            options: [{ value: 'none', label: 'None: Disables client authentication.' }, { value: 'optional', label: 'Optional: When a client certificate is supplied, the server will verify it.' }, { value: 'required', label: 'Required: Will require clients to provide a valid certificate.' }],
            default: 'none',
            description: 'The type of client authentication mode. When `SSL Certificate Authorities` is set, it defaults to `Required`. Otherwise, it defaults to `None`.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'protocol.tcp.ssl.renegotiation',
            label: 'Renegotiation',
            type: {
              name: 'option'
            },
            options: [{ value: 'never', label: 'Never: Disables renegotiation.' }, { value: 'once', label: 'Once: Allows a remote server to request renegotiation once per connection.' }, { value: 'freely', label: 'Freely: Allows a remote server to request renegotiation repeatedly.' }],
            default: 'never',
            description: 'This configures what types of TLS renegotiation are supported. The default value is `Never`.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'protocol.tcp.ssl.supported_protocols',
            label: 'Supported Protocols',
            type: {
              name: 'array',
              of: {
                type: {
                  name: 'string'
                },
                default: '',
                required: false
              }
            },
            description: 'List of allowed SSL/TLS versions. If SSL/TLS server decides for protocol versions not configured, the connection will be dropped during or after the handshake. The setting is a list of allowed protocol versions: SSLv3, TLSv1 for TLS version 1.0, TLSv1.0, TLSv1.1, TLSv1.2, and TLSv1.3. The default value is [TLSv1.1, TLSv1.2, TLSv1.3].',
            required: false,
            group: 'SSL Configuration'
          },
          // Advanced - Syslog over TCP
          {
            name: 'protocol.tcp.max_message_size',
            label: 'Syslog over TCP - Maximum Message Size',
            type: {
              name: 'number' // array, object, boolean, string, number, regex, option
            },
            suffix: {
              options: [{ value: 'KiB', label: 'Kilo Bytes' }, { value: 'MiB', label: 'Mega Bytes' }],
              default: 'MiB'
            },
            default: '20MiB',
            min: 1,
            max: 50,
            description: 'The maximum size of the message received over TCP. The default is 20 MegaBytes.',
            required: false,
            group: 'Advanced - Syslog over TCP'
          },
          {
            name: 'protocol.tcp.framing',
            label: 'Syslog over TCP - Framing',
            type: {
              name: 'option'
            },
            options: [{ value: 'delimiter', label: 'Delimiter: Uses the characters specified in Line Delimiter to split the incoming events.' }, { value: 'rfc6587', label: 'RFC6587: supports octet counting and non-transparent framing as described in RFC6587. Line Delimiter is used to split the events in non-transparent framing.' }],
            default: 'delimiter',
            description: 'Specify the framing used to split incoming events. The default is `Delimiter`.',
            required: false,
            group: 'Advanced - Syslog over TCP'
          },
          {
            name: 'protocol.tcp.line_delimiter',
            label: 'Syslog over TCP - Line Delimiter',
            type: {
              name: 'string'
            },
            default: '\\n',
            description: 'Specify the characters used to split the incoming events. The default is \\n.',
            required: false,
            group: 'Advanced - Syslog over TCP'
          },
          {
            name: 'protocol.tcp.max_connections',
            label: 'Syslog over TCP - Maximum Connections',
            type: {
              name: 'number'
            },
            min: 1,
            max: 250,
            default: 50,
            description: 'The at most number of connections to accept at any given point in time.',
            required: false,
            group: 'Advanced - Syslog over TCP'
          },
          {
            name: 'protocol.tcp.timeout',
            label: 'Syslog over TCP - Timeout',
            type: {
              name: 'number'
            },
            suffix: {
              options: [{ value: 's', label: 'Seconds' }, { value: 'm', label: 'Minutes' }, { value: 'h', label: 'Hours' }], // s, m, KiB, MiB
              default: 's'
            },
            min: 10,
            max: 3600,
            default: '300s',
            description: 'The number of seconds of inactivity before a remote connection is closed. The default is 300 seconds.',
            required: false,
            group: 'Advanced - Syslog over TCP'
          },
          // Advanced - Syslog over UDP
          {
            name: 'protocol.udp.max_message_size',
            label: 'Syslog over UDP - Maximum Message Size',
            type: {
              name: 'number' // array, object, boolean, string, number, regex, option
            },
            suffix: {
              options: [{ value: 'KiB', label: 'Kilo Bytes' }, { value: 'MiB', label: 'Mega Bytes' }],
              default: 'MiB'
            },
            default: '20MiB',
            min: 1,
            max: 50,
            description: 'The maximum size of the message received over UDP. The default is 20 MegaBytes.',
            required: false,
            group: 'Advanced - Syslog over UDP'
          },
          {
            name: 'protocol.udp.read_buffer',
            label: 'Syslog over UDP - Read Buffer',
            type: {
              name: 'number'
            },
            suffix: {
              options: [{ value: 'KiB', label: 'Kilo Bytes' }, { value: 'MiB', label: 'Mega Bytes' }],
              default: 'MiB'
            },
            min: 1,
            max: 250,
            default: 50,
            description: 'The size of the read buffer on the UDP socket.',
            required: false,
            group: 'Advanced - Syslog over UDP'
          },
          {
            name: 'protocol.udp.timeout',
            label: 'Syslog over UDP - Timeout',
            type: {
              name: 'number'
            },
            suffix: {
              options: [{ value: 's', label: 'Seconds' }, { value: 'm', label: 'Minutes' }, { value: 'h', label: 'Hours' }], // s, m, KiB, MiB
              default: 's'
            },
            min: 10,
            max: 3600,
            default: '300s',
            description: 'The number of seconds of inactivity before a remote connection is closed. The default is 300 seconds.',
            required: false,
            group: 'Advanced - Syslog over UDP'
          },
          // Advanced - Misc
          {
            name: 'protocol.tcp.ssl',
            label: 'SSL for Syslog over TCP - Extra parameters',
            type: {
              name: 'object',
              of: {
                type: {
                  name: 'string'
                },
                default: ''
              }
            },
            description: 'Extra parameters you might want to add to the SSL Configuration',
            required: false,
            group: 'Advanced - Miscellaneous'
          },
          {
            name: 'protocol.tcp',
            label: 'SSL for Syslog over TCP - Extra parameters',
            type: {
              name: 'object',
              of: {
                type: {
                  name: 'string'
                },
                default: ''
              }
            },
            description: '',
            required: false,
            group: 'Advanced - Miscellaneous'
          },
          {
            name: 'protocol.udp',
            label: 'SSL for Syslog over UDP - Extra parameters',
            type: {
              name: 'object',
              of: {
                type: {
                  name: 'string'
                },
                default: ''
              }
            },
            description: '',
            required: false,
            group: 'Advanced - Miscellaneous'
          },
          {
            name: 'keep_null',
            label: 'Keep Null',
            type: {
              name: 'boolean'
            },
            description: 'If this option is set to true, fields with null values will be published in the output document. By default, `Keep Null` is set to false.',
            default: false,
            required: false,
            group: 'Advanced - Miscellaneous'
          },
          // EZ Internal
          {
            name: 'enabled',
            label: 'Enabled',
            type: {
              name: 'boolean'
            },
            default: true,
            description: 'Is this Collection Method enabled?',
            required: true,
            readonly: true,
            group: 'EZ Internal'
          },
          {
            name: 'fields',
            label: 'Identification Fields',
            type: {
              name: 'object',
              of: {
                type: {
                  name: 'string'
                },
                default: '',
                description: '',
                required: true
              }
            },
            description: `In addition to \`stream_id\` and \`stream_name\` fields that are automatically added, and cannot be removed or changed, you can add optional fields that you can specify to add additional information to the output.
For example, you might add fields that you can use for filtering log data.
Fields can be scalar values, arrays, dictionaries, or any nested combination of these.
By default, the fields that you specify here will be grouped under a fields sub-dictionary in the output document.
To store the custom fields as top-level fields, set the \`fields_under_root option\` to true. If a duplicate field is declared in the general configuration, then its value will be overwritten by the value declared here.`,
            required: true,
            group: 'EZ Internal'
          }
        ] // definition
      }, // syslog

      //     ##     ## ######## ######## ########              ##  ######   #######  ##    ##
      //     ##     ##    ##       ##    ##     ##             ## ##    ## ##     ## ###   ##
      //     ##     ##    ##       ##    ##     ##             ## ##       ##     ## ####  ##
      //     #########    ##       ##    ########              ##  ######  ##     ## ## ## ##
      //     ##     ##    ##       ##    ##              ##    ##       ## ##     ## ##  ####
      //     ##     ##    ##       ##    ##              ##    ## ##    ## ##     ## ##   ###
      //     ##     ##    ##       ##    ##               ######   ######   #######  ##    ##

      {
        collectionMethod: 'httpjson',
        definition: [
          // Required
          {
            name: 'request.url',
            label: 'Request URL',
            type: {
              name: 'string'
            },
            description: 'The URL of the HTTP API.',
            default: '',
            required: true,
            group: 'Required'
          },
          {
            name: 'request.method',
            label: 'Request Method',
            type: {
              name: 'option'
            },
            options: [{ value: 'GET', label: 'HTTP GET' }, { value: 'POST', label: 'HTTP POST' }],
            description: 'HTTP method to use when making requests. Default: `GET`.',
            default: 'GET',
            required: false,
            group: 'Required'
          },
          {
            name: 'EZ__Auth_Basic__enable',
            label: 'Enable',
            type: {
              name: 'boolean'
            },
            description: 'Using Basic authentication?',
            default: false,
            required: true,
            group: 'Authentication - Basic'
          },
          {
            name: 'EZ__Auth_Basic__username',
            label: 'Username',
            type: {
              name: 'string'
            },
            description: 'Username for Basic authentication. It will be URL-encoded automatically with its password.',
            default: '',
            required: true,
            group: 'Authentication - Basic'
          },
          {
            name: 'EZ__Auth_Basic__password',
            label: 'Password',
            type: {
              name: 'password'
            },
            description: 'Password for Basic authentication. It will be URL-encoded automatically with its username.',
            default: '',
            required: true,
            group: 'Authentication - Basic'
          },

          // OAuth2

          {
            name: 'auth.oauth2.enabled',
            label: 'Enabled',
            type: {
              name: 'boolean'
            },
            description: 'When set to false, disables the OAuth2 configuration.',
            default: false,
            required: true,
            group: 'Authentication - OAuth2'
          },
          {
            name: 'auth.oauth2.provider',
            label: 'OAuth2 Provider',
            type: {
              name: 'option'
            },
            options: [{ value: 'default', label: 'Default' }, { value: 'azure', label: 'Azure' }, { value: 'google', label: 'Google' }],
            description: `Used to configure supported OAuth2 providers.
Each supported provider will require specific settings. It is not set by default. Supported providers are: \`Default\`, \`Azure\` and \`Google\`.`,
            default: 'default',
            required: false,
            group: 'Authentication - OAuth2'
          },
          {
            name: 'auth.oauth2.client.id',
            label: 'Client ID',
            type: {
              name: 'string'
            },
            description: 'The Client ID used as part of the authentication flow. It is always required except if using `Google` as provider. Required for providers: `Default`, `Azure`.',
            default: '',
            required: false,
            group: 'Authentication - OAuth2'
          },
          {
            name: 'auth.oauth2.client.secret',
            label: 'Client Secret',
            type: {
              name: 'password'
            },
            description: 'The client secret used as part of the authentication flow. It is always required except if using `Google` as provider. Required for providers: `Default`, `Azure`.',
            default: '',
            required: false,
            group: 'Authentication - OAuth2'
          },
          {
            name: 'auth.oauth2.scopes',
            label: 'Scopes',
            type: {
              name: 'array',
              of: {
                type: {
                  name: 'string'
                },
                default: '',
                required: true
              }
            },
            description: `A list of scopes that will be requested during the OAuth2 flow.
It is optional for all providers.`,
            required: false,
            group: 'Authentication - OAuth2'
          },
          {
            name: 'auth.oauth2.endpoint_params',
            label: 'Endpoint Parameters',
            type: {
              name: 'object',
              of: {
                type: {
                  name: 'array',
                  of: {
                    type: {
                      name: 'string'
                    },
                    default: '',
                    required: true
                  }
                },
                required: true
              }
            },
            description: 'Set of values that will be sent on each request to the `Token URL`. Each param key can have multiple values. Can be set for all providers except `Google`.',
            required: false,
            group: 'Authentication - OAuth2'
          },
          {
            name: 'auth.oauth2.token_url',
            label: 'Token URL',
            type: {
              name: 'string'
            },
            description: `The endpoint that will be used to generate the tokens during the OAuth2 flow. It is required if no provider is specified.
> NOTE
> For \`Azure\` provider either \`Token URL\` or Azure \`Tenant ID\` is required.`,
            default: '',
            required: false,
            group: 'Authentication - OAuth2'
          },
          {
            name: 'auth.oauth2.azure.tenant_id',
            label: 'Azure - Tenant ID',
            type: {
              name: 'string'
            },
            description: `Used for authentication when using \`Azure\` provider.
> NOTE
> Since it is used in the process to generate the \`Token URL\`, it can't be used in combination with it.

It is not required.

For information about where to find it, you can refer to
https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal.`,
            default: '',
            required: false,
            group: 'Authentication - OAuth2'
          },
          {
            name: 'auth.oauth2.azure.resource',
            label: 'Azure - WebAPI Resource',
            type: {
              name: 'string'
            },
            description: `The accessed WebAPI resource when using \`Azure\` provider.
It is not required.`,
            default: '',
            required: false,
            group: 'Authentication - OAuth2'
          },
          {
            name: 'auth.oauth2.google.credentials_file',
            label: 'Google - Credentials File',
            type: {
              name: 'string'
            },
            description: `The credentials file for \`Google\`.

> NOTE
> Only one of the credentials settings can be set at once. If none is provided, loading default credentials from the environment will be attempted via ADC. 

For more information about how to provide Google credentials, please refer to https://cloud.google.com/docs/authentication.`,
            default: '',
            required: false,
            group: 'Authentication - OAuth2'
          },
          {
            name: 'auth.oauth2.google.credentials_json',
            label: 'Google - JSON Credentials File',
            type: {
              name: 'string'
            },
            description: `Your credentials information as raw JSON.

> NOTE
> Only one of the credentials settings can be set at once. If none is provided, loading default credentials from the environment will be attempted via ADC.

For more information about how to provide Google credentials, please refer to https://cloud.google.com/docs/authentication.`,
            default: '',
            required: false,
            group: 'Authentication - OAuth2'
          },
          {
            name: 'auth.oauth2.google.jwt_file',
            label: 'Google - JWT Account Key File',
            type: {
              name: 'string'
            },
            description: `The JWT Account Key file for Google.

> NOTE
> Only one of the credentials settings can be set at once. If none is provided, loading default credentials from the environment will be attempted via ADC.

For more information about how to provide Google credentials, please refer to https://cloud.google.com/docs/authentication.`,
            default: '',
            required: false,
            group: 'Authentication - OAuth2'
          },

          // SSL Configuration

          {
            name: 'request.ssl.enabled',
            label: 'Enabled',
            type: {
              name: 'boolean'
            },
            default: false,
            description: 'Is Syslog SSL enabled?',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'request.ssl.certificate_authorities',
            label: 'SSL Certificate Authorities',
            type: {
              name: 'string'
            },
            default: '',
            description: 'Path to the file with the list of root certificates for client verifications is only required if `Client Authentication` is configured. If `Certificate Authorities` is empty or not set, and `Client Authentication` is configured, the system keystore is used. If `Certificate Authorities` is self-signed, the host system needs to trust that CA cert as well.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'request.ssl.certificate',
            label: 'SSL Certificate',
            type: {
              name: 'string'
            },
            default: '',
            description: 'For server authentication, the path to the SSL authentication certificate must be specified for TLS. If the certificate is not specified, startup will fail. When this option is configured, the key option is also required.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'request.ssl.key',
            label: 'SSL Key',
            type: {
              name: 'string'
            },
            default: '',
            description: 'The server certificate key used for authentication is required.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'request.ssl.key_passphrase',
            label: 'Pass phrase for SSL Key',
            type: {
              name: 'password'
            },
            default: '',
            description: 'The passphrase is used to decrypt an encrypted key stored in the configured key file.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'request.ssl.verification_mode',
            label: 'Verification Mode',
            type: {
              name: 'option'
            },
            options: [{ value: 'full', label: 'Full: Verifies that the provided certificate is signed by a trusted authority (CA) and also verifies that the server’s hostname (or IP address) matches the names identified within the certificate.' }, { value: 'strict', label: 'Strict: Verifies that the provided certificate is signed by a trusted authority (CA) and also verifies that the server’s hostname (or IP address) matches the names identified within the certificate.If the Subject Alternative Name is empty, it returns an error.' }, { value: 'certificate', label: 'Certificate: Verifies that the provided certificate is signed by a trusted authority (CA), but does not perform any hostname verification.' }, { value: 'none', label: 'None: Performs no verification of the server’s certificate.This mode disables many of the security benefits of SSL/ TLS and should only be used after cautious consideration.It is primarily intended as a temporary diagnostic mechanism when attempting to resolve TLS errors; its use in production environments is strongly discouraged.' }],
            default: 'full',
            description: 'Controls the verification of client certificates. The default value is `Full`.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'request.ssl.client_authentication',
            label: 'Client Authentication',
            type: {
              name: 'option'
            },
            options: [{ value: 'none', label: 'None: Disables client authentication.' }, { value: 'optional', label: 'Optional: When a client certificate is supplied, the server will verify it.' }, { value: 'required', label: 'Required: Will require clients to provide a valid certificate.' }],
            default: 'none',
            description: 'The type of client authentication mode. When `SSL Certificate Authorities` is set, it defaults to `Required`. Otherwise, it defaults to `None`.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'request.ssl.renegotiation',
            label: 'Renegotiation',
            type: {
              name: 'option'
            },
            options: [{ value: 'never', label: 'Never: Disables renegotiation.' }, { value: 'once', label: 'Once: Allows a remote server to request renegotiation once per connection.' }, { value: 'freely', label: 'Freely: Allows a remote server to request renegotiation repeatedly.' }],
            default: 'never',
            description: 'This configures what types of TLS renegotiation are supported. The default value is `Never`.',
            required: false,
            group: 'SSL Configuration'
          },
          {
            name: 'request.ssl.supported_protocols',
            label: 'Supported Protocols',
            type: {
              name: 'array',
              of: {
                type: {
                  name: 'string'
                },
                default: '',
                required: false
              }
            },
            description: 'List of allowed SSL/TLS versions. If SSL/TLS server decides for protocol versions not configured, the connection will be dropped during or after the handshake. The setting is a list of allowed protocol versions: SSLv3, TLSv1 for TLS version 1.0, TLSv1.0, TLSv1.1, TLSv1.2, and TLSv1.3. The default value is [TLSv1.1, TLSv1.2, TLSv1.3].',
            required: false,
            group: 'SSL Configuration'
          },

          // Advanced - Request Body

          {
            name: 'request.encode_as',
            label: 'Encoding',
            type: {
              name: 'option'
            },
            options: [
              { value: null, label: '** Not set ** <hr>' },
              { value: 'application/json', label: 'JSON (application/json)' },
              { value: 'application/x-www-form-urlencoded', label: 'Web Form URL Encoded (application/x-www-form-urlencoded)' }
            ],
            description: `ContentType used for encoding the request body. If set it will force the encoding in the specified format regardless of the \`Content- Type\` header value, otherwise it will honor it if possible or fallback to \`application / json\`.
By default the requests are sent with \`Content - Type: application / json\`.
> NOTE
> \`Web Form URL Encoded\` will url encode the \`url.params\` and set them as the body.`,
            default: null,
            required: false,
            group: 'Advanced - Request Body'
          },
          {
            name: 'request.body',
            label: 'Body Content',
            type: {
              name: 'string',
              multilines: true,
              textType: 'json'
            },
            description: `An optional HTTP POST body.
This is only valid when \`Request Method\` is \`POST\`. Defaults to \`null\` (no HTTP body).
::: danger
The configuration value must be a valid JSON object.
:::`,
            default: '',
            required: false,
            group: 'Advanced - Request Body'
          },

          // Advanced - Retries

          {
            name: 'request.retry.max_attempts',
            label: 'Request Maximum Retry Attempts',
            type: {
              name: 'number'
            },
            min: 1,
            max: 100,
            default: 5,
            description: 'The maximum number of retries for the HTTP client. The default is 5.',
            required: false,
            group: 'Advanced - Retries'
          },
          {
            name: 'request.retry.wait_min',
            label: 'Request Minimum Wait Before Retry',
            type: {
              name: 'number'
            },
            suffix: {
              options: [
                { value: 's', label: 'Seconds' },
                { value: 'm', label: 'Minutes' },
                { value: 'h', label: 'Hours' }
              ],
              default: 's'
            },
            min: 1,
            max: 60,
            default: '1s',
            description: 'The minimum time to wait before a retry is attempted. The default is 1 second.',
            required: false,
            group: 'Advanced - Retries'
          },
          {
            name: 'request.retry.wait_max',
            label: 'Request Maximum Wait Before Retry',
            type: {
              name: 'number'
            },
            suffix: {
              options: [
                { value: 's', label: 'Seconds' },
                { value: 'm', label: 'Minutes' },
                { value: 'h', label: 'Hours' }
              ],
              default: 's'
            },
            min: 1,
            max: 60,
            default: '60s',
            description: 'The maximum time to wait before a retry is attempted. The default is 60 seconds.',
            required: false,
            group: 'Advanced - Retries'
          },
          {
            name: 'request.redirect.forward_headers',
            label: 'Redirect Forward Headers',
            type: {
              name: 'boolean'
            },
            default: false,
            description: 'When set to `True` request headers are forwarded in case of a redirect. Default: `False`.',
            required: false,
            group: 'Advanced - Redirects'
          },
          {
            name: 'request.redirect.headers_ban_list',
            label: 'Redirect Forward Headers - Ban List',
            type: {
              name: 'array',
              of: {
                type: {
                  name: 'string'
                },
                default: '',
                required: false
              }
            },
            description: 'When `Redirect Forward Headers` is set to `True`, all headers __except__ the ones defined in this list will be forwarded.',
            required: false,
            group: 'Advanced - Redirects'
          },
          {
            name: 'request.redirect.max_redirects',
            label: 'Maximum Redirects',
            type: {
              name: 'number'
            },
            min: 0,
            max: 50,
            default: 10,
            description: 'The maximum number of redirects to follow for a request. The default is 10.',
            required: false,
            group: 'Advanced - Redirects'
          },

          // Advanced - Rate Limit

          {
            name: 'request.rate_limit.limit',
            label: 'Total Requests Limit',
            type: {
              name: 'string'
            },
            default: '',
            description: `The value of the response that specifies the total limit. It is defined with a Go template value.
> NOTE
> Can read state from: [.last_response.header]

::: tip Examples
- 1500
- \`[[.last_response.header.X-RateLimit-Limit]]\`
:::
`,
            required: false,
            group: 'Advanced - Rate Limit'
          },
          {
            name: 'request.rate_limit.remaining',
            label: 'Remaining Requests',
            type: {
              name: 'string'
            },
            default: '',
            description: `The value of the response that specifies the remaining quota of the rate limit. It is defined with a Go template value.
> NOTE
> Can read state from: [.last_response.header]

::: tip Example
\`[[.last_response.header.X-RateLimit-Remaining]]\`
:::
`,
            required: false,
            group: 'Advanced - Rate Limit'
          },
          {
            name: 'request.rate_limit.reset',
            label: 'Reset Time',
            type: {
              name: 'string'
            },
            default: '',
            description: `The value of the response that specifies the epoch time when the rate limit will reset. It is defined with a Go template value.
> NOTE
> Can read state from: [.last_response.header]

::: tip Example
\`[[.last_response.header.X-RateLimit-Reset]]\`
:::
`,
            required: false,
            group: 'Advanced - Rate Limit'
          },

          // Advanced - Request Transforms

          {
            name: 'request.transforms',
            label: 'Transforms List',
            type: {
              name: 'object',
              of: {
                type: {
                  name: 'string'
                },
                prefix: {
                  options: [
                    { value: '___set___👉', label: 'Set to' },
                    { value: '___append___👉', label: 'Append' },
                    { value: '___delete___👉', label: 'Delete' }
                  ],
                  default: '___set___👉'
                },
                suffix: {
                  options: [
                    { value: '👈___default___🚫', label: 'No Default' },
                    { value: '👈___default___', label: 'Empty string' },
                    { value: '👈___default___0', label: '0' },
                    { value: '👈___default___[[now]]', label: '[[now]]' },
                    { value: '👈___default___[[now (parseDuration "-1m")]]', label: '[[now (parseDuration "-1m")]]' },
                    { value: '👈___default___[[now (parseDuration "-5m")]]', label: '[[now (parseDuration "-5m")]]' },
                    { value: '👈___default___[[now (parseDuration "-10m")]]', label: '[[now (parseDuration "-10m")]]' },
                    { value: '👈___default___[[now (parseDuration "-15m")]]', label: '[[now (parseDuration "-15m")]]' },
                    { value: '👈___default___[[now (parseDuration "-30m")]]', label: '[[now (parseDuration "-30m")]]' },
                    { value: '👈___default___[[now (parseDuration "-45m")]]', label: '[[now (parseDuration "-45m")]]' },
                    { value: '👈___default___[[now (parseDuration "-1h")]]', label: '[[now (parseDuration "-1h")]]' },
                    { value: '👈___default___[[now (parseDuration "-2h")]]', label: '[[now (parseDuration "-2h")]]' },
                    { value: '👈___default___[[now (parseDuration "-3h")]]', label: '[[now (parseDuration "-3h")]]' },
                    { value: '👈___default___[[now (parseDuration "-5h")]]', label: '[[now (parseDuration "-5h")]]' },
                    { value: '👈___default___[[now (parseDuration "-6h")]]', label: '[[now (parseDuration "-6h")]]' },
                    { value: '👈___default___[[now (parseDuration "-12h")]]', label: '[[now (parseDuration "-12h")]]' },
                    { value: '👈___default___[[now (parseDuration "-24h")]]', label: '[[now (parseDuration "-24h")]]' },
                    { value: '👈___default___[[now (parseDuration "-36h")]]', label: '[[now (parseDuration "-36h")]]' },
                    { value: '👈___default___[[now (parseDuration "-48h")]]', label: '[[now (parseDuration "-48h")]]' },
                    { value: '👈___default___[[now (parseDuration "-72h")]]', label: '[[now (parseDuration "-72h")]]' }
                  ],
                  default: '👈___default___🚫'
                },
                default: '',
                required: true
              },
              required: true
            },
            description: `List of transforms to apply to the __request__ before each execution.

Available transforms for request: \`Append\`, \`Delete\` and \`Set\`.

> NOTE
> Can __read__ state from:
> - \`.last_response.* \`
> - \`.last_event.* \`
> - \`.cursor.* \`]
>
> Can __write__ state to:
> - \`header.* \`
> - \`url.params.* \`
> - \`body.*\`

::: tip Examples

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
|  body.from  | __Set to__ | \`[[now (parseDuration "-1h")]]\` | __[[now]]__ |
|  body.variable_abc  | __Set to__ | \`AUTO\` |  |
|  header.variable_xyz  | __Set to__ | \`[[.last_response.header.X-Var-XYZ]]\` | __0__ |
|  body.my_array_of_names  | __Append__ | \`Bill\` |  |
|  body.my_array_of_names  | __Append__ | \`Bob\` |  |
|  body.useless_token  | __Delete__ |  |  |
:::

::: tip Creating an array of values

Use __Append__, and use it several times with the same Target name.
For example, to create and \`event_types\` array in the \`body\` with the following 4 values:
- \`Auth Failure\`
- \`Auth Success\`
- \`Remote Connection\`
- \`User Created\`

Add these entries:

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
|  body.event_types  | __Append__ | \`Auth Failure\` |  |
|  body.event_types  | __Append__ | \`Auth Success\` |  |
|  body.event_types  | __Append__ | \`Remote Connection\` |  |
|  body.event_types  | __Append__ | \`User Created\` |  |
:::
`,
            required: false,
            group: 'Advanced - Request Transforms'
          },

          // Advanced - Response Transforms

          {
            name: 'response.transforms',
            label: 'Transforms List',
            type: {
              name: 'object',
              of: {
                type: {
                  name: 'string'
                },
                prefix: {
                  options: [
                    { value: '___set___👉', label: 'Set to' },
                    { value: '___append___👉', label: 'Append' },
                    { value: '___delete___👉', label: 'Delete' }
                  ],
                  default: '___set___👉'
                },
                suffix: {
                  options: [
                    { value: '👈___default___🚫', label: 'No Default' },
                    { value: '👈___default___', label: 'Empty string' },
                    { value: '👈___default___0', label: '0' },
                    { value: '👈___default___[[now]]', label: '[[now]]' },
                    { value: '👈___default___[[now (parseDuration "-1m")]]', label: '[[now (parseDuration "-1m")]]' },
                    { value: '👈___default___[[now (parseDuration "-5m")]]', label: '[[now (parseDuration "-5m")]]' },
                    { value: '👈___default___[[now (parseDuration "-10m")]]', label: '[[now (parseDuration "-10m")]]' },
                    { value: '👈___default___[[now (parseDuration "-15m")]]', label: '[[now (parseDuration "-15m")]]' },
                    { value: '👈___default___[[now (parseDuration "-30m")]]', label: '[[now (parseDuration "-30m")]]' },
                    { value: '👈___default___[[now (parseDuration "-45m")]]', label: '[[now (parseDuration "-45m")]]' },
                    { value: '👈___default___[[now (parseDuration "-1h")]]', label: '[[now (parseDuration "-1h")]]' },
                    { value: '👈___default___[[now (parseDuration "-2h")]]', label: '[[now (parseDuration "-2h")]]' },
                    { value: '👈___default___[[now (parseDuration "-3h")]]', label: '[[now (parseDuration "-3h")]]' },
                    { value: '👈___default___[[now (parseDuration "-5h")]]', label: '[[now (parseDuration "-5h")]]' },
                    { value: '👈___default___[[now (parseDuration "-6h")]]', label: '[[now (parseDuration "-6h")]]' },
                    { value: '👈___default___[[now (parseDuration "-12h")]]', label: '[[now (parseDuration "-12h")]]' },
                    { value: '👈___default___[[now (parseDuration "-24h")]]', label: '[[now (parseDuration "-24h")]]' },
                    { value: '👈___default___[[now (parseDuration "-36h")]]', label: '[[now (parseDuration "-36h")]]' },
                    { value: '👈___default___[[now (parseDuration "-48h")]]', label: '[[now (parseDuration "-48h")]]' },
                    { value: '👈___default___[[now (parseDuration "-72h")]]', label: '[[now (parseDuration "-72h")]]' }
                  ],
                  default: '👈___default___🚫'
                },
                default: '',
                required: true
              },
              required: true
            },
            description: `List of transforms to apply to the __response__ once it is received.

Available transforms for response: \`Append\`, \`Delete\` and \`Set\`.

> NOTE
> Can __read__ state from:
> - \`.last_response.* \`
> - \`.last_event.* \`
> - \`.cursor.* \`]
> - \`.header.* \`]
> - \`.url.* \`]
>
> Can __write__ state to:
> - \`body.*\`

::: tip Examples

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
|  body.very_confidential  | __Delete__ |  |  |
|  body.from_url  | __Set to__ | \`[[.url.value]]\` | __Empty string__ |
|  body.variable_abc  | __Set to__ | \`Static ABC value\` |  |
|  body.variable_xyz  | __Set to__ | \`[[.last_response.header.X-Var-XYZ]]\` |
|  body.my_array_of_name  | __Append__ | \`Bill\` |  |
|  body.my_array_of_name  | __Append__ | \`Bob\` |  |
:::

::: tip Creating an array of values
Use __Append__, and use it several times with the same Target name.
For example, to create and \`event_types\` array with the following 4 values:
- \`Auth Failure\`
- \`Auth Success\`
- \`Remote Connection\`
- \`User Created\`

Add these entries:

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
 __[[now]]__ |  |
|  body.event_types  | __Append__ | \`Auth Failure\` |  |
|  body.event_types  | __Append__ | \`Auth Success\` |  |
|  body.event_types  | __Append__ | \`Remote Connection\` |  |
|  body.event_types  | __Append__ | \`User Created\` |  |

If the array or entry might already exist in the response, some use case might require for it to be deleted first.
Like so:

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
 __[[now]]__ |  |
|  body.event_types  | __Delete__ |  |  |
|  body.event_types  | __Append__ | \`Auth Failure\` |  |
|  body.event_types  | __Append__ | \`Auth Success\` |  |
|  body.event_types  | __Append__ | \`Remote Connection\` |  |
|  body.event_types  | __Append__ | \`User Created\` |  |
:::

`,
            required: false,
            group: 'Advanced - Response Transforms'
          },

          // Advanced - Response Splits

          // I decided NOT to implement this one, as it was too complicated
          // (it would have required to develop new widgets / logic to deal with it)
          // and a duplicate of the Fan Out option of the Open Collector

          // {
          //   name: 'response.split',
          //   label: 'Splits List',
          //   type: {
          //     name: 'object',
          //     of: {
          //       type: {
          //         name: 'object',
          //         of: {
          //           type: {
          //             name: 'string'
          //           },
          //           prefix: {
          //             options: [
          //               { value: '___set___👉', label: 'Set to' },
          //               { value: '___append___👉', label: 'Append' },
          //               { value: '___delete___👉', label: 'Delete' }
          //             ],
          //             default: '___set___👉'
          //           },
          //           default: '',
          //           required: true
          //         },
          //         required: true
          //       },
          //       prefix: {
          //         options: [
          //           { value: '___array___👉', label: 'Array' },
          //           { value: '___map___👉', label: 'Map' },
          //           { value: '___string___👉', label: 'String' }
          //         ],
          //         default: '___array___👉'
          //       }
          //     }
          //   },
          //   description: '',
          //   required: true,
          //   group: 'Advanced - Splits'
          // },

          {
            name: 'response.split',
            label: 'Splits List',
            type: {
              name: 'not implemented'
            },
            default: '** NOT IMPLEMENTED **',
            description: `::: danger
__NOT IMPLEMENTED__
:::

The __split__ feature of Filebeat is a duplicate of the __Fan Out__ feature of the Open Collector.
As such, it is not necessary to implement it here.

::: tip
While building the __Field Mapping__, under __Modifier__ select: __Fan Out__.
:::`,
            required: false,
            readonly: true,
            group: 'Advanced - Splits'
          },

          // Advanced - Response Pagination Transforms

          {
            name: 'response.pagination',
            label: 'Transforms List',
            type: {
              name: 'object',
              of: {
                type: {
                  name: 'string'
                },
                prefix: {
                  options: [
                    { value: '___set___👉', label: 'Set to' },
                    { value: '___append___👉', label: 'Append' },
                    { value: '___delete___👉', label: 'Delete' }
                  ],
                  default: '___set___👉'
                },
                suffix: {
                  options: [
                    { value: '👈___default___🚫', label: 'No Default' },
                    { value: '👈___default___', label: 'Empty string' },
                    { value: '👈___default___0', label: '0' },
                    { value: '👈___default___[[now]]', label: '[[now]]' },
                    { value: '👈___default___[[now (parseDuration "-1m")]]', label: '[[now (parseDuration "-1m")]]' },
                    { value: '👈___default___[[now (parseDuration "-5m")]]', label: '[[now (parseDuration "-5m")]]' },
                    { value: '👈___default___[[now (parseDuration "-10m")]]', label: '[[now (parseDuration "-10m")]]' },
                    { value: '👈___default___[[now (parseDuration "-15m")]]', label: '[[now (parseDuration "-15m")]]' },
                    { value: '👈___default___[[now (parseDuration "-30m")]]', label: '[[now (parseDuration "-30m")]]' },
                    { value: '👈___default___[[now (parseDuration "-45m")]]', label: '[[now (parseDuration "-45m")]]' },
                    { value: '👈___default___[[now (parseDuration "-1h")]]', label: '[[now (parseDuration "-1h")]]' },
                    { value: '👈___default___[[now (parseDuration "-2h")]]', label: '[[now (parseDuration "-2h")]]' },
                    { value: '👈___default___[[now (parseDuration "-3h")]]', label: '[[now (parseDuration "-3h")]]' },
                    { value: '👈___default___[[now (parseDuration "-5h")]]', label: '[[now (parseDuration "-5h")]]' },
                    { value: '👈___default___[[now (parseDuration "-6h")]]', label: '[[now (parseDuration "-6h")]]' },
                    { value: '👈___default___[[now (parseDuration "-12h")]]', label: '[[now (parseDuration "-12h")]]' },
                    { value: '👈___default___[[now (parseDuration "-24h")]]', label: '[[now (parseDuration "-24h")]]' },
                    { value: '👈___default___[[now (parseDuration "-36h")]]', label: '[[now (parseDuration "-36h")]]' },
                    { value: '👈___default___[[now (parseDuration "-48h")]]', label: '[[now (parseDuration "-48h")]]' },
                    { value: '👈___default___[[now (parseDuration "-72h")]]', label: '[[now (parseDuration "-72h")]]' }
                  ],
                  default: '👈___default___🚫'
                },
                default: '',
                required: true
              },
              required: true
            },
            description: `List of transforms that will be applied to the __response__ to every new page request. All the transforms from \`Request Transforms\` will be executed and then \`Response Pagination Transforms\` will be added to modify the next request as needed. For subsequent responses, the usual \`Response Transforms\` and \`Response Split\` will be executed normally.

Available transforms for response: \`Append\`, \`Delete\` and \`Set\`.

> NOTE
> Can __read__ state from:
> - \`.last_response.* \`
> - \`.first_event.* \`
> - \`.last_event.* \`
> - \`.cursor.* \`]
>
> Can __write__ state to:
> - \`body.*\`
> - \`.header.* \`]
> - \`.url.* \`]

::: tip Examples

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
|  url.value  | __Set to__ | \`http://localhost:9200/_search/scroll\` |  |
|  url.params.scroll_id  | __Set to__ | \`[[.last_response.body._scroll_id]]\` | __0__ |
|  body.scroll  | __Set to__ | \`5m\` |  |
:::

::: tip Creating an array of values
Use __Append__, and use it several times with the same Target name.
For example, to create and \`event_types\` array with the following 4 values:
- \`Auth Failure\`
- \`Auth Success\`
- \`Remote Connection\`
- \`User Created\`

Add these entries:

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
|  body.event_types  | __Append__ | \`Auth Failure\` | |
|  body.event_types  | __Append__ | \`Auth Success\` | |
|  body.event_types  | __Append__ | \`Remote Connection\` | |
|  body.event_types  | __Append__ | \`User Created\` | |

If the array or entry might already exist in the response, some use case might require for it to be deleted first.
Like so:

| Target | Transform | Value | Default to |
| ------ |:---------:| ----- | ---------- |
|  body.event_types  | __Delete__ |  | |
|  body.event_types  | __Append__ | \`Auth Failure\` | |
|  body.event_types  | __Append__ | \`Auth Success\` | |
|  body.event_types  | __Append__ | \`Remote Connection\` | |
|  body.event_types  | __Append__ | \`User Created\` | |
:::

`,
            required: false,
            group: 'Advanced - Response Pagination Transforms'
          },

          {
            name: 'cursor',
            label: 'Cursors List',
            type: {
              name: 'object',
              of: {
                type: {
                  name: 'string'
                },
                default: '',
                required: true,
                suffix: {
                  options: [
                    { value: '👈___default___🚫', label: 'No Default' },
                    { value: '👈___default___', label: 'Empty string' },
                    { value: '👈___default___0', label: '0' },
                    { value: '👈___default___[[now]]', label: '[[now]]' },
                    { value: '👈___default___[[now (parseDuration "-1m")]]', label: '[[now (parseDuration "-1m")]]' },
                    { value: '👈___default___[[now (parseDuration "-5m")]]', label: '[[now (parseDuration "-5m")]]' },
                    { value: '👈___default___[[now (parseDuration "-10m")]]', label: '[[now (parseDuration "-10m")]]' },
                    { value: '👈___default___[[now (parseDuration "-15m")]]', label: '[[now (parseDuration "-15m")]]' },
                    { value: '👈___default___[[now (parseDuration "-30m")]]', label: '[[now (parseDuration "-30m")]]' },
                    { value: '👈___default___[[now (parseDuration "-45m")]]', label: '[[now (parseDuration "-45m")]]' },
                    { value: '👈___default___[[now (parseDuration "-1h")]]', label: '[[now (parseDuration "-1h")]]' },
                    { value: '👈___default___[[now (parseDuration "-2h")]]', label: '[[now (parseDuration "-2h")]]' },
                    { value: '👈___default___[[now (parseDuration "-3h")]]', label: '[[now (parseDuration "-3h")]]' },
                    { value: '👈___default___[[now (parseDuration "-5h")]]', label: '[[now (parseDuration "-5h")]]' },
                    { value: '👈___default___[[now (parseDuration "-6h")]]', label: '[[now (parseDuration "-6h")]]' },
                    { value: '👈___default___[[now (parseDuration "-12h")]]', label: '[[now (parseDuration "-12h")]]' },
                    { value: '👈___default___[[now (parseDuration "-24h")]]', label: '[[now (parseDuration "-24h")]]' },
                    { value: '👈___default___[[now (parseDuration "-36h")]]', label: '[[now (parseDuration "-36h")]]' },
                    { value: '👈___default___[[now (parseDuration "-48h")]]', label: '[[now (parseDuration "-48h")]]' },
                    { value: '👈___default___[[now (parseDuration "-72h")]]', label: '[[now (parseDuration "-72h")]]' }
                  ],
                  default: '👈___default___🚫'
                }
              }
            },
            description: `Cursor is a list of key value objects where arbitrary values are defined. 
The values are interpreted as [value templates](https://github.com/elastic/beats/blob/7.12/x-pack/filebeat/docs/inputs/input-httpjson.asciidoc#value-templates) and a default template can be set.
Cursor state is kept between input restarts and updated once all the events for a request are published.

> NOTE
> Default templates do not have access to any state, only to functions.
>
> Can __read__ state from:
> - \`.last_response.* \`
> - \`.first_event.* \`
> - \`.last_event.* \`
>
::: tip Examples

| Key | Value | Default to |
| --- | ----- | ---------- |
| last_requested_at | \`[[now]]\` | __Empty String__ |
| last_log_id | \`[[.last_event._id]]\` | __0__ |
:::
`,
            required: true,
            group: 'Advanced - Cursors'
          },

          // Advanced - Miscellaneous

          {
            name: 'request.timeout',
            label: 'Request Timeout',
            type: {
              name: 'number'
            },
            suffix: {
              options: [
                { value: 'ns', label: 'NanoSeconds' },
                { value: 'us', label: 'MicroSeconds' },
                { value: 'ms', label: 'MilliSeconds' },
                { value: 's', label: 'Seconds' },
                { value: 'm', label: 'Minutes' },
                { value: 'h', label: 'Hours' }
              ],
              default: 's'
            },
            min: 1,
            max: 1000,
            default: '30s',
            description: 'Duration before declaring that the HTTP client connection has timed out. The default is 30 seconds.',
            required: false,
            group: 'Advanced - Miscellaneous'
          },
          {
            name: 'config_version',
            label: 'Configuration version',
            type: {
              name: 'number'
            },
            min: 1,
            max: 2,
            description: `Defines the configuration version.
V1 configuration is deprecated and will be unsupported in future releases.
> Any new configuration should use \`Configuration version\` \`2\`.`,
            default: 2,
            required: true,
            group: 'Advanced - Miscellaneous'
          },

          // EZ Internal

          {
            name: 'enabled',
            label: 'Enabled',
            type: {
              name: 'boolean'
            },
            default: true,
            description: 'Is this Collection Method enabled?',
            required: true,
            readonly: true,
            group: 'EZ Internal'
          },
          {
            name: 'fields',
            label: 'Identification Fields',
            type: {
              name: 'object',
              of: {
                type: {
                  name: 'string'
                },
                default: '',
                description: '',
                required: true
              }
            },
            description: `In addition to \`stream_id\` and \`stream_name\` fields that are automatically added, and cannot be removed or changed, you can add optional fields that you can specify to add additional information to the output.
For example, you might add fields that you can use for filtering log data.
Fields can be scalar values, arrays, dictionaries, or any nested combination of these.
By default, the fields that you specify here will be grouped under a fields sub-dictionary in the output document.
To store the custom fields as top-level fields, set the \`fields_under_root option\` to true. If a duplicate field is declared in the general configuration, then its value will be overwritten by the value declared here.`,
            required: true,
            group: 'EZ Internal'
          }
        ] // definition
      } // httpjson
    ], // collectionMethodTemplates
    collectionMethodsOptions: [
      {
        value: 'log',
        label: 'Flat File',
        icon: 'description'
      },
      {
        value: 'httpjson',
        label: 'HTTP / REST API',
        icon: 'language'
      },
      {
        value: 'http_endpoint',
        label: 'HTTP / Web Hook Endpoint',
        icon: 'cloud_upload'
      },
      {
        value: 'syslog',
        label: 'Syslog',
        icon: 'input'
      }
    ] // collectionMethodsOptions
  }
}
/*
definition
- name
- type
-- array
--- of
-- object
--- of
-- boolean
-- string
-- number
-- regex
-- options
-- prefix
-- suffix // s, m, KiB, MiB
-- quotes // ' or " on nothing
-- default
-- min
-- max
- description
- required

[

  {
    name: '',
    type: {
      name: '', // array, object, boolean, string, number, regex, option
      of: { // for array and object
        type: {
          name: '', // array, object, boolean, string, number, regex, option
          multilines: false // for string and regex
          of: ...
        },
        options: [{ value: '', label: '' }, { value: '', label: '' }],
        prefix: {
          required: false,
          options: [{ value: '', label: '' }, { value: '', label: '' }],
          default: ''
        },
        suffix: {
          required: false,
          options: [{ value: '', label: '' }, { value: '', label: '' }], // s, m, KiB, MiB
          default: ''
        },
        quotes: {
          required: false,
          options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
          default: ''
        },
        default: '',
        min: null,
        max: null,
        description: '',
        required: false,
        readonly: true
      }
    },
    options: [{ value: '', label: '' }, { value: '', label: '' }],
    prefix: {
      required: false,
      options: [{ value: '', label: '' }, { value: '', label: '' }],
      default: ''
    },
    suffix: {
      required: false,
      options: [{ value: '', label: '' }, { value: '', label: '' }], // s, m, KiB, MiB
      default: ''
    },
    quotes: {
      required: false,
      options: [{ value: '\'', label: 'Single quote: \'' }, { value: '"', label: 'Double quote: "' }], // ' or " on nothing
      default: ''
    },
    default: '',
    min: null,
    max: null,
    description: '',
    required: false,
    readonly: true
  }
]

filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/*.log
  encoding: utf-8
  #   plain, utf-8, utf-16be-bom, utf-16be, utf-16le, big5, gb18030, gbk,
  #    hz-gb-2312, euc-kr, euc-jp, iso-2022-jp, shift-jis, ... http://www.w3.org/TR/encoding
  #include_lines: ['^ERR', '^WARN']
  #exclude_lines: ['^DBG']
  #exclude_files: ['.gz$']
  fields:
  #  level: debug
  #  review: 1
  ignore_older: 0
  #ignore_older: 5m
  #ignore_older: 24h
  scan_frequency: 10s
  #max_bytes: 10485760
  file_identity: inode_deviceid
  #file_identity: path
  #file_identity: inode_marker
*/
