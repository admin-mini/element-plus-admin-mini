<template>
    <div class="admin-view">
        <admin-table :api="orgApi.getOrgTreeAll" @init="onTableInit" noPage>

            <template #btn>
                <el-button type="primary" icon="Plus" @click="handleAdd" v-if="$p(['sys:org:add'])">新增</el-button>
                <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
            </template>

            <template #table>
                <el-table v-if="refreshTable" :default-expand-all="isExpandAll" :data="$table.data"
                    v-loading="$table.loading" row-key="id"
                    :tree-props="{ children: 'children', hasChildren: 'hasChildren'}">
                    <el-table-column prop="orgName" label="名称" :show-overflow-tooltip="true" width="200">
                    </el-table-column>
                    <el-table-column prop="sortCode" label="排序" width="60" align="center" />
                    <el-table-column prop="enable" label="状态" width="100" align="center">
                        <template #default="scope">
                            <dict-label tag type="common_enabel_status" :value="scope.row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" >
                        <template #default="scope">
                            <el-space spacer="|">
                                <el-link type="primary" @click="handleAdd(scope.row)"
                                    v-if="$p(['sys:org:add'])" icon="Plus"></el-link>
                                <el-link type="primary" @click="handleEdit(scope.row)"
                                    v-if="$p(['sys:org:edit'])" icon="Edit"></el-link>
                                <el-link type="primary" @click="handleDel(scope.row)"
                                    v-if="$p(['sys:org:delete'])" icon="Delete"></el-link>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </admin-table>
    </div>
</template>

<script setup>
import { h, nextTick, ref } from 'vue'
import  * as orgApi from '@/api/sys/org-api'
import useAdminDialog from '@/plugins/use-admin-dialog'
import message from '@/utils/message'
import tool from '@/utils/tool'
import { getDict } from '@/utils/dict'

getDict(['yes_no', 'sys_show_hide'])
const adminDialog = useAdminDialog()
let $table
const refreshTable = ref(true)
const isExpandAll = ref(true)

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
            component: import('./modules/form.vue'),
            props: {
                parentId: row?.id,
                onSuccess: () => {
                    $table.getTable()
                }
            },
            dialogProps: { title: '新增菜单', width: "900px" }
        }
    )
}

function handleEdit(row) {
    adminDialog(
        {
            component: import('./modules/form.vue'),
            props: {
                row: row,
                onSuccess: () => {
                    $table.getTable()
                }
            },
            dialogProps: { title: '修改菜单', width: "900px" }
        }
    )
}

function handleDel(row) {
    message.syncConfirm(
        `是否确认删除名称为"${row.orgName}"的数据项?`,
        () => orgApi.deleteOrgByIds([row.id])
    ).then(() => {
        message.success("删除成功")
        $table.getTable()
    }).catch(() => { })
}
</script>