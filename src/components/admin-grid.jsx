import { ElAutoResizer, ElLink, ElIcon } from 'element-plus'
import { computed, ref, defineComponent } from 'vue'

const DEFAULT_SCREEN_WIDTH = 1919 //默认按照1920分辨率计算 360浏览器某些行为会导致宽度为1919
export default defineComponent({
  props: {
    showAll: {
      //是否禁用
      type: Boolean,
      default: false
    },
    resp: {
      //是否响应式
      type: Boolean,
      default: true
    },

    cols: {
      //默认列数量
      type: Number,
      default: 4
    },
    xGap: {
      //列间距
      type: Number,
      default: 0
    },
    yGap: {
      //行间距
      type: Number,
      default: 0
    }
  },
  setup(props, { slots }) {
    const showAll = ref(props.showAll)
    const cols = ref(props.cols)
    function handleResize() {
      if (props.resp) {
        let resultCols = props.cols
        let defaultCols = DEFAULT_SCREEN_WIDTH / props.cols
        let currentCos = document.body.clientWidth / props.cols
        let sign = currentCos > defaultCols ? 1 : -1
        resultCols += Math.floor((Math.abs(currentCos - defaultCols) * sign * props.cols) / defaultCols)
        cols.value = resultCols
      }
    }

    const style = computed(() => {
      return {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: `repeat(${cols.value}, minmax(0, 1fr))`,
        columnGap: props.xGap + 'px',
        rowGap: props.yGap + 'px'
      }
    })
    const lastStyle = computed(() => {
      const defualtSlots = slots.default().filter((slot) => {
        if (slot.children === 'v-if') {
          return false
        }
        return true
      })
      let i = defualtSlots.length % cols.value == 0 ? 1 : 0
      return {
        gridColumn: `${showAll.value ? cols.value : cols.value + 1} / span 1`,
        paddingLeft: '18px'
      }
    })

    return () => {
      const showAllNode = showAll.value ? (
        <ElLink
          onClick={() => {
            showAll.value = false
          }}
          style="margin-left:10px;"
        >
          <ElIcon>
            <ArrowUp />
          </ElIcon>
          收起
        </ElLink>
      ) : (
        <ElLink onClick={() => (showAll.value = true)} style="margin-left:10px;">
          <ElIcon>
            <ArrowDown />
          </ElIcon>
          展开
        </ElLink>
      )
      const defualtSlots = slots.default().filter((slot) => {
        if (slot.children === 'v-if') {
          return false
        }
        return true
      })
      return (
        <ElAutoResizer onResize={handleResize}>
          <div style={style.value}>
            {showAll.value ? defualtSlots : defualtSlots.slice(0, cols.value)}
            <div class="admin-grid-last" style={lastStyle.value}>
              {slots.last && slots.last()}
              {cols.value >= defualtSlots.length ? '' : showAllNode}
            </div>
          </div>
        </ElAutoResizer>
      )
    }
  }
})
