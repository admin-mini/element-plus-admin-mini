<template>
    <div class="admin-view">
        <admin-table :api="listPost" @init="(table) => { $table = table }">
            <template #search>
                <el-form ref="queryForm" @submit.prevent="$table.search" :inline="true" :model="$table.query">
                    <admin-grid :cols="4" :x-gap="20">
                        <el-form-item label="岗位编码">
                            <el-input v-model="$table.query.postCode" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="岗位名称">
                            <el-input v-model="$table.query.postName" clearable></el-input>
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
                <el-button type="primary" icon="Plus" @click="openAdd" v-if="$p(['system:post:add'])">新增</el-button>
                <el-button type="primary" plain icon="Edit" :disabled="$table.selection.length != 1" @click="openEdit()"
                    v-if="$p(['system:post:edit'])">修改</el-button>
                <el-button type="primary" plain icon="Delete" :disabled="$table.selection.length == 0"
                    @click="openDel()" v-if="$p(['system:post:remove'])">删除</el-button>
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-if="$p(['system:post:export'])">导出</el-button>
            </template>

            <template #table>
                <el-table :data="$table.data" v-loading="$table.loading"
                    @selection-change="$table.handleSelectionChange">
                    <el-table-column type="selection" width="55" align="center" />
                    <el-table-column label="岗位编号" align="center" prop="postId" width="120" />
                    <el-table-column label="岗位编码" align="center" prop="postCode" />
                    <el-table-column label="岗位名称" align="center" prop="postName" />
                    <el-table-column label="岗位排序" align="center" prop="postSort" />
                    <el-table-column label="状态" align="center" prop="status">
                        <template #default="scope">
                            <dict-tag :options="$dict.sys_normal_disable" :value="scope.row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
                    <el-table-column label="操作" align="center" width="200">
                        <template #default="scope">
                            <el-space spacer="|">
                                <el-link type="primary" @click="openEdit(scope.row)"
                                    v-if="$p(['system:post:edit'])">修改</el-link>
                                <el-link type="primary" @click="openDel(scope.row)"
                                    v-if="$p(['system:post:remove'])">删除</el-link>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </admin-table>
    </div>
</template>

<script setup>
import { listPost, delPost } from '@/api/system/post'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { h } from 'vue'
import { ElMessage } from 'element-plus'
import { getDict } from '@/utils/dict'
import { syncConfirm } from "@/utils/utils"
import { download } from '@/api/request'

getDict(['sys_normal_disable'])
const adminDialog = useAdminDialog()
let $table

async function openAdd() {
    adminDialog(
        h((await import('./post.vue')).default, {
            onSuccess: () => {
                $table.getTable()
            }
        }),
        { title: '新增岗位', width: "500px" }
    )
}

async function openEdit(row) {
    row = row || $table.selection[0]
    adminDialog(
        h((await import('./post.vue')).default, {
            row: row,
            onSuccess: () => {
                $table.getTable()
            }
        }),
        { title: '修改岗位', width: "500px" }
    )
}

function openDel(row) {
    let ids = row ? [row.postId] : $table.selection.map(item => item.postId)
    syncConfirm(
        `是否确认删除岗位编号为"${ids.join(',')}"的数据项?`,
        () => delPost(ids.join(','))
    ).then(() => {
        ElMessage.success("删除成功")
        $table.getTable()
    }).catch(() => { })
}

// 导出按钮操作
function handleExport() {
    download("system/post/export", {
        ...$table.query,
    }, `post_${new Date().getTime()}.xlsx`);
}
</script>