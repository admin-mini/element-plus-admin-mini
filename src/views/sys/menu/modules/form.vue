<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" label-width="100px">
      <admin-space cols="2">
        <el-form-item label="菜单类型">
          <el-radio-group v-model="postData.type" :disabled="postData.id">
            <el-radio value="dir">目录</el-radio>
            <el-radio value="menu">菜单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上级菜单">
          <el-tree-select v-model="postData.parentId" :data="menuOptions"
            :props="{ value: 'id', label: 'title', children: 'children' }" value-key="id"
            placeholder="选择上级菜单" check-strictly></el-tree-select>
        </el-form-item>
        <el-form-item label="菜单标题" prop="title" :rules="[$rules.required]">
          <el-input v-model="postData.title" placeholder="请输入菜单标题" />
        </el-form-item>
        <el-form-item label="菜单图标">
          <el-popover placement="bottom" :width="540" trigger="click">
            <template #reference>
              <el-input v-model="postData.icon" placeholder="点击选择图标" clearable>
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
        
        <el-form-item label="路由名称" prop="name" :rules="[$rules.required]">
          <el-input v-model="postData.name" placeholder="请输入路由名称" />
        </el-form-item>
        
        <el-form-item label="访问路径" prop="path" :rules="[$rules.required]" >
          <template #label>
            <span>
              <el-tooltip content="访问的路由地址，如：`user`，会根据`路由名称`格式自动生成" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              路由地址
            </span>
          </template>
          <el-input v-model="postData.path" readonly placeholder="请输入路由地址" />
        </el-form-item>

        <el-form-item prop="layout" v-if="showLayout" :span="2">
          <template #label>
            <span>
              <el-tooltip content="一级目录必须选择" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
              布局方式
            </span>
          </template>
          <el-select
              v-model="postData.layout"
              placeholder="请选择或搜索组件路径"
              style="width: 100%"
            >
              <el-option
                v-for="item in layoutOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
        </el-form-item>
        
        <el-form-item prop="component" v-if="showPage" :span="2">
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
          <el-select
              v-model="postData.component"
              placeholder="请选择或搜索组件路径"
              filterable
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in componentOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <div style="display: flex; justify-content: space-between; align-items: center">
                  <span>{{ item.label }}</span>
                  
                  <el-tag 
                    v-if="item.value.startsWith('layout.')" 
                    size="small" 
                    type="primary"
                  >
                    Layout
                  </el-tag>
                  <el-tag 
                    v-else 
                    size="small" 
                    type="success"
                  >
                    View
                  </el-tag>
                </div>
              </el-option>
            </el-select>
        </el-form-item>

        <el-form-item label="显示排序" prop="sortCode" :rules="[$rules.required]">
          <el-input-number v-model="postData.sortCode" controls-position="right" :min="0" />
        </el-form-item>

        <el-form-item v-if="showPage">
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
          <el-radio-group v-model="postData.keepAlive">
            <el-radio :value="1">缓存</el-radio>
            <el-radio :value="0">不缓存</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <template #label>
            <span>
              <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
              是否隐藏
            </span>
          </template>
           <el-radio-group v-model="postData.hideInMenu">
            <el-radio :value="1">隐藏</el-radio>
            <el-radio :value="0">不隐藏</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="菜单状态">
           <el-radio-group v-model="postData.enable">
            <el-radio :value="1">可用</el-radio>
            <el-radio :value="0">不可用</el-radio>
          </el-radio-group>
        </el-form-item>

        
  <el-form-item v-if="showPage" label="权限按钮" :span="2" prop="buttons">
    <el-button 
      v-if="postData.buttons.length === 0" 
      type="primary" 
      plain 
      class="w-full border-dashed"
      @click="addButton(-1)"
    >
      <i class="i-carbon-add mr-1"></i>添加
    </el-button>

    <template v-else>
      <div v-for="(item, index) in postData.buttons" :key="index" class="flex gap-3 mb-4">
        <el-row :gutter="10" class="w-full">
          <el-col :span="9">
            <el-form-item :prop="'buttons.' + index + '.code'" :rules="{ required: true, message: '请输入权限标识', trigger: 'blur' }">
              <el-input v-model="item.code" placeholder="权限Code,如sys:user:edit" />
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item :prop="'buttons.' + index + '.title'">
              <el-input v-model="item.title" placeholder="描述，如用户编辑" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-button-group>
              <el-button @click="addButton(index)" icon="Plus">
              </el-button>
              <el-button @click="removeButton(index)" icon="Delete">
                <i class="i-ic-round-remove"></i>
              </el-button>
            </el-button-group>
          </el-col>
        </el-row>
      </div>
    </template>
  </el-form-item>

  <el-form-item   v-if="showPage" label="请求参数" :span="2" prop="query">
    <el-button 
      v-if="postData.query.length === 0" 
      type="primary" 
      plain 
      class="w-full border-dashed"
      @click="addQuery(-1)"
    >
      <i class="i-carbon-add mr-1"></i>添加
    </el-button>

    <template v-else>
      <div v-for="(item, index) in postData.query" :key="index" class="flex gap-3 mb-4">
        <el-row :gutter="10" class="w-full">
          <el-col :span="9">
            <el-form-item :prop="'query.' + index + '.key'">
              <el-input v-model="item.key" :placeholder="参数key" />
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item :prop="'query.' + index + '.value'">
              <el-input v-model="item.value" :placeholder="参数值" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-button-group>
              <el-button @click="addQuery(index)" icon="Plus">
                
              </el-button>
              <el-button @click="removeQuery(index)" icon="Delete">
              </el-button>
            </el-button-group>
          </el-col>
        </el-row>
      </div>
    </template>
  </el-form-item>


      </admin-space>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="loading">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as menuApi from '@/api/sys/menu-api'
