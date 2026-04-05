<template>
    <div class="admin-view">
        <div class="admin-view-body">
            {{ postData }}
            <el-divider></el-divider>
            <select-dict :dict="$dict.userType" v-model="postData.userType"></select-dict>
            <code
                style="display:block;white-space: pre-wrap;background: var(--el-color-black);color:var(--el-color-white);margin-top:30px;padding:20px;">{{ code }}</code>
       
            <el-divider>人员选择</el-divider>
            <h3>多选</h3>
            <user-picker v-model="userIds" :multiple="true"></user-picker>
            <h3>单选</h3>
            <user-picker v-model="userId" ></user-picker>
             <h3>自定义显示方式</h3>
            <user-picker v-model="userIds" :multiple="true">
                <template #trigger="{ users, open }">
                    <el-button @click="open" type="success">
                    当前已选 {{ users.length }} 人
                    </el-button>
                </template>
            </user-picker>
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

const userIds=ref([3]);
const userId=ref(4);
</script>
<style lang="scss" scoped></style>