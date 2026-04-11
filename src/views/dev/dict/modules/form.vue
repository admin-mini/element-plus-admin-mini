<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" label-width="100px">
      <admin-space cols="1">
        <el-form-item label="上级字典">
            <el-select :options="dictTreeOptions" :props="dictSelectProps"  v-model="postData.parentId" :disabled="postData.id">
            </el-select>
        </el-form-item>
        <el-form-item label="字典名称" prop="dictLabel" :rules="[$rules.required]">
          <el-input v-model="postData.dictLabel" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典值" prop="dictValue" :rules="[$rules.required]">
          <el-input v-model="postData.dictValue" placeholder="请输入字典值" />
        </el-form-item>
        
        <el-form-item label="显示排序" prop="sortCode" :rules="[$rules.required]">
          <el-input-number v-model="postData.sortCode" controls-position="right" :min="0" />
        </el-form-item> 
        <el-form-item label="子值类型" prop="valueType" v-if="postData.parentId=='0'" :rules="[$rules.required]">
          <el-select v-model="postData.valueType">
            <el-option label="字符串" value="s" key></el-option>
            <el-option label="数字" value="n"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="颜色" prop="color" v-if="postData.parentId!='0'" :rules="[$rules.required]">
          
            <div class="color-select">
                <el-color-picker v-model="postData.color"  v-if="postData.color"/>
                <div class="btn" v-if="postData.color" @click="postData.color=''">取消定色</div>
                <div class="btn" v-else @click="postData.color='#000000'">指定颜色</div>
            </div>

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
import * as dictApi from '@/api/dev/dict-api'



const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const formRef = ref()

const dictTreeOptions = ref([]); //选择值
const dictSelectProps = {
  value: 'id',
  label: 'dictLabel',
}

/**
 * 开放给父组件调用的属性
 * */
const props = defineProps({
  record: Object,
  parentId: [String, Number]
})


const postData = ref({
  id: undefined,
  parentId: props.parentId || "0",
  dictLabel: undefined,
  dictValue:undefined,
  valueType: 's',
  color:"",
  sortCode: 0,
})


/** 提交按钮 */
function submitForm() {
  formRef.value?.validate((valid) => {
    if (valid) {
        loading.value = true
        //得到组件路径关系
        const { ...params } = postData.value;
        const fn = params.id ? dictApi.dcitEdit : dictApi.dcitAdd
        fn(params)
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

const initData = async(id)=>{
    console.log("id",id);
  dictApi.getDictDetail(id).then((res) => {
       Object.assign(postData.value, res.data);
    }).finally(() => {
      loading.value = false
    })
}

const getDictTree=()=>{
    dictApi.getDictTree().then(resp=>{
        dictTreeOptions.value=[{dictLabel:'顶级字典',id:'0'},...(resp.data || [])]
    })
}

onMounted(() => {
    getDictTree();
  if (props.record) {
    initData(props.record.id);
  }
})
</script>

<style lang="scss" scoped>
.color-select{display: flex;
	.btn{
		color:#333333; width:80px; text-align: center; cursor: pointer;
		background:#d8d8d8;
		&:hover{
			background:#e8e8e8;
		}
	}
}
</style>