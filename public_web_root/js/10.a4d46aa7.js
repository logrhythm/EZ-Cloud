(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[10],{8487:function(a,t,e){"use strict";e.r(t);var s=function(){var a=this,t=a._self._c;return t("q-page",{staticClass:"q-pa-sm"},[t("q-header",{class:a.darkMode?"":"bg-grey-1",style:a.darkMode?"background: var(--q-color-dark);":"",attrs:{bordered:""}},[t("q-toolbar",{staticClass:"q-gutter-x-sm",class:a.darkMode?"":"text-black"},[t("img",{staticClass:"q-mr-md",attrs:{src:"logrhythm_logo_wide.svg",alt:"LogRhythm Open Collector"}})])],1),t("BreadCrumbs",{attrs:{crumbs:a.breadCrumbs}}),t("div",{staticClass:"q-gutter-y-sm"},[t("q-card",{staticClass:"q-pa-md q-mx-none"},[t("q-card-section",{attrs:{horizontal:""}},[t("q-card-section",{staticClass:"col q-ma-none q-pa-none"},[t("q-card-section",{staticClass:"text-h4"},[a._v("\n                RBAC\n            ")]),t("q-card-section",{staticClass:"q-gutter-lg"},[t("q-btn",{attrs:{"no-caps":"",color:"primary",label:a.$t("Manage User Accounts"),to:"/Admin/RBAC/Users"}}),t("q-btn",{attrs:{"no-caps":"",color:"primary",label:a.$t("Manage User Roles"),to:"/Admin/RBAC/Roles"}})],1)],1)],1)],1),t("q-card",{staticClass:"q-pa-md q-mx-none"},[t("q-card-section",{attrs:{horizontal:""}},[t("q-card-section",{staticClass:"col q-ma-none q-pa-none"},[t("q-card-section",{staticClass:"text-h4"},[a._v("\n                SIEM\n            ")]),t("q-card-section",{staticClass:"q-gutter-lg"},[t("q-btn",{attrs:{"no-caps":"",color:"primary",label:a.$t("Manage MS SQL Connection"),to:"/Admin/SIEM/MsSql"}},[a.needToConfigureMsSql?t("q-badge",{attrs:{floating:"",rounded:"",color:"negative","text-color":"white",label:"1"}}):a._e()],1),t("q-btn",{attrs:{"no-caps":"",color:"primary",label:a.$t("Update Database"),to:"/Admin/SIEM/UpdateEmdb"}})],1)],1)],1)],1)],1)],1)},o=[],n=e("2f62"),r=e("a87d"),c=e("f423"),i={name:"PageAdmin",mixins:[r["a"]],components:{BreadCrumbs:c["a"]},computed:{...Object(n["d"])("mainStore",["extraInformation"]),needToConfigureMsSql(){return this.extraInformation&&this.extraInformation.msSqlConnectionConfigMissing},breadCrumbs(){return[{icon:"o_home",link:"/Welcome"},{title:this.$t("Admin"),link:"/Admin"}]}}},l=i,d=e("2877"),m=e("9989"),q=e("e359"),b=e("b498"),g=e("65c6"),C=e("f09f"),p=e("a370"),u=e("9c40"),h=e("58a8"),f=e("eebe"),M=e.n(f),x=Object(d["a"])(l,s,o,!1,null,null,null);t["default"]=x.exports;M()(x,"components",{QPage:m["a"],QHeader:q["a"],QColor:b["a"],QToolbar:g["a"],QCard:C["a"],QCardSection:p["a"],QBtn:u["a"],QBadge:h["a"]})}}]);