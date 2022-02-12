(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[1],{"713b":function(e,t,a){"use strict";a.r(t);var i=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("q-layout",{attrs:{view:"lHh lpR fFf"}},[a("q-drawer",{staticClass:"column",attrs:{"show-if-above":"",mini:e.miniState,"mini-to-overlay":"",width:200,breakpoint:500,bordered:""},on:{mouseover:function(t){e.miniState=!1},mouseout:function(t){e.miniState=!0}},model:{value:e.drawerMenuOpen,callback:function(t){e.drawerMenuOpen=t},expression:"drawerMenuOpen"}},[a("div",{staticClass:"yep fit column"},[a("div",{staticClass:"col"},[a("q-scroll-area",{staticClass:"fit"},[a("q-list",{attrs:{padding:""}},e._l(e.mainLinks,(function(t){return a("EssentialLink",e._b({key:t.title},"EssentialLink",t,!1))})),1)],1)],1),a("q-list",{staticClass:"col-auto"},[e.socket.connected?e._e():a("q-item",[a("q-tooltip",{attrs:{"content-style":"font-size: 1rem;"}},[e._v("\n          Live connection with server has been lost."),a("br"),e._v("\n          Some features might not work anymore.\n        ")]),a("q-item-section",{attrs:{avatar:""}},[a("q-icon",{attrs:{name:"cloud_off",color:"orange"}})],1),a("q-item-section",[a("q-item-label",{staticClass:"text-orange"},[e._v("Disconnected")])],1)],1),e.socket.connected?e._e():a("q-separator",{staticClass:"q-my-xs"}),e._l(e.lowLinks,(function(t,i){return a("EssentialLink",e._b({directives:[{name:"show",rawName:"v-show",value:!t.needsPriviledge||t.needsPriviledge&&e.loggedInUserIsPrivileged,expression:"!link.needsPriviledge || (link.needsPriviledge && loggedInUserIsPrivileged)"}],key:i},"EssentialLink",t,!1))}))],2),a("div",{staticClass:"text-center"},[a("span",{staticStyle:{opacity:".4","font-size":".75em"}},[e._v("v"+e._s(e.version))])])],1)]),a("q-page-container",[a("router-view")],1),a("q-dialog",{attrs:{persistent:""},model:{value:e.showErrorPanel,callback:function(t){e.showErrorPanel=t},expression:"showErrorPanel"}},[a("q-card",{staticStyle:{"min-width":"350px"}},[a("q-card-section",{staticClass:"q-pb-none"},[a("div",{staticClass:"text-h6"},[e._v(e._s(e.$t("What did just go wrong?")))])]),e.errorPanelDetails&&Array.isArray(e.errorPanelDetails)&&e.errorPanelDetails.length>1?a("q-card-section",{staticClass:"q-pt-none"},[a("div",{staticClass:"text-bold text-italic"},[e._v(e._s(e.errorPanelDetails.length)+" errors occured.")])]):e.errorPanelDetails&&Array.isArray(e.errorPanelDetails)?a("q-card-section",{staticClass:"q-pt-none"},[a("div",{staticClass:"text-bold text-italic"},[e._v(e._s(e.errorPanelDetails.length)+" error occured.")])]):e._e(),e._l(e.errorPanelDetails,(function(t,i){return a("q-card-section",{key:i},[a("div",{},[a("div",{staticClass:"row q-my-sm"},[a("q-separator",{attrs:{vertical:"",size:"2px",color:"orange"}}),a("div",{staticClass:"q-ml-sm"},[a("div",{staticClass:"text-overline"},[e._v("Message Code:")]),a("div",{staticClass:"q-ml-sm text-bold"},[e._v(e._s(t.code))]),a("div",{staticClass:"q-mt-sm text-overline"},[e._v("Message:")]),a("div",{staticClass:"q-ml-sm text-italic"},[e._v(e._s(t.message))]),a("div",{staticClass:"q-mt-sm text-overline"},[e._v("More information available at:")]),a("div",{staticClass:"q-ml-sm"},[a("a",{staticClass:"text-primary",attrs:{href:t.wikiLink,target:"_blank"}},[e._v(e._s(t.wikiLink))])])])],1)])])})),a("q-separator"),a("q-card-actions",{attrs:{align:"right"}},[a("q-btn",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{color:"primary","text-color":"white",label:e.$t("Close")}})],1)],2)],1)],1)},s=[],r=(a("5319"),a("2f62")),o=function(){var e=this,t=e.$createElement,a=e._self._c||t;return null!==e.title?a("q-item",{attrs:{clickable:"",tag:"a",href:e.link}},[e.icon?a("q-item-section",{attrs:{side:""}},[a("q-avatar",{staticClass:"q-pa-none",attrs:{size:"24px","text-color":"white"}},[a("q-icon",{attrs:{name:e.icon,size:"sm",color:e.isPageActive?"primary":""}}),null!==e.notification?a("q-badge",{attrs:{floating:"",color:"orange",label:e.notification}}):e._e()],1)],1):e._e(),a("q-item-section",[a("q-item-label",{class:e.isPageActive?"text-primary":""},[e._v(e._s(e.title))])],1)],1):!0===e.spacer?a("q-item"):!0===e.separator?a("q-separator",{staticClass:"q-my-xs"}):e._e()},n=[],l={name:"EssentialLink",props:{title:{type:String,default:null},caption:{type:String,default:""},link:{type:String,default:"#"},icon:{type:String,default:""},notification:{type:[String,Number],default:null},spacer:{type:Boolean,default:!1},separator:{type:Boolean,default:!1}},computed:{isPageActive(){if(this.$route.path&&this.$route.path.length){const e=this.link.replace("#/","/");return this.$route.path.startsWith(e,0)}return!1}}},c=l,d=a("2877"),m=a("66e5"),p=a("4074"),u=a("cb32"),k=a("0016"),h=a("58a81"),g=a("0170"),v=a("eb85"),f=a("eebe"),w=a.n(f),P=Object(d["a"])(c,o,n,!1,null,null,null),q=P.exports;w()(P,"components",{QItem:m["a"],QItemSection:p["a"],QAvatar:u["a"],QIcon:k["a"],QBadge:h["a"],QItemLabel:g["a"],QSeparator:v["a"]});var b=a("9fa1"),_=a("9224"),C=a("bd4c"),S={name:"MainLayout",components:{EssentialLink:q},mixins:[b["a"]],data(){return{drawerMenuOpen:!1,miniState:!0,mainLinks:[{title:"",icon:"home",link:"#/Welcome"},{title:"Open Collectors",icon:"mediation",link:"#/OpenCollectors"},{title:"Pipelines",icon:"account_tree",link:"#/Pipelines"}],lowLinks:[{title:"EZ Market Place",icon:"storefront",link:"#/MarketPlace",id:"ezMarketPlace",notification:5},{separator:!0},{title:"Admin",icon:"admin_panel_settings",link:"#/Admin",needsPriviledge:!0},{title:"Settings",icon:"settings",link:"#/Settings"},{separator:!0},{title:"Log Out",icon:"logout",link:"#/Logout"}],version:_["b"],showErrorPanel:!1,errorPanelDetails:[]}},computed:{...Object(r["d"])("mainStore",["loggedInUser","loggedInUserIsPrivileged","errorWikiUrlBase","ezMarketNotification"])},methods:{sanitiseWikiLinks(e){try{return String(e).toLowerCase().replace(/[^a-zA-Z0-9_-]/g,"").replace(/ /g,"-")}catch(t){return null}},prepareAndShowErrorPanel(e){if(console.log("prepareAndShowErrorPanel",e),this.errorPanelDetails=[],e&&e.data&&e.data.errors&&Array.isArray(e.data.errors)&&e.data.errors.length)e.data.errors.forEach((e=>{const t=Date.now();this.errorPanelDetails.push({timestamp:t,timestampIso:C["a"].formatDate(t,"YYYY-MM-DDTHH:mm:ss.SSSZ"),code:(e&&null!=e.number?e.number:e.code)||"N/A",message:e&&e.message?e.message:"Unknown error. See Console.",wikiLink:e&&e.message?e&&null!=e.number?this.errorWikiUrlBase+this.sanitiseWikiLinks(e.number):this.errorWikiUrlBase+this.sanitiseWikiLinks(e.code):this.errorWikiUrlBase+"unknown-error-see-console"})}));else{const t=Date.now();this.errorPanelDetails.push({timestamp:t,timestampIso:C["a"].formatDate(t,"YYYY-MM-DDTHH:mm:ss.SSSZ"),code:e&&e.code?e.code:"N/A",message:e&&e.messageForLogAndPopup?e.messageForLogAndPopup:e&&e.captionForLogAndPopup?e.captionForLogAndPopup:"Unknown error. See Console.",wikiLink:e&&e.code?this.errorWikiUrlBase+e.code:e&&e.messageForLogAndPopup||e&&e.captionForLogAndPopup?null:this.errorWikiUrlBase+"unknown-error-see-console"})}this.showErrorPanel=!0,this.errorPanelDetails.forEach((e=>{console.log("📜 [LOG] |",e.timestampIso,"| Code:",e.code,"| Message:",e.message,"| WikiLink:",e.wikiLink)}))},updateEzMarketNotification(e){const t=this.lowLinks.find((e=>"ezMarketPlace"===e.id));t&&(t.notification=e)}},watch:{ezMarketNotification:{handler(e){this.updateEzMarketNotification(e)},immediate:!0}},mounted(){this.$root.$on("addAndShowErrorToErrorPanel",this.prepareAndShowErrorPanel)},beforeDestroy(){this.$root.$off("addAndShowErrorToErrorPanel")}},L=S,y=a("4d5a"),A=a("9404"),x=a("4983"),D=a("1c1c"),E=a("05c0"),Q=a("09e3"),M=a("24e8"),I=a("f09f"),W=a("a370"),z=a("4b7e"),O=a("9c40"),U=a("7f67"),$=Object(d["a"])(L,i,s,!1,null,null,null);t["default"]=$.exports;w()($,"components",{QLayout:y["a"],QDrawer:A["a"],QScrollArea:x["a"],QList:D["a"],QItem:m["a"],QTooltip:E["a"],QItemSection:p["a"],QIcon:k["a"],QItemLabel:g["a"],QSeparator:v["a"],QPageContainer:Q["a"],QDialog:M["a"],QCard:I["a"],QCardSection:W["a"],QCardActions:z["a"],QBtn:O["a"]}),w()($,"directives",{ClosePopup:U["a"]})},"9fa1":function(e,t,a){"use strict";var i=a("2f62");t["a"]={data(){return{socket:this.$socket}},computed:{...Object(i["d"])("mainStore",["jwtToken"])},methods:{connectSocket(){this.socket&&this.socket.connected&&this.socket.disconnect(),this.socket.auth.token=this.jwtToken,this.socket.connect()},disconnectSocket(){this.socket&&this.socket.connected&&this.socket.disconnect()}}}}}]);