<template>
  <div class="admin-search-filter">
    <div class="admin-search-filter-header">
      {{ props.title }}
    </div>
    <el-space wrap class="admin-search-filter-body">
      <el-check-tag size="small" class="admin-search-filter-item" :checked="current == ''"
        @click="choose()">全部</el-check-tag>
      <el-check-tag size="small" class="admin-search-filter-item" :checked="current == item.value" v-for="item in items"
        @click="choose(item)" :key="item.value">{{ item.label }}</el-check-tag>
    </el-space>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const emits = defineEmits(['update:modelValue', 'change'])
const props = defineProps({
  modelValue: [String, Number],
  items: Array,
  title: String,
  loading: Boolean
})
const current = ref('')
watch(
  () => props.modelValue,
  () => {
    current.value = props.modelValue
  }
)
function choose(item) {
  if (!item) {
    current.value = ''
  } else {
    current.value = item.value
  }
  emits('update:modelValue', current.value)
  emits('change', current.value)
}
</script>

<style lang="scss">
.admin-search-filter {
  display: flex;
  align-items: flex-start;
  padding: 8px;
}

.admin-search-filter-header {
  height: 24px;
  line-height: 24px;
  font-weight: bold;
  flex-shrink: 0;
  min-width: 5em;
}

.admin-search-filter-body {
  .el-check-tag:not(.is-checked) {
    font-weight: normal;
  }
}
</style>