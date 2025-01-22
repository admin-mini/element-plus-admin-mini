<template>
  <router-view v-slot="{ Component, route }" v-if="systemSetting.setting.useTag">
    <keep-alive :include="tagView.tagKeys" :exclude="tagView.exclude">
      <component :is="Component" :key="getKey()"
        v-if="tagView.viewKeyMap[route.fullPath]" />
    </keep-alive>
  </router-view>
  <router-view :key="route.fullPath" v-else />
</template>

<script setup>
import { useTagView } from '@/stores/tag-view'
import { useRoute,useRouter } from 'vue-router'
import { useSystemSetting } from '@/stores/setting'
const systemSetting = useSystemSetting()
const tagView = useTagView()
const route = useRoute()
const router = useRouter()
function getKey(){
  if(route.matched.length>2){
    return  router.resolve(route.matched[1]).fullPath
  }
  return route.fullPath
}
function computeComponent(Component, route) {
  let name
  if(route.matched.length>2){
    //由于keep-alive嵌套问题，此处使用第二层路由的fullPath当key以及name，否则会造成路由缓存错乱
    name = router.resolve(route.matched[1]).fullPath
  }
  name = name|| route.path||route.fullPath || route.name || route.meta.name || Component.type.name

  Component.name = name
  Component.type.name = name
  return Component
}
</script>

<style lang="scss"></style>
