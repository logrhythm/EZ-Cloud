(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[4],{"825d":function(e,t,a){"use strict";a("8839")},8839:function(e,t,a){},aeab:function(e,t,a){"use strict";a.r(t);var s=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("q-page",{staticClass:"flex flex-center"},[a("form",[a("q-card",{class:e.shakyClass?"computerSaysNo":"",staticStyle:{"min-width":"350px"}},[a("q-card-section",[a("div",{staticClass:"text-h6"},[e._v(e._s(e.$t("Sign in to OC Admin")))])]),a("q-card-section",{staticClass:"q-pt-none"},[a("q-input",{attrs:{dense:"",autofocus:"",hint:e.$t("Username"),rules:[function(t){return!!t||e.$t("Username is required")}]},on:{keyup:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.checkCredentials()}},model:{value:e.username,callback:function(t){e.username=t},expression:"username"}})],1),a("q-card-section",{staticClass:"q-pt-none"},[a("q-input",{attrs:{dense:"",type:"password",hint:e.$t("Password")},on:{keyup:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.checkCredentials()}},model:{value:e.password,callback:function(t){e.password=t},expression:"password"}})],1),a("q-card-section",{staticClass:"q-py-none"},[a("dir",{staticClass:"q-ma-none q-px-sm text-bold text-negative text-center fadeOut"},[a("span",{directives:[{name:"show",rawName:"v-show",value:e.lastAttemptFailed,expression:"lastAttemptFailed"}]},[e._v(e._s(e.$t("Authentication failed.")))]),e._v(" \n        ")])],1),a("q-card-actions",{attrs:{align:"between"}},[a("q-toggle",{staticClass:"q-my-sm",attrs:{"checked-icon":"dark_mode","unchecked-icon":"light_mode",color:"grey","keep-color":""},model:{value:e.darkMode,callback:function(t){e.darkMode=t},expression:"darkMode"}},[a("q-tooltip",{attrs:{"content-style":"font-size: 1em"}},[e._v("\n            "+e._s(e.$t("Switch between Light and Dark mode"))+"\n          ")])],1),a("q-btn",{attrs:{flat:"",icon:"translate"}},[a("q-menu",{attrs:{"auto-close":"",anchor:"bottom middle",self:"top middle"}},[a("q-list",{staticStyle:{"min-width":"10em"}},e._l(e.languageList,(function(t){return a("q-item",{key:t.value,staticClass:"text-center",attrs:{clickable:!t.selected},on:{click:function(a){return e.selectLanguage(t.value)}}},[a("q-item-section",{class:t.selected?"text-primary":""},[a("div",[e._v(e._s(t.nativeLabel))])])],1)})),1)],1)],1),a("q-btn",{staticClass:"q-my-sm",attrs:{flat:"",label:e.$t("Login"),color:"primary",loading:e.waitingOnServer},on:{click:function(t){return e.checkCredentials()}}})],1)],1)],1)])},n=[],i=a("2f62"),l=a("9fa1"),o=a("a87d"),r=a("d089"),c={name:"PageLogin",mixins:[l["a"],o["a"]],data(){return{username:"",password:"",waitingOnServer:!1,lastAttemptFailed:!1,shakyClass:!1,lastAttemptFailedTimer:null,shakyClassTime:null}},computed:{...Object(i["d"])("mainStore",["jwtToken"]),languageList(){return r["a"]&&Array.isArray(r["a"])?r["a"].reduce(((e,t)=>(e.push({...t,selected:!(String(t.value).toLowerCase()!==String(this.$i18n.locale).toLowerCase())}),e)),[]):[{value:"en-gb",nativeLabel:"English"}]}},methods:{...Object(i["b"])("mainStore",["signIn","signOut","reloadEzMarketNotifications"]),checkCredentials(){this.lastAttemptFailedTimer&&clearTimeout(this.lastAttemptFailedTimer),this.shakyClassTime&&clearTimeout(this.shakyClassTime),this.shakyClass=!1,this.lastAttemptFailed=!1,this.signIn({loadingVariableName:"waitingOnServer",caller:this,apiCallParams:{username:this.username,password:this.password},onSuccessCallBack:this.checkTokenAndMoveOn,onErrorCallBack:this.checkTokenAndMoveOn,debug:!1})},checkTokenAndMoveOn(){this.jwtToken&&this.jwtToken.length?(this.connectSocket(),this.reloadEzMarketNotifications(),this.$router.push("/Welcome")):(this.lastAttemptFailed=!0,this.shakyClass=!0,this.shakyClassTimer=setTimeout((()=>{this.shakyClass=!1}),1e3),this.lastAttemptFailedTimer=setTimeout((()=>{this.lastAttemptFailed=!1}),4800))},selectLanguage(e){Object(r["b"])(this,e)}},mounted(){this.signOut()}},d=c,u=(a("825d"),a("2877")),m=a("9989"),h=a("f09f"),k=a("a370"),p=a("27f9"),g=a("4b7e"),f=a("9564"),y=a("05c0"),C=a("9c40"),w=a("4e73"),v=a("1c1c"),b=a("66e5"),q=a("4074"),T=a("eebe"),x=a.n(T),A=Object(u["a"])(d,s,n,!1,null,null,null);t["default"]=A.exports;x()(A,"components",{QPage:m["a"],QCard:h["a"],QCardSection:k["a"],QInput:p["a"],QCardActions:g["a"],QToggle:f["a"],QTooltip:y["a"],QBtn:C["a"],QMenu:w["a"],QList:v["a"],QItem:b["a"],QItemSection:q["a"]})}}]);