<template>
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
</script>

<style lang="scss" scoped></style>