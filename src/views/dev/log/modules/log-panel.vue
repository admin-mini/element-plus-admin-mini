<template>
  <div class="log-panel">
    <el-row :gutter="16">
      <el-col :xs="24" :lg="16">
        <el-card shadow="never">
          <template #header>{{ chartTitle }}</template>
          <log-chart :option="mainOption" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="never">
          <template #header>数量占比</template>
          <log-chart :option="pieOption" />
        </el-card>
      </el-col>
    </el-row>

    <admin-table :api="api.getLogPage" :query="defaultQuery" @init="onTableInit">
      <template #search>
        <el-form :inline="true" :model="$table.query" @submit.prevent="$table.search">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="日志标题">
              <el-input v-model="$table.query.title" clearable />
            </el-form-item>
            <template #last>
              <el-radio-group v-model="$table.query.category" @change="$table.search()">
                <el-radio-button v-for="item in categoryOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </el-radio-button>
              </el-radio-group>
              <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">
                搜索
              </el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>

      <template #btn>
        <el-button type="danger" icon="Delete" @click="handleClear">清空日志</el-button>
      </template>

      <template #table>
        <el-table :data="$table.data" v-loading="$table.loading">
          <el-table-column prop="title" label="日志标题" min-width="180" show-overflow-tooltip />
          <el-table-column prop="category" label="分类" width="100">
            <template #default="{ row }">{{ categoryLabel(row.category) }}</template>
          </el-table-column>
          <el-table-column prop="modular" label="模块" width="90" />
          <el-table-column prop="operationType" label="操作类型" width="100" />
          <el-table-column prop="reqMethod" label="请求方式" width="100" />
          <el-table-column prop="reqUrl" label="请求地址" min-width="220" show-overflow-tooltip />
          <el-table-column prop="operatorUserName" label="操作人" width="120" />
          <el-table-column prop="operatorIp" label="操作IP" width="140" />
          <el-table-column prop="duration" label="耗时(ms)" width="100" />
          <el-table-column prop="exeStatus" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.exeStatus === 'success' ? 'success' : 'danger'">
                {{ row.exeStatus === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="时间" width="180" />
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </admin-table>

    <el-dialog v-model="detailVisible" title="日志详情" width="860px">
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="key in detailKeys" :key="key" :label="detailLabels[key]">
          {{ current[key] ?? '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import * as api from '@/api/dev/log-api'
import LogChart from './log-chart.vue'
import message from '@/utils/message'
import { syncConfirm } from '@/utils/utils'

const props = defineProps({
  // op=操作日志 exception；vis=访问日志 login/logout
  type: {
    type: String,
    default: 'op'
  }
})

const CONFIG = {
  op: {
    chartTitle: '近一周操作日志趋势',
    categoryOptions: [
      { label: '操作日志', value: 'operate' },
      { label: '异常日志', value: 'exception' }
    ]
  },
  vis: {
    chartTitle: '近一周访问日志趋势',
    categoryOptions: [
      { label: '登录日志', value: 'login' },
      { label: '登出日志', value: 'logout' }
    ]
  }
}

const detailKeys = [
  'id',
  'category',
  'title',
  'modular',
  'operationType',
  'reqMethod',
  'reqUrl',
  'reqParams',
  'operatorUserName',
  'operatorIp',
  'operatorAddress',
  'operatorBrowser',
  'operatorOs',
  'className',
  'funName',
  'duration',
  'exeStatus',
  'exeMessage',
  'resultData',
  'createTime'
]
const detailLabels = {
  id: 'ID',
  category: '日志分类',
  title: '日志标题',
  modular: '模块',
  operationType: '操作类型',
  reqMethod: '请求方式',
  reqUrl: '请求地址',
  reqParams: '请求参数',
  operatorUserName: '操作人',
  operatorIp: '操作IP',
  operatorAddress: '操作地址',
  operatorBrowser: '浏览器',
  operatorOs: '操作系统',
  className: '类名',
  funName: '方法名',
  duration: '耗时(ms)',
  exeStatus: '执行状态',
  exeMessage: '执行消息',
  resultData: '结果数据',
  createTime: '创建时间'
}

const config = CONFIG[props.type]
const categoryOptions = config.categoryOptions
const chartTitle = config.chartTitle
const defaultQuery = { category: config.categoryOptions[0].value }

const barData = ref([])
const pieData = ref([])
const detailVisible = ref(false)
const current = reactive({})

let $table
function onTableInit(table) {
  $table = table
}

function categoryLabel(category) {
  return categoryOptions.find(item => item.value === category)?.label || category
}

function refreshChart() {
  if (props.type === 'op') {
    api.getOpBarChartData().then(res => (barData.value = res.data || []))
    api.getOpPieChartData().then(res => (pieData.value = res.data || []))
  } else {
    api.getVisLineChartData().then(res => (barData.value = res.data || []))
    api.getVisPieChartData().then(res => (pieData.value = res.data || []))
  }
}
refreshChart()

const mainOption = computed(() => {
  const list = barData.value
  if (props.type === 'op') {
    // 后端返回平铺结构：{ date, title, count }
    const dates = [...new Set(list.map(item => item.date))]
    const titles = [...new Set(list.map(item => item.title))]
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: titles },
      grid: { left: '10%', right: '5%', bottom: '15%', top: '18%' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value', minInterval: 1 },
      series: titles.map(title => ({
        name: title,
        type: 'bar',
        data: dates.map(
          date => list.find(item => item.date === date && item.title === title)?.count ?? 0
        )
      }))
    }
  }
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['登录数量', '登出数量'] },
    grid: { left: '10%', right: '5%', bottom: '15%', top: '18%' },
    xAxis: { type: 'category', data: list.map(item => item.date) },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      { name: '登录数量', type: 'line', smooth: true, data: list.map(item => item.loginCount) },
      { name: '登出数量', type: 'line', smooth: true, data: list.map(item => item.logoutCount) }
    ]
  }
})

const pieOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [
    {
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '45%'],
      data: pieData.value.map(item => ({ name: item.type, value: item.value }))
    }
  ]
}))

async function handleDetail(row) {
  const response = await api.getLogDetail(row.id)
  Object.assign(current, response.data || row)
  detailVisible.value = true
}

function handleClear() {
  syncConfirm(`是否确认清空"${categoryLabel($table.query.category)}"吗?`, () =>
    api.clearLog($table.query.category)
  )
    .then(() => {
      message.success('清空成功')
      $table.getTable()
      refreshChart()
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.log-panel {
  margin-top: 12px;
}
</style>
