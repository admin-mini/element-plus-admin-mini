import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { createPinia } from 'pinia'
export const pinia = createPinia()
import packageJson from '../../package.json'
import router from '@/router/index'
import Cookies from 'js-cookie'
import { getInfo } from '@/api/login'
import defAva from '@/assets/profile.jpg'
import SETTING from '@/utils/setting'

const SESSTION_KEY = packageJson.name
var localState = {}
try {
  localState = JSON.parse(sessionStorage.getItem(SESSTION_KEY)) || {}
} catch (err) {
  void err
}

export const useSystemStore = defineStore('user', () => {
  const state = ref(localState)
  watch(
    state,
    () => {
      Cookies.set('Admin-Token', state.value.token)
      sessionStorage.setItem(SESSTION_KEY, JSON.stringify(state.value))
    },
    { deep: true }
  )
  function login(token) {
    state.value.token = token
    return getUserInfo()
  }
  //
  function getUserInfo() {
    return getInfo().then((res) => {
      state.value.permissions = res.permissions
      state.value.roles = res.roles
      state.value.shop = res.shop
      res.user.avatar = res.user.avatar ? SETTING.apiUrl + res.user.avatar : defAva
      state.value.user = res.user
    })
  }

  function setToken(token) {
    state.value.token = token
  }
  function logout() {
    state.value = {}
    sessionStorage.removeItem(SESSTION_KEY)
    router.replace({ name: 'login' })
  }
  const isLogin = computed(() => {
    return !!state.value.token
  })
  if (isLogin.value) {
    getUserInfo()
  }

  return { state, login, setToken, logout, isLogin }
})
// pinia.use(useSystemStore)
