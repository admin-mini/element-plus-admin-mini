<template>
    <!-- 
     为了方便统一管理样式，将表格、分页器、按钮等放在一个容器中，通过插槽的方式展示
      -->
    <div class="admin-view-search">
        <slot name="search"></slot>
    </div>
    <div class="admin-view-body">
        <div class="admin-table-btns">
            <slot name="btn"></slot>
        </div>
        <div class="admin-table-list">
            <slot name="table"></slot>
            <div class="admin-pager-container">
                <!-- <slot name="pager"></slot> -->
                <el-pagination :layout="$table.pageLayout" background v-model:current-page="$table.query.page"
                    :page-size="$table.query.size" :total="$table.total" @size-change="$table.handleSizeChange"
                    @current-change="$table.handleCurrentChange" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { h, ref } from 'vue'
import useAdminTable from '@/plugins/use-admin-table'
const props = defineProps(['api', 'query'])
const emits = defineEmits(['init',])
const $table = useAdminTable()
const queryFrom = ref()
$table.ref = queryFrom
if (props.query) {
    for (let key in props.query) {
        $table.query[key] = props.query[key]
    }
}

$table.api = props.api
emits("init", $table)
</script>

<style lang="scss"></style>