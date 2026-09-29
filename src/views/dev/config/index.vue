<template>
  <div class="admin-view config-view">
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.name"
          :label="tab.label"
          :name="tab.name"
        />
      </el-tabs>

      <!-- 需要按引擎/通道再分组的配置 -->
      <el-tabs v-if="currentTab.children" v-model="activeChild" type="card" class="child-tabs">
        <el-tab-pane
          v-for="child in currentTab.children"
          :key="child.name"
          :label="child.label"
          :name="child.name"
        />
      </el-tabs>

      <config-form
        v-if="currentTab.type === 'form'"
        :key="currentCategory"
        :category="currentCategory"
      />
      <other-config v-else-if="currentTab.type === 'other'" />
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ConfigForm from './modules/form.vue'
import OtherConfig from './modules/other-config.vue'

// 配置分类取值必须与后端 DevConfigCategoryEnum 保持一致
const tabs = [
  { name: 'system', label: '系统配置', type: 'form', category: 'sys_config' },
  //{ name: 'account', label: '注册配置', type: 'form', category: 'account_reg' },
 // { name: 'password', label: '密码配置', type: 'form', category: 'password_config' },
  {
    name: 'file',
    label: '文件配置',
    type: 'form',
    children: [
      { name: 'file-local', label: '本地文件', category: 'file_lcoal' },
      { name: 'file-aliyun', label: '阿里云文件', category: 'file_aliyun' },
      { name: 'file-tencent', label: '腾讯云文件', category: 'file_tencentT' },
      { name: 'file-minio', label: 'MinIO文件', category: 'file_minio' }
    ]
  },
  {
    name: 'sms',
    label: '短信配置',
    type: 'form',
    children: [
      { name: 'sms-aliyun', label: '阿里云短信', category: 'sms_aliyun' },
      { name: 'sms-tencent', label: '腾讯云短信', category: 'sms_tencent' }
    ]
  },
  {
    name: 'email',
    label: '邮件配置',
    type: 'form',
    children: [
      { name: 'email-local', label: '本地邮件', category: 'email_local' },
      { name: 'email-aliyun', label: '阿里云邮件', category: 'email_aliyun' },
      { name: 'email-tencent', label: '腾讯云邮件', category: 'email_tencent' }
    ]
  },
  { name: 'other', label: '其他配置', type: 'other' }
]

const activeTab = ref('system')
const activeChild = ref(tabs.find(tab => tab.children)?.children[0].name)

const currentTab = computed(() => tabs.find(tab => tab.name === activeTab.value))

// 切换一级 tab 时重置子 tab，保证 currentCategory 始终有效
watch(activeTab, () => {
  const children = currentTab.value.children
  if (children) {
    activeChild.value = children[0].name
  }
})

// 当前生效的配置分类，分组 tab 取子 tab 的分类
const currentCategory = computed(() => {
  const tab = currentTab.value
  if (!tab.children) return tab.category
  return tab.children.find(child => child.name === activeChild.value)?.category
})
</script>

<style scoped lang="scss">

.child-tabs {
  margin-bottom: 24px;
}
</style>
