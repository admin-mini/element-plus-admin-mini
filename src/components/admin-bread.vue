<script setup>
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter()
</script>
<template>
    <el-breadcrumb separator="/" class="admin-bread">
        <el-breadcrumb-item :to="{ path: '/' }">
            <el-icon size="24px">
                <HomeFilled />
            </el-icon>
        </el-breadcrumb-item>
        <el-breadcrumb-item :to="router.getFullPath(route)" v-for="item in route.matched.slice(1)" :key="item.meta.key">
            {{ item.meta.name }}
        </el-breadcrumb-item>

    </el-breadcrumb>
</template>
<style lang="scss">
.admin-bread {
    box-sizing: border-box;
    width: 100%;
    padding: 24px 0;
    padding-top: 0;
    font-size: inherit;
    display: flex;
    align-items: center;
}
</style>