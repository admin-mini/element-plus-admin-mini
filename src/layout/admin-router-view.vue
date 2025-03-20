<template>
  <router-view v-slot="{ Component, route }" v-if="SETTING.useTag">
    <keep-alive :include="tagView.tagKeys" :exclude="tagView.exclude">
      <Suspense>
        <component :is="computeComponent(Component, route)" :key="getKey()" v-if="tagView.viewKeyMap[route.fullPath]" />
      </Suspense>
    </keep-alive>
  </router-view>
  <router-view :key="route.fullPath" v-else />
</template>

<script setup>
import { useTagView } from '@/stores/tag-view'
import SETTING from '@/utils/setting'
import { useRoute, useRouter } from 'vue-router'

const tagView = useTagView()
const route = useRoute()
const router = useRouter()
function getKey() {
  if (route.matched.length > 2) {
    return router.resolve(route.matched[1]).fullPath
  }
  return route.fullPath
}
function computeComponent(Component, route) {
  if (!Component) {
    return null
  }
  let _component = { ...Component, type: { ...Component.type } }
  let name
  if (route.matched.length > 2) {
    //由于keep-alive嵌套问题，此处使用第二层路由的fullPath当key以及name，否则会造成路由缓存错乱
    name = router.resolve(route.matched[1]).fullPath
  }
  name = name || route.path || route.fullPath || route.name || route.meta.name || Component.type.name

  Component.type.name = name
  return Component
}
</script>

<style lang="scss"></style>
