<template>
    <div class="gen-config" v-loading="loading">
        <el-alert type="warning" :closable="false" show-icon class="gen-config-tip"
            title="后端 validAnnotation 校验逻辑存在缺陷，选择 @Mobile/@Email 可能保存失败；字段表结构需后端对齐后才能正常加载。" />

        <el-table :data="rows" border size="small" max-height="calc(100vh - 350px)" class="gen-config-table">
            <el-table-column prop="columnName" label="字段名" width="150" fixed show-overflow-tooltip />
            <el-table-column label="字段描述" width="160">
                <template #default="{ row }">
                    <el-input v-model="row.columnRemark" size="small" placeholder="字段描述" />
                </template>
            </el-table-column>
            <el-table-column prop="columnType" label="字段类型" width="120" show-overflow-tooltip />
            <el-table-column label="Java类型" width="140">
                <template #default="{ row }">
                    <el-select v-model="row.javaType" size="small" style="width: 100%">
                        <el-option v-for="item in javaTypeOptions" :key="item" :label="item" :value="item" />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="组件类型" width="140">
                <template #default="{ row }">
                    <el-select v-model="row.htmlType" size="small" style="width: 100%" @change="handleHtmlTypeChange(row)">
                        <el-option v-for="item in htmlTypeOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="字典类型" width="170">
                <template #default="{ row }">
                    <el-select v-model="row.dictType" size="small" clearable filterable
                        :disabled="!isDictField(row)" placeholder="无" style="width: 100%">
                        <el-option v-for="item in dictOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </template>
            </el-table-column>

            <el-table-column label="列表" width="70" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row.isList" :active-value="1" :inactive-value="0" size="small" />
                </template>
            </el-table-column>
            <el-table-column label="忽略" width="70" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row.isIgnore" :active-value="1" :inactive-value="0" size="small"
                        :disabled="row.isList !== 1" />
                </template>
            </el-table-column>
            <el-table-column label="详情" width="70" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row.isView" :active-value="1" :inactive-value="0" size="small" />
                </template>
            </el-table-column>
            <el-table-column label="新增" width="70" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row.isAdd" :active-value="1" :inactive-value="0" size="small"
                        :disabled="isCommonField(row)" />
                </template>
            </el-table-column>
            <el-table-column label="编辑" width="70" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row.isEdit" :active-value="1" :inactive-value="0" size="small"
                        :disabled="isCommonField(row)" />
                </template>
            </el-table-column>
            <el-table-column label="必填" width="70" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row.isRequired" :active-value="1" :inactive-value="0" size="small"
                        :disabled="isCommonField(row)" />
                </template>
            </el-table-column>
            <el-table-column label="唯一" width="70" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row.isOnly" :active-value="1" :inactive-value="0" size="small"
                        :disabled="isCommonField(row)" />
                </template>
            </el-table-column>
            <el-table-column label="查询" width="70" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row.isQuery" :active-value="1" :inactive-value="0" size="small" />
                </template>
            </el-table-column>

            <el-table-column label="最小值" width="110">
                <template #default="{ row }">
                    <el-input v-model="row.valueSizeMin" size="small" placeholder="最小" />
                </template>
            </el-table-column>
            <el-table-column label="最大值" width="110">
                <template #default="{ row }">
                    <el-input v-model="row.valueSizeMax" size="small" placeholder="最大" />
                </template>
            </el-table-column>
            <el-table-column label="校验注解" width="140">
                <template #default="{ row }">
                    <el-select v-model="row.validAnnotation" size="small" clearable placeholder="无" style="width: 100%">
                        <el-option v-for="item in validAnnotationOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </template>
            </el-table-column>
        </el-table>

        <div class="gen-config-footer">
            <span class="gen-config-count">共 {{ rows.length }} 个字段</span>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as genApi from '@/api/dev/gen-api'
import { getDictTree } from '@/api/dev/dict-api'

const props = defineProps({
    tableId: [String, Number]
})

const loading = ref(false)
const saving = ref(false)
const rows = ref([])
const dictOptions = ref([])

const htmlTypeOptions = [
    { label: '单行文本', value: 'input' },
    { label: '多行文本', value: 'textarea' },
    { label: '下拉框', value: 'select' },
    { label: '单选框', value: 'radio' },
    { label: '复选框', value: 'checkbox' },
    { label: '日期选择', value: 'date_picker' },
    { label: '时间选择', value: 'time_picker' },
    { label: '数字输入框', value: 'input_number' },
    { label: '滑动数字条', value: 'slider' },
    { label: '开关', value: 'switch' },
    { label: '图片上传', value: 'upload_image' },
    { label: '文件上传', value: 'upload_file' },
    { label: '富文本编辑器', value: 'editor' }
]

const javaTypeOptions = [
    'Integer',
    'Long',
    'String',
    'Boolean',
    'Float',
    'Double',
    'Date',
    'LocalDateTime',
    'BigDecimal'
]

const validAnnotationOptions = [
    { label: '无', value: '' },
    { label: '@Mobile', value: '@Mobile' },
    { label: '@Email', value: '@Email' }
]

