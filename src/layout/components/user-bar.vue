<template>
    <el-dropdown ref="dropdownRef" popper-class="user-menu-popper">
        <span class="el-dropdown-link">
            <el-avatar :size="26" :src="systemStore.state?.user?.avatar" style="margin-right: 5px" >
            {{ nickName.substring(0,1).toUpperCase() }}
            </el-avatar>
            <div class="username">
                {{ nickName }}
                <el-icon>
                    <arrow-down />
                </el-icon>
            </div>
        </span>
        <template #dropdown>
            <!--
                vertical 模式下仅 collapse 能让 el-sub-menu 进入 popup（右侧/空间不足时翻转到左侧）的级联模式，
                因此必须保留 :collapse="true"，再用样式把折叠形态还原为 el-dropdown-menu 的尺寸与"图标 + 文字"外观。
                :teleported="false" 让级联面板留在本弹层 DOM 内，避免 teleport 到 body 后外层下拉误判为点击外部而收起。
                折叠模式下 el-menu-item 一旦提供 #title 插槽，文字会被当作 tooltip 内容而不在行内显示，
                因此这里不使用 #title，直接把图标与文字放在默认插槽
            -->
                <el-menu class="user-menu" :collapse="true" :ellipsis="false" @select="handleMenuSelect">
                    <el-menu-item index="uc">
                        <el-icon><user /></el-icon>
                        <span>个人中心</span>
                    </el-menu-item>

                    <el-menu-item index="clearCache">
                        <el-icon><refresh /></el-icon>
                        <span>清理缓存</span>
                    </el-menu-item>

                    <el-divider class="menu-divider" />

                    <el-sub-menu
                        index="sub-switch-tenant"
                        :teleported="false"
                        popper-class="tenant-menu-popper"
                    >
                        <template #title>
                            <el-icon><switch /></el-icon>
                            <span>切换组织</span>
                            <el-icon class="sub-menu-arrow"><arrow-right /></el-icon>
                        </template>
                        <el-menu-item
                            v-for="tenant in tenantList"
                            :key="tenant.id"
                            :index="`tenant-${tenant.id}`"
                            :disabled="tenant.id === currentTenantId"
                        >
                            <span class="tenant-name" :title="tenant.tenantName">{{ tenant.tenantName }}</span>
                            <el-icon v-if="tenant.id === currentTenantId" class="tenant-item-check">
                                <check />
                            </el-icon>
                        </el-menu-item>
                </el-sub-menu>

                <el-divider class="menu-divider" />

                <el-menu-item index="outLogin">
                    <el-icon><switch-button /></el-icon>
                    <span>退出登录</span>
                </el-menu-item>
            </el-menu>
        </template>
    </el-dropdown>
</template>

<script setup>
import { useSystemStore } from '@/stores'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTenants } from '@/api/sys/user-center-api'
import { switchTenant } from '@/api/auth/auth-login-api'
import packageJson from '../../../package.json'

// 与 stores 保持一致：本应用的登录态等状态都存在这个 key 下
const LOCALSTORAGEKEY = packageJson.name

const systemStore = useSystemStore()
const router = useRouter()

// 下拉实例，用于点击菜单项后主动收起（el-menu 不会自动关闭外层下拉）
const dropdownRef = ref()

// 我的租户列表与当前租户ID
const tenantList = ref([])
const currentTenantId = ref(null)

const nickName = computed(() => {
    return systemStore.state?.user?.name || 'admin'
})

// 加载租户列表，兼容 current 的 id/tenantId 字段命名
function loadTenants() {
    return getTenants()
        .then(res => {
            const data = res.data || {}
            const current = data.current || {}
            currentTenantId.value = current.id ?? current.tenantId ?? systemStore.state.tenantId
            tenantList.value = data.tenants || []
        })
        .catch(() => {
            // 无租户/接口异常时不展示租户分组，错误提示由请求拦截器处理
        })
}

onMounted(() => {
    loadTenants()
})

function closeDropdown() {
    dropdownRef.value?.handleClose?.()
}

// el-menu 的 select 事件，index 即各菜单项的标识
async function handleMenuSelect(index) {
    if (index === 'uc') {
        closeDropdown()
        router.push('/user/profile')
        return
    }
    if (index === 'clearCache') {
        handleClearCache()
        return
    }
    if (index === 'outLogin') {
        closeDropdown()
        systemStore.logout()
        return
    }
    if (index.startsWith('tenant-')) {
        const id = index.slice('tenant-'.length)
        const tenant = tenantList.value.find(item => String(item.id) === id)
        await handleSwitchTenant(tenant)
    }
}

/**
 * 清理缓存：清空前端本地缓存与 sessionStorage，只保留本应用自身的登录态（token/租户等），
 * 清理完成后整页刷新，相当于重新拉取系统配置与用户信息
 */
