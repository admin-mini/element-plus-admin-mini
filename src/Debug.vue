<template>
    <div class="debugger" :class="show ? 'open' : 'close'">
        <a href="javascript:;" style="cursor: pointer" @click="show = !show;">
            <el-text> <el-icon>
                    <Tools></Tools>
                </el-icon></el-text>
        </a>
        <el-collapse-transition>
            <div class="debugger-inner" v-show="show">
                <a :href="'?debug=http://api.websir.top:5500/mock/201/'">yapi</a>
                <a :href="'?debug=https://mock.apifox.cn/m1/3332315-0-default'">apiFox</a>
            </div>
        </el-collapse-transition>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
const show = ref(false);

</script>
  
<style lang="scss" scoped>
.debugger {
    position: fixed;
    right: 0;
    bottom: 0;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.5);
    transition: all 1s;

    color: #fff;

    &.open {}

    .debugger-inner {}

    a {
        text-align: center;
        color: #fff;
        text-decoration: none;
        font-size: 16px;
        line-height: 1.8;
        display: block;
        padding: 0 10px;

        &:hover {
            background: rgba(0, 0, 0, 0.5);
        }
    }
}
</style>
  