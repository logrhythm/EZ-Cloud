(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[14],{3780:function(t,e,c){"use strict";c.r(e);var s=function(){var t=this,e=t.$createElement,c=t._self._c||e;return c("q-page",{staticClass:"flex flex-center column q-gutter-lg"},[c("div",{staticClass:"text-h2",staticStyle:{opacity:".4"}},[t._v("\n      Bye bye\n    ")]),c("div",{staticClass:"text-h6",staticStyle:{opacity:".4"}},[t._v("\n      You have successfuly logged out.\n    ")]),c("q-btn",{attrs:{label:"Log Back In",to:"/Login",color:"primary"}})],1)},n=[],o=c("2f62"),i=c("9fa1"),a={name:"PageLogout",mixins:[i["a"]],methods:{...Object(o["b"])("mainStore",["signOut"])},mounted(){this.signOut(),this.disconnectSocket()}},u=a,l=c("2877"),h=c("9989"),r=c("9c40"),k=c("eebe"),d=c.n(k),f=Object(l["a"])(u,s,n,!1,null,null,null);e["default"]=f.exports;d()(f,"components",{QPage:h["a"],QBtn:r["a"]})},"9fa1":function(t,e,c){"use strict";var s=c("2f62");e["a"]={data(){return{socket:this.$socket}},computed:{...Object(s["d"])("mainStore",["jwtToken"])},methods:{connectSocket(){this.socket&&this.socket.connected&&this.socket.disconnect(),this.socket.auth.token=this.jwtToken,this.socket.connect()},disconnectSocket(){this.socket&&this.socket.connected&&this.socket.disconnect()}}}}}]);