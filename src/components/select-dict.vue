<template>
  <el-select v-model="val" collapse-tags collapse-tags-tooltip style="width: 100%">
    <el-option v-for="option in options" :key="option[props.valueKey]" :value="option[props.valueKey]"
      :label="option[props.labelKey]" :disabled="option.disabled"></el-option>
  </el-select>
</template>

<script setup>
import { makeDict } from '@/utils/dict'
import { ref, watch } from 'vue'
const props = defineProps({
  dict: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: [Array, String, Number]
  },
  selected: {
    type: [Array, String, Number]
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
    type: Boolean,
  },
  showAll: {
    type: Boolean
  }
})
const emits = defineEmits(['update:modelValue', 'update:selected', "change"])

const options = ref(makeDict([]))
watch(() => { return props.dict }, () => {
  let arr = props.dict
  if (props.showAll) {
    arr = [{ [props.labelKey]: '全部', [props.valueKey]: '' }].concat(props.dict)
  }
  options.value = makeDict(arr, props.labelKey, props.valueKey)
}, { immediate: true })
if (props.api) {
  options.value = makeDict([])
  props.api(props.query).then((res) => {
    if (res.data.code == 0) {
      options.value = makeDict(res.data.data, props.labelKey, props.valueKey)
      if (props.selectFirst && options.value.length) {
        val.value = options.value[0][props.valueKey]
      }
    }
  })
}
const val = ref(props.modelValue?.toString())
if (props.selectFirst && options.value.length) {
  val.value = options.value[0][props.valueKey]
}

watch(val, () => {
  emits('update:modelValue', val.value)
  emits('update:selected', options.value.get(val.value))
  emits('change', options.value.get(val.value))
})
</script>

<style lang="scss" scoped></style>