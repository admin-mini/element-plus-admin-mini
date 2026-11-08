<template>
    <div class="preview-panel" v-loading="loading">
        <el-empty v-if="!loading && !groups.length" description="暂无预览数据" />

        <el-tabs v-else v-model="activeGroup" class="preview-groups">
            <el-tab-pane v-for="group in groups" :key="group.key" :name="group.key"
                :label="`${group.title} (${group.files.length})`">
                <div class="preview-layout">
                    <div class="preview-file-list">
                        <div v-for="file in group.files" :key="file.codeFileName" class="preview-file-item"
                            :class="{ active: currentFile(group)?.codeFileName === file.codeFileName }"
                            @click="selectFile(group, file)">
                            {{ file.codeFileName }}
                        </div>
                    </div>
                    <div class="preview-code">
                        <div class="preview-code-header">
                            <span class="preview-code-path">{{ currentFile(group)?.codeFileWithPathName }}</span>
                            <el-button link type="primary" icon="CopyDocument" @click="copyCode(group)">复制</el-button>
                        </div>
                        <pre class="preview-code-content">{{ currentFile(group)?.codeFileContent }}</pre>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as genApi from '@/api/dev/gen-api'

const props = defineProps({
    tableId: [String, Number]
})

const loading = ref(false)
const activeGroup = ref('')
const activeFiles = reactive({})
const previewData = ref({})

const groups = computed(() => {
    const data = previewData.value || {}
    const result = [
        { key: 'web', title: '前端', files: data.webResultList || [] },
        { key: 'java', title: '后端', files: data.javaResultList || [] },
        { key: 'sql', title: 'SQL', files: data.sqlResultList || [] },
        { key: 'i18n', title: '语言包', files: data.i18nResultList || [] }
    ]
    return result.filter((item) => item.files.length)
})

function currentFile(group) {
    return (
        group.files.find((file) => file.codeFileName === activeFiles[group.key]) || group.files[0]
    )
}

function selectFile(group, file) {
    activeFiles[group.key] = file.codeFileName
}

function initActiveFiles() {
    groups.value.forEach((group) => {
        if (!activeFiles[group.key]) {
            activeFiles[group.key] = group.files[0].codeFileName
        }
    })
    if (!groups.value.some((group) => group.key === activeGroup.value)) {
        activeGroup.value = groups.value[0]?.key || ''
    }
}

function loadPreview() {
    if (!props.tableId) {
        previewData.value = {}
        return
    }
    loading.value = true
    genApi
        .previewCode(props.tableId)
        .then((res) => {
            previewData.value = res.data || {}
            initActiveFiles()
        })
        .catch(() => {
            previewData.value = {}
        })
        .finally(() => {
            loading.value = false
        })
}

async function copyCode(group) {
    const content = currentFile(group)?.codeFileContent || ''
    try {
        await navigator.clipboard.writeText(content)
        ElMessage.success('已复制到剪贴板')
    } catch (e) {
        const textarea = document.createElement('textarea')
        textarea.value = content
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        ElMessage.success('已复制到剪贴板')
    }
}

watch(
    () => props.tableId,
    () => loadPreview(),
    { immediate: true }
)

watch(groups, () => initActiveFiles())
</script>

<style lang="scss" scoped>
.preview-panel {
    min-height: 200px;
}

.preview-layout {
    display: flex;
    gap: 12px;
    height: 52vh;
    min-height: 320px;
}

.preview-file-list {
    width: 220px;
    flex-shrink: 0;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    padding: 6px;
}

.preview-file-item {
    padding: 7px 10px;
    border-radius: 4px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    word-break: break-all;

    &:hover {
        background: var(--el-fill-color-light);
    }

    &.active {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
    }
}

.preview-code {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    overflow: hidden;
}

.preview-code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 12px;
    background: var(--el-fill-color-light);
    font-size: 13px;
}

.preview-code-path {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-secondary);
}

.preview-code-content {
    flex: 1;
    margin: 0;
    padding: 12px;
    overflow: auto;
    font-family: Consolas, Monaco, 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre;
    tab-size: 4;
}
</style>
