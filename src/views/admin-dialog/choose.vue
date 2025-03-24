<template>
    <admin-dialog-content>
        <el-table border :data="$table.data" :empty-text="$table.emptyText" v-loading="$table.loading" height="400">
            <el-table-column prop="username" label="帐号" />
            <el-table-column prop="nickName" label="用户姓名" />
            <el-table-column label="操作" width="400px">
                <template #default="scope">
                    <el-space spacer="|">
                        <el-link type="primary" @click="choose(scope.row)">选择</el-link>
                    </el-space>
                </template>
            </el-table-column>
        </el-table>
        <div class="admin-pager-container">
            <el-pagination :layout="$table.pageLayout" background v-model:current-page="$table.query.page"
                :page-size="$table.query.size" :total="$table.total" @size-change="$table.handleSizeChange"
                @current-change="$table.handleCurrentChange" />
        </div>
    </admin-dialog-content>
</template>
<script setup>
import { userList } from '@/api'
import useAdminTable from '@/plugins/use-admin-table'
const emits = defineEmits(["success"])
const $table = useAdminTable({
    api: userList
})
function choose(row) {
    emits("success", row)
}

</script>
<style></style>