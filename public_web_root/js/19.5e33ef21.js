(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[19],{a6ff:function(e,t,a){"use strict";a.r(t);var i=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("q-page",{staticClass:"q-pa-sm"},[a("q-header",{class:e.darkMode?"":"bg-grey-1",style:e.darkMode?"background: var(--q-color-dark);":"",attrs:{elevated:""}},[a("q-toolbar",{staticClass:"q-gutter-x-sm",class:e.darkMode?"":"text-black"},[a("q-btn",{attrs:{"no-caps":"",flat:"",dense:"",icon:"arrow_back",label:"Return to Market Place",to:"/MarketPlace"}}),a("q-separator",{attrs:{spaced:"",vertical:""}}),a("q-btn",{attrs:{"no-caps":"",flat:"",dense:"",icon:"mail_outline",color:"primary",label:e.$t("View Notifications"),to:"/MarketPlace/Notifications"}}),a("q-btn",{attrs:{"no-caps":"",flat:"",dense:"",icon:"account_tree",label:e.$t("View Pipeline Templates"),to:"/MarketPlace/PipelineTemplates"}}),a("q-toolbar-title",{staticClass:"text-center",staticStyle:{opacity:".4"}},[e._v("EZ Market Place : My Profile")])],1)],1),a("q-card",{staticClass:"q-pa-md q-mx-none"},[a("q-card-section",{attrs:{horizontal:""}},[a("q-card-section",{staticClass:"col q-ma-none q-pa-none"},[a("q-card-section",{staticClass:"text-h4"},[e._v("\n              "+e._s(e.$t("My Publisher Profile"))+"\n          ")]),e.editingPublisherName?e._e():a("q-card-section",{staticClass:"q-pt-none"},[a("div",{staticClass:"text-bold"},[e._v("Pseudo Name:")]),null==e.publisherDisplayName?a("div",{staticClass:"text-italic",staticStyle:{opacity:".6"}},[e._v("You don't seem to have a profile yet")]):a("div",[e._v(e._s(e.publisherDisplayName))])]),e.editingPublisherName?a("q-card-section",{staticClass:"q-pt-none"},[a("q-input",{attrs:{dense:"",autofocus:"",label:"New Publisher Pseudo Name",rules:[function(t){return!!t||e.$t("Publisher pseudo-name cannot be empty")}]},on:{keyup:[function(t){if(!t.type.indexOf("key")&&e._k(t.keyCode,"esc",27,t.key,["Esc","Escape"]))return null;e.editingPublisherName=!1},function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.saveProfileDetails()}]},model:{value:e.newPublisherName,callback:function(t){e.newPublisherName=t},expression:"newPublisherName"}})],1):e._e(),a("q-card-section",{staticClass:"q-pt-none"},[a("div",{staticClass:"text-bold"},[e._v("Identicon:")]),a("div",{staticClass:"row items-center q-gutter-x-md"},[a("Identicon",{attrs:{identity:e.publisherDisplayName}}),e.editingPublisherName?a("q-icon",{attrs:{name:"arrow_forward",size:"lg"}}):e._e(),e.editingPublisherName?a("Identicon",{attrs:{identity:e.newPublisherName}}):e._e()],1)])],1),a("q-separator",{attrs:{vertical:""}}),a("q-card-actions",{staticClass:"justify-around q-px-md",attrs:{vertical:""}},[a("q-btn",{attrs:{icon:"edit",loading:e.dataLoading,color:"primary",disabled:e.editingPublisherName},on:{click:function(t){return e.editProfileDetails()}}},[e.editingPublisherName?e._e():a("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                "+e._s(e.$t("Reload"))+"\n              ")])],1),a("q-btn",{attrs:{icon:"save",loading:e.dataSaving,color:"secondary",disabled:!e.editingPublisherName},on:{click:function(t){return e.saveProfileDetails()}}},[e.editingPublisherName?a("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                "+e._s(e.$t("Reload"))+"\n              ")]):e._e()],1),a("q-btn",{attrs:{icon:"refresh",loading:e.dataLoading},on:{click:function(t){return e.reloadEzMarketPublisherDetails({})}}},[a("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n                "+e._s(e.$t("Reload"))+"\n              ")])],1)],1)],1)],1)],1)},s=[],l=a("2f62"),r=a("a87d"),n=a("da35"),o={name:"PageMarketPublisherProfile",mixins:[r["a"]],components:{Identicon:n["a"]},data(){return{dataLoading:!1,dataSaving:!1,editingPublisherName:!1,newPublisherName:null}},computed:{...Object(l["d"])("mainStore",["ezMarketNotification","ezMarketNotifications","ezMarketPublisherDetails"]),publisherDisplayName(){return this.ezMarketPublisherDetails?this.ezMarketPublisherDetails.displayName:null}},methods:{...Object(l["b"])("mainStore",["loadEzMarketPublisherDetails","createEzMarketPublisher","updateEzMarketPublisherDetails"]),reloadEzMarketPublisherDetails(){this.dataLoading=!0,this.loadEzMarketPublisherDetails({onSuccessCallBack:this.ezMarketPublisherDetailsLoaded,onErrorCallBack:this.ezMarketPublisherDetailsLoaded})},ezMarketPublisherDetailsLoaded(e){this.dataLoading=!1,e&&e.data&&(this.newPublisherName=e.data.displayName)},editProfileDetails(){this.newPublisherName=this.publisherDisplayName,this.editingPublisherName=!0},saveProfileDetails(){this.editingPublisherName=!1,this.dataSaving=!0,null==this.publisherDisplayName?this.createEzMarketPublisher({toName:this.newPublisherName,onSuccessCallBack:this.ezMarketPublisherDetailsSaved,onErrorCallBack:this.ezMarketPublisherDetailsSaved}):this.updateEzMarketPublisherDetails({toName:this.newPublisherName,onSuccessCallBack:this.ezMarketPublisherDetailsSaved,onErrorCallBack:this.ezMarketPublisherDetailsSaved})},ezMarketPublisherDetailsSaved(){this.dataSaving=!1,this.reloadEzMarketPublisherDetails()}},mounted(){this.ezMarketPublisherDetails&&null!=this.ezMarketPublisherDetails.displayName||this.reloadEzMarketPublisherDetails({})}},c=o,d=a("2877"),u=a("9989"),h=a("e359"),b=a("b498"),P=a("65c6"),m=a("9c40"),p=a("eb85"),k=a("6ac5"),f=a("f09f"),N=a("a370"),q=a("27f9"),y=a("0016"),v=a("4b7e"),M=a("05c0"),g=a("eebe"),D=a.n(g),z=Object(d["a"])(c,i,s,!1,null,null,null);t["default"]=z.exports;D()(z,"components",{QPage:u["a"],QHeader:h["a"],QColor:b["a"],QToolbar:P["a"],QBtn:m["a"],QSeparator:p["a"],QToolbarTitle:k["a"],QCard:f["a"],QCardSection:N["a"],QInput:q["a"],QIcon:y["a"],QCardActions:v["a"],QTooltip:M["a"]})}}]);