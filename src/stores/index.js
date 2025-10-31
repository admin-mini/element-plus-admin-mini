import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { createPinia } from 'pinia'
export const pinia = createPinia()
import packageJson from '../../package.json'
import router from '@/router/index'
import { useMediaQuery } from '@vueuse/core'
const LOCALSTORAGEKEY = packageJson.name
var localState = {}
try {
  localState = JSON.parse(localStorage.getItem(LOCALSTORAGEKEY)) || {}
} catch (err) {
  void err
}
export const useSystemStore = defineStore('user', () => {
  const state = ref(localState)
  const isSmallScreen = useMediaQuery('(max-width: 1024px)',)
  const menuCollapse = computed(() => {
    if (isSmallScreen.value) {
      //小尺寸不允许折叠
      return false;
    }
    return state.value.menuCollapse
  })
  if (isSmallScreen.value) {
    state.value.menuCollapse = false
  }
  watch(
    state,
    () => {
      localStorage.setItem(LOCALSTORAGEKEY, JSON.stringify(state.value))
    },
    { deep: true }
  )

  function setMenuCollapse(collapse) {
    state.value.menuCollapse = collapse === undefined ? !state.value.menuCollapse : collapse
  }
  function login(data) {
    state.value = data
  }
  function setToken(token) {
    state.value.token = token
  }
  function logout() {
    state.value = {}
    localStorage.removeItem(LOCALSTORAGEKEY)
    router.replace({ name: 'login' })
  }
  const isLogin = computed(() => {
    return !!state.value.token
  })

  return { state, login, setToken, logout, isLogin, setMenuCollapse, menuCollapse, isSmallScreen }
})
// pinia.use(useSystemStore)
