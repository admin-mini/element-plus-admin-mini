<template>
  <el-select v-model="model" collapse-tags collapse-tags-tooltip style="display: block; width:100%;"
    v-if="props.type == 'select'">
    <el-option v-for="option in options" :key="option[props.valueKey]" :value="option[props.valueKey]"
      :label="option[props.labelKey]" :disabled="option.disabled"></el-option>
  </el-select>
  <el-radio-group v-model="model" v-else-if="props.type == 'radio'">
    <el-radio v-for="option in options" :key="option[props.valueKey]" :value="option[props.valueKey]">
      {{ option[props.labelKey] }}
    </el-radio>
  </el-radio-group>
  <el-checkbox-group v-model="model" v-else-if="props.type == 'checkbox'">
    <el-checkbox v-for="option in options" :key="option[props.valueKey]" :value="option[props.valueKey]">
      {{ option[props.labelKey] }}
    </el-checkbox>
  </el-checkbox-group>

</template>

<script setup>
import { makeDict } from '@/utils/dict'
import { ref, watch } from 'vue'
const model = defineModel({
  type: [Array, String, Number]
})

const props = defineProps({
  type: {
    //select,radio,checkbox
    type: String,
    default: 'select'
  },
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
