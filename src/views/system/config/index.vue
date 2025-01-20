<template>
    <div class="admin-view">
        <admin-table :api="listConfig" @init="(table) => { $table = table }">
            <template #search>
                <el-form ref="queryForm" @submit.prevent="$table.search" :inline="true" :model="$table.query">
                    <admin-grid :cols="4" :x-gap="20">
                        <el-form-item label="参数名称">
                            <el-input v-model="$table.query.configName" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="参数键名">
                            <el-input v-model="$table.query.configKey" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="系统内置">
                            <select-dict :dict="$dict.sys_yes_no" v-model="$table.query.configType"
                                show-all></select-dict>
                        </el-form-item>
                        <el-form-item label="时间范围">
                            <date-picker-range v-model:begin="$table.query.params.beginTime"
                                v-model:end="$table.query.params.endTime"></date-picker-range>
                        </el-form-item>
                        <template #last>
                            <el-button native-type="submit" type="primary" icon="Search"
                                :loading="$table.loading">搜索</el-button>
                        </template>
                    </admin-grid>
                </el-form>
            </template>

            <template #btn>
                <el-button type="primary" icon="Plus" @click="openAdd" v-if="$p(['system:config:add'])">新增</el-button>
                <el-button type="primary" plain icon="Edit" :disabled="$table.selection.length != 1" @click="openEdit()"
                    v-if="$p(['system:config:edit'])">修改</el-button>
                <el-button type="primary" plain icon="Delete" :disabled="$table.selection.length == 0"
                    @click="openDel()" v-if="$p(['system:config:remove'])">删除</el-button>
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-if="$p(['system:config:export'])">导出</el-button>
                <el-button type="danger" plain icon="Refresh" @click="handleRefreshCache"
                    v-if="$p(['system:config:remove'])">刷新缓存</el-button>
            </template>

            <template #table>
                <el-table :data="$table.data" v-loading="$table.loading"
                    @selection-change="$table.handleSelectionChange">
                    <el-table-column type="selection" width="55" align="center" />
                    <el-table-column label="参数主键" align="center" prop="configId" />
                    <el-table-column label="参数名称" align="center" prop="configName" :show-overflow-tooltip="true" />
                    <el-table-column label="参数键名" align="center" prop="configKey" :show-overflow-tooltip="true" />
                    <el-table-column label="参数键值" align="center" prop="configValue" />
                    <el-table-column label="系统内置" align="center" prop="configType">
                        <template #default="scope">
                            <dict-tag :options="$dict.sys_yes_no" :value="scope.row.configType" />
                        </template>
                    </el-table-column>
                    <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
                    <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
                    <el-table-column label="操作" align="center" width="200">
                        <template #default="scope">
                            <el-space spacer="|">
                                <el-link type="primary" @click="openEdit(scope.row)"
                                    v-if="$p(['system:config:edit'])">修改</el-link>
                                <el-link type="primary" @click="openDel(scope.row)"
                                    v-if="$p(['system:config:remove'])">删除</el-link>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </admin-table>
    </div>
</template>

<script setup>
import { listConfig, delConfig, refreshCache } from '@/api/system/config'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { h } from 'vue'
import { ElMessage } from 'element-plus'
import { getDict } from '@/utils/dict'
import { syncConfirm } from "@/utils/utils"
import { download } from '@/api/request'

getDict(['sys_yes_no'])
const adminDialog = useAdminDialog()
let $table

async function openAdd() {
    adminDialog(
        h((await import('./post.vue')).default, {
            onSuccess: () => {
                $table.getTable()
            }
        }),
        { title: '新增参数', width: "500px" }
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
        { title: '修改参数', width: "500px" }
    )
}

function openDel(row) {
    let ids = row ? [row.configId] : $table.selection.map(item => item.configId)
    syncConfirm(
        `是否确认删除参数编号为"${ids.join(',')}"的数据项?`,
        () => delConfig(ids.join(','))
    ).then(() => {
        ElMessage.success("删除成功")
        $table.getTable()
    }).catch(() => { })
}

function handleExport() {
    download("system/config/export", {
        ...$table.query,
    }, `config_${new Date().getTime()}.xlsx`);
}

function handleRefreshCache() {
    refreshCache().then(() => {
        ElMessage.success("刷新成功")
    })
}
</script>