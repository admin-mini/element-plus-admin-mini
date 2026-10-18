import { onMounted, ref } from 'vue'
import { getTenants } from '@/api/sys/user-center-api'
import { useSystemStore } from '@/stores'

/**
 * 当前登录用户所属的租户信息（列表 + 当前租户）
 *
 * 供顶栏用户下拉（切换组织）与布局页头（多租户模式展示租户名称/logo）等多处复用：
 * 模块级共享状态 + 按登录 token 缓存请求 Promise，同一页面生命周期内无论多少组件使用，
 * 都只会发起一次请求；登录用户切换（token 变化）后会自动重新拉取。
 */
const tenantList = ref([])
const currentTenant = ref({})
const currentTenantId = ref(null)

// 缓存对应的登录 token 与请求 Promise
let loadedToken = null
let pending = null

export function useUserTenants() {
  const systemStore = useSystemStore()

  /** 拉取租户信息（去重，多次调用共享同一次请求） */
  function load() {
    const token = systemStore.state.token
    if (pending && loadedToken === token) return pending

    loadedToken = token
    pending = getTenants()
      .then((res) => {
        const data = res.data || {}
        const current = data.current || {}
        currentTenant.value = current
        // 兼容 current 的 id/tenantId 字段命名
        currentTenantId.value = current.id ?? current.tenantId ?? systemStore.state.tenantId
        tenantList.value = data.tenants || []
        return data
      })
      .catch(() => {
        // 无租户/接口异常时不展示租户分组，错误提示由请求拦截器处理；清空缓存以便后续重试
        pending = null
      })
    return pending
  }

  onMounted(load)

  return { tenantList, currentTenant, currentTenantId, load }
}
