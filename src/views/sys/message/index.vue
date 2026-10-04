<template>
  <div class="message-center">
    <div class="mc-aside">
      <div
        v-for="cat in categories"
        :key="cat.value"
        class="mc-cat"
        :class="{ active: activeCategory === cat.value }"
        @click="switchCategory(cat)"
      >
        <el-icon class="mc-cat-icon"><component :is="cat.icon" /></el-icon>
        <span class="mc-cat-label">{{ cat.label }}</span>
        <el-badge
          v-if="cat.value === 'inbox' && messageStore.unreadCount > 0"
          :value="messageStore.unreadCount"
          :max="99"
          class="mc-badge"
        />
      </div>
    </div>

    <div class="mc-main">
      <admin-table :api="loadPage" @init="tableInit">
        <template #search>
          <el-form inline @submit.prevent="$table.search()" :model="$table.query">
            <el-form-item label="关键词">
              <el-input
                v-model="$table.query.keywords"
                placeholder="标题/内容"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="状态" v-if="!isSentTab">
              <el-select v-model="$table.query.read" clearable placeholder="全部" style="width: 110px">
                <el-option label="未读" :value="0" />
                <el-option label="已读" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">搜索</el-button>
            </el-form-item>
          </el-form>
        </template>

        <template #btn>
          <el-button v-if="!isSentTab" type="primary" icon="Promotion" @click="openSend">发送消息</el-button>
          <el-button
            v-if="!isSentTab && messageStore.unreadCount > 0"
            type="warning"
            icon="Finished"
            @click="handleAllRead"
          >全部已读</el-button>
        </template>

        <template #filterTable>
          <el-table-column label="标题" min-width="200">
            <template #default="{ row }">
              <span class="mc-title" :class="{ 'is-unread': row.read === 0 }">
                <span v-if="row.read === 0" class="mc-dot"></span>{{ row.title }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="内容" min-width="220" show-overflow-tooltip />
          <el-table-column v-if="isSentTab" prop="receiverNames" label="接收人" min-width="150" show-overflow-tooltip />
          <el-table-column v-else label="发送人" width="120">
            <template #default="{ row }">
              {{ getSenderText(row) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.read ? 'info' : 'danger'" effect="plain">
                {{ row.read ? '已读' : '未读' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template #default="{ row }">
              <el-link type="primary" @click="openDetail(row)">查看</el-link>
            </template>
          </el-table-column>
        </template>
      </admin-table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import useAdminDialog from '@/plugins/use-admin-dialog'
import {
  MESSAGE_CATEGORIES,
  getMessageCategoryConfig,
  getMessagePage,
  getSentMessagePage,
  markAllMessageRead
} from '@/api/sys/message-api'
import { useMessageStore } from '@/stores/message'

const adminDialog = useAdminDialog()
const messageStore = useMessageStore()

const categories = MESSAGE_CATEGORIES
const activeCategory = ref('inbox')
const isSentTab = computed(() => activeCategory.value === 'sent')

let $table = null

// admin-table 初始化：适配消息分页接口的 current/size 参数
function tableInit(table) {
  $table = table
  $table.query.current = 1
  $table.query.size = 10
  $table.parseQuery = (query) => ({
    category: activeCategory.value,
    keywords: query.keywords || '',
    read: query.read,
    current: query.current || 1,
    size: query.size || 10
  })
  $table.parse = (res) => res.data.records
}

// 数据源：收件目录走真实分页接口，“我发送的”走模拟接口
function loadPage(query) {
  return isSentTab.value ? getSentMessagePage(query) : getMessagePage(query)
}

// 发送人：用户消息取 sender.name/nickname，系统消息按分类字典显示
function getSenderText(row) {
  if (row.category === 'msg' && row.sender) {
    return row.sender.name || row.sender.nickname || '用户'
  }
  return getMessageCategoryConfig(row.category).label
}

// 切换分类目录
function switchCategory(cat) {
  if (activeCategory.value === cat.value) return
  activeCategory.value = cat.value
  $table.query.current = 1
  $table.search()
}

// 发送消息
function openSend() {
  adminDialog({
    component: import('./modules/send.vue'),
    props: {
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '发送消息', width: '620px' }
  })
}

// 查看详情（详情接口会将消息置为已读）
function openDetail(row) {
  adminDialog({
    component: import('@/layout/components/message/message-view.vue'),
    props: {
      row,
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '消息详情', width: '600px' }
  })
}

// 全部标记为已读
async function handleAllRead() {
  try {
    await markAllMessageRead()
    ElMessage.success('已全部标记为已读')
    messageStore.refreshUnread()
    $table.getTable()
  } catch (e) {
    // 接口异常由拦截器统一提示
  }
}
</script>

<style lang="scss" scoped>
.message-center {
  display: flex;
  gap: 16px;
  height: calc(100vh - 140px);
  min-height: 480px;

  .mc-aside {
    width: 180px;
    flex-shrink: 0;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    padding: 8px;

    .mc-cat {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--el-text-color-regular);

      &:hover {
        background: var(--el-fill-color-light);
      }

      &.active {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        font-weight: 600;
      }

      .mc-cat-icon {
        margin-right: 8px;
        font-size: 16px;
      }

      .mc-cat-label {
        flex: 1;
        font-size: 14px;
      }

      .mc-badge {
        :deep(.el-badge__content) {
          transform: none;
          position: static;
        }
      }
    }
  }

  .mc-main {
    flex: 1;
    min-width: 0;

    .mc-title {
      display: inline-flex;
      align-items: center;
      font-size: 14px;

      &.is-unread {
        font-weight: 600;
      }

      .mc-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--el-color-danger);
        margin-right: 6px;
        flex-shrink: 0;
      }
    }
  }
}
</style>
