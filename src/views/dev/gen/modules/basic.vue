<template>
    <div class="gen-basic" v-loading="loading">
        <el-alert type="warning" :closable="false" show-icon class="gen-basic-tip"
            title="数据源由数据表列表接口返回；上级菜单按 menuParentId 提交，需后端新增/编辑参数同步支持后才会落库。" />

        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
            <el-row :gutter="24">
                <el-col :span="12">
                    <el-form-item label="数据表" prop="tableName">
                        <el-select v-model="form.tableName" filterable clearable placeholder="请选择数据表"
                            :loading="dbTableLoading" style="width: 100%" @change="handleTableChange">
                            <el-option v-for="item in dbTableOptions" :key="item.tableName"
                                :label="`${item.tableRemark || item.tableName} (${item.tableName})`"
                                :value="item.tableName" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="表主键" prop="pkColumnName">
                        <el-select v-model="form.pkColumnName" filterable allow-create default-first-option
                            placeholder="请选择或输入主键字段" style="width: 100%">
                            <el-option v-for="item in pkOptions" :key="item.columnName"
                                :label="`${item.columnName} ${item.columnRemark || ''}`" :value="item.columnName" />
                        </el-select>
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="模块名" prop="moduleName">
                        <el-input v-model="form.moduleName" placeholder="如 sys" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="插件名" prop="pluginName">
                        <el-input v-model="form.pluginName" placeholder="如 nuocao-plugin-sys" />
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="移除表前缀" prop="removeTablePrefix">
                        <el-radio-group v-model="form.removeTablePrefix" @change="recalcNames">
                            <el-radio :value="1">是</el-radio>
                            <el-radio :value="0">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="生成方式" prop="generateType">
                        <el-radio-group v-model="form.generateType">
                            <el-radio value="zip">压缩包</el-radio>
                            <el-radio value="local">项目内</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="上级菜单" prop="menuParentId">
                        <el-tree-select v-model="form.menuParentId" :data="menuTree" :props="parentTreeProps"
                            check-strictly :render-after-expand="false" clearable filterable
                            placeholder="请选择上级菜单" style="width: 100%" />
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="功能名" prop="functionName">
                        <el-input v-model="form.functionName" placeholder="如 用户管理" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="业务名" prop="businessName">
                        <el-input v-model="form.businessName" placeholder="如 user" />
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="类名" prop="className">
                        <el-input v-model="form.className" placeholder="如 User" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="表单布局" prop="formLayout">
                        <el-radio-group v-model="form.formLayout">
                            <el-radio value="vertical">垂直</el-radio>
                            <el-radio value="horizontal">水平</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="使用栅格" prop="isGrid">
                        <el-radio-group v-model="form.isGrid">
                            <el-radio value="1">是</el-radio>
                            <el-radio value="0">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="显示排序" prop="sortCode">
                        <el-input-number v-model="form.sortCode" :min="0" controls-position="right"
                            style="width: 100%" />
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="包名" prop="packageName">
                        <el-input v-model="form.packageName" placeholder="如 com.nuocao" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="作者" prop="authorName">
                        <el-input v-model="form.authorName" placeholder="请输入作者" />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as genApi from '@/api/dev/gen-api'
import { useSystemStore } from '@/stores/index'

const systemStore = useSystemStore()
const formRef = ref()
const loading = ref(false)
const dbTableLoading = ref(false)
const dbTableOptions = ref([])
const dbColumns = ref([])
const menuTree = ref([])
// 详情回显时接口返回的数据源，作为数据表列表未命中时的兜底
const detailDataSource = ref('')

const form = reactive(createDefaultForm())

