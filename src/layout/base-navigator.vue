<script setup>
import baseNavigatorItem from './base-navigator-item.vue'
import { computed, reactive } from 'vue'
import { routes } from '@/router/index.js'
import { useRoute } from 'vue-router'
import hasPermission from '@/utils/permission'
import { useSystemStore } from '@/stores'

const systemStore = useSystemStore()
const route = useRoute()
const rootRoutes = reactive(routes[0])
const computedRoutes = computed(() => {
  return computedRole(rootRoutes.children)
  function computedRole(arr) {
    return arr.filter((item) => {
      if ((item.meta.p && !hasPermission(item.meta.p)) || item.meta.hide) {
        return false
      }
      if (item.children) {
        item.children = computedRole(item.children)
      }
      return true
    })
  }
})
const activeMenu = computed(() => {
  const { meta, fullPath } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu;
  }
  return fullPath;
})
function selectMenu() {
  systemStore.setMenuCollapse(false)
}

</script>
<template>
  <el-menu router :default-active="activeMenu" mode="horizontal" :collapse="systemStore.menuCollapse"
    :collapse-transition="false" @select="selectMenu">
    <base-navigator-item :show-timeout="0" :hide-timeout="0" :popper-offset="0" v-for="route in computedRoutes"
      :key="route.path" :route="route"></base-navigator-item>
  </el-menu>
</template>

<style></style>
