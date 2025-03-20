<template>
    <div class="admin-view">
        <admin-table :api="listNotice" @init="(table) => { $table = table }">
            <template #search>
                <el-form ref="queryForm" @submit.prevent="$table.search" :inline="true" :model="$table.query">
                    <admin-grid :cols="4" :x-gap="20">
                        <el-form-item label="公告标题">
                            <el-input v-model="$table.query.noticeTitle" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="操作人员">
                            <el-input v-model="$table.query.createBy" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="类型">
                            <select-dict :dict="$dict.sys_notice_type" v-model="$table.query.noticeType"
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
                <el-button type="primary" icon="Plus" @click="handleAdd" v-if="$p(['system:notice:add'])">新增</el-button>
                <el-button type="primary" plain icon="Edit" :disabled="$table.selection.length != 1"
                    @click="handleEdit()" v-if="$p(['system:notice:edit'])">修改</el-button>
                <el-button type="primary" plain icon="Delete" :disabled="$table.selection.length == 0"
                    @click="handleDel()" v-if="$p(['system:notice:remove'])">删除</el-button>
            </template>

            <template #table>
                <el-table :data="$table.data" v-loading="$table.loading"
                    @selection-change="$table.handleSelectionChange">
                    <el-table-column type="selection" width="55" align="center" />
                    <el-table-column label="序号" align="center" prop="noticeId" width="100" />
                    <el-table-column label="公告标题" align="center" prop="noticeTitle" :show-overflow-tooltip="true" />
                    <el-table-column label="公告类型" align="center" :formatter="$formatter.dict($dict.sys_notice_type)"
                        prop="noticeType">
                        <!-- <template #default="scope">
                            <dict-tag :options="$dict.sys_notice_type" :value="scope.row.noticeType" />
                        </template> -->
                    </el-table-column>
                    <el-table-column label="状态" align="center" prop="status">
                        <template #default="scope">
                            <dict-tag :options="$dict.sys_normal_disable" :value="scope.row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column label="创建者" align="center" prop="createBy" />
                    <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
                    <el-table-column label="操作" align="center" width="200">
                        <template #default="scope">
                            <el-space spacer="|">
                                <el-link type="primary" @click="handleEdit(scope.row)"
                                    v-if="$p(['system:notice:edit'])">修改</el-link>
                                <el-link type="primary" @click="handleDel(scope.row)"
                                    v-if="$p(['system:notice:remove'])">删除</el-link>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </admin-table>
    </div>
</template>

<script setup>
import { listNotice, delNotice } from '@/api/system/notice'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { h } from 'vue'
import { ElMessage } from 'element-plus'
import { getDict } from '@/utils/dict'
import { syncConfirm } from "@/utils/utils"

getDict(['sys_notice_type', 'sys_normal_disable'])
const adminDialog = useAdminDialog()
let $table

function handleAdd() {
    adminDialog(
        {
            component: import('./post.vue'),
            props: {
                onSuccess: () => {
                    $table.getTable()
                }
            },
            dialogProps: { title: '新增公告', width: "800px" }
        }
    )
}

function handleEdit(row) {
    row = row || $table.selection[0]
    adminDialog(
        {
            component: import('./post.vue'),
            props: {
                row: row,
                onSuccess: () => {
                    $table.getTable()
                }
            },
            dialogProps: { title: '修改公告', width: "800px" }
        }
    )
}

function handleDel(row) {
    let ids = row ? [row.noticeId] : $table.selection.map(item => item.noticeId)
    syncConfirm(
        `是否确认删除公告编号为"${ids.join(',')}"的数据项?`,
        () => delNotice(ids.join(','))
    ).then(() => {
        ElMessage.success("删除成功")
        $table.getTable()
    }).catch(() => { })
}
</script>