<template>
  <div class="user-selector-wrapper" v-loading="loadingValueUsers">
    <slot name="trigger" :users="selectedUsers" :open="openSelector">
    <div 
      class="selector-trigger el-input__wrapper" 
      :class="{ 'is-focus': visible }"
      @click="openSelector"
    >
      <div class="el-input__inner">
        <template v-if="selectedUsers.length > 0">
          <div class="tag-container">
            <el-tag
              v-for="user in selectedUsers"
              :key="user.id"
              closable
              size="small"
              @close.stop="handleRemove(user)"
            >
              {{ user.name }}
            </el-tag>
          </div>
        </template>
        <span v-else class="placeholder">请选择人员</span>
      </div>
      <span class="el-input__suffix">
        <el-icon class="el-input__icon"><User /></el-icon>
      </span>

    </div>
    </slot>
    <el-dialog
      v-model="visible"
      :title="multiple ? '人员选择 (多选)' : '人员选择 (单选)'"
      :width="isMobile ? '98%' : '950px'"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="selector-container" :class="{ 'is-mobile': isMobile }">
        <div v-if="!isMobile" class="aside-tree">
          <el-scrollbar>
            <el-tree
              :data="orgTree"
              :props="{ label: 'orgName', children: 'children' }"
              highlight-current
              @node-click="handleOrgClick"
            />
          </el-scrollbar>
        </div>
        <div v-else class="mobile-org-box">
          <el-tree-select
            v-model="queryParams.orgId"
            :data="orgTree"
             :props="{ label: 'orgName', children: 'children' }"
            placeholder="选择部门"
            check-strictly
            @change="handleSearch"
          />
        </div>

        <div class="main-content">
          <div class="search-header">
            <el-input v-model="queryParams.name" placeholder="姓名/手机号" @keyup.enter="handleSearch">
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
          </div>

          <el-table
            ref="tableRef"
            v-loading="loading"
            :data="userList"
            row-key="id"
            height="380px"
            @select="handleRowSelect"
            @select-all="handleSelectAll"
          >
            <el-table-column v-if="multiple" type="selection" width="45" />
            <el-table-column label="人员" min-width="120">
              <template #default="{ row }">
                <div class="u-cell">
                  <el-avatar :size="24">{{ row.name[0] }}</el-avatar>
                  <span class="u-name">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="orgName" label="部门" show-overflow-tooltip />
            <el-table-column v-if="!multiple" label="操作" width="80" align="center">
              <template #default="{ row }">
                <el-button link type="primary" @click="selectSingle(row)">选择</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pager-box">
            <el-pagination
              v-model:current-page="queryParams.page"
              :total="total"
              :page-size="queryParams.pageSize"
              layout="prev, pager, next"
              small
              @current-change="handleSearch"
            />
          </div>
        </div>

        <div v-if="multiple && tempSelected.length > 0" class="fab-container">
          <el-popover placement="top-end" :width="280" trigger="click">
            <template #reference>
              <el-badge :value="tempSelected.length" type="danger">
                <el-button type="primary" :icon="CollectionTag" circle size="large" class="fab-btn" />
              </el-badge>
            </template>
            <div class="selected-pop-view">
              <div class="pop-title">
                <span>已选列表</span>
                <el-button link type="danger" size="small" @click="clearAllTemp">清空全部</el-button>
              </div>
              <el-scrollbar max-height="300px">
                <div v-for="u in tempSelected" :key="u.id" class="pop-user-item">
                  <span>{{ u.name }} - <small>{{ u.orgName }}</small></span>
                  <el-icon @click="doRemoveTemp(u)"><Close /></el-icon>
                </div>
              </el-scrollbar>
            </div>
          </el-popover>
        </div>
      </div>

      <template #footer>
        <div class="admin-dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定选择 ({{ tempSelected.length }})</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { User, Search, CollectionTag, Close } from '@element-plus/icons-vue'
import { useWindowSize } from '@vueuse/core'

const props = defineProps({
  modelValue: [String, Number, Array],
  multiple: { type: Boolean, default: false },
  // 外部注入的接口策略
  api: {
    type: Object,
    default: () => ({})
  }
})
const emits = defineEmits(['update:modelValue', 'change'])

