import { defineComponent, h, isVNode } from 'vue'
/**
 * @author https://gitee.com/lilimin/vue3-project-starter-template/blob/master/src/components/x-components/x-table-column-filter/index.ts
 */
/** 列数组映射的控制数组 */
export type ColumnsOption =
  | undefined
  | {
      /** 是否启用列筛选 */
      filterable: boolean
      /** 该列是否显示 */
      visible: boolean
      /** 该列的label */
      label: string
      /** 该列初始化时的props配置 */
      props: any
    }[]

/**
 * table列自动显示隐藏控制组件
 */
export default defineComponent({
  props: {
    effect: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      /** 列数组映射的控制数组 */
      columns_option: undefined as ColumnsOption
    }
  },
  created() {
    this.initColumns(this.getElCols())
  },
  methods: {
    /** 自动处理所有列插槽内容 */
    initColumns(columns) {
      this.columns_option = []
      columns.forEach((it) => {
        if (it.type?.name == 'ElTableColumn' && it?.props?.type != 'selection') {
          this.columns_option.push({
            filterable: true,
            visible: true,
            label: it.props?.label,
            props: it.props
          })
        }
      })
    },
    /** 获取列数组映射的控制数组 */
    getColumnsOption() {
      return this.columns_option
    },
    setColumnsOption(val) {
      this.columns_option = val
    },
    //如果插槽内容是el-table-column，则返回el-table-column，否则返回插槽内容
    getElCols() {
      let slots = this.$slots.default()
      if (slots[0].type?.name !== 'ElTableColumn') {
        slots = slots[0].children
      }
      return slots
    }
  },
  expose: ['getColumnsOption', 'initColumns', 'setColumnsOption'],
  render() {
    if (!this.$slots.default) {
      throw new Error('[table-filter] need a default slot')
    }

    return h(() => {
      if (!this.$slots.default) {
        throw new Error('[table-filter] need a default slot')
      }
      let slots = this.$slots.default()

      if (!this.effect) {
        return slots
      }
      let cols = slots
      if (slots[0].type?.name !== 'ElTableColumn') {
        cols = slots[0].children
      }
      // 根据映射的控制数组实现对列的过滤
      let visibleMap = {}
      this.columns_option?.forEach((item) => {
        visibleMap[item.props?.prop] = item.visible
      })
      let result = cols.filter((item) => {
        if (item?.props?.type == 'selection') {
          return true
        }
        if (!visibleMap[item.props?.prop]) {
          return false
        }
        return true
      })
      slots[0].children = result
      return slots
    })
  }
})
