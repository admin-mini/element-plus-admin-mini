import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { createPinia } from 'pinia'
export const pinia = createPinia()
import packageJson from '../../package.json'
import router from '@/router/index'
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
      localStorage.setItem(LOCALSTORAGEKEY, JSON.stringify(state.value))
    },
    { deep: true }
  )
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

  return { state, login, setToken, logout, isLogin }
})
// pinia.use(useSystemStore)
