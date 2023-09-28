<template>
    <div>
        <el-form>
            <el-form-item label="账号" prop="username">
                <el-input v-model="postData.username"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm(postForm)">确定</el-button>
                <el-button @click="emits('end')">取消</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
const emits = defineEmits(['end', 'success'])
const props = defineProps(["row"]);
const postData = reactive({
    username: '',
})
if (props.row) {
    Object.assign(postData, props.row)
}
function submitForm() {
    emits("success", postData)
}
</script>

<style lang="scss" scoped></style>