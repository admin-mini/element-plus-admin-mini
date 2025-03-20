<template>

    <el-icon v-if="getIcon()">
        <component :is="getIcon()">
        </component>
    </el-icon>
    <span class="el-icon" v-else>
        <svg aria-hidden="true">
            <use :xlink:href="symbolId" />
        </svg>
    </span>
</template>

<script setup>

import { computed, resolveComponent } from 'vue'

function getIcon() {
    //先判断是否有这个组件
    if (props.name == '#') {
        return null
    }
    let comp = resolveComponent(props.name)
    if (typeof comp === 'string') {
        return null
    }
    return comp
}
const props = defineProps({
    prefix: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        default: '#333',
    },
},)

const symbolId = computed(() => `#icon-${props.name}`)
</script>