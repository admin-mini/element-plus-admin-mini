<template>
    <div class="gen-steps">
        <div class="gen-steps-header">
            <div class="gen-steps-title">
                <el-button link icon="ArrowLeft" @click="handleClose">返回列表</el-button>
                <span class="title">{{ tableId ? '编辑生成配置' : '新增生成配置' }}</span>
            </div>
            <el-steps :active="current" simple class="gen-steps-nav">
                <el-step title="基础信息" />
                <el-step title="字段配置" />
                <el-step title="预览生成" />
            </el-steps>
        </div>

        <div class="gen-steps-body">
            <basic v-show="current === 0" ref="basicRef" />

            <config-panel v-show="current === 1" ref="configRef" :table-id="tableId" />

            <div v-if="current === 2" class="gen-finish">
                <el-result icon="success" title="配置已完成" sub-title="可以预览生成代码或直接下载压缩包">
                    <template #extra>
                        <el-descriptions :column="3" border>
                            <el-descriptions-item label="表名">{{ tableData?.tableName }}</el-descriptions-item>
                            <el-descriptions-item label="功能名">{{ tableData?.functionName }}</el-descriptions-item>
                            <el-descriptions-item label="业务名">{{ tableData?.businessName }}</el-descriptions-item>
                            <el-descriptions-item label="类名">{{ tableData?.className }}</el-descriptions-item>
                            <el-descriptions-item label="生成方式">
                                {{ tableData?.generateType === 'local' ? '项目内' : '压缩包' }}
                            </el-descriptions-item>
                            <el-descriptions-item label="作者">{{ tableData?.authorName }}</el-descriptions-item>
                        </el-descriptions>
                        <div class="gen-finish-btns">
                            <el-button icon="View" @click="handlePreview">预览代码</el-button>
                            <el-button type="primary" icon="Download" :loading="genLoading" @click="handleGen">
                                生成代码
                            </el-button>
                        </div>
                    </template>
                </el-result>
            </div>
        </div>

        <div class="gen-steps-footer">
            <el-button @click="handleClose">关闭</el-button>
            <div>
                <el-button v-if="current > 0" @click="handlePrev">上一步</el-button>
                <el-button v-if="current < 2" type="primary" :loading="transitionLoading" @click="handleNext">
                    下一步
                </el-button>
                <el-button v-else type="primary" :loading="genLoading" @click="handleGen">生成代码</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import useAdminDialog from '@/plugins/use-admin-dialog'
import * as genApi from '@/api/dev/gen-api'
import basic from './basic.vue'
import configPanel from './config.vue'

const emits = defineEmits(['closed'])
const adminDialog = useAdminDialog()

const basicRef = ref()
const configRef = ref()
const current = ref(0)
const tableId = ref()
const tableData = ref()
const transitionLoading = ref(false)
const genLoading = ref(false)

function onOpen(id) {
    current.value = 0
    tableId.value = id
    tableData.value = null
    nextTick(() => {
        basicRef.value?.onOpen(id)
    })
}

async function handleNext() {
    if (transitionLoading.value) {
        return
    }
    transitionLoading.value = true
    try {
        if (current.value === 0) {
            const data = await basicRef.value.onSubmit()
            if (!data) {
                return
            }
            tableData.value = data
            tableId.value = data.id
            current.value = 1
            await nextTick()
            configRef.value?.onOpen()
        } else if (current.value === 1) {
            const success = await configRef.value.onSubmit()
            if (!success) {
                return
            }
            current.value = 2
        }
    } finally {
        transitionLoading.value = false
    }
}

function handlePrev() {
    current.value -= 1
    nextTick(() => {
        if (current.value === 0) {
            basicRef.value?.onOpen(tableId.value, tableData.value)
        } else if (current.value === 1) {
            configRef.value?.onOpen()
        }
    })
}

function handleClose() {
    emits('closed', !!tableId.value)
}

function handlePreview() {
    if (!tableId.value) {
        return
    }
    adminDialog({
        component: import('./preview-panel.vue'),
        props: { tableId: tableId.value },
        dialogProps: {
            title: `代码预览 - ${tableData.value?.tableName || ''}`,
            width: '1200px',
            destroyOnClose: true
        }
    })
}

function handleGen() {
    if (!tableId.value || genLoading.value) {
        return
    }
    if (tableData.value?.generateType === 'local') {
        ElMessageBox.confirm(
            '当前后端对「项目内生成」支持不完整，可能生成失败，是否继续？',
            '提示',
            { type: 'warning' }
        )
            .then(() => {
                genLoading.value = true
                return genApi.execGenProject(tableId.value)
            })
            .then((res) => {
                if (res) {
                    ElMessage.success(res.msg || '生成成功')
                }
            })
            .catch(() => { })
            .finally(() => {
                genLoading.value = false
            })
        return
    }

    genLoading.value = true
    genApi
        .execGenZip(tableId.value)
        .then(async (blob) => {
            const downloaded = await genApi.downloadBlob(blob, `${tableData.value?.tableName || tableId.value}.zip`)
            if (downloaded) {
                ElMessage.success('生成成功')
            }
        })
        .catch(() => { })
        .finally(() => {
            genLoading.value = false
        })
}

defineExpose({ onOpen })
</script>

<style lang="scss" scoped>
.gen-steps {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 120px);
    background: #fff;
    border-radius: 4px;
}

.gen-steps-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.gen-steps-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .title {
        font-size: 16px;
        font-weight: 600;
    }
}

.gen-steps-nav {
    max-width: 900px;
}

.gen-steps-body {
    flex: 1;
    padding: 20px;
}

.gen-steps-footer {
    display: flex;
    justify-content: space-between;
    padding: 14px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
}

.gen-finish {
    .gen-finish-btns {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin: 20px 0;
    }
}
</style>
