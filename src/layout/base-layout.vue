<template>
  <div class="admin-container">
    <div class="admin-header">
      <div class="admin-header-left">
        <div class="header-brand">
          <!-- <img src="/static/logo.png" /> -->
          <el-icon size="34px">
            <Notification />
          </el-icon>
        </div>
        <div class="brand-text">{{ $env.VITE_APP_NAME }}</div>
      </div>
      <div class="admin-menu" v-if="menuPositionStorge == 'horizontal'">
        <base-navigator :mode="menuPositionStorge"></base-navigator>
      </div>
      <div class="admin-header-right">
        <el-button @click="toggleDark()" size="small">
          <el-icon>
            <Sunny v-if="isDark" />
            <Moon v-else />
          </el-icon>
        </el-button>
        <el-button @click="togglePosition()" size="small">
          <el-icon>
            <TopRight v-if="menuPositionStorge == 'vertical'" />
            <BottomLeft v-else />
          </el-icon>
        </el-button>
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-avatar :size="26" :src="systemStore.state?.user?.avatar" style="margin-right: 5px" />
            <div>
              {{ systemStore.state?.user?.nickName }}
              <el-icon>
                <arrow-down />
              </el-icon>
            </div>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="changePassword">修改密码</el-dropdown-item>
              <el-dropdown-item @click="logout" divided>退出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="admin-body">
      <div class="admin-slide" v-if="menuPositionStorge == 'vertical'">
        <base-navigator :mode="menuPositionStorge"></base-navigator>
      </div>
      <div class="admin-body-view" v-loading="settingLoading">
        <div class="admin-view-bread">
          <tag-list v-if="systemSetting.setting.useTag"></tag-list>
          <admin-bread v-else></admin-bread>
        </div>

        <router-view v-if="!settingLoading" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { useSystemStore } from '@/stores'
import baseNavigator from './base-navigator.vue'
import { useDark, useToggle, useStorage } from '@vueuse/core'

import { h, ref } from 'vue'
import useAdminDialog from '@/plugins/use-admin-dialog'
import tagList from './tag-list.vue'
import { useSystemSetting } from '@/stores/setting'
const adminDialog = useAdminDialog()
const systemStore = useSystemStore()
const systemSetting = useSystemSetting()
const settingLoading = ref(false)

function logout() {
  systemStore.logout()
}
async function changePassword() {
  adminDialog(h((await import('./change-password.vue')).default, {}), { title: '修改密码', width: 400 })
}

const isDark = useDark()
const toggleDark = useToggle(isDark)
const menuPositionStorge = useStorage('menu-position', 'vertical') //horizontal
function togglePosition() {
  menuPositionStorge.value = menuPositionStorge.value == 'vertical' ? 'horizontal' : 'vertical'
}
</script>
<style></style>
