<template>
  <div class="admin-view">
    <admin-table :api="listType" @init="(table) => {
      $table = table
    }
      ">
      <template #search>
        <el-form ref="queryForm" @submit.prevent="$table.search" :inline="true" :model="$table.query">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="字典名称">
              <el-input v-model="$table.query.dictName" clearable></el-input>
            </el-form-item>
            <el-form-item label="字典类型">
              <el-input v-model="$table.query.dictType" clearable></el-input>
            </el-form-item>
            <el-form-item label="状态">
              <select-dict :dict="$dict.sys_normal_disable" v-model="$table.query.status" show-all></select-dict>
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">
                搜索
              </el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>

      <template #btn>
        <el-button type="primary" icon="Plus" @click="handleAdd" v-if="$p(['system:dict:add'])">
          新增
        </el-button>
        <el-button type="primary" plain icon="Edit" :disabled="$table.selection.length != 1" @click="handleEdit()"
          v-if="$p(['system:dict:edit'])">
          修改
        </el-button>
        <el-button type="primary" plain icon="Delete" :disabled="$table.selection.length == 0" @click="handleDel()"
          v-if="$p(['system:dict:remove'])">
          删除
        </el-button>
        <el-button type="warning" plain icon="Download" @click="handleExport" v-if="$p(['system:dict:export'])">
          导出
        </el-button>
        <el-button type="danger" plain icon="Refresh" @click="handleRefreshCache" v-if="$p(['system:dict:remove'])">
          刷新缓存
        </el-button>
      </template>

      <template #table>
        <el-table :data="$table.data" v-loading="$table.loading" @selection-change="$table.handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="字典编号" align="center" prop="dictId" />
          <el-table-column label="字典名称" align="center" prop="dictName" />
          <el-table-column label="字典类型" align="center" prop="dictType" />
          <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
              <dict-tag :options="$dict.sys_normal_disable" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
          <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
          <el-table-column label="操作" align="center" width="260">
            <template #default="scope">
              <el-space spacer="|">
                <el-link type="primary" @click="handleEdit(scope.row)" v-if="$p(['system:dict:edit'])">
                  修改
                </el-link>
                <el-link type="primary" @click="handleDel(scope.row)" v-if="$p(['system:dict:remove'])">
                  删除
                </el-link>
                <el-link type="primary" @click="handleData(scope.row)" v-if="$p(['system:dict:list'])">
                  字典数据
                </el-link>
                <el-link type="primary" @click="copyDict(scope.row)">复制字典值</el-link>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </admin-table>
  </div>
</template>

<script setup>
import { listType, delType, refreshCache } from '@/api/system/dict/type'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { h } from 'vue'
import { ElMessage } from 'element-plus'
import { getDict } from '@/utils/dict'
import { syncConfirm } from '@/utils/utils'
import { download } from '@/api/request'
import { useRouter } from 'vue-router'
import { useClipboard } from '@vueuse/core'
const router = useRouter()
const { copy, copied } = useClipboard({
  legacy: true
})
getDict(['sys_normal_disable'])
const adminDialog = useAdminDialog()
let $table

async function copyDict(row) {
  const dict = await getDict([row.dictType])
  let _d = dict.value[row.dictType]
  let result = _d.map((item) => {
    let _dd = {
      value: item.value,
      label: item.label
    }
    if (item.listClass) {
      _dd.listClass = item.listClass
    }
    if (item.cssClass) {
      _dd.cssClass = item.cssClass
    }
    if (item.default) {
      _dd.default = item.default
    }
    return JSON.stringify(_dd)
  })

  copy(`${row.dictType}:[
        ${result.join(',\n')}
]`).then(() => {
    ElMessage.success('复制成功')
  })
}
function handleAdd() {
  adminDialog({
    component: import('./post.vue'),
    props: {
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '新增字典类型', width: '500px' }
  })
}

function handleEdit(row) {
  row = row || $table.selection[0]
  adminDialog({
    component: import('./post.vue'),
    props: {
      row: row,
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '修改字典类型', width: '500px' }
  })
}

function handleDel(row) {
  let ids = row ? [row.dictId] : $table.selection.map((item) => item.dictId)
  syncConfirm(`是否确认删除字典编号为"${ids.join(',')}"的数据项?`, () => delType(ids.join(',')))
    .then(() => {
      ElMessage.success('删除成功')
      $table.getTable()
    })
    .catch(() => { })
}

function handleExport() {
  download(
    'system/dict/type/export',
    {
      ...$table.query
    },
    `dict_${new Date().getTime()}.xlsx`
  )
}

function handleRefreshCache() {
  refreshCache().then(() => {
    ElMessage.success('刷新成功')
  })
}

async function handleData(row) {
  router.push({
    path: '/system/dict-data/index/' + row.dictId,
    query: {
      dictType: row.dictType
    }
  })
}
</script>
