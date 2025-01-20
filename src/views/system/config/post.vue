<template>
    <admin-dialog>
        <el-form ref="formRef" :model="postData" label-width="100px">
            <admin-space cols="1">
                <el-form-item label="参数名称" prop="configName" :rules="[$rules.required]">
                    <el-input v-model="postData.configName" placeholder="请输入参数名称" />
                </el-form-item>
                <el-form-item label="参数键名" prop="configKey" :rules="[$rules.required]">
                    <el-input v-model="postData.configKey" placeholder="请输入参数键名" />
                </el-form-item>
                <el-form-item label="参数键值" prop="configValue" :rules="[$rules.required]">
                    <el-input v-model="postData.configValue" placeholder="请输入参数键值" />
                </el-form-item>
                <el-form-item label="系统内置">
                    <el-radio-group v-model="postData.configType">
                        <el-radio v-for="dict in $dict.sys_yes_no" :key="dict.value" :label="dict.value">
                            {{ dict.label }}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="postData.remark" type="textarea" placeholder="请输入内容"></el-input>
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
import { getConfig, addConfig, updateConfig } from '@/api/system/config'
import { getDict } from '@/utils/dict'

getDict(['sys_yes_no'])

const props = defineProps({
    row: Object
})
const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const formRef = ref()

const postData = ref({
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: "Y",
    remark: undefined
})

if (props.row) {
    getConfig(props.row.configId).then(res => {
        Object.assign(postData.value, res.data.data)
    })
}

function submitForm() {
    formRef.value?.validate(valid => {
        if (valid) {
            loading.value = true
            const fn = postData.value.configId ? updateConfig : addConfig
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