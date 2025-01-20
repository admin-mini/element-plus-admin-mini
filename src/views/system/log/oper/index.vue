<template>
    <div class="admin-view">
        <admin-table :api="list" @init="(table) => { $table = table }">
            <template #search>
                <el-form ref="queryForm" @submit.prevent="$table.search" label-width="auto" :model="$table.query">
                    <admin-grid :cols="4" :x-gap="20">
                        <el-form-item label="操作地址">
                            <el-input v-model="$table.query.operIp" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="系统模块">
                            <el-input v-model="$table.query.title" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="操作人员">
                            <el-input v-model="$table.query.operName" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="类型">
                            <select-dict :dict="$dict.sys_oper_type" v-model="$table.query.businessType"
                                show-all></select-dict>
                        </el-form-item>
                        <el-form-item label="状态">
                            <select-dict :dict="$dict.sys_common_status" v-model="$table.query.status"
                                show-all></select-dict>
                        </el-form-item>
                        <el-form-item label="创建时间">
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
                <el-button type="danger" plain icon="Delete" :disabled="$table.selection.length == 0" @click="openDel()"
                    v-if="$p(['monitor:operlog:remove'])">删除</el-button>
                <el-button type="danger" plain icon="Delete" @click="handleClean"
                    v-if="$p(['monitor:operlog:remove'])">清空</el-button>
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-if="$p(['monitor:operlog:export'])">导出</el-button>
            </template>

            <template #table>
                <el-table :data="$table.data" v-loading="$table.loading"
                    @selection-change="$table.handleSelectionChange">
                    <el-table-column type="selection" width="55" align="center" />
                    <el-table-column label="日志编号" align="center" prop="operId" />
                    <el-table-column label="系统模块" align="center" prop="title" :show-overflow-tooltip="true" />
                    <el-table-column label="操作类型" align="center" prop="businessType">
                        <template #default="scope">
                            <dict-tag :options="$dict.sys_oper_type" :value="scope.row.businessType" />
                        </template>
                    </el-table-column>
                    <el-table-column label="请求方式" align="center" prop="requestMethod" />
                    <el-table-column label="操作人员" align="center" prop="operName" :show-overflow-tooltip="true" />
                    <el-table-column label="操作地址" align="center" prop="operIp" :show-overflow-tooltip="true" />
                    <el-table-column label="操作地点" align="center" prop="operLocation" :show-overflow-tooltip="true" />
                    <el-table-column label="操作状态" align="center" prop="status">
                        <template #default="scope">
                            <dict-tag :options="$dict.sys_common_status" :value="scope.row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作时间" align="center" prop="operTime" width="180" />
                    <el-table-column label="操作" align="center" width="100">
                        <template #default="scope">
                            <el-link type="primary" @click="openDetail(scope.row)">详细</el-link>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </admin-table>
    </div>
</template>

<script setup>
import { list, delOperlog, cleanOperlog } from '@/api/system/operlog'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { h } from 'vue'
import { ElMessage } from 'element-plus'
import { getDict } from '@/utils/dict'
import { syncConfirm } from "@/utils/utils"
import { download } from '@/api/request'

getDict(['sys_oper_type', 'sys_common_status'])
const adminDialog = useAdminDialog()
let $table

function openDel(row) {
    let ids = row ? [row.operId] : $table.selection.map(item => item.operId)
    syncConfirm(
        `是否确认删除日志编号为"${ids.join(',')}"的数据项?`,
        () => delOperlog(ids.join(','))
    ).then(() => {
        ElMessage.success("删除成功")
        $table.getTable()
    }).catch(() => { })
}

function handleClean() {
    syncConfirm(
        "是否确认清空所有操作日志数据项?",
        cleanOperlog
    ).then(() => {
        ElMessage.success("清空成功")
        $table.getTable()
    }).catch(() => { })
}

function handleExport() {
    download("monitor/operlog/export", {
        ...$table.query,
    }, `operlog_${new Date().getTime()}.xlsx`);
}

async function openDetail(row) {
    adminDialog(
        h((await import('./detail.vue')).default, {
            row: row
        }),
        { title: '操作日志详细', width: "800px" }
    )
}
</script>