<template>
    <div class="admin-view">
        <template v-if="indexShow">
            <admin-table :api="genApi.getGenPage" @init="onTableInit">
                <template #search>
                    <el-form ref="queryForm" @submit.prevent="$table.search" :inline="true" :model="$table.query">
                        <admin-grid :cols="4" :x-gap="20">
                            <el-form-item label="表名">
                                <el-input v-model="$table.query.tableName" clearable placeholder="请输入表名"></el-input>
                            </el-form-item>
                            <template #last>
                                <el-button native-type="submit" type="primary" icon="Search"
                                    :loading="$table.loading">搜索</el-button>
                            </template>
                        </admin-grid>
                    </el-form>
                </template>

                <template #btn>
                    <el-button type="primary" icon="Plus" @click="handleAdd"
                        v-if="$p(['gen:table:add'])">新增配置</el-button>
                </template>

                <template #table>
                    <el-table :data="$table.data" v-loading="$table.loading">
                        <el-table-column prop="tableName" label="表名" min-width="160" show-overflow-tooltip />
                        <el-table-column prop="functionName" label="功能名" min-width="140" show-overflow-tooltip />
                        <el-table-column prop="businessName" label="业务名" min-width="120" show-overflow-tooltip />
                        <el-table-column prop="className" label="类名" min-width="140" show-overflow-tooltip />
                        <el-table-column prop="moduleName" label="模块名" width="110" show-overflow-tooltip />
                        <el-table-column label="生成方式" width="100" align="center">
                            <template #default="{ row }">
                                <el-tag :type="row.generateType === 'local' ? 'warning' : 'success'" size="small">
                                    {{ formatGenType(row.generateType) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="authorName" label="作者" width="110" show-overflow-tooltip />
                        <el-table-column prop="sortCode" label="排序" width="80" align="center" />
                        <el-table-column label="操作" width="240" fixed="right">
                            <template #default="{ row }">
                                <el-space spacer="|">
                                    <el-button link type="primary" icon="View" @click="handlePreview(row)"
                                        v-if="$p(['gen:code:exec'])">预览</el-button>
                                    <el-button link type="primary" icon="Edit" @click="handleEdit(row)"
                                        v-if="$p(['gen:table:edit'])">配置</el-button>
                                    <el-button link type="primary" icon="Download" :loading="genLoadingId === row.id"
                                        @click="handleGen(row)" v-if="$p(['gen:code:exec'])">生成</el-button>
                                    <el-button link type="danger" icon="Delete" @click="handleDel(row)"
                                        v-if="$p(['gen:table:delete'])">删除</el-button>
                                </el-space>
                            </template>
                        </el-table-column>
                    </el-table>
                </template>
            </admin-table>
        </template>

        <steps v-else ref="stepsRef" @closed="handleStepsClosed" />
    </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as genApi from '@/api/dev/gen-api'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { syncConfirm } from '@/utils/utils'
import steps from './modules/steps.vue'

const adminDialog = useAdminDialog()
const indexShow = ref(true)
const stepsRef = ref()
const genLoadingId = ref()

let $table

function onTableInit(table) {
    $table = table
    // 代码生成接口分页参数为 current/size
    $table.query.current = 1
    $table.ref = null
    $table.parseQuery = (query) => ({
        current: query.current || 1,
        size: query.size,
        tableName: query.tableName
    })
}

function formatGenType(type) {
    return type === 'local' ? '项目内' : '压缩包'
}

function handleAdd() {
    indexShow.value = false
    nextTick(() => stepsRef.value?.onOpen())
}

function handleEdit(record) {
    indexShow.value = false
    nextTick(() => stepsRef.value?.onOpen(record.id))
}

function handleStepsClosed(refresh) {
    indexShow.value = true
    if (refresh) {
        $table?.getTable()
    }
}

function handlePreview(record) {
    adminDialog({
        component: import('./modules/preview-panel.vue'),
        props: { tableId: record.id },
        dialogProps: {
            title: `代码预览 - ${record.tableName}`,
            width: '1200px',
            destroyOnClose: true
        }
    })
}

function handleDel(record) {
    syncConfirm(`是否确认删除表"${record.tableName}"的生成配置?`, () =>
        genApi.deleteGenTable([{ id: record.id }])
    )
        .then(() => {
            ElMessage.success('删除成功')
            $table.getTable()
        })
        .catch(() => { })
}

function handleGen(record) {
    if (record.generateType === 'local') {
        ElMessageBox.confirm(
            '当前后端对「项目内生成」支持不完整，可能生成失败，是否继续？',
            '提示',
            { type: 'warning' }
        )
            .then(() => {
                genLoadingId.value = record.id
                return genApi.execGenProject(record.id)
            })
            .then((res) => {
                if (res) {
                    ElMessage.success(res.msg || '生成成功')
                }
            })
            .catch(() => { })
            .finally(() => {
                genLoadingId.value = null
            })
        return
    }

    genLoadingId.value = record.id
    genApi
        .execGenZip(record.id)
        .then(async (blob) => {
            const downloaded = await genApi.downloadBlob(blob, `${record.tableName}.zip`)
            if (downloaded) {
                ElMessage.success('生成成功')
            }
        })
        .catch(() => { })
        .finally(() => {
            genLoadingId.value = null
        })
}
</script>

<style lang="scss" scoped></style>
