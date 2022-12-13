(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[26],{a445:function(e,t,a){"use strict";a.r(t);var s=function(){var e=this,t=e._self._c;return t("q-page",{staticClass:"q-gutter-y-sm q-pa-xl"},[e.devMode?t("q-card",{},[t("q-card-section",{attrs:{horizontal:""}},[t("q-card-section",{staticClass:"col q-ma-none q-pa-none"},[t("q-card-section",{staticClass:"text-h4 q-gutter-x-md"},[t("q-icon",{attrs:{name:"o_api"}}),t("span",[e._v(e._s(e.$t("EZ Backend Base URLs")))])],1),t("q-card-section",[t("q-input",{attrs:{outlined:"",label:e.$t("Website"),autofocus:""},model:{value:e.ezBackendBaseUrlWeb,callback:function(t){e.ezBackendBaseUrlWeb=t},expression:"ezBackendBaseUrlWeb"}})],1),t("q-card-section",[t("q-input",{attrs:{outlined:"",label:e.$t("API")},model:{value:e.ezBackendBaseUrlApi,callback:function(t){e.ezBackendBaseUrlApi=t},expression:"ezBackendBaseUrlApi"}})],1),t("q-card-section",[t("q-input",{attrs:{outlined:"",label:e.$t("Socket")},model:{value:e.ezBackendBaseUrlSocket,callback:function(t){e.ezBackendBaseUrlSocket=t},expression:"ezBackendBaseUrlSocket"}})],1)],1),t("q-separator",{attrs:{vertical:""}}),t("q-card-actions",{staticClass:"justify-around q-px-md",attrs:{vertical:""}},[t("q-btn",{attrs:{color:"primary",icon:"save",loading:e.savingAction},on:{click:function(t){return e.saveSettings()}}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n            "+e._s(e.$t("Save settings to local web browser."))+"\n          ")])],1)],1)],1)],1):e._e(),t("q-card",{staticClass:"q-pa-md q-mx-none"},[t("q-card-section",{staticClass:"col"},[t("div",{staticClass:"text-h4 q-gutter-x-md"},[t("q-icon",{attrs:{name:"o_brightness_medium"}}),t("span",[e._v(e._s(e.$t("Theme")))])],1),t("q-toggle",{attrs:{"checked-icon":"dark_mode","unchecked-icon":"light_mode",color:"grey",size:"4rem","keep-color":""},model:{value:e.darkMode,callback:function(t){e.darkMode=t},expression:"darkMode"}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n          "+e._s(e.$t("Switch between Light and Dark mode"))+"\n        ")])],1)],1)],1),t("q-card",[t("q-card-section",{attrs:{horizontal:""}},[t("q-card-section",{staticClass:"col q-ma-none q-pa-none"},[t("q-card-section",{staticClass:"text-h4 q-gutter-x-md"},[t("q-icon",{attrs:{name:"o_translate"}}),t("span",[e._v(e._s(e.$t("Language")))])],1),t("q-card-section",[t("q-select",{staticStyle:{"min-width":"150px"},attrs:{options:e.langOptions,outlined:"","emit-value":"","map-options":""},model:{value:e.selectedLanguage,callback:function(t){e.selectedLanguage=t},expression:"selectedLanguage"}})],1)],1),t("q-separator",{attrs:{vertical:""}}),t("q-card-actions",{staticClass:"justify-around q-px-md",attrs:{vertical:""}},[t("q-btn",{attrs:{color:"primary",icon:"save",loading:e.savingAction},on:{click:function(t){return e.saveLanguageSettings()}}},[t("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n            "+e._s(e.$t("Save settings to local web browser."))+"\n          ")])],1)],1)],1)],1)],1)},n=[],c=a("a87d"),l=a("d089"),o={name:"PageSettings",mixins:[c["a"]],data(){return{savingAction:!1,ezBackendBaseUrlWeb:"",ezBackendBaseUrlApi:"",ezBackendBaseUrlSocket:"",selectedLanguage:this.$i18n.locale}},computed:{devMode(){return!1},langOptions(){return l["a"]&&Array.isArray(l["a"])?l["a"].reduce(((e,t)=>(e.push({...t,label:t.value!==this.$i18n.locale?`${this.$t(t.label)} - ${t.nativeLabel}`:t.nativeLabel}),e)),[]):l["a"]}},methods:{saveSettings(){this.globalConstants.baseUrl.website=this.ezBackendBaseUrlWeb,localStorage.setItem("settings.ezBackend.url.website",this.ezBackendBaseUrlWeb),this.globalConstants.baseUrl.api=this.ezBackendBaseUrlApi,localStorage.setItem("settings.ezBackend.url.api",this.ezBackendBaseUrlApi),this.globalConstants.baseUrl.socket=this.ezBackendBaseUrlSocket,localStorage.setItem("settings.ezBackend.url.socket",this.ezBackendBaseUrlSocket)},saveLanguageSettings(){Object(l["b"])(this,this.selectedLanguage)}},mounted(){this.ezBackendBaseUrlWeb=localStorage.getItem("settings.ezBackend.url.website"),null!==this.ezBackendBaseUrlWeb&&""!==this.ezBackendBaseUrlWeb||(this.ezBackendBaseUrlWeb=this.globalConstants.baseUrl.website),this.ezBackendBaseUrlApi=localStorage.getItem("settings.ezBackend.url.api"),null!==this.ezBackendBaseUrlApi&&""!==this.ezBackendBaseUrlApi||(this.ezBackendBaseUrlApi=this.globalConstants.baseUrl.api),this.ezBackendBaseUrlSocket=localStorage.getItem("settings.ezBackend.url.socket"),null!==this.ezBackendBaseUrlSocket&&""!==this.ezBackendBaseUrlSocket||(this.ezBackendBaseUrlSocket=this.globalConstants.baseUrl.socket)}},i=o,r=a("2877"),d=a("9989"),k=a("f09f"),u=a("a370"),B=a("0016"),g=a("27f9"),p=a("eb85"),b=a("4b7e"),h=a("9c40"),m=a("05c0"),q=a("9564"),z=a("ddd8"),U=a("eebe"),v=a.n(U),S=Object(r["a"])(i,s,n,!1,null,null,null);t["default"]=S.exports;v()(S,"components",{QPage:d["a"],QCard:k["a"],QCardSection:u["a"],QIcon:B["a"],QInput:g["a"],QSeparator:p["a"],QCardActions:b["a"],QBtn:h["a"],QTooltip:m["a"],QToggle:q["a"],QSelect:z["a"]})}}]);