// --- 响应式配置 ---
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)
const visible = ref(false)
const loading = ref(false)
const loadingValueUsers=ref(false);
const tableRef = ref(null)

// --- 数据状态 ---
const orgTree = ref([])
const userList = ref([])
const total = ref(0)
const queryParams = reactive({ page: 1, pageSize: 10, name: '', orgId: '' })

const selectedUsers = ref([]) // 确认值
const tempSelected = ref([])   // 弹窗缓存值。临时值，不点确定不回传

//模拟数据
const mockUserData = [
      { id: 1, name: '张三',nickName:'', orgName: '前端团队', phone: '131...',avatar:'' },
      { id: 2, name: '李四',nickName:'', orgName: '后端团队', phone: '132...' ,avatar:''},
      { id: 3, name: '王五',nickName:'', orgName: '前端团队', phone: '133...',avatar:'' },
      { id: 4, name: '赵六',nickName:'', orgName: '工业IoT部', phone: '134...',avatar:'' }
    ]

// --- 默认接口方法，可以将自己的接口方法写到这里
// 同时支持从props中传入自定义方法，同名即可比如api.getOrgTree，api.getUserList等--
//使用组件式只需要修改defaultApi即可，其他如id，name等属性没改变可不用动
const defaultApi = {
  getOrgTree: async () => [
    { id: 'd1', orgName: '糯草开发组', children: [{ id: 'd11', orgName: '前端团队' }, { id: 'd12', orgName: '后端团队' }] },
    { id: 'd2', orgName: '工业IoT部' }
  ],
  getUserList: async (params) => {
    console.log('正在执行查询...', params)
    
    return { list: mockUserData.slice((params.page - 1) * 2, params.page * 2), total: 50 }
  },
  getUserListByIds:async(userIds)=>{
     
      if (!userIds || (Array.isArray(userIds) && userIds.length === 0)) return [];
      const ids = Array.isArray(userIds) ? userIds : [userIds]
      loadingValueUsers.value=true;

      //模拟异步请求情况
      setTimeout(()=>{
        loadingValueUsers.value=false;
      },1000)
      return mockUserData.filter(item=>ids.includes(item.id));
  }
}


//分页勾选回显同步
const syncTableCheckbox = () => {
  if (!tableRef.value || !props.multiple) return
  nextTick(() => {
    const tableData = userList.value
    tableData.forEach(row => {
      const isSelected = tempSelected.value.some(u => u.id === row.id)
      tableRef.value.toggleRowSelection(row, isSelected)
    })
  })
}
//检索方法
const handleSearch = async () => {
  loading.value = true
  const fetchFn = props.api.getUserList || defaultApi.getUserList
  try {
    const res = await fetchFn(queryParams)
    userList.value = res.list
    total.value = res.total
    syncTableCheckbox()
  } finally {
    loading.value = false
  }
}
//打开选择框
const openSelector = async () => {
  visible.value = true
  tempSelected.value = [...selectedUsers.value]
  const fetchOrg = props.api.getOrgTree || defaultApi.getOrgTree
  orgTree.value = await fetchOrg()
  handleSearch()
}

// 处理勾选（多选模式）
const handleRowSelect = (selection, row) => {
  const isChecked = selection.some(item => item.id === row.id)
  if (isChecked) {
    if (!tempSelected.value.some(u => u.id === row.id)) tempSelected.value.push(row)
  } else {
    tempSelected.value = tempSelected.value.filter(u => u.id !== row.id)
  }
}

// 处理全选
const handleSelectAll = (selection) => {
  const isAllChecked = selection.length > 0
  userList.value.forEach(row => {
    const index = tempSelected.value.findIndex(u => u.id === row.id)
    if (isAllChecked && index === -1) tempSelected.value.push(row)
    else if (!isAllChecked && index !== -1) tempSelected.value.splice(index, 1)
  })
}

// 侧边栏/移动端部门点击
const handleOrgClick = (node) => {
  queryParams.orgId = node.id
  queryParams.page = 1
  handleSearch()
}

