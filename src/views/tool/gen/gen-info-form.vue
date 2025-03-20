<template>
  <el-form ref="genInfoRef" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="生成模板">
          <el-select v-model="info.tplCategory">
            <el-option label="单表（增删改查）" value="crud" />
            <el-option label="树表（增删改查）" value="tree" />
            <el-option label="主子表（增删改查）" value="sub" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="前端类型" prop="tplWebType">
          <el-select v-model="info.tplWebType">
            <el-option label="Vue2 Element UI 模版" value="element-ui" />
            <el-option label="Vue3 Element Plus 模版" value="element-plus" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="生成包路径" prop="packageName">
          <el-input v-model="info.packageName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="生成模块名" prop="moduleName">
          <el-input v-model="info.moduleName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="生成业务名" prop="businessName">
          <el-input v-model="info.businessName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="生成功能名" prop="functionName">
          <el-input v-model="info.functionName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="上级菜单">
          <el-tree-select check-strictly :props="{ value: 'id', label: 'label', children: 'children' }"
            v-model="info.parentMenuId" :data="menuOptions" placeholder="请选择系统菜单" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="生成代码方式">
          <el-radio-group v-model="info.genType">
            <el-radio label="0">zip压缩包</el-radio>
            <el-radio label="1">自定义路径</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>

      <el-col :span="24" v-if="info.genType == '1'">
        <el-form-item label="自定义路径" prop="genPath">
          <el-input v-model="info.genPath">
            <template #append>
              <el-dropdown>
                <el-button type="primary">
                  最近路径快速选择
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="info.genPath = '/'">
                      恢复默认的生成基础路径
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row v-show="info.tplCategory == 'tree'">
      <h4 class="form-header">其他信息</h4>
      <el-col :span="12">
        <el-form-item label="树编码字段" prop="treeCode">
          <el-select v-model="info.treeCode">
            <el-option v-for="column in columns" :key="column.columnName"
              :label="column.columnName + '：' + column.columnComment" :value="column.columnName"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="树父编码字段" prop="treeParentCode">
          <el-select v-model="info.treeParentCode">
            <el-option v-for="column in columns" :key="column.columnName"
              :label="column.columnName + '：' + column.columnComment" :value="column.columnName"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="树名称字段" prop="treeName">
          <el-select v-model="info.treeName">
            <el-option v-for="column in columns" :key="column.columnName"
              :label="column.columnName + '：' + column.columnComment" :value="column.columnName"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { treeselect } from '@/api/system/menu'

const props = defineProps({
  info: {
    type: Object,
    default: () => ({})
  }
})

const genInfoRef = ref(null)
const menuOptions = ref([])
const columns = computed(() => props.info.columns)

const rules = ref({
  tplCategory: [{ required: true, message: '请选择生成模板', trigger: 'blur' }],
  packageName: [{ required: true, message: '请输入生成包路径', trigger: 'blur' }],
  moduleName: [{ required: true, message: '请输入生成模块名', trigger: 'blur' }],
  businessName: [{ required: true, message: '请输入生成业务名', trigger: 'blur' }],
  functionName: [{ required: true, message: '请输入生成功能名', trigger: 'blur' }]
})

/** 查询菜单下拉树结构 */
function getMenuTreeselect() {
  treeselect().then((response) => {
    menuOptions.value = response.data
  })
}

onMounted(() => {
  getMenuTreeselect()
})

defineExpose({
  genInfoRef
})
</script>

<style lang="scss" scoped>
.form-header {
  font-size: 15px;
  color: #6379bb;
  border-bottom: 1px solid #ddd;
  margin: 8px 10px 25px 10px;
}
</style>
