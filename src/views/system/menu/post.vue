<template>
    <admin-dialog>
        <el-form ref="formRef" :model="postData" label-width="100px">
            <admin-space cols="2">
                <el-form-item label="上级菜单" span="2">
                    <el-tree-select v-model="postData.parentId" :data="menuOptions"
                        :props="{ value: 'menuId', label: 'menuName', children: 'children' }" value-key="menuId"
                        placeholder="选择上级菜单" check-strictly></el-tree-select>
                </el-form-item>
                <el-form-item label="菜单类型" span="2">
                    <el-radio-group v-model="postData.menuType">
                        <el-radio value="M">目录</el-radio>
                        <el-radio value="C">菜单</el-radio>
                        <el-radio value="F">按钮</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="菜单图标" v-if="postData.menuType != 'F'" span="2">
                    <el-popover placement="bottom" :width="540" trigger="click">
                        <template #reference>
                            <el-input v-model="postData.icon" placeholder="点击选择图标" readonly>
                                <template #prefix>
                                    <svg-icon v-if="postData.icon" :name="postData.icon" />
                                    <el-icon v-else>
                                        <Search />
                                    </el-icon>
                                </template>
                            </el-input>
                        </template>
                        <icon-select v-model="postData.icon" />
                    </el-popover>
                </el-form-item>
                <el-form-item label="菜单名称" prop="menuName" :rules="[$rules.required]">
                    <el-input v-model="postData.menuName" placeholder="请输入菜单名称" />
                </el-form-item>
                <el-form-item label="显示排序" prop="orderNum" :rules="[$rules.required]">
                    <el-input-number v-model="postData.orderNum" controls-position="right" :min="0" />
                </el-form-item>
                <el-form-item v-if="postData.menuType != 'F'">
                    <template #label>
                        <span>
                            <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                                <el-icon><question-filled /></el-icon>
                            </el-tooltip>
                            是否外链
                        </span>
                    </template>
                    <el-radio-group v-model="postData.isFrame">
                        <el-radio value="0">是</el-radio>
                        <el-radio value="1">否</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item prop="path" :rules="[$rules.required]" v-if="postData.menuType != 'F'">
                    <template #label>
                        <span>
                            <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                                <el-icon><question-filled /></el-icon>
                            </el-tooltip>
                            路由地址
                        </span>
                    </template>
                    <el-input v-model="postData.path" placeholder="请输入路由地址" />
                </el-form-item>


                <el-form-item prop="component" v-if="postData.menuType == 'C'">
                    <template #label>
                        <span>
                            <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                                <el-icon>
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                            组件路径
                        </span>
                    </template>
                    <el-input v-model="postData.component" placeholder="请输入组件路径" />
                </el-form-item v-if="postData.menuType != 'M'">
                <el-form-item v-if="postData.menuType != 'M'">
                    <el-input v-model="postData.perms" placeholder="请输入权限标识" maxlength="100" />
                    <template #label>
                        <span>
                            <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)"
                                placement="top">
                                <el-icon><question-filled /></el-icon>
                            </el-tooltip>
                            权限字符
                        </span>
                    </template>
                </el-form-item>

                <el-form-item v-if="postData.menuType == 'C'">
                    <el-input v-model="postData.query" placeholder="请输入路由参数" maxlength="255" />
                    <template #label>
                        <span>
                            <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">
                                <el-icon><question-filled /></el-icon>
                            </el-tooltip>
                            路由参数
                        </span>
                    </template>
                </el-form-item>

                <el-form-item v-if="postData.menuType == 'C'">
                    <template #label>
                        <span>
                            <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                                <el-icon>
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                            是否缓存
                        </span>
                    </template>
                    <el-radio-group v-model="postData.isCache">
                        <el-radio value="0">缓存</el-radio>
                        <el-radio value="1">不缓存</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item v-if="postData.menuType != 'F'">
                    <template #label>
                        <span>
                            <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问">
                                <el-icon>
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                            显示状态
                        </span>
                    </template>
                    <el-radio-group v-model="postData.visible">
                        <el-radio v-for="dict in $dict.sys_show_hide" :key="dict.value" :value="dict.value">
                            {{ dict.label }}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>


                <el-form-item label="菜单状态">
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
import { getMenu, addMenu, updateMenu, listMenu } from '@/api/system/menu'
import { getDict } from '@/utils/dict'
import IconSelect from '@/components/IconSelect/index.vue'
import { arrToTree } from '@/utils/utils'

getDict(['sys_show_hide', 'sys_normal_disable'])

const props = defineProps({
    row: Object,
    parentId: [String, Number]
})
const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const formRef = ref()
const menuOptions = ref([])

const postData = ref({
    menuId: undefined,
    parentId: props.parentId || 0,
    menuName: undefined,
    icon: undefined,
    menuType: "M",
    orderNum: 0,
    isFrame: "1",
    isCache: "0",
    visible: "0",
    status: "0",
    perms: undefined,
    component: undefined,
    path: undefined
})

/** 查询菜单下拉树结构 */
function getTreeselect() {
    listMenu().then(res => {
        if (res.data.code === 200) {
            menuOptions.value = [{
                menuId: 0,
                menuName: '主类目',
                children: arrToTree(res.data.data, 'menuId', 'parentId')
            }]
        }
    })

}

/** 提交按钮 */
function submitForm() {
    formRef.value?.validate(valid => {
        if (valid) {
            loading.value = true
            const fn = postData.value.menuId ? updateMenu : addMenu
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

onMounted(() => {
    getTreeselect()
    if (props.row) {
        getMenu(props.row.menuId).then(res => {
            Object.assign(postData.value, res.data.data)
        })
    }
})
</script>