// 选择确认
const handleConfirm = () => {
  selectedUsers.value = [...tempSelected.value]
  emitData()
  visible.value = false
}

const selectSingle = (row) => {
  selectedUsers.value = [row]
  emitData()
  visible.value = false
}

const emitData = () => {
  const ids = selectedUsers.value.map(u => u.id)
  const val = props.multiple ? ids : (ids[0] || '')
  emits('update:modelValue', val)
  emits('change', selectedUsers.value)
}

// 删除指定用户（按user.id)删除，显示中点击×删除
const handleRemove = (user) => {
  selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id)
  emitData()
}
//在select框中移除
const doRemoveTemp = (user) => {
  tempSelected.value = tempSelected.value.filter(u => u.id !== user.id)
  syncTableCheckbox()
}

const clearAllTemp = () => {
  tempSelected.value = []
  tableRef.value?.clearSelection()
}

// 监听值变化
watch(
  () => props.modelValue,
  async (newVal) => {
    console.log("值变化")
    // 逻辑判断：如果新值与当前已选的 ID 集合一致，则不触发重载（防止 emit 后导致的二次触发）
    const currentIds = selectedUsers.value.map(u => u.id)
    const newIds = Array.isArray(newVal) ? newVal : (newVal ? [newVal] : [])
    
    // 简单的数组内容比较
    const isSame = currentIds.length === newIds.length && currentIds.every(id => newIds.includes(id))
    if (isSame) return

    // 调用接口加载数据
    const fetchByIds = props.api.getUserListByIds || defaultApi.getUserListByIds
    if (newIds.length > 0) {
      const users = await fetchByIds(newVal)
      selectedUsers.value = users
    } else {
      selectedUsers.value = []
    }
  },
  { immediate: true } // immediate: true 确保组件加载时就能根据初始 modelValue 显示名称
)


</script>

<style lang="scss" scoped>
/* 1. 模拟 Input 样式 */
.selector-trigger {
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  width: 100%;
  align-items: center;
  min-height: 32px;
  padding: 2px 12px;
  background-color: var(--el-bg-color);
  border-radius: var(--el-border-radius-base);
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  transition: all 0.2s;

  &:hover { box-shadow: 0 0 0 1px var(--el-border-color-hover) inset; }
  &.is-focus { box-shadow: 0 0 0 1px var(--el-color-primary) inset !important; }

  .el-input__inner {
    flex: 1; display: flex; flex-wrap: wrap; gap: 4px;
    .tag-container { display: flex; flex-wrap: wrap; gap: 4px; padding: 2px 0; }
    .placeholder { color: var(--el-text-color-placeholder); font-size: 13px; }
  }
}

/* 2. 容器布局 */
.selector-container {
  display: flex; height: 500px; gap: 15px; position: relative;
  &.is-mobile { flex-direction: column; height: 70vh; }
  
  .aside-tree { width: 180px; border-right: 1px solid var(--el-border-color-lighter); }
  .mobile-org-box { padding-bottom: 10px; border-bottom: 1px solid var(--el-border-color-lighter); }
  
  .main-content {
    flex: 1; display: flex; flex-direction: column; min-width: 0;
    .search-header { margin-bottom: 10px; }
    .pager-box { margin-top: auto; padding: 12px 0; display: flex; justify-content: center; }
  }
}

/* 3. 悬浮按钮 FAB */
.fab-container {
  position: absolute; right: 10px; bottom: 70px; z-index: 10;
  .fab-btn { box-shadow: var(--el-box-shadow-dark); }
}

.selected-pop-view {
  .pop-title {
    display: flex; justify-content: space-between; align-items: center;
    font-weight: bold; font-size: 13px; margin-bottom: 10px; padding-bottom: 5px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  .pop-user-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 4px; font-size: 12px;
    &:hover { background: var(--el-fill-color-light); }
    .el-icon { cursor: pointer; &:hover { color: var(--el-color-danger); } }
  }
}

.u-cell { display: flex; align-items: center; gap: 8px; .u-name { font-size: 13px; } }
</style>