<template>
    <div class="admin-view">
        <el-row :gutter="10">
            <el-col :xs="24" :sm="24" :md="24" :lg="5" :xl="5">
                <el-input
                    v-model="filterText"
                    placeholder="请输入筛选条件"
                />
                <el-tree
                    ref="treeRef"
                    class="filter-tree"
                    :data="dictTreeData"
                    :props="dictTreeProps"
                    :expand-on-click-node="false"
                    :default-expand-all="false"
                    :filter-node-method="filterNode"
                    @node-click="selectedTree"
                />

            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="19" :xl="19">
                <admin-table :api="dictApi.getDictPage" @init="onTableInit">
                    <template #search>
                        <el-form ref="queryForm" @submit.prevent="$table.search" :inline="true" :model="$table.query">
                            <admin-grid :cols="4" :x-gap="20">
                                <el-form-item label="关键词">
                                    <el-input v-model="$table.query.searchKey" clearable></el-input>
                                </el-form-item>
                           
                                <template #last>
                                    <el-button native-type="submit" type="primary" icon="Search"
                                        :loading="$table.loading">搜索</el-button>
                                </template>
                            </admin-grid>
                        </el-form>
                    </template>

                    <template #btn>
                        <el-button type="primary" icon="Plus" @click="handleAdd" v-if="$p(['dev:dict:add'])">新增</el-button>
                    </template>

                    <template #table>
                        <el-table v-if="refreshTable" :default-expand-all="isExpandAll" :data="$table.data"
                            v-loading="$table.loading" row-key="id"
                            >
                            <el-table-column prop="dictLabel" label="字典名称" :show-overflow-tooltip="true" width="200">
                                 <template #default="{row}">
                                    <span :style="{color:row.color}">{{ row.dictLabel }}</span>
                                </template>
                            </el-table-column>
                           <el-table-column prop="dictValue" label="字典值" :show-overflow-tooltip="true" width="200">
                            </el-table-column>
                            <el-table-column prop="sortCode" label="排序" width="100" align="center"></el-table-column>
                            <el-table-column label="操作" align="left">
                                <template #default="scope">
                                    <el-space spacer="|">
                                        <el-link type="primary" @click="handleAdd(scope.row)"
                                            v-if="scope.row.parentId=='0' && $p(['dev:dict:add'])" icon="Plus"></el-link>
                                        <el-link type="primary" @click="handleEdit(scope.row)"
                                            v-if="$p(['dev:dict:edit'])" icon="Edit"></el-link>
                                        <el-link type="primary" @click="handleDel(scope.row)"
                                            v-if="$p(['dev:dict:delete'])" icon="Delete"></el-link>
                                    </el-space>
                                </template>
                            </el-table-column>
                        </el-table>
                    </template>
                </admin-table>
            </el-col>


        </el-row>
        
    </div>
</template>

<script setup>
import { h, nextTick, ref,onMounted } from 'vue'

import  * as dictApi from '@/api/dev/dict-api'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { ElMessage } from 'element-plus'
import { getDict } from '@/utils/dict'
import { syncConfirm } from "@/utils/utils"

getDict(["common_enabel_status"])
const adminDialog = useAdminDialog()


const filterText = ref('')
const treeRef = ref()
const dictTreeData=ref([]);

// 在 JS 中统一定义 props，避免模板里写错位
const dictTreeProps = {
  label: 'dictLabel',
  children: 'children'
}

watch(filterText, (val) => {
  treeRef.value.filter(val)
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

const initData=()=>{
    dictApi.getDictTree().then(resp=>{
        dictTreeData.value=resp.data;
    })
}

const selectedTree=(node)=>{
    $table.query.parentId=node.id;
    $table.search();
}

/**
 * 载入基础内容内容
 * */
onMounted(()=>{
    initData();
})


let $table
const refreshTable = ref(true)
const isExpandAll = ref(false)

function onTableInit(table) {
    $table = table;
    
}


function handleAdd(record) {
    adminDialog(
        {
            component: import('./modules/form.vue'),
            props: {
                parentId: record?.id,
                onSuccess: () => {
                    $table.getTable()
                    initData();
                }
            },
            dialogProps: { title: '新增菜单', width: "600px" }
        }
    )
}

function handleEdit(record) {
    adminDialog(
        {
            component: import('./modules/form.vue'),
            props: {
                record: record,
                onSuccess: () => {
                    $table.getTable()
                    initData();
                }
            },
            dialogProps: { title: '修改菜单', width: "600px" }
        }
    )
}

function handleDel(record) {
    syncConfirm(
        `是否确认删除名称为"${record.dictLabel}"的数据项及其子项吗?`,
        () => dictApi.dictDelete([{id:record.id}])
    ).then(() => {
        ElMessage.success("删除成功")
        $table.getTable()
        initData();
    }).catch(() => { })
}
</script>