const rules = {
    tableName: [{ required: true, message: '请选择数据表', trigger: 'change' }],
    pkColumnName: [{ required: true, message: '请选择表主键', trigger: 'change' }],
    moduleName: [{ required: true, message: '请输入模块名', trigger: 'blur' }],
    pluginName: [{ required: true, message: '请输入插件名', trigger: 'blur' }],
    generateType: [{ required: true, message: '请选择生成方式', trigger: 'change' }],
    menuParentId: [{ required: true, message: '请选择上级菜单', trigger: 'change' }],
    functionName: [{ required: true, message: '请输入功能名', trigger: 'blur' }],
    businessName: [{ required: true, message: '请输入业务名', trigger: 'blur' }],
    className: [{ required: true, message: '请输入类名', trigger: 'blur' }],
    formLayout: [{ required: true, message: '请选择表单布局', trigger: 'change' }],
    sortCode: [{ required: true, message: '请输入显示排序', trigger: 'change' }],
    packageName: [{ required: true, message: '请输入包名', trigger: 'blur' }],
    authorName: [{ required: true, message: '请输入作者', trigger: 'blur' }]
}

const pkOptions = computed(() => dbColumns.value || [])

const parentTreeProps = {
    value: 'id',
    label: 'title',
    children: 'children',
    disabled: (data) => data.type === 'button' || data.type === 'param'
}

function createDefaultForm() {
    return {
        id: undefined,
        tableName: '',
        pkColumnName: '',
        pluginName: 'nuocao-plugin-biz',
        moduleName: 'biz',
        removeTablePrefix: 1,
        generateType: 'zip',
        menuParentId: '',
        mobileModule: '',
        functionName: '',
        businessName: '',
        className: '',
        formLayout: 'vertical',
        isGrid: '1',
        sortCode: 99,
        authorName: systemStore.state.user?.name || '',
        packageName: 'com.nuocao'
    }
}

function toPascalCase(value) {
    return (value || '')
        .split('_')
        .filter(Boolean)
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join('')
}

function toCamelCase(value) {
    const pascal = toPascalCase(value)
    return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : ''
}

function getTableNameNoPrefix() {
    if (form.removeTablePrefix !== 1) {
        return form.tableName
    }
    const index = form.tableName.indexOf('_')
    return index > -1 ? form.tableName.slice(index + 1) : form.tableName
}

function recalcNames() {
    if (!form.tableName) {
        return
    }
    // 移除前缀仅作用于业务名，类名始终使用完整表名
    form.className = toPascalCase(form.tableName)
    form.businessName = toCamelCase(getTableNameNoPrefix())
}

function loadOptions() {
    const tasks = []
    if (!dbTableOptions.value.length) {
        tasks.push(
            genApi
                .getDbTables()
                .then((res) => {
                    dbTableOptions.value = res.data || []
                })
                .catch(() => { })
        )
    }
    if (!menuTree.value.length) {
        tasks.push(
            genApi
                .getMenuTree()
                .then((res) => {
                    menuTree.value = res.data || []
                })
                .catch(() => { })
        )
    }
    return Promise.all(tasks)
}

// 数据源由数据表列表接口返回，按表名匹配；详情回显时用接口返回的数据源兜底
function resolveDataSource() {
    const table = dbTableOptions.value.find((item) => item.tableName === form.tableName)
    return table?.dataSource || detailDataSource.value || ''
}

function loadColumns(autoFill) {
    if (!form.tableName) {
        dbColumns.value = []
        return
    }
    const dataSourceName = resolveDataSource()
    if (!dataSourceName) {
        dbColumns.value = []
        ElMessage.warning('未获取到该数据表的数据源，请重新选择数据表')
        return
    }
    dbTableLoading.value = true
    genApi
        .getDbTableColumns(dataSourceName, form.tableName)
        .then((res) => {
            dbColumns.value = res.data || []
            if (autoFill) {
                applyAutoFill(dbColumns.value)
            }
        })
        .catch(() => {
            dbColumns.value = []
        })
        .finally(() => {
            dbTableLoading.value = false
        })
}

