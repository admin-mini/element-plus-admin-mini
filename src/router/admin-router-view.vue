<template>
  <router-view v-slot="{ Component, route }" v-if="systemSetting.setting.useTag">
    <keep-alive :include="tagView.tagList.map((item) => item.fullPath)" :exclude="tagView.exclude">
      <component :is="computeComponent(Component, route)" :key="route.fullPath"
        v-if="tagView.viewKeyMap[route.fullPath]" />
    </keep-alive>
  </router-view>
  <router-view :key="route.fullPath" v-else />
</template>

<script setup>
import { useTagView } from '@/stores/tag-view'
import { useRoute } from 'vue-router'
import { useSystemSetting } from '@/stores/setting'
const systemSetting = useSystemSetting()
const tagView = useTagView()
const route = useRoute()
function computeComponent(Component, route) {
  let name = route.fullPath || route.name || route.meta.name || Component.type.name
  Component.name = name
  Component.type.name = name
  return Component
}
</script>

<style lang="scss"></style>
