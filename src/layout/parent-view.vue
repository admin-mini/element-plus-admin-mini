<template>
  <router-view></router-view>
  <!-- <router-view v-slot="{ Component, route }" >
      <keep-alive :include="tagView.tagKeys" :exclude="tagView.exclude">
        <component :is="computeComponent(Component, route)" :key="route.fullPath"  v-if="tagView.viewKeyMap[route.fullPath]" />
      </keep-alive>
    </router-view> -->
</template>

<script setup>
import { useTagView } from '@/stores/tag-view'
const tagView = useTagView()

function computeComponent(Component, route) {
  if (!Component) {
    return
  }
  let name = route.fullPath || route.name || route.meta.name || Component.type.name
  Component.name = name
  Component.type.name = name
  return Component
}
</script>

<style lang="scss"></style>