import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { createPinia } from 'pinia'
export const pinia = createPinia()
import packageJson from '../../package.json'
import router from '@/router/index'
import Cookies from 'js-cookie'
import { getInfo } from '@/api/login'
const LOCALSTORAGEKEY = packageJson.name
var localState = {}
try {
  localState = JSON.parse(localStorage.getItem(LOCALSTORAGEKEY)) || {}
} catch (err) {
  void err
}

export const useSystemStore = defineStore('user', () => {
  const state = ref(localState)
  watch(
    state,
    () => {
      Cookies.set('Admin-Token', state.value.token)
      localStorage.setItem(LOCALSTORAGEKEY, JSON.stringify(state.value))
    },
    { deep: true }
  )
  function login(token) {
    state.value.token = token
    return getUserInfo()
  }
  getUserInfo()
  function getUserInfo() {
    return getInfo().then((res) => {
      if (res.data.code == 200) {
        state.value.permissions = res.data.permissions
        state.value.roles = res.data.roles
        state.value.user = res.data.user
      }
    })
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

  return { state, login, setToken, logout, isLogin }
})
// pinia.use(useSystemStore)
