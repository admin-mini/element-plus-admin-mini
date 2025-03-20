<template>
  <div class="admin-view">
    <admin-table :api="listTable" @init="(table) => {
      $table = table
    }
      ">
      <template #search>
        <el-form ref="queryForm" @submit.prevent="$table.search" :model="$table.query">
          <admin-grid :cols="3" :x-gap="20">
            <el-form-item label="表名称">
              <el-input v-model="$table.query.tableName" placeholder="请输入表名称" clearable />
            </el-form-item>
            <el-form-item label="表描述">
              <el-input v-model="$table.query.tableComment" placeholder="请输入表描述" clearable />
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker v-model="$table.query.params.time" type="daterange" range-separator="-"
                start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
            </el-form-item>
            <template #last>
              <el-button type="primary" native-type="submit" icon="Search" :loading="$table.loading">
                搜索
              </el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>

      <template #btn>
        <el-button type="primary" plain icon="Upload" @click="handleImport" v-if="$p(['tool:gen:import'])">
          导入
        </el-button>
        <el-button type="danger" plain icon="Delete" :disabled="$table.selection.length === 0" @click="handleDelete"
          v-if="$p(['tool:gen:remove'])">
          删除
        </el-button>
        <el-button type="success" plain icon="Download" :disabled="$table.selection.length !== 1"
          @click="handleGenTable" v-if="$p(['tool:gen:code'])">
          生成
        </el-button>
        <el-button type="warning" plain icon="Edit" :disabled="$table.selection.length !== 1" @click="handleEditTable"
          v-if="$p(['tool:gen:edit'])">
          编辑
        </el-button>
        <el-button type="info" plain icon="View" :disabled="$table.selection.length !== 1" @click="handlePreview"
          v-if="$p(['tool:gen:preview'])">
          预览
        </el-button>
      </template>

      <template #table>
        <el-table :data="$table.data" v-loading="$table.loading" @selection-change="$table.handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="序号" type="index" width="50" align="center">
            <template #default="scope">
              <span>
                {{
                  (($table.query.pageNum || 1) - 1) * ($table.query.pageSize || 10) +
                  scope.$index +
                  1
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="表名称" align="center" prop="tableName" :show-overflow-tooltip="true" />
          <el-table-column label="表描述" align="center" prop="tableComment" :show-overflow-tooltip="true" />
          <el-table-column label="实体" align="center" prop="className" :show-overflow-tooltip="true" />
          <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
          <el-table-column label="更新时间" align="center" prop="updateTime" width="160" />
        </el-table>
      </template>

      <template #pagination>
        <el-pagination v-model:current-page="$table.query.pageNum" v-model:page-size="$table.query.pageSize"
          :total="$table.total" :page-sizes="[10, 20, 50, 100]" :layout="$table.pageLayout"
          @size-change="$table.handleSizeChange" @current-change="$table.handleCurrentChange" />
      </template>
    </admin-table>

    <!-- 导入表 -->
    <el-dialog v-model="importVisible" title="导入表" width="800px" append-to-body>
      <el-form :model="importForm" ref="importRef">
        <el-form-item label="表名称" prop="tables" :rules="[$rules.required]">
          <el-select v-model="importForm.tables" multiple placeholder="请选择要导入的表" style="width: 100%">
            <el-option v-for="table in dbTableList" :key="table.tableName"
              :label="table.tableName + ' (' + table.tableComment + ')'" :value="table.tableName" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitImport" :loading="importLoading">确 定</el-button>
          <el-button @click="importVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listTable, delTable, importTable, previewTable, genCode, synchDb } from '@/api/tool/gen'
import { listDbTable } from '@/api/tool/gen'
import { syncConfirm } from '@/utils/utils'
import useAdminTable from '@/plugins/use-admin-table'
import useAdminDialog from '@/plugins/use-admin-dialog'

const adminDialog = useAdminDialog()
let $table = useAdminTable({
  api: listTable
})

const importRef = ref()
const importVisible = ref(false)
const importLoading = ref(false)
const dbTableList = ref([])
const importForm = ref({
  tables: []
})

/** 重置查询操作 */
function resetQuery() {
  $table.query.params.time = []
  $table.search()
}

/** 导入按钮操作 */
function handleImport() {
  importForm.value.tables = []
  importVisible.value = true
  listDbTable().then((res) => {
    dbTableList.value = res.data
  })
}

/** 确认导入按钮 */
function submitImport() {
  importRef.value?.validate((valid) => {
    if (valid) {
      importLoading.value = true
      importTable({ tables: importForm.value.tables.join(',') })
        .then(() => {
          ElMessage.success('导入成功')
          importVisible.value = false
          $table.getTable()
        })
        .finally(() => {
          importLoading.value = false
        })
    }
  })
}

/** 删除按钮操作 */
function handleDelete() {
  const tableIds = $table.selection.map((item) => item.tableId)
  syncConfirm(`是否确认删除表编号为"${tableIds.join(',')}"的数据项?`, () =>
    delTable(tableIds.join(','))
  )
    .then(() => {
      ElMessage.success('删除成功')
      $table.getTable()
    })
    .catch(() => { })
}

/** 预览按钮操作 */
function handlePreview() {
  const tableId = $table.selection[0].tableId
  adminDialog(
    {
      component: import('./preview.vue'),
      props: {
        tableId
      },
      dialogProps: {
        title: '代码预览',
        width: '90%'
      }
    }

  )
}

/** 编辑按钮操作 */
function handleEditTable() {
  const tableId = $table.selection[0].tableId
  adminDialog(
    {
      component: import('./edit.vue'),
      props: {
        tableId
      },
      dialogProps: {
        title: '修改生成配置',
        width: '1750px'
      }
    }
  )
}

/** 生成代码操作 */
function handleGenTable() {
  const tableName = $table.selection[0].tableName
  genCode(tableName).then((response) => {
    ElMessage.success('生成成功')
  })
}
</script>
