<template>
  <div class="dict-labels">
    <template v-for="(item, index) in displayValues" :key="index">
      <span 
        class="label-item" 
        :class="{'tag':props.tag}"
        :style="getStyle(item)" 
      >
        {{ item.label }}
      </span>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { getDict } from '@/utils/dict' 

const props = defineProps({
  // 方式1：直接传入 options 数据
  options: {
    type: Array,
    default: null
  },
  tag:{
    type:Boolean,
    default:false
  },
  // 方式2：传入字典类型，组件内部自动获取
  type: {
    type: String,
    default: ''
  },
  // 当前的值
  value: [Number, String, Array]
})

// 内部维护的字典数据
const internalOptions = ref([])

/**
 * 动态计算单个标签样式
 * 如果 tag 开启，则计算背景色和边框
 */
const getStyle = (item) => {
  if (!item || !item.color) return {}
  const baseStyle = { color: item.color }

  if (props.tag) {
    return {
      ...baseStyle,
      // 边框：与文字颜色一致
      border: `1px solid ${item.color}55`,
      /**
       * 背景色逻辑：
       * 使用 color-mix 将文字颜色与透明色混合
       * transparent 90% 表示背景是不透明度为 10% 的文字颜色
       */
      backgroundColor: `${item.color}22`
    }
  }

  return baseStyle
}
/**
 * 统一处理数据源
 * 优先使用 props.options，其次使用内部加载的 internalOptions
 */
const currentOptions = computed(() => {
  return props.options || internalOptions.value || []
})

/**
 * 核心逻辑：匹配对应的字典对象
 */
const displayValues = computed(() => {
  const val = props.value
  if (val === undefined || val === null || val === '') return []
  
  const valArray = Array.isArray(val) ? val : [val]
  console.log("currentOptions",currentOptions)
  return valArray.map(v => {
    // 在 currentOptions 中查找对应的值
    // 兼容字符串和数字的对比
    return currentOptions.value.find(opt => String(opt.value) === String(v))
  }).filter(Boolean) // 过滤掉没找到的
})

/**
 * 加载字典数据
 */
async function loadDictData() {
  if (props.type && !props.options) {
    try {
    
      const res = await getDict([props.type])
      internalOptions.value = res[props.type] || []
      console.log("load",internalOptions.value);

    } catch (error) {
      console.error(`[DictTag] 加载字典 ${props.dictType} 失败:`, error)
    }
  }
}

// 初始化加载
onMounted(() => {
  loadDictData()
})

// 监听 dictType 变化（应对动态变更类型的情况）
watch(() => props.dictType, () => {
  loadDictData()
})
</script>

<style scoped lang="scss">
.dict-labels {
  display: inline-flex;
  gap: 8px;
}
.label-item {
  font-size: 14px;
    &::after {
        content: " |";
        font-size: 12px;
        margin-left: 4px;
        margin-right: 4px;
        color: var(--el-border-color);
        font-weight: normal;
    }
    
    &:last-child {
        &::after {
            content: "";
            margin: 0; 
        }
    }

}
.label-item.tag {
  padding: 0px 8px;
  border-radius: 4px;
  line-height: 1.4;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
   &::after {
        content: "";
        margin: 0; 
    }
}
</style>