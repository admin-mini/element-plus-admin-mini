<template>
    <div class="admin-view">
        <admin-table :api="listDept" no-page @init="onTableInit">
            <template #search>
                <el-form ref="queryForm" @submit.prevent="$table.search" :inline="true" :model="$table.query">
                    <admin-grid :cols="3" :x-gap="20">
                        <el-form-item label="部门名称">
                            <el-input v-model="$table.query.deptName" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="状态">
                            <select-dict :dict="$dict.sys_normal_disable" v-model="$table.query.status"
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
                <el-button type="primary" icon="Plus" @click="handleAdd()" v-if="$p(['system:dept:add'])">新增</el-button>
                <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
            </template>

            <template #table>
                <el-table v-if="refreshTable" table-layout="auto" style="width: 100%;" :data="$table.data"
                    row-key="deptId" :default-expand-all="isExpandAll"
                    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" v-loading="$table.loading">
                    <el-table-column prop="deptName" label="部门名称" />
                    <el-table-column prop="orderNum" label="排序" />
                    <el-table-column prop="status" label="状态" width="100">
                        <template #default="scope">
                            <dict-tag :options="$dict.sys_normal_disable" :value="scope.row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="createTime" label="创建时间" width="200" />
                    <el-table-column label="操作" width="300">
                        <template #default="scope">
                            <el-space spacer="|">
                                <el-link v-if="$p(['system:dept:edit'])" type="primary"
                                    @click="handleEdit(scope.row)">修改</el-link>
                                <el-link v-if="$p(['system:dept:add'])" type="primary"
                                    @click="handleAdd(scope.row)">新增</el-link>
                                <el-link v-if="scope.row.parentId != 0 && $p(['system:dept:remove'])" type="primary"
                                    @click="handleDel(scope.row)">删除</el-link>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </admin-table>
    </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDict } from '@/utils/dict'
import { listDept, delDept } from '@/api/system/dept'
import { syncConfirm, arrToTree } from '@/utils/utils'

getDict(['sys_normal_disable'])
const adminDialog = useAdminDialog()
let $table
const isExpandAll = ref(true)
const refreshTable = ref(true)
const treeData = ref([])

function onTableInit(table) {
    $table = table;
    $table.parse = (res) => {
        return arrToTree(res.data, 'deptId', 'parentId')
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
    adminDialog({
        component: import('./post.vue'),
        dialogProps: {
            title: '新增部门',
            width: "700px",
        },
        props: {
            parentId: row?.deptId,
            onSuccess: () => {
                $table.getTable()
            }
        },
    })
}

function handleEdit(row) {
    adminDialog({
        component: import('./post.vue'),
        props: {
            row,
            onSuccess: () => {
                $table.getTable()
            }
        },
        dialogProps: {
            title: '修改部门',
            width: "700px",
        },

    })
}

function handleDel(row) {
    syncConfirm(
        `是否确认删除名称为"${row.deptName}"的部门?`,
        () => delDept(row.deptId)
    ).then(() => {
        ElMessage.success("删除成功")
        $table.getTable()
    }).catch(() => { })
}
</script>