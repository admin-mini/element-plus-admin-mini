import { defineStore } from 'pinia'
import { computed, nextTick, ref, toValue } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export const useTagView = defineStore('tagList', () => {
  const route = useRoute()
  const router = useRouter()

  // state
  const active = ref(router.currentRoute.value.fullPath)
  const tagList = ref([])

  const exclude = computed(() => {
    let arr = []
    for (let key in viewKeyMap.value) {
      if (!viewKeyMap.value[key]) {
        arr.push(key)
      }
    }
    return arr
  })
  const viewKeyMap = ref({})

  // actions
  //刷新
  const refresh = () => {
    viewKeyMap.value[active.value] = false
    setTimeout(() => {
      viewKeyMap.value[active.value] = true
    })
  }
  function parseTag(tag) {
    if (!tag.fullPath) {
      tag = router.resolve(tag).fullPath
    } else {
      tag = tag.fullPath
    }
    return tag
  }

  //关闭右侧
  const removeRight = (tag) => {
    tag = parseTag(tag)
    const index = tagList.value.findIndex((item) => item.fullPath == tag)
    if (index === -1) {
      return
    }
    setActive(tag)
    tagList.value.splice(index + 1)
  }
  //关闭其他
  const removeOther = (tag) => {
    tag = parseTag(tag)
    const index = tagList.value.findIndex((item) => item.fullPath == tag)
    if (index === -1) {
      return
    }
    setActive(tag)
    tagList.value.splice(index + 1)
    tagList.value.splice(0, index)
  }

  const remove = (tag, callback) => {
    tag = parseTag(tag)
    const index = tagList.value.findIndex((item) => item.fullPath == tag)
    if (index === -1) {
      return
    }
    // 如果关闭的是当前激活的标签页，需要确定跳转目标
    if (tag == route.fullPath) {
      // 优先跳转到右侧标签页，如果没有则跳转到左侧标签页
      const nextTag = tagList.value[index - 1] || tagList.value[index + 1]
      if (nextTag) {
        router.replace(nextTag.fullPath).finally(() => {
          callback && callback()
        })
      } else {
        // 如果没有相邻标签页，跳转到首页
        router.replace('/').finally(() => {
          callback && callback()
        })
      }
    }
    // 删除标签页
    // tagList.value.splice(index, 1)
    setTimeout(() => {
      //hack写法，keep-alive模式下
      //routerview对应的component如果引用的是同一个物理文件
      //删除其中一个tag时，会重置其他组件状态
      tagList.value.splice(index, 1)
    })
  }
  const setActive = (tag) => {
    tag = parseTag(tag)
    active.value = tag
    router.replace(viewKeyMap.value[tag])
  }
  function sort(oldIndex, newIndex) {
    const list = tagList.value
    const item = list[oldIndex]
    list.splice(oldIndex, 1)
    list.splice(newIndex, 0, item)
  }
  router.afterEach((to, from) => {
    addTag(to)
  })
  function addTag(to) {
    // debugger
    to = router.resolve(to)
    if (to.matched[0]?.meta?.noTag) {
      return
    }
    active.value = router.resolve(to).fullPath
    if (tagList.value.find((item) => item.fullPath == to.fullPath) || to.meta?.noKeep) {
      return
    }

    viewKeyMap.value[to.fullPath] = to
    tagList.value.push(toValue(to))
  }
  //获取用于缓存的tag key
  const tagKeys = computed(() => {
    let arr = []
    tagList.value.map((item) => {
      if (item.matched.length > 2) {
        arr.push(router.resolve(item.matched[1]).fullPath)
      }
      arr.push(item.fullPath)
    })
    return arr
  })
  function clearAll() {
    tagList.value = []
    viewKeyMap.value = {}
  }

  return {
    active,
    tagList,
    exclude,
    viewKeyMap,
    sort,
    remove,
    removeRight,
    removeOther,
    setActive,
    refresh,
    tagKeys,
    addTag,
    clearAll
  }
})
