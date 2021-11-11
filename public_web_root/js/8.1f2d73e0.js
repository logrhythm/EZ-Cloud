(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[8],{"31c4":function(e,t,o){"use strict";var i=o("ded3"),n=o.n(i),l=o("2f62");t["a"]={data(){return{pipelinesLoading:!1,collectorsLoading:!1}},computed:n()(n()({},Object(l["c"])("mainStore",["openCollectors","pipelines"])),{},{dataLoading(){return this.collectorsLoading||this.pipelinesLoading}}),methods:n()(n()({},Object(l["b"])("mainStore",["getOpenCollectors","getPipelines"])),{},{loadOpenCollectors(){this.getOpenCollectors({loadingVariableName:"collectorsLoading",caller:this})},loadPipelines(){this.getPipelines({loadingVariableName:"pipelinesLoading",caller:this})},loadOpenCollectorsAndPipelines(){this.loadOpenCollectors(),this.loadPipelines()}}),mounted(){0===this.openCollectors.length&&this.loadOpenCollectors(),this.pipelines&&0===this.pipelines.length&&this.loadPipelines()}}},"5d0b":function(e,t,o){"use strict";o.d(t,"a",(function(){return a}));var i=o("ded3"),n=o.n(i),l=(o("ddb0"),o("ac1f"),o("651e"));function s(e,t,o){if(e&&"object"===typeof e&&t&&Array.isArray(t)&&o&&"object"===typeof o)for(const[i,n]of Object.entries(e)){let e,l="",s="";const a=String(n).split("👉");a&&a.length>=2&&(l=a.shift(),s=a.join("👉"));const r=String(s).split("👈___default___");r&&r.length>=2&&(e=r.pop(),s=r.join("👈___default___"));const c=t.find((e=>e.tag===l));if(l=c&&c.transform&&c.transform.length?c.transform:"","🚫"===e&&(e=void 0),null!==e&&""!==e&&+e===+e&&(e=Number(e)),i&&i.length&&l&&l.length){const t={};Object.defineProperty(t,l,{enumerable:!0,value:{target:i,value:s,default:e}}),"delete"===l&&(delete t[l].value,delete t[l].default),o.push(t)}}}function a(e){try{const i=Object.assign({},e);let a=i.collectionMethod||"";if("syslog_udp"===a&&(a="syslog"),"syslog_tcp"===a&&(a="syslog"),void 0===i.request&&(i.request={}),void 0===i.request.transforms&&(i.request.transforms=[]),void 0===i.response&&(i.response={}),void 0===i.response.transforms&&(i.response.transforms=[]),void 0===i.response.pagination&&(i.response.pagination=[]),i.EZ__Auth_Basic__enable&&!0===i.EZ__Auth_Basic__enable){let e;try{e=btoa((i.EZ__Auth_Basic__username||"")+":"+(i.EZ__Auth_Basic__password||""))}catch(t){e=btoa(":")}i.request.transforms.push({set:{target:"header.Authorization",value:e}})}if(i["request.body"]&&i["request.body"].length)try{i["request.body"]=JSON.parse(i["request.body"])}catch(o){delete i["request.body"]}const r=[{tag:"___set___",transform:"set"},{tag:"___append___",transform:"append"},{tag:"___delete___",transform:"delete"}];if(s(i["request.transforms"],r,i.request.transforms),s(i["response.transforms"],r,i.response.transforms),s(i["response.pagination"],r,i.response.pagination),i.cursor){const e={};for(const[t,o]of Object.entries(i.cursor)){let i,n=o;const l=String(n).split("👈___default___");l&&l.length>=2&&(i=l.pop(),n=l.join("👈___default___")),"🚫"===i&&(i=void 0),null!==i&&""!==i&&+i===+i&&(i=Number(i));const s={};Object.defineProperty(s,t,{enumerable:!0,value:{value:n,default:i}}),Object.assign(e,s)}i.cursor=e}delete i.collectionShipper,delete i.collectionMethod,delete i.EZ__Auth_Basic__enable,delete i.EZ__Auth_Basic__username,delete i.EZ__Auth_Basic__password,delete i["request.transforms"],delete i["response.transforms"],delete i["response.pagination"],0===i.request.transforms.length&&delete i.request.transforms,0===i.response.transforms.length&&delete i.response.transforms,0===i.response.pagination.length&&delete i.response.pagination,0===Object.keys(i.request).length&&delete i.request,0===Object.keys(i.response).length&&delete i.response;const c=JSON.parse(JSON.stringify(i,((e,t)=>null===t?void 0:t))),p="log"===a||"syslog"===a||"httpjson"===a;return Object(l["dump"])(p?[n()({type:a},c)]:{[a]:c})}catch(i){return i}}},"9fa1":function(e,t,o){"use strict";var i=o("ded3"),n=o.n(i),l=o("2f62");t["a"]={data(){return{socket:this.$socket}},computed:n()({},Object(l["d"])("mainStore",["jwtToken"])),methods:{connectSocket(){this.socket&&this.socket.connected&&this.socket.disconnect(),this.socket.auth.token=this.jwtToken,this.socket.connect()},disconnectSocket(){this.socket&&this.socket.connected&&this.socket.disconnect()}}}},a87d:function(e,t,o){"use strict";t["a"]={computed:{darkMode:{get(){return this.$q.dark.isActive},set(e){this.$q.dark.set(e),localStorage.setItem("settings.darkMode",e)}}}}},c1dc:function(e,t,o){"use strict";var i=o("ded3"),n=o.n(i),l=o("2f62"),s=o("5d0b");function a(e){try{const t=Object.assign({},e),o=t.collectionMethod||"";delete t.collectionShipper,delete t.collectionMethod;const i=JSON.parse(JSON.stringify(t,((e,t)=>null===t?void 0:t)));return JSON.stringify(n()({log_source_type:o},i),null,"  ")}catch(t){return t}}t["a"]={computed:n()({},Object(l["d"])("mainStore",["collectionShippersOptions","openCollectorBeats"])),methods:{collectionShipperDetails(e){const t={value:"unknown",label:"Unknown or not set",icon:"unknown",outputFormat:"json"};if(e&&e.length){const o=e.toLowerCase();return this.collectionShippersOptions.find((e=>e.value&&e.value.toLowerCase()===o))||this.collectionShippersOptions.find((e=>e.label&&e.label.toLowerCase()===o))||this.openCollectorBeats.find((e=>e.label&&e.label.toLowerCase()===o))||t}return t},collectionConfigOutputFor(e,t){return"yaml"===e||"yml"===e?Object(s["a"])(t):"json"===e?a(t):""}}}},d184:function(e,t,o){"use strict";o.r(t);var i=function(){var e=this,t=e.$createElement,o=e._self._c||t;return o("q-page",{staticClass:"q-pa-sm"},[o("q-header",{class:e.darkMode?"":"bg-grey-1",style:e.darkMode?"background: var(--q-color-dark);":"",attrs:{elevated:""}},[o("q-toolbar",{staticClass:"q-gutter-x-sm",class:e.darkMode?"":"text-black"},[o("q-btn",{attrs:{"no-caps":"",flat:"",dense:"",icon:"arrow_back",label:"Return to List",to:"/Pipelines"}}),o("q-toolbar-title",{staticClass:"text-center",staticStyle:{opacity:".4"}},[e._v("Pipeline Properties"),e.pipeline&&e.pipeline.name&&e.pipeline.name.length?o("span",[e._v(":  "+e._s(e.pipeline.name))]):e._e()])],1)],1),o("div",{staticClass:" q-gutter-y-sm"},[o("q-card",[o("q-card-section",{attrs:{horizontal:""}},[o("q-card-section",{staticClass:"col q-ma-none q-pa-none"},[o("q-card-section",{staticClass:"text-h4"},[e._v("\n              Collection\n          ")]),o("q-card-section",{staticClass:"row items-center"},[o("span",{staticClass:"text-bold"},[e._v("Shipper and Method: ")]),o("div",{staticClass:"q-ml-md text-center"},[e.collectionShipperOption.icon&&e.collectionShipperOption.icon.length?o("img",{attrs:{src:"/shippers/"+e.collectionShipperOption.icon+".svg",width:"64px"}}):e._e(),o("div",[e._v(e._s(e.collectionShipperOption.label))])]),o("div",{staticClass:"q-ml-xl text-center"},[o("q-icon",{attrs:{name:e.collectionMethodOption.icon,size:"64px"}}),o("div",[e._v(e._s(e.collectionMethodOption.label))])],1)]),o("q-card-section",[o("div",{},[o("div",{staticClass:"text-bold"},[e._v("Collection Configuration:")]),o("div",{staticClass:"row q-my-sm"},[o("q-separator",{attrs:{vertical:"",size:"2px",color:"teal"}}),o("div",{staticClass:"q-ml-sm"},[o("pre",[e._v(e._s(e.collectionConfigOutput))])])],1)])])],1),o("q-separator",{attrs:{vertical:""}}),o("q-card-actions",{staticClass:"justify-around q-px-md",attrs:{vertical:""}},[o("q-btn",{attrs:{icon:"edit",color:"primary",to:"/Pipelines/"+this.pipelineUid+"/Collection/Edit"}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                Edit Collection\n              ")])],1),o("q-btn",{attrs:{icon:"download"},on:{click:function(t){return e.downloadCollectionAsShipperConfigFile()}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                Download Collection configuration as a Shipper configuration file\n              ")])],1),o("q-btn",{attrs:{icon:"content_copy"},on:{click:function(t){return e.copyCollectionConfigAsShipperFileToClipboard()}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                Copy Collection configuration in Shipper's format to Clipboard\n              ")])],1),o("q-btn",{attrs:{icon:"delete","text-color":"negative"},on:{click:function(t){return e.deleteCollectionPrompt()}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                Delete Collection Configuration\n              ")])],1)],1)],1)],1),o("q-card",[o("q-card-section",{attrs:{horizontal:""}},[o("q-card-section",{staticClass:"col q-ma-none q-pa-none"},[o("q-card-section",{staticClass:"text-h4"},[e._v("\n              Mapping\n          ")]),o("q-card-section",[o("span",{staticClass:"text-bold"},[e._v("Fields detected: ")]),e._v(e._s(e.detectedFields)+"\n          ")]),o("q-card-section",[o("span",{staticClass:"text-bold"},[e._v("Fields mapped: ")]),e._v(e._s(e.mappedFields)+"\n          ")])],1),o("q-separator",{attrs:{vertical:""}}),o("q-card-actions",{staticClass:"justify-around q-px-md",attrs:{vertical:""}},[o("q-btn",{attrs:{icon:"edit",color:"primary",to:"/Pipelines/"+this.pipelineUid+"/Mapping/Edit"}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                Edit Mapping\n              ")])],1),o("q-btn",{attrs:{icon:"download",disable:""}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                Download Mapping as JQ Pipeline\n              ")])],1),o("q-btn",{attrs:{icon:"delete","text-color":"negative"},on:{click:function(t){return e.deleteMappingPrompt()}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                Delete Mapping\n              ")])],1)],1)],1)],1),o("q-card",[o("q-card-section",{attrs:{horizontal:""}},[o("q-card-section",{staticClass:"col q-ma-none q-pa-none"},[o("q-card-section",{staticClass:"text-h4"},[e._v("\n              Deployments\n          ")]),o("q-card-section",[o("q-table",{attrs:{data:e.tableData,columns:e.columns,"row-key":"uid",dense:"","no-data-label":"No Deployment to display.",filter:e.searchFilter,loading:e.dataLoading,"rows-per-page-label":"Deployments per page:",pagination:e.pagination},on:{"update:pagination":function(t){e.pagination=t}},scopedSlots:e._u([{key:"top",fn:function(){return[o("div",{staticClass:"full-width row wrap justify-between"},[o("div",{staticClass:"q-table__title"},[e._v("\n                    Current Deployments\n                  ")]),o("div",{staticClass:"row q-gutter-md"},[o("div",{staticClass:"col"},[o("q-btn",{staticStyle:{"min-width":"14rem"},attrs:{rounded:"",dense:"",color:"primary",icon:"add",label:"Add New Deployment"},on:{click:function(t){return e.addNewDeployment()}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n                          Create a new Deployment.\n                        ")])],1)],1)]),o("div",{staticClass:"row q-gutter-md"},[o("div",{staticStyle:{width:"300px"}},[o("q-input",{attrs:{outlined:"",dense:"",debounce:"300",placeholder:"Search"},scopedSlots:e._u([{key:"append",fn:function(){return[e.searchFilter.length?o("q-btn",{attrs:{dense:"",flat:"",icon:"close"},on:{click:function(t){e.searchFilter=""}}}):e._e(),o("q-icon",{attrs:{name:"search"}})]},proxy:!0}]),model:{value:e.searchFilter,callback:function(t){e.searchFilter=t},expression:"searchFilter"}})],1),o("q-btn",{attrs:{dense:"",outline:"",icon:"refresh",loading:e.dataLoading},on:{click:function(t){return e.loadOpenCollectorsAndPipelines()}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n                        Reload the list of Pipelines.\n                      ")])],1)],1)])]},proxy:!0},{key:"body-cell-actions",fn:function(t){return[o("q-td",{attrs:{props:t}},[o("q-btn",{attrs:{flat:"",dense:"",icon:"edit"},on:{click:function(o){return e.doPromptForDeploymentDetails(t.row)}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n                      "+e._s(e.$t("Edit Deployment details"))+"\n                    ")])],1),o("q-btn",{attrs:{flat:"",dense:"",icon:"delete",color:"negative"},on:{click:function(o){return e.deleteDeploymentPrompt(t.row)}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n                      "+e._s(e.$t("Delete Deployment"))+"\n                    ")])],1)],1)]}},{key:"body-cell-status",fn:function(t){return[o("q-td",{attrs:{props:t}},[!0===t.value?o("q-icon",{attrs:{name:"arrow_circle_up",color:"green",size:"md"}}):!1===t.value?o("q-icon",{attrs:{name:"arrow_circle_down",color:"red",size:"md"}}):o("q-icon",{attrs:{name:"help_center",color:"grey",size:"md"}}),o("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[!0===t.value?o("span",[e._v("Enabled")]):!1===t.value?o("span",[e._v("Disabled / Un-deployed")]):o("span",[e._v(e._s(t.value))])])],1)]}}])})],1)],1),o("q-separator",{attrs:{vertical:""}}),o("q-card-actions",{staticClass:"justify-around q-px-md",attrs:{vertical:""}},[o("q-btn",{attrs:{icon:"add",color:"primary"},on:{click:function(t){return e.addNewDeployment()}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                Add Deployment\n              ")])],1),o("q-btn",{attrs:{icon:"refresh",loading:e.dataLoading},on:{click:function(t){return e.loadOpenCollectorsAndPipelines()}}},[o("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                Reload\n              ")])],1)],1)],1)],1)],1)],1)},n=[],l=o("ded3"),s=o.n(l),a=(o("13d5"),o("2f62")),r=o("31c4"),c=o("9fa1"),p=o("a87d"),d=o("c1dc"),u=o("a357"),h=o("cdde"),m={name:"PagePipelineProperties",mixins:[r["a"],c["a"],p["a"],d["a"]],data(){return{pipelineUid:"",searchFilter:"",columns:[{name:"actions",align:"center",label:"Actions",field:"actions",sortable:!1},{name:"status",align:"center",label:"Status",field:"enabled",sortable:!0},{name:"openCollector",align:"center",label:"Open Collector",field:"openCollectorHost",sortable:!0}],pagination:{sortBy:"status",descending:!0,rowsPerPage:25}}},computed:s()(s()(s()({},Object(a["c"])("mainStore",["openCollectors","pipelines"])),Object(a["d"])("mainStore",["collectionMethodsOptions","collectionShippersOptions"])),{},{pipeline(){const e=this.pipelines.find((e=>e.uid===this.pipelineUid));return e||{uid:"",name:"",status:"New",primaryOpenCollector:"",fieldsMapping:[],collectionConfig:{}}},detectedFields(){return this.pipeline.fieldsMapping&&Array.isArray(this.pipeline.fieldsMapping)?this.pipeline.fieldsMapping.length:0},mappedFields(){return this.pipeline.fieldsMapping&&Array.isArray(this.pipeline.fieldsMapping)?this.pipeline.fieldsMapping.reduce(((e,t)=>t.mappedField&&t.mappedField.length>0?e+1:e),0):0},collectionMethod(){return this.pipeline.collectionConfig&&this.pipeline.collectionConfig.collectionMethod?this.pipeline.collectionConfig.collectionMethod:""},collectionShipper(){return this.pipeline.collectionConfig&&this.pipeline.collectionConfig.collectionShipper?this.pipeline.collectionConfig.collectionShipper:""},collectionMethodOption(){const e={value:"unknown",label:"Unknown or not set",icon:"help_center"};return this.collectionMethod&&this.collectionMethod.length&&this.collectionMethodsOptions.find((e=>e.value&&e.value===this.collectionMethod))||e},collectionShipperOption(){const e={value:"unknown",label:"Unknown or not set",icon:"unknown",outputFormat:"json"};return this.collectionShipper&&this.collectionShipper.length&&this.collectionShippersOptions.find((e=>e.value&&e.value===this.collectionShipper))||e},collectionConfigOutput(){let e="";return e=this.collectionShipper&&this.collectionShipper.length?this.collectionShipperOption&&this.collectionShipperOption.outputFormat&&this.collectionShipperOption.outputFormat.length?this.collectionMethod&&this.collectionMethod.length?this.collectionConfigOutputFor(this.collectionShipperOption.outputFormat,this.pipeline.collectionConfig):"# No Collection Method configured.":"# Unknown output format.":"# No Collecting Shipper configured.",e},deployments(){const e=[];return this.openCollectors.forEach((t=>{t.pipelines&&Array.isArray(t.pipelines)&&t.pipelines.forEach((o=>{o.uid===this.pipelineUid&&e.push({pipelineUid:o.uid,openCollector:t,enabled:o.enabled})}))})),e},tableData(){const e=[];return this.deployments.forEach((t=>{const o=this.openCollectors.find((e=>t.openCollector&&e.uid===t.openCollector.uid));e.push(Object.assign({},t,{openCollectorHost:o&&o.name&&o.hostname?o.name+" ("+o.hostname+")":null}))})),e}}),methods:s()(s()({},Object(a["b"])("mainStore",["upsertPipeline","deleteDeployment"])),{},{editPipelineCollection(){this.$router.push({path:"/Pipelines/"+this.pipelineUid+"/Collection/Edit"})},editPipelineMapping(){this.$router.push({path:"/Pipelines/"+this.pipelineUid+"/Mapping/Edit"})},deleteMappingPrompt(){this.$q.dialog({title:"Confirm",message:"Do you REALLY want to delete the Mapping information for this Pipeline?",ok:{push:!0,color:"negative"},cancel:{push:!0,color:"positive"},persistent:!0}).onOk((()=>{this.deleteMapping()}))},deleteMapping(){this.pipelineUid&&this.pipelineUid.length&&this.upsertPipeline({caller:this,pushToApi:!0,pipeline:{uid:this.pipelineUid,fieldsMapping:[]}})},deleteCollectionPrompt(){this.$q.dialog({title:"Confirm",message:"Do you REALLY want to delete the Collection information for this Pipeline?",ok:{push:!0,color:"negative"},cancel:{push:!0,color:"positive"},persistent:!0}).onOk((()=>{this.deleteCollection()}))},deleteCollection(){this.pipelineUid&&this.pipelineUid.length&&this.upsertPipeline({caller:this,pushToApi:!0,pipeline:{uid:this.pipelineUid,collectionConfig:{}}})},downloadCollectionAsShipperConfigFile(){let e=".txt",t="text/plain";this.collectionShipperOption&&this.collectionShipperOption.outputFormat&&this.collectionShipperOption.outputFormat.length&&("yaml"===this.collectionShipperOption.outputFormat||"yml"===this.collectionShipperOption.outputFormat?(e=".yml",t="text/yaml"):"json"===this.collectionShipperOption.outputFormat&&(e=".json",t="application/json"));const o="input."+this.pipeline.name+"_"+this.pipeline.uid+e,i=this.$q.notify({icon:"cloud_download",message:this.$t("Downloading Collection Configuration file..."),caption:o,type:"ongoing"}),n=Object(u["a"])(o,this.collectionConfigOutput,t);!0===n?i({type:"positive",color:"positive",icon:"check",message:this.$t("Collection Configuration file downloaded"),caption:o}):(i({type:"negative",color:"negative",icon:"report_problem",message:this.$t("Problem while downloading Collection Configuration file:"),caption:n}),console.log("Error: "+n))},copyCollectionConfigAsShipperFileToClipboard(){Object(h["a"])(this.collectionConfigOutput).then((()=>{this.$q.notify({type:"positive",color:"positive",icon:"check",message:this.$t("Collection Configuration copied to Clipboard")})})).catch((()=>{this.$q.notify({type:"negative",color:"negative",icon:"report_problem",message:this.$t("Problem while copying Collection Configuration file to Clipboard")})}))},addNewDeployment(){this.$router.push("/Pipelines/"+this.pipelineUid+"/Deployments/Edit")},doPromptForDeploymentDetails(e){e&&e.openCollector&&e.openCollector.uid&&e.openCollector.uid.length&&this.$router.push("/Pipelines/"+this.pipelineUid+"/Deployments/"+e.openCollector.uid+"/Edit")},deleteDeploymentPrompt(e){if("undefined"!==typeof e){const t=!1===e.enabled?"":" ⚠️ This will NOT un-deploy it. It will simply delete the database record about this deployment. To un-deploy, click on Edit and un-deploy from there.";this.$q.dialog({title:"Confirm",message:"Do you REALLY want to delete this Deployment?"+t,ok:{push:!0,color:"negative"},cancel:{push:!0,color:"positive"},persistent:!0}).onOk((()=>{this.deleteDeployment({pushToApi:!0,caller:this,pipelineUid:e.pipelineUid,openCollector:e.openCollector})}))}}}),mounted(){this.$route.params.pipelineUid&&this.$route.params.pipelineUid.length&&this.pipelineUid!==this.$route.params.pipelineUid&&(this.pipelineUid=this.$route.params.pipelineUid)}},f=m,g=o("2877"),_=o("9989"),y=o("e359"),b=o("b498"),C=o("65c6"),q=o("9c40"),v=o("6ac5"),O=o("f09f"),S=o("a370"),w=o("0016"),k=o("eb85"),M=o("4b7e"),P=o("05c0"),j=o("eaac"),D=o("27f9"),A=o("db86"),F=o("eebe"),x=o.n(F),U=Object(g["a"])(f,i,n,!1,null,null,null);t["default"]=U.exports;x()(U,"components",{QPage:_["a"],QHeader:y["a"],QColor:b["a"],QToolbar:C["a"],QBtn:q["a"],QToolbarTitle:v["a"],QCard:O["a"],QCardSection:S["a"],QIcon:w["a"],QSeparator:k["a"],QCardActions:M["a"],QTooltip:P["a"],QTable:j["a"],QInput:D["a"],QTd:A["a"]})}}]);