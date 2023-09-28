import { reactive, onMounted } from 'vue'

import { ElMessage } from 'element-plus'
export default function userAdminTable(options) {
  options = Object.assign({ autoSearch: true }, options)
  const rules = reactive({})
  const $table = reactive({
    pageLayout: 'total, sizes, prev, pager, next, jumper',
    emptyText: '暂无数据',
    data: [],
    total: 0,
    loading: false,
    api: undefined,
    query: {
      page: 1,
      size: 20
    },
    handleCurrentChange: handleCurrentChange,
    handleSizeChange: handleSizeChange,
    getTable: getTable,
    search: search,
    rules: rules,
    ref: null, //如果指定会自动执行validate校验表单
    parse: (data) => data.data, //格式化返回数据
    parseQuery: (query) => query //格式化请求数据
  })

  onMounted(function () {
    if (!options.autoSearch) {
      return false
    }
    if ($table.api) {
      search()
    }
  })

  function handleSizeChange(size) {
    $table.query.size = size
    search()
  }
  function handleCurrentChange(p) {
    $table.query.page = p
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
        if (res.data.code == 0) {
          let rows = res.data.data
          rows = $table.parse(res.data)
          $table.data = rows
          $table.total = parseInt(res.data.total) || 0
        } else {
          throw new Error('接口错误')
        }
      })
      .catch((err) => {
        console.error(err)
        ElMessage.error(err || '接口错误')
      })
      .finally(() => {
        $table.loading = false
        $table.emptyText = '暂无数据'
      })
  }
  function search() {
    $table.query.page = 1
    getTable()
  }

  return $table
}

userAdminTable.install = function (app) {
  void app
}
