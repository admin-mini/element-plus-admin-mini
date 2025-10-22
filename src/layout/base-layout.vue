<template>
    <el-config-provider :locale="locale">
        <div class="admin-container" :class="{ 'admin-container-phone': systemStore.isSmallScreen, }"
            v-if="systemStore.isLogin">
            <div class="admin-header">
                <div class="admin-header-left" :class="{ 'admin-header-collapse': systemStore.menuCollapse }">
                    <div class="header-brand">
                        <el-icon size="28px">
                            <GoodsFilled />
                        </el-icon>

                    </div>
                    <!-- <div class="brand-text">{{ $env.VITE_APP_NAME }}</div> -->
                    <div class="brand-text">{{ $t('appName') }}</div>
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
                    <el-button @click="toggleDark()" size="small">
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
                    <el-dropdown @command="changelang">
                        <el-link :underline="false" class="el-dropdown-link">
                            {{ lang == 'zh' ? '中文' : 'English' }}
                            <el-icon class="el-icon--right">
                                <arrow-down />
                            </el-icon>
                        </el-link>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="zh">
                                    中文
                                </el-dropdown-item>
                                <el-dropdown-item command="en">
                                    English
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <el-dropdown>
                        <span class="el-dropdown-link">
                            <el-avatar :size="26" :src="systemStore.state?.user?.avatar" style="margin-right: 5px" />
                            <div>
                                {{ systemStore.state?.user?.nickName }}
                                <el-icon>
                                    <arrow-down />
                                </el-icon>
                            </div>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <!-- <router-link to="/user/profile">
                                <el-dropdown-item>个人中心</el-dropdown-item>
                            </router-link> -->
                                <el-dropdown-item @click="logout">{{ $t('system.logout') }}</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
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
import { computed, h, ref } from 'vue'
import tagList from './tag-list.vue'
import SETTING from '@/utils/setting'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import { useI18n } from 'vue-i18n'


const systemStore = useSystemStore()

const lang = useStorage('lang', 'zh', sessionStorage);
const i18n = useI18n()
const locale = computed(() => {
    return lang.value == 'en' ? en : zhCn;
})
function changelang(command) {
    lang.value = command;
    i18n.locale.value = lang.value;
}
window.changelang = changelang;

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