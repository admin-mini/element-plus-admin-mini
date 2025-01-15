<script setup>
import { useRouter } from 'vue-router'
const props = defineProps({ route: Object })
const router = useRouter()
</script>
<template>
  <el-menu-item :index="router.getFullPath(props.route)" v-if="!props.route.children">
    <svg-icon :name="props.route.meta.icon" v-if="props.route.meta.icon"></svg-icon>
    {{ props.route.meta.name }}
  </el-menu-item>
  <el-sub-menu v-else popper-class="admin-sub-menu" :index="router.getFullPath(props.route)" :show-timeout="0"
    :hide-timeout="0" :popper-offset="0">
    <template #title>
      <svg-icon :name="props.route.meta.icon" v-if="props.route.meta.icon"></svg-icon>
      {{ props.route.meta.name }}
    </template>
    <base-navigator-item :route="routeChild" v-for="routeChild in props.route.children"
      :key="routeChild.meta.key"></base-navigator-item>
  </el-sub-menu>
</template>



<style></style>