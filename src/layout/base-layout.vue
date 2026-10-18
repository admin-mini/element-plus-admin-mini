<template>
    <el-config-provider :locale="locale">
        <div class="admin-container" :class="{ 'admin-container-phone': systemStore.isSmallScreen, }"
            v-if="systemStore.isLogin">
            <div class="admin-header">
                <div class="admin-header-left" :class="{ 'admin-header-collapse': systemStore.menuCollapse }">
                    <div class="header-brand">
                        <img class="header-logo" :src="brandLogo" alt="logo" />
                    </div>
                    <div ref="brandTextRef" class="brand-text">{{ brandTitle }}</div>
                </div>

                <div class="admin-menu-collapse">
                    <el-button icon="Fold" size="small" @click="systemStore.setMenuCollapse()"></el-button>
                </div>

                <admin-bread
                    v-if="menuPositionStorge == 'vertical' && !systemStore.isSmallScreen && SETTING.useBreadcrumb"></admin-bread>
                <div class="admin-menu" v-if="menuPositionStorge == 'horizontal'">
                    <base-navigator :mode="menuPositionStorge"></base-navigator>
                </div>
                <div class="admin-header-right">
                    <el-button type="default" link @click="toggleDark()">
                        <el-icon>
                            <Sunny v-if="isDark" />
                            <Moon v-else />
                        </el-icon>
                    </el-button>
                    <!-- <el-button @click="togglePosition()" size="small">
                    <el-icon>
                        <TopRight v-if="menuPositionStorge == 'vertical'" />
                        <BottomLeft v-else />
                    </el-icon>
                </el-button> -->

                    <message />
                    <user-bar />
                </div>
            </div>

            <div class="admin-body">
                <template v-if="menuPositionStorge == 'vertical'">
                    <el-drawer v-model="systemStore.state.menuCollapse" title="I am the title" direction="ltr"
                        v-if="systemStore.isSmallScreen">
                        <el-scrollbar class="admin-slide">
                            <base-navigator :mode="menuPositionStorge"></base-navigator>
                        </el-scrollbar>
                    </el-drawer>
                    <el-scrollbar class="admin-slide" v-else>
                        <base-navigator :mode="menuPositionStorge"></base-navigator>
                    </el-scrollbar>
                </template>
                <div class="admin-body-view">
                    <tag-list v-if="SETTING.useTag"></tag-list>
                    <el-scrollbar view-style="height:100%">
                        <admin-router-view></admin-router-view>
                        <!-- <router-view v-slot="{ Component, route }" >
              <keep-alive>
                <component :is="Component"  />
              </keep-alive>
            </router-view> -->
                    </el-scrollbar>
                </div>
            </div>
        </div>
    </el-config-provider>
</template>
<script setup>
import { useSystemStore } from '@/stores'
import baseNavigator from './base-navigator.vue'
import { useDark, useToggle, useStorage } from '@vueuse/core'
import adminRouterView from "./admin-router-view.vue"
import { computed, h, nextTick, onMounted, ref, watch } from 'vue'
import tagList from './tag-list.vue'
import SETTING from '@/utils/setting'
import UserBar from './components/user-bar.vue'
import Message from './components/message/index.vue'
import { useUserTenants } from './use-user-tenants'
// 系统 logo（本地资源）
import logoUrl from '@/assets/images/logo.png'



const systemStore = useSystemStore()

// 是否多租户模式（与 sys/user/index.vue 的判断保持一致）
const TENANT_ENABLE = import.meta.env.VITE_TENANT_ENABLE === 'true'

// 租户信息与顶栏用户下拉共用同一份数据（use-user-tenants 内按 token 缓存，只请求一次）
const { currentTenant } = useUserTenants()

// 系统名称以系统配置为准
const sysTitle = computed(() => systemStore.state.sysInfo?.sys_title || import.meta.env.VITE_APP_NAME)

// 多租户模式展示当前租户名称与 logo；租户无 logo（接口未返回）时回退默认 logo
const brandLogo = computed(() => (TENANT_ENABLE && currentTenant.value?.logo) || logoUrl)
const brandTitle = computed(
    () => (TENANT_ENABLE && currentTenant.value?.tenantName) || sysTitle.value
)

// 标题 DOM 引用与字号上下限（标题过长时自动缩小字号，最多显示 2 行）
const brandTextRef = ref(null)
const BRAND_FONT_MAX = 22
const BRAND_FONT_MIN = 12

/**
 * 标题超过 2 行（由 CSS 的 line-clamp 限制）时逐级缩小字号，
 * 直到刚好放进 2 行；到最小字号仍放不下则由 CSS 截断
 */
async function fitBrandTitle() {
    await nextTick()
    const el = brandTextRef.value
    if (!el) return
    for (let size = BRAND_FONT_MAX; size >= BRAND_FONT_MIN; size--) {
        el.style.fontSize = `${size}px`
        if (el.scrollHeight <= el.clientHeight) return
    }
}

// 标题变化（系统配置/租户信息异步加载）或菜单折叠状态变化（折叠时标题隐藏）后重新适配字号
watch([brandTitle, () => systemStore.menuCollapse], fitBrandTitle)
onMounted(fitBrandTitle)

onMounted(() => {
    // 已有缓存则不再重复请求
    if (!systemStore.state.sysInfo) {
        systemStore.loadSysConfig()
    }
})

function logout() {
    systemStore.logout()
}

const isDark = useDark()
const toggleDark = useToggle(isDark)
const menuPositionStorge = useStorage('menu-position', 'vertical') //horizontal
function togglePosition() {
    menuPositionStorge.value = menuPositionStorge.value == 'vertical' ? 'horizontal' : 'vertical'
}
</script>
<style></style>