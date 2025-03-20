<script setup>
import { useRouter } from 'vue-router'
import { computed } from "vue"
import { isExternal, isHttp } from '@/utils/validate'
const props = defineProps({ route: Object })
const router = useRouter()
const currentRoute = computed(() => {
  if (!props.route.children || props.route.children.length === 0) {
    return props.route
  }
  if (props.route.children.length == 1) {

    return props.route.children[0]
  }
  return props.route
})
function resolvePath(route) {
  if (isExternal(route.path)) {
    return ''
  }
  try {
    return router.resolve(route).fullPath
  } catch (e) {
    return route.path
  }
}
function openRoute(_route) {
  if (isExternal(_route.path)) {
    window.open(_route.path, '_blank')
  }
}
</script>
<template>
  <el-menu-item :index="resolvePath(currentRoute)" v-if="!currentRoute.children" @click="openRoute(currentRoute)">
    <svg-icon :name="currentRoute.meta.icon" v-if="currentRoute.meta?.icon && currentRoute.meta.icon != '#'"></svg-icon>
    {{ currentRoute.meta?.title }}
  </el-menu-item>
  <el-sub-menu v-else popper-class="admin-sub-menu" :index="resolvePath(currentRoute)" :show-timeout="0"
    :hide-timeout="0" :popper-offset="0">
    <template #title>
      <svg-icon :name="currentRoute.meta.icon"
        v-if="currentRoute.meta?.icon && currentRoute.meta.icon != '#'"></svg-icon>
      {{ currentRoute.meta?.title }}
    </template>
    <base-navigator-item :route="routeChild" v-for="routeChild in currentRoute.children"
      :key="routeChild.meta?.key"></base-navigator-item>
  </el-sub-menu>
</template>



<style></style>