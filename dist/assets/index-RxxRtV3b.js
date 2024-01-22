import{r as m,o as v,c as _,d as t,e as a,f as u,t as i,g as y,i as s}from"./index-1M5D14Jb.js";const b={class:"admin-view"},f={class:"admin-view-header"},w={class:"admin-view-body"},h={style:{display:"block","white-space":"pre-wrap",background:"var(--el-color-black)",color:"var(--el-color-white)","margin-top":"30px",padding:"20px"}},V={__name:"index",setup(g){const e=m({});let o=`<template>
    <div class="admin-view">
        <div class="admin-view-header">
            <admin-bread></admin-bread>
        </div>
        <div class="admin-view-body">
            {{ postData }}
            <el-divider></el-divider>
            <select-dict :dict="$dict.userType" v-model="postData.userType"></select-dict>

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
const postData = ref({})
<//script>
<style lang="scss" scoped></style>`;return(c,d)=>{const l=s("admin-bread"),r=s("el-divider"),n=s("select-dict");return v(),_("div",b,[t("div",f,[a(l)]),t("div",w,[u(i(e.value)+" ",1),a(r),a(n,{dict:c.$dict.userType,modelValue:e.value.userType,"onUpdate:modelValue":d[0]||(d[0]=p=>e.value.userType=p)},null,8,["dict","modelValue"]),t("code",h,i(y(o)),1)])])}}};export{V as default};
