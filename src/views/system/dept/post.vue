<template>
    <admin-dialog>
        <el-form ref="formRef" :model="postData" label-width="auto">
            <admin-space cols="2" :x-gap="20">
                <el-form-item v-if="postData.parentId !== 0" label="上级部门" prop="parentId" :rules="[$rules.required]">
                    <el-tree-select v-model="postData.parentId" :data="deptOptions"
                        :props="{ value: 'deptId', label: 'deptName', children: 'children' }" value-key="deptId"
                        placeholder="选择上级部门" check-strictly />
                </el-form-item>
                <el-form-item label="部门名称" prop="deptName" :rules="[$rules.required]">
                    <el-input v-model="postData.deptName" placeholder="请输入部门名称" />
                </el-form-item>
                <el-form-item label="显示排序" prop="orderNum" :rules="[$rules.required]">
                    <el-input-number v-model="postData.orderNum" controls-position="right" :min="0" />
                </el-form-item>
                <el-form-item label="负责人" prop="leader">
                    <el-input v-model="postData.leader" placeholder="请输入负责人" maxlength="20" />
                </el-form-item>
                <el-form-item label="联系电话" prop="phone" :rules="[$rules.phone]">
                    <el-input v-model="postData.phone" placeholder="请输入联系电话" maxlength="11" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="postData.email" placeholder="请输入邮箱" maxlength="50" />
                </el-form-item>
                <el-form-item label="部门状态">
                    <el-radio-group v-model="postData.status">
                        <el-radio v-for="dict in $dict.sys_normal_disable" :key="dict.value" :value="dict.value">
                            {{ dict.label }}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
            </admin-space>
        </el-form>
        <template #footer>
            <el-button @click="emits('end')">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="loading">确定</el-button>
        </template>
    </admin-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listDept, getDept, addDept, updateDept, listDeptExcludeChild } from '@/api/system/dept'
import { getDict } from '@/utils/dict'
import { arrToTree } from '@/utils/utils'

getDict(['sys_normal_disable'])

const props = defineProps({
    row: Object,
    parentId: [String, Number]
})
const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const formRef = ref()
const deptOptions = ref([])

const postData = ref({
    deptId: undefined,
    parentId: props.parentId,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: "0"
})

onMounted(() => {
    if (props.row) {
        listDeptExcludeChild(props.row.deptId).then(res => {
            deptOptions.value = arrToTree(res.data.data, "deptId", "parentId")
        })
        getDept(props.row.deptId).then(res => {
            Object.assign(postData.value, res.data.data)
        })
    } else {
        listDept().then(res => {
            deptOptions.value = arrToTree(res.data.data, "deptId", "parentId")
        })
    }
})

function submitForm() {
    formRef.value?.validate(valid => {
        if (valid) {
            loading.value = true
            const fn = postData.value.deptId ? updateDept : addDept
            fn(postData.value).then(res => {
                if (res.data.code === 200) {
                    ElMessage.success(res.data.msg)
                    emits('success')
                } else {
                    ElMessage.error(res.data.msg)
                }
            }).finally(() => {
                loading.value = false
            })
        }
    })
}
</script>