const DICT_HTML_TYPES = ['select', 'radio', 'checkbox']
const COMMON_FIELDS = ['create_user', 'create_time', 'update_user', 'update_time', 'tenant_id']

function isDictField(row) {
    return DICT_HTML_TYPES.includes(row.htmlType)
}

function isCommonField(row) {
    return COMMON_FIELDS.includes(row.columnName)
}

function toCamelCase(value) {
    return (value || '')
        .split('_')
        .filter(Boolean)
        .map((item, index) => {
            const text = item.toLowerCase()
            return index === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1)
        })
        .join('')
}

function normalizeNumber(value) {
    const num = Number(value)
    return Number.isNaN(num) ? 0 : num
}

function normalizeRow(row) {
    const common = COMMON_FIELDS.includes(row.columnName)
    return {
        ...row,
        columnRemark: row.columnRemark || '',
        javaName: row.javaName || toCamelCase(row.columnName),
        htmlType: row.htmlType || 'input',
        dictType: row.dictType || '',
        isList: normalizeNumber(row.isList),
        isIgnore: normalizeNumber(row.isIgnore),
        isView: normalizeNumber(row.isView),
        isAdd: common ? 0 : normalizeNumber(row.isAdd),
        isEdit: common ? 0 : normalizeNumber(row.isEdit),
        isRequired: common ? 0 : normalizeNumber(row.isRequired),
        isOnly: common ? 0 : normalizeNumber(row.isOnly),
        isQuery: normalizeNumber(row.isQuery),
        valueSizeMin: row.valueSizeMin == null ? '' : String(row.valueSizeMin),
        valueSizeMax: row.valueSizeMax == null ? '' : String(row.valueSizeMax),
        validAnnotation: row.validAnnotation || ''
    }
}

function loadDictOptions() {
    if (dictOptions.value.length) {
        return
    }
    getDictTree()
        .then((res) => {
            dictOptions.value = (res.data || []).map((item) => ({
                label: item.dictLabel,
                value: item.dictValue
            }))
        })
        .catch(() => { })
}

function onOpen() {
    if (!props.tableId) {
        rows.value = []
        return
    }
    loadDictOptions()
    loading.value = true
    genApi
        .getColumnList(props.tableId)
        .then((res) => {
            rows.value = (res.data || [])
                .filter((row) => row.isPk !== 1 && row.columnName !== 'delete_flag')
                .map(normalizeRow)
        })
        .catch(() => {
            rows.value = []
        })
        .finally(() => {
            loading.value = false
        })
}

function handleHtmlTypeChange(row) {
    if (!isDictField(row)) {
        row.dictType = ''
    }
}

function toDecimal(value) {
    if (value === '' || value == null) {
        return null
    }
    const num = Number(value)
    return Number.isNaN(num) ? null : num
}

function toParam(row) {
    return {
        id: row.id,
        tableId: row.tableId || props.tableId,
        isPk: normalizeNumber(row.isPk),
        columnName: row.columnName,
        columnRemark: (row.columnRemark || '').trim(),
        columnType: row.columnType || '',
        javaType: row.javaType || '',
        javaName: row.javaName || toCamelCase(row.columnName),
        htmlType: row.htmlType || 'input',
        dictType: row.dictType || '',
        isList: normalizeNumber(row.isList),
        isIgnore: normalizeNumber(row.isIgnore),
        isView: normalizeNumber(row.isView),
        isAdd: normalizeNumber(row.isAdd),
        isEdit: normalizeNumber(row.isEdit),
        isRequired: normalizeNumber(row.isRequired),
        isOnly: normalizeNumber(row.isOnly),
        isQuery: normalizeNumber(row.isQuery),
        queryType: row.queryType == null ? null : row.queryType,
        valueSizeMin: toDecimal(row.valueSizeMin),
        valueSizeMax: toDecimal(row.valueSizeMax),
        validAnnotation: row.validAnnotation || '',
        sortCode: row.sortCode
    }
}

async function onSubmit() {
    if (saving.value) {
        return false
    }
    if (!props.tableId) {
        ElMessage.warning('请先保存基础信息')
        return false
    }
    if (!rows.value.length) {
        ElMessage.warning('暂无可配置字段')
        return false
    }
    for (const row of rows.value) {
        if (!(row.columnRemark || '').trim()) {
            ElMessage.warning(`字段 ${row.columnName} 的描述不能为空`)
            return false
        }
        if (isDictField(row) && !row.dictType) {
            ElMessage.warning(`字段 ${row.columnName} 使用字典组件时必须选择字典类型`)
            return false
        }
    }

    saving.value = true
    try {
        await genApi.saveColumns(props.tableId, rows.value.map(toParam))
        ElMessage.success('字段配置保存成功')
        return true
    } catch (e) {
        return false
    } finally {
        saving.value = false
    }
}

defineExpose({ onOpen, onSubmit, saving })
</script>

<style lang="scss" scoped>
.gen-config {
    .gen-config-tip {
        margin-bottom: 12px;
    }

    .gen-config-table {
        width: 100%;
    }

    .gen-config-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-top: 12px;
        color: var(--el-text-color-secondary);
        font-size: 13px;
    }
}
</style>