import { getDict } from '@/utils/dict'

import {
  getLayoutAndPage,
  getPathParamFromRoutePath,
  getRoutePathByRouteName,
  getRoutePathWithParam,
  transformLayoutAndPageToComponent,
  getAllComponentOptions
} from './form';


getDict(['sys_show_hide', 'sys_normal_disable'])

const props = defineProps({
  row: Object,
  parentId: [String, Number]
})
const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const formRef = ref()
const menuOptions = ref([])

//布局组件
const layoutOptions=[
  {
    label: 'base',
    value: 'base'
  },
  {
    label: 'blank',
    value: 'blank'
  }
];


const postData = ref({
  id: undefined,
  parentId: props.parentId || "0",
  title: undefined,
  name:undefined,
  icon: undefined,
  type: 'menu',
  sortCode: 0,
  href: '',
  hideInMenu: 0,
  enable: 1,
  keepAlive:0,//是否缓存
  path:'',
  code: "",
  component: undefined,
  path: undefined,
  layout:'', //仅做组件路径逻辑使用，最终会合并到component
  query:[],
  buttons:[],
})


//是否显示页面相关项
const showPage = computed(() => postData.value.type === 'menu');
const showLayout = computed(() => postData.value.parentId === "0");
const componentOptions = getAllComponentOptions();
/** 查询菜单下拉树结构 */
function getTreeselect() {
  menuApi.getTreeSelector().then(resp=>{
    console.log("resp",resp);
    const options = [{title:'顶级菜单',id:"0"},...(resp.data || [])]
    menuOptions.value=options;
  }).catch(ex=>{
    console.log("错误",ex);
  })
}

/** 提交按钮 */
function submitForm() {
  formRef.value?.validate((valid) => {
    if (valid) {
        loading.value = true
        //得到组件路径关系
        const { layout,  ...params } = postData.value;
        const componentNew = transformLayoutAndPageToComponent(layout, params.component);
        const routePath = getRoutePathWithParam(postData.value.path, "");
        params.component = componentNew;
        params.path = routePath;
        const fn = params.id ? menuApi.editMenu : menuApi.addMenu
        let icon = params.icon || ''
        fn({ ...params, icon })
          .then((res) => {
            ElMessage.success(res.msg)
            emits('success')
          })
          .finally(() => {
            loading.value = false
          })
    }
  })
}

function handleUpdateRoutePathByRouteName() {
  if (postData.value.name) {
    postData.value.path = getRoutePathByRouteName(postData.value.name);
  } else {
    postData.value.path = '';
  }
}
//监听名称输入变化
watch(
  () => postData.value.name,
  () => {
    handleUpdateRoutePathByRouteName();
  }
);


/** - 添加参数 */
function addQuery(index) {
  postData.value.query.splice(index + 1, 0, {
    key: '',
    value: ''
  });
}

/** - 移除参数 */
function removeQuery(index) {
  postData.value.query.splice(index, 1);
}

/** -添加按钮权限 */
function addButton(index) {
  postData.value.buttons.splice(index + 1, 0, {
    code: postData.value.name?postData.value.name.replaceAll("_",":")+':':'',
    title: ''
  });
}

/** - 移除按钮输入框 */
function removeButton(index) {
  postData.value.buttons.splice(index, 1);
}

const initData = async(id)=>{
  menuApi.getMenu(id).then((res) => {
      const data= res.data;
      const { component, ...rest } = data;

      const { layout, page } = getLayoutAndPage(component);
      const { path, param } = getPathParamFromRoutePath(rest.path);
       Object.assign(postData.value, rest, { layout, component:page, path: path});
    }).finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  getTreeselect()
  if (props.row) {
    initData(props.row.id);
  }
})
</script>