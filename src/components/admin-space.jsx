import { computed, ref, defineComponent } from 'vue'
export default defineComponent({
  props: {
    cols: {
      //默认列数量
      type: Number,
      default: 2
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
    const style = computed(() => {
      return {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: `repeat(${props.cols}, minmax(0, 1fr))`,
        columnGap: props.xGap + 'px',
        rowGap: props.yGap + 'px'
      }
    })

    return () => {
      let _slot = slots.default()
      if (_slot.length == 1 && _slot[0].type.toString() == 'Symbol(v-fgt)') {
        _slot = _slot[0].children
      }
      const defualtSlots = _slot.filter((slot) => {
        if (slot.children === 'v-if') {
          return false
        }
        return true
      })
      let slotsResult = []
      defualtSlots.map((slot) => {
        console.log(slot.props?.newRow)
        if (slot.props?.newRow == true) {
          //插入一个占满整行的div
          slotsResult.push(<div style={{ gridColumn: `1 / span ${props.cols}` }}></div>)
        }
        if (slot.props?.span != undefined) {
          slot.props.style = slot.props.style || {}
          slot.props.style.gridColumn = `1 / span ${slot.props.span || props.cols}`
        }
        slotsResult.push(slot)
      })
      return (
        <div class="admin-space" style={style.value}>
          {slotsResult}
        </div>
      )
    }
  }
})
