<template>
    <div class="admin-view">
        <admin-table :api="listData" :query="{ dictType: route.query.dictType }" @init="(table) => { $table = table }">
            <template #search>
                <el-form ref="queryForm" @submit.prevent="$table.search" :inline="true" :model="$table.query">
                    <admin-grid :cols="4" :x-gap="20">
                        <el-form-item label="字典标签">
                            <el-input v-model="$table.query.dictLabel" clearable></el-input>
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
                <el-button type="primary" icon="Plus" @click="openAdd" v-if="$p(['system:dict:add'])">新增</el-button>
                <el-button type="primary" plain icon="Edit" :disabled="$table.selection.length != 1" @click="openEdit()"
                    v-if="$p(['system:dict:edit'])">修改</el-button>
                <el-button type="primary" plain icon="Delete" :disabled="$table.selection.length == 0"
                    @click="openDel()" v-if="$p(['system:dict:remove'])">删除</el-button>
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-if="$p(['system:dict:export'])">导出</el-button>

            </template>

            <template #table>
                <el-table :data="$table.data" v-loading="$table.loading"
                    @selection-change="$table.handleSelectionChange">
                    <el-table-column type="selection" width="55" align="center" />
                    <el-table-column label="字典编码" align="center" prop="dictCode" />
                    <el-table-column label="字典标签" align="center" prop="dictLabel" />
                    <el-table-column label="字典键值" align="center" prop="dictValue" />
                    <el-table-column label="字典排序" align="center" prop="dictSort" />
                    <el-table-column label="状态" align="center" prop="status">
                        <template #default="scope">
                            <dict-tag :options="$dict.sys_normal_disable" :value="scope.row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
                    <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
                    <el-table-column label="操作" align="center" width="200">
                        <template #default="scope">
                            <el-space spacer="|">
                                <el-link type="primary" @click="openEdit(scope.row)"
                                    v-if="$p(['system:dict:edit'])">修改</el-link>
                                <el-link type="primary" @click="openDel(scope.row)"
                                    v-if="$p(['system:dict:remove'])">删除</el-link>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </admin-table>
    </div>
</template>

<script setup>
import { listData, getData, delData } from '@/api/system/dict/data'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { h } from 'vue'
import { ElMessage } from 'element-plus'
import { getDict } from '@/utils/dict'
import { syncConfirm } from "@/utils/utils"
import { useRouter, useRoute } from 'vue-router'
import { download } from '@/api/request'

const router = useRouter()
const route = useRoute()
const adminDialog = useAdminDialog()
let $table

getDict(['sys_normal_disable'])


async function openAdd() {
    adminDialog(
        h((await import('./data-post.vue')).default, {
            dictId: route.params.dictId,
            dictType: route.query.dictType,
            onSuccess: () => {
                $table.getTable()
            }
        }),
        { title: '新增字典数据', width: "500px" }
    )
}

async function openEdit(row) {
    row = row || $table.selection[0]
    adminDialog(
        h((await import('./data-post.vue')).default, {
            row: row,
            onSuccess: () => {
                $table.getTable()
            }
        }),
        { title: '修改字典数据', width: "500px" }
    )
}

function openDel(row) {
    let ids = row ? [row.dictCode] : $table.selection.map(item => item.dictCode)
    syncConfirm(
        `是否确认删除字典编码为"${ids.join(',')}"的数据项?`,
        () => delData(ids.join(','))
    ).then(() => {
        ElMessage.success("删除成功")
        $table.getTable()
    }).catch(() => { })
}

function handleExport() {
    download("system/dict/data/export", {
        ...$table.query,
    }, `dict_data_${new Date().getTime()}.xlsx`);
}
</script>