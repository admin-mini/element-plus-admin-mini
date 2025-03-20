<template>
  <div class="admin-container" :class="menuPositionStorge" v-if="systemStore.isLogin">
    <div class="admin-header">
      <div class="admin-header-left">
        <div class="header-brand">
          <el-icon size="28px">
            <GoodsFilled />
          </el-icon>

        </div>
        <div class="brand-text">{{ $env.VITE_APP_NAME }}</div>
      </div>
      <admin-bread v-if="menuPositionStorge == 'vertical'"></admin-bread>
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
              <router-link to="/user/profile">
                <el-dropdown-item>个人中心</el-dropdown-item>
              </router-link>
              <el-dropdown-item @click="logout" divided>退出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="admin-body">

      <el-scrollbar class="admin-slide" v-if="menuPositionStorge == 'vertical'">
        <base-navigator :mode="menuPositionStorge"></base-navigator>
      </el-scrollbar>

      <div class="admin-body-view">
        <tag-list v-if="SETTING.useTag"></tag-list>
        <el-scrollbar view-style="height:100%">
          <admin-router-view></admin-router-view>
          <!-- <router-view v-slot="{ Component, route }" >
            <keep-alive>
              <component :is="Component"  />
            </keep-alive>
          </router-view> -->
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useSystemStore } from '@/stores'
import baseNavigator from './base-navigator.vue'
import { useDark, useToggle, useStorage } from '@vueuse/core'
import adminRouterView from "./admin-router-view.vue"
import useAdminDialog from '@/plugins/use-admin-dialog'
import tagList from './tag-list.vue'
import SETTING from '@/utils/setting'
const adminDialog = useAdminDialog()
const systemStore = useSystemStore()




function logout() {
  systemStore.logout()
}

const isDark = useDark()
const toggleDark = useToggle(isDark)
const menuPositionStorge = useStorage('menu-position', 'vertical') //horizontal
function togglePosition() {
  menuPositionStorge.value = menuPositionStorge.value == 'vertical' ? 'horizontal' : 'vertical'
}
</script>
<style></style>
