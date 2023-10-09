import{r as m,c as t,o as v,d as _,e as a,f as s,g as u,t as o,h as y}from"./index-8c6450b1.js";const b={class:"admin-view"},f={class:"admin-view-header"},w={class:"admin-view-body"},h={style:{display:"block","white-space":"pre-wrap",background:"var(--el-color-black)",color:"var(--el-color-white)","margin-top":"30px",padding:"20px"}},V={__name:"index",setup(g){const e=m({});let i=`<template>
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
<style lang="scss" scoped></style>`;return(c,d)=>{const l=t("admin-bread"),r=t("el-divider"),n=t("select-dict");return v(),_("div",b,[a("div",f,[s(l)]),a("div",w,[u(o(e.value)+" ",1),s(r),s(n,{dict:c.$dict.userType,modelValue:e.value.userType,"onUpdate:modelValue":d[0]||(d[0]=p=>e.value.userType=p)},null,8,["dict","modelValue"]),a("code",h,o(y(i)),1)])])}}};export{V as default};
