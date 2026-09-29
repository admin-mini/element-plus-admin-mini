<template>
  <div ref="chartRef" class="log-chart"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  option: {
    type: Object,
    required: true
  }
})

const chartRef = ref()
let chart = null

function render() {
  if (!chart || !props.option) return
  chart.setOption(props.option, true)
}
function resize() {
  chart?.resize()
}

onMounted(() => {
  chart = echarts.init(chartRef.value)
  render()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
  chart = null
})

watch(() => props.option, render)
</script>

<style scoped lang="scss">
.log-chart {
  width: 100%;
  height: 260px;
}
</style>
