<template>
    <!-- 
     为了方便统一管理样式，将表格、分页器、按钮等放在一个容器中，通过插槽的方式展示
      -->
    <div class="admin-dialog-container">
        <div class="admin-dialog-body">
            <slot name="default"></slot>
        </div>
        <div class="admin-dialog-footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup>
import { h, ref } from 'vue'
import useAdminTable from '@/plugins/use-admin-table'
const props = defineProps(['api',])
const emits = defineEmits(['init'])
const $table = useAdminTable()
const queryFrom = ref()

$table.ref = queryFrom
$table.api = props.api
emits("init", $table)
</script>

<style lang="scss"></style>