<template>
    <!-- 
     为了方便统一管理样式，将表格、分页器、按钮等放在一个容器中，通过插槽的方式展示
      -->
    <div class="admin-view-search" v-if="slots.search">
        <slot name="search"></slot>
    </div>
    <div class="admin-view-body">
        <div class="admin-table-btns" v-if="slots.btn">
            <div class="_btns">
                <slot name="btn"></slot>
            </div>
            <div class="_tools">
                <el-popover placement="bottom" title="控制列" :width="200" trigger="click" v-if="slots.filterTable">
                    <template #reference>
                        <el-button icon="Operation" title="控制列" size="small"></el-button>

                    </template>
                    <div>
                        <div v-for="item in columnsOptions" :key="item.label">
                            <el-checkbox @change="setColumnsOptions" v-model="item.visible">{{ item.label
                                }}</el-checkbox>
                        </div>
                    </div>
                </el-popover>
                <el-button icon="Refresh" @click="$table.getTable()" size="small"></el-button>

            </div>
        </div>
        <div class="admin-table-list" v-if="slots.table || slots.filterTable">
            <el-table :data="$table.data" v-loading="$table.loading" @selection-change="$table.handleSelectionChange"
                v-if="slots.filterTable" ref="tableRef" fit>
                <filter-table ref="filterTableRef">
                    <slot name="filterTable"></slot>
                </filter-table>
            </el-table>
            <slot name="table" v-else></slot>
            <div class="admin-pager-container" v-if="props.noPage === undefined">
                <slot name="pager" v-if="slots.pager"></slot>
                <el-pagination v-else :layout="$table.pageLayout" background v-model:current-page="$table.query.page"
                    :page-size="$table.query.size" :total="$table.total" @size-change="$table.handleSizeChange"
                    @current-change="$table.handleCurrentChange" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { useTemplateRef, onMounted, nextTick, ref, useSlots } from 'vue'
import filterTable from '@/components/filter-table.tsx'
import useAdminTable from '@/plugins/use-admin-table'
const slots = useSlots()
const filterTableRef = useTemplateRef('filterTableRef')
const tableRef = useTemplateRef('tableRef')
const columnsOptions = ref([])
onMounted(() => {
    if (slots.filterTable) {
        columnsOptions.value = filterTableRef.value.getColumnsOption()
    }
});
function setColumnsOptions() {
    filterTableRef.value.setColumnsOption(columnsOptions.value)
    nextTick(() => {
        tableRef.value.doLayout()
    })
}

const props = defineProps(['api', 'query', 'no-page']);
const emits = defineEmits(['init',])
const $table = useAdminTable()
const queryFrom = ref()
$table.ref = queryFrom
if (props.noPage) {
    delete $table.query.size
    delete $table.query.page
}

if (props.query) {
    for (let key in props.query) {
        $table.query[key] = props.query[key]
    }
}

$table.api = props.api
emits("init", $table)
</script>

<style lang="scss"></style>