<template>
    <div class="admin-view">
        <admin-table :api="allocatedUserList" @init="(table) => { $table = table }" :query="route.params">
            <template #search>
                <el-form ref="queryFrom" @submit.prevent="$table.search" :inline="true" :model="$table.query">
                    <admin-grid :cols="4" :x-gap="20">
                        <el-form-item label="角色名称">
                            <el-input v-model="$table.query.roleName" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="权限字符">
                            <el-input v-model="$table.query.roleKey" clearable />
                        </el-form-item>
                        <el-form-item label="状态">
                            <select-dict :dict="$dict.sys_normal_disable" v-model="$table.query.status"
                                show-all></select-dict>
                        </el-form-item>
                        <el-form-item label="创建时间">
                            <date-picker-range v-model:begin="$table.query.beginTime"
                                v-model:end="$table.query.endTime"></date-picker-range>
                        </el-form-item>
                        <template #last>
                            <el-button native-type="submit" type="primary" icon="Search"
                                :loading="$table.loading">搜索</el-button>
                        </template>
                    </admin-grid>
                </el-form>
            </template>

            <template #btn>
                <el-button type="primary" icon="Plus" @click="openAdd" v-if="$p(['system:role:add'])">新增用户授权</el-button>
                <el-button type="primary" plain icon="Delete" :disabled="$table.selection.length == 0"
                    @click="openCancel()" v-if="$p(['system:role:remove'])">批量取消授权</el-button>
            </template>
            <template #table>
                <el-table :data="$table.data" table-layout="auto" style="width: 100%;" :empty-text="$table.emptyText"
                    v-loading="$table.loading" @selection-change="$table.handleSelectionChange">
                    <el-table-column type="selection" width="55" align="center" />
                    <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
                    <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
                    <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
                    <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
                    <el-table-column label="状态" :formatter="$formatter.dict($dict.sys_normal_disable)" prop="status">
                    </el-table-column>
                    <el-table-column label="创建时间" prop="createTime">
                    </el-table-column>
                    <el-table-column label="操作" width="300">
                        <template #default="scope">
                            <el-space spacer="|">
                                <el-link v-if="$p(['system:role:remove'])" type="primary"
                                    @click="openCancel(scope.row)">取消授权</el-link>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </admin-table>
    </div>
</template>
<script setup>

import { h, ref } from 'vue'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDict } from '@/utils/dict'
import { authUserCancel, authUserCancelAll, allocatedUserList, } from '@/api/system/role'
import { download } from "@/api/request"
import { syncConfirm } from "@/utils/utils"
import { useRoute } from "vue-router";
getDict(['sys_normal_disable'])
const adminDialog = useAdminDialog()
let $table;

const route = useRoute();
const roleId = route.params.roleId;

function openAdd() {
    adminDialog({
        component: import('./select-user.vue'),
        props: {
            query: { roleId },
            onSuccess: (ss) => {
                console.log(ss)
                $table.getTable()
            }
        },
        dialogProps: {
            title: '新增用户授权',
            width: "900px",
        },

    })
}

function openCancel(row) {
    if (row) {
        syncConfirm(
            `确认要取消${row.userName}角色授权吗?`,
            () => {
                return authUserCancel({ userId: row.userId, roleId: roleId })

            },
        ).then(function () {
            $table.search();
        }).catch(() => { })
    } else {
        let ids = $table.selection.map(item => item.userId);
        syncConfirm(
            `确认要取消${ids.length}个角色授权吗?`,
            () => {
                return authUserCancelAll({ userIds: ids?.join(','), roleId: roleId })
            },
        ).then(function () {
            $table.search();
        }).catch(() => { })

    }
}
</script>
<style></style>