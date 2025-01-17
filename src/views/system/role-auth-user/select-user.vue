<template>
   <admin-dialog>
      <admin-table :api="unallocatedUserList" @init="(table) => { $table = table }" :query="props.query">
         <template #search>
            <el-form ref="queryFrom" @submit.prevent="$table.search" :inline="true" :model="$table.query">
               <admin-grid :cols="2" :x-gap="20">
                  <el-form-item label="用户名称" prop="userName">
                     <el-input v-model="$table.query.userName"></el-input>
                  </el-form-item>
                  <el-form-item label="手机号码" prop="phonenumber">
                     <el-input v-model="$table.query.phonenumber" placeholder="请输入手机号码" clearable />
                  </el-form-item>

                  <template #last>
                     <el-button native-type="submit" type="primary" icon="Search"
                        :loading="$table.loading">搜索</el-button>
                  </template>
               </admin-grid>
            </el-form>
         </template>
         <template #table style="margin:0">
            <el-table :data="$table.data" table-layout="auto" style="width: 100%;" :empty-text="$table.emptyText"
               v-loading="$table.loading" @selection-change="$table.handleSelectionChange">
               <el-table-column type="selection" width="55" align="center" />
               <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
               <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
               <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
               <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
               <el-table-column label="状态" :formatter="$formatter.dict($dict.sys_normal_disable)" prop="status">
               </el-table-column>
               <el-table-column label="创建时间" prop="createTime">
               </el-table-column>

            </el-table>
         </template>
      </admin-table>
      <template #footer>
         <el-button @click="emits('end')">取消</el-button>
         <el-button type="primary" @click="submitForm(postForm)" :loading="loading">确定</el-button>
      </template>
   </admin-dialog>
</template>
<script setup>

import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDict } from '@/utils/dict'
import { unallocatedUserList, authUserSelectAll } from '@/api/system/role'
import { download } from "@/api/request"
import { syncConfirm } from "@/utils/utils"
import { useRoute } from "vue-router";
getDict(['sys_normal_disable'])
const props = defineProps(['query'])
const emits = defineEmits(['end', 'success'])
let $table = {};

const route = useRoute();
const roleId = route.params.roleId;
const loading = ref(false)
function submitForm() {
   loading.value = true
   authUserSelectAll({ roleId: roleId, userIds: $table.selection.map(item => item.userId)?.join(",") }).then(res => {
      if (res.data.code === 200) {
         ElMessage.success(res.data.msg);
         emits('success')
      }
   }).finally(() => {
      loading.value = false
   })
}

</script>
<style></style>