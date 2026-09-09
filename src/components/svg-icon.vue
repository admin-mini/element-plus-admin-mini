<template>
  <el-icon v-if="iconComponent">
    <component :is="iconComponent" />
  </el-icon>

  <span v-else class="el-icon">
    <svg aria-hidden="true" :style="{ color }">
      <use :href="symbolId" />
    </svg>
  </span>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'

const props = defineProps({
  prefix: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#333',
  },
})

const instance = getCurrentInstance()

const iconComponent = computed(() => {
  const name = props.name

  if (!name || name === '#') {
    return null
  }

  const components = instance?.appContext.components || {}

  // 只从已注册组件中查找，不使用 resolveComponent
  return components[name] || null
})

const symbolId = computed(() => {
  return `${props.prefix ? `#${props.prefix}-` : '#icon-'}${props.name}`
})
</script>