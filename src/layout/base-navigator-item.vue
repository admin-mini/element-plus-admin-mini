<script setup>
import { useRouter } from 'vue-router'
import { icons } from '@element-plus/icons-vue/global'
const props = defineProps({ route: Object })
const router = useRouter()
</script>
<template>
  <el-menu-item :index="router.getFullPath(props.route)" v-if="!props.route.children">
    <el-icon v-if="props.route.meta.icon && icons[props.route.meta.icon]">
      <component :is="icons[props.route.meta.icon]">
      </component>
    </el-icon>
    <template #title>{{ $t("route." + props.route.meta.name) }}</template>
  </el-menu-item>
  <el-sub-menu v-else popper-class="admin-sub-menu" :index="router.getFullPath(props.route)" :show-timeout="0"
    :hide-timeout="0" :popper-offset="0">
    <template #title>
      <el-icon v-if="props.route.meta.icon && icons[props.route.meta.icon]">
        <component :is="icons[props.route.meta.icon]">
        </component>
      </el-icon>
      <span> {{ $t("route." + props.route.meta.name) }}</span>
    </template>
    <base-navigator-item :route="routeChild" v-for="routeChild in props.route.children"
      :key="routeChild.meta.key"></base-navigator-item>
  </el-sub-menu>
</template>



<style></style>