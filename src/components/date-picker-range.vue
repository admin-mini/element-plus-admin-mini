<template>
  <el-date-picker v-bind="$attrs" style="width: 100%" v-model="dateRange"
    :start-placeholder="arrts['start-placeholder'] || '开始日期'" :end-placeholder="arrts['end-placeholder'] || '结束日期'"
    :default-time="defaultTime" :type="arrts['type'] || 'datetimerange'"
    :value-format="arrts['value-format'] || 'YYYY-MM-DD'" :shortcuts="shortcuts"></el-date-picker>
</template>

<script setup>
import { computed, ref, useAttrs, watch, watchEffect } from 'vue'
const emits = defineEmits(['update:begin', 'update:end', 'update:modelValue'])
const arrts = useAttrs()
const props = defineProps({
  modelValue: [Array, String, Number],

  begin: [String, Number],
  end: [String, Number]
})
const shortcuts = [
  {
    text: '最近3天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 3)
      return [start, end]
    },
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]
const defaultTime = computed(() => {
  return arrts.defaultTime || [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]
})
const dateRange = ref([])

watchEffect(() => {
  if (props.begin && props.end) {

    dateRange.value = [props.begin, props.end]
  } else {
    dateRange.value = props.modelValue || []
  }
})
watch(dateRange, function () {
  let newVal = dateRange.value || []
  let begin = newVal[0]
  let end = newVal[1]
  emits('update:begin', begin)
  emits('update:end', end)
  emits('update:modelValue', newVal)
})
</script>

<style></style>