function applyAutoFill(columns) {
    const table = dbTableOptions.value.find((item) => item.tableName === form.tableName)
    const tableName = form.tableName
    const prefixIndex = tableName.indexOf('_')
    const prefix = prefixIndex > 0 ? tableName.slice(0, prefixIndex) : ''

    form.functionName = table?.tableRemark || tableName
    form.moduleName = prefix || 'biz'
    form.pluginName = `nuocao-plugin-${form.moduleName}`
    form.packageName = 'com.nuocao'
    recalcNames()

    const primary = (columns || []).find((item) => item.columnName === 'id') || (columns || [])[0]
    if (primary) {
        form.pkColumnName = primary.columnName
    }
}

function handleTableChange() {
    detailDataSource.value = ''
    loadColumns(true)
}

function applyDetail(data) {
    detailDataSource.value = data.dataSourceName || data.dataSource || ''
    Object.assign(form, {
        id: data.id,
        tableName: data.tableName ?? '',
        pkColumnName: data.pkColumnName ?? '',
        pluginName: data.pluginName ?? '',
        moduleName: data.moduleName ?? '',
        removeTablePrefix: Number(data.removeTablePrefix ?? 1),
        generateType: data.generateType || 'zip',
        menuParentId: data.menuParentId != null ? data.menuParentId : '',
        mobileModule: data.mobileModule || '',
        functionName: data.functionName ?? '',
        businessName: data.businessName || data.businessName || '',
        className: data.className ?? '',
        formLayout: data.formLayout || 'vertical',
        isGrid: String(data.isGrid ?? data.isGrid ?? 1),
        sortCode: data.sortCode ?? 99,
        authorName: data.authorName ?? '',
        packageName: data.packageName ?? ''
    })
}

function onOpen(id, fallback) {
    Object.assign(form, createDefaultForm())
    form.id = id
    detailDataSource.value = ''
    nextTick(() => formRef.value?.clearValidate())

    // 先确保数据表列表就绪，再回显并加载字段（需要其中的数据源）
    return loadOptions().then(() => {
        if (fallback) {
            applyDetail(fallback)
            loadColumns(false)
            return
        }
        if (!id) {
            return
        }

        loading.value = true
        return genApi
            .getGenDetail(id)
            .then((res) => {
                applyDetail(res.data || {})
                loadColumns(false)
            })
            .catch(() => { })
            .finally(() => {
                loading.value = false
            })
    })
}

function buildPayload() {
    return {
        id: form.id,
        tableName: form.tableName,
        pkColumnName: form.pkColumnName,
        pluginName: form.pluginName,
        moduleName: form.moduleName,
        removeTablePrefix: Number(form.removeTablePrefix),
        generateType: form.generateType,
        menuParentId: String(form.menuParentId ?? ''),
        mobileModule: form.mobileModule || '',
        functionName: form.functionName,
        businessName: form.businessName,
        className: form.className,
        formLayout: form.formLayout,
        isGrid: String(form.isGrid),
        sortCode: Number(form.sortCode) || 0,
        authorName: form.authorName,
        packageName: form.packageName,
        isGrid: Number(form.isGrid),
        dataSourceName: resolveDataSource()
    }
}

async function onSubmit() {
    if (loading.value) {
        return null
    }
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) {
        return null
    }

    loading.value = true
    try {
        const payload = buildPayload()
        const isEdit = !!form.id
        const res = isEdit ? await genApi.editGenTable(payload) : await genApi.addGenTable(payload)
        const data = res.data || {}
        form.id = data.id || form.id
        ElMessage.success(isEdit ? '保存成功' : '新增成功')
        return {
            ...form,
            ...data,
            id: form.id,
            businessName: data.businessName || form.businessName,
            isGrid: Number(form.isGrid),
            menuParentId: form.menuParentId
        }
    } finally {
        loading.value = false
    }
}

defineExpose({ onOpen, onSubmit })
</script>

<style lang="scss" scoped>
.gen-basic {
    padding: 4px;

    .gen-basic-tip {
        margin-bottom: 18px;
    }

    .el-form {
        max-width: 1200px;
    }
}
</style>
