<template>
    <div class="admin-view">
        <div class="admin-view-header">
            <admin-bread></admin-bread>
        </div>
        <div class="admin-view-body">
            {{ postData }}
            <el-divider></el-divider>
            <select-dict :dict="$dict.userType" v-model="postData.userType"></select-dict>
            <code
                style="display:block;white-space: pre-wrap;background: var(--el-color-black);color:var(--el-color-white);margin-top:30px;padding:20px;">{{ code }}</code>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
const postData = ref({})
let code = `<template>
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
<style lang="scss" scoped></style>`
</script>
<style lang="scss" scoped></style>