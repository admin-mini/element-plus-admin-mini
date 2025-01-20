<template>
    <admin-dialog>
        <el-form ref="formRef" :model="postData" label-width="auto">
            <admin-space cols="1">
                <el-form-item label="字典类型" prop="dictType">
                    <el-input v-model="postData.dictType" :disabled="true" />
                </el-form-item>
                <el-form-item label="数据标签" prop="dictLabel" :rules="[$rules.required]">
                    <el-input v-model="postData.dictLabel" placeholder="请输入数据标签" />
                </el-form-item>
                <el-form-item label="数据键值" prop="dictValue" :rules="[$rules.required]">
                    <el-input v-model="postData.dictValue" placeholder="请输入数据键值" />
                </el-form-item>
                <el-form-item label="样式属性" prop="cssClass">
                    <el-input v-model="postData.cssClass" placeholder="请输入样式属性" />
                </el-form-item>
                <el-form-item label="显示排序" prop="dictSort" :rules="[$rules.required]">
                    <el-input-number v-model="postData.dictSort" :min="0" />
                </el-form-item>
                <el-form-item label="回显样式" prop="listClass">
                    <el-select v-model="postData.listClass">
                        <el-option v-for="item in listClassOptions" :key="item.value"
                            :label="item.label + '(' + item.value + ')'" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="postData.status">
                        <el-radio v-for="dict in $dict.sys_normal_disable" :key="dict.value" :label="dict.value">
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
import { getData, addData, updateData } from '@/api/system/dict/data'
import { getDict } from '@/utils/dict'

getDict(['sys_normal_disable'])

const props = defineProps({
    row: Object,
    dictId: [String, Number],
    dictType: String
})
const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const formRef = ref()

const postData = ref({
    dictCode: undefined,
    dictSort: 0,
    dictLabel: undefined,
    dictValue: undefined,
    dictType: props.dictType,
    status: "0",
    remark: undefined
})

if (props.row) {
    getData(props.row.dictCode).then(res => {
        Object.assign(postData.value, res.data.data)
    })
}

function submitForm() {
    formRef.value?.validate(valid => {
        if (valid) {
            loading.value = true
            const fn = postData.value.dictCode ? updateData : addData
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