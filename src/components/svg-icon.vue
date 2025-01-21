<template>
    <span class="el-icon" v-if="isCustom">
        <customSvg :name="props.name"></customSvg>
        <!-- <svg aria-hidden="true">
            <use :xlink:href="symbolId" />
        </svg> -->
    </span>
    <el-icon v-else-if="getIcon()">
        <component :is="getIcon()">
        </component>
    </el-icon>
</template>

<script setup>
import customSvg from '~virtual/svg-component'
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
const isCustom = computed(() => props.name.startsWith('i-'))
const symbolId = computed(() => props.prefix ? `#${[props.prefix, props.name].join('-')}` : `#${props.name}`)
</script>