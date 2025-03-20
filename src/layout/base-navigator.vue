<script setup>
import baseNavigatorItem from './base-navigator-item.vue'
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
import { usePermissionStore } from "@/stores/permission.js"
const permissionStore = usePermissionStore();

const activeMenu = computed(() => {
  const { meta, fullPath } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu;
  }
  return fullPath;
})


</script>
<template>

  <el-menu router :default-active="activeMenu" mode="horizontal">
    <base-navigator-item :show-timeout="0" :hide-timeout="0" :popper-offset="0"
      v-for="route in permissionStore.sidebarRouters.filter(item => !item.hidden)" :key="route.path"
      :route="route"></base-navigator-item>
  </el-menu>
</template>

<style></style>
