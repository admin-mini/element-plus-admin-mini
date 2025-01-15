<script setup>
import baseNavigatorItem from './base-navigator-item.vue'
import { computed, reactive } from 'vue'
import { routes } from '@/router/index.js'
import { useRoute } from 'vue-router'
import hasPermission from '@/utils/permission'
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
</script>
<template>
  <el-menu router :default-active="route.fullPath" mode="horizontal">
    <base-navigator-item
      :show-timeout="0"
      :hide-timeout="0"
      :popper-offset="0"
      v-for="route in computedRoutes"
      :key="route.path"
      :route="route"
    ></base-navigator-item>
  </el-menu>
</template>

<style></style>
