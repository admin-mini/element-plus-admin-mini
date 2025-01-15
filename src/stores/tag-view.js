import { defineStore } from 'pinia'
import { computed, nextTick, ref, toValue } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export const useTagView = defineStore('tagList', () => {
  const route = useRoute()
  const router = useRouter()

  // state
  const tagList = ref([router.currentRoute.value])
  const active = ref(router.currentRoute.value.fullPath)
  const exclude = computed(() => {
    let arr = []
    for (let key in viewKeyMap.value) {
      if (!viewKeyMap.value[key]) {
        arr.push(key)
      }
    }
    return arr
  })
  const viewKeyMap = ref({
    [active.value]: true
  })
  // actions
  //刷新
  const refresh = () => {
    viewKeyMap.value[active.value] = false
    setTimeout(() => {
      viewKeyMap.value[active.value] = true
    })
  }

  const remove = (tag) => {
    const index = tagList.value.findIndex((item) => item.fullPath == tag)
    if (index === -1) {
      return
    }
    tagList.value.splice(index, 1)
    if (tag == route.fullPath) {
      router.replace(tagList.value[0].fullPath)
    }
  }
  const setActive = (tag) => {
    active.value = tag
    router.replace(tag)
  }
  function sort(oldIndex, newIndex) {
    const list = tagList.value
    const item = list[oldIndex]
    list.splice(oldIndex, 1)
    list.splice(newIndex, 0, item)
  }
  router.afterEach((to, from) => {
    active.value = to.fullPath
    if (tagList.value.find((item) => item.fullPath == to.fullPath)) {
      return
    }
    viewKeyMap.value[to.fullPath] = true
    tagList.value.push(toValue(to))
  })

  return {
    active,
    tagList,
    exclude,
    viewKeyMap,
    sort,
    remove,
    setActive,
    refresh
  }
})
