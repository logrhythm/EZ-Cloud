(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[13],{d617:function(s,t,e){"use strict";e.r(t);var a=function(){var s=this,t=s._self._c;return t("q-page",{staticClass:"q-pa-sm"},[t("q-header",{class:s.darkMode?"":"bg-grey-1",style:s.darkMode?"background: var(--q-color-dark);":"",attrs:{elevated:""}},[t("q-toolbar",{staticClass:"q-gutter-x-sm",class:s.darkMode?"":"text-black"},[t("q-btn",{attrs:{"no-caps":"",flat:"",dense:"",icon:"arrow_back",label:s.$t("Return to Admin"),to:"/Admin"}}),t("q-separator",{attrs:{spaced:"",vertical:""}}),t("q-btn",{attrs:{"no-caps":"",flat:"",dense:"",icon:"update",label:s.$t("Update Database"),to:"/Admin/SIEM/UpdateEmdb"}}),t("q-toolbar-title",{staticClass:"text-center",staticStyle:{opacity:".4"}},[s._v(s._s(s.$t("Admin : SIEM : Manage MS SQL Connection")))])],1)],1),t("q-card",{},[t("q-card-section",{attrs:{horizontal:""}},[t("q-card-section",{staticClass:"col q-ma-none q-pa-none"},[t("q-card-section",{staticClass:"text-h4"},[s._v("\n            "+s._s(s.$t("MS SQL Connection"))+"\n        ")]),t("q-card-section",{staticClass:"q-pt-none"},[s._v("\n          "+s._s(s.$t("OC-Admin backend needs access to the SIEM database for certain operations, like listing and managing the OpenCollector and OC-Admin related Log Sources."))),t("br"),s._v("\n          "+s._s(s.$t("To accomplish this, it needs to know the PM or XM address and SQL credentials."))+"\n        ")]),s.managedOnBackend?t("div",[t("q-card-section",{staticClass:"q-pt-none"},[s._v("\n            "+s._s(s.$t("The MS SQL connection configuration is managed on the Backend."))+"\n          ")]),t("q-card-section",{staticClass:"q-pt-none"},[s._v("\n            "+s._s(s.$t("Nothing to do here."))+"\n          ")])],1):t("div",[t("q-card-section",{staticClass:"q-pt-none"},[t("q-input",{attrs:{dense:"",disable:s.loadingMsSqlConfig,label:s.$t("Hostname (XM or Platform Manager)"),autofocus:"",rules:[t=>!!t||s.$t("Hostname cannot be empty")]},model:{value:s.siemMsSqlHost,callback:function(t){s.siemMsSqlHost=t},expression:"siemMsSqlHost"}})],1),t("q-card-section",{staticClass:"q-pt-none"},[t("q-input",{attrs:{dense:"",disable:s.loadingMsSqlConfig,label:s.$t("MS SQL Port"),type:"number",rules:[t=>null!==t&&""!==t||s.$t("Port must be specified"),s=>s>=1&&s<=65535||"Port should be between 1 and 65535. Standard MS SQL port is 1433."]},model:{value:s.siemMsSqlPort,callback:function(t){s.siemMsSqlPort=t},expression:"siemMsSqlPort"}})],1),t("q-card-section",{staticClass:"q-pt-none"},[t("q-input",{attrs:{dense:"",disable:s.loadingMsSqlConfig,label:s.$t("Username"),rules:[t=>!!t||s.$t("Username cannot be empty")]},model:{value:s.siemMsSqlUsername,callback:function(t){s.siemMsSqlUsername=t},expression:"siemMsSqlUsername"}})],1),t("q-card-section",{staticClass:"q-pt-none"},[t("q-input",{attrs:{dense:"",disable:s.loadingMsSqlConfig,type:"password",label:s.$t("Password"),rules:[t=>!!t||s.$t("Really?! An empty Password?")]},model:{value:s.siemMsSqlPassword,callback:function(t){s.siemMsSqlPassword=t},expression:"siemMsSqlPassword"}})],1),t("q-card-section",{staticClass:"q-pt-none q-mb-md"},[t("q-toggle",{attrs:{disable:s.loadingMsSqlConfig,label:s.$t("Encrypt traffic"),"left-label":"","checked-icon":"lock","unchecked-icon":"warning",color:!0===s.siemMsSqlEncrypt?"positive":"warning","keep-color":"",size:"4rem"},model:{value:s.siemMsSqlEncrypt,callback:function(t){s.siemMsSqlEncrypt=t},expression:"siemMsSqlEncrypt"}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[s._v("\n                "+s._s(s.$t("Enable encryption between OC-Admin backend and MS SQL on the XM or Platform Manager (PM)"))+"\n              ")])],1)],1)],1)],1),t("q-separator",{attrs:{vertical:""}}),t("q-card-actions",{staticClass:"justify-around q-px-md",attrs:{vertical:""}},[t("q-btn",{attrs:{icon:"save",color:"primary",loading:s.savingAction,disabled:!s.readyToSave},on:{click:function(t){return s.saveSettings()}}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[s._v("\n              "+s._s(s.$t("Save settings"))+"\n            ")])],1),t("q-btn",{attrs:{icon:"refresh",loading:s.loadingMsSqlConfig},on:{click:function(t){return s.loadMsSqlConfig()}}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[s._v("\n              "+s._s(s.$t("Reload"))+"\n            ")])],1)],1)],1)],1),t("q-dialog",{attrs:{persistent:""},model:{value:s.promptForDatabaseUpgrade,callback:function(t){s.promptForDatabaseUpgrade=t},expression:"promptForDatabaseUpgrade"}},[t("q-card",{staticStyle:{"min-width":"350px","max-width":"450px"}},[t("q-card-section",[t("div",{staticClass:"text-h6"},[s._v(s._s(s.$t("Success")))])]),t("q-card-section",{staticClass:"q-pt-none"},[t("div",{},[s._v(s._s(s.$t("Now that the MS SQL Connection is configured, the Database must be updated for all the features of OC Admin to work.")))])]),t("q-separator"),t("q-card-actions",{staticClass:"text-primary",attrs:{align:"right"}},[t("q-btn",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{flat:"",label:s.$t("Close")}}),t("q-btn",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{color:"primary",icon:"update",label:s.$t("Update Database"),to:"/Admin/SIEM/UpdateEmdb"}})],1)],1)],1)],1)},n=[],o=e("2f62"),i=e("a87d"),l={name:"PageAdminSiemMsSQL",mixins:[i["a"]],data(){return{loadingMsSqlConfig:!1,savingAction:!1,siemMsSqlHost:null,siemMsSqlPort:1433,siemMsSqlUsername:null,siemMsSqlPassword:null,siemMsSqlEncrypt:!0,promptForDatabaseUpgrade:!1}},computed:{...Object(o["d"])("mainStore",["msSqlConfig","extraInformation"]),readyToSave(){return this.siemMsSqlHost&&this.siemMsSqlHost.length&&this.siemMsSqlPort>=1&&this.siemMsSqlPort<=65535&&this.siemMsSqlUsername&&this.siemMsSqlUsername.length&&!this.managedOnBackend},managedOnBackend(){return this.msSqlConfig&&!0===this.msSqlConfig.isManagedOnBackend}},methods:{...Object(o["b"])("mainStore",["getMsSqlConfig","updateMsSqlConfig","updateExtraInformation"]),saveSettings(){this.saveOrUpdateMsSqlConnectionConfiguration()},prepVariables(){if(this.msSqlConfig)if(this.siemMsSqlHost=this.msSqlConfig.host,this.siemMsSqlPort=this.msSqlConfig.port,this.siemMsSqlUsername=this.msSqlConfig.username,this.siemMsSqlPassword=this.msSqlConfig.password,this.siemMsSqlEncrypt=!!this.msSqlConfig.encrypt,this.msSqlConfig.host&&this.msSqlConfig.host.length){if(this.extraInformation&&this.extraInformation.msSqlConnectionConfigMissing){const s=Object.assign({},this.extraInformation);s.msSqlConnectionConfigMissing=!1,this.updateExtraInformation({extraInformation:s})}}else{const s=Object.assign({},this.extraInformation);s.msSqlConnectionConfigMissing=!0,this.updateExtraInformation({extraInformation:s})}},loadMsSqlConfig(){this.getMsSqlConfig({loadingVariableName:"loadingMsSqlConfig",caller:this,onSuccessCallBack:this.prepVariables})},saveOrUpdateMsSqlConnectionConfiguration(){this.updateMsSqlConfig({host:this.siemMsSqlHost,port:this.siemMsSqlPort,username:this.siemMsSqlUsername,password:this.siemMsSqlPassword,encrypt:this.siemMsSqlEncrypt,loadingVariableName:"loadingMsSqlConfig",caller:this,onSuccessCallBack:this.saveOrUpdateMsSqlConfigSuccess,onErrorCallBack:this.saveOrUpdateMsSqlConfigFailure})},saveOrUpdateMsSqlConfigSuccess(s){this.loadMsSqlConfig(),this.promptForDatabaseUpgrade=!0},saveOrUpdateMsSqlConfigFailure(s){this.$root.$emit("addAndShowErrorToErrorPanel",s),this.loadMsSqlConfig()}},mounted(){this.msSqlConfig&&this.msSqlConfig.config&&this.msSqlConfig.config.server.length||this.loadMsSqlConfig()}},r=l,c=e("2877"),d=e("9989"),m=e("e359"),q=e("b498"),p=e("65c6"),S=e("9c40"),g=e("eb85"),f=e("6ac5"),M=e("f09f"),h=e("a370"),u=e("27f9"),C=e("9564"),b=e("05c0"),v=e("4b7e"),k=e("24e8"),y=e("7f67"),w=e("eebe"),x=e.n(w),P=Object(c["a"])(r,a,n,!1,null,null,null);t["default"]=P.exports;x()(P,"components",{QPage:d["a"],QHeader:m["a"],QColor:q["a"],QToolbar:p["a"],QBtn:S["a"],QSeparator:g["a"],QToolbarTitle:f["a"],QCard:M["a"],QCardSection:h["a"],QInput:u["a"],QToggle:C["a"],QTooltip:b["a"],QCardActions:v["a"],QDialog:k["a"]}),x()(P,"directives",{ClosePopup:y["a"]})}}]);