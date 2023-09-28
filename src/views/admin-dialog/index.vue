<template>
    <div class="admin-view">
        <div class="admin-view-header">
            <admin-bread></admin-bread>
        </div>
        <div class="admin-view-body">

            <el-button @click="openEdit(editData)">表单</el-button>
            {{ editData }}
            <el-divider></el-divider>
            <el-button @click="openChoose()">选择</el-button>
            {{ chooseList }}

        </div>
    </div>
</template>

<script setup>
import useAdminDialog from '@/plugins/use-admin-dialog';
import { h, ref } from 'vue';
const adminDialog = useAdminDialog()
const chooseList = ref([])
const editData = ref({ username: 'websir' })
async function openEdit(row) {
    adminDialog(
        h((await import('./post.vue')).default, {
            row: row,
            onSuccess: (eventData) => {
                //post.vue 触发的success事件
                editData.value = eventData
            }
        }),
        { title: '编辑' }
    )
}
async function openChoose() {
    adminDialog(
        h((await import('./choose.vue')).default, {
            row: chooseList,
            onSuccess: (eventData) => {
                //choose.vue 触发的success事件
                console.log(eventData)
                chooseList.value = eventData;
            }
        }),
        { title: '选择', width: "1200px" }
    )
}

</script>

<style lang="scss" scoped></style>