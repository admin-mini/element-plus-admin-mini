<script setup>
import { useRouter } from 'vue-router'
import {computed} from "vue"
const props = defineProps({ route: Object })
const router = useRouter()
const currentRoute = computed(()=>{
  if(!props.route.children || props.route.children.length===0){
    return props.route
  }
 if(props.route.children.length ==1){
 
    return props.route.children[0]
 }
 return props.route
})

</script>
<template>
  <el-menu-item :index="router.getFullPath(currentRoute)" v-if="!currentRoute.children">
    <svg-icon :name="currentRoute.meta.icon" v-if="currentRoute.meta.icon"></svg-icon>
    {{ currentRoute.meta.name }}
  </el-menu-item>
  <el-sub-menu v-else popper-class="admin-sub-menu" :index="router.getFullPath(currentRoute)" :show-timeout="0"
    :hide-timeout="0" :popper-offset="0">
    <template #title>
      <svg-icon :name="currentRoute.meta.icon" v-if="currentRoute.meta.icon"></svg-icon>
      {{ currentRoute.meta.name }}
    </template>
    <base-navigator-item :route="routeChild" v-for="routeChild in currentRoute.children"
      :key="routeChild.meta.key"></base-navigator-item>
  </el-sub-menu>
</template>



<style></style>