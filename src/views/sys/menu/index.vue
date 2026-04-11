<template>
    <div class="admin-view">
        <admin-table :api="menuApi.getMenuTree" @init="onTableInit" noPage>
            <template #search>
                <el-form ref="queryForm" @submit.prevent="$table.search" :inline="true" :model="$table.query">
                    <admin-grid :cols="4" :x-gap="20">
                        <el-form-item label="菜单名称">
                            <el-input v-model="$table.query.name" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="菜单标题">
                            <el-input v-model="$table.query.title" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="状态">
                            <select-dict :dict="$dict.sys_normal_disable" v-model="$table.query.enable"
                                show-all></select-dict>
                        </el-form-item>
                        <template #last>
                            <el-button native-type="submit" type="primary" icon="Search"
                                :loading="$table.loading">搜索</el-button>
                        </template>
                    </admin-grid>
                </el-form>
            </template>

            <template #btn>
                <el-button type="primary" icon="Plus" @click="handleAdd" v-if="$p(['sys:menu:add'])">新增</el-button>
                <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
            </template>

            <template #table>
                <el-table v-if="refreshTable" :default-expand-all="isExpandAll" :data="$table.data"
                    v-loading="$table.loading" row-key="id"
                    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
                    <el-table-column prop="title" label="菜单标题" :show-overflow-tooltip="true">
                    </el-table-column>
                    <el-table-column prop="icon" label="图标">
                        <template #default="scope">
                            <svg-icon :name="scope.row.icon" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="sortCode" label="排序" width="60" align="center" />
                    <el-table-column prop="code" label="权限标识" :show-overflow-tooltip="true" />
                    <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true" />
                    <el-table-column prop="enable" label="状态" width="100" align="center">
                        <template #default="scope">
                            <dict-tag :options="$dict.sys_normal_disable" :value="scope.row.enable" />
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
                    <el-table-column label="操作" align="center" width="200">
                        <template #default="scope">
                            <el-space spacer="|">
                                <el-link type="primary" @click="handleAdd(scope.row)"
                                    v-if="$p(['sys:menu:add'])" icon="Plus"></el-link>
                                <el-link type="primary" @click="handleEdit(scope.row)"
                                    v-if="$p(['sys:menu:edit'])" icon="Edit"></el-link>
                                <el-link type="primary" @click="handleDel(scope.row)"
                                    v-if="$p(['sys:menu:delete'])" icon="Delete"></el-link>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </admin-table>
    </div>
</template>

<script setup>
import  * as menuApi from '@/api/sys/menu-api'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { h, nextTick, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getDict } from '@/utils/dict'
import { arrToTree, syncConfirm } from "@/utils/utils"

getDict(['yes_no', 'sys_show_hide'])
const adminDialog = useAdminDialog()
let $table
const refreshTable = ref(true)
const isExpandAll = ref(false)

function onTableInit(table) {
    $table = table;
    $table.parse = (res) => {
        return res.data;
    }
}
function toggleExpandAll() {
    refreshTable.value = false
    isExpandAll.value = !isExpandAll.value
    nextTick(() => {
        refreshTable.value = true
    })
}

function handleAdd(row) {
    adminDialog(
        {
            component: import('./form.vue'),
            props: {
                parentId: row?.menuId,
                onSuccess: () => {
                    $table.getTable()
                }
            },
            dialogProps: { title: '新增菜单', width: "700px" }
        }
    )
}

function handleEdit(row) {
    adminDialog(
        {
            component: import('./form.vue'),
            props: {
                row: row,
                onSuccess: () => {
                    $table.getTable()
                }
            },
            dialogProps: { title: '修改菜单', width: "700px" }
        }
    )
}

function handleDel(row) {
    syncConfirm(
        `是否确认删除名称为"${row.title}"的数据项?`,
        () => menuApi.deleteById(row.id)
    ).then(() => {
        ElMessage.success("删除成功")
        $table.getTable()
    }).catch(() => { })
}
</script>