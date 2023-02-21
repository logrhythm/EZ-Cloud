(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[9],{aaae:function(t,o,e){},c396:function(t,o,e){"use strict";e.r(o);var i=function(){var t=this,o=t._self._c;return o("q-page",{staticClass:"q-pa-sm"},[o("q-header",{class:t.darkMode?"":"bg-grey-1",style:t.darkMode?"background: var(--q-color-dark);":"",attrs:{bordered:""}},[o("q-toolbar",{staticClass:"q-gutter-x-sm",class:t.darkMode?"":"text-black"},[o("img",{staticClass:"q-mr-md",attrs:{src:t.darkMode?"logrhythm_logo_darkmode_wide.svg":"logrhythm_logo_lightmode_wide.svg",alt:"LogRhythm Open Collector"}}),t.isLiveStatisticsRunning?o("q-btn",{attrs:{flat:"","no-caps":"",color:"secondary",icon:"stop",label:t.$t("Stop Live Statistics")},on:{click:function(o){return t.stopLiveStatisitics()}}}):o("q-btn",{attrs:{flat:"","no-caps":"",color:"primary",icon:"play_circle_outline",label:t.$t("Start Live Statistics")},on:{click:function(o){return t.startLiveStatisitics()}}})],1)],1),o("BreadCrumbs",{attrs:{crumbs:t.breadCrumbs,pageTitle:t.openCollector&&t.openCollector.name&&t.openCollector.name.length?t.openCollector.name:"..."}}),o("div",{staticClass:"q-gutter-y-sm"},[o("q-card",[o("q-card-section",{attrs:{horizontal:""}},[o("q-card-section",{staticClass:"col q-ma-none q-pa-none"},[o("q-card-section",[o("q-expansion-item",{scopedSlots:t._u([{key:"header",fn:function(){return[o("div",{staticClass:"text-overline text-uppercase text-bold"},[t._v("\n                  "+t._s(t.$t("Basic Information"))+"\n                ")])]},proxy:!0}])},[o("div",{staticClass:"q-gutter-y-sm"},[o("div",[o("div",{staticClass:"text-bold"},[t._v("\n                    "+t._s(t.$t("Host Name"))+"\n                  ")]),o("div",[t._v("\n                    "+t._s(t.openCollector?t.openCollector.hostname:"...")+"\n                  ")])]),o("div",[o("div",{staticClass:"text-bold"},[t._v("\n                    "+t._s(t.$t("Host Version"))+"\n                  ")]),o("div",[t._v("\n                    "+t._s(t.$t("Linux - {osVersion}",{osVersion:t.openCollector?t.openCollector.osVersion:"..."}))+"\n                  ")]),o("div",[t._v("\n                    "+t._s(t.$t("Docker - {dockerVersion}",{dockerVersion:t.openCollector?t.openCollector.dockerVersion:"..."}))+"\n                  ")])]),o("div",[o("div",{staticClass:"text-bold"},[t._v("\n                    "+t._s(t.$t("OpenCollector Version"))+"\n                  ")]),o("div",[t._v("\n                    "+t._s(t.openCollector?t.openCollector.ocVersion:"...")+"\n                  ")]),o("div")])])])],1)],1)],1)],1),o("q-table",{attrs:{data:t.tableData,columns:t.columns,"row-key":"uid",dense:"","no-data-label":t.$t("No Container to display."),filter:t.searchFilter,loading:t.dataLoading,"rows-per-page-label":t.$t("Containers per page:"),pagination:t.pagination},on:{"update:pagination":function(o){t.pagination=o}},scopedSlots:t._u([{key:"top",fn:function(){return[o("div",{staticClass:"full-width row wrap justify-between"},[o("div",{staticClass:"col row justify-start"},[o("q-slider",{staticClass:"full-width q-px-xl",class:t.liveStatisticsStageSliderVisibilityStateClass,attrs:{dense:"","track-size":"12px","thumb-size":"20px","marker-labels-class":"text-grey",markers:"","marker-labels":t.stageMarkerLabels,"label-always":t.liveStatisticsStage>0&&t.liveStatisticsStage<3,"label-value":t.stageLabels[t.liveStatisticsStage],min:0,max:3,readonly:""},model:{value:t.liveStatisticsStage,callback:function(o){t.liveStatisticsStage=o},expression:"liveStatisticsStage"}})],1),o("div",{staticClass:"row q-gutter-md"},[o("div",{staticStyle:{width:"300px"}},[o("q-input",{attrs:{outlined:"",dense:"",debounce:"300",placeholder:t.$t("Search")},scopedSlots:t._u([{key:"append",fn:function(){return[t.searchFilter.length?o("q-btn",{attrs:{dense:"",flat:"",icon:"close"},on:{click:function(o){t.searchFilter=""}}}):t._e(),o("q-icon",{attrs:{name:"o_search"}})]},proxy:!0}]),model:{value:t.searchFilter,callback:function(o){t.searchFilter=o},expression:"searchFilter"}})],1)])])]},proxy:!0},{key:"body-cell-actions",fn:function(e){return[o("q-td",{attrs:{props:e}},[o("q-btn",{attrs:{flat:"",dense:"",icon:"more_horiz"}},[o("q-menu",[o("q-list",{staticStyle:{"min-width":"100px"}},[o("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:"",disable:e.row&&e.row.pids&&0!==e.row.pids.instant||!!e.row.actionInProgress},on:{click:function(o){return t.doStartContainer(e.row)}}},[o("q-item-section",{attrs:{avatar:""}},[o("q-icon",{attrs:{name:"o_play_arrow"}})],1),o("q-item-section",[t._v(t._s(t.$t("Start Container")))])],1),o("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:"",disable:!!e.row.actionInProgress},on:{click:function(o){return t.doStopContainer(e.row)}}},[o("q-item-section",{attrs:{avatar:""}},[o("q-icon",{attrs:{name:"o_stop"}})],1),o("q-item-section",[t._v(t._s(t.$t("Stop Container")))])],1),o("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:"",disable:!(e.row&&e.row.pids&&0!==e.row.pids.instant)||!!e.row.actionInProgress},on:{click:function(o){return t.doRestartContainer(e.row)}}},[o("q-item-section",{attrs:{avatar:""}},[o("q-icon",{attrs:{name:"o_restart_alt"}})],1),o("q-item-section",[t._v(t._s(t.$t("Restart Container")))])],1),o("q-separator"),o("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:"",disable:!(e.row&&e.row.logRhythmContainerWithConfig)},on:{click:function(o){return t.doExportContainerConfigurationToFile(e.row)}}},[o("q-item-section",{attrs:{avatar:""}},[o("q-icon",{attrs:{name:"o_file_download"}})],1),o("q-item-section",[t._v(t._s(t.$t("Export Configuration to File")))])],1),o("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:"",disable:!(e.row&&e.row.logRhythmContainerWithConfig)},on:{click:function(o){return t.doImportContainerConfigurationFromFile(e.row)}}},[o("q-item-section",{attrs:{avatar:""}},[o("q-icon",{attrs:{name:"o_file_upload"}})],1),o("q-item-section",[t._v(t._s(t.$t("Import Configuration from File")))])],1),o("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:"",disable:!(e.row&&e.row.logRhythmContainerWithConfig)},on:{click:function(o){return t.doViewContainerConfguration(e.row)}}},[o("q-item-section",{attrs:{avatar:""}},[o("q-icon",{attrs:{name:"o_source"}})],1),o("q-item-section",[t._v(t._s(t.$t("View Short Configuration")))])],1),o("q-separator"),o("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:""},on:{click:function(o){return t.doExportContainerLogsToFile(e.row)}}},[o("q-item-section",{attrs:{avatar:""}},[o("q-icon",{attrs:{name:"o_file_download"}})],1),o("q-item-section",[t._v(t._s(t.$t("Export Logs to File")))])],1),o("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:""},on:{click:function(o){return t.doViewRealTimeContainerLogs(e.row)}}},[o("q-item-section",{attrs:{avatar:""}},[o("q-icon",{attrs:{name:"o_text_snippet"}})],1),o("q-item-section",[t._v(t._s(t.$t("View Real Time Logs")))])],1)],1)],1)],1),o("q-btn",{attrs:{flat:"",dense:"",icon:e.row&&e.row.pids&&0!==e.row.pids.instant?"o_stop":"o_play_arrow",loading:!!e.row.actionInProgress},on:{click:function(o){return t.doStartStopContainer(e.row)}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[t._v("\n              "+t._s(t.$t(e.row&&e.row.pids&&0!==e.row.pids.instant?"Stop Container":"Start Container"))+"\n            ")])],1)],1)]}},{key:"body-cell-status",fn:function(e){return[o("q-td",{attrs:{props:e}},[!0===e.value?o("q-badge",{attrs:{rounded:"",color:"green",label:t.$t("Running")}}):!1===e.value?o("q-badge",{attrs:{rounded:"",color:"red",label:t.$t("Stopped")}}):o("q-badge",{attrs:{rounded:"",color:"grey",label:t.$t("Unknown")}})],1)]}}])})],1),o("q-dialog",{attrs:{persistent:"","full-width":"",maximized:t.showContainerLogMaximised},model:{value:t.showContainerLog,callback:function(o){t.showContainerLog=o},expression:"showContainerLog"}},[o("q-card",{staticClass:"column"},[o("q-card-section",{staticClass:"row justify-between q-pb-none"},[o("div",{staticClass:"text-h6 col-auto"},[t._v(t._s(t.$t("Container Logs")))]),o("q-slider",{staticClass:"col q-px-xl",class:t.liveContainerLogsStageSliderVisibilityStateClass,attrs:{dense:"","track-size":"12px","thumb-size":"20px","marker-labels-class":"text-grey",markers:"","marker-labels":t.stageMarkerLabels,"label-always":t.liveContainerLogsStage>0&&t.liveContainerLogsStage<3,"label-value":t.stageLabels[t.liveContainerLogsStage],min:0,max:3,readonly:"","switch-label-side":"","switch-marker-labels-side":""},model:{value:t.liveContainerLogsStage,callback:function(o){t.liveContainerLogsStage=o},expression:"liveContainerLogsStage"}}),o("div",{staticClass:"col-auto q-gutter-x-sm"},[o("q-btn",{attrs:{dense:"",flat:"",icon:"close",color:"grey-5"},on:{click:function(o){return t.closeRealTimeContainerLogs()}}})],1)],1),o("q-separator"),o("q-card-section",{staticClass:"col self-stretch",staticStyle:{height:"300px"}},[o("q-input",{ref:"containerLogsField",staticClass:"fixed-font full-height",attrs:{type:"textarea",outlined:"",readonly:"","input-class":"fixed-font-console",rows:"25"},scopedSlots:t._u([{key:"after",fn:function(){return[o("div",{staticClass:"column full-height"},[o("div",{staticClass:"column q-gutter-y-lg"},[o("q-btn",{attrs:{round:"",dense:"",flat:"",icon:"content_copy",disable:!t.containerLogs||t.containerLogs&&0===t.containerLogs.length},on:{click:function(o){return t.copyToClipboard(t.containerLogs)}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem; min-width: 10rem;"}},[t._v("\n                    "+t._s(t.$t("Copy to Clipboad"))+"\n                  ")])],1),o("q-btn",{attrs:{round:"",dense:"",flat:"",icon:"o_download",disable:!t.containerLogs||t.containerLogs&&0===t.containerLogs.length},on:{click:function(o){return t.downloadContainerLogsAsFileFromLiveLogs(t.containerLogs)}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem; min-width: 10rem;"}},[t._v("\n                    "+t._s(t.$t("Download to file"))+"\n                  ")])],1),o("q-separator"),o("q-btn",{attrs:{round:"",dense:"",flat:"",icon:"clear",color:"red",disable:!t.containerLogs||t.containerLogs&&0===t.containerLogs.length},on:{click:function(o){return t.clearContainerLog()}}},[t.containerLogs&&t.containerLogs.length?o("q-tooltip",{attrs:{"content-style":"font-size: 1rem; min-width: 10rem;"}},[t._v("\n                    "+t._s(t.$t("Clear"))+"\n                  ")]):t._e()],1)],1)])]},proxy:!0}]),model:{value:t.containerLogs,callback:function(o){t.containerLogs=o},expression:"containerLogs"}})],1)],1)],1),o("q-dialog",{attrs:{persistent:"","full-width":""},model:{value:t.showConfigurationViewer,callback:function(o){t.showConfigurationViewer=o},expression:"showConfigurationViewer"}},[o("q-card",{staticClass:"column"},[o("q-card-section",{staticClass:"row justify-between"},[o("div",{staticClass:"text-h6 col-auto"},[t._v(t._s(t.$t("Container Short Configuration")))]),o("div",{staticClass:"col-auto q-gutter-x-sm"},[o("q-btn",{attrs:{dense:"",flat:"",icon:"close",color:"grey-5"},on:{click:function(o){t.showConfigurationViewer=!1}}})],1)]),o("q-separator"),o("q-card-section",{staticClass:"col self-stretch",staticStyle:{height:"300px"}},[o("q-input",{staticClass:"fixed-font full-height",attrs:{type:"textarea",outlined:"",readonly:"","input-class":"fixed-font-console",rows:"25",loading:t.loadingConfigurationToView},scopedSlots:t._u([{key:"after",fn:function(){return[o("div",{staticClass:"column full-height"},[o("div",{staticClass:"column q-gutter-y-lg"},[o("q-btn",{attrs:{round:"",dense:"",flat:"",icon:"content_copy",disable:!t.configurationToView||t.configurationToView&&0===t.configurationToView.length},on:{click:function(o){return t.copyToClipboard(t.configurationToView)}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem; min-width: 10rem;"}},[t._v("\n                    "+t._s(t.$t("Copy to Clipboad"))+"\n                  ")])],1),o("q-btn",{attrs:{round:"",dense:"",flat:"",icon:"o_download",disable:!t.configurationToView||t.configurationToView&&0===t.configurationToView.length},on:{click:function(o){return t.downloadConfigurationToViewAsFileFromViewer(t.configurationToView)}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem; min-width: 10rem;"}},[t._v("\n                    "+t._s(t.$t("Download to file"))+"\n                  ")])],1)],1)])]},proxy:!0}]),model:{value:t.configurationToView,callback:function(o){t.configurationToView=o},expression:"configurationToView"}})],1)],1)],1)],1)},a=[],n=(e("14d9"),e("caad"),e("2f62")),s=e("a87d"),r=e("31c4"),l=e("9fa1"),c=e("f423"),d=e("f303"),p=e("cdde"),g=e("a357");const{height:h}=d["c"];var C={name:"PageOpenCollectorManage",mixins:[s["a"],r["a"],l["a"]],components:{BreadCrumbs:c["a"]},data(){return{openCollectorUid:"",isLiveStatisticsRunning:!1,containersListRaw:[],searchFilter:"",columns:[{name:"actions",align:"center",label:this.$t("Actions"),field:"actions",sortable:!1},{name:"status",align:"center",label:this.$t("Status"),field:t=>t.pids.instant>0,sortable:!0},{name:"name",align:"center",label:this.$t("Name"),field:"name",sortable:!0},{name:"cpuPercent",align:"center",label:this.$t("CPU"),field:"cpuPercent",sortable:!0},{name:"memUsage",align:"center",label:this.$t("Memory Usage / Limit"),field:t=>t.memUsage.instant,sortable:!0},{name:"memoryPercent",align:"center",label:this.$t("Memory Percentage"),field:"memoryPercent",sortable:!0},{name:"netIO",align:"center",label:this.$t("Net I/O"),field:t=>t.netIO.received.instant,sortable:!0},{name:"blockIO",align:"center",label:this.$t("Block I/O"),field:t=>t.blockIO.written.instant,sortable:!0},{name:"pids",align:"center",label:this.$t("Processes"),field:t=>t.pids.instant,sortable:!0},{name:"containerId",align:"center",label:this.$t("Container ID"),field:"containerId",sortable:!0}],pagination:{sortBy:"name",descending:!1,rowsPerPage:25},liveStatisticsStage:0,stageMarkerLabels:{0:"Idle",1:"Started",2:"Connected",3:"Receiving"},stageLabels:{0:"Stopped",1:"Connecting to host...",2:"Waiting for data...",3:"Receiving Real Time Data"},liveStatisticsStageSliderVisibilityStateClass:"",showContainerLog:!1,showContainerLogMaximised:!1,containerLogs:"",activeContainerIdLogs:"",activeContainerNameLogs:"",alwaysScrollToBottom:!0,liveContainerLogsStage:0,liveContainerLogsStageSliderVisibilityStateClass:"",actionInProgressOnContainers:[],loadingConfigurationToView:!1,configurationToView:"",showConfigurationViewer:!1,activeContainerIdConfig:"",activeContainerNameConfig:""}},computed:{...Object(n["d"])("mainStore",["logRhythmContainersWithConfig"]),breadCrumbs(){return[{icon:"o_home",link:"/Welcome"},{title:this.$t("OpenCollectors"),link:"/OpenCollectors"},{title:this.openCollector&&this.openCollector.name&&this.openCollector.name.length?this.openCollector.name:this.openCollectorUid},{title:this.$t("Manage")}]},openCollector(){const t=this.openCollectors.find((t=>t.uid===this.openCollectorUid));return t||{uid:"",name:"",hostname:"",port:null,authenticationMethod:"",username:"",password:"",privateKey:"",osVersion:"",dockerVersion:"",ocInstalled:!1,ocVersion:"",installedShippers:[],pipelines:[]}},tableData(){const t=[];return this.containersListRaw&&Array.isArray(this.containersListRaw)&&this.containersListRaw.forEach((o=>{t.push({containerId:o.Container,name:o.Name,cpuPercent:o.CPUPerc,memUsage:{instant:o.MemUsage,past:[]},memLimit:{instant:o.MemUsage,past:[]},memoryPercent:o.MemPerc,netIO:{received:{instant:o.NetIO,past:[]},sent:{instant:o.NetIO,past:[]}},blockIO:{written:{instant:o.BlockIO,past:[]},read:{instant:o.BlockIO,past:[]}},pids:{instant:Number(o.PIDs),past:[]},actionInProgress:!!this.actionInProgressOnContainers[String(o.Container)],logRhythmContainerWithConfig:!!this.logRhythmContainersWithConfig.filter((t=>String(o.Name).trim().startsWith(t))).length})})),t},containerLogsFieldInputStyle(){return{height:`${this.containerLogsFieldHeight()}px`,"-webkit-box-sizing":"border-box","-moz-box-sizing":"border-box","box-sizing":"border-box"}}},methods:{...Object(n["b"])("mainStore",["startContainerOnOpenCollector","stopContainerOnOpenCollector","getContainerLogs","getContainerConfiguration"]),containerLogsFieldHeight(){console.log("containerLogsFieldHeight"),console.log(JSON.stringify(this.$refs)),console.log(this.$refs);let t=0;try{console.log(h(this.$refs.containerLogsField.$el)),t=h(this.$refs.containerLogsField.$el)}catch(o){console.log("ERROR - containerLogsFieldHeight - ",o)}return t},startLiveStatisitics(){this.socket&&this.socket.connected?(this.isLiveStatisticsRunning=!0,this.initStatsTail()):(this.isLiveStatisticsRunning=!1,this.$root.$emit("addAndShowErrorToErrorPanel",{data:{errors:[{code:"NoLiveSocket",message:this.$t("Live (Socket) connection with the EZ Server has been lost or is not currently established.")},{code:"TailFailedToStart",message:this.$t("Tail could not start due to no live socket available.")}]}}))},stopLiveStatisitics(){this.isLiveStatisticsRunning=!1,this.socket&&this.socket.connected?this.killStatsTail():this.$root.$emit("addAndShowErrorToErrorPanel",{data:{errors:[{code:"NoLiveSocket",message:this.$t("Live (Socket) connection with the EZ Server has been lost or is not currently established.")},{code:"TailFailedToStart",message:this.$t("Tail could not start due to no live socket available.")}]}})},doStartStopContainer(t){t&&t.pids&&0!==t.pids.instant?this.doStopContainer(t):this.doStartContainer(t)},doStopContainer(t){if(t){const{containerId:o}=t;this.actionInProgressOnContainers[String(o)]=!0,this.stopContainerOnOpenCollector({caller:this,apiCallParams:{openCollector:{uid:this.openCollectorUid},container:{uid:o}},onSuccessCallBack:this.onContainerActionResponse,onErrorCallBack:this.onContainerActionResponse})}},doStartContainer(t){if(t){const{containerId:o}=t;this.actionInProgressOnContainers[String(o)]=!0,this.startContainerOnOpenCollector({caller:this,apiCallParams:{openCollector:{uid:this.openCollectorUid},container:{uid:o}},onSuccessCallBack:this.onContainerActionResponse,onErrorCallBack:this.onContainerActionResponse})}},doRestartContainer(t){if(t){const{containerId:o}=t;this.actionInProgressOnContainers[String(o)]=!0,this.stopContainerOnOpenCollector({caller:this,apiCallParams:{openCollector:{uid:this.openCollectorUid},container:{uid:o}},onSuccessCallBack:this.onContainerActionStopOfRestartSuccess,onErrorCallBack:this.onContainerActionResponse})}},doExportContainerConfigurationToFile(t){if(t){const{containerId:o}=t;this.getContainerConfiguration({caller:this,apiCallParams:{uid:this.openCollectorUid,containerId:o},onSuccessCallBack:this.onExportContainerConfigurationToFileSuccess})}},doImportContainerConfigurationFromFile(t){},doViewContainerConfguration(t){if(t){this.configurationToView="",this.showConfigurationViewer=!0;const{containerId:o,name:e}=t;this.activeContainerIdConfig=o,this.activeContainerNameConfig=e,this.getContainerConfiguration({caller:this,apiCallParams:{uid:this.openCollectorUid,containerId:o,short:""},loadingVariableName:"loadingConfigurationToView",targetObjectName:"configurationToView"})}},doExportContainerLogsToFile(t){if(t){const{containerId:o,name:e}=t;this.getContainerLogs({caller:this,apiCallParams:{uid:this.openCollectorUid,containerId:o,containerName:e},onSuccessCallBack:this.onExportContainerLogsToFileSuccess})}},doViewRealTimeContainerLogs(t){if(this.socket&&this.socket.connected){if(t){const{containerId:o}=t,{name:e}=t;o&&o.length?(this.activeContainerIdLogs=o,this.activeContainerNameLogs=e,this.clearContainerLog(),this.showContainerLog=!0,this.initContainerLogsTail(o)):(console.log("ERROR | ViewRealTimeContainerLogs | No Container was selected"),this.showNotificationWithActionToLogs("No Container was selected"))}}else this.showContainerLog=!1,this.$root.$emit("addAndShowErrorToErrorPanel",{data:{errors:[{code:"NoLiveSocket",message:this.$t("Live (Socket) connection with the EZ Server has been lost or is not currently established.")},{code:"TailFailedToStart",message:this.$t("Tail could not start due to no live socket available.")}]}})},closeRealTimeContainerLogs(){this.showContainerLog=!1,this.killContainerLogsTail(this.activeContainerIdLogs||""),this.activeContainerIdLogs="",this.activeContainerNameLogs=""},onContainerActionResponse(t){t&&t.params&&t.params.apiCallParams&&t.params.apiCallParams.container&&t.params.apiCallParams.container.uid&&t.params.apiCallParams.container.uid.length&&(this.actionInProgressOnContainers[String(t.params.apiCallParams.container.uid)]=!1)},onContainerActionStopOfRestartSuccess(t){t&&t.params&&t.params.apiCallParams&&t.params.apiCallParams.container&&t.params.apiCallParams.container.uid&&t.params.apiCallParams.container.uid.length&&this.doStartContainer({containerId:t.params.apiCallParams.container.uid})},onExportContainerLogsToFileSuccess(t){t&&t.data&&t.data.payload&&t.params&&t.params.apiCallParams&&t.params.apiCallParams.containerId&&t.params.apiCallParams.containerId.length&&t.params.apiCallParams.containerName&&t.params.apiCallParams.containerName.length&&this.downloadContainerLogsAsFile({container:{id:t.params.apiCallParams.containerId||"",name:t.params.apiCallParams.containerName||""},value:t.data.payload})},onExportContainerConfigurationToFileSuccess(t){t&&t.data&&t.data.payload&&t.data.outputs&&Array.isArray(t.data.outputs)&&t.data.outputs.length&&t.params&&t.params.apiCallParams&&t.params.apiCallParams.containerId&&t.params.apiCallParams.containerId.length&&this.downloadContainerConfigAsFile({container:{id:t.params.apiCallParams.containerId||"",name:t.data.outputs[0]||""},value:t.data.payload})},initStatsTail(){this.socket&&this.socket.connected&&this.socket.emit("statsTail.init",{openCollectorUid:this.openCollectorUid})},killStatsTail(){this.socket&&this.socket.connected&&this.socket.emit("statsTail.kill",{openCollectorUid:this.openCollectorUid})},initContainerLogsTail(t=""){this.socket&&this.socket.connected&&this.socket.emit("containerLogsTail.init",{openCollectorUid:this.openCollectorUid,containerId:t})},killContainerLogsTail(t=""){this.socket&&this.socket.connected&&this.socket.emit("containerLogsTail.kill",{openCollectorUid:this.openCollectorUid,containerId:t})},scrollToBottom(t){try{const o=this.$refs[t||"containerLogsField"].$refs.input;o.scrollTop=o.scrollHeight}catch(o){console.log("ERROR - scrollToBottom - ",o)}},handleSocketOnStatsTailLog(t){if(t&&t.openCollectorUid&&t.openCollectorUid===this.openCollectorUid){if("STDOUT"===t.code&&t.payload){const e=String(t.payload).replace(/^[^{]*/,"")||"";if(e.includes("{"))try{this.containersListRaw=JSON.parse(`[${e.split("\n").filter((t=>String(t).includes("{"))).join(",")}]`).filter((t=>"--"!==t.PIDs))}catch(o){console.log("ERROR",o)}}if("STDERR"===t.code&&("string"===typeof t.payload?t.payload.split("\n").forEach((o=>{this.addLineToCommunicationLog(`${t.code} | ${o||""}`)})):console.log(t.payload)),"STAGE"===t.code)if("string"===typeof t.payload){let e=null;try{e={Stopped:0,"Container Stats Tail Ended":0,"Container Stats Tail Started":1,"Connected to host":2,"Receiving Real Time Data":3}[t.payload]||0}catch(o){console.log("STAGE | Unknown Stage. Error:",o)}null!==e&&this.liveStatisticsStage!==e&&(this.liveStatisticsStage<e&&3===e?this.liveStatisticsStageSliderVisibilityStateClass="fadeOutOnce":this.liveStatisticsStage!==e&&"fadeOutOnce"===this.liveStatisticsStageSliderVisibilityStateClass&&(this.liveStatisticsStageSliderVisibilityStateClass="fadeInOnce"),this.liveStatisticsStage=e),this.liveStatisticsStage>0&&(this.isLiveStatisticsRunning=!0)}else console.log(t.payload);"ERROR"===t.code&&(this.addLineToCommunicationLog(`${t.code} | ${void 0!==t.payload?t.payload:""}`),this.showNotificationWithActionToLogs(`${t.code} | ${void 0!==t.payload?t.payload:""}`)),"END"===t.code&&(this.isLiveStatisticsRunning=!1,this.addLineToCommunicationLog(`${t.code} | Closing this Tail. | ${void 0!==t.payload?t.payload:"🏁"}`),this.showNotificationWithActionToLogs(`${t.code} | Closing this Tail. (${void 0!==t.payload?t.payload:"🏁"})`,"info")),"EXIT"===t.code&&(this.isLiveStatisticsRunning=!1,this.addLineToCommunicationLog(`${t.code} | Tailjob exited. | ${void 0!==t.payload?t.payload:"🏁"}`))}},handleSocketOnTailKill(t){t.code&&("STDOUT"===t.code||"STDERR"===t.code)&&t.payload&&t.openCollectorUid&&t.openCollectorUid===this.openCollectorUid&&this.addLineToCommunicationLog(`${t.code} | ${void 0!==t.payload?t.payload:""}`),t.code&&"ERROR"===t.code&&t.payload&&t.openCollectorUid&&t.openCollectorUid===this.openCollectorUid&&(this.addLineToCommunicationLog(`${t.code} | ${void 0!==t.payload?t.payload:""}`),console.error(t.payload),this.showNotificationWithActionToLogs(`${t.code} | ${void 0!==t.payload?t.payload:""}`,"info")),"END"===t.code&&t.openCollectorUid&&t.openCollectorUid===this.openCollectorUid&&(this.addLineToCommunicationLog(`${t.code} | ${this.$t("Post-Tail killing/cleaning job finished.")} | ${void 0!==t.payload?t.payload:"🏁"}`),this.showNotificationWithActionToLogs(`${t.code} | ${this.$t("Post-Tail killing/cleaning job finished.")} (${void 0!==t.payload?t.payload:"🏁"})`,"info")),"EXIT"===t.code&&t.openCollectorUid&&t.openCollectorUid===this.openCollectorUid&&this.addLineToCommunicationLog(`${t.code} | ${this.$t("Post-Tail killing/cleaning job exited.")} | ${void 0!==t.payload?t.payload:"🏁"}`)},handleSocketOnContainerTailLog(t){if(t&&t.openCollectorUid&&t.openCollectorUid===this.openCollectorUid){if("STDOUT"===t.code&&t.payload&&t.payload.split("\n").forEach((o=>{this.addLineToContainerLog(t.payload)})),"STDERR"===t.code&&("string"===typeof t.payload?t.payload.split("\n").forEach((o=>{this.addLineToContainerLog(t.payload)})):console.log(t.payload)),"STAGE"===t.code)if("string"===typeof t.payload){let e=null;try{e={Stopped:0,"Container Stats Tail Ended":0,"Container Stats Tail Started":1,"Connected to host":2,"Receiving Real Time Data":3}[t.payload]||0}catch(o){console.log("STAGE | Unknown Stage. Error:",o)}null!==e&&this.liveContainerLogsStage!==e&&(this.liveContainerLogsStage<e&&3===e?this.liveContainerLogsStageSliderVisibilityStateClass="fadeOutOnce":this.liveContainerLogsStage!==e&&"fadeOutOnce"===this.liveContainerLogsStageSliderVisibilityStateClass&&(this.liveContainerLogsStageSliderVisibilityStateClass="fadeInOnce"),this.liveContainerLogsStage=e)}else console.log(t.payload);"ERROR"===t.code&&(this.addLineToCommunicationLog(`${t.code} | ${void 0!==t.payload?t.payload:""}`),this.showNotificationWithActionToLogs(`${t.code} | ${void 0!==t.payload?t.payload:""}`)),"END"===t.code&&(this.isLiveStatisticsRunning=!1,this.addLineToCommunicationLog(`${t.code} | Closing this Tail. | ${void 0!==t.payload?t.payload:"🏁"}`),this.showNotificationWithActionToLogs(`${t.code} | Closing this Tail. (${void 0!==t.payload?t.payload:"🏁"})`,"info")),"EXIT"===t.code&&(this.isLiveStatisticsRunning=!1,this.addLineToCommunicationLog(`${t.code} | Tailjob exited. | ${void 0!==t.payload?t.payload:"🏁"}`))}},addLineToCommunicationLog(t){console.log(t)},addLineToContainerLog(t){if(void 0!==t){if("string"===typeof t)this.containerLogs+=t+(t.endsWith("\n")?"":"\n");else try{this.containerLogs+=`${JSON.stringify(t,null,"  ")}\n`}catch(o){}this.showContainerLog&&this.$nextTick(this.scrollToBottom)}},clearContainerLog(){this.containerLogs=""},showNotificationWithActionToLogs(t,o="negative"){this.$q.notify({message:t,type:o,progress:!0,timeout:"negative"===o?1e4:2500})},copyToClipboard(t){Object(p["a"])(t)},downloadContainerLogsAsFile({container:t,value:o}){const e=".log",i="text/plain",a="container."+String(t.name||"").replace(/[^-_a-zA-Z0-9]/g,"")+"_"+String(t.id||"").replace(/[^-_a-zA-Z0-9]/g,"")+e,n=this.$q.notify({icon:"cloud_download",message:this.$t("Downloading Container log as file..."),caption:a,type:"ongoing"}),s=Object(g["a"])(a,o||"",i);!0===s?n({type:"positive",color:"positive",icon:"check",message:this.$t("Container log as file downloaded"),caption:a}):(n({type:"negative",color:"negative",icon:"o_report_problem",message:this.$t("Problem while downloading Container logs:"),caption:s}),console.log("Error: "+s))},downloadContainerLogsAsFileFromLiveLogs(t){this.downloadContainerLogsAsFile({container:{id:this.activeContainerIdLogs||"",name:this.activeContainerNameLogs||""},value:t})},downloadContainerConfigAsFile({container:t,value:o,short:e}){const i=`.${!0===e?"short_":""}configuration.txt`,a="text/plain",n="container."+String(t.name||"").replace(/[^-_a-zA-Z0-9]/g,"")+"_"+String(t.id||"").replace(/[^-_a-zA-Z0-9]/g,"")+i,s=this.$q.notify({icon:"cloud_download",message:this.$t("Downloading Container configuration..."),caption:n,type:"ongoing"}),r=Object(g["a"])(n,o||"",a);!0===r?s({type:"positive",color:"positive",icon:"check",message:this.$t("Container configuration downloaded"),caption:n}):(s({type:"negative",color:"negative",icon:"o_report_problem",message:this.$t("Problem while downloading Container configuration:"),caption:r}),console.log("Error: "+r))},downloadConfigurationToViewAsFileFromViewer(t){this.downloadContainerConfigAsFile({container:{id:this.activeContainerIdConfig||"",name:this.activeContainerNameConfig||""},value:t,short:!0})}},mounted(){this.$route.params.openCollectorUid&&this.$route.params.openCollectorUid.length&&(this.openCollectorUid!==this.$route.params.openCollectorUid&&(this.openCollectorUid=this.$route.params.openCollectorUid),this.updateRecentItems(),this.socket.on("statsTail.log",this.handleSocketOnStatsTailLog),this.socket.on("statsTail.kill",this.handleSocketOnTailKill),this.openCollectorUid&&this.openCollectorUid.length&&this.socket&&!1===this.isLiveStatisticsRunning&&this.startLiveStatisitics(),this.socket.on("containerLogsTail.log",this.handleSocketOnContainerTailLog),this.socket.on("containerLogsTail.kill",this.handleSocketOnTailKill))},destroyed(){this.killStatsTail(),this.socket&&(this.socket.off("statsTail.log"),this.socket.off("statsTail.kill"),this.socket.off("containerLogsTail.log"),this.socket.off("containerLogsTail.kill"))}},m=C,u=(e("e181"),e("2877")),f=e("9989"),v=e("e359"),S=e("b498"),L=e("65c6"),w=e("9c40"),b=e("f09f"),y=e("a370"),k=e("3b73"),T=e("eaac"),$=e("c1d0"),q=e("27f9"),_=e("0016"),x=e("db86"),R=e("4e73"),I=e("1c1c"),O=e("66e5"),P=e("4074"),U=e("eb85"),V=e("05c0"),E=e("58a8"),N=e("24e8"),F=e("74f7"),A=e("cf57"),D=e("7f67"),Q=e("eebe"),z=e.n(Q),B=Object(u["a"])(m,i,a,!1,null,null,null);o["default"]=B.exports;z()(B,"components",{QPage:f["a"],QHeader:v["a"],QColor:S["a"],QToolbar:L["a"],QBtn:w["a"],QCard:b["a"],QCardSection:y["a"],QExpansionItem:k["a"],QTable:T["a"],QSlider:$["a"],QInput:q["a"],QIcon:_["a"],QTd:x["a"],QMenu:R["a"],QList:I["a"],QItem:O["a"],QItemSection:P["a"],QSeparator:U["a"],QTooltip:V["a"],QBadge:E["a"],QDialog:N["a"],QInnerLoading:F["a"],QSpinnerGears:A["a"]}),z()(B,"directives",{ClosePopup:D["a"]})},e181:function(t,o,e){"use strict";e("aaae")}}]);