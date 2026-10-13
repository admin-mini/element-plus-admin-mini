import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { createPinia } from 'pinia'
export const pinia = createPinia()
import packageJson from '../../package.json'
import router from '@/router/index'
import { getLoginUser } from '@/api/auth/auth-login-api'
import { getSysConfigList } from '@/api/dev/config-api'
import { useMediaQuery } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { id } from 'element-plus/es/locales.mjs'

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
    console.log("state",state.value);
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
  /**
   * 
   * @param {登录成功返回信息} data
   * {token,tenantId,username,nam} 
   */
  function login(data) {
    setToken(data.token);
    setTenantId(data.tenantId);
    return getUserInfo();
  }
  //获取登录用户信息
  function getUserInfo() {
    return getLoginUser().then((res) => {
      state.value.permissions = res.data.permissions
      state.value.roles = res.data.roles
      const user={
            id:res.data.id,
            avatar: res.data.avatar,
            name:res.data.name || res.data.nickname
      }
      state.value.user=user;
    }).catch(ex=>{
      ElMessage.warning('获取登录用户信息失败：',ex)
    })
  }
  function setToken(token) {
    state.value.token = token
  }
  /**
   * 加载系统基础信息：将 sysConfigList 的 [{configKey,configValue}] 转为 key/value 存入 state.sysInfo
   * 供登录页与主框架（logo 名称等）使用
   */
  function loadSysConfig() {
    return getSysConfigList()
      .then((res) => {
        const sysInfo = {}
        ;(res.data || []).forEach((item) => {
          if (item?.configKey) sysInfo[item.configKey] = item.configValue
        })
        state.value.sysInfo = sysInfo
        return sysInfo
      })
      .catch(() => {
        // 基础信息非核心流程，失败时不影响使用
      })
  }
  function setTenantId(tenantId) {
    state.value.tenantId = tenantId
  }
  function logout() {
    state.value = {}
    localStorage.removeItem(LOCALSTORAGEKEY)
    router.replace({ name: 'login' })
  }
  const isLogin = computed(() => {
    return !!state.value.token
  })

  return { state, login, setToken, logout, isLogin,getUserInfo, setMenuCollapse, menuCollapse, isSmallScreen, loadSysConfig }
})
// pinia.use(useSystemStore)
