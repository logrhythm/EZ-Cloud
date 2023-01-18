(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[24],{"80b0":function(e,t,i){"use strict";i.r(t);var n=function(){var e=this,t=e._self._c;return t("q-page",{staticClass:"q-pa-md"},[t("q-header",{class:e.darkMode?"":"bg-grey-1",style:e.darkMode?"background: var(--q-color-dark);":"",attrs:{bordered:""}},[t("q-toolbar",{staticClass:"q-gutter-x-sm",class:e.darkMode?"":"text-black"},[t("img",{staticClass:"q-mr-md",attrs:{src:"logrhythm_logo_wide.svg",alt:"LogRhythm Open Collector"}})])],1),t("BreadCrumbs",{attrs:{crumbs:e.breadCrumbs,pageTitle:e.$t("Pipelines")}}),t("q-table",{attrs:{title:e.$t("Pipelines"),data:e.tableData,columns:e.columns,"row-key":"uid",dense:"","no-data-label":e.$t("No Pipeline to display."),filter:e.searchFilter,loading:e.tableLoading,"rows-per-page-label":e.$t("Pipelines per page:"),pagination:e.pagination},on:{"update:pagination":function(t){e.pagination=t}},scopedSlots:e._u([{key:"top",fn:function(){return[t("div",{staticClass:"full-width row wrap justify-between"},[t("div",{staticClass:"q-table__title"},[e._v("\n            "+e._s(e.$t("Pipelines"))+"\n          ")]),t("div",{staticClass:"row q-gutter-md"},[t("div",{staticClass:"col"},[t("q-btn",{staticStyle:{"min-width":"12rem"},attrs:{"no-caps":"",dense:"",color:"primary",icon:"add",label:e.$t("Add New Pipeline")},on:{click:function(t){return e.doPromptForPipelineDetails()}}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n                  "+e._s(e.$t("Create a new Pipeline."))+"\n                ")])],1)],1)]),t("div",{staticClass:"row q-gutter-md"},[t("div",{staticStyle:{width:"300px"}},[t("q-input",{attrs:{outlined:"",dense:"",debounce:"300",placeholder:e.$t("Search")},scopedSlots:e._u([{key:"append",fn:function(){return[e.searchFilter.length?t("q-btn",{attrs:{dense:"",flat:"",icon:"close"},on:{click:function(t){e.searchFilter=""}}}):e._e(),t("q-icon",{attrs:{name:"o_search"}})]},proxy:!0}]),model:{value:e.searchFilter,callback:function(t){e.searchFilter=t},expression:"searchFilter"}})],1),t("q-btn",{attrs:{dense:"",outline:"",icon:"refresh"},on:{click:function(t){return e.loadPipelines()}}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n                "+e._s(e.$t("Reload the list of Pipelines."))+"\n              ")])],1)],1)])]},proxy:!0},{key:"body-cell-actions",fn:function(i){return[t("q-td",{attrs:{props:i}},[t("q-btn",{attrs:{flat:"",dense:"",icon:"launch"},on:{click:function(t){return e.openPipeline(i.row)}}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n              "+e._s(e.$t("Open this Pipeline"))+"\n            ")])],1),t("q-btn",{attrs:{flat:"",dense:"",icon:"edit"},on:{click:function(t){return e.doPromptForPipelineDetails(i.row)}}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n              "+e._s(e.$t("Edit Pipeline details"))+"\n            ")])],1),t("q-btn",{attrs:{flat:"",dense:"",icon:"delete",color:"negative"},on:{click:function(t){return e.deletePipelinePrompt(i.row)}}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n              "+e._s(e.$t("Delete Pipeline"))+"\n            ")])],1)],1)]}},{key:"body-cell-status",fn:function(i){return[t("q-td",{attrs:{props:i}},["Ready"===i.value?t("q-icon",{attrs:{name:"o_arrow_circle_up",color:"green",size:"md"}}):"Dev"===i.value?t("q-icon",{attrs:{name:"o_construction",color:e.darkIsEnabled?"green-3":"green-10",size:"md"}}):"New"===i.value?t("q-icon",{attrs:{name:"o_auto_awesome",size:"md"}}):t("q-icon",{attrs:{name:"o_help_center",color:"grey",size:"md"}}),t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n            "+e._s(e.$t(i.value))+"\n          ")])],1)]}},{key:"body-cell-collectionShipper",fn:function(i){return[t("q-td",{attrs:{props:i}},[i.row&&i.row.collectionConfig&&i.row.collectionConfig.collectionShipper&&i.row.collectionConfig.collectionShipper.length?t("img",{attrs:{src:"/shippers/"+e.collectionShipperDetails(i.row.collectionConfig.collectionShipper).icon+".svg",width:"32px"}}):e._e(),t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[i.row&&i.row.collectionConfig&&i.row.collectionConfig.collectionShipper&&i.row.collectionConfig.collectionShipper.length?t("span",[e._v(e._s(e.collectionShipperDetails(i.row.collectionConfig.collectionShipper).label))]):e._e()])],1)]}},{key:"body-cell-collectionMethod",fn:function(i){return[t("q-td",{attrs:{props:i}},[i.row&&i.row.collectionConfig&&i.row.collectionConfig.collectionShipper&&i.row.collectionConfig.collectionShipper.length&&i.row.collectionConfig.collectionMethod&&i.row.collectionConfig.collectionMethod.length?t("q-icon",{attrs:{name:e.collectionMethodDetails(i.row.collectionConfig.collectionShipper,i.row.collectionConfig.collectionMethod).icon,size:"md"}}):e._e(),t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[i.row&&i.row.collectionConfig&&i.row.collectionConfig.collectionShipper&&i.row.collectionConfig.collectionShipper.length&&i.row.collectionConfig.collectionMethod&&i.row.collectionConfig.collectionMethod.length?t("span",[e._v(e._s(e.collectionMethodDetails(i.row.collectionConfig.collectionShipper,i.row.collectionConfig.collectionMethod).label))]):e._e()])],1)]}},{key:"body-cell-mappingStats",fn:function(i){return[t("q-td",{attrs:{props:i}},[i.row.fieldsMapping&&Array.isArray(i.row.fieldsMapping)&&i.row.fieldsMapping.length?t("div",[t("q-circular-progress",{attrs:{value:Math.round(i.value),"show-value":"","font-size":i.value<100?"0.5em":"0.4em",size:"2.8em",thickness:.2,color:e.darkIsEnabled?"blue-3":"blue-10","track-color":e.darkIsEnabled?"grey-9":"grey-3"}}),t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[t("span",[e._v(e._s(e.$t("Detected fields:"))+" "+e._s(i.row.fieldsMapping.length))]),t("br"),t("span",[e._v(e._s(e.$t("Mapped fields:"))+" "+e._s(i.row.fieldsMapping.reduce(((e,t)=>t.mappedField&&t.mappedField.length>0?e+1:e),0)))]),e._v(" ("),t("span",{staticClass:"text-bold"},[e._v(e._s(Math.round(100*i.value)/100)+"%")]),e._v(")\n            ")])],1):e._e()])]}}])}),t("q-dialog",{attrs:{persistent:""},model:{value:e.promptForNewPipelineDetails,callback:function(t){e.promptForNewPipelineDetails=t},expression:"promptForNewPipelineDetails"}},[t("q-card",{staticStyle:{"min-width":"350px"}},[t("q-card-section",{staticClass:"row justify-between"},[t("div",{staticClass:"text-h6"},[e._v(e._s(e.$t("Pipeline Details")))]),t("q-btn",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{dense:"",flat:"",icon:"close",color:"grey-5"}})],1),t("q-separator"),t("q-card-section",{},[t("q-input",{attrs:{dense:"",outlined:"",autofocus:"",label:e.$t("Pipeline Name"),readonly:!(!e.newPipelineUid||!e.newPipelineUid.length),rules:[t=>!!t||e.$t("Pipeline name cannot be empty")]},on:{keyup:function(t){if(!t.type.indexOf("key")&&e._k(t.keyCode,"esc",27,t.key,["Esc","Escape"]))return null;e.promptForNewPipelineDetails=!1}},model:{value:e.newPipelineName,callback:function(t){e.newPipelineName=t},expression:"newPipelineName"}})],1),t("q-card-section",{staticClass:"q-pt-none"},[t("q-select",{attrs:{dense:"",outlined:"",options:e.openCollectorsOptions,label:e.$t("Primary OpenCollector"),"emit-value":"","map-options":""},model:{value:e.newPipelineOpenCollector,callback:function(t){e.newPipelineOpenCollector=t},expression:"newPipelineOpenCollector"}})],1),e.newPipelineStatus?t("q-card-section",{staticClass:"q-pt-none q-mt-md"},[t("q-select",{attrs:{dense:"",outlined:"",options:e.statusOptions,label:e.$t("Status"),"emit-value":"","map-options":""},model:{value:e.newPipelineStatus,callback:function(t){e.newPipelineStatus=t},expression:"newPipelineStatus"}})],1):e._e(),t("q-separator"),t("q-card-actions",{staticClass:"text-primary",attrs:{align:"right"}},[t("q-btn",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{outline:"","no-caps":"",label:e.$t("Cancel")}}),e.newPipelineUid&&e.newPipelineUid.length?t("q-btn",{directives:[{name:"close-popup",rawName:"v-close-popup"}],staticClass:"text-textForPrimaryButton",attrs:{color:"primary","no-caps":"",label:e.$t("Update Pipeline"),disabled:!e.newPipelineName.length},on:{click:function(t){return e.updatePipeline()}}}):t("q-btn",{directives:[{name:"close-popup",rawName:"v-close-popup"}],staticClass:"text-textForPrimaryButton",attrs:{color:"primary","no-caps":"",label:e.$t("Add new Pipeline"),disabled:!e.newPipelineName.length},on:{click:function(t){return e.updatePipeline()}}})],1)],1)],1)],1)},l=[],o=i("2f62"),a=i("a87d"),s=i("80e3"),r=i("31c4"),c=i("c1dc"),p=i("afd9"),d=i("f423"),u={name:"PagePipelinesList",mixins:[a["a"],s["a"],r["a"],c["a"]],components:{BreadCrumbs:d["a"]},data(){return{searchFilter:"",columns:[{name:"actions",align:"center",label:this.$t("Actions"),field:"actions",sortable:!1},{name:"status",align:"center",label:this.$t("Status"),field:"status",sortable:!0,sort:(e,t,i,n)=>this.statusTextToId(e)-this.statusTextToId(t)},{name:"name",align:"center",label:this.$t("Pipeline Name"),field:"name",sortable:!0},{name:"openCollector",align:"center",label:this.$t("Primary OpenCollector"),field:"openCollector",sortable:!0},{name:"collectionShipper",align:"center",label:this.$t("Collecting Shipper"),field:e=>e.collectionConfig.collectionShipper,sortable:!0},{name:"collectionMethod",align:"center",label:this.$t("Collection Method"),field:e=>e.collectionConfig.collectionMethod,sortable:!0},{name:"mappingStats",align:"center",label:this.$t("Fields Mapped (%)"),field:e=>e.fieldsMapping&&Array.isArray(e.fieldsMapping)&&e.fieldsMapping.length>0?e.fieldsMapping.reduce(((e,t)=>t.mappedField&&t.mappedField.length>0?e+1:e),0)/e.fieldsMapping.length*100:null,sortable:!0}],pagination:{sortBy:"status",descending:!0,rowsPerPage:25},promptForNewPipelineDetails:!1,newPipelineName:"",newPipelineOpenCollector:null,newPipelineUid:"",newPipelineStatus:null,statusOptions:[{label:this.$t("New"),value:"New"},{label:this.$t("Dev"),value:"Dev"},{label:this.$t("Ready"),value:"Ready"}]}},computed:{...Object(o["d"])("mainStore",["collectionMethodsOptions","collectionShippersOptions"]),...Object(o["c"])("mainStore",["openCollectors","pipelines"]),tableData(){const e=[];return this.pipelines.forEach((t=>{const i=this.openCollectors.find((e=>e.uid===t.primaryOpenCollector));e.push(Object.assign({},t,{openCollector:i&&i.name&&i.hostname?i.name+" ("+i.hostname+")":null}))})),e},openCollectorsOptions(){const e=[];return this.openCollectors.forEach((t=>{e.push({value:t.uid,label:t.name+" ("+t.hostname+")"})})),e},tableLoading(){return this.dataLoading},darkIsEnabled(){return this.$q.dark.isActive},breadCrumbs(){return[{icon:"o_home",link:"/Welcome"},{title:this.$t("Pipelines")}]}},methods:{...Object(o["b"])("mainStore",["upsertPipeline","deletePipeline","getPipelines","getOpenCollectors"]),openPipeline(e){this.$router.push({path:"/Pipelines/"+e.uid+"/Properties"})},deletePipelinePrompt(e){"undefined"!==typeof e&&this.$q.dialog({component:p["a"],parent:this,title:this.$t("Confirm"),message:this.$t("Do you REALLY want to delete this Pipeline?"),persistent:!0}).onOk((()=>{this.deletePipeline({pushToApi:!0,caller:this,pipeline:e})}))},doPromptForPipelineDetails(e){this.newPipelineUid=e&&e.uid?e.uid:null,this.newPipelineName=e&&e.name?e.name:"",this.newPipelineOpenCollector=e&&e.primaryOpenCollector?e.primaryOpenCollector:null,this.newPipelineStatus=e&&e.status?e.status:null,this.promptForNewPipelineDetails=!0},updatePipeline(){this.promptForNewPipelineDetails=!1,this.upsertPipeline({pushToApi:!0,caller:this,pipeline:{uid:this.newPipelineUid,name:this.newPipelineName,status:this.newPipelineStatus&&this.newPipelineStatus.length?this.newPipelineStatus:"New",primaryOpenCollector:this.newPipelineOpenCollector&&this.newPipelineOpenCollector.length?this.newPipelineOpenCollector:null}})},collectionMethodDetails(e,t){const i={value:"unknown",label:this.$t("Unknown or not set"),icon:"help_center"};return e&&e.length&&t&&t.length?this.collectionMethodsOptions.find((i=>i.shipper&&i.shipper===e&&i.value&&i.value===t))||i:t},statusIdToText(e){let t="";return e>=3&&(t="Ready"),2===e&&(t="Dev"),1===e&&(t="New"),t},statusTextToId(e){let t=0;return"Ready"===e&&(t=3),"Dev"===e&&(t=2),"New"===e&&(t=1),t}},mounted(){}},h=u,m=i("2877"),f=i("9989"),g=i("e359"),w=i("b498"),b=i("65c6"),P=i("9c40"),C=i("eaac"),y=i("05c0"),v=i("27f9"),q=i("0016"),_=i("eb85"),k=i("db86"),S=i("58ea"),$=i("24e8"),M=i("f09f"),O=i("a370"),N=i("ddd8"),D=i("4b7e"),x=i("7f67"),F=i("eebe"),Q=i.n(F),z=Object(m["a"])(h,n,l,!1,null,null,null);t["default"]=z.exports;Q()(z,"components",{QPage:f["a"],QHeader:g["a"],QColor:w["a"],QToolbar:b["a"],QBtn:P["a"],QTable:C["a"],QTooltip:y["a"],QInput:v["a"],QIcon:q["a"],QSeparator:_["a"],QTd:k["a"],QCircularProgress:S["a"],QDialog:$["a"],QCard:M["a"],QCardSection:O["a"],QSelect:N["a"],QCardActions:D["a"]}),Q()(z,"directives",{ClosePopup:x["a"]})}}]);