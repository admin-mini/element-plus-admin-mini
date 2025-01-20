import { routeMap } from '@/router'
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
  const viewKeyMap = ref({
    [active.value]: true
  })
  routeMap.values().forEach((item) => {
    if (item.meta?.affix) {
      addTag(router.resolve(item))
    }
  })
  addTag(router.currentRoute.value) //将当前路由添加到tagList中
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

    // 如果关闭的是当前激活的标签页，需要确定跳转目标
    if (tag == route.fullPath) {
      // 优先跳转到右侧标签页，如果没有则跳转到左侧标签页
      const nextTag = tagList.value[index - 1] || tagList.value[index + 1]
      if (nextTag) {
        router.replace(nextTag.fullPath)
      } else {
        // 如果没有相邻标签页，跳转到首页
        router.replace('/')
      }
    }

    // 删除标签页
    tagList.value.splice(index, 1)
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
    addTag(to)
  })
  function addTag(to) {
    active.value = to.fullPath
    if (tagList.value.find((item) => item.fullPath == to.fullPath) || to.name === 'login') {
      return
    }

    viewKeyMap.value[to.fullPath] = true
    tagList.value.push(toValue(to))
  }
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
