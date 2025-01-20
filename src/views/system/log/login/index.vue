<template>
    <div class="admin-view">
        <admin-table :api="list" @init="(table) => { $table = table }">
            <template #search>
                <el-form ref="queryForm" @submit.prevent="$table.search" :inline="true" :model="$table.query">
                    <admin-grid :cols="4" :x-gap="20">
                        <el-form-item label="登录地址">
                            <el-input v-model="$table.query.ipaddr" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="用户名称">
                            <el-input v-model="$table.query.userName" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="状态">
                            <select-dict :dict="$dict.sys_common_status" v-model="$table.query.status"
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
                <el-button type="danger" plain icon="Delete" :disabled="$table.selection.length == 0" @click="openDel()"
                    v-if="$p(['system:logininfor:remove'])">删除</el-button>
                <el-button type="danger" plain icon="Delete" @click="handleClean"
                    v-if="$p(['system:logininfor:remove'])">清空</el-button>
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-if="$p(['system:logininfor:export'])">导出</el-button>
                <el-button type="primary" plain icon="Unlock" @click="handleUnlock"
                    v-if="$p(['system:logininfor:unlock'])">解锁</el-button>
            </template>

            <template #table>
                <el-table :data="$table.data" v-loading="$table.loading"
                    @selection-change="$table.handleSelectionChange">
                    <el-table-column type="selection" width="55" align="center" />
                    <el-table-column label="访问编号" align="center" prop="infoId" />
                    <el-table-column label="用户名称" align="center" prop="userName" :show-overflow-tooltip="true" />
                    <el-table-column label="登录地址" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
                    <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
                    <el-table-column label="浏览器" align="center" prop="browser" :show-overflow-tooltip="true" />
                    <el-table-column label="操作系统" align="center" prop="os" :show-overflow-tooltip="true" />
                    <el-table-column label="登录状态" align="center" prop="status">
                        <template #default="scope">
                            <dict-tag :options="$dict.sys_common_status" :value="scope.row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作信息" align="center" prop="msg" :show-overflow-tooltip="true" />
                    <el-table-column label="登录时间" align="center" prop="loginTime" width="180" />
                </el-table>
            </template>
        </admin-table>
    </div>
</template>

<script setup>
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from '@/api/system/logininfor'
import { ElMessage } from 'element-plus'
import { getDict } from '@/utils/dict'
import { syncConfirm } from "@/utils/utils"
import { download } from '@/api/request'

getDict(['sys_common_status'])
let $table

function openDel(row) {
    let ids = row ? [row.infoId] : $table.selection.map(item => item.infoId)
    syncConfirm(
        `是否确认删除访问编号为"${ids.join(',')}"的数据项?`,
        () => delLogininfor(ids.join(','))
    ).then(() => {
        ElMessage.success("删除成功")
        $table.getTable()
    }).catch(() => { })
}

function handleClean() {
    syncConfirm(
        "是否确认清空所有登录日志数据项?",
        cleanLogininfor
    ).then(() => {
        ElMessage.success("清空成功")
        $table.getTable()
    }).catch(() => { })
}

function handleExport() {
    download("system/logininfor/export", {
        ...$table.query,
    }, `logininfor_${new Date().getTime()}.xlsx`);
}

function handleUnlock() {
    syncConfirm(
        `是否确认解锁用户"${$table.selection.map(item => item.userName).join(',')}"数据项?`,
        unlockLogininfor
    ).then(() => {
        ElMessage.success("解锁成功")
    }).catch(() => { })
}
</script>