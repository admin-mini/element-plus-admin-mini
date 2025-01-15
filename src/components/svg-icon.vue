<template>
    <span class="el-icon" v-if="isCustom">
        <SvgIcon1 :name="props.name"></SvgIcon1>
    </span>
    <el-icon v-else-if="getIcon()">
        <component :is="getIcon()">
        </component>
    </el-icon>
</template>

<script setup>
import SvgIcon1 from '~virtual/svg-component'
import { computed, resolveComponent } from 'vue'

function getIcon() {
    return resolveComponent(props.name)
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