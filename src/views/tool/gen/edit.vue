<template>
  <admin-dialog-content>
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basic">
        <basic-info-form :info="info" ref="basicRef" />
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="column">
        <el-table :data="columns" :max-height="500">
          <el-table-column label="序号" type="index" width="50" align="center" />
          <el-table-column label="字段列名" prop="columnName" width="150" :show-overflow-tooltip="true" />
          <el-table-column label="字段描述" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.columnComment" :disabled="scope.row.columnName === 'id'" />
            </template>
          </el-table-column>
          <el-table-column label="物理类型" prop="columnType" width="120" :show-overflow-tooltip="true" />
          <el-table-column label="Java类型" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.javaType">
                <el-option label="Long" value="Long" />
                <el-option label="String" value="String" />
                <el-option label="Integer" value="Integer" />
                <el-option label="Double" value="Double" />
                <el-option label="BigDecimal" value="BigDecimal" />
                <el-option label="Date" value="Date" />
                <el-option label="Boolean" value="Boolean" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="java属性" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.javaField" />
            </template>
          </el-table-column>

          <el-table-column label="插入" width="40">
            <template #default="scope">
              <el-checkbox v-model="scope.row.isInsert" true-label="1" false-label="0" />
            </template>
          </el-table-column>
          <el-table-column label="编辑" width="40">
            <template #default="scope">
              <el-checkbox v-model="scope.row.isEdit" true-label="1" false-label="0" />
            </template>
          </el-table-column>
          <el-table-column label="列表" width="40">
            <template #default="scope">
              <el-checkbox v-model="scope.row.isList" true-label="1" false-label="0" />
            </template>
          </el-table-column>
          <el-table-column label="查询" width="40">
            <template #default="scope">
              <el-checkbox v-model="scope.row.isQuery" true-label="1" false-label="0" />
            </template>
          </el-table-column>

          <el-table-column label="查询方式" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.queryType">
                <el-option label="=" value="EQ" />
                <el-option label="!=" value="NE" />
                <el-option label=">" value="GT" />
                <el-option label=">=" value="GTE" />
                <el-option label="<" value="LT" />
                <el-option label="<=" value="LTE" />
                <el-option label="LIKE" value="LIKE" />
                <el-option label="BETWEEN" value="BETWEEN" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="必填" width="40">
            <template #default="scope">
              <el-checkbox v-model="scope.row.isRequired" true-label="1" false-label="0" />
            </template>
          </el-table-column>
          <el-table-column label="唯一" width="40">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" size="mini" v-model="scope.row.isOnly"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="最小" width="100px">
            <template #default="scope">
              <el-input-number :controls="false" size="mini" v-model="scope.row.sizeMin"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column label="最大" width="100px">
            <template #default="scope">
              <el-input-number :controls="false" size="mini" v-model="scope.row.sizeMax"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column label="显示类型" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.htmlType">
                <el-option label="文本框" value="input" />
                <el-option label="文本域" value="textarea" />
                <el-option label="下拉框" value="select" />
                <el-option label="单选框" value="radio" />
                <el-option label="复选框" value="checkbox" />
                <el-option label="日期控件" value="datetime" />
                <el-option label="图片上传" value="imageUpload" />
                <el-option label="文件上传" value="fileUpload" />
                <el-option label="富文本控件" value="editor" />
                <el-option label="部门选择" value="deptselect" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="字典类型" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.dictType" clearable filterable>
                <el-option v-for="dict in dictOptions" :key="dict.dictType" :label="dict.dictName"
                  :value="dict.dictType">
                  <span style="float: left">{{ dict.dictName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">
                    {{ dict.dictType }}
                  </span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="生成信息" name="genInfo">
        <gen-info-form :info="info" ref="genRef" />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button type="primary" @click="submitForm" :loading="loading">提交</el-button>
      <el-button @click="emits('end')">取消</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getGenTable, updateGenTable } from '@/api/tool/gen'
import { optionselect as getDictOptionSelect } from '@/api/system/dict/type'
import BasicInfoForm from './basic-info-form.vue'
import GenInfoForm from './gen-info-form.vue'

const props = defineProps({
  tableId: {
    type: [String, Number],
    required: true
  }
})

const emits = defineEmits(['success', 'end'])

const activeName = ref('basic')
const loading = ref(false)
const basicRef = ref()
const genRef = ref()
const dictOptions = ref([])
const info = ref({})
const columns = ref([])

/** 提交按钮 */
function submitForm() {
  const basicForm = basicRef.value.$refs.basicInfoRef
  const genForm = genRef.value.$refs.genInfoRef
  Promise.all([basicForm.validate(), genForm.validate()]).then(() => {
    const data = {
      ...info.value,
      columns: columns.value
    }
    loading.value = true
    updateGenTable(data)
      .then(() => {
        ElMessage.success('修改成功')
        emits('success')
      })
      .finally(() => {
        loading.value = false
      })
  })
}

/** 获取表详细信息 */
function getTableInfo() {
  getGenTable(props.tableId).then((res) => {
    info.value = res.data.info
    info.value.parentMenuId = Number(info.value.parentMenuId)
    columns.value = res.data.rows
  })
}

/** 获取字典下拉框列表 */
function getDicts() {
  getDictOptionSelect().then((response) => {
    dictOptions.value = response.data
  })
}

onMounted(() => {
  getTableInfo()
  getDicts()
})
</script>
