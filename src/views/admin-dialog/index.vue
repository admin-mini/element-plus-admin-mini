<template>
    <div class="admin-view">
        <div class="admin-view-body">

            <el-button @click="openEdit(editData)">表单</el-button>
            <el-button @click="openEdit(editData, true)">表单Drawer</el-button>
            {{ editData }}
            <el-divider></el-divider>
            <el-button @click="openChoose()">选择</el-button>
            {{ chooseList }}

            <code
                style="display:block;white-space: pre-wrap;background: var(--el-color-black);color:var(--el-color-white);margin-top:30px;padding:20px;">{{ code }}</code>
        </div>
    </div>
</template>

<script setup>
import useAdminDialog from '@/plugins/use-admin-dialog';
import { h, ref } from 'vue';
const adminDialog = useAdminDialog()
const chooseList = ref([])
const editData = ref({ username: 'websir' })
function openEdit(row, isDrawer) {
    adminDialog(
        {
            component: import('./post.vue'),//调起组件
            props: {
                //放置到组件的props
                row: row,
                onSuccess: (eventData) => {
                    //post.vue 触发的success事件
                    editData.value = eventData
                }
            },
            dialogType: isDrawer ? 'drawer' : 'dialog',
            dialogProps: { title: '编辑', width: "400px" }
        }
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
let code = `async function openEdit(row) {
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
}`

</script>

<style lang="scss" scoped></style>