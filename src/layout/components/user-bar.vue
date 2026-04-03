<template>
    <el-dropdown>
        <span class="el-dropdown-link">
            <el-avatar :size="26" :src="systemStore.state?.user?.avatar" style="margin-right: 5px" >
            {{ nickName.substring(0,1) }}
            </el-avatar>
            <div class="username">
                {{ nickName }}
                <el-icon>
                    <arrow-down />
                </el-icon>
            </div>
        </span>
        <template #dropdown>
            <el-dropdown-menu>
                    <router-link to="/user/profile">
                <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link> 
                <el-dropdown-item @click="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script setup>
import { useSystemStore } from '@/stores'
import { computed } from 'vue';

const systemStore = useSystemStore()

const nickName = computed(()=>{
   return  systemStore.state?.user?.nickName || 'admin'
})

function logout() {
    systemStore.logout()
}

</script>
<style scoped lang="scss">
.el-dropdown-link{
    cursor: pointer;
    .username{
        font-size:14px;
    }
}
</style>