<template>
  <el-form ref="userRef" :model="form" :rules="rules" label-width="90px">
    <el-form-item label="姓名" prop="name">
      <el-input v-model="form.name" maxlength="30" placeholder="请输入姓名" />
    </el-form-item>
    <el-form-item label="昵称" prop="nickname">
      <el-input v-model="form.nickname" maxlength="30" placeholder="请输入昵称" />
    </el-form-item>
    <el-form-item label="手机号码" prop="phone">
      <el-input v-model="form.phone" maxlength="11" placeholder="请输入手机号码" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" maxlength="50" placeholder="请输入邮箱" />
    </el-form-item>
    <el-form-item label="性别" prop="gender">
      <select-dict :dict="$dict.sys_gender" v-model="form.gender" />
    </el-form-item>
    <el-form-item label="出生日期" prop="birthday">
      <el-date-picker
        v-model="form.birthday"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="请选择出生日期"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="loading" @click="submit">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { updateUserInfo } from '@/api/sys/user-center-api'
import { getDict } from '@/utils/dict'
import { useSystemStore } from '@/stores'
import message from '@/utils/message'

const props = defineProps({
  user: {
    type: Object
  }
})

const systemStore = useSystemStore()
const userRef = useTemplateRef('userRef')
const loading = ref(false)

const form = ref({})
const rules = ref({
  name: [{ required: true, message: "姓名不能为空", trigger: "blur" }],
  email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
  phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }]
})

/** 回显当前登录用户信息 */
watch(() => props.user, user => {
  if (user) {
    form.value = {
      name: user.name || '',
      nickname: user.nickname || '',
      phone: user.phone || '',
      gender: user.gender !== undefined && user.gender !== null ? String(user.gender) : '',
      birthday: user.birthday || '',
      email: user.email || ''
    }
  }
}, { immediate: true })

/** 提交按钮 */
function submit() {
  userRef.value.validate(valid => {
    if (!valid) return
    const payload = { ...form.value, id: props.user?.id }
    // 后端 gender 声明为 String，字典值若是数字类型则统一转字符串
    if (payload.gender !== '' && payload.gender !== null && payload.gender !== undefined) {
      payload.gender = String(payload.gender)
    }
    loading.value = true
    updateUserInfo(payload)
      .then(() => {
        message.success("修改成功")
        // 同步姓名到全局用户信息，供顶部头像/昵称展示
        if (props.user && form.value.name) {
          systemStore.state.user.name = form.value.name
        }
      })
      .finally(() => {
        loading.value = false
      })
  })
}

getDict(['sys_gender'])
</script>
