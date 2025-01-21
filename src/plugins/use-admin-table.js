import { reactive, onMounted, nextTick, getCurrentInstance } from 'vue'

import { ElMessage } from 'element-plus'
export default function useAdminTable(options) {
  const vm = getCurrentInstance()
  const rules = reactive({})
  const $table = reactive({
    pageLayout: 'total, sizes, prev, pager, next, jumper',
    emptyText: '暂无数据',
    data: [],
    total: 0,
    loading: false,
    api: undefined,
    query: {
      params: {},
      pageNum: 1,
      pageSize: 10
    },
    handleCurrentChange: handleCurrentChange,
    handleSizeChange: handleSizeChange,
    getTable: getTable,
    search: search,
    rules: rules,
    ref: null, //如果指定会自动执行validate校验表单
    parse: (data) => data.rows, //格式化返回数据
    parseQuery: (query) => query, //格式化请求数据
    onShowData: () => {}, //显示数据前回调
    autoSearch: true, //是否在mounted周期中自动调用search
    selection: []
  })
  $table.handleSelectionChange = function (selection) {
    $table.selection = selection
  }
  Object.assign($table, options)

  onMounted(function (a, b) {
    // console.log(vm)
    if (!$table.autoSearch) {
      return false
    }
    if ($table.api) {
      search()
    }
  }, vm)

  function handleSizeChange(size) {
    $table.query.pageSize = size
    search()
  }
  function handleCurrentChange(p) {
    $table.query.pageNum = p
    getTable()
  }
  function getTable() {
    if ($table.ref) {
      $table.ref.validate((valid) => {
        if (valid) {
          _getTable()
        }
      })
    } else {
      _getTable()
    }
  }
  function _getTable() {
    if (!$table.api) {
      return false
    }
    $table.loading = true
    $table.emptyText = '加载中...'
    let query = $table.parseQuery(JSON.parse(JSON.stringify($table.query)))
    $table
      .api(query)
      .then((res) => {
        if (res.data.code == 200) {
          let rows = res.data.rows
          rows = $table.parse(res.data)
          $table.data = rows
          $table.total = parseInt(res.data.total) || 0
          if ($table.onShowData) {
            nextTick(() => {
              $table.onShowData(rows)
            })
          }
        } else {
          throw new Error('接口错误')
        }
      })
      .catch((err) => {
        console.error(err)
        ElMessage.error(err.message || '接口错误')
      })
      .finally(() => {
        $table.loading = false
        $table.emptyText = '暂无数据'
      })
  }
  function search() {
    $table.query.pageNum = 1
    getTable()
  }

  return $table
}

useAdminTable.install = function (app) {
  void app
}
