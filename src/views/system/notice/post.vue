<template>
    <admin-dialog>
        <el-form ref="formRef" :model="postData" label-width="100px">
            <admin-space cols="1">
                <el-form-item label="公告标题" prop="noticeTitle" :rules="[$rules.required]">
                    <el-input v-model="postData.noticeTitle" placeholder="请输入公告标题" />
                </el-form-item>
                <el-form-item label="公告类型" prop="noticeType" :rules="[$rules.required]">
                    <el-select v-model="postData.noticeType" placeholder="请选择">
                        <el-option v-for="dict in $dict.sys_notice_type" :key="dict.value" :label="dict.label"
                            :value="dict.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="postData.status">
                        <el-radio v-for="dict in $dict.sys_normal_disable" :key="dict.value" :value="dict.value">
                            {{ dict.label }}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="内容" prop="noticeContent" :rules="[$rules.required]">
                    <editor v-model="postData.noticeContent" :min-height="192" />
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getNotice, addNotice, updateNotice } from '@/api/system/notice'
import { getDict } from '@/utils/dict'

getDict(['sys_notice_type', 'sys_normal_disable'])

const props = defineProps({
    row: Object
})
const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const formRef = ref()

const postData = ref({
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: undefined,
    status: "0"
})

if (props.row) {
    getNotice(props.row.noticeId).then(res => {
        Object.assign(postData.value, res.data.data)
    })
}

function submitForm() {
    formRef.value?.validate(valid => {
        if (valid) {
            loading.value = true
            const fn = postData.value.noticeId ? updateNotice : addNotice
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