function handleClearCache() {
    closeDropdown()
    ElMessageBox.confirm(
        '确定清理本地缓存吗？清理完成后页面将自动刷新',
        '清理缓存',
        { type: 'warning', confirmButtonText: '确认清理', cancelButtonText: '取消' }
    ).then(() => {
        const authState = localStorage.getItem(LOCALSTORAGEKEY)
        localStorage.clear()
        sessionStorage.clear()
        if (authState) localStorage.setItem(LOCALSTORAGEKEY, authState)
        ElMessage.success('缓存已清理')
        setTimeout(() => window.location.reload(), 300)
    }).catch(() => {
        // 取消清理
    })
}

/**
 * 切换租户：确认后调用切换接口，返回结果与登录一致，直接复用 systemStore.login，
 * 之后整页刷新，复用路由守卫重新生成菜单与权限，避免旧租户路由/标签页残留
 */
async function handleSwitchTenant(tenant) {
    if (!tenant?.id || tenant.id === currentTenantId.value) return
    closeDropdown()
    try {
        await ElMessageBox.confirm(
            `您确定要切换到「${tenant.tenantName}」吗？切换成功后页面将自动刷新`,
            '账户切换',
            { type: 'warning', confirmButtonText: '确认切换', cancelButtonText: '取消' }
        )
    } catch {
        // 取消切换
        return
    }
    try {
        const res = await switchTenant({ tenantId: tenant.id })
        await systemStore.login(res.data)
        setTimeout(() => {
            // 回到首页再刷新，避免停留在新租户不存在的路由上
            window.location.hash = '#/'
            window.location.reload()
        }, 300)
    } catch {
        // 错误提示由请求拦截器处理
    }
}

</script>
<style scoped lang="scss">
.el-dropdown-link{
    cursor: pointer;
    .username{
        font-size:14px;
    }
}

// 折叠菜单贴合弹层底色，并去掉 el-menu 默认的右侧边框
.user-menu{
    --el-menu-bg-color: transparent;
    --el-menu-border-color: transparent;
}

// 租户名称过长时省略号显示，完整名称用 title 悬浮提示
.tenant-name{
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.tenant-item-check{
    flex: none;
    margin-left: 8px;
    color: var(--el-color-primary);
}
</style>
<style lang="scss">
// 弹层内容被 ElScrollbar 包裹（overflow:hidden/auto），会裁掉向外弹出的子菜单面板，故放开
.user-menu-popper .el-scrollbar,
.user-menu-popper .el-scrollbar__wrap{
    overflow: visible;
}

// 悬停底色：EP 默认取 --el-color-primary-light-9，深色主题下是 #1b222b 这类深色块，
// 悬停菜单项时会看到一条深色色块，这里改用主题自适应的柔和填充色
.user-menu-popper .user-menu{
    --el-menu-hover-bg-color: var(--el-fill-color-light);
}
// 菜单分隔线：el-divider 默认 margin 24px 0，放进菜单里需要收紧
.user-menu-popper .menu-divider{
    margin: 4px 0;
    border-top-color: var(--el-border-color-lighter);
}

// 折叠菜单按 el-dropdown-menu 的尺寸还原：面板宽 200px、上下内边距 5px
.user-menu-popper .user-menu.el-menu--collapse{
    width: 200px;
    padding: 5px 0;
}
// 条目尺寸对齐 .el-dropdown-menu__item（padding 5px 16px / line-height 22px）
.user-menu-popper .user-menu .el-menu-item,
.user-menu-popper .user-menu .el-sub-menu__title{
    height: auto;
    min-height: 32px;
    line-height: 22px;
    padding: 5px 16px;
}
// 折叠模式默认把标题文字（直接子级 span）隐藏为 0 宽，这里还原，使菜单呈现"图标 + 文字"
.user-menu-popper .user-menu.el-menu--collapse > .el-menu-item > span,
.user-menu-popper .user-menu.el-menu--collapse > .el-sub-menu > .el-sub-menu__title > span{
    display: inline-block;
    width: auto;
    height: auto;
    overflow: visible;
    visibility: visible;
}
// 折叠模式默认把图标固定为 24px 居中，这里改为与下拉菜单一致的紧凑间距
.user-menu-popper .user-menu.el-menu--collapse > .el-menu-item > [class^=el-icon],
.user-menu-popper .user-menu.el-menu--collapse > .el-sub-menu > .el-sub-menu__title > [class^=el-icon]{
    width: auto;
    margin-right: 5px;
}
// "切换组织"标题右侧的展开箭头（折叠模式会隐藏 el-sub-menu 自带的箭头，这里用显式图标表示可向右展开）
.user-menu-popper .user-menu.el-menu--collapse > .el-sub-menu > .el-sub-menu__title > .sub-menu-arrow{
    width: auto;
    margin-left: auto;
    margin-right: 0;
    color: var(--el-text-color-secondary);
}

// 子菜单弹出面板：恢复不透明底色（主菜单把它设为透明了）并固定宽度
.tenant-menu-popper{
    --el-menu-bg-color: var(--el-bg-color-overlay);
}
.tenant-menu-popper .el-menu--popup{
    width: 200px;
}
</style>
