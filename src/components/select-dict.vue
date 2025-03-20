<template>
  <el-select v-model="model" collapse-tags collapse-tags-tooltip style="display: block; width:100%;">
    <template #label="current">
      <slot name="label" :option="options.get(current.value)"></slot>
    </template>
    <el-option v-for="option in options" :key="option[props.valueKey]" :value="option[props.valueKey]"
      :label="option[props.labelKey]" :disabled="option.disabled">
      <slot name="label" :option="option"></slot>
    </el-option>
  </el-select>
</template>

<script setup>
import { makeDict } from '@/utils/dict'
import { ref, watch } from 'vue'
const model = defineModel({
  type: [Array, String, Number]
})

const props = defineProps({
  dict: {
    type: Array,
    default: () => []
  },
  selected: {
    type: [Array, String, Number, Object]
  },
  api: {
    type: Function
  },
  query: {
    type: Object
  },
  labelKey: {
    type: String,
    default: () => {
      return 'label'
    }
  },
  valueKey: {
    type: String,
    default: () => {
      return 'value'
    }
  },
  selectFirst: {
    type: Boolean
  },
  showAll: {
    type: Boolean
  }
})
const emits = defineEmits(['update:selected', 'change'])

const options = ref(makeDict([]))
watch(
  () => {
    return props.dict
  },
  () => {
    let arr = props.dict
    if (props.showAll) {
      arr = [{ [props.labelKey]: '全部', [props.valueKey]: '' }].concat(props.dict)
    }
    options.value = makeDict(arr, props.labelKey, props.valueKey)
  },
  { immediate: true }
)
if (props.api) {
  options.value = makeDict([])
  props.api(props.query).then((res) => {
    var arr = [];
    if (props.showAll) {
      arr.push({ [props.labelKey]: '全部', [props.valueKey]: '' })
    }
    options.value = makeDict(
      arr.concat(res.data || res.rows),
      props.labelKey,
      props.valueKey
    )
    if (props.selectFirst && options.value.length) {
      model.value = options.value[0][props.valueKey]
    }

  })
}

if (props.selectFirst && options.value.length) {
  model.value = options.value[0][props.valueKey]
}

watch(model, () => {
  emits('update:selected', options.value.get(model.value))
  emits('change', options.value.get(model.value))
})
</script>

<style lang="scss" scoped></style>
