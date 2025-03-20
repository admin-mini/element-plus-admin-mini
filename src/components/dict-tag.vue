<template>
  <span v-for="(item, index) in values" :key="index">
    <span v-if="item.listClass == 'default' || item.listClass == ''" :class="item.cssClass">
      {{ item.label }}
    </span>
    <el-tag v-else :disable-transitions="true" :type="item.listClass" :class="item.cssClass">
      {{ item.label }}
    </el-tag>
  </span>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  // 数据
  options: {
    type: Array,
    default: []
  },
  // 当前的值
  value: [Number, String, Array]
})
const values = computed(() => {
  if (Array.isArray(props.value)) {
    return props.value.map((item) => {
      return props.options.get(item)
    })
  }
  let obj = props.options.get(props.value)
  if (obj != null) {
    return [obj]
  }
  return []
})
</script>

<style></style>
