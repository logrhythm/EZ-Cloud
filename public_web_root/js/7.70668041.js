(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[7],{"0b91":function(e,t,i){"use strict";i("edcd")},"1d8c":function(e,t,i){"use strict";(function(e){i("14d9");var l=i("ebc3"),a=i("1732"),o=i("2f62"),n=i("afd9");t["a"]={name:"FieldEditor",components:{FieldEditor:l["a"]},props:{template:{type:Object,required:!0},value:{required:!0},isPartOfArray:{type:Boolean,required:!1,default:!1},indexInArray:{type:Number,required:!1,default:0},isPartOfObject:{type:Boolean,required:!1,default:!1},leafInObject:{type:String,required:!1}},data(){return{internalPrefixVar:"",internalSuffixVar:"",showPassword:!1,inFocus:!1,waitingForBackend:!1,updateErrorMessage:"",fileToUpload:null,showFileUpload:!1}},computed:{defaultValue(){let e="";return this.template.type&&this.template.type.name&&this.template.type.name.length&&("array"===this.template.type.name&&(e=[]),"object"===this.template.type.name&&(e={}),"boolean"===this.template.type.name&&(e=!1),"string"===this.template.type.name&&(e=""),"number"===this.template.type.name&&(e=0),"regex"===this.template.type.name&&(e=""),"option"===this.template.type.name&&(e="")),e},internalValueRaw:{get(){return this.template.type&&this.template.type.name?this.value?this.value:this.template.default?this.template.default:this.defaultValue:this.value},set(e){if(this.template.type&&this.template.type.name&&"array"!==this.template.type.name&&"object"!==this.template.type.name&&"boolean"!==this.template.type.name){let t=e;this.template.prefix&&(t=this.internalPrefix+String(t)),this.template.suffix&&(t=String(t)+this.internalSuffix),this.$emit("input",t)}else this.$emit("input",e)}},internalValue:{get(){let e=this.internalValueRaw;if(this.template.type&&this.template.type.name){if("object"!==this.template.type.name&&"array"!==this.template.type.name){const t=/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g;this.template.prefix&&this.template.prefix.options&&Array.isArray(this.template.prefix.options)&&this.template.prefix.options.forEach((i=>{i.value&&i.value.length&&(e=String(e).replace(RegExp("^"+String(i.value).replace(t,"\\$&")),""))})),this.template.suffix&&this.template.suffix.options&&Array.isArray(this.template.suffix.options)&&this.template.suffix.options.forEach((i=>{i.value&&i.value.length&&(e=String(e).replace(RegExp(String(i.value).replace(t,"\\$&")+"$"),""))}))}"number"===this.template.type.name&&(e=Number(e)),"boolean"===this.template.type.name&&(e=Boolean(e)),"file"===this.template.type.name&&""===e&&(e=null)}return e},set(e){this.internalValueRaw=e}},internalPrefix:{get(){let e=this.internalPrefixVar;return""===e&&this.template.prefix&&this.template.prefix.options&&Array.isArray(this.template.prefix.options)&&this.template.prefix.options.forEach((t=>{t.value&&t.value.length&&""===e&&String(this.internalValueRaw).match(RegExp("^"+t.value))&&(e=t.value)})),e.length?e:this.template.prefix&&this.template.prefix.default?this.template.prefix.default:""},set(e){this.internalPrefixVar=e,this.internalValueRaw=this.internalValue}},internalPrefixLong(){let e=this.internalPrefix;if(this.internalPrefix.length&&this.template.prefix&&this.template.prefix.options&&Array.isArray(this.template.prefix.options)){const t=this.template.prefix.options.find((e=>e.value&&e.value===this.internalPrefix));e=t&&t.label?t.label:e}return e},internalSuffix:{get(){let e=this.internalSuffixVar;return""===e&&this.template.suffix&&this.template.suffix.options&&Array.isArray(this.template.suffix.options)&&this.template.suffix.options.forEach((t=>{t.value&&t.value.length&&""===e&&String(this.internalValueRaw).match(RegExp(t.value+"$"))&&(e=t.value)})),e.length?e:this.template.suffix&&this.template.suffix.default?this.template.suffix.default:""},set(e){this.internalSuffixVar=e,this.internalValueRaw=this.internalValue}},internalSuffixLong(){let e=this.internalSuffix;if(this.internalSuffix.length&&this.template.suffix&&this.template.suffix.options&&Array.isArray(this.template.suffix.options)){const t=this.template.suffix.options.find((e=>e.value&&e.value===this.internalSuffix));e=t&&t.label?t.label:e}return e},leafName(){return this.leafInObject},obfuscationRequirementNotMet(){return!!(this.template.obfuscation&&this.template.obfuscation.obfuscatedFormatCheckRegex&&this.template.obfuscation.obfuscatedFormatCheckRegex.length)&&null===this.internalValueRaw.match(this.template.obfuscation.obfuscatedFormatCheckRegex)}},methods:{...Object(o["b"])("mainStore",["obfuscateSecretForOpenCollector","base64EncodeFile"]),formatNumber(e){return e},addValueToArray(){let e="";this.template&&this.template.type&&this.template.type.name&&this.template.type.of&&this.template.type.of.type&&this.template.type.of.type.name&&("array"===this.template.type.of.type.name&&(e=[]),"object"===this.template.type.of.type.name&&(e={})),Array.isArray(this.internalValue)?(this.internalValue.push(e),this.internalValue=JSON.parse(JSON.stringify(this.internalValue))):this.internalValue=JSON.parse(JSON.stringify([e]))},addValueToObject(){this.$q.dialog({title:this.$t("Prompt"),message:this.$t('<span class="text-bold">Please enter the name of the new entry.</span><br><br><span style="opacity: .7" class="text-italic"><span class="text-bold">Note: </span>This cannot be changed later.</span>'),html:!0,prompt:{model:"",isValid:e=>e.length>0,type:"text",outlined:!0},ok:{color:"primary"},cancel:{outline:!0,color:"primary"},persistent:!0}).onOk((e=>{const t={},i=e&&e.length?e:Object(a["a"])();t[i]="",this.template&&this.template.type&&this.template.type.name&&this.template.type.of&&this.template.type.of.type&&this.template.type.of.type.name&&("array"===this.template.type.of.type.name&&(t[i]=[]),"object"===this.template.type.of.type.name&&(t[i]={})),"object"!==typeof this.internalValue||Array.isArray(this.internalValue)?this.internalValue=JSON.parse(JSON.stringify(t)):(this.internalValue=Object.assign(this.internalValue,t),this.internalValue=JSON.parse(JSON.stringify(this.internalValue)))}))},deleteSubFieldPrompt(){null!=this.value&&""!==this.value?this.$q.dialog({component:n["a"],parent:this,title:this.$t("Confirm"),message:this.$t("Do you REALLY want to delete this entry?"),persistent:!0}).onOk((()=>{this.deleteSubField()})):this.deleteSubField()},deleteSubField(){this.isPartOfArray?this.$emit("deleteSubField",{indexInArray:this.indexInArray,value:this.value}):this.isPartOfObject&&this.$emit("deleteSubField",{leafInObject:this.leafInObject,value:this.value})},deleteSubFieldEvent(e){console.log(e),"undefined"!==typeof e.indexInArray&&"number"===typeof e.indexInArray&&Array.isArray(this.internalValue)&&this.internalValue.length>e.indexInArray?(this.internalValue.splice(e.indexInArray,1),this.internalValue=JSON.parse(JSON.stringify(this.internalValue))):"undefined"!==typeof e.leafInObject&&"string"===typeof e.leafInObject&&e.leafInObject.length&&"object"===typeof this.internalValue&&!Array.isArray(this.internalValue)&&(delete this.internalValue[e.leafInObject],this.internalValue=JSON.parse(JSON.stringify(this.internalValue)))},obfuscateSecret(){this.obfuscationRequirementNotMet&&(this.waitingForBackend=!0,this.updateErrorMessage="",this.obfuscateSecretForOpenCollector({apiCallParams:{secretToObfuscate:this.internalValueRaw&&this.internalValueRaw.length?this.internalValueRaw:""},loadingVariableName:"waitingForBackend",onSuccessCallBack:this.successfullObfuscation,onErrorCallBack:this.failedObfuscation,caller:this}))},successfullObfuscation(e){e.success&&e.data&&e.data.payload&&e.data.payload.obfuscatedSecret&&(this.internalValueRaw=e.data.payload.obfuscatedSecret)},failedObfuscation(e){console.log("failedObfuscation",e),!e.success&&e.captionForLogAndPopup&&(this.updateErrorMessage=e.captionForLogAndPopup,this.$q.notify({type:"negative",color:"negative",icon:"o_report_problem",message:this.$t("Failed to obfuscate the Secret. Error message:"),caption:e.captionForLogAndPopup,timeout:4e3}))},async loadFile(t){let i;if(this.showFileUpload=!1,null==t)console.log("[loadFile] - 🟠 - No file selected.");else if(Array.isArray(t))this.$root.$emit("addAndShowErrorToErrorPanel",{code:"TooManyFiles",messageForLogAndPopup:this.$t("Only one file is accepted. You tried to import multiple files.")});else{i=t&&t.name&&t.name.length?t.name:void 0;const a=this.$q.notify({icon:"o_upload_file",message:this.$t("Loading file..."),caption:i,type:"ongoing"});let o=!1;try{const l=await t.arrayBuffer();this.internalValue={dropIn:!(!this.template||!this.template.fileOptions||!0!==this.template.fileOptions.dropIn),valueInConfig:this.template&&this.template.fileOptions&&this.template.fileOptions.valueInConfig?this.template.fileOptions.valueInConfig:i,dropInPath:this.template&&this.template.fileOptions&&this.template.fileOptions.dropInPath?this.template.fileOptions.dropInPath:i,fileContentBase64:e.from(l).toString("base64"),fileSizeBytes:t.size},a({type:"positive",color:"positive",icon:"o_check",message:this.$t("File loaded"),caption:i})}catch(l){o=!0,this.$root.$emit("addAndShowErrorToErrorPanel",{code:"CantReadFile",messageForLogAndPopup:this.$t("Error trying to open the file. Error: {errorMessage}",{errorMessage:l.message})})}o&&(a({type:"negative",color:"negative",icon:"o_report_problem",message:this.$t("Problem while loading file"),caption:i}),console.log("Error: Problem while loading file"))}}}}}).call(this,i("1c35").Buffer)},"632c":function(e,t,i){"use strict";i("6ca2")},"6ca2":function(e,t,i){},"9a7e":function(e,t,i){"use strict";i.r(t);var l=function(){var e=this,t=e._self._c;return t("q-page",{staticClass:"q-pa-sm"},[t("q-header",{class:e.darkMode?"":"bg-grey-1",style:e.darkMode?"background: var(--q-color-dark);":"",attrs:{bordered:""}},[t("q-toolbar",{staticClass:"q-gutter-x-sm",class:e.darkMode?"":"text-black"},[t("img",{staticClass:"q-mr-md",attrs:{src:e.darkMode?"logrhythm_logo_darkmode_wide.svg":"logrhythm_logo_lightmode_wide.svg",alt:"LogRhythm Open Collector"}}),t("q-btn",{attrs:{"no-caps":"",flat:"",dense:"",icon:"save",label:e.$t("Save"),color:"primary",disabled:!e.needsSaving},on:{click:function(t){return e.save()}}}),t("q-btn",{attrs:{"no-caps":"",flat:"",dense:"",icon:"restore",label:e.$t("Reverse to last saved")},on:{click:function(t){return e.reverseToLastSavedPrompt()}}}),t("q-space"),t("q-btn",{attrs:{"no-caps":"",flat:"",dense:"",icon:"pending",label:e.$t("Advanced")}},[t("q-menu",[t("div",{staticClass:"row no-wrap q-pa-md"},[t("div",{staticClass:"column"},[t("div",{staticClass:"text-h6 q-mb-md"},[e._v(e._s(e.$t("Advanced")))]),t("q-toggle",{attrs:{label:e.$t("Show Collection Configuration")},model:{value:e.showCollectionConfig,callback:function(t){e.showCollectionConfig=t},expression:"showCollectionConfig"}}),t("q-toggle",{attrs:{label:e.$t("Show Collection Method Template")},model:{value:e.showCollectionMethodTemplate,callback:function(t){e.showCollectionMethodTemplate=t},expression:"showCollectionMethodTemplate"}})],1)])])],1)],1)],1),t("BreadCrumbs",{attrs:{crumbs:e.breadCrumbs,pageTitle:e.pipeline&&e.pipeline.name&&e.pipeline.name.length?`Collection Builder: ${e.pipeline.name}`:"Collection Builder"}}),t("div",{staticClass:"q-gutter-y-md"},[t("q-card",[t("q-card-section",{attrs:{horizontal:""}},[t("q-card-section",{staticClass:"col q-ma-none q-pa-none"},[t("q-card-section",{staticClass:"text-h6"},[e._v("\n              "+e._s(e.$t("Collecting Shipper"))+"\n          ")]),t("q-separator"),t("q-card-section",[t("q-select",{staticClass:"q-mx-sm q-my-xs",staticStyle:{"min-width":"20rem"},attrs:{dense:"",standout:"bg-blue-4 text-white","emit-value":"","map-options":"",options:e.collectionShippersOptions},model:{value:e.collectionShipper,callback:function(t){e.collectionShipper=t},expression:"collectionShipper"}})],1)],1),t("q-card-section",{staticClass:"col q-ma-none q-pa-none"},[t("q-card-section",{staticClass:"text-h6"},[e._v("\n              "+e._s(e.$t("Collection Method"))+"\n          ")]),t("q-separator"),t("q-card-section",[t("q-select",{staticClass:"q-mx-sm q-my-xs",staticStyle:{"min-width":"20rem"},attrs:{dense:"",standout:"bg-blue-4 text-white","emit-value":"","map-options":"",options:e.collectionMethodsOptions.filter((t=>t.shipper==e.collectionShipper))},model:{value:e.collectionMethod,callback:function(t){e.collectionMethod=t},expression:"collectionMethod"}})],1)],1),t("q-separator",{attrs:{vertical:""}}),t("q-card-actions",{staticClass:"justify-around q-px-md",attrs:{vertical:""}},[t("q-btn",{staticClass:"full-height",attrs:{glossy:"",color:"primary",icon:"check_circle_outline"},on:{click:function(t){return e.switchCollectionMethodPrompt()}}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n              "+e._s(e.$t("Switch to this Collection Method."))+"\n            ")])],1)],1)],1)],1),e.activeCollectionMethod&&e.activeCollectionMethod.length?t("q-card",[t("q-card-section",{staticClass:"text-h6 row"},[e._v("\n          "+e._s(e.$t("Collection Parameters"))+"\n          "),t("q-space"),t("div",{staticClass:"text-teal-4"},[e._v("\n            "+e._s(e.currentCollectionMethodOption.label)+"\n          ")]),t("q-icon",{staticClass:"q-ml-md",attrs:{name:e.currentCollectionMethodOption.icon,size:"md",color:"teal-4"}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n              "+e._s(e.currentCollectionMethodOption.label)+"\n            ")])],1)],1),t("q-separator"),t("div",{},e._l(e.templateGroups,(function(i,l){return t("q-card-section",{key:l,staticClass:"q-gutter-x-sm row"},[t("q-separator",{attrs:{vertical:"",color:"blue-9",size:"1px"}}),t("q-expansion-item",{staticClass:"q-gutter-y-md col",attrs:{"default-opened":0===l,label:i,"header-class":"text-bold text-blue-4"}},e._l((e.collectionMethodTemplate&&e.collectionMethodTemplate.definition?e.collectionMethodTemplate.definition:[]).filter((e=>e.group&&e.group===i)),(function(i,l){return t("q-card-section",{key:l},[t("div",{staticClass:"q-mb-sm"},[t("span",{staticClass:"text-bold q-mr-md"},[e._v(e._s(i.label))]),t("span",{staticStyle:{opacity:".6"}},[e._v("\n                  ( "),t("span",{staticClass:"fixed-font"},[e._v(e._s(i.name))]),e._v(" )\n                  "),i.required?t("span",{staticClass:"text-italic"},[e._v(" "+e._s(e.$t("- 🟧 Required")))]):e._e(),i.readonly?t("span",{staticClass:"text-italic"},[e._v(" "+e._s(e.$t("- ⬛ Read Only")))]):e._e()])]),t("FieldEditor",{attrs:{template:i},model:{value:e.collectionConfig[i.name],callback:function(t){e.$set(e.collectionConfig,i.name,t)},expression:"collectionConfig[fieldTemplate.name]"}})],1)})),1)],1)})),1)],1):e._e(),e.showCollectionConfig?t("q-separator",{attrs:{color:"green",size:"2px"}}):e._e(),e.showCollectionConfig?t("q-card",[t("q-card-section",[t("div",{staticClass:"row q-gutter-x-lg"},[t("div",{staticClass:"col"},[t("span",{staticClass:"text-bold"},[e._v(e._s(e.$t("Collection Params (JSON):")))]),t("pre",[e._v(e._s(e.collectionConfig))])]),t("q-separator",{attrs:{vertical:"",color:"green"}}),t("div",{staticClass:"col"},[t("span",{staticClass:"text-bold"},[e._v(e._s(e.$t("Collection Params (Yaml):")))]),t("pre",[e._v(e._s(e.collectionConfigYml))])])],1)])],1):e._e(),e.showCollectionMethodTemplate?t("q-separator",{attrs:{color:"purple",size:"2px"}}):e._e(),e.showCollectionMethodTemplate?t("q-card",[t("q-card-section",[t("pre",[e._v(e._s(e.collectionMethodTemplate))])])],1):e._e()],1)],1)},a=[],o=(i("caad"),i("14d9"),i("2f62")),n=i("31c4"),s=i("a87d"),r=i("ebc3"),c=i("a7c6"),p=i.n(c),h=i("5d0b"),d=i("afd9"),m=i("f423"),u={mixins:[n["a"],s["a"],p.a.mixin],components:{BreadCrumbs:m["a"],FieldEditor:r["a"]},data(){return{pipelineUid:"",collectionConfig:{},needsSaving:!1,collectionShipper:"",collectionMethod:"",activeCollectionShipper:"",activeCollectionMethod:"",showCollectionConfig:!1,showCollectionMethodTemplate:!1,collectionConfigYml:""}},computed:{...Object(o["d"])("mainStore",["collectionMethodTemplates","collectionMethodsOptions","collectionShippersOptions"]),pipeline(){const e=this.pipelines.find((e=>e.uid===this.pipelineUid));return e||{uid:"",name:"",status:"New",primaryOpenCollector:"",fieldsMapping:[],collectionConfig:{},options:{}}},collectionMethodTemplate(){return this.collectionMethodTemplates.find((e=>e.collectionMethod===this.activeCollectionMethod))},templateGroups(){const e=(this.collectionMethodTemplate&&this.collectionMethodTemplate.definition?this.collectionMethodTemplate.definition:[]).filter((e=>e.group&&e.group.length));return e.length?e.reduce(((e,t)=>(e.includes(t.group)||e.push(t.group),e)),[]):[]},currentCollectionMethodOption(){return this.activeCollectionMethod&&this.activeCollectionMethod.length&&this.collectionMethodsOptions.find((e=>e.value&&e.value===this.activeCollectionMethod))||{value:"unknown",label:this.$t("Unknown"),icon:"help_center"}},breadCrumbs(){return[{icon:"o_home",link:"/Welcome"},{title:this.$t("Pipelines"),link:"/Pipelines"},{title:this.pipeline&&this.pipeline.name&&this.pipeline.name.length?this.pipeline.name:"...",icon:null,link:`/Pipelines/${this.pipelineUid}/Properties`,disabled:!(this.pipelineUid&&this.pipelineUid.length)},{title:this.$t("Properties"),link:`/Pipelines/${this.pipelineUid}/Properties`,disabled:!(this.pipelineUid&&this.pipelineUid.length)},{title:this.$t("Collection Builder")}]}},methods:{...Object(o["b"])("mainStore",["upsertPipeline"]),reverseToLastSavedPrompt(){this.$q.dialog({component:d["a"],parent:this,title:this.$t("Confirm"),message:this.$t("Do you REALLY want to lose all your un-saved changes and revert to the last Saved version?"),persistent:!0}).onOk((()=>{this.reverseToLastSaved()}))},reverseToLastSaved(){try{const e=this.pipelines.find((e=>e.uid===this.pipelineUid));this.collectionConfig=e&&e.collectionConfig?JSON.parse(JSON.stringify(e.collectionConfig)):[],this.activeCollectionShipper=this.collectionConfig.collectionShipper,this.activeCollectionMethod=this.collectionConfig.collectionMethod,this.collectionShipper=this.activeCollectionShipper,this.collectionMethod=this.activeCollectionMethod,this.needsSaving=!1}catch{console.log("Can't parse JSON")}},save(){console.log(this.template),this.needsSaving=!1,this.upsertPipeline({caller:this,pushToApi:!0,pipeline:{uid:this.pipelineUid,status:this.pipeline&&this.pipeline.status&&"Ready"===this.pipeline.status?this.pipeline.status:"Dev",collectionConfig:JSON.parse(JSON.stringify(this.collectionConfig)),options:{...this.pipeline.options||{},identificationStyle:this.collectionMethodTemplate&&this.collectionMethodTemplate.identificationStyle?this.collectionMethodTemplate.identificationStyle:[]}}})},switchCollectionMethodPrompt(){console.log(this.collectionConfig),this.collectionConfig&&this.collectionConfig.collectionMethod&&this.collectionConfig.collectionMethod.length?this.$q.dialog({component:d["a"],parent:this,title:this.$t("Confirm"),message:this.$t("You will lose any un-saved changes and start fresh with the new Collection Method. Are you sure?"),persistent:!0}).onOk((()=>{this.switchCollectionMethod()})):this.switchCollectionMethod()},switchCollectionMethod(){if(this.activeCollectionShipper=this.collectionShipper&&this.collectionShipper.value?this.collectionShipper.value:this.collectionShipper,this.activeCollectionMethod=this.collectionMethod&&this.collectionMethod.value?this.collectionMethod.value:this.collectionMethod,!this.collectionConfig.collectionMethod||this.collectionConfig.collectionMethod!==this.activeCollectionMethod){const e={collectionShipper:this.activeCollectionShipper,collectionMethod:this.activeCollectionMethod};this.collectionMethodTemplate&&this.collectionMethodTemplate.initialDefaultValues&&Object.keys(this.collectionMethodTemplate.initialDefaultValues).forEach((t=>{e[t]=this.collectionMethodTemplate.initialDefaultValues[t]})),"filebeat"===this.activeCollectionShipper&&(e.enabled=!0,e.fields={stream_id:this.pipelineUid,stream_name:this.pipeline.name},"log"===this.activeCollectionMethod&&(e.paths=["/var/log/"+this.pipeline.name+"_"+this.pipeline.uid+"/*.log"]),"syslog_udp"===this.activeCollectionMethod&&(e["protocol.udp.host"]="0.0.0.0:514"),"syslog_tcp"===this.activeCollectionMethod&&(e["protocol.tcp.host"]="0.0.0.0:514",e["protocol.tcp.ssl.enabled"]=!1,e["protocol.tcp.ssl.certificate"]="/etc/filebeat/certificates/ez_stream_"+this.pipeline.uid+".crt",e["protocol.tcp.ssl.key"]="/etc/filebeat/certificates/ez_stream_"+this.pipeline.uid+".key",e["protocol.tcp.ssl.supported_protocols"]=["TLSv1.1","TLSv1.2","TLSv1.3"]),"httpjson"===this.activeCollectionMethod&&(e.config_version=2,e["request.url"]="https://CHANGE_THIS"),"genericbeat"===this.activeCollectionMethod&&(e.config_version=2,e["request.url"]="https://CHANGE_THIS")),"jsBeat"===this.activeCollectionShipper&&(e.uid=this.pipelineUid,e.name=this.pipeline.name,e.deviceType=this.pipeline.name.replace(/[^a-zA-Z0-9]/g,"_"),e.active=!0,e.filterHelpers={stream_id:this.pipelineUid,stream_name:this.pipeline.name},"flatFile"===this.activeCollectionMethod&&(e.baseDirectoryPath="/var/log/"+String(this.pipeline.name).replace(/\s/g,"_")+"_"+this.pipeline.uid+"/",e.inclusionFilter="*.log",e.multiLines={msgStartRegex:"",msgStopRegex:"",msgDelimiterRegex:""})),this.collectionMethodTemplate&&this.collectionMethodTemplate.identificationStyle&&Array.isArray(this.collectionMethodTemplate.identificationStyle)&&this.collectionMethodTemplate.identificationStyle.includes("logrhythmBeat")&&(e.beatIdentifier=String(this.pipeline.uid.substring(0,3)+"_"+this.pipeline.name.replace(/[^a-zA-Z0-9]/g,"_")+"_"+this.pipeline.uid).substring(0,12),e.logsource_name=this.pipeline.name),this.collectionConfig=e,this.needsSaving=!0}},buildYmlConfig(){console.log("buildYmlConfig"),this.activeCollectionMethod&&this.activeCollectionMethod.length?this.collectionConfigYml=Object(h["a"])(this.pipeline.collectionConfig):this.collectionConfigYml="# "+this.$t("No Collection Method configured.")},collectionShipperHasChanged(){console.log("collectionShipperHasChanged"),this.needsSaving=!0,this.showCollectionConfig&&this.buildYmlConfig()},collectionConfigHasChanged(){console.log("collectionConfigHasChanged"),this.needsSaving=!0,this.showCollectionConfig&&this.buildYmlConfig()}},mounted(){this.$route.params.pipelineUid&&this.$route.params.pipelineUid.length&&this.pipelineUid!==this.$route.params.pipelineUid&&(this.pipelineUid=this.$route.params.pipelineUid),this.reverseToLastSaved(),this.switchCollectionMethod()},watch:{collectionShipper:{handler(){this.collectionShipperHasChanged()},deep:!0},collectionConfig:{handler(){this.collectionConfigHasChanged()},deep:!0},showCollectionConfig:{handler(e){e&&this.buildYmlConfig()},deep:!1}}},f=u,g=(i("0b91"),i("2877")),y=i("9989"),b=i("e359"),v=i("b498"),C=i("65c6"),x=i("9c40"),S=i("eb85"),_=i("2c91"),q=i("4e73"),w=i("9564"),O=i("66e5"),M=i("4074"),V=i("0016"),$=i("c1d0"),k=i("f09f"),P=i("a370"),T=i("ddd8"),F=i("4b7e"),A=i("05c0"),j=i("3b73"),I=i("eebe"),N=i.n(I),E=Object(g["a"])(f,l,a,!1,null,"a942fc04",null);t["default"]=E.exports;N()(E,"components",{QPage:y["a"],QHeader:b["a"],QColor:v["a"],QToolbar:C["a"],QBtn:x["a"],QSeparator:S["a"],QSpace:_["a"],QMenu:q["a"],QToggle:w["a"],QItem:O["a"],QItemSection:M["a"],QIcon:V["a"],QSlider:$["a"],QCard:k["a"],QCardSection:P["a"],QSelect:T["a"],QCardActions:F["a"],QTooltip:A["a"],QExpansionItem:j["a"]})},ebc3:function(e,t,i){"use strict";var l=function(){var e=this,t=e._self._c;return t("form",[t("div",{staticClass:"row q-gutter-x-sm"},[e.isPartOfObject?t("q-input",{staticClass:"col-auto",staticStyle:{width:"20rem"},attrs:{outlined:"",readonly:!0},model:{value:e.leafName,callback:function(t){e.leafName=t},expression:"leafName"}}):e._e(),!e.template.required||e.isPartOfArray||e.isPartOfObject?e._e():t("q-separator",{attrs:{vertical:"",color:"orange",size:"3px"}}),t("div",{staticClass:"col"},[t("div",{staticClass:"row q-gutter-x-md"},[e.template.prefix?t("q-select",{staticStyle:{"min-width":"10rem"},attrs:{outlined:"","emit-value":"","map-options":"",options:e.template.prefix.options?e.template.prefix.options:[],readonly:!!e.template.readonly&&e.template.readonly},model:{value:e.internalPrefix,callback:function(t){e.internalPrefix=t},expression:"internalPrefix"}}):e._e(),e.template.type&&e.template.type.name&&("string"===e.template.type.name||"regex"===e.template.type.name||"number"===e.template.type.name||"password"===e.template.type.name)?t("q-input",{staticClass:"col",class:e.template.type&&e.template.type.textType&&"json"===e.template.type.textType?"fixed-font":"",attrs:{outlined:"",readonly:e.template.readonly?e.template.readonly:e.isPartOfObject&&e.leafInObject&&("stream_id"===e.leafInObject||"stream_name"===e.leafInObject),type:e.template.type&&e.template.type.name&&"password"===e.template.type.name&&!e.showPassword?"password":"text",autogrow:e.template.type&&e.template.type.multilines&&!0===e.template.type.multilines},on:{blur:function(t){e.inFocus=!1},focus:function(t){e.inFocus=!0}},scopedSlots:e._u([{key:"append",fn:function(){return[e.waitingForBackend?t("q-spinner"):e._e(),e.template.obfuscation&&e.template.obfuscation.method&&e.template.obfuscation.method.length&&e.updateErrorMessage&&e.updateErrorMessage.length?t("q-icon",{attrs:{name:"o_error",color:e.inFocus?"red-10":"alert"}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                "+e._s(e.$t("Failed to obfuscate the Secret. Error message:"))),t("br"),t("span",{staticClass:"text-italic"},[e._v(e._s(e.updateErrorMessage))])])],1):e._e(),e.template.obfuscation&&e.template.obfuscation.method&&e.template.obfuscation.method.length&&e.obfuscationRequirementNotMet?t("q-icon",{attrs:{name:"o_warning",color:e.inFocus?"orange-10":"warning"}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                "+e._s(e.$t("This Secret must be obfuscated/encrypted to produce a valid configuration"))+"\n              ")])],1):e._e(),e.template.obfuscation&&e.template.obfuscation.method&&e.template.obfuscation.method.length?t("q-icon",{class:e.obfuscationRequirementNotMet?"cursor-pointer":"",attrs:{name:e.obfuscationRequirementNotMet?"o_lock_open":"o_lock",color:e.obfuscationRequirementNotMet?e.inFocus?"orange-10":"warning":e.inFocus?"green-10":"positive"},on:{click:e.obfuscateSecret}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e.obfuscationRequirementNotMet?t("span",[e._v(e._s(e.$t("Obfuscate/encrypt this Secret")))]):t("span",[e._v(e._s(e.$t("Your Secret is properly obfuscated")))])])],1):e._e(),e.template.type&&e.template.type.name&&"password"===e.template.type.name?t("q-separator",{attrs:{spaced:"",inset:"",vertical:""}}):e._e(),e.template.type&&e.template.type.name&&"password"===e.template.type.name?t("q-icon",{staticClass:"cursor-pointer",attrs:{name:e.showPassword?"o_visibility":"o_visibility_off"},on:{click:function(t){e.showPassword=!e.showPassword}}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e.showPassword?t("span",[e._v(e._s(e.$t("Hide Secret")))]):t("span",[e._v(e._s(e.$t("Show Secret")))])])],1):e._e()]},proxy:!0}],null,!1,4139090932),model:{value:e.internalValue,callback:function(t){e.internalValue=t},expression:"internalValue"}}):e._e(),e.template.type&&e.template.type.name&&"array"===e.template.type.name?t("div",{staticClass:"q-gutter-y-sm col"},[e._l(e.internalValue&&Array.isArray(e.internalValue)?e.internalValue:[],(function(i,l){return t("FieldEditor",{key:l,attrs:{template:e.template&&e.template.type&&e.template.type.of?e.template.type.of:{},isPartOfArray:!0,indexInArray:l},on:{deleteSubField:e.deleteSubFieldEvent},model:{value:e.internalValue[l],callback:function(t){e.$set(e.internalValue,l,t)},expression:"internalValue[subFieldIndex]"}})})),t("q-btn",{attrs:{"no-caps":"",dense:"",icon:"add",label:e.$t("Add Item"),color:"primary"},on:{click:function(t){return e.addValueToArray()}}})],2):e._e(),e.template.type&&e.template.type.name&&"object"===e.template.type.name?t("div",{staticClass:"q-gutter-y-sm col"},[e._l(e.internalValue&&"object"===typeof e.internalValue?e.internalValue:{},(function(i,l){return t("FieldEditor",{key:l,attrs:{template:e.template&&e.template.type&&e.template.type.of?e.template.type.of:{},isPartOfObject:!0,leafInObject:l},on:{deleteSubField:e.deleteSubFieldEvent},model:{value:e.internalValue[l],callback:function(t){e.$set(e.internalValue,l,t)},expression:"internalValue[subFieldLeafName]"}})})),t("q-btn",{attrs:{"no-caps":"",dense:"",icon:"add",label:e.$t("Add Item"),color:"primary"},on:{click:function(t){return e.addValueToObject()}}})],2):e._e(),e.template.type&&e.template.type.name&&("boolean"===e.template.type.name||"option"===e.template.type.name)?t("q-select",{staticClass:"col",attrs:{outlined:"","emit-value":"","map-options":"",options:e.template.options?e.template.options:"boolean"===e.template.type.name?[{value:!0,label:e.$t("True")},{value:!1,label:e.$t("False")}]:[],readonly:!!e.template.readonly&&e.template.readonly},model:{value:e.internalValue,callback:function(t){e.internalValue=t},expression:"internalValue"}}):e._e(),e.template.type&&e.template.type.name&&"file"===e.template.type.name?t("div",[t("div",{staticClass:"flex q-gutter-lg"},[e.internalValue&&e.internalValue.fileContentBase64&&e.internalValue.fileContentBase64.length?t("div",[t("div",[e._v("File attached.")]),t("div",[e._v("("+e._s(e.internalValue.fileSizeBytes)+" bytes)")])]):t("div",[t("div",[e._v("No file attached.")])]),t("div",{staticClass:"q-gutter-x-md"},[t("q-btn",{attrs:{"no-caps":"",dense:"",icon:"o_note_add",label:e.$t("Load File"),color:e.internalValue&&e.internalValue.fileContentBase64&&e.internalValue.fileContentBase64.length?void 0:"primary",disabled:e.showFileUpload},on:{click:function(t){e.fileToUpload=null,e.showFileUpload=!0}}}),t("q-btn",{attrs:{icon:"o_delete","text-color":"negative",disabled:!(e.internalValue&&e.internalValue.fileContentBase64&&e.internalValue.fileContentBase64.length)}},[e.internalValue&&e.internalValue.fileContentBase64&&e.internalValue.fileContentBase64.length?t("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                  "+e._s(e.$t("Delete"))+"\n                ")]):e._e(),t("q-menu",{attrs:{anchor:"top end",self:"top left","auto-close":"","content-class":"bg-negative text-white"}},[t("q-list",{attrs:{dense:""}},[t("q-item",{attrs:{clickable:""},on:{click:function(t){e.internalValue=null}}},[t("q-item-section",[e._v(e._s(e.$t("Confirm")))])],1)],1)],1)],1)],1)]),e.template.type&&e.template.type.name&&"file"===e.template.type.name&&e.showFileUpload?t("div",{staticClass:"flex q-mt-sm"},[t("q-file",{staticStyle:{width:"26em"},attrs:{filled:"","bottom-slots":"",label:e.$t("Click or Drop a file here"),"input-style":"width: 24em;max-width: 24em;height: 4em;","max-file-size":e.template.fileOptions&&e.template.fileOptions.maxFileSize?e.template.fileOptions.maxFileSize:void 0},scopedSlots:e._u([{key:"append",fn:function(){return[null!==e.fileToUpload&&""!==e.fileToUpload?t("q-icon",{staticClass:"cursor-pointer",attrs:{name:"o_close"},on:{click:function(t){t.stopPropagation(),e.fileToUpload=null}}}):e._e()]},proxy:!0}],null,!1,675816022),model:{value:e.fileToUpload,callback:function(t){e.fileToUpload=t},expression:"fileToUpload"}}),t("q-separator",{attrs:{spaced:"",vertical:""}}),t("div",{staticClass:"column justify-between"},[t("q-btn",{staticClass:"q-mb-sm",attrs:{"no-caps":"",dense:"",icon:"o_upload_file",label:e.$t("Load"),color:"primary"},on:{click:function(t){return e.loadFile(e.fileToUpload)}}}),t("q-btn",{attrs:{"no-caps":"",dense:"",label:e.$t("Cancel")},on:{click:function(t){e.showFileUpload=!1}}})],1)],1):e._e()]):e._e(),e.template.suffix?t("q-select",{staticStyle:{"min-width":"10rem"},attrs:{outlined:"","emit-value":"","map-options":"",options:e.template.suffix.options?e.template.suffix.options:[],readonly:!!e.template.readonly&&e.template.readonly},model:{value:e.internalSuffix,callback:function(t){e.internalSuffix=t},expression:"internalSuffix"}}):e._e()],1),!e.template.min&&!e.template.max||e.template.readonly&&e.template.readonly?e._e():t("q-slider",{attrs:{min:e.template.min||0,max:e.template.max||100,label:"","label-value":(e.internalPrefixLong&&e.internalPrefixLong.length?e.internalPrefixLong+" ":"")+e.formatNumber(e.internalValue)+(e.internalSuffixLong&&e.internalSuffixLong.length?" "+e.internalSuffixLong:"")},model:{value:e.internalValue,callback:function(t){e.internalValue=t},expression:"internalValue"}}),e.template.description&&e.template.description.length?t("div",{staticClass:"q-mt-xs row",staticStyle:{opacity:".7"}},[t("q-icon",{staticClass:"col-auto q-mr-sm",attrs:{name:"o_info",size:"xs",color:"blue"}}),t("q-markdown",{staticClass:"col",attrs:{src:e.template.description,"no-heading-anchor-links":""}})],1):e._e()],1),e.isPartOfArray||e.isPartOfObject?t("q-separator",{attrs:{vertical:""}}):e._e(),e.isPartOfArray||e.isPartOfObject?t("div",{staticClass:"q-mx-sm items-center justify-center column"},[t("q-btn",{staticClass:"full-height",attrs:{icon:"delete","text-color":"negative",disabled:e.isPartOfObject&&e.leafInObject&&("stream_id"===e.leafInObject||"stream_name"===e.leafInObject)},on:{click:function(t){return e.deleteSubFieldPrompt()}}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n          "+e._s(e.$t("Delete entry"))+"\n        ")])],1)],1):e._e()],1)])},a=[],o=i("1d8c"),n=o["a"],s=(i("632c"),i("2877")),r=i("27f9"),c=i("eb85"),p=i("ddd8"),h=i("0d59"),d=i("0016"),m=i("05c0"),u=i("9c40"),f=i("4e73"),g=i("1c1c"),y=i("66e5"),b=i("4074"),v=i("7d53"),C=i("c1d0"),x=i("eebe"),S=i.n(x),_=Object(s["a"])(n,l,a,!1,null,null,null);t["a"]=_.exports;S()(_,"components",{QInput:r["a"],QSeparator:c["a"],QSelect:p["a"],QSpinner:h["a"],QIcon:d["a"],QTooltip:m["a"],QBtn:u["a"],QMenu:f["a"],QList:g["a"],QItem:y["a"],QItemSection:b["a"],QFile:v["a"],QSlider:C["a"]})},edcd:function(e,t,i){}}]);